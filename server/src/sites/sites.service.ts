import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { isValidAddress, normalizeAddress } from '../common/address';
import { prepareSiteContent } from '../common/site-content';
import { User, type UserDocument } from '../users/user.schema';
import { CreateSiteDto } from './dto/create-site.dto';
import { Site } from './site.schema';

type SearchDocument = {
  address: string;
  title: string;
  text: string;
  score: number;
};

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

function makeSnippet(text: string, query: string): string {
  const terms = query.split(/\s+/).filter(Boolean);
  const lowerText = text.toLowerCase();
  const matchIndex = terms
    .map((term) => lowerText.indexOf(term.toLowerCase()))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  if (matchIndex === undefined || text.length <= 160) return text;
  const start = Math.max(0, matchIndex - 65);
  const end = Math.min(text.length, start + 157);
  const snippet = text.slice(start, end).trim();
  return `${start > 0 ? '…' : ''}${snippet}${end < text.length ? '…' : ''}`;
}

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly sites: Model<Site>,
    @InjectModel(User.name) private readonly users: Model<User>,
  ) {}

  async get(addressInput: string) {
    const address = normalizeAddress(addressInput);
    if (!isValidAddress(address)) {
      throw new NotFoundException('Site not found.');
    }

    const site = await this.sites
      .findOne({ address })
      .populate<{ authorId: UserDocument }>('authorId', 'name')
      .exec();
    if (!site) throw new NotFoundException('Site not found.');

    return {
      address: site.address,
      title: site.title,
      body: site.body,
      author: {
        id: site.authorId._id.toString(),
        name: site.authorId.name,
      },
      updatedAt: site.updatedAt.toISOString(),
    };
  }

  async create(input: CreateSiteDto) {
    const author = await this.users.findById(input.authorId).exec();
    if (!author) throw new BadRequestException('authorId must be an existing user.');

    const content = prepareSiteContent(input.body);
    try {
      const site = await this.sites.create({
        address: normalizeAddress(input.address),
        title: input.title,
        body: content.body,
        text: content.text,
        authorId: author._id,
      });
      return {
        address: site.address,
        title: site.title,
        body: site.body,
        author: { id: author._id.toString(), name: author.name },
        updatedAt: site.updatedAt.toISOString(),
      };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        // Published addresses are immutable; the unique index arbitrates competing publishes.
        throw new ConflictException('That address is already taken.');
      }
      throw error;
    }
  }

  async search(queryInput: string) {
    const query = queryInput.trim();
    if (query.length < 2) return [];

    const matches = await this.sites
      .find(
        { $text: { $search: query } },
        {
          address: 1,
          title: 1,
          text: 1,
          score: { $meta: 'textScore' },
        },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean<SearchDocument[]>()
      .exec();

    return matches.map(({ address, title, text }) => ({
      address,
      title,
      snippet: makeSnippet(text, query),
    }));
  }
}

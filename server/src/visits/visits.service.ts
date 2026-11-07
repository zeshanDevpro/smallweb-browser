import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import { normalizeAddress } from '../common/address';
import { User } from '../users/user.schema';
import { Site } from '../sites/site.schema';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './visit.schema';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private readonly visits: Model<Visit>,
    @InjectModel(Site.name) private readonly sites: Model<Site>,
    @InjectModel(User.name) private readonly users: Model<User>,
  ) {}

  async list(userId: string) {
    const user = await this.findUser(userId);

    const visits = await this.visits
      .find({ userId: user._id })
      .sort({ at: -1 })
      .limit(200)
      .lean()
      .exec();
    const addresses = [...new Set(visits.map((visit) => visit.address))];
    const sites = await this.sites
      .find({ address: { $in: addresses } })
      .select({ address: 1, title: 1 })
      .lean()
      .exec();
    const titles = new Map(sites.map((site) => [site.address, site.title]));

    return visits.map((visit) => ({
      id: visit._id.toString(),
      address: visit.address,
      title: titles.get(visit.address) ?? null,
      at: visit.at.toISOString(),
      via: visit.via,
      found: visit.found,
    }));
  }

  async create(userId: string, input: CreateVisitDto) {
    const user = await this.findUser(userId);

    const address = normalizeAddress(input.address);
    try {
      const site = await this.sites
        .findOne({ address })
        .select({ address: 1, title: 1 })
        .exec();
      const visit = await this.visits.create({
        userId: user._id,
        address,
        via: input.via,
        found: site !== null,
        at: new Date(),
      });
      return {
        id: visit._id.toString(),
        address: visit.address,
        title: site?.title ?? null,
        at: visit.at.toISOString(),
        via: visit.via,
        found: visit.found,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private async findUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('User not found.');
    }
    const user = await this.users.findById(userId).select('_id').exec();
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }
}

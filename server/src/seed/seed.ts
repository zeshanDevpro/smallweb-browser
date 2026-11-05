import { getModelToken } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import type { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { prepareSiteContent } from '../common/site-content';
import { Site } from '../sites/site.schema';
import { User } from '../users/user.schema';
import { Visit } from '../visits/visit.schema';
import { seedSites, renderSiteBody } from './data/sites';
import { createSeedVisits } from './data/visits';
import { seedUsers } from './data/users';

const DEFAULT_ANCHOR = '2026-11-04T12:00:00.000Z';

async function seed(): Promise<void> {
  const anchorValue = process.env.SEED_ANCHOR ?? DEFAULT_ANCHOR;
  const anchor = new Date(anchorValue);
  if (!Number.isFinite(anchor.getTime())) {
    throw new Error('SEED_ANCHOR must be a valid date.');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  try {
    const users = app.get<Model<User>>(getModelToken(User.name));
    const sites = app.get<Model<Site>>(getModelToken(Site.name));
    const visits = app.get<Model<Visit>>(getModelToken(Visit.name));
    const idsBySlug = new Map<string, string>();

    for (const user of seedUsers) {
      const result = await users
        .findOneAndUpdate(
          { slug: user.slug },
          { $set: { name: user.name }, $setOnInsert: { slug: user.slug } },
          { upsert: true, returnDocument: 'after' },
        )
        .exec();
      if (!result) throw new Error(`Could not seed user ${user.slug}.`);
      idsBySlug.set(user.slug, result._id.toString());
    }

    for (const site of seedSites) {
      const authorId = idsBySlug.get(site.authorSlug);
      if (!authorId) throw new Error(`Unknown seed author: ${site.authorSlug}`);
      const content = prepareSiteContent(renderSiteBody(site));
      await sites.updateOne(
        { address: site.address },
        {
          $setOnInsert: {
            address: site.address,
            title: site.title,
            body: content.body,
            text: content.text,
            authorId,
            createdAt: anchor,
            updatedAt: anchor,
          },
        },
        { upsert: true, timestamps: false },
      );
    }

    const seedVisits = createSeedVisits(seedSites, anchor);
    for (const visit of seedVisits) {
      const userId = idsBySlug.get(visit.userSlug);
      if (!userId) throw new Error(`Unknown seed visitor: ${visit.userSlug}`);
      await visits.updateOne(
        { seedKey: visit.seedKey },
        {
          $setOnInsert: {
            seedKey: visit.seedKey,
            userId,
            address: visit.address,
            via: visit.via,
            found: visit.found,
            at: visit.at,
          },
        },
        { upsert: true, timestamps: false },
      );
    }

    const [userCount, siteCount, visitCount] = await Promise.all([
      users.countDocuments(),
      sites.countDocuments(),
      visits.countDocuments(),
    ]);
    console.log(
      `Seed complete: users=${userCount}, sites=${siteCount}, visits=${visitCount}, anchor=${anchor.toISOString()}`,
    );
  } finally {
    await app.close();
  }
}

void seed().catch((error: unknown) => {
  console.error('Seed failed.', error);
  process.exitCode = 1;
});

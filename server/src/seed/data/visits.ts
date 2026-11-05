import type { SiteSeed } from '../seed.types';
import type { Via } from '../../common/via';

export type SeedVisit = {
  userSlug: string;
  address: string;
  via: Via;
  found: boolean;
  at: Date;
  seedKey: string;
};

function mulberry32(seed: number): () => number {
  return function nextRandom(): number {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeedVisits(
  sites: SiteSeed[],
  anchor: Date,
): SeedVisit[] {
  const random = mulberry32(0x5eed2026);
  const sitesByAddress = new Map(sites.map((site) => [site.address, site]));
  const visits: SeedVisit[] = [];
  const seenCounts = new Map<string, number>();

  function record(userSlug: string, address: string, via: Via): void {
    const count = seenCounts.get(userSlug) ?? 0;
    seenCounts.set(userSlug, count + 1);
    visits.push({
      userSlug,
      address,
      via,
      found: sitesByAddress.has(address),
      at: anchor,
      seedKey: `${userSlug}:${count.toString().padStart(3, '0')}`,
    });
  }

  function walk(
    userSlug: string,
    start: SiteSeed,
    stepCount: number,
    randomized = true,
  ): SiteSeed[] {
    const trail = [start];
    record(userSlug, start.address, 'typed');
    let current = start;

    for (let step = 1; step < stepCount; step += 1) {
      const links = current.links.filter((link) =>
        sitesByAddress.has(link.address),
      );
      const nextAddress = links[
        randomized ? Math.floor(random() * links.length) : 0
      ]?.address;
      const next = nextAddress ? sitesByAddress.get(nextAddress) : undefined;
      if (!next) throw new Error(`Seed link missing from graph: ${current.address}`);
      trail.push(next);
      record(userSlug, next.address, 'link');
      current = next;
    }
    return trail;
  }

  function followBrokenLink(userSlug: string, sourceAddress: string): void {
    const source = sitesByAddress.get(sourceAddress);
    const brokenLink = source?.links.find(
      (link) => !sitesByAddress.has(link.address),
    );
    if (!source || !brokenLink) {
      throw new Error(`Seed site has no broken link: ${sourceAddress}`);
    }
    record(userSlug, source.address, 'typed');
    record(userSlug, brokenLink.address, 'link');
  }

  const byAddress = new Map(sites.map((site) => [site.address, site]));
  const adaTrail = walk('ada', byAddress.get('tidepool.zz')!, 12);
  record('ada', adaTrail[adaTrail.length - 2].address, 'back');
  record('ada', 'saffron-table.zz', 'history');
  record('ada', 'quiet-checkmate.zz', 'search');
  followBrokenLink('ada', 'tidepool.zz');

  const bilalStarts = ['bread-window.zz', 'bicycle-bell.zz', 'saffron-table.zz'];
  for (const [index, address] of bilalStarts.entries()) {
    walk(
      'bilal',
      byAddress.get(address)!,
      index === 1 ? 5 : 4,
    );
    if (index === 0) record('bilal', 'bread-window.zz', 'back');
  }
  followBrokenLink('bilal', 'saffron-table.zz');

  const chenTrail = walk(
    'chen',
    byAddress.get('tidepool.zz')!,
    12,
    false,
  );
  record('chen', chenTrail[4].address, 'history');
  record('chen', 'tidepool.zz', 'search');
  followBrokenLink('chen', 'night-sky-notes.zz');

  const daliaTrail = walk('dalia', byAddress.get('saffron-table.zz')!, 5);
  record('dalia', daliaTrail[daliaTrail.length - 2].address, 'back');
  followBrokenLink('dalia', 'green-courtyard.zz');
  walk('eli', byAddress.get('paper-lanterns.zz')!, 5);
  walk('eli', byAddress.get('blue-hour-letter.zz')!, 3);
  followBrokenLink('eli', 'paper-lanterns.zz');
  const hour = 60 * 60_000;
  return visits.map((visit, index) => ({
    ...visit,
    at: new Date(
      anchor.getTime() - hour + Math.floor(((index + 1) * hour) / (visits.length + 1)),
    ),
  }));
}

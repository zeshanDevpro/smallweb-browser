import { seedSites } from './sites';
import { createSeedVisits } from './visits';

describe('createSeedVisits', () => {
  const anchor = new Date('2026-11-04T12:00:00.000Z');

  it('is deterministic and spreads visits through the hour before its anchor', () => {
    const first = createSeedVisits(seedSites, anchor);
    const second = createSeedVisits(seedSites, anchor);

    expect(first).toEqual(second);
    expect(first[0].at.getTime()).toBeGreaterThan(anchor.getTime() - 60 * 60_000);
    expect(first.at(-1)?.at.getTime()).toBeLessThan(anchor.getTime());
    expect(first.at(-1)?.at.getTime()).toBeGreaterThan(first[0].at.getTime());
  });

  it('follows real links, includes missing addresses, and keeps Farah history empty', () => {
    const visits = createSeedVisits(seedSites, anchor);
    const addressesByUser = new Map<string, Set<string>>();

    for (const visit of visits) {
      const addresses = addressesByUser.get(visit.userSlug) ?? new Set<string>();
      addresses.add(visit.address);
      addressesByUser.set(visit.userSlug, addresses);

      if (visit.via !== 'link') continue;
      const userVisits = visits.filter(
        (item) =>
          item.userSlug === visit.userSlug && item.at.getTime() < visit.at.getTime(),
      );
      const previous = userVisits.at(-1);
      const source = seedSites.find((site) => site.address === previous?.address);
      expect(source?.links.some((link) => link.address === visit.address)).toBe(
        true,
      );
    }

    expect(addressesByUser.get('chen')).toHaveProperty('size', 12);
    expect(addressesByUser.get('farah')).toBeUndefined();
    expect(visits.some((visit) => !visit.found)).toBe(true);
    expect(visits.some((visit) => visit.via === 'back')).toBe(true);
    expect(visits.some((visit) => visit.via === 'history')).toBe(true);
    expect(visits.some((visit) => visit.via === 'search')).toBe(true);
  });
});

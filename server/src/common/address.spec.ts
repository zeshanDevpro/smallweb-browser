import { isValidAddress, normalizeAddress } from './address';

describe('normalizeAddress', () => {
  it('trims whitespace and lowercases the address', () => {
    expect(normalizeAddress('  TIDEPOOL.ZZ  ')).toBe('tidepool.zz');
  });

  it.each(['zz://', 'http://', 'https://'])(
    'strips a leading %s prefix',
    (prefix) => {
      expect(normalizeAddress(`${prefix}Tidepool.zz `)).toBe('tidepool.zz');
    },
  );
});

describe('isValidAddress', () => {
  it.each(['tidepool.zz', 'a.zz', 'quiet-garden.zz'])(
    'accepts %s',
    (address) => {
      expect(isValidAddress(address)).toBe(true);
    },
  );

  it.each([
    '',
    '.zz',
    'two..dots.zz',
    'under_score.zz',
    'two--hyphens.zz',
    '-leading.zz',
    'trailing-.zz',
    `${'a'.repeat(64)}.zz`,
  ])('rejects %s', (address) => {
    expect(isValidAddress(address)).toBe(false);
  });

  it('validates after normalization', () => {
    expect(isValidAddress(' HTTPS://TIDEPOOL.ZZ ')).toBe(true);
  });
});

const ADDRESS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.zz$/;

export function normalizeAddress(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^(?:zz:\/\/|https?:\/\/)/, '');
}

export function normalizeAddressInput(value: unknown): unknown {
  return typeof value === 'string' ? normalizeAddress(value) : value;
}

export function isValidAddress(value: string): boolean {
  const address = normalizeAddress(value);
  const label = address.slice(0, -3);
  return label.length <= 63 && ADDRESS_PATTERN.test(address);
}

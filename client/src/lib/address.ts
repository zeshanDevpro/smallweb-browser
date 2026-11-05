export function normalizeAddress(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^(?:zz:\/\/|https?:\/\/)/, "");
}

export function isValidAddress(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.zz$/.test(
    normalizeAddress(value),
  );
}

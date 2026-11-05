export const visitViaValues = [
  'typed',
  'link',
  'back',
  'forward',
  'history',
  'search',
] as const;

export type Via = (typeof visitViaValues)[number];

export type UserSeed = { slug: string; name: string };

export type SiteSeed = {
  address: string;
  title: string;
  authorSlug: string;
  paragraphs: string[];
  links: { address: string; label: string }[];
};

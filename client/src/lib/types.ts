export type Via = "typed" | "link" | "back" | "forward" | "history" | "search";

export type User = { id: string; name: string };

export type Site = {
  address: string;
  title: string;
  body: string;
  author: User;
  updatedAt: string;
};

export type Visit = {
  id: string;
  address: string;
  title: string | null;
  at: string;
  via: Via;
  found: boolean;
};

export type SearchHit = { address: string; title: string; snippet: string };

export type Entry =
  | { kind: "page"; address: string; site: Site | null; scrollY: number }
  | { kind: "search"; query: string; hits: SearchHit[]; scrollY: number };

export type NavigationState = { entries: Entry[]; index: number };

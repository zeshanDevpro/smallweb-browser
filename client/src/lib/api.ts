import { mockApi } from "./mockApi";

import type { SearchHit, Site, User, Via, Visit } from "./types";

export type PublishInput = {
  address: string;
  title: string;
  body: string;
  authorId: string;
};

export type ApiErrorCode = "INVALID" | "TAKEN";

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface Api {
  listUsers(): Promise<User[]>;
  getSite(address: string): Promise<Site | null>;
  search(q: string): Promise<SearchHit[]>;
  publishSite(input: PublishInput): Promise<Site>;
  listVisits(userId: string): Promise<Visit[]>;
  recordVisit(
    userId: string,
    visit: { address: string; via: Via; found: boolean },
  ): Promise<Visit>;
}

// Swap this implementation for the real adapter when the server is ready.
export const api: Api = mockApi;

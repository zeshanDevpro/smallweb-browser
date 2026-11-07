import { isValidAddress, normalizeAddress } from "../helper";
import { MOCK_API_DELAY_MS, MOCK_SEARCH_SNIPPET_LENGTH, MOCK_SITES, MOCK_USERS } from "../constants";
import { ApiError } from "../types";
import type { Api, PublishInput, Site, Via, Visit } from "../types";

const sites = new Map(MOCK_SITES.map((site) => [site.address, site]));
const users = MOCK_USERS;

const visits = new Map<string, Visit[]>();

function delay(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, MOCK_API_DELAY_MS),
  );
}

function sanitizeBody(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
}

function makeSnippet(body: string): string {
  return body
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MOCK_SEARCH_SNIPPET_LENGTH);
}

export const mockApi: Api = {
  async listUsers() {
    await delay();
    return users.map((user) => ({ ...user }));
  },
  async getSite(address) {
    await delay();
    const site = sites.get(normalizeAddress(address));
    return site ? { ...site, author: { ...site.author } } : null;
  },
  async search(q) {
    await delay();
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return [...sites.values()]
      .filter(
        (site) =>
          site.title.toLowerCase().includes(query) ||
          site.address.includes(query) ||
          makeSnippet(site.body).toLowerCase().includes(query),
      )
      .map((site) => ({
        address: site.address,
        title: site.title,
        snippet: makeSnippet(site.body),
      }));
  },
  async publishSite(input: PublishInput) {
    await delay();
    const address = normalizeAddress(input.address);
    if (!isValidAddress(address) || !input.title.trim() || !input.body.trim()) {
      throw new ApiError("INVALID", "Enter a valid address, title, and HTML body.");
    }
    if (sites.has(address)) {
      throw new ApiError("TAKEN", "That address is already taken.");
    }
    const author = users.find((user) => user.id === input.authorId);
    if (!author) throw new ApiError("INVALID", "Choose a valid author.");
    const site: Site = {
      address,
      title: input.title.trim(),
      body: sanitizeBody(input.body),
      author: { ...author },
      updatedAt: new Date().toISOString(),
    };
    sites.set(address, site);
    return { ...site, author: { ...site.author } };
  },
  async listVisits(userId) {
    await delay();
    return [...(visits.get(userId) ?? [])]
      .sort((a, b) => b.at.localeCompare(a.at))
      .map((visit) => ({ ...visit }));
  },
  async recordVisit(
    userId: string,
    input: { address: string; via: Via },
  ) {
    await delay();
    const address = normalizeAddress(input.address);
    const visit: Visit = {
      id: crypto.randomUUID(),
      address,
      title: sites.get(address)?.title ?? null,
      at: new Date().toISOString(),
      via: input.via,
      found: sites.has(address),
    };
    visits.set(userId, [visit, ...(visits.get(userId) ?? [])]);
    return { ...visit };
  },
}

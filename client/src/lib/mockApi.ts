import { ApiError, type Api, type PublishInput } from "./api";
import { isValidAddress, normalizeAddress } from "./address";
import type { SearchHit, Site, User, Via, Visit } from "./types";

const users: User[] = [
  { id: "ada", name: "Ada Lovelace" },
  { id: "lin", name: "Lin Chen" },
  { id: "sam", name: "Sam Rivera" },
];

const sites = new Map<string, Site>([
  [
    "tidepool.zz",
    {
      address: "tidepool.zz",
      title: "Tidepool — a little corner of the web",
      author: users[0],
      updatedAt: "2026-10-28T10:00:00.000Z",
      body: `<main style="max-width:760px;margin:10vh auto;padding:32px;font-family:Georgia,serif;color:#193e42">
  <p style="font:600 12px Arial;letter-spacing:.18em;text-transform:uppercase;color:#38817b">A smallweb field note</p>
  <h1 style="font-size:clamp(42px,8vw,76px);line-height:.98;margin:18px 0">A tidepool of<br>tiny discoveries.</h1>
  <p style="font:18px/1.7 Arial;max-width:560px">The internet can feel like an ocean. This is a reminder to look closely at one small, bright patch of it.</p>
  <p><a href="fern.zz">Follow the fern trail →</a> &nbsp; <a href="missing.zz">A link to nowhere →</a></p>
  <section style="margin-top:72px;padding:24px;background:#dff1e9;border-radius:20px">
    <h2>Containment demo</h2><p>The alert, click handler, and embedded frame below are untrusted content.</p>
    <button onclick="alert('This should not run')">Try the blocked click handler</button>
    <iframe src="https://example.com" title="Blocked embedded frame"></iframe>
  </section>
  <script>document.body.innerHTML = "This script should be blocked";</script>
</main>`,
    },
  ],
  [
    "fern.zz",
    {
      address: "fern.zz",
      title: "Fern Notes",
      author: users[1],
      updatedAt: "2026-10-29T11:30:00.000Z",
      body: `<main style="max-width:700px;margin:12vh auto;padding:32px;font:18px/1.7 Arial;color:#29452e">
  <p style="color:#709269">FIELD GUIDE · 04</p><h1 style="font:56px Georgia">Fern Notes</h1>
  <p>Ferns are patient architects. Their unfurling fronds keep a small record of the rain.</p>
  <p>See also <a href="tidepool.zz">the tidepool</a> and <a href="paper.zz">paper garden</a>.</p>
</main>`,
    },
  ],
  [
    "paper.zz",
    {
      address: "paper.zz",
      title: "Paper Garden",
      author: users[2],
      updatedAt: "2026-10-30T08:15:00.000Z",
      body: `<main style="max-width:680px;margin:12vh auto;padding:32px;font:18px/1.8 Georgia;color:#524437">
  <p>ISSUE NO. 08</p><h1 style="font-size:58px">Paper Garden</h1>
  <p>A collection of things worth noticing, gathered slowly and kept on paper.</p>
  <p><a href="tidepool.zz">Back to Tidepool</a></p>
</main>`,
    },
  ],
  [
    "nightjar.zz",
    {
      address: "nightjar.zz",
      title: "Nightjar Observatory",
      author: users[0],
      updatedAt: "2026-10-27T20:00:00.000Z",
      body: `<main style="max-width:720px;margin:12vh auto;padding:32px;font-family:Arial;color:#29294a;background:#f1effb">
  <p>AFTER DARK</p><h1 style="font:60px Georgia">Nightjar Observatory</h1>
  <p>Keep a window open for the quiet things that only appear after sunset.</p>
  <a href="tidepool.zz">Visit Tidepool</a>
</main>`,
    },
  ],
  [
    "goodthings.zz",
    {
      address: "goodthings.zz",
      title: "Small Good Things",
      author: users[1],
      updatedAt: "2026-10-26T14:00:00.000Z",
      body: `<main style="max-width:720px;margin:12vh auto;padding:32px;font:20px/1.8 Georgia;color:#594233">
  <h1>Small Good Things</h1><p>Warm bread. A message from an old friend. The first light after rain.</p>
  <a href="fern.zz">Read Fern Notes</a>
</main>`,
    },
  ],
  [
    "bluehour.zz",
    {
      address: "bluehour.zz",
      title: "Blue Hour Letters",
      author: users[2],
      updatedAt: "2026-10-25T18:45:00.000Z",
      body: `<main style="max-width:720px;margin:12vh auto;padding:32px;font:19px/1.8 Georgia;color:#243750">
  <h1>Blue Hour Letters</h1><p>Notes written in the brief, soft light between day and night.</p>
  <a href="nightjar.zz">Open the observatory</a>
</main>`,
    },
  ],
]);

const visits = new Map<string, Visit[]>();

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

function sanitizeBody(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
}

function makeSnippet(body: string): string {
  return body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 130);
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
    input: { address: string; via: Via; found: boolean },
  ) {
    await delay();
    const address = normalizeAddress(input.address);
    const visit: Visit = {
      id: crypto.randomUUID(),
      address,
      title: sites.get(address)?.title ?? null,
      at: new Date().toISOString(),
      via: input.via,
      found: input.found,
    };
    visits.set(userId, [visit, ...(visits.get(userId) ?? [])]);
    return { ...visit };
  },
};

export type { SearchHit, Site, User, Visit };

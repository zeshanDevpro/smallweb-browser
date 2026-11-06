import type { NavigationState, Site, User } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK === "true";
export const BROWSER_USER_STORAGE_KEY = "smallweb-user";
export const MOCK_API_DELAY_MS = 150;
export const MOCK_SEARCH_SNIPPET_LENGTH = 130;
export const SUGGESTED_SITES = ["tidepool.zz", "fern.zz", "nightjar.zz"];
export const VIA_VALUES = [
  "typed",
  "link",
  "back",
  "forward",
  "history",
  "search",
] as const;
export const SERVER_API_ERROR_CODES = ["INVALID", "TAKEN", "NOT_FOUND"] as const;
export const NETWORK_ERROR_MESSAGE =
  "Unable to connect to the smallweb API. Check that the server is running.";

export const INITIAL_NAVIGATION_STATE: NavigationState = {
  entries: [{ kind: "home", scrollY: 0 }],
  index: 0,
};

export const MOCK_USERS: User[] = [
  { id: "ada", name: "Ada Lovelace" },
  { id: "lin", name: "Lin Chen" },
  { id: "sam", name: "Sam Rivera" },
];

export const MOCK_SITES: Site[] = [
  {
    address: "tidepool.zz",
    title: "Tidepool — a little corner of the web",
    author: MOCK_USERS[0],
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
  {
    address: "fern.zz",
    title: "Fern Notes",
    author: MOCK_USERS[1],
    updatedAt: "2026-10-29T11:30:00.000Z",
    body: `<main style="max-width:700px;margin:12vh auto;padding:32px;font:18px/1.7 Arial;color:#29452e">
  <p style="color:#709269">FIELD GUIDE · 04</p><h1 style="font:56px Georgia">Fern Notes</h1>
  <p>Ferns are patient architects. Their unfurling fronds keep a small record of the rain.</p>
  <p>See also <a href="tidepool.zz">the tidepool</a> and <a href="paper.zz">paper garden</a>.</p>
</main>`,
  },
  {
    address: "paper.zz",
    title: "Paper Garden",
    author: MOCK_USERS[2],
    updatedAt: "2026-10-30T08:15:00.000Z",
    body: `<main style="max-width:680px;margin:12vh auto;padding:32px;font:18px/1.8 Georgia;color:#524437">
  <p>ISSUE NO. 08</p><h1 style="font-size:58px">Paper Garden</h1>
  <p>A collection of things worth noticing, gathered slowly and kept on paper.</p>
  <p><a href="tidepool.zz">Back to Tidepool</a></p>
</main>`,
  },
  {
    address: "nightjar.zz",
    title: "Nightjar Observatory",
    author: MOCK_USERS[0],
    updatedAt: "2026-10-27T20:00:00.000Z",
    body: `<main style="max-width:720px;margin:12vh auto;padding:32px;font-family:Arial;color:#29294a;background:#f1effb">
  <p>AFTER DARK</p><h1 style="font:60px Georgia">Nightjar Observatory</h1>
  <p>Keep a window open for the quiet things that only appear after sunset.</p>
  <a href="tidepool.zz">Visit Tidepool</a>
</main>`,
  },
  {
    address: "goodthings.zz",
    title: "Small Good Things",
    author: MOCK_USERS[1],
    updatedAt: "2026-10-26T14:00:00.000Z",
    body: `<main style="max-width:720px;margin:12vh auto;padding:32px;font:20px/1.8 Georgia;color:#594233">
  <h1>Small Good Things</h1><p>Warm bread. A message from an old friend. The first light after rain.</p>
  <a href="fern.zz">Read Fern Notes</a>
</main>`,
  },
  {
    address: "bluehour.zz",
    title: "Blue Hour Letters",
    author: MOCK_USERS[2],
    updatedAt: "2026-10-25T18:45:00.000Z",
    body: `<main style="max-width:720px;margin:12vh auto;padding:32px;font:19px/1.8 Georgia;color:#243750">
  <h1>Blue Hour Letters</h1><p>Notes written in the brief, soft light between day and night.</p>
  <a href="nightjar.zz">Open the observatory</a>
</main>`,
  },
];

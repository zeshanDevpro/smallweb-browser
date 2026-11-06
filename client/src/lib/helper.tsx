import { INITIAL_NAVIGATION_STATE } from "./constants";
import type { Entry, FrameMessage, NavigationState, ResolvedInput } from "./types";

export const initialNavigationState = INITIAL_NAVIGATION_STATE;

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

export function resolveInput(raw: string): ResolvedInput {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "empty" };

  const address = normalizeAddress(trimmed);
  if (isValidAddress(address)) return { kind: "address", address };
  return { kind: "search", query: trimmed };
}

export function canGoBack(state: NavigationState): boolean {
  return state.index > 0;
}

export function canGoForward(state: NavigationState): boolean {
  return state.index < state.entries.length - 1;
}

export function current(state: NavigationState): Entry {
  return state.entries[state.index] ?? { kind: "home", scrollY: 0 };
}

export function navigateState(
  state: NavigationState,
  entry: Entry,
): NavigationState {
  return {
    entries: [...state.entries.slice(0, state.index + 1), entry],
    index: state.index + 1,
  };
}

export function backState(state: NavigationState): NavigationState {
  return canGoBack(state) ? { ...state, index: state.index - 1 } : state;
}

export function forwardState(state: NavigationState): NavigationState {
  return canGoForward(state) ? { ...state, index: state.index + 1 } : state;
}

export function saveScrollState(
  state: NavigationState,
  y: number,
): NavigationState {
  return {
    ...state,
    entries: state.entries.map((entry, index) =>
      index === state.index ? { ...entry, scrollY: y } : entry,
    ),
  };
}

export function entryInput(entry: Entry): string {
  if (entry.kind === "page") return entry.address;
  if (entry.kind === "search") return entry.query;
  return "";
}

export function getEntryTitle(entry: Entry): string | null {
  return entry.kind === "page" ? entry.site?.title ?? null : null;
}

export function relativeTime(value: string): string {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function isFrameMessage(value: unknown): value is FrameMessage {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }
  if (value.type === "navigate") {
    return "address" in value && typeof value.address === "string";
  }
  return (
    value.type === "scroll" &&
    "y" in value &&
    typeof value.y === "number" &&
    Number.isFinite(value.y)
  );
}

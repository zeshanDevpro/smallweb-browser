import { describe, expect, it } from "vitest";
import {
  backState,
  canGoBack,
  canGoForward,
  current,
  forwardState,
  initialNavigationState,
  navigateState,
  saveScrollState,
} from "../src/lib/helper";
import type { Entry, NavigationState } from "../src/lib/types";

function page(address: string): Entry {
  return { kind: "page", address, site: null, scrollY: 0 };
}

function visit(...entries: Entry[]): NavigationState {
  return entries.reduce(navigateState, initialNavigationState);
}

describe("navigation helpers", () => {
  it("starts with one home entry and cannot go back", () => {
    expect(initialNavigationState).toEqual({
      entries: [{ kind: "home", scrollY: 0 }],
      index: 0,
    });
    expect(current(initialNavigationState)).toMatchObject({ kind: "home" });
    expect(canGoBack(initialNavigationState)).toBe(false);
  });

  it("navigates twice, then goes back and forward", () => {
    let state = visit(page("one.zz"), page("two.zz"));
    state = backState(state);
    expect(current(state)).toMatchObject({ kind: "page", address: "one.zz" });
    state = forwardState(state);
    expect(current(state)).toMatchObject({ kind: "page", address: "two.zz" });
  });

  it("returns home from a page or search and can move forward", () => {
    for (const entry of [
      page("one.zz"),
      { kind: "search", query: "tide", hits: [], scrollY: 0 } satisfies Entry,
    ]) {
      const state = backState(visit(entry));
      expect(current(state)).toMatchObject({ kind: "home" });
      expect(canGoForward(state)).toBe(true);
    }
  });

  it("does not move back or forward beyond the stack", () => {
    expect(backState(initialNavigationState)).toBe(initialNavigationState);
    expect(canGoForward(initialNavigationState)).toBe(false);
  });

  it("discards forward history when navigating after returning home", () => {
    let state = visit(page("one.zz"), page("two.zz"));
    state = backState(backState(state));
    state = navigateState(state, page("three.zz"));
    expect(state.entries.map((entry) =>
      entry.kind === "home" ? "home" : entry.kind === "page" ? entry.address : "search",
    )).toEqual(["home", "three.zz"]);
    expect(canGoForward(state)).toBe(false);
  });

  it("saves scroll only on the current entry", () => {
    let state = saveScrollState(initialNavigationState, 120);
    state = navigateState(state, page("one.zz"));
    state = saveScrollState(state, 240);
    expect(state.entries.map((entry) => entry.scrollY)).toEqual([120, 240]);
    state = backState(state);
    expect(current(state)).toMatchObject({ kind: "home", scrollY: 120 });
  });

  it("restores a search entry from the middle of the stack", () => {
    let state = visit(
      page("one.zz"),
      { kind: "search", query: "fern", hits: [], scrollY: 0 },
      page("fern.zz"),
    );
    state = backState(state);
    expect(current(state)).toMatchObject({ kind: "search", query: "fern" });
  });

  it("creates a separate entry for repeated visits to the same address", () => {
    const state = visit(page("one.zz"), page("one.zz"));
    expect(state.entries).toHaveLength(3);
    expect(state.index).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import {
  canGoBack,
  canGoForward,
  current,
  initialNavigationState,
  navigationReducer,
} from "./navigation";
import type { Entry } from "./types";

function page(address: string): Entry {
  return { kind: "page", address, site: null, scrollY: 0 };
}

describe("navigationReducer", () => {
  it("navigates twice, then goes back and forward", () => {
    let state = navigationReducer(initialNavigationState, {
      type: "NAVIGATE",
      entry: page("one.zz"),
    });
    state = navigationReducer(state, {
      type: "NAVIGATE",
      entry: page("two.zz"),
    });
    state = navigationReducer(state, { type: "BACK" });
    const backEntry = current(state);
    expect(backEntry?.kind === "page" ? backEntry.address : null).toBe("one.zz");
    state = navigationReducer(state, { type: "FORWARD" });
    const forwardEntry = current(state);
    expect(forwardEntry?.kind === "page" ? forwardEntry.address : null).toBe(
      "two.zz",
    );
  });

  it("does nothing when going back at the start", () => {
    const state = navigationReducer(initialNavigationState, { type: "BACK" });
    expect(state).toBe(initialNavigationState);
  });

  it("discards the forward branch after navigating from a prior entry", () => {
    let state = navigationReducer(initialNavigationState, {
      type: "NAVIGATE",
      entry: page("one.zz"),
    });
    state = navigationReducer(state, {
      type: "NAVIGATE",
      entry: page("two.zz"),
    });
    state = navigationReducer(state, { type: "BACK" });
    state = navigationReducer(state, {
      type: "NAVIGATE",
      entry: page("three.zz"),
    });
    expect(state.entries.map((entry) => entry.kind === "page" && entry.address))
      .toEqual(["one.zz", "three.zz"]);
    expect(canGoForward(state)).toBe(false);
  });

  it("saves scroll on only the current entry", () => {
    let state = navigationReducer(initialNavigationState, {
      type: "NAVIGATE",
      entry: page("one.zz"),
    });
    state = navigationReducer(state, {
      type: "NAVIGATE",
      entry: page("two.zz"),
    });
    state = navigationReducer(state, { type: "SAVE_SCROLL", y: 240 });
    expect(state.entries.map((entry) => entry.scrollY)).toEqual([0, 240]);
    state = navigationReducer(state, { type: "BACK" });
    expect(current(state)?.scrollY).toBe(0);
    expect(canGoBack(state)).toBe(false);
  });

  it("keeps a search entry in the middle of the stack", () => {
    let state = navigationReducer(initialNavigationState, {
      type: "NAVIGATE",
      entry: page("one.zz"),
    });
    state = navigationReducer(state, {
      type: "NAVIGATE",
      entry: { kind: "search", query: "fern", hits: [], scrollY: 0 },
    });
    state = navigationReducer(state, {
      type: "NAVIGATE",
      entry: page("fern.zz"),
    });
    state = navigationReducer(state, { type: "BACK" });
    expect(current(state)).toMatchObject({
      kind: "search",
      query: "fern",
      hits: [],
    });
  });

  it("creates a separate entry for repeated visits to the same address", () => {
    let state = navigationReducer(initialNavigationState, {
      type: "NAVIGATE",
      entry: page("one.zz"),
    });
    state = navigationReducer(state, {
      type: "NAVIGATE",
      entry: page("one.zz"),
    });
    expect(state.entries).toHaveLength(2);
    expect(state.index).toBe(1);
  });
});

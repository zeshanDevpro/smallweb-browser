import type { Entry, NavigationState } from "./types";

export type NavigationAction =
  | { type: "NAVIGATE"; entry: Entry }
  | { type: "BACK" }
  | { type: "FORWARD" }
  | { type: "SAVE_SCROLL"; y: number };

export const initialNavigationState: NavigationState = {
  entries: [],
  index: -1,
};

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case "NAVIGATE":
      // A new visit replaces only the forward branch, just like a browser.
      return {
        entries: [...state.entries.slice(0, state.index + 1), action.entry],
        index: state.index + 1,
      };
    case "BACK":
      return state.index > 0 ? { ...state, index: state.index - 1 } : state;
    case "FORWARD":
      return state.index < state.entries.length - 1
        ? { ...state, index: state.index + 1 }
        : state;
    case "SAVE_SCROLL":
      if (state.index < 0 || !state.entries[state.index]) return state;
      return {
        ...state,
        entries: state.entries.map((entry, index) =>
          index === state.index ? { ...entry, scrollY: action.y } : entry,
        ),
      };
  }
}

export function canGoBack(state: NavigationState): boolean {
  return state.index > 0;
}

export function canGoForward(state: NavigationState): boolean {
  return state.index >= 0 && state.index < state.entries.length - 1;
}

export function current(state: NavigationState): Entry | null {
  return state.entries[state.index] ?? null;
}

import { create } from "zustand";
import { api } from "./api";
import {
  backState,
  initialNavigationState,
  navigateState,
  forwardState,
  saveScrollState,
} from "./helper";
import {
  BROWSER_USER_STORAGE_KEY,
  NETWORK_ERROR_MESSAGE,
} from "./constants";
import { ApiError } from "./types";
import type { BrowserState, Entry, PublishInput, User, Via } from "./types";

let navigationRequestId = 0;
let historyRequestId = 0;
let usersRequestId = 0;

export const useBrowserStore = create<BrowserState>((set, get) => ({
  users: [],
  user: null,
  usersLoading: true,
  usersError: "",
  navigation: initialNavigationState,
  loading: null,
  visits: [],
  historyLoading: true,
  historyError: "",
  historyOpen: false,
  publishOpen: false,
  error: "",

  async loadUsers() {
    const requestId = ++usersRequestId;
    set({ usersLoading: true, usersError: "" });
    try {
      const users = await api.listUsers();
      if (requestId !== usersRequestId) return;
      const storedId = window.localStorage.getItem(BROWSER_USER_STORAGE_KEY);
      const user = users.find((item) => item.id === storedId) ?? users[0] ?? null;
      set({ users, user, usersLoading: false });
      if (user) await get().reloadHistory();
    } catch (error) {
      if (requestId !== usersRequestId) return;
      console.error("Could not load users.", error);
      set({
        users: [],
        user: null,
        usersLoading: false,
        usersError:
          error instanceof ApiError
            ? error.message
            : NETWORK_ERROR_MESSAGE,
      });
    }
  },

  selectUser(user: User) {
    window.localStorage.setItem(BROWSER_USER_STORAGE_KEY, user.id);
    navigationRequestId += 1;
    historyRequestId += 1;
    set({
      user,
      navigation: initialNavigationState,
      loading: null,
      visits: [],
      historyLoading: true,
      historyError: "",
      historyOpen: false,
      error: "",
    });
    void get().reloadHistory();
  },

  async navigateTo(address: string, via: Via) {
    const requestId = ++navigationRequestId;
    set({ loading: address, error: "" });
    try {
      const site = await api.getSite(address);
      if (requestId !== navigationRequestId) return;
      const target: Entry = {
        kind: "page",
        address,
        site,
        scrollY: 0,
      };
      set((state) => ({
        navigation: navigateState(state.navigation, target),
        error: "",
      }));
      void get().recordVisit(target, via);
    } catch (error) {
      if (requestId !== navigationRequestId) return;
      console.error(`Could not load ${address}.`, error);
      set({
        error:
          error instanceof ApiError
            ? error.message
            : `Could not load ${address}. Please try again.`,
      });
    } finally {
      if (requestId === navigationRequestId) set({ loading: null });
    }
  },

  async search(query: string) {
    const requestId = ++navigationRequestId;
    const normalizedQuery = query.trim();
    set({ loading: "search", error: "" });
    try {
      const hits = normalizedQuery ? await api.search(normalizedQuery) : [];
      if (requestId !== navigationRequestId) return;
      const entry: Entry = {
        kind: "search",
        query: normalizedQuery,
        hits,
        scrollY: 0,
      };
      set((state) => ({ navigation: navigateState(state.navigation, entry) }));
    } catch (error) {
      if (requestId !== navigationRequestId) return;
      console.error("Could not search smallweb.", error);
      set({
        error:
          error instanceof ApiError
            ? error.message
            : "Search could not be completed. Please try again.",
      });
    } finally {
      if (requestId === navigationRequestId) set({ loading: null });
    }
  },

  goBack() {
    const state = get();
    const target = state.navigation.entries[state.navigation.index - 1];
    if (!target) return;
    navigationRequestId += 1;
    set((currentState) => ({
      navigation: backState(currentState.navigation),
      loading: null,
    }));
    void get().recordVisit(target, "back");
  },

  goForward() {
    const state = get();
    const target = state.navigation.entries[state.navigation.index + 1];
    if (!target) return;
    navigationRequestId += 1;
    set((currentState) => ({
      navigation: forwardState(currentState.navigation),
      loading: null,
    }));
    void get().recordVisit(target, "forward");
  },

  saveScroll(y: number) {
    set((state) => ({
      navigation: saveScrollState(state.navigation, y),
    }));
  },

  async reloadHistory() {
    const requestId = ++historyRequestId;
    const userId = get().user?.id;
    if (!userId) {
      set({ visits: [], historyLoading: false, historyError: "" });
      return;
    }
    set({ historyLoading: true, historyError: "" });
    try {
      const visits = await api.listVisits(userId);
      if (requestId === historyRequestId && get().user?.id === userId) {
        set({ visits });
      }
    } catch (error) {
      if (requestId !== historyRequestId || get().user?.id !== userId) return;
      console.error("Could not load visit history.", error);
      set({
        historyError:
          error instanceof ApiError
            ? error.message
            : "Could not load visit history. Please try again.",
      });
    } finally {
      if (requestId === historyRequestId && get().user?.id === userId) {
        set({ historyLoading: false });
      }
    }
  },

  async recordVisit(target: Entry, via: Via) {
    if (target.kind !== "page") return;
    const userId = get().user?.id;
    if (!userId) return;
    try {
      await api.recordVisit(userId, {
        address: target.address,
        via,
      });
      if (get().user?.id === userId) await get().reloadHistory();
    } catch (error) {
      console.error("Could not record visit.", error);
      if (get().user?.id === userId) {
        set({
          error:
            error instanceof ApiError
              ? `This visit was not saved to history: ${error.message}`
              : "This visit was not saved to history.",
        });
      }
    }
  },

  async publish(input: PublishInput) {
    const requestId = ++navigationRequestId;
    set({ loading: null, error: "" });
    try {
      const site = await api.publishSite(input);
      if (requestId !== navigationRequestId) return;
      const target: Entry = {
        kind: "page",
        address: site.address,
        site,
        scrollY: 0,
      };
      set((state) => ({
        publishOpen: false,
        navigation: navigateState(state.navigation, target),
      }));
      void get().recordVisit(target, "typed");
    } catch (error) {
      if (requestId !== navigationRequestId) return;
      if (error instanceof ApiError) {
        set({ error: `${error.code}: ${error.message}` });
        return;
      }
      console.error("Could not publish page.", error);
      set({ error: "Could not publish this page. Please try again." });
    }
  },

  setHistoryOpen(open: boolean) {
    set({ historyOpen: open });
  },

  setPublishOpen(open: boolean) {
    set({ publishOpen: open, error: "" });
  },

  setError(error: string) {
    set({ error });
  },
}));

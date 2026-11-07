import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../src/lib/api";
import { useBrowserStore } from "../src/lib/browserStore";
import { initialNavigationState } from "../src/lib/helper";
import type { Site, User } from "../src/lib/types";

const user: User = { id: "user-1", name: "Test User" };
const site: Site = {
  address: "tidepool.zz",
  title: "Tidepool",
  body: "<p>Smallweb</p>",
  author: user,
  updatedAt: "2026-11-07T00:00:00.000Z",
};

describe("browser store", () => {
  beforeEach(() => {
    vi.spyOn(api, "getSite").mockResolvedValue(site);
    vi.spyOn(api, "recordVisit").mockResolvedValue({
      id: "visit-1",
      address: site.address,
      title: site.title,
      at: "2026-11-07T00:00:00.000Z",
      via: "typed",
      found: true,
    });
    vi.spyOn(api, "listVisits").mockResolvedValue([]);
    vi.stubGlobal("window", {
      localStorage: { getItem: vi.fn(() => null), setItem: vi.fn() },
    });
    useBrowserStore.setState({
      user,
      navigation: initialNavigationState,
      loading: null,
      visits: [],
      historyLoading: false,
      historyError: "",
      historyOpen: false,
      publishOpen: false,
      error: "",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not record home when navigating back or forward", async () => {
    await useBrowserStore.getState().navigateTo(site.address, "typed");
    const recordVisit = vi.mocked(api.recordVisit);
    expect(recordVisit).toHaveBeenCalledTimes(1);

    recordVisit.mockClear();
    useBrowserStore.getState().goBack();
    expect(useBrowserStore.getState().navigation.entries[1]?.kind).toBe("page");
    expect(useBrowserStore.getState().navigation.index).toBe(0);
    expect(recordVisit).not.toHaveBeenCalled();

    useBrowserStore.getState().goForward();
    expect(recordVisit).toHaveBeenCalledWith(user.id, {
      address: site.address,
      via: "forward",
    });
    expect(api.getSite).toHaveBeenCalledTimes(1);
  });

  it("resets navigation to home when switching users", () => {
    useBrowserStore.setState({
      navigation: {
        entries: [
          { kind: "home", scrollY: 0 },
          { kind: "page", address: site.address, site, scrollY: 0 },
        ],
        index: 1,
      },
    });
    const nextUser: User = { id: "user-2", name: "Another User" };

    useBrowserStore.getState().selectUser(nextUser);

    expect(useBrowserStore.getState().navigation).toEqual(initialNavigationState);
    expect(useBrowserStore.getState().user).toEqual(nextUser);
  });
});

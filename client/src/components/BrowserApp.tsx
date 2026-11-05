"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  canGoBack,
  canGoForward,
  current,
  initialNavigationState,
  navigationReducer,
} from "@/lib/navigation";
import type { Entry, Site, User, Visit, Via } from "@/lib/types";
import { useBrowserUser } from "./BrowserProvider";
import { HistoryPanel } from "./HistoryPanel";
import { NowherePage } from "./NowherePage";
import { PageViewer } from "./PageViewer";
import { PublishDialog, type PublishValues } from "./PublishDialog";
import { SearchResults } from "./SearchResults";
import { Toolbar } from "./Toolbar";
import { UserPicker } from "./UserPicker";

type SessionState = {
  loading: string | null;
  visits: Visit[];
  historyLoading: boolean;
  historyOpen: boolean;
  publishOpen: boolean;
  error: string;
};

type SessionAction =
  | { type: "LOADING"; address: string | null }
  | { type: "VISITS"; visits: Visit[] }
  | { type: "HISTORY_LOADING"; loading: boolean }
  | { type: "HISTORY_OPEN"; open: boolean }
  | { type: "PUBLISH_OPEN"; open: boolean }
  | { type: "ERROR"; error: string };

const initialSessionState: SessionState = {
  loading: null,
  visits: [],
  historyLoading: true,
  historyOpen: false,
  publishOpen: false,
  error: "",
};

function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: action.address };
    case "VISITS":
      return { ...state, visits: action.visits };
    case "HISTORY_LOADING":
      return { ...state, historyLoading: action.loading };
    case "HISTORY_OPEN":
      return { ...state, historyOpen: action.open };
    case "PUBLISH_OPEN":
      return { ...state, publishOpen: action.open, error: "" };
    case "ERROR":
      return { ...state, error: action.error };
  }
}

function entryAddress(entry: Entry | null): string {
  return entry?.kind === "page" ? entry.address : "";
}

function getEntryTitle(entry: Entry): string | null {
  return entry.kind === "page" ? entry.site?.title ?? null : null;
}

export function BrowserApp() {
  const { users, user, loading, selectUser } = useBrowserUser();

  if (loading) {
    return <main className="boot-screen">Opening your smallweb…</main>;
  }
  if (!user) {
    return (
      <main className="boot-screen" role="alert">
        No browsing profiles are available.
      </main>
    );
  }
  return (
    <BrowserSession
      key={user.id}
      user={user}
      users={users}
      onUserChange={selectUser}
    />
  );
}

function BrowserSession({
  user,
  users,
  onUserChange,
}: {
  user: User;
  users: User[];
  onUserChange: (user: User) => void;
}) {
  const [navigation, dispatchNavigation] = useReducer(
    navigationReducer,
    initialNavigationState,
  );
  const [session, dispatchSession] = useReducer(
    sessionReducer,
    initialSessionState,
  );
  const requestId = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const frameScrollTimeout = useRef<number | null>(null);
  const entry = current(navigation);
  const address = entryAddress(entry);
  const entryKey = `${navigation.index}:${entry?.kind ?? "empty"}:${address}`;
  const activeEntryKey = useRef(entryKey);

  useEffect(() => {
    activeEntryKey.current = entryKey;
  }, [entryKey]);

  const reloadHistory = useCallback(async () => {
    dispatchSession({ type: "HISTORY_LOADING", loading: true });
    try {
      const visits = await api.listVisits(user.id);
      dispatchSession({ type: "VISITS", visits });
    } catch (error) {
      console.error("Could not load visit history.", error);
      dispatchSession({ type: "ERROR", error: "Could not load visit history." });
    } finally {
      dispatchSession({ type: "HISTORY_LOADING", loading: false });
    }
  }, [user.id]);

  useEffect(() => {
    void reloadHistory();
  }, [reloadHistory]);

  const recordVisit = useCallback(
    (target: Entry, via: Via) => {
      if (target.kind !== "page") return;
      void api
        .recordVisit(user.id, {
          address: target.address,
          via,
          found: target.site !== null,
        })
        .then(() => reloadHistory())
        .catch((error: unknown) => {
          console.error("Could not record visit.", error);
          dispatchSession({
            type: "ERROR",
            error: "Could not save this visit to history.",
          });
        });
    },
    [reloadHistory, user.id],
  );

  const showSite = useCallback(
    (site: Site | null, targetAddress: string, via: Via) => {
      const target: Entry = {
        kind: "page",
        address: targetAddress,
        site,
        scrollY: 0,
      };
      dispatchNavigation({ type: "NAVIGATE", entry: target });
      recordVisit(target, via);
      dispatchSession({ type: "ERROR", error: "" });
    },
    [recordVisit],
  );

  const navigateTo = useCallback(
    async (targetAddress: string, via: Via) => {
      const request = ++requestId.current;
      dispatchSession({ type: "LOADING", address: targetAddress });
      dispatchSession({ type: "ERROR", error: "" });
      try {
        const site = await api.getSite(targetAddress);
        if (request !== requestId.current) return;
        showSite(site, targetAddress, via);
      } catch (error) {
        if (request !== requestId.current) return;
        console.error(`Could not load ${targetAddress}.`, error);
        dispatchSession({
          type: "ERROR",
          error: `Could not load ${targetAddress}. Please try again.`,
        });
      } finally {
        if (request === requestId.current) {
          dispatchSession({ type: "LOADING", address: null });
        }
      }
    },
    [showSite],
  );

  const search = useCallback(async (query: string) => {
    const request = ++requestId.current;
    dispatchSession({ type: "LOADING", address: "search" });
    dispatchSession({ type: "ERROR", error: "" });
    try {
      const hits = query.trim() ? await api.search(query) : [];
      if (request !== requestId.current) return;
      const searchEntry: Entry = {
        kind: "search",
        query: query.trim(),
        hits,
        scrollY: 0,
      };
      dispatchNavigation({ type: "NAVIGATE", entry: searchEntry });
    } catch (error) {
      if (request !== requestId.current) return;
      console.error("Could not search smallweb.", error);
      dispatchSession({ type: "ERROR", error: "Search could not be completed." });
    } finally {
      if (request === requestId.current) {
        dispatchSession({ type: "LOADING", address: null });
      }
    }
  }, []);

  const navigateFromHistory = useCallback(
    (targetAddress: string) => {
      dispatchSession({ type: "HISTORY_OPEN", open: false });
      void navigateTo(targetAddress, "history");
    },
    [navigateTo],
  );

  const goBack = useCallback(() => {
    const target = navigation.entries[navigation.index - 1];
    if (!target) return;
    requestId.current += 1;
    dispatchSession({ type: "LOADING", address: null });
    dispatchNavigation({ type: "BACK" });
    recordVisit(target, "back");
  }, [navigation, recordVisit]);

  const goForward = useCallback(() => {
    const target = navigation.entries[navigation.index + 1];
    if (!target) return;
    requestId.current += 1;
    dispatchSession({ type: "LOADING", address: null });
    dispatchNavigation({ type: "FORWARD" });
    recordVisit(target, "forward");
  }, [navigation, recordVisit]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.altKey) return;
      if (event.key === "ArrowLeft" && canGoBack(navigation)) {
        event.preventDefault();
        goBack();
      } else if (event.key === "ArrowRight" && canGoForward(navigation)) {
        event.preventDefault();
        goForward();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack, goForward, navigation]);

  useEffect(() => {
    if (entry?.kind === "search" && contentRef.current) {
      contentRef.current.scrollTop = entry.scrollY;
    }
  }, [entryKey, entry]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    function saveScroll() {
      if (frameScrollTimeout.current !== null) return;
      frameScrollTimeout.current = window.setTimeout(() => {
        frameScrollTimeout.current = null;
        if (
          entryKey === activeEntryKey.current &&
          entry?.kind === "search" &&
          element
        ) {
          dispatchNavigation({ type: "SAVE_SCROLL", y: element.scrollTop });
        }
      }, 100);
    }
    element.addEventListener("scroll", saveScroll, { passive: true });
    return () => {
      element.removeEventListener("scroll", saveScroll);
      if (frameScrollTimeout.current !== null) {
        window.clearTimeout(frameScrollTimeout.current);
        frameScrollTimeout.current = null;
      }
    };
  }, [entryKey, entry?.kind]);

  const saveFrameScroll = useCallback((y: number, sourceEntryKey: string) => {
    if (
      sourceEntryKey !== activeEntryKey.current ||
      frameScrollTimeout.current !== null
    ) {
      return;
    }
    frameScrollTimeout.current = window.setTimeout(() => {
      frameScrollTimeout.current = null;
      if (sourceEntryKey === activeEntryKey.current) {
        dispatchNavigation({ type: "SAVE_SCROLL", y });
      }
    }, 100);
  }, []);

  const publish = useCallback(
    async (values: PublishValues) => {
      requestId.current += 1;
      dispatchSession({ type: "LOADING", address: null });
      try {
        const site = await api.publishSite(values);
        dispatchSession({ type: "PUBLISH_OPEN", open: false });
        showSite(site, site.address, "typed");
      } catch (error) {
        if (error instanceof ApiError) {
          dispatchSession({
            type: "ERROR",
            error: `${error.code}: ${error.message}`,
          });
          return;
        }
        console.error("Could not publish page.", error);
        dispatchSession({
          type: "ERROR",
          error: "Could not publish this page. Please try again.",
        });
      }
    },
    [showSite],
  );

  const toolbarAddress = useMemo(() => address, [address]);
  return (
    <main className="browser-shell">
      <header className="browser-header">
        <div className="brand-row">
          <Link className="brand" href="/" aria-label="Smallweb home">
            <span className="brand-icon" aria-hidden="true">
              ◌
            </span>
            <span>smallweb</span>
          </Link>
          <span className="brand-caption">a browser for little places</span>
          <UserPicker users={users} user={user} onChange={onUserChange} />
        </div>
        <Toolbar
          address={toolbarAddress}
          addressKey={entryKey}
          canBack={canGoBack(navigation)}
          canForward={canGoForward(navigation)}
          onBack={goBack}
          onForward={goForward}
          onNavigate={(targetAddress) => void navigateTo(targetAddress, "typed")}
          onHistory={() => dispatchSession({ type: "HISTORY_OPEN", open: true })}
          onPublish={() => dispatchSession({ type: "PUBLISH_OPEN", open: true })}
          onSearch={(query) => void search(query)}
        />
      </header>

      <div className="browser-content-wrap">
        <div className="browser-content" ref={contentRef} tabIndex={-1}>
          {!entry ? (
            <section className="welcome-page">
              <div className="welcome-orbit" aria-hidden="true">
                <span>◌</span>
              </div>
              <p className="eyebrow">A SMALLER SIDE OF THE INTERNET</p>
              <h1>Find a little place<br />to call your own.</h1>
              <p className="welcome-copy">
                Visit a smallweb address or search for something unexpected.
              </p>
              <div className="suggested-sites">
                <span>Try a place</span>
                {["tidepool.zz", "fern.zz", "nightjar.zz"].map((site) => (
                  <button
                    type="button"
                    key={site}
                    onClick={() => void navigateTo(site, "typed")}
                  >
                    {site}
                  </button>
                ))}
              </div>
            </section>
          ) : entry.kind === "search" ? (
            <SearchResults
              query={entry.query}
              hits={entry.hits}
              onNavigate={(targetAddress) =>
                void navigateTo(targetAddress, "search")
              }
            />
          ) : entry.site ? (
            <PageViewer
              key={entryKey}
              site={entry.site}
              scrollY={entry.scrollY}
              onNavigate={(targetAddress) => void navigateTo(targetAddress, "link")}
              onScroll={(y) => saveFrameScroll(y, entryKey)}
            />
          ) : (
            <NowherePage address={entry.address} />
          )}
        </div>
        {session.loading && (
          <div className="loading-indicator" role="status">
            <span className="spinner" />
            {session.loading === "search"
              ? "Searching…"
              : `Finding ${session.loading}…`}
          </div>
        )}
      </div>

      <footer className="browser-footer">
        <span>
          {entry?.kind === "page" && entry.site
            ? `A small place by ${entry.site.author.name}`
            : "Made for wandering"}
        </span>
        <span>{entry?.kind === "page" ? getEntryTitle(entry) : "smallweb.zz"}</span>
      </footer>
      {session.error && (
        <div className="notice" role="alert">
          {session.error}
        </div>
      )}
      {session.historyOpen && (
        <HistoryPanel
          visits={session.visits}
          loading={session.historyLoading}
          onClose={() => dispatchSession({ type: "HISTORY_OPEN", open: false })}
          onNavigate={navigateFromHistory}
        />
      )}
      {session.publishOpen && (
        <PublishDialog
          users={users}
          currentUser={user}
          error={session.error}
          onClose={() => dispatchSession({ type: "PUBLISH_OPEN", open: false })}
          onPublish={publish}
        />
      )}
    </main>
  );
}

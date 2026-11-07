"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { FiGlobe } from "react-icons/fi";
import { useBrowserStore } from "@/lib/browserStore";
import { SUGGESTED_SITES } from "@/lib/constants";
import {
  canGoBack,
  canGoForward,
  current,
  entryInput,
  getEntryTitle,
} from "@/lib/helper";
import { HistoryPanel } from "./HistoryPanel";
import { NowherePage } from "./NowherePage";
import { PageViewer } from "./PageViewer";
import { PublishDialog } from "./PublishDialog";
import { SearchResults } from "./SearchResults";
import { Toolbar } from "./Toolbar";
import { UserPicker } from "./UserPicker";

export function BrowserApp() {
  const user = useBrowserStore((state) => state.user);
  const usersLoading = useBrowserStore((state) => state.usersLoading);
  const usersError = useBrowserStore((state) => state.usersError);
  const loadUsers = useBrowserStore((state) => state.loadUsers);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  if (usersLoading) {
    return <main className="boot-screen">Opening your smallweb…</main>;
  }
  if (!user) {
    return (
      <main className="boot-screen" role="alert">
        {usersError || "No browsing profiles are available."}
      </main>
    );
  }
  return <BrowserSession key={user.id} />;
}

function BrowserSession() {
  const user = useBrowserStore((state) => state.user);
  const users = useBrowserStore((state) => state.users);
  const navigation = useBrowserStore((state) => state.navigation);
  const loading = useBrowserStore((state) => state.loading);
  const visits = useBrowserStore((state) => state.visits);
  const historyLoading = useBrowserStore((state) => state.historyLoading);
  const historyError = useBrowserStore((state) => state.historyError);
  const historyOpen = useBrowserStore((state) => state.historyOpen);
  const publishOpen = useBrowserStore((state) => state.publishOpen);
  const error = useBrowserStore((state) => state.error);
  const selectUser = useBrowserStore((state) => state.selectUser);
  const navigateTo = useBrowserStore((state) => state.navigateTo);
  const search = useBrowserStore((state) => state.search);
  const goBack = useBrowserStore((state) => state.goBack);
  const goForward = useBrowserStore((state) => state.goForward);
  const saveScroll = useBrowserStore((state) => state.saveScroll);
  const reloadHistory = useBrowserStore((state) => state.reloadHistory);
  const publish = useBrowserStore((state) => state.publish);
  const setHistoryOpen = useBrowserStore((state) => state.setHistoryOpen);
  const setPublishOpen = useBrowserStore((state) => state.setPublishOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<number | null>(null);
  const entry = current(navigation);
  const entryKey = `${navigation.index}:${entry.kind}:${entryInput(entry)}`;
  const activeEntryKey = useRef(entryKey);

  useEffect(() => {
    activeEntryKey.current = entryKey;
  }, [entryKey]);

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
    if (
      (entry.kind === "search" || entry.kind === "home") &&
      contentRef.current
    ) {
      contentRef.current.scrollTop = entry.scrollY;
    }
  }, [entryKey, entry]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    function onScroll() {
      if (scrollTimeout.current !== null) return;
      scrollTimeout.current = window.setTimeout(() => {
        scrollTimeout.current = null;
        if (
          entryKey === activeEntryKey.current &&
          (entry.kind === "search" || entry.kind === "home")
        ) {
          saveScroll(contentRef.current?.scrollTop ?? 0);
        }
      }, 100);
    }
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      element.removeEventListener("scroll", onScroll);
      if (scrollTimeout.current !== null) {
        window.clearTimeout(scrollTimeout.current);
        scrollTimeout.current = null;
      }
    };
  }, [entry.kind, entryKey, saveScroll]);

  const saveFrameScroll = useCallback(
    (y: number, sourceEntryKey: string) => {
      if (
        sourceEntryKey !== activeEntryKey.current ||
        scrollTimeout.current !== null
      ) {
        return;
      }
      scrollTimeout.current = window.setTimeout(() => {
        scrollTimeout.current = null;
        if (sourceEntryKey === activeEntryKey.current) saveScroll(y);
      }, 100);
    },
    [saveScroll],
  );

  function navigateFromHistory(address: string) {
    setHistoryOpen(false);
    void navigateTo(address, "history");
  }

  return (
    <main className="browser-shell bg-gradient-to-br from-white via-[#fbfcff] to-[#f8fbff]">
      <header className="browser-header border-b border-b-[#e5eaf2] bg-gradient-to-r from-[#f5fbf8] via-[#fbfaff] to-[#fff8f5]">
        <div className="brand-row">
          <Link className="brand" href="/" aria-label="Smallweb home">
            <span
              className="brand-icon bg-gradient-to-br from-emerald-100 to-violet-100 text-[#347d75] shadow-[0_3px_8px_#466b741c]"
              aria-hidden="true"
            >
              <FiGlobe focusable="false" />
            </span>
            <span>smallweb</span>
          </Link>
          <span className="brand-caption text-slate-500">
            a browser for little places
          </span>
          {user && (
            <UserPicker
              users={users}
              user={user}
              onChange={selectUser}
            />
          )}
        </div>
        <Toolbar
          value={entryInput(entry)}
          addressKey={entryKey}
          canBack={canGoBack(navigation)}
          canForward={canGoForward(navigation)}
          onBack={goBack}
          onForward={goForward}
          onNavigate={(address) => void navigateTo(address, "typed")}
          onHistory={() => {
            setHistoryOpen(true);
            void reloadHistory();
          }}
          onPublish={() => setPublishOpen(true)}
          onSearch={(query) => void search(query)}
        />
      </header>

      <div className="browser-content-wrap bg-[radial-gradient(ellipse_at_18%_20%,#f1f8ff_0,transparent_37%),radial-gradient(ellipse_at_82%_86%,#fff2ed_0,transparent_34%),#fcfdfd]">
        <div className="browser-content" ref={contentRef} tabIndex={-1}>
          {entry.kind === "home" ? (
            <section className="welcome-page bg-[radial-gradient(ellipse_at_18%_20%,#f1f8ff_0,transparent_37%),radial-gradient(ellipse_at_82%_86%,#fff2ed_0,transparent_34%),#fcfdfd]">
              <div
                className="welcome-orbit border-emerald-200 bg-gradient-to-br from-emerald-100 via-violet-100 to-orange-100 text-[#438d82] shadow-[0_12px_30px_#657c9b20]"
                aria-hidden="true"
              >
                <FiGlobe focusable="false" />
              </div>
              <p className="eyebrow text-emerald-800">
                A SMALLER SIDE OF THE INTERNET
              </p>
              <h1>Find a little place<br />to call your own.</h1>
              <p className="welcome-copy">
                Visit a smallweb address or search for something unexpected.
              </p>
              <div className="suggested-sites">
                <span>Try a place</span>
                {SUGGESTED_SITES.map((site, index) => (
                  <button
                    type="button"
                    key={site}
                    className={
                      index === 0
                        ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100"
                        : index === 1
                          ? "border-violet-200 bg-gradient-to-r from-violet-50 to-white text-violet-800 hover:border-violet-300 hover:bg-violet-100"
                          : "border-orange-200 bg-gradient-to-r from-orange-50 to-white text-orange-800 hover:border-orange-300 hover:bg-orange-100"
                    }
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
              onNavigate={(address) => void navigateTo(address, "search")}
            />
          ) : entry.site ? (
            <PageViewer
              key={entryKey}
              site={entry.site}
              scrollY={entry.scrollY}
              onNavigate={(address) => void navigateTo(address, "link")}
              onScroll={(y) => saveFrameScroll(y, entryKey)}
            />
          ) : (
            <NowherePage address={entry.address} />
          )}
        </div>
        {loading && (
          <div className="loading-indicator" role="status">
            <span className="spinner" />
            {loading === "search"
              ? "Searching…"
              : `Finding ${loading}…`}
          </div>
        )}
      </div>

      <footer className="browser-footer border-t border-t-[#e7ebf1] bg-gradient-to-r from-white via-[#f9fbff] to-[#fffaf8] text-slate-500">
        <span>
          {entry.kind === "page" && entry.site
            ? `A small place by ${entry.site.author.name}`
            : "Made for wandering"}
        </span>
        <span>
          {entry.kind === "page" ? getEntryTitle(entry) : "smallweb.zz"}
        </span>
      </footer>
      {error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}
      {historyOpen && (
        <HistoryPanel
          visits={visits}
          loading={historyLoading}
          error={historyError}
          onClose={() => setHistoryOpen(false)}
          onNavigate={navigateFromHistory}
        />
      )}
      {publishOpen && user && (
        <PublishDialog
          users={users}
          currentUser={user}
          error={error}
          onClose={() => setPublishOpen(false)}
          onPublish={publish}
        />
      )}
    </main>
  );
}

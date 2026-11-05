"use client";

import { AddressBar } from "./AddressBar";

type ToolbarProps = {
  address: string;
  addressKey: string;
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onNavigate: (address: string) => void;
  onHistory: () => void;
  onPublish: () => void;
  onSearch: (query: string) => void;
};

export function Toolbar({
  address,
  addressKey,
  canBack,
  canForward,
  onBack,
  onForward,
  onNavigate,
  onHistory,
  onPublish,
  onSearch,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="navigation-buttons">
        <button
          type="button"
          className="icon-button"
          onClick={onBack}
          disabled={!canBack}
          aria-label="Go back"
          title="Back (Alt+Left)"
        >
          ←
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onForward}
          disabled={!canForward}
          aria-label="Go forward"
          title="Forward (Alt+Right)"
        >
          →
        </button>
      </div>
      <AddressBar key={addressKey} address={address} onNavigate={onNavigate} />
      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const input = form.elements.namedItem("site-search");
          if (input instanceof HTMLInputElement) onSearch(input.value);
        }}
      >
        <label className="sr-only" htmlFor="site-search">
          Search smallweb
        </label>
        <input id="site-search" name="site-search" placeholder="Search" />
        <button type="submit" className="search-submit" aria-label="Search">
          ⌕
        </button>
      </form>
      <button type="button" className="toolbar-button" onClick={onHistory}>
        History
      </button>
      <button
        type="button"
        className="toolbar-button publish-button"
        onClick={onPublish}
      >
        <span aria-hidden="true">＋</span> Publish
      </button>
    </div>
  );
}

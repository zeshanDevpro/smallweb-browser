"use client";

import { FiArrowLeft, FiArrowRight, FiPlus } from "react-icons/fi";
import type { ToolbarProps } from "@/lib/types";
import { Omnibox } from "./Omnibox";

export function Toolbar({
  value,
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
          className="icon-button text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:text-slate-300"
          onClick={onBack}
          disabled={!canBack}
          aria-label="Go back"
          title="Back (Alt+Left)"
        >
          <FiArrowLeft aria-hidden="true" focusable="false" />
        </button>
        <button
          type="button"
          className="icon-button text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:text-slate-300"
          onClick={onForward}
          disabled={!canForward}
          aria-label="Go forward"
          title="Forward (Alt+Right)"
        >
          <FiArrowRight aria-hidden="true" focusable="false" />
        </button>
      </div>
      <Omnibox
        key={addressKey}
        value={value}
        onNavigate={onNavigate}
        onSearch={onSearch}
      />
      <button
        type="button"
        className="toolbar-button border-transparent text-slate-600 hover:bg-sky-50 hover:text-sky-800"
        onClick={onHistory}
      >
        History
      </button>
      <button
        type="button"
        className="toolbar-button publish-button border-emerald-200 bg-gradient-to-r from-emerald-50 to-violet-50 text-emerald-800 hover:border-emerald-300 hover:from-emerald-100 hover:to-violet-100"
        onClick={onPublish}
      >
        <FiPlus aria-hidden="true" focusable="false" /> Publish
      </button>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { FiGlobe, FiSearch } from "react-icons/fi";
import { resolveInput } from "@/lib/helper";
import type { OmniboxProps } from "@/lib/types";

export function Omnibox({ value, onNavigate, onSearch }: OmniboxProps) {
  const [input, setInput] = useState(value);
  const [isTyping, setIsTyping] = useState(false);
  const resolved = resolveInput(input);
  const hint =
    !isTyping || resolved.kind === "empty"
      ? ""
      : resolved.kind === "address"
        ? `Go to ${resolved.address}`
        : `Searching for “${resolved.query}”…`;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = resolveInput(input);
    if (result.kind === "address") {
      onNavigate(result.address);
      setInput(result.address);
      setIsTyping(false);
    } else if (result.kind === "search") {
      onSearch(result.query);
      setInput(result.query);
      setIsTyping(false);
    }
  }

  return (
    <div className="omnibox-wrap">
      <form
        className="omnibox border-[#dfe8e8] bg-white shadow-[0_2px_8px_#435a6910] focus-within:border-emerald-400 focus-within:shadow-[0_0_0_3px_#dff2ec,0_4px_14px_#435a6914]"
        onSubmit={submit}
      >
        <label className="sr-only" htmlFor="omnibox-input">
          Address or search
        </label>
        <FiGlobe
          className="omnibox-icon text-emerald-700"
          aria-hidden="true"
          focusable="false"
        />
        <input
          id="omnibox-input"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setIsTyping(true);
          }}
          placeholder="Type an address or search the web"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          className="go-button bg-gradient-to-br from-emerald-100 to-violet-100 text-emerald-800 hover:from-emerald-200 hover:to-violet-200"
          type="submit"
          aria-label="Go or search"
        >
          <FiSearch aria-hidden="true" focusable="false" />
        </button>
      </form>
      {hint && (
        <span
          className="omnibox-hint border-slate-200 bg-white text-slate-600"
          role="status"
        >
          {hint}
        </span>
      )}
    </div>
  );
}

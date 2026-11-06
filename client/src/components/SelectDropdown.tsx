"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import type { SelectDropdownProps, SelectOption } from "@/lib/types";

export function SelectDropdown({
  value,
  options,
  label,
  className = "",
  onChange,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value)),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector("button")?.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (index) => (index + direction + options.length) % options.length,
      );
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) choose(option);
    }
  }

  return (
    <div
      className={`select-dropdown ${className}`.trim()}
      ref={rootRef}
    >
      <button
        type="button"
        className="select-dropdown-trigger border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 aria-expanded:border-emerald-200 aria-expanded:bg-emerald-50"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setActiveIndex(Math.max(0, selectedIndex));
          setOpen((isOpen) => !isOpen);
        }}
      >
        <span>{selected?.label ?? ""}</span>
        <FiChevronDown aria-hidden="true" focusable="false" />
      </button>
      {open && (
        <div
          className="select-dropdown-menu border border-slate-100 bg-white shadow-[0_8px_24px_#253c3021]"
          role="listbox"
          aria-label={label}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              className="select-dropdown-option text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 aria-selected:text-slate-900"
              role="option"
              aria-selected={option.value === value}
              tabIndex={activeIndex === index ? 0 : -1}
              onFocus={() => setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <FiCheck
                  className="text-emerald-700"
                  aria-hidden="true"
                  focusable="false"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

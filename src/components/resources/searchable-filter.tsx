"use client";

import { useId, useMemo, useState } from "react";
import type { ResidencyFilterOption } from "@/lib/residencies/directory";

export function SearchableFilter({
  label,
  name,
  options,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  options: ResidencyFilterOption[];
  defaultValue?: string;
  placeholder: string;
}) {
  const listId = useId();
  const initialOption = options.find((option) => option.value === defaultValue);
  const [query, setQuery] = useState(initialOption?.label ?? "");
  const [selectedValue, setSelectedValue] = useState(
    initialOption?.value ?? "",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  function choose(option: ResidencyFilterOption) {
    setQuery(option.label);
    setSelectedValue(option.value);
    setIsOpen(false);
    setActiveIndex(0);
  }

  return (
    <div className="relative">
      <label
        htmlFor={`${listId}-input`}
        className="text-xs font-bold uppercase tracking-wider text-slate-600"
      >
        {label}
      </label>
      <input type="hidden" name={name} value={selectedValue} />
      <div className="relative mt-2">
        <input
          id={`${listId}-input`}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${listId}-options`}
          aria-activedescendant={
            isOpen && filteredOptions[activeIndex]
              ? `${listId}-option-${activeIndex}`
              : undefined
          }
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 100)}
          onChange={(event) => {
            const nextQuery = event.target.value;
            const exact = options.find(
              (option) =>
                option.label.toLowerCase() === nextQuery.trim().toLowerCase(),
            );
            setQuery(nextQuery);
            setSelectedValue(exact?.value ?? "");
            setActiveIndex(0);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
              if (filteredOptions.length > 0) {
                setActiveIndex((current) =>
                  Math.min(current + 1, filteredOptions.length - 1),
                );
              }
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter" && isOpen) {
              const option = filteredOptions[activeIndex];
              if (option) {
                event.preventDefault();
                choose(option);
              }
            } else if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className="h-12 w-full border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-brand-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-200"
        />
        {(query || selectedValue) && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              setSelectedValue("");
              setIsOpen(true);
            }}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-lg text-slate-500 hover:text-slate-950"
          >
            ×
          </button>
        )}
      </div>
      {isOpen && (
        <ul
          id={`${listId}-options`}
          role="listbox"
          className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto border border-slate-200 bg-white py-1 shadow-xl"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                id={`${listId}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={selectedValue === option.value}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option);
                }}
                className={`cursor-pointer px-3 py-2.5 text-sm ${
                  index === activeIndex
                    ? "bg-brand-100 text-brand-950"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-3 text-sm text-slate-500">
              No matching option. Try another term.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

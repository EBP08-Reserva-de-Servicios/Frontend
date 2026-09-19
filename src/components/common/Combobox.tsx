import React, { useState, useRef, useEffect, useId } from "react";

interface ComboboxProps {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  disabledPlaceholder?: string;
  onChange: (v: string) => void;
  inBar?: boolean;
  subtitleMap?: Record<string, string>;
}

export function Combobox({
  label,
  value,
  placeholder,
  options,
  disabled,
  disabledPlaceholder,
  onChange,
  inBar,
  subtitleMap,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const displayValue = value || (disabled ? (disabledPlaceholder ?? "—") : placeholder);
  const isPlaceholder = !value;

  const handleSelect = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const triggerClassName = inBar
    ? `w-full text-left flex items-center justify-between gap-1 select-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`
    : `w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors select-none
        ${disabled ? "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50" : open ? "border-teal-400 cursor-pointer" : "border-slate-200 text-slate-800 cursor-pointer"}
        ${isPlaceholder && !disabled ? "text-slate-400" : ""}`;

  return (
    <div ref={ref} className={inBar ? "relative h-full flex flex-col justify-center" : "relative"}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={triggerClassName}
      >
        <span className={`truncate ${inBar ? "text-sm font-medium" : ""} ${isPlaceholder || disabled ? "text-slate-400" : "text-slate-800"}`}>
          {displayValue}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Limpiar ${label}`}
            onClick={handleClear}
            onKeyDown={(e) => e.key === "Enter" && handleClear(e)}
            className={`shrink-0 w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors cursor-pointer ${inBar ? "" : "ml-2"}`}
          >
            <svg className="w-2.5 h-2.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        ) : (
          <svg
            className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""} ${disabled ? "text-slate-200" : "text-slate-400"} ${inBar ? "" : "ml-2"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          id={listboxId}
          aria-label={label}
          className={`absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden ${inBar ? "w-56" : "right-0 mt-1"}`}
        >
          <div className="p-2 border-b border-slate-50">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                aria-label={`Buscar en ${label}`}
                className="w-full text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
          <div className={`overflow-y-auto py-1 ${inBar ? "max-h-52" : "max-h-44"}`}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-slate-400 text-center">No se encontraron resultados</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-teal-50 hover:text-teal-700 ${opt === value ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-700"}`}
                >
                  {subtitleMap?.[opt] ? (
                    <span className="flex flex-col gap-0">
                      <span>{opt}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{subtitleMap[opt]}</span>
                    </span>
                  ) : (
                    opt
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
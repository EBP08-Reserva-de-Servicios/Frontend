import React from "react";
import type { Filters } from "@/types";
import { SERVICE_TO_CATEGORY } from "@/data";
import { formatShortDate } from "@/utils";

interface ActiveFilterChipsProps {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}

export function ActiveFilterChips({ filters, onChange }: ActiveFilterChipsProps) {
  const chips = [
    filters.category && {
      label: filters.category,
      clear: () =>
        onChange({
          category: "",
          service: filters.service && SERVICE_TO_CATEGORY[filters.service] !== filters.category ? filters.service : "",
        }),
    },
    filters.service && {
      label: filters.service,
      clear: () => onChange({ service: "" }),
    },
    filters.department && {
      label: filters.department,
      clear: () => onChange({ department: "", municipality: "" }),
    },
    filters.municipality && {
      label: filters.municipality,
      clear: () => onChange({ municipality: "" }),
    },
    filters.date && {
      label: formatShortDate(filters.date),
      clear: () => onChange({ date: "" }),
    },
    filters.time && {
      label: filters.time,
      clear: () => onChange({ time: "" }),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  if (!chips.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 font-medium">Filtros activos:</span>
      {chips.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-semibold"
        >
          {c.label}
          <button onClick={c.clear} className="ml-0.5 hover:text-teal-600" aria-label={`Remover filtro ${c.label}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}


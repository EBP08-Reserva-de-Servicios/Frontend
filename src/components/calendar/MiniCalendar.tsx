import React from "react";
import type { Professional } from "@/types";
import { MONTH_NAMES, DAY_NAMES } from "@/data";
import { proTieneCupo } from "@/utils";

interface MiniCalendarProps {
  pro: Professional;
  year: number;
  month: number; // 0-indexed
  selectedDay: number | null;
  onSelectDay: (d: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MiniCalendar({
  pro,
  year,
  month,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: MiniCalendarProps) {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert Sunday-first to Monday-first offset
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mb-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrevMonth}
          disabled={isCurrentMonth}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isCurrentMonth ? "text-slate-200 cursor-not-allowed" : "hover:bg-slate-100 text-slate-500"}`}
          aria-label="Mes anterior"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
          aria-label="Mes siguiente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const isPast = isCurrentMonth && day < today.getDate();
          const cellDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const available = !isPast && proTieneCupo(pro, cellDateStr);
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = day === selectedDay;

          return (
            <div key={idx} className="flex flex-col items-center py-0.5">
              <button
                disabled={!available}
                onClick={() => available && onSelectDay(day)}
                className={`w-8 h-8 rounded-full text-xs font-semibold transition-all relative cursor-pointer
                  ${isSelected ? "bg-teal-600 text-white shadow-sm" :
                    isToday && available ? "ring-2 ring-teal-400 text-teal-700 hover:bg-teal-50" :
                    available ? "text-slate-700 hover:bg-slate-100" :
                    "text-slate-300 cursor-not-allowed"}`}
              >
                {day}
              </button>
              {available && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-teal-400 mt-0.5" />
              )}
              {isSelected && <div className="w-1 h-1 rounded-full bg-teal-200 mt-0.5" />}
              {!available && <div className="w-1 h-1 mt-0.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import type { Filters, CategoryType } from "@/types";
import {
  COLOMBIA_GEO,
  DEPARTMENTS,
  CATEGORY_SERVICES,
  CATEGORIES,
  SERVICE_TO_CATEGORY,
  TIME_SLOTS,
} from "@/data";
import { slotToMinutes, getTodayString, getNowMinutes } from "@/utils";
import { Combobox } from "@/components/common/Combobox";

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  showMobilePanel: boolean;
  setShowMobilePanel: (v: boolean) => void;
}

export function FilterBar({
  filters,
  onChange,
  showMobilePanel,
  setShowMobilePanel,
}: FilterBarProps) {
  const activeCount = [
    filters.category,
    filters.service,
    filters.department,
    filters.municipality,
    filters.date,
    filters.time,
  ].filter(Boolean).length;

  const municipios = filters.department ? COLOMBIA_GEO[filters.department] ?? [] : [];

  const handleDeptChange = (dept: string) => {
    onChange({ department: dept, municipality: "" });
  };

  // Services available given the selected category
  const availableServices = filters.category
    ? CATEGORY_SERVICES[filters.category] ?? []
    : Object.values(CATEGORY_SERVICES).flat();

  // Subtitle map for service items: only shown when no category is selected
  const serviceSubtitleMap: Record<string, string> | undefined = filters.category
    ? undefined
    : SERVICE_TO_CATEGORY;

  const handleCategoryChange = (cat: string) => {
    const newCat = cat as CategoryType;
    const catServices = newCat ? CATEGORY_SERVICES[newCat] : [];
    const keepService = newCat && catServices?.includes(filters.service) ? filters.service : "";
    onChange({ category: newCat, service: keepService });
  };

  const handleServiceChange = (svc: string) => {
    const autoCategory = svc ? SERVICE_TO_CATEGORY[svc] ?? "" : "";
    if (autoCategory && !filters.category) {
      onChange({ service: svc, category: autoCategory });
    } else {
      onChange({ service: svc });
    }
  };

  const todayStr = getTodayString();
  const nowMinutes = getNowMinutes();
  const isToday = filters.date === todayStr;
  const availableTimeSlots = isToday
    ? TIME_SLOTS.filter((s) => slotToMinutes(s) > nowMinutes)
    : TIME_SLOTS;

  const handleDateChange = (date: string) => {
    const partial: Partial<Filters> = { date };
    // If the newly selected date is today and current time selection is now in the past, clear it
    if (date === todayStr && filters.time && slotToMinutes(filters.time) <= nowMinutes) {
      partial.time = "";
    }
    onChange(partial);
  };

  return (
    <>
      {/* ── Desktop filter bar ── */}
      <div className="hidden md:flex bg-white rounded-2xl shadow-md border border-slate-100 overflow-visible items-stretch divide-x divide-slate-100">
        {/* Categoría + Servicio grouped block */}
        <div className="flex-[1.8] min-w-0 flex divide-x divide-slate-100">
          <div className="flex-1 min-w-0 px-4 py-3">
            <label className="block text-[10px] font-semibold text-teal-500 mb-1 uppercase tracking-wide">
              Categoría
            </label>
            <Combobox
              inBar
              label="Categoría"
              value={filters.category}
              placeholder="Todas las categorías"
              options={CATEGORIES}
              onChange={handleCategoryChange}
            />
          </div>
          <div className="flex-1 min-w-0 px-4 py-3">
            <label className="block text-[10px] font-semibold text-teal-500 mb-1 uppercase tracking-wide">
              Servicio
            </label>
            <Combobox
              inBar
              label="Servicio"
              value={filters.service}
              placeholder="Todos los servicios"
              options={availableServices}
              onChange={handleServiceChange}
              subtitleMap={serviceSubtitleMap}
            />
          </div>
        </div>

        {/* Lugar — Departamento + Municipio grouped */}
        <div className="flex-[1.8] min-w-0 flex divide-x divide-slate-100">
          <div className="flex-1 min-w-0 px-4 py-3">
            <label className="block text-[10px] font-semibold text-teal-500 mb-1 uppercase tracking-wide">
              Departamento
            </label>
            <Combobox
              inBar
              label="Departamento"
              value={filters.department}
              placeholder="Todos"
              options={DEPARTMENTS}
              onChange={handleDeptChange}
            />
          </div>
          <div className="flex-1 min-w-0 px-4 py-3">
            <label className="block text-[10px] font-semibold text-teal-500 mb-1 uppercase tracking-wide">
              Municipio
            </label>
            <Combobox
              inBar
              label="Municipio"
              value={filters.municipality}
              placeholder="Todos"
              options={municipios}
              disabled={!filters.department}
              disabledPlaceholder="Elige departamento"
              onChange={(v) => onChange({ municipality: v })}
            />
          </div>
        </div>

        {/* Fecha */}
        <div className="flex-1 min-w-0 px-4 py-3 relative">
          <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
            Fecha
          </label>
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={filters.date}
              min={todayStr}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full text-sm font-medium text-slate-800 bg-transparent border-none outline-none cursor-pointer"
              style={{ colorScheme: "light" }}
            />
            {filters.date && (
              <button
                onClick={() => onChange({ date: "" })}
                className="shrink-0 w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Limpiar fecha"
              >
                <svg className="w-2.5 h-2.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Hora */}
        <div className="flex-1 min-w-0 px-4 py-3">
          <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
            Hora
          </label>
          <Combobox
            inBar
            label="Hora"
            value={filters.time}
            placeholder="Cualquier hora"
            options={availableTimeSlots}
            onChange={(v) => onChange({ time: v })}
          />
        </div>
      </div>

      {/* ── Mobile trigger ── */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobilePanel(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-100 text-sm font-medium text-slate-700 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
            {activeCount > 0 && (
              <span className="bg-teal-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* ── Mobile panel ── */}
      {showMobilePanel && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobilePanel(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 space-y-4 z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Filtros
              </h3>
              <button
                onClick={() => setShowMobilePanel(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 cursor-pointer"
                aria-label="Cerrar filtros"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Categoría + Servicio — bloque agrupado */}
            <div className="rounded-xl border border-slate-200 overflow-visible divide-y divide-slate-100">
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Tipo de servicio</span>
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Categoría
                </label>
                <Combobox
                  label="Categoría"
                  value={filters.category}
                  placeholder="Todas las categorías"
                  options={CATEGORIES}
                  onChange={handleCategoryChange}
                />
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Servicio
                </label>
                <Combobox
                  label="Servicio"
                  value={filters.service}
                  placeholder="Todos los servicios"
                  options={availableServices}
                  onChange={handleServiceChange}
                  subtitleMap={serviceSubtitleMap}
                />
              </div>
            </div>

            {/* Lugar — dos campos apilados con separador visual */}
            <div className="rounded-xl border border-slate-200 overflow-visible divide-y divide-slate-100">
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Lugar</span>
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Departamento
                </label>
                <Combobox
                  label="Departamento"
                  value={filters.department}
                  placeholder="Selecciona departamento"
                  options={DEPARTMENTS}
                  onChange={handleDeptChange}
                />
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Municipio
                </label>
                <Combobox
                  label="Municipio"
                  value={filters.municipality}
                  placeholder="Selecciona municipio"
                  options={municipios}
                  disabled={!filters.department}
                  disabledPlaceholder="Selecciona primero un departamento"
                  onChange={(v) => onChange({ municipality: v })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Fecha
              </label>
              <input
                type="date"
                value={filters.date}
                min={todayStr}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Hora
              </label>
              <Combobox
                label="Hora"
                value={filters.time}
                placeholder="Cualquier hora"
                options={availableTimeSlots}
                onChange={(v) => onChange({ time: v })}
              />
            </div>

            <button
              onClick={() => setShowMobilePanel(false)}
              className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl text-sm cursor-pointer hover:bg-teal-700 transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </>
  );
}


import React, { useState, useEffect } from "react";
import type { Business, PreSelected, Filters, HomeSnapshot } from "@/types";
import { CITY_TO_DEPARTMENT } from "@/data";
import { cargarNegocios } from "@/services/adapter";
import { proTieneCupo } from "@/utils";
import {
  Header,
  NameSearchBar,
  FilterBar,
  ActiveFilterChips,
  EmptyState,
  BusinessCard,
} from "@/components";

interface HomeScreenProps {
  onSelectBusiness: (b: Business, pre: PreSelected | null, snapshot: HomeSnapshot) => void;
  initialSnapshot?: HomeSnapshot;
}

export function HomeScreen({ onSelectBusiness, initialSnapshot }: HomeScreenProps) {
  const [filters, setFilters] = useState<Filters>(
    initialSnapshot?.filters ?? {
      category: "",
      service: "",
      department: "",
      municipality: "",
      date: "",
      time: "",
    }
  );
  const [nameQuery, setNameQuery] = useState(initialSnapshot?.nameQuery ?? "");
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [negocios, setNegocios] = useState<Business[]>([]);

  useEffect(() => {
    cargarNegocios()
      .then(setNegocios)
      .catch((e) => console.error("No se pudo cargar desde el backend:", e));
  }, []);

  const updateFilters = (partial: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...partial }));

  const resetFilters = () => {
    setFilters({
      category: "",
      service: "",
      department: "",
      municipality: "",
      date: "",
      time: "",
    });
    setNameQuery("");
  };

  const filtered = negocios.filter((b) => {
    if (filters.category && b.category !== filters.category) return false;
    if (filters.service && b.service !== filters.service) return false;
    if (filters.municipality && b.city.toLowerCase() !== filters.municipality.toLowerCase())
      return false;
    else if (!filters.municipality && filters.department) {
      const dept = CITY_TO_DEPARTMENT[b.city];
      if (dept !== filters.department) return false;
    }
    if (filters.date) {
      if (!b.professionals.some((p) => proTieneCupo(p, filters.date, filters.time)))
        return false;
    } else if (filters.time) {
      if (!b.professionals.some((p) => p.slots.includes(filters.time)))
        return false;
    }
    if (nameQuery.trim() && !b.name.toLowerCase().includes(nameQuery.trim().toLowerCase()))
      return false;
    return true;
  });

  const activeCount = [
    filters.category,
    filters.service,
    filters.department,
    filters.municipality,
    filters.date,
    filters.time,
  ].filter(Boolean).length;

  const hasSearch = nameQuery.trim().length > 0;
  const sectionTitle = !activeCount && !hasSearch
    ? "Empresas populares cerca de ti"
    : hasSearch && !activeCount
    ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} para "${nameQuery}"`
    : activeCount === 1 && filters.category && !filters.service && !hasSearch
    ? `${filtered.length} empresa${filtered.length !== 1 ? "s" : ""} en ${filters.category}`
    : activeCount === 1 && filters.service && !hasSearch
    ? `${filtered.length} empresa${filtered.length !== 1 ? "s" : ""} con ${filters.service}`
    : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`;

  const handleCardSelect = (b: Business) => {
    const pre =
      filters.date && filters.time
        ? { service: filters.service, date: filters.date, time: filters.time }
        : null;
    onSelectBusiness(b, pre, { filters, nameQuery });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-6xl mx-auto text-center relative">
          <h1
            className="font-display text-3xl sm:text-5xl text-white leading-tight"
            style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800 }}
          >
            Reserva citas con los mejores negocios
          </h1>
        </div>
      </div>

      {/* Search + Filter bar floating over hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 mb-8 relative z-10 space-y-3">
        <NameSearchBar value={nameQuery} onChange={setNameQuery} />
        <FilterBar
          filters={filters}
          onChange={updateFilters}
          showMobilePanel={showMobilePanel}
          setShowMobilePanel={setShowMobilePanel}
        />
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <h2
              className="font-display text-xl font-bold text-slate-900"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {sectionTitle}
            </h2>
            <ActiveFilterChips filters={filters} onChange={updateFilters} />
          </div>
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-slate-500 hover:text-teal-600 font-medium transition-colors hidden sm:block cursor-pointer"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((b) => (
              <BusinessCard
                key={b.id}
                business={b}
                onSelect={() => handleCardSelect(b)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

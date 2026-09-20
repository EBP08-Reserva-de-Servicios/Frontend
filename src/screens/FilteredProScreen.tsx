import React, { useState } from "react";
import type { Business, Professional, PreSelected } from "@/types";
import { formatLongDate, slotsDeDia } from "@/utils";
import { Header, CategoryBadge, ProfessionalCard } from "@/components";

interface FilteredProScreenProps {
  business: Business;
  preSelected: PreSelected;
  onBook: (pro: Professional, slot: string, date: string) => void;
  onBack: () => void;
}

export function FilteredProScreen({
  business,
  preSelected,
  onBook,
  onBack,
}: FilteredProScreenProps) {
  const available = business.professionals.filter((p) =>
    slotsDeDia(p, preSelected.date).includes(preSelected.time)
  );
  const [selectedPro, setSelectedPro] = useState<Professional | null>(
    available.length === 1 ? available[0] : null
  );

  const formattedDate = formatLongDate(preSelected.date);

  const summaryFields = [
    { label: "Servicio", value: preSelected.service || business.category },
    { label: "Empresa", value: business.name },
    { label: "Fecha", value: formattedDate },
    { label: "Hora", value: preSelected.time },
    { label: "Profesional", value: selectedPro ? `${selectedPro.name} — ${selectedPro.role}` : "" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onBack={onBack} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Volver */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al listado
        </button>

        {/* Business mini-header */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-display text-xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                {business.name}
              </h1>
              <CategoryBadge category={business.category} />
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {business.address}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-7">
          {["Empresa", "Profesional", "Confirmar"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0
                    ? "bg-teal-600 text-white"
                    : i === 1
                    ? "bg-teal-600 text-white ring-2 ring-teal-200"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {i === 0 ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === 1 ? "text-teal-700 font-semibold" : "text-slate-500"}`}>
                {step}
              </span>
              {i < 2 && <div className={`h-px w-6 sm:w-12 ${i === 0 ? "bg-teal-300" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-5 items-start">
          {/* Left — Professionals */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <h2
              className="font-display font-bold text-slate-900 mb-1 shrink-0"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Profesionales disponibles
            </h2>
            <p className="text-xs text-slate-400 mb-4 shrink-0">
              Para el {formattedDate} a las {preSelected.time}
            </p>

            {available.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Sin profesionales disponibles</p>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  No hay profesionales con disponibilidad en este horario. Intenta con otra fecha u hora.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-80 pr-1" style={{ scrollbarWidth: "thin" }}>
                {available.map((pro) => (
                  <ProfessionalCard
                    key={pro.name}
                    pro={pro}
                    isSelected={selectedPro?.name === pro.name}
                    onSelect={() => setSelectedPro(pro)}
                    variant="md"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-5">
            <h2 className="font-display font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Resumen de la solicitud
            </h2>

            <div className="space-y-3">
              {summaryFields.map(({ label, value }) => (
                <div
                  key={label}
                  className={`flex items-start justify-between gap-4 py-2.5 border-b border-slate-50 last:border-0 ${
                    !value && label === "Profesional" ? "opacity-40" : ""
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0 mt-0.5">
                    {label}
                  </span>
                  {value ? (
                    <span className="text-sm font-semibold text-slate-800 text-right capitalize">{value}</span>
                  ) : (
                    <span className="text-sm text-slate-300 italic text-right">Selecciona un profesional</span>
                  )}
                </div>
              ))}
            </div>

            <button
              disabled={!selectedPro || available.length === 0}
              onClick={() => selectedPro && onBook(selectedPro, preSelected.time, preSelected.date)}
              className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl text-sm hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {selectedPro ? "Agendar" : "Selecciona un profesional"}
            </button>
            <p className="text-center text-xs text-slate-400 -mt-3">Sin costo de cancelación hasta 2 horas antes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

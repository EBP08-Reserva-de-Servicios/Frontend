import React from "react";
import type { Business, Professional } from "@/types";
import { formatLongDate } from "@/utils";
import { Header } from "@/components";

interface ConfirmScreenProps {
  business: Business;
  professional: Professional;
  slot: string;
  date: string;
  enviando?: boolean;
  error?: string;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmScreen({
  business,
  professional,
  slot,
  date,
  enviando = false,
  error = "",
  onConfirm,
  onBack,
}: ConfirmScreenProps) {
  const formattedDate = formatLongDate(date);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Confirmar reserva" onBack={onBack} />

      <div className="max-w-2xl mx-auto px-4 py-8 w-full flex-1">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["Empresa", "Profesional", "Confirmar"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 2 ? "bg-teal-600 text-white" : "bg-teal-600 text-white"
                }`}
              >
                {i < 2 ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className="text-xs font-medium text-slate-600 hidden sm:block">{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-teal-200 w-6 sm:w-12" />}
            </div>
          ))}
        </div>

        {/* Heading */}
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Revisa los detalles y confirma
          </h2>
          <p className="text-sm text-slate-500 mt-1">Una vez confirmada, recibirás un recordatorio por correo electrónico.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="divide-y divide-slate-50">
            {[
              { label: "Servicio", value: business.category, icon: "🎯" },
              { label: "Empresa", value: business.name, icon: "🏢" },
              { label: "Profesional", value: `${professional.name} — ${professional.role}`, icon: "👤" },
              { label: "Fecha", value: formattedDate, icon: "📅" },
              { label: "Hora", value: slot, icon: "🕐" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-3.5">
                <span className="text-base shrink-0">{icon}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-24 shrink-0">{label}</span>
                <span className="text-sm font-semibold text-slate-800 capitalize">{value}</span>
              </div>
            ))}
          </div>
          <div className="px-6 py-3.5 bg-teal-50 flex items-center gap-2 border-t border-teal-100">
            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-teal-700">Sin costo de cancelación hasta 2 horas antes de la cita.</p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={enviando}
            className="flex-1 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl text-sm hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Volver
          </button>
          <button
            onClick={onConfirm}
            disabled={enviando}
            className="flex-[2] py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm transition-colors shadow-md shadow-teal-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando ? "Confirmando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

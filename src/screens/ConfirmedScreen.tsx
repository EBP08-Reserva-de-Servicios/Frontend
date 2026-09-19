import React, { useMemo } from "react";
import type { Business, Professional } from "@/types";

interface ConfirmedScreenProps {
  business: Business;
  professional: Professional;
  slot: string;
  date?: string;
  onHome: () => void;
}

export function ConfirmedScreen({
  business,
  professional,
  slot,
  date,
  onHome,
}: ConfirmedScreenProps) {
  const displayDate = useMemo(() => {
    if (date) {
      const d = new Date(date + "T12:00:00");
      return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
    }
    return new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  }, [date]);

  const code = useMemo(() => `AG-${Math.floor(100000 + Math.random() * 900000)}`, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Top accent */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              ¡Reserva confirmada!
            </h1>
            <p className="text-teal-100 text-sm">Tu cita ha sido agendada exitosamente</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Empresa</span>
              <span className="text-sm font-semibold text-slate-800">{business.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Profesional</span>
              <span className="text-sm font-semibold text-slate-800">{professional.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Fecha</span>
              <span className="text-sm font-semibold text-slate-800 capitalize">{displayDate}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Hora</span>
              <span className="text-sm font-semibold text-slate-800">{slot}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500">Código de reserva</span>
              <span className="text-sm font-bold text-teal-700 font-mono">{code}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6">
            <button
              onClick={onHome}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Volver al inicio
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Guarda tu código de reserva. Se enviará confirmación a tu correo electrónico.
        </p>
      </div>
    </div>
  );
}


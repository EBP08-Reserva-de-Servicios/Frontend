import React from "react";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="font-display text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
        No encontramos empresas disponibles
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        No hay resultados con los filtros actuales. Intenta modificar tu búsqueda para ver más opciones.
      </p>
      <button
        onClick={onReset}
        className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
      >
        Modificar filtros
      </button>
    </div>
  );
}


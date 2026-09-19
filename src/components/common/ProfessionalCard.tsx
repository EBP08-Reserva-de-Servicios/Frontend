import type { Professional } from "@/types";

interface ProfessionalCardProps {
  pro: Professional;
  isSelected: boolean;
  onSelect: () => void;
  /** "sm" = como en DetailScreen (sin círculo cuando no está seleccionado). "md" = como en FilteredProScreen (círculo vacío cuando no está seleccionado). */
  variant?: "sm" | "md";
}

export function ProfessionalCard({ pro, isSelected, onSelect, variant = "sm" }: ProfessionalCardProps) {
  const indicatorSize = variant === "md" ? "w-5 h-5" : "w-4 h-4";
  const checkSize = variant === "md" ? "w-3 h-3" : "w-2.5 h-2.5";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
        isSelected ? "border-teal-400 bg-teal-50" : "border-slate-100 bg-slate-50 hover:border-slate-200"
      }`}
    >
      <img src={pro.avatar} alt={pro.name} className="w-11 h-11 rounded-full object-cover bg-slate-200 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{pro.name}</p>
        <p className="text-xs text-slate-500">{pro.role}</p>
      </div>
      {isSelected ? (
        <div className={`shrink-0 ${indicatorSize} rounded-full bg-teal-600 flex items-center justify-center ${variant === "sm" ? "ml-auto" : ""}`}>
          <svg className={`${checkSize} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : variant === "md" ? (
        <div className="shrink-0 w-5 h-5 rounded-full border-2 border-slate-300" />
      ) : null}
    </button>
  );
}
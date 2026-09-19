import React from "react";

interface CategoryBadgeProps {
  category: string;
  service?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Belleza": "bg-pink-50 text-pink-700 border-pink-100",
  "Salud": "bg-blue-50 text-blue-700 border-blue-100",
  "Deporte": "bg-orange-50 text-orange-700 border-orange-100",
  "Mascotas": "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export function CategoryBadge({ category, service }: CategoryBadgeProps) {
  const badgeColor = CATEGORY_COLORS[category] || "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
      {category}
      {service ? <span className="opacity-60">· {service}</span> : null}
    </span>
  );
}


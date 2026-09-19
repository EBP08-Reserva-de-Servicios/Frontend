import React from "react";
import type { Business } from "@/types";
import { CategoryBadge } from "@/components/common/CategoryBadge";

interface BusinessCardProps {
  business: Business;
  onSelect: () => void;
}

export function BusinessCard({ business, onSelect }: BusinessCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group flex flex-col">
      <div className="relative overflow-hidden h-44 bg-slate-100">
        <img
          src={business.image}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-display font-700 text-base text-slate-900 mb-2 leading-tight"
          style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700 }}
        >
          {business.name}
        </h3>
        <div className="mb-3 space-y-1.5">
          <CategoryBadge category={business.category} />
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {business.city}
          </p>
        </div>
        <button
          onClick={onSelect}
          className="w-full py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 active:bg-teal-800 transition-colors mt-auto cursor-pointer"
        >
          Explorar
        </button>
      </div>
    </div>
  );
}


import React, { useState } from "react";
import type { Business, Professional } from "@/types";
import { MONTH_NAMES } from "@/data";
import { proTieneCupo, slotsDeDia, slotToMinutes, getNowMinutes } from "@/utils";
import { Header, CategoryBadge, MiniCalendar, ProfessionalCard } from "@/components";

interface DetailScreenProps {
  business: Business;
  onBook: (pro: Professional, slot: string, date: string) => void;
  onBack: () => void;
}

export function DetailScreen({ business, onBook, onBack }: DetailScreenProps) {
  const today = new Date();
  const [selectedPro, setSelectedPro] = useState<Professional>(business.professionals[0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth((m) => m - 1);
    }
    setSelectedDay(null);
    setSelectedSlot("");
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth((m) => m + 1);
    }
    setSelectedDay(null);
    setSelectedSlot("");
  };

  const handleSelectDay = (d: number) => {
    setSelectedDay(d);
    setSelectedSlot("");
  };

  const handleSelectPro = (pro: Professional) => {
    setSelectedPro(pro);
    setSelectedSlot("");
    setSelectedDay(today.getDate());
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
  };

  // Slots available only when day is available for this pro
  const selectedDateStr = selectedDay !== null
    ? `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : "";
  const dayHasSlots = Boolean(selectedDateStr && proTieneCupo(selectedPro, selectedDateStr));

  const isSelectedDayToday =
    selectedDay !== null &&
    calYear === today.getFullYear() &&
    calMonth === today.getMonth() &&
    selectedDay === today.getDate();

  const nowMinutes = getNowMinutes();

  // Horas del día elegido (con datos reales usa slotsByDate; con datos falsos, la lista fija)
  const slotsDelDia = slotsDeDia(selectedPro, selectedDateStr);

  const availableSlots = dayHasSlots
    ? isSelectedDayToday
      ? slotsDelDia.filter((s) => slotToMinutes(s) > nowMinutes)
      : slotsDelDia
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onBack={onBack} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Business info */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-6">
          <div className="h-56 sm:h-72 bg-slate-100 relative">
            <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4">
              <CategoryBadge category={business.category} />
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <h1
                  className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-1"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {business.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {business.address}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{business.description}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {business.gallery.map((img, i) => (
                <img key={i} src={img} alt="" className="w-28 h-20 object-cover rounded-lg shrink-0 bg-slate-100" />
              ))}
            </div>
          </div>
        </div>

        {/* Professionals + Slots */}
        <div className="grid sm:grid-cols-2 gap-5 items-start">
          {/* Professionals */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <h2
              className="font-display font-bold text-slate-900 mb-4 shrink-0"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Profesionales
            </h2>
            <div className="space-y-3 overflow-y-auto max-h-80 pr-1" style={{ scrollbarWidth: "thin" }}>
              {business.professionals.map((pro) => (
                <ProfessionalCard
                  key={pro.name}
                  pro={pro}
                  isSelected={selectedPro.name === pro.name}
                  onSelect={() => handleSelectPro(pro)}
                  variant="sm"
                />
              ))}
            </div>
          </div>
          {/* Calendar + Time slots */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2
              className="font-display font-bold text-slate-900 mb-4"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Horarios disponibles
            </h2>

            <MiniCalendar
              pro={selectedPro}
              year={calYear}
              month={calMonth}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />

            {/* Divider */}
            <div className="border-t border-slate-100 mb-4" />

            {/* Slot subheading */}
            {selectedDay && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                {MONTH_NAMES[calMonth]} {selectedDay} — {selectedPro.name.split(" ")[0]}
              </p>
            )}

            {!selectedDay ? (
              <p className="text-sm text-slate-400 text-center py-4">Selecciona un día en el calendario</p>
            ) : availableSlots.length === 0 ? (
              <div className="flex flex-col items-center py-5 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-0.5">No hay horarios disponibles</p>
                <p className="text-xs text-slate-400">Prueba otro día del calendario</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selectedSlot === slot ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            <button
              disabled={!selectedSlot}
              onClick={() => {
                if (!selectedSlot || selectedDay === null) return;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
                onBook(selectedPro, selectedSlot, dateStr);
              }}
              className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {selectedSlot ? `Agendar para las ${selectedSlot}` : "Selecciona un horario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

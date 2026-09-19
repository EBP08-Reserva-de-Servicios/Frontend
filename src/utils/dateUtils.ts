import type { Professional } from "@/types";

/**
 * Deterministic calculation for professional availability based on name hash + day number
 */
export function isDayAvailable(proName: string, day: number): boolean {
  const hash = proName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (day + hash) % 4 !== 0;
}

/**
 * Checks if a professional has availability for a given date (YYYY-MM-DD) and optional time slot
 */
export function proTieneCupo(pro: Professional, fecha: string, hora?: string): boolean {
  if (!fecha) return false;
  const parts = fecha.split("-");
  const dia = Number(parts[2]);
  if (isNaN(dia)) return false;
  return isDayAvailable(pro.name, dia) && (!hora || pro.slots.includes(hora));
}

/**
 * Parses "H:MM a.m./p.m." format to total minutes since midnight
 */
export function slotToMinutes(slot: string): number {
  const [timePart, period] = slot.split(" ");
  const [h, m] = timePart.split(":").map(Number);
  const hours = period === "p.m." && h !== 12 ? h + 12 : period === "a.m." && h === 12 ? 0 : h;
  return hours * 60 + m;
}

/**
 * Returns today's date formatted as YYYY-MM-DD (local time compatible string)
 */
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns current minutes since midnight
 */
export function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Formats a YYYY-MM-DD date into localized Spanish string (e.g., "viernes, 19 de septiembre de 2026")
 */
export function formatLongDate(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/**
 * Formats a YYYY-MM-DD date into short chip text (e.g., "19 sept")
 */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

import type { CategoryType } from "@/types";

export const CATEGORY_SERVICES: Record<string, string[]> = {
  "Belleza": ["Corte de cabello", "Coloración", "Uñas press-on", "Manicure/Pedicure", "Maquillaje", "Depilación"],
  "Salud": ["Dermatología", "Nutrición", "Psicología clínica", "Medicina estética", "Fisioterapia"],
  "Deporte": ["Entrenamiento personal", "Clases de yoga", "Fisioterapia deportiva"],
  "Mascotas": ["Consulta veterinaria", "Baño y peluquería canina", "Vacunación"],
};

export const CATEGORIES = Object.keys(CATEGORY_SERVICES) as CategoryType[];

export const SERVICE_TO_CATEGORY: Record<string, CategoryType> = Object.fromEntries(
  Object.entries(CATEGORY_SERVICES).flatMap(([cat, svcs]) => svcs.map((s) => [s, cat as CategoryType]))
);

export const TIME_SLOTS = [
  "7:00 a.m.", "7:30 a.m.", "8:00 a.m.", "8:30 a.m.", "9:00 a.m.", "9:30 a.m.",
  "10:00 a.m.", "10:30 a.m.", "11:00 a.m.", "11:30 a.m.", "12:00 p.m.", "12:30 p.m.",
  "1:00 p.m.", "1:30 p.m.", "2:00 p.m.", "2:30 p.m.", "3:00 p.m.", "3:30 p.m.",
  "4:00 p.m.", "4:30 p.m.", "5:00 p.m.", "5:30 p.m.", "6:00 p.m.", "6:30 p.m.",
  "7:00 p.m.", "7:30 p.m.", "8:00 p.m."
];


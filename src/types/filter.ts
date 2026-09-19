import type { CategoryType } from "./business";

export interface Filters {
  category: CategoryType;
  service: string;
  department: string;
  municipality: string;
  date: string;
  time: string;
}

export interface HomeSnapshot {
  filters: Filters;
  nameQuery: string;
}


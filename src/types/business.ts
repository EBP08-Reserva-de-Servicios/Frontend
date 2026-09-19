export type CategoryType = "" | "Belleza" | "Salud" | "Deporte" | "Mascotas";

export interface Professional {
  name: string;
  role: string;
  avatar: string;
  slots: string[];
}

export interface Business {
  id: number;
  name: string;
  category: CategoryType;
  service: string;
  city: string;
  rating: number;
  reviews: number;
  availability?: string;
  image: string;
  description: string;
  address: string;
  professionals: Professional[];
  gallery: string[];
}

export interface PreSelected {
  service: string;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "9:00 a.m."
}


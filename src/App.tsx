import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";
import bienestarAnimalImage from "./assets/businesses/bienestar-animal.jpg";
import clinicaSaludImage from "./assets/businesses/clinica-salud-total.jpg";
import consultmedImage from "./assets/businesses/consultmed.jpg";
import corteEstiloImage from "./assets/businesses/corte-estilo.jpg";
import formaVidaImage from "./assets/businesses/forma-vida.jpg";
import glowStudioImage from "./assets/businesses/glow-studio.jpg";
import healthfirstImage from "./assets/businesses/healthfirst.jpg";
import mediprimeImage from "./assets/businesses/mediprime.jpg";
import powerfitImage from "./assets/businesses/powerfit.jpg";
import salonBelleImage from "./assets/businesses/salon-belle.jpg";
import studioEliteImage from "./assets/businesses/studio-elite-hair.jpg";
import veterinariaHuellitasImage from "./assets/businesses/veterinaria-huellitas.jpg";
import { API_BASE_URL, ENDPOINTS, aRegistroCliente, aRegistroProveedor, aLogin, aReserva, aServicioProveedor, aProfesional, aHorario, estadoDesdeBackend, municipioIdPorNombre,
  type LoginRespuesta, type OfertaDetalle, type DisponibilidadDetalle, type ReservaDetalle, type ReservaCreada, type MunicipioResumen } from "./api/contratoBackend";
import { pedir, ErrorApi, guardarSesion, cerrarSesion, sesionActual, cuandoVenzaLaSesion, aEtiquetaHora, aHoraBackend, aFechaVisible } from "./api/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "home" | "detail" | "select-pro" | "confirm" | "confirmed" | "account-type" | "register-client" | "register-provider" | "login" | "client-dashboard" | "my-bookings" | "history" | "provider-dashboard";
type DashTab = "home" | "dashboard" | "my-bookings" | "history" | "profile";
type ProviderTab = "dashboard" | "bookings" | "professionals" | "services" | "history" | "profile";

interface PreSelected {
  service: string;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "9:00 a.m."
}
type CategoryType = "" | "Salud" | "Belleza" | "Bienestar" | "Educación" | "Deporte" | "Mascotas";

interface Business {
  id: number;
  name: string;
  category: CategoryType;
  service: string;
  city: string;
  department?: string;  // departamento del proveedor (viene del backend)
  availability?: string;
  image: string;
  description: string;
  address: string;
  professionals: Professional[];
  gallery: string[];
  nit?: number;          // NIT del proveedor
  precio?: number;       // precio de la oferta
  duracion?: number | null; // minutos
  ofertas?: Business[];  // todas las ofertas (servicios) de la misma empresa; la tarjeta del inicio es UNA por empresa
}

interface Professional {
  id?: string;
  name: string;
  role: string;
  avatar: string;
  slots: string[];
}

interface AvailabilityBlock {
  id: string;
  profId: string;
  day: number;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  type: "available" | "booked" | "blocked";
  label?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const BUSINESSES: Business[] = [
  {
    id: 1,
    name: "Clínica Salud Total",
    category: "Salud",
    service: "Fisioterapia",
    city: "Bogotá",
    availability: "",
    image: clinicaSaludImage,
    description: "Clínica integral con más de 15 años de experiencia en atención primaria, medicina general y especialidades. Contamos con equipos de última generación y un equipo médico altamente calificado comprometido con tu bienestar.",
    address: "Cra. 7 #45-32, Chapinero, Bogotá",
    professionals: [
      { name: "Dra. Laura Martínez", role: "Medicina General", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "10:30 a.m.", "3:00 p.m.", "5:00 p.m."] },
      { name: "Dr. Andrés Ruiz", role: "Cardiología", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format", slots: ["8:00 a.m.", "11:00 a.m.", "4:30 p.m."] },
      { name: "Dra. Patricia Soto", role: "Pediatría", avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "11:30 a.m.", "2:30 p.m."] },
      { name: "Dr. Ricardo Blanco", role: "Urgencias", avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&auto=format", slots: ["7:00 a.m.", "1:00 p.m.", "7:00 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1580281658223-9b93f18ae9ae?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 2,
    name: "Studio Élite Hair",
    category: "Belleza",
    service: "Corte de cabello",
    city: "Medellín",
    availability: "",
    image: studioEliteImage,
    description: "Studio premium de belleza capilar con estilistas certificados en las mejores academias de Europa. Especializados en colorimetría, tratamientos capilares y cortes de vanguardia.",
    address: "El Poblado, Calle 10 #43-52, Medellín",
    professionals: [
      { name: "Carolina Vélez", role: "Estilista Senior", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "12:00 p.m.", "3:30 p.m."] },
      { name: "Miguel Torres", role: "Colorista", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:30 a.m.", "4:00 p.m."] },
      { name: "Sebastián Leal", role: "Barbero", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", slots: ["8:00 a.m.", "10:30 a.m.", "2:00 p.m.", "5:30 p.m."] },
      { name: "Valeria Campos", role: "Manicurista", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "12:30 p.m.", "3:00 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 3,
    name: "PowerFit Centro Deportivo",
    category: "Deporte",
    service: "Entrenamiento personal",
    city: "Cali",
    availability: "",
    image: powerfitImage,
    description: "Centro deportivo de alto rendimiento con instalaciones de clase mundial: piscina olímpica, salas de musculación, canchas de squash y programas de entrenamiento personalizado.",
    address: "Av. Roosevelt #24-56, Cali",
    professionals: [
      { name: "Juan Ospina", role: "Entrenador Personal", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&auto=format", slots: ["6:00 a.m.", "8:00 a.m.", "5:00 p.m.", "6:00 p.m."] },
      { name: "Sofía Reyes", role: "Instructora de Yoga", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format", slots: ["7:00 a.m.", "10:00 a.m.", "7:00 p.m."] },
      { name: "Carlos Mendoza", role: "Nutricionista Deportivo", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:00 a.m.", "3:00 p.m."] },
      { name: "Andrea Peña", role: "Fisioterapeuta", avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=80&h=80&fit=crop&auto=format", slots: ["8:30 a.m.", "12:00 p.m.", "4:30 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 4,
    name: "Clínica Veterinaria Huellitas",
    category: "Mascotas",
    service: "Consulta veterinaria",
    city: "Bogotá",
    availability: "",
    image: veterinariaHuellitasImage,
    description: "Clínica veterinaria integral para el cuidado completo de tus mascotas. Servicios de medicina preventiva, cirugía, odontología veterinaria, grooming y urgencias las 24 horas.",
    address: "Calle 127 #13-25, Usaquén, Bogotá",
    professionals: [
      { name: "Dra. Valentina Cruz", role: "Medicina Veterinaria", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:00 a.m.", "2:00 p.m.", "4:30 p.m."] },
      { name: "Dr. Esteban Parra", role: "Cirugía Veterinaria", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format", slots: ["8:00 a.m.", "10:00 a.m.", "1:00 p.m."] },
      { name: "Lina Herrera", role: "Grooming & Estética", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "12:00 p.m.", "3:30 p.m."] },
      { name: "Dr. Mateo Giraldo", role: "Odontología Veterinaria", avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "2:30 p.m.", "5:00 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581888227599-779811939961?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 5,
    name: "Salón Belle & Co.",
    category: "Belleza",
    service: "Manicure/Pedicure",
    city: "Barranquilla",
    availability: "",
    image: salonBelleImage,
    description: "Salón de belleza integral con los mejores tratamientos faciales, manicure y pedicure spa, depilación láser y servicios de maquillaje profesional para toda ocasión.",
    address: "Calle 72 #54-20, Prado, Barranquilla",
    professionals: [
      { name: "Isabella Gómez", role: "Esteticista Facial", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "12:30 p.m.", "3:00 p.m."] },
      { name: "Camila Díaz", role: "Maquilladora Profesional", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "11:00 a.m.", "5:00 p.m."] },
      { name: "Marcela Rojas", role: "Manicure & Pedicure", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "1:00 p.m.", "4:00 p.m."] },
      { name: "Juliana Pinto", role: "Depilación Láser", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format", slots: ["10:30 a.m.", "2:00 p.m.", "6:00 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 6,
    name: "ConsultMed Especialidades",
    category: "Salud",
    service: "Dermatología",
    city: "Medellín",
    availability: "",
    image: consultmedImage,
    description: "Consultorio médico especializado con atención en dermatología, nutrición, psicología clínica y medicina estética. Ambiente moderno y atención personalizada.",
    address: "Cra. 43A #14-109, El Poblado, Medellín",
    professionals: [
      { name: "Dr. Felipe Moreno", role: "Dermatología", avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&h=80&fit=crop&auto=format", slots: ["8:30 a.m.", "10:00 a.m.", "2:00 p.m."] },
      { name: "Dra. Natalia Ríos", role: "Nutrición Clínica", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:30 a.m.", "4:00 p.m."] },
      { name: "Dra. Marcela Duarte", role: "Psicología Clínica", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "12:00 p.m.", "3:30 p.m.", "5:30 p.m."] },
      { name: "Dr. Simón Vargas", role: "Medicina Estética", avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "1:30 p.m.", "4:30 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 7,
    name: "Bienestar Animal Vet",
    category: "Mascotas",
    service: "Vacunación",
    city: "Cali",
    availability: "",
    image: bienestarAnimalImage,
    description: "Centro veterinario con enfoque en medicina integrativa para mascotas. Ofrecemos consultas de bienestar, vacunación, ecografías y rehabilitación física para animales.",
    address: "Calle 5 #38-12, Granada, Cali",
    professionals: [
      { name: "Dra. Sara Quintero", role: "Medicina Interna", avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=80&h=80&fit=crop&auto=format", slots: ["8:00 a.m.", "10:30 a.m.", "2:00 p.m."] },
      { name: "Dr. Tomás Aguilar", role: "Rehabilitación", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "12:00 p.m.", "4:00 p.m."] },
      { name: "Dra. Paula Morales", role: "Dermatología Veterinaria", avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "1:00 p.m.", "5:00 p.m."] },
      { name: "Dr. Iván Castro", role: "Imágenes Diagnósticas", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "11:30 a.m.", "3:30 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1581888227599-779811939961?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 8,
    name: "Forma & Vida Gym",
    category: "Deporte",
    service: "Clases de yoga",
    city: "Bogotá",
    availability: "",
    image: formaVidaImage,
    description: "Gimnasio boutique especializado en entrenamiento funcional, crossfit y clases grupales de alta intensidad. Equipamiento de última generación y ambiente motivador.",
    address: "Av. 19 #108-60, Suba, Bogotá",
    professionals: [
      { name: "Diego Ramírez", role: "Entrenador Funcional", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&auto=format", slots: ["6:00 a.m.", "8:00 a.m.", "6:00 p.m."] },
      { name: "Luisa Cardona", role: "Instructora Crossfit", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&auto=format", slots: ["7:00 a.m.", "5:00 p.m.", "7:00 p.m."] },
      { name: "Rafael Suárez", role: "Nutricionista Deportivo", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:00 a.m.", "3:00 p.m."] },
      { name: "Mónica Arias", role: "Fisioterapeuta Deportiva", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "1:00 p.m.", "4:30 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 9,
    name: "Corte & Estilo Barbershop",
    category: "Belleza",
    service: "Coloración",
    city: "Cartagena",
    availability: "",
    image: corteEstiloImage,
    description: "Barbería premium con ambiente retro y servicios de corte clásico, afeitado con navaja, tratamientos capilares masculinos y barba. Cada cita es una experiencia.",
    address: "Calle del Arsenal #8-37, Getsemaní, Cartagena",
    professionals: [
      { name: "Rodrigo Peña", role: "Barbero Senior", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:00 a.m.", "2:00 p.m.", "4:00 p.m."] },
      { name: "Nicolás Bermúdez", role: "Colorista Capilar", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "12:30 p.m.", "3:30 p.m."] },
      { name: "Camilo Fuentes", role: "Estilista & Afeitado", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format", slots: ["8:30 a.m.", "10:30 a.m.", "5:00 p.m."] },
      { name: "Jorge Ibáñez", role: "Tratamientos Capilares", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "1:30 p.m.", "4:30 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 10,
    name: "MediPrime Clínica",
    category: "Salud",
    service: "Psicología clínica",
    city: "Barranquilla",
    availability: "",
    image: mediprimeImage,
    description: "Clínica de mediana complejidad con servicios ambulatorios, laboratorio clínico, radiología y consultas especializadas. Atención centrada en el paciente con tecnología de punta.",
    address: "Cra. 54 #68-30, Riomar, Barranquilla",
    professionals: [
      { name: "Dr. Alejandro Torres", role: "Medicina Interna", avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&auto=format", slots: ["8:00 a.m.", "10:00 a.m.", "2:00 p.m."] },
      { name: "Dra. Claudia Vergara", role: "Ginecología", avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:30 a.m.", "3:30 p.m."] },
      { name: "Dr. Mauricio Peña", role: "Ortopedia", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format", slots: ["7:30 a.m.", "10:30 a.m.", "4:00 p.m."] },
      { name: "Dra. Sandra Ospina", role: "Neurología", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "12:00 p.m.", "5:00 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1580281658223-9b93f18ae9ae?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 11,
    name: "Glow Studio Spa",
    category: "Belleza",
    service: "Maquillaje",
    city: "Bogotá",
    availability: "",
    image: glowStudioImage,
    description: "Spa urbano de lujo con tratamientos de última generación: hidrafacial, radiofrecuencia, masajes relajantes y rituales de belleza personalizados para el cuidado integral de tu piel.",
    address: "Calle 93 #11-27, Chicó, Bogotá",
    professionals: [
      { name: "Ana Lucía Nieto", role: "Esteticista Integral", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "12:00 p.m.", "4:00 p.m."] },
      { name: "Stephanie Mora", role: "Masajista Terapéutica", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:00 a.m.", "3:00 p.m.", "6:00 p.m."] },
      { name: "Daniela Rincón", role: "Hidrafacial & Radiofrecuencia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format", slots: ["10:30 a.m.", "1:30 p.m.", "5:30 p.m."] },
      { name: "Laura Espinosa", role: "Maquillaje & Imagen", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "12:30 p.m.", "4:30 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=250&fit=crop&auto=format",
    ],
  },
  {
    id: 12,
    name: "HealthFirst Consultorios",
    category: "Salud",
    service: "Nutrición",
    city: "Cartagena",
    availability: "",
    image: healthfirstImage,
    description: "Red de consultorios médicos con enfoque preventivo y de bienestar. Atención personalizada en psicología, nutrición, medicina del deporte y salud ocupacional.",
    address: "Av. Blas de Lezo #30-50, Bocagrande, Cartagena",
    professionals: [
      { name: "Dr. Gabriel Ayala", role: "Medicina del Deporte", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&auto=format", slots: ["8:00 a.m.", "10:00 a.m.", "2:00 p.m."] },
      { name: "Dra. Rebeca Solano", role: "Psicología Clínica", avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=80&h=80&fit=crop&auto=format", slots: ["9:00 a.m.", "11:00 a.m.", "4:00 p.m.", "6:00 p.m."] },
      { name: "Lic. Tomás Heredia", role: "Nutrición Funcional", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", slots: ["10:00 a.m.", "12:00 p.m.", "3:00 p.m."] },
      { name: "Dra. Valeria Lozano", role: "Salud Ocupacional", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format", slots: ["9:30 a.m.", "1:00 p.m.", "5:00 p.m."] },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=250&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=250&fit=crop&auto=format",
    ],
  },
];

const COLOMBIA_GEO: Record<string, string[]> = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellín", "Bello", "Envigado", "Itagüí", "Rionegro", "Sabaneta", "Apartadó"],
  "Arauca": ["Arauca", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Baranoa"],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar", "Mompox"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"],
  "Caldas": ["Manizales", "Villamaría", "La Dorada", "Chinchiná", "Riosucio"],
  "Caquetá": ["Florencia", "San Vicente del Caguán", "Belén de los Andaquíes"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva", "Tauramena"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Palmira"],
  "Cesar": ["Valledupar", "Aguachica", "Codazzi", "El Copey"],
  "Chocó": ["Quibdó", "Istmina", "Tumaco"],
  "Córdoba": ["Montería", "Lorica", "Cereté", "Sahagún", "Montelíbano"],
  "Cundinamarca": ["Bogotá D.C.", "Soacha", "Facatativá", "Zipaquirá", "Chía", "Mosquera", "Fusagasugá"],
  "Guainía": ["Inírida"],
  "Guajira": ["Riohacha", "Maicao", "Uribia", "Manaure"],
  "Guaviare": ["San José del Guaviare", "El Retorno"],
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Fundación", "Aracataca"],
  "Meta": ["Villavicencio", "Acacías", "Granada", "Puerto López"],
  "Nariño": ["Pasto", "Tumaco", "Ipiales", "Túquerres"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios"],
  "Putumayo": ["Mocoa", "Puerto Asís", "Orito"],
  "Quindío": ["Armenia", "Calarcá", "Montenegro", "Quimbaya"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"],
  "Sucre": ["Sincelejo", "Corozal", "San Marcos", "Sampués"],
  "Tolima": ["Ibagué", "Espinal", "Honda", "Melgar", "Chaparral"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga", "Jamundí"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño"],
};

const DEPARTMENTS = Object.keys(COLOMBIA_GEO).sort();

// Maps the business.city value to its department for filtering
const CITY_TO_DEPARTMENT: Record<string, string> = {
  "Bogotá": "Cundinamarca",
  "Medellín": "Antioquia",
  "Cali": "Valle del Cauca",
  "Barranquilla": "Atlántico",
  "Cartagena": "Bolívar",
  "Bucaramanga": "Santander",
};

// Catálogo de la plataforma: categoría -> servicios. Los nombres deben ser IGUALES (letra por letra) a los de la
// tabla "servicio" del backend (cargar_catalogo_servicios.sql): la categoría de cada oferta se deduce por el nombre.
// Es la única lista de categorías: la usan el registro de proveedor, los filtros del inicio y las tarjetas.
const CATEGORY_SERVICES: Record<string, string[]> = {
  "Salud": ["Medicina general", "Dermatología", "Nutrición", "Psicología clínica", "Fisioterapia", "Medicina estética", "Odontología general", "Optometría"],
  "Belleza": ["Corte de cabello", "Corte y barba", "Coloración", "Keratina", "Manicure/Pedicure", "Manicure semipermanente", "Uñas press-on", "Maquillaje", "Depilación", "Diseño de cejas"],
  "Bienestar": ["Masaje relajante", "Masaje descontracturante", "Limpieza facial", "Reflexología", "Spa de pies", "Meditación guiada"],
  "Educación": ["Clases de inglés", "Clases de francés", "Tutoría de matemáticas", "Refuerzo escolar", "Preparación para el ICFES", "Clases de guitarra", "Clases de piano"],
  "Deporte": ["Entrenamiento personal", "Clases de yoga", "Pilates", "Fisioterapia deportiva", "Clases de natación", "Clases de baile"],
  "Mascotas": ["Consulta veterinaria", "Consulta veterinaria especializada", "Vacunación", "Desparasitación", "Baño y peluquería canina", "Corte de uñas para mascotas", "Adiestramiento canino"],
};

const CATEGORIES = Object.keys(CATEGORY_SERVICES) as CategoryType[];

const SERVICE_TO_CATEGORY: Record<string, CategoryType> = Object.fromEntries(
  Object.entries(CATEGORY_SERVICES).flatMap(([cat, svcs]) => svcs.map((s) => [s, cat as CategoryType]))
);
const TIME_SLOTS = ["7:00 a.m.", "7:30 a.m.", "8:00 a.m.", "8:30 a.m.", "9:00 a.m.", "9:30 a.m.", "10:00 a.m.", "10:30 a.m.", "11:00 a.m.", "11:30 a.m.", "12:00 p.m.", "12:30 p.m.", "1:00 p.m.", "1:30 p.m.", "2:00 p.m.", "2:30 p.m.", "3:00 p.m.", "3:30 p.m.", "4:00 p.m.", "4:30 p.m.", "5:00 p.m.", "5:30 p.m.", "6:00 p.m.", "6:30 p.m.", "7:00 p.m.", "7:30 p.m.", "8:00 p.m."];

// ─── Utility components ────────────────────────────────────────────────────────

const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  Salud: clinicaSaludImage,
  Belleza: studioEliteImage,
  Deporte: powerfitImage,
  Mascotas: veterinariaHuellitasImage,
  Bienestar: glowStudioImage,
  // Educación no tiene foto de respaldo: se muestra el ícono (BusinessImage), nunca la foto de otra categoría.
};

// Compara nombres de lugares sin tildes, sin mayúsculas y sin "D.C." ("Bogotá D.C." del filtro = "Bogotá" del backend)
function mismoLugar(a: string, b: string): boolean {
  const normalizar = (texto: string) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s*d\.?\s*c\.?$/, "");
  return normalizar(a) === normalizar(b);
}

function ofertaANegocio(o: OfertaDetalle): Business {
  const servicio = o.servicio.nombre;
  const categoria = (SERVICE_TO_CATEGORY[servicio] ?? "") as CategoryType;
  return {
    id: o.id,
    name: o.proveedor.razonSocial,
    category: categoria,
    service: servicio,
    city: o.proveedor.municipio?.nombre ?? "",
    department: o.proveedor.municipio?.departamento?.nombre ?? "",
    availability: "",
    image: o.proveedor.logoUrl ? API_BASE_URL + o.proveedor.logoUrl : (CATEGORY_IMAGE_FALLBACKS[categoria] ?? ""),
    description: o.descripcion ?? o.proveedor.descripcion ?? o.servicio.descripcion ?? "",
    address: o.proveedor.direccion ?? "",
    professionals: [],
    gallery: [],
    nit: o.proveedor.nit,
    precio: o.precio,
    duracion: o.duracion ?? o.servicio.duracion,
  };
}

/**
 * El backend devuelve OFERTAS (un servicio publicado por un proveedor). En el inicio se muestra UNA tarjeta por
 * empresa: se agrupan por NIT conservando el orden. La tarjeta usa la primera oferta del grupo y guarda todas en
 * "ofertas" para que el detalle deje elegir el servicio.
 */
function agruparPorEmpresa(ofertas: Business[]): Business[] {
  const grupos = new Map<string, Business[]>();
  ofertas.forEach((o) => {
    const clave = o.nit != null ? String(o.nit) : `oferta-${o.id}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), o]);
  });
  return [...grupos.values()].map((grupo) => ({ ...grupo[0], ofertas: grupo }));
}

function BusinessImage({
  business,
  className,
  loading = "lazy",
}: {
  business: Business;
  className: string;
  loading?: "eager" | "lazy";
}) {
  const fallback = CATEGORY_IMAGE_FALLBACKS[business.category] ?? "";
  const [source, setSource] = useState(business.image || fallback);
  const [showPlaceholder, setShowPlaceholder] = useState(!(business.image || fallback));

  useEffect(() => {
    setSource(business.image || fallback);
    setShowPlaceholder(!(business.image || fallback));
  }, [business.image, fallback]);

  if (showPlaceholder) {
    return (
      <div role="img" aria-label={business.name} className={`${className} flex items-center justify-center bg-teal-50`}>
        <svg className="h-10 w-10 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14.8M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={source}
      alt={business.name}
      loading={loading}
      decoding="async"
      onError={() => {
        if (source !== fallback) setSource(fallback);
        else setShowPlaceholder(true);
      }}
      className={className}
    />
  );
}

function CategoryBadge({ category, service }: { category: string; service?: string }) {
  const colors: Record<string, string> = {
    "Belleza": "bg-pink-50 text-pink-700 border-pink-100",
    "Salud": "bg-blue-50 text-blue-700 border-blue-100",
    "Deporte": "bg-orange-50 text-orange-700 border-orange-100",
    "Mascotas": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Bienestar": "bg-violet-50 text-violet-700 border-violet-100",
    "Educación": "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[category] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
      {category}{service ? <span className="opacity-60">· {service}</span> : null}
    </span>
  );
}

// ─── BusinessCard ──────────────────────────────────────────────────────────────

function BusinessCard({ business, onSelect }: { business: Business; onSelect: () => void }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group flex flex-col">
      <div className="relative overflow-hidden h-44 bg-slate-100">
        <BusinessImage business={business} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-700 text-base text-slate-900 mb-2 leading-tight" style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700 }}>{business.name}</h3>
        <div className="mb-3 space-y-1.5">
          <CategoryBadge category={business.category} service={business.ofertas && business.ofertas.length > 1 ? `${business.ofertas.length} servicios` : undefined} />
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {business.city}
          </p>
        </div>
        <button
          onClick={onSelect}
          className="w-full py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 active:bg-teal-800 transition-colors mt-auto"
        >
          Explorar
        </button>
      </div>
    </div>
  );
}

// ─── Combobox ──────────────────────────────────────────────────────────────────

function Combobox({
  label,
  value,
  placeholder,
  options,
  disabled,
  disabledPlaceholder,
  onChange,
  inBar,
  subtitleMap,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  disabledPlaceholder?: string;
  onChange: (v: string) => void;
  inBar?: boolean;
  subtitleMap?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const displayValue = value || (disabled ? (disabledPlaceholder ?? "—") : placeholder);
  const isPlaceholder = !value;

  const handleSelect = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  if (inBar) {
    return (
      <div ref={ref} className="relative h-full flex flex-col justify-center">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={(e) => e.key === "Enter" && !disabled && setOpen((o) => !o)}
          className={`w-full text-left flex items-center justify-between gap-1 select-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className={`text-sm font-medium truncate ${isPlaceholder || disabled ? "text-slate-400" : "text-slate-800"}`}>
            {displayValue}
          </span>
          {value ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
              className="shrink-0 w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg className="w-2.5 h-2.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </span>
          ) : (
            <svg className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""} ${disabled ? "text-slate-200" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          )}
        </div>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-50">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2.5 text-xs text-slate-400 text-center">No se encontraron resultados</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-teal-50 hover:text-teal-700 ${opt === value ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-700"}`}
                  >
                    {subtitleMap?.[opt] ? (
                      <span className="flex flex-col gap-0">
                        <span>{opt}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{subtitleMap[opt]}</span>
                      </span>
                    ) : opt}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile / standalone variant
  return (
    <div ref={ref} className="relative">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Enter" && !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors select-none
          ${disabled ? "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50" : open ? "border-teal-400 cursor-pointer" : "border-slate-200 text-slate-800 cursor-pointer"}
          ${isPlaceholder && !disabled ? "text-slate-400" : ""}`}
      >
        <span className="truncate">{displayValue}</span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
            className="shrink-0 w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors ml-2 cursor-pointer"
          >
            <svg className="w-2.5 h-2.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </span>
        ) : (
          <svg className={`w-4 h-4 shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""} ${disabled ? "text-slate-200" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-50">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-slate-400 text-center">No se encontraron resultados</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-teal-50 hover:text-teal-700 ${opt === value ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-700"}`}
                >
                  {subtitleMap?.[opt] ? (
                    <span className="flex flex-col gap-0">
                      <span>{opt}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{subtitleMap[opt]}</span>
                    </span>
                  ) : opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FilterBar ─────────────────────────────────────────────────────────────────

interface Filters {
  category: CategoryType;
  service: string;
  department: string;
  municipality: string;
  date: string;
  time: string;
}

function FilterBar({
  filters,
  onChange,
  showMobilePanel,
  setShowMobilePanel,
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  showMobilePanel: boolean;
  setShowMobilePanel: (v: boolean) => void;
}) {
  const activeCount = [filters.category, filters.service, filters.department, filters.municipality, filters.date, filters.time].filter(Boolean).length;
  const municipios = filters.department ? COLOMBIA_GEO[filters.department] ?? [] : [];

  const handleDeptChange = (dept: string) => {
    onChange({ department: dept, municipality: "" });
  };

  // Services available given the selected category
  const availableServices = filters.category
    ? CATEGORY_SERVICES[filters.category] ?? []
    : Object.values(CATEGORY_SERVICES).flat();

  // Subtitle map for service items: only shown when no category is selected
  const serviceSubtitleMap: Record<string, string> | undefined = filters.category
    ? undefined
    : SERVICE_TO_CATEGORY;

  const handleCategoryChange = (cat: string) => {
    const newCat = cat as CategoryType;
    const catServices = newCat ? CATEGORY_SERVICES[newCat] : [];
    const keepService = newCat && catServices?.includes(filters.service) ? filters.service : "";
    onChange({ category: newCat, service: keepService });
  };

  const handleServiceChange = (svc: string) => {
    const autoCategory = svc ? SERVICE_TO_CATEGORY[svc] ?? "" : "";
    if (autoCategory && !filters.category) {
      onChange({ service: svc, category: autoCategory });
    } else {
      onChange({ service: svc });
    }
  };

  return (
    <>
      {/* ── Desktop filter bar ── */}
      <div className="hidden md:flex bg-white rounded-2xl shadow-md border border-slate-100 overflow-visible items-stretch divide-x divide-slate-100">

        {/* Categoría + Servicio grouped block */}
        <div className="flex-[1.8] min-w-0 flex divide-x divide-slate-100">
          <div className="flex-1 min-w-0 px-4 py-3">
            <label className="block text-[10px] font-semibold text-teal-500 mb-1 uppercase tracking-wide">Categoría</label>
            <Combobox
              inBar
              label="Categoría"
              value={filters.category}
              placeholder="Todas las categorías"
              options={CATEGORIES}
              onChange={handleCategoryChange}
            />
          </div>
          <div className="flex-1 min-w-0 px-4 py-3">
            <label className="block text-[10px] font-semibold text-teal-500 mb-1 uppercase tracking-wide">Servicio</label>
            <Combobox
              inBar
              label="Servicio"
              value={filters.service}
              placeholder="Todos los servicios"
              options={availableServices}
              onChange={handleServiceChange}
              subtitleMap={serviceSubtitleMap}
            />
          </div>
        </div>

        {/* Lugar — Departamento + Municipio grouped */}
        <div className="flex-[1.8] min-w-0 flex divide-x divide-slate-100">
          <div className="flex-1 min-w-0 px-4 py-3">
            <label className="block text-[10px] font-semibold text-teal-500 mb-1 uppercase tracking-wide">Departamento</label>
            <Combobox
              inBar
              label="Departamento"
              value={filters.department}
              placeholder="Todos"
              options={DEPARTMENTS}
              onChange={handleDeptChange}
            />
          </div>
          <div className="flex-1 min-w-0 px-4 py-3">
            <label className="block text-[10px] font-semibold text-teal-500 mb-1 uppercase tracking-wide">Municipio</label>
            <Combobox
              inBar
              label="Municipio"
              value={filters.municipality}
              placeholder="Todos"
              options={municipios}
              disabled={!filters.department}
              disabledPlaceholder="Elige departamento"
              onChange={(v) => onChange({ municipality: v })}
            />
          </div>
        </div>

        {/* Fecha */}
        <div className="flex-1 min-w-0 px-4 py-3 relative">
          <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Fecha</label>
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={filters.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => onChange({ date: e.target.value })}
              className="w-full text-sm font-medium text-slate-800 bg-transparent border-none outline-none cursor-pointer"
              style={{ colorScheme: "light" }}
            />
            {filters.date && (
              <button onClick={() => onChange({ date: "" })} className="shrink-0 w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-2.5 h-2.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Hora */}
        <div className="flex-1 min-w-0 px-4 py-3">
          <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Hora</label>
          <Combobox
            inBar
            label="Hora"
            value={filters.time}
            placeholder="Cualquier hora"
            options={TIME_SLOTS}
            onChange={(v) => onChange({ time: v })}
          />
        </div>

      </div>

      {/* ── Mobile trigger ── */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobilePanel(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-100 text-sm font-medium text-slate-700"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtros
            {activeCount > 0 && (
              <span className="bg-teal-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>
            )}
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {/* ── Mobile panel ── */}
      {showMobilePanel && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobilePanel(false)} />
          <div className="relative w-full bg-white rounded-t-2xl p-6 space-y-4 z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Filtros</h3>
              <button onClick={() => setShowMobilePanel(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Categoría + Servicio — bloque agrupado */}
            <div className="rounded-xl border border-slate-200 overflow-visible divide-y divide-slate-100">
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Tipo de servicio</span>
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Categoría</label>
                <Combobox label="Categoría" value={filters.category} placeholder="Todas las categorías" options={CATEGORIES} onChange={handleCategoryChange} />
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Servicio</label>
                <Combobox label="Servicio" value={filters.service} placeholder="Todos los servicios" options={availableServices} onChange={handleServiceChange} subtitleMap={serviceSubtitleMap} />
              </div>
            </div>

            {/* Lugar — dos campos apilados con separador visual */}
            <div className="rounded-xl border border-slate-200 overflow-visible divide-y divide-slate-100">
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Lugar</span>
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Departamento</label>
                <Combobox label="Departamento" value={filters.department} placeholder="Selecciona departamento" options={DEPARTMENTS} onChange={handleDeptChange} />
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Municipio</label>
                <Combobox
                  label="Municipio"
                  value={filters.municipality}
                  placeholder="Selecciona municipio"
                  options={municipios}
                  disabled={!filters.department}
                  disabledPlaceholder="Selecciona primero un departamento"
                  onChange={(v) => onChange({ municipality: v })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Fecha</label>
              <input type="date" value={filters.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => onChange({ date: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-teal-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Hora</label>
              <Combobox label="Hora" value={filters.time} placeholder="Cualquier hora" options={TIME_SLOTS} onChange={(v) => onChange({ time: v })} />
            </div>

            <button onClick={() => setShowMobilePanel(false)} className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl text-sm">
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Active filter chips ───────────────────────────────────────────────────────

function ActiveFilterChips({ filters, onChange }: { filters: Filters; onChange: (f: Partial<Filters>) => void }) {
  const chips = [
    filters.category && { label: filters.category, clear: () => onChange({ category: "", service: filters.service && SERVICE_TO_CATEGORY[filters.service] !== filters.category ? filters.service : "" }) },
    filters.service && { label: filters.service, clear: () => onChange({ service: "" }) },
    filters.department && { label: filters.department, clear: () => onChange({ department: "", municipality: "" }) },
    filters.municipality && { label: filters.municipality, clear: () => onChange({ municipality: "" }) },
    filters.date && { label: new Date(filters.date + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" }), clear: () => onChange({ date: "" }) },
    filters.time && { label: filters.time, clear: () => onChange({ time: "" }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  if (!chips.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 font-medium">Filtros activos:</span>
      {chips.map((c) => (
        <span key={c.label} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-semibold">
          {c.label}
          <button onClick={c.clear} className="ml-0.5 hover:text-teal-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>No encontramos empresas disponibles</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">No hay resultados con los filtros actuales. Intenta modificar tu búsqueda para ver más opciones.</p>
      <button
        onClick={onReset}
        className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
      >
        Modificar filtros
      </button>
    </div>
  );
}

// ─── NameSearchBar ─────────────────────────────────────────────────────────────

function NameSearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar empresa por nombre..."
        className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
        >
          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Home Screen ───────────────────────────────────────────────────────────────

interface HomeSnapshot { filters: Filters; nameQuery: string; }

function HomeScreen({
  onSelectBusiness,
  initialSnapshot,
  onLogin,
  onRegister,
  clientName,
  onDashboard,
  onLogout,
}: {
  onSelectBusiness: (b: Business, pre: PreSelected | null, snapshot: HomeSnapshot) => void;
  initialSnapshot?: HomeSnapshot;
  onLogin?: () => void;
  onRegister?: () => void;
  clientName?: string;
  onDashboard?: (tab?: DashTab) => void;
  onLogout?: () => void;
}) {
  const [filters, setFilters] = useState<Filters>(
    initialSnapshot?.filters ?? { category: "", service: "", department: "", municipality: "", date: "", time: "" }
  );
  const [nameQuery, setNameQuery] = useState(initialSnapshot?.nameQuery ?? "");
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [pendingBusiness, setPendingBusiness] = useState<{ b: Business; pre: PreSelected | null } | null>(null);

  const updateFilters = (partial: Partial<Filters>) => setFilters((f) => ({ ...f, ...partial }));
  const resetFilters = () => { setFilters({ category: "", service: "", department: "", municipality: "", date: "", time: "" }); setNameQuery(""); };

  const [negocios, setNegocios] = useState<Business[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    let vigente = true;
    const params = new URLSearchParams();
    if (filters.date) params.set("fecha", filters.date);
    if (filters.date && filters.time) params.set("hora", aHoraBackend(filters.time));
    const consulta = params.toString();
    setCargando(true);
    pedir<OfertaDetalle[]>(ENDPOINTS.buscar + (consulta ? `?${consulta}` : ""))
      .then((ofertas) => { if (vigente) { setNegocios(ofertas.map(ofertaANegocio)); setErrorCarga(""); } })
      .catch((e) => { if (vigente) setErrorCarga(e instanceof ErrorApi ? e.mensajes[0] : "No pudimos cargar las empresas."); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [filters.date, filters.time]);

  const ofertasFiltradas = negocios.filter((b) => {
    if (filters.category && b.category !== filters.category) return false;
    if (filters.service && b.service !== filters.service) return false;
    if (filters.municipality && !mismoLugar(b.city, filters.municipality)) return false;
    else if (!filters.municipality && filters.department) {
      const dept = b.department || CITY_TO_DEPARTMENT[b.city] || "";
      if (!mismoLugar(dept, filters.department)) return false;
    }
    if (nameQuery.trim() && !b.name.toLowerCase().includes(nameQuery.trim().toLowerCase())) return false;
    return true;
  });
  const filtered = agruparPorEmpresa(ofertasFiltradas);

  const allActive = (filters.category || filters.service) && (filters.department || filters.municipality) && filters.date && filters.time;
  const displayed = allActive ? filtered.slice(0, 3) : filtered;

  const activeCount = [filters.category, filters.service, filters.department, filters.municipality, filters.date, filters.time].filter(Boolean).length;
  const hasSearch = nameQuery.trim().length > 0;
  const sectionTitle = !activeCount && !hasSearch
    ? "Empresas populares cerca de ti"
    : hasSearch && !activeCount
    ? `${displayed.length} resultado${displayed.length !== 1 ? "s" : ""} para "${nameQuery}"`
    : activeCount === 1 && filters.category && !filters.service && !hasSearch
    ? `${filtered.length} empresa${filtered.length !== 1 ? "s" : ""} en ${filters.category}`
    : activeCount === 1 && filters.service && !hasSearch
    ? `${filtered.length} empresa${filtered.length !== 1 ? "s" : ""} con ${filters.service}`
    : `${displayed.length} resultado${displayed.length !== 1 ? "s" : ""} encontrado${displayed.length !== 1 ? "s" : ""}`;

  const handleCardSelect = (tarjeta: Business) => {
    // Abre la oferta que coincide con los filtros, pero el detalle recibe TODAS las ofertas de la empresa
    const todas = negocios.filter((o) => o.nit === tarjeta.nit);
    const b: Business = { ...tarjeta, ofertas: todas.length ? todas : tarjeta.ofertas };
    const pre = (filters.date && filters.time)
      ? { service: filters.service, date: filters.date, time: filters.time }
      : null;
    if (!clientName && !guestMode) {
      setPendingBusiness({ b, pre });
      setShowLoginGate(true);
      return;
    }
    onSelectBusiness(b, pre, { filters, nameQuery });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header: guest vs. authenticated ── */}
      {clientName ? (
        <DashHeader
          clientName={clientName}
          activeTab="dashboard"
          onTab={(t) => { if (t !== "dashboard") onDashboard?.(t); }}
          onExplore={() => {}}
          onLogout={onLogout ?? (() => {})}
          onHome={onDashboard}
        />
      ) : (
        <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <svg className="text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}>
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>AgendaYa</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onLogin} className="text-sm font-medium text-slate-600 hover:text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors hidden sm:block">
                Iniciar sesión
              </button>
              <button onClick={onRegister} className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-1.5 rounded-xl transition-colors shadow-sm">
                Registrarse
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Login gate modal ── */}
      {showLoginGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLoginGate(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-7 z-10">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Inicia sesión para agendar
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Para reservar una cita necesitas tener una cuenta. Es rápido y gratuito.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => { setShowLoginGate(false); onLogin?.(); }}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { setShowLoginGate(false); onRegister?.(); }}
                className="w-full py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
              >
                Crear cuenta gratis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-6xl mx-auto text-center relative">
          <h1 className="font-display text-3xl sm:text-5xl text-white leading-tight" style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800 }}>
            Reserva citas con los mejores negocios
          </h1>
        </div>
      </div>

      {/* Search + Filter bar floating over hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 mb-8 relative z-10 space-y-3">
        <NameSearchBar value={nameQuery} onChange={setNameQuery} />
        <FilterBar
          filters={filters}
          onChange={updateFilters}
          showMobilePanel={showMobilePanel}
          setShowMobilePanel={setShowMobilePanel}
        />
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <h2 className="font-display text-xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{sectionTitle}</h2>
            <ActiveFilterChips filters={filters} onChange={updateFilters} />
          </div>
          {activeCount > 0 && (
            <button onClick={resetFilters} className="text-sm text-slate-500 hover:text-teal-600 font-medium transition-colors hidden sm:block">
              Limpiar todo
            </button>
          )}
        </div>

        {cargando ? (
          <p className="py-10 text-center text-sm text-slate-500">Cargando empresas… (la primera vez puede tardar hasta 2 minutos)</p>
        ) : errorCarga ? (
          <p className="py-10 text-center text-sm text-red-600">{errorCarga}</p>
        ) : displayed.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((b) => (
              <BusinessCard
                key={b.id}
                business={b}
                onSelect={() => handleCardSelect(b)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MiniCalendar ──────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface ProfesionalAgenda extends Professional {
  id: string;
  slotsPorFecha: Record<string, string[]>; // "AAAA-MM-DD" → ["8:00 a.m.", ...]
}

function fechaISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Carga los bloques libres de una oferta para hoy y las 4 semanas siguientes, agrupados por profesional. */
function useAgendaOferta(ofertaId: number) {
  const [profesionales, setProfesionales] = useState<ProfesionalAgenda[]>([]);
  const [cargando, setCargando] = useState(true);
  // error = TODAS las consultas fallaron (p. ej. el backend de Render está despertando); no es lo mismo que "sin horarios"
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    const hoy = new Date();
    const fechas = Array.from({ length: 29 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      return fechaISO(d);
    });
    setCargando(true);
    setError(false);
    Promise.all(fechas.map((f) =>
      pedir<DisponibilidadDetalle[]>(`${ENDPOINTS.disponibilidad(ofertaId)}?fecha=${f}`).catch(() => null),
    ))
      .then((resultados) => {
        if (!vigente) return;
        const porDia = resultados.filter((d): d is DisponibilidadDetalle[] => d !== null);
        setError(porDia.length === 0);
        const mapa = new Map<string, ProfesionalAgenda>();
        porDia.flat().forEach((b) => {
          const id = b.profesional?.id ?? "";
          if (!mapa.has(id)) {
            mapa.set(id, {
              id,
              name: b.profesional ? `${b.profesional.nombres} ${b.profesional.apellidos}` : "Cualquier profesional",
              role: "",
              // La foto se pide al backend; si el profesional no tiene, AvatarProfesional muestra sus iniciales.
              avatar: b.profesional
                ? `${API_BASE_URL}/api/proveedores/${b.servicioProveedor.proveedor.nit}/profesionales/${b.profesional.id}/foto`
                : "",
              slots: [], slotsPorFecha: {},
            });
          }
          const p = mapa.get(id)!;
          (p.slotsPorFecha[b.fecha] ??= []).push(aEtiquetaHora(b.horaInicio));
        });
        mapa.forEach((p) => Object.values(p.slotsPorFecha).forEach((horas) =>
          horas.sort((a, b) => aHoraBackend(a).localeCompare(aHoraBackend(b)))));
        setProfesionales([...mapa.values()]);
      })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [ofertaId, intento]);
  return { profesionales, cargando, error, reintentar: () => setIntento((i) => i + 1) };
}

/** Foto del profesional; si no tiene o no carga, un círculo con sus iniciales (nunca una imagen rota). */
function AvatarProfesional({ src, nombre }: { src: string; nombre: string }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    const iniciales = nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
    return (
      <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 text-sm font-bold flex items-center justify-center shrink-0">
        {iniciales || "?"}
      </div>
    );
  }
  return <img src={src} alt={nombre} onError={() => setFallo(true)} className="w-11 h-11 rounded-full object-cover bg-slate-200 shrink-0" />;
}

function diaDisponible(pro: ProfesionalAgenda | null, anio: number, mes: number, dia: number): boolean {
  if (!pro) return false;
  const f = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  return (pro.slotsPorFecha[f] ?? []).length > 0;
}

function MiniCalendar({
  proName,
  estaDisponible,
  year,
  month,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: {
  proName: string;
  estaDisponible: (day: number) => boolean;
  year: number;
  month: number; // 0-indexed
  selectedDay: number | null;
  onSelectDay: (d: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert Sunday-first to Monday-first offset
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mb-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrevMonth}
          disabled={isCurrentMonth}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isCurrentMonth ? "text-slate-200 cursor-not-allowed" : "hover:bg-slate-100 text-slate-500"}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const available = estaDisponible(day);
          const isPast = isCurrentMonth ? day < today.getDate() : false;
          const isSelectable = available && !isPast;
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = day === selectedDay;

          return (
            <div key={idx} className="flex flex-col items-center py-0.5">
              <button
                disabled={!isSelectable}
                onClick={() => isSelectable && onSelectDay(day)}
                className={`w-8 h-8 rounded-full text-xs font-semibold transition-all relative
                  ${isSelected ? "bg-teal-600 text-white shadow-sm" :
                    isToday && isSelectable ? "ring-2 ring-teal-400 text-teal-700 hover:bg-teal-50" :
                    isSelectable ? "text-slate-700 hover:bg-slate-100" :
                    "text-slate-300 cursor-not-allowed"}`}
              >
                {day}
              </button>
              {isSelectable && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-teal-400 mt-0.5" />
              )}
              {isSelected && <div className="w-1 h-1 rounded-full bg-teal-200 mt-0.5" />}
              {!isSelectable && <div className="w-1 h-1 mt-0.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Detail Screen ─────────────────────────────────────────────────────────────

function DetailScreen({ business, onBook, onBack, onLoginRequired, onChangeOferta }: { business: Business; onBook: (pro: Professional, slot: string, date: string) => void; onBack: () => void; onLoginRequired?: () => void; onChangeOferta?: (oferta: Business) => void }) {
  const today = new Date();
  const { profesionales, cargando, error, reintentar } = useAgendaOferta(business.id);
  const [selectedPro, setSelectedPro] = useState<ProfesionalAgenda | null>(null);
  useEffect(() => {
    if (!selectedPro && profesionales.length > 0) setSelectedPro(profesionales[0]);
  }, [profesionales, selectedPro]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const handlePrevMonth = () => {
    const isAlreadyCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth();
    if (isAlreadyCurrentMonth) return;
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
    setSelectedDay(null);
    setSelectedSlot("");
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
    setSelectedDay(null);
    setSelectedSlot("");
  };
  const handleSelectDay = (d: number) => {
    setSelectedDay(d);
    setSelectedSlot("");
  };
  const handleSelectPro = (pro: ProfesionalAgenda) => {
    setSelectedPro(pro);
    setSelectedSlot("");
    setSelectedDay(today.getDate());
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
  };

  // Slots available only when day is available for this pro
  const dayHasSlots = selectedDay !== null && diaDisponible(selectedPro, calYear, calMonth, selectedDay);
  const isSelectedToday = calYear === today.getFullYear() && calMonth === today.getMonth() && selectedDay === today.getDate();

  function parseSlotMinutes(slot: string): number {
    // Parses "9:00 a.m." / "3:30 p.m." into minutes since midnight
    const match = slot.match(/(\d+):(\d+)\s*(a\.m\.|p\.m\.)/i);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toLowerCase().replace(/\./g, "");
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return h * 60 + m;
  }

  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  const fechaElegida = selectedDay !== null ? fechaISO(new Date(calYear, calMonth, selectedDay)) : "";
  const slotsDelDia = selectedPro && fechaElegida ? selectedPro.slotsPorFecha[fechaElegida] ?? [] : [];
  const availableSlots = dayHasSlots
    ? isSelectedToday
      ? slotsDelDia.filter((s) => parseSlotMinutes(s) > nowMinutes)
      : slotsDelDia
    : [];

  const variasOfertas = !!(business.ofertas && business.ofertas.length > 1 && onChangeOferta);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-display text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>AgendaYa</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Business info */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-6">
          <div className="h-56 sm:h-72 bg-slate-100 relative">
            <BusinessImage business={business} loading="eager" className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4">
              <CategoryBadge category={business.category} />
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>{business.name}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {business.address || business.city}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{business.description}</p>
            {business.ofertas && business.ofertas.length > 1 && onChangeOferta && (
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Elige el servicio</p>
                <div className="flex flex-wrap gap-2">
                  {business.ofertas.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => { if (o.id !== business.id) onChangeOferta(o); }}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${o.id === business.id ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                    >
                      <span className="block font-semibold">{o.service}</span>
                      <span className="block text-xs text-slate-500">
                        {o.precio != null ? `$${o.precio.toLocaleString("es-CO")}` : ""}{o.duracion ? ` · ${o.duracion} min` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professionals + Slots */}
        {cargando || (!error && profesionales.length > 0 && !selectedPro) ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center text-sm text-slate-500">Cargando horarios…</div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">No pudimos cargar los horarios</p>
            <p className="text-xs text-slate-500 mb-4">El servidor puede estar iniciando. Espera unos segundos y vuelve a intentar.</p>
            <button type="button" onClick={reintentar} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Reintentar</button>
          </div>
        ) : !selectedPro ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">Este servicio no tiene horarios disponibles en las próximas 4 semanas</p>
            <p className="text-xs text-slate-500 mb-4">{variasOfertas ? "Elige otro servicio arriba o vuelve más tarde." : "Vuelve más tarde o explora otras empresas."}</p>
            <button type="button" onClick={onBack} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Volver al inicio</button>
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 gap-5 items-start">
          {/* Professionals */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <h2 className="font-display font-bold text-slate-900 mb-4 shrink-0" style={{ fontFamily: "Outfit, sans-serif" }}>Profesionales</h2>
            <div className="space-y-3 overflow-y-auto max-h-80 pr-1" style={{ scrollbarWidth: "thin" }}>
              {profesionales.map((pro) => (
                <button
                  key={pro.id || pro.name}
                  onClick={() => handleSelectPro(pro)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedPro.name === pro.name ? "border-teal-400 bg-teal-50" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}
                >
                  <AvatarProfesional src={pro.avatar} nombre={pro.name} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{pro.name}</p>
                    <p className="text-xs text-slate-500">{pro.role}</p>
                  </div>
                  {selectedPro.name === pro.name && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar + Time slots */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-display font-bold text-slate-900 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Horarios disponibles</h2>

            <MiniCalendar
              proName={selectedPro.name}
              estaDisponible={(d) => diaDisponible(selectedPro, calYear, calMonth, d)}
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
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${selectedSlot === slot ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700"}`}
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
                if (onLoginRequired) { onLoginRequired(); return; }
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
                onBook(selectedPro, selectedSlot, dateStr);
              }}
              className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {selectedSlot ? `Agendar para las ${selectedSlot}` : "Selecciona un horario"}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

// ─── FilteredProScreen ────────────────────────────────────────────────────────

function FilteredProScreen({
  business,
  preSelected,
  onBook,
  onBack,
  onLoginRequired,
}: {
  business: Business;
  preSelected: PreSelected;
  onBook: (pro: Professional, slot: string, date: string) => void;
  onBack: () => void;
  onLoginRequired?: () => void;
}) {
  const { profesionales } = useAgendaOferta(business.id);
  const available = profesionales.filter((p) => (p.slotsPorFecha[preSelected.date] ?? []).includes(preSelected.time));
  const [selectedPro, setSelectedPro] = useState<ProfesionalAgenda | null>(null);
  useEffect(() => {
    if (!selectedPro && available.length === 1) setSelectedPro(available[0]);
  }, [available, selectedPro]);

  const formattedDate = (() => {
    const d = new Date(preSelected.date + "T12:00:00");
    return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  })();

  const summaryFields = [
    { label: "Servicio", value: preSelected.service || business.category },
    { label: "Empresa", value: business.name },
    { label: "Fecha", value: formattedDate },
    { label: "Hora", value: preSelected.time },
    { label: "Profesional", value: selectedPro ? (selectedPro.role ? `${selectedPro.name} — ${selectedPro.role}` : selectedPro.name) : "" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-display text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>AgendaYa</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Volver */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Volver al listado
        </button>

        {/* Business mini-header */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            <BusinessImage business={business} loading="eager" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-display text-xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{business.name}</h1>
              <CategoryBadge category={business.category} />
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {business.address || business.city}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-7">
          {["Empresa", "Profesional", "Confirmar"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-teal-600 text-white" : i === 1 ? "bg-teal-600 text-white ring-2 ring-teal-200" : "bg-slate-200 text-slate-500"}`}>
                {i === 0 ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === 1 ? "text-teal-700 font-semibold" : "text-slate-500"}`}>{step}</span>
              {i < 2 && <div className={`h-px w-6 sm:w-12 ${i === 0 ? "bg-teal-300" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-5 items-start">
          {/* Left — Professionals */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <h2 className="font-display font-bold text-slate-900 mb-1 shrink-0" style={{ fontFamily: "Outfit, sans-serif" }}>Profesionales disponibles</h2>
            <p className="text-xs text-slate-400 mb-4 shrink-0">Para el {formattedDate} a las {preSelected.time}</p>

            {available.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Sin profesionales disponibles</p>
                <p className="text-xs text-slate-400 max-w-[200px]">No hay profesionales con disponibilidad en este horario. Intenta con otra fecha u hora.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-80 pr-1" style={{ scrollbarWidth: "thin" }}>
                {available.map((pro) => {
                  const isSelected = selectedPro?.id === pro.id;
                  return (
                    <button
                      key={pro.id || pro.name}
                      onClick={() => setSelectedPro(pro)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected ? "border-teal-400 bg-teal-50" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}
                    >
                      <AvatarProfesional src={pro.avatar} nombre={pro.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{pro.name}</p>
                        <p className="text-xs text-slate-500">{pro.role}</p>
                      </div>
                      {isSelected ? (
                        <div className="shrink-0 w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      ) : (
                        <div className="shrink-0 w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right — Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-5">
            <h2 className="font-display font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Resumen de la solicitud</h2>

            <div className="space-y-3">
              {summaryFields.map(({ label, value }) => (
                <div key={label} className={`flex items-start justify-between gap-4 py-2.5 border-b border-slate-50 last:border-0 ${!value && label === "Profesional" ? "opacity-40" : ""}`}>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0 mt-0.5">{label}</span>
                  {value ? (
                    <span className="text-sm font-semibold text-slate-800 text-right capitalize">{value}</span>
                  ) : (
                    <span className="text-sm text-slate-300 italic text-right">Selecciona un profesional</span>
                  )}
                </div>
              ))}
            </div>

            <button
              disabled={!selectedPro || available.length === 0}
              onClick={() => { if (onLoginRequired) { onLoginRequired(); return; } selectedPro && onBook(selectedPro, preSelected.time, preSelected.date); }}
              className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl text-sm hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
            >
              {selectedPro ? "Agendar" : "Selecciona un profesional"}
            </button>
            <p className="text-center text-xs text-slate-400 -mt-3">Sin costo de cancelación hasta 2 horas antes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Screen ────────────────────────────────────────────────────────────

function ConfirmScreen({
  business,
  professional,
  slot,
  date,
  onConfirm,
  onBack,
}: {
  business: Business;
  professional: Professional;
  slot: string;
  date: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const formattedDate = (() => {
    if (!date) return new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-display text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Confirmar reserva</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 w-full flex-1">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["Empresa", "Profesional", "Confirmar"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? "bg-teal-600 text-white" : "bg-teal-600 text-white"}`}>
                {i < 2 ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : i + 1}
              </div>
              <span className="text-xs font-medium text-slate-600 hidden sm:block">{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-teal-200 w-6 sm:w-12" />}
            </div>
          ))}
        </div>

        {/* Heading */}
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Revisa los detalles y confirma</h2>
          <p className="text-sm text-slate-500 mt-1">Una vez confirmada, recibirás un recordatorio por correo electrónico.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="divide-y divide-slate-50">
            {[
              { label: "Servicio", value: business.category, icon: "🎯" },
              { label: "Empresa", value: business.name, icon: "🏢" },
              { label: "Profesional", value: professional.role ? `${professional.name} — ${professional.role}` : professional.name, icon: "👤" },
              { label: "Fecha", value: formattedDate, icon: "📅" },
              { label: "Hora", value: slot, icon: "🕐" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-3.5">
                <span className="text-base shrink-0">{icon}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-24 shrink-0">{label}</span>
                <span className="text-sm font-semibold text-slate-800 capitalize">{value}</span>
              </div>
            ))}
          </div>
          <div className="px-6 py-3.5 bg-teal-50 flex items-center gap-2 border-t border-teal-100">
            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-xs text-teal-700">Sin costo de cancelación hasta 2 horas antes de la cita.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl text-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={onConfirm}
            className="flex-[2] py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm transition-colors shadow-md shadow-teal-200"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirmed Screen ──────────────────────────────────────────────────────────

function ConfirmedScreen({ business, professional, slot, date, code, onHome, onViewBookings }: { business: Business; professional: Professional; slot: string; date: string; code: string; onHome: () => void; onViewBookings: () => void }) {
  // Fecha de la cita elegida ("AAAA-MM-DD"), no la de hoy. El mediodía evita que la zona horaria cambie el día.
  const today = new Date(`${date}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

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
            <h1 className="font-display text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>¡Reserva confirmada!</h1>
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
              <span className="text-sm font-semibold text-slate-800 capitalize">{today}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Hora</span>
              <span className="text-sm font-semibold text-slate-800">{slot}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500">Código de reserva</span>
              <span className="text-xs font-bold text-teal-700 font-mono break-all text-right ml-4">{code}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-2.5">
            <button onClick={onViewBookings} className="w-full py-2.5 rounded-xl border-2 border-teal-600 text-teal-700 font-semibold text-sm hover:bg-teal-50 transition-colors">
              Ver mis reservas
            </button>
            <button
              onClick={onHome}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
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

// ─── Auth shared helpers ───────────────────────────────────────────────────────

function AuthHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <header className="bg-white border-b border-slate-100">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg className="text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: "15px", height: "15px" }}>
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-display font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>AgendaYa</span>
          <span className="text-slate-300 mx-1">·</span>
          <span className="text-sm font-medium text-slate-500">{title}</span>
        </div>
      </div>
    </header>
  );
}

function PasswordField({
  label, value, onChange, placeholder, error,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-xl bg-white outline-none transition-colors ${error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-teal-400"}`}
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {show
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          }
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextField({
  label, value, onChange, placeholder, type, error, hint,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white outline-none transition-colors ${error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-teal-400"}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function SelectField({
  label, value, onChange, options, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-teal-400 transition-colors appearance-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── InlineAlert ──────────────────────────────────────────────────────────────

function InlineAlert({ type, message }: { type: "success" | "error"; message: string }) {
  const styles = type === "success"
    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
    : "bg-red-50 border border-red-200 text-red-700";
  const icon = type === "success"
    ? <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
    : <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>;
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${styles}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
}

// ─── Account Type Screen ───────────────────────────────────────────────────────

function AccountTypeScreen({
  onSelectClient,
  onSelectProvider,
  onLogin,
  onBack,
}: {
  onSelectClient: () => void;
  onSelectProvider: () => void;
  onLogin: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthHeader onBack={onBack} title="Crear cuenta" />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>¿Cómo quieres usar AgendaYa?</h1>
            <p className="text-slate-500 text-sm">Elige el tipo de cuenta que mejor te describe</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-7">
            {/* Cliente */}
            <button
              onClick={onSelectClient}
              className="group flex flex-col items-center gap-4 p-7 bg-white rounded-2xl border-2 border-slate-100 shadow-sm hover:border-teal-400 hover:shadow-md transition-all text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-display text-lg font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Soy Cliente</p>
                <p className="text-sm text-slate-500">Quiero agendar servicios</p>
              </div>
              <div className="mt-auto w-full py-2 rounded-xl bg-teal-600 group-hover:bg-teal-700 text-white text-sm font-semibold text-center transition-colors">
                Continuar
              </div>
            </button>

            {/* Proveedor */}
            <button
              onClick={onSelectProvider}
              className="group flex flex-col items-center gap-4 p-7 bg-white rounded-2xl border-2 border-slate-100 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-display text-lg font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Soy Proveedor</p>
                <p className="text-sm text-slate-500">Quiero ofrecer mis servicios</p>
              </div>
              <div className="mt-auto w-full py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-sm font-semibold text-center transition-colors">
                Continuar
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <button onClick={onLogin} className="text-teal-600 font-semibold hover:underline">Inicia sesión</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Register Client Screen ────────────────────────────────────────────────────

type ClientRegistrationField = "firstName" | "lastName" | "phone" | "email" | "document" | "password";
type ClientRegistrationValues = Record<ClientRegistrationField, string>;
type ClientRegistrationErrors = Partial<Record<ClientRegistrationField, string>>;

function campoCliente(mensaje: string): ClientRegistrationField {
  const m = mensaje.toLowerCase();
  if (m.includes("correo")) return "email";
  if (m.includes("documento")) return "document";
  if (m.includes("celular") || m.includes("teléfono")) return "phone";
  if (m.includes("apellido")) return "lastName";
  if (m.includes("nombre")) return "firstName";
  return "password";
}

function RegistrationField({
  id,
  label,
  value,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  error,
  inputRef,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  error?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} <span className="text-red-500" aria-hidden="true">*</span>
        <span className="sr-only"> (obligatorio)</span>
      </label>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-teal-50"
        }`}
      />
      <div className="min-h-5 pt-1">
        {error && (
          <p id={errorId} role="alert" className="flex items-start gap-1.5 text-xs font-medium text-red-600">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function RegisterClientScreen({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [values, setValues] = useState<ClientRegistrationValues>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    document: "",
    password: "",
  });
  const [errors, setErrors] = useState<ClientRegistrationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ClientRegistrationField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const timerRef = useRef<number | null>(null);
  const fieldRefs: Record<ClientRegistrationField, RefObject<HTMLInputElement | null>> = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    document: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: values.password.length >= 8 },
    { label: "Al menos una mayúscula", met: /[A-Z]/.test(values.password) },
    { label: "Al menos una minúscula", met: /[a-z]/.test(values.password) },
    { label: "Al menos un número", met: /\d/.test(values.password) },
    { label: "Al menos un carácter especial", met: /[^A-Za-z0-9]/.test(values.password) },
  ];
  const passwordIsValid = passwordRequirements.every((requirement) => requirement.met);

  const validateField = (field: ClientRegistrationField, value: string): string => {
    if (!value.trim()) return "Este campo es obligatorio";
    if (field === "email" && value.split("@").length !== 2) {
      return "Ingresa un correo electrónico válido (debe contener un único @)";
    }
    if (field === "phone" && !/^\d{10}$/.test(value)) {
      return "El número de celular debe tener exactamente 10 dígitos numéricos";
    }
    if (field === "password" && !passwordRequirements.every((requirement) => {
      if (requirement.label === "Mínimo 8 caracteres") return value.length >= 8;
      if (requirement.label === "Al menos una mayúscula") return /[A-Z]/.test(value);
      if (requirement.label === "Al menos una minúscula") return /[a-z]/.test(value);
      if (requirement.label === "Al menos un número") return /\d/.test(value);
      return /[^A-Za-z0-9]/.test(value);
    })) {
      return "La contraseña no cumple todos los requisitos";
    }
    return "";
  };

  const updateField = (field: ClientRegistrationField, value: string) => {
    const nextValue = field === "phone" ? value.replace(/\D/g, "") : value;
    setValues((current) => ({ ...current, [field]: nextValue }));
    if (touched[field] || submitted) {
      setErrors((current) => ({ ...current, [field]: validateField(field, nextValue) }));
    } else if ((field === "email" || field === "document") && errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const handleBlur = (field: ClientRegistrationField) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validateField(field, values[field]) }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = (Object.keys(values) as ClientRegistrationField[]).reduce<ClientRegistrationErrors>((result, field) => {
      const error = validateField(field, values[field]);
      if (error) result[field] = error;
      return result;
    }, {});
    setErrors(nextErrors);

    const firstError = (Object.keys(values) as ClientRegistrationField[]).find((field) => nextErrors[field]);
    if (firstError) {
      fieldRefs[firstError].current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      await pedir(ENDPOINTS.registroCliente, { metodo: "POST", cuerpo: aRegistroCliente(values) });
      setIsSuccessful(true);
    } catch (e) {
      const mensajes = e instanceof ErrorApi ? e.mensajes : ["Ocurrió un error. Intenta de nuevo."];
      const porCampo: ClientRegistrationErrors = {};
      mensajes.forEach((mensaje) => {
        const campo = campoCliente(mensaje);
        if (!porCampo[campo]) porCampo[campo] = mensaje;
      });
      setErrors(porCampo);
      const primero = (Object.keys(values) as ClientRegistrationField[]).find((campo) => porCampo[campo]);
      if (primero) fieldRefs[primero].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthHeader onBack={onBack} title="Registro — Cliente" />
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
        <main className="w-full max-w-lg">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
                <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 21a7 7 0 0114 0H3z" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Crea tu cuenta</h1>
              <p className="mt-1.5 text-sm text-slate-500">Completa tus datos para comenzar a agendar servicios.</p>
              <p className="mt-2 text-xs text-slate-400">
                <span className="font-semibold text-red-500" aria-hidden="true">*</span> Todos los campos son obligatorios
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-1">
                <RegistrationField id="firstName" label="Nombres" value={values.firstName} placeholder="Ej. María Fernanda" autoComplete="given-name" error={errors.firstName} inputRef={fieldRefs.firstName} onChange={(value) => updateField("firstName", value)} onBlur={() => handleBlur("firstName")} />
                <RegistrationField id="lastName" label="Apellidos" value={values.lastName} placeholder="Ej. García López" autoComplete="family-name" error={errors.lastName} inputRef={fieldRefs.lastName} onChange={(value) => updateField("lastName", value)} onBlur={() => handleBlur("lastName")} />
                <RegistrationField id="phone" label="Número de celular" value={values.phone} placeholder="Ej. 3001234567" type="tel" inputMode="numeric" autoComplete="tel-national" error={errors.phone} inputRef={fieldRefs.phone} onChange={(value) => updateField("phone", value)} onBlur={() => handleBlur("phone")} />
                <RegistrationField id="email" label="Correo electrónico" value={values.email} placeholder="Ej. nombre@correo.com" type="email" inputMode="email" autoComplete="email" error={errors.email} inputRef={fieldRefs.email} onChange={(value) => updateField("email", value)} onBlur={() => handleBlur("email")} />
                <RegistrationField id="document" label="Documento de identidad" value={values.document} placeholder="Ej. 1020304050" autoComplete="off" error={errors.document} inputRef={fieldRefs.document} onChange={(value) => updateField("document", value)} onBlur={() => handleBlur("document")} />

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Contraseña <span className="text-red-500" aria-hidden="true">*</span>
                    <span className="sr-only"> (obligatorio)</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={fieldRefs.password}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={values.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      onBlur={() => handleBlur("password")}
                      placeholder="Crea una contraseña segura"
                      required
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby="password-error password-requirements"
                      className={`w-full rounded-xl border bg-white px-3.5 py-3 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                        errors.password
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-teal-50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.7 10.7 0 0112 4c5 0 9.3 3.3 10.8 8a11.8 11.8 0 01-2.2 4.1M6.2 6.2A11.7 11.7 0 001.2 12c1.5 4.7 5.8 8 10.8 8 1.8 0 3.4-.4 4.8-1.1" /></svg>
                      ) : (
                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12C3.8 7.9 7.5 5 12 5s8.2 2.9 9.5 7c-1.3 4.1-5 7-9.5 7s-8.2-2.9-9.5-7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                  <div className="min-h-5 pt-1">
                    {errors.password && (
                      <p id="password-error" role="alert" className="flex items-start gap-1.5 text-xs font-medium text-red-600">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{errors.password}</span>
                      </p>
                    )}
                  </div>
                  <ul id="password-requirements" className="grid gap-1.5 rounded-xl bg-slate-50 p-3 sm:grid-cols-2" aria-label="Requisitos de contraseña">
                    {passwordRequirements.map((requirement) => {
                      const requirementFailed = submitted && !requirement.met;
                      return (
                        <li key={requirement.label} className={`flex items-center gap-2 text-xs font-medium ${requirement.met ? "text-emerald-700" : requirementFailed ? "text-red-600" : "text-slate-500"}`}>
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${requirement.met ? "bg-emerald-100" : requirementFailed ? "bg-red-100" : "bg-slate-200"}`} aria-hidden="true">
                            {requirement.met ? (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                          </span>
                          <span>{requirement.label}</span>
                          <span className="sr-only">{requirement.met ? ": cumplido" : ": pendiente"}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-100 transition-colors hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-wait disabled:bg-teal-500"
              >
                {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
                <span>{isLoading ? "Creando cuenta..." : "Crear cuenta"}</span>
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <button onClick={onLogin} className="font-semibold text-teal-600 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500">
                Inicia sesión
              </button>
            </p>
          </div>
        </main>
      </div>

      {isSuccessful && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="registration-success-title">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 id="registration-success-title" className="font-display text-2xl font-bold text-slate-900">¡Tu cuenta fue creada con éxito!</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Ya puedes iniciar sesión y comenzar a reservar tus servicios favoritos.</p>
            <button onClick={onLogin} autoFocus className="mt-6 w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200">
              Ir a iniciar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Register Provider Screen ──────────────────────────────────────────────────

type ProviderRegistrationField =
  | "serviceType"
  | "companyName"
  | "nit"
  | "companyPhone"
  | "companyEmail"
  | "department"
  | "city"
  | "representativeFirstName"
  | "representativeLastName"
  | "representativePhone"
  | "representativeDocument"
  | "password";
type ProviderRegistrationValues = Record<ProviderRegistrationField, string>;
type ProviderRegistrationErrors = Partial<Record<ProviderRegistrationField | "logo", string>>;

function campoProveedor(mensaje: string): keyof ProviderRegistrationErrors | null {
  const m = mensaje.toLowerCase();
  if (m.includes("logo") || m.includes("imagen")) return "logo";
  if (m.includes("nit")) return "nit";
  if (m.includes("municipio")) return "city";
  if (m.includes("empresa") || m.includes("razón social")) return "companyName";
  if (m.includes("tipo de servicio")) return "serviceType";
  if (m.includes("representante") && m.includes("celular")) return "representativePhone";
  if (m.includes("representante") && m.includes("documento")) return "representativeDocument";
  if (m.includes("representante") && m.includes("apellido")) return "representativeLastName";
  if (m.includes("representante")) return "representativeFirstName";
  if (m.includes("teléfono")) return "companyPhone";
  if (m.includes("correo")) return "companyEmail";
  if (m.includes("contraseña")) return "password";
  return null;
}

function RegisterProviderScreen({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [values, setValues] = useState<ProviderRegistrationValues>({
    serviceType: "",
    companyName: "",
    nit: "",
    companyPhone: "",
    companyEmail: "",
    department: "",
    city: "",
    representativeFirstName: "",
    representativeLastName: "",
    representativePhone: "",
    representativeDocument: "",
    password: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [errors, setErrors] = useState<ProviderRegistrationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ProviderRegistrationField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const timerRef = useRef<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoZoneRef = useRef<HTMLDivElement>(null);
  const serviceTypeRef = useRef<HTMLSelectElement>(null);
  const departmentRef = useRef<HTMLSelectElement>(null);
  const cityRef = useRef<HTMLSelectElement>(null);
  const fieldRefs: Record<Exclude<ProviderRegistrationField, "serviceType" | "department" | "city">, RefObject<HTMLInputElement | null>> = {
    companyName: useRef<HTMLInputElement>(null),
    nit: useRef<HTMLInputElement>(null),
    companyPhone: useRef<HTMLInputElement>(null),
    companyEmail: useRef<HTMLInputElement>(null),
    representativeFirstName: useRef<HTMLInputElement>(null),
    representativeLastName: useRef<HTMLInputElement>(null),
    representativePhone: useRef<HTMLInputElement>(null),
    representativeDocument: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const getPasswordRequirements = (password: string) => [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Al menos una mayúscula", met: /[A-Z]/.test(password) },
    { label: "Al menos una minúscula", met: /[a-z]/.test(password) },
    { label: "Al menos un número", met: /\d/.test(password) },
    { label: "Al menos un carácter especial", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const passwordRequirements = getPasswordRequirements(values.password);

  const validateField = (field: ProviderRegistrationField, value: string): string => {
    if (!value.trim()) return "Este campo es obligatorio";
    if (field === "companyEmail" && value.split("@").length !== 2) {
      return "Ingresa un correo electrónico válido";
    }
    if ((field === "companyPhone" || field === "representativePhone") && !/^\d{10}$/.test(value)) {
      return "Debe tener exactamente 10 dígitos numéricos";
    }
    if (field === "nit" && !/^\d{6,10}$/.test(value)) {
      return "El NIT debe tener entre 6 y 10 dígitos";
    }
    if (field === "password" && !getPasswordRequirements(value).every((requirement) => requirement.met)) {
      return "La contraseña no cumple todos los requisitos";
    }
    return "";
  };

  const updateField = (field: ProviderRegistrationField, value: string) => {
    const nextValue = field === "companyPhone" || field === "representativePhone" || field === "nit"
      ? value.replace(/\D/g, "")
      : value;
    setValues((current) => ({ ...current, [field]: nextValue }));
    if (touched[field] || submitted) {
      setErrors((current) => ({ ...current, [field]: validateField(field, nextValue) }));
    }
  };

  const handleBlur = (field: ProviderRegistrationField) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validateField(field, values[field]) }));
  };

  const handleLogoFile = (file?: File) => {
    if (!file || !["image/png", "image/jpeg"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setLogo(null);
      setLogoPreview("");
      setErrors((current) => ({ ...current, logo: "Sube una imagen en formato PNG o JPG" }));
      return;
    }
    setLogo(file);
    setErrors((current) => ({ ...current, logo: "" }));
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const focusField = (field: ProviderRegistrationField | "logo") => {
    if (field === "serviceType") serviceTypeRef.current?.focus();
    else if (field === "logo") logoZoneRef.current?.focus();
    else if (field === "department") departmentRef.current?.focus();
    else if (field === "city") cityRef.current?.focus();
    else fieldRefs[field].current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const fieldOrder: ProviderRegistrationField[] = [
      "serviceType",
      "companyName",
      "nit",
      "companyPhone",
      "companyEmail",
      "department", 
      "city", 
      "representativeFirstName",
      "representativeLastName",
      "representativePhone",
      "representativeDocument",
      "password",
    ];
    const nextErrors = fieldOrder.reduce<ProviderRegistrationErrors>((result, field) => {
      const error = validateField(field, values[field]);
      if (error) result[field] = error;
      return result;
    }, {});
    if (!logo) nextErrors.logo = errors.logo || "Este campo es obligatorio";
    setErrors(nextErrors);

    const visualOrder: Array<ProviderRegistrationField | "logo"> = [
      "serviceType",
      "companyName",
      "logo",
      "nit",
      "companyPhone",
      "companyEmail",
      "department",
      "city",
      "representativeFirstName",
      "representativeLastName",
      "representativePhone",
      "representativeDocument",
      "password",
    ];
    const firstError = visualOrder.find((field) => nextErrors[field]);
    if (firstError) {
      focusField(firstError);
      return;
    }

    setIsLoading(true);
    try {
    const municipios = await pedir<MunicipioResumen[]>(ENDPOINTS.municipios);
    const municipioId = municipioIdPorNombre(municipios, values.department, values.city);
    if (municipioId === undefined) {
      setErrors({ city: "El municipio seleccionado no existe." });
      focusField("city");
      return;
}
await pedir(ENDPOINTS.registroProveedor, { metodo: "POST", cuerpo: aRegistroProveedor(values, logoPreview, municipioId) });
setIsSuccessful(true);
    } catch (e) {
      const mensajes = e instanceof ErrorApi ? e.mensajes : ["Ocurrió un error. Intenta de nuevo."];
      const porCampo: ProviderRegistrationErrors = {};
      const sinCampo: string[] = [];
      mensajes.forEach((mensaje) => {
        const campo = campoProveedor(mensaje);
        if (campo && !porCampo[campo]) porCampo[campo] = mensaje;
        else if (!campo) sinCampo.push(mensaje);
      });
      setErrors(porCampo);
      const primero = visualOrder.find((campo) => porCampo[campo]);
      if (primero) focusField(primero);
      if (sinCampo.length) window.alert(sinCampo.join("\n"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AuthHeader onBack={onBack} title="Crear cuenta de proveedor" />
      <div className="flex flex-1 justify-center px-4 py-8 sm:py-10">
        <main className="w-full max-w-2xl">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
                <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1m4 0h1m-6 4h1m4 0h1m-5 7v-4h4v4" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Crear cuenta de proveedor</h1>
              <p className="mt-1.5 text-sm text-slate-500">Registra tu empresa y comienza a recibir reservas.</p>
              <p className="mt-2 text-xs text-slate-400"><span className="font-semibold text-red-500" aria-hidden="true">*</span> Todos los campos son obligatorios</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <section aria-labelledby="company-section-title">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">1</span>
                  <div>
                    <h2 id="company-section-title" className="font-display font-bold text-slate-900">Información de la empresa</h2>
                    <p className="text-xs text-slate-500">Datos públicos y de contacto del negocio</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div>
                    <label htmlFor="serviceType" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Tipo de servicios que presta <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span>
                    </label>
                    <select
                      ref={serviceTypeRef}
                      id="serviceType"
                      value={values.serviceType}
                      onChange={(event) => updateField("serviceType", event.target.value)}
                      onBlur={() => handleBlur("serviceType")}
                      required
                      aria-invalid={Boolean(errors.serviceType)}
                      aria-describedby={errors.serviceType ? "serviceType-error" : undefined}
                      className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition-all focus:ring-4 ${errors.serviceType ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-teal-500 focus:ring-teal-50"}`}
                    >
                      <option value="">Selecciona una categoría</option>
                      {CATEGORIES.filter(Boolean).map((category) => <option key={category}>{category}</option>)}
                    </select>
                    <div className="min-h-5 pt-1">
                      {errors.serviceType && <p id="serviceType-error" role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-600"><svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.serviceType}</p>}
                    </div>
                  </div>

                  <RegistrationField id="companyName" label="Nombre de la empresa" value={values.companyName} placeholder="Ej. Centro Bienestar S.A.S." autoComplete="organization" error={errors.companyName} inputRef={fieldRefs.companyName} onChange={(value) => updateField("companyName", value)} onBlur={() => handleBlur("companyName")} />

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700" id="logo-label">
                      Logo de la empresa <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span>
                    </label>
                    <input
                      ref={logoInputRef}
                      id="companyLogo"
                      type="file"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      className="sr-only"
                      aria-labelledby="logo-label"
                      onChange={(event) => {
                        handleLogoFile(event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                    <div
                      ref={logoZoneRef}
                      role="button"
                      tabIndex={0}
                      aria-labelledby="logo-label"
                      aria-describedby={`${logoPreview ? "" : "logo-help"}${errors.logo ? " logo-error" : ""}`.trim() || undefined}
                      aria-invalid={Boolean(errors.logo)}
                      onClick={() => logoInputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          logoInputRef.current?.click();
                        }
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleLogoFile(event.dataTransfer.files?.[0]);
                      }}
                      className={`flex min-h-32 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center outline-none transition-colors focus:ring-4 ${errors.logo ? "border-red-400 bg-red-50/40 focus:ring-red-100" : "border-slate-200 bg-slate-50/70 hover:border-teal-400 hover:bg-teal-50/40 focus:border-teal-500 focus:ring-teal-50"}`}
                    >
                      {logoPreview ? (
                        <div className="flex w-full items-center gap-4 text-left">
                          <img src={logoPreview} alt="Vista previa del logo de la empresa" className="h-20 w-20 rounded-2xl border border-slate-200 bg-white object-contain p-2" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{logo?.name}</p>
                            <p className="mt-1 text-xs text-slate-500">Logo listo para cargar</p>
                            <button type="button" onClick={(event) => { event.stopPropagation(); logoInputRef.current?.click(); }} className="mt-3 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500">Cambiar logo</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <svg className="mx-auto h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14.8M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="mt-2 text-sm font-semibold text-slate-700">Arrastra tu logo aquí o selecciónalo</p>
                          <p id="logo-help" className="mt-1 text-xs text-slate-500">PNG o JPG, máximo 5 MB</p>
                        </div>
                      )}
                    </div>
                    <div className="min-h-5 pt-1">
                      {errors.logo && <p id="logo-error" role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-600"><svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.logo}</p>}
                    </div>
                  </div>

                  <div>
                    <RegistrationField id="nit" label="NIT (sin dígito de verificación)" value={values.nit} placeholder="Ej. 900123456" inputMode="numeric" error={errors.nit} inputRef={fieldRefs.nit} onChange={(value) => updateField("nit", value)} onBlur={() => handleBlur("nit")} />
                    <p className="-mt-4 mb-4 text-xs text-slate-500">Solo números, sin puntos, guiones ni dígito de verificación.</p>
                  </div>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <RegistrationField id="companyPhone" label="Teléfono de atención al cliente" value={values.companyPhone} placeholder="Ej. 3001234567" type="tel" inputMode="numeric" autoComplete="tel" error={errors.companyPhone} inputRef={fieldRefs.companyPhone} onChange={(value) => updateField("companyPhone", value)} onBlur={() => handleBlur("companyPhone")} />
                    <RegistrationField id="companyEmail" label="Correo de atención al cliente" value={values.companyEmail} placeholder="Ej. contacto@empresa.com" type="email" inputMode="email" autoComplete="email" error={errors.companyEmail} inputRef={fieldRefs.companyEmail} onChange={(value) => updateField("companyEmail", value)} onBlur={() => handleBlur("companyEmail")} />
                  </div>

                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="department" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Departamento <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span>
                      </label>
                      <select
                        ref={departmentRef}
                        id="department"
                        value={values.department}
                        onChange={(event) => {
                          updateField("department", event.target.value);
                          updateField("city", "");
                        }}
                        onBlur={() => handleBlur("department")}
                        required
                        aria-invalid={Boolean(errors.department)}
                        aria-describedby={errors.department ? "department-error" : undefined}
                        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition-all focus:ring-4 ${errors.department ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-teal-500 focus:ring-teal-50"}`}
                      >
                        <option value="">Selecciona el departamento</option>
                        {DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}
                      </select>
                      <div className="min-h-5 pt-1">
                        {errors.department && <p id="department-error" role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-600"><svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.department}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="city" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Ciudad o municipio <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span>
                      </label>
                      <select
                        ref={cityRef}
                        id="city"
                        value={values.city}
                        onChange={(event) => updateField("city", event.target.value)}
                        onBlur={() => handleBlur("city")}
                        disabled={!values.department}
                        required
                        aria-invalid={Boolean(errors.city)}
                        aria-describedby={errors.city ? "city-error" : undefined}
                        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${errors.city ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-teal-500 focus:ring-teal-50"}`}
                      >
                        <option value="">{values.department ? "Selecciona la ciudad o municipio" : "Primero selecciona el departamento"}</option>
                        {(COLOMBIA_GEO[values.department] ?? []).map((city) => <option key={city}>{city}</option>)}
                      </select>
                      <div className="min-h-5 pt-1">
                        {errors.city && <p id="city-error" role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-600"><svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.city}</p>}
                      </div>
                    </div>
                  </div>

                  </div>
              </section>

              <section className="mt-8 border-t border-slate-100 pt-7" aria-labelledby="representative-section-title">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">2</span>
                  <div>
                    <h2 id="representative-section-title" className="font-display font-bold text-slate-900">Información del representante de la empresa</h2>
                    <p className="text-xs text-slate-500">Datos de la persona responsable de la cuenta</p>
                  </div>
                </div>
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <RegistrationField id="representativeFirstName" label="Nombres" value={values.representativeFirstName} placeholder="Ej. Andrea Carolina" autoComplete="given-name" error={errors.representativeFirstName} inputRef={fieldRefs.representativeFirstName} onChange={(value) => updateField("representativeFirstName", value)} onBlur={() => handleBlur("representativeFirstName")} />
                  <RegistrationField id="representativeLastName" label="Apellidos" value={values.representativeLastName} placeholder="Ej. Rodríguez Pérez" autoComplete="family-name" error={errors.representativeLastName} inputRef={fieldRefs.representativeLastName} onChange={(value) => updateField("representativeLastName", value)} onBlur={() => handleBlur("representativeLastName")} />
                  <RegistrationField id="representativePhone" label="Número de celular" value={values.representativePhone} placeholder="Ej. 3109876543" type="tel" inputMode="numeric" autoComplete="tel-national" error={errors.representativePhone} inputRef={fieldRefs.representativePhone} onChange={(value) => updateField("representativePhone", value)} onBlur={() => handleBlur("representativePhone")} />
                  <RegistrationField id="representativeDocument" label="Documento de identidad" value={values.representativeDocument} placeholder="Ej. 1020304050" error={errors.representativeDocument} inputRef={fieldRefs.representativeDocument} onChange={(value) => updateField("representativeDocument", value)} onBlur={() => handleBlur("representativeDocument")} />
                </div>
              </section>

              <section className="mt-8 border-t border-slate-100 pt-7" aria-labelledby="security-section-title">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">3</span>
                  <div>
                    <h2 id="security-section-title" className="font-display font-bold text-slate-900">Seguridad</h2>
                    <p className="text-xs text-slate-500">Protege el acceso a la cuenta de tu empresa</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="providerPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">Contraseña <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span></label>
                  <div className="relative">
                    <input
                      ref={fieldRefs.password}
                      id="providerPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={values.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      onBlur={() => handleBlur("password")}
                      placeholder="Crea una contraseña segura"
                      required
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby="provider-password-error provider-password-requirements"
                      className={`w-full rounded-xl border bg-white px-3.5 py-3 pr-12 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-teal-500 focus:ring-teal-50"}`}
                    />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
                      {showPassword ? <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.7 10.7 0 0112 4c5 0 9.3 3.3 10.8 8a11.8 11.8 0 01-2.2 4.1M6.2 6.2A11.7 11.7 0 001.2 12c1.5 4.7 5.8 8 10.8 8 1.8 0 3.4-.4 4.8-1.1" /></svg> : <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12C3.8 7.9 7.5 5 12 5s8.2 2.9 9.5 7c-1.3 4.1-5 7-9.5 7s-8.2-2.9-9.5-7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    </button>
                  </div>
                  <div className="min-h-5 pt-1">
                    {errors.password && <p id="provider-password-error" role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-600"><svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.password}</p>}
                  </div>
                  <ul id="provider-password-requirements" className="grid gap-1.5 rounded-xl bg-slate-50 p-3 sm:grid-cols-2" aria-label="Requisitos de contraseña">
                    {passwordRequirements.map((requirement) => {
                      const failed = submitted && !requirement.met;
                      return (
                        <li key={requirement.label} className={`flex items-center gap-2 text-xs font-medium ${requirement.met ? "text-emerald-700" : failed ? "text-red-600" : "text-slate-500"}`}>
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${requirement.met ? "bg-emerald-100" : failed ? "bg-red-100" : "bg-slate-200"}`} aria-hidden="true">
                            {requirement.met ? <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>}
                          </span>
                          <span>{requirement.label}</span><span className="sr-only">{requirement.met ? ": cumplido" : ": pendiente"}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>

              <button type="submit" disabled={isLoading} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-100 transition-colors hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-wait disabled:bg-teal-500">
                {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
                <span>{isLoading ? "Creando cuenta..." : "Crear cuenta"}</span>
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">¿Ya tienes cuenta?{" "}<button onClick={onLogin} className="font-semibold text-teal-600 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500">Inicia sesión</button></p>
          </div>
        </main>
      </div>

      {isSuccessful && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="provider-registration-success-title">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 id="provider-registration-success-title" className="font-display text-2xl font-bold text-slate-900">¡Tu cuenta de proveedor fue creada con éxito!</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Tu empresa ya está lista para configurar sus servicios y recibir reservas.</p>
            <button onClick={onLogin} autoFocus className="mt-6 w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200">Ir a iniciar sesión</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Login Screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onBack, onRegister, onHome, notice }: { onBack: () => void; onRegister: () => void; onHome: (name: string, type: "client" | "provider") => void; notice?: string }) {
  const [role, setRole] = useState<"client" | "provider" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const emailFormatError = submitted && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Ingresa un correo válido" : "";

  const handleSubmit = async () => {
    setSubmitted(true);
    setAlert(null);
    if (!role || !email || !password || emailFormatError) return;
    try {
      const respuesta = await pedir<LoginRespuesta>(ENDPOINTS.login, { metodo: "POST", cuerpo: aLogin(email, password, role) });
      guardarSesion(respuesta);
      setAlert({ type: "success", message: "Inicio de sesión exitoso. Redirigiendo al panel..." });
      setTimeout(() => onHome(respuesta.cuenta.nombres, role), 1500);
    } catch (e) {
      const mensajes = e instanceof ErrorApi ? e.mensajes : ["Ocurrió un error. Intenta de nuevo."];
      setAlert({ type: "error", message: mensajes.join(" ") });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthHeader onBack={onBack} title="Iniciar sesión" />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Bienvenido de nuevo</h1>
            <p className="text-sm text-slate-500 mt-1">Inicia sesión en tu cuenta</p>
          </div>

          {notice && (
            <div role="status" className="mb-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{notice}</span>
            </div>
          )}

          {alert && <div className="mb-4"><InlineAlert type={alert.type} message={alert.message} /></div>}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <fieldset>
              <legend className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ingresa como</legend>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "client" as const, label: "Cliente" },
                  { value: "provider" as const, label: "Proveedor" },
                ].map((option) => {
                  const selected = role === option.value;
                  return (
                    <label key={option.value} className={`cursor-pointer rounded-xl border px-3 py-3 transition-all ${selected ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-slate-200 bg-white hover:border-teal-200"}`}>
                      <input
                        type="radio"
                        name="login-role"
                        value={option.value}
                        checked={selected}
                        onChange={() => { setRole(option.value); setAlert(null); }}
                        className="sr-only"
                      />
                      <span className={`block text-sm font-bold ${selected ? "text-teal-700" : "text-slate-700"}`}>{option.label}</span>
                    </label>
                  );
                })}
              </div>
              {submitted && !role && <p className="mt-1 text-xs text-red-500">Selecciona un rol</p>}
            </fieldset>
            <TextField
              label="Correo electrónico"
              value={email}
              onChange={setEmail}
              placeholder="correo@ejemplo.com"
              type="email"
              error={submitted && !email ? "Campo requerido" : emailFormatError}
            />
            <div>
              <PasswordField
                label="Contraseña"
                value={password}
                onChange={setPassword}
                error={submitted && !password ? "Campo requerido" : ""}
              />
              <button className="mt-2 text-xs text-teal-600 hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={alert?.type === "success"}
            className="w-full mt-5 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold rounded-2xl text-sm transition-colors shadow-md shadow-teal-100"
          >
            Iniciar sesión
          </button>
          <p className="text-center text-sm text-slate-500 mt-4">
            ¿No tienes cuenta?{" "}
            <button onClick={onRegister} className="text-teal-600 font-semibold hover:underline">Regístrate</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Mock appointment data ─────────────────────────────────────────────────────

interface Appointment {
  id: string;
  business: string;
  category: CategoryType;
  service: string;
  professional: string;
  date: string;   // display string
  dateValue: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  rating?: number;
}

function reservaACita(r: ReservaDetalle): Appointment {
  const servicio = r.servicioProveedor.servicio.nombre;
  return {
    id: r.codigo,
    business: r.servicioProveedor.proveedor.razonSocial,
    category: (SERVICE_TO_CATEGORY[servicio] ?? "") as CategoryType,
    service: servicio,
    professional: r.profesional ? `${r.profesional.nombres} ${r.profesional.apellidos}` : "Por asignar",
    date: aFechaVisible(r.fecha),
    dateValue: r.fecha,
    time: aEtiquetaHora(r.hora),
    status: estadoDesdeBackend(r.estado),
  };
}

const MOCK_UPCOMING: Appointment[] = [
  { id: "u1", business: "Studio Élite Hair", category: "Belleza", service: "Corte de cabello", professional: "Carolina Vélez", date: "lun, 22 sep 2025", dateValue: "2025-09-22", time: "10:00 a.m.", status: "confirmed" },
  { id: "u2", business: "PowerFit Centro Deportivo", category: "Deporte", service: "Entrenamiento personal", professional: "Juan Ospina", date: "mié, 24 sep 2025", dateValue: "2025-09-24", time: "8:00 a.m.", status: "pending" },
  { id: "u3", business: "ConsultMed Especialidades", category: "Salud", service: "Dermatología", professional: "Dr. Felipe Moreno", date: "vie, 26 sep 2025", dateValue: "2025-09-26", time: "2:00 p.m.", status: "confirmed" },
  { id: "h1", business: "Salón Belle & Co.", category: "Belleza", service: "Manicure/Pedicure", professional: "Marcela Rojas", date: "jue, 18 sep 2025", dateValue: "2025-09-18", time: "1:00 p.m.", status: "completed" },
  { id: "h2", business: "Clínica Veterinaria Huellitas", category: "Mascotas", service: "Consulta veterinaria", professional: "Dra. Valentina Cruz", date: "mar, 16 sep 2025", dateValue: "2025-09-16", time: "9:00 a.m.", status: "cancelled" },
];

const MOCK_HISTORY: Appointment[] = [
  { id: "old1", business: "Clínica Veterinaria Huellitas", category: "Mascotas", service: "Consulta veterinaria", professional: "Dra. Valentina Cruz", date: "mar, 9 sep 2025", dateValue: "2025-09-09", time: "9:00 a.m.", status: "completed", rating: 5 },
];

// ─── Dashboard shared header ───────────────────────────────────────────────────

function DashHeader({
  clientName,
  activeTab,
  onTab,
  onExplore,
  onLogout,
  onHome,
}: {
  clientName: string;
  activeTab: DashTab;
  onTab: (t: DashTab) => void;
  onExplore: () => void;
  onLogout: () => void;
  onHome?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs: { id: DashTab; label: string }[] = [
    { id: "home", label: "Inicio" },
    { id: "dashboard", label: "Explorar servicios" },
    { id: "my-bookings", label: "Mis reservas" },
  ];

  const handleTabClick = (t: DashTab) => {
    setMenuOpen(false);
    if (t === "dashboard") { onExplore(); return; }
    if (t === "home" && onHome) { onHome(); return; }
    onTab(t);
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg className="text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: "16px", height: "16px" }}>
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-display font-bold text-slate-900 text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>AgendaYa</span>
        </div>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* User menu — desktop */}
        <div className="relative ml-auto hidden shrink-0 md:block">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0H5z" /></svg>
            <span className="max-w-32 truncate">{clientName}</span>
            <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
              <button role="menuitem" onClick={() => handleTabClick("profile")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0H5z" /></svg>
                Mi perfil
              </button>
              <button role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
        <button onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 md:hidden">
          {menuOpen ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="space-y-1 border-t border-slate-100 bg-white p-3 md:hidden" aria-label="Menú principal">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => handleTabClick(t.id)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium ${activeTab === t.id ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}>{t.label}</button>
          ))}
          <button onClick={() => handleTabClick("profile")} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium ${activeTab === "profile" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}>Mi perfil</button>
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
            Cerrar sesión
          </button>
        </nav>
      )}
    </header>
  );
}

// ─── Star rating interactive ───────────────────────────────────────────────────

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <svg
            className={`w-5 h-5 ${s <= (hovered || value) ? "text-amber-400" : "text-slate-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Appointment card ──────────────────────────────────────────────────────────

function AppointmentCard({ appt }: { appt: Appointment }) {
  const catColors: Record<string, string> = {
    "Belleza": "bg-pink-50 text-pink-700",
    "Salud": "bg-blue-50 text-blue-700",
    "Deporte": "bg-orange-50 text-orange-700",
    "Mascotas": "bg-emerald-50 text-emerald-700",
    "Bienestar": "bg-violet-50 text-violet-700",
    "Educación": "bg-amber-50 text-amber-700",
  };
  const statusStyles: Record<Appointment["status"], { label: string; className: string }> = {
    pending: { label: "Pendiente", className: "bg-orange-50 text-orange-700" },
    confirmed: { label: "Confirmada", className: "bg-emerald-50 text-emerald-700" },
    cancelled: { label: "Cancelada", className: "bg-pink-50 text-pink-700" },
    completed: { label: "Completada", className: "bg-blue-50 text-blue-700" },
  };
  const status = statusStyles[appt.status];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColors[appt.category] || "bg-slate-100 text-slate-600"}`}>
                {appt.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">{appt.service}</span>
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base leading-snug" style={{ fontFamily: "Outfit, sans-serif" }}>{appt.business}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{appt.professional}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-slate-800">{appt.time}</p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{appt.date}</p>
            <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Client Dashboard ──────────────────────────────────────────────────────────

function ClientDashboard({
  clientName,
  appointments,
  initialTab,
  onExplore,
  onLogout,
  onDirtyChange,
}: {
  clientName: string;
  appointments: Appointment[];
  initialTab: DashTab;
  onExplore: () => void;
  onLogout: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [tab, setTab] = useState<DashTab>(initialTab);
  const [profile, setProfile] = useState({ name: clientName, email: "cliente@agendaya.com", phone: "3001234567" });
  const [profileSaved, setProfileSaved] = useState(false);
  const hasNoReservations = clientName === "Sin reservas";
  const visibleAppointments = (hasNoReservations ? [] : appointments).slice().sort((first, second) => {
    const firstIsPast = first.status === "completed" || first.status === "cancelled";
    const secondIsPast = second.status === "completed" || second.status === "cancelled";
    if (firstIsPast !== secondIsPast) return firstIsPast ? 1 : -1;
    return firstIsPast
      ? second.dateValue.localeCompare(first.dateValue)
      : first.dateValue.localeCompare(second.dateValue);
  });

  const navigateClientTab = (nextTab: DashTab) => {
    setTab(nextTab);
    const path = nextTab === "my-bookings"
      ? "#/panel/cliente/reservas"
      : nextTab === "profile"
        ? "#/panel/cliente/perfil"
        : "#/panel/cliente";
    window.history.pushState({ protected: true, screen: "client-dashboard", clientTab: nextTab }, "", path);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.hash.startsWith("#/panel/cliente")) return;
      if (window.location.hash.includes("/reservas")) setTab("my-bookings");
      else if (window.location.hash.includes("/perfil")) setTab("profile");
      else setTab("home");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setProfileSaved(false);
    onDirtyChange(true);
  };

  const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashHeader
        clientName={clientName}
        activeTab={tab}
        onTab={navigateClientTab}
        onExplore={onExplore}
        onLogout={onLogout}
      />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* ── Inicio tab ── */}
        {tab === "home" && (
          <div>
            <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 rounded-2xl p-7 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <h1 className="font-display text-3xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Bienvenido(a)
                </h1>
                <button
                  onClick={onExplore}
                  className="shrink-0 flex items-center gap-2 px-5 py-3 bg-white text-teal-700 font-bold text-sm rounded-xl hover:bg-teal-50 transition-colors shadow-lg shadow-teal-900/20 self-start sm:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Nueva reserva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Mis reservas tab ── */}
        {tab === "my-bookings" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Mis reservas</h2>
              <p className="text-sm text-slate-500 mt-1">Consulta tus citas próximas y anteriores</p>
            </div>
            {visibleAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-sm text-slate-400 mb-5">Aún no tienes citas agendadas ni reservas registradas</p>
                <button onClick={onExplore} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Explorar servicios
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleAppointments.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appt={a}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div className="mx-auto max-w-xl">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">Mi perfil</h2>
              <p className="mt-1 text-sm text-slate-500">Actualiza tus datos personales y guarda los cambios.</p>
            </div>
            {profileSaved && <div className="mb-4"><InlineAlert type="success" message="Tus cambios se guardaron correctamente." /></div>}
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <TextField label="Nombre completo" value={profile.name} onChange={(value) => updateProfile("name", value)} placeholder="Nombre completo" />
              <TextField label="Correo electrónico" value={profile.email} onChange={(value) => updateProfile("email", value)} placeholder="correo@ejemplo.com" type="email" />
              <TextField label="Número de celular" value={profile.phone} onChange={(value) => updateProfile("phone", value.replace(/\D/g, ""))} placeholder="3001234567" type="tel" />
              <button onClick={() => { onDirtyChange(false); setProfileSaved(true); }} className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200">Guardar cambios</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Provider mock data ────────────────────────────────────────────────────────

interface ProviderRequest {
  id: string; client: string; service: string; professional: string; date: string; time: string;
}
interface ProviderBooking {
  id: string; client: string; service: string; professional: string; date: string; time: string;
}
interface ProviderProfessional {
  id: string; name: string; role: string; services: string[]; schedule: string;
  firstName?: string; lastName?: string;
  email: string; phone: string; docType: string; docNumber: string; avatar: string;
}
interface ProviderService {
  id: string; name: string; category: CategoryType; duration: number; price: number; description: string;
}

interface CatalogService {
  id: string; name: string; category: CategoryType; description: string;
}

type ServicioApi = { descripcion: string | null; duracion: number | null; id: number; nombre: string; precio: number | null };
type ProfesionalApi = {
  apellidos: string; correo: string; fotoUrl: string | null; id: string; nombres: string;
  numeroDocumento: string; servicioProveedorIds: number[]; telefono: string; tipoDocumento: string | null;
};
type FranjaApi = { diaSemana: string; horaFin: string; horaInicio: string; id: number };
const DIAS_BACKEND = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

function servicioACatalogo(s: ServicioApi): CatalogService {
  return { id: String(s.id), name: s.nombre, category: (SERVICE_TO_CATEGORY[s.nombre] ?? "") as CategoryType, description: s.descripcion ?? "" };
}

function ofertaAServicio(o: OfertaDetalle): ProviderService {
  return {
    id: String(o.id), name: o.servicio.nombre,
    category: (SERVICE_TO_CATEGORY[o.servicio.nombre] ?? "") as CategoryType,
    duration: o.duracion ?? o.servicio.duracion ?? 0, price: o.precio, description: o.descripcion ?? "",
  };
}

function profesionalAFila(p: ProfesionalApi, servicios: ProviderService[]): ProviderProfessional {
  return {
    id: p.id, name: `${p.nombres} ${p.apellidos}`, firstName: p.nombres, lastName: p.apellidos,
    role: "", schedule: "",
    services: servicios.filter((s) => p.servicioProveedorIds.includes(Number(s.id))).map((s) => s.name),
    email: p.correo, phone: p.telefono, docType: p.tipoDocumento ?? "", docNumber: p.numeroDocumento,
    avatar: p.fotoUrl ? API_BASE_URL + p.fotoUrl : "",
  };
}

function franjasABloques(franjas: FranjaApi[], profId: string): AvailabilityBlock[] {
  return franjas.map((f) => {
    const [sh, sm] = f.horaInicio.split(":").map(Number);
    const [eh, em] = f.horaFin.split(":").map(Number);
    return { id: String(f.id), profId, day: DIAS_BACKEND.indexOf(f.diaSemana), startH: sh, startM: sm, endH: eh, endM: em, type: "available" as const };
  });
}

const PLATFORM_CATALOG: CatalogService[] = [
  { id: "c1", name: "Dermatología", category: "Salud", description: "Consulta especializada en diagnóstico y tratamiento de afecciones de la piel, cabello y uñas." },
  { id: "c2", name: "Nutrición", category: "Salud", description: "Evaluación nutricional y plan alimentario personalizado para mejorar salud y bienestar." },
  { id: "c3", name: "Psicología clínica", category: "Salud", description: "Atención psicológica y terapéutica para el manejo de trastornos emocionales y conductuales." },
  { id: "c4", name: "Medicina estética", category: "Salud", description: "Procedimientos no invasivos e invasivos para mejorar la apariencia facial y corporal." },
  { id: "c5", name: "Fisioterapia", category: "Salud", description: "Rehabilitación física mediante técnicas manuales y ejercicio terapéutico personalizado." },
  { id: "c6", name: "Corte de cabello", category: "Belleza", description: "Corte y estilizado profesional adaptado a las características capilares de cada cliente." },
  { id: "c7", name: "Coloración", category: "Belleza", description: "Técnicas de colorimetría capilar: mechas, balayage, tinte completo y decoloración." },
  { id: "c8", name: "Uñas press-on", category: "Belleza", description: "Aplicación de uñas press-on con diseños personalizados, decoración y nail art." },
  { id: "c9", name: "Manicure/Pedicure", category: "Belleza", description: "Cuidado y embellecimiento de manos y pies: exfoliación, hidratación y esmalte." },
  { id: "c10", name: "Maquillaje", category: "Belleza", description: "Maquillaje profesional para eventos sociales, novias, artístico o de caracterización." },
  { id: "c11", name: "Depilación", category: "Belleza", description: "Depilación con cera, hilo, láser o luz pulsada para piernas, axilas y zona bikini." },
  { id: "c12", name: "Entrenamiento personal", category: "Deporte", description: "Sesiones de entrenamiento individualizadas con profesional certificado según tus objetivos." },
  { id: "c13", name: "Clases de yoga", category: "Deporte", description: "Práctica guiada de yoga: hatha, vinyasa o yin, para todos los niveles." },
  { id: "c14", name: "Fisioterapia deportiva", category: "Deporte", description: "Rehabilitación y prevención de lesiones musculares y articulares en deportistas." },
  { id: "c15", name: "Consulta veterinaria", category: "Mascotas", description: "Revisión general del estado de salud de tu mascota por médico veterinario certificado." },
  { id: "c16", name: "Baño y peluquería canina", category: "Mascotas", description: "Grooming integral: baño, secado, corte de pelo y limpieza de oídos." },
  { id: "c17", name: "Vacunación", category: "Mascotas", description: "Aplicación de vacunas esenciales y refuerzos para perros, gatos y otras mascotas." },
];
interface ProviderHistoryItem {
  id: string; client: string; service: string; professional: string; date: string; time: string; rating?: number;
}

const MOCK_REQUESTS: ProviderRequest[] = [
  { id: "r1", client: "Juliana Herrera", service: "Dermatología", professional: "Dr. Felipe Moreno", date: "lun, 22 sep 2025", time: "9:00 a.m." },
  { id: "r2", client: "Camilo Vargas", service: "Nutrición", professional: "Dra. Natalia Ríos", date: "mar, 23 sep 2025", time: "11:30 a.m." },
  { id: "r3", client: "Sara Londoño", service: "Psicología clínica", professional: "Dra. Marcela Duarte", date: "mié, 24 sep 2025", time: "3:00 p.m." },
];

const MOCK_PROVIDER_BOOKINGS: ProviderBooking[] = [
  { id: "pb1", client: "María García", service: "Dermatología", professional: "Dr. Felipe Moreno", date: "lun, 29 sep 2025", time: "8:30 a.m." },
  { id: "pb2", client: "Andrés Ospina", service: "Medicina estética", professional: "Dr. Simón Vargas", date: "mar, 30 sep 2025", time: "10:00 a.m." },
  { id: "pb3", client: "Valentina Cruz", service: "Nutrición", professional: "Dra. Natalia Ríos", date: "jue, 2 oct 2025", time: "9:00 a.m." },
  { id: "pb4", client: "Diego Ramírez", service: "Fisioterapia", professional: "Dra. Marcela Duarte", date: "vie, 3 oct 2025", time: "4:00 p.m." },
];

const MOCK_PROVIDER_PROFESSIONALS: ProviderProfessional[] = [
  { id: "pp1", name: "Dra. Laura Gómez", role: "Medicina General", services: ["Dermatología", "Medicina estética"], schedule: "Lun–Vie, 8:00 a.m.–2:00 p.m.", email: "laura.gomez@consultmed.com", phone: "+57 3001234567", docType: "Cédula de ciudadanía", docNumber: "1020304050", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format" },
  { id: "pp2", name: "Dr. Andrés Ruiz", role: "Odontología", services: ["Nutrición"], schedule: "Lun–Jue, 9:00 a.m.–4:00 p.m.", email: "andres.ruiz@consultmed.com", phone: "+57 3109876543", docType: "Cédula de ciudadanía", docNumber: "1098765432", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format" },
  { id: "pp5", name: "Sofía Mejía", role: "Nutrición", services: ["Nutrición"], schedule: "Por definir", email: "sofia.mejia@consultmed.com", phone: "+57 3207654321", docType: "Cédula de ciudadanía", docNumber: "1032456789", avatar: "" },
  { id: "pp3", name: "Dra. Marcela Duarte", role: "Psicología Clínica", services: ["Psicología clínica", "Fisioterapia"], schedule: "Mar–Sáb, 10:00 a.m.–6:00 p.m.", email: "m.duarte@consultmed.co", phone: "+57 300 112 9988", docType: "Cédula de ciudadanía", docNumber: "43761204", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format" },
  { id: "pp4", name: "Dr. Simón Vargas", role: "Medicina Estética", services: ["Medicina estética"], schedule: "Lun–Vie, 9:30 a.m.–5:00 p.m.", email: "s.vargas@consultmed.co", phone: "+57 320 554 3310", docType: "Cédula de ciudadanía", docNumber: "88204531", avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&auto=format" },
];

const MOCK_PROVIDER_SERVICES: ProviderService[] = [
  { id: "ps1", name: "Dermatología", category: "Salud", duration: 45, price: 120000, description: "Consulta especializada en diagnóstico y tratamiento de afecciones de la piel, cabello y uñas." },
  { id: "ps2", name: "Nutrición", category: "Salud", duration: 60, price: 85000, description: "Evaluación nutricional y plan alimentario personalizado para mejorar salud y bienestar." },
  { id: "ps3", name: "Psicología clínica", category: "Salud", duration: 60, price: 95000, description: "Atención psicológica y terapéutica para el manejo de trastornos emocionales y conductuales." },
  { id: "ps4", name: "Medicina estética", category: "Salud", duration: 90, price: 250000, description: "Procedimientos no invasivos e invasivos para mejorar la apariencia facial y corporal." },
  { id: "ps5", name: "Fisioterapia", category: "Salud", duration: 60, price: 70000, description: "Rehabilitación física mediante técnicas manuales y ejercicio terapéutico personalizado." },
];

const MOCK_PROVIDER_HISTORY: ProviderHistoryItem[] = [
  { id: "ph1", client: "Laura Espinosa", service: "Dermatología", professional: "Dr. Felipe Moreno", date: "mar, 9 sep 2025", time: "8:30 a.m.", rating: 5 },
  { id: "ph2", client: "Tomás Aguilar", service: "Nutrición", professional: "Dra. Natalia Ríos", date: "jue, 4 sep 2025", time: "11:30 a.m.", rating: 4 },
  { id: "ph3", client: "Rebeca Solano", service: "Psicología clínica", professional: "Dra. Marcela Duarte", date: "lun, 1 sep 2025", time: "3:00 p.m." },
  { id: "ph4", client: "Gabriel Ayala", service: "Medicina estética", professional: "Dr. Simón Vargas", date: "vie, 29 ago 2025", time: "10:00 a.m.", rating: 5 },
];

// ─── Availability helpers ─────────────────────────────────────────────────────

function fmtHour(h: number, m: number): string {
  const period = h < 12 ? "a.m." : "p.m.";
  const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hh}:${m === 0 ? "00" : String(m).padStart(2, "0")} ${period}`;
}

const TIME_OPTS: { label: string; h: number; m: number }[] = [];
for (let _h = 6; _h <= 22; _h++) {
  TIME_OPTS.push({ label: fmtHour(_h, 0), h: _h, m: 0 });
  if (_h < 22) TIME_OPTS.push({ label: fmtHour(_h, 30), h: _h, m: 30 });
}

// ─── Provider Header ───────────────────────────────────────────────────────────

function ProviderHeader({
  providerName,
  activeTab,
  onTab,
  onLogout,
}: {
  providerName: string;
  activeTab: ProviderTab;
  onTab: (t: ProviderTab) => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs: { id: ProviderTab; label: string }[] = [
    { id: "dashboard", label: "Pantalla principal" },
    { id: "professionals", label: "Gestionar profesionales" },
    { id: "services", label: "Gestionar servicios" },
  ];

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg className="text-white" fill="currentColor" viewBox="0 0 24 24" style={{ width: "16px", height: "16px" }}>
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-display font-bold text-slate-900 text-lg hidden sm:block" style={{ fontFamily: "Outfit, sans-serif" }}>AgendaYa</span>
        </div>

        {/* Nav — desktop */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* User menu — desktop */}
        <div className="relative ml-auto hidden shrink-0 lg:block">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0H5z" /></svg>
            <span className="max-w-36 truncate">{providerName}</span>
            <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
              <button role="menuitem" onClick={() => { setMenuOpen(false); onTab("profile"); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0H5z" /></svg>
                Mi perfil
              </button>
              <button role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
        <button onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden">
          {menuOpen ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
        </button>
      </div>

      {menuOpen && (
        <nav className="space-y-1 border-t border-slate-100 bg-white p-3 lg:hidden" aria-label="Menú principal">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => { setMenuOpen(false); onTab(t.id); }} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium ${activeTab === t.id ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}>{t.label}</button>
          ))}
          <button onClick={() => { setMenuOpen(false); onTab("profile"); }} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium ${activeTab === "profile" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}>Mi perfil</button>
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
            Cerrar sesión
          </button>
        </nav>
      )}
    </header>
  );
}

// ─── Provider Dashboard ────────────────────────────────────────────────────────

function ProviderDashboard({
  providerName,
  onLogout,
  onDirtyChange,
}: {
  providerName: string;
  onLogout: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const nit = sesionActual()?.cuenta.id ?? "";
  const [tab, setTab] = useState<ProviderTab>("dashboard");
  const [requests, setRequests] = useState<ProviderRequest[]>(MOCK_REQUESTS);
  const [bookings, setBookings] = useState<ProviderBooking[]>(MOCK_PROVIDER_BOOKINGS);
  const [professionals, setProfessionals] = useState<ProviderProfessional[]>([]);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [history] = useState<ProviderHistoryItem[]>(MOCK_PROVIDER_HISTORY);
  const [profile, setProfile] = useState({ company: providerName, email: "proveedor@agendaya.com", phone: "3001234567" });
  const [profileSaved, setProfileSaved] = useState(false);

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setProfileSaved(false);
    onDirtyChange(true);
  };

  const [agendaProfId, setAgendaProfId] = useState<string | null>(null);
  const [availBlocks, setAvailBlocks] = useState<AvailabilityBlock[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogService[]>([]);

  // Professionals tab state
  const [addProfOpen, setAddProfOpen] = useState(false);
  const [editProfId, setEditProfId] = useState<string | null>(null);
  const [removeProfId, setRemoveProfId] = useState<string | null>(null);
  const [profForm, setProfForm] = useState({ avatar: "", docType: "", docNumber: "", firstName: "", lastName: "", email: "", phone: "" });
  const [profFormServices, setProfFormServices] = useState<string[]>([]);
  const [profFormSubmitted, setProfFormSubmitted] = useState(false);
  const [profFormAlert, setProfFormAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [profFormErrors, setProfFormErrors] = useState<Partial<Record<"docType" | "docNumber" | "firstName" | "lastName" | "email" | "phone" | "services", string>>>({});
  const [profFormTouched, setProfFormTouched] = useState<Partial<Record<"docType" | "docNumber" | "firstName" | "lastName" | "email" | "phone" | "services", boolean>>>({});
  const [professionalToast, setProfessionalToast] = useState("");
  const profDocTypeRef = useRef<HTMLSelectElement>(null);
  const profDocNumberRef = useRef<HTMLInputElement>(null);
  const profFirstNameRef = useRef<HTMLInputElement>(null);
  const profLastNameRef = useRef<HTMLInputElement>(null);
  const profEmailRef = useRef<HTMLInputElement>(null);
  const profPhoneRef = useRef<HTMLInputElement>(null);
  const profServicesRef = useRef<HTMLDivElement>(null);

  const AVATAR_POOL = [
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&auto=format",
  ];

  const splitProfessionalName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return {
      firstName: parts.slice(0, -1).join(" "),
      lastName: parts.at(-1) ?? "",
    };
  };

  const openAddProf = () => {
    setProfForm({ avatar: "", docType: "", docNumber: "", firstName: "", lastName: "", email: "", phone: "" });
    setProfFormServices([]);
    setProfFormSubmitted(false);
    setProfFormAlert(null);
    setProfFormErrors({});
    setProfFormTouched({});
    setProfessionalToast("");
    setEditProfId(null);
    setAddProfOpen(true);
  };

  const openEditProf = (p: ProviderProfessional) => {
    const { firstName, lastName } = p.firstName && p.lastName
      ? { firstName: p.firstName, lastName: p.lastName }
      : splitProfessionalName(p.name);
    setProfForm({ avatar: p.avatar, docType: p.docType, docNumber: p.docNumber, firstName, lastName, email: p.email, phone: p.phone });
    setProfFormServices(p.services);
    setProfFormSubmitted(false);
    setProfFormAlert(null);
    setProfFormErrors({});
    setProfFormTouched({});
    setEditProfId(p.id);
    setAddProfOpen(true);
  };

  const closeAddProf = () => {
    setAddProfOpen(false);
    setEditProfId(null);
    setProfFormSubmitted(false);
    setProfFormAlert(null);
    setProfFormErrors({});
    setProfFormTouched({});
  };

  type ProfFormField = "docType" | "docNumber" | "firstName" | "lastName" | "email" | "phone";

  const normalizeName = (value: string) => value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(dra?|doctor(?:a)?)\\.?\\s+/i, "")
    .toLocaleLowerCase("es");
  const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.startsWith("57") && digits.length > 10 ? digits.slice(2) : digits;
  };

  const validateProfField = (field: ProfFormField, value: string): string => {
    const normalizedValue = field === "phone" ? normalizePhone(value) : value.trim();
    if (!normalizedValue) return "Este campo es obligatorio";
    const otherProfessionals = professionals.filter((professional) => professional.id !== editProfId);
    if (field === "docNumber" && otherProfessionals.some((professional) => professional.docNumber.trim() === value.trim())) {
      return "Este profesional ya está registrado con ese número de documento";
    }
    const fullName = `${field === "firstName" ? value : profForm.firstName} ${field === "lastName" ? value : profForm.lastName}`.trim();
    if (field === "lastName" && otherProfessionals.some((professional) => normalizeName(professional.name) === normalizeName(fullName))) {
      return "Ya existe un profesional con este nombre";
    }
    if (field === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Ingresa un correo válido";
      if (otherProfessionals.some((professional) => professional.email.trim().toLowerCase() === value.trim().toLowerCase())) {
        return "Este correo ya está en uso";
      }
    }
    if (field === "phone" && otherProfessionals.some((professional) => normalizePhone(professional.phone) === normalizePhone(value))) {
      return "Este teléfono ya está en uso";
    }
    return "";
  };

  const updateProfField = (field: ProfFormField, value: string) => {
    setProfForm((current) => ({ ...current, [field]: value }));
    if (profFormSubmitted || profFormTouched[field]) {
      setProfFormErrors((current) => ({ ...current, [field]: validateProfField(field, value) }));
    }
  };

  const blurProfField = (field: ProfFormField) => {
    setProfFormTouched((current) => ({ ...current, [field]: true }));
    setProfFormErrors((current) => ({ ...current, [field]: validateProfField(field, profForm[field]) }));
  };

  const toggleProfService = (serviceName: string) => {
    const nextServices = profFormServices.includes(serviceName)
      ? profFormServices.filter((service) => service !== serviceName)
      : [...profFormServices, serviceName];
    setProfFormServices(nextServices);
    if (profFormSubmitted || profFormTouched.services) {
      setProfFormErrors((current) => ({ ...current, services: nextServices.length > 0 ? "" : "Debes seleccionar al menos un servicio" }));
    }
  };

  const handleSaveProf = async () => {
    setProfFormSubmitted(true);
    setProfFormAlert(null);
    const fieldOrder: ProfFormField[] = ["docType", "docNumber", "firstName", "lastName", "email", "phone"];
    const nextErrors = fieldOrder.reduce<Partial<Record<ProfFormField | "services", string>>>((result, field) => {
      const error = validateProfField(field, profForm[field]);
      if (error) result[field] = error;
      return result;
    }, {});
    if (profFormServices.length === 0) nextErrors.services = "Debes seleccionar al menos un servicio";
    setProfFormErrors(nextErrors);

    const firstError = [...fieldOrder, "services" as const].find((field) => nextErrors[field]);
    if (firstError) {
      const refs = {
        docType: profDocTypeRef,
        docNumber: profDocNumberRef,
        firstName: profFirstNameRef,
        lastName: profLastNameRef,
        email: profEmailRef,
        phone: profPhoneRef,
        services: profServicesRef,
      };
      refs[firstError].current?.focus();
      return;
    }
    const { firstName, lastName, email, phone } = profForm;
    const name = `${firstName.trim()} ${lastName.trim()}`;
    if (editProfId) {
      setProfessionals((prev) => prev.map((p) => p.id === editProfId ? {
        ...p,
        name,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatar: profForm.avatar,
        docType: profForm.docType,
        docNumber: profForm.docNumber.trim(),
        email: email.trim(),
        phone,
        services: profFormServices,
      } : p));
    } else {
      const ids = services.filter((sv) => profFormServices.includes(sv.name)).map((sv) => Number(sv.id));
      try {
        const creado = await pedir<ProfesionalApi>(ENDPOINTS.profesionales(nit), {
          metodo: "POST", conSesion: true, cuerpo: aProfesional(profForm, ids),
        });
        setProfessionals((prev) => [...prev, profesionalAFila(creado, services)]);
      } catch (e) {
        setProfFormAlert({ type: "error", message: e instanceof ErrorApi ? e.mensajes.join(" ") : "No se pudo registrar el profesional." });
        return;
      }
    }
    setProfessionalToast(editProfId ? "Cambios guardados exitosamente." : "Profesional registrado correctamente");
    closeAddProf();
  };

  // Services tab state
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogCategory, setCatalogCategory] = useState<CategoryType | "">("");
  const [selectedCatalogEntry, setSelectedCatalogEntry] = useState<CatalogService | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [serviceFormSubmitted, setServiceFormSubmitted] = useState(false);
  const [serviceToast, setServiceToast] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [removingServiceId, setRemovingServiceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const serviceRegisteringRef = useRef(false);
  const newPriceRef = useRef<HTMLInputElement>(null);
  const newDurationRef = useRef<HTMLInputElement>(null);
  const newDescriptionRef = useRef<HTMLTextAreaElement>(null);

  const filteredCatalog = catalogo.filter((e) => {
    if (catalogCategory && e.category !== catalogCategory) return false;
    if (catalogQuery && !e.name.toLowerCase().includes(catalogQuery.toLowerCase())) return false;
    return true;
  });

  const closeAddPanel = () => {
    setAddServiceOpen(false);
    setCatalogQuery("");
    setCatalogCategory("");
    setSelectedCatalogEntry(null);
    setNewPrice("");
    setNewDuration("");
    setNewDescription("");
    setDescriptionTouched(false);
    setServiceFormSubmitted(false);
  };

  const openAddPanel = () => {
    setServiceToast("");
    setCatalogQuery("");
    setCatalogCategory("");
    setSelectedCatalogEntry(null);
    setNewPrice("");
    setNewDuration("");
    setNewDescription("");
    setDescriptionTouched(false);
    setServiceFormSubmitted(false);
    setAddServiceOpen(true);
  };

  const selectServiceForConfiguration = (entry: CatalogService) => {
    setSelectedCatalogEntry(entry);
    setNewDescription(entry.description);
    setDescriptionTouched(false);
    setServiceFormSubmitted(false);
  };

  const registerSelectedService = async () => {
    setServiceFormSubmitted(true);
    if (!newDescription.trim()) {
      newDescriptionRef.current?.focus();
      return;
    }
    if (!newPrice || Number(newPrice) <= 0) {
      newPriceRef.current?.focus();
      return;
    }
    if (!newDuration || Number(newDuration) <= 0 || !Number.isInteger(Number(newDuration))) {
      newDurationRef.current?.focus();
      return;
    }
    if (!selectedCatalogEntry || serviceRegisteringRef.current) return;

    serviceRegisteringRef.current = true;
    try {
      const creada = await pedir<OfertaDetalle>(ENDPOINTS.serviciosProveedor(nit), {
        metodo: "POST", conSesion: true,
        cuerpo: aServicioProveedor(Number(selectedCatalogEntry.id), newPrice, newDuration, newDescription.trim()),
      });
      setServices((previous) => [...previous, ofertaAServicio(creada)]);
      setServiceToast("Servicio configurado correctamente");
      closeAddPanel();
    } catch (e) {
      setServiceToast(e instanceof ErrorApi ? e.mensajes[0] : "No se pudo guardar el servicio.");
    } finally {
      serviceRegisteringRef.current = false;
    }
  };

  useEffect(() => {
    if (!nit) return;
    let vigente = true;
    (async () => {
      try {
        const [cat, ofertas] = await Promise.all([
          pedir<ServicioApi[]>(ENDPOINTS.servicios),
          pedir<OfertaDetalle[]>(ENDPOINTS.serviciosProveedor(nit)),
        ]);
        const servicios = ofertas.map(ofertaAServicio);
        const profs = await pedir<ProfesionalApi[]>(ENDPOINTS.profesionales(nit), { conSesion: true });
        const filas = profs.map((p) => profesionalAFila(p, servicios));
        const bloques = await Promise.all(filas.map((p) =>
          pedir<FranjaApi[]>(ENDPOINTS.horario(nit, p.id), { conSesion: true }).then((f) => franjasABloques(f, p.id)).catch(() => [] as AvailabilityBlock[])));
        if (!vigente) return;
        setCatalogo(cat.map(servicioACatalogo));
        setServices(servicios);
        setProfessionals(filas);
        setAvailBlocks(bloques.flat());
      } catch (e) {
        if (vigente) setServiceToast(e instanceof ErrorApi ? e.mensajes[0] : "No pudimos cargar tus datos.");
      }
    })();
    return () => { vigente = false; };
  }, [nit]);

  const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const catColors: Record<string, string> = {
    "Belleza": "bg-pink-50 text-pink-700",
    "Salud": "bg-blue-50 text-blue-700",
    "Deporte": "bg-orange-50 text-orange-700",
    "Mascotas": "bg-emerald-50 text-emerald-700",
    "Bienestar": "bg-violet-50 text-violet-700",
    "Educación": "bg-amber-50 text-amber-700",
  };

  // ── Shared section wrapper ──
  const Section = ({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );

  const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ProviderHeader providerName={providerName} activeTab={tab} onTab={setTab} onLogout={onLogout} />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* ── Dashboard ── */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            {/* Welcome banner */}
            <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 rounded-2xl p-7 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
              <div className="relative">
                <h1 className="font-display text-3xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>Bienvenido(a)</h1>
              </div>
            </div>

          </div>
        )}

        {/* ── Reservas ── */}
        {tab === "bookings" && (
          <div>
            <Section title="Reservas" subtitle="Citas confirmadas en tu agenda" />

            {/* Pending requests */}
            {requests.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Por aceptar ({requests.length})</h3>
                </div>
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Solicitud</span>
                          <span className="text-xs text-slate-400">{r.service}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{r.client}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.professional} · <span className="capitalize">{r.date}</span> · {r.time}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setBookings((b) => [...b, { id: r.id, client: r.client, service: r.service, professional: r.professional, date: r.date, time: r.time }]); setRequests((prev) => prev.filter((x) => x.id !== r.id)); }} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors">Aceptar</button>
                        <button onClick={() => setRequests((prev) => prev.filter((x) => x.id !== r.id))} className="px-4 py-2 border border-red-100 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors">Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed bookings */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Confirmadas ({bookings.length})</h3>
              </div>
              {bookings.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No hay reservas confirmadas.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">Confirmada</span>
                          <span className="text-xs text-slate-400">{b.service}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{b.client}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{b.professional} · <span className="capitalize">{b.date}</span> · {b.time}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setBookings((prev) => prev.filter((x) => x.id !== b.id))} className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors">Cancelar</button>
                        <button onClick={() => setBookings((prev) => prev.filter((x) => x.id !== b.id))} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors">Finalizar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Gestionar profesionales ── */}
        {tab === "professionals" && (
          <>
            {agendaProfId ? (
              <ProfAgenda
                nit={nit}
                prof={professionals.find(p => p.id === agendaProfId)!}
                allBlocks={availBlocks}
                onBlocksChange={setAvailBlocks}
                onBack={() => setAgendaProfId(null)}
              />
            ) : (
            <>
            {/* Delete confirmation modal */}
            {removeProfId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRemoveProfId(null)} />
                <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>¿Eliminar este profesional?</h3>
                  <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">Se quitará del equipo y sus citas activas deberán ser reasignadas manualmente.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setRemoveProfId(null)} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button onClick={() => { setProfessionals((prev) => prev.filter((x) => x.id !== removeProfId)); setRemoveProfId(null); }} className="flex-1 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">Eliminar</button>
                  </div>
                </div>
              </div>
            )}

            {/* Add / Edit professional modal */}
            {addProfOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAddProf} />
                <div className="relative w-full max-w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col z-10">
                  {/* Modal header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {editProfId ? "Editar profesional" : "Agregar profesional"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Completa los datos del miembro del equipo</p>
                    </div>
                    <button onClick={closeAddProf} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {/* Form body */}
                  <div className="flex-1 overflow-y-auto px-6 pt-5 pb-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
                    {/* Alert */}
                    {profFormAlert && (
                      <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${profFormAlert.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-700"}`}>
                        {profFormAlert.type === "success"
                          ? <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          : <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
                        <span>{profFormAlert.message}</span>
                      </div>
                    )}

                    {/* Avatar upload */}
                    <div className="flex flex-col items-center gap-3">
                      {profForm.avatar ? (
                        <div className="relative">
                          <img src={profForm.avatar} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover border-2 border-teal-200 bg-slate-100" />
                          <button
                            onClick={() => setProfForm((f) => ({ ...f, avatar: "" }))}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <label className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 hover:border-teal-400 focus-within:ring-2 focus-within:ring-teal-300 bg-slate-50 hover:bg-teal-50 flex flex-col items-center justify-center gap-1 transition-colors group cursor-pointer">
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              if (!file) return;
                              if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 5 * 1024 * 1024) {
                                setProfFormAlert({ type: "error", message: "Sube una imagen en formato PNG o JPG" });
                                return;
                              }
                              setProfFormAlert(null);
                              const reader = new FileReader();
                              reader.onload = () => setProfForm((f) => ({ ...f, avatar: String(reader.result) }));
                              reader.readAsDataURL(file);
                            }}
                          />
                          <svg className="w-6 h-6 text-slate-300 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-[10px] text-slate-400 group-hover:text-teal-600 font-medium transition-colors">Foto</span>
                        </label>
                      )}
                      <p className="text-[11px] text-slate-400 text-center">Haz clic para cargar una foto de perfil (PNG o JPG, máx. 5 MB)</p>
                    </div>

                    {/* Tipo de documento */}
                    <div>
                      <label htmlFor="prof-doc-type" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Tipo de documento</label>
                      <div className="relative">
                        <select
                          ref={profDocTypeRef}
                          id="prof-doc-type"
                          value={profForm.docType}
                          onChange={(e) => updateProfField("docType", e.target.value)}
                          onBlur={() => blurProfField("docType")}
                          aria-invalid={Boolean(profFormErrors.docType)}
                          aria-describedby={profFormErrors.docType ? "prof-doc-type-error" : undefined}
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white outline-none focus:border-teal-400 transition-colors appearance-none pr-8 ${profFormErrors.docType ? "border-red-300" : "border-slate-200"}`}
                        >
                          <option value="">Selecciona un tipo</option>
                          {["Cédula de ciudadanía", "Cédula de extranjería", "Pasaporte", "Tarjeta de identidad"].map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                      {profFormErrors.docType && <p id="prof-doc-type-error" className="mt-1 text-xs text-red-500">{profFormErrors.docType}</p>}
                    </div>

                    {/* Número de documento */}
                    <div>
                      <label htmlFor="prof-doc-number" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Número de documento</label>
                      <input
                        ref={profDocNumberRef}
                        id="prof-doc-number"
                        type="number"
                        value={profForm.docNumber}
                        onChange={(e) => updateProfField("docNumber", e.target.value)}
                        onBlur={() => blurProfField("docNumber")}
                        placeholder="Ej. 79451823"
                        aria-invalid={Boolean(profFormErrors.docNumber)}
                        aria-describedby={profFormErrors.docNumber ? "prof-doc-number-error" : undefined}
                        className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white outline-none focus:border-teal-400 transition-colors ${profFormErrors.docNumber ? "border-red-300" : "border-slate-200"}`}
                      />
                      {profFormErrors.docNumber && <p id="prof-doc-number-error" className="mt-1 text-xs text-red-500">{profFormErrors.docNumber}</p>}
                    </div>

                    {/* Nombres y apellidos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="prof-first-name" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Nombres</label>
                        <input
                          ref={profFirstNameRef}
                          id="prof-first-name"
                          type="text"
                          value={profForm.firstName}
                          onChange={(e) => updateProfField("firstName", e.target.value)}
                          onBlur={() => blurProfField("firstName")}
                          placeholder="Ej. Natalia"
                          aria-invalid={Boolean(profFormErrors.firstName)}
                          aria-describedby={profFormErrors.firstName ? "prof-first-name-error" : undefined}
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white outline-none focus:border-teal-400 transition-colors ${profFormErrors.firstName ? "border-red-300" : "border-slate-200"}`}
                        />
                        {profFormErrors.firstName && <p id="prof-first-name-error" className="mt-1 text-xs text-red-500">{profFormErrors.firstName}</p>}
                      </div>
                      <div>
                        <label htmlFor="prof-last-name" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Apellidos</label>
                        <input
                          ref={profLastNameRef}
                          id="prof-last-name"
                          type="text"
                          value={profForm.lastName}
                          onChange={(e) => updateProfField("lastName", e.target.value)}
                          onBlur={() => blurProfField("lastName")}
                          placeholder="Ej. Ríos"
                          aria-invalid={Boolean(profFormErrors.lastName)}
                          aria-describedby={profFormErrors.lastName ? "prof-last-name-error" : undefined}
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white outline-none focus:border-teal-400 transition-colors ${profFormErrors.lastName ? "border-red-300" : "border-slate-200"}`}
                        />
                        {profFormErrors.lastName && <p id="prof-last-name-error" className="mt-1 text-xs text-red-500">{profFormErrors.lastName}</p>}
                      </div>
                    </div>

                    {/* Correo electrónico */}
                    <div>
                      <label htmlFor="prof-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Correo electrónico</label>
                      <input
                        ref={profEmailRef}
                        id="prof-email"
                        type="email"
                        value={profForm.email}
                        onChange={(e) => updateProfField("email", e.target.value)}
                        onBlur={() => blurProfField("email")}
                        placeholder="Ej. n.rios@consultmed.co"
                        aria-invalid={Boolean(profFormErrors.email)}
                        aria-describedby={profFormErrors.email ? "prof-email-error" : undefined}
                        className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white outline-none focus:border-teal-400 transition-colors ${profFormErrors.email ? "border-red-300" : "border-slate-200"}`}
                      />
                      {profFormErrors.email && <p id="prof-email-error" className="mt-1 text-xs text-red-500">{profFormErrors.email}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label htmlFor="prof-phone" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Teléfono</label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 shrink-0 text-sm text-slate-600 font-medium select-none">
                          <span className="text-base leading-none">🇨🇴</span>
                          <span>+57</span>
                        </div>
                        <input
                          ref={profPhoneRef}
                          id="prof-phone"
                          type="tel"
                          value={profForm.phone.replace(/^\+57\s?/, "")}
                          onChange={(e) => updateProfField("phone", e.target.value ? `+57 ${e.target.value}` : "")}
                          onBlur={() => blurProfField("phone")}
                          placeholder="310 234 5678"
                          aria-invalid={Boolean(profFormErrors.phone)}
                          aria-describedby={profFormErrors.phone ? "prof-phone-error" : undefined}
                          className={`flex-1 px-3 py-2.5 text-sm border rounded-xl bg-white outline-none focus:border-teal-400 transition-colors ${profFormErrors.phone ? "border-red-300" : "border-slate-200"}`}
                        />
                      </div>
                      {profFormErrors.phone && <p id="prof-phone-error" className="mt-1 text-xs text-red-500">{profFormErrors.phone}</p>}
                    </div>

                    {/* Servicios que puede prestar */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Servicios que puede prestar</label>
                      {services.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-5 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                          <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          <p className="text-xs text-slate-500 leading-relaxed">Primero debes agregar servicios a tu oferta para poder asignárselos a un profesional.</p>
                          <button onClick={() => { closeAddProf(); setTab("services"); }} className="text-xs font-semibold text-teal-600 hover:underline">
                            Ir a Gestionar servicios →
                          </button>
                        </div>
                      ) : (
                        <div
                          ref={profServicesRef}
                          tabIndex={-1}
                          onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                              setProfFormTouched((current) => ({ ...current, services: true }));
                              setProfFormErrors((current) => ({ ...current, services: profFormServices.length > 0 ? "" : "Debes seleccionar al menos un servicio" }));
                            }
                          }}
                          className={`space-y-2 max-h-40 overflow-y-auto pr-0.5 rounded-xl border p-3 ${profFormErrors.services ? "border-red-300" : "border-slate-200"}`}
                          style={{ scrollbarWidth: "thin" }}
                        >
                          {services.map((svc) => {
                            const checked = profFormServices.includes(svc.name);
                            return (
                              <label key={svc.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${checked ? "bg-teal-50" : "hover:bg-slate-50"}`}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleProfService(svc.name)}
                                  className="w-4 h-4 rounded accent-teal-600 shrink-0"
                                />
                                <span className="text-sm font-medium text-slate-700 flex-1">{svc.name}</span>
                                <CategoryBadge category={svc.category} />
                              </label>
                            );
                          })}
                        </div>
                      )}
                      {profFormErrors.services && <p className="mt-1 text-xs text-red-500">{profFormErrors.services}</p>}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="px-6 py-4 border-t border-slate-100 shrink-0">
                    <button
                      onClick={handleSaveProf}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors"
                    >
                      {editProfId ? "Guardar cambios" : "Guardar profesional"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Section
              title="Gestionar profesionales"
              subtitle=""
              action={<AddButton label="Agregar profesional" onClick={openAddProf} />}
            />

            {professionalToast && (
              <div role="status" className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {professionalToast}
              </div>
            )}

            {professionals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Aún no has registrado profesionales</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">Agrega los miembros de tu equipo para que los clientes puedan ver sus perfiles y agendar citas con ellos.</p>
                <button onClick={openAddProf} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Agregar profesional
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {professionals.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-full object-cover bg-slate-100 shrink-0 border-2 border-slate-100" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-base font-bold text-teal-700 shrink-0">
                          {p.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("")}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm leading-tight">{p.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span className="truncate">{p.email}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {p.phone}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Servicios:</span>
                      {p.services.length === 0
                        ? <span className="text-xs text-slate-300 italic">Sin servicios asignados</span>
                        : p.services.map((s) => (
                          <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium border border-teal-100">{s}</span>
                        ))}
                      <button
                        onClick={() => setAgendaProfId(p.id)}
                        className="ml-auto flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Ver agenda
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </>
            )}
          </>
        )}

        {/* ── Gestionar servicios ── */}
        {tab === "services" && (
          <>
            {/* Remove service confirmation modal */}
            {removingServiceId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRemovingServiceId(null)} />
                <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>¿Quitar este servicio de tu oferta?</h3>
                  <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">El servicio seguirá disponible en el catálogo de la plataforma y podrás volver a agregarlo cuando quieras.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setRemovingServiceId(null)} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button onClick={() => { setServices((prev) => prev.filter((x) => x.id !== removingServiceId)); setRemovingServiceId(null); }} className="flex-1 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">Quitar</button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit service modal */}
            {editingServiceId && (() => {
              const svc = services.find((x) => x.id === editingServiceId);
              if (!svc) return null;
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingServiceId(null)} />
                  <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Editar servicio</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{svc.name}</p>
                      </div>
                      <button onClick={() => setEditingServiceId(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="px-5 py-5 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Precio</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                          <input autoFocus type="number" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-400 transition-colors" />
                        </div>
                        {editPrice && Number(editPrice) > 0 && (
                          <p className="text-xs text-teal-600 mt-1 font-medium">${Number(editPrice).toLocaleString("es-CO")}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Duración en minutos</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="Ej. 45"
                            className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none focus:border-teal-400 transition-colors ${editDuration !== "" && (Number(editDuration) <= 0 || !Number.isInteger(Number(editDuration))) ? "border-red-300" : "border-slate-200"}`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">min</span>
                        </div>
                        {editDuration !== "" && (Number(editDuration) <= 0 || !Number.isInteger(Number(editDuration))) && (
                          <p className="mt-1 text-xs text-red-500">Ingresa un número de minutos mayor a 0</p>
                        )}
                      </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                      <button onClick={() => setEditingServiceId(null)} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                      <button
                        disabled={!editPrice || Number(editPrice) <= 0 || !editDuration || Number(editDuration) <= 0}
                        onClick={() => { setServices((prev) => prev.map((x) => x.id === editingServiceId ? { ...x, price: Number(editPrice), duration: Number(editDuration) } : x)); setEditingServiceId(null); }}
                        className="flex-1 py-2.5 text-sm font-bold bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Add service modal */}
            {addServiceOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAddPanel} />
                <div className="relative w-full max-w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col z-10">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {selectedCatalogEntry ? "Configurar servicio" : "Agregar servicio"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedCatalogEntry ? "Define el precio y duración para tu empresa" : "Selecciona del catálogo de la plataforma"}
                      </p>
                    </div>
                    <button onClick={closeAddPanel} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {!selectedCatalogEntry ? (
                    <div className="flex-1 flex flex-col overflow-hidden px-6 pt-5 pb-6 gap-4">
                      {/* Search */}
                      <div className="relative shrink-0">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                          autoFocus
                          value={catalogQuery}
                          onChange={(e) => setCatalogQuery(e.target.value)}
                          placeholder="Buscar servicio..."
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-400 transition-colors"
                        />
                      </div>
                      {/* Category pills */}
                      <div className="flex gap-2 flex-wrap shrink-0">
                        {(["", ...CATEGORIES] as (CategoryType | "")[]).map((cat) => (
                          <button
                            key={cat || "all"}
                            onClick={() => setCatalogCategory(cat as CategoryType | "")}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${catalogCategory === cat ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {cat || "Todas"}
                          </button>
                        ))}
                      </div>
                      {/* Catalog list */}
                      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5" style={{ scrollbarWidth: "thin" }}>
                        {filteredCatalog.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-10">No hay servicios que coincidan</p>
                        ) : filteredCatalog.map((entry) => {
                          const alreadyAdded = services.some((s) => s.name === entry.name);
                          return (
                            <button
                              key={entry.id}
                              disabled={alreadyAdded}
                              onClick={() => !alreadyAdded && selectServiceForConfiguration(entry)}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${alreadyAdded ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed" : "border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 cursor-pointer"}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-sm font-semibold text-slate-800 leading-tight">{entry.name}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  {alreadyAdded && (
                                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full whitespace-nowrap">Ya lo ofreces</span>
                                  )}
                                  <CategoryBadge category={entry.category} />
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{entry.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-3 space-y-5" style={{ scrollbarWidth: "thin" }}>
                        <button
                          onClick={() => {
                            setSelectedCatalogEntry(null);
                            setNewDescription("");
                            setDescriptionTouched(false);
                            setServiceFormSubmitted(false);
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          Volver al catálogo
                        </button>

                        {/* Read-only service info */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Información del servicio</p>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[11px] text-slate-400 mb-0.5">Nombre</p>
                              <p className="text-sm font-semibold text-slate-800">{selectedCatalogEntry.name}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400 mb-1">Categoría</p>
                              <CategoryBadge category={selectedCatalogEntry.category} />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-300 mt-3 italic">La categoría es definida por la plataforma y no puede modificarse.</p>
                        </div>

                        {/* Editable fields */}
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="service-custom-description" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Descripción</label>
                            <textarea
                              ref={newDescriptionRef}
                              id="service-custom-description"
                              value={newDescription}
                              onChange={(event) => setNewDescription(event.target.value)}
                              onBlur={() => setDescriptionTouched(true)}
                              placeholder="Describe el servicio"
                              rows={4}
                              maxLength={300}
                              required
                              aria-invalid={(descriptionTouched || serviceFormSubmitted) && !newDescription.trim()}
                              aria-describedby={`${(descriptionTouched || serviceFormSubmitted) && !newDescription.trim() ? "service-description-error " : ""}service-description-help`}
                              className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white outline-none focus:border-teal-400 transition-colors resize-none ${
                                (descriptionTouched || serviceFormSubmitted) && !newDescription.trim() ? "border-red-300" : "border-slate-200"
                              }`}
                            />
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div>
                                {newDescription !== selectedCatalogEntry.description && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewDescription(selectedCatalogEntry.description);
                                      setDescriptionTouched(false);
                                    }}
                                    className="text-[11px] font-medium text-slate-400 hover:text-teal-600 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  >
                                    Restaurar descripción original
                                  </button>
                                )}
                              </div>
                              <span className={`text-[11px] tabular-nums ${newDescription.length === 300 ? "font-semibold text-red-500" : "text-slate-400"}`}>
                                {newDescription.length}/300
                              </span>
                            </div>
                            {(descriptionTouched || serviceFormSubmitted) && !newDescription.trim() && (
                              <p id="service-description-error" role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                La descripción es obligatoria
                              </p>
                            )}
                            <p id="service-description-help" className="mt-1 text-[11px] text-slate-400">Puedes personalizar la descripción que verán tus clientes.</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Precio</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                              <input
                                autoFocus
                                ref={newPriceRef}
                                type="number"
                                min="0"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="0"
                                className={`w-full pl-8 pr-4 py-2.5 text-sm border rounded-xl outline-none focus:border-teal-400 transition-colors ${serviceFormSubmitted && (!newPrice || Number(newPrice) <= 0) ? "border-red-300" : "border-slate-200"}`}
                              />
                            </div>
                            {newPrice && Number(newPrice) > 0 && (
                              <p className="text-xs text-teal-600 mt-1 font-medium">${Number(newPrice).toLocaleString("es-CO")}</p>
                            )}
                            {serviceFormSubmitted && (!newPrice || Number(newPrice) <= 0) && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Este campo es obligatorio
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Duración en minutos</label>
                            <div className="relative">
                              <input
                                ref={newDurationRef}
                                type="number"
                                min="1"
                                step="1"
                                value={newDuration}
                                onChange={(e) => setNewDuration(e.target.value.replace(/[^0-9]/g, ""))}
                                placeholder="Ej. 45"
                                className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none focus:border-teal-400 transition-colors ${serviceFormSubmitted && (!newDuration || Number(newDuration) <= 0 || !Number.isInteger(Number(newDuration))) ? "border-red-300" : "border-slate-200"}`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">min</span>
                            </div>
                            {serviceFormSubmitted && (!newDuration || Number(newDuration) <= 0 || !Number.isInteger(Number(newDuration))) && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {!newDuration ? "Este campo es obligatorio" : "Ingresa un número de minutos mayor a 0"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 border-t border-slate-100 shrink-0">
                        <button
                          onClick={registerSelectedService}
                          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors"
                        >
                          Agregar a mis servicios
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Section
              title="Gestionar servicios"
              subtitle=""
              action={<AddButton label="Agregar servicio" onClick={openAddPanel} />}
            />

            {serviceToast && (
              <div role="status" className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {serviceToast}
              </div>
            )}

            {services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Aún no has agregado servicios a tu oferta</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">Agrega los servicios de la plataforma que ofreces para que los clientes puedan encontrarte y agendar citas.</p>
                <button
                  type="button"
                  onClick={openAddPanel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Agregar servicio
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-2">{s.name}</h3>
                        <CategoryBadge category={s.category} />
                      </div>
                    </div>
                    <p className="line-clamp-3 text-xs leading-relaxed text-slate-500" title={s.description}>{s.description}</p>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Precio</p>
                        <p className="text-base font-bold text-slate-900">${s.price.toLocaleString("es-CO")}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Duración</p>
                        <p className="text-base font-bold text-slate-900 flex items-center gap-1">
                          <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {s.duration} min
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Historial ── */}
        {tab === "history" && (
          <div>
            <Section title="Historial de servicios brindados" subtitle="Citas completadas por tu equipo" />
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Completada</span>
                      <span className="text-xs text-slate-400">{h.service}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{h.client}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{h.professional} · <span className="capitalize">{h.date}</span> · {h.time}</p>
                  </div>
                  <div className="text-right shrink-0"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="mx-auto max-w-xl">
            <Section title="Mi perfil" subtitle="Actualiza los datos principales de tu empresa." />
            {profileSaved && <div className="mb-4"><InlineAlert type="success" message="Tus cambios se guardaron correctamente." /></div>}
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <TextField label="Nombre de la empresa" value={profile.company} onChange={(value) => updateProfile("company", value)} placeholder="Nombre de la empresa" />
              <TextField label="Correo de atención" value={profile.email} onChange={(value) => updateProfile("email", value)} placeholder="contacto@empresa.com" type="email" />
              <TextField label="Teléfono de atención" value={profile.phone} onChange={(value) => updateProfile("phone", value.replace(/\D/g, ""))} placeholder="3001234567" type="tel" />
              <button onClick={() => { onDirtyChange(false); setProfileSaved(true); }} className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200">Guardar cambios</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── ProfAgenda ───────────────────────────────────────────────────────────────

function ProfAgenda({
  nit,
  prof,
  allBlocks,
  onBlocksChange,
  onBack,
}: {
  nit: string;
  prof: ProviderProfessional;
  allBlocks: AvailabilityBlock[];
  onBlocksChange: (b: AvailabilityBlock[]) => void;
  onBack: () => void;
}) {
  const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const DAY_INITIALS = ["L", "M", "X", "J", "V", "S", "D"];
  const [modalOpen, setModalOpen] = useState(false);
  // Evita el doble envío: mientras el backend responde, "Guardar" queda deshabilitado
  const [guardando, setGuardando] = useState(false);
  const guardandoRef = useRef(false); // bloquea también dos clics en el mismo instante (antes de que React repinte)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeRows, setTimeRows] = useState([{ id: 1, start: "08:00", end: "12:00" }]);
  const [dayError, setDayError] = useState("");
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const rowStartRefs = useRef<Array<HTMLInputElement | null>>([]);
  const nextRowId = useRef(2);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [warning, setWarning] = useState("");

  const professionalBlocks = allBlocks.filter((block) => block.profId === prof.id);
  const availability = professionalBlocks.filter((block) => block.type === "available");
  const bookings = professionalBlocks.filter((block) => block.type === "booked");

  const toMinutes = (hours: number, minutes: number) => hours * 60 + minutes;
  const parseTime = (value: string) => {
    const match = value.match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return { hours, minutes };
  };
  const overlaps = (startA: number, endA: number, startB: number, endB: number) => startA < endB && endA > startB;

  const clearFeedback = () => {
    setDayError("");
    setRowErrors({});
    setWarning("");
  };

  const openAdd = (day?: number) => {
    setEditingId(null);
    setSelectedDays(day === undefined ? [] : [day]);
    setTimeRows([{ id: nextRowId.current++, start: prof.id === "pp2" ? "09:00" : "08:00", end: prof.id === "pp2" ? "13:00" : "12:00" }]);
    clearFeedback();
    setModalOpen(true);
  };

  const openEdit = (block: AvailabilityBlock) => {
    setEditingId(block.id);
    setSelectedDays([block.day]);
    setTimeRows([{
      id: nextRowId.current++,
      start: `${String(block.startH).padStart(2, "0")}:${String(block.startM).padStart(2, "0")}`,
      end: `${String(block.endH).padStart(2, "0")}:${String(block.endM).padStart(2, "0")}`,
    }]);
    clearFeedback();
    setModalOpen(true);
  };

  const updateTimeRow = (id: number, field: "start" | "end", value: string) => {
    setTimeRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
    setRowErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const addTimeRow = () => {
    if (timeRows.length >= 4) return;
    const id = nextRowId.current++;
    setTimeRows((current) => [...current, { id, start: "", end: "" }]);
    queueMicrotask(() => rowStartRefs.current[timeRows.length]?.focus());
  };

  const removeTimeRow = (id: number) => {
    if (timeRows.length === 1) return;
    setTimeRows((current) => current.filter((row) => row.id !== id));
    setRowErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const saveAvailability = async () => {
    if (guardandoRef.current) return;
    const nextErrors: Record<number, string> = {};
    const parsedRows = timeRows.map((row) => {
      const start = parseTime(row.start);
      const end = parseTime(row.end);
      if (!start || !end) nextErrors[row.id] = "Este campo es obligatorio";
      else if (toMinutes(end.hours, end.minutes) <= toMinutes(start.hours, start.minutes)) {
        nextErrors[row.id] = "La hora de fin debe ser posterior a la de inicio";
      }
      return { ...row, startTime: start, endTime: end };
    });

    parsedRows.forEach((row, index) => {
      if (!row.startTime || !row.endTime || nextErrors[row.id]) return;
      const rowStart = toMinutes(row.startTime.hours, row.startTime.minutes);
      const rowEnd = toMinutes(row.endTime.hours, row.endTime.minutes);
      const crossesAnotherRow = parsedRows.some((other, otherIndex) => {
        if (otherIndex === index || !other.startTime || !other.endTime) return false;
        return overlaps(rowStart, rowEnd, toMinutes(other.startTime.hours, other.startTime.minutes), toMinutes(other.endTime.hours, other.endTime.minutes));
      });
      const crossesSavedAvailability = selectedDays.some((day) => availability.some((block) =>
        block.id !== editingId
        && block.day === day
        && overlaps(rowStart, rowEnd, toMinutes(block.startH, block.startM), toMinutes(block.endH, block.endM))
      ));
      if (crossesAnotherRow || crossesSavedAvailability) nextErrors[row.id] = "Esta franja se cruza con otra del mismo día";
    });

    setDayError(selectedDays.length === 0 ? "Selecciona al menos un día" : "");
    setRowErrors(nextErrors);
    if (selectedDays.length === 0 || Object.keys(nextErrors).length > 0) return;

    if (editingId) {
      const original = availability.find((block) => block.id === editingId);
      if (original) {
        const affectedBookings = bookings.filter((booking) => booking.day === original.day && overlaps(
          toMinutes(original.startH, original.startM),
          toMinutes(original.endH, original.endM),
          toMinutes(booking.startH, booking.startM),
          toMinutes(booking.endH, booking.endM),
        ));
        const keepsBookings = selectedDays.includes(original.day) && affectedBookings.every((booking) =>
          parsedRows.some((row) => row.startTime && row.endTime
            && toMinutes(booking.startH, booking.startM) >= toMinutes(row.startTime.hours, row.startTime.minutes)
            && toMinutes(booking.endH, booking.endM) <= toMinutes(row.endTime.hours, row.endTime.minutes))
        );
        if (!keepsBookings) {
          setWarning("Hay reservas en este horario. Reprograma o cancela las reservas antes de modificarlo");
          return;
        }
      }
    }

    guardandoRef.current = true;
    setGuardando(true);
    try {
      // El backend no tiene "editar franja": se borra la vieja y se crea la nueva.
      if (editingId) await pedir(`${ENDPOINTS.horario(nit, prof.id)}/${editingId}`, { metodo: "DELETE", conSesion: true });
      const franjas = await pedir<FranjaApi[]>(ENDPOINTS.horario(nit, prof.id), {
        metodo: "POST", conSesion: true, cuerpo: aHorario(selectedDays, timeRows),
      });
      const nuevos = franjasABloques(franjas, prof.id);
      const idsNuevos = new Set(nuevos.map((n) => n.id));
      onBlocksChange([...allBlocks.filter((b) => b.id !== editingId && !idsNuevos.has(b.id)), ...nuevos]);
    } catch (e) {
      setWarning(e instanceof ErrorApi ? e.mensajes[0] : "No se pudo guardar la disponibilidad.");
      return;
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
    setModalOpen(false);
    setToast("Disponibilidad agregada correctamente");
    setWarning("");
  };

  const requestDelete = (block: AvailabilityBlock) => {
    const hasBookings = bookings.some((booking) => booking.day === block.day && overlaps(
      toMinutes(block.startH, block.startM),
      toMinutes(block.endH, block.endM),
      toMinutes(booking.startH, booking.startM),
      toMinutes(booking.endH, booking.endM),
    ));
    if (hasBookings) {
      setWarning("Hay reservas en este horario. Reprograma o cancela las reservas antes de modificarlo");
      setToast("");
      return;
    }
    setWarning("");
    setDeleteId(block.id);
  };

  const confirmDelete = async () => {
    try {
      await pedir(`${ENDPOINTS.horario(nit, prof.id)}/${deleteId}`, { metodo: "DELETE", conSesion: true });
    } catch (e) {
      setWarning(e instanceof ErrorApi ? e.mensajes[0] : "No se pudo eliminar la franja.");
      setDeleteId(null);
      return;
    }
    onBlocksChange(allBlocks.filter((block) => block.id !== deleteId));
    setDeleteId(null);
    setToast("Disponibilidad eliminada correctamente");
  };

  return (
    <div>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 012-2h2a2 2 0 012 2v3M4 7h16" /></svg>
            </div>
            <h3 className="font-display text-base font-bold text-slate-900 text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>¿Eliminar esta franja?</h3>
            <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">La disponibilidad dejará de repetirse todas las semanas.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{editingId ? "Editar disponibilidad" : "Agregar disponibilidad"}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{prof.name}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors" aria-label="Cerrar">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Días de la semana</label>
                <div className="grid grid-cols-7 gap-2">
                  {DAY_INITIALS.map((initial, day) => {
                    const checked = selectedDays.includes(day);
                    return (
                      <label key={initial} title={DAY_NAMES[day]} className={`flex h-10 items-center justify-center rounded-xl border cursor-pointer transition-all ${checked ? "border-teal-300 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600"}`}>
                        <input type="checkbox" checked={checked} onChange={() => { setSelectedDays((current) => checked ? current.filter((item) => item !== day) : [...current, day]); setDayError(""); }} className="sr-only" />
                        <span className="text-xs font-bold">{initial}</span>
                      </label>
                    );
                  })}
                </div>
                {dayError && <p className="mt-1 text-xs text-red-500">{dayError}</p>}
              </div>
              <div className="space-y-3">
                {timeRows.map((row, index) => (
                  <div key={row.id}>
                    <div className={`grid gap-3 items-end ${timeRows.length > 1 ? "grid-cols-[1fr_1fr_auto]" : "grid-cols-2"}`}>
                      <div>
                        <label htmlFor={`availability-start-${row.id}`} className="block text-xs font-semibold text-slate-700 mb-1.5">Hora de inicio</label>
                        <input
                          ref={(element) => { rowStartRefs.current[index] = element; }}
                          id={`availability-start-${row.id}`}
                          type="time"
                          value={row.start}
                          onChange={(event) => updateTimeRow(row.id, "start", event.target.value)}
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 ${rowErrors[row.id] ? "border-red-400" : "border-slate-200"}`}
                        />
                      </div>
                      <div>
                        <label htmlFor={`availability-end-${row.id}`} className="block text-xs font-semibold text-slate-700 mb-1.5">Hora de fin</label>
                        <input
                          id={`availability-end-${row.id}`}
                          type="time"
                          value={row.end}
                          onChange={(event) => updateTimeRow(row.id, "end", event.target.value)}
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 ${rowErrors[row.id] ? "border-red-400" : "border-slate-200"}`}
                        />
                      </div>
                      {timeRows.length > 1 && (
                        <button type="button" onClick={() => removeTimeRow(row.id)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors" aria-label={`Eliminar franja ${index + 1}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 012-2h2a2 2 0 012 2v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                    {rowErrors[row.id] && <p className="mt-1 text-xs text-red-500">{rowErrors[row.id]}</p>}
                  </div>
                ))}
                {timeRows.length < 4 && (
                  <button type="button" onClick={addTimeRow} className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Agregar otra franja
                  </button>
                )}
              </div>
              {warning && <p className="text-xs text-red-500 flex items-start gap-1"><svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{warning}</p>}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={saveAvailability} disabled={guardando} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{guardando ? "Guardando…" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={onBack} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Profesionales
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {prof.avatar
              ? <img src={prof.avatar} alt={prof.name} className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-slate-100" />
              : <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-lg font-bold text-teal-700 shrink-0">{prof.name.split(" ").filter(Boolean).map((word) => word[0]).slice(0, 2).join("")}</div>
            }
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold text-slate-900 leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>{prof.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{prof.role}</p>
            </div>
          </div>
          <button onClick={() => openAdd()} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Agregar disponibilidad
          </button>
        </div>
      </div>

      <div className="mb-5">
        <h3 className="font-display text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>Horario semanal</h3>
        <p className="text-sm text-slate-500 mt-1">Este horario se repite todas las semanas</p>
      </div>

      {toast && <div role="status" className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>{toast}</div>}
      {warning && !modalOpen && <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"><svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{warning}</div>}

      {availability.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
          <h3 className="font-display text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Este profesional aún no tiene horario configurado</h3>
          <button onClick={() => openAdd()} className="mt-5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">Agregar disponibilidad</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {DAY_NAMES.map((dayName, day) => {
            const dayAvailability = availability.filter((block) => block.day === day).sort((first, second) => toMinutes(first.startH, first.startM) - toMinutes(second.startH, second.startM));
            const dayBookings = bookings.filter((block) => block.day === day).sort((first, second) => toMinutes(first.startH, first.startM) - toMinutes(second.startH, second.startM));
            return (
              <div key={dayName} className="min-h-56 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800">{dayName}</h4>
                {dayAvailability.length === 0 ? (
                  <button onClick={() => openAdd(day)} className="mt-4 flex min-h-36 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs font-medium text-slate-400 hover:border-teal-300 hover:text-teal-600 transition-colors">No laborable</button>
                ) : (
                  <div className="mt-3 space-y-3">
                    {dayAvailability.map((block, index) => {
                      const previous = index > 0 ? dayAvailability[index - 1] : null;
                      const hasGap = previous && toMinutes(block.startH, block.startM) > toMinutes(previous.endH, previous.endM);
                      return (
                        <div key={block.id} className="space-y-2">
                          {hasGap && previous && (
                            <p className="text-[11px] font-medium text-slate-400">
                              Descanso: {fmtHour(previous.endH, previous.endM)} - {fmtHour(block.startH, block.startM)}
                            </p>
                          )}
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-emerald-800">{fmtHour(block.startH, block.startM)} - {fmtHour(block.endH, block.endM)}</p>
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEdit(block)} title="Editar franja" aria-label={`Editar franja de ${dayName}`} className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.2 5.2l3.6 3.6M4 20l4.4-1 10-10a2.5 2.5 0 00-3.6-3.6l-10 10L4 20z" /></svg></button>
                                <button onClick={() => requestDelete(block)} title="Eliminar franja" aria-label={`Eliminar franja de ${dayName}`} className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 012-2h2a2 2 0 012 2v3M4 7h16" /></svg></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => openAdd(day)} className="w-full rounded-lg border border-dashed border-slate-200 py-2 text-[11px] font-semibold text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors">
                      + Agregar franja
                    </button>
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      {dayBookings.length === 0 ? <p className="text-[11px] text-slate-400">Sin reservas</p> : dayBookings.map((booking) => {
                        const [client, service] = (booking.label ?? "").split(" · ");
                        return <div key={booking.id}><p className="text-[11px] font-bold text-slate-700">{fmtHour(booking.startH, booking.startM)} · {service}</p><p className="text-[10px] text-slate-400">{client}</p></div>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Session UI ────────────────────────────────────────────────────────────────

function SessionWarningModal({
  seconds,
  hasUnsavedChanges,
  onContinue,
  onLogout,
}: {
  seconds: number;
  hasUnsavedChanges: boolean;
  onContinue: () => void;
  onLogout: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    continueRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onContinue();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled])"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="session-warning-title" aria-describedby="session-warning-description" className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-8 w-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>
        </div>
        <h2 id="session-warning-title" className="font-display text-2xl font-bold text-slate-900">Tu sesión está por expirar</h2>
        <p id="session-warning-description" className="mt-2 text-sm leading-6 text-slate-600">Por inactividad, tu sesión se cerrará en 60 segundos.</p>
        <div className="mx-auto my-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-3xl font-bold tabular-nums text-amber-800" aria-live="assertive" aria-atomic="true">
          <span>{seconds}</span><span className="sr-only"> segundos restantes</span>
        </div>
        {hasUnsavedChanges && (
          <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-900">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Tienes cambios sin guardar
          </div>
        )}
        <div className="space-y-2.5">
          <button ref={continueRef} onClick={onContinue} className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200">Continuar conectado</button>
          <button onClick={onLogout} className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200">Cerrar sesión</button>
        </div>
        <p className="mt-4 text-xs text-slate-400">Presiona Escape para continuar conectado.</p>
      </div>
    </div>
  );
}

function RedirectingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4" role="status" aria-live="polite">
      <div className="text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-slate-600">Verificando tu sesión…</p>
        <p className="mt-1 text-xs text-slate-400">Te redirigiremos de forma segura.</p>
      </div>
    </div>
  );
}

function SessionToast({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
      <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
      {message}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const sesionInicial = sesionActual();
  const [clientName, setClientName] = useState(sesionInicial?.cuenta.nombres ?? "");
  const [userType, setUserType] = useState<"client" | "provider" | "">(
    sesionInicial ? (sesionInicial.cuenta.rol === "PROVEEDOR" ? "provider" : "client") : "",
  );
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [codigoReserva, setCodigoReserva] = useState("");
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [clientDashboardTab, setClientDashboardTab] = useState<DashTab>("home");
  const [preSelected, setPreSelected] = useState<PreSelected | null>(null);
  const [homeSnapshot, setHomeSnapshot] = useState<HomeSnapshot | undefined>(undefined);
  const [showGuestGate, setShowGuestGate] = useState(false);
  const [loginNotice, setLoginNotice] = useState("");
  const [toast, setToast] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const sessionDeadlineRef = useRef(Date.now() + 15 * 60 * 1000);
  const isAuthenticated = Boolean(clientName && userType);

  const showToast = (message: string) => setToast(message);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    cuandoVenzaLaSesion(() => {
      setClientName("");
      setUserType("");
      setHasUnsavedChanges(false);
      setShowExpiryWarning(false);
      setLoginNotice("Tu sesión expiró. Inicia sesión nuevamente.");
      setScreen("login");
      window.history.replaceState({ screen: "login" }, "", "#/login");
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    sessionDeadlineRef.current = Date.now() + 15 * 60 * 1000;
    setSecondsRemaining(15 * 60);
    setShowExpiryWarning(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || showExpiryWarning) return;
    const registerActivity = () => {
      sessionDeadlineRef.current = Date.now() + 15 * 60 * 1000;
      setSecondsRemaining(15 * 60);
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "input", "submit"];
    events.forEach((eventName) => window.addEventListener(eventName, registerActivity, true));
    return () => events.forEach((eventName) => window.removeEventListener(eventName, registerActivity, true));
  }, [isAuthenticated, showExpiryWarning]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((sessionDeadlineRef.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 60) setShowExpiryWarning(true);
      if (remaining === 0) {
        cerrarSesion();
        const message = hasUnsavedChanges
          ? "Tu sesión expiró y los cambios sin guardar se perdieron. Inicia sesión nuevamente para continuar."
          : "Tu sesión expiró por inactividad. Inicia sesión nuevamente.";
        setClientName("");
        setUserType("");
        setHasUnsavedChanges(false);
        setShowExpiryWarning(false);
        setLoginNotice(message);
        setScreen("login");
        window.history.replaceState({ screen: "login" }, "", "#/login");
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, hasUnsavedChanges]);

  useEffect(() => {
    let redirectTimeout: number | undefined;
    const protectRoute = () => {
      const protectedRoute = window.location.hash.startsWith("#/panel");
      if (protectedRoute && !clientName) {
        setRedirecting(true);
        redirectTimeout = window.setTimeout(() => {
          setRedirecting(false);
          setLoginNotice("Inicia sesión para continuar");
          setScreen("login");
          window.history.replaceState({ screen: "login" }, "", "#/login");
        }, 500);
        return;
      }
      if (clientName && userType === "client") {
        if (window.location.hash === "#/" || !window.location.hash) {
          setScreen("home");
        } else if (window.location.hash.startsWith("#/panel/cliente")) {
          const nextTab: DashTab = window.location.hash.includes("/reservas")
            ? "my-bookings"
            : window.location.hash.includes("/perfil")
              ? "profile"
              : "home";
          setClientDashboardTab(nextTab);
          setScreen("client-dashboard");
        }
      }
    };
    protectRoute();
    window.addEventListener("popstate", protectRoute);
    return () => {
      window.removeEventListener("popstate", protectRoute);
      if (redirectTimeout) window.clearTimeout(redirectTimeout);
    };
  }, [clientName, userType]);

  const handleManualLogout = () => {
    cerrarSesion();
    setClientName("");
    setUserType("");
    setHasUnsavedChanges(false);
    setShowExpiryWarning(false);
    setLoginNotice("");
    setScreen("home");
    setSelectedBusiness(null);
    setSelectedPro(null);
    window.history.pushState({ screen: "home" }, "", "#/");
    showToast("Cerraste sesión correctamente");
  };

  const continueSession = () => {
    sessionDeadlineRef.current = Date.now() + 15 * 60 * 1000;
    setSecondsRemaining(15 * 60);
    setShowExpiryWarning(false);
    showToast("Tu sesión se mantiene activa");
  };

  const handleLogin = (name: string, type: "client" | "provider") => {
    setClientName(name);
    setUserType(type);
    setLoginNotice("");
    setHasUnsavedChanges(false);
    const destination = type === "provider" ? "provider-dashboard" : "client-dashboard";
    if (type === "client") setClientDashboardTab("home");
    setScreen(destination);
    window.history.pushState({ protected: true, screen: destination }, "", type === "provider" ? "#/panel/proveedor" : "#/panel/cliente");
  };

  const goToLogin = () => {
    setLoginNotice("");
    setScreen("login");
    window.history.pushState({ screen: "login" }, "", "#/login");
  };

  const handleSelectBusiness = (b: Business, pre: PreSelected | null, snapshot: HomeSnapshot) => {
    setSelectedBusiness(b);
    setPreSelected(pre);
    setHomeSnapshot(snapshot);
    setScreen(pre ? "select-pro" : "detail");
  };

  const handleBook = (pro: Professional, slot: string, date: string) => {
    setSelectedPro(pro);
    setSelectedSlot(slot);
    setSelectedDate(date);
    setScreen("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedBusiness || !selectedPro || !selectedDate) return;
    try {
      const reserva = await pedir<ReservaCreada>(ENDPOINTS.reservas, {
        metodo: "POST",
        conSesion: true,
        cuerpo: aReserva(selectedBusiness.id, selectedDate, aHoraBackend(selectedSlot), selectedPro.id || undefined),
      });
      setCodigoReserva(reserva.codigo); // código real de la reserva (UUID del backend)
      setScreen("confirmed");
    } catch (e) {
      showToast(e instanceof ErrorApi ? e.mensajes[0] : "No pudimos agendar la cita. Intenta de nuevo.");
      setScreen("detail"); // vuelve a elegir otra hora
    }
  };

  useEffect(() => {
    if (screen !== "client-dashboard" || userType !== "client") return;
    pedir<ReservaDetalle[]>(ENDPOINTS.misCitas, { conSesion: true })
      .then((citas) => setClientAppointments(citas.map(reservaACita)))
      .catch(() => setClientAppointments([]));
  }, [screen, userType]);

  const handleHome = () => {
    setScreen("home");
    setSelectedBusiness(null);
    setSelectedPro(null);
    setSelectedSlot("");
    setSelectedDate("");
    setPreSelected(null);
  };

  const handleViewBookings = () => {
    setClientDashboardTab("my-bookings");
    setScreen("client-dashboard");
    window.history.pushState(
      { protected: true, screen: "client-dashboard", clientTab: "my-bookings" },
      "",
      "#/panel/cliente/reservas",
    );
  };

  const guestGate = showGuestGate ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGuestGate(false)} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
          <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h3 className="font-display mb-1 text-center text-xl font-bold text-slate-900">Inicia sesión para agendar</h3>
        <p className="mb-6 text-center text-sm text-slate-500">Para reservar una cita necesitas tener una cuenta. Es rápido y gratuito.</p>
        <div className="space-y-2.5">
          <button onClick={() => { setShowGuestGate(false); goToLogin(); }} className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700">Iniciar sesión</button>
          <button onClick={() => { setShowGuestGate(false); setScreen("account-type"); }} className="w-full rounded-xl border-2 border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Crear cuenta gratis</button>
        </div>
      </div>
    </div>
  ) : null;

  let content: React.ReactNode = null;

  if (redirecting) {
    content = <RedirectingScreen />;
  } else if (screen === "account-type") {
    content = <AccountTypeScreen
      onSelectClient={() => setScreen("register-client")}
      onSelectProvider={() => setScreen("register-provider")}
      onLogin={goToLogin}
      onBack={() => setScreen("home")}
    />;
  } else if (screen === "register-client") {
    content = <RegisterClientScreen onBack={() => setScreen("account-type")} onLogin={goToLogin} />;
  } else if (screen === "register-provider") {
    content = <RegisterProviderScreen onBack={() => setScreen("account-type")} onLogin={goToLogin} />;
  } else if (screen === "login") {
    content = <LoginScreen
      onBack={() => setScreen("home")}
      onRegister={() => setScreen("account-type")}
      onHome={handleLogin}
      notice={loginNotice}
    />;
  } else if (screen === "provider-dashboard") {
    content = isAuthenticated
      ? <ProviderDashboard providerName={clientName} onLogout={handleManualLogout} onDirtyChange={setHasUnsavedChanges} />
      : <RedirectingScreen />;
  } else if (screen === "client-dashboard") {
    content = isAuthenticated
      ? <ClientDashboard clientName={clientName} appointments={clientAppointments} initialTab={clientDashboardTab} onExplore={() => setScreen("home")} onLogout={handleManualLogout} onDirtyChange={setHasUnsavedChanges} />
      : <RedirectingScreen />;
  } else if (screen === "home") {
    content = <HomeScreen
      onSelectBusiness={handleSelectBusiness}
      initialSnapshot={homeSnapshot}
      onLogin={goToLogin}
      onRegister={() => setScreen("account-type")}
      clientName={clientName || undefined}
      onDashboard={(tab) => {
        if (userType === "client") {
          const nextTab = tab ?? "home";
          setClientDashboardTab(nextTab);
          setScreen("client-dashboard");
          const path = nextTab === "my-bookings"
            ? "#/panel/cliente/reservas"
            : nextTab === "profile"
              ? "#/panel/cliente/perfil"
              : "#/panel/cliente";
          window.history.pushState({ protected: true, screen: "client-dashboard", clientTab: nextTab }, "", path);
          return;
        }
        setScreen("provider-dashboard");
        window.history.pushState({ protected: true, screen: "provider-dashboard" }, "", "#/panel/proveedor");
      }}
      onLogout={handleManualLogout}
    />;
  } else if (screen === "detail" && selectedBusiness) {
    content = <><DetailScreen
      key={selectedBusiness.id}
      business={selectedBusiness}
      onBook={handleBook}
      onBack={handleHome}
      onLoginRequired={!clientName ? () => setShowGuestGate(true) : undefined}
      onChangeOferta={(oferta) => setSelectedBusiness({ ...oferta, ofertas: selectedBusiness.ofertas })}
    />{guestGate}</>;
  } else if (screen === "select-pro" && selectedBusiness && preSelected) {
    content = <><FilteredProScreen
      business={selectedBusiness}
      preSelected={preSelected}
      onBook={handleBook}
      onBack={() => setScreen("home")}
      onLoginRequired={!clientName ? () => setShowGuestGate(true) : undefined}
    />{guestGate}</>;
  } else if (screen === "confirm" && selectedBusiness && selectedPro) {
    content = <ConfirmScreen
      business={selectedBusiness}
      professional={selectedPro}
      slot={selectedSlot}
      date={selectedDate}
      onConfirm={handleConfirm}
      onBack={() => setScreen(preSelected ? "select-pro" : "detail")}
    />;
  } else if (screen === "confirmed" && selectedBusiness && selectedPro) {
    content = <ConfirmedScreen business={selectedBusiness} professional={selectedPro} slot={selectedSlot} date={selectedDate} code={codigoReserva} onHome={handleHome} onViewBookings={handleViewBookings} />;
  }

  const showQuickLogout = isAuthenticated && !["home", "client-dashboard", "provider-dashboard"].includes(screen);

  return (
    <>
      {content}
      {showQuickLogout && (
        <button onClick={handleManualLogout} className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
          Cerrar sesión
        </button>
      )}
      {isAuthenticated && !showExpiryWarning && (
        <div className="fixed bottom-4 right-4 z-40 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-slate-500 shadow-sm backdrop-blur" aria-label={`Tiempo de sesión restante: ${Math.floor(secondsRemaining / 60)} minutos y ${secondsRemaining % 60} segundos`}>
          Sesión {String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:{String(secondsRemaining % 60).padStart(2, "0")}
        </div>
      )}
      {showExpiryWarning && isAuthenticated && (
        <SessionWarningModal seconds={secondsRemaining} hasUnsavedChanges={hasUnsavedChanges} onContinue={continueSession} onLogout={handleManualLogout} />
      )}
      {toast && <SessionToast message={toast} />}
    </>
  );
}

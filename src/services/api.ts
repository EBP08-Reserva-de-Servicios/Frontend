import { slotToMinutes } from "@/utils";

const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface ApiServicioProveedor {
  id: number;
  precio: number | null;
  proveedor: {
    nit: number;
    razonSocial: string;
    descripcion: string;
    direccion: string;
    telefono: string;
    correo: string;
    calificacionPromedio: number;
    horasLimiteCancelacion: number;
    municipio: {
      codigo: number;
      nombre: string;
      departamento: { codigo: number; nombre: string };
    };
  };
  servicio: {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    duracion: number;
  };
}

export interface ApiDisponibilidad {
  id: number;
  fecha: string;      // "2026-09-21"
  horaInicio: string; // "09:00:00"
  horaFin: string;    // "09:30:00"
  estado: string;     // "DISPONIBLE" | "RESERVADO" | "BLOQUEADO"
  servicioProveedor: { id: number };
}

export interface ApiReserva {
  codigo: string;              // UUID generado por el backend
  estado: string;              // "PENDIENTE" | "CONFIRMADA" | "CANCELADA"
  fecha: string;               // "2026-09-22"
  fechaCreacion: string;
  hora: string;                // "10:00:00"
  idCliente: number;
  idServicioProveedor: number;
}

/** Error al crear una reserva; guarda el código HTTP y el mensaje que envía el backend */
export class ReservaError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ReservaError";
    this.status = status;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Error ${res.status} al consultar ${path}`);
  return res.json() as Promise<T>;
}

export const fetchServiciosProveedor = () =>
  getJson<ApiServicioProveedor[]>("/api/proveedores/buscar");

export const fetchDisponibilidad = (servicioProveedorId: number, fecha: string) =>
  getJson<ApiDisponibilidad[]>(
    `/api/disponibilidad/servicio-proveedor/${servicioProveedorId}?fecha=${fecha}`
  );

/** "9:00 a.m." -> "09:00:00" (formato que espera el backend) */
export function slotAHoraApi(slot: string): string {
  const total = slotToMinutes(slot);
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}:00`;
}

// TEMPORAL: el login (Usuario/Cliente) se implementa en Sprint 3.
// Hasta entonces todas las reservas se registran con este cliente de prueba.
const ID_CLIENTE_PRUEBA = 1;

/** Crea una reserva. Si el backend la rechaza (por ejemplo 409), lanza ReservaError con su mensaje. */
export async function crearReserva(
  idServicioProveedor: number,
  fecha: string,
  slot: string
): Promise<ApiReserva> {
  const res = await fetch(`${API_URL}/api/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idServicioProveedor,
      idCliente: ID_CLIENTE_PRUEBA,
      fecha,
      hora: slotAHoraApi(slot),
    }),
  });

  if (!res.ok) {
    const texto = await res.text();
    throw new ReservaError(res.status, texto || `Error ${res.status} al crear la reserva`);
  }
  return res.json() as Promise<ApiReserva>;
}

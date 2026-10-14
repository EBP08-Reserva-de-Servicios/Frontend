export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const ENDPOINTS = {
  registroCliente: "/api/clientes/registro",
  registroProveedor: "/api/proveedores/registro",
  login: "/api/auth/login",
  servicios: "/api/servicios",
  departamentos: "/api/departamentos",
  municipios: "/api/municipios",
  buscar: "/api/proveedores/buscar",
  proveedor: (nit: string) => `/api/proveedores/${nit}`,
  logoProveedor: (nit: string) => `/api/proveedores/${nit}/logo`,
  disponibilidad: (idOferta: string | number) => `/api/disponibilidad/servicio-proveedor/${idOferta}`,
  serviciosProveedor: (nit: string) => `/api/proveedores/${nit}/servicios`,
  profesionales: (nit: string) => `/api/proveedores/${nit}/profesionales`,
  horario: (nit: string, profesionalId: string | number) => `/api/proveedores/${nit}/profesionales/${profesionalId}/horario`,
  reservas: "/api/reservas",
  misCitas: "/api/reservas/mias",
} as const;

export interface RegistroClienteBody {
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  clave: string;
}

export interface RegistroProveedorBody {
  tipoServicio: string;
  razonSocial: string;
  logo: string;
  nit: string;
  telefono: string;
  correo: string;
  representanteNombres: string;
  representanteApellidos: string;
  representanteCelular: string;
  representanteDocumento: string;
  clave: string;
}

export interface LoginBody {
  correo: string;
  clave: string;
  rol: "CLIENTE" | "PROVEEDOR";
}

export interface LoginRespuesta {
  token: string;
  cuenta: {
    id: string;
    nombres: string;
    correo: string;
    rol: "CLIENTE" | "PROVEEDOR";
  };
}

export interface ServicioProveedorBody {
  servicioId: string | number;
  precio: number;
  duracion: number;
  descripcion: string;
}

export interface ProfesionalBody {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  foto: string | null;
  servicioProveedorIds: Array<string | number>;
}

export type DiaSemana = "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";

export interface HorarioBody {
  franjas: Array<{
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
  }>;
}

export interface ReservaBody {
  idServicioProveedor: number;
  fecha: string; // "AAAA-MM-DD"
  hora: string; // "HH:mm"
  profesionalId?: string; // opcional: si no se envía, el backend asigna un profesional libre a esa hora
}

export interface ErrorBackend {
  errores: string[];
}

export interface MunicipioResumen {
  codigo: number;
  departamento: { codigo: number; nombre: string };
  nombre: string;
}

export interface ProveedorDetalle {
  calificacionPromedio: number | null;
  correo: string | null;
  descripcion: string | null;
  direccion: string | null;
  horasLimiteCancelacion: number | null;
  logoUrl: string | null;
  municipio: MunicipioResumen | null;
  nit: number;
  razonSocial: string;
  telefono: string | null;
}

export interface ServicioResumen {
  descripcion: string | null;
  duracion: number | null;
  id: number;
  nombre: string;
  precio: number | null;
}

export interface OfertaDetalle {
  descripcion: string | null;
  duracion: number | null;
  id: number;
  precio: number;
  proveedor: ProveedorDetalle;
  servicio: ServicioResumen;
}

export interface ProfesionalResumen {
  apellidos: string;
  id: string;
  nombres: string;
}

export type EstadoReserva = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";

/** Respuesta de POST /api/reservas (200). */
export interface ReservaCreada {
  clienteId: string | null;
  codigo: string;
  estado: EstadoReserva;
  fecha: string;
  fechaCreacion: string;
  hora: string; // "HH:mm:ss"
  idCliente: number | null;
  idServicioProveedor: number;
  profesionalId: string | null;
}

/** Cada elemento de GET /api/reservas/mias ("Mis citas"). */
export interface ReservaDetalle {
  codigo: string;
  estado: EstadoReserva;
  fecha: string; // "AAAA-MM-DD"
  hora: string; // "HH:mm:ss"
  horaFin: string | null; // "HH:mm:ss"
  profesional: ProfesionalResumen | null;
  servicioProveedor: OfertaDetalle;
}

export function aRegistroCliente(values: {
  firstName: string;
  lastName: string;
  document: string;
  phone: string;
  email: string;
  password: string;
}): RegistroClienteBody {
  return {
    nombres: values.firstName,
    apellidos: values.lastName,
    numeroDocumento: values.document,
    telefono: values.phone,
    correo: values.email,
    clave: values.password,
  };
}

export function aRegistroProveedor(values: {
  serviceType: string;
  companyName: string;
  nit: string;
  companyPhone: string;
  companyEmail: string;
  representativeFirstName: string;
  representativeLastName: string;
  representativePhone: string;
  representativeDocument: string;
  password: string;
}, logoPreview: string): RegistroProveedorBody {
  return {
    tipoServicio: values.serviceType,
    razonSocial: values.companyName,
    logo: logoPreview,
    nit: values.nit,
    telefono: values.companyPhone,
    correo: values.companyEmail,
    representanteNombres: values.representativeFirstName,
    representanteApellidos: values.representativeLastName,
    representanteCelular: values.representativePhone,
    representanteDocumento: values.representativeDocument,
    clave: values.password,
  };
}

export function aLogin(email: string, password: string, role: "client" | "provider"): LoginBody {
  return {
    correo: email,
    clave: password,
    rol: role === "client" ? "CLIENTE" : "PROVEEDOR",
  };
}

export function aProfesional(profForm: {
  docType: string;
  docNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
}, servicioProveedorIds: Array<string | number>): ProfesionalBody {
  const telefono = profForm.phone.replace(/\D/g, "").replace(/^57(?=\d{10}$)/, "");
  return {
    tipoDocumento: profForm.docType,
    numeroDocumento: profForm.docNumber,
    nombres: profForm.firstName,
    apellidos: profForm.lastName,
    correo: profForm.email,
    telefono,
    foto: profForm.avatar || null,
    servicioProveedorIds,
  };
}

export function aServicioProveedor(
  servicioId: string | number,
  newPrice: string,
  newDuration: string,
  newDescription: string,
): ServicioProveedorBody {
  return {
    servicioId,
    precio: Number(newPrice),
    duracion: Number(newDuration),
    descripcion: newDescription,
  };
}

export function aHorario(
  selectedDays: number[],
  timeRows: Array<{ start: string; end: string }>,
): HorarioBody {
  const dias: DiaSemana[] = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
  return {
    franjas: selectedDays.flatMap((day) => timeRows.map((row) => ({
      diaSemana: dias[day],
      horaInicio: row.start,
      horaFin: row.end,
    }))),
  };
}

export function estadoDesdeBackend(estado: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA") {
  const estados = {
    PENDIENTE: "pending",
    CONFIRMADA: "confirmed",
    CANCELADA: "cancelled",
    COMPLETADA: "completed",
  } as const;
  return estados[estado];
}

/**
 * Encabezados para los endpoints que necesitan sesión (por ejemplo "Mis citas" y agendar).
 * El token es el que devuelve POST /api/auth/login. Si no hay token, no se envía el encabezado.
 */
export function conToken(token: string | null | undefined): Record<string, string> {
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

/** Cuerpo para agendar: oferta, fecha, hora y, si el cliente eligió uno, el profesional. */
export function aReserva(
  idServicioProveedor: number,
  fecha: string,
  hora: string,
  profesionalId?: string,
): ReservaBody {
  return profesionalId
    ? { idServicioProveedor, fecha, hora, profesionalId }
    : { idServicioProveedor, fecha, hora };
}

/**
 * Notas de integración (no ejecutan nada):
 * - POST /api/reservas responde los errores como TEXTO PLANO (usar response.text()), no como ErrorBackend:
 *   400 si faltan datos, 404 si la oferta no existe, 409 si no hay disponibilidad o el horario ya fue tomado.
 * - GET /api/reservas/mias responde 401 sin sesión ("Inicia sesión para ver tus citas.")
 *   y 403 si la sesión es de proveedor ("Solo los clientes tienen citas."), también en texto plano.
 * - Un token vencido (8 horas) responde 401: descartar el token y volver a la pantalla de inicio de sesión.
 */
export const NOTAS_INTEGRACION = true;

/** Forma de GET /api/disponibilidad/servicio-proveedor/{id}?fecha=... */
export interface DisponibilidadDetalle {
  estado: string;
  fecha: string;        // "AAAA-MM-DD"
  horaFin: string;      // "HH:mm:ss"
  horaInicio: string;   // "HH:mm:ss"
  id: number;
  profesional: ProfesionalResumen | null;
  servicioProveedor: OfertaDetalle;
}

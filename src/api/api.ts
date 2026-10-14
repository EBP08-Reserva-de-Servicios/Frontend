import { API_BASE_URL, conToken, type ErrorBackend, type LoginRespuesta } from "./contratoBackend";

export type Cuenta = LoginRespuesta["cuenta"];
type Sesion = { token: string; cuenta: Cuenta };

const CLAVE_SESION = "agendaya.sesion";

// La sesión vive en memoria y en sessionStorage (sobrevive a recargar la página, no a cerrar la pestaña).
let sesion: Sesion | null = (() => {
  try {
    const guardada = sessionStorage.getItem(CLAVE_SESION);
    return guardada ? (JSON.parse(guardada) as Sesion) : null;
  } catch {
    return null;
  }
})();

export function guardarSesion(respuesta: LoginRespuesta): void {
  sesion = { token: respuesta.token, cuenta: respuesta.cuenta };
  try { sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion)); } catch { /* sin almacenamiento: solo memoria */ }
}

export function cerrarSesion(): void {
  sesion = null;
  try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* nada */ }
}

export function sesionActual(): Sesion | null {
  return sesion;
}

/** Error del backend: código HTTP + mensajes listos para mostrar. */
export class ErrorApi extends Error {
  status: number;
  mensajes: string[];
  constructor(status: number, mensajes: string[]) {
    super(mensajes[0] ?? `Error ${status}`);
    this.status = status;
    this.mensajes = mensajes;
  }
}

// App.tsx registra aquí qué hacer cuando el backend rechaza el token (vencido o inválido).
let alVencerSesion: () => void = () => {};
export function cuandoVenzaLaSesion(accion: () => void): void {
  alVencerSesion = accion;
}

type Opciones = { metodo?: "GET" | "POST" | "DELETE"; cuerpo?: unknown; conSesion?: boolean };

/** Hace una petición al backend. Lanza ErrorApi si la respuesta no es 2xx. */
export async function pedir<T>(ruta: string, { metodo = "GET", cuerpo, conSesion = false }: Opciones = {}): Promise<T> {
  const token = conSesion ? sesion?.token : undefined;
  let respuesta: Response;
  try {
    respuesta = await fetch(API_BASE_URL + ruta, {
      method: metodo,
      headers: conToken(token),
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi(0, ["No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo."]);
  }

  const texto = await respuesta.text();
  if (respuesta.ok) return (texto ? JSON.parse(texto) : undefined) as T;

  // 401 SIN cuerpo con token = token vencido o inválido (lo responde Spring Security).
  if (respuesta.status === 401 && token && !texto) {
    cerrarSesion();
    alVencerSesion();
  }

  // Errores: {"errores":[...]} en casi todo; TEXTO PLANO en /api/reservas y /api/reservas/mias.
  let mensajes: string[] = [];
  try {
    const json = JSON.parse(texto) as ErrorBackend;
    if (Array.isArray(json.errores)) mensajes = json.errores;
  } catch {
    if (texto) mensajes = [texto];
  }
  if (mensajes.length === 0) {
    mensajes = [
      respuesta.status === 401 ? "Tu sesión expiró. Inicia sesión nuevamente."
        : respuesta.status === 403 ? "No tienes permiso para hacer esto."
        : "Ocurrió un error. Intenta de nuevo.",
    ];
  }
  throw new ErrorApi(respuesta.status, mensajes);
}

/** "08:30:00" o "08:30" → "8:30 a.m." (formato de las pantallas). */
export function aEtiquetaHora(hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "a.m." : "p.m."}`;
}

/** "8:30 a.m." → "08:30" (formato que espera el backend). */
export function aHoraBackend(etiqueta: string): string {
  const partes = etiqueta.match(/(\d+):(\d+)\s*(a\.m\.|p\.m\.)/i);
  if (!partes) return etiqueta;
  let h = Number(partes[1]) % 12;
  if (partes[3].toLowerCase() === "p.m.") h += 12;
  return `${String(h).padStart(2, "0")}:${partes[2]}`;
}

/** "2026-10-15" → "jue, 15 oct 2026". */
export function aFechaVisible(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? fecha
    : d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

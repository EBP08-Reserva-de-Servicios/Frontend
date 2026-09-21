   import type { Business } from "@/types";
   import { SERVICE_TO_CATEGORY } from "@/data";
   import { slotToMinutes } from "@/utils";
   import { fetchServiciosProveedor, fetchDisponibilidad } from "./api";
   import type { ApiServicioProveedor, ApiDisponibilidad } from "./api";

   const IMAGEN_POR_DEFECTO =
     "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&auto=format";
   const AVATAR_POR_DEFECTO =
     "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format";

   /** Minutos desde medianoche -> "9:00 a.m." (mismo formato que TIME_SLOTS) */
   function formatSlot(totalMin: number): string {
     const h = Math.floor(totalMin / 60);
     const m = totalMin % 60;
     const periodo = h >= 12 ? "p.m." : "a.m.";
     const h12 = h % 12 === 0 ? 12 : h % 12;
     return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
   }

   function aMinutos(hora: string): number {
     const [h, m] = hora.split(":").map(Number);
     return h * 60 + m;
   }

   /** Bloque 09:00-10:30 -> ["9:00 a.m.", "9:30 a.m.", "10:00 a.m."] */
   function generarSlots(horaInicio: string, horaFin: string): string[] {
     const slots: string[] = [];
     for (let t = aMinutos(horaInicio); t < aMinutos(horaFin); t += 30) {
       slots.push(formatSlot(t));
     }
     return slots;
   }

   /** Fecha local "YYYY-MM-DD" a N días de hoy (sin el desfase de UTC) */
   function fechaLocal(diasDesdeHoy: number): string {
     const d = new Date();
     d.setDate(d.getDate() + diasDesdeHoy);
     const mm = String(d.getMonth() + 1).padStart(2, "0");
     const dd = String(d.getDate()).padStart(2, "0");
     return `${d.getFullYear()}-${mm}-${dd}`;
   }

   function construirNegocio(
     sp: ApiServicioProveedor,
     slotsByDate: Record<string, string[]>
   ): Business {
     const todosLosSlots = Array.from(new Set(Object.values(slotsByDate).flat()));
     return {
       id: sp.id,
       name: sp.proveedor.razonSocial,
       category: SERVICE_TO_CATEGORY[sp.servicio.nombre] ?? "Belleza",
       service: sp.servicio.nombre,
       city: sp.proveedor.municipio.nombre,
       rating: sp.proveedor.calificacionPromedio,
       reviews: 0,
       availability: "",
       image: IMAGEN_POR_DEFECTO,
       description: sp.proveedor.descripcion,
       address: sp.proveedor.direccion,
       professionals: [
         {
           name: sp.proveedor.razonSocial,
           role: sp.servicio.nombre,
           avatar: AVATAR_POR_DEFECTO,
           slots: todosLosSlots,
           slotsByDate,
         },
       ],
       gallery: [IMAGEN_POR_DEFECTO],
     };
   }

   /** Carga negocios reales con sus horarios de los próximos N días */
   export async function cargarNegocios(diasAdelante = 14): Promise<Business[]> {
     const lista = await fetchServiciosProveedor();
     const fechas = Array.from({ length: diasAdelante }, (_, i) => fechaLocal(i));

     return Promise.all(
       lista.map(async (sp) => {
         const porDia = await Promise.all(
           fechas.map((f) =>
             fetchDisponibilidad(sp.id, f).catch(() => [] as ApiDisponibilidad[])
           )
         );
         const slotsByDate: Record<string, string[]> = {};
         fechas.forEach((f, i) => {
           const slots = porDia[i]
             .filter((d) => d.estado === "DISPONIBLE")
             .flatMap((d) => generarSlots(d.horaInicio, d.horaFin));
           if (slots.length > 0) {
             slotsByDate[f] = Array.from(new Set(slots)).sort(
               (a, b) => slotToMinutes(a) - slotToMinutes(b)
             );
           }
         });
         return construirNegocio(sp, slotsByDate);
       })
     );
   }
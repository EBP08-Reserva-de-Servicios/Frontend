# AgendaYa — Interfaz Web (Frontend)

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Desplegado-black.svg)](https://vercel.com/)

Interfaz de usuario para la plataforma **AgendaYa** (EBP08), diseñada para la búsqueda de empresas, selección de servicios y agendamiento de citas en tiempo real.

---

## 🛠️ Stack Tecnológico

* **Librería de UI:** React 18
* **Lenguaje:** TypeScript
* **Herramienta de Construcción:** Vite
* **Estilos:** Tailwind CSS / Lucide React (iconografía)
* **Cliente HTTP:** Fetch API nativo

---

## 📂 Estructura de Carpetas

```text
src/
├── components/     # Componentes visuales reutilizables (Filtros, Tarjetas, Modales)
├── screens/        # Vistas principales de la aplicación (Home, Detalle, Confirmación)
├── services/       # Cliente API para comunicación con el Backend (api.ts)
├── types/          # Definiciones de interfaces TypeScript (business.ts, api.ts)
├── utils/          # Adaptadores y formateadores de datos (adapter.ts)
└── data/           # Datos estáticos del prototipo inicial (utilizados como respaldo visual)
```

---

## 📖 Arquitectura e Integración Frontend-Backend (Patrón Adaptador)

### El Reto de Integración
El prototipo visual inicial del Frontend fue generado con **Figma Make** por el equipo de Análisis 1. La interfaz fue estructurada asumiendo la existencia de una entidad `Profesional` (programada para el Sprint 2) que contenía arreglos de franjas horarias (`slots`). Sin embargo, el Backend real del Sprint 1 expone la entidad comercial `ServicioProveedor` y bloques de `Disponibilidad` directa.

### La Solución: Capa Anti-Corrupción y Adaptador
Para integrar ambas partes sin alterar el Backend probado ni rehacer las vistas del Frontend, se implementó un patrón adaptador intermediario:

1. **`src/services/api.ts`:** Capa aislada para realizar peticiones HTTP hacia el Backend remoto. Consume la variable de entorno `VITE_API_URL` para alternar sin cambios de código entre el entorno local (`http://localhost:8080`) y el entorno de producción en Render.
2. **`src/utils/adapter.ts`:** Función de transformación que toma los datos reales recibidos de `GET /api/proveedores/buscar` y `GET /api/disponibilidad/servicio-proveedor/{id}` y los mapea al tipo de datos sintético que la interfaz sabe renderizar:
   * Genera un **"profesional sintético"** para asociar las franjas horarias reales.
   * Convierte los formatos de hora del servidor (`"09:00:00"`) a formatos legibles por el usuario (`"9:00 a.m."`).
   * Asigna imágenes de apoyo por categoría para la presentación de los negocios.

Esta decisión garantizó una integración limpia en el Frontend sin introducir deuda técnica en las entidades del Backend.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
* Node.js v18 o superior.
* Gestor de paquetes `npm`.

### Pasos de Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/EBP08-Reserva-de-Servicios/Frontend.git](https://github.com/EBP08-Reserva-de-Servicios/Frontend.git)
   cd Frontend
   ```

2. **Configurar la variable de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

3. **Instalar dependencias y ejecutar:**
   ```bash
   npm install
   npm run dev
   ```
   Accede en el navegador a: `http://localhost:5173`

---

## ⚠️ Limitaciones Conocidas y Pendientes (Sprint 2)

* **Filtros Geográficos:** Los selectores de departamento y municipio leen temporalmente de listas locales (`geo.ts`) mientras se conecta el endpoint geográfico en el Sprint 2.
* **Cliente Temporal:** Al crear una reserva, se envía un `idCliente` fijo (`1`) a la espera de la integración del módulo de Autenticación y Usuarios (Sprint 3).
* **Consistencia de Mensajes:** La vista de éxito muestra el texto "Reserva confirmada" aunque el estado persista como `PENDIENTE` en el Backend hasta la validación del proveedor.
* **Zona Horaria:** La función `getTodayString()` calcula la fecha en UTC, pudiendo mostrar la fecha del día siguiente para usuarios en Colombia después de las 7:00 p.m.

---

## 🔗 Enlaces Relacionados
* [Aplicación Desplegada (Vercel)](https://frontend-arelisgiraldo.vercel.app)
* [Repositorio Backend](https://github.com/EBP08-Reserva-de-Servicios/Backend)
* [README General de la Organización](https://github.com/EBP08-Reserva-de-Servicios/.github)

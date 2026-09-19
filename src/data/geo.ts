export const COLOMBIA_GEO: Record<string, string[]> = {
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
  "Cundinamarca": ["Bogotá", "Soacha", "Facatativá", "Zipaquirá", "Chía", "Mosquera", "Fusagasugá"],
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

export const DEPARTMENTS = Object.keys(COLOMBIA_GEO).sort();

// Asocia el valor business.city con su departamento para el filtrado.
// Derivado automáticamente de COLOMBIA_GEO: cubre los ~150 municipios del selector,
// no solo los que tienen empresas registradas hoy. Evita mantener un mapa manual incompleto.
export const CITY_TO_DEPARTMENT: Record<string, string> = Object.entries(COLOMBIA_GEO).reduce(
  (map, [department, cities]) => {
    cities.forEach((city) => {
      map[city] = department;
    });
    return map;
  },
  {} as Record<string, string>
);

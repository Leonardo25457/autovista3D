export type VehicleStatus = "New" | "Clean" | "On Hold";
export type TitleStatus = "Clean" | "Rebuilt" | "Salvage";
export type VehicleBody = "SUV" | "Pickup" | "Sedan" | "Coupe";

export type Vehicle = {
  id: string;
  stock: string;
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  originalPrice?: number;
  status: VehicleStatus;
  titleStatus: TitleStatus;
  bodyType: VehicleBody;
  mileage: number;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  fuel: string;
  doors: number;
  horsepower: number;
  location: string;
  description: string;
  listingUrl?: string;
  photos: string[];
  model3d?: string;
  proceduralModel?: "jeep-wrangler";
  modelFeatures?: {
    paintCustomization?: boolean;
    lights?: boolean;
  };
  modelAttribution?: {
    creator: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
    commercialUseAllowed: boolean;
  };
  modelStats?: {
    fileSizeMb: number;
    triangles: number;
    materials: number;
    textures: number;
  };
  accent: string;
  createdAt: string;
};

export const vehicles: Vehicle[] = [
  {
    id: "2021-ford-bronco-4-door-4x4",
    stock: "BR-2021",
    year: 2021,
    make: "Ford",
    model: "Bronco",
    trim: "4-Door 4x4",
    price: 28980,
    status: "Clean",
    titleStatus: "Clean",
    bodyType: "SUV",
    mileage: 36500,
    exteriorColor: "Azul metálico con techo negro",
    interiorColor: "Negro",
    engine: "2.3L EcoBoost I4",
    transmission: "Automática de 10 velocidades",
    drivetrain: "4WD",
    fuel: "Gasolina",
    doors: 4,
    horsepower: 300,
    location: "Miami, FL",
    description:
      "Ford Bronco 2021 adaptado visualmente a las fotografías compartidas: azul metálico intenso, techo negro, cristales oscurecidos, molduras y parachoques en negro/gris, estribos laterales y aros gris oscuro. El GLB suministrado corresponde a una carrocería de 2 puertas, por lo que la adaptación prioriza color, materiales e iluminación sobre la coincidencia exacta de puertas y batalla.",
    listingUrl: "https://deluxecars360.com/for-sale/2021-ford-bronco-yG10j70fh39",
    photos: [
      "/vehicles/ford-bronco/01.png",
      "/vehicles/ford-bronco/02.png",
      "/vehicles/ford-bronco/03.png",
    ],
    model3d: "/models/ford-bronco/2021-ford-bronco.glb",
    modelFeatures: {
      paintCustomization: true,
      lights: true,
    },
    modelStats: {
      fileSizeMb: 8.46,
      triangles: 177516,
      materials: 41,
      textures: 19,
    },
    accent: "#0870c9",
    createdAt: "2026-08-07",
  },
  {
    id: "2026-toyota-gr-supra",
    stock: "SUPRA-2026",
    year: 2026,
    make: "Toyota",
    model: "GR Supra",
    trim: "3.0",
    price: 58980,
    status: "Clean",
    titleStatus: "Clean",
    bodyType: "Coupe",
    mileage: 8900,
    exteriorColor: "Azul metálico profundo",
    interiorColor: "Negro",
    engine: "3.0L Turbo I6",
    transmission: "Automática de 8 velocidades",
    drivetrain: "RWD",
    fuel: "Gasolina",
    doors: 2,
    horsepower: 382,
    location: "Miami, FL",
    description:
      "Toyota GR Supra adaptado a las fotografías compartidas: azul metálico profundo, techo y detalles negros, aros negros, cristales oscurecidos, difusor trasero oscuro y gran alerón posterior. El modelo A90 Final Edition suministrado conserva una silueta muy próxima al vehículo de referencia.",
    listingUrl: "https://deluxecars360.com/for-sale/2026-toyota-gr-supra-6t116mx0uf2",
    photos: [
      "/vehicles/toyota-gr-supra/01.png",
      "/vehicles/toyota-gr-supra/02.png",
      "/vehicles/toyota-gr-supra/03.png",
      "/vehicles/toyota-gr-supra/04.png",
      "/vehicles/toyota-gr-supra/05.png",
      "/vehicles/toyota-gr-supra/06.png",
    ],
    model3d: "/models/toyota-gr-supra/2026-toyota-gr-supra.glb",
    modelFeatures: {
      paintCustomization: true,
      lights: false,
    },
    modelStats: {
      fileSizeMb: 2.8,
      triangles: 31756,
      materials: 18,
      textures: 7,
    },
    accent: "#285184",
    createdAt: "2026-08-07",
  },
  {
    id: "2019-toyota-4runner-4wd",
    stock: "4R-2019",
    year: 2019,
    make: "Toyota",
    model: "4Runner",
    trim: "4WD",
    price: 28980,
    status: "Clean",
    titleStatus: "Clean",
    bodyType: "SUV",
    mileage: 48200,
    exteriorColor: "Negro grafito metálico",
    interiorColor: "Negro",
    engine: "4.0L V6",
    transmission: "Automática de 5 velocidades",
    drivetrain: "4WD",
    fuel: "Gasolina",
    doors: 4,
    horsepower: 270,
    location: "Miami, FL",
    description:
      "Toyota 4Runner 4WD adaptada visualmente a las fotografías de referencia: carrocería negro grafito de alto brillo, cristales oscurecidos, molduras negras, detalles cromados, aros plateados y acabado sobrio de SUV. El GLB fue optimizado para web manteniendo la geometría original.",
    photos: [
      "/vehicles/toyota-4runner/01.png",
      "/vehicles/toyota-4runner/02.png",
      "/vehicles/toyota-4runner/03.png",
      "/vehicles/toyota-4runner/04.png",
    ],
    model3d: "/models/toyota-4runner/2019-toyota-4runner-optimized.glb",
    modelFeatures: {
      paintCustomization: true,
      lights: true,
    },
    modelStats: {
      fileSizeMb: 11.1,
      triangles: 878504,
      materials: 10,
      textures: 0,
    },
    accent: "#101820",
    createdAt: "2026-08-07",
  },
  {
    id: "2016-chevrolet-corvette-stingray-z51",
    stock: "121045",
    vin: "1G1YM2D70G5121045",
    year: 2016,
    make: "Chevrolet",
    model: "Corvette",
    trim: "Stingray Z51",
    price: 18980,
    status: "New",
    titleStatus: "Salvage",
    bodyType: "Coupe",
    mileage: 1,
    exteriorColor: "Rojo",
    interiorColor: "Rojo con detalles negros",
    engine: "6.2L V8",
    transmission: "Automática de 8 velocidades",
    drivetrain: "RWD",
    fuel: "Gasolina",
    doors: 2,
    horsepower: 455,
    location: "Miami, FL",
    description:
      "Chevrolet Corvette Stingray Z51 2016 ajustado para aproximarse a la unidad real mostrada en las fotografías de referencia: rojo brillante ligeramente anaranjado, cofre visualmente levantado, alerón trasero negro, cristales más oscuros, rines negros y fascia trasera ennegrecida.",
    photos: [
      "/vehicles/chevrolet-corvette/01.png",
      "/vehicles/chevrolet-corvette/02.png",
      "/vehicles/chevrolet-corvette/03.png",
      "/vehicles/chevrolet-corvette/04.png",
    ],
    model3d: "/models/chevrolet-corvette/2016-chevrolet-corvette-c7-stingray-z51.glb",
    modelFeatures: {
      paintCustomization: true,
      lights: true,
    },
    modelStats: {
      fileSizeMb: 10.9,
      triangles: 101931,
      materials: 67,
      textures: 37,
    },
    accent: "#e33a33",
    createdAt: "2026-08-07",
  },
  {
    id: "2022-tesla-model-3-dual-motor",
    stock: "TM3-2022",
    year: 2022,
    make: "Tesla",
    model: "Model 3",
    trim: "Dual Motor AWD",
    price: 17980,
    status: "Clean",
    titleStatus: "Clean",
    bodyType: "Sedan",
    mileage: 25000,
    exteriorColor: "Azul gris oscuro metalizado",
    interiorColor: "Negro",
    engine: "Dual Motor eléctrico",
    transmission: "Transmisión de una velocidad",
    drivetrain: "AWD",
    fuel: "Eléctrico",
    doors: 4,
    horsepower: 346,
    location: "Lima, Perú",
    description:
      "Tesla Model 3 2022 integrado como referencia visual a partir de las fotografías compartidas. El modelo 3D se ajustó a un acabado azul gris metálico, con cristales oscurecidos, aros plateados, molduras negras y luces configuradas para acercarse al vehículo de referencia.",
    photos: [
      "/vehicles/tesla-model-3/01.png",
      "/vehicles/tesla-model-3/02.png",
    ],
    model3d: "/models/tesla-model-3/2022-tesla-model-3.glb",
    modelFeatures: {
      paintCustomization: true,
      lights: true,
    },
    modelAttribution: {
      creator: "wintrez",
      sourceUrl: "https://sketchfab.com/3d-models/tesla-m3-model-3a602469d7874d1397efa67182198705",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      commercialUseAllowed: true,
    },
    modelStats: {
      fileSizeMb: 8.4,
      triangles: 247356,
      materials: 23,
      textures: 0,
    },
    accent: "#45556b",
    createdAt: "2026-08-07",
  },
  {
    id: "2023-jeep-wrangler-willys",
    stock: "520442",
    vin: "1C4HJXDN3PW520442",
    year: 2023,
    make: "Jeep",
    model: "Wrangler Unlimited",
    trim: "Willys Sport Utility 4D",
    price: 15980,
    status: "New",
    titleStatus: "Salvage",
    bodyType: "SUV",
    mileage: 128294,
    exteriorColor: "High Velocity Clearcoat / verde lima amarillo",
    interiorColor: "Negro",
    engine: "2.0L Turbo I4",
    transmission: "Automática de 8 velocidades",
    drivetrain: "4WD",
    fuel: "Gasolina",
    doors: 4,
    horsepower: 270,
    location: "Miami, FL",
    description:
      "Jeep Wrangler Unlimited Willys 2023 adaptado a las fotografías reales compartidas: pintura High Velocity de tono amarillo-lima, techo rígido negro, cristales oscurecidos, guardafangos y parachoques negros, aros oscuros, neumáticos todoterreno y distintivos WILLYS y Jeep en negro. El modelo 3D conserva el visor inferior y los controles de pintura y luces.",
    listingUrl: "https://deluxecars360.com/for-sale/2023-jeep-wrangler-JK3qp13aqp",
    photos: [
      "/vehicles/jeep-wrangler/01.png",
      "/vehicles/jeep-wrangler/02.png",
      "/vehicles/jeep-wrangler/03.png",
      "/vehicles/jeep-wrangler/04.png",
      "/vehicles/jeep-wrangler/05.png",
      "/vehicles/jeep-wrangler/06.png",
      "/vehicles/jeep-wrangler/07.png",
      "/vehicles/jeep-wrangler/08-willys-detail.png",
      "/vehicles/jeep-wrangler/09-jeep-detail.png",
    ],
    proceduralModel: "jeep-wrangler",
    modelFeatures: {
      paintCustomization: true,
      lights: true,
    },
    accent: "#d6df3b",
    createdAt: "2026-08-07",
  },
];

export const vehicleById = Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle]));

// Conserva compatibilidad con el enlace de la versión anterior del prototipo.
vehicleById["2023-jeep-wrangler-rubicon-392"] = vehicleById["2023-jeep-wrangler-willys"];

export function formatPrice(value: number, locale: "es" | "en") {
  return new Intl.NumberFormat(locale === "es" ? "es-PE" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

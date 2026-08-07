export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const dictionary = {
  es: {
    inventory: "Inventario",
    home: "Inicio",
    about: "Nosotros",
    contact: "Contacto",
    callNow: "Llamar ahora",
    searchPlaceholder: "Buscar por marca, modelo o VIN...",
    allPrices: "Todos los precios",
    allTitles: "Todos los títulos",
    allTypes: "Todos los tipos",
    newest: "Más recientes",
    priceLow: "Precio: menor a mayor",
    priceHigh: "Precio: mayor a menor",
    vehiclesFound: "vehículos encontrados",
    clearFilters: "Limpiar filtros",
    viewDetails: "Ver detalles",
    backInventory: "Volver al inventario",
    stock: "Stock",
    reserve: "Reservar vehículo",
    whatsapp: "Consultar por WhatsApp",
    inquire: "Formulario de consulta",
    interested: "¿Te interesa este vehículo?",
    interestedText:
      "Contáctanos para reservarlo, solicitar una inspección o resolver cualquier duda.",
    specs: "Especificaciones",
    description: "Descripción",
    location: "Ubicación",
    photos: "Fotos",
    view3d: "Vista 3D",
    modelUnavailable: "No se encontró un GLB; se muestra el vehículo 3D de demostración.",
    rotate: "Rotar",
    reset: "Restablecer",
    fullscreen: "Pantalla completa",
    front: "Frente",
    side: "Lateral",
    rear: "Posterior",
    bottom: "Abajo",
  },
  en: {
    inventory: "Inventory",
    home: "Home",
    about: "About Us",
    contact: "Contact",
    callNow: "Call now",
    searchPlaceholder: "Search by make, model or VIN...",
    allPrices: "All prices",
    allTitles: "All titles",
    allTypes: "All vehicle types",
    newest: "Newest first",
    priceLow: "Price: low to high",
    priceHigh: "Price: high to low",
    vehiclesFound: "vehicles found",
    clearFilters: "Clear filters",
    viewDetails: "View details",
    backInventory: "Back to inventory",
    stock: "Stock",
    reserve: "Reserve vehicle",
    whatsapp: "WhatsApp us",
    inquire: "Inquire form",
    interested: "Interested in this vehicle?",
    interestedText:
      "Contact us to reserve it, request an inspection, or ask any question.",
    specs: "Specifications",
    description: "Description",
    location: "Location",
    photos: "Photos",
    view3d: "3D view",
    modelUnavailable: "No GLB was found; the 3D demo vehicle is being displayed.",
    rotate: "Rotate",
    reset: "Reset",
    fullscreen: "Fullscreen",
    front: "Front",
    side: "Side",
    rear: "Rear",
    bottom: "Bottom",
  },
} as const;

export function getUi(locale: Locale) {
  return dictionary[locale];
}

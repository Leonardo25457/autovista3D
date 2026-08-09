"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getUi, type Locale } from "../lib/i18n";
import { vehicles } from "../lib/vehicle-data";
import { VehicleCard } from "./VehicleCard";

export function VehicleInventory({ locale }: { locale: Locale }) {
  const ui = getUi(locale);
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState("all");
  const [title, setTitle] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = vehicles.filter((vehicle) => {
      const text = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} ${vehicle.vin ?? ""} ${vehicle.stock}`.toLowerCase();
      const queryMatch = !normalized || text.includes(normalized);
      const priceMatch = price === "all" ||
        (price === "under15" && vehicle.price < 15000) ||
        (price === "15to25" && vehicle.price >= 15000 && vehicle.price <= 25000) ||
        (price === "over25" && vehicle.price > 25000);
      const titleMatch = title === "all" || vehicle.titleStatus === title;
      const typeMatch = type === "all" || vehicle.bodyType === type;
      return queryMatch && priceMatch && titleMatch && typeMatch;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [price, query, sort, title, type]);

  const clear = () => {
    setQuery("");
    setPrice("all");
    setTitle("all");
    setType("all");
    setSort("newest");
  };

  return (
    <>
      <section className="inventory-hero">
        <div>
          <span>SHOWROOM DIGITAL</span>
          <h1>{ui.inventory} de vehículos</h1>
          <p>Explora fotografías, filtra el catálogo y abre cada unidad en un visor 3D interactivo.</p>
        </div>
      </section>

      <section className="filter-card" aria-label="Vehicle filters">
        <label className="search-control">
          <Search size={20} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ui.searchPlaceholder} />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}
        </label>

        <select value={price} onChange={(event) => setPrice(event.target.value)} aria-label="Price">
          <option value="all">{ui.allPrices}</option>
          <option value="under15">Menos de $15,000</option>
          <option value="15to25">$15,000 – $25,000</option>
          <option value="over25">Más de $25,000</option>
        </select>

        <select value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Title status">
          <option value="all">{ui.allTitles}</option>
          <option value="Clean">Clean</option>
          <option value="Rebuilt">Rebuilt</option>
          <option value="Salvage">Salvage</option>
        </select>

        <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Vehicle type">
          <option value="all">{ui.allTypes}</option>
          <option value="SUV">SUV</option>
          <option value="Pickup">Pickup</option>
          <option value="Sedan">Sedan</option>
          <option value="Coupe">Coupe</option>
        </select>

        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort">
          <option value="newest">{ui.newest}</option>
          <option value="price-low">{ui.priceLow}</option>
          <option value="price-high">{ui.priceHigh}</option>
        </select>

        <div className="filter-summary">
          <span><SlidersHorizontal size={16} /><strong>{filtered.length}</strong> {ui.vehiclesFound}</span>
          <button type="button" onClick={clear}>{ui.clearFilters}</button>
        </div>
      </section>

      <section className="inventory-grid">
        {filtered.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} />)}
      </section>

      {filtered.length === 0 && (
        <div className="empty-state">
          <h2>No se encontraron vehículos</h2>
          <p>Prueba con otros filtros o limpia la búsqueda.</p>
          <button type="button" onClick={clear}>{ui.clearFilters}</button>
        </div>
      )}
    </>
  );
}

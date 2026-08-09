import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gauge, MapPin } from "lucide-react";
import type { Locale } from "../lib/i18n";
import { getUi } from "../lib/i18n";
import { formatPrice, type Vehicle } from "../lib/vehicle-data";

export function VehicleCard({ vehicle, locale }: { vehicle: Vehicle; locale: Locale }) {
  const ui = getUi(locale);
  return (
    <article className="vehicle-card">
      <Link href={`/${locale}/vehicles/${vehicle.id}`} className="vehicle-card-image" scroll={true}>
        <Image
          src={vehicle.photos[0]}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          sizes="(max-width: 780px) calc(100vw - 24px), (max-width: 1100px) 50vw, 33vw"
        />
        <span className={`status-badge ${vehicle.status.toLowerCase().replace(" ", "-")}`}>{vehicle.status}</span>
        {vehicle.originalPrice && <span className="sale-badge">Oferta</span>}
      </Link>

      <div className="vehicle-card-body">
        <div className="card-title-line">
          <div>
            <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
            <p>{vehicle.trim}</p>
          </div>
          <small>{ui.stock} #{vehicle.stock}</small>
        </div>

        <div className="vehicle-card-meta">
          <span><Gauge size={15} /> {vehicle.mileage.toLocaleString(locale === "es" ? "es-PE" : "en-US")} km</span>
          <span><MapPin size={15} /> {vehicle.bodyType}</span>
        </div>

        <div className="vehicle-card-footer">
          <div className="price-block">
            {vehicle.originalPrice && <del>{formatPrice(vehicle.originalPrice, locale)}</del>}
            <strong>{formatPrice(vehicle.price, locale)}</strong>
          </div>
          <Link href={`/${locale}/vehicles/${vehicle.id}`} scroll={true}>
            {ui.viewDetails} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  FileText,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getUi, type Locale } from "../lib/i18n";
import { formatPrice, type Vehicle } from "../lib/vehicle-data";
import { SiteHeader } from "./SiteHeader";
import { VehicleViewer } from "./VehicleViewer";

export function VehicleDetail({
  vehicle,
  locale,
}: {
  vehicle: Vehicle;
  locale: Locale;
}) {
  const ui = getUi(locale);
  const [mode, setMode] = useState<"3d" | "photos">("photos");
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoStageRef = useRef<HTMLDivElement | null>(null);

  const currentPhoto = vehicle.photos[photoIndex] ?? vehicle.photos[0];

  useEffect(() => {
    setMode("photos");
    setPhotoIndex(0);

    // Next.js puede conservar la posición vertical anterior al navegar desde
    // el inventario. Forzamos el detalle a iniciar siempre desde su cabecera.
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    scrollToTop();
    const animationFrame = window.requestAnimationFrame(scrollToTop);
    const timeout = window.setTimeout(scrollToTop, 80);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
    };
  }, [vehicle.id]);

  const previousPhoto = () => {
    if (vehicle.photos.length === 0) return;
    setMode("photos");
    setPhotoIndex((current) =>
      current === 0 ? vehicle.photos.length - 1 : current - 1,
    );
  };

  const nextPhoto = () => {
    if (vehicle.photos.length === 0) return;
    setMode("photos");
    setPhotoIndex((current) =>
      current === vehicle.photos.length - 1 ? 0 : current + 1,
    );
  };

  const selectPhoto = (index: number) => {
    setPhotoIndex(index);
    setMode("photos");
  };

  const fullscreenPhoto = async () => {
    if (!photoStageRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await photoStageRef.current.requestFullscreen();
  };

  const specs = [
    ["VIN", vehicle.vin],
    ["Año", vehicle.year],
    ["Marca", vehicle.make],
    ["Modelo", `${vehicle.model} ${vehicle.trim}`],
    ["Carrocería", vehicle.bodyType],
    ["Puertas", vehicle.doors],
    ["Kilometraje", `${vehicle.mileage.toLocaleString()} km`],
    ["Título", vehicle.titleStatus],
    ["Color exterior", vehicle.exteriorColor],
    ["Color interior", vehicle.interiorColor],
    ["Motor", vehicle.engine],
    ["Potencia", `${vehicle.horsepower} hp`],
    ["Combustible", vehicle.fuel],
    ["Transmisión", vehicle.transmission],
    ["Tracción", vehicle.drivetrain],
  ];

  return (
    <>
      <SiteHeader locale={locale} />

      <main className="detail-page">
        <Link href={`/${locale}/vehicles`} className="back-link">
          <ArrowLeft size={18} />
          {ui.backInventory}
        </Link>

        <section className="detail-hero-grid">
          <div className="media-column">
            <div
              ref={photoStageRef}
              className={`vehicle-media-stage ${
                mode === "3d" ? "is-3d" : "is-photo"
              }`}
            >
              {mode === "3d" ? (
                <VehicleViewer vehicle={vehicle} locale={locale} />
              ) : (
                <>
                  <img
                    className="vehicle-main-photo"
                    src={currentPhoto}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - foto ${
                      photoIndex + 1
                    }`}
                  />

                  {vehicle.photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="gallery-arrow gallery-arrow-left"
                        onClick={previousPhoto}
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft size={42} />
                      </button>

                      <button
                        type="button"
                        className="gallery-arrow gallery-arrow-right"
                        onClick={nextPhoto}
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight size={42} />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="gallery-fullscreen"
                    onClick={fullscreenPhoto}
                    aria-label="Ver imagen en pantalla completa"
                  >
                    <Expand size={25} />
                  </button>

                  <div className="gallery-counter">
                    {photoIndex + 1} / {vehicle.photos.length}
                  </div>
                </>
              )}
            </div>

            <div className="vehicle-gallery-controls">
              <div className="thumbnail-carousel">
                {vehicle.photos.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={`gallery-thumbnail ${
                      mode === "photos" && photoIndex === index ? "active" : ""
                    }`}
                    onClick={() => selectPhoto(index)}
                    aria-label={`Ver foto ${index + 1}`}
                  >
                    <img
                      src={item}
                      alt={`${vehicle.model} foto ${index + 1}`}
                      loading={index > 4 ? "lazy" : "eager"}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`model-thumb ${mode === "3d" ? "active" : ""}`}
                onClick={() => setMode("3d")}
                aria-label="Abrir modelo 3D interactivo"
              >
                <span>3D</span>
                <small>Interactivo</small>
              </button>
            </div>
          </div>

          <aside className="purchase-card">
            <div className="purchase-topline">
              <span>
                {ui.stock} #{vehicle.stock}
              </span>

              <strong
                className={`status-pill ${vehicle.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {vehicle.status}
              </strong>
            </div>

            <h1>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>

            <p>{vehicle.trim}</p>

            <div className="detail-price">
              {vehicle.originalPrice && (
                <del>{formatPrice(vehicle.originalPrice, locale)}</del>
              )}
              <strong>{formatPrice(vehicle.price, locale)}</strong>
            </div>

            <a className="action action-red" href="#inquiry">
              <FileText size={20} />
              {ui.inquire}
            </a>

            <a
              className="action action-green"
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={20} />
              {ui.whatsapp}
            </a>

            <a className="action action-dark" href="tel:+51999999999">
              <Phone size={20} />
              {ui.reserve}
            </a>

            <div className="trust-row">
              <ShieldCheck size={18} />
              <span>Ficha verificable por VIN y número de stock</span>
            </div>
          </aside>
        </section>

        <section className="detail-content-grid">
          <div>
            <article className="content-card">
              <span className="section-kicker">
                <CheckCircle2 size={17} />
                {ui.specs}
              </span>

              <h2>Información del vehículo</h2>

              <dl className="spec-grid">
                {specs.map(([label, value]) => (
                  <div key={String(label)}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="content-card">
              <span className="section-kicker">
                <FileText size={17} />
                {ui.description}
              </span>

              <h2>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>
              <p>{vehicle.description}</p>
            </article>
          </div>

          <aside className="interest-card" id="inquiry">
            <h2>{ui.interested}</h2>
            <p>{ui.interestedText}</p>
            <span>
              {ui.stock} #{vehicle.stock}
            </span>
            <div>
              <MapPin size={18} />
              <strong>{vehicle.location}</strong>
            </div>
            <a href="tel:+51999999999">
              <Phone size={18} />
              +51 999 999 999
            </a>
          </aside>
        </section>
      </main>
    </>
  );
}

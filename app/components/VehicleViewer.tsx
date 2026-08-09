"use client";

import Image from "next/image";
import { AlertTriangle, Expand, Lightbulb, LoaderCircle, Minus, Palette, Plus, RefreshCcw, RotateCcw, View } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "../lib/i18n";
import { getUi } from "../lib/i18n";
import type { Vehicle } from "../lib/vehicle-data";
import type { VehicleScene } from "../lib/three/vehicle-viewer";

const jeepPaintOptions = [
  { name: "High Velocity Willys", value: "#d6df3b" },
  { name: "Amarillo arena", value: "#d6cf62" },
  { name: "Azul Hydro", value: "#0759c7" },
  { name: "Rojo Firecracker", value: "#a51d24" },
  { name: "Blanco", value: "#e5e5df" },
  { name: "Negro", value: "#111317" },
  { name: "Gris Sting", value: "#787d80" },
];

const teslaPaintOptions = [
  { name: "Azul gris referencia", value: "#45556b" },
  { name: "Azul profundo", value: "#384b65" },
  { name: "Gris Midnight", value: "#555b64" },
  { name: "Rojo Multi-Coat", value: "#8f1820" },
  { name: "Blanco Pearl", value: "#e7e7e3" },
  { name: "Negro Solid", value: "#111318" },
];

const corvettePaintOptions = [
  { name: "Rojo referencia real", value: "#e33a33" },
  { name: "Torch Red", value: "#d12626" },
  { name: "Long Beach Red", value: "#9b1d23" },
  { name: "Shark Gray", value: "#596067" },
  { name: "Arctic White", value: "#e7e7e3" },
  { name: "Black", value: "#101114" },
];


const fordBroncoPaintOptions = [
  { name: "Azul referencia", value: "#0870c9" },
  { name: "Velocity Blue", value: "#0067b9" },
  { name: "Area 51", value: "#64777c" },
  { name: "Cactus Gray", value: "#8f9791" },
  { name: "Oxford White", value: "#e8e8e3" },
  { name: "Shadow Black", value: "#101317" },
];

const toyotaSupraPaintOptions = [
  { name: "Azul referencia", value: "#285184" },
  { name: "Stratosphere Blue", value: "#224878" },
  { name: "Renaissance Red", value: "#a71e26" },
  { name: "Absolute Zero", value: "#e7e8e5" },
  { name: "Nocturnal", value: "#111318" },
  { name: "Tungsten", value: "#777d84" },
];
const toyota4RunnerPaintOptions = [
  { name: "Negro grafito referencia", value: "#101820" },
  { name: "Negro Midnight", value: "#0b1015" },
  { name: "Gris Magnetic", value: "#4b5055" },
  { name: "Azul Nautical", value: "#182b45" },
  { name: "Blanco Super White", value: "#e7e8e5" },
  { name: "Rojo Barcelona", value: "#7d1b20" },
];

export function VehicleViewer({ vehicle, locale }: { vehicle: Vehicle; locale: Locale }) {
  const ui = getUi(locale);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<VehicleScene | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number | null>(0);
  const [fallback, setFallback] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [paintOpen, setPaintOpen] = useState(false);
  const [paintColor, setPaintColor] = useState(vehicle.accent);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let scene: VehicleScene | null = null;
    setPaintColor(vehicle.accent);
    setError(false);
    setLoading(true);
    setProgress(0);

    const fail = () => {
      if (cancelled) return;
      setLoading(false);
      setError(true);
    };

    void import("../lib/three/vehicle-viewer").then(({ VehicleScene: Scene }) => {
      if (cancelled || !mountRef.current) return;
      try {
        scene = new Scene(mountRef.current, {
          onLoading: (value) => { if (!cancelled) setLoading(value); },
          onProgress: (value) => { if (!cancelled) setProgress(value); },
          onFallback: (value) => { if (!cancelled) setFallback(value); },
          onError: fail,
        });
        sceneRef.current = scene;
        void scene.setVehicle(vehicle.model3d, vehicle.accent, vehicle.proceduralModel).catch(fail);
      } catch {
        fail();
      }
    }).catch(fail);

    return () => {
      cancelled = true;
      sceneRef.current = null;
      scene?.dispose();
    };
  }, [retryKey, vehicle.accent, vehicle.model3d, vehicle.proceduralModel]);

  const fullscreen = async () => {
    if (!mountRef.current || !document.fullscreenEnabled) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await mountRef.current.parentElement?.requestFullscreen();
    } catch {
      // Fullscreen may be blocked by browser or embedding permissions.
    }
  };

  const changePaint = (color: string) => {
    setPaintColor(color);
    sceneRef.current?.setPaintColor(color);
  };

  const supportsLights = vehicle.modelFeatures?.lights || vehicle.proceduralModel === "jeep-wrangler";
  const supportsPaint = vehicle.modelFeatures?.paintCustomization;
  const paintOptions = vehicle.make === "Tesla" && vehicle.model === "Model 3"
    ? teslaPaintOptions
    : vehicle.make === "Chevrolet" && vehicle.model === "Corvette"
      ? corvettePaintOptions
      : vehicle.make === "Toyota" && vehicle.model === "4Runner"
        ? toyota4RunnerPaintOptions
        : vehicle.make === "Ford" && vehicle.model === "Bronco"
          ? fordBroncoPaintOptions
          : vehicle.make === "Toyota" && vehicle.model === "GR Supra"
            ? toyotaSupraPaintOptions
            : jeepPaintOptions;

  return (
    <section className="vehicle-viewer-shell">
      <div ref={mountRef} className="vehicle-three-mount" />

      {error && (
        <div className="viewer-error">
          <Image
            src={vehicle.photos[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            sizes="(max-width: 1100px) calc(100vw - 24px), 68vw"
          />
          <div>
            <AlertTriangle size={24} />
            <strong>{ui.viewerUnavailable}</strong>
            <button type="button" onClick={() => setRetryKey((value) => value + 1)}>
              <RefreshCcw size={16} /> {ui.retryViewer}
            </button>
          </div>
        </div>
      )}

      {!error && loading && (
        <div className="vehicle-loader">
          <div className="vehicle-loader-card">
            <LoaderCircle size={28} />
            <strong>Preparando modelo 3D</strong>
            <span>{progress === null ? "Procesando geometría y materiales" : `Descargando modelo · ${Math.round(progress)}%`}</span>
            <div className="vehicle-loader-track" aria-hidden="true">
              <i style={{ width: `${progress ?? 72}%` }} />
            </div>
          </div>
        </div>
      )}

      {!error && <div className="viewer-toolbar">
        <button className={autoRotate ? "active" : ""} type="button" onClick={() => {
          const next = !autoRotate;
          setAutoRotate(next);
          sceneRef.current?.setAutoRotate(next);
        }} title={ui.rotate}>
          <RotateCcw size={18} /><span>360°</span>
        </button>
        <button type="button" onClick={() => sceneRef.current?.zoom(1)} title="Acercar"><Plus size={18} /></button>
        <button type="button" onClick={() => sceneRef.current?.zoom(-1)} title="Alejar"><Minus size={18} /></button>
        <button type="button" onClick={() => sceneRef.current?.reset()} title={ui.reset}><View size={18} /></button>
        {supportsLights && (
          <button
            className={lightsOn ? "active" : ""}
            type="button"
            onClick={() => setLightsOn(sceneRef.current?.toggleLights() ?? lightsOn)}
            title={lightsOn ? "Apagar luces" : "Encender luces"}
          >
            <Lightbulb size={18} />
          </button>
        )}
        {supportsPaint && (
          <button
            className={paintOpen ? "active" : ""}
            type="button"
            onClick={() => setPaintOpen((value) => !value)}
            title="Cambiar color de carrocería"
          >
            <Palette size={18} />
          </button>
        )}
        <button type="button" onClick={fullscreen} title={ui.fullscreen}><Expand size={18} /></button>
      </div>}

      {!error && supportsPaint && paintOpen && (
        <div className="paint-picker" aria-label="Colores de carrocería">
          <strong>Color de carrocería</strong>
          <div style={{ gridTemplateColumns: `repeat(${Math.min(paintOptions.length, 4)}, 1fr)` }}>
            {paintOptions.map((option) => (
              <button
                key={option.value}
                className={paintColor.toLowerCase() === option.value.toLowerCase() ? "active" : ""}
                type="button"
                title={option.name}
                aria-label={option.name}
                style={{ backgroundColor: option.value }}
                onClick={() => changePaint(option.value)}
              />
            ))}
          </div>
          <small>Vista referencial del acabado</small>
        </div>
      )}

      {!error && <div className="view-presets">
        <button type="button" onClick={() => sceneRef.current?.setView("front")}>{ui.front}</button>
        <button type="button" onClick={() => sceneRef.current?.setView("side")}>{ui.side}</button>
        <button type="button" onClick={() => sceneRef.current?.setView("rear")}>{ui.rear}</button>
        <button type="button" onClick={() => sceneRef.current?.setView("bottom")}>{ui.bottom}</button>
      </div>}

      {!error && <div className="viewer-help">Arrastra para rotar · rueda para acercar · doble clic para centrar</div>}
      {!error && fallback && <div className="fallback-note">{ui.modelUnavailable}</div>}
    </section>
  );
}

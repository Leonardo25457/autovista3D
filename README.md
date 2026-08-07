# AutoVista 3D

MVP de inventario de vehículos basado en la arquitectura del proyecto VitaAtlas. Conserva el uso de Next.js, React, TypeScript y Three.js, pero cambia el dominio educativo de órganos por un catálogo comercial de vehículos.

## Incluye

- Inventario con búsqueda, filtros de precio, título y tipo de vehículo.
- Orden por fecha y precio.
- Rutas localizadas: `/{locale}/vehicles` y `/{locale}/vehicles/{vehicleId}`.
- Ficha individual con precio, stock, VIN, especificaciones y llamadas a la acción.
- Visor 3D interactivo con rotación 360°, zoom, vistas frontal/lateral/posterior, reset y pantalla completa.
- Galería de fotos secundaria.
- Vehículo 3D procedimental de respaldo para que el proyecto funcione aun sin archivos GLB.
- Soporte para modelos GLB reales mediante el campo `model3d` del catálogo.
- Diseño adaptable a escritorio, tablet y móvil.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000/es/vehicles
```

## Agregar un modelo 3D real

1. Optimiza el vehículo y expórtalo como `.glb`.
2. Copia el archivo a `public/models/`.
3. En `app/lib/vehicle-data.ts`, asigna:

```ts
model3d: "/models/toyota-tacoma-2024.glb"
```

Cuando el GLB no existe o no puede cargarse, el visor utiliza automáticamente un vehículo de demostración construido con geometrías de Three.js.

## Recomendaciones para GLB

- 80 000–180 000 triángulos para escritorio.
- 40 000–80 000 para una variante móvil.
- Tamaño ideal inicial: menos de 12 MB.
- Texturas WebP/KTX2 de 1K o 2K.
- Aplicar transformaciones y centrar el origen antes de exportar.
- Separar ruedas, puertas, capó e interior si luego se desea interacción por partes.
- Conservar nombres semánticos de malla como `wheel_front_left`, `door_driver`, `hood`, `interior`.

## Siguiente fase recomendada

- API y base de datos para inventario real.
- Panel administrativo con carga de fotos y GLB.
- Autenticación.
- Formularios que envíen leads a correo/CRM.
- Integración con WhatsApp Business.
- Modelos 3D con daños reales o configuraciones por color.
- CDN para imágenes y modelos.

## Jeep Wrangler procedural

La ficha `/es/vehicles/2024-jeep-wrangler-sahara` utiliza un modelo construido íntegramente con Three.js. El código está en `app/lib/three/jeep-wrangler-procedural.ts` e incluye carrocería, cristales, ruedas todoterreno, interior, parrilla, luces y materiales PBR.

Consulta `INTEGRACION_JEEP_WRANGLER.md` para ver la estructura y las opciones de personalización.

# AutoVista 3D

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.6-20232A?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.185.1-black?logo=threedotjs)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=nodedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

**AutoVista 3D** es una aplicación web de inventario automotriz desarrollada con **Next.js, React, TypeScript y Three.js**.  
El proyecto combina un catálogo de vehículos con fotografías reales y un visor 3D interactivo basado en WebGL, permitiendo inspeccionar cada unidad desde distintos ángulos, cambiar acabados visuales y navegar entre vistas predefinidas.

El objetivo es ofrecer una experiencia de catálogo más inmersiva que una ficha de vehículo tradicional, manteniendo una interfaz responsive y preparada para despliegue web.

---

## Características principales

- Inventario de vehículos con búsqueda y filtros.
- Ordenamiento por precio y fecha.
- Fichas individuales por vehículo.
- Galería fotográfica con carrusel, miniaturas y modo pantalla completa.
- Visualización 3D interactiva mediante **Three.js**.
- Rotación 360°, zoom y navegación orbital.
- Vistas predefinidas:
  - Frente.
  - Lateral.
  - Posterior.
  - Parte inferior.
- Personalización del color de carrocería en vehículos compatibles.
- Control de luces en modelos que lo soportan.
- Materiales PBR y tratamiento individual por vehículo.
- Carga de modelos `.glb` optimizados para web.
- Soporte para Meshopt y recursos de compresión 3D.
- Diseño responsive para escritorio, tablet y móvil.
- Interfaz disponible en español e inglés.
- Integración preparada para despliegue en **Vercel**.
- Organización independiente de fotografías y modelos 3D por vehículo.

---

## Tecnologías utilizadas

| Tecnología           | Uso en el proyecto                                                              |
| -------------------- | ------------------------------------------------------------------------------- |
| **Next.js 16**       | Framework principal, App Router, rutas dinámicas y renderizado de la aplicación |
| **React 19**         | Construcción de componentes y manejo del estado de interfaz                     |
| **TypeScript 5**     | Tipado estático y mantenimiento del código                                      |
| **Three.js**         | Renderizado WebGL y experiencia 3D interactiva                                  |
| **GLTFLoader / GLB** | Carga de modelos 3D optimizados                                                 |
| **OrbitControls**    | Rotación, zoom y navegación alrededor del vehículo                              |
| **RoomEnvironment**  | Iluminación ambiental para materiales PBR                                       |
| **MeshoptDecoder**   | Decodificación de geometrías optimizadas                                        |
| **Lucide React**     | Iconografía de la interfaz                                                      |
| **CSS3**             | Diseño responsive, carruseles, tarjetas y layout                                |
| **Node.js 22**       | Entorno de ejecución y herramientas de desarrollo                               |
| **ESLint**           | Análisis estático y calidad de código                                           |
| **Vercel**           | Plataforma objetivo para despliegue                                             |
| **Git / GitHub**     | Control de versiones y repositorio remoto                                       |

---

## Vehículos integrados

Actualmente el proyecto incluye experiencias fotográficas y/o 3D para:

- Jeep Wrangler Willys.
- Tesla Model 3.
- Chevrolet Corvette Stingray Z51.
- Toyota 4Runner.
- Ford Bronco.
- Toyota GR Supra.

Cada unidad se configura desde `app/lib/vehicle-data.ts`, donde se centralizan sus datos, fotografías, modelo 3D, color principal y capacidades del visor.

---

## Arquitectura del proyecto

```text
autovista3d/
├── app/
│   ├── [locale]/
│   │   └── vehicles/
│   ├── components/
│   │   ├── SiteHeader.tsx
│   │   ├── VehicleCard.tsx
│   │   ├── VehicleDetail.tsx
│   │   ├── VehicleInventory.tsx
│   │   └── VehicleViewer.tsx
│   ├── lib/
│   │   ├── three/
│   │   │   ├── jeep-wrangler-procedural.ts
│   │   │   └── vehicle-viewer.ts
│   │   ├── i18n.ts
│   │   └── vehicle-data.ts
│   ├── globals.css
│   └── layout.tsx
│
├── public/
│   ├── models/
│   │   ├── chevrolet-corvette/
│   │   ├── ford-bronco/
│   │   ├── jeep-wrangler/
│   │   ├── tesla-model-3/
│   │   ├── toyota-4runner/
│   │   └── toyota-gr-supra/
│   │
│   ├── vehicles/
│   │   ├── chevrolet-corvette/
│   │   ├── ford-bronco/
│   │   ├── jeep-wrangler/
│   │   ├── tesla-model-3/
│   │   ├── toyota-4runner/
│   │   └── toyota-gr-supra/
│   │
│   ├── basis/
│   ├── draco/
│   └── favicon.svg
│
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Visor 3D

La lógica principal del visor se encuentra en:

```text
app/lib/three/vehicle-viewer.ts
```

Este módulo administra:

- creación de la escena;
- cámara perspectiva;
- `WebGLRenderer`;
- `OrbitControls`;
- iluminación;
- environment mapping;
- carga de archivos GLB;
- materiales y texturas;
- normalización de escala;
- centrado automático de modelos;
- sombras;
- detección de orientación;
- vistas frontal, lateral, posterior e inferior;
- control de luces;
- cambio dinámico de pintura;
- optimizaciones de renderizado.

La interfaz React del visor está implementada en:

```text
app/components/VehicleViewer.tsx
```

---

## Modelos 3D

Los modelos se almacenan de forma organizada dentro de:

```text
public/models/<vehiculo>/
```

Ejemplo:

```text
public/models/
└── toyota-gr-supra/
    └── 2026-toyota-gr-supra.glb
```

Cada vehículo referencia su modelo desde `vehicle-data.ts`:

```ts
model3d: "/models/toyota-gr-supra/2026-toyota-gr-supra.glb";
```

### Optimización aplicada

Durante el desarrollo se han aplicado distintas técnicas para reducir el peso y mejorar el rendimiento de los modelos:

- eliminación de datos redundantes;
- deduplicación de recursos;
- reducción de información innecesaria;
- cuantización cuando el modelo lo permite;
- optimización de geometrías;
- compresión y organización de assets;
- reducción de texturas duplicadas;
- carga estática desde `public/` para facilitar CDN y despliegue.

El objetivo es mantener el mejor equilibrio posible entre **calidad visual, peso de descarga y rendimiento WebGL**.

---

## Galería de imágenes

Las fotografías se organizan por vehículo:

```text
public/vehicles/<vehiculo>/
```

Ejemplo:

```text
public/vehicles/jeep-wrangler/
├── 01.png
├── 02.png
├── 03.png
├── 04.png
├── 05.png
├── 06.png
├── 07.png
├── 08-willys-detail.png
└── 09-jeep-detail.png
```

La página de detalle combina la galería fotográfica y el visor 3D dentro de una misma experiencia multimedia.

---

## Instalación

### Requisitos

- Node.js **22.x**
- npm
- Git

Clona el repositorio:

```bash
git clone https://github.com/Leonardo25457/autovista3D.git
cd autovista3D
```

Instala las dependencias:

```bash
npm install
```

Inicia el entorno de desarrollo:

```bash
npm run dev
```

Abre:

```text
http://localhost:3000/es/vehicles
```

## Agregar un nuevo vehículo

1. Crea una carpeta para sus imágenes:

```text
public/vehicles/nuevo-vehiculo/
```

2. Crea una carpeta para su modelo:

```text
public/models/nuevo-vehiculo/
```

3. Agrega el archivo `.glb`.

4. Registra la nueva unidad en:

```text
app/lib/vehicle-data.ts
```

Ejemplo simplificado:

```ts
{
  id: "2026-nuevo-vehiculo",
  year: 2026,
  make: "Marca",
  model: "Modelo",
  trim: "Versión",
  photos: [
    "/vehicles/nuevo-vehiculo/01.png",
    "/vehicles/nuevo-vehiculo/02.png"
  ],
  model3d: "/models/nuevo-vehiculo/model.glb",
  modelFeatures: {
    paintCustomization: true,
    lights: true
  },
  accent: "#1f4f8a"
}
```

5. Si el GLB utiliza materiales especiales, agrega sus reglas en:

```text
app/lib/three/vehicle-viewer.ts
```

---

## Rendimiento

El visor incorpora medidas orientadas a mantener una experiencia fluida:

- límite de `devicePixelRatio`;
- `frustumCulled`;
- caché de Three.js;
- anisotropía controlada;
- materiales clonados por modelo;
- control de sombras;
- carga progresiva del GLB;
- suspensión práctica del render cuando el visor queda fuera de pantalla;
- modelos optimizados antes de producción.

Para nuevos modelos se recomienda mantener los GLB lo más ligeros posible sin comprometer la calidad visual necesaria.

---

## Internacionalización

La aplicación utiliza una capa de traducciones propia:

```text
app/lib/i18n.ts
```

Actualmente soporta:

```text
/es/vehicles
/en/vehicles
```

y sus respectivas páginas de detalle.

---

## Próximas mejoras

- API y base de datos para inventario administrable.
- Panel administrativo.
- Autenticación y roles.
- Carga de vehículos desde CMS.
- Integración con CRM.
- Formularios reales de consulta y reserva.
- WhatsApp Business API.
- CDN especializado para assets 3D.
- Carga diferida avanzada de modelos.
- KTX2/Basis para texturas comprimidas.
- Métricas de rendimiento y analítica.
- SEO dinámico por vehículo.

---

## Consideraciones sobre los recursos

Las fotografías, marcas, logotipos y modelos 3D utilizados en el proyecto pueden estar sujetos a derechos, atribuciones o licencias de terceros.

Antes de utilizar este proyecto con fines comerciales, verifica individualmente:

- licencia del modelo 3D;
- permiso de uso de fotografías;
- requisitos de atribución;
- restricciones de uso comercial;
- derechos sobre marcas y logotipos.

El código de la aplicación debe considerarse separado de las licencias aplicables a los assets incluidos.

---

## Autor

**Leonardo25457**

Proyecto desarrollado como una demostración técnica de una experiencia de inventario automotriz con visualización 3D en tiempo real.

---

## Estado del proyecto

**En desarrollo activo.**

La arquitectura ya permite seguir incorporando nuevos vehículos, fotografías y modelos GLB sin modificar la estructura general de la aplicación.

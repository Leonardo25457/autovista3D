import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  /*
   * Ignora archivos generados, compilados y librerías externas.
   *
   * Los archivos de Draco y Basis son distribuciones compiladas
   * de terceros. No forman parte del código fuente de VitaAtlas
   * y no deben ser analizados por ESLint.
   */
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "next-env.d.ts",

    "public/basis/**",
    "public/draco/**",
  ]),

  {
    rules: {
      /*
       * VitaAtlas utiliza efectos para:
       * - cargar información desde localStorage;
       * - detectar capacidades del navegador;
       * - sincronizar Web Speech API;
       * - reiniciar controles cuando cambia el órgano;
       * - sincronizar el visor de Three.js.
       *
       * Estas actualizaciones son intencionales.
       */
      "react-hooks/set-state-in-effect": "off",

      /*
       * Las imágenes de los órganos utilizan rutas dinámicas:
       * /anatomy/{organId}/{asset}.webp
       *
       * Se conserva <img> porque los archivos son recursos locales
       * dinámicos y no requieren el componente next/image.
       */
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;

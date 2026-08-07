import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoVista 3D | Inventario de vehículos",
  description:
    "Catálogo de vehículos con filtros, fotografías y visualización 3D interactiva.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

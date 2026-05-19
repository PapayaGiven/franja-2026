import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FRANJA 2026",
    short_name: "FRANJA",
    description: "Estilo de vida, visión, moda y negocios",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0F0820",
    theme_color: "#0F0820",
    lang: "es-CO",
    icons: [
      {
        src: "https://assets.unlayer.com/projects/237/1779221268527-Imagen-02%20(1).png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "https://assets.unlayer.com/projects/237/1779221268527-Imagen-02%20(1).png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
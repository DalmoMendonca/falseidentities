import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "False Identities",
    short_name: "False Identities",
    description: "A guided identity exercise to uncover false identities and reconnect with your truth.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff4f6",
    theme_color: "#f7e3ea",
    orientation: "portrait",
    lang: "en",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}

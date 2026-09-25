import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Formatica",
    short_name: "Formatica",
    description: "Check je kazen in, samen met je vrienden",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf6e3",
    theme_color: "#1f3f7a",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

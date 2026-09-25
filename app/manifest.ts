import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kaasbord",
    short_name: "Kaasbord",
    description: "Untappd, maar dan voor kaas",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf6e3",
    theme_color: "#f2b632",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

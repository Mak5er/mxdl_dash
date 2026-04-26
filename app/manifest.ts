import type { MetadataRoute } from "next";
import { defaultDescription, siteName } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} Telegram Downloader`,
    short_name: siteName,
    description: defaultDescription,
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#229ED9",
    categories: ["utilities", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

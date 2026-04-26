import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const homeUrl = getAbsoluteUrl("/");
  const heroImageUrl = getAbsoluteUrl("/maxload-hero.svg");

  if (!homeUrl) {
    return [];
  }

  return [
    {
      url: homeUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
      images: heroImageUrl ? [heroImageUrl] : undefined,
    },
  ];
}

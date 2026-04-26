import type { MetadataRoute } from "next";
import { getAbsoluteUrl, getPublicBaseUrl } from "@/lib/seo";

const privatePaths = ["/admin", "/api/admin"];
const aiCrawlers = [
  "GPTBot",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
  "anthropic-ai",
  "Applebot-Extended",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: privatePaths,
      })),
    ],
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: getPublicBaseUrl()?.origin,
  };
}

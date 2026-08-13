import type { MetadataRoute } from "next";
import { legalPages } from "@/content/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://faratanikah.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/signup`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const legalRoutes: MetadataRoute.Sitemap = Object.keys(legalPages).map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticRoutes, ...legalRoutes];
}

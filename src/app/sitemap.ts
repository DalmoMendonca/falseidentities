import type { MetadataRoute } from "next";
import { DATASET } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const baseUrl = siteUrl.replace(/\/$/, "");
  const now = new Date();

  const identityPages = DATASET.falseIdentities.map(identity => ({
    url: `${baseUrl}/identity/${identity.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    ...identityPages
  ];
}

import type { MetadataRoute } from "next";
import { classes } from "@/data/chapters";
import { QUIZZES } from "@/data/quizzes";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chemistrybykk.vercel.app"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/signin`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/doubts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/quiz`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/share`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const quizClassRoutes: MetadataRoute.Sitemap = classes.map((c) => ({
    url: `${siteUrl}/quiz/${c.classId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  const quizRoutes: MetadataRoute.Sitemap = QUIZZES.map((q) => ({
    url: `${siteUrl}/quiz/${q.classId}/${q.chapterSlug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // anchor-deep links per class for Google indexing
  const classAnchors: MetadataRoute.Sitemap = classes.map((c) => ({
    url: `${siteUrl}/?class=${c.classId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...base, ...quizClassRoutes, ...quizRoutes, ...classAnchors];
}

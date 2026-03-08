import type { MetadataRoute } from "next";
import { UNIQUE_CITIES } from "../lib/cities";
import { SERVICES } from "../lib/services";
import { INDUSTRIES } from "../lib/industries";

const BASE = "https://os.xiri.ai";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    /* ── Static pages ── */
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
        { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${BASE}/calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ];

    /* ── Competitor comparison pages ── */
    const competitors = ["swept", "cleanguru", "jobber", "cleantechloop"];
    const vsPages: MetadataRoute.Sitemap = competitors.map((c) => ({
        url: `${BASE}/vs/${c}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    /* ── Industry pages ── */
    const industryPages: MetadataRoute.Sitemap = INDUSTRIES.map((ind) => ({
        url: `${BASE}/for/${ind.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    /* ── City × Service pSEO pages ── */
    const cityPages: MetadataRoute.Sitemap = [];
    for (const svc of SERVICES) {
        for (const city of UNIQUE_CITIES) {
            cityPages.push({
                url: `${BASE}/${svc.slug}/${city.slug}`,
                lastModified: now,
                changeFrequency: "monthly" as const,
                priority: 0.5,
            });
        }
    }

    return [...staticPages, ...vsPages, ...industryPages, ...cityPages];
}

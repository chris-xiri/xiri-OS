import type { MetadataRoute } from "next";
import { UNIQUE_CITIES } from "../lib/cities";
import { SERVICES } from "../lib/services";
import { INDUSTRIES } from "../lib/industries";
import { BLOG_POSTS } from "../lib/posts";
import { FEATURES } from "../lib/features";

const BASE = "https://os.xiri.ai";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    /* ── Static pages ── */
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
        { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${BASE}/calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${BASE}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ];

    /* ── Blog posts ── */
    const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
        url: `${BASE}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    /* ── Competitor comparison pages ── */
    const competitors = ["swept", "cleanguru", "jobber", "janitorial-manager"];
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

    /* ── Feature pages ── */
    const featurePages: MetadataRoute.Sitemap = FEATURES.map((f) => ({
        url: `${BASE}/features/${f.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    /* ── Free tool pages ── */
    const tools = ["profit-calculator", "time-estimator", "employee-cost", "price-checker"];
    const toolPages: MetadataRoute.Sitemap = tools.map((t) => ({
        url: `${BASE}/tools/${t}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
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

    return [...staticPages, ...blogPages, ...vsPages, ...industryPages, ...featurePages, ...toolPages, ...cityPages];
}

import type { MetadataRoute } from "next";

const DISALLOWED = ["/api/", "/checkout/", "/app/"];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: DISALLOWED,
            },
            // Explicitly allow AI search & answer engine bots for LLM citation while protecting /app & /api
            { userAgent: "GPTBot", allow: "/", disallow: DISALLOWED },
            { userAgent: "ChatGPT-User", allow: "/", disallow: DISALLOWED },
            { userAgent: "OAI-SearchBot", allow: "/", disallow: DISALLOWED },
            { userAgent: "PerplexityBot", allow: "/", disallow: DISALLOWED },
            { userAgent: "ClaudeBot", allow: "/", disallow: DISALLOWED },
            { userAgent: "anthropic-ai", allow: "/", disallow: DISALLOWED },
            { userAgent: "Google-Extended", allow: "/", disallow: DISALLOWED },
            { userAgent: "Applebot-Extended", allow: "/", disallow: DISALLOWED },
        ],
        sitemap: "https://os.xiri.ai/sitemap.xml",
        host: "https://os.xiri.ai",
    };
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/checkout/", "/app/"],
            },
            // Explicitly allow AI search bots for LLM citation
            { userAgent: "GPTBot", allow: "/" },
            { userAgent: "ChatGPT-User", allow: "/" },
            { userAgent: "PerplexityBot", allow: "/" },
            { userAgent: "ClaudeBot", allow: "/" },
            { userAgent: "anthropic-ai", allow: "/" },
            { userAgent: "Google-Extended", allow: "/" },
        ],
        sitemap: "https://os.xiri.ai/sitemap.xml",
        host: "https://os.xiri.ai",
    };
}

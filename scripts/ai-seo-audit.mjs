#!/usr/bin/env node
// ============================================================
// Monthly AI SEO Audit — sends report to Google Chat webhook
// Run: node scripts/ai-seo-audit.mjs
// Schedule: GitHub Actions cron or local task scheduler
// ============================================================

const SITE_URL = "https://os.xiri.ai";
const WEBHOOK_URL =
    "https://chat.googleapis.com/v1/spaces/AAQA2NO-e-4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=QMd-LjJALIOUJkqUWoEJ98BuYBpA14OdHHS227JXVv8";

// Pages to audit
const PAGES = [
    { path: "/", name: "Homepage", expectSchema: ["WebSite", "Organization"] },
    { path: "/calculator", name: "Calculator", expectSchema: ["SoftwareApplication", "FAQPage"] },
    { path: "/blog/best-janitorial-bidding-software", name: "Comparison Post", expectSchema: ["Article"] },
    { path: "/blog/janitorial-bidding-pricing-guide", name: "Pricing Guide", expectSchema: ["Article"] },
    { path: "/pricing", name: "Pricing", expectSchema: [] },
];

// Key queries to manually test on LLMs (documented here for reference)
const LLM_TEST_QUERIES = [
    "best janitorial bidding software",
    "free janitorial bid calculator",
    "how to price a cleaning job",
    "ISSA 612 cleaning calculator",
    "janitorial estimate software free",
    "how to bid on a cleaning contract",
    "cleaning business bidding tools",
    "CleanGuru vs xiriOS",
    "best software for cleaning business",
    "janitorial proposal software",
];

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

async function fetchPage(path) {
    const url = `${SITE_URL}${path}`;
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "xiriOS-SEO-Audit/1.0" },
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return { ok: false, status: res.status, html: "", url };
        const html = await res.text();
        return { ok: true, status: res.status, html, url };
    } catch (e) {
        return { ok: false, status: 0, html: "", url, error: e.message };
    }
}

function extractJsonLd(html) {
    const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemas = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        try {
            const parsed = JSON.parse(match[1]);
            schemas.push(parsed);
        } catch {
            schemas.push({ _parseError: true, _raw: match[1].slice(0, 200) });
        }
    }
    return schemas;
}

function checkSSRContent(html, keywords) {
    const results = {};
    for (const kw of keywords) {
        results[kw] = html.toLowerCase().includes(kw.toLowerCase());
    }
    return results;
}

function gradeCheck(pass) {
    return pass ? "✅" : "❌";
}

// ────────────────────────────────────────────
// Audit Checks
// ────────────────────────────────────────────

async function auditRobotsTxt() {
    const res = await fetchPage("/robots.txt");
    if (!res.ok) return { grade: "F", details: `robots.txt returned ${res.status}` };

    const botChecks = ["GPTBot", "Google-Extended", "PerplexityBot", "Googlebot"];
    const blocked = botChecks.filter(
        (bot) => res.html.includes(`User-agent: ${bot}`) && res.html.includes("Disallow: /")
    );

    if (blocked.length > 0) {
        return { grade: "F", details: `Blocking: ${blocked.join(", ")}` };
    }

    const hasSitemap = res.html.toLowerCase().includes("sitemap:");
    return {
        grade: hasSitemap ? "A" : "B",
        details: hasSitemap
            ? "All AI bots allowed, sitemap declared"
            : "All AI bots allowed, but no sitemap declaration",
    };
}

async function auditSitemap() {
    const res = await fetchPage("/sitemap.xml");
    if (!res.ok) return { grade: "F", details: `sitemap.xml returned ${res.status}` };

    const urlCount = (res.html.match(/<loc>/g) || []).length;
    const hasCalc = res.html.includes("/calculator");
    const hasBlog = res.html.includes("/blog/");
    const hasVs = res.html.includes("/vs/");

    const issues = [];
    if (!hasCalc) issues.push("Missing /calculator");
    if (!hasBlog) issues.push("Missing /blog/ pages");
    if (!hasVs) issues.push("Missing /vs/ pages");

    return {
        grade: issues.length === 0 ? "A" : issues.length === 1 ? "B" : "C",
        details: `${urlCount} URLs indexed. ${issues.length === 0 ? "All key pages present." : "Missing: " + issues.join(", ")}`,
    };
}

async function auditSchemaMarkup() {
    const results = [];
    let totalExpected = 0;
    let totalFound = 0;

    for (const page of PAGES) {
        const res = await fetchPage(page.path);
        if (!res.ok) {
            results.push(`${page.name}: ❌ HTTP ${res.status}`);
            totalExpected += page.expectSchema.length;
            continue;
        }

        const schemas = extractJsonLd(res.html);
        const schemaTypes = schemas.map((s) => s["@type"]).filter(Boolean);

        for (const expected of page.expectSchema) {
            totalExpected++;
            const found = schemaTypes.includes(expected);
            if (found) totalFound++;
            results.push(`${page.name} → ${expected}: ${gradeCheck(found)}`);
        }
    }

    const pct = totalExpected === 0 ? 100 : Math.round((totalFound / totalExpected) * 100);
    const grade = pct >= 90 ? "A" : pct >= 70 ? "B" : pct >= 50 ? "C" : "F";

    return { grade, details: results.join("\n"), pct };
}

async function auditCalculatorSSR() {
    const res = await fetchPage("/calculator");
    if (!res.ok) return { grade: "F", details: `Calculator returned HTTP ${res.status}` };

    const keywords = [
        "ISSA 612",
        "Free Janitorial Bid Calculator",
        "building type",
        "production rates",
        "no signup",
        "square footage",
    ];

    const contentChecks = checkSSRContent(res.html, keywords);
    const found = Object.values(contentChecks).filter(Boolean).length;
    const total = keywords.length;
    const pct = Math.round((found / total) * 100);

    const details = Object.entries(contentChecks)
        .map(([kw, ok]) => `${gradeCheck(ok)} "${kw}"`)
        .join("\n");

    const grade = pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "F";

    return { grade, details: `${found}/${total} keywords found in SSR HTML:\n${details}` };
}

async function auditComparisonPost() {
    const res = await fetchPage("/blog/best-janitorial-bidding-software");
    if (!res.ok) return { grade: "F", details: `Page returned HTTP ${res.status}` };

    const checks = {
        "xiriOS mentioned": res.html.includes("xiriOS"),
        "CleanGuru mentioned": res.html.toLowerCase().includes("cleanguru"),
        "Swept mentioned": res.html.toLowerCase().includes("swept"),
        "Jobber mentioned": res.html.toLowerCase().includes("jobber"),
        "Janitorial Manager mentioned": res.html.toLowerCase().includes("janitorial manager"),
        "JaniBid mentioned": res.html.toLowerCase().includes("janibid"),
        "ISSA 612 referenced": res.html.includes("ISSA 612"),
        "Has Article schema": extractJsonLd(res.html).some((s) => s["@type"] === "Article"),
        "Updated date present": /202[5-9]-\d{2}-\d{2}/.test(res.html),
        "Free calculator CTA": res.html.toLowerCase().includes("free calculator"),
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const pct = Math.round((passed / total) * 100);

    const details = Object.entries(checks)
        .map(([name, ok]) => `${gradeCheck(ok)} ${name}`)
        .join("\n");

    const grade = pct >= 90 ? "A" : pct >= 70 ? "B" : pct >= 50 ? "C" : "F";

    return { grade, details: `${passed}/${total} checks passed:\n${details}` };
}

// ────────────────────────────────────────────
// Main
// ────────────────────────────────────────────

async function runAudit() {
    console.log("🔍 Running AI SEO Audit for", SITE_URL);
    console.log("─".repeat(50));

    const [robots, sitemap, schema, calculator, comparison] = await Promise.all([
        auditRobotsTxt(),
        auditSitemap(),
        auditSchemaMarkup(),
        auditCalculatorSSR(),
        auditComparisonPost(),
    ]);

    const reportCard = { robots, sitemap, schema, calculator, comparison };

    // Overall grade
    const grades = Object.values(reportCard).map((r) => r.grade);
    const gradeValues = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    const avgGrade =
        grades.reduce((sum, g) => sum + (gradeValues[g] || 0), 0) / grades.length;
    const overallGrade =
        avgGrade >= 3.5 ? "A" : avgGrade >= 2.5 ? "B" : avgGrade >= 1.5 ? "C" : "F";

    const now = new Date().toISOString().split("T")[0];

    // Console output
    console.log("\n📊 REPORT CARD");
    console.log(`Overall: ${overallGrade}`);
    for (const [name, result] of Object.entries(reportCard)) {
        console.log(`\n${name.toUpperCase()}: ${result.grade}`);
        console.log(result.details);
    }

    // Build Google Chat message (Card V2)
    const gradeEmoji = { A: "🟢", B: "🟡", C: "🟠", F: "🔴" };

    const chatMessage = {
        cardsV2: [
            {
                cardId: "ai-seo-audit",
                card: {
                    header: {
                        title: `AI SEO Audit — ${now}`,
                        subtitle: `Overall Grade: ${gradeEmoji[overallGrade] || "⚪"} ${overallGrade}`,
                        imageUrl: "https://os.xiri.ai/favicon.svg",
                        imageType: "CIRCLE",
                    },
                    sections: [
                        {
                            header: "📊 Report Card",
                            widgets: [
                                {
                                    decoratedText: {
                                        topLabel: "robots.txt",
                                        text: `${gradeEmoji[robots.grade]} ${robots.grade} — ${robots.details}`,
                                    },
                                },
                                {
                                    decoratedText: {
                                        topLabel: "Sitemap",
                                        text: `${gradeEmoji[sitemap.grade]} ${sitemap.grade} — ${sitemap.details}`,
                                    },
                                },
                                {
                                    decoratedText: {
                                        topLabel: "Schema Markup",
                                        text: `${gradeEmoji[schema.grade]} ${schema.grade} — ${schema.pct}% of expected schemas found`,
                                    },
                                },
                                {
                                    decoratedText: {
                                        topLabel: "Calculator SSR",
                                        text: `${gradeEmoji[calculator.grade]} ${calculator.grade}`,
                                    },
                                },
                                {
                                    decoratedText: {
                                        topLabel: "Comparison Post",
                                        text: `${gradeEmoji[comparison.grade]} ${comparison.grade}`,
                                    },
                                },
                            ],
                        },
                        {
                            header: "🔍 Schema Details",
                            collapsible: true,
                            widgets: [
                                {
                                    textParagraph: {
                                        text: schema.details.replace(/\n/g, "<br>"),
                                    },
                                },
                            ],
                        },
                        {
                            header: "📝 Calculator SSR Details",
                            collapsible: true,
                            widgets: [
                                {
                                    textParagraph: {
                                        text: calculator.details.replace(/\n/g, "<br>"),
                                    },
                                },
                            ],
                        },
                        {
                            header: "📰 Comparison Post Details",
                            collapsible: true,
                            widgets: [
                                {
                                    textParagraph: {
                                        text: comparison.details.replace(/\n/g, "<br>"),
                                    },
                                },
                            ],
                        },
                        {
                            header: "🤖 Monthly LLM Test Queries",
                            collapsible: true,
                            widgets: [
                                {
                                    textParagraph: {
                                        text:
                                            "Test these on ChatGPT, Perplexity, DuckDuckGo AI, and Google AI Overviews:<br><br>" +
                                            LLM_TEST_QUERIES.map((q, i) => `${i + 1}. "${q}"`).join("<br>"),
                                    },
                                },
                            ],
                        },
                        {
                            widgets: [
                                {
                                    buttonList: {
                                        buttons: [
                                            {
                                                text: "Open Rich Results Test",
                                                onClick: {
                                                    openLink: {
                                                        url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_URL + "/calculator")}`,
                                                    },
                                                },
                                            },
                                            {
                                                text: "View Site",
                                                onClick: {
                                                    openLink: { url: SITE_URL },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    };

    // Send to Google Chat webhook
    console.log("\n📤 Sending to Google Chat webhook...");
    try {
        const webhookRes = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify(chatMessage),
        });

        if (webhookRes.ok) {
            console.log("✅ Webhook delivered successfully!");
        } else {
            const errText = await webhookRes.text();
            console.error(`❌ Webhook failed (${webhookRes.status}):`, errText);
        }
    } catch (e) {
        console.error("❌ Webhook error:", e.message);
    }

    console.log("\n✅ Audit complete.");
    return overallGrade;
}

runAudit().catch(console.error);

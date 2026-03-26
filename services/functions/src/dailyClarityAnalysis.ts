/**
 * Daily Clarity UX Report — Scheduled Cloud Function
 *
 * Runs daily at 7:30 AM ET. Fetches raw Microsoft Clarity metrics
 * for the previous day and posts a formatted report to Google Chat.
 *
 * No AI analysis — just clean, actionable raw data with direct
 * links to filtered Clarity dashboard views.
 *
 * Secrets required:
 *   firebase functions:secrets:set CLARITY_API_TOKEN
 *   firebase functions:secrets:set GOOGLE_CHAT_WEBHOOK_URL
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";

const clarityApiToken = defineSecret("CLARITY_API_TOKEN");

const CLARITY_PROJECT_ID = "vtptoqsjih";
const CLARITY_DASHBOARD = `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}/dashboard`;

/* ─── Clarity API ─────────────────────── */

interface ClarityMetric {
    metricName: string;
    information: Array<Record<string, unknown>>;
}

function fmtDate(d: Date): string {
    return d.toISOString().split("T")[0];
}

async function fetchClarityData(
    token: string,
    dimension: string,
    startDate: string,
    endDate: string
): Promise<ClarityMetric[] | null> {
    const url =
        `https://www.clarity.ms/export-data/api/v1/project-live-insights` +
        `?projectId=${CLARITY_PROJECT_ID}&startDate=${startDate}&endDate=${endDate}&dimension=${dimension}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        console.error(`Clarity ${dimension}: ${res.status} ${await res.text()}`);
        return null;
    }
    return (await res.json()) as ClarityMetric[];
}

/* ─── Metric extractors ──────────────── */

function findMetric(data: ClarityMetric[], name: string): Record<string, unknown> | null {
    const metric = data.find((m) => m.metricName === name);
    return metric?.information?.[0] as Record<string, unknown> ?? null;
}

function findMetricList(data: ClarityMetric[], name: string): Array<Record<string, unknown>> {
    const metric = data.find((m) => m.metricName === name);
    return (metric?.information ?? []) as Array<Record<string, unknown>>;
}

/* ─── Clarity dashboard deep-links ──── */

function clarityFilter(filterType: string): string {
    return `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}/recordings?filterType=${filterType}`;
}

/* ─── Report builder ─────────────────── */

function buildReport(
    urlData: ClarityMetric[],
    deviceData: ClarityMetric[],
    dateRange: string
): string {
    const lines: string[] = [];
    lines.push(`📊 *Daily Clarity Report — ${dateRange}*\n`);

    // ── Traffic summary
    const traffic = findMetric(urlData, "Traffic");
    if (traffic) {
        const sessions = traffic.sessionsCount ?? "0";
        const bots = traffic.totalBotSessionCount ?? "0";
        const users = traffic.distinctUserCount ?? "0";
        const pagesPerSession = typeof traffic.pagesPerSessionPercentage === "number"
            ? traffic.pagesPerSessionPercentage.toFixed(1)
            : "–";
        lines.push(`*🔢 Traffic*`);
        lines.push(`Sessions: *${sessions}* · Unique users: *${users}* · Bot sessions: ${bots}`);
        lines.push(`Pages/session: *${pagesPerSession}*\n`);
    }

    // ── Scroll depth
    const scroll = findMetric(urlData, "ScrollDepth");
    if (scroll && typeof scroll.scrollDepth === "number") {
        lines.push(`*📜 Avg Scroll Depth:* ${scroll.scrollDepth.toFixed(0)}%\n`);
    }

    // ── UX signals (dead clicks, rage clicks, quick-backs, errors)
    const signals = [
        { metric: "DeadClickCount", emoji: "💀", label: "Dead Clicks", filter: "DeadClick" },
        { metric: "RageClickCount", emoji: "😤", label: "Rage Clicks", filter: "RageClick" },
        { metric: "QuickbackClick", emoji: "⏪", label: "Quick-backs", filter: "QuickbackClick" },
        { metric: "ErrorClickCount", emoji: "🔴", label: "Error Clicks", filter: "ErrorClick" },
        { metric: "ScriptErrorCount", emoji: "⚠️", label: "JS Errors", filter: "JavascriptError" },
    ];

    const uxLines: string[] = [];
    for (const s of signals) {
        const m = findMetric(urlData, s.metric);
        if (m) {
            const total = m.subTotal ?? "0";
            const pct = typeof m.sessionsWithMetricPercentage === "number"
                ? `${m.sessionsWithMetricPercentage}%`
                : "0%";
            const link = clarityFilter(s.filter);
            uxLines.push(`${s.emoji} ${s.label}: *${total}* (${pct} of sessions) — <${link}|View recordings>`);
        }
    }
    if (uxLines.length > 0) {
        lines.push(`*🔍 UX Signals*`);
        lines.push(...uxLines);
        lines.push("");
    }

    // ── Top pages
    const pages = findMetricList(urlData, "PopularPages");
    if (pages.length > 0) {
        lines.push(`*📄 Top Pages*`);
        const topPages = pages.slice(0, 8);
        for (const p of topPages) {
            const url = String(p.url ?? "").replace("https://os.xiri.ai", "");
            const visits = p.visitsCount ?? "0";
            lines.push(`  • ${url || "/"} — *${visits}* views`);
        }
        lines.push("");
    }

    // ── Referrers
    const referrers = findMetricList(urlData, "ReferrerUrl");
    const externalRefs = referrers.filter(
        (r) => r.name && !String(r.name).includes("xiri.ai")
    );
    if (externalRefs.length > 0) {
        lines.push(`*🔗 External Referrers*`);
        for (const r of externalRefs.slice(0, 5)) {
            lines.push(`  • ${r.name} — *${r.sessionsCount}* sessions`);
        }
        lines.push("");
    }

    // ── Devices
    const deviceTraffic = findMetricList(deviceData, "Traffic");
    if (deviceTraffic.length > 0) {
        // Device data has name field per entry
        const deviceEntries = findMetricList(deviceData, "PopularPages");
        // Actually device dimension gives traffic broken by device
        const devInfo = deviceTraffic.filter((d) => d.name);
        if (devInfo.length > 0) {
            lines.push(`*📱 Devices*`);
            for (const d of devInfo) {
                lines.push(`  • ${d.name}: *${d.sessionsCount}* sessions`);
            }
            lines.push("");
        }
    }

    // ── Dashboard link
    lines.push(`<${CLARITY_DASHBOARD}|📈 Open Clarity Dashboard>`);
    lines.push(`\n_Auto-generated from Microsoft Clarity_`);

    return lines.join("\n");
}

/* ─── Google Chat ─────────────────────── */

async function postToChat(webhookUrl: string, text: string): Promise<void> {
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ text }),
    });
    if (!res.ok) {
        throw new Error(`Chat webhook failed: ${res.status} ${await res.text()}`);
    }
}

/* ─── Scheduled function ──────────────── */

export const dailyClarityAnalysis = onSchedule(
    {
        schedule: "every day 07:30",
        timeZone: "America/New_York",
        secrets: [clarityApiToken],
        region: "us-central1",
    },
    async () => {
        const token = clarityApiToken.value();
        const webhook = "https://chat.googleapis.com/v1/spaces/AAQAovdl_QE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=De8UCx-guZrJtM7wyOPyR-MulDljbYp12KpjqgsJFkU";

        // Yesterday's data
        const end = new Date();
        end.setDate(end.getDate() - 1);
        const start = new Date();
        start.setDate(start.getDate() - 1);

        const startDate = fmtDate(start);
        const endDate = fmtDate(end);
        const dateRange = startDate;

        console.log(`Fetching Clarity data for ${dateRange}`);

        const [urlData, deviceData] = await Promise.all([
            fetchClarityData(token, "Url", startDate, endDate),
            fetchClarityData(token, "Device", startDate, endDate),
        ]);

        if (!urlData) {
            console.error("Failed to fetch Clarity URL data — skipping report.");
            return;
        }

        const report = buildReport(urlData, deviceData ?? [], dateRange);
        console.log("Report:\n", report);

        await postToChat(webhook, report);
        console.log("✅ Daily Clarity report posted to Google Chat.");
    }
);

/**
 * Daily Clarity UX Analysis
 *
 * Scheduled Cloud Function that runs every morning at 8 AM ET:
 *   1. Fetches yesterday's Clarity metrics via the Data Export API
 *   2. Sends the data to Gemini 2.0 Flash for AI analysis
 *   3. Posts UX recommendations to Google Chat
 *
 * Secrets required:
 *   - CLARITY_API_TOKEN: JWT from Clarity Data Export settings
 *   - GEMINI_API_KEY: Google AI Studio API key
 *   - GOOGLE_CHAT_WEBHOOK_URL: Google Chat webhook URL
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";

const clarityApiToken = defineSecret("CLARITY_API_TOKEN");
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const chatWebhookUrl = defineSecret("GOOGLE_CHAT_WEBHOOK_URL");

const CLARITY_PROJECT_ID = "vtptoqsjih";

/** Format a date as YYYY-MM-DD */
function fmtDate(d: Date): string {
    return d.toISOString().split("T")[0];
}

/** Fetch Clarity data for a dimension (e.g., "Url", "Browser", "Device") */
async function fetchClarityDimension(
    token: string,
    dimension: string,
    startDate: string,
    endDate: string,
): Promise<any> {
    const url = `https://www.clarity.ms/export-data/api/v1/project/${CLARITY_PROJECT_ID}` +
        `?startDate=${startDate}&endDate=${endDate}&dimension=${dimension}`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        console.error(`Clarity API error for ${dimension}: ${res.status} ${await res.text()}`);
        return null;
    }

    return res.json();
}

/** Call Gemini 2.0 Flash to analyze the Clarity data */
async function analyzeWithGemini(apiKey: string, clarityData: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a UX analytics expert for xiriOS, a SaaS platform for janitorial and cleaning businesses (os.xiri.ai). 

Analyze this Microsoft Clarity data from yesterday and provide actionable UX recommendations.

Focus on:
1. **Dead clicks & rage clicks** — signs of broken UI or user frustration
2. **Scroll depth** — are users seeing important content?
3. **Engagement time** — which pages hold attention, which don't?
4. **Top pages** — where is traffic concentrated?
5. **Device/browser breakdown** — any device-specific issues?
6. **Quick wins** — small changes that could have the biggest impact

Be specific and practical. Reference actual page URLs and metrics from the data.
Format your response as a concise list of 3-5 actionable recommendations, each with:
- 🎯 What to fix
- 📊 Supporting data
- ✅ Recommended action

Here is yesterday's Clarity data:
${clarityData}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500,
            },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Gemini API error:", err);
        return `⚠️ Gemini analysis failed: ${res.status}`;
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated.";
}

/** Post to Google Chat */
async function postToChat(webhookUrl: string, text: string) {
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ text }),
    });
    if (!res.ok) {
        throw new Error(`Google Chat webhook failed: ${res.status} ${await res.text()}`);
    }
}

/**
 * Runs daily at 8:00 AM Eastern (12:00 UTC in winter / 12:00 UTC in summer).
 * Adjust schedule if needed.
 */
export const dailyClarityAnalysis = onSchedule(
    {
        schedule: "every day 08:00",
        timeZone: "America/New_York",
        secrets: [clarityApiToken, geminiApiKey, chatWebhookUrl],
        region: "us-central1",
    },
    async () => {
        console.log("Starting daily Clarity UX analysis...");

        // Yesterday's date range
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = fmtDate(yesterday);
        const endDate = fmtDate(yesterday);

        const token = clarityApiToken.value();

        // Fetch multiple dimensions in parallel
        const [urlData, deviceData, browserData, countryData, osData] = await Promise.all([
            fetchClarityDimension(token, "Url", startDate, endDate),
            fetchClarityDimension(token, "Device", startDate, endDate),
            fetchClarityDimension(token, "Browser", startDate, endDate),
            fetchClarityDimension(token, "Country", startDate, endDate),
            fetchClarityDimension(token, "OS", startDate, endDate),
        ]);

        // Compile data for Gemini
        const clarityReport = JSON.stringify({
            date: startDate,
            byUrl: urlData,
            byDevice: deviceData,
            byBrowser: browserData,
            byCountry: countryData,
            byOS: osData,
        }, null, 2);

        console.log(`Clarity data fetched: ${clarityReport.length} chars`);

        // Analyze with Gemini
        const analysis = await analyzeWithGemini(geminiApiKey.value(), clarityReport);
        console.log("Gemini analysis complete");

        // Post to Google Chat
        const chatMessage = `🔍 *Daily UX Analysis — ${startDate}*\n\n${analysis}\n\n_Powered by Microsoft Clarity + Gemini 2.0 Flash_`;
        await postToChat(chatWebhookUrl.value(), chatMessage);

        console.log("Daily Clarity analysis posted to Google Chat");
    },
);

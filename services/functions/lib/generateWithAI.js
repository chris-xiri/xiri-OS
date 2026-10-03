"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWithAI = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const geminiApiKey = (0, params_1.defineSecret)("GEMINI_API_KEY");
exports.generateWithAI = (0, https_1.onCall)({ secrets: [geminiApiKey], region: "us-central1" }, async (request) => {
    // 1. Verify user authentication
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in to generate text.");
    }
    const data = request.data;
    // 2. Validate input parameters
    if (!data || typeof data.prompt !== "string" || !data.prompt.trim()) {
        throw new https_1.HttpsError("invalid-argument", "Missing or invalid required 'prompt' string parameter.");
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError("failed-precondition", "GEMINI_API_KEY secret is not set or empty.");
    }
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: data.prompt }] }]
            }),
        });
        if (!resp.ok) {
            const errText = await resp.text();
            console.error("Gemini API error response:", errText);
            throw new https_1.HttpsError("internal", `Gemini API returned status ${resp.status}: ${errText}`);
        }
        const json = (await resp.json());
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        return { text };
    }
    catch (err) {
        console.error("Failed to generate content with Gemini:", err);
        if (err instanceof https_1.HttpsError)
            throw err;
        throw new https_1.HttpsError("internal", err.message || "Failed to generate text");
    }
});
//# sourceMappingURL=generateWithAI.js.map
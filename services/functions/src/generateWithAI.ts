import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

interface GenerateRequest {
    prompt: string;
}

export const generateWithAI = onCall(
    { secrets: [geminiApiKey], region: "us-central1" },
    async (request) => {
        // 1. Verify user authentication
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be signed in to generate text.");
        }

        const data = request.data as GenerateRequest;

        // 2. Validate input parameters
        if (!data || typeof data.prompt !== "string" || !data.prompt.trim()) {
            throw new HttpsError("invalid-argument", "Missing or invalid required 'prompt' string parameter.");
        }

        const apiKey = geminiApiKey.value();
        if (!apiKey) {
            throw new HttpsError("failed-precondition", "GEMINI_API_KEY secret is not set or empty.");
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
                throw new HttpsError("internal", `Gemini API returned status ${resp.status}: ${errText}`);
            }

            const json = (await resp.json()) as any;
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

            return { text };
        } catch (err: any) {
            console.error("Failed to generate content with Gemini:", err);
            if (err instanceof HttpsError) throw err;
            throw new HttpsError("internal", err.message || "Failed to generate text");
        }
    }
);

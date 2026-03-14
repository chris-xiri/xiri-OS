/**
 * Admin Notifications — Google Chat alerts for key business events
 *
 * Uses a single Google Chat space with threading:
 *   - Signup creates a new thread (keyed by UID)
 *   - Subscription replies to that user's thread
 *
 * Set the webhook URL secret via:
 *   firebase functions:secrets:set GOOGLE_CHAT_WEBHOOK_URL
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";

const chatWebhookUrl = defineSecret("GOOGLE_CHAT_WEBHOOK_URL");

/**
 * Post a card message to Google Chat with threading support.
 * Messages with the same threadKey are grouped into one thread.
 */
async function postToChat(
    webhookUrl: string,
    card: Record<string, unknown>,
    threadKey: string,
) {
    const separator = webhookUrl.includes("?") ? "&" : "?";
    const url = `${webhookUrl}${separator}messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD`;

    const body = {
        ...card,
        thread: { threadKey },
    };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error(`Google Chat webhook failed: ${res.status} ${await res.text()}`);
    }
}

/**
 * Firestore trigger — fires when a new company document is created.
 * This happens right after a user signs up and the app creates their company doc.
 * Creates a NEW THREAD in Google Chat for this user.
 */
export const notifyNewCompany = onDocumentCreated(
    {
        document: "companies/{companyId}",
        secrets: [chatWebhookUrl],
        region: "us-central1",
    },
    async (event) => {
        const snap = event.data;
        if (!snap) return;

        const data = snap.data();
        const email = data?.ownerEmail || data?.email || "Unknown";
        const displayName = data?.ownerName || data?.name || "Not provided";
        const uid = data?.ownerId || event.params.companyId;
        const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

        try {
            await postToChat(
                chatWebhookUrl.value(),
                {
                    cardsV2: [{
                        cardId: `signup-${uid}`,
                        card: {
                            header: {
                                title: "🎉  New User Signup!",
                                subtitle: email,
                            },
                            sections: [{
                                widgets: [
                                    { decoratedText: { topLabel: "Email", text: email, startIcon: { knownIcon: "EMAIL" } } },
                                    { decoratedText: { topLabel: "Name", text: displayName, startIcon: { knownIcon: "PERSON" } } },
                                    { decoratedText: { topLabel: "Company", text: data?.name || "Not set yet" } },
                                    { decoratedText: { topLabel: "Signed Up (ET)", text: `🕐  ${timestamp}` } },
                                ],
                            }],
                        },
                    }],
                },
                uid,
            );
            console.log(`💬 Chat notified of new signup: ${email}`);
        } catch (err) {
            console.error("Failed to send Google Chat signup notification:", err);
        }
    }
);

/**
 * Post a subscription notification as a REPLY to the user's signup thread.
 * Called from stripe.ts webhook handler.
 */
export async function notifyAdminSubscription(
    webhookUrl: string,
    details: { email: string; companyName: string; tier: string; companyId: string; uid: string }
) {
    const tierLabels: Record<string, string> = {
        bid_plus: "Bid Plus ($9/mo)",
        grow: "Grow ($39/mo)",
        pro: "Pro ($79/mo)",
        business: "Business ($119/mo)",
    };
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    try {
        await postToChat(
            webhookUrl,
            {
                cardsV2: [{
                    cardId: `sub-${details.companyId}`,
                    card: {
                        header: {
                            title: "💰  Subscribed!",
                            subtitle: details.email,
                        },
                        sections: [{
                            widgets: [
                                { decoratedText: { topLabel: "Plan", text: tierLabels[details.tier] || details.tier, startIcon: { knownIcon: "STAR" } } },
                                { decoratedText: { topLabel: "Company", text: details.companyName, startIcon: { knownIcon: "HOTEL_ROOM_TYPE" } } },
                                { decoratedText: { topLabel: "Subscribed (ET)", text: `🕐  ${timestamp}` } },
                            ],
                        }],
                    },
                }],
            },
            details.uid,
        );
        console.log(`💬 Chat notified of subscription: ${details.email} → ${details.tier}`);
    } catch (err) {
        console.error("Failed to send Google Chat subscription notification:", err);
    }
}

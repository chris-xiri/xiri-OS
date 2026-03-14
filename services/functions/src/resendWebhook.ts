/**
 * Resend Webhook Handler
 *
 * Receives Resend webhook events (delivered, opened, clicked, bounced)
 * and updates the corresponding bid document in Firestore with engagement data.
 *
 * Webhook URL to register in Resend dashboard:
 *   https://us-central1-<project-id>.cloudfunctions.net/resendWebhook
 *
 * Enable these events in Resend: email.delivered, email.opened, email.clicked, email.bounced
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

const resendSigningSecret = defineSecret("RESEND_WEBHOOK_SECRET");

interface ResendWebhookPayload {
    type: string;
    created_at: string;
    data: {
        email_id: string;
        from: string;
        to: string[];
        subject: string;
        created_at: string;
        // click events have a click object
        click?: { link: string; timestamp: string };
    };
}

/**
 * Look up a bid document by its stored emailId.
 * The emailId is saved when sendProposal sends the email.
 */
async function findBidByEmailId(emailId: string) {
    const db = admin.firestore();
    // Search across all companies for the bid with this emailId
    const companiesSnap = await db.collection("companies").get();

    for (const companyDoc of companiesSnap.docs) {
        const bidsSnap = await db
            .collection(`companies/${companyDoc.id}/bids`)
            .where("emailId", "==", emailId)
            .limit(1)
            .get();

        if (!bidsSnap.empty) {
            return {
                ref: bidsSnap.docs[0].ref,
                data: bidsSnap.docs[0].data(),
                companyId: companyDoc.id,
            };
        }
    }

    return null;
}

export const resendWebhook = onRequest(
    { secrets: [resendSigningSecret], region: "us-central1" },
    async (req, res) => {
        // Only accept POST
        if (req.method !== "POST") {
            res.status(405).send("Method not allowed");
            return;
        }

        // Verify webhook signature (Resend sends svix headers)
        const svixId = req.headers["svix-id"] as string;
        const svixTimestamp = req.headers["svix-timestamp"] as string;
        const svixSignature = req.headers["svix-signature"] as string;

        if (!svixId || !svixTimestamp || !svixSignature) {
            console.warn("Missing svix headers — skipping signature verification");
            // Still process in dev, but log the warning
        }

        // TODO: For production, verify signature using svix library:
        //   import { Webhook } from "svix";
        //   const wh = new Webhook(resendSigningSecret.value());
        //   wh.verify(JSON.stringify(req.body), { "svix-id": svixId, ... });

        const payload = req.body as ResendWebhookPayload;
        const { type, data } = payload;

        if (!data?.email_id) {
            console.warn("No email_id in webhook payload:", type);
            res.status(200).send("OK — no email_id");
            return;
        }

        const emailId = data.email_id;
        console.log(`Resend webhook: ${type} for email ${emailId}`);

        try {
            const bid = await findBidByEmailId(emailId);

            if (!bid) {
                // Not every Resend email is a proposal (could be trial reminders, etc.)
                console.log(`No bid found for emailId ${emailId} — ignoring`);
                res.status(200).send("OK — not a proposal email");
                return;
            }

            const now = new Date().toISOString();
            const updates: Record<string, any> = {};

            switch (type) {
                case "email.delivered":
                    updates.emailDelivered = true;
                    updates.emailDeliveredAt = now;
                    break;

                case "email.opened":
                    updates.emailOpened = true;
                    updates.emailLastOpenedAt = now;
                    updates.emailOpenCount = admin.firestore.FieldValue.increment(1);
                    break;

                case "email.clicked":
                    updates.emailClicked = true;
                    updates.emailClickedAt = now;
                    if (data.click?.link) {
                        updates.emailClickedLink = data.click.link;
                    }
                    break;

                case "email.bounced":
                    updates.emailBounced = true;
                    updates.emailBouncedAt = now;
                    break;

                case "email.complained":
                    updates.emailComplained = true;
                    updates.emailComplainedAt = now;
                    break;

                default:
                    console.log(`Unhandled Resend event type: ${type}`);
                    res.status(200).send("OK — unhandled event");
                    return;
            }

            await bid.ref.update(updates);
            console.log(`Updated bid ${bid.ref.id} (company ${bid.companyId}): ${type}`);

            res.status(200).send("OK");
        } catch (err) {
            console.error("Error processing Resend webhook:", err);
            res.status(500).send("Internal error");
        }
    },
);

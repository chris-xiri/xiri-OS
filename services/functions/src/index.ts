/**
 * Cloud Functions for xiriOS Dashboard
 */

// Stripe integration
export { createCheckoutSession, createPortalSession, handleStripeWebhook } from "./stripe";

// Trial expiry checker
export { checkTrialExpiry } from "./checkTrialExpiry";

// Trial reminder emails
export { sendTrialReminders } from "./trialReminders";

// Server-side limit enforcement
export { createBidWithLimit, createContactWithLimit } from "./limitEnforcement";

// Admin notifications (new signup + new subscription alerts)
export { onNewUserSignup } from "./adminNotifications";

// Resend email engagement webhooks (open/click tracking)
export { resendWebhook } from "./resendWebhook";

// Daily Clarity UX analysis (scheduled — 8 AM ET)
export { dailyClarityAnalysis } from "./dailyClarityAnalysis";

/**
 * sendProposal — Sends a cleaning proposal PDF via Resend email.
 * Called from the dashboard via httpsCallable.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

admin.initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");

interface SendProposalRequest {
    bidId: string;
    companyId: string;
    pdfBase64: string;
    filename: string;
    toEmail: string;
    toName: string;
    ccEmail: string;
    replyToEmail: string;
    companyName: string;
    bidName: string;
    subject?: string;
}

export const sendProposal = onCall(
    { secrets: [resendApiKey], region: "us-central1" },
    async (request) => {
        // 1. Verify authentication
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be signed in to send proposals.");
        }

        const data = request.data as SendProposalRequest;

        // 2. Validate required fields
        if (!data.bidId || !data.companyId || !data.pdfBase64 || !data.toEmail || !data.filename) {
            throw new HttpsError("invalid-argument", "Missing required fields: bidId, companyId, pdfBase64, toEmail, filename.");
        }

        // 3. Verify user has access to this company
        const uid = request.auth.uid;
        const profileSnap = await admin.firestore().doc(`users/${uid}`).get();
        const profile = profileSnap.data();
        if (!profile || profile.companyId !== data.companyId) {
            throw new HttpsError("permission-denied", "You do not have access to this company.");
        }

        // 4. Send email via Resend
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey.value());

        const subject = data.subject || `Cleaning Proposal — ${data.bidName}`;

        try {
            const emailResult = await resend.emails.send({
                from: `${data.companyName} via xiriOS <proposals@xiri.ai>`,
                to: data.toEmail,
                cc: data.ccEmail || undefined,
                replyTo: data.replyToEmail || data.ccEmail || undefined,
                subject,
                html: `
                    <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
                        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                            Hi ${data.toName || "there"},
                        </p>
                        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                            Please find attached our cleaning proposal for your review. We look forward to the opportunity to serve your facility.
                        </p>
                        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                            If you have any questions or would like to discuss the details, please don't hesitate to reply to this email.
                        </p>
                        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                            Best regards,<br/>
                            <strong>${data.companyName}</strong>
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="color: #9ca3af; font-size: 12px;">
                            Sent via <a href="https://os.xiri.ai" style="color: #00d4aa;">xiriOS</a>
                        </p>
                    </div>
                `,
                attachments: [
                    {
                        filename: data.filename,
                        content: data.pdfBase64,
                    },
                ],
            });

            // 5. Update bid status in Firestore
            const bidRef = admin.firestore().doc(`companies/${data.companyId}/bids/${data.bidId}`);
            await bidRef.update({
                status: "sent",
                sentAt: new Date().toISOString(),
                sentToEmail: data.toEmail,
                emailId: emailResult?.data?.id || null,
                updatedAt: new Date().toISOString(),
            });

            return {
                success: true,
                emailId: emailResult?.data?.id || null,
            };
        } catch (err: any) {
            console.error("Resend email error:", err);
            throw new HttpsError("internal", `Failed to send email: ${err.message || "Unknown error"}`);
        }
    }
);

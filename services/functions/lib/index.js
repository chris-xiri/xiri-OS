"use strict";
/**
 * Cloud Functions for xiriOS Dashboard
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendProposal = exports.onNewUserSignup = exports.createContactWithLimit = exports.createBidWithLimit = exports.sendTrialReminders = exports.checkTrialExpiry = exports.handleStripeWebhook = exports.createPortalSession = exports.createCheckoutSession = void 0;
// Stripe integration
var stripe_1 = require("./stripe");
Object.defineProperty(exports, "createCheckoutSession", { enumerable: true, get: function () { return stripe_1.createCheckoutSession; } });
Object.defineProperty(exports, "createPortalSession", { enumerable: true, get: function () { return stripe_1.createPortalSession; } });
Object.defineProperty(exports, "handleStripeWebhook", { enumerable: true, get: function () { return stripe_1.handleStripeWebhook; } });
// Trial expiry checker
var checkTrialExpiry_1 = require("./checkTrialExpiry");
Object.defineProperty(exports, "checkTrialExpiry", { enumerable: true, get: function () { return checkTrialExpiry_1.checkTrialExpiry; } });
// Trial reminder emails
var trialReminders_1 = require("./trialReminders");
Object.defineProperty(exports, "sendTrialReminders", { enumerable: true, get: function () { return trialReminders_1.sendTrialReminders; } });
// Server-side limit enforcement
var limitEnforcement_1 = require("./limitEnforcement");
Object.defineProperty(exports, "createBidWithLimit", { enumerable: true, get: function () { return limitEnforcement_1.createBidWithLimit; } });
Object.defineProperty(exports, "createContactWithLimit", { enumerable: true, get: function () { return limitEnforcement_1.createContactWithLimit; } });
// Admin notifications (new signup + new subscription alerts)
var adminNotifications_1 = require("./adminNotifications");
Object.defineProperty(exports, "onNewUserSignup", { enumerable: true, get: function () { return adminNotifications_1.onNewUserSignup; } });
/**
 * sendProposal — Sends a cleaning proposal PDF via Resend email.
 * Called from the dashboard via httpsCallable.
 */
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const resendApiKey = (0, params_1.defineSecret)("RESEND_API_KEY");
exports.sendProposal = (0, https_1.onCall)({ secrets: [resendApiKey], region: "us-central1" }, async (request) => {
    // 1. Verify authentication
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in to send proposals.");
    }
    const data = request.data;
    // 2. Validate required fields
    if (!data.bidId || !data.companyId || !data.pdfBase64 || !data.toEmail || !data.filename) {
        throw new https_1.HttpsError("invalid-argument", "Missing required fields: bidId, companyId, pdfBase64, toEmail, filename.");
    }
    // 3. Verify user has access to this company
    const uid = request.auth.uid;
    const profileSnap = await admin.firestore().doc(`users/${uid}`).get();
    const profile = profileSnap.data();
    if (!profile || profile.companyId !== data.companyId) {
        throw new https_1.HttpsError("permission-denied", "You do not have access to this company.");
    }
    // 4. Send email via Resend
    const { Resend } = await Promise.resolve().then(() => __importStar(require("resend")));
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
            updatedAt: new Date().toISOString(),
        });
        return {
            success: true,
            emailId: emailResult?.data?.id || null,
        };
    }
    catch (err) {
        console.error("Resend email error:", err);
        throw new https_1.HttpsError("internal", `Failed to send email: ${err.message || "Unknown error"}`);
    }
});
//# sourceMappingURL=index.js.map
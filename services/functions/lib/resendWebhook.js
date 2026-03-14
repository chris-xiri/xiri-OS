"use strict";
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
exports.resendWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const resendSigningSecret = (0, params_1.defineSecret)("RESEND_WEBHOOK_SECRET");
/**
 * Look up a bid document by its stored emailId.
 * The emailId is saved when sendProposal sends the email.
 */
async function findBidByEmailId(emailId) {
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
exports.resendWebhook = (0, https_1.onRequest)({ secrets: [resendSigningSecret], region: "us-central1" }, async (req, res) => {
    // Only accept POST
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }
    // Verify webhook signature (Resend sends svix headers)
    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];
    if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn("Missing svix headers — skipping signature verification");
        // Still process in dev, but log the warning
    }
    // TODO: For production, verify signature using svix library:
    //   import { Webhook } from "svix";
    //   const wh = new Webhook(resendSigningSecret.value());
    //   wh.verify(JSON.stringify(req.body), { "svix-id": svixId, ... });
    const payload = req.body;
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
        const updates = {};
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
    }
    catch (err) {
        console.error("Error processing Resend webhook:", err);
        res.status(500).send("Internal error");
    }
});
//# sourceMappingURL=resendWebhook.js.map
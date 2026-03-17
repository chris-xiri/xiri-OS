"use strict";
/**
 * Onboarding Nudge Emails — Scheduled Cloud Function
 *
 * Runs every hour to send behavior-triggered emails to new users
 * who haven't hit key milestones:
 *
 *   1. +1 hour  — Signed up, no bid created
 *   2. +24 hours — Still no bid
 *   3. +48 hours — Created bid but never sent proposal
 *   4. +5 days   — Inactive (no bids in 5 days)
 *
 * Uses Resend API. Tracks sent flags on company doc to prevent dupes.
 * Skips paying subscribers and users already getting trial reminders.
 *
 * Set the API key via: firebase functions:secrets:set RESEND_API_KEY
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
exports.sendOnboardingNudges = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const resendApiKey = (0, params_1.defineSecret)("RESEND_API_KEY");
const FROM = "Chris from xiri <chris@xiri.ai>";
const REPLY_TO = "chris@xiri.ai";
const NUDGES = [
    {
        key: "nudge1hSent",
        minHoursAfterSignup: 1,
        requiresNoBids: true,
        requiresBidsNoProposal: false,
        subject: "Your account is ready — create your first bid",
        bodyHtml: (name) => `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hey ${name},</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Chris here — I saw you signed up for xiriOS. Welcome!
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    The fastest way to see the value is to <strong>create your first bid</strong>. It takes about 2 minutes — just pick a building type, enter the square footage, and the calculator does the rest using ISSA cleaning standards.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="https://os.xiri.ai/app/calculator" style="display: inline-block; padding: 12px 28px; background: #00d4aa; color: #0a0e1a; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
                        Create Your First Bid →
                    </a>
                </div>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Hit reply if you have any questions — I read every email.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    — Chris
                </p>
            </div>
        `,
    },
    {
        key: "nudge24hSent",
        minHoursAfterSignup: 24,
        requiresNoBids: true,
        requiresBidsNoProposal: false,
        subject: "Most cleaners land their first bid within 48 hours",
        bodyHtml: (name) => `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hey ${name},</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Quick follow-up — I noticed you haven't created a bid yet. Totally get it, you're busy running a cleaning business.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Here's why it's worth 2 minutes: our calculator uses <strong>BLS wage data</strong> and <strong>ISSA 612 production rates</strong> — the same standards the big commercial cleaners use. You'll know exactly what to charge, broken down by labor, supplies, taxes, and profit.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Think of it as having a pricing analyst on your team.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="https://os.xiri.ai/app/calculator" style="display: inline-block; padding: 12px 28px; background: #00d4aa; color: #0a0e1a; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
                        Try the Calculator →
                    </a>
                </div>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    — Chris
                </p>
            </div>
        `,
    },
    {
        key: "nudge48hProposalSent",
        minHoursAfterSignup: 48,
        requiresNoBids: false,
        requiresBidsNoProposal: true,
        subject: "Your bid is ready — send it to your prospect",
        bodyHtml: (name, extra) => `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hey ${name},</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Nice — you've created ${extra?.bidCount === 1 ? "a bid" : `${extra?.bidCount} bids`}! The next step is sending it as a professional PDF proposal.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Just open your bid, click <strong>"Send Proposal"</strong>, and xiriOS will generate a clean PDF and email it directly to your prospect. Your company name, scope, and pricing — all formatted and ready to go.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="https://os.xiri.ai/app/bids" style="display: inline-block; padding: 12px 28px; background: #00d4aa; color: #0a0e1a; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
                        View Your Bids →
                    </a>
                </div>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    — Chris
                </p>
            </div>
        `,
    },
    {
        key: "nudge5dInactiveSent",
        minHoursAfterSignup: 120, // 5 days
        requiresNoBids: false,
        requiresBidsNoProposal: false,
        subject: "Need help getting started?",
        bodyHtml: (name) => `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hey ${name},</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    It's been a few days since you signed up — just wanted to check in. Running a cleaning business is hectic, I know.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Here's what other cleaners use xiriOS for:
                </p>
                <ul style="color: #374151; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                    <li><strong>Pricing new contracts</strong> — calculator auto-pulls BLS wages for your area</li>
                    <li><strong>Sending proposals</strong> — professional PDFs with your logo, scope, and pricing</li>
                    <li><strong>Tracking bids</strong> — see all your opportunities in one pipeline</li>
                </ul>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    If something's confusing or not working right, hit reply and tell me. I personally respond to every email.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="https://os.xiri.ai/app/calculator" style="display: inline-block; padding: 12px 28px; background: #00d4aa; color: #0a0e1a; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
                        Jump Back In →
                    </a>
                </div>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    — Chris
                </p>
            </div>
        `,
    },
];
// ── Scheduled function — runs every hour ──
exports.sendOnboardingNudges = (0, scheduler_1.onSchedule)({
    schedule: "every 1 hours",
    region: "us-central1",
    timeZone: "America/New_York",
    secrets: [resendApiKey],
}, async () => {
    const db = admin.firestore();
    const now = new Date();
    // Get all companies created in the last 14 days (no need to check older ones)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const companiesSnap = await db
        .collection("companies")
        .where("createdAt", ">=", fourteenDaysAgo.toISOString())
        .get();
    if (companiesSnap.empty) {
        console.log("No recent companies to nudge.");
        return;
    }
    const { Resend } = await Promise.resolve().then(() => __importStar(require("resend")));
    const resend = new Resend(resendApiKey.value());
    let sentCount = 0;
    for (const companyDoc of companiesSnap.docs) {
        const company = companyDoc.data();
        // Skip subscribers — they don't need nudges
        const subStatus = company.subscription?.status;
        if (subStatus === "active" || subStatus === "past_due")
            continue;
        // Skip if no owner
        const ownerId = company.ownerId;
        if (!ownerId)
            continue;
        // Get the owner's info
        const userSnap = await db.doc(`users/${ownerId}`).get();
        const user = userSnap.data();
        if (!user?.email)
            continue;
        const displayName = user.displayName?.split(" ")[0] || company.name || "there";
        const createdAt = new Date(company.createdAt);
        const hoursSinceSignup = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        // Count bids
        const bidsSnap = await db
            .collection(`companies/${companyDoc.id}/bids`)
            .limit(10)
            .get();
        const bidCount = bidsSnap.size;
        const hasBids = bidCount > 0;
        // Check if any bid has been sent as a proposal
        const hasSentProposal = bidsSnap.docs.some((b) => b.data().sentAt || b.data().status === "sent");
        // Evaluate each nudge
        for (const nudge of NUDGES) {
            // Already sent?
            if (company[nudge.key])
                continue;
            // Too early?
            if (hoursSinceSignup < nudge.minHoursAfterSignup)
                continue;
            // Check bid conditions
            if (nudge.requiresNoBids && hasBids)
                continue;
            if (nudge.requiresBidsNoProposal && (!hasBids || hasSentProposal))
                continue;
            // For the 5-day inactive nudge, skip if they've created bids recently
            if (nudge.key === "nudge5dInactiveSent" && hasSentProposal)
                continue;
            try {
                await resend.emails.send({
                    from: FROM,
                    replyTo: REPLY_TO,
                    to: user.email,
                    subject: nudge.subject,
                    html: nudge.bodyHtml(displayName, { bidCount }),
                });
                // Mark as sent
                await companyDoc.ref.update({ [nudge.key]: true });
                sentCount++;
                console.log(`📧 Sent "${nudge.key}" to ${user.email} (${companyDoc.id})`);
            }
            catch (err) {
                console.error(`Failed to send ${nudge.key} to ${user.email}:`, err);
            }
        }
    }
    console.log(`✅ Onboarding nudges complete — sent ${sentCount} emails.`);
});
//# sourceMappingURL=onboardingNudges.js.map
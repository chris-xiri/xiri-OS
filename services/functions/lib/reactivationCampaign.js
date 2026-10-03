"use strict";
/**
 * Automated Reactivation Campaign — Scheduled Cloud Function
 *
 * Runs daily at 10:00 AM ET to re-engage dormant cleaning business accounts:
 *
 *   1. Stage 1 (14 Days Inactive) — Extended 60-Day Trial + New ISSA 612 Engine announcement
 *   2. Stage 2 (30 Days Inactive) — Free Concierge Bid Review from Chris
 *   3. Stage 3 (60 Days Inactive) — Final 60-Day Trial Reset & $5/mo Early-Bird lock-in
 *
 * Excludes active subscribers. Tracks sent flags on company documents.
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
exports.sendReactivationCampaign = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const resendApiKey = (0, params_1.defineSecret)("RESEND_API_KEY");
const FROM = "Chris from xiri <chris@xiri.ai>";
const REPLY_TO = "chris@xiri.ai";
const REACTIVATION_STAGES = [
    {
        key: "reactivation14dSent",
        minDaysInactive: 14,
        subject: "We extended your xiriOS trial to 60 days + new ISSA 612 bidding engine",
        bodyHtml: (name, companyName, recentBidName) => `
            <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 24px;">
                    <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">xiri<span style="color: #00d4aa;">OS</span></span>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">Hey ${name},</p>
                
                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
                    I noticed you set up an account for <strong>${companyName}</strong> recently, but haven't had the chance to put xiriOS to work on your commercial bids yet.
                </p>

                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
                    We just rolled out major upgrades to make quoting commercial facilities 10x faster:
                </p>

                <div style="background: #f8fafc; border-left: 4px solid #00d4aa; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                    <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.8; color: #334155;">
                        <li><strong>60-Day (2 Months) Extended Free Trial:</strong> We've automatically extended your workspace access so you have full runway to quote and win contracts without rushing.</li>
                        <li><strong>ISSA 612 Production Standard Calculator:</strong> Break bids into room-by-room scopes (restrooms, offices, hallways) with local BLS wage rates.</li>
                        <li><strong>1-Click Branded PDF Proposals:</strong> Export ready-to-send client proposals with your logo, scope breakdown, and terms.</li>
                    </ul>
                </div>

                ${recentBidName ? `
                <p style="font-size: 14px; line-height: 1.6; color: #475569; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
                    📝 <strong>Draft found:</strong> Your saved estimate for <em>${recentBidName}</em> is waiting in your dashboard.
                </p>
                ` : ""}

                <div style="text-align: center; margin: 32px 0;">
                    <a href="https://os.xiri.ai/app/bids/new" style="display: inline-block; padding: 14px 32px; background: #00d4aa; color: #042f24; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 212, 170, 0.25);">
                        Log In & Price a Cleaning Job →
                    </a>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-top: 24px;">
                    Need help pricing a specific facility? Just hit reply with the square footage and building type — I read and answer every email personally.
                </p>

                <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 24px;">
                    — Chris<br/>
                    <span style="font-size: 12px; color: #94a3b8;">Founder, xiriOS</span>
                </p>
            </div>
        `,
    },
    {
        key: "reactivation30dSent",
        minDaysInactive: 30,
        subject: "Free commercial cleaning bid review (let's price your next contract)",
        bodyHtml: (name, companyName) => `
            <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 24px;">
                    <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">xiri<span style="color: #00d4aa;">OS</span></span>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">Hey ${name},</p>
                
                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
                    When speaking with cleaning company owners, the #1 bottleneck to closing more $3,000–$10,000/mo commercial contracts is having confidence in the labor hours and price per square foot.
                </p>

                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
                    <strong>Here is my personal offer to you this week:</strong>
                </p>

                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    If <strong>${companyName}</strong> has an upcoming walkthrough or a client requesting a proposal, reply to this email with:
                </p>

                <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #334155;">
                        1. Approximate square footage (e.g. 15,000 sq ft)<br/>
                        2. Building type (Office, Medical, School, Industrial)<br/>
                        3. Desired cleaning frequency (e.g. 3x/week or 5x/week)
                    </p>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    I will personally build out the full labor breakdown, supply costs, and generate your ready-to-send PDF proposal inside your account.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="https://os.xiri.ai/app/bids/new" style="display: inline-block; padding: 14px 32px; background: #00d4aa; color: #042f24; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 212, 170, 0.25);">
                        Or Build It Yourself in 2 Minutes →
                    </a>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 24px;">
                    — Chris<br/>
                    <span style="font-size: 12px; color: #94a3b8;">Founder, xiriOS</span>
                </p>
            </div>
        `,
    },
    {
        key: "reactivation60dSent",
        minDaysInactive: 60,
        subject: "Should I keep your xiriOS account active? (60-day reset + Early-Bird deal)",
        bodyHtml: (name, companyName) => `
            <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 24px;">
                    <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">xiri<span style="color: #00d4aa;">OS</span></span>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">Hey ${name},</p>
                
                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
                    I'm doing a quick cleanup of inactive workspaces, but I didn't want to close the door on <strong>${companyName}</strong> without checking in first.
                </p>

                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
                    To make it as easy as possible to bid on your next contract, we've:
                </p>

                <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                    <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.8; color: #334155;">
                        <li><strong>Reset your free trial for 60 more days:</strong> Full access to create unlimited bids and client PDF proposals.</li>
                        <li><strong>Unlocked our $5/mo Early-Bird Lock-In:</strong> Unlimited contacts, custom task scoping, and priority support for just $5/mo (or $49/yr).</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="https://os.xiri.ai/app/login" style="display: inline-block; padding: 14px 32px; background: #00d4aa; color: #042f24; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 212, 170, 0.25);">
                        Re-Activate Your Free Workspace →
                    </a>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
                    If you're no longer quoting commercial cleaning jobs or don't need the software, no worries at all! Just let me know and I'll keep things tidy.
                </p>

                <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 24px;">
                    — Chris<br/>
                    <span style="font-size: 12px; color: #94a3b8;">Founder, xiriOS</span>
                </p>
            </div>
        `,
    },
];
/**
 * Scheduled Cloud Function: Runs every day at 10:00 AM ET.
 */
exports.sendReactivationCampaign = (0, scheduler_1.onSchedule)({
    schedule: "every day 10:00",
    region: "us-central1",
    timeZone: "America/New_York",
    secrets: [resendApiKey],
}, async () => {
    const db = admin.firestore();
    const now = new Date();
    console.log("🚀 Starting Daily Reactivation Campaign scan...");
    // Scan all companies
    const companiesSnap = await db.collection("companies").get();
    if (companiesSnap.empty) {
        console.log("No companies found.");
        return;
    }
    const { Resend } = await Promise.resolve().then(() => __importStar(require("resend")));
    const resend = new Resend(resendApiKey.value());
    let sentCount = 0;
    for (const companyDoc of companiesSnap.docs) {
        const company = companyDoc.data();
        // Skip active paying subscribers
        const subStatus = company.subscription?.status;
        if (subStatus === "active" || subStatus === "past_due")
            continue;
        const ownerId = company.ownerId;
        if (!ownerId)
            continue;
        // Get owner profile
        const userSnap = await db.doc(`users/${ownerId}`).get();
        const user = userSnap.data();
        if (!user?.email)
            continue;
        const displayName = user.displayName?.split(" ")[0] || "there";
        const companyName = company.name || "your cleaning company";
        // Calculate inactivity duration based on last bid activity or account creation
        const createdAt = new Date(company.createdAt || Date.now());
        const daysSinceSignup = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        // Fetch bids
        const bidsSnap = await db.collection(`companies/${companyDoc.id}/bids`).orderBy("createdAt", "desc").limit(1).get();
        let recentBidName;
        if (!bidsSnap.empty) {
            const latestBid = bidsSnap.docs[0].data();
            recentBidName = latestBid.name;
            const lastBidTime = new Date(latestBid.updatedAt || latestBid.createdAt || company.createdAt);
            const daysSinceLastBid = (now.getTime() - lastBidTime.getTime()) / (1000 * 60 * 60 * 24);
            // If user created a bid in the last 7 days, they are actively engaged — skip
            if (daysSinceLastBid < 7)
                continue;
        }
        // Check each reactivation stage
        for (const stage of REACTIVATION_STAGES) {
            if (company[stage.key])
                continue; // Already sent
            if (daysSinceSignup < stage.minDaysInactive)
                continue; // Not inactive enough yet
            try {
                await resend.emails.send({
                    from: FROM,
                    replyTo: REPLY_TO,
                    to: user.email,
                    subject: stage.subject,
                    html: stage.bodyHtml(displayName, companyName, recentBidName),
                });
                // Mark stage as sent and extend trial end on company doc
                await companyDoc.ref.update({
                    [stage.key]: true,
                    lastReactivationSentAt: now.toISOString(),
                    // Auto-reset trial to 60 days from now
                    trialEnd: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                });
                sentCount++;
                console.log(`📧 Reactivation sent [${stage.key}] to ${user.email} (${companyName})`);
                break; // Send at most one reactivation email per user per day
            }
            catch (err) {
                console.error(`Failed to send ${stage.key} to ${user.email}:`, err);
            }
        }
    }
    console.log(`✅ Reactivation campaign finished. Sent ${sentCount} re-engagement emails.`);
});
//# sourceMappingURL=reactivationCampaign.js.map
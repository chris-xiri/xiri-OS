/**
 * Trial Reminder Emails — Scheduled Cloud Function
 *
 * Runs daily to send reminder emails to trialing users:
 *   - 3 days before expiry
 *   - 1 day before expiry
 *   - On expiry day
 *
 * Uses Resend API (same as sendProposal).
 * Tracks sent reminders to avoid duplicates.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

const resendApiKey = defineSecret("RESEND_API_KEY");

interface ReminderConfig {
    key: string;           // field name to mark as sent
    daysBeforeExpiry: number;
    subject: string;
    bodyHtml: (companyName: string, daysLeft: number) => string;
}

const REMINDERS: ReminderConfig[] = [
    {
        key: "trialReminder3daySent",
        daysBeforeExpiry: 3,
        subject: "Your xiriOS trial ends in 3 days",
        bodyHtml: (name, _days) => `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Your <strong>Bid Plus</strong> trial ends in <strong>3 days</strong>. After that, your account will switch to the free Bid plan with a 3-bid and 5-contact limit.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    To keep unlimited bids, proposals, and all your data — subscribe for just <strong>$9/month</strong>.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="https://app.xiri.ai/settings" style="display: inline-block; padding: 12px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                        Subscribe Now →
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">
                    Sent by <a href="https://os.xiri.ai" style="color: #00d4aa;">xiriOS</a>
                </p>
            </div>
        `,
    },
    {
        key: "trialReminder1daySent",
        daysBeforeExpiry: 1,
        subject: "Last day of your xiriOS trial!",
        bodyHtml: (name, _days) => `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    <strong>Tomorrow your trial ends.</strong> After that, you'll lose access to unlimited bids, custom tasks, and frequency overrides.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Lock in <strong>Bid Plus for $9/month</strong> — that's less than the cost of one cleaning supply run.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="https://app.xiri.ai/settings" style="display: inline-block; padding: 12px 28px; background: #f59e0b; color: #0a0e1a; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
                        Subscribe — Keep Your Data →
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">
                    Sent by <a href="https://os.xiri.ai" style="color: #00d4aa;">xiriOS</a>
                </p>
            </div>
        `,
    },
    {
        key: "trialExpiredEmailSent",
        daysBeforeExpiry: 0,
        subject: "Your xiriOS trial has ended — here's what changed",
        bodyHtml: (name, _days) => `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Your Bid Plus trial has ended. Your account has been switched to the <strong>free Bid plan</strong>. Here's what's changed:
                </p>
                <ul style="color: #374151; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                    <li>Bid limit: <strong>3 bids</strong> (was unlimited)</li>
                    <li>Contact limit: <strong>5 contacts</strong> (was unlimited)</li>
                    <li>Custom tasks: <strong>locked</strong></li>
                    <li>Frequency overrides: <strong>locked</strong></li>
                </ul>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Your existing data is safe — upgrade anytime to unlock everything again.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="https://app.xiri.ai/settings" style="display: inline-block; padding: 12px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                        Upgrade to Bid Plus — $9/mo →
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">
                    Sent by <a href="https://os.xiri.ai" style="color: #00d4aa;">xiriOS</a>
                </p>
            </div>
        `,
    },
];

export const sendTrialReminders = onSchedule(
    {
        schedule: "every 24 hours",
        region: "us-central1",
        timeZone: "America/New_York",
        secrets: [resendApiKey],
    },
    async () => {
        const db = admin.firestore();
        const now = new Date();

        // Get all trialing companies
        const trialSnap = await db
            .collection("companies")
            .where("subscription.status", "==", "trialing")
            .get();

        if (trialSnap.empty) {
            console.log("No active trials found.");
            return;
        }

        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey.value());
        let sentCount = 0;

        for (const companyDoc of trialSnap.docs) {
            const company = companyDoc.data();
            const trialEnd = company.subscription?.trialEnd;
            if (!trialEnd) continue;

            const trialEndDate = new Date(trialEnd);
            const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Find the owner's email
            const ownerId = company.ownerId;
            if (!ownerId) continue;

            const userSnap = await db.doc(`users/${ownerId}`).get();
            const user = userSnap.data();
            if (!user?.email) continue;

            const companyName = user.displayName || company.name || "there";

            // Check which reminders to send
            for (const reminder of REMINDERS) {
                if (daysLeft <= reminder.daysBeforeExpiry && !company[reminder.key]) {
                    try {
                        await resend.emails.send({
                            from: "xiriOS <noreply@xiri.ai>",
                            to: user.email,
                            subject: reminder.subject,
                            html: reminder.bodyHtml(companyName, daysLeft),
                        });

                        // Mark as sent
                        await companyDoc.ref.update({ [reminder.key]: true });
                        sentCount++;
                        console.log(`📧 Sent "${reminder.key}" to ${user.email} (company ${companyDoc.id})`);
                    } catch (err) {
                        console.error(`Failed to send ${reminder.key} to ${user.email}:`, err);
                    }
                }
            }
        }

        console.log(`✅ Sent ${sentCount} trial reminder emails.`);
    }
);

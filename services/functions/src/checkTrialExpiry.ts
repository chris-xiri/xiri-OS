/**
 * Check Trial Expiry — Scheduled Cloud Function
 *
 * Runs daily to find companies with expired trials and
 * downgrades them to the free "bid" tier.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

export const checkTrialExpiry = onSchedule(
    {
        schedule: "every 24 hours",
        region: "us-central1",
        timeZone: "America/New_York",
    },
    async () => {
        const db = admin.firestore();
        const now = new Date().toISOString();

        // Find all companies still trialing past their trialEnd
        const expiredTrials = await db
            .collection("companies")
            .where("subscription.status", "==", "trialing")
            .where("subscription.trialEnd", "<=", now)
            .get();

        if (expiredTrials.empty) {
            console.log("No expired trials found.");
            return;
        }

        const batch = db.batch();
        expiredTrials.forEach((doc) => {
            batch.update(doc.ref, {
                "subscription.tier": "bid",
                "subscription.status": "active",
                "subscription.trialEnd": admin.firestore.FieldValue.delete(),
            });
            console.log(`⬇️ Trial expired for company ${doc.id} — downgraded to free`);
        });

        await batch.commit();
        console.log(`✅ Downgraded ${expiredTrials.size} expired trials.`);
    }
);

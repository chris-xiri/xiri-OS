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
        const now = new Date();

        // Query by status only to avoid requiring a composite index
        // on (subscription.status + subscription.trialEnd).
        const trialingCompanies = await db
            .collection("companies")
            .where("subscription.status", "==", "trialing")
            .get();

        if (trialingCompanies.empty) {
            console.log("No trialing companies found.");
            return;
        }

        const expiredCompanyRefs: FirebaseFirestore.DocumentReference[] = [];

        for (const doc of trialingCompanies.docs) {
            const company = doc.data();
            const rawTrialEnd = company?.subscription?.trialEnd;

            if (!rawTrialEnd) continue;

            let trialEndDate: Date | null = null;

            // Supports legacy and mixed Firestore shapes:
            // - ISO string
            // - JS Date
            // - Firestore Timestamp
            if (rawTrialEnd instanceof Date) {
                trialEndDate = rawTrialEnd;
            } else if (typeof rawTrialEnd === "string" || typeof rawTrialEnd === "number") {
                const parsed = new Date(rawTrialEnd);
                if (!Number.isNaN(parsed.getTime())) trialEndDate = parsed;
            } else if (
                typeof rawTrialEnd === "object" &&
                rawTrialEnd !== null &&
                typeof (rawTrialEnd as { toDate?: () => Date }).toDate === "function"
            ) {
                trialEndDate = (rawTrialEnd as { toDate: () => Date }).toDate();
            }

            if (!trialEndDate || Number.isNaN(trialEndDate.getTime())) {
                console.warn(`Skipping company ${doc.id}: invalid trialEnd value`, rawTrialEnd);
                continue;
            }

            if (trialEndDate <= now) {
                expiredCompanyRefs.push(doc.ref);
            }
        }

        if (expiredCompanyRefs.length === 0) {
            console.log("No expired trials found.");
            return;
        }

        const batch = db.batch();
        expiredCompanyRefs.forEach((ref) => {
            batch.update(ref, {
                "subscription.tier": "bid",
                "subscription.status": "active",
                "subscription.trialEnd": admin.firestore.FieldValue.delete(),
            });
            console.log(`⬇️ Trial expired for company ${ref.id} — downgraded to free`);
        });

        await batch.commit();
        console.log(`✅ Downgraded ${expiredCompanyRefs.length} expired trials.`);
    }
);

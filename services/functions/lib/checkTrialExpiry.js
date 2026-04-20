"use strict";
/**
 * Check Trial Expiry — Scheduled Cloud Function
 *
 * Runs daily to find companies with expired trials and
 * downgrades them to the free "bid" tier.
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
exports.checkTrialExpiry = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
exports.checkTrialExpiry = (0, scheduler_1.onSchedule)({
    schedule: "every 24 hours",
    region: "us-central1",
    timeZone: "America/New_York",
}, async () => {
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
    const expiredCompanyRefs = [];
    for (const doc of trialingCompanies.docs) {
        const company = doc.data();
        const rawTrialEnd = company?.subscription?.trialEnd;
        if (!rawTrialEnd)
            continue;
        let trialEndDate = null;
        // Supports legacy and mixed Firestore shapes:
        // - ISO string
        // - JS Date
        // - Firestore Timestamp
        if (rawTrialEnd instanceof Date) {
            trialEndDate = rawTrialEnd;
        }
        else if (typeof rawTrialEnd === "string" || typeof rawTrialEnd === "number") {
            const parsed = new Date(rawTrialEnd);
            if (!Number.isNaN(parsed.getTime()))
                trialEndDate = parsed;
        }
        else if (typeof rawTrialEnd === "object" &&
            rawTrialEnd !== null &&
            typeof rawTrialEnd.toDate === "function") {
            trialEndDate = rawTrialEnd.toDate();
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
});
//# sourceMappingURL=checkTrialExpiry.js.map
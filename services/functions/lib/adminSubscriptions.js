"use strict";
/**
 * Admin Subscriptions & Customer Management Cloud Function
 *
 * Provides full visibility into all trial and paying users:
 * - List all companies, owner emails, tiers, trial dates, and Stripe IDs
 * - Filter and search across active trials and paying subscribers
 * - Manage user subscription tiers and extend trials directly
 * - Generate direct Stripe Dashboard links for quick billing management
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
exports.adminUpdateSubscription = exports.getAdminSubscriptions = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const stripeSecretKey = (0, params_1.defineSecret)("STRIPE_SECRET_KEY");
const ADMIN_EMAILS = ["chris@xiri.ai", "management@xiri.ai"];
function verifyAdmin(auth) {
    if (!auth || !auth.token) {
        throw new https_1.HttpsError("unauthenticated", "Must be logged in.");
    }
    const email = auth.token.email || "";
    if (!ADMIN_EMAILS.includes(email.toLowerCase()) && !email.endsWith("@xiri.ai")) {
        throw new https_1.HttpsError("permission-denied", "Admin access required.");
    }
}
exports.getAdminSubscriptions = (0, https_1.onCall)({ region: "us-central1", cors: true }, async (request) => {
    verifyAdmin(request.auth);
    const db = admin.firestore();
    // 1. Fetch all companies and users
    const [companiesSnap, usersSnap] = await Promise.all([
        db.collection("companies").get(),
        db.collection("users").get(),
    ]);
    const userMap = new Map();
    usersSnap.forEach((doc) => {
        userMap.set(doc.id, doc.data());
    });
    const now = new Date();
    const accounts = [];
    let payingCount = 0;
    let trialingCount = 0;
    let expiringSoonCount = 0;
    let expiredTrialsCount = 0;
    let canceledCount = 0;
    companiesSnap.forEach((doc) => {
        const data = doc.data();
        const sub = data.subscription || {};
        const ownerId = data.ownerId || "";
        const user = userMap.get(ownerId) || {};
        const ownerEmail = user.email || data.ownerEmail || data.email || "Unknown Email";
        const ownerName = user.displayName || data.ownerName || data.name || "Unknown Name";
        const createdAt = data.createdAt || user.createdAt || "";
        const tier = sub.tier || "bid";
        const status = sub.status || "active";
        const trialEnd = sub.trialEnd || null;
        const currentPeriodEnd = sub.currentPeriodEnd || null;
        const stripeCustomerId = sub.stripeCustomerId || null;
        const stripeSubscriptionId = sub.stripeSubscriptionId || null;
        let daysLeftInTrial = null;
        let isTrialExpired = false;
        if (trialEnd) {
            const endDate = new Date(trialEnd);
            const diffMs = endDate.getTime() - now.getTime();
            daysLeftInTrial = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (daysLeftInTrial <= 0) {
                isTrialExpired = true;
            }
        }
        // Summary aggregates
        if (status === "active" && tier !== "bid") {
            payingCount++;
        }
        else if (status === "trialing") {
            if (isTrialExpired) {
                expiredTrialsCount++;
            }
            else {
                trialingCount++;
                if (daysLeftInTrial !== null && daysLeftInTrial <= 7) {
                    expiringSoonCount++;
                }
            }
        }
        else if (status === "canceled") {
            canceledCount++;
        }
        accounts.push({
            companyId: doc.id,
            companyName: data.name || `${ownerName}'s Company`,
            ownerId,
            ownerEmail,
            ownerName,
            createdAt,
            tier,
            status,
            trialEnd,
            currentPeriodEnd,
            daysLeftInTrial,
            isTrialExpired,
            stripeCustomerId,
            stripeSubscriptionId,
            stripeCustomerUrl: stripeCustomerId ? `https://dashboard.stripe.com/customers/${stripeCustomerId}` : null,
            stripeSubscriptionUrl: stripeSubscriptionId ? `https://dashboard.stripe.com/subscriptions/${stripeSubscriptionId}` : null,
            primaryService: data.primaryService || null,
        });
    });
    // Sort: paying subscribers first, then active trials, then by createdAt descending
    accounts.sort((a, b) => {
        const isPayingA = a.status === "active" && a.tier !== "bid" ? 1 : 0;
        const isPayingB = b.status === "active" && b.tier !== "bid" ? 1 : 0;
        if (isPayingA !== isPayingB)
            return isPayingB - isPayingA;
        const isTrialA = a.status === "trialing" && !a.isTrialExpired ? 1 : 0;
        const isTrialB = b.status === "trialing" && !b.isTrialExpired ? 1 : 0;
        if (isTrialA !== isTrialB)
            return isTrialB - isTrialA;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return {
        summary: {
            totalAccounts: accounts.length,
            payingSubscribers: payingCount,
            activeTrials: trialingCount,
            expiringSoonTrials: expiringSoonCount,
            expiredTrials: expiredTrialsCount,
            canceled: canceledCount,
        },
        accounts,
    };
});
exports.adminUpdateSubscription = (0, https_1.onCall)({ region: "us-central1", cors: true }, async (request) => {
    verifyAdmin(request.auth);
    const { companyId, tier, status, extendDays, trialEnd } = request.data;
    if (!companyId) {
        throw new https_1.HttpsError("invalid-argument", "companyId is required.");
    }
    const db = admin.firestore();
    const companyRef = db.doc(`companies/${companyId}`);
    const snap = await companyRef.get();
    if (!snap.exists) {
        throw new https_1.HttpsError("not-found", "Company document not found.");
    }
    const updates = {};
    if (tier)
        updates["subscription.tier"] = tier;
    if (status)
        updates["subscription.status"] = status;
    if (extendDays && typeof extendDays === "number") {
        const currentTrialEnd = snap.data()?.subscription?.trialEnd;
        const baseDate = currentTrialEnd && new Date(currentTrialEnd) > new Date()
            ? new Date(currentTrialEnd)
            : new Date();
        const newTrialEnd = new Date(baseDate.getTime() + extendDays * 24 * 60 * 60 * 1000).toISOString();
        updates["subscription.trialEnd"] = newTrialEnd;
        updates["subscription.status"] = "trialing";
    }
    else if (trialEnd) {
        updates["subscription.trialEnd"] = trialEnd;
    }
    await companyRef.update(updates);
    console.log(`🛠️ Admin updated subscription for company ${companyId}:`, updates);
    return { success: true, updates };
});
//# sourceMappingURL=adminSubscriptions.js.map
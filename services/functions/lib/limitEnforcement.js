"use strict";
/**
 * Limit Enforcement — Server-side bid & contact limit checks
 *
 * createBidWithLimit   — checks bid count before creating
 * createContactWithLimit — checks contact count before creating
 *
 * Both read the company's subscription.tier, look up limits,
 * and reject writes that exceed the tier's allowance.
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
exports.createContactWithLimit = exports.createBidWithLimit = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const TIER_LIMITS = {
    bid: { contacts: 5, users: 1, bids: 3 },
    bid_plus: { contacts: -1, users: 1, bids: -1 },
    grow: { contacts: -1, users: 3, bids: -1 },
    pro: { contacts: -1, users: 10, bids: -1 },
    business: { contacts: -1, users: 25, bids: -1 },
};
function getLimits(tier) {
    return TIER_LIMITS[tier] || TIER_LIMITS["bid"];
}
/* ─── createBidWithLimit ─── */
exports.createBidWithLimit = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const uid = request.auth.uid;
    const data = request.data;
    // Validate required fields
    if (!data.companyId) {
        throw new https_1.HttpsError("invalid-argument", "Missing companyId.");
    }
    const db = admin.firestore();
    // Verify user belongs to company
    const profileSnap = await db.doc(`users/${uid}`).get();
    const profile = profileSnap.data();
    if (!profile || profile.companyId !== data.companyId) {
        throw new https_1.HttpsError("permission-denied", "You do not have access to this company.");
    }
    // Get company subscription tier
    const companySnap = await db.doc(`companies/${data.companyId}`).get();
    const company = companySnap.data();
    const tier = company?.subscription?.tier || "bid";
    const limits = getLimits(tier);
    // Check bid limit (if not unlimited)
    if (limits.bids !== -1) {
        const bidsSnap = await db.collection(`companies/${data.companyId}/bids`).count().get();
        const bidCount = bidsSnap.data().count;
        if (bidCount >= limits.bids) {
            throw new https_1.HttpsError("resource-exhausted", `You've reached the ${limits.bids}-bid limit on the ${tier} plan. Upgrade to create more bids.`);
        }
    }
    // Create the bid
    const now = new Date().toISOString();
    const bidData = {
        contactId: data.contactId || "",
        name: data.name || "Untitled Bid",
        status: "draft",
        calculatorInputs: data.calculatorInputs || {},
        selectedTasks: data.selectedTasks || [],
        roomScopes: data.roomScopes || [],
        priceOverride: data.priceOverride ?? null,
        state: data.state || "",
        results: data.results || {},
        createdAt: now,
        updatedAt: now,
        version: 1,
        versions: [],
    };
    const ref = await db.collection(`companies/${data.companyId}/bids`).add(bidData);
    return { success: true, bidId: ref.id };
});
/* ─── createContactWithLimit ─── */
exports.createContactWithLimit = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const uid = request.auth.uid;
    const data = request.data;
    if (!data.companyId) {
        throw new https_1.HttpsError("invalid-argument", "Missing companyId.");
    }
    const db = admin.firestore();
    // Verify user belongs to company
    const profileSnap = await db.doc(`users/${uid}`).get();
    const profile = profileSnap.data();
    if (!profile || profile.companyId !== data.companyId) {
        throw new https_1.HttpsError("permission-denied", "You do not have access to this company.");
    }
    // Get company subscription tier
    const companySnap = await db.doc(`companies/${data.companyId}`).get();
    const company = companySnap.data();
    const tier = company?.subscription?.tier || "bid";
    const limits = getLimits(tier);
    // Check contact limit
    if (limits.contacts !== -1) {
        const contactsSnap = await db.collection(`companies/${data.companyId}/contacts`).count().get();
        const contactCount = contactsSnap.data().count;
        if (contactCount >= limits.contacts) {
            throw new https_1.HttpsError("resource-exhausted", `You've reached the ${limits.contacts}-contact limit on the ${tier} plan. Upgrade to add more contacts.`);
        }
    }
    // Create the contact
    const now = new Date().toISOString();
    const contactData = {
        name: data.name || "",
        company: data.company || data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        type: data.type || "prospect",
        notes: data.notes || "",
        createdAt: now,
        updatedAt: now,
    };
    const ref = await db.collection(`companies/${data.companyId}/contacts`).add(contactData);
    return { success: true, contactId: ref.id };
});
//# sourceMappingURL=limitEnforcement.js.map
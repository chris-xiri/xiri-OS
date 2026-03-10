/**
 * Limit Enforcement — Server-side bid & contact limit checks
 *
 * createBidWithLimit   — checks bid count before creating
 * createContactWithLimit — checks contact count before creating
 *
 * Both read the company's subscription.tier, look up limits,
 * and reject writes that exceed the tier's allowance.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

/* ─── Tier Limits (mirrors dashboard rbac.ts) ─── */
interface TierLimits {
    contacts: number;
    users: number;
    bids: number;
}

const TIER_LIMITS: Record<string, TierLimits> = {
    bid: { contacts: 5, users: 1, bids: 3 },
    bid_plus: { contacts: -1, users: 1, bids: -1 },
    grow: { contacts: -1, users: 3, bids: -1 },
    pro: { contacts: -1, users: 10, bids: -1 },
    business: { contacts: -1, users: 25, bids: -1 },
};

function getLimits(tier: string): TierLimits {
    return TIER_LIMITS[tier] || TIER_LIMITS["bid"];
}

/* ─── createBidWithLimit ─── */
export const createBidWithLimit = onCall(
    { region: "us-central1" },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be signed in.");
        }

        const uid = request.auth.uid;
        const data = request.data;

        // Validate required fields
        if (!data.companyId) {
            throw new HttpsError("invalid-argument", "Missing companyId.");
        }

        const db = admin.firestore();

        // Verify user belongs to company
        const profileSnap = await db.doc(`users/${uid}`).get();
        const profile = profileSnap.data();
        if (!profile || profile.companyId !== data.companyId) {
            throw new HttpsError("permission-denied", "You do not have access to this company.");
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
                throw new HttpsError(
                    "resource-exhausted",
                    `You've reached the ${limits.bids}-bid limit on the ${tier} plan. Upgrade to create more bids.`
                );
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
    }
);

/* ─── createContactWithLimit ─── */
export const createContactWithLimit = onCall(
    { region: "us-central1" },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be signed in.");
        }

        const uid = request.auth.uid;
        const data = request.data;

        if (!data.companyId) {
            throw new HttpsError("invalid-argument", "Missing companyId.");
        }

        const db = admin.firestore();

        // Verify user belongs to company
        const profileSnap = await db.doc(`users/${uid}`).get();
        const profile = profileSnap.data();
        if (!profile || profile.companyId !== data.companyId) {
            throw new HttpsError("permission-denied", "You do not have access to this company.");
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
                throw new HttpsError(
                    "resource-exhausted",
                    `You've reached the ${limits.contacts}-contact limit on the ${tier} plan. Upgrade to add more contacts.`
                );
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
    }
);

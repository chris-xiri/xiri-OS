/**
 * Tier Management Utility
 *
 * Provides functions to read and update a company's subscription tier in Firestore.
 * Used by:
 *   - Stripe webhook handler (Firebase Function) to update tier on subscription change
 *   - Admin tools to manually adjust tiers
 *   - Dashboard UI to display upgrade/downgrade options
 *
 * Firestore schema:
 *   companies/{companyId}
 *     └─ subscription: { tier, status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd }
 */

import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Tier } from "./rbac";
import type { CompanySubscription } from "../contexts/AuthContext";

/**
 * Update a company's subscription tier in Firestore.
 * This is called by:
 * - Stripe webhook (checkout.session.completed, customer.subscription.updated/deleted)
 * - Admin panel for manual tier changes
 *
 * Since AuthContext uses onSnapshot, the UI updates automatically.
 */
export async function updateCompanyTier(
    companyId: string,
    updates: Partial<CompanySubscription>
): Promise<void> {
    const companyRef = doc(db, "companies", companyId);

    // Merge subscription updates
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
        updateData[`subscription.${key}`] = value;
    }

    await updateDoc(companyRef, updateData);
}

/**
 * Get a company's current subscription from Firestore.
 */
export async function getCompanySubscription(
    companyId: string
): Promise<CompanySubscription | null> {
    const companyDoc = await getDoc(doc(db, "companies", companyId));
    if (!companyDoc.exists()) return null;
    return (companyDoc.data().subscription as CompanySubscription) || null;
}

/**
 * Map a Stripe price ID to a tier.
 * These must match the price IDs from your Stripe dashboard.
 */
const STRIPE_PRICE_TO_TIER: Record<string, Tier> = {
    // Monthly
    "price_1T8n8V9ir0rgwcfcZbrHM86c": "bid_plus",    // $9/mo
    "price_1T8n8o9ir0rgwcfcWmCYT7nW": "grow",        // $39/mo
    "price_1T8n999ir0rgwcfcgRui9mM9": "pro",         // $79/mo
    "price_1T8n9Q9ir0rgwcfcrxw0PfML": "business",    // $119/mo
    // Annual
    "price_1T8nBW9ir0rgwcfcwE3zvl1n": "bid_plus",    // $84/yr ($7/mo)
    "price_1T8nBX9ir0rgwcfcCxTFEp2t": "grow",        // $372/yr ($31/mo)
    "price_1T8nBX9ir0rgwcfcw2tGjBhv": "pro",         // $756/yr ($63/mo)
    "price_1T8nBY9ir0rgwcfcRNvoInEG": "business",    // $1140/yr ($95/mo)
};

/**
 * Resolve a Stripe price ID to a tier.
 * Falls back to "bid" (free) if the price ID is unknown.
 */
export function stripePriceToTier(priceId: string): Tier {
    return STRIPE_PRICE_TO_TIER[priceId] || "bid";
}

/**
 * Handle subscription status from Stripe.
 * Maps Stripe statuses to our internal statuses.
 */
export function stripeStatusToSubscriptionStatus(
    stripeStatus: string
): CompanySubscription["status"] {
    switch (stripeStatus) {
        case "active":
            return "active";
        case "trialing":
            return "trialing";
        case "past_due":
        case "unpaid":
            return "past_due";
        case "canceled":
        case "incomplete_expired":
            return "canceled";
        default:
            return "active";
    }
}

/**
 * Downgrade a company to free tier.
 * Called when a subscription is canceled or expires.
 */
export async function downgradeToFree(companyId: string): Promise<void> {
    await updateCompanyTier(companyId, {
        tier: "bid",
        status: "active",
        stripeSubscriptionId: undefined,
        currentPeriodEnd: undefined,
    });
}

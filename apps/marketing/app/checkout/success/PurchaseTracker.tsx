"use client";

import { useEffect } from "react";

/**
 * Fires GA4 `purchase` event on the marketing checkout success page.
 * This catches purchases from the marketing pricing page flow
 * (Stripe redirects here after successful checkout).
 */
export default function PurchaseTracker() {
    useEffect(() => {
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "purchase", {
                transaction_id: `checkout_${Date.now()}`,
                currency: "USD",
                value: 0, // Actual value comes from Stripe webhook
            });
        }
    }, []);

    return null;
}

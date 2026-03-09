/**
 * GA4 Analytics Helper
 * Provides typed event tracking for the xiriOS dashboard funnel.
 *
 * Replace G-XXXXXXXXXX in layout.tsx / index.html with your real
 * GA4 Measurement ID before deploying.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

/** Fire a GA4 custom event */
function track(eventName: string, params?: Record<string, string | number | boolean>) {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, params);
    }
}

// ─── Marketing site events ──────────────────────────────────

/** CTA button clicked anywhere on the marketing site */
export function trackCtaClicked(buttonText: string, location: string) {
    track("cta_clicked", { button_text: buttonText, location });
}

/** Calculator used on marketing site */
export function trackCalculatorUsed(buildingType: string, sqft: number) {
    track("calculator_used", { building_type: buildingType, sqft });
}

/** Pricing page viewed */
export function trackPricingViewed(source: string) {
    track("pricing_viewed", { source });
}

// ─── Signup funnel ──────────────────────────────────────────

/** Signup flow started (clicked "Start Free Trial") */
export function trackSignupStarted(source: string) {
    track("signup_started", { source });
}

/** Signup completed (account created) */
export function trackSignupCompleted(method: string) {
    track("signup_completed", { method });
}

// ─── Onboarding funnel ─────────────────────────────────────

/** User created their first bid */
export function trackFirstBidCreated() {
    track("first_bid_created");
}

/** User generated a PDF proposal */
export function trackProposalGenerated() {
    track("proposal_generated");
}

/** User added a CRM contact */
export function trackContactAdded() {
    track("contact_added");
}

// ─── Subscription funnel ───────────────────────────────────

/** Trial banner shown */
export function trackTrialBannerShown(daysRemaining: number) {
    track("trial_banner_shown", { days_remaining: daysRemaining });
}

/** Subscribe button clicked */
export function trackSubscribeClicked(plan: string) {
    track("subscribe_clicked", { plan });
}

/** Purchase completed (Stripe checkout success) */
export function trackPurchaseCompleted(plan: string, value: number) {
    track("purchase_completed", { plan, value, currency: "USD" });
}

// ─── Feature usage ─────────────────────────────────────────

/** Generic feature usage tracking */
export function trackFeatureUsed(featureName: string) {
    track("feature_used", { feature_name: featureName });
}

/** Bid deleted */
export function trackBidDeleted() {
    track("bid_deleted");
}

export default track;

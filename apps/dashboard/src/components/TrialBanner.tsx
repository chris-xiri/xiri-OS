import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUpgradeTier } from "../lib/rbac";
import { trackTrialBannerShown, trackSubscribeClicked } from "../lib/analytics";
import "./TrialBanner.css";

/**
 * Dismissible banner shown during the Bid Plus trial period.
 * Shows days remaining and a subscribe CTA that goes directly to Stripe checkout.
 * Trial expires → account downgrades to Free (Bid) tier.
 */
export default function TrialBanner() {
    const { subscription, profile } = useAuth();
    const [busy, setBusy] = useState(false);

    if (subscription.status !== "trialing" || !subscription.trialEnd) {
        return null;
    }

    const now = new Date();
    const end = new Date(subscription.trialEnd);
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysLeft <= 0) return null;

    // Fire once per render
    trackTrialBannerShown(daysLeft);

    const handleSubscribe = async () => {
        if (!profile?.companyId || busy) return;
        setBusy(true);
        const tier = getUpgradeTier(subscription.tier) || "bid_plus";
        trackSubscribeClicked(tier);
        try {
            const { httpsCallable } = await import("firebase/functions");
            const { functions } = await import("../lib/firebase");
            const createCheckout = httpsCallable(functions, "createCheckoutSession");
            const result = await createCheckout({
                companyId: profile.companyId,
                tier,
                interval: "monthly",
                successUrl: window.location.origin + "/app/settings?tab=subscription&upgraded=true",
                cancelUrl: window.location.href,
            });
            const { sessionUrl } = result.data as { sessionUrl: string };
            if (sessionUrl) (window.top || window).location.href = sessionUrl;
        } catch (err) {
            console.error("Checkout error:", err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="trial-banner">
            <div className="trial-banner-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
                    <strong>Bid Plus trial</strong> — {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining. Subscribe to keep your features.
                </span>
            </div>
            <button className="trial-banner-btn" onClick={handleSubscribe} disabled={busy}>
                {busy ? "Loading…" : "Subscribe Now"}
            </button>
        </div>
    );
}

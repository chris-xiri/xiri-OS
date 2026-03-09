import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { getLimits, getUpgradeTier } from "../lib/rbac";
import { trackTrialBannerShown, trackSubscribeClicked } from "../lib/analytics";
import "./TrialBanner.css";

/**
 * Dismissible banner shown during the Bid Plus trial period.
 * Shows days remaining, usage vs free-tier limits, and a subscribe CTA
 * that goes directly to Stripe checkout.
 */
export default function TrialBanner() {
    const { subscription, profile } = useAuth();
    const [busy, setBusy] = useState(false);
    const [bidCount, setBidCount] = useState(0);
    const [contactCount, setContactCount] = useState(0);

    const companyId = profile?.companyId;

    // Real-time usage counts
    useEffect(() => {
        if (!companyId) return;
        const unsubBids = onSnapshot(
            collection(db, "companies", companyId, "bids"),
            (snap) => setBidCount(snap.size),
        );
        const unsubContacts = onSnapshot(
            collection(db, "companies", companyId, "contacts"),
            (snap) => setContactCount(snap.size),
        );
        return () => { unsubBids(); unsubContacts(); };
    }, [companyId]);

    if (subscription.status !== "trialing" || !subscription.trialEnd) {
        return null;
    }

    const now = new Date();
    const end = new Date(subscription.trialEnd);
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysLeft <= 0) return null;

    // Fire once per render
    trackTrialBannerShown(daysLeft);

    // Compare current usage against the FREE tier ("bid") limits
    const freeLimits = getLimits("bid");
    const overBids = freeLimits.bids !== -1 && bidCount > freeLimits.bids;
    const overContacts = freeLimits.contacts !== -1 && contactCount > freeLimits.contacts;
    const anyOverLimit = overBids || overContacts;

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
        <div className={`trial-banner ${anyOverLimit ? "trial-banner-over" : ""}`}>
            <div className="trial-banner-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <div className="trial-banner-text">
                    <span>
                        <strong>Bid Plus trial</strong> — {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining.
                    </span>
                    {anyOverLimit && (
                        <span className="trial-banner-usage">
                            You're already past the free plan:{" "}
                            {overBids && (
                                <strong>{bidCount}/{freeLimits.bids} bids</strong>
                            )}
                            {overBids && overContacts && " and "}
                            {overContacts && (
                                <strong>{contactCount}/{freeLimits.contacts} contacts</strong>
                            )}
                            . Subscribe to keep everything.
                        </span>
                    )}
                    {!anyOverLimit && (
                        <span className="trial-banner-usage">
                            Subscribe to keep your features.
                        </span>
                    )}
                </div>
            </div>
            <button className="trial-banner-btn" onClick={handleSubscribe} disabled={busy}>
                {busy ? "Loading…" : "Subscribe Now"}
            </button>
        </div>
    );
}

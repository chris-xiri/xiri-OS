import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { getLimits } from "../lib/rbac";
import { trackTrialBannerShown, trackSubscribeClicked } from "../lib/analytics";
import "./TrialBanner.css";

/**
 * High-converting Trial Banner shown during the Bid Plus trial period.
 * Shows days remaining, usage vs free-tier limits, and the Early-Bird $5/mo offer
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
        const tier = subscription.tier === "bid" ? "bid_plus" : subscription.tier;
        trackSubscribeClicked(tier);
        try {
            const createCheckout = httpsCallable(functions, "createCheckoutSession");
            const result = await createCheckout({
                companyId: profile.companyId,
                tier,
                interval: "monthly",
                isEarlyBird: true,
                successUrl: window.location.origin + "/app/settings?tab=subscription&upgraded=true",
                cancelUrl: window.location.href,
            });
            const { sessionUrl } = result.data as { sessionUrl: string };
            if (!sessionUrl) throw new Error("Missing checkout session URL");
            (window.top || window).location.href = sessionUrl;
        } catch (err) {
            console.error("Checkout error:", err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={`trial-banner ${anyOverLimit ? "trial-banner-over" : ""}`}>
            <div className="trial-banner-content">
                <span className="trial-banner-badge">⚡ EARLY-BIRD DEAL</span>
                <div className="trial-banner-text">
                    <span>
                        <strong>Bid Plus Trial:</strong> {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining.
                    </span>
                    <span className="trial-banner-usage">
                        {anyOverLimit ? (
                            <>
                                You're over free limits (<strong>{bidCount}/{freeLimits.bids} bids</strong>, <strong>{contactCount}/{freeLimits.contacts} contacts</strong>). Lock in <strong>$5/mo</strong> (45% off) to keep unlimited.
                            </>
                        ) : (
                            <>
                                Lock in the founder rate for just <strong>$5/mo</strong> (regularly $9/mo) for unlimited bids and PDF proposals.
                            </>
                        )}
                    </span>
                </div>
            </div>
            <button className="trial-banner-btn" onClick={handleSubscribe} disabled={busy}>
                {busy ? "Redirecting…" : "Claim $5/mo Deal →"}
            </button>
        </div>
    );
}

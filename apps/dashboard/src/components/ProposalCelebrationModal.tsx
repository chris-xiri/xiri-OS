import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
    trackProposalAhaModalShown,
    trackProposalAhaModalClicked,
} from "../lib/analytics";
import "./ProposalCelebrationModal.css";

interface ProposalCelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    bidName?: string;
    monthlyValue?: number;
}

export default function ProposalCelebrationModal({
    isOpen,
    onClose,
    bidName,
    monthlyValue,
}: ProposalCelebrationModalProps) {
    const { profile, subscription } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            trackProposalAhaModalShown(monthlyValue);
        }
    }, [isOpen, monthlyValue]);

    // Don't show to users who are already fully paid active Bid Plus or higher (unless trialing)
    const isPayingCustomer =
        subscription.status === "active" && subscription.tier !== "bid";

    if (!isOpen || isPayingCustomer) return null;

    const formattedValue = monthlyValue
        ? monthlyValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
        : null;

    const handleUpgrade = async () => {
        if (!profile?.companyId || loading) return;

        setLoading(true);
        trackProposalAhaModalClicked();

        try {
            const createCheckout = httpsCallable(functions, "createCheckoutSession");
            const result = await createCheckout({
                companyId: profile.companyId,
                tier: "bid_plus",
                interval: "monthly",
                isEarlyBird: true,
                successUrl: window.location.origin + "/app/settings?tab=subscription&upgraded=true",
                cancelUrl: window.location.href,
            });

            const { sessionUrl } = result.data as { sessionUrl: string };
            if (!sessionUrl) throw new Error("Missing checkout session URL");

            (window.top || window).location.href = sessionUrl;
        } catch (err) {
            console.error("Celebration checkout error:", err);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="celebration-overlay" onClick={onClose}>
            <div className="celebration-modal" onClick={(e) => e.stopPropagation()}>
                <button className="celebration-close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                <div className="celebration-icon-wrapper">
                    <div className="celebration-badge">PROPOSAL READY</div>
                    <div className="celebration-icon">📄 ✨</div>
                </div>

                <h2 className="celebration-title">
                    {formattedValue ? `Ready to win ${formattedValue}/mo?` : "Your proposal is ready!"}
                </h2>
                <p className="celebration-desc">
                    {bidName ? `"${bidName}"` : "This proposal"} has been calculated with professional margins and task scopes.
                </p>

                <div className="celebration-offer-card">
                    <div className="celebration-offer-tag">⚡ EARLY-BIRD FOUNDER OFFER</div>
                    <div className="celebration-offer-price">
                        <span className="price-old">$9/mo</span>
                        <span className="price-new">$5/mo</span>
                        <span className="price-badge">SAVE 45%</span>
                    </div>
                    <ul className="celebration-offer-list">
                        <li>✓ <strong>Unlimited proposals</strong> (don't get capped at 3)</li>
                        <li>✓ <strong>Branded PDF exports</strong> for your clients</li>
                        <li>✓ <strong>Unlimited CRM client contacts</strong></li>
                    </ul>
                </div>

                <button
                    className="celebration-cta-btn"
                    onClick={handleUpgrade}
                    disabled={loading}
                >
                    {loading ? "Redirecting to Stripe…" : "Lock in $5/mo Early-Bird Deal →"}
                </button>

                <button className="celebration-secondary-btn" onClick={onClose}>
                    Continue with Free Trial
                </button>
            </div>
        </div>
    );
}

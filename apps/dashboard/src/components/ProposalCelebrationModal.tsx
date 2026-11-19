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
    const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");

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
                interval: billingInterval,
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
                    <div
                        style={{
                            display: "inline-flex",
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: "8px",
                            padding: "3px",
                            marginBottom: "0.75rem",
                            gap: "4px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setBillingInterval("monthly")}
                            style={{
                                padding: "4px 12px",
                                borderRadius: "6px",
                                border: "none",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                background: billingInterval === "monthly" ? "#00d4aa" : "transparent",
                                color: billingInterval === "monthly" ? "#0a0e1a" : "#c4c9e0",
                            }}
                        >
                            Monthly ($5/mo)
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingInterval("annual")}
                            style={{
                                padding: "4px 12px",
                                borderRadius: "6px",
                                border: "none",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                background: billingInterval === "annual" ? "#00d4aa" : "transparent",
                                color: billingInterval === "annual" ? "#0a0e1a" : "#c4c9e0",
                            }}
                        >
                            Annual ($49/yr · Save 55%)
                        </button>
                    </div>
                    <div className="celebration-offer-price">
                        <span className="price-old">{billingInterval === "monthly" ? "$9/mo" : "$108/yr"}</span>
                        <span className="price-new">{billingInterval === "monthly" ? "$5/mo" : "$49/yr"}</span>
                        <span className="price-badge">{billingInterval === "monthly" ? "SAVE 45%" : "SAVE 55%"}</span>
                    </div>
                    <ul className="celebration-offer-list">
                        <li>✓ <strong>Unlimited proposals</strong> (don't get capped at 3)</li>
                        <li>✓ <strong>1-click email delivery</strong> &amp; client open tracking</li>
                        <li>✓ <strong>Unlimited CRM client contacts</strong></li>
                    </ul>
                </div>

                <button
                    className="celebration-cta-btn"
                    onClick={handleUpgrade}
                    disabled={loading}
                >
                    {loading
                        ? "Redirecting to Stripe…"
                        : `Lock in ${billingInterval === "monthly" ? "$5/mo" : "$49/yr"} Early-Bird Deal →`}
                </button>

                <button className="celebration-secondary-btn" onClick={onClose}>
                    Continue with Free Trial
                </button>
            </div>
        </div>
    );
}

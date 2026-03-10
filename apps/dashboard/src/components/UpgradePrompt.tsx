import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Feature } from "../lib/rbac";
import { FEATURE_META, requiredTier } from "../lib/rbac";
import { trackSubscribeClicked } from "../lib/analytics";
import "./UpgradePrompt.css";

interface UpgradePromptProps {
    featureName: Feature;
    requiredTierName: string;
    requiredTierPrice: string;
    requiredTierColor: string;
}

export default function UpgradePrompt({
    featureName,
    requiredTierName,
    requiredTierPrice,
    requiredTierColor,
}: UpgradePromptProps) {
    const meta = FEATURE_META[featureName];
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!profile?.companyId) return;

        setLoading(true);
        try {
            const { httpsCallable } = await import("firebase/functions");
            const { functions } = await import("../lib/firebase");
            const createCheckoutSession = httpsCallable(functions, "createCheckoutSession");

            const needed = requiredTier(featureName);
            const result = await createCheckoutSession({
                companyId: profile.companyId,
                tier: needed,
                interval: "monthly",
                successUrl: window.location.origin + "/settings?tab=subscription&upgraded=true",
                cancelUrl: window.location.href,
            });

            const { sessionUrl } = result.data as { sessionUrl: string };
            if (sessionUrl) {
                trackSubscribeClicked(needed);
                window.location.href = sessionUrl;
            }
        } catch (err) {
            console.error("Checkout error:", err);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upgrade-prompt">
            <div className="upgrade-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.04)" />
                    <path
                        d="M24 14v12M18 20l6-6 6 6"
                        stroke={requiredTierColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <rect x="16" y="30" width="16" height="4" rx="2" fill={requiredTierColor} fillOpacity="0.2" />
                </svg>
            </div>

            <h3 className="upgrade-title">
                {meta.icon} {meta.label}
            </h3>
            <p className="upgrade-desc">{meta.description}</p>

            <div className="upgrade-badge" style={{ borderColor: requiredTierColor + "40" }}>
                <span className="upgrade-badge-dot" style={{ background: requiredTierColor }} />
                Requires <strong>{requiredTierName}</strong> plan ({requiredTierPrice})
            </div>

            <button
                className="upgrade-btn"
                style={{ background: requiredTierColor }}
                onClick={handleUpgrade}
                disabled={loading}
            >
                {loading ? "Starting checkout…" : `Upgrade to ${requiredTierName} →`}
            </button>
        </div>
    );
}


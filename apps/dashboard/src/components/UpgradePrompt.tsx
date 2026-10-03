import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { Feature } from "../lib/rbac";
import { FEATURE_META, requiredTier, TIER_INFO } from "../lib/rbac";
import { trackSubscribeClicked } from "../lib/analytics";
import "./UpgradePrompt.css";

interface UpgradePromptProps {
    feature?: Feature;
    featureName?: Feature;
    requiredTierName?: string;
    requiredTierPrice?: string;
    requiredTierColor?: string;
}

export default function UpgradePrompt({
    feature,
    featureName,
    requiredTierName,
    requiredTierPrice,
    requiredTierColor,
}: UpgradePromptProps) {
    const targetFeature = (feature || featureName || "crm") as Feature;
    const meta = FEATURE_META[targetFeature] || { label: "Feature", description: "Upgrade to unlock this feature.", icon: "⭐" };
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);

    const needed = requiredTier(targetFeature);
    const tierName = requiredTierName || TIER_INFO[needed]?.name || "Pro";
    const tierPrice = requiredTierPrice || TIER_INFO[needed]?.price || "$9/mo";
    const tierColor = requiredTierColor || TIER_INFO[needed]?.color || "#3b82f6";

    const handleUpgrade = async () => {
        if (!profile?.companyId || loading) return;

        setLoading(true);
        try {
            const createCheckoutSession = httpsCallable(functions, "createCheckoutSession");

            trackSubscribeClicked(needed);
            const result = await createCheckoutSession({
                companyId: profile.companyId,
                tier: needed,
                interval: "monthly",
                successUrl: window.location.origin + "/app/settings?tab=subscription&upgraded=true",
                cancelUrl: window.location.href,
            });

            const { sessionUrl } = result.data as { sessionUrl: string };
            if (!sessionUrl) throw new Error("Missing checkout session URL");
            window.location.href = sessionUrl;
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
                        stroke={tierColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <rect x="16" y="30" width="16" height="4" rx="2" fill={tierColor} fillOpacity="0.2" />
                </svg>
            </div>

            <h3 className="upgrade-title">
                {meta.icon} {meta.label}
            </h3>
            <p className="upgrade-desc">{meta.description}</p>

            <div className="upgrade-badge" style={{ borderColor: tierColor + "40" }}>
                <span className="upgrade-badge-dot" style={{ background: tierColor }} />
                Requires <strong>{tierName}</strong> plan ({tierPrice})
            </div>

            <button
                className="upgrade-btn"
                style={{ background: tierColor }}
                onClick={handleUpgrade}
                disabled={loading}
            >
                {loading ? "Starting checkout…" : `Upgrade to ${tierName} →`}
            </button>
        </div>
    );
}

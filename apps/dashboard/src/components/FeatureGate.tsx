import { type ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { hasFeature, requiredTier, TIER_INFO, type Feature } from "../lib/rbac";
import UpgradePrompt from "./UpgradePrompt";

interface FeatureGateProps {
    feature: Feature;
    children: ReactNode;
    /** If true, show a locked placeholder instead of hiding completely */
    showPlaceholder?: boolean;
}

/**
 * Wraps content that requires a specific tier.
 * If the user's tier doesn't include the feature,
 * shows an upgrade prompt instead.
 */
export default function FeatureGate({ feature, children, showPlaceholder = true }: FeatureGateProps) {
    const { subscription } = useAuth();

    if (hasFeature(subscription.tier, feature)) {
        return <>{children}</>;
    }

    if (!showPlaceholder) return null;

    const needed = requiredTier(feature);
    return (
        <UpgradePrompt
            featureName={feature}
            requiredTierName={TIER_INFO[needed].name}
            requiredTierPrice={TIER_INFO[needed].price}
            requiredTierColor={TIER_INFO[needed].color}
        />
    );
}

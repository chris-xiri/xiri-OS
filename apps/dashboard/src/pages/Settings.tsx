import { useState, useEffect } from "react";
import { trackSubscribeClicked, trackPurchaseCompleted } from "../lib/analytics";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { TIER_INFO, getLimits, getTierFeatures, FEATURE_META, getUpgradeTier, type Tier, type Feature } from "../lib/rbac";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import "./Settings.css";

const TIER_ORDER: Tier[] = ["bid", "bid_plus", "grow", "pro", "business"];

async function startCheckout(companyId: string, tier: string) {
    trackSubscribeClicked(tier);
    const createCheckout = httpsCallable(functions, "createCheckoutSession");
    const result = await createCheckout({
        companyId,
        tier,
        interval: "monthly",
        successUrl: window.location.origin + "/settings?tab=subscription&upgraded=true",
        cancelUrl: window.location.href,
    });
    const { sessionUrl } = result.data as { sessionUrl: string };
    if (!sessionUrl) throw new Error("Missing checkout session URL");
    (window.top || window).location.href = sessionUrl;
}

async function openPortal(companyId: string) {
    const createPortal = httpsCallable(functions, "createPortalSession");
    const result = await createPortal({
        companyId,
        returnUrl: window.location.href,
    });
    const { portalUrl } = result.data as { portalUrl: string };
    if (!portalUrl) throw new Error("Missing portal URL");
    window.location.href = portalUrl;
}

export default function Settings() {
    const { profile, subscription, logout } = useAuth();
    const currentTier = subscription.tier;
    const limits = getLimits(currentTier);
    const features = getTierFeatures(currentTier);
    const tierInfo = TIER_INFO[currentTier];

    const settingsNavigate = useNavigate();
    const VALID_TABS = ["account", "subscription"] as const;
    type Tab = typeof VALID_TABS[number];
    const [searchParams, setSearchParams] = useSearchParams();
    const rawTab = searchParams.get("tab");
    const activeTab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "account";
    const setActiveTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });
    const [showPlans, setShowPlans] = useState(false);
    const [loadingCheckoutTier, setLoadingCheckoutTier] = useState<Tier | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);

    // Track successful checkout return
    useEffect(() => {
        if (searchParams.get("upgraded") === "true") {
            trackPurchaseCompleted(currentTier, 0);
            // Clean up URL param
            const next = new URLSearchParams(searchParams);
            next.delete("upgraded");
            setSearchParams(next, { replace: true });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p className="settings-subtitle">Manage your account and subscription</p>
            </div>

            {/* Tab Navigation */}
            <div className="settings-tabs">
                <button
                    className="settings-tab"
                    onClick={() => settingsNavigate("/company")}
                    style={{ cursor: "pointer" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    Company Profile →
                </button>
                <button
                    className={`settings-tab ${activeTab === "account" ? "settings-tab-active" : ""}`}
                    onClick={() => setActiveTab("account")}
                    style={{ cursor: "pointer" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Account
                </button>
                <button
                    className={`settings-tab ${activeTab === "subscription" ? "settings-tab-active" : ""}`}
                    onClick={() => setActiveTab("subscription")}
                    style={{ cursor: "pointer" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Subscription
                </button>
            </div>


            {/* ━━━ Account Tab ━━━ */}
            {activeTab === "account" && (
                <div className="settings-tab-content">
                    <div className="settings-grid">
                        <section className="settings-card">
                            <div className="settings-card-header">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <h2>Account</h2>
                            </div>
                            <div className="settings-field">
                                <label>Email</label>
                                <span className="settings-value">{profile?.email}</span>
                            </div>
                            <div className="settings-field">
                                <label>Display Name</label>
                                <span className="settings-value">{profile?.displayName || "Not set"}</span>
                            </div>
                            <div className="settings-field">
                                <label>Role</label>
                                <span className="settings-value settings-role">{profile?.role}</span>
                            </div>
                            <button className="settings-btn settings-btn-outline" onClick={logout} style={{ cursor: "pointer" }}>
                                Sign Out
                            </button>
                        </section>
                    </div>
                </div>
            )}

            {/* ━━━ Subscription Tab ━━━ */}
            {activeTab === "subscription" && (
                <div className="settings-tab-content">
                    <div className="settings-grid">
                        {/* Current Plan */}
                        <section className="settings-card settings-subscription">
                            <div className="settings-card-header">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                    <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                                <h2>Current Plan</h2>
                            </div>

                            <div className="settings-plan-badge" style={{ borderColor: tierInfo.color }}>
                                <span className="settings-plan-dot" style={{ background: tierInfo.color }} />
                                <span className="settings-plan-name">{tierInfo.name} Plan</span>
                                <span className="settings-plan-price">{tierInfo.price}</span>
                            </div>

                            <div className="settings-field">
                                <label>Status</label>
                                <span className={`settings-status settings-status-${subscription.status}`}>
                                    {subscription.status}
                                </span>
                            </div>

                            <div className="settings-field">
                                <label>Contact Limit</label>
                                <span className="settings-value">
                                    {limits.contacts === -1 ? "Unlimited" : `${limits.contacts} contacts`}
                                </span>
                            </div>
                            <div className="settings-field">
                                <label>User Limit</label>
                                <span className="settings-value">
                                    {limits.users === -1 ? "Unlimited" : `${limits.users} user${limits.users > 1 ? "s" : ""}`}
                                </span>
                            </div>

                            {/* Trial countdown */}
                            {subscription.status === "trialing" && subscription.trialEnd && (() => {
                                const daysLeft = Math.max(0, Math.ceil(
                                    (new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                ));
                                return (
                                    <div className="settings-trial-info">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left on your free trial</span>
                                    </div>
                                );
                            })()}

                            {/* Bid limit info */}
                            <div className="settings-field">
                                <label>Bid Limit</label>
                                <span className="settings-value">
                                    {limits.bids === -1 ? "Unlimited" : `${limits.bids} active bids`}
                                </span>
                            </div>

                            {currentTier === "bid" && (
                                <button
                                    className="settings-btn settings-btn-upgrade"
                                    style={{ cursor: "pointer" }}
                                    disabled={loadingCheckoutTier !== null}
                                    onClick={async () => {
                                        if (!profile?.companyId || loadingCheckoutTier) return;
                                        try {
                                            setLoadingCheckoutTier("bid_plus");
                                            await startCheckout(profile.companyId, "bid_plus");
                                        } catch (err) {
                                            console.error("Checkout failed:", err);
                                            setLoadingCheckoutTier(null);
                                        }
                                    }}
                                >
                                    {loadingCheckoutTier === "bid_plus" ? "Redirecting to Stripe…" : "Subscribe"}
                                </button>
                            )}

                            {subscription.stripeSubscriptionId && (
                                <button
                                    className="settings-btn settings-btn-outline"
                                    style={{ cursor: "pointer", marginTop: 8 }}
                                    disabled={portalLoading}
                                    onClick={async () => {
                                        if (!profile?.companyId || portalLoading) return;
                                        try {
                                            setPortalLoading(true);
                                            await openPortal(profile.companyId);
                                        } catch (err) {
                                            console.error("Portal open failed:", err);
                                            setPortalLoading(false);
                                        }
                                    }}
                                >
                                    {portalLoading ? "Redirecting…" : "Manage Subscription"}
                                </button>
                            )}
                        </section>

                        {/* Plan Benefits — sales pitch + upgrade tease */}
                        <section className="settings-card settings-features-card">
                            <div className="settings-card-header">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <h2>Your {tierInfo.name} Plan</h2>
                            </div>
                            <p className="settings-plan-tagline">
                                {currentTier === "bid" && "Everything you need to start winning cleaning contracts."}
                                {currentTier === "bid_plus" && "Unlimited contacts to grow your client base."}
                                {currentTier === "grow" && "Full business tools to scale your operations."}
                                {currentTier === "pro" && "Advanced operations for established cleaning companies."}
                                {currentTier === "business" && "Complete platform — every tool, no limits."}
                            </p>

                            <div className="settings-plan-benefits">
                                {features.map((f) => (
                                    <div key={f} className="settings-benefit-row">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <div className="settings-benefit-text">
                                            <span className="settings-benefit-label">{FEATURE_META[f].label}</span>
                                            <span className="settings-benefit-desc">{FEATURE_META[f].description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Upgrade tease — show what next tier unlocks */}
                            {(() => {
                                const nextTier = getUpgradeTier(currentTier);
                                if (!nextTier) return null;
                                const nextFeatures = getTierFeatures(nextTier).filter(
                                    (f: Feature) => !features.includes(f)
                                );
                                const nextInfo = TIER_INFO[nextTier];
                                // Also compute limit upgrades
                                const curLimits = getLimits(currentTier);
                                const nxtLimits = getLimits(nextTier);
                                const limitUpgrades: string[] = [];
                                if (curLimits.contacts !== nxtLimits.contacts) {
                                    limitUpgrades.push(nxtLimits.contacts === -1 ? "Unlimited Contacts" : `${nxtLimits.contacts} Contacts`);
                                }
                                if (curLimits.users !== nxtLimits.users) {
                                    limitUpgrades.push(nxtLimits.users === -1 ? "Unlimited Users" : `${nxtLimits.users} Users`);
                                }
                                if (nextFeatures.length === 0 && limitUpgrades.length === 0) return null;
                                return (
                                    <div className="settings-upgrade-tease">
                                        <div className="settings-upgrade-tease-header">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={nextInfo.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="17 11 12 6 7 11" />
                                                <line x1="12" y1="6" x2="12" y2="18" />
                                            </svg>
                                            <span>Unlock with <strong style={{ color: nextInfo.color }}>{nextInfo.name}</strong> ({nextInfo.price})</span>
                                        </div>
                                        <div className="settings-upgrade-tease-features">
                                            {limitUpgrades.map((l) => (
                                                <span key={l} className="settings-tease-feature settings-tease-limit">
                                                    {l}
                                                </span>
                                            ))}
                                            {nextFeatures.map((f: Feature) => (
                                                <span key={f} className="settings-tease-feature">
                                                    {FEATURE_META[f].label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </section>
                    </div>

                    {/* Explore Plans — collapsible */}
                    <button
                        className="settings-explore-plans-toggle"
                        onClick={() => setShowPlans((p) => !p)}
                        style={{ cursor: "pointer" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        <span className="settings-explore-label">Compare All Plans</span>
                        <span className="settings-explore-hint">Find the right plan as you grow</span>
                        <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`settings-explore-chevron ${showPlans ? "settings-explore-chevron-open" : ""}`}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {showPlans && (() => {
                        const PLAN_COPY: Record<string, { tagline: string; features: string[]; popular?: boolean; comingSoon?: boolean }> = {
                            bid: {
                                tagline: "Win jobs with professional bids",
                                features: ["Up to 3 active bids", "PDF proposal generation", "CRM — up to 5 contacts", "Mobile app (PWA)", "Email support"],
                            },
                            bid_plus: {
                                tagline: "Unlimited bidding for solo operators",
                                features: ["Everything in Bid", "Unlimited bids & contacts", "Custom tasks & frequencies", "Priority email support"],
                            },
                            grow: {
                                tagline: "Add invoicing & a small team",
                                comingSoon: true,
                                features: ["Everything in Bid Plus", "Invoicing & payments", "Full CRM & lead management", "Email campaigns", "QuickBooks sync"],
                            },
                            pro: {
                                tagline: "Full operations for growing teams",
                                popular: true,
                                comingSoon: true,
                                features: ["Everything in Grow", "Scheduling & recurring jobs", "Timekeeping with GPS", "Checklists & task management", "Priority support"],
                            },
                            business: {
                                tagline: "Scale with full visibility",
                                comingSoon: true,
                                features: ["Everything in Pro", "Inspections & quality scores", "Client portal", "Job costing & profitability", "Dedicated account manager"],
                            },
                        };
                        return (
                            <div className="settings-plans-collapse">
                                <div className="settings-plans-grid">
                                    {TIER_ORDER.map((tier) => {
                                        const info = TIER_INFO[tier];
                                        const tierLimits = getLimits(tier);
                                        const copy = PLAN_COPY[tier];
                                        const isCurrent = tier === currentTier;
                                        const isUpgrade = TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(currentTier);
                                        return (
                                            <div
                                                key={tier}
                                                className={`settings-plan-card ${isCurrent ? "settings-plan-current" : ""} ${copy.popular ? "settings-plan-popular" : ""} ${copy.comingSoon ? "settings-plan-coming-soon" : ""}`}
                                                style={{ borderColor: isCurrent ? info.color : copy.popular ? info.color : undefined }}
                                            >
                                                {copy.popular && (
                                                    <span className="settings-plan-popular-badge" style={{ background: info.color }}>Most Popular</span>
                                                )}
                                                <div className="settings-plan-card-header">
                                                    <span className="settings-plan-card-name" style={{ color: info.color }}>
                                                        {info.name}
                                                    </span>
                                                    <span className="settings-plan-card-price">
                                                        {info.price}
                                                    </span>
                                                </div>
                                                <span className="settings-plan-card-tagline">{copy.tagline}</span>
                                                <div className="settings-plan-card-limits">
                                                    <span>{tierLimits.contacts === -1 ? "Unlimited" : tierLimits.contacts} contacts</span>
                                                    <span>{tierLimits.users === -1 ? "Unlimited" : `Up to ${tierLimits.users}`} users</span>
                                                </div>
                                                <div className="settings-plan-card-features-list">
                                                    {copy.features.map((feat) => (
                                                        <div key={feat} className="settings-plan-card-feat-row">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isUpgrade || isCurrent ? "#10b981" : "#4b5563"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                            <span>{feat}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {isCurrent ? (
                                                    <span className="settings-plan-card-badge">Your Plan</span>
                                                ) : copy.comingSoon ? (
                                                    <span className="settings-plan-coming-soon-badge">Coming Soon</span>
                                                ) : isUpgrade ? (
                                                    <button
                                                        className="settings-plan-card-cta"
                                                        style={{
                                                            cursor: "pointer",
                                                            ...(copy.popular ? { background: info.color, color: "#fff", borderColor: info.color } : {}),
                                                        }}
                                                        disabled={loadingCheckoutTier !== null}
                                                        onClick={async () => {
                                                            if (!profile?.companyId || loadingCheckoutTier) return;
                                                            try {
                                                                setLoadingCheckoutTier(tier);
                                                                await startCheckout(profile.companyId, tier);
                                                            } catch (err) {
                                                                console.error("Checkout failed:", err);
                                                                setLoadingCheckoutTier(null);
                                                            }
                                                        }}
                                                    >
                                                        {loadingCheckoutTier === tier ? "Redirecting to Stripe…" : `Upgrade to ${info.name} →`}
                                                    </button>
                                                ) : (
                                                    <span className="settings-plan-card-included">Included in your plan</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

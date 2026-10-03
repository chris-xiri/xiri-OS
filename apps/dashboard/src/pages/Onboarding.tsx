import { useState, useEffect, type FormEvent } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db, functions } from "../lib/firebase";
import {
    trackEarlyBirdOfferViewed,
    trackEarlyBirdOfferAccepted,
    trackEarlyBirdOfferSkipped,
} from "../lib/analytics";
import "./Onboarding.css";

export default function Onboarding() {
    const { profile, completeOnboarding } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2>(1);
    const [companyName, setCompanyName] = useState("");
    const [serviceType, setServiceType] = useState("commercial");
    const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
    const [saving, setSaving] = useState(false);
    const [checkoutBusy, setCheckoutBusy] = useState(false);

    useEffect(() => {
        if (step === 2) {
            trackEarlyBirdOfferViewed(billingInterval);
        }
    }, [step, billingInterval]);

    const handleStep1Submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!profile?.companyId || !companyName.trim()) return;

        setSaving(true);
        try {
            await updateDoc(doc(db, "companies", profile.companyId), {
                name: companyName.trim(),
                primaryService: serviceType,
            });
            // Advance to Step 2: Early Bird Offer
            setStep(2);
        } catch (err) {
            console.error("Failed to update company name:", err);
            // Fallback: advance anyway if company update fails
            setStep(2);
        } finally {
            setSaving(false);
        }
    };

    const handleClaimEarlyBird = async () => {
        if (!profile?.companyId || checkoutBusy) return;

        setCheckoutBusy(true);
        trackEarlyBirdOfferAccepted(billingInterval);

        try {
            const createCheckout = httpsCallable(functions, "createCheckoutSession");
            const result = await createCheckout({
                companyId: profile.companyId,
                tier: "bid_plus",
                interval: billingInterval,
                isEarlyBird: true,
                successUrl: window.location.origin + "/app/settings?tab=subscription&upgraded=true",
                cancelUrl: window.location.origin + "/app/",
            });

            const { sessionUrl } = result.data as { sessionUrl: string };
            if (!sessionUrl) throw new Error("Missing checkout session URL");

            completeOnboarding();
            (window.top || window).location.href = sessionUrl;
        } catch (err) {
            console.error("Early bird checkout error:", err);
            // If Stripe checkout error happens, proceed to dashboard
            completeOnboarding();
            navigate("/", { replace: true });
        } finally {
            setCheckoutBusy(false);
        }
    };

    const handleSkipToTrial = () => {
        trackEarlyBirdOfferSkipped();
        completeOnboarding();
        navigate("/", { replace: true });
    };

    return (
        <div className="onboarding-page">
            <div className={`onboarding-card ${step === 2 ? "onboarding-card-wide" : ""}`}>
                {/* Step indicator */}
                <div className="onboarding-steps">
                    <div className={`onboarding-step-dot ${step >= 1 ? "active" : ""}`} />
                    <div className="onboarding-step-line" />
                    <div className={`onboarding-step-dot ${step === 2 ? "active" : ""}`} />
                </div>

                {step === 1 ? (
                    <>
                        <div className="onboarding-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="12" fill="#00d4aa" fillOpacity="0.12" />
                                <path d="M24 14v6M24 26v-2M16 28h16M14 32h20" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" />
                                <rect x="18" y="14" width="12" height="8" rx="2" stroke="#00d4aa" strokeWidth="2" />
                            </svg>
                        </div>

                        <h1>Welcome to xiri<span style={{ color: "#00d4aa" }}>OS</span>!</h1>
                        <p className="onboarding-subtitle">
                            Let's configure your estimating workspace. What is your cleaning company name?
                        </p>

                        <form onSubmit={handleStep1Submit} className="onboarding-form">
                            <div className="form-group">
                                <label htmlFor="companyName">Company Name</label>
                                <input
                                    id="companyName"
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g. Apex Commercial Cleaning"
                                    required
                                    autoFocus
                                    autoComplete="organization"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="serviceType">Primary Service Focus</label>
                                <select
                                    id="serviceType"
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="onboarding-select"
                                >
                                    <option value="commercial">Commercial Janitorial / Office</option>
                                    <option value="residential">Residential / House Cleaning</option>
                                    <option value="post_construction">Post-Construction Cleanup</option>
                                    <option value="specialized">Specialized (Carpet, Windows, Medical)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="onboarding-submit"
                                disabled={saving || !companyName.trim()}
                            >
                                {saving ? (
                                    <span className="onboarding-spinner" />
                                ) : (
                                    "Continue →"
                                )}
                            </button>
                        </form>

                        <button className="onboarding-skip" onClick={() => setStep(2)}>
                            Skip to next step
                        </button>
                    </>
                ) : (
                    <>
                        <div className="earlybird-badge">
                            <span className="earlybird-sparkle">⚡</span>
                            <span>EXCLUSIVE WELCOME OFFER • 45% OFF</span>
                        </div>

                        <h1 className="earlybird-title">
                            Lock in <span className="earlybird-highlight">Bid Plus</span> for just{" "}
                            {billingInterval === "monthly" ? "$5/mo" : "$49/yr"}
                        </h1>
                        <p className="onboarding-subtitle">
                            Unlock unlimited bidding power, custom PDF proposals, and full CRM contacts.
                        </p>

                        {/* Billing Switcher */}
                        <div className="earlybird-interval-switcher">
                            <button
                                type="button"
                                className={`interval-btn ${billingInterval === "monthly" ? "active" : ""}`}
                                onClick={() => setBillingInterval("monthly")}
                            >
                                Monthly ($5/mo)
                            </button>
                            <button
                                type="button"
                                className={`interval-btn ${billingInterval === "annual" ? "active" : ""}`}
                                onClick={() => setBillingInterval("annual")}
                            >
                                Annual ($49/yr <span className="save-tag">SAVE 55%</span>)
                            </button>
                        </div>

                        {/* Value Stack */}
                        <div className="earlybird-features">
                            <div className="earlybird-feature-item">
                                <div className="feature-check">✓</div>
                                <div>
                                    <strong>Unlimited Winning Bids & Calculations</strong>
                                    <p>Never hit the free tier 3-bid limit. Bid as many jobs as you want.</p>
                                </div>
                            </div>
                            <div className="earlybird-feature-item">
                                <div className="feature-check">✓</div>
                                <div>
                                    <strong>Branded PDF Proposals & Custom Tasks</strong>
                                    <p>Generate high-converting estimate PDFs ready to send to clients.</p>
                                </div>
                            </div>
                            <div className="earlybird-feature-item">
                                <div className="feature-check">✓</div>
                                <div>
                                    <strong>Unlimited Client & Prospect CRM</strong>
                                    <p>Store all your facilities, decision-makers, and site notes.</p>
                                </div>
                            </div>
                            <div className="earlybird-feature-item">
                                <div className="feature-check">✓</div>
                                <div>
                                    <strong>Locked-In Founder Rate</strong>
                                    <p>Your rate will never increase as long as your subscription remains active.</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA button */}
                        <button
                            className="earlybird-cta-btn"
                            onClick={handleClaimEarlyBird}
                            disabled={checkoutBusy}
                        >
                            {checkoutBusy ? (
                                <span className="onboarding-spinner" />
                            ) : (
                                <>
                                    Claim Early-Bird Pricing ({billingInterval === "monthly" ? "$5/mo" : "$49/yr"}) →
                                </>
                            )}
                        </button>

                        <p className="earlybird-guarantee">
                            🔒 30-day money-back guarantee • Cancel anytime with 1 click
                        </p>

                        <button className="onboarding-skip earlybird-skip" onClick={handleSkipToTrial}>
                            Or continue with 60-day (2 months) free trial →
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

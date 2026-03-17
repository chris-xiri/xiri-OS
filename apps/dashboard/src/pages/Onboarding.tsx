import { useState, type FormEvent } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import "./Onboarding.css";

export default function Onboarding() {
    const { profile, completeOnboarding } = useAuth();
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [saving, setSaving] = useState(false);

    // If there's a pending bid from the public calculator, go to dashboard
    // so usePendingBid can fire and navigate to the bid; otherwise start
    // the Company Setup Wizard.
    const getPostOnboardingPath = () => {
        try {
            if (localStorage.getItem("xiri_pendingBid")) return "/";
        } catch { /* localStorage unavailable */ }
        return "/company";
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!profile?.companyId || !companyName.trim()) return;

        setSaving(true);
        try {
            await updateDoc(doc(db, "companies", profile.companyId), {
                name: companyName.trim(),
            });
            completeOnboarding();
            navigate(getPostOnboardingPath(), { replace: true });
        } catch (err) {
            console.error("Failed to update company name:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = () => {
        completeOnboarding();
        navigate(getPostOnboardingPath(), { replace: true });
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                <div className="onboarding-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="#00d4aa" fillOpacity="0.12" />
                        <path d="M24 14v6M24 26v-2M16 28h16M14 32h20" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" />
                        <rect x="18" y="14" width="12" height="8" rx="2" stroke="#00d4aa" strokeWidth="2" />
                    </svg>
                </div>

                <h1>Welcome to xiri<span style={{ color: "#00d4aa" }}>OS</span>!</h1>
                <p className="onboarding-subtitle">
                    Let's set up your workspace. What's the name of your cleaning company?
                </p>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    <div className="form-group">
                        <label htmlFor="companyName">Company Name</label>
                        <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Sparkle Clean Services"
                            required
                            autoFocus
                            autoComplete="organization"
                        />
                    </div>

                    <button
                        type="submit"
                        className="onboarding-submit"
                        disabled={saving || !companyName.trim()}
                    >
                        {saving ? (
                            <span className="onboarding-spinner" />
                        ) : (
                            "Get Started →"
                        )}
                    </button>
                </form>

                <button className="onboarding-skip" onClick={handleSkip}>
                    I'll do this later
                </button>
            </div>
        </div>
    );
}

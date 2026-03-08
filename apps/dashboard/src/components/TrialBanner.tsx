import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./TrialBanner.css";

/**
 * Dismissible banner shown during the Bid Plus trial period.
 * Shows days remaining and an upgrade CTA.
 */
export default function TrialBanner() {
    const { subscription } = useAuth();
    const navigate = useNavigate();

    if (subscription.status !== "trialing" || !subscription.trialEnd) {
        return null;
    }

    const now = new Date();
    const end = new Date(subscription.trialEnd);
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysLeft <= 0) return null;

    return (
        <div className="trial-banner">
            <div className="trial-banner-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
                    <strong>Bid Plus trial</strong> — {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                </span>
            </div>
            <button className="trial-banner-btn" onClick={() => navigate("/settings?tab=subscription")}>
                Upgrade Now
            </button>
        </div>
    );
}

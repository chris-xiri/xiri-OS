import { useState, useEffect, useMemo } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { TIER_INFO, type Tier } from "../lib/rbac";
import toast from "react-hot-toast";
import "./Admin.css";

interface AdminAccountItem {
    companyId: string;
    companyName: string;
    ownerId: string;
    ownerEmail: string;
    ownerName: string;
    createdAt: string;
    tier: string;
    status: string;
    trialEnd?: string | null;
    currentPeriodEnd?: string | null;
    daysLeftInTrial?: number | null;
    isTrialExpired?: boolean;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    stripeCustomerUrl?: string | null;
    stripeSubscriptionUrl?: string | null;
    primaryService?: string | null;
}

interface AdminSummary {
    totalAccounts: number;
    payingSubscribers: number;
    activeTrials: number;
    expiringSoonTrials: number;
    expiredTrials: number;
    canceled: number;
}

export default function Admin() {
    const { profile, user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [accounts, setAccounts] = useState<AdminAccountItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "paying" | "trialing" | "expiring" | "canceled">("all");

    // Edit modal state
    const [editingAccount, setEditingAccount] = useState<AdminAccountItem | null>(null);
    const [newTier, setNewTier] = useState<Tier>("bid_plus");
    const [newStatus, setNewStatus] = useState<string>("trialing");
    const [updating, setUpdating] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setLoadError(null);

        try {
            const getSubs = httpsCallable(functions, "getAdminSubscriptions");
            const result = await getSubs();
            const data = result.data as { summary: AdminSummary; accounts: AdminAccountItem[] };
            setSummary(data.summary);
            setAccounts(data.accounts);
        } catch (err: any) {
            console.error("Failed to load admin subscriptions:", err);
            const msg = err?.message || "";
            if (msg.includes("internal") || msg.includes("CORS") || msg.includes("not-found") || err?.code === "functions/internal") {
                setLoadError("The getAdminSubscriptions Cloud Function needs to be deployed to Firebase.");
            } else {
                setLoadError(msg || "Failed to load subscriptions.");
            }
            toast.error("Cloud Function not yet deployed or error connecting.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtered accounts
    const filteredAccounts = useMemo(() => {
        return accounts.filter((acc) => {
            // Status tab filter
            if (statusFilter === "paying" && (acc.status !== "active" || acc.tier === "bid")) return false;
            if (statusFilter === "trialing" && (acc.status !== "trialing" || acc.isTrialExpired)) return false;
            if (statusFilter === "expiring" && (acc.status !== "trialing" || acc.isTrialExpired || (acc.daysLeftInTrial ?? 999) > 7)) return false;
            if (statusFilter === "canceled" && acc.status !== "canceled" && !acc.isTrialExpired) return false;

            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = acc.ownerName?.toLowerCase().includes(q);
                const matchEmail = acc.ownerEmail?.toLowerCase().includes(q);
                const matchCompany = acc.companyName?.toLowerCase().includes(q);
                const matchStripe = acc.stripeCustomerId?.toLowerCase().includes(q);
                return matchName || matchEmail || matchCompany || matchStripe;
            }

            return true;
        });
    }, [accounts, statusFilter, searchQuery]);

    const handleExtendTrial = async (acc: AdminAccountItem, days = 30) => {
        try {
            toast.loading(`Extending trial for ${acc.ownerName || acc.companyName}…`, { id: "extend" });
            const updateSub = httpsCallable(functions, "adminUpdateSubscription");
            await updateSub({ companyId: acc.companyId, extendDays: days });
            toast.success(`Extended trial by ${days} days!`, { id: "extend" });
            loadData(true);
        } catch (err: any) {
            toast.error(err?.message || "Failed to extend trial.", { id: "extend" });
        }
    };

    const handleSaveAccount = async () => {
        if (!editingAccount) return;
        setUpdating(true);
        try {
            const updateSub = httpsCallable(functions, "adminUpdateSubscription");
            await updateSub({
                companyId: editingAccount.companyId,
                tier: newTier,
                status: newStatus,
            });
            toast.success("Subscription updated successfully!");
            setEditingAccount(null);
            loadData(true);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update subscription.");
        } finally {
            setUpdating(false);
        }
    };

    const currentEmail = (profile?.email || user?.email || "").toLowerCase().trim();
    const isAdmin = currentEmail === "chris@xiri.ai" || currentEmail.endsWith("@xiri.ai");

    if (authLoading) {
        return (
            <div className="admin-page">
                <div className="admin-loading" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                    <div className="app-loading-spinner" />
                    <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>Verifying admin permissions…</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="admin-page">
                <div className="admin-card admin-empty" style={{ padding: "3rem 2rem", textAlign: "center", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border-hover)", maxWidth: "540px", margin: "2rem auto" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Admin Access Required</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                        You are currently signed in as <strong>{currentEmail || "Unknown"}</strong>.
                    </p>
                    <p style={{ color: "#64748b", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                        This portal is restricted to administrators (<code>chris@xiri.ai</code>). If this is a secondary account, please sign out and sign in with your admin credentials.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1>Subscriptions & Trials Manager</h1>
                    <p className="admin-subtitle">
                        Live overview of all registered accounts, trials, and active Stripe subscriptions.
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-refresh"
                    onClick={() => loadData(true)}
                    disabled={refreshing || loading}
                >
                    <svg
                        className={refreshing ? "spin" : ""}
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    {refreshing ? "Refreshing…" : "Refresh"}
                </button>
            </div>

            {/* KPI Cards */}
            {summary && (
                <div className="admin-kpis">
                    <div className="admin-kpi-card">
                        <span className="admin-kpi-label">Total Accounts</span>
                        <span className="admin-kpi-val">{summary.totalAccounts}</span>
                        <span className="admin-kpi-hint">Total registered companies</span>
                    </div>

                    <div className="admin-kpi-card admin-kpi-paying">
                        <span className="admin-kpi-label">Paying Subscribers</span>
                        <span className="admin-kpi-val">{summary.payingSubscribers}</span>
                        <span className="admin-kpi-hint">Active Stripe paid plans</span>
                    </div>

                    <div className="admin-kpi-card admin-kpi-trials">
                        <span className="admin-kpi-label">Active Trials</span>
                        <span className="admin-kpi-val">{summary.activeTrials}</span>
                        <span className="admin-kpi-hint">Users currently trialing</span>
                    </div>

                    <div className="admin-kpi-card admin-kpi-expiring">
                        <span className="admin-kpi-label">Expiring Soon</span>
                        <span className="admin-kpi-val">{summary.expiringSoonTrials}</span>
                        <span className="admin-kpi-hint">≤ 7 days left on trial</span>
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div className="admin-controls">
                <div className="admin-search-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search name, email, company, or Stripe ID…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                    />
                    {searchQuery && (
                        <button className="admin-search-clear" onClick={() => setSearchQuery("")}>✕</button>
                    )}
                </div>

                <div className="admin-filter-tabs">
                    <button
                        className={`admin-filter-btn ${statusFilter === "all" ? "active" : ""}`}
                        onClick={() => setStatusFilter("all")}
                    >
                        All ({accounts.length})
                    </button>
                    <button
                        className={`admin-filter-btn ${statusFilter === "paying" ? "active" : ""}`}
                        onClick={() => setStatusFilter("paying")}
                    >
                        Paying ({summary?.payingSubscribers ?? 0})
                    </button>
                    <button
                        className={`admin-filter-btn ${statusFilter === "trialing" ? "active" : ""}`}
                        onClick={() => setStatusFilter("trialing")}
                    >
                        Trials ({summary?.activeTrials ?? 0})
                    </button>
                    <button
                        className={`admin-filter-btn ${statusFilter === "expiring" ? "active" : ""}`}
                        onClick={() => setStatusFilter("expiring")}
                    >
                        Expiring Soon ({summary?.expiringSoonTrials ?? 0})
                    </button>
                    <button
                        className={`admin-filter-btn ${statusFilter === "canceled" ? "active" : ""}`}
                        onClick={() => setStatusFilter("canceled")}
                    >
                        Expired/Canceled
                    </button>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="admin-table-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="app-loading-spinner" />
                        <p>Loading accounts and subscriptions…</p>
                    </div>
                ) : loadError ? (
                    <div className="admin-empty" style={{ padding: "3rem 2rem", textAlign: "center" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Cloud Function Deployment Needed</h3>
                        <p style={{ color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto 1.5rem auto", lineHeight: 1.5 }}>
                            The backend function <code>getAdminSubscriptions</code> needs to be deployed to Firebase to fetch live account and Stripe records.
                        </p>
                        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)", borderRadius: "8px", padding: "1rem", maxWidth: "520px", margin: "0 auto 1.5rem auto", textAlign: "left", fontFamily: "monospace", fontSize: "0.8125rem", color: "#34d399", overflowX: "auto" }}>
                            <div style={{ color: "#94a3b8", marginBottom: "0.25rem" }}># In your terminal, run:</div>
                            <div>firebase login --reauth</div>
                            <div style={{ marginTop: "0.25rem" }}>firebase deploy --only functions:getAdminSubscriptions,functions:adminUpdateSubscription</div>
                        </div>
                        <button className="admin-btn admin-btn-primary" onClick={() => loadData(true)}>
                            Retry Loading
                        </button>
                    </div>
                ) : filteredAccounts.length === 0 ? (
                    <div className="admin-empty">
                        <p>No accounts match the current filter or search criteria.</p>
                    </div>
                ) : (
                    <div className="admin-table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User & Company</th>
                                    <th>Plan & Status</th>
                                    <th>Trial / Billing</th>
                                    <th>Stripe Details</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAccounts.map((acc) => {
                                    const tierObj = TIER_INFO[acc.tier as Tier] || { name: acc.tier, color: "#8b92b3" };
                                    const createdDate = acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : "Unknown";

                                    return (
                                        <tr key={acc.companyId}>
                                            {/* User & Company */}
                                            <td>
                                                <div className="admin-user-cell">
                                                    <div className="admin-avatar">
                                                        {(acc.ownerName || acc.ownerEmail || "U")[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="admin-owner-name">{acc.ownerName || "Unnamed"}</div>
                                                        <div className="admin-owner-email">{acc.ownerEmail}</div>
                                                        <div className="admin-company-sub">
                                                            {acc.companyName} • <span className="admin-date">Joined {createdDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Plan & Status */}
                                            <td>
                                                <div className="admin-tier-cell">
                                                    <span
                                                        className="admin-tier-badge"
                                                        style={{ borderColor: tierObj.color, color: tierObj.color }}
                                                    >
                                                        {tierObj.name}
                                                    </span>
                                                    <span className={`admin-status-badge status-${acc.status}`}>
                                                        {acc.status}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Trial / Billing */}
                                            <td>
                                                {acc.status === "trialing" && (
                                                    <div className="admin-trial-cell">
                                                        {acc.isTrialExpired ? (
                                                            <span className="admin-trial-expired">Expired</span>
                                                        ) : (
                                                            <span className={`admin-trial-days ${(acc.daysLeftInTrial ?? 999) <= 7 ? "urgent" : ""}`}>
                                                                ⏳ {acc.daysLeftInTrial} days left
                                                            </span>
                                                        )}
                                                        {acc.trialEnd && (
                                                            <span className="admin-trial-date">
                                                                Ends: {new Date(acc.trialEnd).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {acc.status === "active" && acc.tier !== "bid" && (
                                                    <div className="admin-billing-cell">
                                                        <span className="admin-active-paying">💳 Active Paid</span>
                                                        {acc.currentPeriodEnd && (
                                                            <span className="admin-trial-date">
                                                                Renews: {new Date(acc.currentPeriodEnd).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {acc.status === "active" && acc.tier === "bid" && (
                                                    <span className="admin-free-badge">Free Tier</span>
                                                )}
                                                {acc.status === "canceled" && (
                                                    <span className="admin-trial-expired">Canceled</span>
                                                )}
                                            </td>

                                            {/* Stripe Details */}
                                            <td>
                                                {acc.stripeCustomerId ? (
                                                    <div className="admin-stripe-cell">
                                                        <a
                                                            href={acc.stripeCustomerUrl || `https://dashboard.stripe.com/customers/${acc.stripeCustomerId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="admin-stripe-link"
                                                            title="Open customer in Stripe Dashboard"
                                                        >
                                                            <span>Stripe Customer</span>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                                <polyline points="15 3 21 3 21 9" />
                                                                <line x1="10" y1="14" x2="21" y2="3" />
                                                            </svg>
                                                        </a>
                                                        {acc.stripeSubscriptionId && (
                                                            <a
                                                                href={acc.stripeSubscriptionUrl || `https://dashboard.stripe.com/subscriptions/${acc.stripeSubscriptionId}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="admin-stripe-sub-link"
                                                                title="Open subscription in Stripe Dashboard"
                                                            >
                                                                Sub ID: {acc.stripeSubscriptionId.slice(0, 14)}…
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="admin-no-stripe">No Stripe ID (No Card)</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div className="admin-actions-cell">
                                                    {acc.status === "trialing" && (
                                                        <button
                                                            className="admin-action-btn admin-action-extend"
                                                            onClick={() => handleExtendTrial(acc, 30)}
                                                            title="Extend trial by 30 days"
                                                        >
                                                            +30d Trial
                                                        </button>
                                                    )}
                                                    <button
                                                        className="admin-action-btn admin-action-edit"
                                                        onClick={() => {
                                                            setEditingAccount(acc);
                                                            setNewTier((acc.tier as Tier) || "bid_plus");
                                                            setNewStatus(acc.status || "trialing");
                                                        }}
                                                    >
                                                        Edit Plan
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Subscription Modal */}
            {editingAccount && (
                <div className="admin-modal-overlay" onClick={() => !updating && setEditingAccount(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Subscription: {editingAccount.companyName}</h3>
                        <p className="admin-modal-user">
                            {editingAccount.ownerName} ({editingAccount.ownerEmail})
                        </p>

                        <div className="admin-form-group">
                            <label>Plan Tier</label>
                            <select
                                value={newTier}
                                onChange={(e) => setNewTier(e.target.value as Tier)}
                                className="admin-select"
                            >
                                <option value="bid">Bid (Free)</option>
                                <option value="bid_plus">Bid Plus ($9/mo)</option>
                                <option value="grow">Grow ($39/mo)</option>
                                <option value="pro">Pro ($79/mo)</option>
                                <option value="business">Business ($119/mo)</option>
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label>Subscription Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="admin-select"
                            >
                                <option value="trialing">Trialing</option>
                                <option value="active">Active (Paid)</option>
                                <option value="past_due">Past Due</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>

                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn admin-btn-outline"
                                onClick={() => setEditingAccount(null)}
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={handleSaveAccount}
                                disabled={updating}
                            >
                                {updating ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

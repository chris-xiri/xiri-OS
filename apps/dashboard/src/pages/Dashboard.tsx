import { useState, useEffect, useCallback, useRef } from "react";
import { collection, onSnapshot, doc as firestoreDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TIER_INFO, getLimits } from "../lib/rbac";
import { usePendingBid } from "../hooks/usePendingBid";
import type { Bid } from "./Bids";
import "./Dashboard.css";

/* ─── Helpers ─── */
const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function Dashboard() {
    const { profile, subscription } = useAuth();
    const navigate = useNavigate();
    const tierInfo = TIER_INFO[subscription.tier];
    const limits = getLimits(subscription.tier);
    const freeLimits = getLimits("bid");
    const contactLimit = limits.contacts === -1 ? "∞" : limits.contacts;
    const isTrial = subscription.status === "trialing";

    // Auto-create pending bid from public calculator after signup
    usePendingBid();

    const companyId = profile?.companyId;

    const [contactCount, setContactCount] = useState(0);
    const [bidCount, setBidCount] = useState(0);
    const [proposalCount, setProposalCount] = useState(0);
    const [downloadedCount, setDownloadedCount] = useState(0);
    const [referenceCount, setReferenceCount] = useState(0);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [allBids, setAllBids] = useState<Bid[]>([]);
    const [contactNames, setContactNames] = useState<Record<string, string>>({});
    const [checklistDismissed, setChecklistDismissed] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loadingSample, setLoadingSample] = useState(false);
    const prevAllDoneRef = useRef(false);

    // 1-Click Sample Bid Creator for Instant Activation
    const handleCreateSampleBid = async () => {
        if (!companyId || loadingSample) return;
        setLoadingSample(true);
        try {
            const contactRef = await addDoc(collection(db, "companies", companyId, "contacts"), {
                name: "Sarah Jenkins",
                company: "Summit Plaza Offices",
                email: "sjenkins@summitplaza.com",
                phone: "(555) 234-5678",
                type: "prospect",
                address: "450 Corporate Blvd, Suite 200",
                notes: "Interested in 5x/week evening janitorial for 12,500 sqft facility.",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            const sampleBidData = {
                name: "Summit Plaza Offices — Night Janitorial",
                contactId: contactRef.id,
                status: "draft",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                calculatorInputs: {
                    buildingTypeId: "office",
                    sqft: 12500,
                    frequency: "5",
                    wageRate: 18.00,
                    payrollTaxPercent: 15,
                    overheadPercent: 12,
                    profitPercent: 20,
                    supplyCostPerSqft: 0.0017,
                    supplyPolicy: "contractor",
                },
                results: {
                    totalPricePerMonth: 2185.00,
                    pricePerVisit: 100.85,
                    totalHoursPerMonth: 65.5,
                    hoursPerVisit: 3.02,
                    laborCostPerMonth: 1355.85,
                    supplyCostPerMonth: 106.25,
                    overheadAmount: 286.20,
                    profitAmount: 437.00,
                    marginPercent: 20,
                    buildingType: {
                        id: "office",
                        name: "Office Building",
                        icon: "🏢",
                        productionRate: 4200,
                        complexityMultiplier: 1,
                    },
                },
                rooms: [
                    { id: "room-1", roomTypeId: "lobby", sqft: 1500, tasks: ["trash", "dust", "mop", "glass-entry"] },
                    { id: "room-2", roomTypeId: "restrooms", sqft: 1200, tasks: ["restroom-clean", "restroom-restock", "mop", "trash"] },
                    { id: "room-3", roomTypeId: "hallways", sqft: 2800, tasks: ["vacuum", "mop", "trash"] },
                    { id: "room-4", roomTypeId: "common", sqft: 7000, tasks: ["trash", "dust", "wipe", "vacuum"] },
                ],
                version: 1,
            };

            const bidDocRef = await addDoc(collection(db, "companies", companyId, "bids"), sampleBidData);
            navigate(`/bids/${bidDocRef.id}`);
        } catch (err) {
            console.error("Failed to create sample bid:", err);
        } finally {
            setLoadingSample(false);
        }
    };

    // Real-time contact count
    useEffect(() => {
        if (!companyId) return;
        const unsub = onSnapshot(collection(db, "companies", companyId, "contacts"), (snap) => {
            setContactCount(snap.size);
            const names: Record<string, string> = {};
            snap.docs.forEach((d) => {
                const data = d.data();
                names[d.id] = data.company || data.name || "Unknown";
            });
            setContactNames(names);
        });
        return unsub;
    }, [companyId]);

    // Real-time company name (for checklist)
    useEffect(() => {
        if (!companyId) return;
        return onSnapshot(firestoreDoc(db, "companies", companyId), (snap) => {
            if (snap.exists()) {
                const d = snap.data();
                setCompanyName(d.name || null);
                if (d.checklistDismissed) setChecklistDismissed(true);
            }
        });
    }, [companyId]);

    // Real-time bid data
    useEffect(() => {
        if (!companyId) return;
        const unsub = onSnapshot(collection(db, "companies", companyId, "bids"), (snap) => {
            const bids = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bid));
            setAllBids(bids);
            setBidCount(snap.size);
            let sent = 0;
            let downloaded = 0;
            snap.forEach((d) => {
                const data = d.data();
                if (data.status === "sent" || data.status === "won" || data.status === "lost") {
                    sent++;
                }
                if (data.proposalDownloadedAt) {
                    downloaded++;
                }
            });
            setProposalCount(sent);
            setDownloadedCount(downloaded);
        });
        return unsub;
    }, [companyId]);

    // Real-time reference count
    useEffect(() => {
        if (!companyId) return;
        return onSnapshot(collection(db, "companies", companyId, "references"), (snap) => {
            setReferenceCount(snap.size);
        });
    }, [companyId]);

    // Calculate win rate
    const wonBids = allBids.filter((b) => b.status === "won").length;
    const winRate = proposalCount > 0 ? Math.round((wonBids / proposalCount) * 100) : null;

    // Getting Started checklist — prioritized for immediate activation & first bid
    const autoGenName = profile?.displayName ? `${profile.displayName}'s Company` : null;
    const hasCompanyInfo = !!companyName && companyName !== autoGenName;
    const isBidTier = subscription.tier === "bid";
    const checklist = [
        { label: "Create your account", done: true, path: "" },
        { label: "Create your first bid (2 mins)", done: bidCount > 0, path: "/bids/new" },
        { label: isBidTier ? "Download your first proposal" : "Send your first proposal", done: isBidTier ? downloadedCount > 0 : proposalCount > 0, path: "/bids" },
        { label: "Set up company info & branding", done: hasCompanyInfo, path: "/company" },
        { label: "Add client contacts", done: contactCount > 0, path: "/contacts?add=true" },
        { label: "Add customer references", done: referenceCount > 0, path: "/references" },
    ];
    const checklistDone = checklist.filter((c) => c.done).length;
    const allChecklistDone = checklistDone === checklist.length;

    // Confetti when all items complete
    useEffect(() => {
        if (allChecklistDone && !prevAllDoneRef.current && !checklistDismissed) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
        prevAllDoneRef.current = allChecklistDone;
    }, [allChecklistDone, checklistDismissed]);

    const dismissChecklist = useCallback(async () => {
        setChecklistDismissed(true);
        if (companyId) {
            await updateDoc(firestoreDoc(db, "companies", companyId), { checklistDismissed: true });
        }
    }, [companyId]);

    // Draft bids (up to 5, most recent first)
    const draftBids = allBids
        .filter((b) => b.status === "draft")
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="dashboard">
            {/* Confetti celebration */}
            {showConfetti && (
                <div className="dash-confetti">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <span
                            key={i}
                            className="dash-confetti-emoji"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                fontSize: `${16 + Math.random() * 20}px`,
                            }}
                        >
                            {["🎉", "🎊", "✨", "🥳", "🎈", "⭐"][Math.floor(Math.random() * 6)]}
                        </span>
                    ))}
                </div>
            )}
            {/* Welcome */}
            <div className="dash-welcome">
                <div>
                    <h1>
                        Welcome back, <span className="dash-name">{profile?.displayName || "there"}</span>
                    </h1>
                    <p className="dash-subtitle">Here's how your business is doing today.</p>
                </div>
                <div className="dash-tier-badge" style={{ borderColor: tierInfo.color + "40", background: tierInfo.color + "0a" }}>
                    <span className="dash-tier-dot" style={{ background: tierInfo.color }} />
                    {tierInfo.name} Plan
                </div>
            </div>

            {/* Zero-Bids Activation Hero */}
            {bidCount === 0 && (
                <div className="dash-activation-card">
                    <div className="dash-activation-badge">⚡ READY IN 2 MINUTES</div>
                    <h2>Win your next commercial cleaning contract</h2>
                    <p>
                        Calculate accurate labor hours, supply costs, and profit using standard ISSA 612 production rates—then generate a branded PDF proposal ready to send.
                    </p>
                    <div className="dash-activation-actions">
                        <button className="dash-activation-btn-primary" onClick={() => navigate("/bids/new")}>
                            <span>Create Your First Bid →</span>
                        </button>
                        <button className="dash-activation-btn-secondary" onClick={handleCreateSampleBid} disabled={loadingSample}>
                            {loadingSample ? "Loading demo…" : "✨ Load Sample 12.5k sqft Bid"}
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="dash-grid">
                <div className="dash-card dash-card-link" onClick={() => navigate("/bids")}>
                    <div className="dash-card-header">
                        <span className="dash-card-label">Active Bids</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <div className="dash-card-value">{bidCount}</div>
                    <div className="dash-card-sub">
                        {isTrial && bidCount > freeLimits.bids ? (
                            <span style={{ color: "#f59e0b", fontWeight: 600 }}>{bidCount}/{freeLimits.bids} — over free limit</span>
                        ) : (
                            "Unlimited on your plan"
                        )}
                    </div>
                </div>

                <div className="dash-card dash-card-link" onClick={() => navigate("/contacts")}>
                    <div className="dash-card-header">
                        <span className="dash-card-label">Contacts</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="dash-card-value">{contactCount} <span className="dash-card-limit">/ {contactLimit}</span></div>
                    <div className="dash-card-sub">
                        {isTrial && contactCount > freeLimits.contacts ? (
                            <span style={{ color: "#f59e0b", fontWeight: 600 }}>{contactCount}/{freeLimits.contacts} — over free limit</span>
                        ) : (
                            limits.contacts === -1 ? "Unlimited contacts" : `${limits.contacts} contact limit`
                        )}
                    </div>
                </div>

                <div className="dash-card dash-card-link" onClick={() => navigate("/bids?filter=sent")}>
                    <div className="dash-card-header">
                        <span className="dash-card-label">Bids Sent</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    </div>
                    <div className="dash-card-value">{proposalCount}</div>
                    <div className="dash-card-sub">All-time sent bids</div>
                </div>

                <div className="dash-card dash-card-link" onClick={() => navigate("/bids?filter=won")}>
                    <div className="dash-card-header">
                        <span className="dash-card-label">Win Rate</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                        </svg>
                    </div>
                    <div className="dash-card-value">{winRate !== null ? `${winRate}%` : "—"}</div>
                    <div className="dash-card-sub">{winRate !== null ? "Based on sent bids" : "Start bidding to track"}</div>
                </div>
            </div>

            {/* Founder Direct Text Concierge Card */}
            <div className="dash-concierge-card">
                <div className="dash-concierge-avatar">
                    <span>💬</span>
                </div>
                <div className="dash-concierge-content">
                    <div className="dash-concierge-tag">FOUNDER WALKTHROUGH CONCIERGE</div>
                    <h3>Have a walkthrough or bid question? Text Chris directly</h3>
                    <p>
                        Bidding on an upcoming building or not sure what production rate to use? Text me directly at <a href="sms:+15163990350" className="dash-phone-link"><strong>(516) 399-0350</strong></a> with the square footage or notes and I will help you model your pricing.
                    </p>
                </div>
                <a href="sms:+15163990350" className="dash-concierge-btn">
                    <span>Text (516) 399-0350</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </a>
            </div>

            {/* Quick actions */}
            <div className="dash-section">
                <h2>Quick Actions</h2>
                <div className="dash-actions">
                    <div className="dash-action" onClick={() => navigate("/bids/new")}>
                        <div className="dash-action-icon" style={{ background: "rgba(0, 212, 170, 0.1)" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </div>
                        <div>
                            <div className="dash-action-title">Create New Bid</div>
                            <div className="dash-action-desc">Calculate and send a professional bid</div>
                        </div>
                    </div>
                    <div className="dash-action" onClick={() => navigate("/contacts?add=true")}>
                        <div className="dash-action-icon" style={{ background: "rgba(99, 102, 241, 0.1)" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                        </div>
                        <div>
                            <div className="dash-action-title">Add Contact</div>
                            <div className="dash-action-desc">Add a prospect or client ({limits.contacts === -1 ? "unlimited" : `${contactLimit} max`})</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Getting Started Checklist */}
            {!checklistDismissed && (
                <div className="dash-section">
                    <div className="dash-checklist-header">
                        <h2>{allChecklistDone ? "🎉 All Done!" : "Getting Started"}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span className="dash-checklist-progress-label">{checklistDone} of {checklist.length}</span>
                            {allChecklistDone && (
                                <button className="dash-dismiss-btn" onClick={dismissChecklist}>
                                    Dismiss ✕
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="dash-checklist-bar">
                        <div className="dash-checklist-bar-fill" style={{ width: `${(checklistDone / checklist.length) * 100}%`, background: allChecklistDone ? "#10b981" : undefined }} />
                    </div>
                    <div className="dash-checklist-items">
                        {checklist.map((item, i) => (
                            <div
                                key={i}
                                className={`dash-checklist-item ${item.done ? "done" : ""} ${!item.done && item.path ? "clickable" : ""}`}
                                onClick={() => !item.done && item.path && navigate(item.path)}
                            >
                                <div className={`dash-check-icon ${item.done ? "checked" : ""}`}>
                                    {item.done ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <span className="dash-check-number">{i + 1}</span>
                                    )}
                                </div>
                                <span className="dash-checklist-label">{item.label}</span>
                                {!item.done && item.path && (
                                    <svg className="dash-checklist-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )
            }

            {/* Draft Bids Needing Attention */}
            {
                draftBids.length > 0 && (
                    <div className="dash-section">
                        <div className="dash-drafts-header">
                            <h2>Draft Bids</h2>
                            <span className="dash-drafts-count">{draftBids.length} need{draftBids.length === 1 ? "s" : ""} attention</span>
                        </div>
                        <div className="dash-drafts-list">
                            {draftBids.map((bid) => (
                                <div key={bid.id} className="dash-draft-row" onClick={() => navigate(`/bids/${bid.id}`)}>
                                    <div className="dash-draft-left">
                                        <span className="dash-draft-icon">📝</span>
                                        <div>
                                            <div className="dash-draft-name">{bid.name}</div>
                                            <div className="dash-draft-client">{contactNames[bid.contactId] || "Unlinked"}</div>
                                        </div>
                                    </div>
                                    <div className="dash-draft-right">
                                        <span className="dash-draft-price">{fmt(bid.results?.totalPricePerMonth || 0)}/mo</span>
                                        <span className="dash-draft-time">{timeAgo(bid.updatedAt || bid.createdAt)}</span>
                                        <span className="dash-draft-continue">Continue →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
}


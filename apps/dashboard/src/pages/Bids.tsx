import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isOverLimit, getLimits, TIER_INFO, getUpgradeTier } from "../lib/rbac";
import type { CalculatorResults, CalculatorInputs, RoomScope } from "../lib/calculator";
import "./Bids.css";

export interface ProposalTerms {
    legalName: string;
    employeeStatus: string;
    supervisionApproach: string;
    companyPhilosophy: string;
    cancellationPolicy: string;
    serviceGuarantee: string;
    lateFeePolicy: string;
    equipmentDescription: string;
    specialServices: string;
    suppliesPolicy: string;
    suppliesWeProvide: string;
    suppliesCustomerProvides: string;
    contractTerm: string;
    additionalTerms: string;
    bonded: boolean;
    bondAmount: string;
    uniformedPersonnel: boolean;
}

export interface Bid {
    id: string;
    contactId: string;
    name: string;
    status: "draft" | "sent" | "won" | "lost";
    calculatorInputs: CalculatorInputs;
    selectedTasks: string[];
    state: string;
    results: CalculatorResults;
    createdAt: string;
    updatedAt: string;
    version?: number;
    proposalTerms?: ProposalTerms;
    roomScopes?: RoomScope[];
    priceOverride?: number | null;
}

const STATUS_COLORS: Record<string, string> = {
    draft: "#8b92b3",
    sent: "#6366f1",
    won: "#10b981",
    lost: "#f87171",
};

const STATUS_ICONS: Record<string, string> = {
    draft: "📝",
    sent: "📤",
    won: "✅",
    lost: "❌",
};

const STATUS_OPTIONS: Bid["status"][] = ["draft", "sent", "won", "lost"];

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "sent", label: "Sent" },
    { key: "won", label: "Won" },
    { key: "lost", label: "Lost" },
];

interface ClientGroup {
    clientName: string;
    contactId: string;
    bids: Bid[];                 // sorted newest first
    latestBid: Bid;
    bestStatus: Bid["status"];   // won > sent > draft > lost priority
}

const STATUS_PRIORITY: Record<Bid["status"], number> = {
    won: 4,
    sent: 3,
    draft: 2,
    lost: 1,
};

export default function Bids() {
    const { profile, subscription } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactNames, setContactNames] = useState<Record<string, string>>({});
    const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
    const activeFilter = searchParams.get("filter") || "all";

    const limits = getLimits(subscription.tier);
    const tierInfo = TIER_INFO[subscription.tier];
    const atLimit = isOverLimit(subscription.tier, "bids", bids.length);
    const upgradeTier = getUpgradeTier(subscription.tier);

    const filteredBids = useMemo(() => {
        if (activeFilter === "all") return bids;
        return bids.filter((b) => b.status === activeFilter);
    }, [bids, activeFilter]);

    // Group bids by client (contactId), sorted newest first within each group
    const clientGroups = useMemo((): ClientGroup[] => {
        const groupMap = new Map<string, Bid[]>();

        for (const bid of filteredBids) {
            const key = bid.contactId || "_unlinked";
            if (!groupMap.has(key)) groupMap.set(key, []);
            groupMap.get(key)!.push(bid);
        }

        const groups: ClientGroup[] = [];
        for (const [contactId, clientBids] of groupMap) {
            // Sort newest first (by updatedAt, then createdAt)
            clientBids.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                return dateB - dateA;
            });

            const latestBid = clientBids[0];

            // Best status across all versions
            let bestStatus = clientBids[0].status;
            for (const b of clientBids) {
                if (STATUS_PRIORITY[b.status] > STATUS_PRIORITY[bestStatus]) {
                    bestStatus = b.status;
                }
            }

            groups.push({
                clientName: contactId === "_unlinked"
                    ? "Unlinked Bids"
                    : contactNames[contactId] || "Unknown Client",
                contactId,
                bids: clientBids,
                latestBid,
                bestStatus,
            });
        }

        // Sort groups: won first, then by latest bid date
        groups.sort((a, b) => {
            // Won groups float to top, lost sink to bottom
            if (a.bestStatus !== b.bestStatus) {
                return STATUS_PRIORITY[b.bestStatus] - STATUS_PRIORITY[a.bestStatus];
            }
            const dateA = new Date(a.latestBid.updatedAt || a.latestBid.createdAt).getTime();
            const dateB = new Date(b.latestBid.updatedAt || b.latestBid.createdAt).getTime();
            return dateB - dateA;
        });

        return groups;
    }, [filteredBids, contactNames]);

    const handleFilterChange = (filter: string) => {
        if (filter === "all") {
            setSearchParams({});
        } else {
            setSearchParams({ filter });
        }
    };

    const toggleClient = (contactId: string) => {
        setExpandedClients((prev) => {
            const next = new Set(prev);
            if (next.has(contactId)) {
                next.delete(contactId);
            } else {
                next.add(contactId);
            }
            return next;
        });
    };

    const companyId = profile?.companyId;

    // Real-time listener on bids
    useEffect(() => {
        if (!companyId) return;
        const q = query(collection(db, "companies", companyId, "bids"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snap) => {
            setBids(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bid)));
            setLoading(false);
        });
    }, [companyId]);

    // Fetch contact names for display
    useEffect(() => {
        if (!companyId) return;
        return onSnapshot(collection(db, "companies", companyId, "contacts"), (snap) => {
            const names: Record<string, string> = {};
            snap.docs.forEach((d) => {
                const data = d.data();
                names[d.id] = data.company || data.name || "Unknown";
            });
            setContactNames(names);
        });
    }, [companyId]);

    const handleStatusChange = async (bidId: string, status: Bid["status"]) => {
        if (!companyId) return;
        await updateDoc(doc(db, "companies", companyId, "bids", bidId), {
            status,
            updatedAt: new Date().toISOString(),
        });
    };

    const handleDelete = async (bidId: string) => {
        if (!companyId) return;
        setConfirmModal({
            message: "Delete this bid? This cannot be undone.",
            onConfirm: async () => {
                await deleteDoc(doc(db, "companies", companyId, "bids", bidId));
                setSelected((prev) => { const next = new Set(prev); next.delete(bidId); return next; });
                setConfirmModal(null);
            },
        });
    };

    // Batch selection helpers
    const toggleSelect = (bidId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(bidId)) next.delete(bidId);
            else next.add(bidId);
            return next;
        });
    };

    const allFilteredIds = filteredBids.map((b) => b.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(allFilteredIds));
        }
    };

    const handleBatchDelete = async () => {
        if (!companyId || selected.size === 0) return;
        const count = selected.size;
        setConfirmModal({
            message: `Delete ${count} bid${count !== 1 ? "s" : ""}? This cannot be undone.`,
            onConfirm: async () => {
                setConfirmModal(null);
                setDeleting(true);
                try {
                    const batch = writeBatch(db);
                    for (const bidId of selected) {
                        batch.delete(doc(db, "companies", companyId, "bids", bidId));
                    }
                    await batch.commit();
                    setSelected(new Set());
                } catch (err) {
                    console.error("Batch delete failed:", err);
                } finally {
                    setDeleting(false);
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="bids-page">
                <div className="app-loading" style={{ minHeight: 200 }}>
                    <div className="app-loading-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="bids-page">
            <div className="bids-header">
                <div>
                    <h1>Bids</h1>
                    <p className="bids-subtitle">
                        Create and manage your cleaning bids
                        {limits.bids !== -1 ? (
                            <span className="bids-counter" style={{ color: atLimit ? "#f87171" : tierInfo.color }}>
                                {" "}· {bids.length} / {limits.bids} bids
                            </span>
                        ) : (
                            bids.length > 0 && <span className="bids-count"> · {bids.length} bid{bids.length !== 1 ? "s" : ""}</span>
                        )}
                    </p>
                </div>
                <button
                    className={`bids-create-btn ${atLimit ? "at-limit" : ""}`}
                    disabled={atLimit}
                    onClick={() => navigate("/bids/new")}
                    style={{ cursor: atLimit ? "not-allowed" : "pointer" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Bid
                </button>
            </div>

            {/* Limit warning */}
            {atLimit && upgradeTier && (
                <div className="bids-limit-banner">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>
                        You've reached the {limits.bids}-bid limit on the {tierInfo.name} plan.{" "}
                        <a href="/settings" onClick={(e) => { e.preventDefault(); navigate("/settings"); }}>
                            Upgrade to {TIER_INFO[upgradeTier].name} →
                        </a>
                    </span>
                </div>
            )}

            {/* Filter tabs */}
            {bids.length > 0 && (
                <div className="bids-filter-tabs">
                    {FILTER_TABS.map((tab) => {
                        const count = tab.key === "all" ? bids.length : bids.filter((b) => b.status === tab.key).length;
                        return (
                            <button
                                key={tab.key}
                                className={`bids-filter-tab ${activeFilter === tab.key ? "active" : ""}`}
                                onClick={() => handleFilterChange(tab.key)}
                            >
                                {tab.label}
                                <span className="bids-filter-count">{count}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {bids.length === 0 ? (
                <div className="bids-empty">
                    <div className="bids-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555d7e" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="12" x2="12" y2="18" /><line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h3>No bids yet</h3>
                    <p>Use the bid calculator to create accurate cleaning bids based on ISSA 612 production rates.</p>
                    <button className="bids-empty-cta" onClick={() => navigate("/bids/new")} style={{ cursor: "pointer" }}>
                        Open Bid Calculator
                    </button>
                </div>
            ) : (
                <div className="bids-groups">
                    {clientGroups.map((group) => {
                        const isExpanded = expandedClients.has(group.contactId);
                        const hasMultiple = group.bids.length > 1;

                        return (
                            <div key={group.contactId} className={`bids-group ${isExpanded ? "expanded" : ""}`}>
                                {/* Group header — client row */}
                                <div
                                    className="bids-group-header"
                                    onClick={() => hasMultiple ? toggleClient(group.contactId) : navigate(`/bids/${group.latestBid.id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="bids-group-left">
                                        <input
                                            type="checkbox"
                                            className="bids-checkbox"
                                            checked={group.bids.every((b) => selected.has(b.id))}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setSelected((prev) => {
                                                    const next = new Set(prev);
                                                    const allChecked = group.bids.every((b) => next.has(b.id));
                                                    group.bids.forEach((b) => allChecked ? next.delete(b.id) : next.add(b.id));
                                                    return next;
                                                });
                                            }}
                                        />
                                        {hasMultiple && (
                                            <span className={`bids-chevron ${isExpanded ? "open" : ""}`}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </span>
                                        )}
                                        {!hasMultiple && <span className="bids-chevron-spacer" />}

                                        <div className="bids-group-info">
                                            <span className="bids-group-client">{group.clientName}</span>
                                            <span className="bids-group-meta">
                                                {group.bids.length} bid{group.bids.length !== 1 ? "s" : ""}
                                                {" · "}
                                                Latest: {group.latestBid.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bids-group-right">
                                        <span className="bids-group-price">{fmt(group.latestBid.results?.totalPricePerMonth || 0)}</span>
                                        <span className="bids-group-sqft">
                                            {group.latestBid.calculatorInputs?.sqft?.toLocaleString() || "—"} sqft
                                        </span>
                                        <span
                                            className="bids-status-badge"
                                            style={{
                                                color: STATUS_COLORS[group.bestStatus],
                                                borderColor: STATUS_COLORS[group.bestStatus] + "40",
                                                background: STATUS_COLORS[group.bestStatus] + "10",
                                            }}
                                        >
                                            {STATUS_ICONS[group.bestStatus]} {group.bestStatus.charAt(0).toUpperCase() + group.bestStatus.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded bid rows */}
                                {isExpanded && hasMultiple && (
                                    <div className="bids-group-children">
                                        {group.bids.map((bid) => (
                                            <div
                                                key={bid.id}
                                                className="bids-child-row"
                                                onClick={() => navigate(`/bids/${bid.id}`)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="bids-child-left">
                                                    <input
                                                        type="checkbox"
                                                        className="bids-checkbox"
                                                        checked={selected.has(bid.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => toggleSelect(bid.id, e as unknown as React.MouseEvent)}
                                                    />
                                                    <span className="bids-child-name">{bid.name}</span>
                                                    {bid.version && <span className="bids-child-version">v{bid.version}</span>}
                                                </div>
                                                <div className="bids-child-right">
                                                    <span className="bids-child-price">{fmt(bid.results?.totalPricePerMonth || 0)}</span>
                                                    <span
                                                        className="bids-status-badge bids-status-badge-sm"
                                                        style={{
                                                            color: STATUS_COLORS[bid.status],
                                                            borderColor: STATUS_COLORS[bid.status] + "40",
                                                            background: STATUS_COLORS[bid.status] + "10",
                                                        }}
                                                    >
                                                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                                    </span>
                                                    <span className="bids-child-date">
                                                        {new Date(bid.updatedAt || bid.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <select
                                                        className="bids-status-select"
                                                        value={bid.status}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(bid.id, e.target.value as Bid["status"]);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            color: STATUS_COLORS[bid.status],
                                                            borderColor: STATUS_COLORS[bid.status] + "40",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        {STATUS_OPTIONS.map((s) => (
                                                            <option key={s} value={s}>
                                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="bids-delete-btn"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(bid.id); }}
                                                        title="Delete bid"
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Single bid — show inline actions on the group header */}
                                {!hasMultiple && (
                                    <div className="bids-group-actions">
                                        <select
                                            className="bids-status-select"
                                            value={group.latestBid.status}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleStatusChange(group.latestBid.id, e.target.value as Bid["status"]);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                color: STATUS_COLORS[group.latestBid.status],
                                                borderColor: STATUS_COLORS[group.latestBid.status] + "40",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s} value={s}>
                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            className="bids-delete-btn bids-delete-visible"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(group.latestBid.id); }}
                                            title="Delete bid"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Floating batch action bar */}
            {selected.size > 0 && (
                <div className="bids-batch-bar">
                    <div className="bids-batch-left">
                        <input
                            type="checkbox"
                            className="bids-checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                        />
                        <span className="bids-batch-count">{selected.size} selected</span>
                    </div>
                    <div className="bids-batch-actions">
                        <button className="bids-batch-cancel" onClick={() => setSelected(new Set())}>
                            Cancel
                        </button>
                        <button className="bids-batch-delete" onClick={handleBatchDelete} disabled={deleting}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            {deleting ? "Deleting…" : `Delete ${selected.size}`}
                        </button>
                    </div>
                </div>
            )}
            {/* Confirmation modal */}
            {confirmModal && (
                <div className="bids-confirm-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="bids-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bids-confirm-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </div>
                        <p className="bids-confirm-message">{confirmModal.message}</p>
                        <div className="bids-confirm-actions">
                            <button className="bids-confirm-cancel" onClick={() => setConfirmModal(null)}>Cancel</button>
                            <button className="bids-confirm-delete" onClick={confirmModal.onConfirm}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

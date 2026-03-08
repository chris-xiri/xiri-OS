import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { isOverLimit, getLimits, TIER_INFO, getUpgradeTier } from "../lib/rbac";
import AddressAutocomplete, { type StructuredAddress } from "../components/AddressAutocomplete";
import "./Contacts.css";

export interface Contact {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    type: "prospect" | "client" | "lead";
    notes: string;
    createdAt: string;
    updatedAt: string;
}

const TYPE_COLORS: Record<string, string> = {
    prospect: "#6366f1",
    client: "#10b981",
    lead: "#f59e0b",
};

type SortKey = "name" | "company" | "email" | "phone" | "city" | "type" | "createdAt";
type SortDir = "asc" | "desc";

type ColumnId = "name" | "company" | "email" | "phone" | "city" | "type";

const ALL_COLUMNS: { id: ColumnId; label: string; defaultWidth: number }[] = [
    { id: "name", label: "Name", defaultWidth: 180 },
    { id: "company", label: "Company", defaultWidth: 160 },
    { id: "email", label: "Email", defaultWidth: 200 },
    { id: "phone", label: "Phone", defaultWidth: 140 },
    { id: "city", label: "City", defaultWidth: 150 },
    { id: "type", label: "Type", defaultWidth: 100 },
];

const COL_WIDTHS_KEY = "xiri_contacts_col_widths";

function loadColWidths(): Record<ColumnId, number> {
    try {
        const raw = localStorage.getItem(COL_WIDTHS_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return Object.fromEntries(ALL_COLUMNS.map((c) => [c.id, c.defaultWidth])) as Record<ColumnId, number>;
}

function saveColWidths(widths: Record<ColumnId, number>) {
    localStorage.setItem(COL_WIDTHS_KEY, JSON.stringify(widths));
}

const STORAGE_KEY = "xiri_contacts_columns";

function loadColumnVisibility(): Set<ColumnId> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const arr = JSON.parse(raw) as ColumnId[];
            return new Set(arr);
        }
    } catch { /* ignore */ }
    return new Set(ALL_COLUMNS.map((c) => c.id));
}

function saveColumnVisibility(visible: Set<ColumnId>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visible]));
}

/* ─── Add/Edit Contact Modal ─── */
function ContactModal({
    contact,
    onSave,
    onClose,
}: {
    contact: Partial<Contact> | null;
    onSave: (data: Omit<Contact, "id" | "createdAt" | "updatedAt">) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState({
        name: contact?.name || "",
        company: contact?.company || "",
        email: contact?.email || "",
        phone: contact?.phone || "",
        address: contact?.address || "",
        city: contact?.city || "",
        state: contact?.state || "",
        zip: contact?.zip || "",
        type: (contact?.type || "prospect") as Contact["type"],
        notes: contact?.notes || "",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.company.trim()) return;
        setSaving(true);
        try {
            await onSave(form);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{contact?.id ? "Edit Contact" : "Add Contact"}</h2>
                    <button className="modal-close" onClick={onClose} style={{ cursor: "pointer" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="John Smith"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Company Name *</label>
                            <input
                                type="text"
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                                placeholder="ABC Properties"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="john@abcproperties.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/^\+1\s*/, "").replace(/^1\s*/, "");
                                    const digits = raw.replace(/\D/g, "").slice(0, 10);
                                    let formatted = "";
                                    if (digits.length === 0) {
                                        formatted = "";
                                    } else if (digits.length <= 3) {
                                        formatted = `(${digits}`;
                                    } else if (digits.length <= 6) {
                                        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                                    } else {
                                        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
                                    }
                                    setForm({ ...form, phone: formatted });
                                }}
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    </div>
                    <AddressAutocomplete
                        value={{ address: form.address, city: form.city, state: form.state, zip: form.zip }}
                        onChange={(addr: StructuredAddress) => setForm(prev => ({ ...prev, ...addr }))}
                    />
                    <div className="form-group">
                        <label>Type</label>
                        <div className="form-type-select">
                            {(["prospect", "client", "lead"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`form-type-btn ${form.type === t ? "active" : ""}`}
                                    style={{
                                        cursor: "pointer",
                                        borderColor: form.type === t ? TYPE_COLORS[t] : undefined,
                                        color: form.type === t ? TYPE_COLORS[t] : undefined,
                                    }}
                                    onClick={() => setForm({ ...form, type: t })}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Add any notes about this contact..."
                            rows={3}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose} style={{ cursor: "pointer" }}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn modal-btn-save" disabled={saving} style={{ cursor: "pointer" }}>
                            {saving ? "Saving..." : contact?.id ? "Update Contact" : "Add Contact"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Bulk Update Type Modal ─── */
function BulkTypeModal({
    count,
    onUpdate,
    onClose,
}: {
    count: number;
    onUpdate: (type: Contact["type"]) => void;
    onClose: () => void;
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380, textAlign: "center" }}>
                <div style={{ padding: "2rem 1.5rem" }}>
                    <h3 style={{ color: "#e8eaf0", fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Update {count} Contact{count > 1 ? "s" : ""}
                    </h3>
                    <p style={{ color: "#8b92b3", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>
                        Set the type for the selected contacts:
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                        {(["prospect", "client", "lead"] as const).map((t) => (
                            <button
                                key={t}
                                className="modal-btn"
                                onClick={() => onUpdate(t)}
                                style={{
                                    cursor: "pointer",
                                    background: TYPE_COLORS[t] + "18",
                                    color: TYPE_COLORS[t],
                                    border: `1px solid ${TYPE_COLORS[t]}30`,
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button
                        className="modal-btn modal-btn-cancel"
                        onClick={onClose}
                        style={{ cursor: "pointer", marginTop: "1rem" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Sort Header ─── */
function SortHeader({
    label,
    field,
    sortKey,
    sortDir,
    onSort,
    width,
    onResizeStart,
}: {
    label: string;
    field: SortKey;
    sortKey: SortKey;
    sortDir: SortDir;
    onSort: (key: SortKey) => void;
    width?: number;
    onResizeStart?: (e: React.MouseEvent) => void;
}) {
    const isActive = sortKey === field;
    return (
        <th
            onClick={() => onSort(field)}
            className="crm-th-sortable"
            style={width ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
        >
            <span>{label}</span>
            <span className={`crm-sort-icon ${isActive ? "active" : ""}`}>
                {isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
            </span>
            {onResizeStart && (
                <span
                    className="crm-resize-handle"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onResizeStart(e);
                    }}
                />
            )}
        </th>
    );
}

/* ─── Contact Drawer ─── */
function ContactDrawer({
    contact,
    onSave,
    onDelete,
    onClose,
}: {
    contact: Contact;
    onSave: (data: Omit<Contact, "id" | "createdAt" | "updatedAt">) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState({
        name: contact.name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zip: contact.zip,
        type: contact.type as Contact["type"],
        notes: contact.notes,
    });
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const update = (patch: Partial<typeof form>) => {
        setForm((prev) => ({ ...prev, ...patch }));
        setDirty(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.company.trim()) return;
        setSaving(true);
        try {
            await onSave(form);
            setDirty(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <aside className="drawer">
                <div className="drawer-header">
                    <div className="drawer-avatar-lg">{contact.name[0]?.toUpperCase()}</div>
                    <div>
                        <h2 className="drawer-name">{contact.name}</h2>
                        <span className="drawer-company">{contact.company}</span>
                    </div>
                    <button className="drawer-close" onClick={onClose} style={{ cursor: "pointer" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="drawer-body">
                    <div className="drawer-section">
                        <label>Name</label>
                        <input value={form.name} onChange={(e) => update({ name: e.target.value })} />
                    </div>
                    <div className="drawer-section">
                        <label>Company</label>
                        <input value={form.company} onChange={(e) => update({ company: e.target.value })} />
                    </div>
                    <div className="drawer-row">
                        <div className="drawer-section">
                            <label>Email</label>
                            <input type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} />
                        </div>
                        <div className="drawer-section">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/^\+1\s*/, "").replace(/^1\s*/, "");
                                    const digits = raw.replace(/\D/g, "").slice(0, 10);
                                    let formatted = "";
                                    if (digits.length === 0) formatted = "";
                                    else if (digits.length <= 3) formatted = `(${digits}`;
                                    else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                                    else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
                                    update({ phone: formatted });
                                }}
                            />
                        </div>
                    </div>
                    <div className="drawer-section">
                        <label>Address</label>
                        <input value={form.address} onChange={(e) => update({ address: e.target.value })} />
                    </div>
                    <div className="drawer-row drawer-row-3">
                        <div className="drawer-section">
                            <label>City</label>
                            <input value={form.city} onChange={(e) => update({ city: e.target.value })} />
                        </div>
                        <div className="drawer-section">
                            <label>State</label>
                            <input value={form.state} onChange={(e) => update({ state: e.target.value })} />
                        </div>
                        <div className="drawer-section">
                            <label>ZIP</label>
                            <input value={form.zip} onChange={(e) => update({ zip: e.target.value })} />
                        </div>
                    </div>
                    <div className="drawer-section">
                        <label>Type</label>
                        <div className="form-type-select">
                            {(["prospect", "client", "lead"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`form-type-btn ${form.type === t ? "active" : ""}`}
                                    style={{
                                        cursor: "pointer",
                                        borderColor: form.type === t ? TYPE_COLORS[t] : undefined,
                                        color: form.type === t ? TYPE_COLORS[t] : undefined,
                                    }}
                                    onClick={() => update({ type: t })}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="drawer-section">
                        <label>Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => update({ notes: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="drawer-footer">
                    <button
                        className="crm-bulk-btn crm-bulk-btn-delete"
                        onClick={() => onDelete(contact.id)}
                        style={{ cursor: "pointer" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                    </button>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="modal-btn modal-btn-cancel" onClick={onClose} style={{ cursor: "pointer" }}>
                            Cancel
                        </button>
                        <button
                            className="modal-btn modal-btn-save"
                            disabled={!dirty || saving}
                            onClick={handleSave}
                            style={{ cursor: !dirty || saving ? "not-allowed" : "pointer" }}
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

/* ─── Main Contacts Page ─── */
export default function Contacts() {
    const { profile, subscription } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Auto-open add modal when navigating with ?add=true (from Dashboard quick action)
    useEffect(() => {
        if (searchParams.get("add") === "true") {
            setShowModal(true);
            setSearchParams({}, { replace: true }); // clean up URL
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const [editContact, setEditContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [confirmDeleteIds, setConfirmDeleteIds] = useState<string[]>([]);
    const [showBulkTypeModal, setShowBulkTypeModal] = useState(false);
    const [drawerContact, setDrawerContact] = useState<Contact | null>(null);
    const [visibleCols, setVisibleCols] = useState<Set<ColumnId>>(loadColumnVisibility);
    const [showColMenu, setShowColMenu] = useState(false);
    const [colWidths, setColWidths] = useState<Record<ColumnId, number>>(loadColWidths);
    const resizingRef = useRef<{ col: ColumnId; startX: number; startW: number } | null>(null);

    const onResizeStart = useCallback((col: ColumnId, e: React.MouseEvent) => {
        resizingRef.current = { col, startX: e.clientX, startW: colWidths[col] };
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const onMove = (ev: MouseEvent) => {
            if (!resizingRef.current) return;
            const delta = ev.clientX - resizingRef.current.startX;
            const newW = Math.max(60, resizingRef.current.startW + delta);
            setColWidths((prev) => ({ ...prev, [resizingRef.current!.col]: newW }));
        };

        const onUp = () => {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            if (resizingRef.current) {
                setColWidths((prev) => {
                    saveColWidths(prev);
                    return prev;
                });
            }
            resizingRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }, [colWidths]);

    const toggleColumn = (col: ColumnId) => {
        setVisibleCols((prev) => {
            const next = new Set(prev);
            if (next.has(col) && next.size > 1) next.delete(col);
            else next.add(col);
            saveColumnVisibility(next);
            return next;
        });
    };

    const limits = getLimits(subscription.tier);
    const tierInfo = TIER_INFO[subscription.tier];
    const atLimit = isOverLimit(subscription.tier, "contacts", contacts.length);
    const upgradeTier = getUpgradeTier(subscription.tier);

    const companyId = profile?.companyId;

    // Real-time listener on contacts
    useEffect(() => {
        if (!companyId) return;

        const q = query(
            collection(db, "companies", companyId, "contacts"),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Contact));
            setContacts(data);
            setLoading(false);
        });

        return unsub;
    }, [companyId]);

    // Clear selection when contacts change
    useEffect(() => {
        setSelectedIds((prev) => {
            const contactIdSet = new Set(contacts.map((c) => c.id));
            const next = new Set([...prev].filter((id) => contactIdSet.has(id)));
            return next.size === prev.size ? prev : next;
        });
    }, [contacts]);

    // Filtered + sorted contacts
    const filteredContacts = useMemo(() => {
        let result = contacts;

        // Global search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.company.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.phone.toLowerCase().includes(q) ||
                    c.city.toLowerCase().includes(q) ||
                    c.state.toLowerCase().includes(q) ||
                    c.zip.includes(q) ||
                    c.type.toLowerCase().includes(q) ||
                    c.address.toLowerCase().includes(q)
            );
        }

        // Sort
        result = [...result].sort((a, b) => {
            const aVal = (a[sortKey] || "").toLowerCase();
            const bVal = (b[sortKey] || "").toLowerCase();
            if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [contacts, searchQuery, sortKey, sortDir]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const handleAddContact = useCallback(
        async (data: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
            if (!companyId) return;
            const now = new Date().toISOString();
            await addDoc(collection(db, "companies", companyId, "contacts"), {
                ...data,
                createdAt: now,
                updatedAt: now,
            });
            setShowModal(false);
        },
        [companyId]
    );

    const handleEditContact = useCallback(
        async (data: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
            if (!companyId || !editContact) return;
            await updateDoc(doc(db, "companies", companyId, "contacts", editContact.id), {
                ...data,
                updatedAt: new Date().toISOString(),
            });
            setEditContact(null);
        },
        [companyId, editContact]
    );

    const handleDeleteContacts = useCallback(
        async (ids: string[]) => {
            if (!companyId || ids.length === 0) return;
            try {
                const batch = writeBatch(db);
                ids.forEach((id) => {
                    batch.delete(doc(db, "companies", companyId, "contacts", id));
                });
                await batch.commit();
                setSelectedIds(new Set());
            } catch (err) {
                console.error("Failed to delete contacts:", err);
            }
            setConfirmDeleteIds([]);
        },
        [companyId]
    );

    const handleBulkUpdateType = useCallback(
        async (type: Contact["type"]) => {
            if (!companyId || selectedIds.size === 0) return;
            try {
                const batch = writeBatch(db);
                selectedIds.forEach((id) => {
                    batch.update(doc(db, "companies", companyId, "contacts", id), {
                        type,
                        updatedAt: new Date().toISOString(),
                    });
                });
                await batch.commit();
                setSelectedIds(new Set());
            } catch (err) {
                console.error("Failed to update contacts:", err);
            }
            setShowBulkTypeModal(false);
        },
        [companyId, selectedIds]
    );

    // Selection helpers
    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredContacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
        }
    };

    const allSelected = filteredContacts.length > 0 && selectedIds.size === filteredContacts.length;

    if (loading) {
        return (
            <div className="contacts-page">
                <div className="app-loading" style={{ minHeight: 200 }}>
                    <div className="app-loading-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="contacts-page">
            {/* Header */}
            <div className="contacts-header">
                <div>
                    <h1>Contacts</h1>
                    <p className="contacts-subtitle">
                        Manage your clients and prospects
                        {limits.contacts !== -1 && (
                            <span className="contacts-counter" style={{ color: atLimit ? "#f87171" : tierInfo.color }}>
                                {" "}· {contacts.length} / {limits.contacts} contacts
                            </span>
                        )}
                    </p>
                </div>
                <button
                    className={`contacts-create-btn ${atLimit ? "at-limit" : ""}`}
                    disabled={atLimit}
                    onClick={() => setShowModal(true)}
                    style={{ cursor: atLimit ? "not-allowed" : "pointer" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Add Contact
                </button>
            </div>

            {/* Limit warning */}
            {atLimit && upgradeTier && (
                <div className="contacts-limit-banner">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>
                        You've reached the {limits.contacts}-contact limit on the {tierInfo.name} plan.{" "}
                        <a href="https://os.xiri.ai/#pricing" target="_blank" rel="noopener noreferrer">
                            Upgrade to {TIER_INFO[upgradeTier].name} →
                        </a>
                    </span>
                </div>
            )}

            {contacts.length === 0 ? (
                <div className="contacts-empty">
                    <div className="contacts-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555d7e" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <h3>No contacts yet</h3>
                    <p>
                        Add clients and prospects to track your relationships and link them to bids.
                        {limits.contacts !== -1 && ` You can add up to ${limits.contacts} on your plan.`}
                    </p>
                    <button className="contacts-empty-cta" onClick={() => setShowModal(true)} style={{ cursor: "pointer" }}>
                        Add Your First Contact
                    </button>
                </div>
            ) : (
                <>
                    {/* Toolbar: Search + Bulk Actions */}
                    <div className="crm-toolbar">
                        <div className="crm-search-wrap">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555d7e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="crm-search"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="crm-search-clear" onClick={() => setSearchQuery("")} style={{ cursor: "pointer" }}>
                                    ✕
                                </button>
                            )}
                        </div>

                        {selectedIds.size > 0 && (
                            <div className="crm-bulk-actions">
                                <span className="crm-bulk-count">{selectedIds.size} selected</span>
                                <button
                                    className="crm-bulk-btn crm-bulk-btn-type"
                                    onClick={() => setShowBulkTypeModal(true)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Update Type
                                </button>
                                <button
                                    className="crm-bulk-btn crm-bulk-btn-delete"
                                    onClick={() => setConfirmDeleteIds([...selectedIds])}
                                    style={{ cursor: "pointer" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="crm-table-wrap">
                        <table className="crm-table">
                            <thead>
                                <tr>
                                    <th className="crm-th-check">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="crm-checkbox"
                                        />
                                    </th>
                                    {ALL_COLUMNS.filter((c) => visibleCols.has(c.id)).map((col) => (
                                        <SortHeader
                                            key={col.id}
                                            label={col.label}
                                            field={col.id}
                                            sortKey={sortKey}
                                            sortDir={sortDir}
                                            onSort={handleSort}
                                            width={colWidths[col.id]}
                                            onResizeStart={(e) => onResizeStart(col.id, e)}
                                        />
                                    ))}
                                    <th className="crm-th-actions">
                                        <div className="crm-col-toggle-wrap">
                                            <button
                                                className="crm-col-toggle-btn"
                                                onClick={() => setShowColMenu((v) => !v)}
                                                style={{ cursor: "pointer" }}
                                                title="Toggle columns"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="3" />
                                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                                </svg>
                                            </button>
                                            {showColMenu && (
                                                <div className="crm-col-menu">
                                                    {ALL_COLUMNS.map((col) => (
                                                        <label key={col.id} className="crm-col-menu-item">
                                                            <input
                                                                type="checkbox"
                                                                checked={visibleCols.has(col.id)}
                                                                onChange={() => toggleColumn(col.id)}
                                                                className="crm-checkbox"
                                                            />
                                                            {col.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleCols.size + 2} className="crm-no-results">
                                            No contacts match "{searchQuery}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <tr
                                            key={contact.id}
                                            className={`crm-row ${selectedIds.has(contact.id) ? "selected" : ""}`}
                                            onClick={(e) => {
                                                // Don't open drawer if clicking checkbox or action buttons
                                                const target = e.target as HTMLElement;
                                                if (target.closest(".crm-td-check") || target.closest(".crm-td-actions")) return;
                                                setDrawerContact(contact);
                                            }}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td className="crm-td-check">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(contact.id)}
                                                    onChange={() => toggleSelect(contact.id)}
                                                    className="crm-checkbox"
                                                />
                                            </td>
                                            {visibleCols.has("name") && (
                                                <td className="crm-td-name">
                                                    <div className="crm-name-cell">
                                                        <span className="crm-avatar">{contact.name[0]?.toUpperCase()}</span>
                                                        <span>{contact.name}</span>
                                                    </div>
                                                </td>
                                            )}
                                            {visibleCols.has("company") && <td>{contact.company}</td>}
                                            {visibleCols.has("email") && <td className="crm-td-email">{contact.email}</td>}
                                            {visibleCols.has("phone") && <td>{contact.phone}</td>}
                                            {visibleCols.has("city") && (
                                                <td>
                                                    {contact.city}
                                                    {contact.state ? `, ${contact.state}` : ""}
                                                </td>
                                            )}
                                            {visibleCols.has("type") && (
                                                <td>
                                                    <span
                                                        className="crm-type-badge"
                                                        style={{
                                                            color: TYPE_COLORS[contact.type],
                                                            background: TYPE_COLORS[contact.type] + "14",
                                                        }}
                                                    >
                                                        {contact.type}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="crm-td-actions">
                                                <button
                                                    className="crm-action-btn"
                                                    onClick={() => setEditContact(contact)}
                                                    title="Edit"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="crm-action-btn crm-action-delete"
                                                    onClick={() => setConfirmDeleteIds([contact.id])}
                                                    title="Delete"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Results count */}
                    <div className="crm-footer">
                        Showing {filteredContacts.length} of {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
                    </div>
                </>
            )}

            {/* Add/Edit Modal */}
            {(showModal || editContact) && (
                <ContactModal
                    contact={editContact}
                    onSave={editContact ? handleEditContact : handleAddContact}
                    onClose={() => {
                        setShowModal(false);
                        setEditContact(null);
                    }}
                />
            )}

            {/* Delete confirmation modal */}
            {confirmDeleteIds.length > 0 && (
                <div className="modal-overlay" onClick={() => setConfirmDeleteIds([])}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, textAlign: "center" }}>
                        <div style={{ padding: "2rem 1.5rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <h3 style={{ color: "#e8eaf0", fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                                Delete {confirmDeleteIds.length} Contact{confirmDeleteIds.length > 1 ? "s" : ""}
                            </h3>
                            <p style={{ color: "#8b92b3", fontSize: "0.8125rem", marginBottom: "1.5rem" }}>
                                Are you sure? This action cannot be undone.
                            </p>
                            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                                <button
                                    className="modal-btn modal-btn-cancel"
                                    onClick={() => setConfirmDeleteIds([])}
                                    style={{ cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="modal-btn"
                                    onClick={() => handleDeleteContacts(confirmDeleteIds)}
                                    style={{
                                        cursor: "pointer",
                                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                        color: "#fff",
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk update type modal */}
            {showBulkTypeModal && (
                <BulkTypeModal
                    count={selectedIds.size}
                    onUpdate={handleBulkUpdateType}
                    onClose={() => setShowBulkTypeModal(false)}
                />
            )}

            {/* Contact detail drawer */}
            {drawerContact && (
                <ContactDrawer
                    contact={drawerContact}
                    onSave={async (data) => {
                        if (!companyId) return;
                        await updateDoc(doc(db, "companies", companyId, "contacts", drawerContact.id), {
                            ...data,
                            updatedAt: new Date().toISOString(),
                        });
                        setDrawerContact(null);
                    }}
                    onDelete={(id) => {
                        setDrawerContact(null);
                        setConfirmDeleteIds([id]);
                    }}
                    onClose={() => setDrawerContact(null)}
                />
            )}
        </div>
    );
}

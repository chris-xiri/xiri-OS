import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import "./References.css";

/* ─── Types ─── */
interface Reference {
    id: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    createdAt: string;
}

/** Format digits → (xxx) xxx-xxxx */
function fmtPhone(raw: string): string {
    const d = raw.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Smart-parse a CSV line: "Name, Company, (555) 123-4567, foo@bar.com" */
function parseLine(line: string): Omit<Reference, "id" | "createdAt"> | null {
    const raw = line.trim();
    if (!raw) return null;

    const parts = raw.split(/[,\t]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) return null;

    let name = "";
    let company = "";
    let phone = "";
    let email = "";

    for (const p of parts) {
        if (!email && /@/.test(p)) { email = p; continue; }
        if (!phone && /\d{3}.*\d{4}/.test(p)) { phone = fmtPhone(p); continue; }
        if (!name) { name = p; continue; }
        if (!company) { company = p; continue; }
    }

    return name ? { name, company, phone, email } : null;
}

/* ─── Add / Edit Modal ─── */
function RefModal({
    editData,
    onSave,
    onClose,
}: {
    editData: Partial<Reference> | null;
    onSave: (data: Omit<Reference, "id" | "createdAt">) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(editData?.name || "");
    const [company, setCompany] = useState(editData?.company || "");
    const [phone, setPhone] = useState(editData?.phone || "");
    const [email, setEmail] = useState(editData?.email || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), company: company.trim(), phone, email: email.trim() });
    };

    return (
        <div className="ref-modal-overlay" onClick={onClose}>
            <form className="ref-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h3>{editData?.id ? "Edit Reference" : "Add Reference"}</h3>
                <div className="ref-modal-field">
                    <label>Name *</label>
                    <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" className="ref-input" />
                </div>
                <div className="ref-modal-field">
                    <label>Company</label>
                    <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ABC Corp" className="ref-input" />
                </div>
                <div className="ref-modal-field">
                    <label>Phone</label>
                    <input value={phone} onChange={(e) => setPhone(fmtPhone(e.target.value))} placeholder="(555) 123-4567" className="ref-input" />
                </div>
                <div className="ref-modal-field">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@abc.com" className="ref-input" />
                </div>
                <div className="ref-modal-actions">
                    <button type="button" className="ref-btn ref-btn-outline" onClick={onClose}>Cancel</button>
                    <button type="submit" className="ref-btn ref-btn-primary" disabled={!name.trim()}>
                        {editData?.id ? "Save" : "Add Reference"}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ─── Main Page ─── */
export default function References() {
    const { profile } = useAuth();
    const companyId = profile?.companyId;
    const [refs, setRefs] = useState<Reference[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editRef, setEditRef] = useState<Reference | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [pasteText, setPasteText] = useState("");
    const [parsedPreview, setParsedPreview] = useState<Omit<Reference, "id" | "createdAt">[]>([]);
    const [showPaste, setShowPaste] = useState(false);

    // Real-time listener
    useEffect(() => {
        if (!companyId) return;
        const q = query(collection(db, "companies", companyId, "references"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setRefs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reference)));
            setLoading(false);
        });
        return unsub;
    }, [companyId]);

    // Parse bulk paste text
    const handlePasteChange = useCallback((text: string) => {
        setPasteText(text);
        const lines = text.split("\n");
        const parsed = lines.map(parseLine).filter(Boolean) as Omit<Reference, "id" | "createdAt">[];
        setParsedPreview(parsed);
    }, []);

    // Save all parsed references
    const handleBulkSave = useCallback(async () => {
        if (!companyId || parsedPreview.length === 0) return;
        const colRef = collection(db, "companies", companyId, "references");
        await Promise.all(
            parsedPreview.map((r) => addDoc(colRef, { ...r, createdAt: new Date().toISOString() }))
        );
        setPasteText("");
        setParsedPreview([]);
        setShowPaste(false);
    }, [companyId, parsedPreview]);

    // Single add/edit
    const handleSave = useCallback(async (data: Omit<Reference, "id" | "createdAt">) => {
        if (!companyId) return;
        if (editRef) {
            await updateDoc(doc(db, "companies", companyId, "references", editRef.id), data);
        } else {
            await addDoc(collection(db, "companies", companyId, "references"), { ...data, createdAt: new Date().toISOString() });
        }
        setShowModal(false);
        setEditRef(null);
    }, [companyId, editRef]);

    const handleDelete = useCallback(async (id: string) => {
        if (!companyId) return;
        await deleteDoc(doc(db, "companies", companyId, "references", id));
    }, [companyId]);

    // Search
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return refs;
        const q = searchQuery.toLowerCase();
        return refs.filter((r) =>
            r.name.toLowerCase().includes(q) ||
            r.company.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.phone.includes(q)
        );
    }, [refs, searchQuery]);

    if (loading) {
        return (
            <div className="ref-page">
                <div className="ref-loading">
                    <div className="ref-loading-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="ref-page">
            <div className="ref-header">
                <div>
                    <h1>References</h1>
                    <p className="ref-subtitle">
                        Manage your company references for proposals
                        {refs.length > 0 && <span className="ref-count"> · {refs.length} reference{refs.length !== 1 ? "s" : ""}</span>}
                    </p>
                </div>
                <div className="ref-header-actions">
                    <button
                        className="ref-paste-toggle"
                        onClick={() => setShowPaste(!showPaste)}
                        title="Bulk import"
                        style={{ cursor: "pointer" }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        </svg>
                        Paste Import
                    </button>
                    <button
                        className="ref-create-btn"
                        onClick={() => { setEditRef(null); setShowModal(true); }}
                        style={{ cursor: "pointer" }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Reference
                    </button>
                </div>
            </div>

            {/* Paste-to-Add Panel */}
            {showPaste && (
                <div className="ref-paste-panel">
                    <div className="ref-paste-header">
                        <h3>Bulk Import</h3>
                        <span className="ref-paste-hint">One reference per line: Name, Company, Phone, Email</span>
                    </div>
                    <textarea
                        className="ref-paste-textarea"
                        placeholder={"John Smith, ABC Corp, (555) 123-4567, john@abc.com\nJane Doe, XYZ Inc, (555) 987-6543, jane@xyz.com"}
                        value={pasteText}
                        onChange={(e) => handlePasteChange(e.target.value)}
                        rows={4}
                    />
                    {parsedPreview.length > 0 && (
                        <div className="ref-paste-preview">
                            <div className="ref-paste-preview-header">
                                <span>{parsedPreview.length} reference{parsedPreview.length !== 1 ? "s" : ""} detected</span>
                            </div>
                            <div className="ref-paste-preview-list">
                                {parsedPreview.map((r, i) => (
                                    <div key={i} className="ref-paste-preview-row">
                                        <span className="ref-paste-name">{r.name}</span>
                                        {r.company && <span className="ref-paste-company">{r.company}</span>}
                                        {r.phone && <span className="ref-paste-detail">{r.phone}</span>}
                                        {r.email && <span className="ref-paste-detail">{r.email}</span>}
                                    </div>
                                ))}
                            </div>
                            <button className="ref-btn ref-btn-primary" onClick={handleBulkSave} style={{ cursor: "pointer" }}>
                                Import {parsedPreview.length} Reference{parsedPreview.length !== 1 ? "s" : ""}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Search */}
            {refs.length > 0 && (
                <div className="ref-search-bar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search references..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ref-search-input"
                    />
                </div>
            )}

            {/* Table */}
            {filtered.length > 0 ? (
                <div className="ref-table-wrapper">
                    <table className="ref-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th style={{ width: 50 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr
                                    key={r.id}
                                    className="ref-row"
                                    onClick={() => { setEditRef(r); setShowModal(true); }}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td className="ref-cell-name">{r.name}</td>
                                    <td>{r.company || "—"}</td>
                                    <td>{r.phone || "—"}</td>
                                    <td>{r.email || "—"}</td>
                                    <td>
                                        <button
                                            className="ref-delete-btn"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                                            title="Delete"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : refs.length === 0 ? (
                <div className="ref-empty">
                    <div className="ref-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3d4167" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <h3>No references yet</h3>
                    <p>Add references to include in your proposals. You can add them one-by-one or paste multiple at once.</p>
                    <div className="ref-empty-actions">
                        <button className="ref-btn ref-btn-primary" onClick={() => { setEditRef(null); setShowModal(true); }} style={{ cursor: "pointer" }}>
                            Add Reference
                        </button>
                        <button className="ref-btn ref-btn-outline" onClick={() => setShowPaste(true)} style={{ cursor: "pointer" }}>
                            Paste Import
                        </button>
                    </div>
                </div>
            ) : (
                <div className="ref-empty">
                    <p>No references match "{searchQuery}"</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <RefModal
                    editData={editRef}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditRef(null); }}
                />
            )}
        </div>
    );
}

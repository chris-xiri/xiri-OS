import { useState, useMemo, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLimits } from "../lib/rbac";
import {
    BUILDING_TYPES,
    FREQUENCIES,
    STATES,
    CLEANING_TASKS,
    TASK_CATEGORIES,
    DEFAULT_INPUTS,
    calculate,
    getStateDefaults,
    ROOM_TYPES,
    getDefaultRooms,
    ROOM_AREA_RATIOS,
    resolveTaskFrequency,
    getTaskFrequencyOptions,
    type CalculatorInputs,
    type Frequency,
    type RoomScope,
    type CustomTask,
    type SupplyPolicy,
} from "../lib/calculator";
import type { Contact } from "./Contacts";
import "./Calculator.css";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

type SaveStep = "calculator" | "contact" | "saving" | "saved";

export default function Calculator() {
    const { profile, subscription } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editBidId = searchParams.get("bid");

    // Calculator state
    const [inputs, setInputs] = useState<CalculatorInputs>({ ...DEFAULT_INPUTS });
    const [selectedState, setSelectedState] = useState("");
    const [roomScopes, setRoomScopes] = useState<RoomScope[]>(() => getDefaultRooms("office", DEFAULT_INPUTS.sqft));
    const [priceOverride, setPriceOverride] = useState<number | null>(null);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<{ roomId: string; taskId: string } | null>(null);
    const [newCustomTask, setNewCustomTask] = useState<string>("");
    const [breakdownEdit, setBreakdownEdit] = useState<string | null>(null);

    // Derive flat selectedTasks from roomScopes for calculator compatibility
    const selectedTasks = useMemo(() => {
        const all = new Set<string>();
        roomScopes.forEach((r) => r.tasks.forEach((t) => all.add(t)));
        return all;
    }, [roomScopes]);

    // Save-as-bid state
    const [saveStep, setSaveStep] = useState<SaveStep>("calculator");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContactId, setSelectedContactId] = useState("");
    const [newContactName, setNewContactName] = useState("");
    const [newContactCompany, setNewContactCompany] = useState("");
    const [contactLimitHit, setContactLimitHit] = useState(false);

    // Editing state
    const [editingBid, setEditingBid] = useState<any>(null);
    const [, setLoadingBid] = useState(!!editBidId);

    const companyId = profile?.companyId;
    const results = useMemo(() => calculate(inputs, roomScopes), [inputs, roomScopes]);
    const isOneOff = inputs.frequency === "once";

    // Autofill state from company profile on mount (only for new bids)
    useEffect(() => {
        if (!companyId || editBidId) return;
        getDoc(doc(db, "companies", companyId)).then((snap) => {
            if (snap.exists()) {
                const d = snap.data();
                const stateCode = d.address?.state || "";
                const patchInputs: Partial<CalculatorInputs> = {};
                if (stateCode) {
                    setSelectedState(stateCode);
                    const defaults = getStateDefaults(stateCode);
                    if (defaults) Object.assign(patchInputs, defaults);
                }
                // Map company suppliesPolicy → calculator supplyPolicy
                const sp = d.suppliesPolicy || "";
                if (sp === "customer_provides") patchInputs.supplyPolicy = "client";
                else if (sp === "both") patchInputs.supplyPolicy = "shared";
                else if (sp === "we_provide") patchInputs.supplyPolicy = "company";
                if (Object.keys(patchInputs).length > 0) {
                    setInputs((p) => ({ ...p, ...patchInputs }));
                }
            }
        });
    }, [companyId, editBidId]);

    // Load existing bid for editing
    useEffect(() => {
        if (!companyId || !editBidId) return;
        setLoadingBid(true);
        getDoc(doc(db, "companies", companyId, "bids", editBidId)).then((snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setEditingBid({ id: snap.id, ...data });
                // Restore calculator state
                if (data.calculatorInputs) {
                    setInputs(data.calculatorInputs);
                }
                if (data.roomScopes) {
                    setRoomScopes(data.roomScopes);
                } else if (data.selectedTasks) {
                    // Backward compat: convert flat tasks to a single "all areas" room
                    setRoomScopes([{
                        id: crypto.randomUUID(),
                        roomTypeId: "common",
                        customName: "All Areas",
                        tasks: data.selectedTasks,
                    }]);
                }
                if (data.priceOverride != null) {
                    setPriceOverride(data.priceOverride);
                }
                if (data.state) {
                    setSelectedState(data.state);
                }
                if (data.contactId) {
                    setSelectedContactId(data.contactId);
                }
            }
            setLoadingBid(false);
        });
    }, [companyId, editBidId]);

    // Load contacts for picker
    useEffect(() => {
        if (!companyId) return;
        const q = query(collection(db, "companies", companyId, "contacts"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snap) => {
            setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Contact)));
        });
    }, [companyId]);

    const update = (patch: Partial<CalculatorInputs>) => setInputs((p) => ({ ...p, ...patch }));

    // Room management
    const addRoom = (roomTypeId: string) => {
        const rt = ROOM_TYPES.find((r) => r.id === roomTypeId)!;
        const newRoom: RoomScope = {
            id: crypto.randomUUID(),
            roomTypeId,
            customName: roomTypeId === "custom" ? "" : undefined,
            tasks: [...rt.defaultTasks],
        };
        setRoomScopes((prev) => [...prev, newRoom]);
        setExpandedRoom(newRoom.id);
        setShowAddRoom(false);
    };

    const removeRoom = (roomId: string) => {
        setRoomScopes((prev) => prev.filter((r) => r.id !== roomId));
        if (expandedRoom === roomId) setExpandedRoom(null);
    };

    const toggleRoomTask = (roomId: string, taskId: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                const has = r.tasks.includes(taskId);
                return { ...r, tasks: has ? r.tasks.filter((t) => t !== taskId) : [...r.tasks, taskId] };
            })
        );
    };

    const updateRoomName = (roomId: string, name: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => (r.id === roomId ? { ...r, customName: name } : r))
        );
    };

    // Custom task management
    const addCustomTask = (roomId: string, name: string) => {
        if (!name.trim()) return;
        const ct: CustomTask = { id: `ct-${crypto.randomUUID().slice(0, 8)}`, name: name.trim() };
        setRoomScopes((prev) =>
            prev.map((r) => r.id !== roomId ? r : { ...r, customTasks: [...(r.customTasks || []), ct] })
        );
        setNewCustomTask("");
    };

    const removeCustomTask = (roomId: string, ctId: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => r.id !== roomId ? r : { ...r, customTasks: (r.customTasks || []).filter((c) => c.id !== ctId) })
        );
    };

    const setTaskOverride = (roomId: string, taskId: string, name: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                const overrides = { ...(r.taskOverrides || {}) };
                const original = CLEANING_TASKS.find((t) => t.id === taskId);
                if (!name.trim() || name.trim() === original?.name) {
                    delete overrides[taskId];
                } else {
                    overrides[taskId] = { name: name.trim() };
                }
                return { ...r, taskOverrides: Object.keys(overrides).length ? overrides : undefined };
            })
        );
        setEditingTask(null);
    };

    const updateCustomTaskName = (roomId: string, ctId: string, name: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => r.id !== roomId ? r : {
                ...r,
                customTasks: (r.customTasks || []).map((c) => c.id === ctId ? { ...c, name } : c),
            })
        );
    };

    // Per-task frequency management
    const setTaskFrequency = (roomId: string, taskId: string, freq: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                const freqs = { ...(r.taskFrequencies || {}) };
                // If same as bid frequency, remove override
                if (freq === inputs.frequency) {
                    delete freqs[taskId];
                } else {
                    freqs[taskId] = freq;
                }
                return { ...r, taskFrequencies: Object.keys(freqs).length ? freqs : undefined };
            })
        );
    };

    const setCustomTaskFrequency = (roomId: string, ctId: string, freq: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => r.id !== roomId ? r : {
                ...r,
                customTasks: (r.customTasks || []).map((c) =>
                    c.id === ctId ? { ...c, frequency: freq === inputs.frequency ? undefined : freq } : c
                ),
            })
        );
    };

    const handleStateChange = (stateCode: string) => {
        setSelectedState(stateCode);
        if (stateCode) {
            const defaults = getStateDefaults(stateCode);
            if (defaults) update(defaults);
        }
    };

    // Re-seed rooms when building type changes
    const handleBuildingTypeChange = (buildingTypeId: string) => {
        update({ buildingTypeId });
        setRoomScopes(getDefaultRooms(buildingTypeId, inputs.sqft));
        setExpandedRoom(null);
    };

    // Redistribute room sqft when total sqft changes (preserving tasks/overrides)
    const redistributeRoomSqft = (newSqft: number) => {
        setRoomScopes((prev) => {
            const ratios = ROOM_AREA_RATIOS[inputs.buildingTypeId];
            if (!ratios) return prev;
            return prev.map((r) => {
                const ratio = ratios[r.roomTypeId];
                return ratio ? { ...r, sqft: Math.round(newSqft * ratio) } : r;
            });
        });
    };

    const handleSaveAsBid = async () => {
        if (!companyId) return;

        // Contact limit enforcement
        const limits = getLimits(subscription.tier);
        if (limits.contacts !== -1 && !selectedContactId && newContactName.trim()) {
            if (contacts.length >= limits.contacts) {
                setContactLimitHit(true);
                return;
            }
        }
        setContactLimitHit(false);

        setSaveStep("saving");

        try {
            // Create contact if needed
            let contactId = selectedContactId;
            if (!contactId && newContactName.trim()) {
                const now = new Date().toISOString();
                const contactRef = await addDoc(collection(db, "companies", companyId, "contacts"), {
                    name: newContactName.trim(),
                    company: newContactCompany.trim() || newContactName.trim(),
                    email: "",
                    phone: "",
                    address: "",
                    type: "prospect",
                    notes: "",
                    createdAt: now,
                    updatedAt: now,
                });
                contactId = contactRef.id;
            }

            // Build bid name
            const buildingType = BUILDING_TYPES.find((b) => b.id === inputs.buildingTypeId);
            const contactName = contacts.find((c) => c.id === contactId)?.company || newContactCompany || newContactName || "Unnamed";
            const bidName = `${contactName} - ${buildingType?.name || "Building"} ${inputs.sqft.toLocaleString()} sqft`;

            const now = new Date().toISOString();

            if (editingBid) {
                // ── UPDATE existing bid with version history ──
                const currentVersion = editingBid.version || 1;
                const existingVersions = editingBid.versions || [];

                // Push current bid data into versions history
                const versionSnapshot = {
                    version: currentVersion,
                    results: editingBid.results,
                    calculatorInputs: editingBid.calculatorInputs,
                    selectedTasks: editingBid.selectedTasks,
                    savedAt: editingBid.updatedAt || editingBid.createdAt,
                };

                await updateDoc(doc(db, "companies", companyId, "bids", editingBid.id), {
                    contactId: contactId || editingBid.contactId || "",
                    name: bidName,
                    calculatorInputs: inputs,
                    selectedTasks: Array.from(selectedTasks),
                    roomScopes,
                    priceOverride,
                    state: selectedState,
                    results,
                    updatedAt: now,
                    version: currentVersion + 1,
                    versions: [...existingVersions, versionSnapshot],
                });
            } else {
                // ── CREATE new bid ──
                const newBidRef = await addDoc(collection(db, "companies", companyId, "bids"), {
                    contactId: contactId || "",
                    name: bidName,
                    status: "draft",
                    calculatorInputs: inputs,
                    selectedTasks: Array.from(selectedTasks),
                    roomScopes,
                    priceOverride,
                    state: selectedState,
                    results,
                    createdAt: now,
                    updatedAt: now,
                    version: 1,
                    versions: [],
                });
                navigate(`/bids/${newBidRef.id}`);
                return;
            }

            navigate(`/bids/${editingBid.id}`);
        } catch (err) {
            console.error("Failed to save bid:", err);
            setSaveStep("contact");
        }
    };

    // ─── Saved confirmation ───
    if (saveStep === "saved") {
        return (
            <div className="calc-page">
                <div className="calc-saved">
                    <div className="calc-saved-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h2>{editingBid ? "Bid Updated!" : "Bid Saved!"}</h2>
                    <p className="calc-saved-price">{fmt(priceOverride ?? Math.round(results.totalPricePerMonth))}<span>/mo</span></p>
                    <div className="calc-saved-actions">
                        {editingBid ? (
                            <button className="calc-btn calc-btn-secondary" onClick={() => navigate(`/bids/${editingBid.id}`)} style={{ cursor: "pointer" }}>
                                View Bid
                            </button>
                        ) : (
                            <button className="calc-btn calc-btn-secondary" onClick={() => { setSaveStep("calculator"); }} style={{ cursor: "pointer" }}>
                                Create Another Bid
                            </button>
                        )}
                        <button className="calc-btn calc-btn-primary" onClick={() => navigate("/bids")} style={{ cursor: "pointer" }}>
                            View All Bids
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Contact Picker Step ───
    if (saveStep === "contact" || saveStep === "saving") {
        return (
            <div className="calc-page">
                <div className="calc-contact-step">
                    <h2>Link Bid to Contact</h2>
                    <p className="calc-contact-sub">Select an existing contact or create a new one to link this bid to.</p>

                    <div className="calc-bid-summary">
                        <span className="calc-bid-summary-label">Bid Total</span>
                        <span className="calc-bid-summary-price">{fmt(priceOverride ?? Math.round(results.totalPricePerMonth))}/mo</span>
                    </div>

                    {contacts.length > 0 && (
                        <div className="calc-contact-section">
                            <label>Existing Contact</label>
                            <select
                                value={selectedContactId}
                                onChange={(e) => {
                                    setSelectedContactId(e.target.value);
                                    if (e.target.value) {
                                        setNewContactName("");
                                        setNewContactCompany("");
                                    }
                                }}
                            >
                                <option value="">— Select a contact —</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} · {c.company}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="calc-contact-divider">
                        <span>or create new</span>
                    </div>

                    <div className="calc-contact-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Name</label>
                                <input
                                    value={newContactName}
                                    onChange={(e) => {
                                        setNewContactName(e.target.value);
                                        setSelectedContactId("");
                                    }}
                                    placeholder="John Smith"
                                />
                            </div>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    value={newContactCompany}
                                    onChange={(e) => {
                                        setNewContactCompany(e.target.value);
                                        setSelectedContactId("");
                                    }}
                                    placeholder="ABC Properties"
                                />
                            </div>
                        </div>
                    </div>

                    {contactLimitHit && (
                        <div className="calc-limit-banner">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <div>
                                <strong>Contact limit reached</strong>
                                <p>You've used all {getLimits(subscription.tier).contacts} contacts on your {subscription.tier} plan. Select an existing contact or upgrade.</p>
                            </div>
                            <button className="calc-btn calc-btn-primary" onClick={() => navigate("/settings")} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                                Subscribe
                            </button>
                        </div>
                    )}

                    <div className="calc-contact-actions">
                        <button className="calc-btn calc-btn-secondary" onClick={() => setSaveStep("calculator")} style={{ cursor: "pointer" }}>
                            Back to Calculator
                        </button>
                        <button
                            className="calc-btn calc-btn-primary"
                            disabled={!selectedContactId && !newContactName.trim()}
                            onClick={handleSaveAsBid}
                            style={{ cursor: "pointer" }}
                        >
                            {saveStep === "saving" ? "Saving..." : editingBid ? `Update Bid (v${(editingBid.version || 1) + 1})` : "Save Bid"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Calculator ───
    return (
        <div className="calc-page">
            <div className="calc-header">
                <h1>Bid Calculator</h1>
                <p className="calc-subtitle">Calculate accurate cleaning bids using ISSA 612 production rates</p>
            </div>

            <div className="calc-layout">
                {/* Left: Inputs */}
                <div className="calc-inputs">
                    {/* Building Type */}
                    <section className="calc-section">
                        <h3>Building Type</h3>
                        <div className="calc-building-grid">
                            {BUILDING_TYPES.filter((b) => b.popular).map((bt) => (
                                <button
                                    key={bt.id}
                                    className={`calc-building-btn ${inputs.buildingTypeId === bt.id ? "active" : ""}`}
                                    onClick={() => handleBuildingTypeChange(bt.id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span className="calc-building-icon">{bt.icon}</span>
                                    <span className="calc-building-name">{bt.name}</span>
                                </button>
                            ))}
                        </div>
                        <details className="calc-advanced">
                            <summary>More building types</summary>
                            <div className="calc-building-grid" style={{ marginTop: "0.5rem" }}>
                                {BUILDING_TYPES.filter((b) => !b.popular).map((bt) => (
                                    <button
                                        key={bt.id}
                                        className={`calc-building-btn ${inputs.buildingTypeId === bt.id ? "active" : ""}`}
                                        onClick={() => handleBuildingTypeChange(bt.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <span className="calc-building-icon">{bt.icon}</span>
                                        <span className="calc-building-name">{bt.name}</span>
                                    </button>
                                ))}
                            </div>
                        </details>
                    </section>

                    {/* Square Footage & Frequency */}
                    <section className="calc-section">
                        <h3>Size & Frequency</h3>
                        <div className="form-group">
                            <label>Square Footage</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={inputs.sqft === 0 ? "" : inputs.sqft.toLocaleString()}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^0-9]/g, "");
                                    const newSqft = raw === "" ? 0 : Number(raw);
                                    update({ sqft: newSqft });
                                    if (newSqft > 0) redistributeRoomSqft(newSqft);
                                }}
                                onBlur={() => {
                                    if (inputs.sqft < 100) {
                                        update({ sqft: 100 });
                                        redistributeRoomSqft(100);
                                    }
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cleaning Frequency</label>
                            <div className="calc-freq-strip">
                                <button
                                    className={`calc-freq-pill calc-freq-once ${inputs.frequency === "once" ? "active" : ""}`}
                                    onClick={() => update({ frequency: "once" as Frequency })}
                                >
                                    One-Time
                                </button>
                                <div className="calc-freq-divider" />
                                {FREQUENCIES.filter(f => f.group === "recurring").map((f) => (
                                    <button
                                        key={f.value}
                                        className={`calc-freq-pill ${inputs.frequency === f.value ? "active" : ""}`}
                                        onClick={() => update({ frequency: f.value })}
                                        title={f.label}
                                    >
                                        {f.value}x
                                    </button>
                                ))}
                            </div>
                            <span className="calc-freq-hint">
                                {isOneOff ? "Single visit (deep clean, post-construction, etc.)" : `${FREQUENCIES.find(f => f.value === inputs.frequency)?.label || ""} — recurring`}
                            </span>
                        </div>
                    </section>



                    {/* Room-Based Cleaning Scope */}
                    <section className="calc-section">
                        <div className="calc-scope-header">
                            <h3>Cleaning Scope</h3>
                            <span className="calc-scope-badge">{roomScopes.length} room{roomScopes.length !== 1 ? "s" : ""}</span>
                        </div>

                        <div className="calc-room-list">
                            {roomScopes.map((room) => {
                                const rt = ROOM_TYPES.find((r) => r.id === room.roomTypeId);
                                const isExpanded = expandedRoom === room.id;
                                const roomName = room.customName || rt?.name || "Room";
                                const roomIcon = rt?.icon || "📦";
                                return (
                                    <div key={room.id} className={`calc-room-card ${isExpanded ? "expanded" : ""}`}>
                                        <div className="calc-room-header" onClick={() => setExpandedRoom(isExpanded ? null : room.id)} style={{ cursor: "pointer" }}>
                                            <span className="calc-room-icon">{roomIcon}</span>
                                            {room.roomTypeId === "custom" ? (
                                                <input
                                                    className="calc-room-name-input"
                                                    value={room.customName || ""}
                                                    onChange={(e) => updateRoomName(room.id, e.target.value)}
                                                    placeholder="Room name…"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span className="calc-room-name">{roomName}</span>
                                            )}
                                            <input
                                                className="calc-room-sqft-input"
                                                type="text"
                                                inputMode="numeric"
                                                value={room.sqft ? room.sqft.toLocaleString() : ""}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/[^0-9]/g, "");
                                                    const val = parseInt(raw) || 0;
                                                    setRoomScopes((prev) =>
                                                        prev.map((r) => r.id === room.id ? { ...r, sqft: val || undefined } : r)
                                                    );
                                                }}
                                                placeholder="sqft"
                                                onClick={(e) => e.stopPropagation()}
                                                title="Square footage for this area"
                                            />
                                            <span className="calc-room-count">{room.tasks.length + (room.customTasks?.length || 0)} tasks</span>
                                            <button
                                                className="calc-room-remove"
                                                onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                                                title="Remove room"
                                                style={{ cursor: "pointer" }}
                                            >
                                                ✕
                                            </button>
                                            <span className="calc-room-chevron">{isExpanded ? "▾" : "▸"}</span>
                                        </div>
                                        {isExpanded && (
                                            <div className="calc-room-tasks">
                                                {TASK_CATEGORIES.filter((cat) => rt?.relevantCategories?.includes(cat.id) ?? true).map((cat) => {
                                                    const tasksInCat = CLEANING_TASKS.filter((t) => t.category === cat.id);
                                                    if (tasksInCat.length === 0) return null;
                                                    return (
                                                        <div key={cat.id} className="calc-room-cat">
                                                            <div className="calc-room-cat-label">{cat.icon} {cat.label}</div>
                                                            {tasksInCat.map((task) => {
                                                                const isEditing = editingTask?.roomId === room.id && editingTask?.taskId === task.id;
                                                                const displayName = room.taskOverrides?.[task.id]?.name || task.name;
                                                                return (
                                                                    <div key={task.id} className="calc-room-task-item">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={room.tasks.includes(task.id)}
                                                                            onChange={() => toggleRoomTask(room.id, task.id)}
                                                                            style={{ cursor: "pointer" }}
                                                                        />
                                                                        {isEditing ? (
                                                                            <input
                                                                                className="calc-task-edit-input"
                                                                                defaultValue={displayName}
                                                                                autoFocus
                                                                                onBlur={(e) => setTaskOverride(room.id, task.id, e.target.value)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") setTaskOverride(room.id, task.id, (e.target as HTMLInputElement).value);
                                                                                    if (e.key === "Escape") setEditingTask(null);
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <span
                                                                                className={`calc-task-label ${room.taskOverrides?.[task.id] ? "calc-task-edited" : ""}`}
                                                                                onDoubleClick={() => setEditingTask({ roomId: room.id, taskId: task.id })}
                                                                                title="Double-click to edit"
                                                                            >
                                                                                {displayName}
                                                                            </span>
                                                                        )}
                                                                        {room.taskOverrides?.[task.id] && !isEditing && (
                                                                            <button
                                                                                className="calc-task-reset"
                                                                                onClick={() => setTaskOverride(room.id, task.id, task.name)}
                                                                                title={`Reset to "${task.name}"`}
                                                                            >↺</button>
                                                                        )}
                                                                        {room.tasks.includes(task.id) && (() => {
                                                                            const resolvedFreq = resolveTaskFrequency(task.recommendedFrequency, inputs.frequency);
                                                                            const opts = getTaskFrequencyOptions(inputs.frequency);
                                                                            return (
                                                                                <select
                                                                                    className="calc-task-freq"
                                                                                    value={room.taskFrequencies?.[task.id] || resolvedFreq}
                                                                                    onChange={(e) => setTaskFrequency(room.id, task.id, e.target.value)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    {opts.map((opt) => (
                                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                                    ))}
                                                                                </select>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}

                                                {/* Custom tasks */}
                                                {(room.customTasks?.length || 0) > 0 && (
                                                    <div className="calc-room-cat">
                                                        <div className="calc-room-cat-label">📝 Custom Tasks</div>
                                                        {room.customTasks!.map((ct) => (
                                                            <div key={ct.id} className="calc-room-task-item calc-custom-task">
                                                                <span className="calc-custom-dot">●</span>
                                                                <input
                                                                    className="calc-task-edit-input"
                                                                    value={ct.name}
                                                                    onChange={(e) => updateCustomTaskName(room.id, ct.id, e.target.value)}
                                                                    placeholder="Task name…"
                                                                />
                                                                <select
                                                                    className="calc-task-freq"
                                                                    value={ct.frequency || inputs.frequency}
                                                                    onChange={(e) => setCustomTaskFrequency(room.id, ct.id, e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {getTaskFrequencyOptions(inputs.frequency).map((opt) => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    className="calc-task-reset"
                                                                    onClick={() => removeCustomTask(room.id, ct.id)}
                                                                    title="Remove task"
                                                                >✕</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Add custom task input */}
                                                <div className="calc-add-custom-task">
                                                    <input
                                                        className="calc-custom-task-input"
                                                        value={newCustomTask}
                                                        onChange={(e) => setNewCustomTask(e.target.value)}
                                                        placeholder="＋ Add custom task…"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && newCustomTask.trim()) {
                                                                addCustomTask(room.id, newCustomTask);
                                                            }
                                                        }}
                                                    />
                                                    {newCustomTask.trim() && (
                                                        <button
                                                            className="calc-custom-task-add-btn"
                                                            onClick={() => addCustomTask(room.id, newCustomTask)}
                                                        >Add</button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sqft total indicator */}
                        {(() => {
                            const roomSum = roomScopes.reduce((s, r) => s + (r.sqft || 0), 0);
                            const diff = inputs.sqft - roomSum;
                            const isMatch = Math.abs(diff) < 2;  // rounding tolerance
                            return (
                                <div className="calc-sqft-total" style={{ color: isMatch ? "#6b7294" : diff > 0 ? "#f0ad4e" : "#e74c3c" }}>
                                    <span>Room total: {roomSum.toLocaleString()} / {inputs.sqft.toLocaleString()} sqft</span>
                                    {!isMatch && <span style={{ fontSize: "0.65rem", marginLeft: 4 }}>({diff > 0 ? `${diff.toLocaleString()} unallocated` : `${Math.abs(diff).toLocaleString()} over`})</span>}
                                </div>
                            );
                        })()}

                        {/* Add Room */}
                        {showAddRoom ? (
                            <div className="calc-add-room-picker">
                                <div className="calc-add-room-grid">
                                    {ROOM_TYPES.map((rt) => (
                                        <button
                                            key={rt.id}
                                            className="calc-add-room-btn"
                                            onClick={() => addRoom(rt.id)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span>{rt.icon}</span>
                                            <span>{rt.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <button className="calc-add-room-cancel" onClick={() => setShowAddRoom(false)} style={{ cursor: "pointer" }}>Cancel</button>
                            </div>
                        ) : (
                            <button className="calc-add-room-trigger" onClick={() => setShowAddRoom(true)} style={{ cursor: "pointer" }}>
                                ＋ Add Room / Area
                            </button>
                        )}
                    </section>

                    {/* Location & Financials — collapsible, autofilled from company profile */}
                    <section className="calc-section calc-section-details">
                        <details className="calc-financials-collapsible">
                            <summary className="calc-financials-summary">
                                <h3>Location & Financials</h3>
                                <span className="calc-financials-preview">
                                    {selectedState ? `📍 ${STATES.find(s => s.code === selectedState)?.name || selectedState}` : "📍 No state selected"} · ${inputs.wageRate}/hr · {inputs.payrollTaxPercent}% payroll · {inputs.overheadPercent}% overhead · {inputs.profitPercent}% profit
                                </span>
                            </summary>
                            <div className="calc-financials-body">
                                <div className="form-group">
                                    <label>State (auto-fills recommended rates)</label>
                                    <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                                        <option value="">— Select state —</option>
                                        {STATES.map((s) => (
                                            <option key={s.code} value={s.code}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="calc-financials-grid">
                                    <div className="form-group">
                                        <label>Hourly Wage ($)</label>
                                        <input type="number" value={inputs.wageRate} onChange={(e) => update({ wageRate: Number(e.target.value) })} min={7} step={0.5} />
                                    </div>
                                    <div className="form-group">
                                        <label>Payroll Tax (%)</label>
                                        <input type="number" value={inputs.payrollTaxPercent} onChange={(e) => update({ payrollTaxPercent: Number(e.target.value) })} min={0} max={30} step={0.5} />
                                    </div>
                                    <div className="form-group">
                                        <label>Overhead (%)</label>
                                        <input type="number" value={inputs.overheadPercent} onChange={(e) => update({ overheadPercent: Number(e.target.value) })} min={0} max={50} step={1} />
                                    </div>
                                    <div className="form-group">
                                        <label>Profit Margin (%)</label>
                                        <input type="number" value={inputs.profitPercent} onChange={(e) => update({ profitPercent: Number(e.target.value) })} min={0} max={60} step={1} />
                                    </div>
                                </div>
                            </div>
                        </details>
                    </section>
                </div>

                {/* Right: Results */}
                <div className="calc-results">
                    <div className="calc-results-sticky">
                        <div className="calc-results-card">
                            <h3>Bid Summary</h3>

                            <div className="calc-price-hero">
                                {(() => {
                                    const base = results.totalPricePerMonth;
                                    const low = Math.round(base * 0.85);
                                    const high = Math.round(base * 1.15);
                                    return (
                                        <>
                                            <div className="calc-price-range">
                                                <span className="calc-price-range-value">{fmt(low)}</span>
                                                <span className="calc-price-range-dash"> – </span>
                                                <span className="calc-price-range-value">{fmt(high)}</span>
                                            </div>
                                            <span className="calc-price-period">{isOneOff ? " total" : "/month"}</span>
                                            <div className="calc-price-estimate-note">
                                                Estimated: {fmt(base)}{isOneOff ? " total" : "/mo"}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="calc-final-price-row">
                                <label>Final Price</label>
                                <div className="calc-final-price-input-wrap">
                                    <span>$</span>
                                    <input
                                        className="calc-final-price-input"
                                        type="text"
                                        inputMode="numeric"
                                        value={priceOverride !== null ? priceOverride.toLocaleString() : Math.round(results.totalPricePerMonth).toLocaleString()}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[^0-9]/g, "");
                                            setPriceOverride(raw === "" ? 0 : Number(raw));
                                        }}
                                    />
                                    <span className="calc-final-price-period">{isOneOff ? "total" : "/mo"}</span>
                                </div>
                            </div>

                            {(() => {
                                const finalPrice = priceOverride ?? Math.round(results.totalPricePerMonth);
                                const finalPerVisit = results.visitsPerMonth > 0
                                    ? Math.round((finalPrice / results.visitsPerMonth) * 100) / 100
                                    : finalPrice;
                                const finalPerSqft = inputs.sqft > 0
                                    ? Math.round((finalPrice / inputs.sqft) * 1000) / 1000
                                    : 0;
                                const actualProfit = finalPrice - results.totalCostPerMonth;
                                const profitPct = results.totalCostPerMonth > 0
                                    ? Math.round((actualProfit / results.totalCostPerMonth) * 100)
                                    : 0;
                                return (
                                    <>
                                        <div className="calc-results-grid">
                                            <div className="calc-result-item">
                                                <span className="calc-result-label">Per Visit</span>
                                                <span className="calc-result-value">{fmt(finalPerVisit)}</span>
                                            </div>
                                            <div className="calc-result-item">
                                                <span className="calc-result-label">Per Sqft</span>
                                                <span className="calc-result-value">${finalPerSqft.toFixed(3)}</span>
                                            </div>
                                            <div className="calc-result-item">
                                                <span className="calc-result-label">Hrs/Visit</span>
                                                <span className="calc-result-value">{results.hoursPerVisit.toFixed(1)}</span>
                                            </div>
                                            {!isOneOff && (
                                                <div className="calc-result-item">
                                                    <span className="calc-result-label">Visits/Mo</span>
                                                    <span className="calc-result-value">{results.visitsPerMonth}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="calc-breakdown">
                                            <h4>Cost Breakdown</h4>
                                            {/* Labor */}
                                            <div className="calc-breakdown-row">
                                                <span className="calc-breakdown-label">
                                                    Labor
                                                    <button className="calc-breakdown-edit" onClick={() => setBreakdownEdit(breakdownEdit === "labor" ? null : "labor")} title="Edit wage rate">✎</button>
                                                </span>
                                                <span>{fmt(results.laborCostPerMonth)}</span>
                                            </div>
                                            {breakdownEdit === "labor" && (
                                                <div className="calc-breakdown-inline">
                                                    <label>Wage Rate</label>
                                                    <div className="calc-breakdown-inline-input">
                                                        <span>$</span>
                                                        <input type="number" value={inputs.wageRate} onChange={(e) => update({ wageRate: Number(e.target.value) })} min={7} step={0.5} />
                                                        <span>/hr</span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Payroll Tax */}
                                            <div className="calc-breakdown-row">
                                                <span className="calc-breakdown-label">
                                                    Payroll Tax
                                                    <button className="calc-breakdown-edit" onClick={() => setBreakdownEdit(breakdownEdit === "payroll" ? null : "payroll")} title="Edit payroll tax %">✎</button>
                                                </span>
                                                <span>{fmt(results.payrollTaxCost)}</span>
                                            </div>
                                            {breakdownEdit === "payroll" && (
                                                <div className="calc-breakdown-inline">
                                                    <label>Payroll Tax Rate</label>
                                                    <div className="calc-breakdown-inline-input">
                                                        <input type="number" value={inputs.payrollTaxPercent} onChange={(e) => update({ payrollTaxPercent: Number(e.target.value) })} min={0} max={30} step={0.5} />
                                                        <span>%</span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Supplies */}
                                            <div className="calc-breakdown-row">
                                                <span className="calc-breakdown-label">
                                                    Supplies
                                                    <button className="calc-breakdown-edit" onClick={() => setBreakdownEdit(breakdownEdit === "supply" ? null : "supply")} title="Edit supply cost per sqft">✎</button>
                                                </span>
                                                <span>{fmt(results.supplyCostPerMonth)}</span>
                                            </div>
                                            {breakdownEdit === "supply" && (
                                                <div className="calc-breakdown-inline" style={{ flexDirection: "column", gap: "0.4rem", alignItems: "stretch" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <label>Who Covers Supplies?</label>
                                                        <div className="calc-supply-policy-pills">
                                                            {([["company", "We Cover"], ["shared", "Shared"], ["client", "Client"]] as [SupplyPolicy, string][]).map(([val, label]) => (
                                                                <button
                                                                    key={val}
                                                                    className={`calc-supply-pill${inputs.supplyPolicy === val ? " active" : ""}`}
                                                                    onClick={() => update({ supplyPolicy: val })}
                                                                >{label}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {inputs.supplyPolicy !== "client" && (
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <label>Cost per sqft/visit</label>
                                                            <div className="calc-breakdown-inline-input">
                                                                <span>$</span>
                                                                <input type="number" value={inputs.supplyCostPerSqft} onChange={(e) => update({ supplyCostPerSqft: Number(e.target.value) })} min={0} step={0.001} style={{ width: "70px" }} />
                                                                {inputs.supplyPolicy === "shared" && <span>(50%)</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {/* Overhead */}
                                            <div className="calc-breakdown-row">
                                                <span className="calc-breakdown-label">
                                                    Overhead
                                                    <button className="calc-breakdown-edit" onClick={() => setBreakdownEdit(breakdownEdit === "overhead" ? null : "overhead")} title="Edit overhead %">✎</button>
                                                </span>
                                                <span>{fmt(results.overheadCost)}</span>
                                            </div>
                                            {breakdownEdit === "overhead" && (
                                                <div className="calc-breakdown-inline">
                                                    <label>Overhead Rate</label>
                                                    <div className="calc-breakdown-inline-input">
                                                        <input type="number" value={inputs.overheadPercent} onChange={(e) => update({ overheadPercent: Number(e.target.value) })} min={0} max={50} step={1} />
                                                        <span>%</span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Totals */}
                                            <div className="calc-breakdown-row calc-breakdown-subtotal">
                                                <span>Total Cost</span>
                                                <span>{fmt(results.totalCostPerMonth)}</span>
                                            </div>
                                            <div className="calc-breakdown-row calc-breakdown-profit" style={{ color: actualProfit >= 0 ? "#00d4aa" : "#f87171" }}>
                                                <span className="calc-breakdown-label">
                                                    Profit ({profitPct}%)
                                                    <button className="calc-breakdown-edit" onClick={() => setBreakdownEdit(breakdownEdit === "profit" ? null : "profit")} title="Edit profit margin %">✎</button>
                                                </span>
                                                <span>{fmt(actualProfit)}</span>
                                            </div>
                                            {breakdownEdit === "profit" && (
                                                <div className="calc-breakdown-inline">
                                                    <label>Target Profit Margin</label>
                                                    <div className="calc-breakdown-inline-input">
                                                        <input type="number" value={inputs.profitPercent} onChange={(e) => update({ profitPercent: Number(e.target.value) })} min={0} max={60} step={1} />
                                                        <span>%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}

                            <button
                                className="calc-btn calc-btn-primary calc-save-btn"
                                onClick={() => setSaveStep("contact")}
                                style={{ cursor: "pointer" }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                Save as Bid
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

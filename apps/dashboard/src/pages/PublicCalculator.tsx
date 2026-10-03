import { useState, useMemo, useEffect, useCallback, type FormEvent } from "react";
import {
    BUILDING_TYPES,
    FREQUENCIES,
    STATES,
    CLEANING_TASKS,
    DEFAULT_INPUTS,
    calculate,
    getStateDefaults,
    getMetrosForState,
    getMetroDefaults,
    resolveZip,
    ROOM_TYPES,
    getDefaultRooms,
    getTaskFrequencyOptions,
    type CalculatorInputs,
    type Frequency,
    type RoomScope,
    type CustomTask,
} from "@xiri-facility-solutions/shared";
import {
    trackCalculatorUsed,
    trackCtaClicked,
    trackCalculatorAutoSaved,
    trackCalculatorEmailCaptured,
    trackCalculatorExitIntentShown,
    trackCalculatorExitIntentAccepted,
} from "../lib/analytics";
import "./Calculator.css";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * Public-facing calculator (no auth required) with real-time auto-saving,
 * quick email lead capture, exit-intent modal, and sticky conversion bar.
 */
export default function PublicCalculator() {
    const [inputs, setInputs] = useState<CalculatorInputs>({ ...DEFAULT_INPUTS });
    const [selectedState, setSelectedState] = useState("");
    const [selectedMetro, setSelectedMetro] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [roomScopes, setRoomScopes] = useState<RoomScope[]>(() => getDefaultRooms("office", DEFAULT_INPUTS.sqft));
    const [priceOverride, setPriceOverride] = useState<number | null>(null);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
    const [newCustomTask, setNewCustomTask] = useState<string>("");

    // Contact info — saved along with the pending bid
    const [clientName, setClientName] = useState("");
    const [clientCompany, setClientCompany] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");

    // Lead capture & exit intent
    const [captureEmail, setCaptureEmail] = useState("");
    const [autoSaved, setAutoSaved] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    const results = useMemo(() => calculate(inputs, roomScopes), [inputs, roomScopes]);
    const isOneOff = inputs.frequency === "once";
    const monthlyPrice = priceOverride !== null ? priceOverride : Math.round(results.totalPricePerMonth);

    const update = (patch: Partial<CalculatorInputs>) => {
        setInputs((prev) => ({ ...prev, ...patch }));
    };

    const handleBuildingTypeChange = (id: string) => {
        const bt = BUILDING_TYPES.find((b) => b.id === id);
        trackCalculatorUsed(bt?.name || id, inputs.sqft);
        update({ buildingTypeId: id });
        setRoomScopes(getDefaultRooms(id, inputs.sqft));
    };

    const redistributeRoomSqft = (newSqft: number) => {
        setRoomScopes((prev) => {
            const totalOld = prev.reduce((s, r) => s + (r.sqft || 0), 0);
            if (totalOld === 0) return prev;
            return prev.map((r) => ({ ...r, sqft: Math.round(((r.sqft || 0) / totalOld) * newSqft) }));
        });
    };

    const handleStateChange = (code: string) => {
        setSelectedState(code);
        setSelectedMetro(""); // reset metro when state changes
        if (code) {
            const defaults = getStateDefaults(code);
            if (defaults) update(defaults);
        }
    };

    const handleMetroChange = (metroId: string) => {
        setSelectedMetro(metroId);
        if (metroId) {
            const defaults = getMetroDefaults(metroId);
            if (defaults) update(defaults);
        }
    };

    const handleZipChange = (zip: string) => {
        const cleaned = zip.replace(/\D/g, "").slice(0, 5);
        setZipCode(cleaned);
        if (cleaned.length >= 3) {
            const result = resolveZip(cleaned);
            if (result) {
                if (result.state !== selectedState) {
                    handleStateChange(result.state);
                }
                if (result.metroId && result.metroId !== selectedMetro) {
                    handleMetroChange(result.metroId);
                }
            }
        }
    };

    const availableMetros = selectedState ? getMetrosForState(selectedState) : [];

    // Room scope helpers
    const addRoom = (roomTypeId: string) => {
        const rt = ROOM_TYPES.find((r) => r.id === roomTypeId);
        if (!rt) return;
        const newRoom: RoomScope = {
            id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            roomTypeId,
            customName: rt.name,
            sqft: Math.round(inputs.sqft * 0.1),
            tasks: [...rt.defaultTasks],
        };
        setRoomScopes((prev) => [...prev, newRoom]);
        setShowAddRoom(false);
        setExpandedRoom(newRoom.id);
    };

    const removeRoom = (roomId: string) => {
        setRoomScopes((prev) => prev.filter((r) => r.id !== roomId));
    };

    const toggleRoomTask = (roomId: string, taskId: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                const tasks = r.tasks.includes(taskId)
                    ? r.tasks.filter((t) => t !== taskId)
                    : [...r.tasks, taskId];
                return { ...r, tasks };
            })
        );
    };

    const setRoomTaskFrequency = (roomId: string, taskId: string, freq: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                const freqs = { ...(r.taskFrequencies || {}) };
                if (freq === inputs.frequency) {
                    delete freqs[taskId];
                } else {
                    freqs[taskId] = freq;
                }
                return { ...r, taskFrequencies: Object.keys(freqs).length ? freqs : undefined };
            })
        );
    };

    const addCustomTaskToRoom = (roomId: string) => {
        if (!newCustomTask.trim()) return;
        const ct: CustomTask = {
            id: `ct_${Date.now()}`,
            name: newCustomTask.trim(),
        };
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                return { ...r, customTasks: [...(r.customTasks || []), ct] };
            })
        );
        setNewCustomTask("");
    };

    const removeCustomTaskFromRoom = (roomId: string, ctId: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                return { ...r, customTasks: (r.customTasks || []).filter((c) => c.id !== ctId) };
            })
        );
    };

    // Serialize & save pending bid payload
    const savePendingBidToStorage = useCallback((targetEmail?: string) => {
        const selectedTasks = new Set<string>();
        roomScopes.forEach((r) => r.tasks.forEach((t) => selectedTasks.add(t)));
        const pendingBid = {
            inputs,
            roomScopes,
            priceOverride,
            selectedState,
            selectedTasks: Array.from(selectedTasks),
            results,
            savedAt: new Date().toISOString(),
            contact: (clientName || clientCompany || clientEmail || clientPhone || targetEmail) ? {
                name: clientName,
                company: clientCompany,
                email: targetEmail || clientEmail,
                phone: clientPhone,
            } : null,
        };
        try {
            localStorage.setItem("xiri_pendingBid", JSON.stringify(pendingBid));
        } catch { /* storage full */ }
        return pendingBid;
    }, [inputs, roomScopes, priceOverride, selectedState, results, clientName, clientCompany, clientEmail, clientPhone]);

    // ─── Real-Time Auto-Save ───
    useEffect(() => {
        if (inputs.sqft <= 0) return;
        savePendingBidToStorage();
        setAutoSaved(true);
        trackCalculatorAutoSaved(inputs.sqft, monthlyPrice);
        const timer = setTimeout(() => setAutoSaved(false), 2500);
        return () => clearTimeout(timer);
    }, [inputs, roomScopes, priceOverride, selectedState, clientName, clientCompany, clientEmail, clientPhone, monthlyPrice, savePendingBidToStorage]);

    // ─── Exit-Intent Detector ───
    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 15 && inputs.sqft > 0) {
                const shown = sessionStorage.getItem("xiri_calc_exit_intent_shown");
                if (shown !== "1") {
                    sessionStorage.setItem("xiri_calc_exit_intent_shown", "1");
                    setShowExitModal(true);
                    trackCalculatorExitIntentShown(monthlyPrice);
                }
            }
        };

        document.addEventListener("mouseleave", handleMouseLeave);
        return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, [inputs.sqft, monthlyPrice]);

    // Save & redirect to signup
    const handleSaveAndSignup = (source = "public_calculator", emailParam?: string) => {
        savePendingBidToStorage(emailParam);
        trackCtaClicked("Save Bid — Start Free Trial", source);
        const emailQuery = emailParam ? `&email=${encodeURIComponent(emailParam)}` : "";
        (window.top || window).location.href = `/app/login?mode=signup${emailQuery}`;
    };

    // Quick email capture submit
    const handleQuickEmailSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!captureEmail.trim()) return;
        trackCalculatorEmailCaptured(captureEmail.split("@")[1] || "unknown", monthlyPrice);
        handleSaveAndSignup("quick_email_capture", captureEmail.trim());
    };

    const buildingType = BUILDING_TYPES.find((b) => b.id === inputs.buildingTypeId);

    return (
        <div className="calc-page" style={{ minHeight: "100vh", background: "#0c0f1a", color: "#e8eaf0" }}>
            {/* Header */}
            <div className="calc-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem 2rem" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4aa", display: "inline-block" }} />
                            <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "white" }}>xiri<span style={{ color: "#00d4aa" }}>OS</span></span>
                        </a>
                        <h1>Janitorial Bid Calculator</h1>
                        <p className="calc-subtitle">Professional commercial cleaning estimates powered by ISSA 612 standards</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        {autoSaved && (
                            <span className="calc-autosaved-pill">
                                ✓ Draft Auto-Saved
                            </span>
                        )}
                        <button className="calc-btn calc-btn-secondary" style={{ fontSize: "0.875rem", cursor: "pointer" }} onClick={() => { (window.top || window).location.href = "/app/login"; }}>Sign In</button>
                        <button className="calc-btn calc-btn-primary" style={{ fontSize: "0.875rem", cursor: "pointer" }} onClick={() => handleSaveAndSignup("header_btn")}>Start 60-Day Trial</button>
                    </div>
                </div>
            </div>

            <div className="calc-layout" style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem 6rem" }}>
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
                                    const n = raw === "" ? 0 : Number(raw);
                                    update({ sqft: n });
                                    redistributeRoomSqft(n);
                                }}
                                placeholder="10,000"
                            />
                            <div className="calc-sqft-presets">
                                {[2500, 5000, 10000, 20000, 50000].map((s) => (
                                    <button
                                        key={s}
                                        className={`calc-preset-btn ${inputs.sqft === s ? "active" : ""}`}
                                        onClick={() => {
                                            update({ sqft: s });
                                            redistributeRoomSqft(s);
                                        }}
                                        type="button"
                                    >
                                        {s.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: "1rem" }}>
                            <label>Cleaning Frequency</label>
                            <div className="calc-freq-strip">
                                <button
                                    type="button"
                                    className={`calc-freq-pill calc-freq-once ${inputs.frequency === "once" ? "active" : ""}`}
                                    onClick={() => update({ frequency: "once" as Frequency })}
                                >
                                    One-Time
                                </button>
                                <div className="calc-freq-divider" />
                                {FREQUENCIES.filter((f) => f.group === "recurring").map((f) => (
                                    <button
                                        key={f.value}
                                        type="button"
                                        className={`calc-freq-pill ${inputs.frequency === f.value ? "active" : ""}`}
                                        onClick={() => update({ frequency: f.value })}
                                        title={f.label}
                                    >
                                        {f.value}x
                                    </button>
                                ))}
                            </div>
                            <span className="calc-freq-hint">
                                {isOneOff ? "Single visit (deep clean, post-construction, etc.)" : `${FREQUENCIES.find((f) => f.value === inputs.frequency)?.label || ""} — recurring`}
                            </span>
                        </div>
                    </section>

                    {/* Location */}
                    <section className="calc-section">
                        <h3>Location & Labor Data</h3>
                        <p className="calc-section-desc">Auto-sets wage rates using Bureau of Labor Statistics (BLS) data</p>
                        <div className="calc-location-grid">
                            <div className="form-group">
                                <label>ZIP Code</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Enter ZIP..."
                                    value={zipCode}
                                    onChange={(e) => handleZipChange(e.target.value)}
                                    maxLength={5}
                                />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                                    <option value="">Select state...</option>
                                    {STATES.map((s) => (
                                        <option key={s.code} value={s.code}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Metro Area</label>
                                <select
                                    value={selectedMetro}
                                    onChange={(e) => handleMetroChange(e.target.value)}
                                    disabled={!selectedState || availableMetros.length === 0}
                                >
                                    <option value="">{availableMetros.length === 0 ? "Select state first" : "Default (State Average)"}</option>
                                    {availableMetros.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Room Scopes */}
                    <section className="calc-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <h3>Room Scopes & Tasks</h3>
                            <button
                                className="calc-btn calc-btn-secondary calc-btn-sm"
                                onClick={() => setShowAddRoom(!showAddRoom)}
                                type="button"
                            >
                                + Add Room
                            </button>
                        </div>

                        {showAddRoom && (
                            <div className="calc-add-room-popover">
                                <p style={{ fontSize: "0.8125rem", color: "#8b92b3", margin: "0 0 0.5rem" }}>Select a room type to add:</p>
                                <div className="calc-add-room-grid">
                                    {ROOM_TYPES.map((rt) => (
                                        <button
                                            key={rt.id}
                                            className="calc-add-room-btn"
                                            onClick={() => addRoom(rt.id)}
                                            type="button"
                                        >
                                            <span style={{ fontSize: "1.25rem" }}>{rt.icon}</span>
                                            <span>{rt.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="calc-rooms-list">
                            {roomScopes.map((room) => {
                                const isExpanded = expandedRoom === room.id;
                                const rt = ROOM_TYPES.find((r) => r.id === room.roomTypeId);
                                return (
                                    <div key={room.id} className={`calc-room-item ${isExpanded ? "expanded" : ""}`}>
                                        <div className="calc-room-header" onClick={() => setExpandedRoom(isExpanded ? null : room.id)}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <span style={{ fontSize: "1.125rem" }}>{rt?.icon || "🚪"}</span>
                                                <span className="calc-room-title">{room.customName || rt?.name}</span>
                                                <span className="calc-room-sqft-badge">{room.sqft?.toLocaleString()} sqft</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <span className="calc-room-task-count">{room.tasks.length} tasks</span>
                                                <button
                                                    className="calc-room-remove-btn"
                                                    onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                                                    title="Remove room"
                                                    type="button"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="calc-room-body">
                                                <div className="calc-task-pills">
                                                    {CLEANING_TASKS.map((task) => {
                                                        const active = room.tasks.includes(task.id);
                                                        const freqOverride = room.taskFrequencies?.[task.id];
                                                        return (
                                                            <div key={task.id} className="calc-task-pill-wrap">
                                                                <button
                                                                    type="button"
                                                                    className={`calc-task-pill ${active ? "active" : ""}`}
                                                                    onClick={() => toggleRoomTask(room.id, task.id)}
                                                                >
                                                                    {task.name}
                                                                </button>
                                                                {active && (
                                                                    <select
                                                                        className="calc-task-freq-select"
                                                                        value={freqOverride || inputs.frequency}
                                                                        onChange={(e) => setRoomTaskFrequency(room.id, task.id, e.target.value)}
                                                                    >
                                                                        {getTaskFrequencyOptions(inputs.frequency).map((opt) => (
                                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Custom Tasks */}
                                                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                                    {room.customTasks && room.customTasks.length > 0 && (
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                                            {room.customTasks.map((ct) => (
                                                                <div key={ct.id} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(0, 212, 170, 0.12)", border: "1px solid rgba(0, 212, 170, 0.25)", borderRadius: "6px", padding: "2px 8px", fontSize: "0.75rem", color: "#00d4aa" }}>
                                                                    <span>{ct.name}</span>
                                                                    <button type="button" onClick={() => removeCustomTaskFromRoom(room.id, ct.id)} style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}>✕</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Add custom task..."
                                                            value={newCustomTask}
                                                            onChange={(e) => setNewCustomTask(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTaskToRoom(room.id); } }}
                                                            style={{ flex: 1, padding: "0.4rem 0.6rem", background: "#121624", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "white", fontSize: "0.8125rem" }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="calc-btn calc-btn-secondary calc-btn-sm"
                                                            onClick={() => addCustomTaskToRoom(room.id)}
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Right: Results Card */}
                <div className="calc-sidebar">
                    <div className="calc-results-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <h3 style={{ margin: 0 }}>Bid Summary</h3>
                            {autoSaved && (
                                <span className="calc-autosaved-badge">✓ Auto-Saved</span>
                            )}
                        </div>

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
                            <label>Adjust Final Price</label>
                            <div className="calc-final-price-input-wrap">
                                <span>$</span>
                                <input
                                    className="calc-final-price-input"
                                    type="text"
                                    inputMode="numeric"
                                    value={priceOverride !== null ? priceOverride : Math.round(results.totalPricePerMonth)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/[^0-9]/g, "");
                                        setPriceOverride(raw === "" ? 0 : Number(raw));
                                    }}
                                />
                                <span className="calc-final-price-period">{isOneOff ? "total" : "/mo"}</span>
                            </div>
                        </div>

                        {/* Metrics grid */}
                        <div className="calc-results-grid">
                            <div className="calc-result-item">
                                <span className="calc-result-label">Per Visit</span>
                                <span className="calc-result-value">{fmt(results.pricePerVisit)}</span>
                            </div>
                            <div className="calc-result-item">
                                <span className="calc-result-label">Per Sqft</span>
                                <span className="calc-result-value">${results.pricePerSqft.toFixed(3)}</span>
                            </div>
                            <div className="calc-result-item">
                                <span className="calc-result-label">Hrs/Visit</span>
                                <span className="calc-result-value">{results.hoursPerVisit}</span>
                            </div>
                            <div className="calc-result-item">
                                <span className="calc-result-label">Visits/Mo</span>
                                <span className="calc-result-value">{results.visitsPerMonth}</span>
                            </div>
                            <div className="calc-result-item">
                                <span className="calc-result-label">Hrs/Mo</span>
                                <span className="calc-result-value">{results.totalHoursPerMonth}</span>
                            </div>
                            <div className="calc-result-item">
                                <span className="calc-result-label">Eff. $/hr</span>
                                <span className="calc-result-value">{fmt(results.effectiveHourlyRate)}</span>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="calc-breakdown">
                            <h4>Cost Breakdown</h4>
                            {[
                                { label: "Labor", value: results.laborCostPerMonth },
                                { label: "Payroll Tax", value: results.payrollTaxCost },
                                { label: "Supplies", value: results.supplyCostPerMonth },
                                { label: "Overhead", value: results.overheadCost },
                            ].map((item) => (
                                <div key={item.label} className="calc-breakdown-row">
                                    <span>{item.label}</span>
                                    <span>{fmt(item.value)}</span>
                                </div>
                            ))}
                            <div className="calc-breakdown-row calc-breakdown-profit">
                                <span>Profit</span>
                                <span>{fmt(results.profitAmount)}</span>
                            </div>
                            <div className="calc-breakdown-row calc-breakdown-subtotal">
                                <span>Total</span>
                                <span>{fmt(results.totalPricePerMonth)}</span>
                            </div>
                        </div>

                        {/* Quick Email Lead Capture */}
                        <div className="calc-quick-capture-card">
                            <div className="quick-capture-header">
                                <span className="quick-capture-icon">📩</span>
                                <div>
                                    <div className="quick-capture-title">Email Me This Estimate</div>
                                    <div className="quick-capture-desc">Get the breakdown & export a branded PDF</div>
                                </div>
                            </div>
                            <form onSubmit={handleQuickEmailSubmit} className="quick-capture-form">
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={captureEmail}
                                    onChange={(e) => setCaptureEmail(e.target.value)}
                                    required
                                    className="quick-capture-input"
                                />
                                <button type="submit" className="quick-capture-submit">
                                    Send PDF →
                                </button>
                            </form>
                        </div>

                        {/* Client / Contact Info (Optional) */}
                        <div className="calc-section" style={{ marginTop: "1rem" }}>
                            <h3 style={{ fontSize: "0.8125rem", color: "#a1a7c4", marginBottom: "0.5rem", fontWeight: 600 }}>
                                Client Information <span style={{ fontWeight: 400, fontSize: "0.6875rem" }}>(optional)</span>
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                {[
                                    { placeholder: "Contact Name", value: clientName, set: setClientName, type: "text" },
                                    { placeholder: "Company Name", value: clientCompany, set: setClientCompany, type: "text" },
                                    { placeholder: "Email", value: clientEmail, set: setClientEmail, type: "email" },
                                    { placeholder: "Phone", value: clientPhone, set: setClientPhone, type: "tel" },
                                ].map((f) => (
                                    <input
                                        key={f.placeholder}
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        value={f.value}
                                        onChange={(e) => f.set(e.target.value)}
                                        style={{
                                            padding: "0.5rem 0.75rem",
                                            background: "#1a1f36",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: "8px",
                                            color: "white",
                                            fontSize: "0.8125rem",
                                            fontFamily: "inherit",
                                            outline: "none",
                                            width: "100%",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Primary Save CTA */}
                        <button
                            className="calc-btn calc-btn-primary calc-save-btn"
                            style={{ width: "100%", textAlign: "center", display: "block", fontSize: "0.9375rem", padding: "0.875rem 1.25rem", cursor: "pointer", marginTop: "1rem" }}
                            onClick={() => handleSaveAndSignup("main_save_btn")}
                        >
                            Save Bid — Start 60-Day Free Trial →
                        </button>
                        <p style={{ color: "#8b92b3", fontSize: "0.75rem", textAlign: "center", marginTop: "0.5rem" }}>
                            No credit card required · Free 60-day Bid Plus access
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Sticky Floating Bottom Bar ─── */}
            <div className="calc-sticky-bottom-bar">
                <div className="calc-sticky-inner">
                    <div className="calc-sticky-left">
                        <span className="calc-sticky-sqft">{inputs.sqft.toLocaleString()} sqft {buildingType?.name || "Building"}</span>
                        <span className="calc-sticky-price">{fmt(monthlyPrice)}{isOneOff ? " total" : "/mo"}</span>
                    </div>
                    <button
                        className="calc-sticky-cta"
                        onClick={() => handleSaveAndSignup("sticky_bottom_bar")}
                    >
                        Save Bid & Download Proposal →
                    </button>
                </div>
            </div>

            {/* ─── Exit-Intent Recovery Modal ─── */}
            {showExitModal && (
                <div className="calc-exit-overlay" onClick={() => setShowExitModal(false)}>
                    <div className="calc-exit-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="calc-exit-close" onClick={() => setShowExitModal(false)} aria-label="Close">
                            ✕
                        </button>

                        <div className="calc-exit-badge">⚡ DON'T LOSE YOUR ESTIMATE</div>
                        <h2>Save your {fmt(monthlyPrice)} cleaning proposal?</h2>
                        <p className="calc-exit-desc">
                            You've configured a {inputs.sqft.toLocaleString()} sqft {buildingType?.name || "facility"} estimate. Save it to your free workspace and export a branded client proposal in 60 seconds.
                        </p>

                        <div className="calc-exit-highlight">
                            <div className="calc-exit-stat">
                                <span>Monthly Quote</span>
                                <strong>{fmt(monthlyPrice)}</strong>
                            </div>
                            <div className="calc-exit-stat">
                                <span>Price Per Visit</span>
                                <strong>{fmt(results.pricePerVisit)}</strong>
                            </div>
                            <div className="calc-exit-stat">
                                <span>Estimated Labor</span>
                                <strong>{results.hoursPerVisit} hrs/visit</strong>
                            </div>
                        </div>

                        <button
                            className="calc-exit-primary-btn"
                            onClick={() => {
                                trackCalculatorExitIntentAccepted(monthlyPrice);
                                handleSaveAndSignup("exit_intent_modal");
                            }}
                        >
                            Save My Bid & Continue Free (60 Days) →
                        </button>

                        <button className="calc-exit-dismiss-btn" onClick={() => setShowExitModal(false)}>
                            Keep editing calculation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

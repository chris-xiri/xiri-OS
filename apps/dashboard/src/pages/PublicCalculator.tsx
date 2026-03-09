import { useState, useMemo } from "react";
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
    resolveTaskFrequency,
    getTaskFrequencyOptions,
    type CalculatorInputs,
    type Frequency,
    type RoomScope,
    type CustomTask,
    type SupplyPolicy,
} from "../lib/calculator";
import "./Calculator.css";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * Public-facing calculator (no auth required).
 * Uses the exact same CSS class names as Calculator.tsx so styles apply identically.
 */
export default function PublicCalculator() {
    const [inputs, setInputs] = useState<CalculatorInputs>({ ...DEFAULT_INPUTS });
    const [selectedState, setSelectedState] = useState("");
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

    const results = useMemo(() => calculate(inputs, roomScopes), [inputs, roomScopes]);
    const isOneOff = inputs.frequency === "once";

    const update = (patch: Partial<CalculatorInputs>) => {
        setInputs((prev) => ({ ...prev, ...patch }));
    };

    const handleBuildingTypeChange = (id: string) => {
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
        if (code) {
            const defaults = getStateDefaults(code);
            if (defaults) update(defaults);
        }
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

    const setTaskFrequency = (roomId: string, taskId: string, freq: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                return { ...r, taskFrequencies: { ...(r.taskFrequencies || {}), [taskId]: freq } };
            })
        );
    };

    const addRoom = (roomTypeId: string) => {
        const roomType = ROOM_TYPES.find((r) => r.id === roomTypeId);
        if (!roomType) return;
        const newRoom: RoomScope = {
            id: `room_${Date.now()}`,
            roomTypeId,
            tasks: [...roomType.defaultTasks],
            sqft: Math.round(inputs.sqft * 0.1),
        };
        setRoomScopes((prev) => [...prev, newRoom]);
        setShowAddRoom(false);
        setExpandedRoom(newRoom.id);
    };

    const removeRoom = (roomId: string) => {
        setRoomScopes((prev) => prev.filter((r) => r.id !== roomId));
    };

    const updateRoomName = (roomId: string, name: string) => {
        setRoomScopes((prev) => prev.map((r) => (r.id === roomId ? { ...r, customName: name } : r)));
    };

    const addCustomTask = (roomId: string, name: string) => {
        if (!name.trim()) return;
        const ct: CustomTask = { id: `custom_${Date.now()}`, name: name.trim() };
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                return { ...r, customTasks: [...(r.customTasks || []), ct] };
            })
        );
        setNewCustomTask("");
    };

    const removeCustomTask = (roomId: string, taskId: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                return { ...r, customTasks: (r.customTasks || []).filter((t) => t.id !== taskId) };
            })
        );
    };

    // ─── RENDER ───
    return (
        <div className="calc-page" style={{ background: "#0c0f1a", minHeight: "100vh" }}>
            {/* Header with branding + auth links */}
            <div className="calc-header" style={{ padding: "2rem 2rem 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
                    <div>
                        <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4aa", display: "inline-block" }} />
                            <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "white" }}>xiri<span style={{ color: "#00d4aa" }}>OS</span></span>
                        </a>
                        <h1>Janitorial Bid Calculator</h1>
                        <p className="calc-subtitle">Professional cleaning estimates powered by ISSA 612 standards</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button className="calc-btn calc-btn-secondary" style={{ fontSize: "0.875rem", cursor: "pointer" }} onClick={() => { (window.top || window).location.href = "/app/login"; }}>Sign In</button>
                        <button className="calc-btn calc-btn-primary" style={{ fontSize: "0.875rem", cursor: "pointer" }} onClick={() => { (window.top || window).location.href = "/app/login?mode=signup"; }}>Start Free Trial</button>
                    </div>
                </div>
            </div>

            <div className="calc-layout" style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
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
                                                                const resolvedFreq = resolveTaskFrequency(task.recommendedFrequency, inputs.frequency);
                                                                const opts = getTaskFrequencyOptions(inputs.frequency);
                                                                return (
                                                                    <div key={task.id} className="calc-room-task-item">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={room.tasks.includes(task.id)}
                                                                            onChange={() => toggleRoomTask(room.id, task.id)}
                                                                            style={{ cursor: "pointer" }}
                                                                        />
                                                                        <span className="calc-task-label">{task.name}</span>
                                                                        {room.tasks.includes(task.id) && (
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
                                                                        )}
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
                                                            <div key={ct.id} className="calc-room-task-item">
                                                                <span className="calc-custom-dot">●</span>
                                                                <span className="calc-task-label">{ct.name}</span>
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
                            const isMatch = Math.abs(diff) < 2;
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

                    {/* Location & Financials */}
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
                                <div className="calc-financials-grid" style={{ marginTop: "0.75rem" }}>
                                    <div className="form-group">
                                        <label>Supply Cost / sqft</label>
                                        <input type="number" step="0.0001" value={inputs.supplyCostPerSqft} onChange={(e) => update({ supplyCostPerSqft: Number(e.target.value) })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Supplies Provided By</label>
                                        <select value={inputs.supplyPolicy || "company"} onChange={(e) => update({ supplyPolicy: e.target.value as SupplyPolicy })}>
                                            <option value="company">Cleaning Company</option>
                                            <option value="client">Client Provides</option>
                                            <option value="shared">Shared (50/50)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </section>
                </div>

                {/* Right: Results — identical to dashboard */}
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

                        {/* Client / Contact Info */}
                        <div className="calc-section" style={{ marginTop: "1.25rem" }}>
                            <h3 style={{ fontSize: "0.8125rem", color: "#a1a7c4", marginBottom: "0.5rem", fontWeight: 600 }}>
                                Client Information <span style={{ fontWeight: 400, fontSize: "0.6875rem" }}>(optional)</span>
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                <input
                                    className="calc-input"
                                    placeholder="Contact Name"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                />
                                <input
                                    className="calc-input"
                                    placeholder="Company Name"
                                    value={clientCompany}
                                    onChange={(e) => setClientCompany(e.target.value)}
                                />
                                <input
                                    className="calc-input"
                                    type="email"
                                    placeholder="Email"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                />
                                <input
                                    className="calc-input"
                                    type="tel"
                                    placeholder="Phone"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            className="calc-btn calc-btn-primary calc-save-btn"
                            style={{ width: "100%", textAlign: "center", display: "block", fontSize: "0.9375rem", padding: "0.75rem 1.25rem", cursor: "pointer", marginTop: "1rem" }}
                            onClick={() => {
                                // Save full calculator state so it can be auto-created after signup
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
                                    // Contact info — usePendingBid will auto-create the contact
                                    contact: (clientName || clientCompany || clientEmail || clientPhone) ? {
                                        name: clientName,
                                        company: clientCompany,
                                        email: clientEmail,
                                        phone: clientPhone,
                                    } : null,
                                };
                                try {
                                    localStorage.setItem("xiri_pendingBid", JSON.stringify(pendingBid));
                                } catch { /* localStorage full or unavailable — proceed anyway */ }
                                (window.top || window).location.href = "/app/login?mode=signup";
                            }}
                        >
                            Save Bid — Start 14-Day Free Trial
                        </button>
                        <p style={{ color: "#8b92b3", fontSize: "0.75rem", textAlign: "center", marginTop: "0.5rem" }}>
                            No credit card required · Full Bid Plus features
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

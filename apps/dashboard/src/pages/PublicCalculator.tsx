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
 * Renders the full calculator UI but replaces the save-as-bid flow with a signup CTA.
 */
export default function PublicCalculator() {
    // Calculator state
    const [inputs, setInputs] = useState<CalculatorInputs>({ ...DEFAULT_INPUTS });
    const [selectedState, setSelectedState] = useState("");
    const [roomScopes, setRoomScopes] = useState<RoomScope[]>(() => getDefaultRooms("office", DEFAULT_INPUTS.sqft));
    const [priceOverride, setPriceOverride] = useState<number | null>(null);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
    const [newCustomTask, setNewCustomTask] = useState<string>("");

    // Results
    const results = useMemo(() => calculate(inputs, roomScopes), [inputs, roomScopes]);

    // Total room sqft
    const totalRoomSqft = useMemo(
        () => roomScopes.reduce((sum, r) => sum + (r.sqft || 0), 0),
        [roomScopes]
    );

    const updateInput = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
        setInputs((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "buildingTypeId") {
                const newRooms = getDefaultRooms(value as string, prev.sqft);
                setRoomScopes(newRooms);
            }
            if (key === "sqft") {
                const sqft = value as number;
                setRoomScopes((prev) => {
                    const totalOld = prev.reduce((s, r) => s + (r.sqft || 0), 0);
                    if (totalOld === 0) return prev;
                    return prev.map((r) => ({
                        ...r,
                        sqft: Math.round(((r.sqft || 0) / totalOld) * sqft),
                    }));
                });
            }
            return next;
        });
    };

    const handleStateChange = (code: string) => {
        setSelectedState(code);
        if (code) {
            const defaults = getStateDefaults(code);
            if (defaults) setInputs((prev) => ({ ...prev, ...defaults }));
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

    const addCustomTask = (roomId: string) => {
        if (!newCustomTask.trim()) return;
        const newTask: CustomTask = { id: `custom_${Date.now()}`, name: newCustomTask.trim() };
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                return { ...r, customTasks: [...(r.customTasks || []), newTask] };
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

    const updateRoomSqft = (roomId: string, sqft: number) => {
        setRoomScopes((prev) =>
            prev.map((r) => (r.id === roomId ? { ...r, sqft } : r))
        );
    };

    const updateRoomName = (roomId: string, name: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => (r.id === roomId ? { ...r, customName: name } : r))
        );
    };

    const updateTaskFrequency = (roomId: string, taskId: string, freq: string) => {
        setRoomScopes((prev) =>
            prev.map((r) => {
                if (r.id !== roomId) return r;
                return { ...r, taskFrequencies: { ...(r.taskFrequencies || {}), [taskId]: freq } };
            })
        );
    };

    const freqOptions = getTaskFrequencyOptions(inputs.frequency);

    // ─── RENDER ───

    return (
        <div className="calc-page" style={{ background: "#0c0f1a", minHeight: "100vh" }}>
            {/* Header */}
            <div className="calc-header" style={{ padding: "2rem 2rem 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
                    <div>
                        <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4aa", display: "inline-block" }} />
                            <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "white" }}>xiri<span style={{ color: "#00d4aa" }}>OS</span></span>
                        </a>
                        <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Janitorial Bid Calculator</h1>
                        <p style={{ color: "#8b92b3", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
                            Professional cleaning estimates powered by ISSA 612 standards
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <a href="/app/login" className="calc-btn calc-btn-secondary" style={{ textDecoration: "none", fontSize: "0.875rem" }}>Sign In</a>
                        <a href="/app/login?mode=signup" className="calc-btn calc-btn-primary" style={{ textDecoration: "none", fontSize: "0.875rem" }}>Start Free Trial</a>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="calc-layout" style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
                {/* Left: Inputs */}
                <div className="calc-inputs">
                    {/* Building Type */}
                    <div className="calc-section">
                        <h3 className="calc-section-title">Building Type</h3>
                        <div className="calc-grid-3">
                            {BUILDING_TYPES.filter((b) => b.popular).map((bt) => (
                                <button
                                    key={bt.id}
                                    className={`calc-chip ${inputs.buildingTypeId === bt.id ? "active" : ""}`}
                                    onClick={() => updateInput("buildingTypeId", bt.id)}
                                >
                                    <span className="calc-chip-icon">{bt.icon}</span>
                                    <span>{bt.name}</span>
                                </button>
                            ))}
                        </div>
                        <details style={{ marginTop: "0.75rem" }}>
                            <summary style={{ color: "#8b92b3", fontSize: "0.8125rem", cursor: "pointer" }}>More building types</summary>
                            <div className="calc-grid-3" style={{ marginTop: "0.5rem" }}>
                                {BUILDING_TYPES.filter((b) => !b.popular).map((bt) => (
                                    <button
                                        key={bt.id}
                                        className={`calc-chip ${inputs.buildingTypeId === bt.id ? "active" : ""}`}
                                        onClick={() => updateInput("buildingTypeId", bt.id)}
                                    >
                                        <span className="calc-chip-icon">{bt.icon}</span>
                                        <span>{bt.name}</span>
                                    </button>
                                ))}
                            </div>
                        </details>
                    </div>

                    {/* Square Footage & Frequency */}
                    <div className="calc-section">
                        <div className="calc-row-2">
                            <div className="form-group">
                                <label>Total Square Footage</label>
                                <input
                                    type="number"
                                    value={inputs.sqft || ""}
                                    onChange={(e) => updateInput("sqft", parseInt(e.target.value) || 0)}
                                    placeholder="e.g. 10000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cleaning Frequency</label>
                                <select
                                    value={inputs.frequency}
                                    onChange={(e) => updateInput("frequency", e.target.value as Frequency)}
                                >
                                    {FREQUENCIES.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* State */}
                    <div className="calc-section">
                        <h3 className="calc-section-title">Location (Optional)</h3>
                        <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                            <option value="">Select state for recommended rates</option>
                            {STATES.map((s) => (
                                <option key={s.code} value={s.code}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Room Scopes */}
                    <div className="calc-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 className="calc-section-title" style={{ margin: 0 }}>Rooms & Scope</h3>
                            <button className="calc-btn-text" onClick={() => setShowAddRoom(!showAddRoom)}>+ Add Room</button>
                        </div>

                        {totalRoomSqft > 0 && totalRoomSqft !== inputs.sqft && (
                            <div className="calc-warning" style={{ marginTop: "0.5rem" }}>
                                Room total ({totalRoomSqft.toLocaleString()} sqft) ≠ building total ({inputs.sqft.toLocaleString()} sqft)
                                <button className="calc-btn-text" onClick={() => updateInput("sqft", totalRoomSqft)} style={{ marginLeft: "0.5rem" }}>
                                    Sync
                                </button>
                            </div>
                        )}

                        {showAddRoom && (
                            <div className="calc-add-room-grid" style={{ marginTop: "0.75rem" }}>
                                {ROOM_TYPES.map((rt) => (
                                    <button key={rt.id} className="calc-chip" onClick={() => addRoom(rt.id)}>
                                        <span className="calc-chip-icon">{rt.icon}</span>
                                        <span>{rt.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="calc-rooms" style={{ marginTop: "0.75rem" }}>
                            {roomScopes.map((room) => {
                                const roomType = ROOM_TYPES.find((rt) => rt.id === room.roomTypeId);
                                const isExpanded = expandedRoom === room.id;
                                return (
                                    <div key={room.id} className="calc-room-card">
                                        <div
                                            className="calc-room-header"
                                            onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <span>{roomType?.icon || "📦"}</span>
                                                <span style={{ fontWeight: 600, color: "white" }}>
                                                    {room.customName || roomType?.name || "Room"}
                                                </span>
                                                <span style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>
                                                    {room.sqft?.toLocaleString()} sqft · {room.tasks.length} tasks
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <button
                                                    className="calc-btn-icon"
                                                    onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                                                    title="Remove room"
                                                >
                                                    ✕
                                                </button>
                                                <span style={{ color: "#8b92b3", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>▾</span>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="calc-room-body">
                                                <div className="calc-row-2" style={{ marginBottom: "1rem" }}>
                                                    <div className="form-group">
                                                        <label>Room Name</label>
                                                        <input
                                                            value={room.customName || roomType?.name || ""}
                                                            onChange={(e) => updateRoomName(room.id, e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Square Footage</label>
                                                        <input
                                                            type="number"
                                                            value={room.sqft || ""}
                                                            onChange={(e) => updateRoomSqft(room.id, parseInt(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>

                                                {TASK_CATEGORIES.map((cat) => {
                                                    const tasksInCat = CLEANING_TASKS.filter((t) => t.category === cat.id);
                                                    if (tasksInCat.length === 0) return null;
                                                    return (
                                                        <div key={cat.id} style={{ marginBottom: "0.75rem" }}>
                                                            <div style={{ color: "#8b92b3", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.375rem" }}>
                                                                {cat.icon} {cat.label}
                                                            </div>
                                                            {tasksInCat.map((task) => {
                                                                const isOn = room.tasks.includes(task.id);
                                                                const resolved = resolveTaskFrequency(task.recommendedFrequency || "max", inputs.frequency);
                                                                const currentFreq = room.taskFrequencies?.[task.id] || resolved;
                                                                return (
                                                                    <div key={task.id} className="calc-task-row">
                                                                        <label className="calc-task-check">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isOn}
                                                                                onChange={() => toggleRoomTask(room.id, task.id)}
                                                                            />
                                                                            <span>{task.name}</span>
                                                                        </label>
                                                                        {isOn && (
                                                                            <select
                                                                                className="calc-task-freq"
                                                                                value={currentFreq}
                                                                                onChange={(e) => updateTaskFrequency(room.id, task.id, e.target.value)}
                                                                            >
                                                                                {freqOptions.map((f) => (
                                                                                    <option key={f.value} value={f.value}>{f.label}</option>
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
                                                {(room.customTasks || []).map((ct) => (
                                                    <div key={ct.id} className="calc-task-row">
                                                        <span style={{ color: "#c4c9e0" }}>📝 {ct.name}</span>
                                                        <button className="calc-btn-icon" onClick={() => removeCustomTask(room.id, ct.id)}>✕</button>
                                                    </div>
                                                ))}
                                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                                    <input
                                                        placeholder="Add custom task..."
                                                        value={newCustomTask}
                                                        onChange={(e) => setNewCustomTask(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && addCustomTask(room.id)}
                                                        style={{ flex: 1 }}
                                                    />
                                                    <button className="calc-btn calc-btn-secondary" onClick={() => addCustomTask(room.id)} style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}>
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Financials */}
                    <details className="calc-section">
                        <summary className="calc-section-title" style={{ cursor: "pointer" }}>Financial Settings</summary>
                        <div style={{ marginTop: "1rem" }}>
                            <div className="calc-row-2">
                                <div className="form-group">
                                    <label>Wage Rate ($/hr)</label>
                                    <input type="number" step="0.5" value={inputs.wageRate} onChange={(e) => updateInput("wageRate", parseFloat(e.target.value) || 0)} />
                                </div>
                                <div className="form-group">
                                    <label>Payroll Tax %</label>
                                    <input type="number" step="0.5" value={inputs.payrollTaxPercent} onChange={(e) => updateInput("payrollTaxPercent", parseFloat(e.target.value) || 0)} />
                                </div>
                            </div>
                            <div className="calc-row-2">
                                <div className="form-group">
                                    <label>Overhead %</label>
                                    <input type="number" step="1" value={inputs.overheadPercent} onChange={(e) => updateInput("overheadPercent", parseFloat(e.target.value) || 0)} />
                                </div>
                                <div className="form-group">
                                    <label>Profit Margin %</label>
                                    <input type="number" step="1" value={inputs.profitPercent} onChange={(e) => updateInput("profitPercent", parseFloat(e.target.value) || 0)} />
                                </div>
                            </div>
                            <div className="calc-row-2">
                                <div className="form-group">
                                    <label>Supply Cost / sqft</label>
                                    <input type="number" step="0.0001" value={inputs.supplyCostPerSqft} onChange={(e) => updateInput("supplyCostPerSqft", parseFloat(e.target.value) || 0)} />
                                </div>
                                <div className="form-group">
                                    <label>Supplies Provided By</label>
                                    <select value={inputs.supplyPolicy || "company"} onChange={(e) => updateInput("supplyPolicy", e.target.value as SupplyPolicy)}>
                                        <option value="company">Cleaning Company</option>
                                        <option value="client">Client Provides</option>
                                        <option value="shared">Shared (50/50)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>

                {/* Right: Results */}
                <div className="calc-results">
                    <div className="calc-results-sticky">
                        <div className="calc-price-card">
                            <div className="calc-price-label">Recommended Monthly Price</div>
                            <div className="calc-price-value">
                                {priceOverride !== null ? (
                                    <input
                                        className="calc-price-input"
                                        type="number"
                                        value={priceOverride}
                                        onChange={(e) => setPriceOverride(parseFloat(e.target.value) || 0)}
                                        onBlur={() => { if (priceOverride === Math.round(results.totalPricePerMonth)) setPriceOverride(null); }}
                                        autoFocus
                                    />
                                ) : (
                                    <span
                                        onClick={() => setPriceOverride(Math.round(results.totalPricePerMonth))}
                                        style={{ cursor: "pointer" }}
                                        title="Click to override"
                                    >
                                        {fmt(results.totalPricePerMonth)}
                                    </span>
                                )}
                                <span className="calc-price-period">/mo</span>
                            </div>
                            <div className="calc-price-sub">
                                {fmt(results.pricePerVisit)}/visit · ${results.pricePerSqft.toFixed(3)}/sqft
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="calc-metrics">
                            <div className="calc-metric">
                                <span className="calc-metric-value">{results.hoursPerVisit}</span>
                                <span className="calc-metric-label">hrs/visit</span>
                            </div>
                            <div className="calc-metric">
                                <span className="calc-metric-value">{results.visitsPerMonth}</span>
                                <span className="calc-metric-label">visits/mo</span>
                            </div>
                            <div className="calc-metric">
                                <span className="calc-metric-value">{results.totalHoursPerMonth}</span>
                                <span className="calc-metric-label">hrs/mo</span>
                            </div>
                            <div className="calc-metric">
                                <span className="calc-metric-value">{fmt(results.effectiveHourlyRate)}</span>
                                <span className="calc-metric-label">eff. $/hr</span>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="calc-breakdown">
                            <h4 style={{ color: "white", fontSize: "0.875rem", marginBottom: "0.75rem" }}>Cost Breakdown</h4>
                            {[
                                { label: "Labor", value: results.laborCostPerMonth },
                                { label: "Payroll Tax", value: results.payrollTaxCost },
                                { label: "Supplies", value: results.supplyCostPerMonth },
                                { label: "Overhead", value: results.overheadCost },
                                { label: "Profit", value: results.profitAmount },
                            ].map((item) => (
                                <div key={item.label} className="calc-breakdown-row">
                                    <span>{item.label}</span>
                                    <span>{fmt(item.value)}</span>
                                </div>
                            ))}
                            <div className="calc-breakdown-row calc-breakdown-total">
                                <span>Total</span>
                                <span>{fmt(results.totalPricePerMonth)}</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ marginTop: "1.5rem" }}>
                            <a
                                href="/app/login?mode=signup"
                                className="calc-btn calc-btn-primary"
                                style={{ width: "100%", textDecoration: "none", textAlign: "center", display: "block", fontSize: "0.9375rem" }}
                            >
                                Save Bid — Start 14-Day Free Trial
                            </a>
                            <p style={{ color: "#8b92b3", fontSize: "0.75rem", textAlign: "center", marginTop: "0.5rem" }}>
                                No credit card required · Full Bid Plus features
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

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
    type CalculatorInputs,
    type Frequency,
} from "../../lib/calculator";

function fmt(n: number): string {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type ProposalStep = "idle" | "form" | "submitted";

export default function CalculatorPage() {
    const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
    const [selectedState, setSelectedState] = useState("");
    const [showAdvancedTypes, setShowAdvancedTypes] = useState(false);
    const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);
    const [showScope, setShowScope] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(
        new Set(CLEANING_TASKS.filter((t) => t.defaultIncluded).map((t) => t.id))
    );

    // Lead capture / proposal state
    const [proposalStep, setProposalStep] = useState<ProposalStep>("idle");
    const [leadInfo, setLeadInfo] = useState({ name: "", email: "", phone: "", company: "", clientName: "", clientAddress: "" });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const results = useMemo(() => calculate(inputs), [inputs]);

    const popularTypes = BUILDING_TYPES.filter((t) => t.popular);
    const advancedTypes = BUILDING_TYPES.filter((t) => !t.popular);

    const update = (patch: Partial<CalculatorInputs>) =>
        setInputs((prev) => ({ ...prev, ...patch }));

    const toggleTask = (taskId: string) => {
        setSelectedTasks((prev) => {
            const next = new Set(prev);
            if (next.has(taskId)) next.delete(taskId);
            else next.add(taskId);
            return next;
        });
    };

    const includedTaskCount = selectedTasks.size;
    const totalTaskCount = CLEANING_TASKS.length;

    const handleStateChange = (stateCode: string) => {
        setSelectedState(stateCode);
        if (stateCode) {
            const defaults = getStateDefaults(stateCode);
            if (defaults) {
                update(defaults);
                // Auto-show financial details so they see what was filled
                if (!showAdvancedInputs) setShowAdvancedInputs(true);
            }
        }
    };

    const selectedStateData = STATES.find((s) => s.code === selectedState);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateAndSubmitLead = async () => {
        const errors: Record<string, string> = {};
        if (!leadInfo.name.trim()) errors.name = "Name is required";
        if (!leadInfo.email.trim()) errors.email = "Email is required";
        else if (!leadInfo.email.includes("@") || !leadInfo.email.includes("."))
            errors.email = "Enter a valid email";
        if (!leadInfo.clientName.trim()) errors.clientName = "Client name is required";
        if (!leadInfo.clientAddress.trim()) errors.clientAddress = "Client address is required";
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        try {
            const proposalData = {
                lead: leadInfo,
                estimate: results,
                inputs: {
                    buildingType: BUILDING_TYPES.find((t) => t.id === inputs.buildingTypeId)?.name || inputs.buildingTypeId,
                    sqft: inputs.sqft,
                    frequency: FREQUENCIES.find((f) => f.value === inputs.frequency)?.label || inputs.frequency,
                    hourlyRate: inputs.wageRate,
                    profitMargin: inputs.profitPercent,
                    overheadPercent: inputs.overheadPercent,
                    supplyCostPerSqft: inputs.supplyCostPerSqft,
                    payrollTaxPercent: inputs.payrollTaxPercent,
                },
                state: selectedState,
                includedTasks: CLEANING_TASKS.filter((t) => selectedTasks.has(t.id)),
            };

            const res = await fetch("/api/proposal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(proposalData),
            });

            if (!res.ok) throw new Error("Failed to send proposal");
            setProposalStep("submitted");
        } catch (err) {
            console.error("Proposal error:", err);
            setFormErrors({ submit: "Something went wrong. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const costBreakdown = [
        { label: "Labor", value: results.laborCostPerMonth, color: "#00d4aa" },
        { label: "Payroll Tax", value: results.payrollTaxCost, color: "#00b894" },
        { label: "Supplies", value: results.supplyCostPerMonth, color: "#0984e3" },
        { label: "Overhead", value: results.overheadCost, color: "#6c5ce7" },
        { label: "Profit", value: results.profitAmount, color: "#ff6b35" },
    ];
    const totalBar = results.totalPricePerMonth;

    return (
        <div style={{ background: "#0c0f1a", minHeight: "100vh" }}>
            {/* Header */}
            <header
                style={{
                    padding: "1.5rem 2rem",
                    borderBottom: "1px solid #2a2f47",
                    background: "rgba(12, 15, 26, 0.9)",
                    backdropFilter: "blur(16px)",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4aa", display: "inline-block", boxShadow: "0 0 12px rgba(0,212,170,0.5)" }} />
                    <span style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 800, color: "white" }}>
                        xiri<span style={{ color: "#00d4aa" }}>OS</span>
                    </span>
                </a>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <a href="/pricing" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>View Pricing</a>
                    <a href="https://os.xiri.ai/app/login?mode=signup" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>Start Free Trial</a>
                </div>
            </header>

            {/* Hero */}
            <section style={{ padding: "3rem 2rem 2rem", textAlign: "center" }}>
                <span className="section-label">
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", display: "inline-block" }} />
                    Free — no sign-up required
                </span>
                <h1 style={{ color: "white", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", marginTop: "1rem" }}>
                    Janitorial Bid <span style={{ color: "#00d4aa" }}>Calculator</span>
                </h1>
                <p style={{ color: "#c4c9e0", maxWidth: "550px", margin: "1rem auto 0", fontSize: "1rem" }}>
                    Calculate accurate cleaning bids in seconds. Powered by ISSA 612 production rates and real industry data.
                </p>
            </section>

            {/* Main Calculator */}
            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem 4rem", display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem", alignItems: "start" }}>

                {/* Left: Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                    {/* Step 1: Building Type */}
                    <div className="card" style={{ padding: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            <StepNumber n={1} />
                            <h3 style={{ color: "white", fontSize: "1.125rem", margin: 0 }}>Building Type</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem" }}>
                            {popularTypes.map((bt) => (
                                <BuildingButton key={bt.id} bt={bt} selected={inputs.buildingTypeId === bt.id} onClick={() => update({ buildingTypeId: bt.id })} />
                            ))}
                        </div>

                        {/* Advanced types toggle */}
                        <button onClick={() => setShowAdvancedTypes(!showAdvancedTypes)} style={toggleBtnStyle}>
                            <ChevronIcon open={showAdvancedTypes} />
                            {showAdvancedTypes ? "Hide" : "Show"} more building types ({advancedTypes.length})
                        </button>

                        {showAdvancedTypes && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem", marginTop: "0.75rem", animation: "fadeIn 300ms ease" }}>
                                {advancedTypes.map((bt) => (
                                    <BuildingButton key={bt.id} bt={bt} selected={inputs.buildingTypeId === bt.id} onClick={() => update({ buildingTypeId: bt.id })} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Size, Location & Frequency */}
                    <div className="card" style={{ padding: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            <StepNumber n={2} />
                            <h3 style={{ color: "white", fontSize: "1.125rem", margin: 0 }}>Size, Location & Frequency</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            {/* Square Footage */}
                            <div>
                                <label style={labelStyle}>Square Footage</label>
                                <input
                                    type="number"
                                    value={inputs.sqft}
                                    onChange={(e) => update({ sqft: Math.max(500, parseInt(e.target.value) || 500) })}
                                    style={inputStyle}
                                />
                                <input
                                    type="range" min={500} max={200000} step={500}
                                    value={inputs.sqft}
                                    onChange={(e) => update({ sqft: parseInt(e.target.value) })}
                                    style={{ width: "100%", marginTop: "0.5rem", accentColor: "#00d4aa" }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#8b92b3" }}>
                                    <span>500</span>
                                    <span>200,000 sqft</span>
                                </div>
                            </div>

                            {/* State Selector */}
                            <div>
                                <label style={labelStyle}>Your State</label>
                                <select
                                    value={selectedState}
                                    onChange={(e) => handleStateChange(e.target.value)}
                                    style={{
                                        ...inputStyle,
                                        appearance: "none",
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%238b92b3' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "right 0.75rem center",
                                        paddingRight: "2rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    <option value="" style={{ background: "#1e2235" }}>Select state...</option>
                                    {STATES.map((s) => (
                                        <option key={s.code} value={s.code} style={{ background: "#1e2235" }}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedStateData && (
                                    <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", background: "rgba(0,212,170,0.06)", borderRadius: "0.5rem", border: "1px solid rgba(0,212,170,0.15)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.25rem" }}>
                                            <span style={{ color: "#00d4aa", fontSize: "0.75rem" }}>✓</span>
                                            <span style={{ color: "#00d4aa", fontSize: "0.75rem", fontWeight: 600 }}>
                                                Auto-filled for {selectedStateData.name}
                                            </span>
                                        </div>
                                        <span style={{ color: "#8b92b3", fontSize: "0.6875rem" }}>
                                            Rec. wage: ${selectedStateData.recommendedWage.toFixed(2)}/hr · Payroll tax: {selectedStateData.payrollTaxPercent}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Frequency — full width */}
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>Cleaning Frequency</label>
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {FREQUENCIES.map((f) => (
                                        <button
                                            key={f.value}
                                            onClick={() => update({ frequency: f.value as Frequency })}
                                            style={{
                                                flex: "1 1 auto",
                                                padding: "0.625rem 1rem",
                                                background: inputs.frequency === f.value ? "rgba(0,212,170,0.12)" : "#1e2235",
                                                border: inputs.frequency === f.value ? "1.5px solid #00d4aa" : "1px solid #2a2f47",
                                                borderRadius: "0.5rem",
                                                cursor: "pointer",
                                                color: inputs.frequency === f.value ? "#00d4aa" : "#c4c9e0",
                                                fontSize: "0.8125rem",
                                                fontFamily: "var(--font-dm-sans)",
                                                fontWeight: inputs.frequency === f.value ? 600 : 400,
                                                textAlign: "center",
                                                transition: "all 150ms ease",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Cleaning Scope (collapsed by default) */}
                    <div className="card" style={{ padding: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showScope ? "1.5rem" : 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <StepNumber n={3} />
                                <div>
                                    <h3 style={{ color: "white", fontSize: "1.125rem", margin: 0 }}>Cleaning Scope</h3>
                                    <p style={{ color: "#8b92b3", fontSize: "0.8125rem", margin: "0.25rem 0 0" }}>
                                        {includedTaskCount} of {totalTaskCount} tasks included · Based on {BUILDING_TYPES.find((b) => b.id === inputs.buildingTypeId)?.name ?? "your building"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowScope(!showScope)}
                                style={{
                                    background: showScope ? "rgba(255,71,87,0.08)" : "rgba(0,212,170,0.08)",
                                    border: "1px solid",
                                    borderColor: showScope ? "rgba(255,71,87,0.2)" : "rgba(0,212,170,0.2)",
                                    color: showScope ? "#ff4757" : "#00d4aa",
                                    padding: "0.375rem 0.875rem",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontFamily: "var(--font-dm-sans)",
                                }}
                            >
                                {showScope ? "Hide" : "Customize"}
                            </button>
                        </div>

                        {showScope && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", animation: "fadeIn 300ms ease" }}>
                                {TASK_CATEGORIES.map((cat) => {
                                    const tasks = CLEANING_TASKS.filter((t) => t.category === cat.id);
                                    return (
                                        <div key={cat.id}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                                                <span style={{ fontSize: "1rem" }}>{cat.icon}</span>
                                                <span style={{ color: "#c4c9e0", fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{cat.label}</span>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                                                {tasks.map((task) => {
                                                    const checked = selectedTasks.has(task.id);
                                                    return (
                                                        <label
                                                            key={task.id}
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "0.75rem",
                                                                padding: "0.5rem 0.75rem",
                                                                background: checked ? "rgba(0,212,170,0.06)" : "transparent",
                                                                border: "1px solid",
                                                                borderColor: checked ? "rgba(0,212,170,0.2)" : "transparent",
                                                                borderRadius: "0.5rem",
                                                                cursor: "pointer",
                                                                transition: "all 150ms ease",
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleTask(task.id)}
                                                                style={{ accentColor: "#00d4aa", width: 16, height: 16, cursor: "pointer" }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <span style={{ color: checked ? "white" : "#8b92b3", fontSize: "0.875rem", fontWeight: 500 }}>{task.name}</span>
                                                            </div>
                                                            {cat.id === "specialty" && (
                                                                <span style={{ color: "#6c5ce7", fontSize: "0.6875rem", fontWeight: 600, background: "rgba(108,92,231,0.1)", padding: "0.125rem 0.5rem", borderRadius: "9999px" }}>Add-on</span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Step 4: Financial Inputs (Advanced Toggle) */}
                    <div className="card" style={{ padding: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showAdvancedInputs ? "1.5rem" : 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <StepNumber n={4} />
                                <div>
                                    <h3 style={{ color: "white", fontSize: "1.125rem", margin: 0 }}>Financial Details</h3>
                                    <p style={{ color: "#8b92b3", fontSize: "0.8125rem", margin: "0.25rem 0 0" }}>
                                        {selectedState ? `Customized for ${selectedStateData?.name ?? selectedState}` : "Select a state above to auto-fill, or customize"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    background: showAdvancedInputs ? "rgba(0,212,170,0.1)" : "#1e2235",
                                    border: "1px solid #2a2f47",
                                    borderRadius: "9999px",
                                    cursor: "pointer",
                                    color: "#00d4aa",
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    fontFamily: "var(--font-dm-sans)",
                                    transition: "all 200ms ease",
                                }}
                            >
                                {showAdvancedInputs ? "Hide" : "Customize"}
                            </button>
                        </div>

                        {showAdvancedInputs && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", animation: "fadeIn 300ms ease" }}>
                                {/* Wage Rate */}
                                <div>
                                    <label style={labelStyle}>Hourly Wage Rate</label>
                                    <div style={{ position: "relative" }}>
                                        <span style={prefixStyle}>$</span>
                                        <input type="number" value={inputs.wageRate} step={0.5} min={7.25}
                                            onChange={(e) => update({ wageRate: parseFloat(e.target.value) || 15 })}
                                            style={{ ...inputStyle, paddingLeft: "1.5rem" }} />
                                    </div>
                                    {selectedStateData && (
                                        <span style={{ ...hintStyle, color: "#00d4aa" }}>
                                            {selectedStateData.name} avg: ${selectedStateData.recommendedWage.toFixed(2)}/hr
                                        </span>
                                    )}
                                </div>

                                {/* Payroll Tax */}
                                <div>
                                    <label style={labelStyle}>Payroll Tax %</label>
                                    <div style={{ position: "relative" }}>
                                        <input type="number" value={inputs.payrollTaxPercent} step={0.5} min={0} max={50}
                                            onChange={(e) => update({ payrollTaxPercent: parseFloat(e.target.value) || 0 })}
                                            style={inputStyle} />
                                        <span style={suffixStyle}>%</span>
                                    </div>
                                    <span style={hintStyle}>FICA + SUTA + FUTA + WC</span>
                                </div>

                                {/* Overhead */}
                                <div>
                                    <label style={labelStyle}>Overhead %</label>
                                    <div style={{ position: "relative" }}>
                                        <input type="number" value={inputs.overheadPercent} step={1} min={0} max={50}
                                            onChange={(e) => update({ overheadPercent: parseFloat(e.target.value) || 0 })}
                                            style={inputStyle} />
                                        <span style={suffixStyle}>%</span>
                                    </div>
                                    <span style={hintStyle}>Equipment, insurance, admin</span>
                                </div>

                                {/* Profit Margin */}
                                <div>
                                    <label style={labelStyle}>Profit Margin %</label>
                                    <input
                                        type="range" min={5} max={40} step={1}
                                        value={inputs.profitPercent}
                                        onChange={(e) => update({ profitPercent: parseInt(e.target.value) })}
                                        style={{ width: "100%", accentColor: "#ff6b35", marginTop: "0.5rem" }}
                                    />
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                                        <span style={hintStyle}>5%</span>
                                        <span style={{ color: "#ff6b35", fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>{inputs.profitPercent}%</span>
                                        <span style={hintStyle}>40%</span>
                                    </div>
                                </div>

                                {/* Supply Cost */}
                                <div style={{ gridColumn: "span 2" }}>
                                    <label style={labelStyle}>Supply Cost per Sqft (per visit)</label>
                                    <div style={{ position: "relative" }}>
                                        <span style={prefixStyle}>$</span>
                                        <input type="number" value={inputs.supplyCostPerSqft} step={0.001} min={0}
                                            onChange={(e) => update({ supplyCostPerSqft: parseFloat(e.target.value) || 0 })}
                                            style={{ ...inputStyle, paddingLeft: "1.5rem" }} />
                                    </div>
                                    <span style={hintStyle}>Industry avg: $0.002–$0.005 per sqft</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Live Results */}
                <div style={{ position: "sticky", top: "100px" }}>
                    <div
                        style={{
                            background: "linear-gradient(135deg, #141829 0%, #1e2235 100%)",
                            border: "1px solid #2a2f47",
                            borderRadius: "1.25rem",
                            overflow: "hidden",
                        }}
                    >
                        {/* Price Header */}
                        <div style={{ padding: "2rem 2rem 1.5rem", textAlign: "center", borderBottom: "1px solid #2a2f47" }}>
                            <p style={{ color: "#8b92b3", fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                                Estimated Monthly Price
                            </p>
                            <div style={{ marginTop: "0.75rem" }}>
                                <span style={{ fontFamily: "var(--font-outfit)", fontSize: "3rem", fontWeight: 800, color: "#00d4aa" }}>
                                    ${fmt(results.totalPricePerMonth)}
                                </span>
                                <span style={{ color: "#8b92b3", fontSize: "0.875rem" }}>/month</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
                                <div>
                                    <div style={{ color: "white", fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "1rem" }}>
                                        ${fmt(results.pricePerVisit)}
                                    </div>
                                    <div style={{ color: "#8b92b3", fontSize: "0.75rem" }}>per visit</div>
                                </div>
                                <div style={{ width: 1, background: "#2a2f47" }} />
                                <div>
                                    <div style={{ color: "white", fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "1rem" }}>
                                        ${results.pricePerSqft.toFixed(3)}
                                    </div>
                                    <div style={{ color: "#8b92b3", fontSize: "0.75rem" }}>per sqft</div>
                                </div>
                            </div>
                        </div>

                        {/* Time Breakdown */}
                        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #2a2f47" }}>
                            <p style={sectionLabel}>Time Estimate</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", textAlign: "center" }}>
                                <StatBox value={results.hoursPerVisit} label="hrs/visit" />
                                <StatBox value={results.visitsPerMonth} label="visits/mo" />
                                <StatBox value={results.totalHoursPerMonth} label="total hrs" />
                            </div>
                        </div>

                        {/* Cost Breakdown Bar */}
                        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #2a2f47" }}>
                            <p style={sectionLabel}>Cost Breakdown</p>
                            <div style={{ display: "flex", borderRadius: "6px", overflow: "hidden", height: "12px", marginBottom: "1rem" }}>
                                {costBreakdown.map((item) => (
                                    <div key={item.label} style={{ width: `${(item.value / totalBar) * 100}%`, background: item.color, transition: "width 300ms ease", minWidth: item.value > 0 ? "2px" : 0 }} />
                                ))}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {costBreakdown.map((item) => (
                                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, display: "inline-block" }} />
                                            <span style={{ color: "#c4c9e0", fontSize: "0.8125rem" }}>{item.label}</span>
                                        </div>
                                        <span style={{ color: "white", fontSize: "0.8125rem", fontWeight: 600, fontFamily: "var(--font-outfit)" }}>
                                            ${fmt(item.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fixtures */}
                        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #2a2f47" }}>
                            <p style={sectionLabel}>Estimated Restroom Fixtures</p>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <FixtureBox value={results.estimatedFixtures.toilets} label="Toilets" />
                                <FixtureBox value={results.estimatedFixtures.urinals} label="Urinals" />
                                <FixtureBox value={results.estimatedFixtures.sinks} label="Sinks" />
                            </div>
                        </div>

                        {/* Effective Rate */}
                        <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid #2a2f47", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>Effective Hourly Rate</span>
                            <span style={{ color: "white", fontWeight: 700, fontFamily: "var(--font-outfit)", fontSize: "1.125rem" }}>
                                ${fmt(results.effectiveHourlyRate)}/hr
                            </span>
                        </div>

                        {/* Lead Capture / Proposal CTA */}
                        <div style={{ padding: "1.5rem 2rem" }}>
                            {proposalStep === "idle" && (
                                <>
                                    <p style={{ color: "white", fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "0.9375rem", margin: "0 0 0.375rem" }}>
                                        📄 Get a Client-Ready Bid Proposal
                                    </p>
                                    <p style={{ color: "#8b92b3", fontSize: "0.8125rem", margin: "0 0 0.75rem" }}>
                                        We&apos;ll generate a professional bid proposal you can send directly to your prospective client — free.
                                    </p>
                                    <button
                                        onClick={() => setProposalStep("form")}
                                        className="btn btn-primary"
                                        style={{ width: "100%", fontSize: "0.875rem", padding: "0.75rem" }}
                                        id="get-proposal-btn"
                                    >
                                        Generate My Free Bid Proposal
                                    </button>
                                </>
                            )}

                            {proposalStep === "form" && (
                                <div style={{ animation: "fadeIn 300ms ease" }}>
                                    <p style={{ color: "white", fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "0.9375rem", margin: "0 0 0.25rem" }}>
                                        📄 Complete Your Proposal
                                    </p>
                                    <p style={{ color: "#8b92b3", fontSize: "0.8125rem", margin: "0 0 1rem" }}>
                                        We&apos;ll include your client&apos;s info and scope in a professional PDF.
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {/* Client info for the proposal */}
                                        <div style={{ borderBottom: "1px solid #2a2f47", paddingBottom: "0.75rem" }}>
                                            <span style={{ color: "#8b92b3", fontSize: "0.6875rem", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600 }}>Client Details (on the proposal)</span>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Client / property name"
                                                value={leadInfo.clientName}
                                                onChange={(e) => setLeadInfo({ ...leadInfo, clientName: e.target.value })}
                                                style={{ ...inputStyle, ...(formErrors.clientName ? { borderColor: "#ff4757" } : {}) }}
                                            />
                                            {formErrors.clientName && <span style={{ color: "#ff4757", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{formErrors.clientName}</span>}
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Client address"
                                                value={leadInfo.clientAddress}
                                                onChange={(e) => setLeadInfo({ ...leadInfo, clientAddress: e.target.value })}
                                                style={{ ...inputStyle, ...(formErrors.clientAddress ? { borderColor: "#ff4757" } : {}) }}
                                            />
                                            {formErrors.clientAddress && <span style={{ color: "#ff4757", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{formErrors.clientAddress}</span>}
                                        </div>
                                        <div style={{ borderBottom: "1px solid #2a2f47", paddingBottom: "0.75rem" }}>
                                            <span style={{ color: "#8b92b3", fontSize: "0.6875rem", textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600 }}>Your Contact Info</span>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Your name"
                                                value={leadInfo.name}
                                                onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                                                style={{ ...inputStyle, ...(formErrors.name ? { borderColor: "#ff4757" } : {}) }}
                                            />
                                            {formErrors.name && <span style={{ color: "#ff4757", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{formErrors.name}</span>}
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                placeholder="you@company.com"
                                                value={leadInfo.email}
                                                onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                                                style={{ ...inputStyle, ...(formErrors.email ? { borderColor: "#ff4757" } : {}) }}
                                            />
                                            {formErrors.email && <span style={{ color: "#ff4757", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>{formErrors.email}</span>}
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Phone (optional)"
                                            value={leadInfo.phone}
                                            onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Company name (optional)"
                                            value={leadInfo.company}
                                            onChange={(e) => setLeadInfo({ ...leadInfo, company: e.target.value })}
                                            style={inputStyle}
                                        />
                                        <button
                                            onClick={validateAndSubmitLead}
                                            className="btn btn-primary"
                                            style={{ width: "100%", fontSize: "0.875rem", padding: "0.75rem" }}
                                        >
                                            Generate & Send Bid Proposal
                                        </button>
                                        <div style={{ textAlign: "center" }}>
                                            <span style={{ color: "#8b92b3", fontSize: "0.6875rem" }}>
                                                🔒 We&apos;ll never share your info. No spam, ever.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {proposalStep === "submitted" && (
                                <div style={{ textAlign: "center", padding: "0.5rem 0", animation: "fadeIn 300ms ease" }}>
                                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,212,170,0.1)", border: "2px solid #00d4aa", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", fontSize: "1.25rem" }}>
                                        ✓
                                    </div>
                                    <p style={{ color: "#00d4aa", fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-outfit)", margin: "0 0 0.375rem" }}>
                                        Your bid proposal is on the way!
                                    </p>
                                    <p style={{ color: "#8b92b3", fontSize: "0.8125rem", margin: "0 0 1.25rem" }}>
                                        Check <strong style={{ color: "#c4c9e0" }}>{leadInfo.email}</strong> — your client-ready bid proposal for <strong style={{ color: "#c4c9e0" }}>{leadInfo.clientName || "your client"}</strong> will arrive shortly.
                                    </p>
                                    <div style={{ padding: "1rem", background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: "0.75rem" }}>
                                        <p style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, margin: "0 0 0.375rem" }}>
                                            🚀 Save this bid & track your pipeline
                                        </p>
                                        <p style={{ color: "#8b92b3", fontSize: "0.8125rem", margin: "0 0 0.75rem" }}>
                                            Create a free account to manage bids, contacts, and send branded proposals — 14-day Bid Plus trial included.
                                        </p>
                                        <a
                                            href="https://os.xiri.ai/app/login?mode=signup"
                                            className="btn btn-primary"
                                            style={{ width: "100%", fontSize: "0.875rem", padding: "0.75rem" }}
                                        >
                                            Create Free Account →
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA card below results */}
                    <div
                        style={{
                            marginTop: "1.5rem",
                            padding: "1.5rem",
                            background: "rgba(0,212,170,0.04)",
                            border: "1px solid rgba(0,212,170,0.15)",
                            borderRadius: "1rem",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ color: "white", fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "0.9375rem", margin: 0 }}>
                            Want to create branded proposals yourself?
                        </p>
                        <p style={{ color: "#8b92b3", fontSize: "0.8125rem", margin: "0.5rem 0 1rem" }}>
                            xiriOS turns estimates into professional PDF proposals, tracks leads, and manages your cleaning business.
                        </p>
                        <a href="https://os.xiri.ai/app/login?mode=signup" className="btn btn-primary" style={{ width: "100%", fontSize: "0.875rem" }}>
                            Start 14-Day Free Trial
                        </a>
                    </div>
                </div>
            </main>

            {/* Responsive override */}
            <style jsx>{`
        @media (max-width: 900px) {
          main {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

// ── Extracted mini-components ──

function StepNumber({ n }: { n: number }) {
    return (
        <span style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,212,170,0.1)", border: "2px solid #00d4aa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "0.8125rem", color: "#00d4aa" }}>
            {n}
        </span>
    );
}

function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms ease" }}>
            <path d="M4 6l4 4 4-4" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BuildingButton({ bt, selected, onClick }: { bt: { id: string; icon: string; name: string }; selected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "1rem 0.75rem",
                background: selected ? "rgba(0,212,170,0.12)" : "#1e2235",
                border: selected ? "2px solid #00d4aa" : "1px solid #2a2f47",
                borderRadius: "0.75rem",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 200ms ease",
                color: selected ? "white" : "#8b92b3",
            }}
        >
            <span style={{ fontSize: "1.5rem" }}>{bt.icon}</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, fontFamily: "var(--font-dm-sans)", textAlign: "center" }}>{bt.name}</span>
        </button>
    );
}

function StatBox({ value, label }: { value: number; label: string }) {
    return (
        <div>
            <div style={{ color: "white", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>{value}</div>
            <div style={{ color: "#8b92b3", fontSize: "0.75rem" }}>{label}</div>
        </div>
    );
}

function FixtureBox({ value, label }: { value: number; label: string }) {
    return (
        <div style={{ flex: 1, textAlign: "center", padding: "0.5rem", background: "#1e2235", borderRadius: "0.5rem" }}>
            <div style={{ color: "white", fontWeight: 700, fontFamily: "var(--font-outfit)", fontSize: "1.125rem" }}>{value}</div>
            <div style={{ color: "#8b92b3", fontSize: "0.75rem" }}>{label}</div>
        </div>
    );
}

// ── Shared styles ──

const labelStyle: React.CSSProperties = {
    display: "block", color: "#8b92b3", fontSize: "0.8125rem", fontWeight: 600,
    marginBottom: "0.5rem", textTransform: "uppercase" as const, letterSpacing: "0.04em",
};

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", background: "#1e2235",
    border: "1px solid #2a2f47", borderRadius: "0.625rem", color: "white",
    fontSize: "1rem", fontFamily: "var(--font-dm-sans)", outline: "none",
};

const hintStyle: React.CSSProperties = {
    display: "block", color: "#8b92b3", fontSize: "0.75rem", marginTop: "0.375rem",
};

const sectionLabel: React.CSSProperties = {
    color: "#8b92b3", fontSize: "0.75rem", fontWeight: 600,
    textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "0.75rem",
};

const prefixStyle: React.CSSProperties = {
    position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#8b92b3",
};

const suffixStyle: React.CSSProperties = {
    position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#8b92b3",
};

const toggleBtnStyle: React.CSSProperties = {
    marginTop: "1rem", background: "none", border: "none", color: "#00d4aa",
    cursor: "pointer", fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem",
    fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0",
};

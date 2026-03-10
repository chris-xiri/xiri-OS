"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { trackToolUsed, trackCtaClick } from "../../../lib/analytics";

/* ── Embedded data (BLS tax + overhead rates) ── */
const PAYROLL_TAX = 0.0765;          // FICA (Social Security 6.2% + Medicare 1.45%)
const FUTA_RATE = 0.006;             // Federal unemployment
const SUTA_AVG = 0.027;              // State unemployment (national avg)
const WORKERS_COMP_RATE = 0.037;     // Workers comp – janitorial avg
const OVERHEAD_DEFAULT = 0.15;       // 15% general overhead
const PROFIT_DEFAULT = 0.10;         // 10% profit margin

const DEFAULTS = {
    sqft: 10000,
    pricePerSqFt: 0.10,
    frequency: 5,         // 5×/week
    laborRateHr: 16.29,   // BLS national median
    productionRate: 3500,  // sq ft/hr (ISSA standard)
    supplyCostPct: 0.03,  // 3% of revenue
};

export default function ProfitCalculatorTool({ faqs }: { faqs?: { q: string; a: string }[] }) {
    const [sqft, setSqft] = useState(DEFAULTS.sqft);
    const [pricePerSqFt, setPricePerSqFt] = useState(DEFAULTS.pricePerSqFt);
    const [frequency, setFrequency] = useState(DEFAULTS.frequency);
    const [laborRate, setLaborRate] = useState(DEFAULTS.laborRateHr);
    const [productionRate, setProductionRate] = useState(DEFAULTS.productionRate);
    const [overheadPct, setOverheadPct] = useState(OVERHEAD_DEFAULT);

    const calc = useMemo(() => {
        const cleaningsPerMonth = frequency * 4.33;
        const monthlyRevenue = sqft * pricePerSqFt * cleaningsPerMonth;

        const hoursPerCleaning = sqft / productionRate;
        const monthlyLaborHours = hoursPerCleaning * cleaningsPerMonth;
        const baseLaborCost = monthlyLaborHours * laborRate;
        const payrollTax = baseLaborCost * (PAYROLL_TAX + FUTA_RATE + SUTA_AVG + WORKERS_COMP_RATE);
        const totalLaborCost = baseLaborCost + payrollTax;

        const supplyCost = monthlyRevenue * DEFAULTS.supplyCostPct;
        const overheadCost = monthlyRevenue * overheadPct;

        const totalCost = totalLaborCost + supplyCost + overheadCost;
        const profit = monthlyRevenue - totalCost;
        const margin = monthlyRevenue > 0 ? (profit / monthlyRevenue) * 100 : 0;

        return {
            monthlyRevenue,
            baseLaborCost,
            payrollTax,
            totalLaborCost,
            supplyCost,
            overheadCost,
            totalCost,
            profit,
            margin,
            hoursPerCleaning,
            monthlyLaborHours,
            cleaningsPerMonth,
        };
    }, [sqft, pricePerSqFt, frequency, laborRate, productionRate, overheadPct]);

    /* Track tool usage when user interacts (debounced via dependency) */
    useEffect(() => {
        if (calc.monthlyRevenue > 0) {
            trackToolUsed("profit_calculator", { sqft, monthly_profit: Math.round(calc.profit) });
        }
    }, [calc.monthlyRevenue]); // eslint-disable-line react-hooks/exhaustive-deps

    const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <>
            <Navbar />

            {/* Hero */}
            <section
                className="section noise"
                style={{
                    minHeight: "40vh",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "120px",
                    paddingBottom: "2rem",
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div className="section-inner" style={{ textAlign: "center", width: "100%" }}>
                    <span className="section-label">🧮 Free Tool</span>
                    <h1>
                        Cleaning Contract{" "}
                        <span style={{ color: "#00d4aa" }}>Profit Calculator</span>
                    </h1>
                    <p style={{ fontSize: "1.125rem", maxWidth: "640px", margin: "1rem auto 0", color: "#c4c9e0" }}>
                        Enter your contract details and see exactly how much profit you&apos;ll make — with labor, payroll taxes, supplies, and overhead all broken out.
                    </p>
                </div>
            </section>

            {/* Calculator */}
            <section className="section" style={{ background: "#141829", paddingTop: "2rem" }}>
                <div className="section-inner" style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        {/* Inputs */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                                Contract Details
                            </h2>
                            {[
                                { label: "Building Size (sq ft)", value: sqft, set: setSqft, min: 500, max: 500000, step: 500 },
                                { label: "Price per Sq Ft ($)", value: pricePerSqFt, set: setPricePerSqFt, min: 0.01, max: 1, step: 0.01 },
                                { label: "Cleanings per Week", value: frequency, set: setFrequency, min: 1, max: 7, step: 1 },
                                { label: "Labor Rate ($/hr)", value: laborRate, set: setLaborRate, min: 7.25, max: 35, step: 0.25 },
                                { label: "Production Rate (sq ft/hr)", value: productionRate, set: setProductionRate, min: 1000, max: 8000, step: 250 },
                                { label: "Overhead %", value: overheadPct, set: setOverheadPct, min: 0.05, max: 0.35, step: 0.01 },
                            ].map((f) => (
                                <div key={f.label}>
                                    <label style={{ display: "flex", justifyContent: "space-between", color: "#c4c9e0", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                                        <span>{f.label}</span>
                                        <span style={{ color: "#00d4aa", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>
                                            {f.step < 1 ? f.value.toFixed(2) : f.value.toLocaleString()}
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min={f.min}
                                        max={f.max}
                                        step={f.step}
                                        value={f.value}
                                        onChange={(e) => f.set(Number(e.target.value))}
                                        style={{ width: "100%", accentColor: "#00d4aa" }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Results */}
                        <div>
                            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                                Monthly Breakdown
                            </h2>
                            <div className="card" style={{ marginBottom: "1rem" }}>
                                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                                    <div style={{ color: "#8b92b3", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly Profit</div>
                                    <div style={{ fontFamily: "var(--font-outfit)", fontSize: "2.5rem", fontWeight: 800, color: calc.profit >= 0 ? "#00d4aa" : "#ef4444" }}>
                                        {fmt(calc.profit)}
                                    </div>
                                    <div style={{ color: calc.margin >= 0 ? "#00d4aa" : "#ef4444", fontSize: "0.875rem", fontWeight: 700 }}>
                                        {calc.margin.toFixed(1)}% margin
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {[
                                        { label: "Monthly Revenue", value: fmt(calc.monthlyRevenue), color: "white" },
                                        { label: `Base Labor (${calc.monthlyLaborHours.toFixed(0)} hrs)`, value: `-${fmt(calc.baseLaborCost)}`, color: "#ef4444" },
                                        { label: "Payroll Tax (FICA + UI + WC)", value: `-${fmt(calc.payrollTax)}`, color: "#ef4444" },
                                        { label: "Supplies (3%)", value: `-${fmt(calc.supplyCost)}`, color: "#ef4444" },
                                        { label: `Overhead (${(overheadPct * 100).toFixed(0)}%)`, value: `-${fmt(calc.overheadCost)}`, color: "#ef4444" },
                                    ].map((r) => (
                                        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                            <span style={{ color: "#8b92b3", fontSize: "0.875rem" }}>{r.label}</span>
                                            <span style={{ color: r.color, fontSize: "0.875rem", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>{r.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sources */}
                    <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.1)", borderRadius: "10px" }}>
                        <h3 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#00d4aa", marginBottom: "0.5rem" }}>Data Sources</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            {[
                                { text: "National median janitor wage ($16.29/hr): BLS OEWS May 2024", url: "https://www.bls.gov/oes/current/oes372011.htm" },
                                { text: "FICA rate (7.65%): Social Security Administration", url: "https://www.ssa.gov/oact/cola/cbb.html" },
                                { text: "Workers Comp rate (~3.7%): NCCI janitorial class code 9014", url: "https://www.ncci.com/" },
                                { text: "ISSA production rates (2,500–5,000 sq ft/hr): ISSA 612 Standard", url: "https://www.issa.com/certification/cims" },
                            ].map((s) => (
                                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#8b92b3", textDecoration: "none" }}>
                                    📎 {s.text}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ — drives FAQPage schema + featured snippet eligibility */}
            {faqs && faqs.length > 0 && (
                <section className="section" style={{ background: "#0c0f1a", paddingTop: "2rem", paddingBottom: "2rem" }}>
                    <div className="section-inner" style={{ maxWidth: "760px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                            Frequently Asked <span style={{ color: "#00d4aa" }}>Questions</span>
                        </h2>
                        {faqs.map((f, i) => (
                            <details
                                key={i}
                                style={{
                                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    padding: "1rem 0",
                                }}
                            >
                                <summary
                                    style={{
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        cursor: "pointer",
                                        listStyle: "none",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    {f.q}
                                    <span style={{ color: "#00d4aa", fontSize: "1.25rem", marginLeft: "1rem" }}>+</span>
                                </summary>
                                <p style={{ color: "#c4c9e0", fontSize: "0.9375rem", lineHeight: 1.7, marginTop: "0.75rem" }}>
                                    {f.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="section" style={{ background: "#0c0f1a", textAlign: "center" }}>
                <div className="section-inner" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h2 style={{ marginBottom: "1rem" }}>
                        Want a <span style={{ color: "#00d4aa" }}>full bid</span> with room-level scope?
                    </h2>
                    <p style={{ color: "#8b92b3", marginBottom: "2rem" }}>
                        Our full calculator breaks down bids by room, task, and frequency — with BLS metro-specific wages for your area.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/calculator" className="btn btn-primary" onClick={() => trackCtaClick("Try Full Calculator", "profit_calculator")}>Try Full Calculator →</a>
                        <a href="/pricing" className="btn btn-secondary" onClick={() => trackCtaClick("View Plans", "profit_calculator")}>View Plans</a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: "#0c0f1a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "#555d7e", fontSize: "0.8125rem" }}>© {new Date().getFullYear()} XIRI LLC · Free tool — no login required.</p>
            </footer>
        </>
    );
}

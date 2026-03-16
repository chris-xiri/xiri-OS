"use client";

import { useState, useMemo, useEffect } from "react";
import { trackToolUsed, trackCtaClick } from "../../../lib/analytics";
import Navbar from "../../components/Navbar";
import StickyResultBanner from "../StickyResultBanner";

/* ── Federal & state employer cost data (government sources) ── */
const FICA_EMPLOYER = 0.0765;       // Social Security 6.2% + Medicare 1.45%
const FUTA_RATE = 0.006;            // Federal unemployment
const SUTA_RATES: Record<string, number> = {
    "National Avg": 0.027,
    "California": 0.034,
    "New York": 0.041,
    "Texas": 0.027,
    "Florida": 0.027,
    "Ohio": 0.026,
    "Illinois": 0.032,
    "Pennsylvania": 0.036,
    "Michigan": 0.029,
    "Georgia": 0.024,
    "North Carolina": 0.012,
};
const WC_RATE = 0.037;               // Workers comp — janitorial class code 9014
const HEALTH_INSURANCE_ANNUAL = 7911; // BLS – employer cost for single coverage 2024
const BENEFITS_PCT = 0.077;           // Paid leave, sick time, etc.

export default function EmployeeCostTool({ faqs }: { faqs?: { q: string; a: string }[] }) {
    const [hourlyWage, setHourlyWage] = useState(16.29);
    const [hoursPerWeek, setHoursPerWeek] = useState(40);
    const [state, setState] = useState("National Avg");
    const [includeHealth, setIncludeHealth] = useState(false);

    const sutaRate = SUTA_RATES[state] || 0.027;

    const calc = useMemo(() => {
        const annualWage = hourlyWage * hoursPerWeek * 52;
        const monthlyWage = annualWage / 12;

        const ficaAnn = annualWage * FICA_EMPLOYER;
        const futaAnn = Math.min(annualWage, 7000) * FUTA_RATE;
        const sutaAnn = Math.min(annualWage, 12000) * sutaRate; // avg taxable limit
        const wcAnn = annualWage * WC_RATE;
        const benefitsAnn = annualWage * BENEFITS_PCT;
        const healthAnn = includeHealth ? HEALTH_INSURANCE_ANNUAL : 0;

        const totalTaxesAnn = ficaAnn + futaAnn + sutaAnn + wcAnn;
        const totalBenefitsAnn = benefitsAnn + healthAnn;
        const totalCostAnn = annualWage + totalTaxesAnn + totalBenefitsAnn;
        const effectiveRate = hoursPerWeek > 0 ? totalCostAnn / (hoursPerWeek * 52) : 0;
        const multiplier = hourlyWage > 0 ? totalCostAnn / annualWage : 0;

        return {
            annualWage, monthlyWage,
            ficaAnn, futaAnn, sutaAnn, wcAnn,
            totalTaxesAnn, benefitsAnn, healthAnn, totalBenefitsAnn,
            totalCostAnn, effectiveRate, multiplier,
        };
    }, [hourlyWage, hoursPerWeek, sutaRate, includeHealth]);

    const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .tool-hero-ec { min-height: auto !important; padding-top: 80px !important; padding-bottom: 1rem !important; }
                    .tool-hero-ec h1 { font-size: 1.5rem !important; }
                    .tool-hero-ec p { font-size: 0.9375rem !important; margin-top: 0.5rem !important; }
                    .ec-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
                    .sticky-result-spacer-ec { height: 60px; }
                }
            `}</style>
            <Navbar />

            {/* Hero */}
            <section className="section noise tool-hero-ec" style={{ minHeight: "40vh", display: "flex", alignItems: "center", paddingTop: "120px", paddingBottom: "2rem", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 60%), #0c0f1a" }}>
                <div className="section-inner" style={{ textAlign: "center", width: "100%" }}>
                    <span className="section-label">💵 Free Tool</span>
                    <h1>Employee <span style={{ color: "#00d4aa" }}>True Cost</span> Calculator</h1>
                    <p style={{ fontSize: "1.125rem", maxWidth: "640px", margin: "1rem auto 0", color: "#c4c9e0" }}>
                        What does one janitor actually cost? FICA, unemployment, workers comp, benefits — see the real number.
                    </p>
                </div>
            </section>

            {/* Calculator */}
            <section className="section" style={{ background: "#141829", paddingTop: "2rem" }}>
                <div className="section-inner" style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div className="ec-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        {/* Inputs */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700 }}>Employee Details</h2>
                            <div>
                                <label style={{ display: "flex", justifyContent: "space-between", color: "#c4c9e0", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                                    <span>Hourly Wage</span>
                                    <span style={{ color: "#00d4aa", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>${hourlyWage.toFixed(2)}/hr</span>
                                </label>
                                <input type="range" min={7.25} max={35} step={0.25} value={hourlyWage} onChange={(e) => setHourlyWage(Number(e.target.value))} style={{ width: "100%", accentColor: "#00d4aa" }} />
                            </div>
                            <div>
                                <label style={{ display: "flex", justifyContent: "space-between", color: "#c4c9e0", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                                    <span>Hours per Week</span>
                                    <span style={{ color: "#00d4aa", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>{hoursPerWeek}</span>
                                </label>
                                <input type="range" min={10} max={50} step={5} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} style={{ width: "100%", accentColor: "#00d4aa" }} />
                            </div>
                            <div>
                                <label style={{ color: "#c4c9e0", fontSize: "0.875rem", marginBottom: "0.375rem", display: "block" }}>State (for SUTA rate)</label>
                                <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: "100%", padding: "0.625rem 0.75rem", background: "#1e2240", border: "1px solid #2a2f47", borderRadius: "8px", color: "white", fontSize: "0.875rem" }}>
                                    {Object.entries(SUTA_RATES).map(([s, r]) => (
                                        <option key={s} value={s}>{s} — {(r * 100).toFixed(1)}% SUTA</option>
                                    ))}
                                </select>
                            </div>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                                <input type="checkbox" checked={includeHealth} onChange={(e) => setIncludeHealth(e.target.checked)} style={{ accentColor: "#00d4aa", width: "18px", height: "18px" }} />
                                <span style={{ color: "#c4c9e0", fontSize: "0.875rem" }}>Include health insurance (${(HEALTH_INSURANCE_ANNUAL / 12).toFixed(0)}/mo employer share)</span>
                            </label>
                        </div>

                        {/* Results */}
                        <div>
                            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>True Annual Cost</h2>
                            <div className="card">
                                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                                    <div style={{ color: "#8b92b3", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Annual Cost</div>
                                    <div style={{ fontFamily: "var(--font-outfit)", fontSize: "2.5rem", fontWeight: 800, color: "#00d4aa" }}>
                                        {fmt(calc.totalCostAnn)}
                                    </div>
                                    <div style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>
                                        Effective rate: ${calc.effectiveRate.toFixed(2)}/hr · {calc.multiplier.toFixed(2)}× multiplier
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {[
                                        { label: "Base Wage", value: fmt(calc.annualWage), color: "white" },
                                        { label: "FICA (7.65%)", value: fmt(calc.ficaAnn), color: "#f59e0b" },
                                        { label: `FUTA (0.6% on first $7k)`, value: fmt(calc.futaAnn), color: "#f59e0b" },
                                        { label: `SUTA — ${state} (${(sutaRate * 100).toFixed(1)}%)`, value: fmt(calc.sutaAnn), color: "#f59e0b" },
                                        { label: "Workers Comp (3.7%)", value: fmt(calc.wcAnn), color: "#f59e0b" },
                                        { label: "Paid Leave / Benefits (7.7%)", value: fmt(calc.benefitsAnn), color: "#8b5cf6" },
                                        ...(includeHealth ? [{ label: "Health Insurance (employer share)", value: fmt(calc.healthAnn), color: "#8b5cf6" }] : []),
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
                                { text: "FICA rates (7.65%): Social Security Administration, 2024", url: "https://www.ssa.gov/oact/cola/cbb.html" },
                                { text: "FUTA rate (0.6%): IRS Publication 15, 2024", url: "https://www.irs.gov/publications/p15" },
                                { text: "SUTA rates by state: U.S. Department of Labor, Employment & Training Admin", url: "https://oui.doleta.gov/unemploy/statelaws.asp" },
                                { text: "Workers Comp avg (3.7%): NCCI Janitorial Class Code 9014", url: "https://www.ncci.com/" },
                                { text: "Health insurance ($7,911/yr): BLS Employer Costs for Employee Compensation, 2024", url: "https://www.bls.gov/news.release/ecec.nr0.htm" },
                            ].map((s) => (
                                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#8b92b3", textDecoration: "none" }}>📎 {s.text}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            {faqs && faqs.length > 0 && (
                <section className="section" style={{ background: "#0c0f1a", paddingTop: "2rem", paddingBottom: "2rem" }}>
                    <div className="section-inner" style={{ maxWidth: "760px", margin: "0 auto" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                            Frequently Asked <span style={{ color: "#00d4aa" }}>Questions</span>
                        </h2>
                        {faqs.map((f, i) => (
                            <details key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 0" }}>
                                <summary style={{ color: "white", fontWeight: 600, fontSize: "1rem", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    {f.q}
                                    <span style={{ color: "#00d4aa", fontSize: "1.25rem", marginLeft: "1rem" }}>+</span>
                                </summary>
                                <p style={{ color: "#c4c9e0", fontSize: "0.9375rem", lineHeight: 1.7, marginTop: "0.75rem" }}>{f.a}</p>
                            </details>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="section" style={{ background: "#0c0f1a", textAlign: "center" }}>
                <div className="section-inner" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h2>Use this in your <span style={{ color: "#00d4aa" }}>bid calculations</span></h2>
                    <p style={{ color: "#8b92b3", marginBottom: "2rem" }}>xiriOS automatically factors in payroll taxes and overhead when calculating your bid price.</p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/calculator" className="btn btn-primary" onClick={() => trackCtaClick("Try Full Calculator", "employee_cost")}>Try Full Calculator →</a>
                        <a href="/pricing" className="btn btn-secondary" onClick={() => trackCtaClick("View Plans", "employee_cost")}>View Plans</a>
                    </div>
                </div>
            </section>

            <footer style={{ background: "#0c0f1a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "#555d7e", fontSize: "0.8125rem" }}>© {new Date().getFullYear()} XIRI LLC · Free tool — no login required.</p>
            </footer>

            <div className="sticky-result-spacer-ec" />
            <StickyResultBanner
                label="Total Annual Cost"
                value={calc.totalCostAnn > 0 ? fmt(calc.totalCostAnn) : null}
                sublabel={`$${calc.effectiveRate.toFixed(2)}/hr effective`}
            />
        </>
    );
}

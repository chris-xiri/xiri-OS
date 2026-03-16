"use client";

import { useState, useMemo, useEffect } from "react";
import { trackToolUsed, trackCtaClick } from "../../../lib/analytics";
import Navbar from "../../components/Navbar";
import StickyResultBanner from "../StickyResultBanner";

/* ── BLS metro median janitor wages — sourced from OEWS May 2024 ── */
const METROS: { id: string; name: string; wage: number; state: string }[] = [
    { id: "nyc", name: "New York-Newark-Jersey City, NY-NJ-PA", wage: 21.44, state: "NY" },
    { id: "la", name: "Los Angeles-Long Beach-Anaheim, CA", wage: 18.54, state: "CA" },
    { id: "chi", name: "Chicago-Naperville-Elgin, IL-IN-WI", wage: 17.14, state: "IL" },
    { id: "dal", name: "Dallas-Fort Worth-Arlington, TX", wage: 14.53, state: "TX" },
    { id: "hou", name: "Houston-The Woodlands-Sugar Land, TX", wage: 14.06, state: "TX" },
    { id: "dc", name: "Washington-Arlington-Alexandria, DC-VA-MD-WV", wage: 18.05, state: "DC" },
    { id: "mia", name: "Miami-Fort Lauderdale-Pompano Beach, FL", wage: 15.41, state: "FL" },
    { id: "phi", name: "Philadelphia-Camden-Wilmington, PA-NJ-DE-MD", wage: 16.92, state: "PA" },
    { id: "atl", name: "Atlanta-Sandy Springs-Alpharetta, GA", wage: 15.09, state: "GA" },
    { id: "bos", name: "Boston-Cambridge-Nashua, MA-NH", wage: 19.83, state: "MA" },
    { id: "phx", name: "Phoenix-Mesa-Chandler, AZ", wage: 16.49, state: "AZ" },
    { id: "sf", name: "San Francisco-Oakland-Berkeley, CA", wage: 21.07, state: "CA" },
    { id: "riv", name: "Riverside-San Bernardino-Ontario, CA", wage: 17.44, state: "CA" },
    { id: "det", name: "Detroit-Warren-Dearborn, MI", wage: 16.04, state: "MI" },
    { id: "sea", name: "Seattle-Tacoma-Bellevue, WA", wage: 20.47, state: "WA" },
    { id: "msp", name: "Minneapolis-St. Paul-Bloomington, MN-WI", wage: 17.77, state: "MN" },
    { id: "sd", name: "San Diego-Chula Vista-Carlsbad, CA", wage: 18.33, state: "CA" },
    { id: "tpa", name: "Tampa-St. Petersburg-Clearwater, FL", wage: 15.55, state: "FL" },
    { id: "den", name: "Denver-Aurora-Lakewood, CO", wage: 17.82, state: "CO" },
    { id: "stl", name: "St. Louis, MO-IL", wage: 15.83, state: "MO" },
    { id: "bal", name: "Baltimore-Columbia-Towson, MD", wage: 16.64, state: "MD" },
    { id: "orl", name: "Orlando-Kissimmee-Sanford, FL", wage: 15.07, state: "FL" },
    { id: "clt", name: "Charlotte-Concord-Gastonia, NC-SC", wage: 15.00, state: "NC" },
    { id: "sac", name: "Sacramento-Roseville-Folsom, CA", wage: 17.89, state: "CA" },
    { id: "pit", name: "Pittsburgh, PA", wage: 15.07, state: "PA" },
    { id: "aus", name: "Austin-Round Rock-Georgetown, TX", wage: 14.68, state: "TX" },
    { id: "lv", name: "Las Vegas-Henderson-Paradise, NV", wage: 16.69, state: "NV" },
    { id: "cin", name: "Cincinnati, OH-KY-IN", wage: 15.48, state: "OH" },
    { id: "kc", name: "Kansas City, MO-KS", wage: 15.49, state: "MO" },
    { id: "col", name: "Columbus, OH", wage: 15.08, state: "OH" },
    { id: "ind", name: "Indianapolis-Carmel-Anderson, IN", wage: 15.38, state: "IN" },
    { id: "cle", name: "Cleveland-Elyria, OH", wage: 14.97, state: "OH" },
    { id: "nash", name: "Nashville-Davidson-Murfreesboro-Franklin, TN", wage: 15.03, state: "TN" },
    { id: "rdu", name: "Raleigh-Cary, NC", wage: 14.35, state: "NC" },
    { id: "port", name: "Portland-Vancouver-Hillsboro, OR-WA", wage: 18.21, state: "OR" },
    { id: "sa", name: "San Antonio-New Braunfels, TX", wage: 13.66, state: "TX" },
    { id: "slc", name: "Salt Lake City, UT", wage: 16.25, state: "UT" },
    { id: "hartford", name: "Hartford-East Hartford-Middletown, CT", wage: 17.59, state: "CT" },
    { id: "jax", name: "Jacksonville, FL", wage: 14.68, state: "FL" },
    { id: "mem", name: "Memphis, TN-MS-AR", wage: 14.10, state: "TN" },
];

const NATIONAL_MEDIAN = 16.29;

/* ── Price Ranges by tier (ISSA/BSCAI benchmarks) ── */
const TIERS = [
    { label: "Budget", multiplier: 1.8, color: "#ef4444" },
    { label: "Standard", multiplier: 2.4, color: "#f59e0b" },
    { label: "Premium", multiplier: 3.0, color: "#00d4aa" },
];

export default function PriceCheckerTool({ faqs }: { faqs?: { q: string; a: string }[] }) {
    const [selectedMetro, setSelectedMetro] = useState("national");
    const [sqft, setSqft] = useState(10000);
    const [frequency, setFrequency] = useState(5);

    const wage = selectedMetro === "national"
        ? NATIONAL_MEDIAN
        : METROS.find((m) => m.id === selectedMetro)?.wage || NATIONAL_MEDIAN;

    const metroName = selectedMetro === "national"
        ? "National Average"
        : METROS.find((m) => m.id === selectedMetro)?.name || "National Average";

    const calc = useMemo(() => {
        const productionRate = 3500; // ISSA standard
        const hoursPerCleaning = sqft / productionRate;
        const cleaningsPerMonth = frequency * 4.33;
        const laborCostPerCleaning = hoursPerCleaning * wage * 1.15; // 15% burden

        const tiers = TIERS.map((t) => {
            const perCleaning = laborCostPerCleaning * t.multiplier;
            const monthly = perCleaning * cleaningsPerMonth;
            const perSqFt = sqft > 0 ? perCleaning / sqft : 0;
            return { ...t, perCleaning, monthly, perSqFt };
        });

        return { hoursPerCleaning, cleaningsPerMonth, tiers, wage };
    }, [sqft, frequency, wage]);

    const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .tool-hero-pck { min-height: auto !important; padding-top: 80px !important; padding-bottom: 1rem !important; }
                    .tool-hero-pck h1 { font-size: 1.5rem !important; }
                    .tool-hero-pck p { font-size: 0.9375rem !important; margin-top: 0.5rem !important; }
                    .pck-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
                    .sticky-result-spacer-pck { height: 60px; }
                }
            `}</style>
            <Navbar />

            {/* Hero */}
            <section className="section noise tool-hero-pck" style={{ minHeight: "40vh", display: "flex", alignItems: "center", paddingTop: "120px", paddingBottom: "2rem", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 60%), #0c0f1a" }}>
                <div className="section-inner" style={{ textAlign: "center", width: "100%" }}>
                    <span className="section-label">📍 Free Tool</span>
                    <h1>Cleaning <span style={{ color: "#00d4aa" }}>Price Checker</span></h1>
                    <p style={{ fontSize: "1.125rem", maxWidth: "640px", margin: "1rem auto 0", color: "#c4c9e0" }}>
                        Are you charging enough? Check local cleaning prices using BLS wage data for your metro area.
                    </p>
                </div>
            </section>

            {/* Calculator */}
            <section className="section" style={{ background: "#141829", paddingTop: "2rem" }}>
                <div className="section-inner" style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div className="pck-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        {/* Inputs */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700 }}>Your Market</h2>
                            <div>
                                <label style={{ color: "#c4c9e0", fontSize: "0.875rem", marginBottom: "0.375rem", display: "block" }}>Metro Area</label>
                                <select
                                    value={selectedMetro}
                                    onChange={(e) => setSelectedMetro(e.target.value)}
                                    style={{ width: "100%", padding: "0.625rem 0.75rem", background: "#1e2240", border: "1px solid #2a2f47", borderRadius: "8px", color: "white", fontSize: "0.875rem" }}
                                >
                                    <option value="national">🇺🇸 National Average — ${NATIONAL_MEDIAN.toFixed(2)}/hr</option>
                                    {METROS.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} — ${m.wage.toFixed(2)}/hr
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {[
                                { label: "Building Size (sq ft)", value: sqft, set: setSqft, min: 1000, max: 200000, step: 1000 },
                                { label: "Cleanings per Week", value: frequency, set: setFrequency, min: 1, max: 7, step: 1 },
                            ].map((f) => (
                                <div key={f.label}>
                                    <label style={{ display: "flex", justifyContent: "space-between", color: "#c4c9e0", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                                        <span>{f.label}</span>
                                        <span style={{ color: "#00d4aa", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>{f.value.toLocaleString()}</span>
                                    </label>
                                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.value} onChange={(e) => f.set(Number(e.target.value))} style={{ width: "100%", accentColor: "#00d4aa" }} />
                                </div>
                            ))}

                            {/* Wage context */}
                            <div className="card" style={{ background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.12)" }}>
                                <div style={{ fontSize: "0.8125rem", color: "#8b92b3", marginBottom: "0.25rem" }}>Median janitor wage in</div>
                                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{metroName}</div>
                                <div style={{ fontFamily: "var(--font-outfit)", fontSize: "1.5rem", fontWeight: 800, color: "#00d4aa" }}>${calc.wage.toFixed(2)}/hr</div>
                                <div style={{ fontSize: "0.6875rem", color: "#8b92b3", marginTop: "0.25rem" }}>Source: BLS OEWS May 2024</div>
                            </div>
                        </div>

                        {/* Results */}
                        <div>
                            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Price Ranges</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {calc.tiers.map((t) => (
                                    <div key={t.label} className="card" style={{ borderColor: t.color, borderWidth: "1px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                            <span style={{ fontWeight: 700, fontSize: "1rem", color: t.color }}>{t.label}</span>
                                            <span style={{ fontFamily: "var(--font-outfit)", fontSize: "1.5rem", fontWeight: 800, color: t.color }}>
                                                {fmt(t.monthly)}/mo
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>Per cleaning: {fmt(t.perCleaning)}</span>
                                            <span style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>Per sq ft: ${t.perSqFt.toFixed(3)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "8px" }}>
                                <p style={{ color: "#c4c9e0", fontSize: "0.8125rem", margin: 0, lineHeight: 1.5 }}>
                                    💡 <strong>Budget</strong> covers labor + light overhead. <strong>Standard</strong> includes profit margin. <strong>Premium</strong> reflects specialized or high-standard cleaning.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sources */}
                    <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.1)", borderRadius: "10px" }}>
                        <h3 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#00d4aa", marginBottom: "0.5rem" }}>Data Sources</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            {[
                                { text: `Metro wages (40 MSAs): BLS Occupational Employment & Wage Statistics, May 2024`, url: "https://www.bls.gov/oes/current/oes372011.htm" },
                                { text: "SOC 37-2011 — Janitors and Cleaners, Except Maids and Housekeeping", url: "https://www.bls.gov/oes/current/oes372011.htm" },
                                { text: "ISSA production rates and industry pricing benchmarks", url: "https://www.issa.com/" },
                                { text: "BSCAI contractor benchmarking data", url: "https://www.bscai.org/" },
                            ].map((s) => (
                                <a key={s.text} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#8b92b3", textDecoration: "none" }}>📎 {s.text}</a>
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
                    <h2>Build a <span style={{ color: "#00d4aa" }}>detailed bid</span> for this building</h2>
                    <p style={{ color: "#8b92b3", marginBottom: "2rem" }}>Our full calculator uses room-by-room scope, per-task frequencies, and BLS metro wages to build accurate bids.</p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/calculator" className="btn btn-primary" onClick={() => trackCtaClick("Try Full Calculator", "price_checker")}>Try Full Calculator →</a>
                        <a href="/pricing" className="btn btn-secondary" onClick={() => trackCtaClick("View Plans", "price_checker")}>View Plans</a>
                    </div>
                </div>
            </section>

            <footer style={{ background: "#0c0f1a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "#555d7e", fontSize: "0.8125rem" }}>© {new Date().getFullYear()} XIRI LLC · Free tool — no login required.</p>
            </footer>

            <div className="sticky-result-spacer-pck" />
            <StickyResultBanner
                label="Standard Price"
                value={calc.tiers[1] ? fmt(calc.tiers[1].monthly) + "/mo" : null}
                sublabel={`${metroName}`}
            />
        </>
    );
}

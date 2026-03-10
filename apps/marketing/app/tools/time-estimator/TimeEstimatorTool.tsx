"use client";

import { useState, useMemo } from "react";
import Navbar from "../../components/Navbar";

/* ── ISSA 612 production rates by area type (sq ft per hour) ── */
const AREA_TYPES = [
    { id: "general-office", label: "General Office", rate: 4500, soil: "Light" },
    { id: "restroom", label: "Restrooms", rate: 2000, soil: "Heavy" },
    { id: "break-room", label: "Break Room / Kitchen", rate: 2500, soil: "Heavy" },
    { id: "lobby", label: "Lobby / Common Area", rate: 5500, soil: "Light" },
    { id: "medical-exam", label: "Medical / Exam Room", rate: 2000, soil: "Heavy" },
    { id: "classroom", label: "Classroom", rate: 4000, soil: "Medium" },
    { id: "warehouse", label: "Warehouse / Industrial", rate: 8000, soil: "Light" },
    { id: "hallway", label: "Hallways / Corridors", rate: 6000, soil: "Light" },
    { id: "conference", label: "Conference Room", rate: 5000, soil: "Light" },
    { id: "fitness", label: "Gym / Fitness Area", rate: 3000, soil: "Heavy" },
];

export default function TimeEstimatorTool({ faqs }: { faqs?: { q: string; a: string }[] }) {
    const [selectedType, setSelectedType] = useState(AREA_TYPES[0].id);
    const [sqft, setSqft] = useState(10000);
    const [frequency, setFrequency] = useState(5);
    const [crews, setCrews] = useState(1);

    const area = AREA_TYPES.find((a) => a.id === selectedType) || AREA_TYPES[0];

    const calc = useMemo(() => {
        const hoursPerCleaning = sqft / area.rate;
        const hoursPerCrewMember = hoursPerCleaning / crews;
        const cleaningsPerMonth = frequency * 4.33;
        const monthlyHours = hoursPerCleaning * cleaningsPerMonth;
        const monthlyHoursPerCrew = monthlyHours / crews;

        return { hoursPerCleaning, hoursPerCrewMember, cleaningsPerMonth, monthlyHours, monthlyHoursPerCrew };
    }, [sqft, frequency, crews, area.rate]);

    const fmtTime = (hrs: number) => {
        const h = Math.floor(hrs);
        const m = Math.round((hrs - h) * 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <>
            <Navbar />

            {/* Hero */}
            <section className="section noise" style={{ minHeight: "40vh", display: "flex", alignItems: "center", paddingTop: "120px", paddingBottom: "2rem", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 60%), #0c0f1a" }}>
                <div className="section-inner" style={{ textAlign: "center", width: "100%" }}>
                    <span className="section-label">⏱️ Free Tool</span>
                    <h1>Cleaning Time <span style={{ color: "#00d4aa" }}>Estimator</span></h1>
                    <p style={{ fontSize: "1.125rem", maxWidth: "640px", margin: "1rem auto 0", color: "#c4c9e0" }}>
                        How long should it take to clean this building? Calculate using ISSA-standard production rates by area type.
                    </p>
                </div>
            </section>

            {/* Calculator */}
            <section className="section" style={{ background: "#141829", paddingTop: "2rem" }}>
                <div className="section-inner" style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        {/* Inputs */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700 }}>Building Details</h2>

                            <div>
                                <label style={{ color: "#c4c9e0", fontSize: "0.875rem", marginBottom: "0.375rem", display: "block" }}>Area Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    style={{ width: "100%", padding: "0.625rem 0.75rem", background: "#1e2240", border: "1px solid #2a2f47", borderRadius: "8px", color: "white", fontSize: "0.875rem" }}
                                >
                                    {AREA_TYPES.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.label} — {a.rate.toLocaleString()} sq ft/hr ({a.soil} soil)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {[
                                { label: "Square Footage", value: sqft, set: setSqft, min: 500, max: 200000, step: 500 },
                                { label: "Cleanings per Week", value: frequency, set: setFrequency, min: 1, max: 7, step: 1 },
                                { label: "Crew Size", value: crews, set: setCrews, min: 1, max: 10, step: 1 },
                            ].map((f) => (
                                <div key={f.label}>
                                    <label style={{ display: "flex", justifyContent: "space-between", color: "#c4c9e0", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                                        <span>{f.label}</span>
                                        <span style={{ color: "#00d4aa", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>{f.value.toLocaleString()}</span>
                                    </label>
                                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.value} onChange={(e) => f.set(Number(e.target.value))} style={{ width: "100%", accentColor: "#00d4aa" }} />
                                </div>
                            ))}
                        </div>

                        {/* Results */}
                        <div>
                            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Time Estimate</h2>
                            <div className="card">
                                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                                    <div style={{ color: "#8b92b3", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Per Cleaning</div>
                                    <div style={{ fontFamily: "var(--font-outfit)", fontSize: "2.5rem", fontWeight: 800, color: "#00d4aa" }}>
                                        {fmtTime(calc.hoursPerCleaning)}
                                    </div>
                                    <div style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>
                                        {crews > 1 ? `${fmtTime(calc.hoursPerCrewMember)} per crew member (${crews} crew)` : "1 person crew"}
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {[
                                        { label: "Area type", value: area.label },
                                        { label: "Production rate", value: `${area.rate.toLocaleString()} sq ft/hr` },
                                        { label: "Soil level", value: area.soil },
                                        { label: "Cleanings/month", value: calc.cleaningsPerMonth.toFixed(0) },
                                        { label: "Monthly total hours", value: fmtTime(calc.monthlyHours) },
                                        { label: "Monthly hours/crew member", value: fmtTime(calc.monthlyHoursPerCrew) },
                                    ].map((r) => (
                                        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                            <span style={{ color: "#8b92b3", fontSize: "0.875rem" }}>{r.label}</span>
                                            <span style={{ color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{r.value}</span>
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
                                { text: "ISSA 612 Cleaning Times: ISSA Cleaning Industry Management Standard", url: "https://www.issa.com/certification/cims" },
                                { text: "Production rates vary by soil level, furniture density, and obstruction (ISSA guidelines)", url: "https://www.issa.com/" },
                            ].map((s) => (
                                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#8b92b3", textDecoration: "none" }}>
                                    📎 {s.text}
                                </a>
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
                    <h2>Need a <span style={{ color: "#00d4aa" }}>full bid</span> with room-by-room scope?</h2>
                    <p style={{ color: "#8b92b3", marginBottom: "2rem" }}>Our full calculator lets you break buildings into individual rooms, each with custom tasks and frequencies.</p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/calculator" className="btn btn-primary">Try Full Calculator →</a>
                        <a href="/pricing" className="btn btn-secondary">View Plans</a>
                    </div>
                </div>
            </section>

            <footer style={{ background: "#0c0f1a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "#555d7e", fontSize: "0.8125rem" }}>© {new Date().getFullYear()} XIRI LLC · Free tool — no login required.</p>
            </footer>
        </>
    );
}

import type { Metadata } from "next";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
    title: "Free Cleaning Business Tools — Calculators & Estimators | xiriOS",
    description:
        "Free interactive tools for cleaning businesses: profit calculator, cleaning time estimator, employee cost calculator, and local price checker. All backed by BLS, ISSA, and government data.",
    keywords:
        "cleaning business tools, janitorial calculator, cleaning profit calculator, cleaning time calculator, employee cost calculator",
    openGraph: {
        title: "Free Cleaning Business Tools | xiriOS",
        description:
            "Free interactive calculators and estimators for commercial cleaning businesses. Government-sourced data.",
        type: "website",
        url: "https://os.xiri.ai/tools",
    },
    alternates: { canonical: "https://os.xiri.ai/tools" },
};

const TOOLS = [
    {
        slug: "profit-calculator",
        icon: "🧮",
        name: "Cleaning Profit Calculator",
        desc: "Calculate your monthly profit on any cleaning contract — with labor, payroll taxes, supplies, and overhead all broken out.",
        badge: "BLS + SSA + NCCI data",
    },
    {
        slug: "time-estimator",
        icon: "⏱️",
        name: "Cleaning Time Estimator",
        desc: "How long should it take to clean this building? Calculate using ISSA-standard production rates by area type and soil level.",
        badge: "ISSA 612 standards",
    },
    {
        slug: "employee-cost",
        icon: "💵",
        name: "Employee True Cost Calculator",
        desc: "What does a janitor actually cost you? See FICA, unemployment, workers comp, benefits, and health insurance all added up.",
        badge: "SSA + IRS + DOL data",
    },
    {
        slug: "price-checker",
        icon: "📍",
        name: "Local Cleaning Price Checker",
        desc: "Are you charging enough? Compare cleaning prices against BLS median wages in your metro area — 40 cities covered.",
        badge: "BLS metro wage data",
    },
];

export default function ToolsPage() {
    return (
        <>
            <Navbar />

            {/* Hero */}
            <section
                className="section noise"
                style={{
                    minHeight: "45vh",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "120px",
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div className="section-inner" style={{ textAlign: "center", width: "100%" }}>
                    <span className="section-label">Free Tools</span>
                    <h1>
                        Cleaning Business{" "}
                        <span style={{ color: "#00d4aa" }}>Calculators & Tools</span>
                    </h1>
                    <p
                        style={{
                            fontSize: "1.125rem",
                            maxWidth: "640px",
                            margin: "1rem auto 2rem",
                            color: "#c4c9e0",
                        }}
                    >
                        Free interactive tools backed by government data — BLS wages, ISSA cleaning standards, IRS tax rates, and more. No login required.
                    </p>
                </div>
            </section>

            {/* Tool Grid */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner" style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {TOOLS.map((t) => (
                            <a
                                key={t.slug}
                                href={`/tools/${t.slug}`}
                                className="card"
                                style={{
                                    textDecoration: "none",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.75rem",
                                    transition: "border-color 0.2s, transform 0.2s",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ fontSize: "2rem" }}>{t.icon}</span>
                                    <h2
                                        style={{
                                            fontFamily: "var(--font-outfit)",
                                            fontSize: "1.25rem",
                                            fontWeight: 700,
                                            margin: 0,
                                        }}
                                    >
                                        {t.name}
                                    </h2>
                                </div>
                                <p
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.9375rem",
                                        lineHeight: 1.6,
                                        margin: 0,
                                        flex: 1,
                                    }}
                                >
                                    {t.desc}
                                </p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span
                                        style={{
                                            fontSize: "0.6875rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            color: "#00d4aa",
                                            background: "rgba(0,212,170,0.08)",
                                            padding: "3px 10px",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        {t.badge}
                                    </span>
                                    <span style={{ color: "#00d4aa", fontSize: "0.8125rem", fontWeight: 600 }}>
                                        Use tool →
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section
                className="section"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,212,170,0.06) 0%, transparent 60%), #0c0f1a",
                    textAlign: "center",
                }}
            >
                <div className="section-inner" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h2>
                        Want the <span style={{ color: "#00d4aa" }}>full suite</span>?
                    </h2>
                    <p style={{ color: "#8b92b3", marginBottom: "2rem" }}>
                        xiriOS combines all these calculations into one integrated bidding, proposal, and CRM platform. Free plan available.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <a
                            href="/pricing"
                            className="btn btn-primary"
                            style={{ fontSize: "1rem", padding: "0.875rem 2.5rem" }}
                        >
                            Get Started Free →
                        </a>
                        <a
                            href="/features"
                            className="btn btn-secondary"
                            style={{ fontSize: "1rem", padding: "0.875rem 2.5rem" }}
                        >
                            Explore Features
                        </a>
                    </div>
                </div>
            </section>

            <footer
                style={{
                    background: "#0c0f1a",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "2rem",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "#555d7e", fontSize: "0.8125rem" }}>
                    © {new Date().getFullYear()} XIRI LLC · All tools are free — no login required.
                </p>
            </footer>
        </>
    );
}

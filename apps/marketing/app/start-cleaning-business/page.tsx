import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { UNIQUE_CITIES, type City } from "../../lib/cities";
import { STATE_DATA, NATIONAL_MEDIAN_WAGE, type StateMarketData } from "../../lib/market-data";

export const metadata: Metadata = {
    title: "How to Start a Cleaning Business (2026 Guide) | xiriOS",
    description:
        "Complete guide to starting a cleaning business in 2026. Local market data, BLS wages, licensing, insurance, equipment, pricing — plus free tools to bid your first job.",
    keywords: [
        "how to start a cleaning business",
        "start cleaning business",
        "cleaning business startup",
        "janitorial business startup",
        "start janitorial company",
    ],
    openGraph: {
        title: "How to Start a Cleaning Business (2026 Guide) | xiriOS",
        description:
            "Step-by-step guide with real BLS market data. Free calculator, proposals, and CRM to launch your cleaning company.",
    },
    alternates: { canonical: "https://os.xiri.ai/start-cleaning-business" },
};

/* group cities by state */
function groupByState(cities: City[]) {
    const groups: Record<string, City[]> = {};
    for (const c of cities) {
        if (!groups[c.state]) groups[c.state] = [];
        groups[c.state].push(c);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function StartCleaningBusinessHub() {
    const grouped = groupByState(UNIQUE_CITIES);

    return (
        <>
            <Navbar />

            {/* Hero */}
            <section
                className="section noise"
                style={{
                    minHeight: "50vh",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "120px",
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div className="section-inner" style={{ textAlign: "center", width: "100%" }}>
                    <span className="section-label">
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#00d4aa",
                                display: "inline-block",
                            }}
                        />
                        2026 Startup Guide
                    </span>
                    <h1>
                        How to Start a{" "}
                        <span style={{ color: "#00d4aa" }}>Cleaning Business</span>
                    </h1>
                    <p
                        style={{
                            color: "#c4c9e0",
                            fontSize: "1.125rem",
                            maxWidth: "600px",
                            margin: "1.5rem auto 2rem",
                            lineHeight: 1.7,
                        }}
                    >
                        The complete, data-backed guide to launching a profitable
                        cleaning company. Real wage data from the Bureau of Labor
                        Statistics, local market stats from the Census Bureau, and free
                        tools to price your first bid.
                    </p>

                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <a href="/app/login?mode=signup" className="btn btn-primary">
                            Start Your Cleaning Business Free →
                        </a>
                        <a href="/calculator" className="btn btn-secondary">
                            Try the Free Calculator
                        </a>
                    </div>

                    {/* National stats */}
                    <div
                        style={{
                            marginTop: "3rem",
                            display: "flex",
                            gap: "1.5rem",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        {[
                            {
                                value: `$${NATIONAL_MEDIAN_WAGE.toFixed(2)}/hr`,
                                label: "National median wage (BLS)",
                            },
                            {
                                value: Object.values(STATE_DATA)
                                    .reduce((s: number, d: StateMarketData) => s + d.janitorialCompanies, 0)
                                    .toLocaleString(),
                                label: "US janitorial companies",
                            },
                            {
                                value: `${UNIQUE_CITIES.length}`,
                                label: "City guides available",
                            },
                        ].map((b) => (
                            <div
                                key={b.label}
                                style={{
                                    background: "rgba(0,212,170,0.08)",
                                    border: "1px solid rgba(0,212,170,0.2)",
                                    borderRadius: "12px",
                                    padding: "0.875rem 1.25rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    minWidth: "140px",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontSize: "1.5rem",
                                        fontWeight: 800,
                                        color: "#00d4aa",
                                    }}
                                >
                                    {b.value}
                                </span>
                                <span
                                    style={{ color: "#8b92b3", fontSize: "0.75rem", marginTop: "0.25rem" }}
                                >
                                    {b.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick-start steps */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner" style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div className="section-header">
                        <span className="section-label">At a glance</span>
                        <h2>
                            8 steps to launch a{" "}
                            <span style={{ color: "#00d4aa" }}>cleaning company</span>
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                            gap: "1rem",
                        }}
                    >
                        {[
                            { n: "1", t: "Research your local market", d: "BLS wage data, Census competitor counts, and demand by industry." },
                            { n: "2", t: "Register your business", d: "LLC or sole prop, EIN from the IRS, state/city business license." },
                            { n: "3", t: "Get insurance & bonding", d: "General liability ($500–$1,200/yr), workers' comp, surety bond." },
                            { n: "4", t: "Set data-backed pricing", d: "ISSA 612 production rates × loaded labor cost × profit margin." },
                            { n: "5", t: "Buy essential equipment", d: "Commercial vacuum, mop system, chemicals, PPE. Start lean: $500–$5K." },
                            { n: "6", t: "Find your first clients", d: "Property managers, small offices, medical facilities, schools." },
                            { n: "7", t: "Bid your first job", d: "Walk the building, measure sqft, calculate hours, present a PDF proposal." },
                            { n: "8", t: "Scale from solo to team", d: "Hire above median wage, schedule routes, bid new contracts." },
                        ].map((s) => (
                            <div
                                key={s.n}
                                className="card"
                                style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontWeight: 800,
                                        fontSize: "1.25rem",
                                        color: "#00d4aa",
                                        minWidth: "28px",
                                    }}
                                >
                                    {s.n}
                                </span>
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: "var(--font-outfit)",
                                            fontWeight: 700,
                                            fontSize: "1rem",
                                            color: "#f0f1f7",
                                            marginBottom: "0.25rem",
                                        }}
                                    >
                                        {s.t}
                                    </h3>
                                    <p style={{ color: "#8b92b3", fontSize: "0.875rem", lineHeight: 1.55 }}>
                                        {s.d}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog resources */}
            <section className="section noise" style={{ background: "#0c0f1a" }}>
                <div className="section-inner" style={{ maxWidth: "700px", margin: "0 auto" }}>
                    <div className="section-header">
                        <span className="section-label">Deep dives</span>
                        <h2>
                            Startup{" "}
                            <span style={{ color: "#00d4aa" }}>guides & resources</span>
                        </h2>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "1rem",
                        }}
                    >
                        {[
                            {
                                href: "/blog/how-to-start-a-cleaning-business",
                                title: "Complete Startup Guide",
                                desc: "From LLC filing to landing your first contract — the full playbook.",
                            },
                            {
                                href: "/blog/cost-to-start-cleaning-business",
                                title: "Startup Cost Breakdown",
                                desc: "Budget scenarios at $2K, $5K, and $10K with line-item details.",
                            },
                            {
                                href: "/blog/cleaning-business-startup-checklist",
                                title: "30-Day Startup Checklist",
                                desc: "Week-by-week action items from registration to first client.",
                            },
                        ].map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="card"
                                style={{ textDecoration: "none", padding: "1.25rem" }}
                            >
                                <h3
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                        color: "#f0f1f7",
                                        marginBottom: "0.375rem",
                                    }}
                                >
                                    {link.title}
                                </h3>
                                <p
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.8125rem",
                                        lineHeight: 1.5,
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    {link.desc}
                                </p>
                                <span style={{ color: "#00d4aa", fontSize: "0.75rem", fontWeight: 600 }}>
                                    Read article →
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* City directory */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">City guides</span>
                        <h2>
                            Start a cleaning business in{" "}
                            <span style={{ color: "#00d4aa" }}>your city</span>
                        </h2>
                        <p style={{ color: "#8b92b3", marginTop: "0.5rem", fontSize: "1rem" }}>
                            Local wage data, competitor counts, and step-by-step guides for {UNIQUE_CITIES.length}+ US cities.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {grouped.map(([state, cities]) => (
                            <div key={state}>
                                <h3
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                        color: "#f0f1f7",
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    {state}
                                </h3>
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "0.5rem",
                                    }}
                                >
                                    {cities.map((c) => (
                                        <a
                                            key={c.slug}
                                            href={`/start-cleaning-business/${c.slug}`}
                                            style={{
                                                background: "rgba(255,255,255,0.03)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                borderRadius: "6px",
                                                padding: "0.5rem 1rem",
                                                color: "#c4c9e0",
                                                fontSize: "0.8125rem",
                                                textDecoration: "none",
                                                transition: "border-color 0.2s, color 0.2s",
                                            }}
                                        >
                                            {c.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section
                className="section"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,212,170,0.06) 0%, transparent 60%), #0c0f1a",
                    borderTop: "1px solid #2a2f47",
                }}
            >
                <div className="section-inner" style={{ textAlign: "center" }}>
                    <h2>
                        Your cleaning business{" "}
                        <span style={{ color: "#00d4aa" }}>starts here</span>
                    </h2>
                    <p
                        style={{
                            maxWidth: "520px",
                            margin: "1rem auto 2rem",
                            color: "#c4c9e0",
                            fontSize: "1.0625rem",
                            lineHeight: 1.7,
                        }}
                    >
                        Calculator, proposals, CRM, scheduling — everything from first bid
                        to 50th account. Start free today.
                    </p>
                    <a
                        href="/app/login?mode=signup"
                        className="btn btn-primary"
                        style={{ fontSize: "1.0625rem", padding: "1rem 2.5rem" }}
                    >
                        Start Your Cleaning Business Free →
                    </a>
                </div>
            </section>
        </>
    );
}

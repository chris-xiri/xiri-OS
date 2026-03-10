import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import { INDUSTRIES, type Industry } from "../../../lib/industries";

/* ────────── Static params ────────── */
export function generateStaticParams() {
    return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

/* ────────── Dynamic metadata ────────── */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ industry: string }>;
}): Promise<Metadata> {
    const { industry: slug } = await params;
    const ind = INDUSTRIES.find((i) => i.slug === slug);
    if (!ind) return {};
    return {
        title: ind.metaTitle,
        description: ind.metaDescription,
        openGraph: {
            title: ind.metaTitle,
            description: ind.metaDescription,
            type: "website",
            url: `https://os.xiri.ai/for/${ind.slug}`,
        },
    };
}

/* ────────── Page ────────── */
export default async function IndustryPage({
    params,
}: {
    params: Promise<{ industry: string }>;
}) {
    const { industry: slug } = await params;
    const ind = INDUSTRIES.find((i) => i.slug === slug);
    if (!ind) notFound();

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
                    <span className="section-label">{ind.name}</span>
                    <h1>{ind.headline}</h1>
                    <p
                        style={{
                            fontSize: "1.125rem",
                            maxWidth: "640px",
                            margin: "1rem auto 2rem",
                            color: "#c4c9e0",
                        }}
                    >
                        {ind.subtitle}
                    </p>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/pricing" className="btn btn-primary">
                            View Plans →
                        </a>
                        <a href="/calculator" className="btn btn-secondary">
                            Try Free Calculator
                        </a>
                    </div>

                    {/* Stat badge */}
                    <div
                        style={{
                            marginTop: "3rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            background: "rgba(0,212,170,0.08)",
                            border: "1px solid rgba(0,212,170,0.2)",
                            borderRadius: "12px",
                            padding: "0.875rem 1.5rem",
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "var(--font-outfit)",
                                fontSize: "1.75rem",
                                fontWeight: 800,
                                color: "#00d4aa",
                            }}
                        >
                            {ind.stat.value}
                        </span>
                        <span style={{ color: "#8b92b3", fontSize: "0.875rem" }}>
                            {ind.stat.label}
                        </span>
                    </div>
                </div>
            </section>

            {/* Pain Points */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Common challenges</span>
                        <h2>
                            Problems we{" "}
                            <span style={{ color: "#00d4aa" }}>solve</span>
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "1.5rem",
                            maxWidth: "900px",
                            margin: "0 auto",
                        }}
                    >
                        {ind.painPoints.map((pp) => (
                            <div key={pp.title} className="card">
                                <div
                                    style={{
                                        fontSize: "2rem",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    {pp.icon}
                                </div>
                                <h3
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontSize: "1.125rem",
                                        fontWeight: 700,
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {pp.title}
                                </h3>
                                <p
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {pp.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section noise" style={{ background: "#0c0f1a" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Built for {ind.name.toLowerCase()}</span>
                        <h2>
                            Everything you need to{" "}
                            <span style={{ color: "#00d4aa" }}>win & deliver</span>
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "1rem",
                            maxWidth: "800px",
                            margin: "0 auto",
                        }}
                    >
                        {ind.features.map((f) => (
                            <div
                                key={f}
                                style={{
                                    display: "flex",
                                    gap: "0.75rem",
                                    alignItems: "flex-start",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: "10px",
                                    padding: "1.25rem",
                                }}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    style={{ marginTop: "2px", flexShrink: 0 }}
                                >
                                    <path
                                        d="M4.5 9l3 3 6-6"
                                        stroke="#00d4aa"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span
                                    style={{
                                        color: "#c4c9e0",
                                        fontSize: "0.9375rem",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {f}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tools cross-link */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Free tools</span>
                        <h2>
                            Free{" "}
                            <span style={{ color: "#00d4aa" }}>calculators &amp; tools</span>
                        </h2>
                        <p style={{ color: "#8b92b3", maxWidth: "500px", margin: "0.5rem auto 0" }}>
                            Government-backed data. No login required.
                        </p>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                            gap: "1rem",
                            maxWidth: "900px",
                            margin: "0 auto",
                        }}
                    >
                        {[
                            { href: "/tools/profit-calculator", icon: "🧮", name: "Profit Calculator" },
                            { href: "/tools/time-estimator", icon: "⏱️", name: "Time Estimator" },
                            { href: "/tools/employee-cost", icon: "💵", name: "Employee Cost" },
                            { href: "/tools/price-checker", icon: "📍", name: "Price Checker" },
                        ].map((t) => (
                            <a
                                key={t.href}
                                href={t.href}
                                className="card"
                                style={{
                                    textDecoration: "none",
                                    textAlign: "center",
                                    transition: "border-color 0.2s, transform 0.2s",
                                    padding: "1.25rem",
                                }}
                            >
                                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{t.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{t.name}</div>
                                <span style={{ color: "#00d4aa", fontSize: "0.75rem", fontWeight: 600 }}>Free →</span>
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
                        "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,212,170,0.06) 0%, transparent 60%), #141829",
                }}
            >
                <div
                    className="section-inner"
                    style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}
                >
                    <h2 style={{ marginBottom: "1rem" }}>
                        Ready to grow your{" "}
                        <span style={{ color: "#00d4aa" }}>
                            {ind.name.toLowerCase().split(" ")[0]} cleaning
                        </span>{" "}
                        business?
                    </h2>
                    <p
                        style={{
                            color: "#8b92b3",
                            fontSize: "1.0625rem",
                            lineHeight: 1.7,
                            marginBottom: "2rem",
                        }}
                    >
                        Start free with unlimited bids and proposals. No credit card required. Upgrade when
                        you&apos;re ready for scheduling, timekeeping, and full CRM.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <a
                            href="/pricing"
                            className="btn btn-primary"
                            style={{ fontSize: "1rem", padding: "0.875rem 2.5rem" }}
                        >
                            Get Started Free →
                        </a>
                        <a
                            href="/calculator"
                            className="btn btn-secondary"
                            style={{ fontSize: "1rem", padding: "0.875rem 2.5rem" }}
                        >
                            Try the Calculator
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer note */}
            <footer
                style={{
                    background: "#0c0f1a",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "2rem",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "#555d7e", fontSize: "0.8125rem" }}>
                    © {new Date().getFullYear()} XIRI LLC · xiriOS is built for cleaning businesses of all sizes.
                </p>
            </footer>
        </>
    );
}

import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { FEATURES } from "../../lib/features";

export const metadata: Metadata = {
    title: "Features — Janitorial Bidding & CRM Software | xiriOS",
    description:
        "Explore xiriOS features: data-driven bidding, PDF proposals, CRM, mobile app, custom tasks, and unlimited contacts. Built for commercial cleaning companies. Free plan available.",
    keywords:
        "janitorial software features, cleaning business features, janitorial bidding features, commercial cleaning software",
    openGraph: {
        title: "Features — Janitorial Bidding & CRM Software | xiriOS",
        description:
            "Explore xiriOS features: data-driven bidding, PDF proposals, CRM, mobile app, and more. Free plan available.",
        type: "website",
        url: "https://os.xiri.ai/features",
    },
    alternates: { canonical: "https://os.xiri.ai/features" },
};

export default function FeaturesPage() {
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
                <div
                    className="section-inner"
                    style={{ textAlign: "center", width: "100%" }}
                >
                    <span className="section-label">Product Features</span>
                    <h1>
                        Everything You Need to{" "}
                        <span style={{ color: "#00d4aa" }}>Win & Deliver</span>{" "}
                        Cleaning Contracts
                    </h1>
                    <p
                        style={{
                            fontSize: "1.125rem",
                            maxWidth: "640px",
                            margin: "1rem auto 2rem",
                            color: "#c4c9e0",
                        }}
                    >
                        Built on government wage data, ISSA cleaning standards,
                        and real-world industry benchmarks — not guesswork.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <a href="/pricing" className="btn btn-primary">
                            View Plans →
                        </a>
                        <a href="/calculator" className="btn btn-secondary">
                            Try Free Calculator
                        </a>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div
                        className="section-header"
                        style={{ marginBottom: "2.5rem" }}
                    >
                        <span className="section-label">
                            Bid &amp; Bid Plus Plans
                        </span>
                        <h2>
                            Powerful features,{" "}
                            <span style={{ color: "#00d4aa" }}>
                                honest pricing
                            </span>
                        </h2>
                        <p
                            style={{
                                color: "#8b92b3",
                                maxWidth: "560px",
                                margin: "0.5rem auto 0",
                            }}
                        >
                            Every feature backed by real data. Free plan
                            forever — upgrade to Bid Plus for $9/mo.
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(320px, 1fr))",
                            gap: "1.5rem",
                            maxWidth: "1100px",
                            margin: "0 auto",
                        }}
                    >
                        {FEATURES.map((f) => (
                            <a
                                key={f.slug}
                                href={`/features/${f.slug}`}
                                className="card"
                                style={{
                                    textDecoration: "none",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.75rem",
                                    transition:
                                        "border-color 0.2s, transform 0.2s",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <span style={{ fontSize: "1.75rem" }}>
                                        {f.icon}
                                    </span>
                                    <div>
                                        <h3
                                            style={{
                                                fontFamily:
                                                    "var(--font-outfit)",
                                                fontSize: "1.125rem",
                                                fontWeight: 700,
                                                margin: 0,
                                            }}
                                        >
                                            {f.name}
                                        </h3>
                                        <span
                                            style={{
                                                fontSize: "0.6875rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                color:
                                                    f.plan === "bid"
                                                        ? "#00d4aa"
                                                        : "#8b5cf6",
                                                background:
                                                    f.plan === "bid"
                                                        ? "rgba(0,212,170,0.1)"
                                                        : "rgba(139,92,246,0.1)",
                                                padding: "2px 8px",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            {f.plan === "bid"
                                                ? "Free"
                                                : "Bid Plus"}
                                        </span>
                                    </div>
                                </div>
                                <p
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.6,
                                        margin: 0,
                                        flex: 1,
                                    }}
                                >
                                    {f.subtitle}
                                </p>

                                {/* Key stat */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        background: "rgba(0,212,170,0.06)",
                                        border: "1px solid rgba(0,212,170,0.12)",
                                        borderRadius: "8px",
                                        padding: "0.625rem 0.875rem",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "var(--font-outfit)",
                                            fontSize: "1.125rem",
                                            fontWeight: 800,
                                            color: "#00d4aa",
                                        }}
                                    >
                                        {f.stats[0].value}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "#8b92b3",
                                        }}
                                    >
                                        {f.stats[0].label}
                                    </span>
                                </div>

                                <span
                                    style={{
                                        color: "#00d4aa",
                                        fontSize: "0.8125rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    Learn more →
                                </span>
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
                <div
                    className="section-inner"
                    style={{ maxWidth: "600px", margin: "0 auto" }}
                >
                    <h2 style={{ marginBottom: "1rem" }}>
                        Start bidding{" "}
                        <span style={{ color: "#00d4aa" }}>today</span> — free
                        forever
                    </h2>
                    <p
                        style={{
                            color: "#8b92b3",
                            fontSize: "1.0625rem",
                            lineHeight: 1.7,
                            marginBottom: "2rem",
                        }}
                    >
                        Create up to 3 bids, generate PDF proposals, and manage
                        contacts. No credit card, no time limits.
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
                            style={{
                                fontSize: "1rem",
                                padding: "0.875rem 2.5rem",
                            }}
                        >
                            Get Started Free →
                        </a>
                        <a
                            href="/calculator"
                            className="btn btn-secondary"
                            style={{
                                fontSize: "1rem",
                                padding: "0.875rem 2.5rem",
                            }}
                        >
                            Try the Calculator
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer
                style={{
                    background: "#0c0f1a",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "2rem",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "#555d7e", fontSize: "0.8125rem" }}>
                    © {new Date().getFullYear()} XIRI LLC · xiriOS is built for
                    cleaning businesses of all sizes.
                </p>
            </footer>
        </>
    );
}

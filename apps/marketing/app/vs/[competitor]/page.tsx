import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import { COMPETITORS, getCompetitor } from "../../../lib/competitors";

// Generate static pages for all competitors at build time
export async function generateStaticParams() {
    return COMPETITORS.map((c) => ({ competitor: c.slug }));
}

// Dynamic SEO metadata per competitor
export async function generateMetadata({
    params,
}: {
    params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
    const { competitor: slug } = await params;
    const comp = getCompetitor(slug);
    if (!comp) return {};

    return {
        title: `xiriOS vs ${comp.name} — Compare Features & Pricing | xiriOS`,
        description: `Compare xiriOS and ${comp.name} side by side. ${comp.tagline} Save ${comp.annualSavings}/year switching to xiriOS. Free 14-day trial.`,
        keywords: comp.seoKeywords.join(", "),
        openGraph: {
            title: `xiriOS vs ${comp.name} — ${comp.tagline}`,
            description: `Save ${comp.annualSavings}/year. More features, lower price. Free 14-day trial.`,
        },
        alternates: { canonical: `https://os.xiri.ai/vs/${slug}` },
    };
}

export default async function CompetitorPage({
    params,
}: {
    params: Promise<{ competitor: string }>;
}) {
    const { competitor: slug } = await params;
    const comp = getCompetitor(slug);
    if (!comp) notFound();

    return (
        <>
            <Navbar />

            {/* Hero */}
            <section
                className="section noise"
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "120px",
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 212, 170, 0.08) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div
                    className="section-inner"
                    style={{ position: "relative", zIndex: 1, width: "100%" }}
                >
                    <div
                        style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
                    >
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
                            Compare
                        </span>

                        <h1>
                            xiriOS vs {comp.name}
                        </h1>

                        <p
                            style={{
                                fontSize: "1.25rem",
                                color: "#00d4aa",
                                fontWeight: 700,
                                marginTop: "1rem",
                            }}
                        >
                            {comp.tagline}
                        </p>

                        <p
                            style={{
                                fontSize: "1.0625rem",
                                maxWidth: "600px",
                                margin: "1.5rem auto 0",
                                color: "#c4c9e0",
                            }}
                        >
                            {comp.description}
                        </p>

                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                justifyContent: "center",
                                marginTop: "2.5rem",
                                flexWrap: "wrap",
                            }}
                        >
                            <a
                                href="#pricing"
                                className="btn btn-primary"
                                style={{
                                    fontSize: "1.0625rem",
                                    padding: "1rem 2.25rem",
                                }}
                            >
                                See Pricing Comparison
                            </a>
                            <a
                                href="/calculator"
                                className="btn btn-secondary"
                                style={{
                                    fontSize: "1.0625rem",
                                    padding: "1rem 2.25rem",
                                }}
                            >
                                Try Free Calculator
                            </a>
                        </div>

                        {/* Savings callout */}
                        <div
                            style={{
                                marginTop: "3rem",
                                padding: "1.5rem 2rem",
                                background: "rgba(0, 212, 170, 0.06)",
                                border: "1px solid rgba(0, 212, 170, 0.2)",
                                borderRadius: "1rem",
                                display: "inline-block",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "var(--font-outfit), system-ui, sans-serif",
                                    fontSize: "2rem",
                                    fontWeight: 800,
                                    color: "#00d4aa",
                                }}
                            >
                                Save {comp.annualSavings}/year
                            </div>
                            <div style={{ color: "#8b92b3", fontSize: "0.875rem" }}>
                                switching from {comp.name} to xiriOS
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Comparison Table */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Feature-by-feature</span>
                        <h2>
                            Side-by-side{" "}
                            <span style={{ color: "#00d4aa" }}>comparison</span>
                        </h2>
                    </div>

                    <div
                        style={{
                            maxWidth: "700px",
                            margin: "0 auto",
                            borderRadius: "1rem",
                            overflow: "hidden",
                            border: "1px solid #2a2f47",
                        }}
                    >
                        {/* Table header */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 120px 120px",
                                padding: "1rem 1.5rem",
                                background: "rgba(0, 212, 170, 0.08)",
                                borderBottom: "1px solid #2a2f47",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                            }}
                        >
                            <div style={{ color: "#8b92b3" }}>Feature</div>
                            <div style={{ textAlign: "center", color: "#00d4aa" }}>xiriOS</div>
                            <div style={{ textAlign: "center", color: "#8b92b3" }}>
                                {comp.name}
                            </div>
                        </div>

                        {/* Table rows */}
                        {comp.features.map((feature, i) => (
                            <div
                                key={feature.name}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 120px 120px",
                                    padding: "0.875rem 1.5rem",
                                    borderBottom:
                                        i < comp.features.length - 1
                                            ? "1px solid #1e2235"
                                            : "none",
                                    background:
                                        i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                                }}
                            >
                                <div
                                    style={{
                                        color: "#c4c9e0",
                                        fontSize: "0.9375rem",
                                        fontWeight:
                                            feature.name === "Starting Price" ? 700 : 400,
                                    }}
                                >
                                    {feature.name}
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    {renderFeatureValue(feature.xiriOS)}
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    {renderFeatureValue(feature.competitor)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Comparison */}
            <section id="pricing" className="section noise" style={{ background: "#0c0f1a" }}>
                <div className="section-inner" style={{ textAlign: "center" }}>
                    <div className="section-header">
                        <span className="section-label">Pricing</span>
                        <h2>
                            More features at{" "}
                            <span style={{ color: "#00d4aa" }}>every price point</span>
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "1.5rem",
                            maxWidth: "700px",
                            margin: "0 auto",
                        }}
                    >
                        {/* xiriOS card */}
                        <div className="card card-featured" style={{ textAlign: "left" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <div
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontSize: "1.125rem",
                                        fontWeight: 800,
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            background: "#00d4aa",
                                            display: "inline-block",
                                        }}
                                    />
                                    xiri<span style={{ color: "#00d4aa" }}>OS</span>{" "}
                                    {comp.competingPlan}
                                </div>
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <span
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontSize: "3rem",
                                        fontWeight: 800,
                                        color: "white",
                                    }}
                                >
                                    {comp.competingPrice}
                                </span>
                            </div>
                            <ul
                                style={{
                                    listStyle: "none",
                                    padding: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                }}
                            >
                                {comp.features
                                    .filter((f) => f.xiriOS === true || typeof f.xiriOS === "string")
                                    .filter((f) => f.name !== "Starting Price")
                                    .slice(0, 8)
                                    .map((f) => (
                                        <li
                                            key={f.name}
                                            style={{
                                                display: "flex",
                                                gap: "0.5rem",
                                                color: "#c4c9e0",
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            <span style={{ color: "#00d4aa" }}>✓</span>
                                            {f.name}
                                        </li>
                                    ))}
                            </ul>
                            <a
                                href="/#pricing"
                                className="btn btn-primary"
                                style={{ width: "100%", marginTop: "1.5rem" }}
                            >
                                Start Free Trial
                            </a>
                        </div>

                        {/* Competitor card */}
                        <div className="card" style={{ textAlign: "left" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <div
                                    style={{
                                        fontSize: "1.125rem",
                                        fontWeight: 700,
                                        color: "#8b92b3",
                                    }}
                                >
                                    {comp.name}
                                </div>
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <span
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontSize: "2rem",
                                        fontWeight: 800,
                                        color: "#8b92b3",
                                    }}
                                >
                                    {comp.pricing}
                                </span>
                            </div>
                            <div
                                style={{
                                    padding: "0.75rem 1rem",
                                    background: "rgba(255, 107, 107, 0.08)",
                                    border: "1px solid rgba(255, 107, 107, 0.2)",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.8125rem",
                                    color: "#ff6b6b",
                                }}
                            >
                                <strong>Missing from {comp.name}:</strong> {comp.weakness}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section
                className="section"
                style={{
                    background:
                        "linear-gradient(180deg, #0c0f1a 0%, #141829 100%)",
                    textAlign: "center",
                }}
            >
                <div className="section-inner">
                    <h2>
                        Ready to switch from{" "}
                        <span style={{ color: "#00d4aa" }}>{comp.name}</span>?
                    </h2>
                    <p
                        style={{
                            maxWidth: "500px",
                            margin: "1rem auto 0",
                            color: "#c4c9e0",
                        }}
                    >
                        Try xiriOS free for 14 days. No credit card required. Import your
                        data and see the difference.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            marginTop: "2.5rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <a
                            href="/#pricing"
                            className="btn btn-primary"
                            style={{
                                fontSize: "1.0625rem",
                                padding: "1rem 2.5rem",
                            }}
                        >
                            Start Free Trial
                        </a>
                        <a
                            href="/calculator"
                            className="btn btn-warm"
                            style={{
                                fontSize: "1.0625rem",
                                padding: "1rem 2.5rem",
                            }}
                        >
                            Try the Free Calculator
                        </a>
                    </div>
                </div>
            </section>

            {/* Minimal footer */}
            <footer
                style={{
                    padding: "2rem",
                    background: "#0c0f1a",
                    borderTop: "1px solid #2a2f47",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>
                    © 2026 xiriOS. All rights reserved. ·{" "}
                    <a
                        href="/"
                        style={{ color: "#00d4aa", textDecoration: "none" }}
                    >
                        Home
                    </a>{" "}
                    ·{" "}
                    <a
                        href="/#pricing"
                        style={{ color: "#00d4aa", textDecoration: "none" }}
                    >
                        Pricing
                    </a>{" "}
                    ·{" "}
                    <a
                        href="/calculator"
                        style={{ color: "#00d4aa", textDecoration: "none" }}
                    >
                        Calculator
                    </a>
                </p>
            </footer>
        </>
    );
}

function renderFeatureValue(value: boolean | string) {
    if (value === true) {
        return (
            <span style={{ color: "#00d4aa", fontSize: "1.125rem" }}>✓</span>
        );
    }
    if (value === false) {
        return (
            <span style={{ color: "#ff6b6b", fontSize: "1.125rem" }}>✗</span>
        );
    }
    // String value (e.g., "Pro plan", "$10/mo")
    return (
        <span
            style={{
                color: value.includes("$") ? "#00d4aa" : "#c4c9e0",
                fontSize: "0.75rem",
                fontWeight: 600,
            }}
        >
            {value}
        </span>
    );
}

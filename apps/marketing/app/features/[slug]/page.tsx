import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import { FEATURES, type Feature } from "../../../lib/features";

/* ────────── Static params ────────── */
export function generateStaticParams() {
    return FEATURES.map((f) => ({ slug: f.slug }));
}

/* ────────── Dynamic metadata ────────── */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const feat = FEATURES.find((f) => f.slug === slug);
    if (!feat) return {};
    return {
        title: feat.metaTitle,
        description: feat.metaDescription,
        keywords: feat.keywords.join(", "),
        openGraph: {
            title: feat.metaTitle,
            description: feat.metaDescription,
            type: "website",
            url: `https://os.xiri.ai/features/${feat.slug}`,
        },
        alternates: { canonical: `https://os.xiri.ai/features/${feat.slug}` },
    };
}

/* ────────── Page ────────── */
export default async function FeaturePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const feat = FEATURES.find((f) => f.slug === slug);
    if (!feat) notFound();

    return (
        <>
            <Navbar />

            {/* ── Hero ── */}
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
                <div
                    className="section-inner"
                    style={{ textAlign: "center", width: "100%" }}
                >
                    <span className="section-label">{feat.icon} {feat.name}</span>
                    <h1>{feat.headline}</h1>
                    <p
                        style={{
                            fontSize: "1.125rem",
                            maxWidth: "640px",
                            margin: "1rem auto 2rem",
                            color: "#c4c9e0",
                        }}
                    >
                        {feat.subtitle}
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: "0.75rem",
                            justifyContent: "center",
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                color:
                                    feat.plan === "bid"
                                        ? "#00d4aa"
                                        : "#8b5cf6",
                                background:
                                    feat.plan === "bid"
                                        ? "rgba(0,212,170,0.1)"
                                        : "rgba(139,92,246,0.1)",
                                padding: "4px 12px",
                                borderRadius: "6px",
                                border: `1px solid ${feat.plan === "bid"
                                    ? "rgba(0,212,170,0.3)"
                                    : "rgba(139,92,246,0.3)"
                                    }`,
                            }}
                        >
                            {feat.plan === "bid"
                                ? "Included Free"
                                : "Bid Plus — $9/mo"}
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            marginTop: "2rem",
                        }}
                    >
                        <a href="/pricing" className="btn btn-primary">
                            Get Started Free →
                        </a>
                        <a href="/calculator" className="btn btn-secondary">
                            Try Free Calculator
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Stats with sources ── */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Backed by real data</span>
                        <h2>
                            Industry{" "}
                            <span style={{ color: "#00d4aa" }}>facts & figures</span>
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
                        {feat.stats.map((stat) => (
                            <div key={stat.label} className="card" style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontSize: "2rem",
                                        fontWeight: 800,
                                        color: "#00d4aa",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {stat.value}
                                </div>
                                <p
                                    style={{
                                        color: "#c4c9e0",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.5,
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    {stat.label}
                                </p>
                                <a
                                    href={stat.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.6875rem",
                                        textDecoration: "none",
                                        borderBottom: "1px dotted #555d7e",
                                    }}
                                >
                                    Source: {stat.source}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Benefits ── */}
            <section className="section noise" style={{ background: "#0c0f1a" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Why it matters</span>
                        <h2>
                            Key{" "}
                            <span style={{ color: "#00d4aa" }}>benefits</span>
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
                        {feat.benefits.map((b) => (
                            <div key={b.title} className="card">
                                <div
                                    style={{
                                        fontSize: "2rem",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    {b.icon}
                                </div>
                                <h3
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontSize: "1.125rem",
                                        fontWeight: 700,
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {b.title}
                                </h3>
                                <p
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {b.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Step by step</span>
                        <h2>
                            How it{" "}
                            <span style={{ color: "#00d4aa" }}>works</span>
                        </h2>
                    </div>

                    <div
                        style={{
                            maxWidth: "600px",
                            margin: "0 auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0",
                        }}
                    >
                        {feat.howItWorks.map((step, i) => (
                            <div
                                key={step}
                                style={{
                                    display: "flex",
                                    gap: "1.25rem",
                                    alignItems: "flex-start",
                                    position: "relative",
                                    paddingBottom: i < feat.howItWorks.length - 1 ? "2rem" : "0",
                                }}
                            >
                                {/* Connector line */}
                                {i < feat.howItWorks.length - 1 && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "17px",
                                            top: "36px",
                                            width: "2px",
                                            height: "calc(100% - 20px)",
                                            background: "rgba(0,212,170,0.15)",
                                        }}
                                    />
                                )}
                                {/* Step number */}
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        background: "rgba(0,212,170,0.1)",
                                        border: "2px solid rgba(0,212,170,0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontFamily: "var(--font-outfit)",
                                        fontWeight: 800,
                                        color: "#00d4aa",
                                        fontSize: "0.875rem",
                                        flexShrink: 0,
                                    }}
                                >
                                    {i + 1}
                                </div>
                                <p
                                    style={{
                                        color: "#c4c9e0",
                                        fontSize: "0.9375rem",
                                        lineHeight: 1.6,
                                        paddingTop: "6px",
                                        margin: 0,
                                    }}
                                >
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Other Features ── */}
            <section className="section noise" style={{ background: "#0c0f1a" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">More features</span>
                        <h2>
                            Explore{" "}
                            <span style={{ color: "#00d4aa" }}>
                                all capabilities
                            </span>
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(240px, 1fr))",
                            gap: "1rem",
                            maxWidth: "900px",
                            margin: "0 auto",
                        }}
                    >
                        {FEATURES.filter((f) => f.slug !== feat.slug).map(
                            (f) => (
                                <a
                                    key={f.slug}
                                    href={`/features/${f.slug}`}
                                    className="card"
                                    style={{
                                        textDecoration: "none",
                                        textAlign: "center",
                                        transition:
                                            "border-color 0.2s, transform 0.2s",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "1.5rem",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        {f.icon}
                                    </div>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            marginBottom: "0.25rem",
                                        }}
                                    >
                                        {f.name}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "0.6875rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            color:
                                                f.plan === "bid"
                                                    ? "#00d4aa"
                                                    : "#8b5cf6",
                                        }}
                                    >
                                        {f.plan === "bid"
                                            ? "Free"
                                            : "Bid Plus"}
                                    </span>
                                </a>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* ── Free Tools cross-link ── */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Free tools</span>
                        <h2>
                            Try our{" "}
                            <span style={{ color: "#00d4aa" }}>free calculators</span>
                        </h2>
                        <p style={{ color: "#8b92b3", maxWidth: "500px", margin: "0.5rem auto 0" }}>
                            Government-backed data, no login required.
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

            {/* ── CTA ── */}
            <section
                className="section"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,212,170,0.06) 0%, transparent 60%), #141829",
                    textAlign: "center",
                }}
            >
                <div
                    className="section-inner"
                    style={{ maxWidth: "600px", margin: "0 auto" }}
                >
                    <h2 style={{ marginBottom: "1rem" }}>
                        Ready to try{" "}
                        <span style={{ color: "#00d4aa" }}>{feat.name}</span>?
                    </h2>
                    <p
                        style={{
                            color: "#8b92b3",
                            fontSize: "1.0625rem",
                            lineHeight: 1.7,
                            marginBottom: "2rem",
                        }}
                    >
                        {feat.plan === "bid"
                            ? "Start free — no credit card, no time limits. Create bids and proposals today."
                            : "Try Bid Plus free for 14 days. Just $9/month after that. Cancel anytime."}
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

            {/* ── Schema.org structured data ── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        name: `xiriOS — ${feat.name}`,
                        applicationCategory: "BusinessApplication",
                        operatingSystem: "Web",
                        offers: {
                            "@type": "Offer",
                            price: feat.plan === "bid" ? "0" : "9",
                            priceCurrency: "USD",
                        },
                        description: feat.metaDescription,
                    }),
                }}
            />

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

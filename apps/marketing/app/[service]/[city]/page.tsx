import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import PricingBlock from "../../components/PricingBlock";
import MarketSnapshot from "../../components/MarketSnapshot";
import { UNIQUE_CITIES } from "../../../lib/cities";
import { SERVICES, fillTemplate } from "../../../lib/services";

/* ────────── Static params ────────── */
export function generateStaticParams() {
    const params: { service: string; city: string }[] = [];
    for (const svc of SERVICES) {
        for (const c of UNIQUE_CITIES) {
            params.push({ service: svc.slug, city: c.slug });
        }
    }
    return params;
}

/* ────────── Metadata ────────── */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ service: string; city: string }>;
}): Promise<Metadata> {
    const { service: svcSlug, city: citySlug } = await params;
    const svc = SERVICES.find((s) => s.slug === svcSlug);
    const city = UNIQUE_CITIES.find((c) => c.slug === citySlug);
    if (!svc || !city) return {};
    const vars = { city: city.name, state: city.state, stateCode: city.stateCode };
    return {
        title: fillTemplate(svc.metaTitleTemplate, vars),
        description: fillTemplate(svc.metaDescTemplate, vars),
        openGraph: {
            title: fillTemplate(svc.metaTitleTemplate, vars),
            description: fillTemplate(svc.metaDescTemplate, vars),
            type: "website",
            url: `https://os.xiri.ai/${svc.slug}/${city.slug}`,
        },
        alternates: { canonical: `https://os.xiri.ai/${svc.slug}/${city.slug}` },
    };
}

/* ────────── Page ────────── */
export default async function CityServicePage({
    params,
}: {
    params: Promise<{ service: string; city: string }>;
}) {
    const { service: svcSlug, city: citySlug } = await params;
    const svc = SERVICES.find((s) => s.slug === svcSlug);
    const city = UNIQUE_CITIES.find((c) => c.slug === citySlug);
    if (!svc || !city) notFound();

    const vars = { city: city.name, state: city.state, stateCode: city.stateCode };
    const t = (tpl: string) => fillTemplate(tpl, vars);

    // Nearby cities for internal linking
    const nearby = UNIQUE_CITIES.filter(
        (c) => c.stateCode === city.stateCode && c.slug !== city.slug
    ).slice(0, 6);

    // JSON-LD structured data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "xiriOS",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: `https://os.xiri.ai/${svc.slug}/${city.slug}`,
        description: t(svc.metaDescTemplate),
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: "Free plan with unlimited bids",
        },
        areaServed: {
            "@type": "City",
            name: city.name,
            addressRegion: city.stateCode,
            addressCountry: "US",
        },
    };

    // FAQPage schema for rich snippets
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: svc.faqs.map((faq) => ({
            "@type": "Question",
            name: t(faq.q),
            acceptedAnswer: {
                "@type": "Answer",
                text: t(faq.a),
            },
        })),
    };

    return (
        <>
            <Navbar />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />

            {/* Hero */}
            <section
                className="section noise"
                style={{
                    minHeight: "48vh",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "120px",
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div className="section-inner" style={{ textAlign: "center", width: "100%" }}>
                    <span className="section-label">{svc.name}</span>
                    <h1>{t(svc.h1Template)}</h1>
                    <p
                        style={{
                            fontSize: "1.1rem",
                            maxWidth: "620px",
                            margin: "1rem auto 2rem",
                            color: "#c4c9e0",
                            lineHeight: 1.7,
                        }}
                    >
                        {t(svc.subtitle)}
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/pricing" className="btn btn-primary">
                            Start Free →
                        </a>
                        <a href={`/calculator?state=${city.stateCode}`} className="btn btn-secondary">
                            Try the Calculator
                        </a>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Why {city.name} businesses choose <span style={{ whiteSpace: "nowrap" }}>xiri<span style={{ color: "#00d4aa" }}>OS</span></span></span>
                        <h2>
                            Everything you need to{" "}
                            <span style={{ color: "#00d4aa" }}>win &amp; deliver</span>
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
                        {svc.features.map((f) => (
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
                                <span style={{ color: "#c4c9e0", fontSize: "0.9375rem", lineHeight: 1.5 }}>
                                    {t(f)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Market Snapshot */}
            <MarketSnapshot
                cityName={city.name}
                citySlug={city.slug}
                stateCode={city.stateCode}
                stateName={city.state}
            />

            {/* Calculator CTA */}
            <section
                className="section noise"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,212,170,0.06) 0%, transparent 70%), #0c0f1a",
                }}
            >
                <div
                    className="section-inner"
                    style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto" }}
                >
                    <div className="section-header">
                        <span className="section-label">Free tool</span>
                        <h2>
                            Price a {city.name} cleaning job in{" "}
                            <span style={{ color: "#00d4aa" }}>5 minutes</span>
                        </h2>
                    </div>
                    <p
                        style={{
                            color: "#c4c9e0",
                            fontSize: "1.0625rem",
                            lineHeight: 1.7,
                            margin: "-0.5rem auto 2rem",
                            maxWidth: "520px",
                        }}
                    >
                        Enter the building&apos;s square footage, select the type and
                        cleaning frequency, and get an instant bid based on ISSA 612
                        production rates.
                    </p>
                    <a
                        href={`/calculator?state=${city.stateCode}`}
                        className="btn btn-primary"
                        style={{
                            fontSize: "1.0625rem",
                            padding: "1rem 2.5rem",
                        }}
                    >
                        Open Free Calculator →
                    </a>
                    <p
                        style={{
                            color: "#555d7e",
                            fontSize: "0.8125rem",
                            marginTop: "1rem",
                        }}
                    >
                        No sign-up required · Generate PDF proposals instantly
                    </p>
                </div>
            </section>

            {/* Pricing snapshot */}
            <section className="section noise" style={{ background: "#0c0f1a" }}>
                <div className="section-inner" style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}>
                    <div className="section-header">
                        <span className="section-label">Affordable pricing</span>
                        <h2>
                            Plans for every {city.name}{" "}
                            <span style={{ color: "#00d4aa" }}>cleaning company</span>
                        </h2>
                    </div>
                    <PricingBlock variant="compact" />
                </div>
            </section>

            {/* FAQ */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner" style={{ maxWidth: "700px", margin: "0 auto" }}>
                    <div className="section-header">
                        <span className="section-label">FAQ</span>
                        <h2>
                            Common questions about {svc.name.toLowerCase()} in{" "}
                            <span style={{ color: "#00d4aa" }}>{city.name}</span>
                        </h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {svc.faqs.map((faq) => (
                            <details
                                key={faq.q}
                                style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: "10px",
                                    padding: "1.25rem",
                                }}
                            >
                                <summary
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        cursor: "pointer",
                                        color: "#e8eaf0",
                                    }}
                                >
                                    {t(faq.q)}
                                </summary>
                                <p
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.9375rem",
                                        lineHeight: 1.7,
                                        marginTop: "0.75rem",
                                    }}
                                >
                                    {t(faq.a)}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nearby cities */}
            {nearby.length > 0 && (
                <section className="section noise" style={{ background: "#0c0f1a" }}>
                    <div className="section-inner" style={{ maxWidth: "700px", margin: "0 auto" }}>
                        <div className="section-header">
                            <span className="section-label">Also serving</span>
                            <h2>
                                {svc.name} in other{" "}
                                <span style={{ color: "#00d4aa" }}>{city.state}</span> cities
                            </h2>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.75rem",
                                justifyContent: "center",
                            }}
                        >
                            {nearby.map((nc) => (
                                <a
                                    key={nc.slug}
                                    href={`/${svc.slug}/${nc.slug}`}
                                    style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: "8px",
                                        padding: "0.625rem 1.25rem",
                                        color: "#c4c9e0",
                                        fontSize: "0.875rem",
                                        textDecoration: "none",
                                        transition: "border-color 0.2s",
                                    }}
                                >
                                    {nc.name}, {nc.stateCode}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Startup guide cross-link */}
            <section
                className="section"
                style={{
                    background: "linear-gradient(135deg, rgba(245,166,35,0.06), rgba(0,212,170,0.04)), #0c0f1a",
                    borderTop: "1px solid rgba(245,166,35,0.12)",
                    borderBottom: "1px solid rgba(245,166,35,0.12)",
                }}
            >
                <div
                    className="section-inner"
                    style={{
                        maxWidth: "640px",
                        margin: "0 auto",
                        textAlign: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#f5a623",
                            background: "rgba(245,166,35,0.1)",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "100px",
                        }}
                    >
                        Startup Guide
                    </span>
                    <h2 style={{ marginTop: "1rem" }}>
                        Starting a cleaning business in{" "}
                        <span style={{ color: "#f5a623" }}>{city.name}</span>?
                    </h2>
                    <p
                        style={{
                            color: "#c4c9e0",
                            fontSize: "1rem",
                            lineHeight: 1.7,
                            margin: "0.75rem auto 1.5rem",
                            maxWidth: "520px",
                        }}
                    >
                        Our free step-by-step guide covers LLC setup, insurance,
                        data-backed pricing, and finding your first clients — all with{" "}
                        {city.state} market data.
                    </p>
                    <a
                        href={`/start-cleaning-business/${city.slug}`}
                        className="btn btn-primary"
                        style={{
                            fontSize: "0.9375rem",
                            padding: "0.75rem 2rem",
                            background: "linear-gradient(135deg, #f5a623, #e08e10)",
                        }}
                    >
                        Read the {city.name} Startup Guide →
                    </a>
                </div>
            </section>

            {/* Bottom CTA */}
            <section
                className="section"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,212,170,0.06) 0%, transparent 60%), #141829",
                }}
            >
                <div className="section-inner" style={{ textAlign: "center", maxWidth: "580px", margin: "0 auto" }}>
                    <h2>
                        Ready to grow your{" "}
                        <span style={{ color: "#00d4aa" }}>{city.name}</span> cleaning business?
                    </h2>
                    <p
                        style={{
                            color: "#8b92b3",
                            fontSize: "1.0625rem",
                            lineHeight: 1.7,
                            margin: "1rem 0 2rem",
                        }}
                    >
                        Start free — unlimited bids, PDF proposals, and CRM for up to 10 contacts. No credit
                        card required.
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
                            href={`/calculator?state=${city.stateCode}`}
                            className="btn btn-secondary"
                            style={{ fontSize: "1rem", padding: "0.875rem 2.5rem" }}
                        >
                            Free Cleaning Bid Calculator
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
                    © {new Date().getFullYear()} XIRI LLC · xiriOS is built for cleaning businesses of all sizes.
                </p>
            </footer>
        </>
    );
}

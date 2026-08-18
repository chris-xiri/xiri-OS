import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import StartupPageTracker from "../../components/StartupPageTracker";
import LaunchpadOptIn from "../../components/LaunchpadOptIn";
import { UNIQUE_CITIES } from "../../../lib/cities";
import { getCityMarketData, NATIONAL_MEDIAN_WAGE } from "../../../lib/market-data";
import {
    STARTUP_STEPS,
    STARTUP_FAQS,
    META_TITLE_TEMPLATE,
    META_DESC_TEMPLATE,
} from "../../../lib/start-business-data";

/* ────────── helpers ────────── */

function fill(
    tpl: string,
    v: {
        city: string;
        state: string;
        stateCode: string;
        medianWage: string;
        loadedWage: string;
        minWage: string;
        janitorialCompanies: string;
        officeProperties: string;
        medicalFacilities: string;
        schools: string;
    },
) {
    return tpl
        .replace(/\{city\}/g, v.city)
        .replace(/\{state\}/g, v.state)
        .replace(/\{stateCode\}/g, v.stateCode)
        .replace(/\{medianWage\}/g, v.medianWage)
        .replace(/\{loadedWage\}/g, v.loadedWage)
        .replace(/\{minWage\}/g, v.minWage)
        .replace(/\{janitorialCompanies\}/g, v.janitorialCompanies)
        .replace(/\{officeProperties\}/g, v.officeProperties)
        .replace(/\{medicalFacilities\}/g, v.medicalFacilities)
        .replace(/\{schools\}/g, v.schools);
}

function buildVars(city: (typeof UNIQUE_CITIES)[number]) {
    const data = getCityMarketData(city.slug, city.stateCode);
    const medianWage = data.metro?.medianWage ?? NATIONAL_MEDIAN_WAGE;
    const loadedWage = (medianWage * 1.25).toFixed(2);
    return {
        city: city.name,
        state: city.state,
        stateCode: city.stateCode,
        medianWage: medianWage.toFixed(2),
        loadedWage,
        minWage: (data.state?.minWage ?? 7.25).toFixed(2),
        janitorialCompanies: (data.state?.janitorialCompanies ?? 0).toLocaleString(),
        officeProperties: (data.metro?.officeProperties ?? 0).toLocaleString(),
        medicalFacilities: (data.metro?.medicalFacilities ?? 0).toLocaleString(),
        schools: (data.metro?.schools ?? 0).toLocaleString(),
    };
}

/* ────────── static params ────────── */
export function generateStaticParams() {
    return UNIQUE_CITIES.map((c) => ({ city: c.slug }));
}

/* ────────── metadata ────────── */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ city: string }>;
}): Promise<Metadata> {
    const { city: slug } = await params;
    const city = UNIQUE_CITIES.find((c) => c.slug === slug);
    if (!city) return {};
    const v = buildVars(city);
    return {
        title: fill(META_TITLE_TEMPLATE, v),
        description: fill(META_DESC_TEMPLATE, v),
        openGraph: {
            title: fill(META_TITLE_TEMPLATE, v),
            description: fill(META_DESC_TEMPLATE, v),
            type: "article",
            url: `https://os.xiri.ai/start-cleaning-business/${city.slug}`,
        },
        alternates: { canonical: `https://os.xiri.ai/start-cleaning-business/${city.slug}` },
    };
}

/* ────────── page ────────── */
export default async function StartCleaningBusinessCityPage({
    params,
}: {
    params: Promise<{ city: string }>;
}) {
    const { city: slug } = await params;
    const city = UNIQUE_CITIES.find((c) => c.slug === slug);
    if (!city) notFound();
    const v = buildVars(city);
    const t = (tpl: string) => fill(tpl, v);

    const nearby = UNIQUE_CITIES.filter(
        (c) => c.stateCode === city.stateCode && c.slug !== city.slug,
    ).slice(0, 6);

    /* JSON-LD: HowTo */
    const howToLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to Start a Cleaning Business in ${city.name}, ${city.stateCode}`,
        description: `Complete step-by-step guide to starting a cleaning business in ${city.name} with local market data and BLS wage statistics.`,
        step: STARTUP_STEPS.map((s, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: t(s.title),
            text: t(s.body).replace(/\*\*/g, ""),
        })),
        tool: [
            { "@type": "HowToTool", name: "xiriOS Free Calculator" },
            { "@type": "HowToTool", name: "ISSA 612 Production Rates" },
        ],
    };

    /* JSON-LD: FAQPage */
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: STARTUP_FAQS.map((faq) => ({
            "@type": "Question",
            name: t(faq.q),
            acceptedAnswer: { "@type": "Answer", text: t(faq.a) },
        })),
    };

    return (
        <>
            <Navbar />
            <StartupPageTracker city={city.name} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />

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
                    <span className="section-label">Startup Guide</span>
                    <h1>
                        How to Start a Cleaning Business in{" "}
                        <span style={{ color: "#00d4aa" }}>
                            {city.name}, {city.stateCode}
                        </span>
                    </h1>
                    <p
                        style={{
                            fontSize: "1.1rem",
                            maxWidth: "640px",
                            margin: "1rem auto 2rem",
                            color: "#c4c9e0",
                            lineHeight: 1.7,
                        }}
                    >
                        Everything you need to launch a profitable cleaning company in{" "}
                        {city.name} — with real BLS wage data, local market stats, and
                        free tools to price your first bid.
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
                            href="/app/login?mode=signup"
                            className="btn btn-primary"
                        >
                            Start Your Cleaning Business Free →
                        </a>
                        <a
                            href={`/calculator?state=${city.stateCode}`}
                            className="btn btn-secondary"
                        >
                            Try the Free Calculator
                        </a>
                    </div>

                    {/* Market stat badges */}
                    <div
                        style={{
                            marginTop: "3rem",
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        {[
                            { value: `$${v.medianWage}/hr`, label: "Median janitor wage (BLS)" },
                            {
                                value: v.janitorialCompanies,
                                label: `Cleaning companies in ${city.state}`,
                            },
                            {
                                value: `$${v.minWage}/hr`,
                                label: `${city.state} minimum wage`,
                            },
                        ].map((badge) => (
                            <div
                                key={badge.label}
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
                                    {badge.value}
                                </span>
                                <span
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.75rem",
                                        marginTop: "0.25rem",
                                    }}
                                >
                                    {badge.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7-Day Email Drip Course Opt-In */}
            <section className="section" style={{ background: "#0c0f1a", padding: "1rem 1rem 3rem" }}>
                <div className="section-inner" style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <LaunchpadOptIn cityName={`${city.name}, ${city.stateCode}`} />
                </div>
            </section>

            {/* Steps */}
            <section className="section" style={{ background: "#141829" }}>
                <div
                    className="section-inner"
                    style={{ maxWidth: "800px", margin: "0 auto" }}
                >
                    <div className="section-header">
                        <span className="section-label">8-step guide</span>
                        <h2>
                            Start your {city.name}{" "}
                            <span style={{ color: "#00d4aa" }}>cleaning business</span>
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2rem",
                        }}
                    >
                        {STARTUP_STEPS.map((step, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    gap: "1.25rem",
                                    alignItems: "flex-start",
                                }}
                            >
                                {/* Step number */}
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        background:
                                            "linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))",
                                        border: "1px solid rgba(0,212,170,0.25)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontFamily: "var(--font-outfit)",
                                        fontWeight: 800,
                                        fontSize: "1rem",
                                        color: "#00d4aa",
                                        flexShrink: 0,
                                    }}
                                >
                                    {i + 1}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3
                                        style={{
                                            fontFamily: "var(--font-outfit)",
                                            fontWeight: 700,
                                            fontSize: "1.125rem",
                                            color: "#f0f1f7",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        {step.icon} {t(step.title)}
                                    </h3>
                                    <p
                                        style={{
                                            color: "#c4c9e0",
                                            fontSize: "0.9375rem",
                                            lineHeight: 1.7,
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: t(step.body)
                                                .replace(
                                                    /\*\*(.*?)\*\*/g,
                                                    '<strong style="color: white">$1</strong>',
                                                )
                                                .replace(/\n/g, "<br />"),
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                    style={{
                        textAlign: "center",
                        maxWidth: "640px",
                        margin: "0 auto",
                    }}
                >
                    <div className="section-header">
                        <span className="section-label">Free tool</span>
                        <h2>
                            Price your first {city.name} cleaning job in{" "}
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
                        production rates — pre-filled with {city.state} wage data.
                    </p>
                    <a
                        href={`/calculator?state=${city.stateCode}`}
                        className="btn btn-primary"
                        style={{ fontSize: "1.0625rem", padding: "1rem 2.5rem" }}
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

            {/* FAQ */}
            <section className="section" style={{ background: "#141829" }}>
                <div
                    className="section-inner"
                    style={{ maxWidth: "700px", margin: "0 auto" }}
                >
                    <div className="section-header">
                        <span className="section-label">FAQ</span>
                        <h2>
                            Starting a cleaning business in{" "}
                            <span style={{ color: "#00d4aa" }}>{city.name}</span>
                        </h2>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        {STARTUP_FAQS.map((faq) => (
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

            {/* Related blog posts */}
            <section className="section noise" style={{ background: "#0c0f1a" }}>
                <div
                    className="section-inner"
                    style={{ maxWidth: "700px", margin: "0 auto" }}
                >
                    <div className="section-header">
                        <span className="section-label">Related guides</span>
                        <h2>
                            More resources for{" "}
                            <span style={{ color: "#00d4aa" }}>new cleaning businesses</span>
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
                                desc: "Everything from LLC to first contract",
                            },
                            {
                                href: "/blog/cost-to-start-cleaning-business",
                                title: "Startup Cost Breakdown",
                                desc: "Budget scenarios: $2K, $5K, and $10K",
                            },
                            {
                                href: "/blog/cleaning-business-startup-checklist",
                                title: "Startup Checklist",
                                desc: "Pre-launch to first client in 30 days",
                            },
                            {
                                href: "/blog/how-to-price-janitorial-cleaning",
                                title: "Pricing Guide",
                                desc: "Square footage method with ISSA rates",
                            },
                        ].map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="card"
                                style={{
                                    textDecoration: "none",
                                    padding: "1.25rem",
                                    transition: "border-color 0.2s",
                                }}
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
                                <span
                                    style={{
                                        color: "#00d4aa",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    Read →
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nearby cities */}
            {nearby.length > 0 && (
                <section className="section" style={{ background: "#141829" }}>
                    <div
                        className="section-inner"
                        style={{ maxWidth: "700px", margin: "0 auto" }}
                    >
                        <div className="section-header">
                            <span className="section-label">Also serving</span>
                            <h2>
                                Start a cleaning business in other{" "}
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
                                    href={`/start-cleaning-business/${nc.slug}`}
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

            {/* Bottom CTA */}
            <section
                className="section"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,212,170,0.06) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div
                    className="section-inner"
                    style={{
                        textAlign: "center",
                        maxWidth: "580px",
                        margin: "0 auto",
                    }}
                >
                    <h2>
                        Ready to launch your{" "}
                        <span style={{ color: "#00d4aa" }}>{city.name}</span> cleaning
                        business?
                    </h2>
                    <p
                        style={{
                            color: "#8b92b3",
                            fontSize: "1.0625rem",
                            lineHeight: 1.7,
                            margin: "1rem 0 2rem",
                        }}
                    >
                        xiriOS gives you everything to bid, win, and deliver —
                        calculator, proposals, CRM, and scheduling. Start free, no
                        credit card required.
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
                            href="/app/login?mode=signup"
                            className="btn btn-primary"
                            style={{ fontSize: "1rem", padding: "0.875rem 2.5rem" }}
                        >
                            Start Your Cleaning Business Free →
                        </a>
                        <a
                            href={`/calculator?state=${city.stateCode}`}
                            className="btn btn-secondary"
                            style={{ fontSize: "1rem", padding: "0.875rem 2.5rem" }}
                        >
                            Try the Calculator
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
                    © {new Date().getFullYear()} XIRI LLC · Data sources: Bureau of
                    Labor Statistics (BLS), Census Bureau, ISSA.
                </p>
            </footer>
        </>
    );
}

import type { Metadata } from "next";
import CalculatorEmbed from "./CalculatorEmbed";

export const metadata: Metadata = {
    title: "Free Janitorial Bid Calculator — ISSA 612 Powered | xiriOS",
    description:
        "Calculate accurate cleaning bids in seconds. Powered by ISSA 612 production rates and real industry data. Room-by-room scoping, task frequencies, and financial settings. No signup required.",
    openGraph: {
        title: "Free Janitorial Bid Calculator | xiriOS",
        description:
            "Calculate accurate cleaning bids in seconds. Powered by ISSA 612 production rates. No signup — try it free now.",
    },
    alternates: { canonical: "https://os.xiri.ai/calculator" },
};

const SOFTWARE_APP_LD = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "xiriOS Janitorial Bid Calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://os.xiri.ai/calculator",
    description:
        "Free janitorial bid calculator powered by ISSA 612 production rates. Calculate cleaning bids by building type, square footage, and frequency. No signup or download required.",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    creator: {
        "@type": "Organization",
        name: "xiriOS",
        url: "https://os.xiri.ai",
    },
    featureList: [
        "ISSA 612 production rate calculations",
        "15 building types supported",
        "Room-by-room scope builder",
        "Task-level frequency control",
        "State-based BLS wage data",
        "Profit margin and overhead modeling",
        "PDF proposal generation",
        "No signup required",
    ],
};

const FAQ_LD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Is the janitorial bid calculator really free?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, the xiriOS bid calculator is 100% free with no signup required. You can calculate unlimited bids instantly. To save bids and generate PDF proposals, create a free account.",
            },
        },
        {
            "@type": "Question",
            name: "What are ISSA 612 production rates?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "ISSA 612 Cleaning Times is the industry-standard reference for how long cleaning tasks take per square foot. It provides production rates (square feet per hour) for different building types and cleaning tasks, used by professional cleaning companies and facility managers worldwide.",
            },
        },
        {
            "@type": "Question",
            name: "Do I need to download anything to use the calculator?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "No. The calculator runs entirely in your web browser — desktop or mobile. No download, no app install, and no signup required. Just open the page and start calculating.",
            },
        },
        {
            "@type": "Question",
            name: "How accurate is the janitorial bid calculator?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "The calculator uses ISSA 612 production rates calibrated for each building type, floor type ratios, fixture density, and state-specific BLS wage data. Results are typically within 5–10% of what an experienced estimator would produce after a full walkthrough.",
            },
        },
        {
            "@type": "Question",
            name: "What building types does the calculator support?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "The calculator supports 15 building types including general offices, medical facilities, schools, retail, restaurants, warehouses, churches, gyms, residential homes, and more. Each type has a calibrated ISSA production rate.",
            },
        },
    ],
};

export default function CalculatorPage() {
    return (
        <>
            {/* SoftwareApplication schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(SOFTWARE_APP_LD),
                }}
            />
            {/* FAQ schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(FAQ_LD),
                }}
            />

            {/* The interactive calculator */}
            <CalculatorEmbed />

            {/* Visibly rendered SEO & GEO guide + FAQ section below the calculator */}
            <section
                className="section"
                style={{
                    background: "#0c0f1a",
                    color: "#c4c9e0",
                    padding: "4rem 1.5rem",
                    borderTop: "1px solid #2a2f47",
                }}
            >
                <div className="section-inner" style={{ maxWidth: "820px", margin: "0 auto", lineHeight: 1.75 }}>
                    <h1 style={{ color: "white", fontSize: "2rem", marginBottom: "1rem" }}>
                        Free Janitorial Bid Calculator — Powered by ISSA 612 Production Rates
                    </h1>
                    <p style={{ marginBottom: "2rem" }}>
                        Calculate accurate janitorial cleaning bids in seconds using industry-standard ISSA 612 production
                        rates and U.S. Bureau of Labor Statistics (BLS) metro wage data. No signup, no download, no cost —
                        enter your building details above and export a branded PDF proposal in 60 seconds.
                    </p>

                    <h2 style={{ color: "white", fontSize: "1.375rem", marginBottom: "1rem" }}>How the Calculator Works</h2>
                    <ol style={{ paddingLeft: "1.25rem", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <li>
                            <strong style={{ color: "white" }}>Select your building type</strong> — Choose from 15 facility types including office, medical clinic,
                            school, retail, restaurant, warehouse, church, gym, and more. Each has a calibrated ISSA 612
                            production rate (sq ft/hr) and restroom fixture density.
                        </li>
                        <li>
                            <strong style={{ color: "white" }}>Enter building details &amp; room scopes</strong> — Add square footage, cleaning frequency (1–7 days per week or one-time),
                            and customize individual room scopes and task frequencies.
                        </li>
                        <li>
                            <strong style={{ color: "white" }}>Get your bid price &amp; export your PDF proposal</strong> — The calculator computes labor hours using ISSA 612 rates,
                            applies your local BLS wage rate, payroll tax burden, supplies, overhead, and profit margin, and generates a client-ready PDF proposal.
                        </li>
                    </ol>

                    <h2 style={{ color: "white", fontSize: "1.375rem", marginBottom: "1rem" }}>Key Features</h2>
                    <ul style={{ paddingLeft: "1.25rem", marginBottom: "2.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.5rem 1.5rem" }}>
                        <li>ISSA 612 production rate calculations for 15 building types</li>
                        <li>Room-by-room scope builder with individual task selection</li>
                        <li>Task-level frequency control (daily, weekly, monthly, quarterly)</li>
                        <li>State &amp; metro BLS wage data pre-filled by ZIP code</li>
                        <li>Profit margin, overhead, payroll tax, and supply cost modeling</li>
                        <li>Instant branded PDF proposal preview and download</li>
                        <li>Modern mobile-first interface for on-site walkthroughs</li>
                        <li>100% free calculator — no signup or download required</li>
                    </ul>

                    <h2 style={{ color: "white", fontSize: "1.375rem", marginBottom: "1.25rem" }}>Frequently Asked Questions</h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <h3 style={{ color: "white", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>Is the janitorial bid calculator really free?</h3>
                            <p style={{ margin: 0, fontSize: "0.9375rem" }}>
                                Yes, the xiriOS bid calculator is 100% free with no signup required. You can calculate unlimited bids
                                instantly. To save bids and export branded PDF proposals, start your free account (includes a 60-day Bid Plus free trial).
                            </p>
                        </div>

                        <div>
                            <h3 style={{ color: "white", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>What are ISSA 612 production rates?</h3>
                            <p style={{ margin: 0, fontSize: "0.9375rem" }}>
                                ISSA 612 Cleaning Times is the industry-standard reference for how long cleaning tasks take per
                                square foot. It provides production rates (square feet per hour) for different building types and
                                cleaning tasks, used by professional cleaning companies and facility managers worldwide.
                            </p>
                        </div>

                        <div>
                            <h3 style={{ color: "white", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>Do I need to download anything to use the calculator?</h3>
                            <p style={{ margin: 0, fontSize: "0.9375rem" }}>
                                No. The calculator runs entirely in your web browser — desktop or mobile. No download, no app
                                install, and no signup required.
                            </p>
                        </div>

                        <div>
                            <h3 style={{ color: "white", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>How accurate is the janitorial bid calculator?</h3>
                            <p style={{ margin: 0, fontSize: "0.9375rem" }}>
                                The calculator uses ISSA 612 production rates calibrated for each building type, floor type ratios,
                                fixture density, and state-specific BLS wage data. Results are typically within 5–10% of what an
                                experienced estimator would produce after a full walkthrough.
                            </p>
                        </div>

                        <div>
                            <h3 style={{ color: "white", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>What building types does the calculator support?</h3>
                            <p style={{ margin: 0, fontSize: "0.9375rem" }}>
                                The calculator supports 15 building types including general offices, medical facilities, schools,
                                retail stores, restaurants, warehouses, churches, gyms, daycares, auto dealerships, hotels, banks, and residential homes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

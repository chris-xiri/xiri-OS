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

            {/* SSR content — visible to AI crawlers that can't render iframes */}
            <div
                style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    borderWidth: 0,
                }}
                aria-hidden="true"
            >
                <h1>Free Janitorial Bid Calculator — Powered by ISSA 612 Production Rates</h1>
                <p>
                    Calculate accurate janitorial cleaning bids in seconds using industry-standard ISSA 612 production
                    rates. No signup, no download, no cost — just enter your building details and get a data-backed price
                    range instantly.
                </p>

                <h2>How the Calculator Works</h2>
                <ol>
                    <li>
                        <strong>Select your building type</strong> — Choose from 15 types including office, medical,
                        school, retail, restaurant, warehouse, church, gym, and more. Each has a calibrated ISSA
                        production rate.
                    </li>
                    <li>
                        <strong>Enter building details</strong> — Add square footage, number of floors, restroom count,
                        and cleaning frequency (1–7 days per week).
                    </li>
                    <li>
                        <strong>Get your bid price</strong> — The calculator computes labor hours using ISSA rates,
                        applies your wage rate, overhead, and profit margin, and returns a monthly price range.
                    </li>
                </ol>

                <h2>Key Features</h2>
                <ul>
                    <li>ISSA 612 production rate calculations for 15 building types</li>
                    <li>Room-by-room scope builder with individual task selection</li>
                    <li>Task-level frequency control (daily, weekly, monthly, quarterly)</li>
                    <li>State-based BLS wage data pre-filled by location</li>
                    <li>Profit margin, overhead, and supply cost modeling</li>
                    <li>Price range output (±20%) for market flexibility</li>
                    <li>Modern mobile-first interface — works on any device</li>
                    <li>100% free — no signup, no download required</li>
                </ul>

                <h2>Frequently Asked Questions</h2>

                <h3>Is the janitorial bid calculator really free?</h3>
                <p>
                    Yes, the xiriOS bid calculator is 100% free with no signup required. You can calculate unlimited bids
                    instantly. To save bids and generate PDF proposals, create a free account.
                </p>

                <h3>What are ISSA 612 production rates?</h3>
                <p>
                    ISSA 612 Cleaning Times is the industry-standard reference for how long cleaning tasks take per
                    square foot. It provides production rates (square feet per hour) for different building types and
                    cleaning tasks, used by professional cleaning companies and facility managers worldwide.
                </p>

                <h3>Do I need to download anything to use the calculator?</h3>
                <p>
                    No. The calculator runs entirely in your web browser — desktop or mobile. No download, no app
                    install, and no signup required.
                </p>

                <h3>How accurate is the janitorial bid calculator?</h3>
                <p>
                    The calculator uses ISSA 612 production rates calibrated for each building type, floor type ratios,
                    fixture density, and state-specific BLS wage data. Results are typically within 5–10% of what an
                    experienced estimator would produce after a full walkthrough.
                </p>

                <h3>What building types does the calculator support?</h3>
                <p>
                    The calculator supports 15 building types including general offices, medical facilities, schools,
                    retail stores, restaurants, warehouses, churches, gyms, residential homes, and more.
                </p>

                <h3>How is this different from other janitorial calculators?</h3>
                <p>
                    Most janitorial calculators require a paid subscription, a software download, or a signup before you
                    can use them. The xiriOS calculator is free, runs in your browser, and uses ISSA 612 production rates
                    — the same industry standard used by the largest facility management companies. It also features a
                    modern, mobile-first interface designed for use on job sites.
                </p>
            </div>

            {/* The actual interactive calculator */}
            <CalculatorEmbed />
        </>
    );
}

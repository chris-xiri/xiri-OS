import type { Metadata } from "next";
import TimeEstimatorTool from "./TimeEstimatorTool";

export const metadata: Metadata = {
    title: "Free Cleaning Time Estimator — ISSA Production Rates | xiriOS",
    description:
        "How long should it take to clean this building? Calculate using ISSA-standard production rates by area type — offices, restrooms, lobbies, medical, schools, and more. Free tool.",
    keywords:
        "cleaning time calculator, how long to clean building, janitorial cleaning time estimator, ISSA production rates, sq ft per hour cleaning",
    openGraph: {
        title: "Free Cleaning Time Estimator | xiriOS",
        description:
            "Calculate cleaning time using ISSA-standard production rates. 10 area types, crew size adjustments. Free tool.",
        type: "website",
        url: "https://os.xiri.ai/tools/time-estimator",
    },
    alternates: { canonical: "https://os.xiri.ai/tools/time-estimator" },
};

const FAQS = [
    {
        q: "How long does it take to clean a 10,000 sq ft office?",
        a: "A standard 10,000 sq ft office (general office areas + restrooms + lobby) takes approximately 3–3.5 hours per visit for a single cleaner, based on ISSA 612 production rate standards. General office areas clean at roughly 4,200 sq ft/hour, while restrooms clean at only 1,000 sq ft/hour due to fixture-by-fixture disinfection requirements.",
    },
    {
        q: "What are ISSA production rates?",
        a: "ISSA production rates are industry-standard benchmarks published in the ISSA 612 Cleaning Times guide. They measure how many cleanable square feet one worker can service per hour, by area type. For example: General Office = 4,200 sqft/hr, Restrooms = 1,000 sqft/hr, Medical = 2,200 sqft/hr, Warehouse = 6,000 sqft/hr. These rates are used globally by cleaning companies and facility managers for bidding and staffing.",
    },
    {
        q: "Why do restrooms take so much longer to clean?",
        a: "Restrooms clean at approximately 1,000 sqft/hour — roughly 4× slower than general office space (4,200 sqft/hr). This is because restrooms require fixture-by-fixture cleaning and disinfection of toilets, sinks, mirrors, dispensers, and partitions. Buildings with a high restroom-to-office ratio are the most commonly underbid contracts in the janitorial industry.",
    },
    {
        q: "Does adding a second cleaner cut the time in half?",
        a: "Not exactly. Due to coordination overhead, two cleaners typically complete the work of about 1.8 single cleaners, not 2.0. This means a 3-hour job for one person takes about 1.67 hours for two people, not 1.5 hours. Factor this efficiency loss into your staffing and bidding calculations.",
    },
];

export default function Page() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                name: "Cleaning Time Estimator",
                description:
                    "Estimate cleaning time for any commercial building using ISSA-standard production rates. Supports 10 area types.",
                url: "https://os.xiri.ai/tools/time-estimator",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Any",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                creator: { "@type": "Organization", name: "xiriOS", url: "https://os.xiri.ai" },
            },
            {
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <TimeEstimatorTool faqs={FAQS} />
        </>
    );
}

import type { Metadata } from "next";
import PriceCheckerTool from "./PriceCheckerTool";

export const metadata: Metadata = {
    title: "Free Cleaning Price Checker — Local Market Rates | xiriOS",
    description:
        "Are you charging enough for cleaning? Check local prices using BLS median janitor wages for 40 U.S. metro areas. See budget, standard, and premium price ranges. Free tool.",
    keywords:
        "cleaning price checker, how much to charge for cleaning, janitorial pricing by city, cleaning rates per square foot, commercial cleaning prices by metro area",
    openGraph: {
        title: "Free Cleaning Price Checker — Local Market Rates | xiriOS",
        description:
            "Check cleaning prices against BLS median wages in your metro area. 40 cities covered. Free tool — no login required.",
        type: "website",
        url: "https://os.xiri.ai/tools/price-checker",
    },
    alternates: { canonical: "https://os.xiri.ai/tools/price-checker" },
};

const FAQS = [
    {
        q: "How much should I charge for commercial cleaning?",
        a: "Commercial cleaning prices vary significantly by metro area. Based on BLS median janitor wages, a 10,000 sqft office cleaned 5×/week costs approximately $2,500–4,100/month in lower-cost metros (San Antonio, Memphis) and $3,800–6,500/month in high-cost metros (New York, San Francisco). The exact price depends on building type, scope, frequency, and your service tier (budget, standard, or premium).",
    },
    {
        q: "Why do cleaning prices vary by city?",
        a: "Cleaning prices are primarily driven by local labor costs. The BLS Occupational Employment and Wage Statistics (OEWS) program shows janitor wages ranging from $13.66/hour (San Antonio) to $21.44/hour (New York City) — a 57% gap. Since labor is 50–60% of total cleaning costs, this wage difference flows directly into service pricing.",
    },
    {
        q: "What is the BLS median wage for janitors?",
        a: "The national median hourly wage for Janitors and Cleaners (SOC 37-2011) is $16.29, according to the Bureau of Labor Statistics May 2024 Occupational Employment and Wage Statistics. However, metro-area medians range from $13.66 (San Antonio) to $21.44 (New York City). Always use your local metro wage when pricing jobs.",
    },
    {
        q: "What multiplier should I use for cleaning bids?",
        a: "The service multiplier applied to your fully-loaded labor rate typically ranges from 1.8× (budget/basic service) to 3.0× (premium/full-service). A standard multiplier of 2.4× is common. For example, with a $17.44/hr loaded labor rate: budget = $31.39/hr billed, standard = $41.86/hr billed, premium = $52.32/hr billed. This covers overhead, profit, supplies, and admin.",
    },
];

export default function Page() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                name: "Cleaning Price Checker",
                description:
                    "Compare cleaning prices across 40 U.S. metro areas using BLS median janitor wages. Shows budget, standard, and premium price ranges.",
                url: "https://os.xiri.ai/tools/price-checker",
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
            <PriceCheckerTool faqs={FAQS} />
        </>
    );
}

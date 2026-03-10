import type { Metadata } from "next";
import ProfitCalculatorTool from "./ProfitCalculatorTool";

export const metadata: Metadata = {
    title: "Free Cleaning Profit Calculator — Janitorial Contract P&L | xiriOS",
    description:
        "Calculate your profit on any cleaning contract. Breaks down labor, payroll taxes (FICA, FUTA, SUTA), workers comp, supplies, and overhead. Based on BLS wage data and ISSA production rates. Free — no login required.",
    keywords:
        "cleaning profit calculator, janitorial profit margin calculator, cleaning contract profit, commercial cleaning profitability, how much profit cleaning business",
    openGraph: {
        title: "Free Cleaning Profit Calculator | xiriOS",
        description:
            "Calculate monthly profit on any cleaning contract — with labor, payroll taxes, supplies, and overhead broken out. BLS-backed data.",
        type: "website",
        url: "https://os.xiri.ai/tools/profit-calculator",
    },
    alternates: { canonical: "https://os.xiri.ai/tools/profit-calculator" },
};

/* — FAQ data (drives both visible FAQ section + FAQPage schema) — */
const FAQS = [
    {
        q: "What is a good profit margin for a cleaning business?",
        a: "According to BSCAI and ISSA industry data, the average janitorial business earns a 10–28% net profit margin. Solo operators typically hit 25–30%, while mid-size companies (10–50 employees) average 8–15% after accounting for supervisors, vehicles, and admin overhead.",
    },
    {
        q: "What costs are included in a cleaning contract profit calculation?",
        a: "A complete profit calculation includes: base labor cost, payroll taxes (FICA at 7.65%, FUTA at 0.6%, SUTA at 1.2–4.1%), workers' compensation insurance (~3.7% for janitorial), cleaning supplies (2–5% of revenue), and general overhead (8–15% for insurance, equipment, vehicles, and admin). The national median janitor wage is $16.29/hour (BLS, May 2024).",
    },
    {
        q: "How do I calculate profit per square foot for cleaning?",
        a: "Divide your monthly profit by the total square footage × number of cleanings per month. For example, if you profit $1,300/month on a 10,000 sqft building cleaned 5× per week (21.7 visits/month), your profit per cleaning per square foot is $0.006, or $0.06/sqft/month.",
    },
    {
        q: "What payroll tax rate should I use for janitorial employees?",
        a: "The combined employer payroll burden for janitorial workers is approximately 14.8%: FICA 7.65% (SSA), FUTA 0.6% (IRS), SUTA 2.7% national average (DOL), and workers' compensation 3.7% (NCCI class code 9014). This means a $16.29/hour janitor actually costs about $18.70/hour before any benefits.",
    },
];

export default function Page() {
    /* Combined JSON-LD: WebApplication + FAQPage */
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                name: "Cleaning Contract Profit Calculator",
                description:
                    "Free calculator that breaks down cleaning contract profitability including labor, payroll taxes, workers comp, supplies, and overhead. Based on BLS and ISSA data.",
                url: "https://os.xiri.ai/tools/profit-calculator",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Any",
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
            },
            {
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: f.a,
                    },
                })),
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProfitCalculatorTool faqs={FAQS} />
        </>
    );
}

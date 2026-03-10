import type { Metadata } from "next";
import EmployeeCostTool from "./EmployeeCostTool";

export const metadata: Metadata = {
    title: "Free Employee Cost Calculator — True Janitor Cost | xiriOS",
    description:
        "What does one janitor actually cost? Calculate FICA, FUTA, state unemployment, workers comp, paid leave, and health insurance. State-specific SUTA rates. Government-sourced data. Free tool.",
    keywords:
        "employee cost calculator, janitor cost calculator, true cost of employee, payroll tax calculator cleaning, workers comp janitorial, cleaning employee overhead",
    openGraph: {
        title: "Free Employee True Cost Calculator | xiriOS",
        description:
            "Calculate the true cost of a janitorial employee — FICA, unemployment taxes, workers comp, benefits, health insurance. Government data.",
        type: "website",
        url: "https://os.xiri.ai/tools/employee-cost",
    },
    alternates: { canonical: "https://os.xiri.ai/tools/employee-cost" },
};

const FAQS = [
    {
        q: "How much does a janitor actually cost per hour?",
        a: "The BLS national median wage for janitors (SOC 37-2011) is $16.29/hour, but the true employer cost is $20–23/hour after adding FICA (7.65%), FUTA (0.6%), SUTA (1.2–4.1%), workers' compensation (~3.7% for NCCI code 9014), and paid leave (7.7%). The multiplier is typically 1.25–1.40× the base wage, increasing to 1.46× if health insurance is included.",
    },
    {
        q: "What is the FICA rate for janitorial employers?",
        a: "Employers pay 7.65% of gross wages for FICA — 6.2% for Social Security (on wages up to $168,600 in 2024) and 1.45% for Medicare (no wage cap). This is the employer's match of the employee's contribution. Source: Social Security Administration (ssa.gov).",
    },
    {
        q: "How much is workers compensation for janitors?",
        a: "Janitorial workers fall under NCCI class code 9014. The national average workers' compensation rate is approximately 3.7% of gross payroll, though rates vary by state and your company's experience modification rating. States like California and New York tend to have higher rates. Source: National Council on Compensation Insurance (NCCI).",
    },
    {
        q: "What is SUTA and how does it vary by state?",
        a: "SUTA (State Unemployment Tax Act) is paid by employers on the first $8,500–$12,000 of each employee's wages, depending on state. Rates range from approximately 1.2% in North Carolina to 4.1% in New York. New employers typically pay a standard rate, which adjusts over time based on claims history. Source: U.S. Department of Labor, Employment & Training Administration.",
    },
];

export default function Page() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                name: "Employee True Cost Calculator",
                description:
                    "Calculate the true cost of a janitorial employee including FICA, FUTA, SUTA, workers compensation, paid leave, and health insurance. State-specific rates.",
                url: "https://os.xiri.ai/tools/employee-cost",
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
            <EmployeeCostTool faqs={FAQS} />
        </>
    );
}

import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import LaunchpadOptIn from "../../components/LaunchpadOptIn";

export const metadata: Metadata = {
    title: "Cleaning Business LLC Setup & Structure Guide (2026) | xiriOS",
    description:
        "Compare Sole Proprietorship vs. Single-Member LLC vs. S-Corp for your cleaning business. Official .gov links, IRS EIN filing, liability protection, and privacy guide.",
    keywords: [
        "cleaning business LLC setup",
        "single member LLC vs sole proprietorship cleaning",
        "how to form LLC for cleaning company",
        "cleaning business legal structure",
        "IRS EIN online application",
    ],
    openGraph: {
        title: "Cleaning Business Legal Structure Comparison: LLC vs. Sole Prop | xiriOS",
        description:
            "Complete comparison matrix, IRS tax rules, liability protection, and step-by-step LLC setup for cleaning company owners.",
    },
    alternates: { canonical: "https://os.xiri.ai/start-cleaning-business/llc-setup" },
};

export default function LLCSetupGuidePage() {
    return (
        <>
            <Navbar />

            {/* Hero */}
            <section
                className="section noise"
                style={{
                    minHeight: "45vh",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "120px",
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div className="section-inner" style={{ textAlign: "center", width: "100%", maxWidth: "800px", margin: "0 auto" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.35rem 0.85rem",
                            borderRadius: "20px",
                            background: "rgba(0, 212, 170, 0.1)",
                            border: "1px solid rgba(0, 212, 170, 0.3)",
                            color: "#00d4aa",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            letterSpacing: "0.03em",
                            marginBottom: "1rem",
                            textTransform: "uppercase",
                        }}
                    >
                        Legal Setup & Structure Guide
                    </div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f0f1f7", lineHeight: 1.2 }}>
                        Sole Prop vs. Single-Member LLC vs. S-Corp: <span style={{ color: "#00d4aa" }}>Choosing Your Structure</span>
                    </h1>
                    <p
                        style={{
                            color: "#c4c9e0",
                            fontSize: "1.125rem",
                            margin: "1.25rem auto",
                            lineHeight: 1.7,
                        }}
                    >
                        Before stepping foot into a commercial building or client home, picking the right legal structure is your first defense. Here is how the top three options stack up — with official government rules and standard resources.
                    </p>
                </div>
            </section>

            {/* Main Content & Comparison Matrix */}
            <section className="section" style={{ background: "#0c0f1a", paddingTop: "2rem", paddingBottom: "4rem" }}>
                <div className="section-inner" style={{ maxWidth: "860px", margin: "0 auto" }}>

                    {/* Legal Disclaimer Box */}
                    <div
                        style={{
                            background: "rgba(255, 184, 0, 0.08)",
                            border: "1px solid rgba(255, 184, 0, 0.3)",
                            borderRadius: "12px",
                            padding: "1.25rem 1.5rem",
                            marginBottom: "3rem",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ffb800", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.35rem" }}>
                            <span>⚖️</span>
                            <span>Important Educational Disclaimer</span>
                        </div>
                        <p style={{ color: "#d1d5db", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
                            The content in this guide is for informational and educational purposes only and does not constitute legal, tax, accounting, or financial advice. Business regulations vary by state and municipality. We strongly advise consulting with a qualified attorney or Certified Public Accountant (CPA) to review your specific situation.
                        </p>
                    </div>

                    {/* Comparison Table */}
                    <h2 style={{ color: "#f0f1f7", fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
                        Side-by-Side Comparison Matrix
                    </h2>
                    <p style={{ color: "#c4c9e0", fontSize: "1rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                        Evaluate which structure best fits your business goals, risk tolerance, and tax preferences:
                    </p>

                    <div style={{ overflowX: "auto", marginBottom: "3.5rem" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #2a2f47", background: "#141829" }}>
                                    <th style={{ padding: "1rem", color: "#00d4aa", fontWeight: 700 }}>Feature / Consideration</th>
                                    <th style={{ padding: "1rem", color: "#f0f1f7", fontWeight: 700 }}>Sole Proprietorship</th>
                                    <th style={{ padding: "1rem", color: "#00d4aa", fontWeight: 700 }}>Single-Member LLC ★</th>
                                    <th style={{ padding: "1rem", color: "#f0f1f7", fontWeight: 700 }}>S-Corporation Election</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    {
                                        feature: "Personal Liability Protection",
                                        sole: "❌ None. Personal assets (home, car, savings) are exposed to business debts/lawsuits.",
                                        llc: "✅ Strong. Separates personal assets from company liabilities if corporate veil is maintained.",
                                        scorp: "✅ Strong. Corporate shield protects personal assets from business obligations.",
                                    },
                                    {
                                        feature: "Tax Filing Complexity",
                                        sole: "Simple (Schedule C on personal Form 1040).",
                                        llc: "Simple Pass-Through taxation (Schedule C on personal Form 1040 by default).",
                                        scorp: "Higher. Requires Form 1120-S corporate return, W-2 payroll, and officer salary.",
                                    },
                                    {
                                        feature: "Self-Employment Tax Savings",
                                        sole: "No. 15.3% SE tax on 100% of net business income.",
                                        llc: "No (default). 15.3% SE tax on 100% of net business income.",
                                        scorp: "Yes. SE tax applies only to reasonable salary; remaining profit distributed as dividend.",
                                    },
                                    {
                                        feature: "Setup Cost & Fees",
                                        sole: "Free / $0 (plus local DBA or business license fees).",
                                        llc: "$50–$500 state filing fee (one-time) + annual report fees.",
                                        scorp: "LLC filing fee + payroll service fees + CPA tax filing fees.",
                                    },
                                    {
                                        feature: "Home Privacy / Address Exposure",
                                        sole: "Low. Home address listed on local business registrations.",
                                        llc: "High. Can use a Registered Agent address to keep home off public record.",
                                        scorp: "High. Registered Agent address shields personal location.",
                                    },
                                    {
                                        feature: "Best Suited For",
                                        sole: "Part-time side gigs with minimal financial risk.",
                                        llc: "95% of new commercial & residential cleaning companies.",
                                        scorp: "Established companies earning $70k–$100k+ net profit per year.",
                                    },
                                ].map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid #2a2f47", background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                                        <td style={{ padding: "1rem", color: "#f0f1f7", fontWeight: 600 }}>{row.feature}</td>
                                        <td style={{ padding: "1rem", color: "#8b92b3", lineHeight: 1.5 }}>{row.sole}</td>
                                        <td style={{ padding: "1rem", color: "#c4c9e0", lineHeight: 1.5, background: "rgba(0, 212, 170, 0.04)" }}>{row.llc}</td>
                                        <td style={{ padding: "1rem", color: "#8b92b3", lineHeight: 1.5 }}>{row.scorp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Detailed Sections */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

                        <div>
                            <h3 style={{ color: "#f0f1f7", fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                                1. Why a Single-Member LLC is the Top Choice for Cleaners
                            </h3>
                            <p style={{ color: "#c4c9e0", lineHeight: 1.7, fontSize: "0.95rem" }}>
                                In commercial and residential cleaning, accidental property damage or slip-and-fall injuries can happen. Under a <strong>Sole Proprietorship</strong>, your personal bank account, home, and vehicle can be seized in a legal settlement.
                            </p>
                            <p style={{ color: "#c4c9e0", lineHeight: 1.7, fontSize: "0.95rem" }}>
                                A <strong>Single-Member LLC (Limited Liability Company)</strong> creates a separate legal entity. As long as you maintain separate business bank accounts and contracts, claims against your business generally stay confined to your business assets.
                            </p>
                        </div>

                        <div>
                            <h3 style={{ color: "#f0f1f7", fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                                2. Pass-Through Taxation Made Simple
                            </h3>
                            <p style={{ color: "#c4c9e0", lineHeight: 1.7, fontSize: "0.95rem" }}>
                                According to the <a href="https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>IRS Single-Member LLC tax guidance</a>, the IRS treats a single-member LLC as a "disregarded entity" by default. This means you do not file a separate corporate tax return — business income and expenses flow directly onto <strong>Schedule C</strong> of your personal Form 1040.
                            </p>
                        </div>

                        <div>
                            <h3 style={{ color: "#f0f1f7", fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                                3. Privacy: Keeping Your Home Address Off Public Records
                            </h3>
                            <p style={{ color: "#c4c9e0", lineHeight: 1.7, fontSize: "0.95rem" }}>
                                When forming an LLC, state Secretary of State databases publish the address of your business publicly. If you run your cleaning company from home, your home address becomes public record searchable by anyone online.
                            </p>
                            <p style={{ color: "#c4c9e0", lineHeight: 1.7, fontSize: "0.95rem" }}>
                                Utilizing a commercial <strong>Registered Agent</strong> service (such as <a href="https://www.northwestregisteredagent.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>Northwest Registered Agent</a>) allows you to use their commercial street address on all public filings, keeping your home address private.
                            </p>
                        </div>

                        {/* Credible .gov and Brand Resources Card */}
                        <div style={{ background: "#141829", border: "1px solid #2a2f47", borderRadius: "12px", padding: "1.5rem 1.75rem" }}>
                            <h3 style={{ color: "#00d4aa", fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem" }}>
                                🏛️ Official Government & Industry Resources
                            </h3>
                            <ul style={{ paddingLeft: "1.25rem", color: "#c4c9e0", fontSize: "0.9rem", lineHeight: 1.8 }}>
                                <li>
                                    <strong>Internal Revenue Service (IRS)</strong>:{" "}
                                    <a href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>
                                        Apply for an EIN Online Free (Official IRS.gov Portal)
                                    </a>
                                </li>
                                <li>
                                    <strong>Small Business Administration (SBA)</strong>:{" "}
                                    <a href="https://www.sba.gov/business-guide/launch-your-business/choose-business-structure" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>
                                        SBA Official Business Structure Guide
                                    </a>
                                </li>
                                <li>
                                    <strong>Bureau of Labor Statistics (BLS)</strong>:{" "}
                                    <a href="https://www.bls.gov/oes/current/oes372011.htm" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>
                                        Janitorial Occupational Wage Standards (OEWS 37-2011)
                                    </a>
                                </li>
                                <li>
                                    <strong>ISSA Cleaning Industry Association</strong>:{" "}
                                    <a href="https://www.issa.com" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>
                                        ISSA 612 Production Rate Benchmarks
                                    </a>
                                </li>
                                <li>
                                    <strong>Registered Agent & Privacy Partner</strong>:{" "}
                                    <a href="https://www.northwestregisteredagent.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>
                                        Northwest Registered Agent
                                    </a>
                                </li>
                                <li>
                                    <strong>Commercial Insurance Partners</strong>:{" "}
                                    <a href="https://www.nextinsurance.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>
                                        Next Insurance
                                    </a>{" "}
                                    /{" "}
                                    <a href="https://www.hiscox.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa", textDecoration: "underline" }}>
                                        Hiscox Business Insurance
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* Opt-In Section */}
            <section className="section" style={{ background: "#0c0f1a", padding: "1rem 1rem 3rem" }}>
                <div className="section-inner" style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <LaunchpadOptIn />
                </div>
            </section>
        </>
    );
}

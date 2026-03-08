import type { Metadata } from "next";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
    title: "Privacy Policy | xiriOS",
    description: "xiriOS privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
    const lastUpdated = "March 8, 2026";

    return (
        <>
            <Navbar />
            <section
                className="section noise"
                style={{
                    minHeight: "40vh",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "120px",
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 212, 170, 0.08) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div className="section-inner" style={{ maxWidth: "760px", margin: "0 auto" }}>
                    <h1>Privacy Policy</h1>
                    <p style={{ color: "#8b92b3", marginTop: "0.75rem" }}>
                        Last updated: {lastUpdated}
                    </p>
                </div>
            </section>

            <section className="section" style={{ background: "#0c0f1a" }}>
                <div className="section-inner" style={{ maxWidth: "760px", margin: "0 auto" }}>
                    {[
                        {
                            heading: "1. Introduction",
                            body: 'xiriOS ("we", "our", "us") is operated by Xiri Inc. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application at os.xiri.ai and related services (collectively, the "Service").',
                        },
                        {
                            heading: "2. Information We Collect",
                            body: "Account Information: When you create an account, we collect your name, email address, and password. We may also collect your company name, phone number, and business address.\n\nUsage Data: We automatically collect information about how you interact with the Service, including pages visited, features used, bid calculations created, and session duration.\n\nBid & Business Data: Information you enter into the calculator, bids, proposals, CRM contacts, and other business data you store in the Service.\n\nPayment Information: If you subscribe to a paid plan, payment is processed through Stripe. We do not store your full credit card number — Stripe handles this securely.",
                        },
                        {
                            heading: "3. How We Use Your Information",
                            body: "We use your information to:\n\n• Provide, maintain, and improve the Service\n• Process your bids, proposals, and business operations\n• Send transactional emails (account confirmation, bid notifications, subscription updates)\n• Analyze usage patterns to improve features and user experience\n• Comply with legal obligations\n\nWe do not sell your personal information to third parties.",
                        },
                        {
                            heading: "4. Data Sharing",
                            body: "We may share your information with:\n\n• Service providers (Firebase/Google Cloud for hosting, Stripe for payments, Resend for email)\n• Legal authorities when required by law\n• Business successors in the event of a merger, acquisition, or sale\n\nAll service providers are contractually bound to protect your data and use it only for the purposes we specify.",
                        },
                        {
                            heading: "5. Data Retention",
                            body: "We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law. Aggregated, anonymized data may be retained indefinitely for analytics purposes.",
                        },
                        {
                            heading: "6. Security",
                            body: "We implement industry-standard security measures including encryption in transit (TLS), encryption at rest, and secure authentication via Firebase Authentication. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
                        },
                        {
                            heading: "7. Cookies",
                            body: "We use essential cookies for authentication and session management. We may use analytics cookies (e.g., Google Analytics) to understand usage patterns. You can control cookie preferences through your browser settings.",
                        },
                        {
                            heading: "8. Your Rights",
                            body: "Depending on your jurisdiction, you may have the right to:\n\n• Access, correct, or delete your personal data\n• Export your data in a portable format\n• Opt out of marketing communications\n• Lodge a complaint with a data protection authority\n\nTo exercise these rights, contact us at support@xiri.ai.",
                        },
                        {
                            heading: "9. Children's Privacy",
                            body: "The Service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal data, please contact us.",
                        },
                        {
                            heading: "10. Changes to This Policy",
                            body: "We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the \"Last updated\" date. Your continued use of the Service after changes constitutes acceptance.",
                        },
                        {
                            heading: "11. Contact Us",
                            body: "If you have questions about this Privacy Policy, please contact us at:\n\nEmail: support@xiri.ai\nWebsite: https://os.xiri.ai",
                        },
                    ].map((section, i) => (
                        <div key={i} style={{ marginBottom: "2.5rem" }}>
                            <h2 style={{ color: "white", fontSize: "1.25rem", marginBottom: "1rem" }}>
                                {section.heading}
                            </h2>
                            {section.body.split("\n\n").map((para, j) => (
                                <p
                                    key={j}
                                    style={{
                                        color: "#c4c9e0",
                                        fontSize: "0.9375rem",
                                        lineHeight: 1.8,
                                        marginBottom: "1rem",
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: para.replace(/^• /gm, "→ ").replace(/\n/g, "<br />"),
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

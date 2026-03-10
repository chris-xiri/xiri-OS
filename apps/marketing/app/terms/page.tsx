import type { Metadata } from "next";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
    title: "Terms & Conditions | xiriOS",
    description: "xiriOS terms and conditions of service — your agreement when using our platform.",
    openGraph: {
        title: "Terms & Conditions | xiriOS",
        description: "Terms and conditions for using xiriOS janitorial business management software.",
    },
    alternates: { canonical: "https://os.xiri.ai/terms" },
};

export default function TermsPage() {
    const lastUpdated = "March 10, 2026";

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
                    <h1>Terms &amp; Conditions</h1>
                    <p style={{ color: "#8b92b3", marginTop: "0.75rem" }}>
                        Last updated: {lastUpdated}
                    </p>
                </div>
            </section>

            <section className="section" style={{ background: "#0c0f1a" }}>
                <div className="section-inner" style={{ maxWidth: "760px", margin: "0 auto" }}>
                    {[
                        {
                            heading: "1. Acceptance of Terms",
                            body: 'By accessing or using xiriOS (the "Service"), operated by Xiri Inc. ("we", "us", "our"), you agree to be bound by these Terms & Conditions. If you do not agree, do not use the Service.',
                        },
                        {
                            heading: "2. Description of Service",
                            body: "xiriOS is a cloud-based platform for janitorial and cleaning businesses. The Service includes bid calculators, proposal generation, CRM, scheduling, time tracking, and related tools. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.\n\nWe improve our products and advertising by using Microsoft Clarity to see how you use our website. By using our site, you agree that we and Microsoft can collect and use this data. Our privacy policy at https://os.xiri.ai/privacy has more details.",
                        },
                        {
                            heading: "3. Account Registration",
                            body: "You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activity under your account. You must notify us immediately of any unauthorized use.\n\nYou must be at least 16 years old to use the Service. By creating an account, you represent that you meet this requirement.",
                        },
                        {
                            heading: "4. Subscription & Billing",
                            body: "Free Plan: The Bid (free) plan is available indefinitely with limited features.\n\nPaid Plans: Paid subscriptions (Bid Plus, Grow) are billed monthly or annually through Stripe. You will be charged at the beginning of each billing cycle.\n\nFree Trial: New accounts receive a 14-day free trial of the Bid Plus plan. If you do not subscribe before the trial ends, your account will be downgraded to the free Bid plan. No charges will occur without your explicit subscription.\n\nCancellation: You may cancel your subscription at any time from the Settings page. Cancellation takes effect at the end of the current billing period. We do not provide refunds for partial billing periods.",
                        },
                        {
                            heading: "5. Your Data",
                            body: "You retain ownership of all data you enter into the Service, including bids, proposals, contacts, and business information. We do not claim ownership of your content.\n\nYou grant us a limited license to use your data solely for the purpose of providing and improving the Service.\n\nData Accuracy: The bid calculator and pricing tools provide estimates based on industry benchmarks (ISSA standards). These are intended as guidance only and should not be relied upon as the sole basis for business decisions. We are not responsible for financial outcomes based on calculator results.",
                        },
                        {
                            heading: "6. Acceptable Use",
                            body: "You agree not to:\n\n• Use the Service for any unlawful purpose\n• Attempt to gain unauthorized access to any part of the Service\n• Reverse engineer, decompile, or disassemble the Service\n• Use the Service to send spam or unsolicited communications\n• Interfere with the proper functioning of the Service\n• Resell or redistribute the Service without our written consent",
                        },
                        {
                            heading: "7. Intellectual Property",
                            body: "The Service, including its design, code, features, and documentation, is the property of Xiri Inc. and is protected by intellectual property laws. The xiriOS name, logo, and branding are trademarks of Xiri Inc.",
                        },
                        {
                            heading: "8. Limitation of Liability",
                            body: 'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, XIRI INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.\n\nOur total liability to you for any claims related to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.',
                        },
                        {
                            heading: "9. Indemnification",
                            body: "You agree to indemnify and hold harmless Xiri Inc. and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or your violation of these Terms.",
                        },
                        {
                            heading: "10. Termination",
                            body: "We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion. Upon termination, your right to use the Service ceases immediately. We will make reasonable efforts to allow you to export your data before account deletion.",
                        },
                        {
                            heading: "11. Governing Law",
                            body: "These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.",
                        },
                        {
                            heading: "12. Changes to These Terms",
                            body: "We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the \"Last updated\" date. Your continued use of the Service after changes constitutes acceptance of the updated Terms.",
                        },
                        {
                            heading: "13. Contact Us",
                            body: "If you have questions about these Terms, please contact us at:\n\nEmail: support@xiri.ai\nWebsite: https://os.xiri.ai",
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

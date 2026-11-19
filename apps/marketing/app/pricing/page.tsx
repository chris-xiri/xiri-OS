import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { PLANS, BID_PLUS, formatPrice } from "../../lib/plans";

export const metadata: Metadata = {
    title: "Pricing — xiriOS | Janitorial Bidding & Business Management",
    description:
        `Simple, honest pricing for cleaning businesses. Free forever plan for bidding. Paid plans from $5/mo early-bird (regularly ${formatPrice(BID_PLUS)}). 60-day free trial, no credit card required.`,
    keywords:
        "xiriOS pricing, cleaning business software pricing, janitorial software cost, cleaning bidding software price",
    openGraph: {
        title: "Pricing — xiriOS | Janitorial Software Pricing",
        description: `Simple, honest pricing for cleaning businesses. Free plan forever. Paid plans from $5/mo early-bird. Save 60% vs competitors.`,
        url: "https://os.xiri.ai/pricing",
        siteName: "xiriOS",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "xiriOS Pricing" }],
    },
    alternates: { canonical: "https://os.xiri.ai/pricing" },
};

const FAQ = [
    {
        q: "Is there a free plan?",
        a: "Yes! The Bid plan is free forever — up to 3 active bids, branded PDF proposals, and up to 5 CRM contacts. No credit card required. Plus, every new account starts with a 60-day (2 months) free trial of Bid Plus (unlimited bids & contacts, custom tasks, and 1-click email proposals — lock in the Early-Bird Founder Rate at $5/mo or $49/yr, regularly $9/mo).",
    },
    {
        q: "Can I switch plans anytime?",
        a: "Absolutely. Upgrade or downgrade at any time. When upgrading, you'll get prorated credit. When downgrading, changes take effect at the end of your billing cycle.",
    },
    {
        q: "What happens after the 60-day free trial?",
        a: "If you choose not to subscribe to Bid Plus, your account automatically switches to the free Bid plan (up to 3 active bids and 5 contacts). You never lose your saved estimates or client data, and you can upgrade anytime.",
    },
    {
        q: "Do you offer annual billing?",
        a: "Yes — save up to 55% with our Early-Bird Annual rate ($49/yr for Bid Plus) or 20%+ on standard annual billing. All paid plans support both monthly and annual options.",
    },
    {
        q: "Can I add more users to my plan?",
        a: "Yes, extra users are $3/mo each on any plan. Need more than 25 users? Contact us for custom enterprise pricing.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, Amex, Discover) through our secure Stripe payment system.",
    },
    {
        q: "Is there a contract or commitment?",
        a: "No contracts, no commitments. Monthly plans can be cancelled anytime with 1 click. Annual plans are backed by a 30-day money-back guarantee.",
    },
    {
        q: "How does xiriOS compare to CleanGuru or Swept?",
        a: "We offer more features at a fraction of the price — and our Bid plan is completely free. Unlike Swept or CleanGuru, xiriOS includes ISSA 612 room-by-room bidding, BLS metro wages, branded PDF proposals, and CRM in every plan. See our comparison pages for details.",
    },
];

const FAQ_LD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
        },
    })),
};

export default function PricingPage() {
    return (
        <>
            <Navbar />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />

            {/* Hero */}
            <section
                className="section noise"
                style={{
                    minHeight: "40vh",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "120px",
                    paddingBottom: "0",
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 212, 170, 0.08) 0%, transparent 60%), #0c0f1a",
                }}
            >
                <div
                    className="section-inner"
                    style={{ textAlign: "center", width: "100%" }}
                >
                    <span className="section-label">Simple, honest pricing</span>
                    <h1>
                        Janitorial Software Pricing — <span style={{ color: "#00d4aa" }}>More Features, Lower Cost</span>
                    </h1>
                    <p
                        style={{
                            fontSize: "1.125rem",
                            maxWidth: "620px",
                            margin: "1rem auto 0",
                            color: "#c4c9e0",
                        }}
                    >
                        Start with a 60-day free trial of Bid Plus (or stay on the free Bid plan forever). Lock in our $5/mo Early-Bird Founder Rate — no credit card required to start.
                    </p>
                </div>
            </section>

            {/* Plans */}
            <section
                className="section"
                style={{ background: "#0c0f1a", paddingTop: "3rem" }}
            >
                <div className="section-inner">
                    <div
                        className="pricing-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: "1.25rem",
                            maxWidth: "1300px",
                            margin: "0 auto",
                        }}
                    >
                        {PLANS.map((plan) => (
                            <div
                                key={plan.name}
                                className={`card ${plan.featured ? "card-featured" : ""}`}
                                style={{ position: "relative", ...(plan.comingSoon ? { opacity: 0.55 } : {}) }}
                            >
                                {plan.featured && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "-12px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            background: "#00d4aa",
                                            color: "#0c0f1a",
                                            fontSize: "0.6875rem",
                                            fontWeight: 800,
                                            padding: "4px 16px",
                                            borderRadius: "100px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        Most Popular
                                    </div>
                                )}

                                <h3
                                    style={{
                                        fontFamily: "var(--font-outfit)",
                                        fontSize: "1.25rem",
                                        fontWeight: 800,
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    {plan.name}
                                </h3>
                                <p
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.8125rem",
                                        margin: "0 0 1rem",
                                    }}
                                >
                                    {plan.tagline}
                                </p>

                                <div style={{ marginBottom: "0.5rem" }}>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-outfit)",
                                            fontSize: "2.75rem",
                                            fontWeight: 800,
                                        }}
                                    >
                                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                                    </span>
                                    {plan.price > 0 && (
                                        <span
                                            style={{
                                                color: "#8b92b3",
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            /month
                                        </span>
                                    )}
                                </div>
                                <p
                                    style={{
                                        color: "#00d4aa",
                                        fontSize: "0.8125rem",
                                        fontWeight: 600,
                                        margin: "0 0 0.25rem",
                                    }}
                                >
                                    {plan.price === 0 ? "forever free" : `$${plan.annual}/mo billed annually`}
                                </p>
                                <p
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.75rem",
                                        margin: "0 0 1.5rem",
                                    }}
                                >
                                    {plan.users}
                                </p>

                                <ul
                                    style={{
                                        listStyle: "none",
                                        padding: 0,
                                        margin: "0 0 1.5rem",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.5rem",
                                        flex: 1,
                                    }}
                                >
                                    {plan.features.map((f) => (
                                        <li
                                            key={f}
                                            style={{
                                                display: "flex",
                                                gap: "0.5rem",
                                                color: "#c4c9e0",
                                                fontSize: "0.875rem",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            <span style={{ color: "#00d4aa", flexShrink: 0 }}>
                                                ✓
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {plan.comingSoon ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "0.625rem 1rem",
                                            borderRadius: "8px",
                                            background: "rgba(245, 158, 11, 0.08)",
                                            color: "#f59e0b",
                                            fontWeight: 700,
                                            fontSize: "0.875rem",
                                            width: "100%",
                                        }}
                                    >
                                        Coming Soon
                                    </div>
                                ) : plan.price === 0 ? (
                                    <a
                                        href="/app/login?mode=signup"
                                        className="btn btn-secondary"
                                        style={{ width: "100%" }}
                                    >
                                        {plan.cta}
                                    </a>
                                ) : (
                                    <a
                                        href="/app/login?mode=signup"
                                        className={`btn ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                                        style={{ width: "100%" }}
                                    >
                                        {plan.cta}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    <p
                        style={{
                            textAlign: "center",
                            color: "#8b92b3",
                            fontSize: "0.8125rem",
                            marginTop: "2rem",
                        }}
                    >
                        Need more than 25 users?{" "}
                        <a href="mailto:hello@xiri.ai" style={{ color: "#00d4aa" }}>
                            Contact us
                        </a>{" "}
                        for custom pricing. · Extra users: $3/mo each on any plan.
                    </p>
                </div>
            </section>

            {/* Competitor Price Comparison */}
            <section className="section" style={{ background: "#141829" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">Why xiriOS</span>
                        <h2>
                            Save{" "}
                            <span style={{ color: "#00d4aa" }}>60% vs competitors</span>
                        </h2>
                        <p
                            style={{
                                color: "#8b92b3",
                                maxWidth: "600px",
                                margin: "0.5rem auto 0",
                            }}
                        >
                            See how xiriOS stacks up against the most popular cleaning
                            business platforms.
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "1rem",
                            maxWidth: "900px",
                            margin: "0 auto",
                        }}
                    >
                        {[
                            {
                                name: "vs CleanGuru",
                                slug: "cleanguru",
                                price: "$79–$159/mo",
                                save: "$480–$1,440/yr",
                            },
                            {
                                name: "vs Swept",
                                slug: "swept",
                                price: "$24–$180/mo",
                                save: "$492–$1,212/yr",
                            },
                            {
                                name: "vs Jobber",
                                slug: "jobber",
                                price: "$39–$199/mo",
                                save: "$480–$1,440/yr",
                            },
                            {
                                name: "vs Janitorial Mgr",
                                slug: "janitorial-manager",
                                price: "$300–$500+/mo",
                                save: "$2,172–$4,572/yr",
                            },
                        ].map((c) => (
                            <a
                                key={c.slug}
                                href={`/vs/${c.slug}`}
                                className="card"
                                style={{
                                    textDecoration: "none",
                                    textAlign: "center",
                                    transition: "border-color 0.2s, transform 0.2s",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: "white",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {c.name}
                                </div>
                                <div
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.8125rem",
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    They charge {c.price}
                                </div>
                                <div
                                    style={{
                                        color: "#00d4aa",
                                        fontSize: "1.125rem",
                                        fontWeight: 800,
                                        fontFamily: "var(--font-outfit)",
                                    }}
                                >
                                    Save {c.save}
                                </div>
                                <div
                                    style={{
                                        color: "#8b92b3",
                                        fontSize: "0.75rem",
                                        marginTop: "0.75rem",
                                    }}
                                >
                                    See full comparison →
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section noise" style={{ background: "#0c0f1a" }}>
                <div className="section-inner">
                    <div className="section-header">
                        <span className="section-label">FAQ</span>
                        <h2>
                            Frequently asked{" "}
                            <span style={{ color: "#00d4aa" }}>questions</span>
                        </h2>
                    </div>

                    <div
                        style={{
                            maxWidth: "700px",
                            margin: "0 auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        {FAQ.map((item) => (
                            <details
                                key={item.q}
                                style={{
                                    background: "#141829",
                                    border: "1px solid #2a2f47",
                                    borderRadius: "0.75rem",
                                    overflow: "hidden",
                                }}
                            >
                                <summary
                                    style={{
                                        padding: "1.25rem 1.5rem",
                                        cursor: "pointer",
                                        fontSize: "1rem",
                                        fontWeight: 600,
                                        color: "white",
                                        listStyle: "none",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    {item.q}
                                    <span
                                        style={{
                                            color: "#00d4aa",
                                            fontSize: "1.25rem",
                                            flexShrink: 0,
                                            marginLeft: "1rem",
                                        }}
                                    >
                                        +
                                    </span>
                                </summary>
                                <div
                                    style={{
                                        padding: "0 1.5rem 1.25rem",
                                        color: "#c4c9e0",
                                        fontSize: "0.9375rem",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {item.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section
                className="section"
                style={{
                    background:
                        "linear-gradient(180deg, #0c0f1a 0%, #141829 100%)",
                    textAlign: "center",
                }}
            >
                <div className="section-inner">
                    <h2>
                        Ready to grow your{" "}
                        <span style={{ color: "#00d4aa" }}>cleaning business</span>?
                    </h2>
                    <p
                        style={{
                            maxWidth: "500px",
                            margin: "1rem auto 0",
                            color: "#c4c9e0",
                        }}
                    >
                        Start your 60-day (2 months) free trial. No credit card required. Set up in
                        under 2 minutes.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            marginTop: "2rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <a
                            href="/app/login?mode=signup"
                            className="btn btn-primary"
                            style={{ fontSize: "1.0625rem", padding: "1rem 2.5rem" }}
                        >
                            Start Free Trial →
                        </a>
                        <a
                            href="/calculator"
                            className="btn btn-warm"
                            style={{ fontSize: "1.0625rem", padding: "1rem 2.5rem" }}
                        >
                            Try Free Calculator
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer
                style={{
                    padding: "2rem",
                    background: "#0c0f1a",
                    borderTop: "1px solid #2a2f47",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>
                    © 2026 xiriOS. All rights reserved. ·{" "}
                    <a href="/" style={{ color: "#00d4aa", textDecoration: "none" }}>
                        Home
                    </a>{" "}
                    ·{" "}
                    <a
                        href="/calculator"
                        style={{ color: "#00d4aa", textDecoration: "none" }}
                    >
                        Calculator
                    </a>
                </p>
            </footer>
        </>
    );
}

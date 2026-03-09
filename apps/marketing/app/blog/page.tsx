import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { BLOG_POSTS } from "../../lib/posts";

export const metadata: Metadata = {
    title: "Blog — Janitorial Business Insights & Guides | xiriOS",
    description:
        "Expert guides on pricing janitorial services, winning bids, managing cleaning crews, and growing your janitorial business.",
    keywords: [
        "janitorial blog",
        "cleaning business tips",
        "janitorial pricing guide",
        "cleaning company advice",
    ],
    openGraph: {
        title: "Janitorial Business Blog | xiriOS",
        description: "Expert guides on pricing, bidding, and growing your janitorial cleaning business. Free resources for cleaning companies.",
    },
    alternates: { canonical: "https://os.xiri.ai/blog" },
};

const CATEGORY_COLORS: Record<string, string> = {
    Pricing: "#00d4aa",
    Tools: "#6c63ff",
    Software: "#ff6b6b",
};

export default function BlogIndex() {
    return (
        <>
            <Navbar />

            {/* Hero */}
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
                <div className="section-inner" style={{ width: "100%", textAlign: "center" }}>
                    <span className="section-label">
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#00d4aa",
                                display: "inline-block",
                            }}
                        />
                        Insights for cleaning businesses
                    </span>
                    <h1>
                        The xiriOS <span style={{ color: "#00d4aa" }}>Blog</span>
                    </h1>
                    <p
                        style={{
                            color: "#c4c9e0",
                            fontSize: "1.125rem",
                            maxWidth: "550px",
                            margin: "1.5rem auto 0",
                        }}
                    >
                        Expert guides on pricing, bidding, and growing your janitorial business.
                    </p>
                </div>
            </section>

            {/* Post Grid */}
            <section className="section" style={{ background: "#0c0f1a" }}>
                <div className="section-inner">
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {BLOG_POSTS.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                style={{ textDecoration: "none" }}
                            >
                                <article
                                    className="card"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100%",
                                        transition: "border-color 0.2s",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.75rem",
                                            alignItems: "center",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.6875rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                                color:
                                                    CATEGORY_COLORS[post.category] || "#00d4aa",
                                                background: `${CATEGORY_COLORS[post.category] || "#00d4aa"}15`,
                                                padding: "0.25rem 0.625rem",
                                                borderRadius: "100px",
                                            }}
                                        >
                                            {post.category}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#8b92b3",
                                            }}
                                        >
                                            {post.readTime}
                                        </span>
                                    </div>

                                    <h3
                                        style={{
                                            color: "white",
                                            fontSize: "1.125rem",
                                            lineHeight: 1.4,
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        {post.title}
                                    </h3>

                                    <p
                                        style={{
                                            color: "#8b92b3",
                                            fontSize: "0.875rem",
                                            lineHeight: 1.6,
                                            flex: 1,
                                        }}
                                    >
                                        {post.excerpt}
                                    </p>

                                    <div
                                        style={{
                                            marginTop: "1.5rem",
                                            fontSize: "0.8125rem",
                                            color: "#00d4aa",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.375rem",
                                        }}
                                    >
                                        Read article
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                        >
                                            <path
                                                d="M3 8h10M9 4l4 4-4 4"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section
                className="section"
                style={{
                    background: "linear-gradient(180deg, #0c0f1a 0%, #141829 100%)",
                    borderTop: "1px solid #2a2f47",
                    textAlign: "center",
                }}
            >
                <div className="section-inner">
                    <h2>
                        Ready to price your next bid?{" "}
                        <span style={{ color: "#00d4aa" }}>Try the free calculator</span>
                    </h2>
                    <p
                        style={{
                            maxWidth: "500px",
                            margin: "1rem auto 0",
                            color: "#c4c9e0",
                        }}
                    >
                        Use ISSA production rates to calculate accurate janitorial bids. No
                        sign-up required.
                    </p>
                    <a
                        href="/calculator"
                        className="btn btn-primary"
                        style={{
                            marginTop: "2rem",
                            fontSize: "1.0625rem",
                            padding: "1rem 2.25rem",
                        }}
                    >
                        Try Free Calculator
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M3 8h10M9 4l4 4-4 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </a>
                </div>
            </section>
        </>
    );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import BlogViewTracker from "../../components/BlogViewTracker";
import LaunchpadOptIn from "../../components/LaunchpadOptIn";
import { BLOG_POSTS, getPost } from "../../../lib/posts";

export async function generateStaticParams() {
    return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) return {};

    return {
        title: post.metaTitle,
        description: post.metaDescription,
        keywords: post.keywords.join(", "),
        openGraph: {
            title: post.title,
            description: post.metaDescription,
            type: "article",
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
        },
        alternates: { canonical: `https://os.xiri.ai/blog/${slug}` },
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://os.xiri.ai/blog/${slug}`,
        },
        image: "https://os.xiri.ai/og-image.png",
        articleSection: post.category,
        author: {
            "@type": "Organization",
            name: "xiriOS",
            url: "https://os.xiri.ai",
        },
        publisher: {
            "@type": "Organization",
            name: "xiriOS",
            url: "https://os.xiri.ai",
            logo: {
                "@type": "ImageObject",
                url: "https://os.xiri.ai/favicon.svg",
            },
        },
    };

    return (
        <>
            <Navbar />
            <BlogViewTracker slug={slug} category={post.category} />

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

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
                <div
                    className="section-inner"
                    style={{ maxWidth: "760px", margin: "0 auto" }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <a
                            href="/blog"
                            style={{
                                color: "#8b92b3",
                                textDecoration: "none",
                                fontSize: "0.8125rem",
                            }}
                        >
                            ← Blog
                        </a>
                        <span
                            style={{
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: "#00d4aa",
                                background: "rgba(0, 212, 170, 0.08)",
                                padding: "0.25rem 0.625rem",
                                borderRadius: "100px",
                            }}
                        >
                            {post.category}
                        </span>
                        <span style={{ color: "#8b92b3", fontSize: "0.75rem" }}>
                            {post.readTime}
                        </span>
                    </div>

                    <h1
                        style={{
                            fontSize: "2.25rem",
                            lineHeight: 1.25,
                            color: "white",
                            maxWidth: "700px",
                        }}
                    >
                        {post.title}
                    </h1>

                    <p
                        style={{
                            color: "#c4c9e0",
                            fontSize: "1.0625rem",
                            marginTop: "1.25rem",
                            lineHeight: 1.7,
                        }}
                    >
                        {post.excerpt}
                    </p>

                    <div
                        style={{
                            color: "#8b92b3",
                            fontSize: "0.8125rem",
                            marginTop: "1.5rem",
                        }}
                    >
                        Published{" "}
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                        {post.updatedAt !== post.publishedAt && (
                            <>
                                {" "}
                                · Updated{" "}
                                {new Date(post.updatedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Article Body */}
            <section
                className="section"
                style={{
                    background: "#0c0f1a",
                    paddingTop: "3rem",
                    paddingBottom: "4rem",
                }}
            >
                <div
                    className="section-inner"
                    style={{ maxWidth: "760px", margin: "0 auto" }}
                >
                    {post.sections.map((section, i) => (
                        <div key={i} style={{ marginBottom: "3rem" }}>
                            <h2
                                style={{
                                    color: "white",
                                    fontSize: "1.5rem",
                                    marginBottom: "1.25rem",
                                    lineHeight: 1.3,
                                }}
                            >
                                {section.heading}
                            </h2>

                            {section.body.split("\n\n").map((para, j) => (
                                <p
                                    key={j}
                                    style={{
                                        color: "#c4c9e0",
                                        fontSize: "1rem",
                                        lineHeight: 1.8,
                                        marginBottom: "1.25rem",
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: para
                                            .replace(
                                                /\*\*(.*?)\*\*/g,
                                                '<strong style="color: white">$1</strong>'
                                            )
                                            .replace(/^• /gm, "→ ")
                                            .replace(/\n/g, "<br />"),
                                    }}
                                />
                            ))}

                            {section.cta && (
                                <a
                                    href={section.cta.href}
                                    className="btn btn-primary"
                                    style={{
                                        marginTop: "1rem",
                                        fontSize: "0.9375rem",
                                        padding: "0.875rem 2rem",
                                    }}
                                >
                                    {section.cta.text}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 7-Day Email Drip Course Opt-In */}
            <section className="section noise" style={{ background: "#0c0f1a", padding: "1rem 1rem 3rem" }}>
                <div className="section-inner" style={{ maxWidth: "760px", margin: "0 auto" }}>
                    <LaunchpadOptIn compact />
                </div>
            </section>

            {/* Related / CTA */}
            <section
                className="section"
                style={{
                    background: "#141829",
                    borderTop: "1px solid #2a2f47",
                    textAlign: "center",
                }}
            >
                <div className="section-inner">
                    <h2>
                        Price your next bid{" "}
                        <span style={{ color: "#00d4aa" }}>in 2 minutes</span>
                    </h2>
                    <p
                        style={{
                            maxWidth: "500px",
                            margin: "1rem auto 0",
                            color: "#c4c9e0",
                        }}
                    >
                        Our free janitorial bid calculator uses real ISSA production rates. No sign-up required.
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
                            href="/calculator"
                            className="btn btn-primary"
                            style={{
                                fontSize: "1rem",
                                padding: "0.875rem 2rem",
                            }}
                        >
                            Try Free Calculator
                        </a>
                        <a
                            href="/blog"
                            className="btn btn-secondary"
                            style={{
                                fontSize: "1rem",
                                padding: "0.875rem 2rem",
                            }}
                        >
                            More Articles
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                padding: "0 2rem",
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: scrolled ? "rgba(12, 15, 26, 0.85)" : "transparent",
                backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
                borderBottom: scrolled
                    ? "1px solid rgba(42, 47, 71, 0.5)"
                    : "1px solid transparent",
                transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
        >
            {/* Logo */}
            <Link
                href="/"
                style={{
                    fontFamily: "var(--font-outfit), system-ui, sans-serif",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "white",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                <span
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#00d4aa",
                        boxShadow: "0 0 12px rgba(0, 212, 170, 0.5)",
                    }}
                />
                xiri<span style={{ color: "#00d4aa" }}>OS</span>
            </Link>

            {/* Desktop Nav Links */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3rem",
                }}
                className="desktop-nav"
            >
                <div style={{ display: "flex", gap: "2rem" }}>
                    {[
                        { href: "/#features", label: "Features" },
                        { href: "/pricing", label: "Pricing" },
                        { href: "/calculator", label: "Calculator" },
                    ].map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            style={{
                                color: "#8b92b3",
                                textDecoration: "none",
                                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                                fontSize: "0.9375rem",
                                fontWeight: 500,
                                transition: "color 150ms ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "white")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "#8b92b3")
                            }
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <a href="https://os.xiri.ai/app/login" className="btn btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                        Sign In
                    </a>
                    <a href="https://os.xiri.ai/app/login?mode=signup" className="btn btn-primary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                        Start Free Trial
                    </a>
                </div>
            </div>

            {/* Mobile Hamburger */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                className="mobile-toggle"
                style={{
                    display: "none",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0f1f7" strokeWidth="2">
                    {mobileOpen ? (
                        <path d="M6 6l12 12M6 18L18 6" />
                    ) : (
                        <path d="M3 6h18M3 12h18M3 18h18" />
                    )}
                </svg>
            </button>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: "72px",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#0c0f1a",
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                        zIndex: 99,
                    }}
                >
                    {[
                        { href: "/#features", label: "Features" },
                        { href: "/pricing", label: "Pricing" },
                        { href: "/calculator", label: "Calculator" },
                    ].map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                color: "#f0f1f7",
                                textDecoration: "none",
                                fontFamily: "var(--font-outfit), system-ui, sans-serif",
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                padding: "0.75rem 0",
                                borderBottom: "1px solid #2a2f47",
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                        <a href="https://os.xiri.ai/app/login" className="btn btn-secondary">Sign In</a>
                        <a href="https://os.xiri.ai/app/login?mode=signup" className="btn btn-primary">Start Free Trial</a>
                    </div>
                </div>
            )}

            <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
        </nav>
    );
}

"use client";

import React, { useState } from "react";

interface LaunchpadOptInProps {
    cityName?: string;
    compact?: boolean;
}

export default function LaunchpadOptIn({ cityName, compact = false }: LaunchpadOptInProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setStatus("error");
            setErrorMsg("Please enter a valid email address.");
            return;
        }

        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to subscribe. Please try again.");
            }

            setStatus("success");
            setEmail("");
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "An unexpected error occurred.");
        }
    };

    return (
        <div
            className="noise"
            style={{
                background: "linear-gradient(135deg, rgba(20, 24, 41, 0.95), rgba(12, 15, 26, 0.98))",
                border: "1px solid rgba(0, 212, 170, 0.25)",
                borderRadius: "16px",
                padding: compact ? "1.75rem 1.5rem" : "2.5rem 2rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(0, 212, 170, 0.06)",
                margin: "2.5rem 0",
            }}
        >
            {/* Ambient Background Glow */}
            <div
                style={{
                    position: "absolute",
                    top: "-40px",
                    right: "-40px",
                    width: "160px",
                    height: "160px",
                    background: "radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
                {/* Badge */}
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
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#00d4aa",
                            boxShadow: "0 0 8px #00d4aa",
                        }}
                    />
                    Free 7-Day Email Drip Course
                </div>

                {/* Title */}
                <h3
                    style={{
                        fontFamily: "var(--font-outfit), sans-serif",
                        fontSize: compact ? "1.5rem" : "1.875rem",
                        fontWeight: 800,
                        color: "#f0f1f7",
                        marginBottom: "0.75rem",
                        lineHeight: 1.25,
                    }}
                >
                    The Cleaning Business <span style={{ color: "#00d4aa" }}>Launchpad</span>
                    {cityName ? ` in ${cityName}` : ""}
                </h3>

                {/* Subtitle */}
                <p
                    style={{
                        color: "#c4c9e0",
                        fontSize: compact ? "0.9375rem" : "1rem",
                        lineHeight: 1.6,
                        marginBottom: "1.5rem",
                    }}
                >
                    Step-by-step daily emails on legal LLC setup, liability insurance, bidding math, 1099 hiring, and securing your first commercial contracts.
                </p>

                {/* Course Highlights Checklist */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: compact ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "0.75rem",
                        textAlign: "left",
                        marginBottom: "1.75rem",
                        background: "rgba(12, 15, 26, 0.6)",
                        padding: "1rem 1.25rem",
                        borderRadius: "12px",
                        border: "1px solid rgba(42, 47, 71, 0.6)",
                    }}
                >
                    {[
                        "Day 1: Single-Member LLC Legal Setup",
                        "Day 2: General Liability & 1099 Staffing",
                        "Day 3: ISSA 612 Bidding & Pricing Math",
                        "Day 4: Winning Commercial Walkthroughs",
                    ].map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M16.6666 5L7.49992 14.1667L3.33325 10"
                                    stroke="#00d4aa"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span style={{ color: "#f0f1f7", fontSize: "0.85rem", fontWeight: 500 }}>
                                {item}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form or Success State */}
                {status === "success" ? (
                    <div
                        style={{
                            background: "rgba(0, 212, 170, 0.12)",
                            border: "1px solid rgba(0, 212, 170, 0.4)",
                            borderRadius: "12px",
                            padding: "1.25rem",
                            color: "#00d4aa",
                        }}
                    >
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                            🎉 You're on the list!
                        </div>
                        <p style={{ color: "#f0f1f7", fontSize: "0.9375rem", margin: 0 }}>
                            Check your inbox! Day 1 (LLC Setup Guide) is on its way.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: compact ? "column" : "row",
                                gap: "0.75rem",
                                maxWidth: "520px",
                                margin: "0 auto",
                            }}
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address..."
                                disabled={status === "loading"}
                                required
                                style={{
                                    flex: 1,
                                    padding: "0.875rem 1.25rem",
                                    borderRadius: "8px",
                                    background: "#0c0f1a",
                                    border: "1px solid #2a2f47",
                                    color: "#f0f1f7",
                                    fontSize: "0.9375rem",
                                    outline: "none",
                                }}
                            />
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="btn btn-primary"
                                style={{
                                    whiteSpace: "nowrap",
                                    padding: "0.875rem 1.5rem",
                                    fontSize: "0.9375rem",
                                    fontWeight: 700,
                                    cursor: status === "loading" ? "not-allowed" : "pointer",
                                    opacity: status === "loading" ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                {status === "loading" ? (
                                    <>
                                        <span
                                            style={{
                                                width: 16,
                                                height: 16,
                                                border: "2px solid #0c0f1a",
                                                borderTopColor: "transparent",
                                                borderRadius: "50%",
                                                animation: "spin 0.8s linear infinite",
                                                display: "inline-block",
                                            }}
                                        />
                                        Sending...
                                    </>
                                ) : (
                                    "Get Day 1 Free →"
                                )}
                            </button>
                        </div>

                        {status === "error" && (
                            <p style={{ color: "#ff6b35", fontSize: "0.875rem", marginTop: "0.75rem", fontWeight: 500 }}>
                                {errorMsg}
                            </p>
                        )}

                        <p style={{ color: "#8b92b3", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                            🔒 Zero spam. Unsubscribe anytime with 1-click.
                        </p>
                    </form>
                )}
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

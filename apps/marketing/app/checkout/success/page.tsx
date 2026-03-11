import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import PurchaseTracker from "./PurchaseTracker";

export const metadata: Metadata = {
    title: "Welcome to xiriOS! — Subscription Confirmed",
    description: "Your xiriOS subscription is active. Let's get your cleaning business set up.",
};

export default function CheckoutSuccess() {
    return (
        <>
            <Navbar />
            <PurchaseTracker />
            <main
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(180deg, #0a0e1a 0%, #141829 100%)",
                    padding: "2rem",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        maxWidth: "560px",
                    }}
                >
                    <div
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: "rgba(0,212,170,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 2rem",
                        }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M5 13l4 4L19 7"
                                stroke="#00d4aa"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <h1
                        style={{
                            fontFamily: "var(--font-outfit)",
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            color: "white",
                            marginBottom: "1rem",
                        }}
                    >
                        You&apos;re all set!
                    </h1>

                    <p
                        style={{
                            color: "#8b92b3",
                            fontSize: "1.125rem",
                            lineHeight: 1.7,
                            marginBottom: "2rem",
                        }}
                    >
                        Your subscription is active. We&apos;ll send login credentials to your
                        email. In the meantime, here&apos;s what to do next:
                    </p>

                    <div
                        style={{
                            textAlign: "left",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px",
                            padding: "1.5rem",
                            marginBottom: "2rem",
                        }}
                    >
                        {[
                            { step: "1", text: "Check your email for login details" },
                            { step: "2", text: "Log into your xiriOS dashboard" },
                            { step: "3", text: "Create your first bid and win a job" },
                        ].map((item) => (
                            <div
                                key={item.step}
                                style={{
                                    display: "flex",
                                    gap: "1rem",
                                    alignItems: "center",
                                    padding: "0.75rem 0",
                                    borderBottom:
                                        item.step !== "3"
                                            ? "1px solid rgba(255,255,255,0.06)"
                                            : "none",
                                }}
                            >
                                <span
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        background: "#00d4aa",
                                        color: "#0a0e1a",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: "0.875rem",
                                        flexShrink: 0,
                                    }}
                                >
                                    {item.step}
                                </span>
                                <span style={{ color: "#c4c9e0", fontSize: "0.9375rem" }}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <a
                        href="/"
                        className="btn btn-primary"
                        style={{ fontSize: "1rem", padding: "0.875rem 2.5rem" }}
                    >
                        Back to Home
                    </a>
                </div>
            </main>
        </>
    );
}

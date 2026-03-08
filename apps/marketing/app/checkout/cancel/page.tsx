import type { Metadata } from "next";
import Navbar from "../../components/Navbar";

export const metadata: Metadata = {
    title: "Checkout Cancelled — xiriOS",
    description: "Your checkout was cancelled. No charges were made.",
};

export default function CheckoutCancel() {
    return (
        <>
            <Navbar />
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
                <div style={{ textAlign: "center", maxWidth: "480px" }}>
                    <h1
                        style={{
                            fontFamily: "var(--font-outfit)",
                            fontSize: "2rem",
                            fontWeight: 800,
                            color: "white",
                            marginBottom: "1rem",
                        }}
                    >
                        No worries!
                    </h1>

                    <p
                        style={{
                            color: "#8b92b3",
                            fontSize: "1.0625rem",
                            lineHeight: 1.7,
                            marginBottom: "2rem",
                        }}
                    >
                        Your checkout was cancelled and no charges were made. You can always come
                        back when you&apos;re ready — or start with our{" "}
                        <span style={{ color: "#00d4aa", fontWeight: 600 }}>free Bid plan</span>{" "}
                        to try xiriOS risk-free.
                    </p>

                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <a
                            href="/pricing"
                            className="btn btn-primary"
                            style={{ fontSize: "0.9375rem", padding: "0.75rem 2rem" }}
                        >
                            View Plans
                        </a>
                        <a
                            href="/"
                            className="btn btn-secondary"
                            style={{ fontSize: "0.9375rem", padding: "0.75rem 2rem" }}
                        >
                            Back to Home
                        </a>
                    </div>
                </div>
            </main>
        </>
    );
}

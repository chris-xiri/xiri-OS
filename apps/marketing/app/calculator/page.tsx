import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Free Janitorial Bid Calculator — ISSA 612 Powered | xiriOS",
    description:
        "Calculate accurate cleaning bids in seconds. Powered by ISSA 612 production rates and real industry data. Room-by-room scoping, task frequencies, and financial settings.",
    openGraph: {
        title: "Free Janitorial Bid Calculator | xiriOS",
        description:
            "Calculate accurate cleaning bids in seconds. Powered by ISSA 612 production rates.",
    },
};

export default function CalculatorPage() {
    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                background: "#0c0f1a",
            }}
        >
            <iframe
                src="/app/calculator"
                title="Janitorial Bid Calculator"
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                }}
                allow="clipboard-write"
            />
        </div>
    );
}

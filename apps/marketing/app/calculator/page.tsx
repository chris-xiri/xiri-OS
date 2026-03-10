import type { Metadata } from "next";
import CalculatorEmbed from "./CalculatorEmbed";

export const metadata: Metadata = {
    title: "Free Janitorial Bid Calculator — ISSA 612 Powered | xiriOS",
    description:
        "Calculate accurate cleaning bids in seconds. Powered by ISSA 612 production rates and real industry data. Room-by-room scoping, task frequencies, and financial settings.",
    openGraph: {
        title: "Free Janitorial Bid Calculator | xiriOS",
        description:
            "Calculate accurate cleaning bids in seconds. Powered by ISSA 612 production rates.",
    },
    alternates: { canonical: "https://os.xiri.ai/calculator" },
};

export default function CalculatorPage() {
    return <CalculatorEmbed />;
}

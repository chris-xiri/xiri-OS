"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CalculatorIframe() {
    const searchParams = useSearchParams();
    const state = searchParams.get("state") || "";
    const iframeSrc = state
        ? `/app/calculator?state=${encodeURIComponent(state)}`
        : "/app/calculator";

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
                src={iframeSrc}
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

export default function CalculatorEmbed() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        width: "100%",
                        height: "100vh",
                        background: "#0c0f1a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#555d7e",
                    }}
                >
                    Loading calculator…
                </div>
            }
        >
            <CalculatorIframe />
        </Suspense>
    );
}

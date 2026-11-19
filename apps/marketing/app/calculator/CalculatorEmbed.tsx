"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CalculatorIframe() {
    const searchParams = useSearchParams();
    const qs = searchParams.toString();
    const iframeSrc = qs ? `/app/calculator?${qs}` : "/app/calculator";

    return (
        <div
            style={{
                width: "100%",
                height: "92vh",
                minHeight: "760px",
                overflow: "hidden",
                background: "#0c0f1a",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
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

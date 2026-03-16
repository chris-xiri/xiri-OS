"use client";

/**
 * StickyResultBanner — mobile-only fixed banner that shows the primary result
 * of a tool at the bottom of the screen so users don't have to scroll.
 *
 * Only renders when `value` is provided and screen ≤ 768px.
 */
export default function StickyResultBanner({
    label,
    value,
    valueColor = "#00d4aa",
    sublabel,
}: {
    label: string;
    value: string | null;
    valueColor?: string;
    sublabel?: string;
}) {
    if (!value) return null;

    return (
        <>
            <style>{`
                .sticky-result-banner {
                    display: none;
                }
                @media (max-width: 768px) {
                    .sticky-result-banner {
                        display: flex;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        z-index: 1000;
                        background: rgba(20, 24, 41, 0.95);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border-top: 1px solid rgba(0, 212, 170, 0.2);
                        padding: 0.75rem 1.25rem;
                        padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
                        align-items: center;
                        justify-content: space-between;
                        gap: 0.5rem;
                        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
                    }
                }
            `}</style>
            <div className="sticky-result-banner">
                <div>
                    <div style={{ color: "#8b92b3", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>
                        {label}
                    </div>
                    {sublabel && (
                        <div style={{ color: "#8b92b3", fontSize: "0.6875rem", marginTop: "2px" }}>
                            {sublabel}
                        </div>
                    )}
                </div>
                <div
                    style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: valueColor,
                        lineHeight: 1,
                    }}
                >
                    {value}
                </div>
            </div>
        </>
    );
}

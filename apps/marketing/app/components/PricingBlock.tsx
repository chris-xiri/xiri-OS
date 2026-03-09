import { ACTIVE_PLANS, COMING_SOON_PLANS, formatPrice, type Plan } from "../../lib/plans";

/* ── Checkmark icon ────────────────────────────────────────────────── */
function Check() {
    return (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ marginTop: "2px", flexShrink: 0 }}>
            <path d="M4.5 9l3 3 6-6" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── Full plan card (homepage / pricing page) ──────────────────────── */
function PlanCard({ plan }: { plan: Plan }) {
    const isFree = plan.price === 0;

    return (
        <div
            className={`card${plan.featured ? " card-featured" : ""}`}
            style={{ display: "flex", flexDirection: "column" }}
        >
            <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ color: "white", marginBottom: "0.375rem", fontSize: "1.125rem" }}>{plan.name}</h3>
                <p style={{ fontSize: "0.8125rem", color: "#8b92b3" }}>{plan.tagline}</p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: "var(--font-outfit)", fontSize: "2.75rem", fontWeight: 800, color: "white" }}>
                    {isFree ? "Free" : `$${plan.price}`}
                </span>
                {!isFree && <span style={{ color: "#8b92b3", fontSize: "0.875rem" }}>/month</span>}
                <div style={{ color: "#00d4aa", fontSize: "0.75rem", fontWeight: 600, marginTop: "4px" }}>
                    {isFree
                        ? "forever free"
                        : `14-day free trial · ${formatPrice(plan, "annual")} billed annually`}
                </div>
            </div>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1, padding: 0, margin: 0 }}>
                {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", color: "#c4c9e0", fontSize: "0.875rem" }}>
                        <Check />
                        {f}
                    </li>
                ))}
            </ul>

            <a
                href="/app/login?mode=signup"
                className={`btn ${isFree ? "btn-secondary" : "btn-primary"}`}
                style={{ width: "100%", marginTop: "1.5rem", fontSize: "0.875rem" }}
            >
                {plan.cta}
            </a>
        </div>
    );
}

/* ── Coming soon mini-card ─────────────────────────────────────────── */
function ComingSoonCard({ plan }: { plan: Plan }) {
    return (
        <div className="card" style={{ opacity: 0.5, textAlign: "center", padding: "1.5rem" }}>
            <h4 style={{ color: "white", fontSize: "1rem", marginBottom: "0.25rem" }}>{plan.name}</h4>
            <div style={{ fontFamily: "var(--font-outfit)", fontSize: "1.25rem", fontWeight: 700, color: "#00d4aa", marginBottom: "0.5rem" }}>
                {formatPrice(plan)}
            </div>
            <p style={{ color: "#8b92b3", fontSize: "0.8125rem", margin: 0 }}>{plan.tagline}</p>
        </div>
    );
}

/* ── Compact plan card (pSEO pages) ────────────────────────────────── */
function CompactPlanCard({ plan }: { plan: Plan }) {
    const isFree = plan.price === 0;
    return (
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                {plan.name}
            </h3>
            <div style={{ fontFamily: "var(--font-outfit)", fontSize: "1.5rem", fontWeight: 800, color: "#00d4aa", marginBottom: "0.5rem" }}>
                {isFree ? "Free" : formatPrice(plan)}
            </div>
            <p style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>{plan.tagline}</p>
        </div>
    );
}

/* ── Main component ────────────────────────────────────────────────── */
interface PricingBlockProps {
    /** "full" = homepage/pricing-page style with feature lists.
     *  "compact" = pSEO/city pages with small cards. */
    variant?: "full" | "compact";
    /** Whether to show coming-soon plans (only applies in "full" variant) */
    showComingSoon?: boolean;
    /** Max width for the container */
    maxWidth?: string;
}

export default function PricingBlock({
    variant = "full",
    showComingSoon = true,
    maxWidth = "900px",
}: PricingBlockProps) {
    if (variant === "compact") {
        return (
            <div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${ACTIVE_PLANS.length}, 1fr)`,
                        gap: "1rem",
                    }}
                >
                    {ACTIVE_PLANS.map((plan) => (
                        <CompactPlanCard key={plan.slug} plan={plan} />
                    ))}
                </div>
                <a
                    href="/pricing"
                    className="btn btn-primary"
                    style={{ marginTop: "2rem", display: "inline-block" }}
                >
                    See All Plans →
                </a>
            </div>
        );
    }

    /* ── Full variant ─────────────────────────────────────────────── */
    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "1.5rem",
                    maxWidth,
                    margin: "0 auto",
                }}
            >
                {ACTIVE_PLANS.map((plan) => (
                    <PlanCard key={plan.slug} plan={plan} />
                ))}
            </div>

            {showComingSoon && COMING_SOON_PLANS.length > 0 && (
                <div style={{ marginTop: "3rem", textAlign: "center" }}>
                    <p
                        style={{
                            color: "#8b92b3",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            marginBottom: "1.5rem",
                        }}
                    >
                        Coming Soon
                    </p>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${COMING_SOON_PLANS.length}, 1fr)`,
                            gap: "1rem",
                            maxWidth,
                            margin: "0 auto",
                        }}
                    >
                        {COMING_SOON_PLANS.map((plan) => (
                            <ComingSoonCard key={plan.slug} plan={plan} />
                        ))}
                    </div>
                </div>
            )}

            <p style={{ textAlign: "center", marginTop: "2rem", color: "#8b92b3", fontSize: "0.875rem" }}>
                Need more than 25 users?{" "}
                <a href="#" style={{ color: "#00d4aa", textDecoration: "underline" }}>
                    Contact us
                </a>{" "}
                for custom pricing.
            </p>
        </div>
    );
}

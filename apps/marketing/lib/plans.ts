/**
 * Single source of truth for xiriOS plan names, pricing, and features.
 * All pages should import from here instead of hardcoding prices.
 */

export interface Plan {
    name: string;
    slug: string;
    price: number;        // monthly price in USD
    annual: number;       // annual price per month in USD
    tagline: string;
    users: string;
    featured: boolean;
    comingSoon?: boolean;
    features: string[];
    cta: string;
}

export const PLANS: Plan[] = [
    {
        name: "Bid",
        slug: "bid",
        price: 0,
        annual: 0,
        tagline: "Win jobs with professional bids",
        users: "1 user",
        featured: false,
        features: [
            "Up to 3 active bids",
            "PDF proposal generation",
            "CRM — up to 5 contacts",
            "Mobile app (PWA)",
            "Email support",
        ],
        cta: "Get Started Free",
    },
    {
        name: "Bid Plus",
        slug: "bid_plus",
        price: 9,
        annual: 7,
        tagline: "Unlimited bidding for solo operators",
        users: "Up to 3 users",
        featured: false,
        features: [
            "Everything in Bid",
            "Unlimited contacts & bids",
            "Custom tasks & frequencies",
            "PDF proposal generation",
            "Priority email support",
        ],
        cta: "Start Free Trial",
    },
    {
        name: "Grow",
        slug: "grow",
        price: 39,
        annual: 31,
        tagline: "Add invoicing & a small team",
        users: "Up to 3 users",
        featured: false,
        comingSoon: true,
        features: [
            "Everything in Bid",
            "Invoicing & payments",
            "Full CRM & lead management",
            "Email campaigns",
            "QuickBooks sync",
        ],
        cta: "Start Free Trial",
    },
    {
        name: "Pro",
        slug: "pro",
        price: 79,
        annual: 63,
        tagline: "Full operations for growing teams",
        users: "Up to 10 users",
        featured: true,
        comingSoon: true,
        features: [
            "Everything in Grow",
            "Scheduling & recurring jobs",
            "Timekeeping with GPS geofence",
            "Checklists & task management",
            "QuickBooks integration",
            "Priority support",
        ],
        cta: "Start Free Trial",
    },
    {
        name: "Business",
        slug: "business",
        price: 119,
        annual: 95,
        tagline: "Scale with full visibility",
        users: "Up to 25 users",
        featured: false,
        comingSoon: true,
        features: [
            "Everything in Pro",
            "Inspections & quality scores",
            "Client portal",
            "Job costing & profitability",
            "Work orders",
            "Dedicated account manager",
        ],
        cta: "Start Free Trial",
    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Plans currently available (not coming soon) */
export const ACTIVE_PLANS = PLANS.filter((p) => !p.comingSoon);

/** Plans marked as coming soon */
export const COMING_SOON_PLANS = PLANS.filter((p) => p.comingSoon);

/** Get a specific plan by slug */
export function getPlan(slug: string): Plan | undefined {
    return PLANS.find((p) => p.slug === slug);
}

/** Shorthand refs for the two active plans */
export const BID = PLANS[0];
export const BID_PLUS = PLANS[1];

/** Format price for display: "$9/mo" or "Free" */
export function formatPrice(plan: Plan, period: "monthly" | "annual" = "monthly"): string {
    const p = period === "annual" ? plan.annual : plan.price;
    return p === 0 ? "Free" : `$${p}/mo`;
}

/** Format short price label (e.g. "$9" or "Free") */
export function formatPriceShort(plan: Plan): string {
    return plan.price === 0 ? "Free" : `$${plan.price}`;
}

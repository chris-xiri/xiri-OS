// ============================================================
// Competitor Data for pSEO Pages
// Used by /vs/[competitor] dynamic route
// ============================================================

export interface CompetitorFeature {
    name: string;
    xiriOS: boolean | string;
    competitor: boolean | string;
}

export interface CompetitorData {
    slug: string;
    name: string;
    tagline: string;
    description: string;
    /** Monthly price range string */
    pricing: string;
    /** What they're known for */
    strength: string;
    /** What they lack */
    weakness: string;
    /** xiriOS plan that best competes */
    competingPlan: string;
    competingPrice: string;
    /** Annual savings switching */
    annualSavings: string;
    /** SEO keywords */
    seoKeywords: string[];
    features: CompetitorFeature[];
}

export const COMPETITORS: CompetitorData[] = [
    {
        slug: "cleanguru",
        name: "CleanGuru",
        tagline: "Same features. Half the price.",
        description:
            "CleanGuru is an all-in-one cleaning business platform with bidding, scheduling, and invoicing. But at $79–159/mo, you're paying enterprise prices for small business features.",
        pricing: "$79–$159/mo",
        strength: "Established brand with coaching add-on",
        weakness: "Expensive for what you get, dated interface, no geofencing",
        competingPlan: "Grow",
        competingPrice: "$39/mo",
        annualSavings: "$480–$1,440",
        seoKeywords: [
            "cleanguru alternative",
            "cleanguru vs",
            "cleanguru pricing",
            "cleanguru review",
            "cheaper than cleanguru",
        ],
        features: [
            { name: "Bidding & Estimates", xiriOS: true, competitor: true },
            { name: "PDF Proposals", xiriOS: true, competitor: true },
            { name: "CRM & Lead Tracking", xiriOS: true, competitor: true },
            { name: "Invoicing & Payments", xiriOS: true, competitor: true },
            { name: "Scheduling", xiriOS: "Pro plan", competitor: true },
            { name: "Time Tracking", xiriOS: "Pro plan", competitor: true },
            { name: "GPS Geofencing", xiriOS: "Pro plan", competitor: false },
            { name: "Inspections & QA", xiriOS: "Business plan", competitor: false },
            { name: "Client Portal", xiriOS: "Business plan", competitor: false },
            { name: "Job Costing", xiriOS: "Business plan", competitor: false },
            { name: "Mobile App", xiriOS: true, competitor: true },
            { name: "QuickBooks Integration", xiriOS: "Pro plan", competitor: true },
            { name: "Starting Price", xiriOS: "Free", competitor: "$79/mo" },
        ],
    },
    {
        slug: "swept",
        name: "Swept",
        tagline: "Everything Swept does — plus bidding, invoicing, and CRM. For less.",
        description:
            "Swept is great at what it does: scheduling, time tracking, and team communication for cleaning crews. But it has major blind spots — zero bidding, zero invoicing, zero CRM at any price tier. xiriOS gives you all of Swept's core features PLUS the business tools you actually need to win jobs and get paid.",
        pricing: "$24–$180/mo (per location, 15 min)",
        strength: "Scheduling, GPS time clocks, 100+ language translation, task management",
        weakness: "No bidding or proposals at any tier, no invoicing at any tier, no CRM or lead tracking, per-location pricing adds up fast",
        competingPlan: "Pro",
        competingPrice: "$79/mo",
        annualSavings: "$492–$1,212",
        seoKeywords: [
            "swept alternative",
            "swept vs",
            "swept pricing",
            "sweptworks review",
            "swept cleaning software",
            "better than swept",
            "swept alternative with invoicing",
        ],
        features: [
            // Swept's core strengths — xiriOS matches them
            { name: "Employee Scheduling", xiriOS: "Pro plan", competitor: true },
            { name: "Time Tracking & Clock-in", xiriOS: "Pro plan", competitor: true },
            { name: "GPS Geofencing", xiriOS: "Pro plan", competitor: "Optimize plan" },
            { name: "Task & Checklist Management", xiriOS: "Pro plan", competitor: true },
            { name: "Team Messaging", xiriOS: "Pro plan", competitor: true },
            { name: "Location Management", xiriOS: "Pro plan", competitor: true },
            { name: "Inspections & Quality Scores", xiriOS: "Business plan", competitor: "Optimize plan" },
            { name: "Supply Tracking", xiriOS: "Business plan", competitor: "Scale plan" },
            { name: "Mobile App", xiriOS: true, competitor: true },
            // Where xiriOS wins — Swept has NONE of these
            { name: "Bidding & Estimates", xiriOS: true, competitor: false },
            { name: "PDF Proposals", xiriOS: true, competitor: false },
            { name: "CRM & Lead Tracking", xiriOS: true, competitor: false },
            { name: "Invoicing & Payments", xiriOS: "Grow plan", competitor: false },
            { name: "QuickBooks Integration", xiriOS: "Pro plan", competitor: false },
            { name: "Client Portal", xiriOS: "Business plan", competitor: "Scale plan" },
            { name: "Job Costing & Profitability", xiriOS: "Business plan", competitor: false },
            // Swept unique — honesty
            { name: "100+ Language Translation", xiriOS: false, competitor: true },
            { name: "Per-location pricing", xiriOS: "Flat rate", competitor: "Per location" },
            { name: "Starting Price", xiriOS: "Free", competitor: "$24/mo (per location)" },
        ],
    },
    {
        slug: "jobber",
        name: "Jobber",
        tagline: "Built for cleaning. Not generic field service.",
        description:
            "Jobber is a popular field service management platform used across many industries. But it's not purpose-built for janitorial: no cleaning-specific bid calculator, no ISSA production rates, and no inspection workflows.",
        pricing: "$39–$199/mo",
        strength: "Polished UI, strong brand, QuickBooks integration",
        weakness:
            "No cleaning-specific bidding, no geofencing, no inspections, expensive at scale",
        competingPlan: "Pro",
        competingPrice: "$79/mo",
        annualSavings: "$480–$1,440",
        seoKeywords: [
            "jobber alternative cleaning",
            "jobber vs",
            "jobber janitorial",
            "jobber pricing",
            "better than jobber for cleaning",
        ],
        features: [
            { name: "Cleaning-Specific Bidding", xiriOS: true, competitor: false },
            { name: "ISSA Production Rates", xiriOS: true, competitor: false },
            { name: "PDF Proposals", xiriOS: true, competitor: true },
            { name: "CRM & Lead Tracking", xiriOS: true, competitor: true },
            { name: "Invoicing & Payments", xiriOS: true, competitor: true },
            { name: "Scheduling", xiriOS: "Pro plan", competitor: true },
            { name: "Time Tracking", xiriOS: "Pro plan", competitor: true },
            { name: "GPS Geofencing", xiriOS: "Pro plan", competitor: false },
            { name: "Inspections & QA", xiriOS: "Business plan", competitor: false },
            { name: "Client Portal", xiriOS: "Business plan", competitor: "Grow plan ($119)" },
            { name: "Job Costing", xiriOS: "Business plan", competitor: false },
            { name: "Mobile App", xiriOS: true, competitor: true },
            { name: "Starting Price", xiriOS: "Free", competitor: "$39/mo" },
        ],
    },
    {
        slug: "janitorial-manager",
        name: "Janitorial Manager",
        tagline: "Enterprise features without the enterprise price tag.",
        description:
            "Janitorial Manager is a legacy platform built for large janitorial operations. It's comprehensive but expensive, with pricing that can exceed $500/month — putting it out of reach for small and mid-size cleaning businesses.",
        pricing: "$300–$500+/mo (custom)",
        strength: "Deep janitorial-specific features, industry veteran",
        weakness: "Very expensive, legacy UI, complex onboarding, no free tier",
        competingPlan: "Business",
        competingPrice: "$119/mo",
        annualSavings: "$2,172–$4,572+",
        seoKeywords: [
            "janitorial manager alternative",
            "janitorial manager vs",
            "janitorial manager pricing",
            "janitorial manager review",
            "cheaper than janitorial manager",
        ],
        features: [
            { name: "Bidding & Estimates", xiriOS: true, competitor: true },
            { name: "PDF Proposals", xiriOS: true, competitor: true },
            { name: "CRM & Lead Tracking", xiriOS: true, competitor: true },
            { name: "Invoicing & Payments", xiriOS: true, competitor: true },
            { name: "Scheduling", xiriOS: "Pro plan", competitor: true },
            { name: "Time Tracking", xiriOS: "Pro plan", competitor: true },
            { name: "GPS Geofencing", xiriOS: "Pro plan", competitor: true },
            { name: "Inspections & QA", xiriOS: "Business plan", competitor: true },
            { name: "Client Portal", xiriOS: "Business plan", competitor: true },
            { name: "Job Costing", xiriOS: "Business plan", competitor: true },
            { name: "Work Orders", xiriOS: "Business plan", competitor: true },
            { name: "Mobile App", xiriOS: true, competitor: true },
            { name: "Free Trial", xiriOS: "14 days", competitor: false },
            { name: "Starting Price", xiriOS: "Free", competitor: "$300+/mo" },
        ],
    },
];

export function getCompetitor(slug: string): CompetitorData | undefined {
    return COMPETITORS.find((c) => c.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
    return COMPETITORS.map((c) => c.slug);
}

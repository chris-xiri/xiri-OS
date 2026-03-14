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
        tagline: "A modern alternative to an industry veteran.",
        description:
            "CleanGuru is one of the most established janitorial software platforms, with 15+ years in the industry and a 4.8/5 Capterra rating. They offer comprehensive bidding, scheduling, and invoicing with an optional coaching add-on. xiriOS provides a similar feature set with a modern, mobile-first interface — starting free.",
        pricing: "$39–$155/mo",
        strength: "15+ years of industry experience, excellent customer support (4.8/5 on Capterra), coaching add-on, 500K+ proposals generated",
        weakness: "Starting price is higher than alternatives, bidding tools require trial signup, interface could benefit from a refresh (per Software Advice reviews)",
        competingPlan: "Grow",
        competingPrice: "$39/mo",
        annualSavings: "$480–$1,440",
        seoKeywords: [
            "cleanguru alternative",
            "cleanguru vs",
            "cleanguru pricing",
            "cleanguru review",
            "cleanguru comparison",
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
            { name: "Free Calculator (No Signup)", xiriOS: true, competitor: false },
            { name: "Starting Price", xiriOS: "Free", competitor: "$39/mo" },
        ],
    },
    {
        slug: "swept",
        name: "Swept",
        tagline: "Swept's scheduling strengths — plus bidding, invoicing, and CRM.",
        description:
            "Swept excels at employee scheduling, GPS time tracking, and multilingual team communication (100+ languages). It's purpose-built for cleaning crews. xiriOS offers similar scheduling features at the Pro tier, plus bidding, invoicing, and CRM that Swept doesn't include at any price point.",
        pricing: "$17–$180/mo per location",
        strength: "Excellent scheduling and GPS time clocks, 100+ language translation (unique in category), purpose-built location management",
        weakness: "Bidding, proposals, invoicing, and CRM are not available at any tier. Per-location pricing can add up for multi-site operations. Some Capterra reviewers report intermittent app stability",
        competingPlan: "Pro",
        competingPrice: "$79/mo",
        annualSavings: "$492–$1,212",
        seoKeywords: [
            "swept alternative",
            "swept vs",
            "swept pricing",
            "sweptworks review",
            "swept cleaning software",
            "swept alternative with bidding",
            "swept alternative with invoicing",
        ],
        features: [
            // Swept's core strengths
            { name: "Employee Scheduling", xiriOS: "Pro plan", competitor: true },
            { name: "Time Tracking & Clock-in", xiriOS: "Pro plan", competitor: true },
            { name: "GPS Geofencing", xiriOS: "Pro plan", competitor: "Optimize plan" },
            { name: "Task & Checklist Management", xiriOS: "Pro plan", competitor: true },
            { name: "Team Messaging", xiriOS: "Pro plan", competitor: true },
            { name: "Location Management", xiriOS: "Pro plan", competitor: true },
            { name: "Inspections & Quality Scores", xiriOS: "Business plan", competitor: "Optimize plan" },
            { name: "Supply Tracking", xiriOS: "Business plan", competitor: "Scale plan" },
            { name: "Mobile App", xiriOS: true, competitor: true },
            // Features xiriOS includes that Swept does not
            { name: "Bidding & Estimates", xiriOS: true, competitor: false },
            { name: "PDF Proposals", xiriOS: true, competitor: false },
            { name: "CRM & Lead Tracking", xiriOS: true, competitor: false },
            { name: "Invoicing & Payments", xiriOS: "Grow plan", competitor: false },
            { name: "QuickBooks Integration", xiriOS: "Pro plan", competitor: false },
            { name: "Client Portal", xiriOS: "Business plan", competitor: "Scale plan" },
            { name: "Job Costing & Profitability", xiriOS: "Business plan", competitor: false },
            // Swept unique features
            { name: "100+ Language Translation", xiriOS: false, competitor: true },
            { name: "Pricing Model", xiriOS: "Flat rate", competitor: "Per location" },
            { name: "Free Calculator (No Signup)", xiriOS: true, competitor: false },
            { name: "Starting Price", xiriOS: "Free", competitor: "$17/mo (per location)" },
        ],
    },
    {
        slug: "jobber",
        name: "Jobber",
        tagline: "Purpose-built for janitorial — where Jobber is general-purpose.",
        description:
            "Jobber is one of the most polished field service management platforms available, with an excellent mobile app, strong QuickBooks integration, and a large ecosystem of add-ons. It serves many trades well. xiriOS is purpose-built for janitorial specifically, with ISSA 612 production rates and cleaning-specific bidding that Jobber doesn't offer.",
        pricing: "$30–$199/mo + $29/user",
        strength: "Polished interface, excellent mobile app, strong brand, large third-party ecosystem, regular feature updates",
        weakness: "Not janitorial-specific — no ISSA production rates, no cleaning-specific calculator, no inspection workflows. Per-user fees and add-on costs can escalate pricing",
        competingPlan: "Pro",
        competingPrice: "$79/mo",
        annualSavings: "$480–$1,440",
        seoKeywords: [
            "jobber alternative cleaning",
            "jobber vs",
            "jobber janitorial",
            "jobber pricing",
            "jobber for cleaning companies",
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
            { name: "Free Calculator (No Signup)", xiriOS: true, competitor: false },
            { name: "Starting Price", xiriOS: "Free", competitor: "$30/mo" },
        ],
    },
    {
        slug: "janitorial-manager",
        name: "Janitorial Manager",
        tagline: "Enterprise-grade janitorial features at a fraction of the cost.",
        description:
            "Janitorial Manager is the most comprehensive janitorial-specific platform available, with deep inspection, work loading, inventory, and multi-site management tools. It's trusted by large operations and carries a 4.6/5 Capterra rating. xiriOS offers a modern alternative for small-to-mid-size teams who need professional features without enterprise pricing.",
        pricing: "$300–$500+/mo (custom quote)",
        strength: "Most comprehensive janitorial feature set, strong inspection and quality management tools, 4.6/5 Capterra rating, purpose-built for large commercial cleaning",
        weakness: "Custom quote pricing only (no public pricing page), no free trial or self-service signup, higher cost tier suited for larger operations",
        competingPlan: "Business",
        competingPrice: "$119/mo",
        annualSavings: "$2,172–$4,572+",
        seoKeywords: [
            "janitorial manager alternative",
            "janitorial manager vs",
            "janitorial manager pricing",
            "janitorial manager review",
            "janitorial manager comparison",
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
            { name: "Free Calculator (No Signup)", xiriOS: true, competitor: false },
            { name: "Free Trial", xiriOS: "14 days", competitor: false },
            { name: "Starting Price", xiriOS: "Free", competitor: "$300+/mo" },
        ],
    },
    {
        slug: "janibid",
        name: "JaniBid",
        tagline: "Janitorial-specific and bilingual — with a free calculator to start.",
        description:
            "JaniBid offers bilingual (English/Spanish) support and covers multiple cleaning trades including janitorial, pressure washing, and carpet cleaning. It includes pricing analysis tools to compare bids against market rates. xiriOS offers a more modern, mobile-first experience with ISSA 612 production rates and transparent pricing.",
        pricing: "Quote-based",
        strength: "Bilingual English/Spanish support, multi-trade coverage (janitorial + pressure washing + carpet cleaning), pricing analysis tools",
        weakness: "Quote-based pricing only, iOS mobile support still developing, steeper learning curve noted by G2 reviewers, lower review volume than alternatives",
        competingPlan: "Bid Plus",
        competingPrice: "$9/mo",
        annualSavings: "Varies (contact JaniBid)",
        seoKeywords: [
            "janibid alternative",
            "janibid vs",
            "janibid review",
            "janibid pricing",
            "janibid comparison",
        ],
        features: [
            { name: "Bidding & Estimates", xiriOS: true, competitor: true },
            { name: "ISSA Production Rates", xiriOS: true, competitor: false },
            { name: "PDF Proposals", xiriOS: true, competitor: true },
            { name: "CRM & Lead Tracking", xiriOS: true, competitor: false },
            { name: "Invoicing & Payments", xiriOS: true, competitor: false },
            { name: "Bilingual (English/Spanish)", xiriOS: false, competitor: true },
            { name: "Multi-Trade Support", xiriOS: false, competitor: true },
            { name: "Pricing Analysis", xiriOS: false, competitor: true },
            { name: "Mobile-First Web App", xiriOS: true, competitor: false },
            { name: "Free Calculator (No Signup)", xiriOS: true, competitor: "Basic version" },
            { name: "Transparent Pricing", xiriOS: true, competitor: false },
            { name: "Starting Price", xiriOS: "Free", competitor: "Quote-based" },
        ],
    },
];

export function getCompetitor(slug: string): CompetitorData | undefined {
    return COMPETITORS.find((c) => c.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
    return COMPETITORS.map((c) => c.slug);
}

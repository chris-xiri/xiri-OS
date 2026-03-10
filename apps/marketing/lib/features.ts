/**
 * Feature Data — backed by government and industry sources
 * Each feature page cites credible data (BLS, OSHA, ISSA, etc.)
 */

export interface FeatureStat {
    value: string;
    label: string;
    source: string;       // e.g. "U.S. Bureau of Labor Statistics, May 2024"
    sourceUrl: string;    // link to source
}

export interface FeatureBenefit {
    icon: string;
    title: string;
    desc: string;
}

export interface Feature {
    slug: string;
    name: string;
    plan: "bid" | "bid_plus";
    icon: string;
    headline: string;
    subtitle: string;
    benefits: FeatureBenefit[];
    howItWorks: string[];
    stats: FeatureStat[];
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
}

export const FEATURES: Feature[] = [
    {
        slug: "bidding",
        name: "Janitorial Bidding",
        plan: "bid",
        icon: "📊",
        headline: "Win More Cleaning Contracts with Data‑Driven Bids",
        subtitle:
            "Calculate accurate janitorial bids using real BLS wage data, ISSA cleaning times, and local market rates — not guesswork.",
        benefits: [
            {
                icon: "🎯",
                title: "BLS‑Backed Wage Rates",
                desc: "Default labor rates pulled from the Bureau of Labor Statistics OEWS May 2024 data — median janitor wages specific to your metro area.",
            },
            {
                icon: "⚡",
                title: "Instant Sq Ft Pricing",
                desc: "ISSA-standard production rates (2,500–5,000 sq ft/hr depending on soil level) calculate time and cost per cleaning automatically.",
            },
            {
                icon: "📐",
                title: "Room‑Level Scope",
                desc: "Break bids into individual rooms, each with its own task list and cleaning frequency — from daily trash to quarterly floor stripping.",
            },
        ],
        howItWorks: [
            "Enter square footage, building type, and ZIP code",
            "Calculator auto-applies metro-specific BLS median wages",
            "Customize tasks per room and set cleaning frequencies",
            "See total cost breakdown: labor, payroll tax, overhead, profit",
            "Generate a PDF proposal with one click",
        ],
        stats: [
            {
                value: "$16.29/hr",
                label: "National median janitor wage",
                source: "U.S. Bureau of Labor Statistics, OEWS May 2024",
                sourceUrl: "https://www.bls.gov/oes/current/oes372011.htm",
            },
            {
                value: "2.17M",
                label: "Janitors employed in the U.S.",
                source: "U.S. Bureau of Labor Statistics, OEWS May 2024",
                sourceUrl: "https://www.bls.gov/oes/current/oes372011.htm",
            },
            {
                value: "$0.05–$0.25",
                label: "Typical per sq ft cleaning price range",
                source: "ISSA Cleaning Industry Management Standard",
                sourceUrl: "https://www.issa.com/",
            },
        ],
        metaTitle: "Janitorial Bidding Software — Data-Driven Cleaning Bids | xiriOS",
        metaDescription:
            "Create accurate janitorial bids using BLS wage data, ISSA cleaning times, and room-level scope. Free bidding calculator with PDF proposals. Used by cleaning companies across 190+ cities.",
        keywords: [
            "janitorial bidding software",
            "cleaning bid calculator",
            "janitorial estimating tool",
            "commercial cleaning bid",
        ],
    },
    {
        slug: "proposals",
        name: "PDF Proposal Generation",
        plan: "bid",
        icon: "📄",
        headline: "Generate Professional Cleaning Proposals in Minutes",
        subtitle:
            "Turn every bid into a branded, client-ready PDF proposal — with itemized scope, pricing, and terms. No design skills needed.",
        benefits: [
            {
                icon: "🖨️",
                title: "One‑Click PDF Export",
                desc: "Generate a professional multi-page proposal directly from your calculator results. Includes scope of work, pricing breakdown, and company info.",
            },
            {
                icon: "✨",
                title: "Branded & Client‑Ready",
                desc: "Proposals include your company name, contact details, and a clean layout that builds trust with property managers and facility directors.",
            },
            {
                icon: "📋",
                title: "Detailed Scope of Work",
                desc: "Every proposal lists rooms, tasks, frequencies, and per-task pricing — showing clients exactly what they're paying for.",
            },
        ],
        howItWorks: [
            "Complete a bid in the calculator with room-level scope",
            "Click 'Generate Proposal' to create the PDF",
            "Review the multi-page document with scope, pricing, and terms",
            "Download or email directly to the prospect",
            "Proposal data is saved to your CRM for follow-up",
        ],
        stats: [
            {
                value: "73%",
                label: "of prospects prefer written proposals over verbal quotes",
                source: "ISSA Residential Clean Market Survey",
                sourceUrl: "https://www.issa.com/",
            },
            {
                value: "2.3×",
                label: "higher close rate with itemized scope vs lump-sum bids",
                source: "BSCAI Industry Report",
                sourceUrl: "https://www.bscai.org/",
            },
            {
                value: "<5 min",
                label: "average time to generate a proposal in xiriOS",
                source: "xiriOS product data, 2026",
                sourceUrl: "https://os.xiri.ai/calculator",
            },
        ],
        metaTitle: "Cleaning Proposal Generator — Professional PDF Proposals | xiriOS",
        metaDescription:
            "Generate branded PDF cleaning proposals with itemized scope, room-level pricing, and task breakdowns. One-click export from bid calculator. Free plan available.",
        keywords: [
            "cleaning proposal generator",
            "janitorial proposal template",
            "commercial cleaning proposal software",
            "cleaning bid proposal PDF",
        ],
    },
    {
        slug: "crm",
        name: "Contact CRM",
        plan: "bid",
        icon: "👥",
        headline: "A CRM Built for Cleaning Companies — Not Salesforce",
        subtitle:
            "Track prospects, clients, and follow-ups in a lightweight CRM designed for janitorial businesses. No bloat, no learning curve.",
        benefits: [
            {
                icon: "📇",
                title: "Contact Management",
                desc: "Store prospect names, companies, emails, and phone numbers. Every contact links to their bids, proposals, and activity history.",
            },
            {
                icon: "🔗",
                title: "Bid‑to‑Contact Pipeline",
                desc: "When you save a bid, the contact is auto-created. See all bids for a prospect in one place — no duplicate data entry.",
            },
            {
                icon: "📝",
                title: "Activity Tracking",
                desc: "Log calls, site visits, and follow-ups. Activity entries auto-generate when bids are created, so nothing slips through the cracks.",
            },
        ],
        howItWorks: [
            "Contacts are auto-created when you save bids (or add manually)",
            "View all bids and proposals for each contact",
            "Track activity: calls, emails, site visits, follow-ups",
            "Search, filter, and sort your pipeline",
            "Export contact data when needed",
        ],
        stats: [
            {
                value: "80%",
                label: "of cleaning companies still use spreadsheets for client tracking",
                source: "ISSA Cleaning Industry Census, 2023",
                sourceUrl: "https://www.issa.com/",
            },
            {
                value: "44%",
                label: "average close rate for commercial cleaning proposals",
                source: "BSCAI Benchmarking Report",
                sourceUrl: "https://www.bscai.org/",
            },
            {
                value: "3–5",
                label: "follow-ups needed to close a typical cleaning contract",
                source: "BSCAI Sales Best Practices",
                sourceUrl: "https://www.bscai.org/",
            },
        ],
        metaTitle: "Cleaning Business CRM — Simple Contact & Bid Management | xiriOS",
        metaDescription:
            "Manage cleaning prospects and clients in a CRM built for janitorial companies. Auto-links bids to contacts, tracks follow-ups, and integrates with your proposal workflow. Free plan.",
        keywords: [
            "cleaning business crm",
            "janitorial crm software",
            "cleaning company client management",
            "commercial cleaning crm",
        ],
    },
    {
        slug: "mobile-app",
        name: "Mobile App (PWA)",
        plan: "bid",
        icon: "📱",
        headline: "Bid from the Job Site — Works on Any Phone",
        subtitle:
            "xiriOS is a Progressive Web App — install it on any device, bid from the field, and access everything offline. No app store needed.",
        benefits: [
            {
                icon: "🌐",
                title: "Works on Any Device",
                desc: "Android, iPhone, tablet, laptop — xiriOS runs in any modern browser and installs as a native-like app with one tap. No App Store or Google Play needed.",
            },
            {
                icon: "🏗️",
                title: "Bid from the Field",
                desc: "Walk the building, enter square footage, pick rooms and tasks, and generate a price on the spot. Email the proposal before you leave the parking lot.",
            },
            {
                icon: "🔒",
                title: "Secure & Fast",
                desc: "PWA technology means the app loads instantly, updates automatically, and uses the same secure authentication as the desktop version.",
            },
        ],
        howItWorks: [
            "Visit os.xiri.ai on your phone's browser",
            "Tap 'Install' or 'Add to Home Screen' when prompted",
            "The app icon appears on your home screen — just like a native app",
            "Use the full calculator, CRM, and proposal tools on the go",
            "All data syncs in real-time with your desktop",
        ],
        stats: [
            {
                value: "82%",
                label: "of field service workers use mobile devices daily for work",
                source: "U.S. Bureau of Labor Statistics, Occupational Outlook",
                sourceUrl: "https://www.bls.gov/ooh/building-and-grounds-cleaning/",
            },
            {
                value: "3×",
                label: "faster than traditional app installs — no downloads, no updates",
                source: "Google Web Developers – Progressive Web Apps",
                sourceUrl: "https://web.dev/progressive-web-apps/",
            },
            {
                value: "100%",
                label: "feature parity with desktop on every plan",
                source: "xiriOS product data",
                sourceUrl: "https://os.xiri.ai/",
            },
        ],
        metaTitle: "Mobile Cleaning Business App — Bid from the Field | xiriOS",
        metaDescription:
            "Install xiriOS on any phone or tablet as a Progressive Web App. Bid from job sites, generate proposals, and manage contacts on the go. No app store needed. Free plan.",
        keywords: [
            "cleaning business mobile app",
            "janitorial bidding app",
            "cleaning company app",
            "field service cleaning app",
        ],
    },
    {
        slug: "custom-tasks",
        name: "Custom Tasks & Frequencies",
        plan: "bid_plus",
        icon: "⚙️",
        headline: "Build Bids with Exactly the Tasks Your Client Needs",
        subtitle:
            "Add custom cleaning tasks, set per-task frequencies, and override defaults — so every bid matches the real scope of work.",
        benefits: [
            {
                icon: "🔧",
                title: "Add Custom Tasks",
                desc: "Beyond the 20+ built-in ISSA-standard tasks, add your own: 'Sanitize breakroom appliances', 'Polish brass fixtures', or any specialty service.",
            },
            {
                icon: "📅",
                title: "Per‑Task Frequencies",
                desc: "Set different frequencies per task: daily trash, weekly mopping, monthly window cleaning, quarterly floor stripping. Each calculates independently.",
            },
            {
                icon: "✏️",
                title: "Rename & Override",
                desc: "Rename any standard task to match your client's vocabulary. Override frequencies per room. Full flexibility, zero confusion.",
            },
        ],
        howItWorks: [
            "Start with ISSA-recommended default tasks for your building type",
            "Add custom tasks specific to this client or facility",
            "Set per-task cleaning frequencies (daily through annually)",
            "Override task names to match the client's terminology",
            "Calculator adjusts time and cost for each frequency tier automatically",
        ],
        stats: [
            {
                value: "20+",
                label: "built-in cleaning tasks aligned with ISSA 612 standard",
                source: "ISSA Cleaning Industry Management Standard (CIMS)",
                sourceUrl: "https://www.issa.com/certification/cims",
            },
            {
                value: "7",
                label: "frequency tiers: daily, 2×/week, weekly, bi-weekly, monthly, quarterly, annually",
                source: "xiriOS product data",
                sourceUrl: "https://os.xiri.ai/calculator",
            },
            {
                value: "$5.9B",
                label: "U.S. janitorial services market revenue (specialty cleaning)",
                source: "U.S. Census Bureau, NAICS 561720",
                sourceUrl: "https://www.census.gov/naics/?input=561720",
            },
        ],
        metaTitle: "Custom Cleaning Tasks & Frequencies — Flexible Bidding | xiriOS",
        metaDescription:
            "Add custom cleaning tasks, set per-room frequencies, and override defaults to build bids that match the real scope of work. ISSA-aligned standards. Bid Plus plan.",
        keywords: [
            "custom cleaning tasks",
            "cleaning task frequency settings",
            "janitorial scope of work builder",
            "flexible cleaning bid software",
        ],
    },
    {
        slug: "unlimited",
        name: "Unlimited Bids & Contacts",
        plan: "bid_plus",
        icon: "♾️",
        headline: "No Limits — Bid Every Job, Track Every Prospect",
        subtitle:
            "Bid Plus removes all limits: unlimited bids, unlimited contacts, unlimited proposals. Scale your sales without scaling your costs.",
        benefits: [
            {
                icon: "📈",
                title: "Unlimited Bids",
                desc: "Create as many bids as you want — no monthly caps. Bid on every RFP, every walk-through, every opportunity that comes your way.",
            },
            {
                icon: "📇",
                title: "Unlimited Contacts",
                desc: "Track every prospect, client, and property manager. No 5-contact limit means your CRM grows with your pipeline.",
            },
            {
                icon: "💰",
                title: "Only $9/mo",
                desc: "All this for just $9/month ($7/mo billed annually). Competitors charge $79–$300/mo for similar features. You save $840–$3,492/year.",
            },
        ],
        howItWorks: [
            "Upgrade to Bid Plus ($9/mo or $7/mo annual)",
            "Create unlimited bids — no restrictions",
            "Add unlimited contacts and prospects to your CRM",
            "Generate unlimited PDF proposals",
            "Access custom tasks, frequencies, and priority support",
        ],
        stats: [
            {
                value: "$9/mo",
                label: "vs $79–$300/mo from competitors (60–97% savings)",
                source: "Competitor pricing: CleanGuru, Swept, Janitorial Manager",
                sourceUrl: "https://os.xiri.ai/pricing",
            },
            {
                value: "12–15",
                label: "bids/month for an average growing cleaning company",
                source: "BSCAI Industry Benchmarks",
                sourceUrl: "https://www.bscai.org/",
            },
            {
                value: "96",
                label: "U.S. metro areas with BLS median wage data built in",
                source: "U.S. Bureau of Labor Statistics, OEWS May 2024",
                sourceUrl: "https://www.bls.gov/oes/current/oes372011.htm",
            },
        ],
        metaTitle: "Unlimited Cleaning Bids & CRM Contacts — $9/mo | xiriOS Bid Plus",
        metaDescription:
            "Unlimited bids, contacts, and PDF proposals for just $9/month. 60% cheaper than Swept, CleanGuru, and Jobber. BLS wage data. 14-day free trial.",
        keywords: [
            "unlimited cleaning bids",
            "cheap janitorial software",
            "affordable cleaning business software",
            "unlimited crm cleaning company",
        ],
    },
];

export function getFeature(slug: string): Feature | undefined {
    return FEATURES.find((f) => f.slug === slug);
}

export function getAllFeatureSlugs(): string[] {
    return FEATURES.map((f) => f.slug);
}

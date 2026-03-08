export interface Industry {
    slug: string;
    name: string;
    headline: string;
    subtitle: string;
    painPoints: { icon: string; title: string; desc: string }[];
    features: string[];
    stat: { value: string; label: string };
    metaTitle: string;
    metaDescription: string;
}

export const INDUSTRIES: Industry[] = [
    {
        slug: "office-cleaning",
        name: "Office & Commercial Cleaning",
        headline: "Win more office cleaning contracts",
        subtitle:
            "Bid accurately on commercial buildings, track recurring schedules, and manage multi-site operations — all in one platform built for janitorial teams.",
        painPoints: [
            {
                icon: "📊",
                title: "Inconsistent bidding",
                desc: "Without standardized rates per square foot, you're either leaving money on the table or losing bids to lowball competitors.",
            },
            {
                icon: "🔄",
                title: "Recurring schedule chaos",
                desc: "Managing nightly, weekly, and monthly cleaning schedules across multiple office buildings is a nightmare in spreadsheets.",
            },
            {
                icon: "📋",
                title: "No inspection trail",
                desc: "Property managers expect quality verification. Without checklists and inspection reports, you lose trust and contracts.",
            },
        ],
        features: [
            "Square-foot-based bidding calculator for offices",
            "Multi-building scheduling with recurring jobs",
            "Digital checklists by area (restrooms, lobbies, offices)",
            "Photo-verified inspections for property managers",
            "Employee time tracking with GPS geofence",
            "Professional PDF proposals with your branding",
        ],
        stat: { value: "47%", label: "of cleaning revenue comes from offices" },
        metaTitle: "Office Cleaning Software — Bidding & Scheduling | xiriOS",
        metaDescription:
            "Bid, schedule, and manage office cleaning contracts with xiriOS. Square-foot calculators, recurring schedules, inspection checklists, and GPS time tracking. Free to start.",
    },
    {
        slug: "medical-facilities",
        name: "Medical & Healthcare Cleaning",
        headline: "Meet healthcare cleaning compliance",
        subtitle:
            "Specialized tools for infection control protocols, room-by-room checklists, and regulatory documentation that healthcare facilities demand.",
        painPoints: [
            {
                icon: "🏥",
                title: "Compliance pressure",
                desc: "Healthcare facilities require proof of disinfection protocols. One missed room can cost you the contract.",
            },
            {
                icon: "📝",
                title: "Complex checklists",
                desc: "Different areas (waiting rooms, exam rooms, surgical suites) have different cleaning requirements and frequencies.",
            },
            {
                icon: "⏱️",
                title: "Strict scheduling",
                desc: "Cleaning must happen around patient schedules, shift changes, and facility hours — there's zero flexibility.",
            },
        ],
        features: [
            "Room-by-room infection control checklists",
            "Compliance documentation and audit trails",
            "Specialized medical facility bid calculator",
            "Shift-based scheduling around facility hours",
            "Supply tracking for disinfectants and PPE",
            "Quality inspection scores with photo evidence",
        ],
        stat: { value: "2.3×", label: "higher rates than standard commercial" },
        metaTitle: "Medical Facility Cleaning Software — Compliance & Scheduling | xiriOS",
        metaDescription:
            "Manage healthcare cleaning with compliance-ready checklists, infection control protocols, and audit trails. Purpose-built for medical and hospital janitorial teams.",
    },
    {
        slug: "schools",
        name: "School & Educational Facility Cleaning",
        headline: "Keep schools clean, safe, and on budget",
        subtitle:
            "Manage school district contracts with zone-based scheduling, summer deep-clean workflows, and the documentation school boards require.",
        painPoints: [
            {
                icon: "🏫",
                title: "Seasonal variation",
                desc: "School cleaning goes from light summer maintenance to full daily service during the school year — your system needs to flex.",
            },
            {
                icon: "💰",
                title: "Tight budgets",
                desc: "School districts run on fixed budgets. You need to bid competitively while protecting your margins.",
            },
            {
                icon: "👥",
                title: "Large teams, many buildings",
                desc: "Managing crews across multiple schools with different schedules, layouts, and requirements gets complicated fast.",
            },
        ],
        features: [
            "Zone-based bidding for classrooms, gyms, cafeterias",
            "Seasonal schedule templates (school year vs summer)",
            "Multi-site management for school districts",
            "Budget-friendly proposals for procurement teams",
            "Crew assignment and route optimization",
            "Daily/weekly cleaning checklists by zone",
        ],
        stat: { value: "130K+", label: "schools in the US need contract cleaning" },
        metaTitle: "School Cleaning Software — Bid & Manage District Contracts | xiriOS",
        metaDescription:
            "Win and manage school cleaning contracts with zone-based bidding, seasonal scheduling, and multi-site crew management. Built for educational facility janitorial teams.",
    },
    {
        slug: "post-construction",
        name: "Post-Construction Cleanup",
        headline: "Price post-construction cleanup right",
        subtitle:
            "Calculate accurate bids for rough cleans, final cleans, and touch-ups with phase-based pricing and punch-list tracking.",
        painPoints: [
            {
                icon: "🏗️",
                title: "Hard-to-price jobs",
                desc: "Post-construction cleanup varies wildly by phase, building type, and condition. Guessing leads to lost profits.",
            },
            {
                icon: "📅",
                title: "GC schedule dependency",
                desc: "Your schedule depends on the general contractor's timeline, which shifts constantly. You need flexible scheduling.",
            },
            {
                icon: "✅",
                title: "Punch list management",
                desc: "Tracking touch-ups and re-cleans across floors and units is impossible without a system.",
            },
        ],
        features: [
            "Phase-based pricing (rough clean, final clean, touch-up)",
            "Square-footage calculator for new construction",
            "Punch list tracking with photo documentation",
            "Flexible scheduling tied to GC milestones",
            "Material and labor cost estimation",
            "Progress invoicing by completed phase",
        ],
        stat: { value: "$0.15–$0.75", label: "per sq ft depending on phase" },
        metaTitle: "Post-Construction Cleaning Software — Phase Pricing & Punch Lists | xiriOS",
        metaDescription:
            "Bid post-construction cleanup by phase with xiriOS. Rough clean, final clean, and touch-up pricing. Punch list tracking with photo documentation. Free to start.",
    },
    {
        slug: "industrial",
        name: "Industrial & Warehouse Cleaning",
        headline: "Manage industrial cleaning at scale",
        subtitle:
            "Bid on warehouses, manufacturing floors, and distribution centers with specialized rate tables and safety compliance documentation.",
        painPoints: [
            {
                icon: "🏭",
                title: "Massive square footage",
                desc: "Industrial facilities are 10–100× larger than offices. Your bidding tool needs to handle scale without losing accuracy.",
            },
            {
                icon: "⚠️",
                title: "Safety requirements",
                desc: "OSHA compliance, PPE tracking, and hazard documentation are non-negotiable for industrial cleaning contracts.",
            },
            {
                icon: "🔧",
                title: "Specialized equipment",
                desc: "Floor scrubbers, pressure washers, and specialized chemicals add cost complexity that spreadsheets can't handle.",
            },
        ],
        features: [
            "High-volume square footage calculator",
            "Equipment and chemical cost tracking",
            "Safety compliance documentation",
            "Shift scheduling for 24/7 facilities",
            "Multi-zone pricing (production, storage, office areas)",
            "Photo-verified quality inspections",
        ],
        stat: { value: "85%", label: "of warehouses outsource cleaning" },
        metaTitle: "Industrial Cleaning Software — Warehouse & Factory Bidding | xiriOS",
        metaDescription:
            "Bid and manage industrial cleaning contracts for warehouses, factories, and distribution centers. Safety compliance, equipment tracking, and multi-zone pricing.",
    },
    {
        slug: "residential",
        name: "Residential & Maid Service",
        headline: "Grow your residential cleaning business",
        subtitle:
            "Book, schedule, and manage recurring residential cleanings with client portals, automated reminders, and profit-protecting pricing.",
        painPoints: [
            {
                icon: "🏠",
                title: "Pricing inconsistency",
                desc: "Every home is different. Without a system, you're quoting by feel — and either underbidding or scaring clients away.",
            },
            {
                icon: "📱",
                title: "Client communication",
                desc: "Homeowners expect text confirmations, schedule reminders, and easy rebooking. Your phone shouldn't be your CRM.",
            },
            {
                icon: "📈",
                title: "Scaling past solo",
                desc: "Going from solo cleaner to a team means scheduling, payroll, and quality control — all at once.",
            },
        ],
        features: [
            "Room-based pricing calculator for homes",
            "Client portal with booking and rebooking",
            "Automated appointment reminders (SMS/email)",
            "Recurring schedule management (weekly, biweekly, monthly)",
            "Employee scheduling and route optimization",
            "CRM with client preferences and notes",
        ],
        stat: { value: "$300B+", label: "global residential cleaning market" },
        metaTitle: "Residential Cleaning Software — Booking & Scheduling | xiriOS",
        metaDescription:
            "Manage your residential cleaning business with xiriOS. Room-based pricing, client portals, automated reminders, and recurring schedule management. Free to start.",
    },
];

export interface ServiceType {
    slug: string;
    name: string;
    h1Template: string;       // e.g. "Janitorial Services in {city}, {stateCode}"
    subtitle: string;
    features: string[];
    faqs: { q: string; a: string }[];
    metaTitleTemplate: string;
    metaDescTemplate: string;
}

export const SERVICES: ServiceType[] = [
    {
        slug: "janitorial-services",
        name: "Janitorial Services",
        h1Template: "Janitorial Services Software in {city}, {stateCode}",
        subtitle:
            "Run your {city} janitorial business with professional bidding, scheduling, and client management — all in one platform.",
        features: [
            "Bid accurately on any janitorial contract in {city}",
            "Generate professional PDF proposals in minutes",
            "Schedule recurring cleaning jobs across {city}",
            "Track employee time with GPS geofence",
            "Full CRM with client history and notes",
            "Invoicing and QuickBooks integration",
        ],
        faqs: [
            {
                q: "How does xiriOS help janitorial companies in {city}?",
                a: "xiriOS gives {city} janitorial businesses a complete toolkit — from calculating accurate bids per square foot to generating professional PDF proposals and managing all your contacts. It replaces spreadsheets, paper bids, and disconnected tools with one platform built specifically for cleaning companies.",
            },
            {
                q: "Is there a free plan for {city} cleaning companies?",
                a: "Yes! Our Bid plan is 100% free forever. You get up to 3 active bids, PDF proposal generation, and a CRM for up to 5 contacts — no credit card required. When you're ready to grow, upgrade to Bid Plus for unlimited bids starting at $7/mo.",
            },
            {
                q: "What size janitorial company in {city} is xiriOS best for?",
                a: "xiriOS works for solo cleaners bidding their first office contract all the way up to 25+ person teams managing multiple buildings across {city} and the greater {stateCode} area.",
            },
            {
                q: "How do I create a janitorial bid for a building in {city}?",
                a: "Use the free xiriOS calculator: enter the building's square footage, select the building type, choose your cleaning frequency, and adjust your labor rate for the {city} market. The calculator uses ISSA 612 production rates to estimate hours and generates a professional bid you can send as a PDF.",
            },
            {
                q: "How much does janitorial software cost in {city}?",
                a: "xiriOS starts free with core bidding features. Paid plans range from $7/mo (Bid Plus for unlimited bids) to $95/mo (Business with inspections and client portal). That's 50–80% less than competitors like CleanGuru ($79–159/mo) or Janitorial Manager ($300+/mo).",
            },
        ],
        metaTitleTemplate: "Janitorial Services Software in {city}, {stateCode} | xiriOS",
        metaDescTemplate:
            "Manage your {city} janitorial business with xiriOS. Bidding calculator, scheduling, GPS timekeeping, CRM, and invoicing. Free plan available.",
    },
    {
        slug: "commercial-cleaning",
        name: "Commercial Cleaning",
        h1Template: "Commercial Cleaning Software in {city}, {stateCode}",
        subtitle:
            "Win more commercial cleaning contracts in {city} with data-driven bids, recurring scheduling, and professional client management.",
        features: [
            "Square-foot bid calculator for {city} commercial properties",
            "Multi-building client management",
            "Recurring schedule templates for nightly and weekly cleans",
            "Employee time tracking with GPS verification",
            "Professional PDF proposals with your branding",
            "Quality inspection checklists and photo verification",
        ],
        faqs: [
            {
                q: "How do I win more commercial cleaning contracts in {city}?",
                a: "xiriOS helps you win bids by generating accurate, professional proposals based on square footage and cleaning frequency. {city} property managers see a polished proposal instead of a handwritten estimate, which instantly builds trust.",
            },
            {
                q: "Can I manage multiple buildings across {city}?",
                a: "Absolutely. xiriOS is built for multi-site operations. Manage different schedules, crews, and checklists for each property across {city}.",
            },
            {
                q: "How much does commercial cleaning software cost?",
                a: "xiriOS starts free with unlimited bids. Paid plans begin at $39/mo for invoicing and CRM, with full operations plans at $79/mo — a fraction of what enterprises like CleanGuru charge.",
            },
        ],
        metaTitleTemplate: "Commercial Cleaning Software in {city}, {stateCode} | xiriOS",
        metaDescTemplate:
            "Win more commercial cleaning contracts in {city}. xiriOS offers bidding calculators, scheduling, timekeeping, and CRM for cleaning businesses. Start free.",
    },
    {
        slug: "office-cleaning",
        name: "Office Cleaning",
        h1Template: "Office Cleaning Software for {city}, {stateCode}",
        subtitle:
            "Bid, schedule, and manage office cleaning contracts across {city} with the all-in-one platform built for janitorial teams.",
        features: [
            "Office-specific bid calculator with per-sqft rates",
            "Recurring nightly/weekly/monthly scheduling",
            "Digital checklists for restrooms, lobbies, and common areas",
            "Photo-verified inspections for property managers",
            "Employee scheduling with route optimization",
            "Automated reminders and client communication",
        ],
        faqs: [
            {
                q: "How do I price office cleaning jobs in {city}?",
                a: "xiriOS calculates bids based on square footage, cleaning frequency, and the specific areas included (restrooms, lobbies, offices). You'll never underbid or overbid a {city} office contract again.",
            },
            {
                q: "Can I send inspection reports to my {city} clients?",
                a: "Yes. xiriOS includes digital checklists and photo-verified inspections that you can share directly with property managers to prove quality and retain contracts.",
            },
            {
                q: "How is xiriOS different from spreadsheets?",
                a: "Spreadsheets can't generate professional proposals, schedule recurring jobs, track employee GPS clock-ins, or manage client relationships. xiriOS does all of that in one place.",
            },
        ],
        metaTitleTemplate: "Office Cleaning Software in {city}, {stateCode} | xiriOS",
        metaDescTemplate:
            "Manage office cleaning contracts in {city} with xiriOS. Per-sqft bidding, recurring schedules, inspection checklists, and GPS timekeeping. Free to start.",
    },
    {
        slug: "building-maintenance",
        name: "Building Maintenance",
        h1Template: "Building Maintenance Software in {city}, {stateCode}",
        subtitle:
            "Manage building maintenance and janitorial operations across {city} properties with scheduling, work orders, and quality tracking.",
        features: [
            "Work order management for {city} properties",
            "Preventive maintenance scheduling",
            "Vendor and subcontractor coordination",
            "Asset tracking and maintenance history",
            "Quality inspection scoring and reporting",
            "Budget tracking and cost analysis",
        ],
        faqs: [
            {
                q: "Is xiriOS good for building maintenance in {city}?",
                a: "Yes. xiriOS handles both janitorial operations and building maintenance — scheduling preventive tasks, managing work orders, and tracking costs across all your {city} properties.",
            },
            {
                q: "Can I track maintenance costs per building?",
                a: "Absolutely. xiriOS tracks labor, materials, and vendor costs per property so you can see profitability at a glance and make data-driven decisions for your {city} portfolio.",
            },
            {
                q: "Do you support subcontractor management?",
                a: "Yes. You can assign work orders to subcontractors, track completion, and manage payments — all within the same platform you use for your in-house {city} crews.",
            },
        ],
        metaTitleTemplate: "Building Maintenance Software in {city}, {stateCode} | xiriOS",
        metaDescTemplate:
            "Manage building maintenance across {city} with xiriOS. Work orders, preventive scheduling, vendor coordination, and cost tracking. Start free.",
    },
    {
        slug: "cleaning-company",
        name: "Cleaning Company",
        h1Template: "Cleaning Company Software in {city}, {stateCode}",
        subtitle:
            "Grow your {city} cleaning company with the all-in-one platform for bidding, scheduling, timekeeping, CRM, and invoicing.",
        features: [
            "All-in-one platform to run your {city} cleaning company",
            "Bid calculator with local rate benchmarks",
            "Client CRM with full history and notes",
            "Employee scheduling and payroll-ready time tracking",
            "Professional branding on proposals and invoices",
            "Mobile app (PWA) for field teams",
        ],
        faqs: [
            {
                q: "What software do cleaning companies in {city} use?",
                a: "The best cleaning companies in {city} use xiriOS for bidding, scheduling, and client management. It replaces 4-5 separate tools with one affordable platform that starts free.",
            },
            {
                q: "How do I start a cleaning company in {city}?",
                a: "Start by signing up for xiriOS free — you'll get a bid calculator to price your first contracts, PDF proposals to look professional, and a CRM to manage your first clients in {city}.",
            },
            {
                q: "Can xiriOS handle multiple crews in {city}?",
                a: "Yes. As you grow from a solo operation to multiple crews, xiriOS scales with you — adding scheduling, GPS timekeeping, and quality inspections to keep your {city} operations running smoothly.",
            },
        ],
        metaTitleTemplate: "Cleaning Company Software in {city}, {stateCode} | xiriOS",
        metaDescTemplate:
            "Run your {city} cleaning company with xiriOS. Bidding, scheduling, CRM, timekeeping, and invoicing — all in one platform. Free to start.",
    },
    {
        slug: "janitorial-pricing",
        name: "Janitorial Pricing",
        h1Template: "Janitorial Pricing Guide for {city}, {stateCode}",
        subtitle:
            "How much should you charge for janitorial services in {city}? Use local wage data, ISSA production rates, and our free calculator to price {city} cleaning contracts accurately.",
        features: [
            "Average janitorial wage in {state}: $13–$19/hour depending on market and experience",
            "Office cleaning in {city} typically runs $0.05–$0.25 per square foot per visit",
            "Medical facilities in {city} command 30–40% premium over standard office rates",
            "Use ISSA 612 production rates calibrated for {city} building types",
            "Factor in {state} payroll taxes, workers' comp, and insurance requirements",
            "Free bid calculator with {city}-specific wage pre-fills",
        ],
        faqs: [
            {
                q: "How much do janitorial companies charge per square foot in {city}?",
                a: "In {city}, {stateCode}, janitorial pricing typically ranges from $0.05–$0.15/sqft for basic office cleaning (3–5x/week) to $0.20–$0.35/sqft for medical or specialty facilities. Rates vary based on building type, cleaning frequency, and scope of work. Use our free calculator for an instant estimate.",
            },
            {
                q: "What is the average janitorial service wage in {city}, {stateCode}?",
                a: "Janitorial workers in {city} earn between $13–$19/hour on average, depending on experience and facility type. Your fully-loaded labor cost (with payroll taxes, workers' comp, and benefits) is typically 15–25% higher than the base wage. Our calculator accounts for {state}-specific payroll burden.",
            },
            {
                q: "How do I calculate a janitorial bid for a building in {city}?",
                a: "Use the square footage method: (1) Determine the building's cleanable area, (2) Apply the ISSA production rate for the building type, (3) Calculate labor hours × your {city} labor rate, (4) Add overhead (8–15%) and profit margin (10–20%). Our free calculator automates this entire process.",
            },
            {
                q: "Should I price differently for {city} vs other {state} cities?",
                a: "Yes — labor costs, competition density, and commercial real estate markets vary within {state}. {city} may have different wage expectations and cost-of-living factors than other {state} markets. Always research local rates and use market-appropriate pricing.",
            },
        ],
        metaTitleTemplate:
            "Janitorial Pricing in {city}, {stateCode} — Rates, Calculator & Guide | xiriOS",
        metaDescTemplate:
            "How much to charge for janitorial services in {city}, {stateCode}? Local pricing guide with wage data, per-sqft rates, and a free bid calculator. Price your next cleaning contract accurately.",
    },
];

/** Replace {city}, {state}, {stateCode} placeholders in a template */
export function fillTemplate(
    template: string,
    vars: { city: string; state: string; stateCode: string }
): string {
    return template
        .replace(/\{city\}/g, vars.city)
        .replace(/\{state\}/g, vars.state)
        .replace(/\{stateCode\}/g, vars.stateCode);
}

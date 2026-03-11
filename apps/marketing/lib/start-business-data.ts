/**
 * Data for "Start a Cleaning Business" pSEO pages
 *
 * Uses BLS wage data from market-data.ts & state data (janitorial companies,
 * min wage) to create city-specific startup guides.
 */

export interface StartupStep {
    title: string;      // template string with {city}, {state}, {stateCode}
    body: string;       // template string
    icon: string;       // emoji
}

export interface StartupFaq {
    q: string;
    a: string;
}

export const STARTUP_STEPS: StartupStep[] = [
    {
        icon: "📋",
        title: "Research the {city} cleaning market",
        body: "Before you invest a dollar, understand the competitive landscape. According to Census Bureau data, {state} has **{janitorialCompanies} registered janitorial companies** — that sounds like a lot, but the market is massive. The Bureau of Labor Statistics reports the median janitor wage in the {city} metro at **${medianWage}/hr**, which tells you exactly what you'll pay employees (and what competitors are paying).",
    },
    {
        icon: "📝",
        title: "Register your business in {state}",
        body: "File an LLC or sole proprietorship through your {state} Secretary of State. An LLC costs $50–$500 depending on the state and protects your personal assets. You'll also need an EIN from the IRS (free) and a {state} business license. Most {city} cleaners start as an LLC — it takes 1–2 weeks and can be done online.",
    },
    {
        icon: "🛡️",
        title: "Get insurance and bonding",
        body: "You need **General Liability Insurance** ($500–$1,200/year for a new cleaning company), **Workers' Compensation** (required in most states once you hire — NCCI class code 9014 averages 3.7% of payroll), and optionally a **Surety Bond** for commercial contracts. Many {city} property managers won't consider your bid without proof of insurance.",
    },
    {
        icon: "💰",
        title: "Set your pricing using data",
        body: "Don't guess at pricing — calculate it. The BLS median janitor wage in {city} is **${medianWage}/hr**. Your fully-loaded labor cost (with FICA at 7.65%, SUTA, workers' comp) is roughly **${loadedWage}/hr**. Apply ISSA production rates to calculate how long each building takes, then add overhead (8–15%) and profit (10–20%). This is exactly what the xiriOS calculator does automatically.",
    },
    {
        icon: "🧹",
        title: "Buy essential equipment",
        body: "A residential cleaning startup needs $500–$1,500 in supplies. A commercial janitorial operation needs $2,000–$5,000. Core equipment: commercial vacuum ($200–$400), mop and bucket system ($50–$100), cleaning chemicals ($100–$200), microfiber cloths and dusters ($50), personal protective equipment ($30–$50), and a vehicle for transport. Start lean — upgrade as revenue comes in.",
    },
    {
        icon: "🏢",
        title: "Find your first {city} clients",
        body: "Your first 3 clients define your trajectory. Start with: **property managers** (search \"{city} commercial property management\" — there are {officeProperties}+ office properties in your metro), **small offices** (dentists, law firms, real estate offices), and **referrals** from your network. Show up with a professional proposal — not a handwritten quote — and you'll stand out immediately.",
    },
    {
        icon: "📊",
        title: "Bid your first job professionally",
        body: "Walk the building, measure the square footage, count the restrooms and common areas. Use production rates to estimate labor hours. Multiply by your loaded labor rate, add overhead and profit. Present a branded PDF proposal — not a text message or scribbled estimate. Our free calculator handles the math and creates the proposal automatically.",
    },
    {
        icon: "📈",
        title: "Scale from solo to a team",
        body: "Once you're cleaning 5+ accounts, you'll need help. Hire at or slightly above the {city} median ($${medianWage}/hr) to attract reliable workers. Remember: the {state} minimum wage is **${minWage}/hr** — paying $1–2 above market reduces turnover dramatically. Use scheduling software to manage routes, and bid new contracts knowing your true employee cost.",
    },
];

export const STARTUP_FAQS: StartupFaq[] = [
    {
        q: "How much does it cost to start a cleaning business in {city}, {stateCode}?",
        a: "A {city} cleaning business can be started for as little as $2,000–$5,000 for a residential operation, or $5,000–$10,000 for commercial janitorial. The main costs are LLC registration ($50–$500), insurance ($500–$1,200/year), equipment ($500–$5,000), and marketing ($200–$500). {state}'s minimum wage is ${minWage}/hr — factor this into labor planning.",
    },
    {
        q: "Do I need a license to start a cleaning business in {state}?",
        a: "Most states don't require a specific cleaning license, but you do need a general business license and an EIN. Some {city} municipalities require a local business permit. You'll also need General Liability Insurance and Workers' Comp insurance once you hire employees. Check {state} Secretary of State and {city} city hall for requirements.",
    },
    {
        q: "How much can I charge for cleaning in {city}?",
        a: "Cleaning rates in {city} are driven by labor costs. With the median janitor wage at ${medianWage}/hr (BLS data), typical office cleaning bids range from $0.05–$0.25 per square foot per visit. A 10,000 sqft office cleaned 5x/week runs roughly $2,500–$5,000/month in the {city} market. Use our free calculator for an exact estimate.",
    },
    {
        q: "Is starting a cleaning business in {city} worth it?",
        a: "Yes — the cleaning industry averages 10–28% profit margins and has low startup costs compared to other businesses. {state} has {janitorialCompanies} registered janitorial companies, which indicates strong demand. Low barriers to entry, recurring revenue, and the ability to start solo make cleaning one of the most accessible businesses to launch in {city}.",
    },
    {
        q: "How do I get my first cleaning clients in {city}?",
        a: "Start with Google Business Profile (free), local Facebook groups, and direct outreach to {city} property managers. There are {officeProperties}+ office properties, {medicalFacilities}+ medical facilities, and {schools}+ schools in the {city} metro — all need contract cleaning. Lead with a professional proposal powered by data-backed pricing to stand out.",
    },
];

export const META_TITLE_TEMPLATE =
    "How to Start a Cleaning Business in {city}, {stateCode} (2026 Guide) | xiriOS";

export const META_DESC_TEMPLATE =
    "Step-by-step guide to starting a cleaning business in {city}, {stateCode}. Local market data, pricing (BLS: ${medianWage}/hr), licensing, equipment costs, and free tools. {janitorialCompanies} janitorial companies in {state}.";

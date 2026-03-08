// ============================================================
// Blog Post Data — SEO-targeted articles for janitorial keywords
// ============================================================

export interface BlogSection {
    heading: string;
    body: string;
    cta?: { text: string; href: string };
}

export interface BlogPost {
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    publishedAt: string;
    updatedAt: string;
    readTime: string;
    category: string;
    excerpt: string;
    sections: BlogSection[];
    keywords: string[];
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "how-to-price-janitorial-cleaning",
        title: "How to Price Janitorial Cleaning Services in 2026",
        metaTitle: "How to Price Janitorial Cleaning — Complete Guide 2026 | xiriOS",
        metaDescription:
            "Learn how to price janitorial cleaning contracts using square footage, production rates, and profit margins. Free calculator included.",
        publishedAt: "2026-03-01",
        updatedAt: "2026-03-08",
        readTime: "8 min read",
        category: "Pricing",
        excerpt:
            "Pricing janitorial work is the make-or-break skill for cleaning businesses. Too low and you bleed money; too high and you lose the contract. Here's the data-driven approach used by top cleaning companies.",
        keywords: [
            "how to price janitorial cleaning",
            "janitorial cleaning pricing",
            "cleaning service pricing guide",
            "how to bid janitorial jobs",
            "janitorial pricing per square foot",
        ],
        sections: [
            {
                heading: "Why Most Cleaning Companies Get Pricing Wrong",
                body: "According to ISSA industry data, nearly 40% of cleaning businesses underbid their first year of contracts. The root cause? Guessing instead of calculating. Most new janitorial businesses price based on what competitors charge or what \"feels right\" — rather than using production rates, labor costs, and overhead percentages to arrive at a defensible number.\n\nThe consequences of wrong pricing compound quickly: a $500/month underbid on a 10,000 sqft office means $6,000 lost per year in profit. Multiply that across 5–10 contracts and you're looking at tens of thousands in lost revenue.",
            },
            {
                heading: "The Square Footage Method: Industry Standard",
                body: "The most reliable pricing method for janitorial contracts is the square footage method. Here's how it works:\n\n**1. Determine production rate**: This is how many square feet one cleaner can service per hour. The ISSA 612 Cleaning Times standard provides benchmarks: general office space is roughly 4,200 sqft/hour, while medical facilities average 2,200 sqft/hour due to higher complexity.\n\n**2. Calculate labor hours**: Divide the total cleanable area by the production rate. A 10,000 sqft office at 4,200 sqft/hour = 2.38 hours per cleaning visit.\n\n**3. Factor in frequency**: A 5x/week contract means roughly 20 visits per month, so 2.38 × 20 = 47.6 labor hours per month.\n\n**4. Apply costs**: Multiply hours by your fully-loaded labor rate (wage + payroll taxes + workers' comp), then add overhead (supplies, equipment, insurance) and your profit margin.\n\nThis method removes emotion from pricing and gives you a number you can defend to any client.",
            },
            {
                heading: "Production Rates by Building Type",
                body: "Not all buildings are created equal. Here are approximate ISSA production rates (sqft/hour) by building type:\n\n• **Office Building** — 3,500–5,000 sqft/hr\n• **Medical / Clinic** — 1,800–2,500 sqft/hr\n• **School / University** — 3,200–4,500 sqft/hr\n• **Retail / Storefront** — 4,000–5,500 sqft/hr\n• **Restaurant** — 2,500–3,200 sqft/hr\n• **Warehouse / Industrial** — 5,000–7,000 sqft/hr\n• **Church / Worship** — 3,500–4,500 sqft/hr\n• **Residential Home** — 1,500–2,500 sqft/hr\n\nMedical and restaurant facilities have lower production rates due to specialized cleaning requirements (infection control, grease removal). Warehouses are high because they're mostly open floor space.",
            },
            {
                heading: "Building Your Cost Stack",
                body: "A profitable cleaning bid includes four cost layers:\n\n**Labor Cost**: Base wage × hours. The national median janitor wage is $15–18/hour, but varies significantly by state. California averages $17.50, while Mississippi averages $12.50.\n\n**Payroll Burden**: Social Security (6.2%), Medicare (1.45%), FUTA, SUTA, and workers' compensation typically add 12–20% on top of the base wage.\n\n**Overhead**: Insurance, supplies, equipment depreciation, vehicle costs, uniforms, and administrative time. A typical overhead rate is 8–15% of total revenue.\n\n**Profit Margin**: What you actually take home. Industry standard is 10–20%. Below 10% leaves no room for error; above 20% risks losing bids to competitors.",
            },
            {
                heading: "Common Pricing Mistakes",
                body: "**Forgetting restroom time**: Restrooms take 3–5× longer per square foot than general areas. A 10,000 sqft office with 6 restrooms adds 30–50 minutes per visit.\n\n**Ignoring frequency impact**: A 3x/week customer paying $3,000/month is very different from a 5x/week customer paying $3,000/month. Always price per-visit, then multiply.\n\n**Not accounting for carpet vs. hard floor**: Vacuuming carpet takes roughly 2× longer than mopping hard floor. Building type matters — offices are 60–70% carpet, restaurants are 95% hard floor.\n\n**Skipping the walk-through**: Never bid a job you haven't walked. Photos miss details like floor condition, fixture count, and obstruction density.",
            },
            {
                heading: "Use a Calculator to Price Your Next Bid",
                body: "The fastest way to get an accurate janitorial bid is to use a purpose-built calculator that factors in building type, square footage, cleaning frequency, labor rates, and overhead — automatically.\n\nxiriOS offers a free janitorial bid calculator that uses ISSA production rates and lets you customize every variable. No sign-up required.",
                cta: { text: "Try the Free Calculator →", href: "/calculator" },
            },
        ],
    },
    {
        slug: "free-janitorial-bid-calculator",
        title: "Free Janitorial Bid Calculator: Price Any Cleaning Job in Minutes",
        metaTitle: "Free Janitorial Bid Calculator — Price Cleaning Jobs Fast | xiriOS",
        metaDescription:
            "Use our free janitorial bid calculator to price any cleaning contract based on square footage, building type, and frequency. No sign-up required.",
        publishedAt: "2026-03-03",
        updatedAt: "2026-03-08",
        readTime: "5 min read",
        category: "Tools",
        excerpt:
            "Stop guessing on cleaning bids. Our free janitorial calculator prices any job based on square footage, building type, frequency, and your costs — using real ISSA production rate data.",
        keywords: [
            "free janitorial calculator",
            "janitorial bid calculator",
            "cleaning bid calculator",
            "free cleaning estimate calculator",
            "janitorial estimate calculator",
        ],
        sections: [
            {
                heading: "Why Use a Janitorial Bid Calculator?",
                body: "The difference between a profitable cleaning company and one that bleeds money usually comes down to one thing: accurate bidding. A janitorial bid calculator takes the guesswork out of pricing by using standardized production rates, labor cost models, and overhead calculations.\n\nInstead of looking at a building and thinking \"that looks like a $2,000/month job,\" a calculator gives you the exact math: square footage ÷ production rate = labor hours × cost rate + overhead + profit = your price.\n\nThe result? Bids that protect your margins while remaining competitive enough to win contracts.",
            },
            {
                heading: "What Our Free Calculator Includes",
                body: "The xiriOS bid calculator is built on ISSA 612 Cleaning Times production rates — the same data used by the largest facility management companies. Here's what's included:\n\n• **15 building types** — from offices and medical clinics to warehouses, schools, restaurants, and residential homes. Each has a calibrated production rate.\n\n• **Room-by-room scope** — break down a building into rooms (lobby, restrooms, offices, hallways) with individual square footage and task selection.\n\n• **Task-level control** — toggle individual cleaning tasks (vacuuming, mopping, restroom sanitation, high dusting, window tracks) per room.\n\n• **Financial inputs** — set your wage rate, payroll tax %, overhead %, profit %, and supply costs. The calculator handles all the math.\n\n• **Price range output** — get a ±20% price band so you can adjust for market conditions, building condition, or client relationship.\n\n• **No sign-up required** — the calculator works immediately, no account needed.",
                cta: { text: "Try the Free Calculator Now →", href: "/calculator" },
            },
            {
                heading: "How Accurate Is It?",
                body: "Our calculator uses the same ISSA production rates referenced in the Building Service Contractor trade standard. We calibrate for:\n\n• **Building complexity** — medical and restaurant facilities get a 1.3–1.4× multiplier to account for specialized cleaning.\n\n• **Floor type mix** — each building type has a default carpet vs. hard floor percentage that affects time estimates.\n\n• **Restroom fixtures** — the calculator estimates toilet, urinal, and sink counts per 10,000 sqft by building type. Each fixture adds specific cleaning time.\n\n• **State-based wage data** — input your state and we'll pre-fill the median janitor wage and typical payroll tax rate from BLS data.\n\nThe result is typically within 5–10% of what an experienced estimator would bid after a full walkthrough.",
            },
            {
                heading: "From Calculator to Signed Contract",
                body: "Once you have a price, you need a professional proposal to win the job. xiriOS turns calculator results into a polished PDF proposal with:\n\n• Your company branding and logo\n• Detailed scope of work (rooms, tasks, frequencies)\n• Month-by-month pricing breakdown\n• Payment terms and conditions\n\nSign up for a free account to save your calculator results as bids and generate proposals automatically.",
                cta: { text: "Start Free Trial — Save Your Bids →", href: "/app/login?mode=signup" },
            },
        ],
    },
    {
        slug: "best-janitorial-bidding-software",
        title: "Best Janitorial Bidding Software for Small Cleaning Businesses (2026)",
        metaTitle: "Best Janitorial Bidding Software 2026 — Reviews & Comparison | xiriOS",
        metaDescription:
            "Compare the best janitorial bidding software for small cleaning businesses. Features, pricing, and reviews for xiriOS, CleanGuru, Swept, Jobber, and more.",
        publishedAt: "2026-03-05",
        updatedAt: "2026-03-08",
        readTime: "10 min read",
        category: "Software",
        excerpt:
            "Finding the right bidding software can save your cleaning company thousands per year and help you win more contracts. Here's an honest comparison of the top platforms in 2026.",
        keywords: [
            "janitorial bidding software",
            "cleaning business software",
            "best janitorial software",
            "janitorial management software",
            "cleaning company bidding tool",
        ],
        sections: [
            {
                heading: "What to Look for in Janitorial Bidding Software",
                body: "Not all bidding tools are created equal. For a janitorial business, you need software that understands cleaning-specific workflows. Here's what separates good from great:\n\n**Square-footage-based calculations** — Generic field service tools let you create estimates, but they don't use ISSA production rates or understand the difference between cleaning an office vs. a medical clinic.\n\n**Room-by-room scope** — The ability to break a building into zones with different tasks and frequencies is essential for accurate bids.\n\n**PDF proposal generation** — Professional proposals win contracts. You need branded templates that look polished, not generic invoices.\n\n**CRM integration** — Tracking which clients got which bids, follow-up reminders, and conversion rates helps you refine your pipeline.\n\n**Affordable pricing** — Many platforms charge $79–$200+/month. For a small cleaning company doing $150K–$500K in revenue, that eats into margins fast.",
            },
            {
                heading: "xiriOS — Purpose-Built for Janitorial Bidding",
                body: "xiriOS was built from the ground up for janitorial and cleaning businesses. The bid calculator uses ISSA production rates, supports 15 building types, and generates room-by-room scope documents.\n\n**Pricing**: Free plan (unlimited calculator, 3 saved bids). Bid Plus at $29/month for unlimited bids, proposals, and CRM.\n\n**Strengths**: Industry-specific bidding, affordable pricing, modern interface, task-level scope control, state-based wage data.\n\n**Best for**: Solo cleaners and small teams (1–10 employees) who want professional bidding without enterprise pricing.",
                cta: { text: "Try xiriOS Free →", href: "/app/login?mode=signup" },
            },
            {
                heading: "CleanGuru — The Established Player",
                body: "CleanGuru has been in the janitorial software space for years and offers a comprehensive platform including bidding, scheduling, and invoicing.\n\n**Pricing**: $79–$159/month depending on features.\n\n**Strengths**: Well-known brand, coaching add-on, workloading tools.\n\n**Weaknesses**: Dated interface, expensive for small businesses, no GPS geofencing, limited mobile experience.\n\n**Best for**: Mid-size companies (10–50 employees) who want an established brand and don't mind the higher price tag.",
            },
            {
                heading: "Swept — Operations-Focused, No Bidding",
                body: "Swept excels at scheduling, time tracking, and team communication for cleaning crews. But it has a major blind spot: zero bidding or proposal features at any price tier.\n\n**Pricing**: $24–$180/month per location.\n\n**Strengths**: GPS time clocks, 100+ language translation, task management.\n\n**Weaknesses**: No bidding or estimates at any tier, no invoicing, no CRM. Per-location pricing adds up fast for multi-site operations.\n\n**Best for**: Teams that already have their bidding figured out and need operational tools.",
            },
            {
                heading: "Jobber — Generic Field Service",
                body: "Jobber is a popular field service management platform used across plumbing, HVAC, landscaping, and cleaning. It's polished but not purpose-built for janitorial.\n\n**Pricing**: $39–$199/month.\n\n**Strengths**: Beautiful interface, strong QuickBooks integration, good mobile app.\n\n**Weaknesses**: No cleaning-specific bid calculator, no ISSA production rates, no inspection workflows, expensive at scale.\n\n**Best for**: Cleaning companies that also do other field services and want a general-purpose tool.",
            },
            {
                heading: "The Bottom Line",
                body: "For small janitorial businesses, the choice comes down to what you need most:\n\n• **Just bidding?** → xiriOS (free) or CleanGuru ($79+/mo)\n• **Just operations?** → Swept ($24+/mo per location)\n• **General field service?** → Jobber ($39+/mo)\n• **All-in-one at the best price?** → xiriOS ($29/mo for Bid Plus)\n\nThe best approach: start with xiriOS's free calculator to price your next job. If you like how it works, upgrade to save bids and generate proposals.",
                cta: { text: "Start With the Free Calculator →", href: "/calculator" },
            },
        ],
    },
];

export function getPost(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPostSlugs(): string[] {
    return BLOG_POSTS.map((p) => p.slug);
}

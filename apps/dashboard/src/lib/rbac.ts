/* ─── Subscription Tiers ─── */
export type Tier = "bid" | "bid_plus" | "grow" | "pro" | "business";

/* ─── Feature Identifiers ─── */
export type Feature =
    | "bids"
    | "proposals"
    | "pdf_proposals"
    | "crm"
    | "custom_tasks"
    | "task_frequency_overrides"
    | "invoicing"
    | "email_campaigns"
    | "quickbooks"
    | "scheduling"
    | "timekeeping"
    | "checklists"
    | "inspections"
    | "client_portal"
    | "job_costing";

/* ─── Feature Matrix ─── */
const TIER_FEATURES: Record<Tier, Feature[]> = {
    bid: ["bids", "proposals", "pdf_proposals", "crm"],
    bid_plus: ["bids", "proposals", "pdf_proposals", "crm", "custom_tasks", "task_frequency_overrides", "email_campaigns"],
    grow: ["bids", "proposals", "pdf_proposals", "crm", "custom_tasks", "task_frequency_overrides", "invoicing", "email_campaigns", "quickbooks"],
    pro: [
        "bids", "proposals", "pdf_proposals", "crm",
        "custom_tasks", "task_frequency_overrides",
        "invoicing", "email_campaigns", "quickbooks",
        "scheduling", "timekeeping", "checklists",
    ],
    business: [
        "bids", "proposals", "pdf_proposals", "crm",
        "custom_tasks", "task_frequency_overrides",
        "invoicing", "email_campaigns", "quickbooks",
        "scheduling", "timekeeping", "checklists",
        "inspections", "client_portal", "job_costing",
    ],
};

/* ─── Tier Limits ─── */
export interface TierLimits {
    contacts: number;  // -1 = unlimited
    users: number;     // -1 = unlimited
    bids: number;      // -1 = unlimited
}

const TIER_LIMITS: Record<Tier, TierLimits> = {
    bid: { contacts: 5, users: 1, bids: 3 },
    bid_plus: { contacts: -1, users: 1, bids: -1 },
    grow: { contacts: -1, users: 3, bids: -1 },
    pro: { contacts: -1, users: 10, bids: -1 },
    business: { contacts: -1, users: 25, bids: -1 },
};

/* ─── Tier Display Info ─── */
export const TIER_INFO: Record<Tier, { name: string; price: string; color: string }> = {
    bid: { name: "Bid", price: "Free", color: "#8b92b3" },
    bid_plus: { name: "Bid Plus", price: "$9/mo", color: "#3b82f6" },
    grow: { name: "Grow", price: "$39/mo", color: "#00d4aa" },
    pro: { name: "Pro", price: "$79/mo", color: "#6366f1" },
    business: { name: "Business", price: "$119/mo", color: "#f59e0b" },
};

/* ─── Helper Functions ─── */

/** Check if a tier includes a feature */
export function hasFeature(tier: Tier, feature: Feature): boolean {
    return TIER_FEATURES[tier].includes(feature);
}

/** Get the limits for a tier */
export function getLimits(tier: Tier): TierLimits {
    return TIER_LIMITS[tier];
}

/** Check if a numeric limit is exceeded */
export function isOverLimit(tier: Tier, limitKey: keyof TierLimits, current: number): boolean {
    const limit = TIER_LIMITS[tier][limitKey];
    if (limit === -1) return false; // unlimited
    return current >= limit;
}

/** Get the minimum tier required for a feature */
export function requiredTier(feature: Feature): Tier {
    const tiers: Tier[] = ["bid", "bid_plus", "grow", "pro", "business"];
    for (const t of tiers) {
        if (TIER_FEATURES[t].includes(feature)) return t;
    }
    return "business";
}

/** Get the upgrade tier (next tier up from current) */
export function getUpgradeTier(currentTier: Tier): Tier | null {
    const order: Tier[] = ["bid", "bid_plus", "grow", "pro", "business"];
    const idx = order.indexOf(currentTier);
    if (idx < order.length - 1) return order[idx + 1];
    return null;
}

/** Get all features for a tier */
export function getTierFeatures(tier: Tier): Feature[] {
    return [...TIER_FEATURES[tier]];
}

/* ─── Feature Display Metadata ─── */
export const FEATURE_META: Record<Feature, { label: string; description: string; icon: string }> = {
    bids: { label: "Bids", description: "Create accurate cleaning bids", icon: "clipboard" },
    proposals: { label: "Proposals", description: "Generate professional proposals", icon: "file-text" },
    pdf_proposals: { label: "PDF Proposals", description: "Export proposals as branded PDFs", icon: "file" },
    crm: { label: "CRM", description: "Manage contacts and client relationships", icon: "users" },
    custom_tasks: { label: "Custom Tasks", description: "Add custom cleaning tasks to your scope", icon: "plus-square" },
    task_frequency_overrides: { label: "Task Frequencies", description: "Set custom frequencies per task", icon: "repeat" },
    invoicing: { label: "Invoicing", description: "Send and track invoices", icon: "credit-card" },
    email_campaigns: { label: "Email Campaigns", description: "Send marketing and follow-up emails", icon: "mail" },
    quickbooks: { label: "QuickBooks", description: "Sync with QuickBooks Online", icon: "bar-chart" },
    scheduling: { label: "Scheduling", description: "Schedule recurring cleaning jobs", icon: "calendar" },
    timekeeping: { label: "Timekeeping", description: "Track time with GPS geofence", icon: "clock" },
    checklists: { label: "Checklists", description: "Create and assign cleaning checklists", icon: "check-square" },
    inspections: { label: "Inspections", description: "Quality inspection scoring and reports", icon: "search" },
    client_portal: { label: "Client Portal", description: "Self-service portal for your clients", icon: "globe" },
    job_costing: { label: "Job Costing", description: "Track costs and profitability per job", icon: "trending-up" },
};

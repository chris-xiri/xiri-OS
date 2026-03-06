// ============================================================
// xiriOS Bid Calculator Engine
// Production rates based on ISSA 612 standards and industry data
// ============================================================

export interface BuildingType {
    id: string;
    name: string;
    icon: string;
    /** Sqft cleaned per hour — varies by building type */
    productionRate: number;
    /** Default floor mix: percentage that is carpet vs hard floor */
    carpetPercent: number;
    /** Multiplier for specialty cleaning needs (medical = higher) */
    complexityMultiplier: number;
    /** Whether this is a "popular" (high-usage) type or "advanced" */
    popular: boolean;
    /** Default restroom fixture count per 10k sqft */
    fixturesPer10k: { toilets: number; urinals: number; sinks: number };
}

export const BUILDING_TYPES: BuildingType[] = [
    // --- Popular / High-Usage ---
    {
        id: "office",
        name: "Office Building",
        icon: "🏢",
        productionRate: 4200,
        carpetPercent: 65,
        complexityMultiplier: 1.0,
        popular: true,
        fixturesPer10k: { toilets: 6, urinals: 2, sinks: 6 },
    },
    {
        id: "medical",
        name: "Medical / Clinic",
        icon: "🏥",
        productionRate: 2200,
        carpetPercent: 20,
        complexityMultiplier: 1.4,
        popular: true,
        fixturesPer10k: { toilets: 4, urinals: 1, sinks: 6 },
    },
    {
        id: "school",
        name: "School / University",
        icon: "🏫",
        productionRate: 3800,
        carpetPercent: 30,
        complexityMultiplier: 1.1,
        popular: true,
        fixturesPer10k: { toilets: 10, urinals: 4, sinks: 8 },
    },
    {
        id: "retail",
        name: "Retail / Storefront",
        icon: "🏬",
        productionRate: 4500,
        carpetPercent: 25,
        complexityMultiplier: 0.9,
        popular: true,
        fixturesPer10k: { toilets: 3, urinals: 1, sinks: 3 },
    },
    {
        id: "restaurant",
        name: "Restaurant / Food Service",
        icon: "🍽️",
        productionRate: 2800,
        carpetPercent: 5,
        complexityMultiplier: 1.3,
        popular: true,
        fixturesPer10k: { toilets: 4, urinals: 1, sinks: 4 },
    },
    {
        id: "warehouse",
        name: "Warehouse / Industrial",
        icon: "🏭",
        productionRate: 6000,
        carpetPercent: 5,
        complexityMultiplier: 0.8,
        popular: true,
        fixturesPer10k: { toilets: 2, urinals: 1, sinks: 2 },
    },
    // --- Advanced / Less Common ---
    {
        id: "church",
        name: "Church / Worship",
        icon: "⛪",
        productionRate: 4000,
        carpetPercent: 70,
        complexityMultiplier: 0.95,
        popular: false,
        fixturesPer10k: { toilets: 4, urinals: 2, sinks: 4 },
    },
    {
        id: "gym",
        name: "Gym / Health Club",
        icon: "🏋️",
        productionRate: 3200,
        carpetPercent: 15,
        complexityMultiplier: 1.15,
        popular: false,
        fixturesPer10k: { toilets: 6, urinals: 2, sinks: 6 },
    },
    {
        id: "bank",
        name: "Bank / Financial",
        icon: "🏦",
        productionRate: 4500,
        carpetPercent: 70,
        complexityMultiplier: 1.0,
        popular: false,
        fixturesPer10k: { toilets: 3, urinals: 1, sinks: 3 },
    },
    {
        id: "daycare",
        name: "Daycare / Childcare",
        icon: "👶",
        productionRate: 2500,
        carpetPercent: 40,
        complexityMultiplier: 1.35,
        popular: false,
        fixturesPer10k: { toilets: 8, urinals: 0, sinks: 6 },
    },
    {
        id: "hotel",
        name: "Hotel / Hospitality",
        icon: "🏨",
        productionRate: 3000,
        carpetPercent: 55,
        complexityMultiplier: 1.2,
        popular: false,
        fixturesPer10k: { toilets: 8, urinals: 2, sinks: 8 },
    },
    {
        id: "auto-dealer",
        name: "Auto Dealership",
        icon: "🚗",
        productionRate: 4800,
        carpetPercent: 35,
        complexityMultiplier: 0.9,
        popular: false,
        fixturesPer10k: { toilets: 3, urinals: 1, sinks: 3 },
    },
    {
        id: "salon",
        name: "Salon / Spa",
        icon: "💇",
        productionRate: 3000,
        carpetPercent: 20,
        complexityMultiplier: 1.1,
        popular: false,
        fixturesPer10k: { toilets: 3, urinals: 0, sinks: 5 },
    },
    {
        id: "movie-theater",
        name: "Movie Theater",
        icon: "🎬",
        productionRate: 3500,
        carpetPercent: 80,
        complexityMultiplier: 1.05,
        popular: false,
        fixturesPer10k: { toilets: 6, urinals: 3, sinks: 6 },
    },
];

export type Frequency = "1" | "2" | "3" | "5" | "7";

export const FREQUENCIES: { value: Frequency; label: string }[] = [
    { value: "1", label: "1x per week" },
    { value: "2", label: "2x per week" },
    { value: "3", label: "3x per week" },
    { value: "5", label: "5x per week (weekdays)" },
    { value: "7", label: "7x per week (daily)" },
];

// ============================================================
// State-Based Recommended Rates
// Janitor wage data from BLS (median hourly, 2024), payroll tax
// estimates include avg SUTA + FUTA + FICA + WC by state
// ============================================================

export interface StateData {
    code: string;
    name: string;
    /** Recommended hourly wage for janitors/cleaners */
    recommendedWage: number;
    /** Estimated total payroll tax burden % */
    payrollTaxPercent: number;
    /** Supply cost multiplier (1.0 = national avg) */
    supplyCostMultiplier: number;
}

export const STATES: StateData[] = [
    { code: "AL", name: "Alabama", recommendedWage: 13.50, payrollTaxPercent: 13.5, supplyCostMultiplier: 0.90 },
    { code: "AK", name: "Alaska", recommendedWage: 17.00, payrollTaxPercent: 15.5, supplyCostMultiplier: 1.25 },
    { code: "AZ", name: "Arizona", recommendedWage: 15.50, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.98 },
    { code: "AR", name: "Arkansas", recommendedWage: 13.00, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.88 },
    { code: "CA", name: "California", recommendedWage: 18.50, payrollTaxPercent: 16.5, supplyCostMultiplier: 1.20 },
    { code: "CO", name: "Colorado", recommendedWage: 17.00, payrollTaxPercent: 14.5, supplyCostMultiplier: 1.08 },
    { code: "CT", name: "Connecticut", recommendedWage: 17.50, payrollTaxPercent: 15.5, supplyCostMultiplier: 1.15 },
    { code: "DE", name: "Delaware", recommendedWage: 15.00, payrollTaxPercent: 14.5, supplyCostMultiplier: 1.02 },
    { code: "DC", name: "Washington D.C.", recommendedWage: 19.00, payrollTaxPercent: 16.0, supplyCostMultiplier: 1.25 },
    { code: "FL", name: "Florida", recommendedWage: 15.00, payrollTaxPercent: 13.0, supplyCostMultiplier: 1.00 },
    { code: "GA", name: "Georgia", recommendedWage: 14.00, payrollTaxPercent: 13.5, supplyCostMultiplier: 0.95 },
    { code: "HI", name: "Hawaii", recommendedWage: 17.50, payrollTaxPercent: 16.0, supplyCostMultiplier: 1.30 },
    { code: "ID", name: "Idaho", recommendedWage: 14.50, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.92 },
    { code: "IL", name: "Illinois", recommendedWage: 16.50, payrollTaxPercent: 15.5, supplyCostMultiplier: 1.05 },
    { code: "IN", name: "Indiana", recommendedWage: 14.50, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.92 },
    { code: "IA", name: "Iowa", recommendedWage: 14.00, payrollTaxPercent: 14.5, supplyCostMultiplier: 0.90 },
    { code: "KS", name: "Kansas", recommendedWage: 14.00, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.90 },
    { code: "KY", name: "Kentucky", recommendedWage: 13.50, payrollTaxPercent: 14.5, supplyCostMultiplier: 0.88 },
    { code: "LA", name: "Louisiana", recommendedWage: 13.00, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.90 },
    { code: "ME", name: "Maine", recommendedWage: 15.50, payrollTaxPercent: 15.0, supplyCostMultiplier: 1.02 },
    { code: "MD", name: "Maryland", recommendedWage: 16.50, payrollTaxPercent: 15.0, supplyCostMultiplier: 1.10 },
    { code: "MA", name: "Massachusetts", recommendedWage: 18.00, payrollTaxPercent: 16.0, supplyCostMultiplier: 1.18 },
    { code: "MI", name: "Michigan", recommendedWage: 15.00, payrollTaxPercent: 15.0, supplyCostMultiplier: 0.95 },
    { code: "MN", name: "Minnesota", recommendedWage: 16.00, payrollTaxPercent: 15.5, supplyCostMultiplier: 1.02 },
    { code: "MS", name: "Mississippi", recommendedWage: 12.50, payrollTaxPercent: 13.5, supplyCostMultiplier: 0.85 },
    { code: "MO", name: "Missouri", recommendedWage: 14.50, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.92 },
    { code: "MT", name: "Montana", recommendedWage: 14.50, payrollTaxPercent: 14.5, supplyCostMultiplier: 0.95 },
    { code: "NE", name: "Nebraska", recommendedWage: 14.50, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.90 },
    { code: "NV", name: "Nevada", recommendedWage: 15.50, payrollTaxPercent: 14.0, supplyCostMultiplier: 1.02 },
    { code: "NH", name: "New Hampshire", recommendedWage: 15.50, payrollTaxPercent: 14.5, supplyCostMultiplier: 1.05 },
    { code: "NJ", name: "New Jersey", recommendedWage: 17.00, payrollTaxPercent: 16.0, supplyCostMultiplier: 1.15 },
    { code: "NM", name: "New Mexico", recommendedWage: 14.00, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.92 },
    { code: "NY", name: "New York", recommendedWage: 18.00, payrollTaxPercent: 16.5, supplyCostMultiplier: 1.20 },
    { code: "NC", name: "North Carolina", recommendedWage: 14.00, payrollTaxPercent: 13.5, supplyCostMultiplier: 0.95 },
    { code: "ND", name: "North Dakota", recommendedWage: 15.00, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.92 },
    { code: "OH", name: "Ohio", recommendedWage: 14.50, payrollTaxPercent: 14.5, supplyCostMultiplier: 0.92 },
    { code: "OK", name: "Oklahoma", recommendedWage: 13.50, payrollTaxPercent: 13.5, supplyCostMultiplier: 0.88 },
    { code: "OR", name: "Oregon", recommendedWage: 16.50, payrollTaxPercent: 15.5, supplyCostMultiplier: 1.08 },
    { code: "PA", name: "Pennsylvania", recommendedWage: 15.50, payrollTaxPercent: 15.0, supplyCostMultiplier: 1.00 },
    { code: "RI", name: "Rhode Island", recommendedWage: 16.00, payrollTaxPercent: 15.5, supplyCostMultiplier: 1.08 },
    { code: "SC", name: "South Carolina", recommendedWage: 13.50, payrollTaxPercent: 13.5, supplyCostMultiplier: 0.92 },
    { code: "SD", name: "South Dakota", recommendedWage: 14.00, payrollTaxPercent: 13.0, supplyCostMultiplier: 0.88 },
    { code: "TN", name: "Tennessee", recommendedWage: 14.00, payrollTaxPercent: 13.5, supplyCostMultiplier: 0.92 },
    { code: "TX", name: "Texas", recommendedWage: 14.50, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.95 },
    { code: "UT", name: "Utah", recommendedWage: 15.00, payrollTaxPercent: 14.0, supplyCostMultiplier: 0.95 },
    { code: "VT", name: "Vermont", recommendedWage: 16.00, payrollTaxPercent: 15.0, supplyCostMultiplier: 1.05 },
    { code: "VA", name: "Virginia", recommendedWage: 15.50, payrollTaxPercent: 14.0, supplyCostMultiplier: 1.02 },
    { code: "WA", name: "Washington", recommendedWage: 18.00, payrollTaxPercent: 16.0, supplyCostMultiplier: 1.15 },
    { code: "WV", name: "West Virginia", recommendedWage: 13.00, payrollTaxPercent: 14.5, supplyCostMultiplier: 0.88 },
    { code: "WI", name: "Wisconsin", recommendedWage: 15.00, payrollTaxPercent: 14.5, supplyCostMultiplier: 0.95 },
    { code: "WY", name: "Wyoming", recommendedWage: 14.50, payrollTaxPercent: 13.5, supplyCostMultiplier: 0.92 },
];

/** Get recommended financial defaults for a given state */
export function getStateDefaults(stateCode: string): Partial<CalculatorInputs> | null {
    const state = STATES.find((s) => s.code === stateCode);
    if (!state) return null;
    return {
        wageRate: state.recommendedWage,
        payrollTaxPercent: state.payrollTaxPercent,
        supplyCostPerSqft: Math.round(0.003 * state.supplyCostMultiplier * 10000) / 10000,
    };
}

// ============================================================
// Cleaning Scope / Task Definitions
// These define what's included in the bid proposal
// ============================================================

export interface CleaningTask {
    id: string;
    name: string;
    category: "general" | "restrooms" | "floors" | "specialty";
    /** Whether this is included by default */
    defaultIncluded: boolean;
    /** Extra minutes per 1,000 sqft this task adds */
    minutesPer1kSqft: number;
    /** Description for the proposal */
    description: string;
}

export const CLEANING_TASKS: CleaningTask[] = [
    // General — typically always included
    { id: "trash", name: "Empty trash & replace liners", category: "general", defaultIncluded: true, minutesPer1kSqft: 1.5, description: "Empty all waste baskets, replace liners, transport to dumpster" },
    { id: "dust", name: "Dust surfaces & desks", category: "general", defaultIncluded: true, minutesPer1kSqft: 2.0, description: "Dust all reachable horizontal surfaces, desks, ledges, and countertops" },
    { id: "wipe", name: "Wipe & sanitize surfaces", category: "general", defaultIncluded: true, minutesPer1kSqft: 1.5, description: "Wipe down and sanitize high-touch surfaces: door handles, light switches, railings" },
    { id: "glass-entry", name: "Clean entry glass & doors", category: "general", defaultIncluded: true, minutesPer1kSqft: 0.5, description: "Clean and polish entry glass doors and sidelights" },
    // Restrooms
    { id: "restroom-clean", name: "Clean & disinfect restrooms", category: "restrooms", defaultIncluded: true, minutesPer1kSqft: 3.0, description: "Clean and disinfect toilets, urinals, sinks, mirrors, and partitions" },
    { id: "restroom-restock", name: "Restock restroom supplies", category: "restrooms", defaultIncluded: true, minutesPer1kSqft: 0.5, description: "Restock paper towels, toilet paper, hand soap, and sanitizer" },
    // Floors
    { id: "vacuum", name: "Vacuum carpeted areas", category: "floors", defaultIncluded: true, minutesPer1kSqft: 2.5, description: "Vacuum all carpeted areas including edges and corners" },
    { id: "mop", name: "Mop hard floors", category: "floors", defaultIncluded: true, minutesPer1kSqft: 2.0, description: "Damp mop all hard-surface flooring" },
    { id: "sweep", name: "Sweep hard floors", category: "floors", defaultIncluded: false, minutesPer1kSqft: 1.5, description: "Sweep all hard-surface floors before mopping" },
    // Specialty / Add-ons
    { id: "breakroom", name: "Kitchen / breakroom cleaning", category: "specialty", defaultIncluded: false, minutesPer1kSqft: 1.0, description: "Clean breakroom counters, tables, sinks, and appliance exteriors" },
    { id: "glass-interior", name: "Interior glass & partitions", category: "specialty", defaultIncluded: false, minutesPer1kSqft: 1.0, description: "Clean interior glass partitions, conference room glass, and mirrors" },
    { id: "high-dust", name: "High dusting (vents, ledges)", category: "specialty", defaultIncluded: false, minutesPer1kSqft: 0.75, description: "Dust high areas: vents, ceiling ledges, tops of cabinets" },
    { id: "floor-wax", name: "Floor waxing & buffing", category: "specialty", defaultIncluded: false, minutesPer1kSqft: 3.0, description: "Strip, wax, and buff hard floors (periodic)" },
    { id: "carpet-extract", name: "Carpet extraction / shampooing", category: "specialty", defaultIncluded: false, minutesPer1kSqft: 4.0, description: "Deep clean carpets with hot water extraction (periodic)" },
    { id: "pressure-wash", name: "Pressure washing (exterior)", category: "specialty", defaultIncluded: false, minutesPer1kSqft: 2.0, description: "Pressure wash building exterior, sidewalks, and parking areas" },
];

export const TASK_CATEGORIES = [
    { id: "general" as const, label: "General Cleaning", icon: "🧹" },
    { id: "restrooms" as const, label: "Restrooms", icon: "🚻" },
    { id: "floors" as const, label: "Floors", icon: "🧽" },
    { id: "specialty" as const, label: "Specialty / Add-ons", icon: "✨" },
];

export interface CalculatorInputs {
    buildingTypeId: string;
    sqft: number;
    frequency: Frequency;
    /** Wages per hour in dollars */
    wageRate: number;
    /** Payroll tax percentage (FICA, SUTA, FUTA, WC) */
    payrollTaxPercent: number;
    /** Overhead percentage */
    overheadPercent: number;
    /** Desired profit margin percentage */
    profitPercent: number;
    /** Supply cost per sqft per visit */
    supplyCostPerSqft: number;
}

export interface CalculatorResults {
    buildingType: BuildingType;
    // Time
    hoursPerVisit: number;
    visitsPerMonth: number;
    totalHoursPerMonth: number;
    // Fixture estimates
    estimatedFixtures: { toilets: number; urinals: number; sinks: number };
    // Cost breakdown
    laborCostPerMonth: number;
    payrollTaxCost: number;
    supplyCostPerMonth: number;
    overheadCost: number;
    totalCostPerMonth: number;
    profitAmount: number;
    totalPricePerMonth: number;
    // Per-visit and per-sqft
    pricePerVisit: number;
    pricePerSqft: number;
    // Effective hourly rate
    effectiveHourlyRate: number;
}

export const DEFAULT_INPUTS: CalculatorInputs = {
    buildingTypeId: "office",
    sqft: 10000,
    frequency: "5",
    wageRate: 16,
    payrollTaxPercent: 15,
    overheadPercent: 12,
    profitPercent: 15,
    supplyCostPerSqft: 0.003,
};

/** Calculate the restroom fixture time in hours per visit */
function fixtureTime(fixtures: { toilets: number; urinals: number; sinks: number }): number {
    // Industry standard: ~3 min per toilet, ~1.5 min per urinal, ~1 min per sink
    const minutes =
        fixtures.toilets * 3 +
        fixtures.urinals * 1.5 +
        fixtures.sinks * 1;
    return minutes / 60;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
    const buildingType = BUILDING_TYPES.find((b) => b.id === inputs.buildingTypeId) ?? BUILDING_TYPES[0];

    // --- Time Calculation ---
    const baseHours = inputs.sqft / buildingType.productionRate;
    const adjustedHours = baseHours * buildingType.complexityMultiplier;

    // Fixture estimates based on sqft
    const fixtureMultiplier = inputs.sqft / 10000;
    const estimatedFixtures = {
        toilets: Math.round(buildingType.fixturesPer10k.toilets * fixtureMultiplier),
        urinals: Math.round(buildingType.fixturesPer10k.urinals * fixtureMultiplier),
        sinks: Math.round(buildingType.fixturesPer10k.sinks * fixtureMultiplier),
    };

    const restroomHours = fixtureTime(estimatedFixtures);
    const hoursPerVisit = Math.round((adjustedHours + restroomHours) * 100) / 100;

    // Visits per month (frequency × ~4.33 weeks/month)
    const freq = parseInt(inputs.frequency);
    const visitsPerMonth = Math.round(freq * 4.33);
    const totalHoursPerMonth = Math.round(hoursPerVisit * visitsPerMonth * 100) / 100;

    // --- Cost Calculation ---
    const laborCostPerMonth = totalHoursPerMonth * inputs.wageRate;
    const payrollTaxCost = laborCostPerMonth * (inputs.payrollTaxPercent / 100);
    const supplyCostPerMonth = inputs.supplyCostPerSqft * inputs.sqft * visitsPerMonth;
    const subtotalDirect = laborCostPerMonth + payrollTaxCost + supplyCostPerMonth;
    const overheadCost = subtotalDirect * (inputs.overheadPercent / 100);
    const totalCostPerMonth = subtotalDirect + overheadCost;
    const profitAmount = totalCostPerMonth * (inputs.profitPercent / 100);
    const totalPricePerMonth = Math.round((totalCostPerMonth + profitAmount) * 100) / 100;

    // --- Derived ---
    const pricePerVisit = Math.round((totalPricePerMonth / visitsPerMonth) * 100) / 100;
    const pricePerSqft = Math.round((totalPricePerMonth / inputs.sqft) * 1000) / 1000;
    const effectiveHourlyRate =
        totalHoursPerMonth > 0
            ? Math.round((totalPricePerMonth / totalHoursPerMonth) * 100) / 100
            : 0;

    return {
        buildingType,
        hoursPerVisit,
        visitsPerMonth,
        totalHoursPerMonth,
        estimatedFixtures,
        laborCostPerMonth: Math.round(laborCostPerMonth * 100) / 100,
        payrollTaxCost: Math.round(payrollTaxCost * 100) / 100,
        supplyCostPerMonth: Math.round(supplyCostPerMonth * 100) / 100,
        overheadCost: Math.round(overheadCost * 100) / 100,
        totalCostPerMonth: Math.round(totalCostPerMonth * 100) / 100,
        profitAmount: Math.round(profitAmount * 100) / 100,
        totalPricePerMonth,
        pricePerVisit,
        pricePerSqft,
        effectiveHourlyRate,
    };
}

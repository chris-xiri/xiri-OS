/**
 * GA4 Analytics Helper for Marketing Site
 *
 * The GA4 snippet (G-Y8V0GR4ESS) is loaded in layout.tsx, so gtag is
 * available globally. This module provides typed helpers for tracking
 * key funnel events.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

function track(eventName: string, params?: Record<string, string | number | boolean>) {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, params);
    }
}

/* ── Tool Events ── */

/** Free tool used (calculator submitted / result generated) */
export function trackToolUsed(toolName: string, params?: Record<string, string | number>) {
    track("tool_used", { tool_name: toolName, ...params });
}

/* ── CTA Events ── */

/** Any CTA button clicked on the marketing site */
export function trackCtaClick(buttonText: string, location: string) {
    track("cta_click", { button_text: buttonText, location });
}

/* ── Calculator Events ── */

/** Public calculator: building type selected */
export function trackCalcBuildingType(buildingType: string) {
    track("calc_building_type", { building_type: buildingType });
}

/** Public calculator: bid calculated (result displayed) */
export function trackCalcResult(sqft: number, monthlyPrice: number, buildingType: string) {
    track("calc_result", { sqft, monthly_price: monthlyPrice, building_type: buildingType });
}

/** Public calculator: "Save Bid — Start Free Trial" clicked */
export function trackCalcSaveBid(sqft: number, monthlyPrice: number) {
    track("calc_save_bid", { sqft, monthly_price: monthlyPrice });
}

export default track;

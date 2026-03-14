/**
 * Acquisition source tracking.
 *
 * Captures UTM params + document.referrer on first page load and persists
 * them in sessionStorage so they survive navigation within the SPA.
 * Call `getAcquisitionSource()` during signup to store on the user profile.
 */

const STORAGE_KEY = "xiri_acquisition";

export interface AcquisitionSource {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    referrer?: string;
    landing_page?: string;
    captured_at: string;
}

/** Capture UTM params + referrer from the current page load.
 *  Call this once on app init. Only stores if nothing is captured yet
 *  (so we keep the *first touch*, not internal navigations). */
export function captureAcquisitionSource(): void {
    if (typeof window === "undefined") return;

    // Don't overwrite if we already captured for this session
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const source: AcquisitionSource = {
        captured_at: new Date().toISOString(),
    };

    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");
    const utmTerm = params.get("utm_term");
    const utmContent = params.get("utm_content");

    if (utmSource) source.utm_source = utmSource;
    if (utmMedium) source.utm_medium = utmMedium;
    if (utmCampaign) source.utm_campaign = utmCampaign;
    if (utmTerm) source.utm_term = utmTerm;
    if (utmContent) source.utm_content = utmContent;

    if (document.referrer) {
        // Don't store self-referrals
        try {
            const ref = new URL(document.referrer);
            if (ref.hostname !== window.location.hostname) {
                source.referrer = document.referrer;
            }
        } catch {
            source.referrer = document.referrer;
        }
    }

    source.landing_page = window.location.pathname;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(source));
}

/** Retrieve the captured acquisition source (for storing on user profile). */
export function getAcquisitionSource(): AcquisitionSource | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AcquisitionSource;
    } catch {
        return null;
    }
}

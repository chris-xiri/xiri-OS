"use client";

import { useEffect } from "react";
import { trackStartupGuideViewed } from "../../lib/analytics";

/**
 * Fires a GA4 `startup_guide_viewed` event once per page load.
 * Place inside the start-cleaning-business/[city] page.
 */
export default function StartupPageTracker({ city }: { city: string }) {
    useEffect(() => {
        trackStartupGuideViewed(city);
    }, [city]);

    return null;
}

"use client";

import { useEffect } from "react";
import { trackCtaClick } from "../../lib/analytics";

/**
 * Global CTA tracker — listens for clicks on any .btn or .btn-primary / .btn-secondary
 * element across the marketing site and fires a GA4 cta_click event.
 *
 * Drop this once in layout.tsx and all CTAs get tracked automatically,
 * even on server-rendered pages.
 */
export default function CtaTracker() {
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const el = (e.target as HTMLElement).closest<HTMLElement>(".btn, .btn-primary, .btn-secondary, .calc-save-btn");
            if (!el) return;

            const text = el.textContent?.trim().slice(0, 60) || "unknown";
            const page = window.location.pathname;
            trackCtaClick(text, page);
        };

        document.addEventListener("click", handler, { passive: true });
        return () => document.removeEventListener("click", handler);
    }, []);

    return null; // renders nothing — just a side-effect component
}

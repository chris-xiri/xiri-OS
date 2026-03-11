"use client";

import { useEffect } from "react";
import { trackBlogViewed } from "../../lib/analytics";

/**
 * Fires a GA4 `blog_viewed` event once per page load.
 * Place inside blog/[slug] pages.
 */
export default function BlogViewTracker({
    slug,
    category,
}: {
    slug: string;
    category: string;
}) {
    useEffect(() => {
        trackBlogViewed(slug, category);
    }, [slug, category]);

    return null;
}

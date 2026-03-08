/**
 * Dynamically loads the Google Maps JavaScript API with the Places library.
 *
 * Uses the VITE_GOOGLE_MAPS_API_KEY environment variable.
 * If no key is set, the script is never loaded and the AddressAutocomplete
 * component gracefully degrades to plain text inputs.
 */

let loadPromise: Promise<boolean> | null = null;

export function loadGoogleMaps(): Promise<boolean> {
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve) => {
        // Already loaded?
        if ((window as any).google?.maps?.places) {
            resolve(true);
            return;
        }

        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!key) {
            console.info("[GoogleMaps] No VITE_GOOGLE_MAPS_API_KEY set — address autocomplete will use plain inputs.");
            resolve(false);
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.warn("[GoogleMaps] Failed to load Google Maps API.");
            resolve(false);
        };
        document.head.appendChild(script);
    });

    return loadPromise;
}

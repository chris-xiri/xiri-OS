import { useState, useEffect } from "react";
import "./PwaInstallPrompt.css";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA Install Prompt — shows a sleek banner on mobile browsers
 * suggesting the user install the app to their home screen.
 *
 * Uses the `beforeinstallprompt` event (Chrome/Edge/Samsung).
 * On iOS Safari, shows a manual instruction since Safari doesn't
 * support the install prompt API.
 */
export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosPrompt, setShowIosPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(() => {
        const data = localStorage.getItem("pwa-install-dismissed");
        if (!data) return false;
        try {
            const { count, until } = JSON.parse(data);
            // Permanent after 3 dismissals
            if (count >= 3) return true;
            // Otherwise check if the cooldown has passed
            return Date.now() < until;
        } catch { return false; }
    });
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Already installed as PWA — don't show
        const standalone = window.matchMedia("(display-mode: standalone)").matches
            || (navigator as any).standalone === true;
        setIsStandalone(standalone);
        if (standalone) return;

        // Chrome/Edge: capture the install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener("beforeinstallprompt", handler);

        // iOS Safari detection
        const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isSafari = /Safari/i.test(navigator.userAgent) && !/CriOS|Chrome/i.test(navigator.userAgent);
        if (isIos && isSafari) {
            setShowIosPrompt(true);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        const data = localStorage.getItem("pwa-install-dismissed");
        let count = 1;
        try { count = (JSON.parse(data || "{}").count || 0) + 1; } catch { /* first dismiss */ }
        // 1st dismiss: 3 days, 2nd: 14 days, 3rd+: permanent
        const days = count === 1 ? 3 : count === 2 ? 14 : 365 * 10;
        localStorage.setItem("pwa-install-dismissed", JSON.stringify({
            count,
            until: Date.now() + days * 24 * 60 * 60 * 1000,
        }));
    };

    // Don't render if: already installed, dismissed, or no prompt available
    if (isStandalone || dismissed || (!deferredPrompt && !showIosPrompt)) {
        return null;
    }

    return (
        <div className="pwa-install-prompt">
            <div className="pwa-install-content">
                <div className="pwa-install-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </div>
                <div className="pwa-install-text">
                    <strong>Install xiriOS</strong>
                    <span>
                        {showIosPrompt
                            ? <>Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong></>
                            : "Add to your home screen for the best experience"}
                    </span>
                </div>
            </div>
            <div className="pwa-install-actions">
                {deferredPrompt && (
                    <button className="pwa-install-btn" onClick={handleInstall}>
                        Install
                    </button>
                )}
                <button className="pwa-install-dismiss" onClick={handleDismiss} aria-label="Dismiss">
                    ✕
                </button>
            </div>
        </div>
    );
}

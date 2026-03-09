# DECISIONS.md — xiriOS Project

A running log of architectural, branding, and strategic decisions.

---

## 2026-03-06: Brand Rename → xiriOS

**Decision:** Renamed from "XIRIOUS" / "Xirious Work" to **xiriOS**.

**Rationale:** "xiriOS" pairs naturally with the subdomain `os.xiri.ai`, gives a tech-forward "operating system for your cleaning business" connotation, and is more memorable than "XIRIOUS". The "OS" suffix is highlighted in teal in the logo.

**Impact:** Updated all metadata, navbar, footer, and marketing copy.

---

## 2026-03-06: Domain — os.xiri.ai

**Decision:** Marketing site at `os.xiri.ai`, dashboard at `os.xiri.ai/app`.

**Rationale:** Path-based routing simplifies auth cookies and keeps the brand unified under one domain. Previously considered `bid.xiri.ai`.

---

## 2026-03-06: Hosting Split — Vercel + Firebase

**Decision:** Marketing site → Vercel (Next.js SSR). Dashboard app → Firebase Hosting (Vite React SPA).

**Rationale:**
- Vercel gives us SSR for SEO, edge caching, and preview deployments for the marketing site
- Firebase Hosting for the SPA keeps infra consolidated with Firestore, Auth, Functions
- Path-based routing (`/app`) avoids CORS and cookie-domain headaches

---

## 2026-03-06: Tailwind v4 CSS Architecture

**Decision:** Use `@theme` for color tokens and `@layer base/components` for custom styles.

**Rationale:** Plain CSS custom properties were being overridden by Tailwind v4's cascade reset (`@import "tailwindcss"`). Migrating to `@theme` registers colors as first-class Tailwind tokens, and `@layer` ensures proper specificity ordering.

---

## 2026-03-06: Typography — Outfit + DM Sans

**Decision:** Outfit for display/headings, DM Sans for body text.

**Rationale:** Outfit's geometric shapes with rounded terminals feel modern but approachable — not intimidating for non-tech users. DM Sans is highly legible at small sizes. Both are Google Fonts (free, performant via `next/font`).

---

## 2026-03-06: Design Aesthetic — "Modern Industrial Meets Premium Clean"

**Decision:** Dark navy palette, teal accent, glassmorphism nav, noise texture overlays.

**Rationale:** Competitors (CleanGuru, Swept) use dated, white-background designs. A dark premium aesthetic signals "this is a different class of product" while the teal accent provides energy and trust. The noise texture adds depth without distracting.

---

## 2026-03-06: No "AI" Branding

**Decision:** Avoid explicit AI branding in xiriOS marketing.

**Rationale:** Target audience (janitorial business owners) cares about reliability, speed, and margin — not AI buzz. AI features exist but are positioned as "smart" features, not "AI-powered" ones. Keeps the brand wall with parent XIRI company intact.

---

## 2026-03-06: PLG Strategy — Free Calculator as Lead Gen

**Decision:** Free bid calculator (no sign-up required) as the primary acquisition funnel, followed by 14-day free trial.

**Rationale:** Cleaning business owners search for "janitorial bid calculator" — high-intent SEO keyword. Providing the tool free builds trust and captures leads naturally. The free trial converts tool users into paying customers.

---

## 2026-03-06 → 2026-03-09: Pricing Tiers

**Decision:** Two active tiers — **Bid** (free) and **Bid Plus** ($9/mo, $7/mo annual). Three future tiers (Grow, Pro, Business) shown as "Coming Soon".

| Tier | Monthly | Annual | Users | Status |
|------|---------|--------|-------|--------|
| Bid | Free | Free | 1 | ✅ Active |
| Bid Plus | $9 | $7/mo | ≤3 | ✅ Active |
| Grow | $39 | $31/mo | ≤3 | 🔜 Coming Soon |
| Pro | $79 | $63/mo | ≤10 | 🔜 Coming Soon |
| Business | $119 | $95/mo | ≤25 | 🔜 Coming Soon |

**Rationale:** Start with only the plans we can fully support. Bid (free) drives acquisition via the calculator. Bid Plus is priced aggressively at $9/mo to maximize conversion from free users. Future plans (Grow, Pro, Business) are visible on pricing page as "Coming Soon" to signal growth headroom.

**Free tier limits:** 3 bids, 5 contacts, 1 user. Bid Plus: unlimited bids/contacts, up to 3 users.

---

## 2026-03-06: Payment Processing — Stripe

**Decision:** Use Stripe for subscription billing.

**Rationale:** Industry standard for SaaS subscriptions. Can start as sole proprietor (no LLC required initially). Handles recurring billing, trials, proration, and tax calculation.

---

## 2026-03-06: Firebase Project — xirious-work

**Decision:** Created GCP/Firebase project `xirious-work` for backend services.

**Rationale:** Separate project from parent XIRI to maintain clean billing boundaries and resource isolation. Hosts Firestore, Auth, Functions, and Storage for the xiriOS dashboard app.

---

## 2026-03-06: Future Native App — Capacitor

**Decision:** Start with PWA, use Capacitor for native when needed.

**Rationale:** PWA gives mobile access immediately with no App Store approval process. Capacitor wraps the existing React SPA into native containers when push notifications, camera access, or offline storage demand it. Avoids maintaining separate iOS/Android codebases.

---

## 2026-03-09: Logo — Green Dot + Styled Text

**Decision:** xiriOS logo is rendered as text: green glowing dot + "xiri" (white, Outfit 800) + "OS" (green #00d4aa, Outfit 800). No space between "xiri" and "OS".

**Rationale:** Text-based logo ensures pixel-perfect rendering at all sizes and avoids SVG font-embedding issues. The green dot echoes the teal accent color and creates visual continuity across marketing site, dashboard sidebar, and social assets.

**Impact:** Updated dashboard sidebar, generated PNG assets for social media (LinkedIn, Facebook, Twitter/X, OG images, favicon).

---

## 2026-03-09: Centralized Pricing Config — plans.ts + PricingBlock

**Decision:** All plan names, prices, features, and `comingSoon` flags live in `marketing/lib/plans.ts`. A reusable `<PricingBlock>` component (full and compact variants) renders pricing cards across all pages.

**Rationale:** Pricing was hardcoded in 6+ files. A single source of truth ensures price changes propagate everywhere. The component supports two modes: "full" (homepage/pricing page with feature lists) and "compact" (pSEO city pages with small cards).

**Impact:** Replaced ~150 lines of duplicated plan cards across homepage, pricing page, and pSEO pages.

---

## 2026-03-09: Subscribe vs Upgrade UX

**Decision:** During trial, the CTA is **"Subscribe"** (not "Upgrade"). The trial banner "Subscribe Now" button targets the current trial tier (bid_plus), not the next tier up.

**Rationale:** Users are trialing Bid Plus and want to convert that trial into a paid subscription. Using `getUpgradeTier()` was incorrectly sending them to the $39 Grow checkout. "Subscribe" is the correct action for trial-to-paid conversion; "Upgrade" implies moving to a higher tier.

**Impact:** Fixed TrialBanner, Settings page, and Calculator limit banner.

# xiriOS Brand Kit

## Brand Name & Domain

| Property | Value |
|----------|-------|
| **Brand Name** | xiriOS |
| **Style** | "xiri" lowercase + "OS" uppercase in accent color |
| **Domain** | os.xiri.ai |
| **Parent Brand** | XIRI (xiri.ai) |
| **Tagline** | Win more bids. Protect your margins. |

> [!IMPORTANT]
> xiriOS is a separate brand from XIRI. Maintain a "brand wall" — avoid overt cross-branding.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Midnight** | `#0c0f1a` | Primary background |
| **Midnight Soft** | `#141829` | Card backgrounds, alternating sections |
| **Slate** | `#1e2235` | Subtle background accents |
| **Steel** | `#2a2f47` | Borders, dividers |
| **Mist** | `#8b92b3` | Secondary text, labels |
| **Cloud** | `#c4c9e0` | Body text |
| **Snow** | `#f0f1f7` | Primary text, headings |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Accent (Teal)** | `#00d4aa` | CTAs, highlights, "OS" in logo, icons |
| **Accent Hover** | `#00eabd` | Hover states |
| **Accent Muted** | `#00d4aa22` | Labels, subtle backgrounds |
| **Warm (Orange)** | `#ff6b35` | Secondary CTAs, urgency |
| **Warm Hover** | `#ff8555` | Hover states |

---

## Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Display** | Outfit | 700–800 | Headings, logo, labels |
| **Body** | DM Sans | 400–600 | Paragraphs, nav, UI text |

### Scale
- **H1**: `clamp(2.5rem, 5vw + 1rem, 4.5rem)` — weight 800, letter-spacing `-0.03em`
- **H2**: `clamp(2rem, 3vw + 0.5rem, 3rem)` — weight 700
- **H3**: `clamp(1.25rem, 2vw, 1.75rem)` — weight 700
- **Body**: `1.0625rem` — line-height 1.7

---

## Logo

The xiriOS logo is a **wordmark** with an iconic dot:
- Teal dot (`#00d4aa`) with `0 0 12px` glow → "xiri" in white Outfit 800 → "OS" in teal Outfit 800
- Letter-spacing: `-0.02em`
- No icon-only variant yet

---

## Design Principles

1. **Modern industrial meets premium clean** — dark palette, precise geometry, teal energy
2. **No "AI" branding** — focus on reliability, speed, margin optimization
3. **Audience-first** — designed for janitorial operators, not tech enthusiasts
4. **Glassmorphism** — navbar blur on scroll: `blur(16px) saturate(180%)`
5. **Noise texture** — subtle SVG noise overlay on hero/pricing sections

---

## Assets

| Asset | Path | Dimensions |
|-------|------|------------|
| OG Image | `apps/marketing/public/og-image.png` | 1200×630 |
| Favicon | `apps/marketing/public/favicon.png` | Square |

---

## Button Styles

| Variant | Background | Text | Shadow |
|---------|-----------|------|--------|
| **Primary** | `#00d4aa` | `#0c0f1a` | teal glow |
| **Secondary** | transparent | `#f0f1f7` | steel border |
| **Warm** | `#ff6b35` | white | orange glow |

All buttons: Outfit 600, `0.625rem` radius, `-1px` translateY on hover.

---

## Competitive Positioning
- **vs CleanGuru** — 50% less cost, modern UX
- **vs Swept** — more features per tier, no per-user gotchas
- **vs Janitorial Manager** — $4,500+/yr savings, mobile-first

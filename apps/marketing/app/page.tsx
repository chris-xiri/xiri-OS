import Navbar from "./components/Navbar";
import PricingBlock from "./components/PricingBlock";
import { ACTIVE_PLANS, formatPrice } from "../lib/plans";

const YEAR = 2026; // Hardcoded to avoid hydration mismatch

const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "xiriOS",
  legalName: "Xiri Inc.",
  url: "https://os.xiri.ai",
  logo: "https://os.xiri.ai/og-image.png",
  description: "Janitorial bidding and business management software for cleaning companies.",
  sameAs: [
    "https://www.facebook.com/xaborservices",
    "https://www.instagram.com/xaborservices",
    "https://www.linkedin.com/company/xabor",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@xiri.ai",
    contactType: "customer service",
  },
};

const APP_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "xiriOS",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://os.xiri.ai",
  description: "Professional bidding, scheduling, timekeeping, and CRM for janitorial businesses.",
  offers: [
    ...ACTIVE_PLANS.map((p) => ({
      "@type": "Offer" as const,
      price: String(p.price),
      priceCurrency: "USD",
      description: `${p.name} — ${p.price === 0 ? "Free forever" : formatPrice(p)}`,
    })),
  ],
};

export default function Home() {
  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_LD) }} />

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section
        className="section noise"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "120px",
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 212, 170, 0.08) 0%, transparent 60%), #0c0f1a",
        }}
      >
        <div className="section-inner" style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <span className="section-label animate-fade-in-up">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", display: "inline-block" }} />
              Built for cleaning business owners
            </span>

            <h1 className="animate-fade-in-up delay-100">
              Janitorial Software to{" "}
              <span style={{ color: "#00d4aa" }}>Win More Bids</span>
            </h1>

            <p
              className="animate-fade-in-up delay-200"
              style={{
                fontSize: "1.1875rem",
                maxWidth: "600px",
                margin: "2rem auto 0",
                color: "#c4c9e0",
              }}
            >
              Professional bidding, scheduling, timekeeping, and CRM for
              janitorial businesses — at half the price of what you&apos;re paying now.
            </p>

            <div
              className="animate-fade-in-up delay-300"
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "3rem",
                flexWrap: "wrap",
              }}
            >
              <a href="/app/login?mode=signup" className="btn btn-primary" style={{ fontSize: "1.0625rem", padding: "1rem 2.25rem" }}>
                Start Free Trial
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="/calculator" className="btn btn-secondary" style={{ fontSize: "1.0625rem", padding: "1rem 2.25rem" }}>
                Try Free Bid Calculator
              </a>
            </div>

            <div
              className="animate-fade-in-up delay-400"
              style={{
                display: "flex",
                gap: "3rem",
                justifyContent: "center",
                marginTop: "4.5rem",
                flexWrap: "wrap",
              }}
            >
              {[
                { value: "60%", label: "Less than competitors" },
                { value: "14 days", label: "Free trial" },
                { value: "10 min", label: "Setup time" },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-outfit), system-ui, sans-serif",
                      fontSize: "1.75rem",
                      fontWeight: 800,
                      color: "white",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ color: "#8b92b3", fontSize: "0.875rem", marginTop: "4px" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SOCIAL PROOF BAR
          ============================================================ */}
      <section
        style={{
          padding: "3rem 2rem",
          borderTop: "1px solid #2a2f47",
          borderBottom: "1px solid #2a2f47",
          background: "#141829",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#8b92b3", fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Trusted by cleaning businesses saving an average of $800/year on software
        </p>
      </section>

      {/* ============================================================
          FEATURES SECTION
          ============================================================ */}
      <section id="features" className="section" style={{ background: "#0c0f1a" }}>
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">Everything you need</span>
            <h2>
              All-in-one cleaning business software{" "}
              <span style={{ color: "#00d4aa" }}>built for janitorial teams</span>
            </h2>
            <p style={{ marginTop: "1rem" }}>
              No more juggling spreadsheets, paper bids, and random apps. xiriOS brings it all together.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="3" y="3" width="22" height="22" rx="4" stroke="#00d4aa" strokeWidth="2" />
                    <path d="M9 14l3 3 7-7" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Bidding & Proposals",
                desc: "Create professional, accurate bids in minutes. Cost-per-sqft calculations, customizable templates, and PDF proposals that win contracts.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="11" stroke="#00d4aa" strokeWidth="2" />
                    <path d="M14 8v6l4 2" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
                title: "Scheduling & Timekeeping",
                desc: "Assign crews, set recurring schedules, and track hours with GPS geofence clock-in. Know exactly where your team is.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M8 5h12a3 3 0 013 3v12a3 3 0 01-3 3H8a3 3 0 01-3-3V8a3 3 0 013-3z" stroke="#00d4aa" strokeWidth="2" />
                    <path d="M5 11h18M11 5v18" stroke="#00d4aa" strokeWidth="2" />
                  </svg>
                ),
                title: "CRM & Lead Management",
                desc: "Track every prospect from first call to signed contract. Never lose a lead again. Activity timeline, notes, and follow-up reminders.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 3l3.5 7 7.5 1.1-5.4 5.3 1.3 7.6L14 20.5 7.1 24l1.3-7.6L3 11.1l7.5-1.1L14 3z" stroke="#00d4aa" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Inspections & Quality",
                desc: "Score inspections on-site, attach photos, and share reports with clients through their own portal. Build trust through transparency.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="7" width="20" height="14" rx="3" stroke="#00d4aa" strokeWidth="2" />
                    <path d="M4 12h20" stroke="#00d4aa" strokeWidth="2" />
                  </svg>
                ),
                title: "Invoicing & Payments",
                desc: "Send invoices, accept online payments, and sync with QuickBooks. Get paid faster with automatic payment reminders.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 3v22M3 14h22" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="14" cy="14" r="5" stroke="#00d4aa" strokeWidth="2" />
                  </svg>
                ),
                title: "Job Costing & Margins",
                desc: "See exactly how profitable each job is. Track labor costs, supply expenses, and margin per contract in real time.",
              },
            ].map((feature) => (
              <div key={feature.title} className="card">
                <div style={{ marginBottom: "1.5rem" }}>{feature.icon}</div>
                <h3 style={{ marginBottom: "0.75rem", color: "white" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: "0.9375rem" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          COMPARISON CALLOUT
          ============================================================ */}
      <section
        style={{
          padding: "4.5rem 2rem",
          background: "linear-gradient(180deg, #0c0f1a 0%, #141829 100%)",
          borderTop: "1px solid #2a2f47",
          borderBottom: "1px solid #2a2f47",
        }}
      >
        <div className="section-inner" style={{ textAlign: "center" }}>
          <h2>
            <span style={{ color: "#00d4aa" }}>Save $600–4,500/year</span> vs other janitorial management software
          </h2>
          <p style={{ maxWidth: "600px", margin: "1rem auto 0" }}>
            We include more features at every price point. No surprises, no per-user gotchas, just honest pricing for honest businesses.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginTop: "3rem",
              maxWidth: "800px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {[
              { from: "CleanGuru", savings: "$600–780" },
              { from: "Swept", savings: "$852–1,272" },
              { from: "Janitorial Manager", savings: "$4,500+" },
            ].map((item) => (
              <div
                key={item.from}
                style={{
                  padding: "2rem",
                  background: "rgba(0, 212, 170, 0.04)",
                  border: "1px solid rgba(0, 212, 170, 0.15)",
                  borderRadius: "1rem",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#8b92b3", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Switching from {item.from}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-outfit), system-ui, sans-serif",
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "#00d4aa",
                  }}
                >
                  {item.savings}
                </div>
                <div style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>saved per year</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          PRICING SECTION
          ============================================================ */}
      <section id="pricing" className="section noise" style={{ background: "#141829" }}>
        <div className="section-inner" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-header">
            <span className="section-label">Simple, honest pricing</span>
            <h2>
              Janitorial software pricing:{" "}
              <span style={{ color: "#00d4aa" }}>more features, lower price</span>
            </h2>
            <p style={{ marginTop: "1rem" }}>
              Every plan includes more than what competitors charge 2–5× more for. Start with a 14-day free trial. No credit card required.
            </p>
          </div>

          <PricingBlock />
        </div>
      </section>

      {/* ============================================================
          CALCULATOR CTA
          ============================================================ */}
      <section
        id="calculator"
        className="section"
        style={{
          background: "linear-gradient(180deg, #141829 0%, #0c0f1a 100%)",
        }}
      >
        <div className="section-inner" style={{ textAlign: "center" }}>
          <span className="section-label">Free tool — no sign-up required</span>
          <h2>
            Free janitorial bid calculator —{" "}
            <span style={{ color: "#00d4aa" }}>know your price before you quote</span>
          </h2>
          <p style={{ maxWidth: "550px", margin: "1rem auto 0" }}>
            Our free cleaning bid calculator helps you price jobs accurately based on square footage, building type, and frequency. Used by 2,000+ cleaning businesses.
          </p>
          <a
            href="/calculator"
            className="btn btn-warm"
            style={{
              marginTop: "3rem",
              fontSize: "1.0625rem",
              padding: "1rem 2.5rem",
            }}
          >
            Try the Free Cleaning Bid Calculator
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer
        style={{
          padding: "4.5rem 2rem 2rem",
          background: "#0c0f1a",
          borderTop: "1px solid #2a2f47",
        }}
      >
        <div
          className="section-inner"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "3rem",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-outfit), system-ui, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "white",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", display: "inline-block" }} />
              xiri<span style={{ color: "#00d4aa" }}>OS</span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#8b92b3", maxWidth: "250px" }}>
              The modern platform for janitorial and cleaning businesses.
            </p>
          </div>

          <div>
            <h4 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Product
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a href="/#features" style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.9375rem" }}>Features</a>
              <a href="/pricing" style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.9375rem" }}>Pricing</a>
              <a href="/calculator" style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.9375rem" }}>Calculator</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Compare
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "vs CleanGuru", href: "/vs/cleanguru" },
                { label: "vs Swept", href: "/vs/swept" },
                { label: "vs Janitorial Manager", href: "/vs/janitorial-manager" },
                { label: "vs Jobber", href: "/vs/jobber" },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.9375rem" }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Resources
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a href="/blog" style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.9375rem" }}>Blog</a>
              <a href="/blog/how-to-price-janitorial-cleaning" style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.9375rem" }}>Pricing Guide</a>
              <a href="/calculator" style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.9375rem" }}>Free Bid Calculator</a>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1200px",
            margin: "3rem auto 0",
            paddingTop: "2rem",
            borderTop: "1px solid #2a2f47",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ color: "#8b92b3", fontSize: "0.8125rem" }}>
            © {YEAR} xiriOS. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a href="/privacy" style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.8125rem" }}>Privacy</a>
            <a href="/terms" style={{ color: "#8b92b3", textDecoration: "none", fontSize: "0.8125rem" }}>Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}

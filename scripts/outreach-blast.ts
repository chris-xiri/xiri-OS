/**
 * Backlink Outreach Email Script
 *
 * Reads backlink-prospects.csv, generates personalized emails from templates,
 * and sends them via SMTP (Gmail, Outlook, or any SMTP provider).
 *
 * Usage:
 *   npx tsx scripts/outreach-blast.ts --dry-run       # Preview all emails
 *   npx tsx scripts/outreach-blast.ts --send           # Send all emails
 *   npx tsx scripts/outreach-blast.ts --send --type resource_page   # Send to specific type only
 *
 * Setup:
 *   1. Create scripts/.env with your SMTP credentials (see below)
 *   2. Fill in contact emails in backlink-prospects.csv (column: email)
 *   3. Run with --dry-run first to preview
 */

import { resolve } from "path";
import { readFileSync, existsSync } from "fs";

let nodemailer: any;
try {
    nodemailer = require("nodemailer");
} catch {
    // Will be caught when --send is used
}

/* ── Load .env ── */
const envPath = resolve(__dirname, ".env");
if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf-8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
    }
}

/* ── Config ── */
const TOOLS_URL = "https://os.xiri.ai/tools";
const SENDER_NAME = process.env.SENDER_NAME || "Chris";
const SENDER_EMAIL = process.env.SMTP_USER || "";
const SENDER_TITLE = process.env.SENDER_TITLE || "Founder, xiriOS";

/* ── Email Templates ── */
const TEMPLATES: Record<string, { subject: string; body: string }> = {
    resource_page: {
        subject: "Free cleaning business calculators for your resources page",
        body: `Hi there,

I came across your site and noticed you have a great collection of resources for cleaning business owners.

I recently built 4 free calculators that your audience might find useful:

• Cleaning Profit Calculator – breaks down labor, payroll taxes (FICA/FUTA/SUTA), workers comp, supplies, and overhead
• Cleaning Time Estimator – uses ISSA 612 production rate standards for 10 area types
• Employee True Cost Calculator – shows the real employer cost including all taxes, by state
• Price Checker – compares rates across 40 U.S. metro areas using BLS wage data

All free, no login required, no email gate. Data sourced from BLS, SSA, IRS, and NCCI.

${TOOLS_URL}

Would you consider adding these to your resources page? Happy to provide descriptions or screenshots if that helps.

Best,
${SENDER_NAME}
${SENDER_TITLE}`,
    },
    tool_mention: {
        subject: "Free BLS-backed cleaning calculators — complement your tools",
        body: `Hi,

I saw your cleaning business tools and thought our free calculators might be a good complement.

We built 4 free tools backed by government data (BLS, SSA, NCCI):

1. Profit Calculator — full cost breakdown including payroll taxes and workers comp
2. Time Estimator — ISSA 612 production rates by area type
3. Employee Cost Calculator — true employer cost by state
4. Price Checker — BLS median wages for 40 U.S. metros

Free, no login: ${TOOLS_URL}

The key differentiator is we pull directly from government sources — BLS OEWS, SSA FICA rates, NCCI class codes — so the numbers are defensible.

Would love to explore any cross-promotion or link exchange that makes sense for both of us.

Best,
${SENDER_NAME}
${SENDER_TITLE}`,
    },
    guest_post: {
        subject: "Guest post pitch: How to Price Janitorial Services Using Government Data",
        body: `Hi,

I'd love to contribute a guest post to your blog. I run xiriOS (janitorial bidding software) and have deep expertise in cleaning business pricing and operations.

Article idea: "How to Price Janitorial Services in 2025: A Data-Driven Guide"

Key points I'd cover:
• The BLS median janitor wage ($16.29/hr) and why it varies 57% across metros
• True employee cost breakdown (FICA, FUTA, SUTA, workers comp) — the 1.25-1.40x multiplier most owners miss
• ISSA 612 production rates and how they should drive pricing
• Common underbidding mistakes and how to avoid them

I'd include links to our free calculators (${TOOLS_URL}) as interactive resources readers can use immediately.

The article would be 1,000-1,500 words, 100% original, with data sourced from BLS, SSA, NCCI, and ISSA.

Interested? Happy to adjust the topic or angle to fit your audience.

Best,
${SENDER_NAME}
${SENDER_TITLE}`,
    },
    blog_mention: {
        subject: "Free cleaning business tools for your readers",
        body: `Hi,

I built a set of free calculators for cleaning business owners that your readers might find valuable:

• Profit Calculator — breaks down any cleaning contract into labor, taxes, overhead, and profit
• Time Estimator — ISSA 612 production rate standards
• Employee Cost Calculator — true employer cost by state
• Price Checker — BLS wages for 40 U.S. metro areas

All backed by government data (BLS, SSA, IRS, NCCI). Free, no login required.

${TOOLS_URL}

If you're ever writing about cleaning business pricing, operations, or profitability, these could make a useful resource to link to.

Best,
${SENDER_NAME}
${SENDER_TITLE}`,
    },
    competitor_resource: {
        subject: "Free cleaning calculators — possible resource fit?",
        body: `Hi,

I noticed your tools and resources for cleaning businesses and thought our free calculators might be a good addition for your users.

What we built:
• Profit Calculator — full P&L breakdown (labor, FICA, FUTA, workers comp, supplies, overhead)
• Time Estimator — ISSA 612 production rates for 10 area types
• Employee True Cost — state-by-state employer cost (taxes + benefits)
• Price Checker — BLS wage data for 40 metros

Everything is backed by government sources, free to use, no login or email required.

${TOOLS_URL}

Would you consider linking to these or mentioning them in any relevant content? Happy to reciprocate.

Best,
${SENDER_NAME}
${SENDER_TITLE}`,
    },
};

/* ── Parse CSV ── */
interface Prospect {
    type: string;
    site: string;
    url: string;
    contact_approach: string;
    priority: string;
    email_template: string;
    email?: string;
}

function loadProspects(): Prospect[] {
    const csvPath = resolve(__dirname, "backlink-prospects.csv");
    const raw = readFileSync(csvPath, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim());
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => (obj[h] = vals[i] || ""));
        return obj as Prospect;
    });
}

/* ── Main ── */
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const send = args.includes("--send");
    const typeFilter = args.find((a) => a.startsWith("--type="))?.split("=")[1] ||
        (args.includes("--type") ? args[args.indexOf("--type") + 1] : null);

    if (!dryRun && !send) {
        console.log("Usage: npx tsx scripts/outreach-blast.ts [--dry-run | --send] [--type TYPE]");
        console.log("\n  --dry-run    Preview emails without sending");
        console.log("  --send       Send emails via SMTP");
        console.log("  --type TYPE  Filter by prospect type (resource_page, guest_post, tool_mention, blog_mention)");
        console.log("\nSetup: Add contact emails to backlink-prospects.csv and SMTP creds to scripts/.env:");
        console.log("  SMTP_HOST=smtp.gmail.com");
        console.log("  SMTP_PORT=587");
        console.log("  SMTP_USER=you@gmail.com");
        console.log("  SMTP_PASS=your_app_password");
        console.log("  SENDER_NAME=Chris");
        console.log("  SENDER_TITLE=Founder, xiriOS");
        process.exit(0);
    }

    const prospects = loadProspects();
    let filtered = prospects.filter((p) => p.email_template !== "n/a" && p.email_template !== "reddit" && p.email_template !== "directory");
    if (typeFilter) filtered = filtered.filter((p) => p.type === typeFilter || p.email_template === typeFilter);

    console.log("📧 xiriOS Backlink Outreach");
    console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE SEND"}`);
    console.log(`   Prospects: ${filtered.length}${typeFilter ? ` (filtered: ${typeFilter})` : ""}`);
    console.log("─".repeat(50));

    let transporter: any = null;
    if (send) {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            console.error("❌ Missing SMTP credentials. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to scripts/.env");
            process.exit(1);
        }
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT || "587"),
            secure: (SMTP_PORT || "587") === "465",
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        console.log(`   SMTP: ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_USER}\n`);
    }

    let sent = 0;
    let skipped = 0;

    for (const p of filtered) {
        const template = TEMPLATES[p.email_template] || TEMPLATES["blog_mention"];

        console.log(`\n📤 ${p.site}`);
        console.log(`   URL: ${p.url}`);
        console.log(`   Template: ${p.email_template}`);
        console.log(`   Subject: ${template.subject}`);

        if (!p.email) {
            console.log(`   ⚠️  No email — skipped (add email to CSV)`);
            skipped++;
            continue;
        }

        console.log(`   To: ${p.email}`);

        if (dryRun) {
            console.log(`   [DRY RUN] Would send ${template.body.length} char email`);
            console.log(`   Preview:\n   ${template.body.split("\n").slice(0, 3).join("\n   ")}...`);
            continue;
        }

        try {
            await transporter!.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: p.email,
                subject: template.subject,
                text: template.body,
            });
            console.log("   ✅ Sent!");
            sent++;

            // 30-second delay between emails to avoid spam triggers
            if (sent < filtered.length) {
                console.log("   ⏳ Waiting 30s before next email...");
                await new Promise((r) => setTimeout(r, 30000));
            }
        } catch (err) {
            console.error(`   ❌ Failed: ${err instanceof Error ? err.message : err}`);
        }
    }

    console.log("\n" + "─".repeat(50));
    console.log(`✅ Done! Sent: ${sent}, Skipped: ${skipped} (no email)`);
    if (dryRun) console.log("   (Dry run — no emails were actually sent)");
    if (skipped > 0) console.log("   💡 Add contact emails to backlink-prospects.csv to reach more prospects");
}

main().catch(console.error);

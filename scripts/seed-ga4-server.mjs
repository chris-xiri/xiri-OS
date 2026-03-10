/**
 * GA4 Event Seeder — Server-side
 *
 * Sends all custom events to GA4 via the Measurement Protocol,
 * bypassing any browser-level ad blockers (NordVPN, uBlock, etc.)
 *
 * Usage:
 *   1. Get your Measurement Protocol API Secret from:
 *      GA4 Admin → Data Streams → your stream → Measurement Protocol API secrets
 *   2. Run: node scripts/seed-ga4-server.mjs YOUR_API_SECRET
 *      Or:  node scripts/seed-ga4-server.mjs  (will prompt you)
 */

const MEASUREMENT_ID = "G-Y8V0GR4ESS";
const CLIENT_ID = "seed-script-" + Date.now(); // Unique client ID for this session

const EVENTS = [
    // Marketing site events
    { name: "tool_used", params: { tool_name: "seed_test" } },
    { name: "cta_click", params: { button_text: "Seed Test", location: "seed" } },
    { name: "calc_building_type", params: { building_type: "office" } },
    { name: "calc_result", params: { sqft: 5000, monthly_price: 1200, building_type: "office" } },
    { name: "calc_save_bid", params: { sqft: 5000, monthly_price: 1200 } },

    // Signup funnel
    { name: "signup_started", params: { source: "email" } },
    { name: "signup_completed", params: { method: "email" } },

    // Onboarding funnel
    { name: "first_bid_created", params: {} },
    { name: "proposal_generated", params: {} },
    { name: "contact_added", params: {} },

    // Subscription funnel
    { name: "trial_banner_shown", params: { days_remaining: 14 } },
    { name: "subscribe_clicked", params: { plan: "bid_plus" } },
    { name: "purchase_completed", params: { plan: "bid_plus", value: 49, currency: "USD" } },

    // Feature usage
    { name: "feature_used", params: { feature_name: "seed_test" } },
    { name: "bid_deleted", params: {} },

    // Dashboard-specific event names
    { name: "cta_clicked", params: { button_text: "Seed Test", location: "seed" } },
    { name: "calculator_used", params: { building_type: "office", sqft: 5000 } },
    { name: "pricing_viewed", params: { source: "seed" } },
];

async function seedEvents(apiSecret) {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${apiSecret}`;

    console.log(`\n🌱 GA4 Event Seeder (Server-side)`);
    console.log(`   Measurement ID: ${MEASUREMENT_ID}`);
    console.log(`   Client ID:      ${CLIENT_ID}`);
    console.log(`   Events to seed: ${EVENTS.length}\n`);

    let ok = 0;
    let fail = 0;

    for (const ev of EVENTS) {
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    events: [{ name: ev.name, params: ev.params }],
                }),
            });

            if (resp.status === 204 || resp.status === 200) {
                console.log(`   ✓ ${ev.name}`);
                ok++;
            } else {
                const body = await resp.text();
                console.log(`   ✗ ${ev.name} — HTTP ${resp.status}: ${body}`);
                fail++;
            }
        } catch (err) {
            console.log(`   ✗ ${ev.name} — ${err.message}`);
            fail++;
        }

        // Small delay between events
        await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`\n✅ Done! ${ok} sent, ${fail} failed.`);
    console.log(`   Check GA4 Realtime in ~30 seconds.\n`);
}

// Get API secret from args or prompt
const apiSecret = process.argv[2];
if (!apiSecret) {
    console.log(`\n⚠️  Missing API Secret!\n`);
    console.log(`   1. Go to GA4 Admin → Data Streams → your web stream`);
    console.log(`   2. Scroll down to "Measurement Protocol API secrets"`);
    console.log(`   3. Create one (or copy existing)`);
    console.log(`   4. Run: node scripts/seed-ga4-server.mjs YOUR_SECRET\n`);
    process.exit(1);
}

seedEvents(apiSecret);

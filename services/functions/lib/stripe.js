"use strict";
/**
 * Stripe Integration for xiriOS
 *
 * createCheckoutSession — creates a Stripe Checkout session for upgrading
 * handleStripeWebhook  — processes Stripe webhook events
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.createPortalSession = exports.createCheckoutSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const stripeSecretKey = (0, params_1.defineSecret)("STRIPE_SECRET_KEY");
const stripeWebhookSecret = (0, params_1.defineSecret)("STRIPE_WEBHOOK_SECRET");
/* ─── Price ID → Tier mapping ─── */
const PRICE_TO_TIER = {
    // Monthly
    "price_1T8n8V9ir0rgwcfcZbrHM86c": "bid_plus", // $9/mo
    "price_1T8n8o9ir0rgwcfcWmCYT7nW": "grow", // $39/mo
    "price_1T8n999ir0rgwcfcgRui9mM9": "pro", // $79/mo
    "price_1T8n9Q9ir0rgwcfcrxw0PfML": "business", // $119/mo
    // Annual
    "price_1T8nBW9ir0rgwcfcwE3zvl1n": "bid_plus", // $84/yr ($7/mo)
    "price_1T8nBX9ir0rgwcfcCxTFEp2t": "grow", // $372/yr ($31/mo)
    "price_1T8nBX9ir0rgwcfcw2tGjBhv": "pro", // $756/yr ($63/mo)
    "price_1T8nBY9ir0rgwcfcRNvoInEG": "business", // $1140/yr ($95/mo)
};
/* ─── Tier → Price ID mapping (for checkout) ─── */
const TIER_PRICES = {
    bid_plus: { monthly: "price_1T8n8V9ir0rgwcfcZbrHM86c", annual: "price_1T8nBW9ir0rgwcfcwE3zvl1n" },
    grow: { monthly: "price_1T8n8o9ir0rgwcfcWmCYT7nW", annual: "price_1T8nBX9ir0rgwcfcCxTFEp2t" },
    pro: { monthly: "price_1T8n999ir0rgwcfcgRui9mM9", annual: "price_1T8nBX9ir0rgwcfcw2tGjBhv" },
    business: { monthly: "price_1T8n9Q9ir0rgwcfcrxw0PfML", annual: "price_1T8nBY9ir0rgwcfcRNvoInEG" },
};
// ─────────────────────────────────────────────────
// CREATE CHECKOUT SESSION
// ─────────────────────────────────────────────────
exports.createCheckoutSession = (0, https_1.onCall)({ secrets: [stripeSecretKey], region: "us-central1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const { companyId, tier, interval, successUrl, cancelUrl } = request.data;
    if (!companyId || !tier || !successUrl || !cancelUrl) {
        throw new https_1.HttpsError("invalid-argument", "Missing required fields.");
    }
    // Verify user belongs to this company
    const uid = request.auth.uid;
    const profileSnap = await admin.firestore().doc(`users/${uid}`).get();
    const profile = profileSnap.data();
    if (!profile || profile.companyId !== companyId) {
        throw new https_1.HttpsError("permission-denied", "Access denied.");
    }
    const priceConfig = TIER_PRICES[tier];
    if (!priceConfig) {
        throw new https_1.HttpsError("invalid-argument", `Unknown tier: ${tier}`);
    }
    const priceId = interval === "annual" && priceConfig.annual
        ? priceConfig.annual
        : priceConfig.monthly;
    const stripe = new stripe_1.default(stripeSecretKey.value(), { apiVersion: "2025-02-24.acacia" });
    // Get or create Stripe customer
    const companySnap = await admin.firestore().doc(`companies/${companyId}`).get();
    const companyData = companySnap.data();
    let customerId = companyData?.subscription?.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: profile.email,
            name: companyData?.name || profile.displayName || "",
            metadata: { companyId, firebaseUid: uid },
        });
        customerId = customer.id;
        // Save customer ID
        await admin.firestore().doc(`companies/${companyId}`).update({
            "subscription.stripeCustomerId": customerId,
        });
    }
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { companyId, tier },
        subscription_data: {
            metadata: { companyId, tier },
        },
    });
    return { sessionUrl: session.url };
});
// ─────────────────────────────────────────────────
// CREATE CUSTOMER PORTAL SESSION
// ─────────────────────────────────────────────────
exports.createPortalSession = (0, https_1.onCall)({ secrets: [stripeSecretKey], region: "us-central1" }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be signed in.");
    }
    const { companyId, returnUrl } = request.data;
    const uid = request.auth.uid;
    const profileSnap = await admin.firestore().doc(`users/${uid}`).get();
    const profile = profileSnap.data();
    if (!profile || profile.companyId !== companyId) {
        throw new https_1.HttpsError("permission-denied", "Access denied.");
    }
    const companySnap = await admin.firestore().doc(`companies/${companyId}`).get();
    const customerId = companySnap.data()?.subscription?.stripeCustomerId;
    if (!customerId) {
        throw new https_1.HttpsError("not-found", "No Stripe customer found. Subscribe first.");
    }
    const stripe = new stripe_1.default(stripeSecretKey.value(), { apiVersion: "2025-02-24.acacia" });
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
    return { portalUrl: session.url };
});
// ─────────────────────────────────────────────────
// STRIPE WEBHOOK HANDLER
// ─────────────────────────────────────────────────
exports.handleStripeWebhook = (0, https_1.onRequest)({ secrets: [stripeSecretKey, stripeWebhookSecret], region: "us-central1" }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }
    const stripe = new stripe_1.default(stripeSecretKey.value(), { apiVersion: "2025-02-24.acacia" });
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, stripeWebhookSecret.value());
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    const db = admin.firestore();
    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const companyId = session.metadata?.companyId;
                const subscriptionId = session.subscription;
                if (!companyId || !subscriptionId)
                    break;
                // Fetch the subscription to get tier + period
                const sub = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = sub.items.data[0]?.price?.id || "";
                const tier = PRICE_TO_TIER[priceId] || session.metadata?.tier || "bid_plus";
                await db.doc(`companies/${companyId}`).update({
                    "subscription.tier": tier,
                    "subscription.status": "active",
                    "subscription.stripeCustomerId": session.customer,
                    "subscription.stripeSubscriptionId": subscriptionId,
                    "subscription.currentPeriodEnd": new Date(sub.current_period_end * 1000).toISOString(),
                    "subscription.trialEnd": admin.firestore.FieldValue.delete(),
                });
                console.log(`✅ Company ${companyId} upgraded to ${tier}`);
                break;
            }
            case "customer.subscription.updated": {
                const sub = event.data.object;
                const companyId = sub.metadata?.companyId;
                if (!companyId)
                    break;
                const priceId = sub.items.data[0]?.price?.id || "";
                const tier = PRICE_TO_TIER[priceId] || "bid_plus";
                const statusMap = {
                    active: "active",
                    trialing: "trialing",
                    past_due: "past_due",
                    unpaid: "past_due",
                    canceled: "canceled",
                    incomplete_expired: "canceled",
                };
                await db.doc(`companies/${companyId}`).update({
                    "subscription.tier": tier,
                    "subscription.status": statusMap[sub.status] || "active",
                    "subscription.currentPeriodEnd": new Date(sub.current_period_end * 1000).toISOString(),
                });
                console.log(`🔄 Company ${companyId} subscription updated: ${tier} (${sub.status})`);
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object;
                const companyId = sub.metadata?.companyId;
                if (!companyId)
                    break;
                await db.doc(`companies/${companyId}`).update({
                    "subscription.tier": "bid",
                    "subscription.status": "active",
                    "subscription.stripeSubscriptionId": admin.firestore.FieldValue.delete(),
                    "subscription.currentPeriodEnd": admin.firestore.FieldValue.delete(),
                });
                console.log(`⬇️ Company ${companyId} downgraded to free`);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }
    catch (err) {
        console.error("Error processing webhook:", err);
        res.status(500).send("Webhook processing error");
        return;
    }
    res.status(200).json({ received: true });
});
//# sourceMappingURL=stripe.js.map
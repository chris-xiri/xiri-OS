/**
 * Stripe Integration for xiriOS
 *
 * createCheckoutSession — creates a Stripe Checkout session for upgrading
 * handleStripeWebhook  — processes Stripe webhook events
 */

import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { notifyAdminSubscription } from "./adminNotifications";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const chatWebhookUrl = defineSecret("GOOGLE_CHAT_WEBHOOK_URL");

/* ─── Price ID → Tier mapping ─── */
const PRICE_TO_TIER: Record<string, string> = {
    // Monthly
    "price_1T8n8V9ir0rgwcfcZbrHM86c": "bid_plus",    // $9/mo
    "price_1T8n8o9ir0rgwcfcWmCYT7nW": "grow",        // $39/mo
    "price_1T8n999ir0rgwcfcgRui9mM9": "pro",         // $79/mo
    "price_1T8n9Q9ir0rgwcfcrxw0PfML": "business",    // $119/mo
    // Annual
    "price_1T8nBW9ir0rgwcfcwE3zvl1n": "bid_plus",    // $84/yr ($7/mo)
    "price_1T8nBX9ir0rgwcfcCxTFEp2t": "grow",        // $372/yr ($31/mo)
    "price_1T8nBX9ir0rgwcfcw2tGjBhv": "pro",         // $756/yr ($63/mo)
    "price_1T8nBY9ir0rgwcfcRNvoInEG": "business",    // $1140/yr ($95/mo)
};

/* ─── Tier → Price ID mapping (for checkout) ─── */
const TIER_PRICES: Record<string, { monthly: string; annual: string }> = {
    bid_plus: { monthly: "price_1T8n8V9ir0rgwcfcZbrHM86c", annual: "price_1T8nBW9ir0rgwcfcwE3zvl1n" },
    grow: { monthly: "price_1T8n8o9ir0rgwcfcWmCYT7nW", annual: "price_1T8nBX9ir0rgwcfcCxTFEp2t" },
    pro: { monthly: "price_1T8n999ir0rgwcfcgRui9mM9", annual: "price_1T8nBX9ir0rgwcfcw2tGjBhv" },
    business: { monthly: "price_1T8n9Q9ir0rgwcfcrxw0PfML", annual: "price_1T8nBY9ir0rgwcfcRNvoInEG" },
};

// ─────────────────────────────────────────────────
// CREATE CHECKOUT SESSION
// ─────────────────────────────────────────────────
export const createCheckoutSession = onCall(
    { secrets: [stripeSecretKey], region: "us-central1" },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be signed in.");
        }

        const { companyId, tier, interval, successUrl, cancelUrl } = request.data as {
            companyId: string;
            tier: string;
            interval?: "monthly" | "annual";
            successUrl: string;
            cancelUrl: string;
        };

        if (!companyId || !tier || !successUrl || !cancelUrl) {
            throw new HttpsError("invalid-argument", "Missing required fields.");
        }

        // Verify user belongs to this company
        const uid = request.auth.uid;
        const profileSnap = await admin.firestore().doc(`users/${uid}`).get();
        const profile = profileSnap.data();
        if (!profile || profile.companyId !== companyId) {
            throw new HttpsError("permission-denied", "Access denied.");
        }

        const priceConfig = TIER_PRICES[tier];
        if (!priceConfig) {
            throw new HttpsError("invalid-argument", `Unknown tier: ${tier}`);
        }

        const priceId = interval === "annual" && priceConfig.annual
            ? priceConfig.annual
            : priceConfig.monthly;

        const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2025-02-24.acacia" as any });

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
    }
);

// ─────────────────────────────────────────────────
// CREATE CUSTOMER PORTAL SESSION
// ─────────────────────────────────────────────────
export const createPortalSession = onCall(
    { secrets: [stripeSecretKey], region: "us-central1" },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Must be signed in.");
        }

        const { companyId, returnUrl } = request.data as {
            companyId: string;
            returnUrl: string;
        };

        const uid = request.auth.uid;
        const profileSnap = await admin.firestore().doc(`users/${uid}`).get();
        const profile = profileSnap.data();
        if (!profile || profile.companyId !== companyId) {
            throw new HttpsError("permission-denied", "Access denied.");
        }

        const companySnap = await admin.firestore().doc(`companies/${companyId}`).get();
        const customerId = companySnap.data()?.subscription?.stripeCustomerId;

        if (!customerId) {
            throw new HttpsError("not-found", "No Stripe customer found. Subscribe first.");
        }

        const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2025-02-24.acacia" as any });
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        return { portalUrl: session.url };
    }
);

// ─────────────────────────────────────────────────
// STRIPE WEBHOOK HANDLER
// ─────────────────────────────────────────────────
export const handleStripeWebhook = onRequest(
    { secrets: [stripeSecretKey, stripeWebhookSecret, chatWebhookUrl], region: "us-central1" },
    async (req, res) => {
        if (req.method !== "POST") {
            res.status(405).send("Method not allowed");
            return;
        }

        const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2025-02-24.acacia" as any });
        const sig = req.headers["stripe-signature"] as string;

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                sig,
                stripeWebhookSecret.value()
            );
        } catch (err: any) {
            console.error("Webhook signature verification failed:", err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        const db = admin.firestore();

        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const companyId = session.metadata?.companyId;
                    const subscriptionId = session.subscription as string;

                    if (!companyId || !subscriptionId) break;

                    // Fetch the subscription to get tier + period
                    const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
                    const priceId = sub.items.data[0]?.price?.id || "";
                    const tier = PRICE_TO_TIER[priceId] || session.metadata?.tier || "bid_plus";

                    await db.doc(`companies/${companyId}`).update({
                        "subscription.tier": tier,
                        "subscription.status": "active",
                        "subscription.stripeCustomerId": session.customer as string,
                        "subscription.stripeSubscriptionId": subscriptionId,
                        "subscription.currentPeriodEnd": new Date(sub.current_period_end * 1000).toISOString(),
                        "subscription.trialEnd": admin.firestore.FieldValue.delete(),
                    });

                    console.log(`✅ Company ${companyId} upgraded to ${tier}`);

                    // Notify admin of new subscription
                    const ownerSnap = await db.doc(`companies/${companyId}`).get();
                    const ownerData = ownerSnap.data();
                    const ownerId = ownerData?.ownerId;
                    if (ownerId) {
                        const ownerProfile = await db.doc(`users/${ownerId}`).get();
                        const ownerEmail = ownerProfile.data()?.email || session.customer_details?.email || "unknown";
                        const ownerCompanyName = ownerData?.name || "Unknown Company";
                        await notifyAdminSubscription(chatWebhookUrl.value(), {
                            email: ownerEmail,
                            companyName: ownerCompanyName,
                            tier,
                            companyId,
                            uid: ownerId,
                        });
                    }
                    break;
                }

                case "customer.subscription.updated": {
                    const sub = event.data.object as Stripe.Subscription;
                    const companyId = sub.metadata?.companyId;
                    if (!companyId) break;

                    const priceId = sub.items.data[0]?.price?.id || "";
                    const tier = PRICE_TO_TIER[priceId] || "bid_plus";

                    const statusMap: Record<string, string> = {
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
                        "subscription.currentPeriodEnd": new Date((sub as any).current_period_end * 1000).toISOString(),
                    });

                    console.log(`🔄 Company ${companyId} subscription updated: ${tier} (${sub.status})`);
                    break;
                }

                case "customer.subscription.deleted": {
                    const sub = event.data.object as Stripe.Subscription;
                    const companyId = sub.metadata?.companyId;
                    if (!companyId) break;

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
        } catch (err) {
            console.error("Error processing webhook:", err);
            res.status(500).send("Webhook processing error");
            return;
        }

        res.status(200).json({ received: true });
    }
);

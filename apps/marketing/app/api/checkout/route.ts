import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-02-25.clover",
});

// Map plan + interval → Stripe Price ID from env vars
const PRICE_MAP: Record<string, string | undefined> = {
    "grow-month": process.env.STRIPE_PRICE_GROW_MONTHLY,
    "grow-year": process.env.STRIPE_PRICE_GROW_ANNUAL,
    "pro-month": process.env.STRIPE_PRICE_PRO_MONTHLY,
    "pro-year": process.env.STRIPE_PRICE_PRO_ANNUAL,
    "business-month": process.env.STRIPE_PRICE_BIZ_MONTHLY,
    "business-year": process.env.STRIPE_PRICE_BIZ_ANNUAL,
};

export async function POST(req: NextRequest) {
    try {
        const { plan, interval } = await req.json();
        const key = `${plan}-${interval}`;
        const priceId = PRICE_MAP[key];

        if (!priceId) {
            return NextResponse.json(
                { error: `No price configured for ${key}. Set STRIPE_PRICE_* env vars.` },
                { status: 400 }
            );
        }

        const origin = req.headers.get("origin") || "https://os.xiri.ai";

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout/cancel`,
            allow_promotion_codes: true,
            billing_address_collection: "required",
            subscription_data: {
                metadata: { plan, interval },
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Checkout failed";
        console.error("Stripe checkout error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

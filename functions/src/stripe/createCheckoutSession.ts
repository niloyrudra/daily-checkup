/* eslint-disable max-len */
// 1️⃣ Declare your secrets at module scope (no .value() yet)
import { defineSecret } from "firebase-functions/params";
const twilioSid    = defineSecret("TWILIO_ACCOUNT_SID");
const twilioToken  = defineSecret("TWILIO_AUTH_TOKEN");
const stripeKey    = defineSecret("STRIPE_TEST_SECRET_KEY");
const stripeFreePriceId    = defineSecret("STRIPE_FREE_PRICE_ID");
const stripeMonthlyPriceId = defineSecret("STRIPE_MONTHLY_PRICE_ID");
const stripeYearlyPriceId  = defineSecret("STRIPE_YEARLY_PRICE_ID");

import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";
import cors from "cors";

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// 1️⃣ Define the expected structure of the request body
interface CheckoutData {
  plan: "free" | "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
  uid?: string;
}
interface CheckoutResponse {
  sessionUrl: string | null;
}

export const createCheckoutSession = onCall<CheckoutData>(
  {
    region: "us-central1", // pin your region
    timeoutSeconds: 300, // 0–3600
    memory: "1GiB", // valid: '128MiB','256MiB','1GiB',…
    secrets: [twilioSid, twilioToken, stripeKey], // 2️⃣ bind the secret here
    cors: true,
  },
  async (request: CallableRequest<CheckoutData>): Promise<CheckoutResponse> => {
    const { data, auth } = request;

    if ((auth?.uid) == null) {
      console.error("🚫 Unauthenticated request received");
      throw new HttpsError("unauthenticated", "User must be signed in.");
    }

    // 3️⃣ Read the secret at runtime
    const stripeSecret = stripeKey.value();
    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-03-31.basil" });

    const priceMap: Record<CheckoutData["plan"], string> = {
      free: stripeFreePriceId.value(),
      monthly: stripeMonthlyPriceId.value(),
      yearly: stripeYearlyPriceId.value(),
    };

    const priceId = priceMap[data.plan];
    if (!priceId) return { sessionUrl: null };

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          uid: auth?.uid ?? "",
          plan: data.plan,
        },
      });

      return {
        sessionUrl: session.url ?? null,
      };
    } catch (error: any) {
      console.error("Stripe checkout session error:", error);
      throw new HttpsError("internal", "Failed to create Stripe checkout session.");
    }
  }
);

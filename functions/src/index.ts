import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();

// 1️⃣ Declare your secret parameter at module scope
const stripeKey = defineSecret("STRIPE_TEST_SECRET_KEY");

interface CheckoutData {
  plan: "free" | "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
}
interface CheckoutResponse {
  sessionUrl: string | null;
}

export const createCheckoutSession = onCall<CheckoutData>(
  {
    region: "us-central1", // pin your region
    timeoutSeconds: 300, // 0–3600
    memory: "1GiB", // valid: '128MiB','256MiB','1GiB',…
    secrets: [stripeKey], // 2️⃣ bind the secret here
  },
  async (request: CallableRequest<CheckoutData>): Promise<CheckoutResponse> => {
    const { data, auth } = request;
    if (!auth?.uid) {
      throw new HttpsError("unauthenticated", "User must be signed in.");
    }

    // 3️⃣ Read the secret at runtime
    const stripeSecret = stripeKey.value();
    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-03-31.basil" });

    const priceMap: Record<CheckoutData["plan"], string> = {
      free: "price_1REVv1H9FTBkZnYQpMvycUOx",
      monthly: "price_1REVwFH9FTBkZnYQlKCAcoZo",
      yearly: "price_1REVx7H9FTBkZnYQFZmfzBlP",
    };

    const priceId = priceMap[data.plan];
    if (!priceId) return { sessionUrl: null };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: { uid: auth.uid },
    });

    return { sessionUrl: session.url ?? null };
  }
);

import * as functions from "firebase-functions";
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();

// 1️⃣ Declare your secret parameter at module scope
const stripeKey = functions.config().stripe.secret ?? defineSecret("STRIPE_TEST_SECRET_KEY");

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
    // secrets: [stripeKey], // 2️⃣ bind the secret here
  },
  async (request: CallableRequest<CheckoutData>): Promise<CheckoutResponse> => {
    const { data, auth } = request;

    console.log("Auth context:", auth); // Should no longer be undefined

    if (!auth?.uid) {
      // throw new HttpsError("unauthenticated", "User must be signed in.");

      console.warn("⚠️ No auth.uid, proceeding anyway for testing...");
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

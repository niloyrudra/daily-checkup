/* eslint-disable max-len */
// 1️⃣ Declare your secrets at module scope (no .value() yet)
import { defineSecret } from "firebase-functions/params";
const twilioSid    = defineSecret("TWILIO_ACCOUNT_SID");
const twilioToken  = defineSecret("TWILIO_AUTH_TOKEN");
const stripeKey    = defineSecret("STRIPE_TEST_SECRET_KEY");
const stripeFreePriceId    = defineSecret("STRIPE_FREE_PRICE_ID");
const stripeMonthlyPriceId = defineSecret("STRIPE_MONTHLY_PRICE_ID");
const stripeYearlyPriceId  = defineSecret("STRIPE_YEARLY_PRICE_ID");

// 2️⃣ Import SDKs & initialization guard
import { onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";
import cors from "cors";
import type { Request, Response } from "express";
import { auth } from "firebase-admin";

// 3️⃣ Setup CORS middleware
const corsHandler = cors({ origin: true });

// 4️⃣ Export the onRequest handler with secrets bound
export const createCheckoutRequestSession = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 300,
    memory: "1GiB",
    secrets: [twilioSid, twilioToken, stripeKey],
    cors: true,
  },
  async (req: Request, res: Response) => {
    // Handle CORS preflight and actual request
    corsHandler(req, res, async () => {
      // 5️⃣ Authenticate the user
      const authHeader = req.headers.authorization?.split("Bearer ")[1];
      if (authHeader == null) {
        return res.status(401).send("Missing Authorization header");
      }
      let decoded;
      try {
        decoded = await auth().verifyIdToken(authHeader);
      } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(403).send("Invalid or expired token");
      }

      // 6️⃣ Read secret values at runtime
      const accountSid = twilioSid.value();
      const authToken  = twilioToken.value();
      const stripeSecret = stripeKey.value();

      // 7️⃣ Initialize Stripe client
      const stripe = new Stripe(stripeSecret, { apiVersion: "2025-03-31.basil" });

      // 8️⃣ Validate input
      const { plan, successUrl, cancelUrl } = req.body as {
        plan: string; successUrl: string; cancelUrl: string;
      };
      if (!plan) {
        return res.status(400).send("Missing plan");
      }

      // 9️⃣ Map plan → price ID (from your .env or Secrets)
      const priceMap: Record<string,string> = {
        free: stripeFreePriceId.value(),
        monthly: stripeMonthlyPriceId.value(),
        yearly: stripeYearlyPriceId.value(),
      };

      const priceId = priceMap[plan];
      if (!priceId) {
        return res.status(400).send("Invalid plan");
      }

      // 🔟 Create the Checkout Session
      try {
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: successUrl,
          cancel_url:  cancelUrl,
          metadata:    { uid: decoded.uid, plan },
        });
        return res.status(200).send({ sessionUrl: session.url });
      } catch (err: any) {
        console.error("Stripe session error:", err);
        return res.status(500).send("Failed to create Stripe checkout session");
      }
    });
  }
);
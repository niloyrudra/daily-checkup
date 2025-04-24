/* eslint-disable max-len */
import "../initFirebase";                        // ← initialize admin once
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret }         from "firebase-functions/params";
import { sendSms }              from "../utils/sendSms";
import * as admin                from "firebase-admin";

// Declare secrets at module scope
const twilioSid   = defineSecret("TWILIO_ACCOUNT_SID");
const twilioToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioFrom  = defineSecret("TWILIO_PHONE_NUMBER");

export const sendOtpToPhone = onCall<{ phoneNumber: string }>(
  { region: "us-central1", secrets: [twilioSid, twilioToken, twilioFrom] },
  async (req) => {
    if ((req.auth?.uid) == null) {
      throw new HttpsError("unauthenticated", "Must be signed in to send OTP");
    }
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await admin.firestore().collection("otp").doc(req.auth.uid).set({
        phone: req.data.phoneNumber,
        otp,
        createdAt: Date.now(),
      });

      // read secrets at runtime
      const from  = twilioFrom.value();
      const sid   = twilioSid.value();
      const token = twilioToken.value();

      await sendSms(req.data.phoneNumber, `Your code: ${otp}`, { sid, token, from });
      return { success: true };
    } catch (e: any) {
      console.error("❌ sendOtpToPhone error:", e);
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      throw new HttpsError("internal", e.message || "Unknown error sending OTP");
    }
  }
);

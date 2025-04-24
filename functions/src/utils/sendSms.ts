import Twilio from "twilio";
import { defineSecret } from "firebase-functions/params";

// 1️⃣ Declare secrets at module scope
const twilioSid    = defineSecret("TWILIO_ACCOUNT_SID");
const twilioToken  = defineSecret("TWILIO_AUTH_TOKEN");
const twilioNumber = defineSecret("TWILIO_PHONE_NUMBER");

/**
 * Send an SMS via Twilio.
 * @param to   E.164-formatted destination number, e.g. "+15551234567"
 * @param body Message text
*/
export async function sendSms(to: string, body: string, p0: { sid: string; token: string; from: string; }): Promise<void> {

  // 2️⃣ Read secrets at runtime
  const accountSid = twilioSid.value();
  const authToken  = twilioToken.value();
  const fromNumber = twilioNumber.value();

  const client = Twilio(accountSid, authToken);

  // Now safe—no non-null assertions
  await client.messages.create({
    from: fromNumber,
    to,
    body
  });
}

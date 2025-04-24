import { admin } from "../utils/admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const verifyOtpCode = onCall(async (req) => {
  if ((req.auth?.uid) == null) throw new HttpsError("unauthenticated","Login required");
  const doc = await admin.firestore().collection("otp").doc(req.auth.uid).get();
  if (!doc.exists || doc.data()?.otp !== req.data.code) 
    throw new HttpsError("invalid-argument","Incorrect code");
  await admin.firestore().collection("users").doc(req.auth.uid)
    .update({ phone: doc.data()?.phone, phoneVerified: true });
  await doc.ref.delete();
  return { success: true };
});
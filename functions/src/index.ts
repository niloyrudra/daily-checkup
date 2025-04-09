/* eslint-disable max-len */
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { CallableRequest } from "firebase-functions/https";
import * as nodemailer from "nodemailer";

if (!admin.apps.length) {
  admin.initializeApp();
}

const emailUser = process.env.FIREBASE_CONFIG ? functions.config().email?.user : "";
const emailPass = process.env.FIREBASE_CONFIG ? functions.config().email?.pass : "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

console.log("🔥 Firebase Config:", functions?.config());
console.log("SMTP Credentials:", emailUser, emailPass); // ✅ Log to verify

exports.sendFriendRequest = functions.https.onCall(async (req) => {
  const { data } = req as CallableRequest<{ senderEmail: string; recipientEmails: string[] }>;
  const senderEmail = data.senderEmail;
  const recipientEmails = data.recipientEmails;

  if (!senderEmail || !recipientEmails || !Array.isArray(recipientEmails)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid input.");
  }

  const emailPromises = recipientEmails.map(async (recipient) => {
    const mailOptions = {
      from: functions.config().email.user, // ✅ Use secure config
      to: recipient,
      subject: "Friend Request Verification",
      text: `You have received a friend request from ${ senderEmail }. Please verify your email.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { recipient, status: "sent" };
    } catch (error: unknown) {
      return {
        recipient,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  const results = await Promise.all(emailPromises);

  // ✅ Use set() to create the document if it doesn't exist
  const db = admin.firestore();
  const userRef = db.collection("users").doc(senderEmail);
  await userRef.set(
    {
      friendEmails: admin.firestore.FieldValue.arrayUnion(...recipientEmails),
    },
    { merge: true }
  );

  return { message: "Emails processed", results };
});

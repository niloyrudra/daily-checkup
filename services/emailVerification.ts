import { db } from "@/config/firebase";
import { doc, setDoc } from "firebase/firestore";

export const sendFriendVerificationEmail = async (userId: string, friendEmail: string) => {
  try {
    const verificationLink = `myapp://(auth)/verify-friend?user=${userId}&email=${friendEmail}`;
    
    // Simulate sending an email
    console.log(`Email sent to ${friendEmail}: Click to verify - ${verificationLink}`);

    // Store pending verification
    await setDoc(doc(db, "friendVerifications", `${userId}_${friendEmail}`), {
      userId,
      friendEmail,
      verified: false,
      createdAt: new Date().toISOString(),
    });

    console.log("Verification record saved successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

import { auth, db } from "@/config/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface SignupData {
  email: string;
  password: string;
}

export const signupUser = async ({ email, password }: SignupData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email
    await sendEmailVerification(userCredential.user);

    // Store user in Firestore with "pending verification" status
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      verified: false,
    });

    return userCredential.user;
  } catch (error) {
    console.error("Signup Error:", error);
    throw error;
  }
};

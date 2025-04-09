import { auth, db } from "@/config/firebase";
import { sendEmailVerification, createUserWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { UserData } from "@/types";

// ✅ Register a new user & send a verification email
export const registerUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);

  // Store user data in Firestore
  const userData: UserData = {
    email,
    emailVerified: false,
    friendEmails: {},
  };
  await setDoc(doc(db, "users", userCredential.user.uid), userData);

  return userCredential.user;
};

// ✅ Update Firestore after email verification
export const updateEmailVerification = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, "users", userId), { emailVerified: true });
};

// ✅ Send a verification email to a friend
export const sendFriendVerificationEmail = async (userId: string, friendEmail: string): Promise<void> => {
  const verificationLink = `@/(auth)/verify-friend?user=${userId}&email=${friendEmail}`;
  console.log("Friend verification link:", verificationLink);

  await updateDoc(doc(db, "users", userId), {
    [`friendEmails.${friendEmail}`]: false,
  });
};
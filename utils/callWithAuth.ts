// callWithAuth.ts
import { getAuth } from "firebase/auth";
import { functions } from "@/config/firebase";

export async function callWithAuth<T, R = any>(name: string, data: T): Promise<R> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) throw new Error("User not signed in");

  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("Firebase Project ID is not set in EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  }
  

  const token = await user.getIdToken();

  const response = await fetch(`https://us-central1-${(projectId)}.cloudfunctions.net/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // send the ID token manually
    },
    body: JSON.stringify({ data }),
  });

  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}
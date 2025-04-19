import React, { useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
// import { httpsCallable } from "firebase/functions";
import { auth, functions, httpsCallable } from "@/config/firebase";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import { callWithAuth } from "@/utils/callWithAuth";
import { getIdToken } from "firebase/auth";


interface CheckoutData {
  plan: "free" | "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
}
interface CheckoutResponse {
  sessionUrl: string | null;
}


const MembershipScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // console.log("process.env.FIREBASE_PROJECT_ID: ", process.env.FIREBASE_PROJECT_ID)
  // console.log("process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID: ", process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID)

  const handleCheckout = async (plan: "free"|"monthly"|"yearly") => {
    setLoading(true);
    // const user = auth?.currentUser;
    // console.log("Membership Screen -User:", user)
    try {

      const user = auth.currentUser;

      if (!user) throw new Error("User not signed in");

      // 🔒 Force-refresh ID token so the backend receives a fresh authenticated context
      await getIdToken(user, /* forceRefresh */ true);

      const token = await user.getIdToken();
      console.log("Firebase Auth Token:", token);

      const createSession = httpsCallable(functions, "createCheckoutSession");
      const { data } = await createSession({
        plan,
        successUrl: Linking.createURL("/dashboard/home?session_id={CHECKOUT_SESSION_ID}"),
        cancelUrl:  Linking.createURL("/(auth)/register/membership?canceled=true"),
      });

      if (data?.sessionUrl) {
        // Open Stripe’s hosted checkout
        Linking.openURL(data?.sessionUrl);
      } else {
        throw new Error("No session URL returned");
      }
    } catch (err: any) {
      Alert.alert("Checkout Error", err.message || "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout title="Membership Plans">
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View
          style={{
            gap: 20
          }}
        >
          <ActionPrimaryButton buttonTitle="Free" onSubmit={() => handleCheckout("free")} />
          
          <ActionPrimaryButton buttonTitle="Monthly $1.99" onSubmit={() => handleCheckout("monthly")} />

          <ActionPrimaryButton buttonTitle="Yearly $23.88" onSubmit={() => handleCheckout("yearly")} />
        </View>
      )}
    </AuthScreenLayout>
  );
}
export default MembershipScreen;
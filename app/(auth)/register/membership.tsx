import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { auth, functions, httpsCallable } from "@/config/firebase";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import { getIdToken, onAuthStateChanged } from "firebase/auth"; // Importing necessary functions

const MembershipScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsAuthenticated(false);
        Alert.alert("Auth Error", "You must be signed in to access this screen.");
        router.push("/(auth)/login");  // Redirect to login page if not signed in
      } else {
        setIsAuthenticated(true); // User is signed in, proceed normally
      }
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, [router]);

  const handleCheckout = async (plan: "free" | "monthly" | "yearly") => {
    if (!isAuthenticated) {
      Alert.alert("Auth Error", "You must be signed in to proceed with checkout.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;

      if (!user) throw new Error("User not signed in");

      // Force-refresh ID token so the backend receives a fresh authenticated context
      await getIdToken(user, /* forceRefresh */ true);

      const token = await user.getIdToken();
      console.log("Firebase Auth Token:", token);

      const createSession = httpsCallable(functions, "createCheckoutSession");
      const { data } = await createSession({
        plan,
        successUrl: Linking.createURL("/dashboard/home?session_id={CHECKOUT_SESSION_ID}"),
        cancelUrl: Linking.createURL("/(auth)/register/membership?canceled=true"),
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
        <View style={{ gap: 20 }}>
          <ActionPrimaryButton buttonTitle="Free" onSubmit={() => handleCheckout("free")} />
          <ActionPrimaryButton buttonTitle="Monthly $1.99" onSubmit={() => handleCheckout("monthly")} />
          <ActionPrimaryButton buttonTitle="Yearly $23.88" onSubmit={() => handleCheckout("yearly")} />
        </View>
      )}
    </AuthScreenLayout>
  );
};

export default MembershipScreen;
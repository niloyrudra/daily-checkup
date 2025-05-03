import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { auth, db } from "@/config/firebase";
import { getIdToken } from "firebase/auth";
// import { date } from "yup";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";

const BASE_URL = process.env.BASE_URL || ""

const MembershipScreen: React.FC = () => {

  const [loading, setLoading] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          Alert.alert("Auth Error", "Please sign in again.");
          router.replace("/(auth)/login");
        } else {
          // 🔒 Force-refresh token right after auth state confirms
          await getIdToken(user, true);
          setAuthReady(true);
        }
      }
      catch( error: any ) {
        console.error( "On load Error:", error )
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCheckout = async (plan: "free" | "monthly" | "yearly") => {
    setLoading(true)
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User must be signed in");
      await fetch(`${BASE_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plan,
          quantity: 1
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Open Stripe checkout URL
          Linking.openURL(data.url);

          const userRef = doc(db, "users", user.uid);

          updateDoc(userRef, {
            membershipPlan: {
              plan,
              status: "active",
              since: Timestamp.fromDate(new Date())
            }
          });

        } else {
          Alert.alert("Failed to start checkout.");
        }
      });
    }
    catch( error: any ) {
      console.error( error )
    }
    finally {
      setLoading(false)
    }
  }

  if (!authReady) {
    return (
      <AuthScreenLayout title="Membership Plans">
        <ActivityIndicator size="large" />
      </AuthScreenLayout>
    );
  }

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
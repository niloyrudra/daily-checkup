import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { auth, db } from "@/config/firebase";
import { getIdToken } from "firebase/auth";

import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import { BASE_URL } from "@/config/config";
import { doc, updateDoc } from "firebase/firestore";
// import { logEvent } from "firebase/analytics";

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
          // priceId: "price_1NZk4AB2zJq6UOaW9Kxxxxxx", // Replace with your actual price ID
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
            membershipPlan: plan
          });
          // return userRef;
        } else {
          alert("Failed to start checkout.");
        }
      // })
      // .then( userRef => {
      //   return updateDoc(userRef, {
      //     membershipPlan: plan
      //   });
      });
    }
    catch( error: any ) {
      console.error( error )
    }
    finally {
      setLoading(false)
    }
  }

  // const handleCheckout = async (plan: "free" | "monthly" | "yearly") => {
  //   setLoading(true);
  //   try {
  //     const user = auth.currentUser;
  //     if (!user) throw new Error("User not signed in");

  //     // 🔐 Force refresh token before API call
  //     await getIdToken(user, true);

  //     // logEvent(analytics, "checkout_attempt", {
  //     //   plan,
  //     //   timestamp: Date.now(),
  //     // });


  //     // const createSession = httpsCallable(functions, "createCheckoutSession");

  //     // console.log( "CreateSession:", createSession );

  //     // const { data } = await createSession({
  //     //   plan,
  //     //   successUrl: Linking.createURL("/dashboard/home?session_id={CHECKOUT_SESSION_ID}"),
  //     //   cancelUrl: Linking.createURL("/(auth)/register/membership?canceled=true"),
  //     // });

  //     // if (data?.sessionUrl) {
  //     //   Linking.openURL(data.sessionUrl);
  //     // } else {
  //     //   throw new Error("No session URL returned");
  //     // }

  //     // const user = auth.currentUser;
  //     if (!user) throw new Error("Not signed in");

  //     const idToken = await user.getIdToken(true); // force refresh

  //     const response = await fetch(`https://us-central1-daily-checkup-ece39.cloudfunctions.net/createCheckoutRequestSession`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${idToken}`,
  //       },
  //       body: JSON.stringify({
  //         plan,
  //         uid: user?.uid ?? ""
  //       }),
  //     });

  //     const result = await response.json();
  //     if (result.sessionUrl) {
  //       Linking.openURL(result.sessionUrl);
  //     } else {
  //       Alert.alert("Checkout failed", "No session URL returned.");
  //     }



  //   } catch (err: any) {
  //     Alert.alert("Checkout Error", err.message || "Could not start Stripe checkout.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { auth, db } from "@/config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";

const VerifyEmail: React.FC = () => {
  const [verified, setVerified] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkVerification = async () => {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        setVerified(true);

        // Update verification status in Firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { emailVerified: true });
      }
    };

    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthScreenLayout title="Email Verification">
      <View style={{gap: 20, justifyContent: "center", alignItems: "center"}}>
        <View style={{
          gap: 6
        }}>

          <Text>{verified ? "Email Verified!" : "Waiting for email verification..."}</Text>
          {!verified && (<ActivityIndicator size={24} color="blue" />)}


        </View>
        {/* {verified && <Button title="Continue" onPress={() => router.push("/(auth)/verify-friend")} />} */}
        {/* {verified && <Button title="Continue" onPress={() => router.push("/(auth)/complete-profile")} />} */}
        {verified && <ActionPrimaryButton buttonTitle="Continue" onSubmit={() => router.push("/(auth)/verify-phone")} />}
      </View>
    </AuthScreenLayout>
  );
};

export default VerifyEmail;
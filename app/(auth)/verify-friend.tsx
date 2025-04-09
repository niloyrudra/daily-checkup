import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

const VerifyFriend: React.FC = () => {
  const { user, email } = useLocalSearchParams();
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && email) {
      verifyFriend();
    }
  }, [user, email]);

  const verifyFriend = async () => {
    try {
      const friendRef = doc(db, "friendVerifications", `${user}_${email}`);
      const friendDoc = await getDoc(friendRef);

      if (friendDoc.exists()) {
        await updateDoc(friendRef, { verified: true });
        setVerified(true);
      } else {
        Alert.alert("Error", "Invalid verification link.");
      }
    } catch (error) {
      console.error("Error verifying friend:", error);
    }
  };

  return (
    <View>
      <Text>{verified ? "Friend Verified!" : "Verifying..."}</Text>
      {verified && <Button title="Go to Login" onPress={() => router.push("/(auth)/login")} />}
    </View>
  );
};

export default VerifyFriend;
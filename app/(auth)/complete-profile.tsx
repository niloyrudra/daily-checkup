import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { auth, functions, httpsCallable } from "@/config/firebase";


const CompleteProfile: React.FC = () => {
  const [friendEmail1, setFriendEmail1] = useState<string>("");
  const [friendPhone1, setFriendPhone1] = useState<string>("");
  const [friendEmail2, setFriendEmail2] = useState<string>("");
  const [friendPhone2, setFriendPhone2] = useState<string>("");

  const handleSubmit = async () => {
    const sendFriendRequest = httpsCallable(functions, "sendFriendRequest");
    const senderEmail = auth.currentUser?.email;
    
    if (!senderEmail) {
      console.error("❌ No authenticated user.");
      return;
    }
    // Collect valid emails (remove empty ones)
    const recipientEmails = [friendEmail1, friendEmail2].filter(email => email.trim() !== "");
  
    if (recipientEmails.length === 0) {
      console.error("❌ No valid email provided.");
      return;
    }
  
    try {
      const response = await sendFriendRequest({
        senderEmail: auth.currentUser?.email,
        recipientEmails: recipientEmails,  // Ensuring an array of non-empty emails
      });
  
      console.log("✅ Function Response:", response.data);
    } catch (error) {
      console.error("❌ Function Call Failed:", error);
    }
  };

  return (
    <View>
      <Text>Complete Profile</Text>
      <Text>Friend One:</Text>
      <TextInput inputMode="email" placeholder="Friend's Email 1" onChangeText={setFriendEmail1} value={friendEmail1} />
      <TextInput inputMode="tel" placeholder="Friend's Phone number 1" onChangeText={setFriendPhone1} value={friendPhone1} />
      <Text>Friend One:</Text>
      <TextInput inputMode="email" placeholder="Friend's Email 2" onChangeText={setFriendEmail2} value={friendEmail2} />
      <TextInput inputMode="tel" placeholder="Friend's Phone number 2" onChangeText={setFriendPhone2} value={friendPhone2} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

export default CompleteProfile;

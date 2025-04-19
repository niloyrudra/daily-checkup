import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

import STYLES from "@/constants/styles";
import { Theme } from "@/constants/theme";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";


const OnboardingScreen: React.FC = () => {
  const router = useRouter();

  return (
    <AuthScreenLayout title="Daily Checkup">

      <View
        style={{
          flex: 1,
          gap: 30,
          justifyContent: "flex-start",
          paddingVertical: 20
        }}
      >

        <View style={[STYLES.childContentCentered, {gap: 10}]}>
            <FontAwesome6 name="person-circle-check" size={36} color={Theme.link} />
            <Text
                style={{
                  color: Theme.primary,
                  fontSize: 16,
                  textAlign: "center"
                }}
            >Do you wish to have the security of someone checking-up on you every morning after you wake up?</Text>
        </View>

        <View style={[STYLES.childContentCentered, {gap: 10}]}>
            <FontAwesome5 name="heart-broken" size={36} color={Theme.link} />
            <Text
                style={{
                  color: Theme.primary,
                  fontSize: 16,
                  textAlign: "center"
                }}
            >
                What would happen to you or your baby/pet if one day you don't?
            </Text>
        </View>

        <View style={[STYLES.childContentCentered, {gap: 10}]}>
            <FontAwesome5 name="hands-helping" size={36} color={Theme.link} />
            <Text
                style={{
                  color: Theme.primary,
                  fontSize: 16,
                  textAlign: "center"
                }}
            >
                We will text you daily at your appointed time. If we don't hear back from you we will alert your emergency contact.
            </Text>
        </View>

      </View>

      {/* Submit Button */}
      <ActionPrimaryButton
        buttonTitle="Continue"
        onSubmit={() => router.push("/(auth)/register/user-info")}
      />

    </AuthScreenLayout>
  );
};

export default OnboardingScreen;
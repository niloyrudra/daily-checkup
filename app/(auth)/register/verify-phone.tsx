import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import STYLES from "@/constants/styles";
import SIZES from "@/constants/size";
import { Theme } from "@/constants/theme";

const BASE_URL = process.env.BASE_URL || "";

const phoneSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +1234567890)")
    .required("Phone number is required"),
  code: Yup.string()
    .min(4, "Code too short")
    .max(8, "Code too long"),
});

const errorMap: Record<number, string> = {
  21408: "We are not allowed to send SMS to this country.",
  21610: "User has opted out of messages. They must reply START to receive messages again.",
  21614: "Invalid phone number. Please use the E.164 format.",
  20429: "Too many OTP requests. Please wait a while.",
  60200: "Invalid phone number format.",
  60203: "Your phone number is blacklisted.",
  20404: "Verification SID not found or deleted.",
};

const getErrorMessage = (error: any): string => {
  if (error?.code && errorMap[error.code]) return errorMap[error.code];
  if (error?.message) return error.message;
  return "An unexpected error occurred.";
};

const PhoneAuthScreen: React.FC = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"enterPhone" | "enterCode">("enterPhone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSendCode = async (phone: string) => {
    if (!user) return Alert.alert("Invalid User");
    setLoading(true);
    try {
      setPhoneNumber(phone);

      const response = await fetch(`${BASE_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phoneNumber: phone,
        phoneNumberVerified: false,
      });

      setStep("enterCode");

      if (data?.error?.status === 400) {
        Alert.alert(getErrorMessage(data.error));
      }

    
    } catch (error) {
      console.error("Send OTP failed:", error);
      Alert.alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!user) return Alert.alert("Invalid User");
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp: code }),
      });

      const data = await response.json();

      if (data.success) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          phoneNumber,
          phoneNumberVerified: true,
        });
        Alert.alert("Success", "Phone number verified!");
        router.push("/(auth)/register/contacts-verification");
      } else {
        throw new Error("Invalid code");
      }
    } catch (error) {
      console.error("Verify OTP failed:", error);
      Alert.alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneInput = (values: any, handleChange: any, errors: any, touched: any) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Phone Number:</Text>
      <TextInputComponent
        placeholder="+1234567890"
        value={values.phone}
        onChange={handleChange("phone")}
        keyboardType="phone-pad"
        isPassword={false}
      />
      {touched.phone && errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
      <ActionPrimaryButton buttonTitle="Send Code" onSubmit={() => handleSendCode(values.phone)} isLoading={loading} />
    </View>
  );

  const renderCodeInput = (values: any, handleChange: any, errors: any, touched: any) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Enter Code:</Text>
      <TextInputComponent
        placeholder="123456"
        value={values.code}
        onChange={handleChange("code")}
        keyboardType="number-pad"
      />
      {touched.code && errors.code && <Text style={styles.error}>{errors.code}</Text>}
      <ActionPrimaryButton buttonTitle="Verify Code" onSubmit={() => handleVerifyCode(values.code)} isLoading={loading} />
    </View>
  );

  return (
    <AuthScreenLayout title="Phone Number Verification">
      <TouchableOpacity onPress={() => router.push("/(auth)/register/contacts-verification")} style={styles.skipButton}>
        <Text style={{fontSize: SIZES.contentText}}>SKIP</Text>
      </TouchableOpacity>

      <Formik
        initialValues={{ phone: "", code: "" }}
        validationSchema={phoneSchema}
        onSubmit={() => {}}
      >
        {({ handleChange, values, errors, touched }) => (
          <View style={STYLES.container}>
            {step === "enterPhone"
              ? renderPhoneInput(values, handleChange, errors, touched)
              : renderCodeInput(values, handleChange, errors, touched)}
          </View>
        )}
      </Formik>
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    gap: 20,
    width: SIZES.screenBodyWidth,
  },
  label: {
    fontSize: SIZES.title,
    color: Theme.primary
  },
  error: {
    color: "red",
    fontSize: SIZES.contentText,
  },
  skipButton: {
    position: "absolute",
    right: 20,
    top: 30,
  },
});

export default PhoneAuthScreen;

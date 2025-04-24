import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db, functions, httpsCallable,  } from "@/config/firebase";

import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import STYLES from "@/constants/styles";

const F_BASE_API_KEY = process.env.FIREBASE_API_KEY;

const phoneSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +1234567890)")
    .required("Phone number is required"),
  code: Yup.string()
    .min(4, "Code too short")
    .max(8, "Code too long"),
});

const PhoneAuthScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [step, setStep] = useState<'enterPhone' | 'enterCode'>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // console.log("F_BASE:", F_BASE_API_KEY)
  // console.log("user:", auth.currentUser)

  const handleSendCode = async (phone: string) => {
    setLoading(true);
    try {
      // Ensure user is signed in
      const user = auth.currentUser;
      if (!user) throw new Error("User must be signed in");
  
      // Call your Firebase Function
      const sendOtp = httpsCallable<{ phoneNumber: string }, { success: boolean }>(
        functions,
        "sendOtpToPhone"
      );
      const res = await sendOtp({ phoneNumber: phone });
      if (res.data.success) {
        setPhoneNumber(phone);
        setStep("enterCode");
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (err: any) {
      Alert.alert("Error sending OTP", err.message || "Unable to send code");
    } finally {
      setLoading(false);
    }
  };
  

  const handleVerifyCode = async (otpCode: string) => {
    if (!phoneNumber) return;
    setLoading(true);
    try {
      // Ensure user is signed in
      const user = auth.currentUser;
      if (!user) throw new Error("User must be signed in");
  
      // Call your Firebase Function
      const verifyOtp = httpsCallable<{ code: string }, { success: boolean }>(
        functions,
        "verifyOtpCode"
      );
      const res = await verifyOtp({ code: otpCode });
      if (res.data.success) {
        // Mark in Firestore
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
    } catch (err: any) {
      Alert.alert("Error verifying OTP", err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };
  

  // const handleSendCode = async (phone: string) => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.post(
  //       `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${F_BASE_API_KEY}`,
  //       {
  //         phoneNumber: phone,
  //         recaptchaToken: 'unused',
  //       }
  //     );
  //     setPhoneNumber(phone); // Store to reuse later
  //     setSessionInfo(response.data.sessionInfo);
  //     console.log("Send Code Res:", response)
  //     setStep('enterCode');
  //   } catch (err: any) {
  //     Alert.alert('Error sending OTP', err.response?.data?.error?.message || err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVerifyCode = async (otpCode: string) => {
  //   if (!sessionInfo) return;

  //   setLoading(true);
  //   try {
  //     // 🔐 Verify the OTP and sign in
  //     const verificationRes = await axios.post(
  //       `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${F_BASE_API_KEY}`,
  //       {
  //         sessionInfo,
  //         code: otpCode,
  //       }
  //     );

  //     // console.log("verificationRes:", verificationRes)
  //     const { idToken, localId: uid, phoneNumber: verifiedPhoneNumber } = verificationRes.data;

  //     const user = auth.currentUser

  //     // ✅ Update Firestore
  //     const userRef = doc(db, "users", user?.uid);
  //     await updateDoc(userRef, {
  //       phoneNumber: verifiedPhoneNumber,
  //       phoneNumberVerified: true,
  //     });

  //     Alert.alert('Success', 'Phone number verified and saved!');
  //     router.push("/(auth)/register/contacts-verification");

  //   } catch (err: any) {
  //     Alert.alert('Error verifying OTP', err.response?.data?.error?.message || err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <AuthScreenLayout title="Phone Number Verification">
      <TouchableOpacity onPress={() => router.push("/(auth)/register/contacts-verification")} style={{ position: "absolute", right: 20, top: 40 }}>
        <Text>SKIP</Text>
      </TouchableOpacity>

      <Formik
        initialValues={{ phone: "", code: "" }}
        validationSchema={phoneSchema}
        onSubmit={(values) => {
          if (step === 'enterPhone') {
            handleSendCode(values.phone);
          } else {
            handleVerifyCode(values.code);
          }
        }}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <View style={STYLES.container}>
            {step === 'enterPhone' ? (
              <View style={{ gap: 20 }}>
                <View>
                  <Text style={{ marginBottom: 15 }}>Phone Number:</Text>
                  <TextInputComponent
                    placeholder="+1234567890"
                    value={values.phone}
                    onChange={handleChange("phone")}
                    keyboardType="phone-pad"
                    isPassword={false}
                  />
                  {touched.phone && errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
                </View>
                <ActionPrimaryButton
                  buttonTitle="Send Code"
                  onSubmit={handleSubmit}
                  isLoading={loading}
                />
              </View>
            ) : (
              <View style={{ gap: 20 }}>
                <View>
                  <Text style={{ marginBottom: 15 }}>Enter Code:</Text>
                  <TextInputComponent
                    placeholder="123456"
                    value={values.code}
                    onChange={handleChange("code")}
                    keyboardType="number-pad"
                  />
                  {touched.code && errors.code && <Text style={styles.error}>{errors.code}</Text>}
                </View>
                <ActionPrimaryButton
                  buttonTitle="Verify Code"
                  onSubmit={handleSubmit}
                  isLoading={loading}
                />
              </View>
            )}
          </View>
        )}
      </Formik>
    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {},
  error: {
    color: "red",
    fontSize: 12,
  },
});

export default PhoneAuthScreen;
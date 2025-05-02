import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
// import axios from "axios";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db  } from "@/config/firebase";

import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import STYLES from "@/constants/styles";
import { BASE_URL } from "@/config/config";
import SIZES from "@/constants/size";

// const F_BASE_API_KEY = process.env.FIREBASE_API_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SendOtpErrType {status: number, code: number | null, moreInfo: string}

interface ErrorMsg {
  21408: string,
  21610: string,
  21614: string,
  20429: string,
  60200: string,
  60203: string,
  20404: string,
};

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
  const user = auth.currentUser;
  const [loading, setLoading] = useState<boolean>(false);
  // const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [step, setStep] = useState<'enterPhone' | 'enterCode'>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');


  const handleSendCode = async (phoneNumber: string) => {
    if(!user) return Alert.alert("Invalid User")
    setLoading(true)
    try {
      setPhoneNumber( prevValue => prevValue = phoneNumber )
      const response = await fetch(`${BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });
  
      // const data = await response.json();
      const data = await response.json();
      setStep("enterCode");

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phoneNumber,
        phoneNumberVerified: false,
      });

      if( data?.error?.status === 400 ) {
        const errorMap: ErrorMsg = {
          21408: 'We are not allowed to send SMS to this country.',
          21610: 'User has opted out of messages (replied STOP). They must reply START to your Twilio number to allow messages again.',
          21614: 'Invalid phone number. Please verify it is a real mobile number in E.164 format.',
          20429: 'Too many OTP requests. Please wait a while before trying again.',
          60200: 'Invalid phone number format.',
          60203: 'Your phone number is blacklisted.',
          20404: 'Verification SID not found or deleted.',
        };
        const userMessage = errorMap[data?.error?.code] || data?.message;
        Alert.alert(userMessage)
      }

      // return data;
    } catch (error: any | SendOtpErrType) {
      console.error('Send OTP failed:', error);
      const errorMap: ErrorMsg = {
        21408: 'We are not allowed to send SMS to this country.',
        21610: 'User has opted out of messages (replied STOP). They must reply START to your Twilio number to allow messages again.',
        21614: 'Invalid phone number. Please verify it is a real mobile number in E.164 format.',
        20429: 'Too many OTP requests. Please wait a while before trying again.',
        60200: 'Invalid phone number format.',
        60203: 'Your phone number is blacklisted.',
        20404: 'Verification SID not found or deleted.',
      };
      const userMessage = errorMap[error?.code] || error.message;
      Alert.alert(userMessage)

    }
    finally {
      setLoading(false)
    }
  };

  const handleVerifyCode = async (otp: string) => {
    if(!user) return Alert.alert("Invalid User")
    setLoading(true)
    try {
      
      if (!user) throw new Error("User must be signed in");
      const response = await fetch(`${BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
  
      const data = await response.json();
      // return data;

      // const res = await verifyOtp({ code: otpCode });
      if (data.success) {
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

    } catch (error) {
      console.error('Verify OTP failed:', error);
      return { success: false };
    }
    finally {
      setLoading(false)
    }
  };

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
              <View style={{ gap: 20, width: SIZES.screenBodyWidth }}>
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
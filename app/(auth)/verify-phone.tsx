import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { auth, PhoneAuthProvider, RecaptchaVerifier, signInWithCredential, signInWithPhoneNumber } from "@/config/firebase";
import { Formik } from "formik";
import * as Yup from "yup";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import STYLES from "@/constants/styles";

const phoneSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +1234567890)")
    .required("Phone number is required"),
  code: Yup.string()
    .min(11, "Code must be 11 digits")
    .max(13, "Code must be 11 digits"),
});

const PhoneAuth: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const router = useRouter();

  const handleSendCode = async (phone: string) => {
    setLoading(true)
    try {
      // const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      //   size: "invisible",
      // });
      // const confirmation = await signInWithPhoneNumber(auth, phone, verifier);

      // ✅ Use this instead:
      const confirmation = await signInWithPhoneNumber(auth, phone);

      setVerificationId(confirmation.verificationId);
      Alert.alert("OTP Sent", "Check your SMS for the verification code.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert("Error", "Failed to send verification code.");
    }
    finally {
      setLoading(false)
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!verificationId || !code) return;
    setLoading(true)
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      Alert.alert("Success", "Phone number verified!");
      router.push("/auth/contacts-verification");
    } catch (error) {
      console.error("Error verifying code:", error);
      Alert.alert("Verification Failed", "Invalid or expired code.");
    }
    finally {
      setLoading(false)
    }
  };

  return (
    <AuthScreenLayout
      title="Phone Number Verification"
    >

      <TouchableOpacity onPress={() => router.push("/(auth)/contacts-verification")} style={{position:"absolute", right: 20, top: 40}}><Text>SKIP</Text></TouchableOpacity>

      <Formik
        initialValues={{ phone: "", code: "" }}
        validationSchema={phoneSchema}
        onSubmit={(values) => {
          if (!verificationId) {
            handleSendCode(values.phone);
          } else {
            handleVerifyCode(values.code);
          }
        }}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <View style={STYLES.container}>
            {!verificationId ? (
              <View
                style={{
                  gap: 20
                }}
              >
                <View>
                  <Text style={{marginBottom: 15}}>Phone Number:</Text>

                  <TextInputComponent
                    placeholder="+1234567890"
                    value={values.phone}
                    onChange={handleChange("phone")}
                    keyboardType="phone-pad"
                    isPassword={false}
                  />

                  {touched.phone && errors.phone && (<Text style={styles.error}>{errors.phone}</Text>)}
                
                </View>

                {/* Submit Button */}
                <ActionPrimaryButton
                  buttonTitle="Send Code"
                  onSubmit={handleSubmit}
                  isLoading={loading}
                />
              </View>
            ) : (
              <View
                style={{
                  gap: 20
                }}
              >
                <View>
                  <Text style={{marginBottom: 15}}>Enter Code:</Text>

                  <TextInputComponent
                    placeholder="123456"
                    value={values.code}
                    onChange={handleChange("code")}
                    keyboardType="number-pad"
                  />

                  {touched.code && errors.code && (<Text style={styles.error}>{errors.code}</Text>)}

                </View>

                {/* Submit Button */}
                <ActionPrimaryButton
                  buttonTitle="Verify Code"
                  onSubmit={handleSubmit}
                  isLoading={loading}
                />

              </View>
            )}

            {/* Invisible Recaptcha container */}
            <View id="recaptcha-container" />
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

export default PhoneAuth;
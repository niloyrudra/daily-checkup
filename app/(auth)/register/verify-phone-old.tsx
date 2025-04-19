import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import STYLES from "@/constants/styles";

import axios from 'axios';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

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

  const FB_API_KEY = process.env.FIREBASE_API_KEY;
  
  console.log(FB_API_KEY)
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  // const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [step, setStep] = useState<'enterPhone' | 'enterCode'>('enterPhone');

  const handleSendCode = async ({phoneNumber}: {phoneNumber: string}) => {
    setLoading(true);
    // console.log(FB_API_KEY)
    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${FB_API_KEY}`,
        {
          phoneNumber,
          recaptchaToken: 'unused', // not needed in bare workflow, but still required in body
        }
      );
      setSessionInfo(response.data.sessionInfo);
      
      setStep('enterCode');
    } catch (err: any) {
      Alert.alert('Error sending OTP', err.response?.data?.error?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async ({otpCode}: {otpCode: string}) => {
    setLoading(true);
    try {
      // 🔐 Verify the OTP and sign in
      const verificationRes = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${FB_API_KEY}`,
        {
          sessionInfo,
          code: otpCode,
        }
      );

      const { idToken, localId: uid, phoneNumber: verifiedPhoneNumber } = verificationRes.data;

      // 🔗 Link phone to existing account (optional if already linked)
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FB_API_KEY}`,
        {
          idToken,
          phoneNumber: verifiedPhoneNumber,
          returnSecureToken: false,
        }
      );

      // ✅ Update user data in Firestore using Firebase SDK (your preferred method)
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        phoneNumber: verifiedPhoneNumber,
        phoneNumberVerified: true,
      });

      Alert.alert('Success', 'Phone number verified and updated!');
    } catch (err: any) {
      Alert.alert('Error verifying OTP', err.response?.data?.error?.message || err.message);
    } finally {
      setLoading(false);
    }

  };


  // const handleSendCode = async (phoneNumber: string) => {
  //   setLoading(true)
  //   try {
  //     const response = await fetch(
  //       `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${API_KEY}`,
  //       {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           phoneNumber,
  //           recaptchaToken: "unused" // Not required in this flow
  //         }),
  //       }
  //     );
    
  //     const data = await response.json();
  //     console.log('Verification ID:', data.sessionInfo);
  //     setSessionInfo( sessionDataValue => sessionDataValue = data.sessionInfo)
  //     return data.sessionInfo;
  //   }
  //   catch (error: any) {
  //     console.log("Send OTP Error:", error.message)
  //   }
  //   finally {
  //     setLoading(false)
  //   }
  // };

  // const handleVerifyCode = async (code: string) => {
  //   if( !sessionInfo ) return;
  //   setLoading(true)
  //   try {
  //     const response = await fetch(
  //       `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${API_KEY}`,
  //       {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           code,
  //           sessionInfo
  //         }),
  //       }

        
  //     );
    
  //     const data = await response.json();
  //     if (data.idToken) {
  //       console.log("User verified and signed in!");
  //     } else {
  //       throw new Error(data.error?.message || "Verification failed");
  //     }
  //   }
  //   catch (error: any) {
  //     console.log("Verify OTP Code Error:", error.message)
  //   }
  //   finally {
  //     setLoading(false)
  //   }

  // };
  

  // const handleSendCode = async (phone: string) => {
  //   setLoading(true);
  //   try {
  //     const confirmation = await auth().signInWithPhoneNumber(phone);
  //     setVerificationId(confirmation.verificationId);
  //     Alert.alert("OTP Sent", "Check your phone for the verification code.");
  //   } catch (error: any) {
  //     console.error("Send Code Error:", error);
  //     Alert.alert("Error", error.message || "Failed to send code.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVerifyCode = async (code: string) => {
  //   if (!verificationId) return;
  //   setLoading(true);
  //   try {
  //     const credential = PhoneAuthProvider.credential(verificationId, code);
  //     const currentUser = auth().currentUser;
  
  //     if (currentUser) {
  //       await currentUser.linkWithCredential(credential); // ✅ Link instead of sign in
  //       Alert.alert("Success", "Phone number linked to your account!");
  //       router.push("/(auth)/register/contacts-verification");
  //     } else {
  //       Alert.alert("Error", "No user is currently signed in.");
  //     }
  //   } catch (error: any) {
  //     console.error("Verification Error:", error);
  //     Alert.alert("Verification Failed", error.message || "Invalid or expired code.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVerifyCode = async (code: string) => {
  //   if (!verificationId) return;
  //   setLoading(true);
  //   try {
  //     const credential = PhoneAuthProvider.credential(verificationId, code);
  //     await auth().signInWithCredential(credential);
  //     Alert.alert("Success", "Phone number verified!");
  //     router.push("/(auth)/register/contacts-verification");
  //   } catch (error: any) {
  //     console.error("Verification Error:", error);
  //     Alert.alert("Verification Failed", error.message || "Invalid or expired code.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

  // const handleSendCode = async (phone: string) => {
  //   setLoading(true)
  //   try {
  //     const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  //       size: "invisible",
  //     });
  //     const confirmation = await signInWithPhoneNumber(auth, phone, verifier);

  //     // ✅ Use this instead:
  //     // const confirmation = await signInWithPhoneNumber(auth, phone);

  //     setVerificationId(confirmation.verificationId);
  //     Alert.alert("OTP Sent", "Check your SMS for the verification code.");
  //   } catch (error) {
  //     console.error("Error sending OTP:", error);
  //     Alert.alert("Error", "Failed to send verification code.");
  //   }
  //   finally {
  //     setLoading(false)
  //   }
  // };

  // const handleVerifyCode = async (code: string) => {
  //   if (!verificationId || !code) return;
  //   setLoading(true)
  //   try {
  //     const credential = PhoneAuthProvider.credential(verificationId, code);
  //     await signInWithCredential(auth, credential);
  //     Alert.alert("Success", "Phone number verified!");
  //     router.push("/(auth)/register/contacts-verification");
  //   } catch (error) {
  //     console.error("Error verifying code:", error);
  //     Alert.alert("Verification Failed", "Invalid or expired code.");
  //   }
  //   finally {
  //     setLoading(false)
  //   }
  // };

  return (
    <AuthScreenLayout
      title="Phone Number Verification"
    >

      <TouchableOpacity onPress={() => router.push("/(auth)/register/contacts-verification")} style={{position:"absolute", right: 20, top: 40}}><Text>SKIP</Text></TouchableOpacity>

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
            {/* {!verificationId ? ( */}
            {step === 'enterPhone' ? (
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
            {/* <View id="recaptcha-container" /> */}
            
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
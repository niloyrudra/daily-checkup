import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  db,
} from "@/config/firebase";

// import auth, { PhoneAuthProvider, signInWithCredential } from '@react-native-firebase/auth';

import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import STYLES from "@/constants/styles";
import SIZES from "@/constants/size";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import TitleComponent from "@/components/TitleComponent";
import { doc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { BASE_URL } from "@/config/config";

const F_BASE_API_KEY = process.env.FIREBASE_API_KEY;

const validationSchema = Yup.object().shape({
  contacts: Yup.array()
    .of(
      Yup.object().shape({
        number: Yup.string()
          .matches(
            /^\+[1-9]\d{1,14}$/,
            "Phone must be in international format (e.g. +1234567890)"
          )
          .required("Phone number is required"),
        code: Yup.string(),
        verificationId: Yup.string().nullable(),
        verified: Yup.boolean(),
      })
    )
    .min(1, "At least one contact is required"),
});

const phoneSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  phone: Yup.string()
    .matches(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g. +1234567890)")
    .required("Phone number is required"),
  code: Yup.string()
    .min(4, "Code too short")
    .max(8, "Code too long"),
});

const ContactsVerification: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [step, setStep] = useState<'enterPhone' | 'enterCode'>('enterPhone');
  const [contactName, setContactName] = useState<string | null>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');


  const handleContactName = async (name: string) => {
    try {
      setContactName(prevValue => prevValue = name)
    }
    catch(error: any) {
      console.error("Name handling Error:", error)
    }
  }

    const handleSendCode = async (phoneNumber: string) => {
      setLoading(true)
      try {
        setPhoneNumber( prevValue => prevValue = phoneNumber )
        const response = await fetch(`${BASE_URL}/api/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneNumber }),
        });
    
        const data = await response.json();
        setStep("enterCode");
        return data;
      } catch (error) {
        console.error('Send OTP failed:', error);
        return { success: false };
      }
      finally {
        setLoading(false)
      }
    };
  
    const handleVerifyCode = async (otp: string) => {
      setLoading(true)
      try {
        const user = auth.currentUser;
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
          router.push("/(auth)/register/membership");
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

  // const handleSendCode = async (
  //   number: string,
  //   index: number,
  //   setFieldValue: (field: string, value: any) => void
  // ) => {
  //   try {
  //     setLoading(true);
  //       const response = await axios.post(
  //         `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${F_BASE_API_KEY}`,
  //         {
  //           phoneNumber: number,
  //           recaptchaToken: 'unused',
  //         }
  //       );
  //       setPhoneNumber(number); // Store to reuse later
  //       setSessionInfo(response.data.sessionInfo);
  //       console.log("Send Code Res:", response)
  //       setStep('enterCode');
  //       setFieldValue(`contacts[${index}].data.sessionInfo`, response.data.sessionInfo);
        
  //     // const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  //     //   size: "invisible",
  //     // });

  //     // const confirmation = await signInWithPhoneNumber(auth, number, verifier);
  //     // setFieldValue(`contacts[${index}].verificationId`, confirmation.verificationId);

  //     Alert.alert("Code Sent", "The contact should receive the verification code.");
  //   } catch (error: any) {
  //     Alert.alert('Error sending OTP', error.response?.data?.error?.message || error.message);
  //     Alert.alert("Error", "Failed to send code. Please check the number.");
  //   }
  //   finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVerifyCode = async (
  //   contact: any,
  //   index: number,
  //   values: any,
  //   setFieldValue: (field: string, value: any) => void
  // ) => {
  //   const { verificationId, code } = contact;
  //   if (!verificationId || !code) {
  //     return Alert.alert("Missing Info", "Verification code or ID is missing.");
  //   }

  //   if (!sessionInfo) return;
  
  //   setLoading(true);
  //   try {
  //     // 🔐 Verify the OTP and sign in
  //     const verificationRes = await axios.post(
  //       `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${F_BASE_API_KEY}`,
  //       {
  //         sessionInfo,
  //         code: values.code //otpCode,
  //       }
  //     );

  //     // console.log("verificationRes:", verificationRes)
  //     const { idToken, localId: uid, phoneNumber: verifiedPhoneNumber } = verificationRes.data;
    
  //     const user = auth.currentUser
  
  //       // ✅ Update Firestore
  //       const userRef = doc(db, "users", user?.uid);
  //       await updateDoc(userRef, {
  //         phoneNumber: verifiedPhoneNumber,
  //         phoneNumberVerified: true,
  //       });
  
  //       Alert.alert('Success', 'Phone number verified and saved!');
  //       router.push("/(auth)/register/contacts-verification");
  //     // const credential = PhoneAuthProvider.credential(verificationId, code);
  //     // await signInWithCredential(auth, credential);

  //     setFieldValue(`contacts[${index}].verified`, true);
  //     Alert.alert("Verified", `Contact #${index + 1} verified.`);

  //     const allVerified = values.contacts.every((c: any) => c.verified);
  //     if (allVerified) {
  //       router.push("/(auth)/register/membership");
  //     }
  //   } catch (err: any) {
  //     Alert.alert('Error verifying OTP', err.response?.data?.error?.message || err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
 
  return (
    <AuthScreenLayout title="Contact(s) Verification">

      <TouchableOpacity onPress={() => router.push("/(auth)/register/membership")} style={{ position: "absolute", right: 20, top: 40 }}>
        <Text>SKIP</Text>
      </TouchableOpacity>

      <View style={{marginBottom: 30}}>
        <Text>Tell us the name and mobile number of your emergency contacts (It can be your neighbor, a relative or a friend).</Text>
      </View>

      <Formik
        initialValues={{ name1: "", phone1: "", code1: "" }}
        validationSchema={phoneSchema}
        onSubmit={(values) => {
          if (step === 'enterPhone') {
            handleSendCode(values.phone1);
          } else {
            handleVerifyCode(values.code1);
          }
        }}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <View style={STYLES.container}>
            {step === 'enterPhone' ? (
              <View style={{ gap: 20, width: SIZES.screenBodyWidth }}>
                <TitleComponent title="#1. Contact information:" />
                <View>
                  <Text style={{ marginBottom: 15 }}>#1. contact Name:</Text>
                  <TextInputComponent
                    placeholder="Name"
                    value={values.name1}
                    onChange={handleContactName}
                    // keyboardType="phone-pad"
                    isPassword={false}
                  />
                  {touched.name1 && errors.name1 && <Text style={styles.error}>{errors.name1}</Text>}
                </View>
                <View>
                  <Text style={{ marginBottom: 15 }}>Phone Number:</Text>
                  <TextInputComponent
                    placeholder="+1234567890"
                    value={values.phone1}
                    onChange={handleChange("phone")}
                    keyboardType="phone-pad"
                    isPassword={false}
                  />
                  {touched.phone1 && errors.phone1 && <Text style={styles.error}>{errors.phone1}</Text>}
                </View>
                <ActionPrimaryButton
                  buttonTitle="Send Code"
                  onSubmit={handleSubmit}
                  isLoading={loading}
                />
              </View>
            ) : (
              <View style={{ gap: 20, width: SIZES.screenBodyWidth }}>
                <View>
                  <Text style={{ marginBottom: 15 }}>Enter Code:</Text>
                  <TextInputComponent
                    placeholder="123456"
                    value={values.code1}
                    onChange={handleChange("code")}
                    keyboardType="number-pad"
                  />
                  {touched.code1 && errors.code1 && <Text style={styles.error}>{errors.code1}</Text>}
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

      {/* <Formik
        initialValues={{
          contacts: [{ number: "", verificationId: "", code: "", verified: false }],
        }}
        validationSchema={validationSchema}
        onSubmit={() => {}}
      >
      {({ values, handleChange, setFieldValue, errors, touched }) => (
        <ScrollView contentContainerStyle={{flex:1}}>

          <View
            style={{
              gap: 20,
              width: SIZES.screenBodyWidth
            }}
          >

            <TitleComponent title="Verify Emergency Contacts" />

            <FieldArray name="contacts">
              {({ push }) => (
              <>
                {values.contacts.map((contact, index) => (
                  <View key={index} style={styles.contactBlock}>
                    
                    <Text>Contact #{index + 1}</Text>

                    <TextInputComponent
                      placeholder="+1234567890"
                      keyboardType="phone-pad"
                      value={contact.number}
                      // editable={!contact.verified}
                      onChange={handleChange(`contacts[${index}].number`)}
                    />
                      {touched.contacts?.[index]?.number &&
                      errors.contacts?.[index]?.number && (
                        <Text style={styles.error}>
                          {errors.contacts[index].number}
                        </Text>
                      )}

                      {!contact.verified && (
                      <>
                        <ActionPrimaryButton
                          buttonTitle="Send Code"
                          buttonStyle={{width: "auto"}}
                          onSubmit={() =>
                            handleSendCode(contact.number, index, setFieldValue)
                          }
                        />

                          {contact.verificationId && (
                          <>
                            <TextInputComponent
                              placeholder="Enter OTP"
                              keyboardType="number-pad"
                              value={contact.code}
                              onChange={handleChange(`contacts[${index}].code`)}
                            />

                            <ActionPrimaryButton
                              buttonTitle="Verify Code"
                              onSubmit={() =>
                                handleVerifyCode(contact, index, values, setFieldValue)
                              }
                            />

                          </>
                          )}
                      </>
                      )}

                      {contact.verified && (
                        <Text style={styles.successText}>✅ Verified</Text>
                      )}
                  </View>
                  ))}

                  <ActionPrimaryButton
                    buttonTitle="Add Another Contact"
                    onSubmit={() =>
                      push({
                        number: "",
                        verificationId: "",
                        code: "",
                        verified: false,
                      })
                    }
                  />
              </>
              )}
            </FieldArray>


          </View>

        </ScrollView>
      )}
      </Formik> */}

    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  contactBlock: {
    marginBottom: 25,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    gap: 20
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
  successText: {
    color: "green",
    fontWeight: "bold",
    marginTop: 10,
  },
});

export default ContactsVerification;
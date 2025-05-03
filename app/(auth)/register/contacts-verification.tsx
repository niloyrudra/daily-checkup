import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
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

const BASE_URL = process.env.BASE_URL || "";

const phoneSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name requires two characters minimum.")
    .required("Name is required"),
  phone: Yup.string()
    .matches(/^\+[1-9]\d{1,14}$/, "Phone must be in E.164 format (e.g. +1234567890)")
    .required("Phone is required"),
  code: Yup.string()
    .min(4, "Code too short")
    .max(8, "Code too long"),
});

const errorMap: Record<number, string> = {
  21408: "SMS not allowed to this country.",
  21610: "User opted out. Reply START to re-enable.",
  21614: "Invalid phone number.",
  20429: "Too many OTP requests. Please wait.",
  60200: "Invalid format.",
  60203: "Blacklisted number.",
  20404: "Verification SID not found.",
};

const getErrorMessage = (error: any): string => {
  if (error?.code && errorMap[error.code]) return errorMap[error.code];
  if (error?.message) return error.message;
  return "Unexpected error occurred.";
};

const ContactsVerificationScreen: React.FC = () => {
  const router = useRouter();
  const user = auth.currentUser;

  const [loading1, setLoading1] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);

  const [step1, setStep1] = useState<"enterPhone" | "enterCode">("enterPhone");
  const [step2, setStep2] = useState<"enterPhone" | "enterCode">("enterPhone");

  const [contact1Name, setContact1Name] = useState<string>("");
  const [contact1Phone, setContact1Phone] = useState<string>("");
  const [contact2Name, setContact2Name] = useState<string>("");
  const [contact2Phone, setContact2Phone] = useState<string>("");

  const handleSendCode = async (phone: string, name: string, contactKey: "contact1" | "contact2") => {
    if (!user) return Alert.alert("Invalid user");
    if( contactKey === "contact1" ) setLoading1(true);
    else setLoading2(true);

    try {
      const response = await fetch(`${BASE_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data?.error?.status === 400) {
        Alert.alert(getErrorMessage(data.error));
        // return;
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`contactNumbers.${contactKey}.contactName`]: name,
        [`contactNumbers.${contactKey}.phoneNumber`]: phone,
        [`contactNumbers.${contactKey}.verified`]: false,
      });

      if (contactKey === "contact1") {
        setContact1Name(name);
        setContact1Phone(phone);
        setStep1("enterCode");
      } else {
        setContact2Name(name);
        setContact2Phone(phone);
        setStep2("enterCode");
      }
    } catch (error) {
      console.error("Send OTP failed:", error);
      Alert.alert(getErrorMessage(error));
    } finally {
      if( contactKey === "contact1" ) setLoading1(false);
      else setLoading2(false);
    }
  };

  const handleVerifyCode = async (code: string, contactKey: "contact1" | "contact2", phone: string) => {
    if (!user) return Alert.alert("Invalid user");
    if( contactKey === "contact1" ) setLoading1(true);
    else setLoading2(true);

    try {
      const response = await fetch(`${BASE_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, otp: code }),
      });

      const data = await response.json();

      if (data.success) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [`contactNumbers.${contactKey}.verified`]: true,
        });

        Alert.alert("Success", `${contactKey === "contact1" ? "Primary" : "Secondary"} number verified!`);
        
        if (contactKey === "contact1") setStep1("enterCode");
        else setStep2("enterCode");

      } else {
        throw new Error("Invalid code");
      }
    } catch (error) {
      console.error("Verify OTP failed:", error);
      Alert.alert(getErrorMessage(error));
    } finally {
      if( contactKey === "contact1" ) setLoading1(false);
      else setLoading2(false);
    }
  };

  const renderContactInput = (
    step: "enterPhone" | "enterCode",
    contactKey: "contact1" | "contact2",
    storedName: string,
    setStoredName: (v: string) => void,
    storedPhone: string,
    setStoredPhone: (v: string) => void,
    stepSetter: (v: "enterPhone" | "enterCode") => void
  ) => (
    <Formik
      initialValues={{ name: "", phone: "", code: "" }}
      validationSchema={phoneSchema}
      onSubmit={() => {}}
    >
      {({ handleChange, values, errors, touched }) => (
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {contactKey === "contact1" ? "Primary Contact Number" : "Secondary Contact Number"}
          </Text>

          {step === "enterPhone" ? (
            <>
              
              <TextInputComponent
                placeholder="Name"
                value={values.name}
                onChange={handleChange("name")}
                isPassword={false}
              />
              {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}
              
              <TextInputComponent
                placeholder="+1234567890"
                value={values.phone}
                onChange={handleChange("phone")}
                keyboardType="phone-pad"
                isPassword={false}
              />
              {touched.phone && errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
              
              <ActionPrimaryButton
                buttonTitle="Send Code"
                onSubmit={() => {
                  setStoredName(values.name);
                  setStoredPhone(values.phone);
                  handleSendCode(values.phone, values.name, contactKey);
                }}
                isLoading={(contactKey === "contact1" ? loading1 : loading2)}
              />
            </>
          ) : (
            <>
              <TextInputComponent
                placeholder="123456"
                value={values.code}
                onChange={handleChange("code")}
                keyboardType="number-pad"
              />
              {touched.code && errors.code && <Text style={styles.error}>{errors.code}</Text>}
              <ActionPrimaryButton
                buttonTitle="Verify Code"
                onSubmit={() => handleVerifyCode(values.code, contactKey, storedPhone)}
                isLoading={(contactKey === "contact1" ? loading1 : loading2)}
              />
            </>
          )}
        </View>
      )}
    </Formik>
  );

  return (
    <AuthScreenLayout title="Emergency Contacts">
      <TouchableOpacity onPress={() => router.push("/(auth)/register/membership")} style={styles.skipButton}>
        <Text style={{fontSize: SIZES.contentText}}>SKIP</Text>
      </TouchableOpacity>

      <ScrollView style={{flex:1}}>
        
        <View style={STYLES.container}>
          {renderContactInput(step1, "contact1", contact1Name, setContact1Name, contact1Phone, setContact1Phone, setStep1)}
          <View style={{ height: 40 }} />
          {renderContactInput(step2, "contact2", contact2Name, setContact2Name, contact2Phone, setContact2Phone, setStep2)}
        </View>

      </ScrollView>

    </AuthScreenLayout>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    gap: 20,
    width: SIZES.screenBodyWidth,
  },
  label: {
    fontWeight: "600",
    fontSize: SIZES.title
  },
  error: {
    color: "red",
    fontSize: SIZES.contentText
  },
  skipButton: {
    position: "absolute",
    right: 20,
    top: 30,
    fontSize: SIZES.contentText
  },
});

export default ContactsVerificationScreen;
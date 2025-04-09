import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  StyleSheet,
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
} from "@/config/firebase";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import STYLES from "@/constants/styles";
import SIZES from "@/constants/size";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import TitleComponent from "@/components/TitleComponent";

const ContactsVerification: React.FC = () => {
  const router = useRouter();

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

  const handleSendCode = async (
    number: string,
    index: number,
    setFieldValue: (field: string, value: any) => void
  ) => {
    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

      const confirmation = await signInWithPhoneNumber(auth, number, verifier);
      setFieldValue(`contacts[${index}].verificationId`, confirmation.verificationId);
      Alert.alert("Code Sent", "The contact should receive the verification code.");
    } catch (error) {
      console.error("Error sending code:", error);
      Alert.alert("Error", "Failed to send code. Please check the number.");
    }
  };

  const handleVerifyCode = async (
    contact: any,
    index: number,
    values: any,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const { verificationId, code } = contact;
    if (!verificationId || !code) {
      return Alert.alert("Missing Info", "Verification code or ID is missing.");
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);

      setFieldValue(`contacts[${index}].verified`, true);
      Alert.alert("Verified", `Contact #${index + 1} verified.`);

      const allVerified = values.contacts.every((c: any) => c.verified);
      if (allVerified) {
        router.push("/auth/Membership");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      Alert.alert("Invalid Code", "The code is incorrect or expired.");
    }
  };

  return (
    <AuthScreenLayout
      title="Contact(s) Verification"
    >
        <Formik
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

              <View id="recaptcha-container" />

            </View>

          </ScrollView>
        )}
        </Formik>

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
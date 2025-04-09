import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification, User } from "firebase/auth";
import { auth, db, functions } from "@/config/firebase";
import { Formik } from "formik";
import * as Yup from "yup";
import { doc, setDoc } from "firebase/firestore";
import { UserData } from "@/types";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import PlainTextLink from "@/components/form-components/auth/PlainTextLink";
import SIZES from "@/constants/size";

// import { EMAIL_USER } from '@env'

const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Signup: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignup = async (email: string, password: string) => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      Alert.alert("Check your email!", "Please verify your email before logging in.");

      // Store user data in Firestore
      const userData: UserData = {
        email,
        emailVerified: false,
        friendEmails: {},
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), userData);

      console.log("New User:", userCredential?.user)

      router.push("/(auth)/verify-email");

    } catch (error: any) {
      Alert.alert("Signup Error", error.message);
    }
    finally {
      setLoading(false)
    }
  };

  return (
    <AuthScreenLayout title="Signup">

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={SignupSchema}
        onSubmit={(values) => handleSignup(values.email, values.password)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View
            style={{
              gap: 20,
              width: SIZES.screenBodyWidth
            }}
          >
            <TextInputComponent
              placeholder="Email"
              inputMode="email"
              value={values.email}
              onChange={handleChange("email")}
              onBlur={handleBlur("email")}
            />
            {errors.email && touched.email && <Text>{errors.email}</Text>}

            <TextInputComponent
              placeholder="Password"
              isPassword={true}
              value={values.password}
              onChange={handleChange("password")}
              onBlur={handleBlur("password")}
            />
            {errors.password && touched.password && <Text>{errors.password}</Text>}

            {/* Submit Button */}
            <ActionPrimaryButton
              buttonTitle="Sign Up"
              onSubmit={handleSubmit}
              isLoading={loading}
            />
            
          </View>
        )}
      </Formik>

      <PlainTextLink text="Already have an account?" route="/(auth)/login" linkText="Login here." />

    </AuthScreenLayout>
  );
};

export default Signup;
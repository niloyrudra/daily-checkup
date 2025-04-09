import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Formik } from "formik";
import * as Yup from "yup";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";
import PlainTextLink from "@/components/form-components/auth/PlainTextLink";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));
      router.push("/dashboard/home");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout title="Login">

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={(values) => handleLogin(values.email, values.password)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View
            style={{
              gap: 20
            }}
          >
            <TextInputComponent
              placeholder="Email"
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

            <View
              style={{
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <Link href="/(auth)/forgot-password" style={{color: "#d1b48c", fontWeight: "800"}}>Forgot Password?</Link>
            </View>

            {/* Submit Button */}
            <ActionPrimaryButton
              buttonTitle="Login"
              onSubmit={handleSubmit}
              isLoading={loading}
            />

          </View>
        )}
      </Formik>

      <PlainTextLink text="Don't have an account?" route="/(auth)/signup" linkText="Create Account." />

    </AuthScreenLayout>
  );
};

export default Login;
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/config/firebase";
import { Formik } from "formik";
import * as Yup from "yup";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const ResetPassword: React.FC = () => {
  const { oobCode } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (password: string) => {
    setLoading(true);
    try {
      if (oobCode) {
        await verifyPasswordResetCode(auth, oobCode);
        await confirmPasswordReset(auth, oobCode, password);
        Alert.alert("Success", "Password has been reset.");
        router.push("/(auth)/login");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Reset Password</Text>
      <Formik
        initialValues={{ password: "" }}
        validationSchema={ResetPasswordSchema}
        onSubmit={(values) => handleResetPassword(values.password)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              placeholder="New Password"
              secureTextEntry
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
            />
            {errors.password && touched.password && <Text>{errors.password}</Text>}

            {loading ? <ActivityIndicator size="small" color="#0000ff" /> : <Button title="Reset Password" onPress={handleSubmit} />}
          </>
        )}
      </Formik>
    </View>
  );
};

export default ResetPassword;

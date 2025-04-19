import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/config/firebase";
import { Formik } from "formik";
import * as Yup from "yup";
import TextInputComponent from "@/components/form-components/TextInputComponent";
import ActionPrimaryButton from "@/components/form-components/ActionPrimaryButton";
import AuthScreenLayout from "@/components/layout/AuthScreenLayout";

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
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout title="Reset Password">

      <Formik
        initialValues={{ password: "" }}
        validationSchema={ResetPasswordSchema}
        onSubmit={(values) => handleResetPassword(values.password)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View
            style={{
              gap: 20
            }}
          >
            <TextInputComponent
              placeholder="New Password"
              value={values.password}
              isPassword={true}
              onChange={handleChange("password")}
              onBlur={handleBlur("password")}
            />
            {errors.password && touched.password && <Text>{errors.password}</Text>}

            <ActionPrimaryButton
              buttonTitle="Reset Password"
              onSubmit={handleSubmit}
              isLoading={loading}
            />
          </View>
        )}
      </Formik>

    </AuthScreenLayout>
  );
};

export default ResetPassword;

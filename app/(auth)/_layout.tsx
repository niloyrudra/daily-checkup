import { Stack } from "expo-router";

const RegisterLayout = () => (
    <Stack
        screenOptions={{
            headerShown: false
        }}
        initialRouteName="login"
    >
        <Stack.Screen name="login" options={{headerShown: false}} />
        <Stack.Screen name="reset-password" options={{headerShown: false}} />
        <Stack.Screen name="forgot-password" options={{headerShown: false}} />
        <Stack.Screen name="complete-profile" options={{headerShown: false}} />
    </Stack>
);

export default RegisterLayout;
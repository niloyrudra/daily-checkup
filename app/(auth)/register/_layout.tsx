import { Stack } from "expo-router";

const RegisterLayout = () => (
    <Stack
        screenOptions={{
            headerShown: false
        }}
        initialRouteName="index"
    >
        <Stack.Screen name="index" options={{headerShown: false}} />
        <Stack.Screen name="verify-email" options={{headerShown: false}} />
        <Stack.Screen name="verify-phone" options={{headerShown: false}} />
        <Stack.Screen name="user-info" options={{headerShown: false}} />
        <Stack.Screen name="contacts-verification" options={{headerShown: false}} />
        <Stack.Screen name="membership" options={{headerShown: false}} />
    </Stack>
);

export default RegisterLayout;
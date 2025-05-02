import React from 'react'
// import { Props } from 'react-native-paper'
import { Stack } from 'expo-router';

const DashboardLayout = () => {
    return (
        <Stack
            initialRouteName='home'
        >
            <Stack.Screen name="home" options={{headerShown:false}} />
        </Stack>
    )
}
export default DashboardLayout;
import React from 'react'
import { View } from 'react-native'
import { Link } from 'expo-router'
// import { useTheme } from '@/contexts/ThemeContext';

const ForgotPasswordLink = () => {
    // const {isDarkMode} = useTheme();
    return (
        <View
            style={{
                justifyContent: "center",
                alignItems: "flex-end"              
            }}
        >
            <Link
                href="/auth/forgetPassword"
                style={{
                    fontSize: 14,
                    // color: colors.text //colors.plainTextLinkColor
                }}
            >Forgot Password?</Link>
        </View>
    );
}
export default ForgotPasswordLink;
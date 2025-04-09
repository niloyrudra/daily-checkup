import { View } from 'react-native';
import React, { ReactNode } from 'react'
import STYLES from '@/constants/styles';
import TitleComponent from '../TitleComponent';
import AuthTopBannerComponent from '../AuthTopBannerComponent';
import KeyboardAvoidingViewLayout from './KeyboardAvoidingViewLayout';
import SafeAreaLayout from './SafeAreaLayout';
// import { useTheme } from '@/theme/ThemeContext';

const AuthScreenLayout = ({title, children}: {title: string, children: ReactNode}) => {
//   console.log(Colors.background)
    return (
    <SafeAreaLayout>
        <KeyboardAvoidingViewLayout>

            <View style={[STYLES.container]}>
                {/* Banner */}
                <AuthTopBannerComponent />

                {/* Screen Title */}
                <TitleComponent
                    title={title}
                    titleStyle={{
                        fontSize: 32
                    }}
                    style={{
                        marginBottom: 15
                    }}
                />

                {children && children}

            </View>

        </KeyboardAvoidingViewLayout>
    </SafeAreaLayout>
  )
}

export default AuthScreenLayout;
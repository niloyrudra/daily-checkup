import React, { ReactNode } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import STYLES from '@/constants/styles';
// import { useTheme } from '@/theme/ThemeContext';

const SafeAreaLayout = ({children}: {children: ReactNode}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1}}>
        {children && children}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default SafeAreaLayout;
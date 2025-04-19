import React, { ReactNode } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import GradientWrapper from './GradientWrapper';
// import STYLES from '@/constants/styles';
// import { useTheme } from '@/theme/ThemeContext';

const SafeAreaLayout = ({children}: {children: ReactNode}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1}}>
        <GradientWrapper>

          {children && children}
          
        </GradientWrapper>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default SafeAreaLayout;
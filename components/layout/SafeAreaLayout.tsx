import STYLES from '@/constants/styles';
import React, { ReactNode } from 'react'
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import GradientWrapper from './GradientWrapper';
// import STYLES from '@/constants/styles';
// import { useTheme } from '@/theme/ThemeContext';

const SafeAreaLayout = ({children}: {children: ReactNode}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1}}>
        {/* <GradientWrapper> */}
        <View style={[STYLES.defaultContainer]}>

          {children && children}
          
        </View>
          
        {/* </GradientWrapper> */}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default SafeAreaLayout;
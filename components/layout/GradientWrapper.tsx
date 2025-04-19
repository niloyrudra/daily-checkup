import React, { ReactNode } from 'react'
import { Theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import STYLES from '@/constants/styles';

const GradientWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <LinearGradient
        colors={[Theme.gradientColorTop, Theme.gradientColorBottom]}
        style={[STYLES.defaultContainer]}
    >
      {children && children}
    </LinearGradient>
  )
}

export default GradientWrapper
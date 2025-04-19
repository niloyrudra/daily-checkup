import { View, Image } from 'react-native'
import React from 'react'
import STYLES from '@/constants/styles'
import LogoImgSource from '@/assets/images/logo/daily-checkup-logo.png';

const AuthTopBannerComponent = () => {
  return (
    <View style={STYLES.childContentCentered}>
        <Image
        source={LogoImgSource}
        style={{
            width: 190,
            height: 190,
            objectFit: "contain"
        }}
        />
    </View>
  )
}

export default AuthTopBannerComponent
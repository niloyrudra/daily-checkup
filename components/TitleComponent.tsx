import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native'
import React from 'react'
import { Theme } from '@/constants/theme';

const TitleComponent = ({title, style, titleStyle}: {title: string, style?: StyleProp<ViewStyle>, titleStyle?: StyleProp<TextStyle>}) => {
  return (
    <View
      style={[
        style && style
      ]}
    >
      <Text style={[{color: Theme.text, fontSize:24, fontWeight: "800" }, (titleStyle && titleStyle)]}>
        {title}
      </Text>
    </View>
  )
}

export default TitleComponent;
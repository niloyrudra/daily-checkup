import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native'
import React from 'react'

const TitleComponent = ({title, style, titleStyle}: {title: string, style?: StyleProp<ViewStyle>, titleStyle?: StyleProp<TextStyle>}) => {
  return (
    <View
      style={[
        style && style
      ]}
    >
      <Text style={[{color: "#795547", fontSize:24, fontWeight: "800" }, (titleStyle && titleStyle)]}>
        {title}
      </Text>
    </View>
  )
}

export default TitleComponent;
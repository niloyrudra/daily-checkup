import React from 'react'
import { View, Text } from 'react-native';
// import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'expo-router';
import { LinkProps } from '@/types';
import { Theme } from '@/constants/theme';

const PlainTextLink = ({text, linkText, route}: LinkProps) => {
    // const {isDarkMode} = useTheme();
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems:"center",
          flexDirection: "row",
          gap: 4
        }}
      >
        <Text style={{color: Theme.primary}}>{text}</Text>
        <Link
          href={route}
          style={{color: Theme.link, fontWeight: "800"}}
        >
          {linkText}
        </Link>
      </View>
    );
}
export default PlainTextLink;
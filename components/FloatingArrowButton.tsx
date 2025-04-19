import React from 'react'
import Feather from '@expo/vector-icons/Feather';
import { Theme } from '@/constants/theme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FloatingArrowButtonProps } from '@/types';

const FloatingArrowButton: React.FC<FloatingArrowButtonProps> = ({onPress, buttonStyle, iconName, iconSize=24, iconColor=Theme.primary}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, buttonStyle]}
    >
      <Feather name={iconName} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  )
}

export default FloatingArrowButton;

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 0, // (StatusBar.currentHeight ?? 50) + SIZES.bodyPaddingVertical,
    left: 0, // SIZES.bodyPaddingHorizontal
  }
});
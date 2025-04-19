import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React, { ReactNode } from 'react'

import STYLES from '@/constants/styles';
import SIZES from '@/constants/size';
import { useTheme } from '@/contexts/ThemeContext';

interface SocialButtonProps {
    iconComponent: ReactNode,
    socialMediaName: string,
    onTap: () => void
}

const SocialButton = ({iconComponent, socialMediaName, onTap}: SocialButtonProps) => {
    const theme = useTheme();
    return (
        <TouchableOpacity
            style={[
                STYLES.contentCentered,
                styles.container,
                {
                    borderColor: theme.isDarkMode ? '#f5f5f5' : '#888', // colors.socialButtonBorderColor,
                    backgroundColor: theme.isDarkMode ? '#ccc' : '#FFFFFF', // colors.socialButtonBackgroundColor
                }
            ]}
            onPress={onTap}
        >
            {iconComponent}
            <Text style={{color: theme.isDarkMode ? '#f5f5f5' : '#242424', fontWeight:"800"}}>{socialMediaName}</Text>
        </TouchableOpacity>
    );
}

export default SocialButton

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 8,
        height: SIZES.buttonHeight,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1
    }
})
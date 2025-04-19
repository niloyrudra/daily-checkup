import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SubmitButtonProps } from '@/types';
import STYLES from '@/constants/styles';
import SIZES from '@/constants/size';

// import { useTheme } from '@/contexts/ThemeContext';
// import { Colors } from 'react-native/Libraries/NewAppScreen';

const ActionPrimaryButton = ( {
        buttonTitle="Submit",
        onSubmit,
        buttonStyle,
        buttonTextStyle,
        isLoading,
        disabled=false
    }: SubmitButtonProps ) => {
        // const {isDarkMode} = useTheme();


    if(isLoading) return (<ActivityIndicator size="small" color="#795547" />)
                
    return (
        <TouchableOpacity
            style={[ STYLES.childContentCentered, STYLES.boxShadow, styles.content, {backgroundColor: "#2f7d32"}, (buttonStyle && buttonStyle)]} // "#0a7ea4"
            onPress={onSubmit}
            disabled={disabled}
        >
            <Text style={[{fontSize: 16, color: "#FFFFFF", fontWeight: "800"}, (buttonTextStyle && buttonTextStyle)]}>{buttonTitle}</Text>
        </TouchableOpacity>
    );
}
export default ActionPrimaryButton;

const styles = StyleSheet.create({
    content: {
        width: SIZES.screenBodyWidth,
        borderRadius: 40,
        height: SIZES.buttonHeight,
        marginBottom: SIZES.marginBottom
    }
})
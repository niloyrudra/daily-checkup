import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EyeProps } from '@/types';
// import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
// Constants
import SIZES from '@/constants/size';
import STYLES from '@/constants/styles';

const ToggledEyeIcon = ({onChange, isSecureTextEntry, style: customStyles}: EyeProps) => {

    // const theme = useTheme();

    return (
        <View style={[ styles.container, STYLES.childContentCentered, customStyles]}>
            <TouchableOpacity
                onPress={onChange}
            >
                {
                    isSecureTextEntry
                    ? (<Ionicons name="eye-outline" color="black" size={SIZES.defaultIconSize} />)
                    : (<Ionicons name="eye-off-outline" color="black" size={SIZES.defaultIconSize} />)
                }
            </TouchableOpacity>
        </View>
    );
    
}

export default ToggledEyeIcon;

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        zIndex: 3,
        right: 16,
        height: SIZES.textFieldHeight,
    },
    iconOpacity: {opacity: 0.75}
})
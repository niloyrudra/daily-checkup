import { Dimensions } from "react-native";

const SIZES = {
    logo: {
        width: 133.07,
        height: 31.34
    },
    screenWidth: Dimensions.get("screen").width,
    windowWidth: Dimensions.get("window").width,
    screenBodyWidth: Dimensions.get("screen").width - 40,
    windowBodyWidth: Dimensions.get("window").width - 40,
    headerHeight: 55,
    textFieldHeight: 56,
    buttonHeight: 56,
    authMarginTop: 50,
    bodyPaddingHorizontal: 20,
    bodyPaddingVertical: 20,
    defaultIconSize: 24,
    headerIcon: 36,
    SpeakerIcon: 20,
    cardGap: 12,
    marginBottom: 20,

    // Fonts
    buttonFontSize: 22,
    fontSizeTextArea: 24,
    fontSizeTextInput: 18,

    header: 28,
    title: 22,
    contentText: 18,
}

export default SIZES;
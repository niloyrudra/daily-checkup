import { StyleProp, ViewProps, ViewStyle } from "react-native";
import SIZES from "@/constants/size";

const headerContainer: StyleProp<ViewProps> = {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.bodyPaddingHorizontal,
    paddingVertical: 10,
    height: SIZES.headerHeight,
} as ViewProps;

const boxShadow: StyleProp<ViewProps> = {
    elevation: 5,
    shadowColor: "#55565626",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 5
} as ViewProps;

const textShadow: StyleProp<ViewProps> = {
    textShadowColor: "#444",
    textShadowOffset:{
      width:2,
      height:2
    },
    textShadowRadius: 2
} as ViewProps;
const textHeader: StyleProp<ViewProps> = {} as ViewProps;

const textSubHeader: StyleProp<ViewProps> = {} as ViewProps;

const container: StyleProp<ViewStyle> = {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.screenWidth - (SIZES.bodyPaddingHorizontal*2)
} as ViewStyle;

const contentCentered: StyleProp<ViewStyle> = {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
} as ViewStyle;

const childContentCentered: StyleProp<ViewStyle> = {
    justifyContent: "center",
    alignItems: "center"
} as ViewStyle;

const defaultContainer: StyleProp<ViewProps> = {
    flex: 1,
    paddingHorizontal: SIZES.bodyPaddingHorizontal,
    paddingVertical: SIZES.bodyPaddingVertical,
} as ViewProps;

const titleHeadingStyle: StyleProp<ViewProps> = {
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 16,
    fontFamily: 'PlusJakartaSans-ExtraBold',
} as ViewProps;
const subTitleHeadingStyle: StyleProp<ViewProps> = {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 14,
    fontFamily: 'PlusJakartaSans-Bold',
} as ViewProps;


const STYLES = {
    container,
    headerContainer,
    defaultContainer,
    boxShadow,
    textShadow,
    textHeader,
    textSubHeader,
    contentCentered,
    childContentCentered,
    titleHeadingStyle,
    subTitleHeadingStyle
};

export default STYLES;
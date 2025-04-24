import { Feather } from "@expo/vector-icons"
import { Href } from "expo-router"
import { FieldValue, Timestamp } from "firebase/firestore"
import { ReactNode } from "react"
import { ColorValue, DataDetectorTypes, ImageBackgroundProps, ImageSourcePropType, InputModeOptions, KeyboardType, StyleProp, TextProps, TextStyle, ViewProps, ViewStyle } from "react-native"
import { SvgProps } from "react-native-svg"

type WritableTimestamp = Timestamp | FieldValue;
type Plan = "free" | "monthly" | "yearly";

type Contact = {
  phoneNumber: string;
  verified: boolean;
};

type MembershipPlan = {
  plan: Plan;
  status: "active" | "canceled" | "trialing" | "pending";
  since: WritableTimestamp;              // Firestore timestamp type :contentReference[oaicite:1]{index=1}
};

type UserData = {
  name: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  
  // Two distinct contacts
  contactNumbers: {
    contact1: Contact;
    contact2: Contact;
  };
  contactNumbersVerified: boolean;  

  // any schedule flags by id
  schedules: Record<string, boolean>;

  membershipPlan: MembershipPlan;
  createdAt: WritableTimestamp;
};



type InputProps = { // extends TextInputProps -> better approach
  value: string,
  placeholder?: string,
  onChange: (text: string) => void,
  onBlur?: (e?: any) => void,
  // onChange: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void,
  multiline?: boolean,
  numberOfLines?: number,
  maxLength?: number,
  inputMode?: InputModeOptions | undefined,
  keyboardType?: KeyboardType | undefined,
  placeholderTextColor?: ColorValue | undefined,
  isPassword?: boolean,
  contentContainerStyle?: StyleProp<ViewStyle>
}

type Category = {
  id: string,
  title: string,
  slug: string,
  ImgComponent: React.FC<SvgProps>
}

type CategoryProps = {
    title: string,
    slug: string,
    ImgComponent: React.FC<SvgProps>,
    containerWidth?: number
    marginRight?: number
}

// UNIT LESSON
type UnitLesson = {
  id: string,
  title: string,
  slug: string,
  completion: number,
  goal: number,
  ImgComponent: React.FC<SvgProps>
}

type UnitLessonProps = {
    title: string,
    slug: string,
    completion: number,
    goal: number,
    ImgComponent: React.FC<SvgProps>,
    containerWidth?: number
    marginRight?: number
}
// UNIT Props
type UnitProps = {
    title: string,
    completion: number,
    goal: number,
    ImgComponent: React.FC<SvgProps>,
    // imgSource: ImageSourcePropType | undefined,
    customStyle?: StyleProp<ViewStyle>
}
// UNIT DATA Props
type UnitDataProps = {
    id: string,
    title: string,
    completion: number,
    goal: number,
    ImgComponent: React.FC<SvgProps>
}


// LINK Props
type LinkProps = {
  text: string,
  linkText: string,
  route: Href
}

// BANNER Props
type BannerProps = {
  width?: number,
  height?: number
}
// TITLE Props
type TitleProps = {
  title: string,
  wrapperStyle?: StyleProp<ViewStyle>
  titleStyle?: StyleProp<TextStyle>
}
// ACTION BUTTON Props
type SubmitButtonProps = {
  buttonTitle?: string,
  onSubmit: () => void,
  buttonStyle?: StyleProp<ViewStyle>,
  buttonTextStyle?: StyleProp<TextStyle>,
  isLoading?: boolean,
  disabled?: boolean
}
// TEXT_INPUT Props
type EyeProps = {
  onChange: () => void,
  isSecureTextEntry: boolean,
  style?: StyleProp<ViewStyle>
}

type LessonProps = {
    language: string,
    iconComponent: ReactNode,
    children?: ReactNode | undefined,
    style?: StyleProp<ViewStyle>
    buttonStyle?: StyleProp<ViewStyle>
}

type FloatingArrowButtonProps = {
  onPress: () => void;
  buttonStyle?: StyleProp<ViewStyle>;
  iconName: keyof typeof Feather.glyphMap; // ✅ Only valid Feather icon names
  iconSize?: number;
  iconColor?: ColorValue
};

export {
  UserData,
  Plan,
  Contact,
  MembershipPlan,
  Category,
  CategoryProps,
  UnitLesson,
  UnitLessonProps,
  UnitProps,
  UnitDataProps,
  LinkProps,
  BannerProps,
  TitleProps,
  SubmitButtonProps,
  InputProps,
  EyeProps,
  LessonProps,
  FloatingArrowButtonProps
};
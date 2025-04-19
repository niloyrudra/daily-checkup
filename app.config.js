import "dotenv/config";

export default {
  expo: {
    name: "Daily Checkup",
    slug: "daily-checkup",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo/icon.png",
    scheme: "daily-checkup",
    sdkVersion: "52.0.0",
    platforms: ["android", "ios", "web"],
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    owner: "niloyrudra",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
      },
      bundleIdentifier: "com.niloyrudra.dailycheckup",
    },
    android: {
      package: "com.niloyrudra.dailycheckup",
      permissions: ["INTERNET", "RECEIVE_SMS", "READ_SMS", "SEND_SMS"],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-router",
        {
          origin: false, // "https://daily-checkup.expo.app"
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.daily-checkup",
          "enableGooglePay": true,
          "publishableKey": process.env.STRIPE_TEST_PUBLISHABLE_KEY
        }
      ],
      "expo-build-properties",
      "expo-dev-client",
    ],
    experiments: {
      typedRoutes: false,
    },
    extra: {
      debugMode: process.env.DEBUG_MODE === "true",
      testEnv: process.env.TEST_ENV ?? "fallback-test",
      // Firebase
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      expoPubFirebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
      // Email
      userEmail: process.env.EMAIL_USER,
      userPass: process.env.EMAIL_PASS,
      router: {
        origin: false,
      },
      eas: {
        projectId: "0448825a-c34d-4814-9cca-d2330c55d2e4",
      },
    },
  },
};

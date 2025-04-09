import "dotenv/config";

export default {
  "expo": {
    "name": "daily-checkup",
    "slug": "daily-checkup",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "platforms": [
      "ios",
      "android",
      "web"
    ],
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.niloyrudra.dailycheckup"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": false
    },
    "extra": {
      "userEmail": process.env.EMAIL_USER,
      "userPass": process.env.EMAIL_PASS,
      "firebaseApiKey": process.env.FIREBASE_API_KEY,
      "firebaseAuthDomain": process.env.FIREBASE_AUTH_DOMAIN,
      "firebaseProjectId": process.env.FIREBASE_PROJECT_ID,
      "firebaseStorageBucket": process.env.FIREBASE_STORAGE_BUCKET,
      "firebaseMessagingSenderId": process.env.FIREBASE_MESSAGING_SENDER_ID,
      "firebaseAppId": process.env.FIREBASE_APP_ID,
      "firebaseMeasurementId": process.env.FIREBASE_MEASUREMENT_ID,
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "0448825a-c34d-4814-9cca-d2330c55d2e4"
      }
    },
    "owner": "niloyrudra"
  }
}

// import "dotenv/config"
import { Alert, Linking, StatusBar } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
// import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useRouter } from "expo-router";
// import * as Linking from "expo-linking";
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

import { Theme } from '@/constants/theme';
import React from 'react';
import { parse } from 'expo-linking';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  // useEffect(() => {
  //   const handleDeepLink = (event: Linking.EventType) => {
  //     const url = event.url;
  //     const { queryParams } = Linking.parse(url);
  //     if (queryParams?.user && queryParams?.email) {
  //       router.push(`/verify-friend?user=${queryParams.user}&email=${queryParams.email}`);
  //     }
  //   };

  //   const subscription = Linking.addEventListener("url", handleDeepLink);
  //   return () => subscription.remove();
  // }, []);
  // useEffect(() => {
  //   const subscription = Linking.addEventListener('url', (event) => {
  //     const url = event.url;
  //     const { queryParams } = parse(url);
  //     if (queryParams?.status === 'success') {
  //       Alert.alert("✅ Payment Successful", "Thanks for subscribing!");
  //     } else if (queryParams?.status === 'cancel') {
  //       Alert.alert("❌ Payment Cancelled", "You can try again later.");
  //     }
  //   });

  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);
  
  useEffect(() => {
    const handleDeepLink = (event: { url: any; }) => {
      const data = parse(event.url);
      console.log("Received deep link:", data);
      if (data.queryParams?.status === "success") {
        Alert.alert("Success", "Payment completed successfully!");
        router.replace("/dashboard/home"); // or wherever appropriate
      } else if (data.queryParams?.status === "cancel") {
        Alert.alert("Cancelled", "Payment was cancelled.");
      }
    };
  
    const subscription = Linking.addEventListener('url', handleDeepLink);
  
    // Check if app was launched by a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });
  
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const hideSplash = async () => {
      if (!loaded) {
        console.log('Fonts not loaded...');
        return null;
      }
      if (loaded) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('SplashScreen hide error:', e);
        }
      }
    };
    hideSplash();
  }, [loaded]);


  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          contentStyle: {
            // marginTop: StatusBar.currentHeight || 0,
            // backgroundColor: `${Theme.background}`
            backgroundColor: "#FFFFFF"
          }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* <StatusBar barStyle="dark-content" backgroundColor={Theme.background} /> */}
    </ThemeProvider>
  );
}

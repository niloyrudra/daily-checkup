import { StatusBar } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
// import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

import { Theme } from '@/constants/theme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const router = useRouter();

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });


  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;
      const { queryParams } = Linking.parse(url);
      if (queryParams?.user && queryParams?.email) {
        router.push(`/verify-friend?user=${queryParams.user}&email=${queryParams.email}`);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
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
            backgroundColor: `${Theme.background}`
          }
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify-phone" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/contacts-verification" options={{ headerShown: false }} />
        {/* <Stack.Screen name="(auth)/verify-friend" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="(auth)/waiting-verification" options={{ headerShown: false }} /> */}
        <Stack.Screen name="(auth)/complete-profile" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard/home" options={{ headerShown: false }} />
        {/* <Stack.Screen name="verify" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="verify-friend" options={{ headerShown: false }} /> */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.background} />
    </ThemeProvider>
  );
}

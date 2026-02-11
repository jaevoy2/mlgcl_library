import { Stack } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent />
      <Stack>

        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="borrow" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}
import { BorrowedBookProvider } from "@/context/borrow";
import { Stack } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <BorrowedBookProvider>
      <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent />
      <Stack>

        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="borrow" options={{ headerShown: false }} />
        <Stack.Screen name="borrowing" options={{ headerShown: false }} />
        <Stack.Screen name="borrowInfo" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false, animation: 'slide_from_right', animationDuration: 100 }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </BorrowedBookProvider>
  )
}
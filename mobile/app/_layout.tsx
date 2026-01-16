import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

import '@/global.css';

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Index Page", headerShown: false, }} />
        <Stack.Screen name="welcome" options={{ title: "Welcome Page", headerShown: false, }} />
        <Stack.Screen name="login" options={{ title: "Login Page", headerShown: false, }} />
        <Stack.Screen name="register" options={{ title: "Register Page", headerShown: false, }} />
      </Stack>
    </KeyboardProvider>
  );
}

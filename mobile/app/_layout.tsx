import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AuthProvider } from "./context/auth";

import '@/global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <KeyboardProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Index Page", headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="welcome" options={{ title: "Welcome Page", headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="login" options={{ title: "Login Page", headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="register" options={{ title: "Register Page", headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="write" options={{ title: "Write Entry", presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="snap" options={{ title: "Snap Entry", presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="record" options={{ title: "Record Entry", presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="timeline" options={{ title: "Timeline", headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="profile" options={{ title: "Profile", headerShown: false, gestureEnabled: false }} />
        </Stack>
      </KeyboardProvider>
    </AuthProvider>
  );
}

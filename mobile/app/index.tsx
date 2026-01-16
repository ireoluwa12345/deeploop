import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useAuth } from "./context/auth";

export default function Index() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/welcome");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome to Memory App</Text>
    </View>
  );
}

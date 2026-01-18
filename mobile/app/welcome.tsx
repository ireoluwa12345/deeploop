import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import {
  useFonts,
  JetBrainsMono_400Regular,
} from "@expo-google-fonts/jetbrains-mono";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "./context/auth";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  let [fontsLoaded] = useFonts({ JetBrainsMono_400Regular });

  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, router]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5A7D5A" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.backgroundCurve} />

      <SafeAreaProvider style={styles.safeArea}>
        {/* --- HERO SECTION --- */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>Capture your{"\n"}thoughts.</Text>

          {/* Floating Circle Icon */}
          <View style={styles.centerIconWrapper}>
            <Icon name="text-box-plus-outline" size={32} color="#5A7D5A" />
          </View>
        </View>

        {/* --- BOTTOM SECTION --- */}
        <View style={styles.bottomContainer}>
          {/* Third Party Logins - Google & Apple */}
          <TouchableOpacity style={styles.socialButton}>
            <Icon
              name="google"
              size={24}
              color="#000"
              style={styles.socialIcon}
            />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Icon
              name="apple"
              size={24}
              color="#000"
              style={styles.socialIcon}
            />
            <Text style={styles.socialBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Email Login Link */}
          <TouchableOpacity style={styles.emailButton} onPress={() => router.push('/login')}>
            <Text style={styles.emailText}>LOGIN WITH EMAIL</Text>
          </TouchableOpacity>

          {/* Footer Legal Text */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              BY CONTINUING, YOU AGREE TO OUR{"\n"}
              <Text style={styles.linkText}>TERMS OF SERVICE</Text> &{" "}
              <Text style={styles.linkText}>PRIVACY POLICY</Text>
            </Text>
          </View>
        </View>
      </SafeAreaProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  backgroundCurve: {
    position: "absolute",
    top: -height * 0.15,
    left: -width * 0.25,
    width: width * 1.5,
    height: height * 0.55,
    backgroundColor: "#DEE6D5",
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    transform: [{ scaleX: 1.2 }],
  },
  safeArea: {
    flex: 1,
  },
  iconButton: {
    padding: 8,
  },
  heroContainer: {
    alignItems: "center",
    marginTop: 80,
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 42,
    fontFamily:
      Platform.OS === "ios" ? "JetBrainsMono_400Regular" : "monospace",
    fontWeight: "500",
    textAlign: "center",
    color: "#1A1A1A",
    lineHeight: 52,
    marginBottom: 40,
  },
  centerIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  socialIcon: {
    position: "absolute",
    left: 24,
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  emailButton: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emailText: {
    color: "#C86438",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  footerContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#A0A0A0",
    textAlign: "center",
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  linkText: {
    textDecorationLine: "underline",
  },
});

export default LoginScreen;

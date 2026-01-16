import BackButton from "@/components/BackButton";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "./context/auth";
import styles from "./styles";

const JournalLoginScreen = () => {
  const router = useRouter()
  const { login, loginLoading, loginError } = useAuth();

  // State to handle password visibility toggle
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await login({ email: email.trim(), password });

    if (result.success) {
      router.push('/');
    } else {
      Alert.alert('Login Failed', result.error || 'An error occurred');
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >

        {/* --- HEADER --- */}
        <BackButton onPress={() => router.push("/welcome")} />

        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>Login</Text>
        </View>

        {/* --- FORM SECTION --- */}
        <View style={styles.formContainer}>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="user@domain.com"
              placeholderTextColor="#B0B0B0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="........"
                placeholderTextColor="#B0B0B0"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, loginLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            <Text style={styles.signInText}>
              {loginLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </Text>
            {!loginLoading && (
              <Icon name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>

        </View>

        {/* Error Message */}
        {loginError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{loginError}</Text>
          </View>
        )}

        {/* --- FOOTER SECTION --- */}
        <View style={styles.footerContainer}>
          <View style={styles.divider} />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>New here? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaProvider>
  );
};

export default JournalLoginScreen;
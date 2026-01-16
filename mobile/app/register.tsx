import BackButton from "@/components/BackButton";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import styles from "./styles";

const RegisterScreen = () => {
    const router = useRouter();

    // State for form fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State to handle password visibility toggle
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    return (
        <SafeAreaProvider style={styles.container}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContainer}
                bottomOffset={20}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
            >

                <BackButton onPress={() => router.push("/welcome")} />

                <View style={[styles.headerContainer, { marginTop: 10, marginBottom: 40 }]}>
                    <Text style={styles.appTitle}>Create Account</Text>
                    <Text style={[styles.appSubtitle, { letterSpacing: 1, textTransform: 'none', fontSize: 14 }]}>Start your daily reflection journey</Text>
                </View>

                {/* --- FORM SECTION --- */}
                <View style={styles.formContainer}>

                    {/* Full Name Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>FULL NAME</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            placeholderTextColor="#B0B0B0"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@example.com"
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
                                placeholder="Create a password"
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

                    {/* Confirm Password Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>CONFIRM PASSWORD</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Repeat password"
                                placeholderTextColor="#B0B0B0"
                                secureTextEntry={!isConfirmPasswordVisible}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                style={styles.eyeIcon}
                            >
                                <Icon
                                    name={isConfirmPasswordVisible ? "eye-off" : "eye"}
                                    size={20}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity style={[styles.signInButton, { marginTop: 20 }]}>
                        <Text style={styles.signInText}>SIGN UP</Text>
                    </TouchableOpacity>
                </View>

                {/* --- FOOTER SECTION --- */}
                <View style={styles.footerContainer}>
                    {/* Note: Divider removed in this screen design, but can be added if needed */}

                    <View style={styles.registerRow}>
                        <Text style={styles.registerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.registerLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Background accent circle can be added here if we had the asset/style, 
                  but strictly following given styles for now. 
                  The image shows some background blobs which might require absolute positioning 
                  or new style additions. I'll stick to the clean layout for consistency first. 
              */}

                </View>
            </KeyboardAwareScrollView>
        </SafeAreaProvider>
    );
};

export default RegisterScreen;

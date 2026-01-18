import BackButton from "@/components/BackButton";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from '@/app/context/auth';
import styles from "./styles";
import { statementCase, validateEmail } from "./utils/helper";

const RegisterScreen = () => {
    const router = useRouter();
    const { register, registerLoading, registerError, isLoggedIn, loading } = useAuth();

    useEffect(() => {
        if (!loading && isLoggedIn) {
            router.replace('/');
        }
    }, [loading, isLoggedIn, router]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#BF5B30" />
            </View>
        );
    }

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const [error, setError] = useState('');

    const [showSuccess, setShowSuccess] = useState(false);

    const handleRegister = async () => {
        if (!validateEmail(email)) {
            setError('Invalid email format');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        const result = await register({ name: fullName, email, password });
        if (result.success) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.push('/login');
            }, 2000);
        } else {
            setError(result.error || 'Registration failed');
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

                <BackButton onPress={() => router.push("/welcome")} />

                <View style={[styles.headerContainer, { marginTop: 10, marginBottom: 40 }]}>
                    <Text style={styles.appTitle}>Create Account</Text>
                    <Text style={[styles.appSubtitle, { letterSpacing: 1, textTransform: 'none', fontSize: 14 }]}>Start your daily reflection journey</Text>
                </View>


                {/* --- FORM SECTION --- */}
                <View style={styles.formContainer}>
                    {error ? <Text style={{ backgroundColor: '#ffebee', color: '#d32f2f', padding: 10, borderRadius: 5, marginTop: 10, marginBottom: 10, textAlign: 'center', width: '100%' }}>{statementCase(error)}</Text> : null}
                    {/* Success Message */}
                    {showSuccess && (
                        <View style={{ backgroundColor: '#e8f5e8', padding: 10, marginTop: 20, marginBottom: 10, borderRadius: 5, alignItems: 'center' }}>
                            <Text style={{ color: '#2e7d32', fontSize: 16 }}>Registration successful! Redirecting to login...</Text>
                        </View>
                    )}

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
                    <TouchableOpacity style={[styles.signInButton, { marginTop: 20 }]} onPress={handleRegister} disabled={registerLoading}>
                        <Text style={styles.signInText}>{registerLoading ? 'SIGNING UP...' : 'SIGN UP'}</Text>
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

                </View>
            </KeyboardAwareScrollView>
        </SafeAreaProvider>
    );
};

export default RegisterScreen;

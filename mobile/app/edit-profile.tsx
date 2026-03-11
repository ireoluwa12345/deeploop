import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, TextInput,
    Image, Alert, ActivityIndicator, Platform, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useAuth } from './context/auth';
import { Colors } from './styles';

const FONT_FAMILY = 'JetBrainsMono_400Regular';
import { apiService } from './utils/api';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
    const router = useRouter();
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photo library to change your profile picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setNewProfileImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setSaving(true);
        try {
            const updatedUser = await apiService.updateProfile(
                name.trim(),
                newProfileImage || undefined
            );

            await updateUser({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                profile_image: updatedUser.profile_image || '',
                created_at: updatedUser.created_at,
            });

            Alert.alert('Saved', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Icon name="chevron-left" size={32} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>EDIT PROFILE</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
                    {saving ? (
                        <ActivityIndicator size="small" color={Colors.secondary} />
                    ) : (
                        <Text style={styles.saveText}>SAVE</Text>
                    )}
                </TouchableOpacity>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.content}>
                    {/* Profile Image */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                                {newProfileImage ? (
                                    <Image source={{ uri: newProfileImage }} style={styles.avatar} />
                                ) : user?.profile_image ? (
                                    <Image source={{ uri: user.profile_image }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarFallback}>
                                        <Text style={styles.avatarInitials}>{initials}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View style={styles.cameraOverlay}>
                                <Icon name="camera" size={18} color="#FFF" />
                            </View>
                        </View>
                        <Text style={styles.changePhotoText}>Tap to change photo</Text>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>FULL NAME</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#CCC"
                            autoCapitalize="words"
                            returnKeyType="done"
                        />
                    </View>

                    {/* Email (read-only) */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>EMAIL</Text>
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>{user?.email || ''}</Text>
                            <Icon name="lock-outline" size={16} color="#CCC" />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 4,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 2,
        fontFamily: FONT_FAMILY,
    },
    saveBtn: {
        padding: 4,
        minWidth: 50,
        alignItems: 'flex-end',
    },
    saveText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.secondary,
        letterSpacing: 1,
        fontFamily: FONT_FAMILY,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarContainer: {
        width: 130,
        height: 130,
        borderRadius: 65,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 42,
        fontWeight: 'bold',
        color: Colors.surface,
        letterSpacing: 1,
        fontFamily: FONT_FAMILY,
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.background,
    },
    changePhotoText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 12,
        fontFamily: FONT_FAMILY,
        fontStyle: 'italic',
    },
    inputSection: {
        marginBottom: 28,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.textSecondary,
        letterSpacing: 1.5,
        marginBottom: 10,
        fontFamily: FONT_FAMILY,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 18,
        fontSize: 16,
        color: Colors.text,
        fontFamily: FONT_FAMILY,
    },
    readOnlyField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F3F3',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    readOnlyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontFamily: FONT_FAMILY,
    },
});

export default EditProfileScreen;

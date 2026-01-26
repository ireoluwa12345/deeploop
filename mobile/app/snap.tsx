import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, TextInput, ScrollView, ActivityIndicator, Alert } from "react-native";
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from './styles';
import { apiService } from "./utils/api";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import BottomNavBar from "@/components/home/BottomNavBar";

const SnapScreen = () => {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<FlashMode>('off');
    const [isSaving, setIsSaving] = useState(false);
    const [caption, setCaption] = useState('');

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        return <View />; // Loading
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                if (photo) {
                    setPhoto(photo.uri);
                }
            } catch (e) {
                console.error("Failed to take picture:", e);
            }
        }
    };

    const retakePicture = () => {
        setPhoto(null);
        setCaption('');
        setIsSaving(false);
    };

    const savePicture = async () => {
        if (!photo) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            const type = `image`;

            const filename = photo.split('/').pop() || 'photo.jpg';

            // @ts-ignore
            formData.append("file", {
                uri: photo,
                name: filename,
                type: 'image/jpeg',
            });
            formData.append("content_type", type);
            if (caption) {
                formData.append("content", caption);
            }

            await apiService.createMemory(formData);
            router.push("/timeline");
        } catch (error) {
            Alert.alert("Error", "Failed to save memory");
        } finally {
            setIsSaving(false);
        }
    };

    // --- REVIEW UI ---
    if (photo) {
        return (
            <View style={styles.reviewContainer}>
                <SafeAreaView style={styles.reviewHeader}>
                    <TouchableOpacity onPress={retakePicture} style={styles.closeButtonReview}>
                        <Icon name="close" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.reviewTitle}>REVIEW</Text>
                    <View style={{ width: 24 }} />
                </SafeAreaView>

                <KeyboardAwareScrollView contentContainerStyle={styles.reviewContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: photo }} style={styles.imagePreview} />
                    </View>

                    <View style={styles.captionContainer}>
                        <Text style={styles.captionLabel}>ADD A CAPTION...</Text>
                        <View style={styles.captionInputWrapper}>
                            <TextInput
                                style={styles.captionInput}
                                placeholder="Capture the feeling of this moment..."
                                placeholderTextColor="#AAA"
                                multiline
                                value={caption}
                                onChangeText={setCaption}
                            />
                        </View>
                    </View>
                </KeyboardAwareScrollView>

                <View style={styles.reviewFooter}>
                    <TouchableOpacity onPress={retakePicture} style={styles.retakeButton}>
                        <Icon name="refresh" size={20} color={Colors.secondary} />
                        <Text style={[styles.retakeText, { color: Colors.secondary }]}>RETAKE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={savePicture} disabled={isSaving} style={styles.saveButtonReview}>
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.saveTextReview}>SAVE</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Bottom Nav */}
                {/* <BottomNavBar /> */}
            </View>
        )
    }

    // --- CAMERA UI ---
    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef}>

                {/* Top Bar */}
                <SafeAreaView style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Icon name="close" size={28} color={Colors.surface} />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Grid Lines Overlay */}
                <View style={styles.gridContainer}>
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineHorizontal} />
                    <View style={styles.gridLineHorizontal} />
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomBar}>

                    <TouchableOpacity style={styles.galleryButton}>
                        {/* Placeholder for verify last image */}
                        <View style={styles.galleryPlaceholder} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
                        <Icon name="camera-flip-outline" size={28} color={Colors.surface} />
                    </TouchableOpacity>

                </View>

            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Camera bg kept black
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.background,
    },
    permissionText: {
        marginBottom: 20,
        fontSize: 16,
        textAlign: 'center',
        color: Colors.text,
    },
    permissionButton: {
        backgroundColor: Colors.primary,
        padding: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: Colors.surface,
        fontWeight: 'bold'
    },
    closeButton: {
        marginTop: 20
    },
    closeText: {
        color: Colors.textSecondary
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50, // Increased to shift X down
    },

    iconButton: {
        padding: 4,
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    gridLineVertical: {
        position: 'absolute',
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        left: '33%',
    },
    gridLineHorizontal: {
        position: 'absolute',
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        top: '33%',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary, // Terracotta
    },
    galleryButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    galleryPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: Colors.surface
    },
    flipButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 24,
    },

    // Review UI Styles
    reviewContainer: {
        flex: 1,
        backgroundColor: '#F2EFEC', // Beige background
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: '#F2EFEC',
        marginTop: 80, // Increased further to shift X down
    },
    closeButtonReview: {
        padding: 12, // Increased touch target
        borderRadius: 20,
        backgroundColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    reviewTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
        color: '#666',
    },
    reviewContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    imagePreviewContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        backgroundColor: '#DDD',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    captionContainer: {
        marginBottom: 20,
    },
    captionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        color: '#666',
        marginBottom: 10,
        marginLeft: 4,
    },
    captionInputWrapper: {
        backgroundColor: '#F8F6F4',
        borderRadius: 16,
        padding: 16,
        minHeight: 100,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    captionInput: {
        fontSize: 16,
        color: '#333',
        fontStyle: 'italic',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    reviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    retakeText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        letterSpacing: 1,
    },
    saveButtonReview: {
        backgroundColor: Colors.primary, // Terracotta
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveTextReview: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
});

export default SnapScreen;

import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform } from "react-native";
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from './styles';
import { apiService } from "./utils/api";

const SnapScreen = () => {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<FlashMode>('off');
    const [isSaving, setIsSaving] = useState(false);

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
    };

    const savePicture = async () => {
        if (!photo) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            const type = `image`;

            formData.append("file", photo)
            formData.append("content_type", type)

            await apiService.createMemory(formData);
            router.back();
        } catch (error) {
            console.error("Failed to save memory:", error);
            // Ideally show a toast or alert here
        } finally {
            setIsSaving(false);
        }
    };

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.preview} />
                <View style={styles.overlay}>
                    <TouchableOpacity onPress={retakePicture} style={styles.actionButton}>
                        <Icon name="refresh" size={32} color="#FFF" />
                        <Text style={styles.actionText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={savePicture} disabled={isSaving} style={[styles.actionButton, styles.saveButton]}>
                        <Icon name={isSaving ? "loading" : "check"} size={32} color="#FFF" />
                        <Text style={styles.actionText}>{isSaving ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

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
        paddingTop: 20,
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

    preview: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
    },
    actionButton: {
        alignItems: 'center',
    },
    saveButton: {

    },
    actionText: {
        color: Colors.surface,
        marginTop: 4,
        fontWeight: 'bold',
        shadowColor: '#000',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 }
    }
});

export default SnapScreen;

import React, { useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    FadeIn,
    FadeOut
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

import { useRouter } from "expo-router";

interface EntrySelectionOverlayProps {
    onClose: () => void;
}

const EntrySelectionOverlay = ({ onClose }: EntrySelectionOverlayProps) => {
    const router = useRouter();
    // Animation values
    const recordScale = useSharedValue(0);
    const snapScale = useSharedValue(0);
    const writeScale = useSharedValue(0);
    const closeScale = useSharedValue(0);

    useEffect(() => {
        // Staggered entrance
        recordScale.value = withDelay(100, withSpring(1));
        snapScale.value = withDelay(0, withSpring(1)); // Middle one comes first or consistently
        writeScale.value = withDelay(150, withSpring(1));
        closeScale.value = withDelay(300, withSpring(1));
    }, []);

    const animatedRecordStyle = useAnimatedStyle(() => ({
        transform: [{ scale: recordScale.value }],
    }));
    const animatedSnapStyle = useAnimatedStyle(() => ({
        transform: [{ scale: snapScale.value }],
    }));
    const animatedWriteStyle = useAnimatedStyle(() => ({
        transform: [{ scale: writeScale.value }],
    }));
    const animatedCloseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: closeScale.value }],
    }));

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.container}
        >
            <View style={styles.actionsContainer}>
                {/* Record Button */}
                <Animated.View style={[styles.actionItem, animatedRecordStyle]}>
                    <TouchableOpacity
                        style={[styles.circleButton, styles.greenCircle]}
                        onPress={() => {
                            onClose();
                            router.push("/record");
                        }}
                    >
                        <Icon name="microphone-outline" size={32} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.actionLabel}>RECORD</Text>
                </Animated.View>

                {/* Snap Button - Larger/Central */}
                <Animated.View style={[styles.actionItem, styles.centerItem, animatedSnapStyle]}>
                    <TouchableOpacity
                        style={[styles.circleButton, styles.largeGreenCircle]}
                        onPress={() => {
                            onClose();
                            router.push("/snap");
                        }}
                    >
                        <Icon name="camera-outline" size={40} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.actionLabel}>SNAP</Text>
                </Animated.View>

                {/* Write Button */}
                <Animated.View style={[styles.actionItem, animatedWriteStyle]}>
                    <TouchableOpacity
                        style={[styles.circleButton, styles.terracottaCircle]}
                        onPress={() => {
                            onClose();
                            router.push("/write");
                        }}
                    >
                        <Icon name="pencil-outline" size={32} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.actionLabel}>WRITE</Text>
                </Animated.View>
            </View>

            {/* Close Button */}
            <Animated.View style={[styles.closeContainer, animatedCloseStyle]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.closeLabel}>Tap to close</Text>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.95)", // High opacity white
        zIndex: 1000,
        justifyContent: "center",
        alignItems: "center",
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "flex-end", // Align icons bottom
        justifyContent: "center",
        gap: 20,
        marginBottom: 80,
    },
    actionItem: {
        alignItems: "center",
    },
    centerItem: {
        marginBottom: 30, // Push the middle one up visually if aligned bottom, or just normal layout
    },
    circleButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 12,
    },
    greenCircle: {
        backgroundColor: "#889F88", // Sage Green
    },
    largeGreenCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#889F88",
    },
    terracottaCircle: {
        backgroundColor: "#C88A70", // Terracotta
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#889F88", // Using the mock design color, or could be #1A1A1A
        letterSpacing: 1.5,
        textTransform: "uppercase",
    },
    closeContainer: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
    },
    closeButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#C88A70", // Terracotta
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    closeLabel: {
        fontSize: 12,
        color: "#888",
        fontWeight: "500",
    }
});

export default EntrySelectionOverlay;

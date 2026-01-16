import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface BackButtonProps {
    onPress?: () => void;
}

export const BackButton = ({ onPress }: BackButtonProps) => {
    const router = useRouter();
    const handlePress = onPress || (() => router.back());

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePress} style={styles.button}>
                <Icon name="chevron-left" size={32} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={styles.spacer} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 20,
    },
    button: {
        padding: 10,
        marginLeft: -10,
    },
    spacer: {
        width: 40,
    },
});

export default BackButton;

import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const FONT_FAMILY = 'JetBrainsMono_400Regular';

interface HomeHeaderProps {
    currentDate: Date;
}

const HomeHeader = ({ currentDate }: HomeHeaderProps) => {
    const router = useRouter();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    return (
        <SafeAreaView style={styles.container}>
            {/* Date Title */}
            <View>
                <Text style={styles.monthText}>{month.toUpperCase()}</Text>
                <Text style={styles.yearText}>{year}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
                    <View style={styles.avatarPlaceholder}>
                        <Icon name="account" size={24} color="#555" />
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: "#F9F9F9",
    },
    monthText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1A1A1A",
        fontFamily: FONT_FAMILY,
        letterSpacing: -1,
    },
    yearText: {
        fontSize: 14,
        color: "#C86438", // Terracotta
        fontWeight: "600",
        letterSpacing: 2,
        marginTop: 4,
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconButton: {
        padding: 8,
    },
    profileButton: {
        marginLeft: 8,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0"
    }
});

export default HomeHeader;

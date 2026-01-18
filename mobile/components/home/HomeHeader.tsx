import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

interface HomeHeaderProps {
    month: string;
    year: string;
}

const HomeHeader = ({ month, year }: HomeHeaderProps) => {
    return (
        <View style={styles.container}>
            {/* Date Title */}
            <View>
                <Text style={styles.monthText}>{month}</Text>
                <Text style={styles.yearText}>{year}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="magnify" size={26} color="#1A1A1A" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileButton}>
                    <View style={styles.avatarPlaceholder}>
                        <Icon name="account" size={24} color="#555" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 60, // Adjust for status bar
        paddingBottom: 20,
        backgroundColor: "#F9F9F9",
    },
    monthText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1A1A1A",
        fontFamily: "JetBrainsMono_400Regular", // Using the font we know exists
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

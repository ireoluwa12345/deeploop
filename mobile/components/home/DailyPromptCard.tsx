import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const DailyPromptCard = () => {
    return (
        <View style={styles.container}>
            <View style={styles.bgGradient} />

            <View style={styles.headerRow}>
                <Icon name="star-four-points" size={18} color="#C86438" />
                <Text style={styles.headerText}>DAILY PROMPT</Text>
            </View>

            <Text style={styles.promptText}>
                "What is one small thing that brought you joy today, and why did it matter?"
            </Text>

            <Text style={styles.emptyStateText}>No entry yet for today</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 100, // Space for bottom nav
        borderRadius: 32,
        backgroundColor: "#F2EBE5", // Light warm beige/pinkish
        padding: 24,
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden'
    },
    bgGradient: {
        // Simulating the gradient effect with a simple view or could use Expo LinearGradient if installed
        // For now, solid color is fine as base
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 8,
    },
    headerText: {
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 2,
        color: "#C86438", // Terracotta
        textTransform: "uppercase",
    },
    promptText: {
        fontSize: 20,
        color: "#333",
        lineHeight: 28,
        fontWeight: "500",
        fontFamily: "System", // Ideally use a serif font for prompt
        marginBottom: 24,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#999",
        fontStyle: "italic",
        marginBottom: 32,
    }
});

export default DailyPromptCard;

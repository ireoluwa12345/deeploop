import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const StatsRow = () => {
    return (
        <View style={styles.container}>
            {/* Streak Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>STREAK</Text>
                <View style={styles.contentRow}>
                    <Text style={styles.largeValue}>5</Text>
                    <Text style={styles.unitText}>days</Text>
                </View>
            </View>

            {/* Mood Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>MOOD</Text>
                <View style={styles.contentRow}>
                    <View style={styles.moodDot} />
                    <Text style={styles.moodText}>Calm</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 16,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    card: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        justifyContent: "center",
        // Simple shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#888",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 8,
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    largeValue: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#C86438", // Terracotta
        marginRight: 6,
    },
    unitText: {
        fontSize: 16,
        color: "#888",
    },
    moodDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#889F88", // Sage Green
        marginRight: 8,
        // Align visually with text
        marginBottom: 4
    },
    moodText: {
        fontSize: 16,
        color: "#1A1A1A",
        fontWeight: "500",
    }
});

export default StatsRow;

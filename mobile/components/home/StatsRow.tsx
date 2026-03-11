import React from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";

interface StatsRowProps {
    streak: number;
    totalEntries: number;
    loading?: boolean;
}

const StatsRow = ({ streak, totalEntries, loading }: StatsRowProps) => {
    return (
        <View style={styles.container}>
            {/* Streak Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>STREAK</Text>
                <View style={styles.contentRow}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#C86438" />
                    ) : (
                        <>
                            <Text style={styles.largeValue}>{streak}</Text>
                            <Text style={styles.unitText}>days</Text>
                        </>
                    )}
                </View>
            </View>

            {/* Total Entries Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>ENTRIES</Text>
                <View style={styles.contentRow}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#C86438" />
                    ) : (
                        <>
                            <Text style={styles.largeValue}>{totalEntries}</Text>
                            <Text style={styles.unitText}>total</Text>
                        </>
                    )}
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
        color: "#C86438",
        marginRight: 6,
    },
    unitText: {
        fontSize: 16,
        color: "#888",
    },
});

export default StatsRow;

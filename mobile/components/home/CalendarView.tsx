import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Mock data for the calendar based on the image design
const CALENDAR_DATA = [
    { day: null }, { day: null }, { day: null }, { day: null }, { day: 1 }, { day: 2, hasEntry: true }, { day: 3 },
    { day: 4, hasEntry: true }, { day: 5, hasEntry: true }, { day: 6 }, { day: 7 }, { day: 8, hasEntry: true }, { day: 9, hasEntry: true }, { day: 10 },
    { day: 11 }, { day: 12 }, { day: 13, hasEntry: true }, { day: 14 }, { day: 15 }, { day: 16, isSelected: true }, { day: 17 },
    { day: 18, isFuture: true }, { day: 19, isFuture: true }, { day: 20, isFuture: true }, { day: 21, isFuture: true }, { day: 22, isFuture: true }, { day: 23, isFuture: true }, { day: 24, isFuture: true },
    { day: 25, isFuture: true }, { day: 26, isFuture: true }, { day: 27, isFuture: true }, { day: 28, isFuture: true }, { day: 29, isFuture: true }, { day: 30, isFuture: true }, { day: 31, isFuture: true },
];

const CalendarView = () => {
    const router = useRouter();

    const handleDayPress = (day: number) => {
        router.push({ pathname: "/timeline", params: { date: `OCTOBER ${day}TH` } });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <Icon name="chevron-left" size={24} color="#888" />
                </TouchableOpacity>
                <Text style={styles.viewTitle}>MONTH VIEW</Text>
                <TouchableOpacity>
                    <Icon name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>
            </View>

            {/* Days of Week */}
            <View style={styles.weekRow}>
                {DAYS.map((d, index) => (
                    <Text key={index} style={styles.dayLabel}>
                        {d}
                    </Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.grid}>
                {CALENDAR_DATA.map((item, index) => (
                    <View key={index} style={styles.dayCell}>
                        {item.day && (
                            <TouchableOpacity
                                onPress={() => handleDayPress(item.day!)}
                                disabled={item.isFuture}
                                style={[
                                    styles.dayCircle,
                                    item.hasEntry && styles.hasEntryCircle,
                                    item.isSelected && styles.selectedCircle,
                                    item.isFuture && { opacity: 0.5 } // Optional visual feedback
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        item.hasEntry && styles.hasEntryText,
                                        item.isSelected && styles.selectedText,
                                        item.isFuture && styles.futureText,
                                    ]}
                                >
                                    {item.day}
                                </Text>
                                {/* Dot for selected day if needed, or visual accent */}
                                {item.isSelected && <View style={styles.selectedDot} />}
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F4F1EA", // Slightly darker beige card background
        borderRadius: 24,
        padding: 24,
        marginHorizontal: 16,
        marginBottom: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    viewTitle: {
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 2,
        color: "#888",
        textTransform: "uppercase",
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    dayLabel: {
        width: 32,
        textAlign: "center",
        fontSize: 11,
        fontWeight: "bold",
        color: "#888",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    dayCell: {
        width: "14%", // 7 days -> ~14%
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    hasEntryCircle: {
        backgroundColor: "#889F88", // Muted Sage Green
    },
    selectedCircle: {
        backgroundColor: "#C88A70", // Terracotta
        shadowColor: "#C88A70",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    dayText: {
        fontSize: 14,
        color: "#1A1A1A",
        fontWeight: "500",
    },
    hasEntryText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    selectedText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    futureText: {
        color: "#CCC",
    },
    selectedDot: {
        position: 'absolute',
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C88A70'
    }
});

export default CalendarView;

import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface CalendarViewProps {
    currentDate: Date;
    onChangeMonth: (increment: number) => void;
    entryDays: number[];
    loading?: boolean;
}

interface CalendarItem {
    day: number | null;
    hasEntry?: boolean;
    isSelected?: boolean;
    isFuture?: boolean;
}

const CalendarView = ({ currentDate, onChangeMonth, entryDays, loading = false }: CalendarViewProps) => {
    const router = useRouter();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const handleDayPress = (day: number) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const formattedDate = `${year}-${month}-${dayStr}`;
        router.push({ pathname: "/timeline", params: { date: formattedDate } });
    };

    // Generate calendar grid data
    const generateCalendarData = () => {
        const data: CalendarItem[] = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            data.push({ day: null });
        }

        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
        const currentDay = today.getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const hasEntry = entryDays.includes(i);

            data.push({
                day: i,
                hasEntry: hasEntry,
                isSelected: isCurrentMonth && i === currentDay,
                isFuture: false
            });
        }

        const realToday = new Date();
        realToday.setHours(0, 0, 0, 0);

        data.forEach(item => {
            if (!item.day) {
                item.isFuture = false;
                item.hasEntry = false;
                item.isSelected = false;
                return;
            }

            const itemDate = new Date(year, month, item.day);
            itemDate.setHours(0, 0, 0, 0);

            if (itemDate > realToday) {
                item.isFuture = true;
                item.hasEntry = false;
                item.isSelected = false;
            } else {
                item.isFuture = false;
                if (itemDate.getTime() === realToday.getTime()) {
                    item.isSelected = true;
                }
            }
        });

        return data;
    };

    const calendarData = generateCalendarData();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onChangeMonth(-1)}>
                    <Icon name="chevron-left" size={24} color="#888" />
                </TouchableOpacity>
                <Text style={styles.viewTitle}>MONTH VIEW</Text>
                <TouchableOpacity onPress={() => onChangeMonth(1)}>
                    <Icon name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
                {DAYS.map((d, index) => (
                    <Text key={index} style={styles.dayLabel}>
                        {d}
                    </Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.grid}>
                {calendarData.map((item, index) => (
                    <View key={index} style={styles.dayCell}>
                        {item.day ? (
                            <TouchableOpacity
                                onPress={() => handleDayPress(item.day!)}
                                disabled={item.isFuture}
                                style={[
                                    styles.dayCircle,
                                    item.hasEntry && styles.hasEntryCircle,
                                    item.isSelected && styles.selectedCircle,
                                    item.isFuture && { opacity: 0.3 }
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
                        ) : (
                            <View style={{ width: 36, height: 36 }} /> // Placeholder
                        )}
                    </View>
                ))}

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="small" color="#C88A70" />
                    </View>
                )}
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
        zIndex: 10,
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
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(244, 241, 234, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
});

export default CalendarView;

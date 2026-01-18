import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from './styles';

const { width } = Dimensions.get('window');

// Mock Data
const ENTRIES = [
    {
        id: '1',
        type: 'write',
        time: '08:30 AM',
        content: "Started the morning with a clear head. The coffee was particularly good today. Finally felt the seasonal shift in the air."
    },
    {
        id: '2',
        type: 'snap',
        time: '01:15 PM',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2670&auto=format&fit=crop',
        caption: 'View from the garden bench'
    },
    {
        id: '3',
        type: 'record',
        time: '06:45 PM',
        title: 'Evening thoughts on the park walk',
        duration: '01:12'
    }
];

const TimelineScreen = () => {
    const router = useRouter();
    const { date } = useLocalSearchParams();

    // Fallback if no date param is passed (e.g. from nav bar)
    const displayDate = date ? date.toString() : "OCTOBER 12TH";

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Icon name="chevron-left" size={32} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{displayDate}</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="calendar-month-outline" size={28} color="#1A1A1A" />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.timelineContainer}>
                    {/* Vertical Line Spine */}
                    <View style={styles.spine} />

                    {ENTRIES.map((entry, index) => (
                        <View key={entry.id} style={styles.entryRow}>
                            {/* Time & Icon Column */}
                            <View style={styles.metaColumn}>
                                <View style={styles.iconContainer}>
                                    <Icon
                                        name={entry.type === 'write' ? 'pencil-outline' : entry.type === 'snap' ? 'camera-outline' : 'microphone-outline'}
                                        size={20}
                                        color="#555"
                                    />
                                </View>
                            </View>

                            {/* Content Column */}
                            <View style={styles.contentColumn}>
                                <Text style={styles.metaText}>{entry.time} — {entry.type.toUpperCase()}</Text>

                                <View style={styles.card}>
                                    {entry.type === 'write' && (
                                        <Text style={styles.writeContent}>{entry.content}</Text>
                                    )}

                                    {entry.type === 'snap' && (
                                        <View>
                                            <Image source={{ uri: entry.image }} style={styles.snapImage} />
                                            {entry.caption && <Text style={styles.captionText}>{entry.caption}</Text>}
                                        </View>
                                    )}

                                    {entry.type === 'record' && (
                                        <View>
                                            <Text style={styles.recordTitle}>{entry.title || 'Voice Note'}</Text>
                                            <View style={styles.audioPlayerPlaceholder}>
                                                {/* Simulated Waveform */}
                                                <View style={styles.miniWaveform}>
                                                    {Array.from({ length: 20 }).map((_, i) => (
                                                        <View key={i} style={[styles.miniBar, { height: Math.random() * 20 + 5 }]} />
                                                    ))}
                                                </View>

                                                <TouchableOpacity style={styles.miniPlayBtn}>
                                                    <Icon name="play" size={20} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab}>
                <Icon name="plus" size={32} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    scrollContent: {
        paddingBottom: 100,
    },
    timelineContainer: {
        paddingHorizontal: 20,
        position: 'relative',
    },
    spine: {
        position: 'absolute',
        left: 44, // Align with icon center (20 pad + 24 width/2 approx)
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: Colors.border,
        zIndex: -1,
    },
    entryRow: {
        flexDirection: 'row',
        marginBottom: 32,
    },
    metaColumn: {
        width: 50,
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.background, // Lighter ring
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentColumn: {
        flex: 1,
    },
    metaText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 6,
    },
    card: {
        backgroundColor: Colors.surface, // White/Cream card
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    writeContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    snapImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#EEE'
    },
    captionText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    recordTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    audioPlayerPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    miniWaveform: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        height: 30,
        flex: 1,
        marginRight: 16,
    },
    miniBar: {
        width: 3,
        backgroundColor: Colors.secondary,
        borderRadius: 1.5,
    },
    miniPlayBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary, // Terracotta
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    }
});

export default TimelineScreen;

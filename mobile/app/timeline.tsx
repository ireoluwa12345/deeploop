import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from './styles';
import { apiService, MemoryResponse } from './utils/api';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const TimelineScreen = () => {
    const router = useRouter();
    const { date } = useLocalSearchParams();
    const [memories, setMemories] = useState<MemoryResponse>();
    const [loading, setLoading] = useState(true);
    const [sound, setSound] = useState<Audio.Sound>();
    const [playingId, setPlayingId] = useState<string | null>(null);

    // Date handling
    const getLocalDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const rawDate = date ? date.toString() : getLocalDate();
    console.log(rawDate)
    const displayDate = new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();

    const getDaySuffix = (d: number) => {
        if (d > 3 && d < 21) return 'TH';
        switch (d % 10) {
            case 1: return "ST";
            case 2: return "ND";
            case 3: return "RD";
            default: return "TH";
        }
    };
    const day = new Date(rawDate).getDate();
    const formattedDisplayDate = `${new Date(rawDate).toLocaleString('default', { month: 'long' }).toUpperCase()} ${day}${getDaySuffix(day)}`;


    useEffect(() => {
        const fetchMemories = async () => {
            setLoading(true);
            try {
                const data = await apiService.getMemoriesByDate(rawDate);
                setMemories(data);
            } catch (error) {
                console.error("Failed to fetch memories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMemories();
    }, [rawDate]);

    useEffect(() => {
        return () => {
            if (sound) {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playSound = async (uri: string, id: string) => {
        if (playingId === id && sound) {
            await sound.pauseAsync();
            setPlayingId(null);
            return;
        }

        if (sound) {
            await sound.unloadAsync();
        }

        console.log('Loading Sound');
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        setPlayingId(id);

        console.log('Playing Sound');
        await newSound.playAsync();

        newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                setPlayingId(null);
            }
        });
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'audio':
                return { icon: 'microphone', label: 'AUDIO', color: '#E91E63' };
            case 'text':
                return { icon: 'notebook-outline', label: 'NOTE', color: '#FFC107' };
            case 'image':
            default:
                return { icon: 'camera-outline', label: 'SNAP', color: '#555' };
        }
    };

    const renderContent = (entry: any) => {
        switch (entry.content_type) {
            case 'audio':
                const isPlaying = playingId === entry.id;
                return (
                    <View style={styles.audioCard}>
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={() => playSound(entry.content_url, entry.id)}
                        >
                            <Icon name={isPlaying ? "pause" : "play"} size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.audioWaveform}>
                            <View style={[styles.bar, { height: 12 }]} />
                            <View style={[styles.bar, { height: 20 }]} />
                            <View style={[styles.bar, { height: 16 }]} />
                            <View style={[styles.bar, { height: 24 }]} />
                            <View style={[styles.bar, { height: 10 }]} />
                            <View style={[styles.bar, { height: 18 }]} />
                        </View>
                        <Text style={styles.audioDuration}>00:30</Text>
                        {/* Placeholder duration, real app would need metadata */}
                    </View>
                );
            case 'text':
                return (
                    <View style={styles.textCard}>
                        <Text style={styles.textContent}>{entry.content}</Text>
                    </View>
                );
            case 'image':
            default:
                return (
                    <View style={styles.card}>
                        <View>
                            <Image source={{ uri: entry.content_url }} style={styles.snapImage} />
                        </View>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Icon name="chevron-left" size={32} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{formattedDisplayDate}</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="calendar-month-outline" size={28} color="#1A1A1A" />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={{ marginTop: 100 }}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : memories?.content.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="leaf" size={48} color={Colors.secondary} style={{ opacity: 0.5, marginBottom: 16 }} />
                        <Text style={styles.emptyText}>No entries for this day.</Text>
                        <Text style={styles.emptySubText}>Take a moment to capture a memory or write down your thoughts.</Text>
                    </View>
                ) : (
                    <View style={styles.timelineContainer}>
                        {/* Vertical Line Spine */}
                        <View style={styles.spine} />

                        {memories?.content.map((entry, index) => {
                            const config = getTypeConfig(entry.content_type);
                            return (
                                <View key={entry.id} style={styles.entryRow}>
                                    {/* Time & Icon Column */}
                                    <View style={styles.metaColumn}>
                                        <View style={[styles.iconContainer, { borderColor: config.color }]}>
                                            <Icon
                                                name={config.icon as any}
                                                size={20}
                                                color={config.color}
                                            />
                                        </View>
                                    </View>

                                    {/* Content Column */}
                                    <View style={styles.contentColumn}>
                                        <Text style={[styles.metaText, { color: config.color }]}>
                                            {formatTime(entry.created_at)} — {config.label}
                                        </Text>

                                        {renderContent(entry)}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/snap')}>
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
        flexGrow: 1,
    },
    timelineContainer: {
        paddingHorizontal: 20,
        position: 'relative',
    },
    spine: {
        position: 'absolute',
        left: 44,
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
        backgroundColor: Colors.background,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentColumn: {
        flex: 1,
    },
    metaText: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 6,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    snapImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#EEE'
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontStyle: 'italic',
        color: Colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    audioCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E91E63',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    audioWaveform: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 12,
        height: 30,
    },
    bar: {
        width: 4,
        backgroundColor: '#E91E63',
        borderRadius: 2,
        opacity: 0.5,
    },
    audioDuration: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontVariant: ['tabular-nums'],
    },
    textCard: {
        backgroundColor: '#FFF9C4', // Post-it note color
        borderRadius: 12, // Slightly less rounded for a note look
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#FFC107'
    },
    textContent: {
        fontSize: 16,
        color: '#4A4A4A',
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    }
});

export default TimelineScreen;

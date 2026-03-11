import React, { useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from './styles';

const FONT_FAMILY = 'JetBrainsMono_400Regular';
import { apiService, MemoryResponse } from './utils/api';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const TimelineScreen = () => {
    const router = useRouter();
    const { date } = useLocalSearchParams();
    const [memories, setMemories] = useState<MemoryResponse>();
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [playbackProgress, setPlaybackProgress] = useState<{ [key: string]: number }>({});
    const [audioDuration, setAudioDuration] = useState<{ [key: string]: number }>({});
    const [audioLoading, setAudioLoading] = useState<string | null>(null);
    const audioCache = useRef<{ [id: string]: Audio.Sound }>({});
    const flatListRef = useRef<FlatList>(null);

    const imageEntries = useMemo(() => {
        if (!memories?.content) return [];
        return memories.content.filter(e => e.content_type === 'image');
    }, [memories]);

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
            Object.values(audioCache.current).forEach(sound => {
                sound.unloadAsync();
            });
            audioCache.current = {};
        };
    }, []);

    const playSound = async (uri: string, id: string) => {
        const cachedSound = audioCache.current[id];

        if (cachedSound) {
            const status = await cachedSound.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
                await cachedSound.pauseAsync();
                setPlayingId(null);
            } else if (status.isLoaded) {
                const position = status.positionMillis || 0;
                const dur = status.durationMillis || 30000;
                if (position >= dur - 100) {
                    await cachedSound.setPositionAsync(0);
                    setPlaybackProgress(prev => ({ ...prev, [id]: 0 }));
                }
                await cachedSound.playAsync();
                setPlayingId(id);
            }
            return;
        }

        setAudioLoading(id);

        try {
            const { sound: newSound } = await Audio.Sound.createAsync({ uri });
            audioCache.current[id] = newSound;
            setPlayingId(id);
            setAudioLoading(null);

            const status = await newSound.getStatusAsync();
            if (status.isLoaded) {
                setAudioDuration(prev => ({ ...prev, [id]: status.durationMillis || 30000 }));
            }

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    if (status.positionMillis !== undefined) {
                        setPlaybackProgress(prev => ({ ...prev, [id]: status.positionMillis }));
                    }
                    if (status.didJustFinish) {
                        setPlayingId(null);
                        setPlaybackProgress(prev => ({ ...prev, [id]: 0 }));
                    }
                }
            });

            await newSound.playAsync();
        } catch (error) {
            console.error('Failed to load audio:', error);
            setAudioLoading(null);
        }
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
                const isLoading = audioLoading === entry.id;
                const progress = playbackProgress[entry.id] || 0;
                const duration = audioDuration[entry.id] || 30000;
                const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
                const waveformBars = [
                    { height: 10 }, { height: 18 }, { height: 14 }, { height: 22 },
                    { height: 16 }, { height: 26 }, { height: 12 }, { height: 20 },
                    { height: 8 }, { height: 24 }, { height: 18 }, { height: 14 },
                    { height: 22 }, { height: 10 }, { height: 16 }, { height: 20 },
                    { height: 12 }, { height: 18 }, { height: 24 }, { height: 14 },
                ];
                return (
                    <View>
                        {entry.content ? (
                            <Text style={styles.captionText}>{entry.content}</Text>
                        ) : null}
                        <View style={styles.audioCard}>
                            <TouchableOpacity
                                style={[styles.playButton, isPlaying && styles.playButtonActive, isLoading && styles.playButtonLoading]}
                                onPress={() => !isLoading && playSound(entry.content_url, entry.id)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Icon name={isPlaying ? "pause" : "play"} size={18} color="#FFF" />
                                )}
                            </TouchableOpacity>
                            <View style={styles.audioWaveformContainer}>
                                <View style={styles.audioWaveform}>
                                    {waveformBars.map((bar, idx) => (
                                        <View
                                            key={idx}
                                            style={[
                                                styles.bar,
                                                { height: bar.height },
                                                isPlaying && styles.barActive,
                                                progressPercent > (idx / waveformBars.length) * 100 && styles.barPlayed,
                                            ]}
                                        />
                                    ))}
                                </View>
                                <View style={styles.audioTimeRow}>
                                    <Text style={styles.audioCurrentTime}>{formatDuration(progress)}</Text>
                                    <Text style={styles.audioDuration}>{formatDuration(duration)}</Text>
                                </View>
                            </View>
                        </View>
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
                const imageIdx = imageEntries.findIndex(e => e.id === entry.id);
                return (
                    <View>
                        {entry.content ? (
                            <Text style={styles.captionText}>{entry.content}</Text>
                        ) : null}
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.9}
                            onPress={() => setViewerIndex(imageIdx >= 0 ? imageIdx : 0)}
                        >
                            <Image source={{ uri: entry.content_url }} style={styles.snapImage} />
                        </TouchableOpacity>
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
                <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/')}>
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

            {/* Fullscreen Image Viewer */}
            <Modal visible={viewerIndex !== null} animationType="slide" onRequestClose={() => setViewerIndex(null)}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setViewerIndex(null)} style={styles.iconButton}>
                            <Icon name="arrow-left" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>{formattedDisplayDate} GALLERY</Text>
                        <View style={{ width: 32 }} />
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={imageEntries}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={viewerIndex ?? 0}
                        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                        onMomentumScrollEnd={(e) => {
                            if (viewerIndex === null) return;
                            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                            setViewerIndex(idx);
                        }}
                        contentContainerStyle={{ alignItems: 'center' }}
                        renderItem={({ item }) => (
                            <View style={styles.modalSlide}>
                                <Image source={{ uri: item.content_url }} style={styles.modalImage} resizeMode="cover" />
                                {item.content ? (
                                    <Text style={styles.modalCaption}>{item.content}</Text>
                                ) : null}
                                <Text style={styles.modalTimeLabel}>
                                    {formatTime(item.created_at)} • SNAP
                                </Text>
                            </View>
                        )}
                    />

                    {/* Page indicator dots */}
                    {imageEntries.length > 1 && (
                        <View style={styles.dotsContainer}>
                            {imageEntries.map((_, i) => (
                                <View key={i} style={[styles.dot, i === (viewerIndex ?? 0) && styles.dotActive]} />
                            ))}
                        </View>
                    )}
                </SafeAreaView>
            </Modal>
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
        paddingBottom: 12,
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
        fontFamily: FONT_FAMILY,
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
        borderWidth: 1,
        borderColor: 'rgba(233, 30, 99, 0.15)',
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    playButtonActive: {
        backgroundColor: '#E91E63',
    },
    playButtonLoading: {
        backgroundColor: 'rgba(233, 30, 99, 0.5)',
    },
    audioWaveformContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    audioWaveform: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 28,
        marginBottom: 6,
    },
    bar: {
        flex: 1,
        maxWidth: 6,
        backgroundColor: '#E91E63',
        borderRadius: 2,
        opacity: 0.25,
        marginHorizontal: 1,
    },
    barActive: {
        opacity: 0.6,
    },
    barPlayed: {
        backgroundColor: '#E91E63',
        opacity: 1,
    },
    audioTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    audioCurrentTime: {
        fontSize: 11,
        color: '#E91E63',
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    audioDuration: {
        fontSize: 11,
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
        fontFamily: FONT_FAMILY,
    },
    captionText: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 8,
        lineHeight: 20,
        fontFamily: FONT_FAMILY,
        fontStyle: 'italic',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 12,
        marginTop: 20,
    },
    modalHeaderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        letterSpacing: 1,
    },
    modalSlide: {
        width: width,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    modalImage: {
        width: width - 40,
        height: width * 1.1,
        borderRadius: 16,
        backgroundColor: '#EEE',
    },
    modalCaption: {
        color: Colors.text,
        fontSize: 16,
        marginTop: 24,
        textAlign: 'center',
        lineHeight: 26,
        fontFamily: FONT_FAMILY,
        paddingHorizontal: 30,
    },
    modalTimeLabel: {
        color: Colors.secondary,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginTop: 12,
        textTransform: 'uppercase',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 40,
        paddingTop: 20,
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D5DFD0',
    },
    dotActive: {
        backgroundColor: '#C86438',
    }
});

export default TimelineScreen;

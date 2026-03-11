import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform, Alert, GestureResponderEvent, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { Colors } from './styles';

const FONT_FAMILY = 'JetBrainsMono_400Regular';
import { randomString } from './utils/helper';
import { apiService } from "./utils/api";

const { width } = Dimensions.get('window');

const RecordScreen = () => {
    const router = useRouter();
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [recordingTime, setRecordingTime] = useState(0); // in seconds
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);
    const [meteringLevels, setMeteringLevels] = useState<number[]>(new Array(30).fill(0.1));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Format time mm:ss or hh:mm:ss
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const pad = (n: number) => n.toString().padStart(2, '0');

        if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
        return `00:${pad(m)}:${pad(s)}`;
    };

    const startRecording = async () => {
        try {
            if (permissionResponse?.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Enable metering
            const recordingOptions = {
                ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
                isMeteringEnabled: true,
                android: {
                    ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
                    isMeteringEnabled: true,
                },
                ios: {
                    ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
                    isMeteringEnabled: true,
                }
            };

            const { recording } = await Audio.Recording.createAsync(recordingOptions);

            setRecording(recording);
            setIsRecording(true);
            setRecordingTime(0);
            setRecordingUri(null);
            setSound(null);
            setMeteringLevels(new Array(30).fill(0.1));

            recording.setOnRecordingStatusUpdate((status) => {
                if (status.isRecording && status.metering !== undefined) {
                    // Metering is usually -160dB (silence) to 0dB (loudest)
                    // Normalize to 0-1 mostly, maybe -60 as floor
                    const db = status.metering;
                    const minDb = -60;
                    const normalized = Math.max(0, (db - minDb) / Math.abs(minDb)); // 0 to 1

                    setMeteringLevels(current => {
                        const newLevels = [...current.slice(1), normalized];
                        return newLevels;
                    });
                }
            });

        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        setRecording(null);
        if (recording) {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            });
            const uri = recording.getURI();
            setRecordingUri(uri);
            console.log('Recording stopped and stored at', uri);
            // Prepare sound for playback immediately
            if (uri) {
                const { sound: newSound, status } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: false }
                );
                setSound(newSound);
                // @ts-ignore
                if (status.durationMillis) setPlaybackDuration(status.durationMillis / 1000);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded) {
                        setPlaybackPosition(status.positionMillis / 1000);
                        setIsPlaying(status.isPlaying);
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                            newSound.setPositionAsync(0);
                        }
                    }
                });
            }
        }
    };

    const playRecording = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        }
    };

    const seekToPosition = async (event: GestureResponderEvent) => {
        if (!sound || playbackDuration <= 0) return;
        const { locationX } = event.nativeEvent;
        const seekBarWidth = width - 80; // matches paddingHorizontal: 40
        const ratio = Math.max(0, Math.min(1, locationX / seekBarWidth));
        const positionMs = ratio * playbackDuration * 1000;
        await sound.setPositionAsync(positionMs);
    };

    const skipForward = async () => {
        if (!sound || playbackDuration <= 0) return;
        const newPos = Math.min(playbackDuration, playbackPosition + 10);
        await sound.setPositionAsync(newPos * 1000);
    };

    const skipBackward = async () => {
        if (!sound) return;
        const newPos = Math.max(0, playbackPosition - 10);
        await sound.setPositionAsync(newPos * 1000);
    };

    const discardRecording = () => {
        setRecordingUri(null);
        setSound(null);
        setRecordingTime(0);
        setMeteringLevels(new Array(30).fill(0.1));
        // Clean up sound
        if (sound) sound.unloadAsync();
    };

    const saveRecording = async () => {
        if (!recordingUri) return;

        setIsSaving(true);
        try {
            const formData = new FormData();

            const filename = randomString() + '.m4a';

            // @ts-ignore — React Native FormData accepts this shape
            formData.append("file", {
                uri: recordingUri,
                name: filename,
                type: 'audio/m4a',
            });
            formData.append("content_type", "audio");

            await apiService.createMemory(formData);

            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            router.replace({ pathname: "/timeline", params: { date: dateStr } });
        } catch (error) {
            Alert.alert("Error", "Failed to save memory");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (isRecording) {
            stopRecording();
        }
        if (sound) sound.unloadAsync();
        router.back();
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
                    <Icon name="chevron-down" size={32} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Voice Note</Text>
                <View style={{ width: 32 }} />
            </SafeAreaView>

            <View style={styles.content}>

                <Text style={styles.sessionInfo}>SESSION ACTIVE • {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit"
                }).toUpperCase()}</Text>

                {/* Status or Playback Info */}
                {!recordingUri ? (
                    <View style={styles.statusIndicator}>
                        {isRecording && <View style={styles.recordingDot} />}
                        <Text style={styles.statusText}>{isRecording ? "RECORDING" : "READY"}</Text>
                    </View>
                ) : (
                    <View style={styles.statusIndicator}>
                        <Icon name="play-circle-outline" size={12} color={Colors.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={styles.statusText}>ENTRY RECORDED</Text>
                    </View>
                )}

                {/* Timer or Duration */}
                <Text style={styles.timerText}>
                    {recordingUri ? formatTime(playbackPosition) : formatTime(recordingTime)}
                </Text>

                {/* Seek Bar — only in review mode */}
                {recordingUri && playbackDuration > 0 && (
                    <View style={styles.seekContainer}>
                        <Text style={styles.seekTime}>{formatTime(playbackPosition)}</Text>
                        <View
                            style={styles.seekBarOuter}
                            onStartShouldSetResponder={() => true}
                            onResponderRelease={seekToPosition}
                            onMoveShouldSetResponder={() => true}
                            onResponderMove={seekToPosition}
                        >
                            <View style={styles.seekBarTrack}>
                                <View
                                    style={[
                                        styles.seekBarFill,
                                        { width: `${(playbackPosition / playbackDuration) * 100}%` },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.seekBarThumb,
                                        { left: `${(playbackPosition / playbackDuration) * 100}%` },
                                    ]}
                                />
                            </View>
                        </View>
                        <Text style={styles.seekTime}>{formatTime(playbackDuration)}</Text>
                    </View>
                )}

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    {!recordingUri ? (
                        isRecording ? (
                            <TouchableOpacity onPress={stopRecording} style={styles.recordButtonContainer}>
                                <View style={styles.stopButton} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={startRecording} style={styles.recordButtonContainer}>
                                <View style={styles.startIcon} />
                            </TouchableOpacity>
                        )
                    ) : (
                        <View style={styles.playbackControls}>
                            {/* Retake / Delete */}
                            <TouchableOpacity onPress={discardRecording} style={styles.secondaryButton}>
                                <Icon name="delete-outline" size={28} color={Colors.primary} />
                            </TouchableOpacity>

                            {/* Skip Backward 10s */}
                            <TouchableOpacity onPress={skipBackward} style={styles.skipButton}>
                                <Icon name="rewind-10" size={28} color={Colors.text} />
                            </TouchableOpacity>

                            {/* Play / Pause */}
                            <TouchableOpacity onPress={playRecording} style={styles.playButton}>
                                <Icon name={isPlaying ? "pause" : "play"} size={40} color={Colors.surface} />
                            </TouchableOpacity>

                            {/* Skip Forward 10s */}
                            <TouchableOpacity onPress={skipForward} style={styles.skipButton}>
                                <Icon name="fast-forward-10" size={28} color={Colors.text} />
                            </TouchableOpacity>

                            {/* Save */}
                            <TouchableOpacity onPress={saveRecording} disabled={isSaving} style={styles.secondaryButton}>
                                {isSaving ? (
                                    <ActivityIndicator size="small" color={Colors.secondary} />
                                ) : (
                                    <Icon name="check" size={28} color={Colors.secondary} />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {!recordingUri && (
                    <Text style={styles.hintText}>{isRecording ? "TAP TO STOP" : "TAP TO RECORD"}</Text>
                )}
                {recordingUri && (
                    <Text style={styles.hintText}>REVIEW ENTRY</Text>
                )}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background, // Standardized
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    iconButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    sessionInfo: {
        fontSize: 10,
        color: Colors.textSecondary,
        letterSpacing: 2,
        marginBottom: 80,
        textTransform: 'uppercase'
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginRight: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 1,
    },
    timerText: {
        fontSize: 64,
        fontFamily: FONT_FAMILY,
        fontWeight: '400',
        color: Colors.text,
        marginBottom: 40,
        letterSpacing: -2
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        gap: 4,
        marginBottom: 80,
        width: '80%',
    },
    waveBar: {
        width: 4,
        backgroundColor: Colors.secondary, // Sage
        borderRadius: 2,
    },
    controlsContainer: {
        marginBottom: 20,
        height: 100, // Fixed height to prevent jumps
        justifyContent: 'center'
    },
    recordButtonContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(200, 100, 56, 0.2)', // Terracotta faint - maybe add faintPrimary to Colors? keeping adhoc for now or deriving.
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 24,
        borderColor: Colors.primary,
    },
    startIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
    },
    seekContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 40,
        marginBottom: 30,
    },
    seekTime: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontFamily: FONT_FAMILY,
        width: 52,
        textAlign: 'center',
    },
    seekBarOuter: {
        flex: 1,
        height: 36,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    seekBarTrack: {
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: 2,
        position: 'relative',
    },
    seekBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    seekBarThumb: {
        position: 'absolute',
        top: -6,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        marginLeft: -8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    playbackControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    skipButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    hintText: {
        fontSize: 10,
        color: Colors.textSecondary,
        letterSpacing: 2,
        textTransform: 'uppercase',
    }
});

export default RecordScreen;

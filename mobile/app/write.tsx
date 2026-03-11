import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { apiService } from "./utils/api";

const FONT_FAMILY = 'JetBrainsMono_400Regular';

const WriteScreen = () => {
    const router = useRouter();
    const [entryText, setEntryText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const now = new Date();
    const dateLabel = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const timeLabel = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

    const handleDone = async () => {
        const trimmed = entryText.trim();
        if (!trimmed) {
            Alert.alert("Empty Entry", "Write something before saving.");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("content_type", "text");
            formData.append("content", trimmed);

            // Backend requires a file field — send the text as a .txt file
            // @ts-ignore — React Native FormData accepts this shape
            formData.append("file", {
                uri: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(trimmed)))}`,
                name: "entry.txt",
                type: "text/plain",
            });

            await apiService.createMemory(formData);

            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
            router.replace({ pathname: "/timeline", params: { date: dateStr } });
        } catch (error) {
            Alert.alert("Error", "Failed to save memory");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} disabled={isSaving}>
                    <Icon name="chevron-left" size={28} color="#888" />
                </TouchableOpacity>

                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{dateLabel}</Text>
                    <Text style={styles.timeText}>{dayName} • {timeLabel}</Text>
                </View>

                <TouchableOpacity onPress={handleDone} disabled={isSaving} style={styles.doneButton}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#5A7D5A" />
                    ) : (
                        <Text style={styles.doneText}>Done</Text>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.editorContainer}
                >
                    <TextInput
                        style={styles.textInput}
                        multiline
                        placeholder="Today started slowly, with the rain against the window creating a rhythm I couldn't ignore..."
                        placeholderTextColor="#888"
                        value={entryText}
                        onChangeText={setEntryText}
                        autoFocus
                        textAlignVertical="top"
                        selectionColor="#C86438"
                        editable={!isSaving}
                    />
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>

            {/* Word Count */}
            <View style={styles.footer}>
                <Text style={styles.wordCount}>{entryText.trim().split(/\s+/).filter(w => w.length > 0).length} WORDS</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2EBE5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    iconButton: {
        padding: 8,
        marginLeft: -8,
    },
    dateContainer: {
        alignItems: 'center',
    },
    dateText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5A7D5A',
        letterSpacing: 1,
    },
    timeText: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    doneButton: {
        minWidth: 50,
        alignItems: 'center',
    },
    doneText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#5A7D5A",
    },
    editorContainer: {
        flex: 1,
        padding: 24,
    },
    textInput: {
        flex: 1,
        fontSize: 18,
        lineHeight: 28,
        color: "#1A1A1A",
        fontFamily: FONT_FAMILY,
    },
    footer: {
        padding: 16,
        alignItems: 'flex-end',
        backgroundColor: '#F2EBE5'
    },
    wordCount: {
        fontSize: 10,
        color: '#AAA',
        letterSpacing: 1,
        fontWeight: 'bold'
    }
});

export default WriteScreen;

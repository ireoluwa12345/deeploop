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
    StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const WriteScreen = () => {
    const router = useRouter();
    const [entryText, setEntryText] = useState("");

    const handleDone = () => {
        // TODO: Save entry logic
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Icon name="chevron-left" size={28} color="#888" />
                </TouchableOpacity>

                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>OCT 24, 2023</Text>
                    <Text style={styles.timeText}>TUESDAY • 9:41 AM</Text>
                </View>

                <TouchableOpacity onPress={handleDone}>
                    <Text style={styles.doneText}>Done</Text>
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
                    />
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>

            {/* Word Count (Optional based on design, but good for specific UX) */}
            <View style={styles.footer}>
                <Text style={styles.wordCount}>{entryText.trim().split(/\s+/).filter(w => w.length > 0).length} WORDS</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2EBE5", // Light beige background from design
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
        color: '#5A7D5A', // Sage Green Title
        letterSpacing: 1,
    },
    timeText: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    doneText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#5A7D5A", // Sage Green Action
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
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace", // Monospace font as per design appearance
    },
    footer: {
        padding: 16,
        alignItems: 'flex-end',
        backgroundColor: '#F2EBE5' // Match bg
    },
    wordCount: {
        fontSize: 10,
        color: '#AAA',
        letterSpacing: 1,
        fontWeight: 'bold'
    }
});

export default WriteScreen;

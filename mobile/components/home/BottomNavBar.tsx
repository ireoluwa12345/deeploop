import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const BottomNavBar = () => {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.navItem}>
                <Icon name="calendar-month" size={26} color="#C86438" />
                <Text style={[styles.navText, styles.activeText]}>Journal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => router.push("/timeline")}>
                <Icon name="view-dashboard-outline" size={26} color="#888" />
                <Text style={styles.navText}>Today's Logs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profile")}>
                <Icon name="account-outline" size={26} color="#888" />
                <Text style={styles.navText}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: 20, // Safe area padding simulation
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 10,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        color: "#888",
        fontWeight: "500",
    },
    activeText: {
        color: "#C86438", // Terracotta
        fontWeight: "bold",
    }
});

export default BottomNavBar;

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useAuth } from './context/auth';
import { Colors } from './styles';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/welcome');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Icon name="chevron-left" size={32} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PROFILE</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="cog-outline" size={28} color={Colors.text} />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop' }}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.username}>alex_journals</Text>
                    <Text style={styles.bio}>Finding peace in the everyday.</Text>
                    <Text style={styles.joinedDate}>JOINED OCT 2023</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>TOTAL ENTRIES</Text>
                        <Text style={styles.statValue}>124</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>DAY STREAK</Text>
                        <Text style={styles.statValue}>12</Text>
                    </View>
                </View>

                {/* Settings Menu */}
                <Text style={styles.sectionTitle}>SETTINGS & PREFERENCES</Text>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Icon name="account-edit" size={20} color="#5A7D5A" />
                        </View>
                        <Text style={styles.menuText}>Edit Profile</Text>
                        <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Icon name="bell" size={20} color="#5A7D5A" />
                        </View>
                        <Text style={styles.menuText}>Notification Settings</Text>
                        <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Icon name="shield-check" size={20} color="#5A7D5A" />
                        </View>
                        <Text style={styles.menuText}>Privacy & Security</Text>
                        <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Icon name="database-export" size={20} color="#5A7D5A" />
                        </View>
                        <Text style={styles.menuText}>Export My Data</Text>
                        <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
                    <Icon name="logout" size={24} color={Colors.error} />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

            </ScrollView>
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
        paddingBottom: 10,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 2,
        textTransform: 'uppercase'
    },
    scrollContent: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: Colors.secondary,
        padding: 4,
        marginBottom: 16,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        fontFamily: 'monospace', // simulated styling
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    bio: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    joinedDate: {
        fontSize: 10,
        color: '#BBB',
        letterSpacing: 1,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statCard: {
        backgroundColor: Colors.surface, // Standard off-white card
        borderRadius: 12,
        padding: 24,
        width: '48%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)'
    },
    wideCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 24,
        marginBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)'
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#AAA',
        letterSpacing: 1.5,
        marginBottom: 12,
        textTransform: 'uppercase'
    },
    statValue: {
        fontSize: 32,
        fontWeight: '400',
        color: Colors.text,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#BBB',
        letterSpacing: 1.5,
        marginBottom: 16,
        textTransform: 'uppercase'
    },
    menuContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
        paddingVertical: 8,
        marginBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E6E8E3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        fontFamily: 'monospace',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 72,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 12,
    },
    signOutText: {
        marginLeft: 16,
        color: Colors.error,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: 'monospace',
    }
});

export default ProfileScreen;

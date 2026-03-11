import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useAuth } from './context/auth';
import { Colors } from './styles';

const FONT_FAMILY = 'JetBrainsMono_400Regular';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const router = useRouter();
    const { logout, user } = useAuth();

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
        : '';

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
                <View style={{ width: 32 }} />
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {user?.profile_image ? (
                            <Image source={{ uri: user.profile_image }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.username}>{user?.name || 'User'}</Text>
                    <Text style={styles.bio}>{user?.email || ''}</Text>
                    {joinedDate ? <Text style={styles.joinedDate}>JOINED {joinedDate}</Text> : null}
                </View>

                {/* Settings Menu */}
                <Text style={styles.sectionTitle}>SETTINGS & PREFERENCES</Text>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
                        <View style={styles.menuIconContainer}>
                            <Icon name="account-edit" size={20} color="#5A7D5A" />
                        </View>
                        <Text style={styles.menuText}>Edit Profile</Text>
                        <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Icon name="shield-check" size={20} color="#5A7D5A" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.menuText}>Privacy & Security</Text>
                            <Text style={styles.menuSubText}>Your files and personal information are encrypted and never shared or used for third-party purposes.</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem} disabled>
                        <View style={styles.menuIconContainer}>
                            <Icon name="database-export" size={20} color="#5A7D5A" />
                        </View>
                        <Text style={styles.menuText}>Export My Data</Text>
                        <View style={styles.comingSoonBadge}>
                            <Text style={styles.comingSoonText}>COMING SOON</Text>
                        </View>
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
        paddingBottom: 4,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 2,
        fontFamily: FONT_FAMILY,
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
        overflow: 'hidden',
    },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 38,
        fontWeight: 'bold',
        color: Colors.surface,
        letterSpacing: 1,
        fontFamily: FONT_FAMILY,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        fontFamily: FONT_FAMILY,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    bio: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 4,
        fontFamily: FONT_FAMILY,
    },
    joinedDate: {
        fontSize: 10,
        color: '#BBB',
        letterSpacing: 1,
        marginTop: 4,
        fontFamily: FONT_FAMILY,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#BBB',
        letterSpacing: 1.5,
        marginBottom: 16,
        fontFamily: FONT_FAMILY,
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
        fontFamily: FONT_FAMILY,
    },
    menuSubText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
        lineHeight: 18,
        fontFamily: FONT_FAMILY,
    },
    comingSoonBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    comingSoonText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#E6A04C',
        letterSpacing: 1,
        fontFamily: FONT_FAMILY,
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
        fontFamily: FONT_FAMILY,
    }
});

export default ProfileScreen;

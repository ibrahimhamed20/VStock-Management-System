import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../../auth/stores/authStore';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';

export const ProfileScreen: React.FC = () => {
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
    };

    const menuItems = [
        { id: 'profile', icon: '👤', title: 'Edit Profile', subtitle: 'Update your information' },
        { id: 'notifications', icon: '🔔', title: 'Notifications', subtitle: 'Manage alerts and reminders' },
        { id: 'language', icon: '🌐', title: 'Language', subtitle: 'English' },
        { id: 'theme', icon: '🎨', title: 'Appearance', subtitle: 'Light mode' },
        { id: 'help', icon: '❓', title: 'Help & Support', subtitle: 'Get assistance' },
        { id: 'about', icon: 'ℹ️', title: 'About', subtitle: 'Version 1.0.0' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* User Header */}
            <View style={styles.header}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarText}>
                        {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.userName}>
                    {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username || 'User'}
                </Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {user?.roles?.join(', ') || 'User'}
                    </Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                {menuItems.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Text style={styles.menuEmoji}>{item.icon}</Text>
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>VStock Management System v1.0</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    header: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: fontWeight.bold,
        color: colors.textInverse,
    },
    userName: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    userEmail: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    roleBadge: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    roleText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
        textTransform: 'capitalize',
    },
    menuSection: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuEmoji: {
        fontSize: 20,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    menuSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    menuArrow: {
        fontSize: fontSize.xl,
        color: colors.textLight,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.danger + '10',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.danger,
    },
    logoutIcon: {
        fontSize: 20,
    },
    logoutText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.danger,
    },
    footer: {
        textAlign: 'center',
        color: colors.textLight,
        fontSize: fontSize.xs,
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
});

export default ProfileScreen;

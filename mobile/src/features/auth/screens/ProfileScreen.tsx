import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors, spacing, fontSize, borderRadius, shadows, fontWeight } from '../../core/theme';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen = () => {
    const { user, logout } = useAuthStore();
    const navigation = useNavigation();

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const menuItems = [
        {
            icon: '📦',
            label: 'Purchase Orders',
            onPress: () => navigation.navigate('PurchaseList' as never)
        },
        {
            icon: '🏢',
            label: 'Suppliers',
            onPress: () => navigation.navigate('Suppliers' as never)
        },
        // Only show Admin items if user has role
        ...(user?.roles?.includes('ADMIN') ? [
            {
                icon: '⚙️',
                label: 'Settings',
                onPress: () => Alert.alert('Coming Soon', 'Settings module is under development')
            }
        ] : [])
    ];

    const getInitials = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`;
        }
        return user?.username?.slice(0, 2).toUpperCase() || 'U';
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials()}</Text>
                </View>
                <Text style={styles.name}>
                    {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.role}>{user?.roles?.join(', ') || 'No roles'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Management</Text>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.surface,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        color: '#fff',
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
    },
    name: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    role: {
        fontSize: fontSize.sm,
        color: colors.primary,
        marginBottom: spacing.xs,
        fontWeight: fontWeight.medium,
    },
    email: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    section: {
        backgroundColor: colors.surface,
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        marginLeft: spacing.lg,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: spacing.md,
    },
    menuLabel: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.text,
    },
    chevron: {
        fontSize: 20,
        color: colors.textLight,
    },
    logoutButton: {
        margin: spacing.xl,
        backgroundColor: '#fee2e2',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: fontSize.md,
        fontWeight: 'bold',
    },
    version: {
        textAlign: 'center',
        color: colors.textLight,
        marginBottom: spacing.xl,
        fontSize: fontSize.xs,
    },
});

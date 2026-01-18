import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import { useAuthStore } from '../../auth/stores/authStore';
import apiService from '../../../services/api';

interface DashboardStats {
    totalProducts: number;
    lowStockCount: number;
    todaySales: number;
    pendingOrders: number;
}

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            // const data = await apiService.getDashboardStats();
            // setStats(data);
            // Using mock data for now
            setStats({
                totalProducts: 156,
                lowStockCount: 12,
                todaySales: 2450.00,
                pendingOrders: 5,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const quickActions = [
        {
            id: 'scan',
            title: 'Scan Product',
            icon: '📷',
            color: colors.primary,
            onPress: () => { } // Will implement scanner
        },
        {
            id: 'sale',
            title: 'New Sale',
            icon: '💰',
            color: colors.success,
            onPress: () => navigation.navigate('Sales' as never)
        },
        {
            id: 'inventory',
            title: 'Check Stock',
            icon: '📦',
            color: colors.warning,
            onPress: () => navigation.navigate('Inventory' as never)
        },
        {
            id: 'lowstock',
            title: 'Low Stock',
            icon: '⚠️',
            color: colors.danger,
            onPress: () => navigation.navigate('Inventory' as never)
        },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Welcome Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>
                        {user?.firstName || user?.username || 'User'}
                    </Text>
                </View>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
                    <Text style={styles.statIcon}>📦</Text>
                    <Text style={styles.statValue}>{stats?.totalProducts || 0}</Text>
                    <Text style={styles.statLabel}>Products</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.danger }]}>
                    <Text style={styles.statIcon}>⚠️</Text>
                    <Text style={styles.statValue}>{stats?.lowStockCount || 0}</Text>
                    <Text style={styles.statLabel}>Low Stock</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.success }]}>
                    <Text style={styles.statIcon}>💵</Text>
                    <Text style={styles.statValue}>${stats?.todaySales?.toLocaleString() || 0}</Text>
                    <Text style={styles.statLabel}>Today Sales</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.warning }]}>
                    <Text style={styles.statIcon}>📋</Text>
                    <Text style={styles.statValue}>{stats?.pendingOrders || 0}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                {quickActions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.actionCard}
                        onPress={action.onPress}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                            <Text style={styles.actionEmoji}>{action.icon}</Text>
                        </View>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Recent Activity placeholder */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
                <Text style={styles.activityPlaceholder}>
                    Recent transactions and activities will appear here
                </Text>
            </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    userName: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textInverse,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing.xs,
        marginBottom: spacing.lg,
    },
    statCard: {
        width: '48%',
        margin: '1%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textInverse,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textInverse,
        opacity: 0.9,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing.xs,
        marginBottom: spacing.lg,
    },
    actionCard: {
        width: '48%',
        margin: '1%',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    actionEmoji: {
        fontSize: 28,
    },
    actionTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    activityCard: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    activityPlaceholder: {
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default DashboardScreen;

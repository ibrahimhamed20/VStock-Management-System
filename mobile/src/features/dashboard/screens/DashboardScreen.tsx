import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import { useAuthStore } from '../../auth/stores/authStore';
import apiService from '../../../services/api';
import { DashboardStats } from '../../../types';

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getDashboardStats();
            setStats(data);
        } catch (err: any) {
            console.error('Failed to fetch stats:', err);
            setError(err.message || 'Failed to load dashboard data');
            // Set fallback data
            setStats({
                totalProducts: 0,
                lowStockCount: 0,
                todaySales: 0,
                todayInvoiceCount: 0,
                pendingOrders: 0,
                totalClients: 0,
                totalInventoryValue: 0,
                recentActivity: [],
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStats();
    }, [fetchStats]);

    const quickActions = [
        {
            id: 'sale',
            title: 'New Sale',
            icon: '💰',
            color: colors.success,
            onPress: () => navigation.navigate('Sales' as never)
        },
        {
            id: 'inventory',
            title: 'Products',
            icon: '📦',
            color: colors.primary,
            onPress: () => navigation.navigate('Inventory' as never)
        },
        {
            id: 'lowstock',
            title: 'Low Stock',
            icon: '⚠️',
            color: colors.danger,
            onPress: () => navigation.navigate('LowStock' as never)
        },
        {
            id: 'clients',
            title: 'Clients',
            icon: '👥',
            color: colors.secondary,
            onPress: () => navigation.navigate('Clients' as never)
        },
    ];

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

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

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity onPress={fetchStats}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                <TouchableOpacity
                    style={[styles.statCard, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Inventory' as never)}
                >
                    <Text style={styles.statIcon}>📦</Text>
                    <Text style={styles.statValue}>{stats?.totalProducts || 0}</Text>
                    <Text style={styles.statLabel}>Products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.statCard, { backgroundColor: colors.danger }]}
                    onPress={() => navigation.navigate('LowStock' as never)}
                >
                    <Text style={styles.statIcon}>⚠️</Text>
                    <Text style={styles.statValue}>{stats?.lowStockCount || 0}</Text>
                    <Text style={styles.statLabel}>Low Stock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.statCard, { backgroundColor: colors.success }]}
                    onPress={() => navigation.navigate('InvoiceList' as never)}
                >
                    <Text style={styles.statIcon}>💵</Text>
                    <Text style={styles.statValue}>{formatCurrency(stats?.todaySales || 0)}</Text>
                    <Text style={styles.statLabel}>Today Sales</Text>
                </TouchableOpacity>

                <View style={[styles.statCard, { backgroundColor: colors.warning }]}>
                    <Text style={styles.statIcon}>📋</Text>
                    <Text style={styles.statValue}>{stats?.pendingOrders || 0}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
            </View>

            {/* Inventory Value Card */}
            <View style={styles.valueCard}>
                <View style={styles.valueCardContent}>
                    <Text style={styles.valueCardLabel}>Total Inventory Value</Text>
                    <Text style={styles.valueCardAmount}>
                        {formatCurrency(stats?.totalInventoryValue || 0)}
                    </Text>
                </View>
                <Text style={styles.valueCardIcon}>📊</Text>
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

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, index) => (
                        <View key={activity.id || index} style={styles.activityItem}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <Text style={styles.activityDesc}>{activity.description}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.activityPlaceholder}>
                        Recent transactions and activities will appear here
                    </Text>
                )}
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.md,
        color: colors.textSecondary,
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
    errorBanner: {
        backgroundColor: '#fef2f2',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: {
        color: colors.danger,
        fontSize: fontSize.sm,
        flex: 1,
    },
    retryText: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
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
    valueCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.sm,
    },
    valueCardContent: {
        flex: 1,
    },
    valueCardLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    valueCardAmount: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    valueCardIcon: {
        fontSize: 48,
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
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    activityItem: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    activityTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    activityDesc: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    activityPlaceholder: {
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default DashboardScreen;

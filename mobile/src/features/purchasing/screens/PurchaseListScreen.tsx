import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Purchase, PurchaseStatus } from '../../../types';

export const PurchaseListScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPurchases = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getPurchases();
            setPurchases(data);
        } catch (err: any) {
            console.error('Failed to fetch purchases:', err);
            setError('Failed to load purchase orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPurchases();
    }, [fetchPurchases]);

    const formatCurrency = (amount: number) => {
        return `$${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}`;
    };

    const getStatusStyle = (status: PurchaseStatus) => {
        switch (status) {
            case 'RECEIVED':
                return { bg: colors.inStock, text: colors.inStockText };
            case 'ORDERED':
            case 'APPROVED':
                return { bg: colors.primary + '20', text: colors.primary };
            case 'PENDING':
                return { bg: colors.lowStock, text: colors.lowStockText };
            case 'DRAFT':
                return { bg: colors.border, text: colors.textSecondary };
            default:
                return { bg: colors.surface, text: colors.text };
        }
    };

    const renderPurchase = ({ item }: { item: Purchase }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('PurchaseDetail' as never, { purchaseId: item.id } as never)}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.poNumber}>{item.purchaseNumber}</Text>
                        <Text style={styles.supplierName}>{item.supplierName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.dateLabel}>Created</Text>
                        <Text style={styles.dateValue}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={purchases}
                renderItem={renderPurchase}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>No purchase orders found</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Suppliers' as never)}
            >
                <Text style={styles.fabIcon}>🏢</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    poNumber: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    supplierName: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingTop: spacing.sm,
    },
    dateLabel: {
        fontSize: fontSize.xs,
        color: colors.textLight,
    },
    dateValue: {
        fontSize: fontSize.sm,
        color: colors.text,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: fontSize.xs,
        color: colors.textLight,
    },
    totalValue: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        margin: spacing.md,
        marginBottom: 0,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
    },
    fabIcon: {
        fontSize: 24,
    },
});

export default PurchaseListScreen;

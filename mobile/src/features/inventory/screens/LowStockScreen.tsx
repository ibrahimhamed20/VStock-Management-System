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
import { LowStockProduct, StockAlert } from '../../../types';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../core/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LowStockScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [alerts, setAlerts] = useState<StockAlert | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getStockAlerts();
            setAlerts(data);
        } catch (err: any) {
            console.error('Failed to fetch stock alerts:', err);
            setError('Failed to load stock alerts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAlerts();
    }, [fetchAlerts]);

    const navigateToProduct = (productId: string) => {
        navigation.navigate('ProductDetail', { productId });
    };

    const renderLowStockItem = ({ item }: { item: LowStockProduct }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigateToProduct(item.id)}
        >
            <View style={styles.productMain}>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productSku}>{item.sku}</Text>
                </View>
                <View style={styles.stockInfo}>
                    <View style={styles.stockRow}>
                        <Text style={styles.stockLabel}>Current:</Text>
                        <Text style={[styles.stockValue, { color: colors.danger }]}>{item.currentStock}</Text>
                    </View>
                    <View style={styles.stockRow}>
                        <Text style={styles.stockLabel}>Min:</Text>
                        <Text style={styles.stockValue}>{item.minStock}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.deficitBadge}>
                <Text style={styles.deficitText}>Need {item.deficit} more</Text>
            </View>
        </TouchableOpacity>
    );

    const renderExpiringItem = ({ item }: { item: any }) => (
        <View style={styles.expiringCard}>
            <View style={styles.expiringMain}>
                <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.batchNumber}>Batch: {item.batchId}</Text>
            </View>
            <View style={styles.expiryInfo}>
                <Text style={styles.expiryDays}>
                    {item.daysUntilExpiry} days
                </Text>
                <Text style={styles.expiryQty}>{item.remainingQuantity} units</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading alerts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={[]}
                renderItem={() => null}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListHeaderComponent={
                    <>
                        {/* Summary Cards */}
                        <View style={styles.summaryContainer}>
                            <View style={[styles.summaryCard, { backgroundColor: colors.warning }]}>
                                <Text style={styles.summaryIcon}>⚠️</Text>
                                <Text style={styles.summaryValue}>{alerts?.lowStockCount || 0}</Text>
                                <Text style={styles.summaryLabel}>Low Stock</Text>
                            </View>
                            <View style={[styles.summaryCard, { backgroundColor: colors.danger }]}>
                                <Text style={styles.summaryIcon}>📅</Text>
                                <Text style={styles.summaryValue}>{alerts?.expiringCount || 0}</Text>
                                <Text style={styles.summaryLabel}>Expiring Soon</Text>
                            </View>
                        </View>

                        {error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Low Stock Section */}
                        <Text style={styles.sectionTitle}>Low Stock Products</Text>
                        {alerts?.lowStockProducts && alerts.lowStockProducts.length > 0 ? (
                            alerts.lowStockProducts.map((item) => (
                                <View key={item.id}>
                                    {renderLowStockItem({ item })}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptySection}>
                                <Text style={styles.emptyIcon}>✅</Text>
                                <Text style={styles.emptyText}>No low stock products</Text>
                            </View>
                        )}

                        {/* Expiring Soon Section */}
                        <Text style={styles.sectionTitle}>Expiring Soon (7 days)</Text>
                        {alerts?.expiringBatches && alerts.expiringBatches.length > 0 ? (
                            alerts.expiringBatches.map((item, index) => (
                                <View key={item.batchId || index}>
                                    {renderExpiringItem({ item })}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptySection}>
                                <Text style={styles.emptyIcon}>✅</Text>
                                <Text style={styles.emptyText}>No expiring batches</Text>
                            </View>
                        )}

                        <View style={styles.bottomPadding} />
                    </>
                }
            />
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
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    summaryContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
    },
    summaryCard: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    summaryIcon: {
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    summaryValue: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        color: colors.textInverse,
    },
    summaryLabel: {
        fontSize: fontSize.sm,
        color: colors.textInverse,
        opacity: 0.9,
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        margin: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        padding: spacing.md,
        paddingBottom: spacing.sm,
    },
    productCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    productMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    productInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    productName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    productSku: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    stockInfo: {
        alignItems: 'flex-end',
    },
    stockRow: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    stockLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    stockValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    deficitBadge: {
        marginTop: spacing.sm,
        backgroundColor: colors.danger + '15',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    deficitText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.danger,
    },
    expiringCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
        ...shadows.sm,
    },
    expiringMain: {
        flex: 1,
    },
    batchNumber: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    expiryInfo: {
        alignItems: 'flex-end',
    },
    expiryDays: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.warning,
    },
    expiryQty: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    emptySection: {
        backgroundColor: colors.surface,
        margin: spacing.md,
        marginTop: 0,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    emptyIcon: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default LowStockScreen;

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Purchase } from '../../../types';

type RouteParams = {
    PurchaseDetail: {
        purchaseId: string;
    };
};

export const PurchaseDetailScreen: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'PurchaseDetail'>>();
    const navigation = useNavigation();
    const { purchaseId } = route.params;

    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getPurchase(purchaseId);
            setPurchase(data);
        } catch (err: any) {
            console.error('Failed to fetch purchase details:', err);
            setError('Failed to load purchase details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [purchaseId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDetail();
    }, [fetchDetail]);

    const handleReceive = async () => {
        if (!purchase) return;

        Alert.alert(
            'Confirm Reception',
            'Mark all items as fully received?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Receive All',
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            const itemsToReceive = purchase.items.map(item => ({
                                itemId: item.id,
                                receivedQuantity: item.quantity - item.receivedQuantity
                            })).filter(i => i.receivedQuantity > 0);

                            if (itemsToReceive.length === 0) {
                                Alert.alert('Info', 'All items already received');
                                return;
                            }

                            await apiService.receivePurchase(purchaseId, itemsToReceive);
                            Alert.alert('Success', 'Items received and stock updated');
                            fetchDetail();
                        } catch (err: any) {
                            Alert.alert('Error', 'Failed to receive items');
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const formatCurrency = (amount: number) => {
        return `$${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}`;
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!purchase) {
        return (
            <View style={styles.centered}>
                <Text>Purchase order not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header Info */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.label}>Purchase Order</Text>
                            <Text style={styles.poNumber}>{purchase.purchaseNumber}</Text>
                        </View>
                        <View style={[styles.statusBadge, {
                            backgroundColor: purchase.status === 'RECEIVED' ? colors.inStock : colors.lowStock
                        }]}>
                            <Text style={[styles.statusText, {
                                color: purchase.status === 'RECEIVED' ? colors.inStockText : colors.lowStockText
                            }]}>
                                {purchase.status}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Supplier:</Text>
                        <Text style={styles.value}>{purchase.supplierName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>{new Date(purchase.createdAt).toLocaleDateString()}</Text>
                    </View>
                    {purchase.expectedDate && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Expected:</Text>
                            <Text style={styles.value}>{new Date(purchase.expectedDate).toLocaleDateString()}</Text>
                        </View>
                    )}
                </View>

                {/* Items List */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Items ({purchase.items.length})</Text>
                    {purchase.items.map((item, index) => (
                        <View key={item.id} style={[styles.itemRow, index < purchase.items.length - 1 && styles.itemBorder]}>
                            <View style={styles.itemMain}>
                                <Text style={styles.itemName}>{item.productName}</Text>
                                <Text style={styles.itemSku}>{item.productSku}</Text>
                            </View>
                            <View style={styles.itemMeta}>
                                <Text style={styles.itemQty}>
                                    Ordered: {item.quantity} | Recv: {item.receivedQuantity}
                                </Text>
                                <Text style={styles.itemCost}>{formatCurrency(item.total)}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>{formatCurrency(purchase.subtotal)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tax</Text>
                        <Text style={styles.value}>{formatCurrency(purchase.taxAmount)}</Text>
                    </View>
                    <View style={[styles.divider, { marginVertical: spacing.sm }]} />
                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(purchase.total)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            {purchase.status !== 'RECEIVED' && purchase.status !== 'CANCELLED' && (
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={[styles.button, processing && styles.buttonDisabled]}
                        onPress={handleReceive}
                        disabled={processing}
                    >
                        {processing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Receive Items</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
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
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    poNumber: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    value: {
        fontSize: fontSize.md,
        color: colors.text,
        fontWeight: fontWeight.medium,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.md,
        color: colors.text,
    },
    itemRow: {
        paddingVertical: spacing.sm,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    itemMain: {
        marginBottom: spacing.xs,
    },
    itemName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    itemSku: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    itemMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemQty: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    itemCost: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    totalLabel: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    totalValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    actionBar: {
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    button: {
        backgroundColor: colors.success,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
});

export default PurchaseDetailScreen;

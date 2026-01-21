import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Product, Batch, StockMovement } from '../../../types';

type RouteParams = {
    ProductDetail: {
        productId: string;
    };
};

export const ProductDetailScreen: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'ProductDetail'>>();
    const navigation = useNavigation();
    const { productId } = route.params;

    const [product, setProduct] = useState<Product | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProductDetails = useCallback(async () => {
        try {
            setError(null);
            const [productData, batchData, movementData] = await Promise.all([
                apiService.getProduct(productId),
                apiService.getProductBatches(productId).catch(() => []),
                apiService.getStockMovements(productId, undefined, 10).catch(() => []),
            ]);

            setProduct(productData);
            setBatches(batchData);
            setMovements(movementData);
        } catch (err: any) {
            console.error('Failed to fetch product details:', err);
            setError('Failed to load product details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProductDetails();
    }, [fetchProductDetails]);

    const getStockStatus = () => {
        if (!product) return { label: 'Unknown', color: colors.secondary, bgColor: colors.surface };
        if (product.stock === 0) return { label: 'Out of Stock', color: colors.outOfStockText, bgColor: colors.outOfStock };
        if (product.stock <= product.minStock) return { label: 'Low Stock', color: colors.lowStockText, bgColor: colors.lowStock };
        return { label: 'In Stock', color: colors.inStockText, bgColor: colors.inStock };
    };

    const handleAdjustStock = () => {
        (navigation.navigate as any)('StockAdjust', { productId, productName: product?.name });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading product...</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorText}>{error || 'Product not found'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const status = getStockStatus();

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Product Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                    {product.classification && (
                        <View style={styles.classificationBadge}>
                            <Text style={styles.classificationText}>Class {product.classification}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSku}>SKU: {product.sku}</Text>
                {product.barcode && (
                    <Text style={styles.productBarcode}>Barcode: {product.barcode}</Text>
                )}
            </View>

            {/* Stock Info Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Stock Information</Text>
                <View style={styles.stockGrid}>
                    <View style={styles.stockItem}>
                        <Text style={styles.stockValue}>{product.stock}</Text>
                        <Text style={styles.stockLabel}>Current Stock</Text>
                    </View>
                    <View style={styles.stockItem}>
                        <Text style={styles.stockValue}>{product.minStock}</Text>
                        <Text style={styles.stockLabel}>Min Stock</Text>
                    </View>
                    <View style={styles.stockItem}>
                        <Text style={styles.stockValue}>{product.maxStock || '-'}</Text>
                        <Text style={styles.stockLabel}>Max Stock</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.adjustButton} onPress={handleAdjustStock}>
                    <Text style={styles.adjustButtonText}>📦 Adjust Stock</Text>
                </TouchableOpacity>
            </View>

            {/* Pricing Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Pricing</Text>
                <View style={styles.priceRow}>
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Cost Price</Text>
                        <Text style={styles.priceValue}>${product.unitCost?.toFixed(2) || 0}</Text>
                    </View>
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Selling Price</Text>
                        <Text style={[styles.priceValue, { color: colors.success }]}>
                            ${product.unitPrice?.toFixed(2) || 0}
                        </Text>
                    </View>
                </View>
                <View style={styles.marginRow}>
                    <Text style={styles.marginLabel}>Profit Margin</Text>
                    <Text style={styles.marginValue}>
                        {((product.unitPrice || 0 - product.unitCost || 0) / (product.unitPrice || 0) * 100).toFixed(1)}%
                    </Text>
                </View>
                <View style={styles.marginRow}>
                    <Text style={styles.marginLabel}>Stock Value</Text>
                    <Text style={styles.marginValue}>
                        ${(product.stock * product.unitCost || 0).toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Details Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Details</Text>
                {product.category && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Category</Text>
                        <Text style={styles.detailValue}>{product.category}</Text>
                    </View>
                )}
                {product.supplier && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Supplier</Text>
                        <Text style={styles.detailValue}>{product.supplier}</Text>
                    </View>
                )}
                {product.description && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.detailLabel}>Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                )}
            </View>

            {/* Batches Card */}
            {batches.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Batches ({batches.length})</Text>
                    {batches.map((batch, index) => (
                        <View key={batch.id} style={[styles.batchItem, index < batches.length - 1 && styles.batchBorder]}>
                            <View style={styles.batchMain}>
                                <Text style={styles.batchNumber}>{batch.batchNumber}</Text>
                                <Text style={styles.batchQty}>{batch.remainingQuantity} units</Text>
                            </View>
                            {batch.expiryDate && (
                                <Text style={styles.batchExpiry}>
                                    Expires: {new Date(batch.expiryDate).toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Recent Movements */}
            {movements.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recent Movements</Text>
                    {movements.map((movement, index) => (
                        <View key={movement.id} style={[styles.movementItem, index < movements.length - 1 && styles.movementBorder]}>
                            <View style={styles.movementMain}>
                                <View style={[
                                    styles.movementBadge,
                                    { backgroundColor: movement.quantity > 0 ? colors.inStock : colors.outOfStock }
                                ]}>
                                    <Text style={[
                                        styles.movementQty,
                                        { color: movement.quantity > 0 ? colors.inStockText : colors.outOfStockText }
                                    ]}>
                                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                    </Text>
                                </View>
                                <View style={styles.movementInfo}>
                                    <Text style={styles.movementType}>{movement.type}</Text>
                                    <Text style={styles.movementDate}>
                                        {new Date(movement.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                            {movement.reason && (
                                <Text style={styles.movementReason}>{movement.reason}</Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.bottomPadding} />
        </ScrollView>
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
        padding: spacing.lg,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    errorText: {
        fontSize: fontSize.md,
        color: colors.danger,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    retryButtonText: {
        color: colors.textInverse,
        fontWeight: fontWeight.semibold,
    },
    header: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        ...shadows.sm,
    },
    headerTop: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    classificationBadge: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    classificationText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.primary,
    },
    productName: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    productSku: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    productBarcode: {
        fontSize: fontSize.sm,
        color: colors.textLight,
        marginTop: spacing.xs,
    },
    card: {
        backgroundColor: colors.surface,
        margin: spacing.md,
        marginBottom: 0,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    cardTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    stockGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
    },
    stockItem: {
        alignItems: 'center',
    },
    stockValue: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    stockLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    adjustButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    adjustButtonText: {
        color: colors.textInverse,
        fontWeight: fontWeight.semibold,
        fontSize: fontSize.md,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    priceItem: {
        flex: 1,
    },
    priceLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    priceValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    marginRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    marginLabel: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    marginValue: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    detailLabel: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: fontSize.md,
        color: colors.text,
        fontWeight: fontWeight.medium,
    },
    descriptionContainer: {
        marginTop: spacing.md,
    },
    descriptionText: {
        fontSize: fontSize.md,
        color: colors.text,
        marginTop: spacing.xs,
        lineHeight: 22,
    },
    batchItem: {
        paddingVertical: spacing.sm,
    },
    batchBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    batchMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    batchNumber: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    batchQty: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    batchExpiry: {
        fontSize: fontSize.sm,
        color: colors.warning,
        marginTop: spacing.xs,
    },
    movementItem: {
        paddingVertical: spacing.sm,
    },
    movementBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    movementMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    movementBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        minWidth: 60,
        alignItems: 'center',
    },
    movementQty: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    movementInfo: {
        flex: 1,
    },
    movementType: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    movementDate: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    movementReason: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginLeft: 76,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default ProductDetailScreen;

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';

interface Product {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    quantity: number;
    minQuantity: number;
    price: number;
    category?: string;
}

export const InventoryScreen: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data for now
    const mockProducts: Product[] = [
        { id: '1', name: 'iPhone 15 Pro Case', sku: 'ACC-001', quantity: 45, minQuantity: 10, price: 29.99, category: 'Accessories' },
        { id: '2', name: 'USB-C Cable 2m', sku: 'CAB-002', quantity: 8, minQuantity: 20, price: 14.99, category: 'Cables' },
        { id: '3', name: 'Wireless Mouse', sku: 'PER-003', quantity: 23, minQuantity: 15, price: 34.99, category: 'Peripherals' },
        { id: '4', name: 'Laptop Stand', sku: 'ACC-004', quantity: 3, minQuantity: 5, price: 49.99, category: 'Accessories' },
        { id: '5', name: 'Mechanical Keyboard', sku: 'PER-005', quantity: 0, minQuantity: 10, price: 89.99, category: 'Peripherals' },
        { id: '6', name: 'Monitor Arm', sku: 'ACC-006', quantity: 12, minQuantity: 8, price: 79.99, category: 'Accessories' },
        { id: '7', name: 'Webcam HD', sku: 'PER-007', quantity: 5, minQuantity: 10, price: 59.99, category: 'Peripherals' },
    ];

    const fetchProducts = async () => {
        try {
            // const data = await apiService.getProducts({ search: searchQuery });
            // setProducts(data.items);
            setProducts(mockProducts);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const getStockStatus = (quantity: number, minQuantity: number) => {
        if (quantity === 0) return { label: 'Out of Stock', color: colors.outOfStock, textColor: colors.outOfStockText };
        if (quantity <= minQuantity) return { label: 'Low Stock', color: colors.lowStock, textColor: colors.lowStockText };
        return { label: 'In Stock', color: colors.inStock, textColor: colors.inStockText };
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderProduct = ({ item }: { item: Product }) => {
        const status = getStockStatus(item.quantity, item.minQuantity);

        return (
            <TouchableOpacity style={styles.productCard}>
                <View style={styles.productMain}>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.productSku}>{item.sku} {item.category && `• ${item.category}`}</Text>
                    </View>
                    <View style={styles.productMeta}>
                        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                        <View style={[styles.stockBadge, { backgroundColor: status.color }]}>
                            <Text style={[styles.stockText, { color: status.textColor }]}>
                                {item.quantity} units
                            </Text>
                        </View>
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
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    placeholderTextColor={colors.textLight}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.scanButton}>
                    <Text style={styles.scanEmoji}>📷</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Filters */}
            <View style={styles.filters}>
                <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
                    <Text style={styles.filterTextActive}>All ({products.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <Text style={styles.filterText}>Low Stock ({products.filter(p => p.quantity <= p.minQuantity && p.quantity > 0).length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <Text style={styles.filterText}>Out ({products.filter(p => p.quantity === 0).length})</Text>
                </TouchableOpacity>
            </View>

            {/* Product List */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyText}>No products found</Text>
                    </View>
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
    searchContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    scanButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanEmoji: {
        fontSize: 20,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    filterTextActive: {
        fontSize: fontSize.sm,
        color: colors.textInverse,
        fontWeight: fontWeight.medium,
    },
    list: {
        padding: spacing.md,
        paddingTop: 0,
    },
    productCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    productMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    productMeta: {
        alignItems: 'flex-end',
    },
    productPrice: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    stockBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    stockText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
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
});

export default InventoryScreen;

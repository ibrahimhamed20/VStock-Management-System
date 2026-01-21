import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Product } from '../../../types';

type FilterType = 'all' | 'low' | 'out';

export const InventoryScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getProducts();
            setProducts(data);
            applyFilters(data, searchQuery, activeFilter);
        } catch (err: any) {
            console.error('Failed to fetch products:', err);
            setError('Failed to load products. Pull to retry.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const applyFilters = (productList: Product[], query: string, filter: FilterType) => {
        let filtered = productList;

        // Apply search
        if (query) {
            const searchTerm = query.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.sku.toLowerCase().includes(searchTerm) ||
                p.barcode?.toLowerCase().includes(searchTerm)
            );
        }

        // Apply stock filter
        if (filter === 'low') {
            filtered = filtered.filter(p => p.stock > 0 && p.stock <= p.minStock);
        } else if (filter === 'out') {
            filtered = filtered.filter(p => p.stock === 0);
        }

        setFilteredProducts(filtered);
    };

    useEffect(() => {
        applyFilters(products, searchQuery, activeFilter);
    }, [searchQuery, activeFilter, products]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProducts();
    }, [fetchProducts]);

    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
    };

    const getStockStatus = (quantity: number, minQuantity: number) => {
        if (quantity === 0) return { label: 'Out of Stock', color: colors.outOfStock, textColor: colors.outOfStockText };
        if (quantity <= minQuantity) return { label: 'Low Stock', color: colors.lowStock, textColor: colors.lowStockText };
        return { label: 'In Stock', color: colors.inStock, textColor: colors.inStockText };
    };

    const getCounts = () => {
        const all = products.length;
        const low = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
        const out = products.filter(p => p.stock === 0).length;
        return { all, low, out };
    };

    const counts = getCounts();

    const navigateToProduct = (product: Product) => {
        navigation.navigate('ProductDetail' as never, { productId: product.id } as never);
    };

    const renderProduct = ({ item }: { item: Product }) => {
        const status = getStockStatus(item.stock, item.minStock);

        return (
            <TouchableOpacity style={styles.productCard} onPress={() => navigateToProduct(item)}>
                <View style={styles.productMain}>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.productSku}>
                            {item.sku} {item.category && `• ${item.category}`}
                        </Text>
                    </View>
                    <View style={styles.productMeta}>
                        <Text style={styles.productPrice}>${item.unitCost?.toFixed(2) || 0}</Text>
                        <View style={[styles.stockBadge, { backgroundColor: status.color }]}>
                            <Text style={[styles.stockText, { color: status.textColor }]}>
                                {item.stock} units
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
                <Text style={styles.loadingText}>Loading products...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, SKU, or barcode..."
                    placeholderTextColor={colors.textLight}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => navigation.navigate('Scanner' as never)}
                >
                    <Text style={styles.scanEmoji}>📷</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Filters */}
            <View style={styles.filters}>
                <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
                    onPress={() => handleFilterChange('all')}
                >
                    <Text style={activeFilter === 'all' ? styles.filterTextActive : styles.filterText}>
                        All ({counts.all})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'low' && styles.filterChipActive]}
                    onPress={() => handleFilterChange('low')}
                >
                    <Text style={activeFilter === 'low' ? styles.filterTextActive : styles.filterText}>
                        Low Stock ({counts.low})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'out' && styles.filterChipActive]}
                    onPress={() => handleFilterChange('out')}
                >
                    <Text style={activeFilter === 'out' ? styles.filterTextActive : styles.filterText}>
                        Out ({counts.out})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

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
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No products found' : 'No products available'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery ? 'Try a different search term' : 'Add products from the web dashboard'}
                        </Text>
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
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.md,
        color: colors.textSecondary,
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
    errorBanner: {
        backgroundColor: '#fef2f2',
        margin: spacing.md,
        marginTop: 0,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
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
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    emptySubtext: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});

export default InventoryScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Product, Client, CreateInvoiceRequest } from '../../../types';

interface CartItem {
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    maxStock: number;
}

type RouteParams = {
    Sales: {
        clientId?: string;
        clientName?: string;
    };
};

export const SalesScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, 'Sales'>>();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(
        route.params?.clientId ? { id: route.params.clientId, name: route.params.clientName || '' } : null
    );
    const [clients, setClients] = useState<Client[]>([]);
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');

    // Tax rate (can be made configurable)
    const TAX_RATE = 0.15;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    // Fetch clients on mount
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await apiService.getClients();
            setClients(data);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    // Search products
    const searchProducts = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const results = await apiService.searchProducts(query);
            setSearchResults(results.filter(p => p.stock > 0));
        } catch (error) {
            console.error('Failed to search products:', error);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (showSearch) {
                searchProducts(searchQuery);
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, showSearch, searchProducts]);

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.productId === product.id);

        if (existing) {
            if (existing.quantity >= product.stock) {
                Alert.alert('Stock Limit', `Only ${product.stock} units available`);
                return;
            }
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                price: product.unitPrice,
                quantity: 1,
                maxStock: product.stock,
            }]);
        }

        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta;
                if (newQty > item.maxStock) {
                    Alert.alert('Stock Limit', `Only ${item.maxStock} units available`);
                    return item;
                }
                return { ...item, quantity: Math.max(0, newQty) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const clearCart = () => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to clear all items?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => setCart([]) },
            ]
        );
    };

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to the cart first');
            return;
        }

        if (!selectedClient) {
            Alert.alert('Select Client', 'Please select a client for this sale');
            setShowClientPicker(true);
            return;
        }

        setSubmitting(true);
        try {
            const invoiceData: CreateInvoiceRequest = {
                clientId: selectedClient.id,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price,
                })),
                taxRate: TAX_RATE,
            };

            const invoice = await apiService.createInvoice(invoiceData);

            // Record payment if cash or card
            if (paymentMethod) {
                try {
                    await apiService.createPayment({
                        invoiceId: invoice.id,
                        amount: total,
                        paymentMethod: paymentMethod,
                    });
                } catch (paymentError) {
                    console.error('Payment recording failed:', paymentError);
                }
            }

            Alert.alert(
                'Sale Complete! 🎉',
                `Invoice ${invoice.invoiceNumber} created\nTotal: $${total.toFixed(2)}`,
                [
                    {
                        text: 'New Sale',
                        onPress: () => {
                            setCart([]);
                            setSelectedClient(null);
                        },
                    },
                    {
                        text: 'View Invoice',
                        onPress: () => {
                            setCart([]);
                            navigation.navigate('InvoiceDetail' as never, { invoiceId: invoice.id } as never);
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Failed to complete sale:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to complete sale. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
            </View>
            <View style={styles.quantityControls}>
                <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.productId, -1)}
                >
                    <Text style={styles.qtyButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.productId, 1)}
                >
                    <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
    );

    const renderSearchResult = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.searchResultItem} onPress={() => addToCart(item)}>
            <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultSku}>{item.sku} • {item.stock} in stock</Text>
            </View>
            <Text style={styles.searchResultPrice}>${item.unitPrice.toFixed(2)}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Client Selection */}
            <TouchableOpacity
                style={styles.clientSelector}
                onPress={() => setShowClientPicker(true)}
            >
                <Text style={styles.clientLabel}>Customer:</Text>
                {selectedClient ? (
                    <Text style={styles.clientName}>{selectedClient.name}</Text>
                ) : (
                    <Text style={styles.clientPlaceholder}>Select customer...</Text>
                )}
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Search/Scan Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    placeholderTextColor={colors.textLight}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setShowSearch(true)}
                />
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => navigation.navigate('Scanner' as never)}
                >
                    <Text style={styles.scanEmoji}>📷</Text>
                </TouchableOpacity>
            </View>

            {/* Search Results Overlay */}
            {showSearch && (
                <View style={styles.searchOverlay}>
                    <View style={styles.searchHeader}>
                        <Text style={styles.searchTitle}>Search Products</Text>
                        <TouchableOpacity onPress={() => {
                            setShowSearch(false);
                            setSearchQuery('');
                            setSearchResults([]);
                        }}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    {searching ? (
                        <ActivityIndicator style={styles.searchLoader} />
                    ) : searchResults.length > 0 ? (
                        <FlatList
                            data={searchResults}
                            renderItem={renderSearchResult}
                            keyExtractor={(item) => item.id}
                            style={styles.searchResults}
                        />
                    ) : searchQuery ? (
                        <Text style={styles.noResults}>No products found</Text>
                    ) : (
                        <Text style={styles.noResults}>Type to search products</Text>
                    )}
                </View>
            )}

            {/* Cart Items */}
            <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.productId}
                style={styles.cartList}
                contentContainerStyle={styles.cartContent}
                ListHeaderComponent={
                    cart.length > 0 ? (
                        <View style={styles.cartHeader}>
                            <Text style={styles.cartTitle}>Cart ({cart.length} items)</Text>
                            <TouchableOpacity onPress={clearCart}>
                                <Text style={styles.clearText}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !showSearch ? (
                        <View style={styles.emptyCart}>
                            <Text style={styles.emptyIcon}>🛒</Text>
                            <Text style={styles.emptyText}>Cart is empty</Text>
                            <Text style={styles.emptySubtext}>Search or scan products to add items</Text>
                        </View>
                    ) : null
                }
            />

            {/* Summary & Checkout */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax ({(TAX_RATE * 100).toFixed(0)}%)</Text>
                    <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                </View>

                <View style={styles.paymentButtons}>
                    <TouchableOpacity
                        style={[styles.payButton, styles.cashButton, paymentMethod === 'CASH' && styles.payButtonActive]}
                        onPress={() => setPaymentMethod('CASH')}
                    >
                        <Text style={styles.payButtonEmoji}>💵</Text>
                        <Text style={styles.payButtonText}>Cash</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.payButton, styles.cardButton, paymentMethod === 'CARD' && styles.payButtonActive]}
                        onPress={() => setPaymentMethod('CARD')}
                    >
                        <Text style={styles.payButtonEmoji}>💳</Text>
                        <Text style={styles.payButtonText}>Card</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.checkoutButton, (cart.length === 0 || submitting) && styles.checkoutDisabled]}
                    disabled={cart.length === 0 || submitting}
                    onPress={handleCompleteSale}
                >
                    {submitting ? (
                        <ActivityIndicator color={colors.textInverse} />
                    ) : (
                        <Text style={styles.checkoutText}>Complete Sale</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Client Picker Modal */}
            <Modal
                visible={showClientPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowClientPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Customer</Text>
                            <TouchableOpacity onPress={() => setShowClientPicker(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={clients}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.clientOption}
                                    onPress={() => {
                                        setSelectedClient({ id: item.id, name: item.name });
                                        setShowClientPicker(false);
                                    }}
                                >
                                    <Text style={styles.clientOptionName}>{item.name}</Text>
                                    {item.phone && <Text style={styles.clientOptionPhone}>{item.phone}</Text>}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.noClientsText}>No clients found</Text>
                            }
                        />
                        <TouchableOpacity
                            style={styles.addClientButton}
                            onPress={() => {
                                setShowClientPicker(false);
                                navigation.navigate('AddClient' as never);
                            }}
                        >
                            <Text style={styles.addClientButtonText}>+ Add New Client</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    clientSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    clientLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginRight: spacing.sm,
    },
    clientName: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    clientPlaceholder: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.textLight,
    },
    chevron: {
        fontSize: fontSize.xl,
        color: colors.textSecondary,
    },
    searchContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
        backgroundColor: colors.surface,
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.background,
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
    searchOverlay: {
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        zIndex: 100,
    },
    searchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    closeButton: {
        fontSize: fontSize.xl,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    searchLoader: {
        marginTop: spacing.xl,
    },
    searchResults: {
        flex: 1,
    },
    searchResultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchResultInfo: {
        flex: 1,
    },
    searchResultName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    searchResultSku: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    searchResultPrice: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
    },
    noResults: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: spacing.xl,
    },
    cartList: {
        flex: 1,
    },
    cartContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    cartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    cartTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    clearText: {
        fontSize: fontSize.sm,
        color: colors.danger,
        fontWeight: fontWeight.medium,
    },
    cartItem: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.sm,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    itemPrice: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
    },
    qtyButton: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    qtyButtonText: {
        fontSize: fontSize.lg,
        color: colors.text,
        fontWeight: fontWeight.bold,
    },
    qtyText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
        paddingHorizontal: spacing.md,
        minWidth: 40,
        textAlign: 'center',
    },
    itemTotal: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        minWidth: 70,
        textAlign: 'right',
    },
    emptyCart: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    emptySubtext: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    summary: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.lg,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: fontSize.md,
        color: colors.text,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingTop: spacing.md,
        marginTop: spacing.sm,
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
    paymentButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    payButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        borderWidth: 2,
    },
    cashButton: {
        backgroundColor: colors.success + '15',
        borderColor: colors.success + '50',
    },
    cardButton: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary + '50',
    },
    payButtonActive: {
        borderWidth: 2,
    },
    payButtonEmoji: {
        fontSize: 20,
    },
    payButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    checkoutButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    checkoutDisabled: {
        backgroundColor: colors.border,
    },
    checkoutText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textInverse,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    clientOption: {
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    clientOptionName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    clientOptionPhone: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    noClientsText: {
        textAlign: 'center',
        color: colors.textSecondary,
        padding: spacing.xl,
    },
    addClientButton: {
        backgroundColor: colors.primary,
        margin: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    addClientButtonText: {
        color: colors.textInverse,
        fontWeight: fontWeight.semibold,
    },
});

export default SalesScreen;

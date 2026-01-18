import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export const SalesScreen: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([
        { id: '1', name: 'iPhone 15 Pro Case', price: 29.99, quantity: 2 },
        { id: '2', name: 'USB-C Cable 2m', price: 14.99, quantity: 1 },
    ]);
    const [searchQuery, setSearchQuery] = useState('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax;

    const updateQuantity = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
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
                    onPress={() => updateQuantity(item.id, -1)}
                >
                    <Text style={styles.qtyButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.id, 1)}
                >
                    <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Search/Scan Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search or scan product..."
                    placeholderTextColor={colors.textLight}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.scanButton}>
                    <Text style={styles.scanEmoji}>📷</Text>
                </TouchableOpacity>
            </View>

            {/* Cart Items */}
            <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                style={styles.cartList}
                contentContainerStyle={styles.cartContent}
                ListEmptyComponent={
                    <View style={styles.emptyCart}>
                        <Text style={styles.emptyIcon}>🛒</Text>
                        <Text style={styles.emptyText}>Cart is empty</Text>
                        <Text style={styles.emptySubtext}>Scan a product or search to add items</Text>
                    </View>
                }
            />

            {/* Summary & Checkout */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax (15%)</Text>
                    <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                </View>

                <View style={styles.paymentButtons}>
                    <TouchableOpacity style={[styles.payButton, styles.cashButton]}>
                        <Text style={styles.payButtonEmoji}>💵</Text>
                        <Text style={styles.payButtonText}>Cash</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.payButton, styles.cardButton]}>
                        <Text style={styles.payButtonEmoji}>💳</Text>
                        <Text style={styles.payButtonText}>Card</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.checkoutButton, cart.length === 0 && styles.checkoutDisabled]}
                    disabled={cart.length === 0}
                >
                    <Text style={styles.checkoutText}>Complete Sale</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
    cartList: {
        flex: 1,
    },
    cartContent: {
        padding: spacing.md,
        paddingTop: 0,
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
    },
    cashButton: {
        backgroundColor: colors.success + '15',
        borderWidth: 1,
        borderColor: colors.success,
    },
    cardButton: {
        backgroundColor: colors.primary + '15',
        borderWidth: 1,
        borderColor: colors.primary,
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
});

export default SalesScreen;

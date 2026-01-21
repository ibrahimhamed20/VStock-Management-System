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
    Modal,
    TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Invoice, Payment, PaymentMethod } from '../../../types';

type RouteParams = {
    InvoiceDetail: {
        invoiceId: string;
    };
};

export const InvoiceDetailScreen: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'InvoiceDetail'>>();
    const navigation = useNavigation();
    const { invoiceId } = route.params;

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [submittingPayment, setSubmittingPayment] = useState(false);

    const fetchInvoiceDetails = useCallback(async () => {
        try {
            setError(null);
            const [invoiceData, paymentData] = await Promise.all([
                apiService.getInvoice(invoiceId),
                apiService.getPaymentsByInvoice(invoiceId).catch(() => []),
            ]);

            setInvoice(invoiceData);
            setPayments(paymentData);
        } catch (err: any) {
            console.error('Failed to fetch invoice details:', err);
            setError('Failed to load invoice details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [invoiceId]);

    useEffect(() => {
        fetchInvoiceDetails();
    }, [fetchInvoiceDetails]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchInvoiceDetails();
    }, [fetchInvoiceDetails]);

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusStyle = () => {
        if (!invoice) return { bg: colors.surface, text: colors.text };
        switch (invoice.paymentStatus) {
            case 'PAID':
                return { bg: colors.inStock, text: colors.inStockText };
            case 'PENDING':
                return { bg: colors.lowStock, text: colors.lowStockText };
            case 'OVERDUE':
                return { bg: colors.outOfStock, text: colors.outOfStockText };
            case 'PARTIAL':
                return { bg: '#dbeafe', text: '#1e40af' };
            default:
                return { bg: colors.surface, text: colors.text };
        }
    };

    const handleRecordPayment = async () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
            return;
        }

        if (invoice && amount > invoice.balance) {
            Alert.alert('Amount Too Large', `Maximum payment amount is ${formatCurrency(invoice.balance)}`);
            return;
        }

        setSubmittingPayment(true);
        try {
            await apiService.createPayment({
                invoiceId,
                amount,
                paymentMethod,
            });

            setShowPaymentModal(false);
            setPaymentAmount('');
            fetchInvoiceDetails();
            Alert.alert('Success', 'Payment recorded successfully');
        } catch (error: any) {
            console.error('Failed to record payment:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to record payment');
        } finally {
            setSubmittingPayment(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading invoice...</Text>
            </View>
        );
    }

    if (error || !invoice) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorText}>{error || 'Invoice not found'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchInvoiceDetails}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusStyle = getStatusStyle();

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Invoice Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                {invoice.paymentStatus}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.clientName}>{invoice.clientName}</Text>
                    <Text style={styles.invoiceDate}>
                        Created: {new Date(invoice.createdAt).toLocaleDateString()}
                    </Text>
                    {invoice.dueDate && (
                        <Text style={styles.dueDate}>
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </Text>
                    )}
                </View>

                {/* Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Items ({invoice.items.length})</Text>
                    {invoice.items.map((item, index) => (
                        <View key={index} style={[styles.itemRow, index < invoice.items.length - 1 && styles.itemBorder]}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.productName}</Text>
                                <Text style={styles.itemSku}>{item.productSku}</Text>
                            </View>
                            <View style={styles.itemMeta}>
                                <Text style={styles.itemQty}>{item.quantity} × {formatCurrency(item.unitPrice)}</Text>
                                <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.card}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
                    </View>
                    {invoice.discountAmount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Discount</Text>
                            <Text style={[styles.totalValue, { color: colors.success }]}>
                                -{formatCurrency(invoice.discountAmount)}
                            </Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tax</Text>
                        <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                        <Text style={styles.grandTotalLabel}>Total</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Paid</Text>
                        <Text style={[styles.totalValue, { color: colors.success }]}>
                            {formatCurrency(invoice.paidAmount)}
                        </Text>
                    </View>
                    <View style={[styles.totalRow, styles.balanceRow]}>
                        <Text style={styles.balanceLabel}>Balance Due</Text>
                        <Text style={[styles.balanceValue, { color: invoice.balance > 0 ? colors.danger : colors.success }]}>
                            {formatCurrency(invoice.balance)}
                        </Text>
                    </View>
                </View>

                {/* Payments */}
                {payments.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Payments ({payments.length})</Text>
                        {payments.map((payment, index) => (
                            <View key={payment.id} style={[styles.paymentRow, index < payments.length - 1 && styles.paymentBorder]}>
                                <View>
                                    <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
                                    <Text style={styles.paymentDate}>
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Notes</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Action Button */}
            {invoice.balance > 0 && (
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={styles.paymentButton}
                        onPress={() => {
                            setPaymentAmount(invoice.balance.toString());
                            setShowPaymentModal(true);
                        }}
                    >
                        <Text style={styles.paymentButtonText}>Record Payment</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Payment Modal */}
            <Modal
                visible={showPaymentModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Record Payment</Text>
                            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.modalLabel}>Amount</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={paymentAmount}
                                onChangeText={setPaymentAmount}
                            />

                            <Text style={styles.modalLabel}>Payment Method</Text>
                            <View style={styles.methodButtons}>
                                {(['CASH', 'CARD', 'TRANSFER'] as PaymentMethod[]).map((method) => (
                                    <TouchableOpacity
                                        key={method}
                                        style={[
                                            styles.methodButton,
                                            paymentMethod === method && styles.methodButtonActive,
                                        ]}
                                        onPress={() => setPaymentMethod(method)}
                                    >
                                        <Text style={paymentMethod === method ? styles.methodTextActive : styles.methodText}>
                                            {method}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, submittingPayment && styles.submitButtonDisabled]}
                                onPress={handleRecordPayment}
                                disabled={submittingPayment}
                            >
                                {submittingPayment ? (
                                    <ActivityIndicator color={colors.textInverse} />
                                ) : (
                                    <Text style={styles.submitButtonText}>Record Payment</Text>
                                )}
                            </TouchableOpacity>
                        </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    invoiceNumber: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
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
    clientName: {
        fontSize: fontSize.lg,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    invoiceDate: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    dueDate: {
        fontSize: fontSize.sm,
        color: colors.warning,
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
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    itemSku: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    itemMeta: {
        alignItems: 'flex-end',
    },
    itemQty: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    itemTotal: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
    },
    totalLabel: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    totalValue: {
        fontSize: fontSize.md,
        color: colors.text,
    },
    grandTotalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingTop: spacing.md,
        marginTop: spacing.sm,
    },
    grandTotalLabel: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    grandTotalValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    balanceRow: {
        backgroundColor: colors.background,
        margin: -spacing.lg,
        marginTop: spacing.md,
        padding: spacing.lg,
        borderBottomLeftRadius: borderRadius.lg,
        borderBottomRightRadius: borderRadius.lg,
    },
    balanceLabel: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    balanceValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    paymentBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    paymentMethod: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    paymentDate: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    paymentAmount: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.success,
    },
    notesText: {
        fontSize: fontSize.md,
        color: colors.text,
        lineHeight: 22,
    },
    bottomPadding: {
        height: 100,
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    paymentButton: {
        backgroundColor: colors.success,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    paymentButtonText: {
        color: colors.textInverse,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
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
    closeButton: {
        fontSize: fontSize.xl,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    modalBody: {
        padding: spacing.lg,
    },
    modalLabel: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    amountInput: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    methodButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    methodButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    methodButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '15',
    },
    methodText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    methodTextActive: {
        fontSize: fontSize.md,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
    submitButton: {
        backgroundColor: colors.success,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: colors.textInverse,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
});

export default InvoiceDetailScreen;

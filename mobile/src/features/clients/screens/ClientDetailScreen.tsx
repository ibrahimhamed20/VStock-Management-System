import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Client, Invoice, ClientTransaction } from '../../../types';

type RouteParams = {
    ClientDetail: {
        clientId: string;
    };
};

export const ClientDetailScreen: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'ClientDetail'>>();
    const navigation = useNavigation<any>();
    const { clientId } = route.params;

    const [client, setClient] = useState<Client | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClientDetails = useCallback(async () => {
        try {
            setError(null);
            const [clientData, invoiceData, transactionData] = await Promise.all([
                apiService.getClient(clientId),
                apiService.getInvoicesByClient(clientId).catch(() => []),
                apiService.getClientTransactions(clientId).catch(() => []),
            ]);

            setClient(clientData);
            setInvoices(invoiceData);
            setTransactions(transactionData);
        } catch (err: any) {
            console.error('Failed to fetch client details:', err);
            setError('Failed to load client details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [clientId]);

    useEffect(() => {
        fetchClientDetails();
    }, [fetchClientDetails]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchClientDetails();
    }, [fetchClientDetails]);

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleCall = () => {
        if (client?.phone) {
            Linking.openURL(`tel:${client.phone}`);
        }
    };

    const handleEmail = () => {
        if (client?.email) {
            Linking.openURL(`mailto:${client.email}`);
        }
    };

    const handleNewSale = () => {
        navigation.navigate('Sales' as never, { clientId, clientName: client?.name } as never);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading client...</Text>
            </View>
        );
    }

    if (error || !client) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorText}>{error || 'Client not found'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchClientDetails}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Client Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{getInitials(client.name)}</Text>
                </View>
                <Text style={styles.clientName}>{client.name}</Text>
                {client.tags && client.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {client.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
                {client.phone && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                        <Text style={styles.actionIcon}>📞</Text>
                        <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>
                )}
                {client.email && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                        <Text style={styles.actionIcon}>✉️</Text>
                        <Text style={styles.actionText}>Email</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionButton, styles.primaryAction]} onPress={handleNewSale}>
                    <Text style={styles.actionIcon}>💰</Text>
                    <Text style={[styles.actionText, styles.primaryActionText]}>New Sale</Text>
                </TouchableOpacity>
            </View>

            {/* Financial Summary */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Financial Summary</Text>
                <View style={styles.financialRow}>
                    <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Total Purchases</Text>
                        <Text style={[styles.financialValue, { color: colors.success }]}>
                            {formatCurrency(client.totalPurchases)}
                        </Text>
                    </View>
                    <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Outstanding</Text>
                        <Text style={[styles.financialValue, { color: client.outstandingBalance > 0 ? colors.danger : colors.text }]}>
                            {formatCurrency(client.outstandingBalance)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Contact Info */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Contact Information</Text>
                {client.email && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>✉️</Text>
                        <Text style={styles.infoValue}>{client.email}</Text>
                    </View>
                )}
                {client.phone && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📞</Text>
                        <Text style={styles.infoValue}>{client.phone}</Text>
                    </View>
                )}
                {client.address && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📍</Text>
                        <Text style={styles.infoValue}>
                            {client.address}
                            {client.city && `, ${client.city}`}
                            {client.country && `, ${client.country}`}
                        </Text>
                    </View>
                )}
                {client.taxId && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🏢</Text>
                        <Text style={styles.infoValue}>Tax ID: {client.taxId}</Text>
                    </View>
                )}
            </View>

            {/* Recent Invoices */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Recent Invoices</Text>
                    <Text style={styles.cardCount}>{invoices.length}</Text>
                </View>
                {invoices.length > 0 ? (
                    invoices.slice(0, 5).map((invoice) => (
                        <TouchableOpacity
                            key={invoice.id}
                            style={styles.invoiceItem}
                            onPress={() => navigation.navigate('InvoiceDetail' as never, { invoiceId: invoice.id } as never)}
                        >
                            <View style={styles.invoiceMain}>
                                <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                                <Text style={styles.invoiceDate}>
                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.invoiceMeta}>
                                <Text style={styles.invoiceTotal}>{formatCurrency(invoice.total)}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    invoice.paymentStatus === 'PAID' && styles.statusPaid,
                                    invoice.paymentStatus === 'PENDING' && styles.statusPending,
                                    invoice.paymentStatus === 'OVERDUE' && styles.statusOverdue,
                                ]}>
                                    <Text style={styles.statusText}>{invoice.paymentStatus}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No invoices yet</Text>
                )}
            </View>

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
        padding: spacing.xl,
        alignItems: 'center',
        ...shadows.sm,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textInverse,
    },
    clientName: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        textAlign: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    tag: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    tagText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
    actionsRow: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    primaryAction: {
        backgroundColor: colors.primary,
    },
    actionIcon: {
        fontSize: 20,
        marginBottom: spacing.xs,
    },
    actionText: {
        fontSize: fontSize.sm,
        color: colors.text,
        fontWeight: fontWeight.medium,
    },
    primaryActionText: {
        color: colors.textInverse,
    },
    card: {
        backgroundColor: colors.surface,
        margin: spacing.md,
        marginBottom: 0,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    cardCount: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        color: colors.textInverse,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        overflow: 'hidden',
    },
    financialRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    financialItem: {
        alignItems: 'center',
    },
    financialLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    financialValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    infoIcon: {
        fontSize: 16,
        marginRight: spacing.md,
        width: 24,
    },
    infoValue: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.text,
    },
    invoiceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    invoiceMain: {},
    invoiceNumber: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    invoiceDate: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    invoiceMeta: {
        alignItems: 'flex-end',
    },
    invoiceTotal: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginTop: spacing.xs,
    },
    statusPaid: {
        backgroundColor: colors.inStock,
    },
    statusPending: {
        backgroundColor: colors.lowStock,
    },
    statusOverdue: {
        backgroundColor: colors.outOfStock,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    emptyText: {
        color: colors.textSecondary,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default ClientDetailScreen;

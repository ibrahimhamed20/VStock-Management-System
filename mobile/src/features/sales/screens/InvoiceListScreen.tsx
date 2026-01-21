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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../core/navigation/types';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Invoice, PaymentStatus } from '../../../types';

type FilterType = 'all' | 'PENDING' | 'PAID' | 'OVERDUE';

export const InvoiceListScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getInvoices();
            setInvoices(data);
            applyFilter(data, activeFilter);
        } catch (err: any) {
            console.error('Failed to fetch invoices:', err);
            setError('Failed to load invoices');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const applyFilter = (invoiceList: Invoice[], filter: FilterType) => {
        if (filter === 'all') {
            setFilteredInvoices(invoiceList);
        } else {
            setFilteredInvoices(invoiceList.filter(i => i.paymentStatus === filter));
        }
    };

    useEffect(() => {
        applyFilter(invoices, activeFilter);
    }, [activeFilter, invoices]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchInvoices();
    }, [fetchInvoices]);

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusStyle = (status: PaymentStatus) => {
        switch (status) {
            case 'PAID':
                return { bg: colors.inStock, text: colors.inStockText };
            case 'PENDING':
                return { bg: colors.lowStock, text: colors.lowStockText };
            case 'OVERDUE':
                return { bg: colors.outOfStock, text: colors.outOfStockText };
            case 'PARTIAL':
                return { bg: '#dbeafe', text: '#1e40af' };
            case 'CANCELLED':
                return { bg: colors.border, text: colors.textSecondary };
            default:
                return { bg: colors.surface, text: colors.text };
        }
    };

    const getCounts = () => {
        return {
            all: invoices.length,
            pending: invoices.filter(i => i.paymentStatus === 'PENDING').length,
            paid: invoices.filter(i => i.paymentStatus === 'PAID').length,
            overdue: invoices.filter(i => i.paymentStatus === 'OVERDUE').length,
        };
    };

    const counts = getCounts();

    const navigateToInvoice = (invoiceId: string) => {
        navigation.navigate('InvoiceDetail', { invoiceId });
    };

    const renderInvoice = ({ item }: { item: Invoice }) => {
        const statusStyle = getStatusStyle(item.paymentStatus);

        return (
            <TouchableOpacity style={styles.invoiceCard} onPress={() => navigateToInvoice(item.id)}>
                <View style={styles.invoiceHeader}>
                    <View>
                        <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
                        <Text style={styles.clientName}>{item.clientName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.paymentStatus}
                        </Text>
                    </View>
                </View>
                <View style={styles.invoiceFooter}>
                    <Text style={styles.invoiceDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.invoiceAmounts}>
                        <Text style={styles.invoiceTotal}>{formatCurrency(item.total)}</Text>
                        {item.balance > 0 && (
                            <Text style={styles.invoiceBalance}>
                                Due: {formatCurrency(item.balance)}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading invoices...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Summary Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
                    <Text style={styles.statValue}>{counts.all}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.warning }]}>
                    <Text style={styles.statValue}>{counts.pending}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.success }]}>
                    <Text style={styles.statValue}>{counts.paid}</Text>
                    <Text style={styles.statLabel}>Paid</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.danger }]}>
                    <Text style={styles.statValue}>{counts.overdue}</Text>
                    <Text style={styles.statLabel}>Overdue</Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filters}>
                {(['all', 'PENDING', 'PAID', 'OVERDUE'] as FilterType[]).map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                        onPress={() => setActiveFilter(filter)}
                    >
                        <Text style={activeFilter === filter ? styles.filterTextActive : styles.filterText}>
                            {filter === 'all' ? 'All' : filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Invoice List */}
            <FlatList
                data={filteredInvoices}
                renderItem={renderInvoice}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>No invoices found</Text>
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
    statsRow: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textInverse,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textInverse,
        opacity: 0.9,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
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
    invoiceCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    invoiceNumber: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    clientName: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
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
    invoiceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingTop: spacing.sm,
    },
    invoiceDate: {
        fontSize: fontSize.sm,
        color: colors.textLight,
    },
    invoiceAmounts: {
        alignItems: 'flex-end',
    },
    invoiceTotal: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    invoiceBalance: {
        fontSize: fontSize.sm,
        color: colors.danger,
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

export default InvoiceListScreen;

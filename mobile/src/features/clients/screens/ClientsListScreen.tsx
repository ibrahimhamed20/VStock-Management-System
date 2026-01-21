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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Client } from '../../../types';

export const ClientsListScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getClients();
            setClients(data);
            setFilteredClients(data);
        } catch (err: any) {
            console.error('Failed to fetch clients:', err);
            setError('Failed to load clients');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = clients.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query) ||
                c.phone?.includes(query)
            );
            setFilteredClients(filtered);
        } else {
            setFilteredClients(clients);
        }
    }, [searchQuery, clients]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchClients();
    }, [fetchClients]);

    const navigateToClient = (clientId: string) => {
        navigation.navigate('ClientDetail' as never, { clientId } as never);
    };

    const navigateToAddClient = () => {
        navigation.navigate('AddClient' as never);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatCurrency = (amount: number) => {
        return `$${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}`;
    };

    const renderClient = ({ item }: { item: Client }) => (
        <TouchableOpacity style={styles.clientCard} onPress={() => navigateToClient(item.id)}>
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
            </View>
            <View style={styles.clientInfo}>
                <Text style={styles.clientName} numberOfLines={1}>{item.name}</Text>
                {item.email && (
                    <Text style={styles.clientEmail} numberOfLines={1}>{item.email}</Text>
                )}
                {item.phone && (
                    <Text style={styles.clientPhone}>{item.phone}</Text>
                )}
            </View>
            <View style={styles.clientMeta}>
                <Text style={styles.purchaseLabel}>Total Purchases</Text>
                <Text style={styles.purchaseValue}>{formatCurrency(item.totalPurchases)}</Text>
                {item.outstandingBalance > 0 && (
                    <Text style={styles.balanceText}>
                        Owes: {formatCurrency(item.outstandingBalance)}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading clients...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search clients..."
                    placeholderTextColor={colors.textLight}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.addButton} onPress={navigateToAddClient}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{clients.length}</Text>
                    <Text style={styles.statLabel}>Total Clients</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {clients.filter(c => c.outstandingBalance > 0).length}
                    </Text>
                    <Text style={styles.statLabel}>With Balance</Text>
                </View>
            </View>

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Client List */}
            <FlatList
                data={filteredClients}
                renderItem={renderClient}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👥</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No clients found' : 'No clients yet'}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity style={styles.addFirstButton} onPress={navigateToAddClient}>
                                <Text style={styles.addFirstButtonText}>Add First Client</Text>
                            </TouchableOpacity>
                        )}
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
    addButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: colors.textInverse,
        fontWeight: fontWeight.bold,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        gap: spacing.md,
    },
    statItem: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
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
    clientCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.sm,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textInverse,
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    clientEmail: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    clientPhone: {
        fontSize: fontSize.sm,
        color: colors.textLight,
    },
    clientMeta: {
        alignItems: 'flex-end',
    },
    purchaseLabel: {
        fontSize: fontSize.xs,
        color: colors.textLight,
    },
    purchaseValue: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    balanceText: {
        fontSize: fontSize.xs,
        color: colors.danger,
        marginTop: spacing.xs,
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
        marginBottom: spacing.md,
    },
    addFirstButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    addFirstButtonText: {
        color: colors.textInverse,
        fontWeight: fontWeight.semibold,
    },
});

export default ClientsListScreen;

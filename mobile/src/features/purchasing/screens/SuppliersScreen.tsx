import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';
import { Supplier } from '../../../types';

export const SuppliersScreen: React.FC = () => {
    const navigation = useNavigation();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuppliers = useCallback(async () => {
        try {
            setError(null);
            const data = await apiService.getSuppliers();
            setSuppliers(data);
        } catch (err: any) {
            console.error('Failed to fetch suppliers:', err);
            setError('Failed to load suppliers');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleCall = (phone?: string) => {
        if (phone) Linking.openURL(`tel:${phone}`);
    };

    const handleEmail = (email?: string) => {
        if (email) Linking.openURL(`mailto:${email}`);
    };

    const renderSupplier = ({ item }: { item: Supplier }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.contactPerson && (
                        <Text style={styles.contactPerson}>👤 {item.contactPerson}</Text>
                    )}
                </View>
                <View style={[styles.badge, item.isActive ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={[styles.badgeText, item.isActive ? styles.textActive : styles.textInactive]}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                {item.email && (
                    <TouchableOpacity onPress={() => handleEmail(item.email)} style={styles.infoRow}>
                        <Text style={styles.icon}>✉️</Text>
                        <Text style={styles.infoText}>{item.email}</Text>
                    </TouchableOpacity>
                )}
                {item.phone && (
                    <TouchableOpacity onPress={() => handleCall(item.phone)} style={styles.infoRow}>
                        <Text style={styles.icon}>📞</Text>
                        <Text style={styles.infoText}>{item.phone}</Text>
                    </TouchableOpacity>
                )}
                {item.address && (
                    <View style={styles.infoRow}>
                        <Text style={styles.icon}>📍</Text>
                        <Text style={styles.infoText}>
                            {item.address}, {item.city}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={suppliers}
                renderItem={renderSupplier}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🏢</Text>
                        <Text style={styles.emptyText}>No suppliers found</Text>
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
    list: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        paddingBottom: spacing.sm,
    },
    name: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    contactPerson: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    badgeActive: {
        backgroundColor: colors.inStock,
    },
    badgeInactive: {
        backgroundColor: colors.outOfStock,
    },
    badgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
    textActive: {
        color: colors.inStockText,
    },
    textInactive: {
        color: colors.outOfStockText,
    },
    cardBody: {
        gap: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 16,
        marginRight: spacing.sm,
        width: 24,
    },
    infoText: {
        fontSize: fontSize.md,
        color: colors.text,
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        margin: spacing.md,
        marginBottom: 0,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
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

export default SuppliersScreen;

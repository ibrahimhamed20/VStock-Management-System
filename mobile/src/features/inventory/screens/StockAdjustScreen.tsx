import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';

type RouteParams = {
    StockAdjust: {
        productId: string;
        productName: string;
    };
};

type AdjustmentType = 'ADD' | 'REMOVE' | 'SET';

const ADJUSTMENT_REASONS = [
    'Stock count adjustment',
    'Damaged goods',
    'Returned items',
    'New shipment received',
    'Inventory audit',
    'Customer return',
    'Other',
];

export const StockAdjustScreen: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'StockAdjust'>>();
    const navigation = useNavigation();
    const { productId, productName } = route.params;

    const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('ADD');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            Alert.alert('Invalid Quantity', 'Please enter a valid quantity greater than 0');
            return;
        }

        const finalReason = reason === 'Other' ? customReason : reason;
        if (!finalReason.trim()) {
            Alert.alert('Reason Required', 'Please select or enter a reason for this adjustment');
            return;
        }

        setLoading(true);
        try {
            await apiService.adjustStock({
                productId,
                quantity: adjustmentType === 'REMOVE' ? -qty : qty,
                type: adjustmentType,
                reason: finalReason,
            });

            Alert.alert(
                'Success',
                `Stock ${adjustmentType === 'ADD' ? 'increased' : adjustmentType === 'REMOVE' ? 'decreased' : 'set'} successfully`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Failed to adjust stock:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to adjust stock. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.content}>
                {/* Product Info */}
                <View style={styles.productCard}>
                    <Text style={styles.productLabel}>Adjusting stock for:</Text>
                    <Text style={styles.productName}>{productName}</Text>
                </View>

                {/* Adjustment Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Adjustment Type</Text>
                    <View style={styles.typeButtons}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                adjustmentType === 'ADD' && styles.typeButtonActiveAdd,
                            ]}
                            onPress={() => setAdjustmentType('ADD')}
                        >
                            <Text style={styles.typeIcon}>➕</Text>
                            <Text style={[
                                styles.typeText,
                                adjustmentType === 'ADD' && styles.typeTextActive,
                            ]}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                adjustmentType === 'REMOVE' && styles.typeButtonActiveRemove,
                            ]}
                            onPress={() => setAdjustmentType('REMOVE')}
                        >
                            <Text style={styles.typeIcon}>➖</Text>
                            <Text style={[
                                styles.typeText,
                                adjustmentType === 'REMOVE' && styles.typeTextActive,
                            ]}>Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                adjustmentType === 'SET' && styles.typeButtonActiveSet,
                            ]}
                            onPress={() => setAdjustmentType('SET')}
                        >
                            <Text style={styles.typeIcon}>🎯</Text>
                            <Text style={[
                                styles.typeText,
                                adjustmentType === 'SET' && styles.typeTextActive,
                            ]}>Set To</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quantity Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quantity</Text>
                    <TextInput
                        style={styles.quantityInput}
                        placeholder="Enter quantity"
                        placeholderTextColor={colors.textLight}
                        keyboardType="number-pad"
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                </View>

                {/* Reason Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason</Text>
                    <View style={styles.reasonButtons}>
                        {ADJUSTMENT_REASONS.map((r) => (
                            <TouchableOpacity
                                key={r}
                                style={[
                                    styles.reasonButton,
                                    reason === r && styles.reasonButtonActive,
                                ]}
                                onPress={() => setReason(r)}
                            >
                                <Text style={[
                                    styles.reasonText,
                                    reason === r && styles.reasonTextActive,
                                ]}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {reason === 'Other' && (
                        <TextInput
                            style={styles.customReasonInput}
                            placeholder="Enter custom reason..."
                            placeholderTextColor={colors.textLight}
                            value={customReason}
                            onChangeText={setCustomReason}
                            multiline
                        />
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textInverse} />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {adjustmentType === 'ADD' ? '➕ Add Stock' :
                                adjustmentType === 'REMOVE' ? '➖ Remove Stock' :
                                    '🎯 Set Stock Level'}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    productCard: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    productLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    productName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    typeButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    typeButton: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    typeButtonActiveAdd: {
        borderColor: colors.success,
        backgroundColor: colors.success + '15',
    },
    typeButtonActiveRemove: {
        borderColor: colors.danger,
        backgroundColor: colors.danger + '15',
    },
    typeButtonActiveSet: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '15',
    },
    typeIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    typeText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
    },
    typeTextActive: {
        color: colors.text,
    },
    quantityInput: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    reasonButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    reasonButton: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    reasonButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    reasonText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    reasonTextActive: {
        color: colors.textInverse,
        fontWeight: fontWeight.medium,
    },
    customReasonInput: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: spacing.md,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginTop: spacing.lg,
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

export default StockAdjustScreen;

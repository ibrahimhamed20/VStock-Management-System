import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';

/**
 * Scanner Screen
 * 
 * Note: For a full barcode scanning experience, you would need to install:
 * - react-native-camera or react-native-vision-camera
 * - @react-native-ml-kit/barcode-scanning
 * 
 * This is a placeholder that allows manual barcode/SKU entry
 * and can be extended to use camera-based scanning.
 */

export const ScannerScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [barcode, setBarcode] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!barcode.trim()) {
            Alert.alert('Enter Code', 'Please enter a barcode or SKU');
            return;
        }

        setLoading(true);
        try {
            // Try to find product by SKU first
            const products = await apiService.searchProducts(barcode.trim());

            if (products.length === 0) {
                Alert.alert('Not Found', 'No product found with this code');
                return;
            }

            if (products.length === 1) {
                // Navigate directly to product
                setLastScanned(barcode);
                navigation.navigate('ProductDetail' as never, { productId: products[0].id } as never);
            } else {
                // Multiple results - let user choose
                Alert.alert(
                    'Multiple Products Found',
                    `Found ${products.length} products. Showing first result.`,
                    [
                        {
                            text: 'View Product',
                            onPress: () => {
                                navigation.navigate('ProductDetail' as never, { productId: products[0].id } as never);
                            },
                        },
                        {
                            text: 'Search in Inventory',
                            onPress: () => {
                                navigation.navigate('Inventory' as never);
                            },
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('Search failed:', error);
            Alert.alert('Error', 'Failed to search for product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToSale = async () => {
        if (!barcode.trim()) {
            Alert.alert('Enter Code', 'Please enter a barcode or SKU');
            return;
        }

        setLoading(true);
        try {
            const products = await apiService.searchProducts(barcode.trim());

            if (products.length === 0) {
                Alert.alert('Not Found', 'No product found with this code');
                return;
            }

            // Navigate to Sales with product info
            // The Sales screen can handle adding the product to cart
            navigation.navigate('Sales' as never);
            setBarcode('');
        } catch (error: any) {
            console.error('Search failed:', error);
            Alert.alert('Error', 'Failed to find product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Scanner Placeholder */}
            <View style={styles.scannerArea}>
                <View style={styles.scannerFrame}>
                    <Text style={styles.scannerIcon}>📷</Text>
                    <Text style={styles.scannerText}>Camera Scanner</Text>
                    <Text style={styles.scannerHint}>
                        Install react-native-camera to enable{'\n'}live barcode scanning
                    </Text>
                </View>
            </View>

            {/* Manual Entry */}
            <View style={styles.manualEntry}>
                <Text style={styles.sectionTitle}>Manual Entry</Text>
                <Text style={styles.sectionHint}>Enter barcode or SKU manually</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter barcode or SKU..."
                    placeholderTextColor={colors.textLight}
                    value={barcode}
                    onChangeText={setBarcode}
                    autoCapitalize="characters"
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.searchButton]}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.textInverse} size="small" />
                        ) : (
                            <>
                                <Text style={styles.buttonIcon}>🔍</Text>
                                <Text style={styles.buttonText}>Find Product</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.addButton]}
                        onPress={handleAddToSale}
                        disabled={loading}
                    >
                        <Text style={styles.buttonIcon}>➕</Text>
                        <Text style={styles.buttonText}>Add to Sale</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('Inventory' as never)}
                    >
                        <Text style={styles.quickActionIcon}>📦</Text>
                        <Text style={styles.quickActionText}>Browse Products</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('LowStock' as never)}
                    >
                        <Text style={styles.quickActionIcon}>⚠️</Text>
                        <Text style={styles.quickActionText}>Low Stock</Text>
                    </TouchableOpacity>
                </View>

                {/* Last Scanned */}
                {lastScanned && (
                    <View style={styles.lastScanned}>
                        <Text style={styles.lastScannedLabel}>Last scanned:</Text>
                        <Text style={styles.lastScannedValue}>{lastScanned}</Text>
                    </View>
                )}
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
                <Text style={styles.instructionsTitle}>💡 Tip</Text>
                <Text style={styles.instructionsText}>
                    For camera-based scanning, add the react-native-camera or
                    react-native-vision-camera package to your project.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scannerArea: {
        height: 200,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: 200,
        height: 150,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    scannerIcon: {
        fontSize: 48,
        marginBottom: spacing.sm,
    },
    scannerText: {
        color: colors.textInverse,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    scannerHint: {
        color: colors.textLight,
        fontSize: fontSize.sm,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    manualEntry: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    sectionHint: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        fontSize: fontSize.lg,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        textAlign: 'center',
        fontWeight: fontWeight.medium,
        letterSpacing: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    searchButton: {
        backgroundColor: colors.primary,
    },
    addButton: {
        backgroundColor: colors.success,
    },
    buttonIcon: {
        fontSize: 18,
    },
    buttonText: {
        color: colors.textInverse,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    quickAction: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    quickActionText: {
        fontSize: fontSize.sm,
        color: colors.text,
        fontWeight: fontWeight.medium,
    },
    lastScanned: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginTop: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastScannedLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    lastScannedValue: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    instructions: {
        margin: spacing.lg,
        marginTop: 0,
        padding: spacing.md,
        backgroundColor: colors.primary + '10',
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    instructionsTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    instructionsText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});

export default ScannerScreen;

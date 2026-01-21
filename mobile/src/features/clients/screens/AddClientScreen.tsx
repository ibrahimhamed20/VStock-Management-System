import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../core/theme';
import apiService from '../../../services/api';

export const AddClientScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const client = await apiService.createClient({
                name: formData.name.trim(),
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                address: formData.address.trim() || undefined,
                city: formData.city.trim() || undefined,
                country: formData.country.trim() || undefined,
                taxId: formData.taxId.trim() || undefined,
            });

            Alert.alert(
                'Success',
                'Client created successfully',
                [
                    {
                        text: 'View Client',
                        onPress: () => {
                            navigation.goBack();
                            navigation.navigate('ClientDetail' as never, { clientId: client.id } as never);
                        },
                    },
                    {
                        text: 'Add Another',
                        onPress: () => {
                            setFormData({
                                name: '',
                                email: '',
                                phone: '',
                                address: '',
                                city: '',
                                country: '',
                                taxId: '',
                            });
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Failed to create client:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to create client. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.content}>
                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="Enter client name"
                            placeholderTextColor={colors.textLight}
                            value={formData.name}
                            onChangeText={(value) => updateField('name', value)}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Enter email address"
                            placeholderTextColor={colors.textLight}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(value) => updateField('email', value)}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            placeholderTextColor={colors.textLight}
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(value) => updateField('phone', value)}
                        />
                    </View>
                </View>

                {/* Address Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Street Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter street address"
                            placeholderTextColor={colors.textLight}
                            value={formData.address}
                            onChangeText={(value) => updateField('address', value)}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                placeholderTextColor={colors.textLight}
                                value={formData.city}
                                onChangeText={(value) => updateField('city', value)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Country"
                                placeholderTextColor={colors.textLight}
                                value={formData.country}
                                onChangeText={(value) => updateField('country', value)}
                            />
                        </View>
                    </View>
                </View>

                {/* Business Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tax ID / VAT Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter tax ID"
                            placeholderTextColor={colors.textLight}
                            value={formData.taxId}
                            onChangeText={(value) => updateField('taxId', value)}
                        />
                    </View>
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
                        <Text style={styles.submitButtonText}>Create Client</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomPadding} />
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
    section: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputError: {
        borderColor: colors.danger,
    },
    errorText: {
        fontSize: fontSize.sm,
        color: colors.danger,
        marginTop: spacing.xs,
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: colors.textInverse,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    bottomPadding: {
        height: spacing.xl,
    },
});

export default AddClientScreen;

// Theme colors and styling constants
export const colors = {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',

    background: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',

    text: '#1e293b',
    textSecondary: '#64748b',
    textLight: '#94a3b8',
    textInverse: '#ffffff',

    border: '#e2e8f0',
    divider: '#f1f5f9',

    // Status colors
    lowStock: '#fef3c7',
    lowStockText: '#92400e',
    inStock: '#dcfce7',
    inStockText: '#166534',
    outOfStock: '#fee2e2',
    outOfStockText: '#991b1b',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const fontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

export const theme = {
    colors,
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    shadows,
};

export type Theme = typeof theme;
export default theme;

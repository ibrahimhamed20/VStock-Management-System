import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { useAuthStore } from '../../auth/stores/authStore';
import { LoginScreen } from '../../auth/screens/LoginScreen';
import { ProfileScreen } from '../../auth/screens/ProfileScreen';
import { DashboardScreen } from '../../dashboard/screens/DashboardScreen';
import { InventoryScreen } from '../../inventory/screens/InventoryScreen';
import { ProductDetailScreen } from '../../inventory/screens/ProductDetailScreen';
import { StockAdjustScreen } from '../../inventory/screens/StockAdjustScreen';
import { LowStockScreen } from '../../inventory/screens/LowStockScreen';
import { SalesScreen } from '../../sales/screens/SalesScreen';
import { InvoiceListScreen } from '../../sales/screens/InvoiceListScreen';
import { InvoiceDetailScreen } from '../../sales/screens/InvoiceDetailScreen';
import { ClientsListScreen } from '../../clients/screens/ClientsListScreen';
import { ClientDetailScreen } from '../../clients/screens/ClientDetailScreen';
import { AddClientScreen } from '../../clients/screens/AddClientScreen';
import { ScannerScreen } from '../../scanner/screens/ScannerScreen';
import { SuppliersScreen } from '../../purchasing/screens/SuppliersScreen';
import { PurchaseListScreen } from '../../purchasing/screens/PurchaseListScreen';
import { PurchaseDetailScreen } from '../../purchasing/screens/PurchaseDetailScreen';
import { colors, fontSize, fontWeight } from '../theme';

import { RootStackParamList, MainTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon component
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        <Text style={styles.tabEmoji}>{icon}</Text>
    </View>
);

// Main tabs navigator
const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTitleStyle: {
                    fontWeight: fontWeight.semibold,
                    color: colors.text,
                },
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="📦" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Sales"
                component={SalesScreen}
                options={{
                    title: 'New Sale',
                    tabBarIcon: ({ focused }) => <TabIcon icon="💰" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Clients"
                component={ClientsListScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="👥" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
};

// Root navigator
export const AppNavigator: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuthStore();

    // Show loading screen while checking auth
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingEmoji}>📦</Text>
                <Text style={styles.loadingText}>VStock</Text>
                <Text style={styles.loadingSubtext}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.surface,
                    },
                    headerTitleStyle: {
                        fontWeight: fontWeight.semibold,
                        color: colors.text,
                    },
                    headerTintColor: colors.primary,
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Stack.Screen
                            name="Main"
                            component={MainTabs}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ProductDetail"
                            component={ProductDetailScreen}
                            options={{ title: 'Product Details' }}
                        />
                        <Stack.Screen
                            name="StockAdjust"
                            component={StockAdjustScreen}
                            options={{ title: 'Adjust Stock' }}
                        />
                        <Stack.Screen
                            name="LowStock"
                            component={LowStockScreen}
                            options={{ title: 'Stock Alerts' }}
                        />
                        <Stack.Screen
                            name="InvoiceList"
                            component={InvoiceListScreen}
                            options={{ title: 'Invoices' }}
                        />
                        <Stack.Screen
                            name="InvoiceDetail"
                            component={InvoiceDetailScreen}
                            options={{ title: 'Invoice Details' }}
                        />
                        <Stack.Screen
                            name="ClientDetail"
                            component={ClientDetailScreen}
                            options={{ title: 'Client Details' }}
                        />
                        <Stack.Screen
                            name="AddClient"
                            component={AddClientScreen}
                            options={{ title: 'Add Client' }}
                        />
                        <Stack.Screen
                            name="Scanner"
                            component={ScannerScreen}
                            options={{ title: 'Scan Product' }}
                        />
                        <Stack.Screen
                            name="Suppliers"
                            component={SuppliersScreen}
                            options={{ title: 'Suppliers' }}
                        />
                        <Stack.Screen
                            name="PurchaseList"
                            component={PurchaseListScreen}
                            options={{ title: 'Purchase Orders' }}
                        />
                        <Stack.Screen
                            name="PurchaseDetail"
                            component={PurchaseDetailScreen}
                            options={{ title: 'Purchase Details' }}
                        />
                    </>
                ) : (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    loadingText: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    loadingSubtext: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginTop: 8,
    },
    tabIcon: {
        padding: 4,
    },
    tabIconFocused: {
        backgroundColor: colors.primary + '15',
        borderRadius: 8,
    },
    tabEmoji: {
        fontSize: 20,
    },
});

export default AppNavigator;

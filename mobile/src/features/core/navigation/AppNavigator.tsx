import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { useAuthStore } from '../../auth/stores/authStore';
import { LoginScreen } from '../../auth/screens/LoginScreen';
import { DashboardScreen } from '../../dashboard/screens/DashboardScreen';
import { InventoryScreen } from '../../inventory/screens/InventoryScreen';
import { SalesScreen } from '../../sales/screens/SalesScreen';
import { ProfileScreen } from '../../auth/screens/ProfileScreen';
import { colors, fontSize, fontWeight } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
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
        fontSize: fontSize.lg,
        color: colors.textSecondary,
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

import React, { useEffect } from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/features/core/navigation/AppNavigator';
import { useAuthStore } from './src/features/auth/stores/authStore';
import { colors } from './src/features/core/theme';

const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in on app start
    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;

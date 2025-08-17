import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Ant Design theme configuration
const antdTheme = {
  token: {
    colorPrimary: '#3b82f6', // Tailwind blue-500
    borderRadius: 6,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    Table: {
      borderRadius: 8,
    },
    Menu: {
      borderRadius: 6,
    },
  },
};

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

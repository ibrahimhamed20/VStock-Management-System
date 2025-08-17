# 🔧 Common Feature

## Overview
The Common feature provides shared components, utilities, providers, and services that are used across multiple features in the system. This feature ensures consistency, reusability, and maintainability by centralizing common functionality and design patterns.

## 🏗️ Architecture

### Core Components
- **Shared Components** - Reusable UI components and layouts
- **Utility Functions** - Common helper functions and utilities
- **Providers** - Context providers and service providers
- **Hooks** - Custom React hooks for common functionality
- **Constants** - System-wide constants and configurations

### Design Principles
```
Reusability → Consistency → Maintainability → Quality
     ↓
Centralized Development → Standardized Patterns → Reduced Duplication
```

## 📁 File Structure

```
common/
├── components/                    # Shared UI Components
│   ├── LoadingSpinner.tsx        # Loading indicator component
│   ├── PageHeader.tsx            # Page header with breadcrumbs
│   ├── ErrorBoundary.tsx         # Error handling component
│   ├── Modal.tsx                 # Reusable modal component
│   ├── Table.tsx                 # Enhanced table component
│   └── Form.tsx                  # Form wrapper component
├── providers/                     # Context Providers
│   ├── AppProviders.tsx          # Main application providers
│   ├── ThemeProvider.tsx         # Theme context provider
│   ├── LanguageProvider.tsx      # Internationalization provider
│   └── ErrorProvider.tsx         # Error handling provider
├── hooks/                         # Custom React Hooks
│   ├── useLocalStorage.ts        # Local storage hook
│   ├── useDebounce.ts            # Debounce utility hook
│   ├── useClickOutside.ts        # Click outside detection
│   └── useAsync.ts               # Async operation hook
├── utils/                         # Utility Functions
│   ├── validation.ts             # Form validation utilities
│   ├── formatting.ts             # Data formatting functions
│   ├── date.ts                   # Date manipulation utilities
│   ├── currency.ts               # Currency formatting
│   └── storage.ts                # Storage utilities
├── constants/                     # System Constants
│   ├── api.ts                    # API endpoints and configurations
│   ├── routes.ts                 # Application routes
│   ├── validation.ts             # Validation rules and messages
│   └── ui.ts                     # UI constants and themes
├── types/                         # Shared TypeScript Types
│   ├── common.types.ts           # Common interfaces and types
│   ├── api.types.ts              # API-related types
│   └── ui.types.ts               # UI component types
└── index.ts                       # Feature exports
```

## 🚀 Features

### 1. Shared Components
- **LoadingSpinner**: Consistent loading indicators across the app
- **PageHeader**: Standardized page headers with navigation
- **ErrorBoundary**: Global error handling and recovery
- **Modal**: Reusable modal dialogs and overlays
- **Table**: Enhanced data table with sorting and filtering
- **Form**: Form wrapper with validation and submission

### 2. Utility Functions
- **Validation**: Form validation and error handling
- **Formatting**: Data formatting and presentation
- **Date Handling**: Date manipulation and formatting
- **Currency**: Currency formatting and calculations
- **Storage**: Local and session storage utilities
- **String Manipulation**: Text processing and formatting

### 3. Custom Hooks
- **useLocalStorage**: Persistent state management
- **useDebounce**: Input debouncing for performance
- **useClickOutside**: Click outside detection
- **useAsync**: Async operation state management
- **useForm**: Form state and validation
- **usePagination**: Pagination logic and state

### 4. Providers
- **AppProviders**: Main application context providers
- **ThemeProvider**: Theme and styling context
- **LanguageProvider**: Internationalization support
- **ErrorProvider**: Global error handling
- **NotificationProvider**: System notifications
- **PermissionProvider**: Access control context

### 5. Constants and Configuration
- **API Configuration**: Endpoints and request settings
- **Route Definitions**: Application routing configuration
- **Validation Rules**: Form validation standards
- **UI Constants**: Design system constants
- **Error Messages**: Standardized error messages
- **Success Messages**: Standardized success messages

## 🔧 Configuration

### Common Settings
```typescript
const COMMON_CONFIG = {
  // API configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  API_TIMEOUT: 30000,
  API_RETRY_ATTEMPTS: 3,
  
  // UI configuration
  THEME: 'light' | 'dark',
  LANGUAGE: 'en' | 'ar',
  DATE_FORMAT: 'YYYY-MM-DD',
  CURRENCY: 'USD',
  
  // Performance settings
  DEBOUNCE_DELAY: 300,
  CACHE_DURATION: 300000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3
};
```

### Component Configuration
```typescript
const COMPONENT_CONFIG = {
  // Loading spinner
  spinner: {
    size: 'default' | 'small' | 'large',
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error',
    text: string
  },
  
  // Page header
  pageHeader: {
    showBreadcrumbs: boolean,
    showActions: boolean,
    maxBreadcrumbItems: number
  },
  
  // Modal
  modal: {
    defaultWidth: number,
    animationDuration: number,
    closeOnEscape: boolean,
    closeOnOverlayClick: boolean
  }
};
```

## 📱 Components

### LoadingSpinner
- **Purpose**: Consistent loading indicators
- **Features**: Multiple sizes, colors, and text options
- **States**: Loading, error, success
- **Accessibility**: Screen reader support and ARIA labels
- **Customization**: Configurable appearance and behavior

### PageHeader
- **Purpose**: Standardized page headers
- **Features**: Breadcrumbs, actions, title, description
- **Responsive**: Mobile-first design with adaptive layout
- **Navigation**: Integrated breadcrumb navigation
- **Actions**: Action buttons and menu integration

### ErrorBoundary
- **Purpose**: Global error handling
- **Features**: Error catching, fallback UI, error reporting
- **Recovery**: Automatic error recovery when possible
- **Logging**: Error logging and monitoring
- **User Experience**: Graceful error display and guidance

### Modal
- **Purpose**: Reusable modal dialogs
- **Features**: Multiple sizes, animations, customization
- **Accessibility**: Keyboard navigation and focus management
- **Responsive**: Adaptive sizing for different screen sizes
- **Integration**: Easy integration with forms and content

### Table
- **Purpose**: Enhanced data tables
- **Features**: Sorting, filtering, pagination, selection
- **Responsive**: Mobile-friendly table design
- **Accessibility**: Screen reader support and keyboard navigation
- **Customization**: Configurable columns and actions

### Form
- **Purpose**: Form wrapper with validation
- **Features**: Validation, error handling, submission
- **Integration**: Easy integration with validation libraries
- **Accessibility**: Form accessibility and screen reader support
- **Responsive**: Mobile-first form design

## 🔒 Security

### Input Validation
- **Sanitization**: Input sanitization and validation
- **XSS Prevention**: Cross-site scripting attack prevention
- **Injection Protection**: SQL and code injection prevention
- **Rate Limiting**: Request rate limiting and throttling
- **CSRF Protection**: Cross-site request forgery prevention

### Data Protection
- **Encryption**: Sensitive data encryption
- **Secure Storage**: Secure local storage handling
- **Token Management**: Secure token storage and handling
- **Access Control**: Permission-based access control
- **Audit Logging**: Comprehensive audit trail

## 🔄 State Management

### Common Store
```typescript
interface CommonStore {
  // State
  theme: 'light' | 'dark';
  language: 'en' | 'ar';
  notifications: Notification[];
  errors: Error[];
  loading: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'ar') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setError: (error: Error) => void;
  clearError: (id: string) => void;
}
```

### State Persistence
- **Local Storage**: Persistent state across sessions
- **Session Storage**: Temporary session state
- **Cookies**: Secure cookie-based state
- **Memory**: In-memory state management

## 🌐 API Integration

### Common API Service
```typescript
// HTTP client configuration
const apiClient = axios.create({
  baseURL: COMMON_CONFIG.API_BASE_URL,
  timeout: COMMON_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptors
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    handleApiError(error);
    return Promise.reject(error);
  }
);
```

### Error Handling
```typescript
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Handle unauthorized access
    redirectToLogin();
  } else if (error.response?.status === 403) {
    // Handle forbidden access
    showPermissionError();
  } else if (error.response?.status >= 500) {
    // Handle server errors
    showServerError();
  } else {
    // Handle other errors
    showGenericError(error.message);
  }
};
```

## 🧪 Testing

### Unit Tests
- **Component Tests**: Individual component functionality
- **Utility Tests**: Helper function validation
- **Hook Tests**: Custom hook behavior testing
- **Type Tests**: TypeScript type checking

### Integration Tests
- **Component Integration**: Component interaction testing
- **Provider Integration**: Context provider testing
- **API Integration**: API service testing
- **State Integration**: State management testing

### Test Coverage
- **Target**: >90% code coverage
- **Focus Areas**: Utility functions, shared components
- **Mocking**: External dependencies and API calls

## 🚨 Error Handling

### Error Types
1. **Validation Errors**: Form and input validation errors
2. **API Errors**: Network and server errors
3. **Runtime Errors**: JavaScript runtime errors
4. **Permission Errors**: Access control errors
5. **System Errors**: System-level errors

### Error Recovery
- **Automatic Recovery**: Automatic error recovery when possible
- **User Guidance**: Clear error messages and solutions
- **Fallback UI**: Graceful degradation for errors
- **Error Reporting**: Error reporting and monitoring

## 📊 Performance

### Optimization Strategies
- **Code Splitting**: Feature-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Debouncing**: Input throttling for performance
- **Caching**: Intelligent data and component caching

### Performance Metrics
- **Bundle Size**: <100KB for common feature bundle
- **Load Time**: <500ms for common components
- **Memory Usage**: <30MB for common feature
- **Render Time**: <100ms for component rendering

## 🔮 Future Enhancements

### Planned Features
- **Advanced Components**: More sophisticated UI components
- **Performance Monitoring**: Real-time performance tracking
- **Accessibility Tools**: Enhanced accessibility features
- **Internationalization**: Multi-language support expansion
- **Theme System**: Advanced theming and customization

### Technical Improvements
- **Web Components**: Native web component support
- **Micro-frontends**: Micro-frontend architecture support
- **Advanced Hooks**: More sophisticated custom hooks
- **State Machines**: State machine-based state management
- **Real-time Updates**: WebSocket-based real-time features

## 📚 Dependencies

### Core Dependencies
```json
{
  "react": "^18.x.x",             # React Framework
  "typescript": "^5.x.x",         # Type Safety
  "antd": "^5.x.x",               # UI Components
  "axios": "^1.x.x"               # HTTP Client
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.x.x",      # React Types
  "jest": "^29.x.x",              # Testing Framework
  "testing-library": "^13.x.x"    # Component Testing
}
```

## 🤝 Contributing

### Development Guidelines
1. **Reusability**: Design components for maximum reusability
2. **Consistency**: Maintain consistent patterns and interfaces
3. **Testing**: Comprehensive testing for all common functionality
4. **Documentation**: Clear documentation for all components
5. **Performance**: Optimize for performance and efficiency

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code style enforcement
- **Prettier**: Automatic code formatting
- **Accessibility**: WCAG 2.1 AA compliance

## 📄 License

This feature is part of the Store API UI system and follows the same licensing terms as the main project.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team

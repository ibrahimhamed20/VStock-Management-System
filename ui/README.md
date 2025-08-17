# Store Management System - Frontend

A modern, responsive frontend application for the Store Management System built with React 19, TypeScript, and Ant Design.

## 🚀 Tech Stack

- **React 19+** with TypeScript
- **Vite** for fast development and building
- **Ant Design** UI components with custom theme
- **TailwindCSS** for utility-first styling
- **Zustand** for lightweight state management
- **React Query (TanStack Query)** for server state management
- **React Router** for client-side routing
- **Internationalization** (English/Arabic) with react-i18next and RTL support
- **React Hook Form** with Zod validation
- **Axios** for HTTP requests
- **Feature-based architecture** for scalable development

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (LoadingSpinner, PageHeader)
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components (MainLayout)
│   └── dashboard/       # Dashboard components
├── features/            # Feature-based modules (future)
├── services/            # API services and external integrations
├── stores/              # Zustand state management
├── providers/           # React context providers
├── i18n/                # Internationalization setup
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (default: http://localhost:3000)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_APP_NAME=Store Management System
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🎨 Features

### ✅ Authentication System
- JWT-based authentication
- Login/Logout functionality
- Protected routes
- Role-based access control
- Password reset functionality

### ✅ Modern UI/UX
- Responsive design (mobile-first)
- Dark/Light theme support
- RTL language support (Arabic)
- Professional business interface
- Ant Design + TailwindCSS integration

### ✅ State Management
- **Zustand**: Client-side state (user preferences, UI state)
- **React Query**: Server state (API data, caching, real-time updates)

### ✅ Internationalization
- English and Arabic support
- RTL layout for Arabic
- Dynamic language switching
- Localized content and messages

### ✅ Form Handling
- React Hook Form integration
- Zod validation schemas
- Type-safe form handling
- Error handling and validation

## 🔧 Configuration

### TailwindCSS
The project uses TailwindCSS with custom configuration:
- Custom color palette
- Responsive breakpoints
- Component-specific utilities
- Ant Design integration

### Ant Design Theme
Custom theme configuration:
- Primary color: Tailwind blue-500 (#3b82f6)
- Consistent border radius (6px)
- Custom component styling
- Responsive design tokens

### API Configuration
- Axios interceptors for authentication
- Automatic token refresh
- Error handling and retry logic
- Request/response logging

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 Internationalization

The application supports multiple languages:

### English (en)
- Default language
- LTR layout
- Business terminology

### Arabic (ar)
- RTL layout support
- Localized content
- Cultural adaptations

### Adding New Languages
1. Create translation file in `src/i18n/locales/`
2. Add language to i18n configuration
3. Update language selector component

## 🔐 Authentication Flow

1. **Login**: Username/email + password
2. **Token Storage**: JWT tokens stored securely
3. **Route Protection**: Automatic redirect for unauthenticated users
4. **Token Refresh**: Automatic token refresh on API calls
5. **Logout**: Clear tokens and redirect to login

## 📱 Responsive Design

- **Mobile**: Optimized for small screens
- **Tablet**: Adaptive layout for medium screens
- **Desktop**: Full-featured interface
- **Touch-friendly**: Optimized for touch devices

## 🎯 Future Features

- [ ] Advanced dashboard with charts
- [ ] Real-time notifications
- [ ] Offline support
- [ ] Progressive Web App (PWA)
- [ ] Advanced search and filtering
- [ ] Bulk operations
- [ ] Export/Import functionality

## 🏗️ Feature-Based Architecture

The application has been refactored to use a feature-based architecture, organizing code by business domains rather than technical layers. This provides better scalability, maintainability, and developer experience.

### 📁 Current Feature Structure

```
src/features/
├── auth/                 # Authentication & Authorization
│   ├── components/       # Login, Register, ForgotPassword
│   ├── services/         # AuthService, API integration
│   ├── stores/           # Auth state management
│   ├── types/            # Auth-related TypeScript types
│   └── README.md         # Feature documentation
├── users/                # User Management System
│   ├── components/       # UserManagement, RoleManagement, PermissionManagement, UserProfile
│   ├── services/         # User-related API services
│   ├── types/            # User-related types
│   └── README.md         # Feature documentation
├── dashboard/            # Main Dashboard
│   ├── components/       # Dashboard, statistics, charts
│   └── README.md         # Feature documentation
├── layout/               # Application Layout
│   ├── components/       # MainLayout, navigation, sidebar
│   └── README.md         # Feature documentation
├── common/               # Shared Components & Utilities
│   ├── components/       # LoadingSpinner, PageHeader, common UI
│   ├── providers/        # AppProviders, context providers
│   └── README.md         # Feature documentation
├── core/                 # Core Application
│   ├── components/       # App.tsx, routing
│   ├── services/         # API service, interceptors
│   └── README.md         # Feature documentation
├── inventory/            # Inventory Management
│   ├── components/       # Product management, stock tracking
│   ├── services/         # Inventory API services
│   └── README.md         # Feature documentation
├── sales/                # Sales Management
│   ├── components/       # Sales tracking, customer management
│   ├── services/         # Sales API services
│   └── README.md         # Feature documentation
├── purchasing/            # Purchasing Management
│   ├── components/       # Purchase orders, supplier management
│   ├── services/         # Purchasing API services
│   └── README.md         # Feature documentation
├── accounting/            # Financial Management
│   ├── components/       # Financial reports, transactions
│   ├── services/         # Accounting API services
│   └── README.md         # Feature documentation
├── reports/               # Reporting System
│   ├── components/       # Report generation, analytics
│   ├── services/         # Reporting API services
│   └── README.md         # Feature documentation
└── settings/              # System Configuration
    ├── components/        # System settings, preferences
    ├── services/          # Settings API services
    └── README.md          # Feature documentation
```

### 🔧 Key Benefits

- **Domain Separation**: Each feature is self-contained with its own components, services, and types
- **Scalability**: Easy to add new features without affecting existing ones
- **Maintainability**: Clear boundaries and responsibilities for each feature
- **Developer Experience**: Intuitive file organization and import paths
- **Code Reusability**: Common utilities and components are shared across features
- **Testing**: Easier to test features in isolation

### 🚀 Implementation Details

- **Path Aliases**: TypeScript path aliases configured for clean imports (e.g., `@auth`, `@users`)
- **Barrel Files**: Index files for clean exports and imports
- **Shared Types**: Common types defined in feature-specific type files
- **Service Layer**: Each feature has its own API service layer
- **State Management**: Feature-specific state management with Zustand

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Check TypeScript configuration
2. **API Connection**: Verify backend is running
3. **Styling Issues**: Check TailwindCSS configuration
4. **Language Issues**: Verify i18n setup

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Verify environment variables
- Use TypeScript strict mode

## 📚 Dependencies

### Core Dependencies
- `react`: 18.x
- `react-dom`: 18.x
- `antd`: 5.x
- `@ant-design/icons`: 5.x
- `tailwindcss`: 3.x
- `zustand`: 4.x
- `@tanstack/react-query`: 4.x

### Development Dependencies
- `typescript`: 5.x
- `vite`: 4.x
- `@vitejs/plugin-react`: 4.x
- `eslint`: 8.x
- `prettier`: 3.x

## 🤝 Contributing

1. Follow the established code structure
2. Use TypeScript for type safety
3. Follow React best practices
4. Test components thoroughly
5. Update documentation as needed

## 📄 License

This project is part of the Store Management System.

---

**Happy Coding! 🎉**

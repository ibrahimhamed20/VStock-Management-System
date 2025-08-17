# Feature-Based Architecture

This project has been restructured to use a feature-based architecture instead of the traditional layer-based approach.

## Architecture Overview

```
src/
├── features/                    # Feature-based organization
│   ├── auth/                   # Authentication & Authorization
│   │   ├── components/         # Auth-related components
│   │   ├── services/           # Auth services
│   │   ├── stores/             # Auth state management
│   │   ├── types/              # Auth type definitions
│   │   └── index.ts            # Feature exports
│   ├── users/                  # User Management
│   │   ├── components/         # User management components
│   │   ├── services/           # User services
│   │   ├── types/              # User type definitions
│   │   └── index.ts            # Feature exports
│   ├── dashboard/              # Dashboard
│   │   ├── components/         # Dashboard components
│   │   └── index.ts            # Feature exports
│   ├── layout/                 # Application Layout
│   │   ├── components/         # Layout components
│   │   └── index.ts            # Feature exports
│   ├── common/                 # Shared Components & Utilities
│   │   ├── components/         # Common components
│   │   ├── providers/          # App providers
│   │   ├── utils/              # Utility functions
│   │   └── index.ts            # Feature exports
│   ├── core/                   # Core Application
│   │   ├── components/         # Main app components
│   │   ├── services/           # Core services
│   │   ├── types/              # Core types
│   │   └── index.ts            # Feature exports
│   └── index.ts                # Main features index
├── i18n/                       # Internationalization
├── assets/                     # Static assets
└── main.tsx                    # Application entry point
```

## Benefits of Feature-Based Architecture

### 1. **Better Organization**
- Related code is grouped together by business domain
- Easier to find and maintain related functionality
- Clear separation of concerns

### 2. **Improved Scalability**
- New features can be added without affecting existing ones
- Teams can work on different features independently
- Easier to implement feature flags and lazy loading

### 3. **Better Maintainability**
- Changes to a feature are contained within its directory
- Reduced coupling between different parts of the application
- Easier to refactor and test individual features

### 4. **Enhanced Developer Experience**
- Clear file structure makes onboarding easier
- Developers can focus on specific business domains
- Better code navigation and discovery

## Feature Structure

Each feature follows a consistent structure:

```
feature-name/
├── components/          # React components
├── services/            # API services and business logic
├── stores/              # State management (Zustand)
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks (if needed)
├── utils/               # Feature-specific utilities
└── index.ts             # Public API exports
```

## Import Patterns

### Within a Feature
```typescript
// Import from same feature
import { SomeComponent } from './components/SomeComponent';
import { SomeService } from './services/SomeService';
```

### Between Features
```typescript
// Import from another feature
import { AuthService } from '../../auth/services/auth.service';
import { useAuthStore } from '../../auth/stores/auth.store';
```

### From Root
```typescript
// Import from features index
import { AuthService, useAuthStore } from '../features';
```

## Migration Notes

- All components have been moved from `components/` to their respective feature directories
- Import paths have been updated throughout the codebase
- Services and stores are now co-located with their related components
- The main `App.tsx` and routing logic is in the `core` feature

## Adding New Features

1. Create a new directory under `features/`
2. Follow the standard feature structure
3. Create an `index.ts` file to export public APIs
4. Update the main features index if needed
5. Update import paths in existing components

## Best Practices

1. **Keep features self-contained** - Minimize dependencies between features
2. **Use barrel exports** - Export everything through the feature's index.ts
3. **Maintain clear boundaries** - Don't let implementation details leak across features
4. **Follow naming conventions** - Use consistent naming for directories and files
5. **Document public APIs** - Clearly document what each feature exports

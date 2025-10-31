# Frontend Restructure Proposal

## Executive Summary

The LightDom frontend codebase currently has **two separate frontend implementations**, 98+ UI components, 54 service files, and inconsistent configuration across the project. This proposal outlines a comprehensive restructuring to create a single, well-organized, maintainable frontend application following modern React best practices.

---

## Current Issues

### 🚨 Critical Issues

1. **Dual Frontend Applications**
   - Main app in `/src` (328 TypeScript files)
   - Standalone app in `/frontend` (26 TypeScript files)
   - Different configurations, dependencies, and architectures
   - Code duplication and maintenance overhead

2. **Excessive Service Files (54 services)**
   - All dumped in `/src/services/api/` without clear organization
   - No feature-based grouping
   - Hard to navigate and maintain
   - Potential duplication

3. **Component Chaos**
   - Components spread across multiple directories
   - Inconsistent naming conventions
   - Duplicate components (Navigation.tsx, BackButton.tsx)
   - No clear component hierarchy

4. **Configuration Inconsistency**
   - Two separate `vite.config.ts` files
   - Two separate `tsconfig.json` files
   - Different path aliases
   - Different build configurations

5. **Style System Fragmentation**
   - 11+ CSS files in `/src/styles/`
   - Duplicate Material Design token definitions
   - Standalone frontend doesn't use main design system
   - CSS files total 265KB+

6. **Routing Complexity**
   - 30+ routes in main App.tsx
   - Long route definitions
   - No route grouping or lazy loading
   - Missing code splitting

7. **State Management Confusion**
   - Multiple systems: Context, Hooks, Zustand, React Query
   - No clear documentation on when to use what
   - 11 custom state hooks with unclear responsibilities

8. **Missing Documentation**
   - No Storybook for components
   - No API service documentation
   - No component prop documentation
   - No development guidelines

---

## Proposed New Structure

### 📁 New Frontend Directory Layout

```
frontend/
├── public/                          # Static assets
│   ├── icons/                       # App icons, favicons
│   ├── images/                      # Static images
│   └── manifest.json                # PWA manifest
│
├── src/
│   ├── app/                         # App-level configuration
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # Entry point
│   │   ├── router.tsx               # Centralized routing
│   │   └── providers.tsx            # All providers wrapper
│   │
│   ├── features/                    # Feature-based modules
│   │   ├── auth/                    # Authentication feature
│   │   │   ├── components/          # Auth-specific components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── pages/               # Auth pages
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   └── ResetPasswordPage.tsx
│   │   │   ├── hooks/               # Auth hooks
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/            # Auth services
│   │   │   │   ├── authService.ts
│   │   │   │   ├── ssoService.ts
│   │   │   │   ├── webAuthnService.ts
│   │   │   │   └── twoFactorService.ts
│   │   │   ├── store/               # Auth state
│   │   │   │   └── authStore.ts
│   │   │   ├── types/               # Auth types
│   │   │   │   └── index.ts
│   │   │   └── index.ts             # Feature barrel export
│   │   │
│   │   ├── dashboard/               # Dashboard feature
│   │   │   ├── components/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── DashboardOverview.tsx
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   └── DashboardCharts.tsx
│   │   │   ├── pages/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── AnalyticsPage.tsx
│   │   │   │   └── HistoryPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboard.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── admin/                   # Admin feature
│   │   │   ├── components/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── UserManagementTable.tsx
│   │   │   │   ├── SystemMonitoringPanel.tsx
│   │   │   │   └── BillingPanel.tsx
│   │   │   ├── pages/
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   ├── UserManagementPage.tsx
│   │   │   │   ├── SystemMonitoringPage.tsx
│   │   │   │   ├── BillingManagementPage.tsx
│   │   │   │   └── SystemLogsPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAdminSettings.ts
│   │   │   ├── services/
│   │   │   │   └── adminService.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── blockchain/              # Blockchain feature
│   │   │   ├── components/
│   │   │   │   ├── BlockchainStats.tsx
│   │   │   │   ├── MiningPanel.tsx
│   │   │   │   └── TransactionHistory.tsx
│   │   │   ├── pages/
│   │   │   │   ├── BlockchainDashboardPage.tsx
│   │   │   │   └── MiningPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useBlockchain.ts
│   │   │   ├── services/
│   │   │   │   ├── blockchainService.ts
│   │   │   │   ├── miningService.ts
│   │   │   │   └── contractService.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── wallet/                  # Wallet feature
│   │   │   ├── components/
│   │   │   │   ├── WalletBalance.tsx
│   │   │   │   ├── TransactionList.tsx
│   │   │   │   └── TransferForm.tsx
│   │   │   ├── pages/
│   │   │   │   └── WalletPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWallet.ts
│   │   │   ├── services/
│   │   │   │   ├── walletService.ts
│   │   │   │   └── paymentService.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── seo/                     # SEO feature
│   │   │   ├── components/
│   │   │   │   ├── SEOOptimizer.tsx
│   │   │   │   ├── SEOAnalytics.tsx
│   │   │   │   └── ModelMarketplace.tsx
│   │   │   ├── pages/
│   │   │   │   ├── SEODashboardPage.tsx
│   │   │   │   ├── SEOMarketplacePage.tsx
│   │   │   │   └── SEOTrainingPage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useOptimization.ts
│   │   │   │   └── useSEOAnalytics.ts
│   │   │   ├── services/
│   │   │   │   ├── seoService.ts
│   │   │   │   ├── seoTrainingService.ts
│   │   │   │   └── seoAnalyticsService.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── crawler/                 # Web Crawler feature
│   │   │   ├── components/
│   │   │   │   ├── CrawlerControl.tsx
│   │   │   │   ├── CrawlerStats.tsx
│   │   │   │   └── CrawlerJobsList.tsx
│   │   │   ├── pages/
│   │   │   │   └── CrawlerDashboardPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCrawler.ts
│   │   │   ├── services/
│   │   │   │   ├── crawlerService.ts
│   │   │   │   └── crawlerPersistenceService.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── metaverse/               # Metaverse feature
│   │   │   ├── components/
│   │   │   │   ├── MetaverseChat.tsx
│   │   │   │   ├── BridgeNetwork.tsx
│   │   │   │   └── MiningRewards.tsx
│   │   │   ├── pages/
│   │   │   │   ├── MetaverseDashboardPage.tsx
│   │   │   │   ├── MarketplacePage.tsx
│   │   │   │   └── RewardsPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useMetaverse.ts
│   │   │   ├── services/
│   │   │   │   ├── metaverseService.ts
│   │   │   │   ├── chatService.ts
│   │   │   │   └── bridgeService.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── ai-content/              # AI Content feature
│   │   │   ├── components/
│   │   │   │   ├── ContentGenerator.tsx
│   │   │   │   ├── ModelTrainer.tsx
│   │   │   │   └── PerformanceOptimizer.tsx
│   │   │   ├── pages/
│   │   │   │   ├── AIContentPage.tsx
│   │   │   │   └── ModelTrainingPage.tsx
│   │   │   ├── services/
│   │   │   │   ├── aiContentService.ts
│   │   │   │   ├── modelTrainerService.ts
│   │   │   │   └── performanceOptimizer.ts
│   │   │   └── index.ts
│   │   │
│   │   └── websites/                # Websites management feature
│   │       ├── components/
│   │       │   ├── WebsitesList.tsx
│   │       │   ├── WebsiteEditor.tsx
│   │       │   └── WebsiteStats.tsx
│   │       ├── pages/
│   │       │   └── WebsitesManagementPage.tsx
│   │       ├── hooks/
│   │       │   └── useWebsites.ts
│   │       └── index.ts
│   │
│   ├── shared/                      # Shared modules
│   │   ├── components/              # Reusable components
│   │   │   ├── ui/                  # Base UI components
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   ├── Button.stories.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Card/
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Card.test.tsx
│   │   │   │   │   ├── Card.stories.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Input/
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Input.test.tsx
│   │   │   │   │   ├── Input.stories.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Modal/
│   │   │   │   ├── Select/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Alert/
│   │   │   │   └── index.ts
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   └── index.ts
│   │   │   ├── charts/              # Chart components
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   └── index.ts
│   │   │   ├── feedback/            # Feedback components
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                   # Shared hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useTheme.ts
│   │   │   ├── useNotifications.ts
│   │   │   ├── useAnalytics.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── validation.ts        # Form validation helpers
│   │   │   ├── formatting.ts        # Date, number formatting
│   │   │   ├── api.ts               # API helpers
│   │   │   ├── storage.ts           # LocalStorage helpers
│   │   │   ├── constants.ts         # App constants
│   │   │   └── index.ts
│   │   │
│   │   ├── types/                   # Shared TypeScript types
│   │   │   ├── api.ts               # API response types
│   │   │   ├── models.ts            # Data models
│   │   │   ├── common.ts            # Common types
│   │   │   └── index.ts
│   │   │
│   │   └── services/                # Core services
│   │       ├── api/                 # API client
│   │       │   ├── client.ts        # Axios instance
│   │       │   ├── interceptors.ts  # Request/response interceptors
│   │       │   └── index.ts
│   │       ├── storage/             # Storage service
│   │       │   └── storageService.ts
│   │       └── index.ts
│   │
│   ├── styles/                      # Global styles
│   │   ├── tokens/                  # Design tokens
│   │   │   ├── colors.css           # Color tokens
│   │   │   ├── typography.css       # Typography tokens
│   │   │   ├── spacing.css          # Spacing tokens
│   │   │   ├── shadows.css          # Shadow tokens
│   │   │   └── index.css            # All tokens
│   │   ├── base/                    # Base styles
│   │   │   ├── reset.css            # CSS reset
│   │   │   ├── global.css           # Global styles
│   │   │   └── index.css
│   │   ├── themes/                  # Theme definitions
│   │   │   ├── dark.css             # Dark theme
│   │   │   ├── light.css            # Light theme
│   │   │   └── index.css
│   │   ├── utilities/               # Utility classes
│   │   │   ├── animations.css       # Animation utilities
│   │   │   ├── layouts.css          # Layout utilities
│   │   │   └── index.css
│   │   └── index.css                # Main style entry
│   │
│   ├── config/                      # App configuration
│   │   ├── routes.ts                # Route definitions
│   │   ├── env.ts                   # Environment variables
│   │   ├── constants.ts             # App constants
│   │   └── index.ts
│   │
│   └── assets/                      # Asset files
│       ├── images/
│       ├── fonts/
│       └── icons/
│
├── .storybook/                      # Storybook configuration
│   ├── main.ts
│   ├── preview.ts
│   └── manager.ts
│
├── tests/                           # Test files
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   ├── e2e/                         # E2E tests (Playwright)
│   ├── setup.ts                     # Test setup
│   └── mocks/                       # Test mocks
│
├── docs/                            # Documentation
│   ├── components/                  # Component docs
│   ├── features/                    # Feature docs
│   ├── guides/                      # How-to guides
│   │   ├── adding-features.md
│   │   ├── creating-components.md
│   │   ├── state-management.md
│   │   └── testing.md
│   └── architecture.md              # Architecture overview
│
├── .github/                         # GitHub configuration
│   └── workflows/                   # CI/CD workflows
│
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # Tailwind configuration
├── postcss.config.js                # PostCSS configuration
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── vitest.config.ts                 # Vitest configuration
├── playwright.config.ts             # Playwright configuration
├── package.json                     # Dependencies
└── README.md                        # Project README
```

---

## Key Design Decisions

### 1. **Single Frontend Application**
- Consolidate `/src` and `/frontend` into one unified frontend
- Eliminate duplicate code and configurations
- Single source of truth

### 2. **Feature-Based Architecture**
- Each feature is a self-contained module
- Co-locate related code (components, hooks, services, types)
- Easy to understand, navigate, and test
- Scalable as features grow

### 3. **Clear Separation of Concerns**
```
features/         → Feature-specific code
shared/           → Reusable code across features
app/              → App-level configuration
styles/           → Design system and theming
config/           → Configuration files
```

### 4. **Component Organization**
- Each component gets its own folder
- Co-locate tests and stories with components
- Barrel exports for clean imports
- Clear component hierarchy (ui → layout → feature-specific)

### 5. **Service Layer Reorganization**
- Group services by feature domain
- 54 services → organized into 8-10 feature modules
- Shared API client for all services
- Centralized interceptors for auth/error handling

### 6. **State Management Strategy**
```
React Query      → Server state (API data, caching)
Zustand Stores   → Client state (UI state, feature state)
React Context    → Theme, auth (when needed)
Local State      → Component-specific state
```

### 7. **Routing Structure**
- Centralized route configuration
- Code splitting by feature
- Lazy loading for better performance
- Grouped routes (public, protected, admin)

### 8. **Design System**
- Single source of truth in `/styles/tokens/`
- Consolidate 11 CSS files into organized structure
- Theme switching support
- Material Design 3 + Exodus hybrid

### 9. **Testing Strategy**
```
Unit Tests       → Component/hook/utility tests
Integration      → Feature integration tests
E2E              → Critical user flows
Storybook        → Component documentation & visual testing
```

### 10. **Documentation First**
- Storybook for all UI components
- README in each feature folder
- Comprehensive guides in `/docs/`
- Inline JSDoc/TSDoc for functions

---

## Migration Strategy

### Phase 1: Setup & Foundation (Week 1)

1. **Create new directory structure**
   - Set up new `frontend/` directory
   - Create folder structure
   - Set up barrel exports

2. **Consolidate configuration**
   - Single `vite.config.ts`
   - Single `tsconfig.json`
   - Update path aliases
   - Consolidate dependencies

3. **Set up tooling**
   - Configure Storybook
   - Set up testing infrastructure
   - Configure linting and formatting

### Phase 2: Design System Migration (Week 1-2)

4. **Consolidate design tokens**
   - Merge 11 CSS files into organized structure
   - Create `/styles/tokens/` directory
   - Set up theme system
   - Document design system

5. **Migrate base UI components**
   - Move components to `/shared/components/ui/`
   - Add Storybook stories
   - Add unit tests
   - Update imports

### Phase 3: Feature Migration (Week 2-4)

6. **Migrate features one by one**
   - Priority order:
     1. Auth (foundation)
     2. Dashboard (core)
     3. Admin
     4. Blockchain
     5. Wallet
     6. SEO
     7. Crawler
     8. Metaverse
     9. AI Content
     10. Websites

7. **For each feature:**
   - Create feature directory
   - Move components
   - Move/consolidate services
   - Create hooks
   - Add tests
   - Update imports
   - Add documentation

### Phase 4: Routing & State (Week 4)

8. **Centralize routing**
   - Create `app/router.tsx`
   - Implement code splitting
   - Add lazy loading
   - Test all routes

9. **Consolidate state management**
   - Document state strategy
   - Create feature stores
   - Update hooks
   - Remove redundant state

### Phase 5: Testing & Documentation (Week 5)

10. **Add comprehensive tests**
    - Unit tests for all components
    - Integration tests for features
    - E2E tests for critical flows

11. **Complete documentation**
    - Storybook for all components
    - Feature READMEs
    - Development guides
    - Architecture docs

### Phase 6: Cleanup & Optimization (Week 5-6)

12. **Remove old code**
    - Delete old `/src` structure
    - Remove duplicate files
    - Clean up unused dependencies

13. **Optimize bundle**
    - Analyze bundle size
    - Implement code splitting
    - Optimize imports
    - Configure caching

14. **Final testing**
    - Full regression testing
    - Performance testing
    - Accessibility audit
    - Security audit

---

## Example: Feature Module Structure

### Auth Feature Example

```typescript
// features/auth/index.ts - Barrel export
export * from './components';
export * from './pages';
export * from './hooks';
export * from './services';
export * from './types';

// features/auth/hooks/useAuth.ts
import { create } from 'zustand';
import { authService } from '../services';
import type { User, AuthState } from '../types';

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));

// features/auth/services/authService.ts
import { apiClient } from '@/shared/services/api';
import type { LoginCredentials, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // ... other auth methods
};

// features/auth/pages/LoginPage.tsx
import { LoginForm } from '../components';
import { useAuth } from '../hooks';

export const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="login-page">
      <h1>Login</h1>
      <LoginForm onSubmit={login} />
    </div>
  );
};
```

---

## Benefits of New Structure

### 🎯 Developer Experience

1. **Easy Navigation**
   - Clear folder structure
   - Feature-based organization
   - Predictable file locations

2. **Better Onboarding**
   - Self-documenting structure
   - Comprehensive documentation
   - Storybook component catalog

3. **Faster Development**
   - Less time searching for files
   - Clear patterns to follow
   - Reusable components and hooks

### 🚀 Performance

1. **Code Splitting**
   - Lazy loading by feature
   - Smaller initial bundle
   - Faster page loads

2. **Optimized Imports**
   - Tree shaking friendly
   - Barrel exports
   - No circular dependencies

3. **Better Caching**
   - Organized static assets
   - Optimized build output

### 🧪 Testing

1. **Co-located Tests**
   - Tests next to components
   - Easy to find and maintain
   - Higher test coverage

2. **Visual Testing**
   - Storybook stories
   - Component documentation
   - Visual regression testing

3. **Feature Testing**
   - Integration tests per feature
   - E2E tests for critical flows
   - Mock data per feature

### 📦 Maintainability

1. **Single Responsibility**
   - Each file has clear purpose
   - Features are self-contained
   - Easy to modify/remove features

2. **Scalability**
   - Add features without touching others
   - Clear extension points
   - Minimal coupling

3. **Code Quality**
   - Consistent patterns
   - Enforced conventions
   - Automated quality checks

---

## Configuration Changes

### New `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'LightDom',
        short_name: 'LightDom',
        theme_color: '#5865F2',
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'recharts'],

          // Feature chunks (lazy loaded)
          // Will be automatically split by dynamic imports
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
  },
});
```

### New `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/config/*": ["./src/config/*"],
      "@/assets/*": ["./src/assets/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Import Examples

### Before (Current)
```typescript
// Hard to understand what's being imported
import { Button } from './components/ui/design-system/Button';
import { useAuth } from './hooks/state/useAuth';
import { BlockchainService } from './services/api/BlockchainService';
import DashboardLayout from './components/ui/dashboard/DashboardLayout';
```

### After (New Structure)
```typescript
// Clear, predictable imports
import { Button } from '@/shared/components/ui';
import { useAuth } from '@/features/auth';
import { blockchainService } from '@/features/blockchain';
import { DashboardLayout } from '@/features/dashboard';
```

---

## Documentation Standards

### Component Documentation

Every component should have:

1. **JSDoc comment**
```typescript
/**
 * Primary button component
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = ({ variant, size, children, ...props }: ButtonProps) => {
  // ...
};
```

2. **Storybook story**
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};
```

3. **Unit tests**
```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## Next Steps

### Immediate Actions

1. **Review and approve this proposal**
2. **Set up new directory structure**
3. **Configure tooling (Storybook, testing)**
4. **Start Phase 1: Foundation**

### Success Metrics

- ✅ Single frontend application
- ✅ All 98 components documented in Storybook
- ✅ 80%+ test coverage
- ✅ < 200KB initial bundle size
- ✅ All features organized by domain
- ✅ Zero duplicate components
- ✅ Comprehensive developer documentation
- ✅ Sub-3s initial page load

---

## Questions & Answers

### Q: Should we migrate everything at once?
**A:** No, use the phased approach. Start with foundation, then migrate features one by one.

### Q: What about the standalone `/frontend` app?
**A:** Evaluate if it's still needed. If yes, keep it separate. If no, migrate useful code to new structure.

### Q: How do we handle the 54 services?
**A:** Group them by feature domain. Example: All SEO services → `features/seo/services/`

### Q: What about backward compatibility?
**A:** Create import aliases during migration. Remove after complete migration.

### Q: When should we use React Query vs Zustand?
**A:**
- React Query: Server state (API calls, caching)
- Zustand: Client state (UI state, feature state)
- Context: Rarely (theme, auth when simple)

---

## Conclusion

This restructure will transform the LightDom frontend from a complex, hard-to-navigate codebase into a well-organized, maintainable, and scalable application. The feature-based architecture, combined with clear separation of concerns and comprehensive documentation, will significantly improve developer experience and application performance.

**Estimated Timeline:** 5-6 weeks for complete migration
**Team Size:** 2-3 developers
**Risk Level:** Low (phased migration with no downtime)

---

**Ready to transform LightDom's frontend!** 🚀

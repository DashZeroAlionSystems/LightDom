# Quick Start Guide

Get up and running with LightDom frontend development in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone https://github.com/DashZeroAlionSystems/LightDom.git
   cd LightDom/frontend-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to http://localhost:3000

## Project Structure

```
src/
├── app/              # App configuration
├── features/         # Feature modules
│   ├── auth/         # Authentication
│   ├── dashboard/    # Dashboard
│   └── ...
├── shared/           # Shared code
│   ├── components/   # UI components
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utilities
│   └── services/     # API client
└── styles/           # Design system
```

## Key Concepts

### 1. Feature-Based Architecture

Code is organized by feature, not by technical layer:

```
features/auth/
├── components/      # Auth-specific components
├── pages/           # Login, Register pages
├── hooks/           # useAuth hook
├── services/        # Auth API calls
└── types/           # Auth types
```

### 2. Import Aliases

Use clean imports with path aliases:

```typescript
import { Button } from '@/shared/components/ui';
import { useAuth } from '@/features/auth';
import { formatDate } from '@/shared/utils';
```

### 3. State Management

- **React Query** for server state
- **Zustand** for client state
- **Local state** for component state

### 4. Design System

Use Tailwind classes with design tokens:

```tsx
<div className="bg-background-primary text-text-primary">
  <button className="bg-accent-blue hover:bg-accent-blue-dark">
    Click me
  </button>
</div>
```

## Common Tasks

### Add a New Component

1. Create component directory:
   ```bash
   mkdir -p src/shared/components/ui/MyComponent
   ```

2. Create files:
   ```
   MyComponent/
   ├── MyComponent.tsx
   ├── MyComponent.test.tsx
   ├── MyComponent.stories.tsx
   └── index.ts
   ```

3. Export from barrel:
   ```typescript
   // src/shared/components/ui/index.ts
   export * from './MyComponent';
   ```

### Add a New Feature

1. Create feature directory:
   ```bash
   mkdir -p src/features/my-feature/{components,pages,hooks,services,types}
   ```

2. Add feature code

3. Export from barrel:
   ```typescript
   // src/features/my-feature/index.ts
   export * from './components';
   export * from './pages';
   export * from './hooks';
   ```

### Run Tests

```bash
npm run test              # Unit tests
npm run test:coverage     # With coverage
npm run test:e2e          # E2E tests
```

### View Storybook

```bash
npm run storybook
```

Open http://localhost:6006

## Next Steps

- Read [Adding Features Guide](./adding-features.md)
- Read [State Management Guide](./state-management.md)
- Explore components in Storybook
- Check existing features for patterns

## Troubleshooting

### Port 3000 in use

```bash
# Change port in vite.config.ts or
PORT=3001 npm run dev
```

### Dependencies not installing

```bash
rm -rf node_modules package-lock.json
npm install
```

### Type errors

```bash
npm run type-check
```

## Getting Help

- Check `/docs/guides/` for detailed guides
- Review code in `/src/features/` for examples
- Ask the team for help

Happy coding! 🚀

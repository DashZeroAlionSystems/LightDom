# LightDom Frontend

Modern, scalable frontend for the LightDom blockchain-based DOM optimization platform.

## 🏗️ Architecture

This frontend follows a **feature-based architecture** where code is organized by feature domain rather than technical layer.

```
src/
├── app/              # App-level configuration & entry point
├── features/         # Feature modules (auth, dashboard, etc.)
├── shared/           # Shared components, hooks, utilities
├── styles/           # Design tokens and global styles
├── config/           # App configuration
└── assets/           # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types
npm run test             # Run unit tests
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests with Playwright
npm run storybook        # Start Storybook (http://localhost:6006)
```

## 📁 Project Structure

### Features

Each feature is a self-contained module with its own:
- Components
- Pages
- Hooks
- Services
- Store (state management)
- Types

Example feature structure:
```
features/auth/
├── components/       # Feature-specific components
├── pages/            # Page components
├── hooks/            # Custom hooks
├── services/         # API services
├── store/            # State management
├── types/            # TypeScript types
└── index.ts          # Barrel export
```

### Shared Modules

Reusable code across features:

```
shared/
├── components/       # UI components, layouts, charts
├── hooks/            # Reusable hooks
├── utils/            # Utility functions
├── types/            # Shared types
└── services/         # Core services (API client)
```

## 🎨 Design System

Based on Material Design 3 + Exodus Wallet aesthetic.

- **Colors**: Dark theme with blue/purple accents
- **Typography**: Inter (body), Montserrat (headings)
- **Components**: Documented in Storybook
- **Tokens**: CSS variables in `/src/styles/tokens/`

### Using Design Tokens

```tsx
// Using Tailwind classes
<div className="bg-background-primary text-text-primary">
  <button className="bg-accent-blue hover:bg-accent-blue-dark">
    Click me
  </button>
</div>

// Using CSS variables
.custom-element {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm run test              # Run tests
npm run test:coverage     # With coverage report
```

Test files are co-located with components:
```
Button/
├── Button.tsx
├── Button.test.tsx       # Unit tests
└── Button.stories.tsx    # Storybook stories
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Tests are in `/tests/e2e/`.

## 📚 Documentation

### Storybook

Interactive component documentation:

```bash
npm run storybook
```

View at http://localhost:6006

### Guides

See `/docs/guides/` for:
- Adding new features
- Creating components
- State management patterns
- Testing guidelines

## 🔧 Configuration

### Path Aliases

```typescript
import { Button } from '@/shared/components/ui';
import { useAuth } from '@/features/auth';
import { formatCurrency } from '@/shared/utils';
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## 🏗️ State Management

### Strategy

- **React Query**: Server state (API data, caching)
- **Zustand**: Client state (UI, feature state)
- **React Context**: Theme, i18n (rarely)
- **Local State**: Component-specific state

### Example

```typescript
// Server state with React Query
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery(['users'], fetchUsers);

// Client state with Zustand
import { useAuth } from '@/features/auth';

const { user, login, logout } = useAuth();
```

## 📦 Building for Production

```bash
# Build
npm run build

# Preview locally
npm run preview
```

Output in `/dist/`.

### Bundle Optimization

- Code splitting by route
- Lazy loading for features
- Vendor chunk separation
- Tree shaking enabled

## 🔒 Code Quality

### Linting

ESLint configured with:
- TypeScript recommended rules
- React recommended rules
- Custom rules for code quality

### Formatting

Prettier for consistent code style.

```bash
npm run format       # Format all files
npm run lint        # Lint and auto-fix
```

### Type Safety

TypeScript strict mode enabled.

```bash
npm run type-check   # Check types
```

## 🚢 Deployment

### Build Assets

```bash
npm run build
```

### Deploy

Deploy the `/dist/` folder to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting

### PWA Support

Progressive Web App features included:
- Offline support
- Service worker
- App manifest
- Installable

## 🤝 Contributing

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Write tests for all new features
- Document components in Storybook

### Adding Features

1. Create feature directory in `/src/features/`
2. Follow the feature structure template
3. Add barrel exports
4. Write tests
5. Update Storybook

See `/docs/guides/adding-features.md` for details.

## 📞 Support

For issues or questions:
- Check `/docs/` for guides
- Review Storybook for component usage
- Check existing code for patterns

---

**Built with ❤️ by the LightDom team**

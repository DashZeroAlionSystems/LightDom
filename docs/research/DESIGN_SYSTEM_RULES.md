# LightDom Design System Rules & Guidelines

## Overview
This document contains rules and guidelines for implementing the LightDom design system, incorporating research from Material Design 3, Tailwind CSS, and modern UI/UX patterns.

---

## 🎨 Design Principles

### 1. Consistency First
- Use design tokens throughout the application
- Never hardcode colors, spacing, typography, or other design values
- All design decisions should reference the design system

### 2. Material Design 3 Foundation
- Follow Material Design 3 (Material You) principles
- Use the 13-tone color palettes (0-100)
- Implement proper elevation with shadows
- Apply state layers for interactive elements
- Use Material motion system for animations

### 3. Accessibility Always
- WCAG 2.1 Level AA compliance mandatory
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- All interactive elements must be keyboard accessible
- Proper ARIA attributes required for complex components
- Focus indicators must be clearly visible

### 4. Mobile-First Responsive Design
- Design for mobile, enhance for desktop
- Use Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Test on multiple device sizes
- Touch targets minimum 44x44px

---

## 🎯 Component Development Rules

### Atomic Design Structure
```
components/
├── atoms/          (Basic building blocks)
│   ├── Button/
│   ├── Input/
│   ├── Icon/
│   └── Badge/
├── molecules/      (Simple component groups)
│   ├── FormField/
│   ├── SearchBar/
│   └── Card/
├── organisms/      (Complex components)
│   ├── Navigation/
│   ├── DataTable/
│   └── Modal/
├── templates/      (Page layouts)
│   ├── DashboardLayout/
│   └── AuthLayout/
└── pages/          (Full pages)
    ├── Dashboard/
    └── Settings/
```

### Component File Structure
Each component folder must contain:
- `ComponentName.tsx` - Main component
- `ComponentName.test.tsx` - Unit tests
- `ComponentName.stories.tsx` - Storybook stories
- `index.ts` - Public exports
- `types.ts` - TypeScript interfaces (if complex)
- `styles.ts` - Styled components or CSS modules (if needed)

### Component Template
```typescript
/**
 * ComponentName
 * Brief description of what the component does
 * 
 * @example
 * <Button variant="filled" size="medium">Click me</Button>
 */

import React from 'react';
import { ComponentNameProps } from './types';

export const ComponentName: React.FC<ComponentNameProps> = ({
  variant = 'default',
  size = 'medium',
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  // Component logic here
  
  return (
    <div className={`component-name ${variant} ${size} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Default export
export default ComponentName;
```

---

## 🎨 Color System Rules

### 1. Always Use Design Tokens
```typescript
// ❌ DON'T
const Button = styled.button`
  background-color: #7c3aed;
  color: #ffffff;
`;

// ✅ DO
const Button = styled.button`
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
`;

// ✅ OR with Tailwind
<button className="bg-primary text-white">Click</button>
```

### 2. Color Role Usage
- **Primary**: Main brand actions (CTA buttons, links)
- **Secondary**: Supporting actions and accents
- **Tertiary**: Additional accents and highlights
- **Error**: Error states, destructive actions
- **Success**: Success states, confirmations
- **Warning**: Warning states, cautions
- **Surface**: Backgrounds, cards, containers
- **Outline**: Borders, dividers

### 3. Light/Dark Theme Support
Every component must support both light and dark themes:
```typescript
// Use theme-aware colors
<div className="bg-surface dark:bg-surface-dark text-neutral-10 dark:text-neutral-90">
  Content
</div>
```

---

## 📝 Typography Rules

### 1. Use Material Design 3 Type Scale
```typescript
// Display: Hero text, large headings
<h1 className="text-display-large">Main Heading</h1>

// Headline: Section headings
<h2 className="text-headline-medium">Section Title</h2>

// Title: Card titles, list headers
<h3 className="text-title-large">Card Title</h3>

// Body: Main content
<p className="text-body-large">Content text here</p>

// Label: Buttons, tabs, labels
<span className="text-label-large">Button Text</span>
```

### 2. Font Weight Guidelines
- 300 (Light): Rarely used, special cases only
- 400 (Regular): Body text, default
- 500 (Medium): Titles, emphasis, labels
- 600 (Semibold): Rarely used
- 700 (Bold): Strong emphasis only

### 3. Line Height & Letter Spacing
- Never override the type scale line height unless absolutely necessary
- Letter spacing is already optimized in the type scale
- If custom values needed, document the reason

---

## 📏 Spacing Rules

### 1. 8px Grid System
All spacing must be multiples of 4px (preferably 8px):
```typescript
// ✅ DO
<div className="p-4">      // 16px
<div className="mt-8">     // 32px
<div className="gap-6">    // 24px

// ❌ DON'T
<div className="p-3">      // 12px - use sparingly
<div style={{ margin: '15px' }}>  // Arbitrary values
```

### 2. Component Spacing Guidelines
- **Buttons**: Internal padding 16-24px horizontal, 8-12px vertical
- **Cards**: Minimum 16px padding
- **Forms**: 16-24px between fields
- **Sections**: 32-64px between major sections
- **Grid gaps**: 16px mobile, 24px desktop

---

## 🎭 Animation & Motion Rules

### 1. Duration Guidelines
```typescript
// Use Material Design 3 durations
short1: '50ms',    // Icon state changes
short2: '100ms',   // Checkboxes, switches
short3: '150ms',   // Simple transitions
short4: '200ms',   // Standard transitions (DEFAULT)
medium1: '250ms',  // List items
medium2: '300ms',  // Expanding panels
medium3: '350ms',  // Large elements
medium4: '400ms',  // Full-screen transitions
long1: '450ms',    // Complex animations
long2: '500ms',    // Page transitions
```

### 2. Easing Functions
```typescript
// Use Material Design 3 easing
standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',           // Default
emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',         // Preferred
emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',  // Enter
emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',  // Exit
```

### 3. Animation Best Practices
- Prefer `transform` and `opacity` for performance
- Use `will-change` sparingly
- Always provide reduced motion alternatives
```typescript
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🔘 Button Component Rules

### 1. Button Variants
```typescript
// Filled (Primary) - Main actions
<button className="btn-filled">Primary Action</button>

// Outlined - Secondary actions
<button className="btn-outlined">Secondary Action</button>

// Text - Tertiary actions
<button className="btn-text">Tertiary Action</button>

// Elevated - Special emphasis
<button className="btn-filled shadow-elevation-1">Important</button>
```

### 2. Button Sizes
```typescript
small: 32px height, 16px horizontal padding
medium: 40px height, 24px horizontal padding (DEFAULT)
large: 48px height, 32px horizontal padding
```

### 3. Button States
All buttons must have:
- Default state
- Hover state (elevation increase or state layer)
- Focus state (visible focus indicator)
- Active/pressed state
- Disabled state (38% opacity)
- Loading state (with spinner)

---

## 🃏 Card Component Rules

### 1. Card Variants
```typescript
// Elevated - Default, subtle shadow
<div className="card-elevated">Content</div>

// Filled - Colored background
<div className="card-filled">Content</div>

// Outlined - Border, no shadow
<div className="card-outlined">Content</div>
```

### 2. Card Structure
```typescript
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Subtitle>Subtitle</Card.Subtitle>
  </Card.Header>
  <Card.Body>
    Main content
  </Card.Body>
  <Card.Footer>
    <Card.Actions>
      <Button>Action</Button>
    </Card.Actions>
  </Card.Footer>
</Card>
```

### 3. Card Spacing
- Minimum padding: 16px
- Header bottom margin: 16px
- Footer top margin: 16px
- Between elements: 12px

---

## 📋 Form Component Rules

### 1. Form Field Structure
```typescript
<FormField>
  <Label>Field Label</Label>
  <Input />
  <HelperText>Optional helper text</HelperText>
  <ErrorText>Error message if validation fails</ErrorText>
</FormField>
```

### 2. Input States
- Default: Outlined or filled style
- Focus: Border color changes to primary, 2px width
- Error: Border color changes to error, show error message
- Disabled: 38% opacity, cursor not-allowed
- Read-only: Different visual treatment

### 3. Form Validation
```typescript
// Real-time validation
const [errors, setErrors] = useState({});

const validateField = (name, value) => {
  const newErrors = { ...errors };
  
  if (!value) {
    newErrors[name] = 'This field is required';
  } else {
    delete newErrors[name];
  }
  
  setErrors(newErrors);
};
```

---

## 📊 Data Visualization Rules

### 1. Chart Colors
Use semantic colors from the design system:
```typescript
const chartColors = {
  primary: '#6750A4',
  secondary: '#625B71',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#B3261E',
  info: '#2196F3',
};
```

### 2. Chart Types
- **Line Chart**: Trends over time
- **Bar Chart**: Comparisons between categories
- **Pie Chart**: Parts of a whole (use sparingly)
- **Area Chart**: Cumulative data over time
- **Scatter Plot**: Correlations

### 3. Accessibility
- Provide alternative text for charts
- Use patterns in addition to colors
- Include data table alternative
- Keyboard navigable

---

## 🎯 Dashboard Design Rules

### 1. Dashboard Layout
```typescript
<DashboardLayout>
  <Sidebar />
  <MainContent>
    <Header />
    <StatsOverview />
    <ChartsSection />
    <DataTables />
  </MainContent>
</DashboardLayout>
```

### 2. Stats Cards
```typescript
<StatsCard
  title="Total Users"
  value="12,345"
  change="+12.5%"
  trend="up"
  icon={<UsersIcon />}
/>
```

### 3. Dashboard Best Practices
- Most important metrics at the top
- Use progressive disclosure (don't overwhelm)
- Provide filters and date ranges
- Enable customization when possible
- Responsive grid layout

---

## 🔍 Navigation Rules

### 1. Navigation Types
```typescript
// Top Navigation Bar
<NavBar>
  <Logo />
  <NavLinks />
  <UserMenu />
</NavBar>

// Sidebar Navigation
<Sidebar>
  <SidebarHeader />
  <SidebarMenu />
  <SidebarFooter />
</Sidebar>

// Breadcrumbs
<Breadcrumbs>
  <Breadcrumb href="/">Home</Breadcrumb>
  <Breadcrumb href="/dashboard">Dashboard</Breadcrumb>
  <Breadcrumb>Settings</Breadcrumb>
</Breadcrumbs>
```

### 2. Navigation States
- Active: Highlighted, distinct background
- Hover: State layer or background change
- Focus: Visible focus indicator
- Disabled: Reduced opacity

---

## ⚡ Performance Rules

### 1. Code Splitting
```typescript
// Lazy load routes
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));

<Route path="/admin" element={
  <Suspense fallback={<Loading />}>
    <AdminDashboard />
  </Suspense>
} />
```

### 2. Image Optimization
- Use WebP format with PNG/JPG fallback
- Lazy load images below the fold
- Provide responsive image sizes
- Use CDN for static assets

### 3. Bundle Size
- Keep bundle size under 250KB (gzipped)
- Use tree-shaking
- Avoid unnecessary dependencies
- Code split by route

---

## ✅ Testing Rules

### 1. Unit Tests Required
Every component must have tests covering:
- Default rendering
- All variants and props
- User interactions
- Edge cases
- Accessibility

### 2. Integration Tests
- User workflows (login, navigation, etc.)
- API interactions
- State management

### 3. Visual Regression Tests
- Use Storybook with Chromatic
- Test on multiple viewports
- Test light and dark themes

---

## 📚 Documentation Rules

### 1. Component Documentation
Every component must have:
```typescript
/**
 * Button Component
 * 
 * A Material Design 3 button with multiple variants and sizes.
 * 
 * @example
 * ```tsx
 * <Button variant="filled" size="medium" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 * 
 * @param {ButtonProps} props - Component props
 * @param {'filled' | 'outlined' | 'text'} props.variant - Button style variant
 * @param {'small' | 'medium' | 'large'} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.children - Button content
 * @param {() => void} props.onClick - Click handler
 */
```

### 2. Storybook Stories
```typescript
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
};

export const Default = {
  args: {
    children: 'Button',
    variant: 'filled',
    size: 'medium',
  },
};
```

---

## 🚫 Anti-Patterns to Avoid

### 1. Don't Mix Design Systems
```typescript
// ❌ DON'T mix Ant Design with Material Design styling
<AntButton className="bg-primary">  // Conflicts!

// ✅ DO use one system consistently
<Button variant="filled">
```

### 2. Don't Hardcode Values
```typescript
// ❌ DON'T
<div style={{ marginTop: '25px', color: '#7c3aed' }}>

// ✅ DO
<div className="mt-6 text-primary">
```

### 3. Don't Ignore Accessibility
```typescript
// ❌ DON'T
<div onClick={handleClick}>Click me</div>

// ✅ DO
<button onClick={handleClick} aria-label="Action description">
  Click me
</button>
```

### 4. Don't Skip Loading States
```typescript
// ❌ DON'T
return data ? <DataTable data={data} /> : null;

// ✅ DO
if (loading) return <Skeleton />;
if (error) return <ErrorState />;
if (!data) return <EmptyState />;
return <DataTable data={data} />;
```

---

## 🎯 Code Quality Checklist

Before committing code, ensure:
- [ ] Follows design system guidelines
- [ ] Uses design tokens (no hardcoded values)
- [ ] Responsive on all breakpoints
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Light and dark theme support
- [ ] Loading and error states
- [ ] TypeScript types defined
- [ ] Unit tests written
- [ ] Documented with JSDoc
- [ ] Storybook story created
- [ ] No console errors
- [ ] Performance optimized
- [ ] Code reviewed

---

## 📖 Resources

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Project Design System Documentation](./docs/research/UI_UX_PATTERNS_RESEARCH.md)

---

## 🔄 Version History

- v1.0.0 (2025-10-28) - Initial design system rules based on Material Design 3 research

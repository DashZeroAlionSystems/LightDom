# UI/UX Patterns and Workflows for Great Reusable Components

## Research Summary - January 2025

This document consolidates research on creating reusable UI components following industry best practices, Material Design 3 guidelines, and modern React patterns.

## Table of Contents
1. [Component Design Principles](#component-design-principles)
2. [Material Design 3 Integration](#material-design-3-integration)
3. [Tailwind CSS Best Practices](#tailwind-css-best-practices)
4. [Reusable Component Patterns](#reusable-component-patterns)
5. [Accessibility Guidelines](#accessibility-guidelines)
6. [Performance Optimization](#performance-optimization)

---

## Component Design Principles

### 1. Single Responsibility Principle
Each component should do one thing well. Complex components should be broken down into smaller, composable pieces.

**Example:**
```tsx
// Bad - Button doing too much
<Button icon={<Icon />} tooltip="Click me" onClick={handleClick} isLoading badge={5}>
  Submit
</Button>

// Good - Separated concerns
<Tooltip content="Click me">
  <Badge count={5}>
    <Button onClick={handleClick} isLoading>
      <Icon /> Submit
    </Button>
  </Badge>
</Tooltip>
```

### 2. Composition Over Configuration
Favor composition patterns over complex configuration objects.

**Example:**
```tsx
// Bad - Configuration heavy
<Card config={{ 
  header: "Title", 
  body: "Content", 
  footer: "Actions",
  variant: "elevated",
  padding: "lg"
}} />

// Good - Composition pattern
<Card variant="elevated" padding="lg">
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

### 3. Consistent API Design
Components should follow predictable naming conventions and prop patterns.

**Standard Props Pattern:**
- `variant`: Style variations (filled, outlined, text)
- `size`: Size variations (sm, md, lg)
- `disabled`: Disabled state
- `isLoading`: Loading state
- `error`: Error message or state
- `fullWidth`: Full width behavior
- `className`: Additional CSS classes
- `children`: Component content

### 4. Controlled vs Uncontrolled Components
Provide both controlled and uncontrolled patterns where appropriate.

```tsx
// Uncontrolled (internal state)
<Input defaultValue="initial" />

// Controlled (external state)
<Input value={value} onChange={setValue} />
```

---

## Material Design 3 Integration

### Key MD3 Principles

#### 1. Dynamic Color System
Material Design 3 uses a dynamic color system based on tonal palettes.

**Color Roles:**
- `primary`: Main brand color
- `secondary`: Supporting brand color
- `tertiary`: Accent color for highlighting
- `error`: Error states
- `surface`: Background surfaces
- `on-*`: Text/icon colors on colored backgrounds

**Implementation:**
```css
:root {
  --md3-primary-50: #f3e8ff;
  --md3-primary-600: #7c3aed;
  --md3-on-primary: #ffffff;
}

.button-primary {
  background-color: var(--md3-primary-600);
  color: var(--md3-on-primary);
}
```

#### 2. Typography Scale
MD3 defines a comprehensive type scale for consistency.

**Type Roles:**
- **Display**: Large, expressive headlines (57px, 45px, 36px)
- **Headline**: Section headers (32px, 28px, 24px)
- **Title**: Subsection headers (22px, 16px, 14px)
- **Body**: Main content (16px, 14px, 12px)
- **Label**: UI elements (14px, 12px, 11px)

**Implementation:**
```tsx
<h1 className="md3-display-large">Hero Headline</h1>
<h2 className="md3-headline-medium">Section Header</h2>
<p className="md3-body-medium">Body text content</p>
<button className="md3-label-large">Button</button>
```

#### 3. Elevation System
MD3 uses a 6-level elevation system (0-5) for creating depth.

**Elevation Levels:**
- Level 0: No shadow (flat surfaces)
- Level 1: Subtle depth (cards at rest)
- Level 2: Raised surfaces (cards on hover)
- Level 3: Floating elements (FABs)
- Level 4: Modal dialogs
- Level 5: Navigation drawers

**Implementation:**
```css
.md3-elevation-1 {
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3),
              0px 1px 3px 1px rgba(0, 0, 0, 0.15);
}
```

#### 4. Motion & Animation
MD3 defines standard easing curves for natural motion.

**Easing Curves:**
- **Emphasized**: `cubic-bezier(0.2, 0.0, 0, 1.0)` - Main curve for most animations
- **Standard**: `cubic-bezier(0.4, 0.0, 0.2, 1)` - Default transitions
- **Decelerate**: `cubic-bezier(0.0, 0.0, 0.2, 1)` - Enter animations
- **Accelerate**: `cubic-bezier(0.4, 0.0, 1, 1)` - Exit animations

**Duration Guidelines:**
- Simple transitions: 100-150ms
- Medium transitions: 250-300ms
- Complex transitions: 400-500ms

#### 5. Shape System
Consistent border radius values create visual cohesion.

**Shape Scale:**
- Extra Small: 4px - Small chips, checkboxes
- Small: 8px - Buttons, small cards
- Medium: 12px - Standard cards
- Large: 16px - Large cards, dialogs
- Extra Large: 28px - Bottom sheets
- Full: 9999px - Pills, FABs

---

## Tailwind CSS Best Practices

### 1. Utility-First Approach
Use Tailwind's utility classes for rapid development.

```tsx
// Good - Utility classes
<div className="flex items-center gap-4 p-6 bg-surface rounded-lg">
  <Avatar className="h-12 w-12" />
  <div className="flex-1">
    <h3 className="text-headline-sm">User Name</h3>
    <p className="text-body-sm text-on-surface-variant">Email</p>
  </div>
</div>
```

### 2. Component Extraction
Extract frequently used patterns into components.

```tsx
// Extracted Button component
export function Button({ variant = 'filled', size = 'md', children, ...props }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-sm transition-all';
  const variantClasses = {
    filled: 'bg-primary text-on-primary hover:shadow-level-1',
    outlined: 'border border-outline text-primary hover:bg-surface-light',
    text: 'text-primary hover:bg-primary/10'
  };
  const sizeClasses = {
    sm: 'h-8 px-4 text-label-md',
    md: 'h-10 px-6 text-label-lg',
    lg: 'h-12 px-8 text-label-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 3. Theme Configuration
Extend Tailwind's theme with custom values aligned to design system.

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3e8ff',
          600: '#7c3aed',
          // ...
        },
      },
      fontSize: {
        'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        // ...
      },
    },
  },
};
```

### 4. Responsive Design
Mobile-first responsive patterns.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Stacks on mobile, 2 cols on tablet, 3 cols on desktop */}
</div>
```

---

## Reusable Component Patterns

### 1. Compound Components
Allow flexible component composition.

```tsx
export function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }) {
  return <div className="flex gap-2 border-b">{children}</div>;
};

Tabs.Tab = function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={activeTab === value ? 'active' : ''}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabPanel({ value, children }) {
  const { activeTab } = useTabsContext();
  return activeTab === value ? <div>{children}</div> : null;
};

// Usage
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>
```

### 2. Render Props Pattern
Provide render control to consumers.

```tsx
function DataList({ data, renderItem }) {
  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// Usage
<DataList
  data={users}
  renderItem={(user, index) => (
    <div className="flex gap-4">
      <Avatar src={user.avatar} />
      <span>{user.name}</span>
    </div>
  )}
/>
```

### 3. Polymorphic Components
Allow component element customization.

```tsx
function Button({ as: Component = 'button', children, ...props }) {
  return <Component {...props}>{children}</Component>;
}

// Usage
<Button>Default button</Button>
<Button as="a" href="/link">Link styled as button</Button>
<Button as={NextLink} to="/route">Next.js link</Button>
```

### 4. Forwarding Refs
Enable ref forwarding for DOM access.

```tsx
const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`md3-input ${className}`}
      {...props}
    />
  );
});

// Usage
const inputRef = useRef();
<Input ref={inputRef} />
```

---

## Accessibility Guidelines

### 1. Semantic HTML
Use appropriate HTML elements for better accessibility.

```tsx
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<button onClick={handleClick}>Click me</button>
```

### 2. ARIA Attributes
Provide context for screen readers.

```tsx
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
  aria-disabled={isDisabled}
>
  <CloseIcon />
</button>
```

### 3. Keyboard Navigation
Ensure all interactive elements are keyboard accessible.

```tsx
function Dialog({ isOpen, onClose }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);
  
  return isOpen ? <div role="dialog" aria-modal="true">...</div> : null;
}
```

### 4. Focus Management
Manage focus appropriately for modals and dynamic content.

```tsx
function Modal({ isOpen, children }) {
  const modalRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <div ref={modalRef} tabIndex={-1} role="dialog">
      {children}
    </div>
  );
}
```

### 5. Color Contrast
Ensure WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text).

```css
/* Good contrast */
.text-on-primary {
  color: #ffffff; /* White on primary color */
  background-color: #7c3aed; /* Contrast ratio > 4.5:1 */
}
```

---

## Performance Optimization

### 1. Code Splitting
Lazy load components to reduce initial bundle size.

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 2. Memoization
Prevent unnecessary re-renders with React.memo and useMemo.

```tsx
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  return <div>{processed}</div>;
});
```

### 3. Virtual Lists
Use virtualization for long lists.

```tsx
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>{items[index]}</div>
      )}
    </FixedSizeList>
  );
}
```

### 4. Image Optimization
Optimize images with proper sizing and lazy loading.

```tsx
<img
  src="/image.jpg"
  alt="Description"
  loading="lazy"
  width={800}
  height={600}
/>
```

---

## Component Library Structure

### Recommended File Structure
```
src/
├── components/
│   ├── ui/               # Base UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   ├── Card/
│   │   └── Input/
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── styles/
│   ├── material-design-3.css
│   └── tailwind.css
└── hooks/                # Custom hooks
```

### Component Documentation Template
```tsx
/**
 * Button Component
 * 
 * A reusable button component following Material Design 3 guidelines.
 * 
 * @example
 * ```tsx
 * <Button variant="filled" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 * 
 * @param variant - Style variant: 'filled' | 'outlined' | 'text'
 * @param size - Size variant: 'sm' | 'md' | 'lg'
 * @param isLoading - Show loading state
 * @param disabled - Disable button
 * @param fullWidth - Take full width of container
 */
export function Button({ ... }) { ... }
```

---

## Testing Strategy

### 1. Unit Tests
Test component logic and behavior.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Accessibility Tests
Ensure components meet a11y standards.

```tsx
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 3. Visual Regression Tests
Catch visual changes with snapshot testing.

```tsx
it('matches snapshot', () => {
  const { container } = render(<Button variant="filled">Click</Button>);
  expect(container).toMatchSnapshot();
});
```

---

## Conclusion

Building great reusable components requires:
1. Strong design principles and consistent patterns
2. Adherence to accessibility guidelines
3. Performance optimization
4. Comprehensive documentation
5. Thorough testing

By following Material Design 3 guidelines and modern React patterns, we create components that are maintainable, accessible, and delightful to use.

## References
- [Material Design 3 Guidelines](https://m3.material.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)

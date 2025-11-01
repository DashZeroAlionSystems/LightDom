# LightDom Design System Rules & Guidelines

## Required Reading
All developers must read and follow these guidelines when working on UI components.

---

## Core Design Rules

### Rule 1: Always Use Material Design 3 Classes
Every component MUST use MD3 utility classes from our design system.

**✅ DO:**
```tsx
<button className="md3-button md3-button-filled">Submit</button>
<div className="md3-card md3-elevation-1">Content</div>
<h1 className="md3-headline-large">Headline</h1>
```

**❌ DON'T:**
```tsx
<button style={{ backgroundColor: '#7c3aed', padding: '10px' }}>Submit</button>
<div style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Content</div>
```

### Rule 2: Use Tailwind Utilities for Layout
Use Tailwind's utility classes for flexbox, grid, spacing, and responsive design.

**✅ DO:**
```tsx
<div className="flex items-center gap-4 p-6 md:p-8 lg:grid lg:grid-cols-3">
  <div className="flex-1">Content</div>
</div>
```

**❌ DON'T:**
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
  <div style={{ flex: 1 }}>Content</div>
</div>
```

### Rule 3: Consistent Color Usage
Always use color tokens from the theme, never hardcoded hex values.

**✅ DO:**
```tsx
<div className="bg-primary-600 text-on-primary">
<div className="bg-surface text-on-surface">
<div className="bg-error-500 text-white">
```

**❌ DON'T:**
```tsx
<div style={{ backgroundColor: '#7c3aed', color: '#ffffff' }}>
<div className="bg-[#151A31] text-[#FFFFFF]">
```

### Rule 4: Typography Scale
Use MD3 typography classes for all text elements.

**✅ DO:**
```tsx
<h1 className="md3-display-large">Hero Title</h1>
<h2 className="md3-headline-medium">Section Header</h2>
<p className="md3-body-medium">Body text</p>
<button className="md3-label-large">Button Text</button>
```

**❌ DON'T:**
```tsx
<h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>Hero Title</h1>
<p className="text-[14px] leading-[20px]">Body text</p>
```

### Rule 5: Elevation System
Use the 6-level elevation system (0-5) for depth and hierarchy.

**✅ DO:**
```tsx
<div className="md3-card md3-elevation-1">Card at rest</div>
<div className="md3-card md3-elevation-2 hover:md3-elevation-3">Interactive card</div>
```

**❌ DON'T:**
```tsx
<div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>Card</div>
```

### Rule 6: Spacing System
Use the 4px-based spacing scale consistently.

**Spacing Scale:**
- `md3-spacing-xs` = 4px
- `md3-spacing-sm` = 8px
- `md3-spacing-md` = 16px (default)
- `md3-spacing-lg` = 24px
- `md3-spacing-xl` = 32px
- `md3-spacing-xxl` = 48px

**✅ DO:**
```tsx
<div className="md3-p-md md3-gap-lg">
<div className="p-6 gap-4"> {/* Tailwind equivalents */}
```

**❌ DON'T:**
```tsx
<div style={{ padding: '15px', gap: '18px' }}>
<div className="p-[15px] gap-[18px]">
```

### Rule 7: Border Radius
Use the shape scale for consistent border radius values.

**Shape Scale:**
- `md3-rounded-xs` = 4px
- `md3-rounded-sm` = 8px
- `md3-rounded-md` = 12px (default for cards)
- `md3-rounded-lg` = 16px
- `md3-rounded-xl` = 20px
- `md3-rounded-xxl` = 28px
- `md3-rounded-full` = 9999px (pills, avatars)

**✅ DO:**
```tsx
<button className="md3-rounded-sm">Button</button>
<div className="md3-card md3-rounded-md">Card</div>
<Avatar className="md3-rounded-full" />
```

**❌ DON'T:**
```tsx
<button style={{ borderRadius: '6px' }}>Button</button>
<div className="rounded-[10px]">Card</div>
```

### Rule 8: Animation & Transitions
Use MD3 easing curves and duration guidelines.

**Easing Curves:**
- `transition-emphasized` - Main curve for most animations
- `transition-standard` - Default transitions
- `transition-decelerate` - Enter animations
- `transition-accelerate` - Exit animations

**Duration Guidelines:**
- Simple: 100-150ms
- Medium: 250-300ms
- Complex: 400-500ms

**✅ DO:**
```tsx
<button className="transition-all duration-300 ease-emphasized hover:md3-elevation-2">
<div className="md3-fade-in">Animated content</div>
```

**❌ DON'T:**
```tsx
<button style={{ transition: 'all 0.5s cubic-bezier(0.1, 0.2, 0.3, 0.4)' }}>
```

---

## Component Development Rules

### Rule 9: Component Composition
Build components using composition, not configuration.

**✅ DO:**
```tsx
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**❌ DON'T:**
```tsx
<Card
  config={{
    header: { title: "Title", description: "Description" },
    content: "Content goes here",
    footer: { actions: [{ label: "Action", onClick: handleClick }] },
    variant: "elevated",
    padding: "lg"
  }}
/>
```

### Rule 10: Prop Naming Conventions
Follow consistent prop naming across all components.

**Standard Props:**
- `variant`: Style variations
- `size`: Size variations
- `disabled`: Disabled state
- `isLoading`: Loading state
- `error`: Error state or message
- `fullWidth`: Full width behavior
- `className`: Additional CSS classes
- `children`: Component content

**✅ DO:**
```tsx
<Button variant="filled" size="lg" isLoading disabled={!isValid}>
  Submit
</Button>
```

**❌ DON'T:**
```tsx
<Button type="filled" btnSize="lg" loading disabledState={!isValid}>
  Submit
</Button>
```

### Rule 11: TypeScript Types
All components MUST have proper TypeScript types.

**✅ DO:**
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'filled',
  size = 'md',
  isLoading,
  fullWidth,
  children,
  className,
  ...props
}: ButtonProps) {
  // Component implementation
}
```

**❌ DON'T:**
```tsx
export function Button(props: any) {
  // Component implementation
}
```

### Rule 12: Accessibility Requirements
ALL components must be accessible (WCAG 2.1 AA compliant).

**Required Practices:**
- Use semantic HTML elements
- Provide ARIA attributes when needed
- Ensure keyboard navigation
- Maintain proper focus management
- Meet color contrast requirements (4.5:1 for normal text)

**✅ DO:**
```tsx
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
  disabled={isDisabled}
  className="md3-button"
>
  <CloseIcon aria-hidden="true" />
</button>

<input
  aria-invalid={!!error}
  aria-describedby={error ? 'error-message' : undefined}
  className="md3-input"
/>
{error && <p id="error-message" role="alert">{error}</p>}
```

**❌ DON'T:**
```tsx
<div onClick={handleClose}>X</div>
<input style={{ color: '#ccc', backgroundColor: '#ddd' }} /> {/* Poor contrast */}
```

### Rule 13: Ref Forwarding
Interactive components should forward refs.

**✅ DO:**
```tsx
import { forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`md3-input ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
```

**❌ DON'T:**
```tsx
export function Input({ className, ...props }) {
  return <input className={`md3-input ${className}`} {...props} />;
}
```

### Rule 14: Loading & Error States
All interactive components must handle loading and error states.

**✅ DO:**
```tsx
<Button isLoading={isSubmitting} disabled={isSubmitting}>
  {isLoading ? <Spinner className="mr-2" /> : <Icon className="mr-2" />}
  Submit
</Button>

<Input
  error={formErrors.email}
  disabled={isSubmitting}
  aria-invalid={!!formErrors.email}
/>
{formErrors.email && (
  <p className="md3-label-small text-error-500" role="alert">
    {formErrors.email}
  </p>
)}
```

**❌ DON'T:**
```tsx
<button>{isLoading && 'Loading...'} Submit</button>
<input style={{ borderColor: error ? 'red' : 'gray' }} />
```

---

## File Organization Rules

### Rule 15: Component File Structure
Each component should have its own directory with test and story files.

```
Button/
├── Button.tsx          # Component implementation
├── Button.test.tsx     # Unit tests
├── Button.stories.tsx  # Storybook stories (if applicable)
└── index.ts            # Barrel export
```

### Rule 16: Import Order
Organize imports in a consistent order.

**✅ DO:**
```tsx
// 1. React imports
import { forwardRef, useState } from 'react';

// 2. Third-party imports
import { cva } from 'class-variance-authority';

// 3. Internal imports (components)
import { Icon } from '@/components/ui/Icon';

// 4. Internal imports (hooks, utils)
import { cn } from '@/lib/utils';

// 5. Type imports
import type { ButtonProps } from './Button.types';

// 6. Styles
import './Button.css';
```

### Rule 17: Documentation
Every component must have JSDoc documentation.

**✅ DO:**
```tsx
/**
 * Button component following Material Design 3 guidelines.
 * 
 * Supports three variants (filled, outlined, text), three sizes (sm, md, lg),
 * and includes loading and disabled states.
 * 
 * @example
 * ```tsx
 * <Button variant="filled" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 * 
 * @param {ButtonProps} props - Button properties
 * @param {'filled' | 'outlined' | 'text'} props.variant - Button style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {boolean} props.isLoading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Take full container width
 */
export function Button({ ... }) { ... }
```

---

## Responsive Design Rules

### Rule 18: Mobile-First Approach
Always design for mobile first, then enhance for larger screens.

**✅ DO:**
```tsx
<div className="
  grid
  grid-cols-1
  gap-4
  p-4
  md:grid-cols-2
  md:gap-6
  md:p-6
  lg:grid-cols-3
  lg:gap-8
  lg:p-8
">
  {/* Content */}
</div>
```

**❌ DON'T:**
```tsx
<div className="lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
```

### Rule 19: Breakpoint Usage
Use Tailwind's standard breakpoints consistently.

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## Testing Rules

### Rule 20: Component Testing
Every component must have unit tests covering:
- Rendering behavior
- User interactions
- Accessibility
- Edge cases

**✅ DO:**
```tsx
describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## Performance Rules

### Rule 21: Code Splitting
Use lazy loading for large components and routes.

**✅ DO:**
```tsx
import { lazy, Suspense } from 'react';

const HeavyDashboard = lazy(() => import('./HeavyDashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyDashboard />
    </Suspense>
  );
}
```

### Rule 22: Memoization
Use React.memo and useMemo appropriately to prevent unnecessary re-renders.

**✅ DO:**
```tsx
import { memo, useMemo } from 'react';

export const ExpensiveList = memo(({ items, filter }) => {
  const filteredItems = useMemo(
    () => items.filter(filter),
    [items, filter]
  );
  
  return <ul>{filteredItems.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
});
```

---

## Git Commit Rules

### Rule 23: Commit Message Format
Use conventional commit format for all commits.

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ui): add Material Design 3 Button component

Implement Button component following MD3 guidelines with three variants
(filled, outlined, text), three sizes, and loading states.

Closes #123
```

```
fix(input): correct focus ring color

Change focus ring from blue to primary-600 to match design system.
```

---

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Follows all design system rules
- [ ] Uses MD3 and Tailwind classes correctly
- [ ] Has proper TypeScript types
- [ ] Includes comprehensive tests
- [ ] Meets accessibility standards
- [ ] Has JSDoc documentation
- [ ] Follows file organization conventions
- [ ] Uses semantic commit messages
- [ ] Has no console.log or debugging code
- [ ] Passes all linting checks

---

## Resources

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [UI/UX Patterns Research](./ui-ux-patterns.md)
- [Component Examples](../examples/)

---

**Last Updated:** January 2025  
**Version:** 1.0

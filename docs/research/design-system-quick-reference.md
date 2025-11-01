# Design System Quick Reference

A quick reference guide for common design system patterns and utilities.

## Installation

```bash
npm install class-variance-authority clsx tailwind-merge
```

## Utility Setup

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Common Patterns

### Button Variants

```tsx
import { cva } from 'class-variance-authority';

const button = cva('base-styles', {
  variants: {
    variant: {
      filled: 'bg-gradient-primary text-on-primary',
      outlined: 'border border-outline text-primary',
      text: 'text-primary hover:bg-primary/8',
    },
    size: {
      sm: 'h-8 px-3 text-label-md',
      md: 'h-10 px-6 text-label-lg',
      lg: 'h-14 px-8 text-label-lg',
    },
  },
  defaultVariants: { variant: 'filled', size: 'md' },
});
```

### Compound Components

```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>
```

## Design Tokens

### Colors

| Token | Usage | Example |
|-------|-------|---------|
| `primary` | Primary brand color | `bg-primary text-on-primary` |
| `secondary` | Secondary color | `bg-secondary text-on-secondary` |
| `surface` | Surface backgrounds | `bg-surface text-on-surface` |
| `error` | Error states | `text-error border-error` |
| `success` | Success states | `bg-success text-white` |

### Typography

| Scale | Size | Usage |
|-------|------|-------|
| `display-lg` | 57px | Hero headings |
| `headline-md` | 28px | Section headings |
| `title-lg` | 22px | Card titles |
| `body-md` | 14px | Body text |
| `label-lg` | 14px | Button labels |

### Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| `level-1` | Subtle | Cards, chips |
| `level-2` | Moderate | Dropdowns |
| `level-3` | High | FABs, dialogs |
| `level-4` | Higher | Modal overlays |
| `level-5` | Highest | Top-level modals |

### Spacing

```tsx
// Use Tailwind's spacing scale (4px base)
p-4   // 16px padding
m-6   // 24px margin
gap-8 // 32px gap
```

### Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `rounded-xs` | 4px | Chips |
| `rounded-sm` | 8px | Buttons |
| `rounded-md` | 12px | Cards |
| `rounded-lg` | 16px | Large cards |
| `rounded-xl` | 28px | Dialogs |
| `rounded-full` | 9999px | Pills, FABs |

## Common Component Snippets

### Button with Icon

```tsx
<Button leftIcon={<Plus />}>Add Item</Button>
<Button rightIcon={<ArrowRight />}>Continue</Button>
<Button isLoading>Submitting...</Button>
```

### Card with Actions

```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
  <CardFooter className="justify-end gap-2">
    <Button variant="text">Cancel</Button>
    <Button>Confirm</Button>
  </CardFooter>
</Card>
```

### Form Input

```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  leftIcon={<Mail />}
  error={errors.email}
/>
```

### Badge

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

### FAB

```tsx
<FAB icon={<Plus />} />
<FAB icon={<Edit />} label="Edit" />
<FAB variant="secondary" size="large" icon={<Settings />} />
```

## Animation Classes

```tsx
// Entrance
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
<div className="animate-scale-in">Scales in</div>

// With custom timing
<div className="animate-fade-in duration-medium-3 ease-emphasized">
  Custom animation
</div>
```

## State Layers (Hover/Focus)

```tsx
// 8% overlay on hover
<div className="hover:bg-primary/8">Hover effect</div>

// Focus ring
<button className="focus-visible:ring-2 focus-visible:ring-border-focus">
  Focusable
</button>

// Combined states
<div className="hover:bg-primary/8 active:bg-primary/12 transition-colors">
  Interactive element
</div>
```

## Dark Mode

```tsx
// Basic dark mode
<div className="bg-white dark:bg-surface-dim">
  Supports dark mode
</div>

// Conditional styling
<p className="text-gray-900 dark:text-gray-100">
  Text with dark mode
</p>
```

## Accessibility

```tsx
// ARIA labels
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Screen reader only text
<span className="sr-only">Loading...</span>

// Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
>
  Keyboard accessible
</div>
```

## Common Layouts

### Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Flex

```tsx
<div className="flex items-center justify-between gap-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

### Stack

```tsx
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Center

```tsx
<div className="flex items-center justify-center min-h-screen">
  <Card>Centered content</Card>
</div>
```

## Performance Tips

```tsx
// Memoize expensive components
const MemoCard = memo(Card);

// Lazy load heavy components
const Chart = lazy(() => import('./Chart'));

// Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual';
```

## Testing

```tsx
import { render, screen } from '@testing-library/react';

test('button renders correctly', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## Resources

- [Full Documentation](./material-design-3-guidelines.md)
- [Component Patterns](./ui-ux-component-patterns.md)
- [Tailwind Guide](./tailwind-best-practices.md)
- [Implementation Guide](../DESIGN_SYSTEM_IMPLEMENTATION.md)

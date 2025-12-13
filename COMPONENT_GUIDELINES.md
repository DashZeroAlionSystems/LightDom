# LightDom Component Development Guidelines

> **Version:** 1.0.0  
> **Last Updated:** November 2025  
> **Design System:** Material Design 3.0 + Atomic Design Methodology

---

## Table of Contents

1. [Introduction](#introduction)
2. [Atomic Design Principles](#atomic-design-principles)
3. [Component Categories](#component-categories)
4. [Component Structure](#component-structure)
5. [Storybook Requirements](#storybook-requirements)
6. [Usage Examples](#usage-examples)
7. [Accessibility Standards](#accessibility-standards)
8. [Best Practices](#best-practices)

---

## Introduction

This document establishes the component development rules and guidelines for the LightDom platform. Following these guidelines ensures consistency, maintainability, and high-quality components across the entire application.

### Core Principles

1. **Atomic Design** - Build from atoms to pages systematically
2. **Material Design 3** - Follow MD3 specifications for visual consistency
3. **TypeScript First** - All components must be fully typed
4. **Accessibility** - WCAG 2.1 AA compliance required
5. **Documentation** - Every component requires Storybook stories

---

## Atomic Design Principles

We follow [Brad Frost's Atomic Design](https://atomicdesign.bradfrost.com/) methodology to create a hierarchical component system.

### Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                          PAGES                               │
│   Complete page layouts composed of organisms and templates  │
├─────────────────────────────────────────────────────────────┤
│                        TEMPLATES                             │
│   Page-level structures that place organisms in context     │
├─────────────────────────────────────────────────────────────┤
│                        ORGANISMS                             │
│   Complex components composed of molecules and atoms         │
│   Examples: Navigation, Card, Form, Modal                    │
├─────────────────────────────────────────────────────────────┤
│                        MOLECULES                             │
│   Simple components composed of atoms working together       │
│   Examples: SearchField, FormGroup, ButtonGroup              │
├─────────────────────────────────────────────────────────────┤
│                          ATOMS                               │
│   Basic building blocks - indivisible components             │
│   Examples: Button, Input, Badge, Icon, Text                 │
└─────────────────────────────────────────────────────────────┘
```

### Atom Characteristics

Atoms are the **fundamental building blocks** of our design system:

| Property | Description |
|----------|-------------|
| **Indivisible** | Cannot be broken down into smaller functional units |
| **Self-Contained** | No dependencies on other atoms |
| **Reusable** | Used across multiple contexts |
| **Composable** | Can combine to form molecules |
| **Well-Defined** | Clear purpose and behavior |

**Atom Examples:**
- `Button` - Action trigger
- `Input` - Text entry
- `Badge` - Status indicator
- `Icon` - Visual symbol
- `Text` - Typography element
- `Avatar` - User representation

### Molecule Characteristics

Molecules are **simple groups of atoms** functioning as a unit:

| Property | Description |
|----------|-------------|
| **Composition** | Built from 2+ atoms |
| **Single Purpose** | One clear function |
| **Reusable** | Used in multiple organisms |

**Molecule Examples:**
- `SearchField` = Input + Button + Icon
- `FormGroup` = Label + Input + ErrorText
- `ButtonGroup` = Button + Button + ...
- `NavItem` = Icon + Text + Badge

### Organism Characteristics

Organisms are **complex, distinct sections** of an interface:

| Property | Description |
|----------|-------------|
| **Self-Sufficient** | Complete functional units |
| **Context-Aware** | May include business logic |
| **Composable** | Combined to create templates |

**Organism Examples:**
- `Header` - Site navigation and branding
- `Sidebar` - Navigation menu
- `Card` - Content container
- `Modal` - Dialog overlay
- `Form` - Complete input forms

---

## Component Categories

### Atoms (`src/components/atoms/`)

```
atoms/
├── Button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   ├── Button.test.tsx
│   ├── Button.schema.ts
│   └── index.ts
├── Input/
├── Badge/
├── Icon/
├── Text/
├── Avatar/
├── Checkbox/
├── Radio/
├── Switch/
├── Spinner/
├── Divider/
└── Tooltip/
```

### Molecules (`src/components/molecules/`)

```
molecules/
├── SearchField/
├── FormGroup/
├── ButtonGroup/
├── NavItem/
├── Breadcrumb/
├── Pagination/
├── Alert/
├── Toast/
├── Dropdown/
└── Tabs/
```

### Organisms (`src/components/organisms/`)

```
organisms/
├── Header/
├── Sidebar/
├── Footer/
├── Card/
├── Modal/
├── Form/
├── Table/
├── DataGrid/
├── Navigation/
└── Dashboard/
```

---

## Component Structure

### Required Files

Every component **must** include:

```
ComponentName/
├── ComponentName.tsx          # Main component implementation
├── ComponentName.types.ts     # TypeScript interfaces
├── ComponentName.test.tsx     # Unit tests
├── ComponentName.stories.tsx  # Storybook stories (in src/stories/)
└── index.ts                   # Re-exports
```

### Component Template

```typescript
// ComponentName.tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { ComponentNameProps } from './ComponentName.types';

/**
 * ComponentName
 * 
 * @description Brief description of the component
 * @category Atom | Molecule | Organism
 * @example
 * ```tsx
 * <ComponentName variant="primary" size="md">
 *   Content
 * </ComponentName>
 * ```
 */

const componentVariants = cva(
  // Base styles
  'base-classes',
  {
    variants: {
      variant: {
        primary: 'variant-classes',
        secondary: 'variant-classes',
      },
      size: {
        sm: 'size-classes',
        md: 'size-classes',
        lg: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

### Types Template

```typescript
// ComponentName.types.ts
import type { VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';
import type { componentVariants } from './ComponentName'; // Import from component file

/**
 * ComponentName Props
 * @category Atom | Molecule | Organism
 */
export interface ComponentNameProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  /** Component children content */
  children?: ReactNode;
  /** Visual variant of the component */
  variant?: 'primary' | 'secondary';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}
```

---

## Storybook Requirements

### Story File Structure

Every component **must** have a corresponding story file in `src/stories/`:

```
src/stories/
├── atoms/
│   ├── Button/
│   │   └── Button.stories.tsx
│   └── Input/
│       └── Input.stories.tsx
├── molecules/
│   └── SearchField/
│       └── SearchField.stories.tsx
└── organisms/
    └── Header/
        └── Header.stories.tsx
```

### Required Story Types

Each component story file **must** include:

#### 1. Default Story
```typescript
export const Default: Story = {
  args: {
    children: 'Default content',
  },
};
```

#### 2. All Variants Story
```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="filled">Filled</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </div>
  ),
};
```

#### 3. All Sizes Story
```typescript
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
```

#### 4. States Story
```typescript
export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading</Button>
    </div>
  ),
};
```

#### 5. Interactive Playground Story (with controls)
```typescript
export const Playground: Story = {
  args: {
    children: 'Playground Button',
    variant: 'filled',
    size: 'md',
  },
};
```

### Story Meta Configuration

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '@/components/atoms/ComponentName';

const meta: Meta<typeof ComponentName> = {
  // Category path: Atoms/Molecules/Organisms
  title: 'Atoms/ComponentName',
  component: ComponentName,
  
  // Auto-generate documentation
  tags: ['autodocs'],
  
  // Story layout
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
    docs: {
      description: {
        component: 'Component description for documentation.',
      },
    },
  },
  
  // Control definitions
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Visual variant of the component',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    isLoading: {
      control: 'boolean',
    },
    onClick: {
      action: 'clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;
```

### Story Documentation Best Practices

1. **Use `autodocs`** - Enable automatic documentation generation
2. **Add descriptions** - Document component purpose and usage
3. **Include examples** - Show real-world use cases
4. **Test accessibility** - Verify keyboard navigation and screen readers
5. **Show responsive behavior** - Test across viewport sizes

---

## Usage Examples

### Atom: Button

```typescript
// Basic usage
<Button variant="filled">Click Me</Button>

// With icon
<Button variant="outlined" leftIcon={<PlusIcon />}>
  Add Item
</Button>

// Loading state
<Button variant="filled" isLoading>
  Saving...
</Button>

// Full width
<Button variant="filled" fullWidth>
  Submit Form
</Button>
```

### Molecule: SearchField

```typescript
// Basic search
<SearchField 
  placeholder="Search..."
  onSearch={handleSearch}
/>

// With filters
<SearchField 
  placeholder="Search products..."
  onSearch={handleSearch}
  filters={['Category', 'Price', 'Rating']}
/>
```

### Organism: Card

```typescript
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
    <CardDescription>Overview of your analytics</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>

// Interactive card
<Card interactive onClick={handleClick}>
  <CardContent>
    Clickable card content
  </CardContent>
</Card>
```

---

## Accessibility Standards

### Required Accessibility Features

All components **must** implement:

| Feature | Requirement |
|---------|-------------|
| **Keyboard Navigation** | Full keyboard accessibility with Tab, Enter, Space, Arrow keys |
| **Focus States** | Visible focus indicators (2px outline) |
| **ARIA Labels** | Proper aria-label, aria-describedby, aria-labelledby |
| **Color Contrast** | Minimum 4.5:1 for text, 3:1 for UI elements |
| **Screen Reader Support** | Meaningful announcements for state changes |
| **Reduced Motion** | Respect `prefers-reduced-motion` preference |

### Accessibility Implementation

```typescript
// Button with proper accessibility
<button
  className={cn(buttonVariants({ variant, size }))}
  disabled={disabled || isLoading}
  aria-busy={isLoading}
  aria-disabled={disabled}
  aria-label={ariaLabel}
  {...props}
>
  {isLoading && <Spinner aria-hidden="true" />}
  <span className={isLoading ? 'sr-only' : undefined}>
    {children}
  </span>
</button>
```

### Focus Styles

```css
/* Required focus styles */
.focus-visible:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Best Practices

### Component Development Checklist

- [ ] **TypeScript types** - All props fully typed
- [ ] **forwardRef** - Support ref forwarding for DOM access
- [ ] **className merging** - Accept and merge custom classNames
- [ ] **Prop spreading** - Spread remaining props to root element
- [ ] **displayName** - Set component displayName for debugging
- [ ] **Default values** - Provide sensible defaults
- [ ] **Unit tests** - 80% coverage minimum
- [ ] **Storybook stories** - All required story types
- [ ] **Accessibility** - Keyboard, screen reader, contrast
- [ ] **Documentation** - JSDoc comments and examples

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `Button`, `SearchField` |
| **Props interfaces** | PascalCase + Props | `ButtonProps` |
| **Variants** | camelCase | `filled`, `outlined` |
| **CSS classes** | kebab-case | `btn-primary`, `card-header` |
| **Event handlers** | onAction | `onClick`, `onSearch` |
| **Boolean props** | is/has prefix | `isLoading`, `hasError` |

### Performance Guidelines

1. **Memoize expensive computations** - Use `useMemo`, `useCallback`
2. **Avoid inline objects** - Define outside component or memoize
3. **Lazy load organisms** - Code-split large components
4. **Optimize re-renders** - Use `React.memo` where appropriate
5. **Tree-shake exports** - Use named exports in index.ts

### Testing Requirements

```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant styles', () => {
    render(<Button variant="outlined">Outlined</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });

  it('is accessible', () => {
    render(<Button>Accessible</Button>);
    expect(screen.getByRole('button')).toBeVisible();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-hidden');
  });
});
```

---

## Related Documentation

- [STYLE_GUIDE.md](./STYLE_GUIDE.md) - Design tokens and visual standards
- [MATERIAL_DESIGN_STYLE_GUIDE.md](./MATERIAL_DESIGN_STYLE_GUIDE.md) - MD3 implementation
- [ATOMIC_COMPONENT_SCHEMAS.md](./ATOMIC_COMPONENT_SCHEMAS.md) - Schema definitions
- [COMPREHENSIVE_STORYBOOK_GUIDE.md](./COMPREHENSIVE_STORYBOOK_GUIDE.md) - Advanced Storybook patterns
- [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) - Scroll animations and utilities

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 2025 | Initial guidelines document |

---

*This is a living document. Updates should be discussed with the design system team before implementation.*

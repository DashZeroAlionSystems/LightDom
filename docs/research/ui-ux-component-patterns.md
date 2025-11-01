# UI/UX Component Patterns Research

## Overview
This document outlines industry best practices for creating reusable, maintainable, and accessible UI components based on research from leading design systems and frameworks.

## Core Principles for Reusable Components

### 1. Single Responsibility Principle
Each component should do one thing well. Complex components should be composed of smaller, focused components.

**Example:**
```tsx
// ❌ Bad: Button doing too much
<Button onClick={handleClick} icon={<Icon />} loading badge={5} tooltip="Click me">
  Submit
</Button>

// ✅ Good: Composed components
<Tooltip content="Click me">
  <Badge count={5}>
    <Button onClick={handleClick} icon={<Icon />}>
      Submit
    </Button>
  </Badge>
</Tooltip>
```

### 2. Composition over Configuration
Prefer component composition over complex prop APIs. Use children and slots for flexibility.

**Pattern:**
```tsx
// Flexible composition pattern
<Card>
  <Card.Header>
    <Card.Title>Dashboard</Card.Title>
    <Card.Actions>
      <Button>Edit</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Content>
    Content goes here
  </Card.Content>
  <Card.Footer>
    Footer content
  </Card.Footer>
</Card>
```

### 3. Prop Interface Design
Design props that are intuitive, type-safe, and follow common patterns.

**Best Practices:**
```tsx
interface ButtonProps {
  // Use semantic variants over multiple booleans
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  
  // Use meaningful names
  isLoading?: boolean;  // ✅ Clear
  disabled?: boolean;   // ✅ Standard
  
  // Avoid ambiguous props
  type?: string;  // ❌ Too generic
  
  // Support both controlled and uncontrolled modes
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  
  // Include accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

### 4. Controlled vs Uncontrolled Components
Support both patterns for maximum flexibility.

**Pattern:**
```tsx
function Input({ value, defaultValue, onChange }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  
  const currentValue = isControlled ? value : internalValue;
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e.target.value);
  };
  
  return <input value={currentValue} onChange={handleChange} />;
}
```

## Component Architecture Patterns

### 1. Compound Components Pattern
Use for components with related sub-components that need to share state.

```tsx
const CardContext = createContext<CardContextValue | null>(null);

function Card({ children, variant = 'default' }: CardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <CardContext.Provider value={{ variant, isExpanded, setIsExpanded }}>
      <div className={cn('card', `card--${variant}`)}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

Card.Header = function CardHeader({ children }: CardHeaderProps) {
  const context = useContext(CardContext);
  return <div className="card-header">{children}</div>;
};

Card.Content = function CardContent({ children }: CardContentProps) {
  return <div className="card-content">{children}</div>;
};
```

### 2. Render Props Pattern
For advanced customization and logic sharing.

```tsx
interface DataTableProps<T> {
  data: T[];
  renderRow: (item: T, index: number) => ReactNode;
  renderEmpty?: () => ReactNode;
  isLoading?: boolean;
}

function DataTable<T>({ data, renderRow, renderEmpty, isLoading }: DataTableProps<T>) {
  if (isLoading) return <Spinner />;
  if (data.length === 0) return renderEmpty?.() ?? <EmptyState />;
  
  return (
    <div className="data-table">
      {data.map((item, index) => renderRow(item, index))}
    </div>
  );
}
```

### 3. Polymorphic Components Pattern
Components that can render as different HTML elements.

```tsx
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
} & React.ComponentPropsWithoutRef<E>;

function Text<E extends React.ElementType = 'span'>({
  as,
  children,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || 'span';
  return (
    <Component className={cn('text', className)} {...props}>
      {children}
    </Component>
  );
}

// Usage
<Text as="h1">Heading</Text>
<Text as="p">Paragraph</Text>
<Text as={Link} to="/home">Link</Text>
```

### 4. Slot Pattern
For flexible content placement.

```tsx
interface LayoutProps {
  slots: {
    header?: ReactNode;
    sidebar?: ReactNode;
    content: ReactNode;
    footer?: ReactNode;
  };
}

function Layout({ slots }: LayoutProps) {
  return (
    <div className="layout">
      {slots.header && <header>{slots.header}</header>}
      <div className="layout-body">
        {slots.sidebar && <aside>{slots.sidebar}</aside>}
        <main>{slots.content}</main>
      </div>
      {slots.footer && <footer>{slots.footer}</footer>}
    </div>
  );
}
```

## State Management Patterns

### 1. State Reducer Pattern
For complex state logic.

```tsx
type State = {
  isOpen: boolean;
  selectedIndex: number;
  searchQuery: string;
};

type Action = 
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SELECT'; index: number }
  | { type: 'SEARCH'; query: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false, searchQuery: '' };
    case 'SELECT':
      return { ...state, selectedIndex: action.index, isOpen: false };
    case 'SEARCH':
      return { ...state, searchQuery: action.query };
    default:
      return state;
  }
}

function Dropdown() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Use state and dispatch
}
```

### 2. Custom Hooks for Logic Extraction
Extract reusable component logic into hooks.

```tsx
function useDisclosure(initialValue = false) {
  const [isOpen, setIsOpen] = useState(initialValue);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);
  
  return { isOpen, open, close, toggle };
}

function useForm<T>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  return { values, errors, setFieldValue, setFieldError };
}
```

## Styling Patterns

### 1. Variants with CVA (Class Variance Authority)
Type-safe variant management.

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-primary text-white hover:opacity-90',
        secondary: 'bg-surface text-text-primary border border-border',
        outline: 'border border-border hover:bg-surface',
        ghost: 'hover:bg-surface hover:text-text-primary',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & {
  children: ReactNode;
};

function Button({ variant, size, children, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} {...props}>
      {children}
    </button>
  );
}
```

### 2. Compound Tailwind Classes
Utility function for conditional classes.

```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-class',
  className
)} />
```

### 3. CSS Custom Properties for Dynamic Theming
```tsx
function Card({ accentColor }: CardProps) {
  return (
    <div 
      className="card"
      style={{ '--accent-color': accentColor } as CSSProperties}
    >
      {/* Card uses var(--accent-color) in CSS */}
    </div>
  );
}
```

## Performance Optimization Patterns

### 1. Memoization
```tsx
// Memoize expensive computations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  onItemClick(item.id);
}, [item.id, onItemClick]);

// Memoize components
const MemoizedListItem = memo(ListItem, (prev, next) => {
  return prev.id === next.id && prev.isSelected === next.isSelected;
});
```

### 2. Code Splitting
```tsx
// Lazy load heavy components
const Chart = lazy(() => import('./Chart'));
const Editor = lazy(() => import('./Editor'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <Chart data={data} />
    </Suspense>
  );
}
```

### 3. Virtual Scrolling
For large lists.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ListItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Accessibility Patterns

### 1. Keyboard Navigation
```tsx
function Menu({ items }: MenuProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        items[focusedIndex].onClick();
        break;
      case 'Escape':
        closeMenu();
        break;
    }
  };
  
  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <MenuItem
          key={item.id}
          {...item}
          isFocused={index === focusedIndex}
        />
      ))}
    </div>
  );
}
```

### 2. Focus Management
```tsx
function Modal({ isOpen, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);
  
  return isOpen ? (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  ) : null;
}
```

### 3. ARIA Patterns
```tsx
function Tabs({ tabs, defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div>
      <div role="tablist" aria-label="Main tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== index}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

## Testing Patterns

### 1. Component Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### 2. Integration Testing
```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from './useForm';

describe('useForm', () => {
  it('updates field value', () => {
    const { result } = renderHook(() => useForm({ email: '' }));
    
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });
    
    expect(result.current.values.email).toBe('test@example.com');
  });
});
```

## Documentation Patterns

### 1. Prop Documentation
```tsx
interface ButtonProps {
  /**
   * The visual style variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  
  /**
   * The size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Shows a loading spinner and disables the button
   */
  isLoading?: boolean;
  
  /**
   * Icon to display before the button text
   * @example <Button icon={<PlusIcon />}>Add Item</Button>
   */
  icon?: ReactNode;
}
```

### 2. Storybook Stories
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    icon: <PlusIcon />,
    children: 'Add Item',
  },
};
```

## Best Practices Summary

### DO's ✅
- Keep components focused and single-purpose
- Use composition for flexibility
- Provide sensible defaults
- Support both controlled and uncontrolled modes
- Implement proper accessibility
- Use TypeScript for type safety
- Document props and usage
- Write tests for critical functionality
- Optimize for performance with memoization
- Follow consistent naming conventions

### DON'Ts ❌
- Create overly complex prop APIs
- Couple components tightly together
- Ignore accessibility requirements
- Skip error handling
- Use inline styles without CSS-in-JS
- Forget to handle edge cases
- Neglect loading and error states
- Create prop drilling hierarchies
- Skip performance optimization for large lists
- Use global state unnecessarily

## Resources

- [React Patterns](https://reactpatterns.com/)
- [Component Party](https://component.party/) - Cross-framework patterns
- [Radix UI Patterns](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Headless UI](https://headlessui.com/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

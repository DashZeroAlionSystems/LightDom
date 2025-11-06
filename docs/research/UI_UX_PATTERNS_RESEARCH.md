# UI/UX Patterns Research Guide

## Research Date: 2025-10-28

## Table of Contents
1. [Component Design Principles](#component-design-principles)
2. [Material Design 3 Guidelines](#material-design-3-guidelines)
3. [Tailwind CSS Integration](#tailwind-css-integration)
4. [Reusable Component Patterns](#reusable-component-patterns)
5. [Accessibility Standards](#accessibility-standards)
6. [Design Tokens](#design-tokens)
7. [Animation & Motion](#animation--motion)

---

## Component Design Principles

### 1. Atomic Design Methodology
Components should follow a hierarchical structure:

- **Atoms**: Basic building blocks (buttons, inputs, labels, icons)
- **Molecules**: Simple groups of atoms (search bar, form field with label)
- **Organisms**: Complex UI components (navigation bar, card with multiple elements)
- **Templates**: Page-level layouts without content
- **Pages**: Specific instances of templates with real content

### 2. SOLID Principles for Components

- **Single Responsibility**: Each component does one thing well
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Components can be replaced with variants
- **Interface Segregation**: Clean, minimal prop interfaces
- **Dependency Inversion**: Depend on abstractions, not implementations

### 3. Component Composition Patterns

```typescript
// Container/Presentational Pattern
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Compound Component Pattern
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>

// Render Props Pattern
<DataFetcher url="/api/data">
  {({ data, loading, error }) => (
    loading ? <Spinner /> : <DataDisplay data={data} />
  )}
</DataFetcher>

// Custom Hooks Pattern
const useTheme = () => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  return { theme, toggleTheme };
}
```

---

## Material Design 3 Guidelines

### 1. Design Philosophy

Material Design 3 (Material You) focuses on:
- **Personal**: Adaptive color systems
- **Expressive**: Dynamic color schemes
- **Accessible**: WCAG 2.1 Level AA compliance

### 2. Color System

#### Dynamic Color Scheme
```typescript
// Tonal Palette Structure
interface TonalPalette {
  0: string;   // Pure black
  10: string;  // Darkest
  20: string;
  30: string;
  40: string;
  50: string;  // Medium
  60: string;
  70: string;
  80: string;
  90: string;
  95: string;
  99: string;  // Almost white
  100: string; // Pure white
}

// Material Design 3 Color Roles
interface ColorRoles {
  primary: string;           // Main brand color
  onPrimary: string;        // Text/icons on primary
  primaryContainer: string; // Less prominent primary
  onPrimaryContainer: string;
  
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}
```

### 3. Typography Scale

```typescript
const MaterialTypography = {
  displayLarge: {
    fontSize: '57px',
    lineHeight: '64px',
    fontWeight: 400,
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontSize: '45px',
    lineHeight: '52px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  displaySmall: {
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  titleLarge: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 500,
    letterSpacing: '0px',
  },
  titleMedium: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 500,
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0.4px',
  },
  labelLarge: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
};
```

### 4. Elevation & Shadows

```typescript
const MaterialElevation = {
  level0: 'none',
  level1: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
  level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',
  level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
};
```

### 5. Shape System

```typescript
const MaterialShapes = {
  none: '0px',
  extraSmall: '4px',
  small: '8px',
  medium: '12px',
  large: '16px',
  extraLarge: '28px',
  full: '9999px',
};
```

### 6. Spacing System (8px Grid)

```typescript
const MaterialSpacing = {
  0: '0px',
  1: '4px',   // 0.5 * base
  2: '8px',   // 1 * base
  3: '12px',  // 1.5 * base
  4: '16px',  // 2 * base
  5: '20px',  // 2.5 * base
  6: '24px',  // 3 * base
  7: '28px',  // 3.5 * base
  8: '32px',  // 4 * base
  10: '40px', // 5 * base
  12: '48px', // 6 * base
  16: '64px', // 8 * base
  20: '80px', // 10 * base
  24: '96px', // 12 * base
};
```

---

## Tailwind CSS Integration

### 1. Custom Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material Design 3 Colors
        primary: {
          DEFAULT: '#6750A4',
          container: '#EADDFF',
          onContainer: '#21005D',
        },
        secondary: {
          DEFAULT: '#625B71',
          container: '#E8DEF8',
          onContainer: '#1D192B',
        },
        tertiary: {
          DEFAULT: '#7D5260',
          container: '#FFD8E4',
          onContainer: '#31111D',
        },
        error: {
          DEFAULT: '#B3261E',
          container: '#F9DEDC',
          onContainer: '#410E0B',
        },
        surface: {
          DEFAULT: '#FFFBFE',
          variant: '#E7E0EC',
          dim: '#DED8E1',
          bright: '#FFFBFE',
          container: '#F3EDF7',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        display: ['Roboto Flex', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'elevation-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '28px',
      },
    },
  },
  plugins: [],
};
```

### 2. Utility Classes Best Practices

```tsx
// Use semantic class names
const Button = ({ variant = 'primary', size = 'md', children }) => {
  const baseClasses = 'rounded-full font-medium transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:shadow-elevation-2',
    secondary: 'bg-secondary-container text-secondary-onContainer',
    outline: 'border-2 border-outline text-primary',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </button>
  );
};
```

---

## Reusable Component Patterns

### 1. Component API Design

```typescript
// Well-designed component interface
interface CardProps {
  // Content
  title?: string;
  description?: string;
  children?: React.ReactNode;
  
  // Appearance
  variant?: 'elevated' | 'filled' | 'outlined';
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  
  // Interaction
  onClick?: () => void;
  onHover?: () => void;
  disabled?: boolean;
  
  // Layout
  width?: string | number;
  height?: string | number;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  
  // Accessibility
  ariaLabel?: string;
  role?: string;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
}
```

### 2. Form Components Pattern

```typescript
// Controlled Input Pattern
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  ...props
}) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium">{label}</label>}
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-4 py-2 rounded-md border ${error ? 'border-error' : 'border-outline'}`}
      {...props}
    />
    {(error || helperText) && (
      <span className={`text-xs ${error ? 'text-error' : 'text-on-surface-variant'}`}>
        {error || helperText}
      </span>
    )}
  </div>
);
```

### 3. Layout Components

```typescript
// Flexible Container Pattern
interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding = true,
  className = '',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };
  
  return (
    <div className={`
      ${maxWidthClasses[maxWidth]}
      ${padding ? 'px-4 md:px-6 lg:px-8' : ''}
      mx-auto
      ${className}
    `}>
      {children}
    </div>
  );
};
```

---

## Accessibility Standards

### 1. WCAG 2.1 Level AA Compliance

#### Color Contrast Requirements
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

#### Keyboard Navigation
```typescript
// Proper keyboard navigation
const Button = ({ onClick, children, ...props }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };
  
  return (
    <button
      onClick={onClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### ARIA Attributes
```typescript
// Accessible Modal
const Modal = ({ isOpen, onClose, title, children }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
    hidden={!isOpen}
  >
    <h2 id="modal-title">{title}</h2>
    <div id="modal-description">{children}</div>
    <button onClick={onClose} aria-label="Close modal">×</button>
  </div>
);
```

### 2. Focus Management

```typescript
// Focus trap for modals
const useFocusTrap = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current) return;
    
    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };
    
    ref.current.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      ref.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [ref]);
};
```

---

## Design Tokens

### 1. Token Structure

```typescript
// Central design tokens
export const DesignTokens = {
  color: {
    primary: {
      main: '#6750A4',
      light: '#EADDFF',
      dark: '#21005D',
      contrast: '#FFFFFF',
    },
    // ... more colors
  },
  typography: {
    fontFamily: {
      primary: 'Roboto, sans-serif',
      monospace: 'Roboto Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};
```

---

## Animation & Motion

### 1. Material Motion System

```typescript
// Motion tokens
export const MotionTokens = {
  duration: {
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    legacyDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    legacyAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
};

// Animation utilities
export const animations = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
};
```

### 2. Transition Patterns

```typescript
// Smooth transitions for interactive elements
const buttonTransition = {
  transition: 'all 200ms cubic-bezier(0.2, 0.0, 0, 1.0)',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
};
```

---

## Component Library Structure

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Icon/
│   │   └── ...
│   ├── molecules/
│   │   ├── FormField/
│   │   ├── SearchBar/
│   │   └── ...
│   ├── organisms/
│   │   ├── Navigation/
│   │   ├── Card/
│   │   └── ...
│   └── templates/
│       ├── DashboardLayout/
│       └── ...
├── styles/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── ...
│   ├── theme.ts
│   └── global.css
└── hooks/
    ├── useTheme.ts
    ├── useMediaQuery.ts
    └── ...
```

---

## Best Practices Summary

1. **Consistency**: Use design tokens throughout
2. **Accessibility**: WCAG 2.1 Level AA compliance
3. **Performance**: Lazy load components, optimize re-renders
4. **Responsiveness**: Mobile-first design approach
5. **Maintainability**: Clear component APIs, comprehensive documentation
6. **Testing**: Unit tests, integration tests, visual regression tests
7. **Documentation**: Storybook for component documentation
8. **Version Control**: Semantic versioning for component library

---

## References

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Patterns](https://reactpatterns.com/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)

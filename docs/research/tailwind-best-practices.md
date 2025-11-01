# Tailwind CSS Best Practices & Design System Integration

## Overview
Tailwind CSS is a utility-first CSS framework that enables rapid UI development. This guide covers best practices for creating scalable, maintainable design systems with Tailwind.

## Core Concepts

### Utility-First Methodology
Instead of writing custom CSS, compose designs using utility classes.

```tsx
// ❌ Traditional approach
<div className="card">
  <h2 className="card-title">Title</h2>
</div>

// Custom CSS
.card {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

// ✅ Tailwind approach
<div className="bg-white p-4 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold">Title</h2>
</div>
```

### Benefits
- **Consistency**: Design tokens enforced through utility classes
- **Maintainability**: No scattered CSS files
- **Performance**: Automatic tree-shaking removes unused styles
- **Rapid Development**: Build UIs without context switching
- **Responsive**: Built-in responsive modifiers

## Configuration Best Practices

### Extending the Theme
Always extend the default theme rather than overriding it.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // ✅ Extends default theme
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... full scale
          900: '#0c4a6e',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      // ❌ Don't override completely
      // colors: { ... } // This removes default colors
    },
  },
};
```

### Design Token Organization

```javascript
// tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
  theme: {
    extend: {
      colors: {
        // Semantic color naming
        primary: {
          DEFAULT: '#5865F2',
          50: '#EEF0FF',
          100: '#DDE1FF',
          // ... full palette
          900: '#1A1F4D',
        },
        secondary: colors.purple,
        accent: colors.blue,
        
        // State colors
        success: colors.green,
        warning: colors.yellow,
        error: colors.red,
        info: colors.sky,
        
        // Neutral colors
        gray: colors.slate,
        
        // Surface colors
        background: {
          primary: '#0A0E27',
          secondary: '#151A31',
          tertiary: '#1E2438',
          elevated: '#252B45',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      
      fontSize: {
        // Use semantic names with [size, lineHeight] tuples
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2' }],
        
        'heading-xl': ['2rem', { lineHeight: '1.3' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.4' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.5' }],
        
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        
        'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1.3', fontWeight: '500' }],
        'label-sm': ['0.625rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      
      spacing: {
        // Custom spacing scale
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      boxShadow: {
        'glow': '0 0 20px rgba(88, 101, 242, 0.4)',
        'glow-lg': '0 0 40px rgba(88, 101, 242, 0.6)',
        'glow-purple': '0 0 20px rgba(124, 92, 255, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(88, 101, 242, 0.2)',
      },
      
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5865F2 0%, #7C5CFF 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
};
```

## Component Patterns

### 1. Class Variance Authority (CVA)
Type-safe variant management for Tailwind components.

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define variants
const buttonVariants = cva(
  // Base styles (always applied)
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-primary text-white hover:opacity-90 shadow-md hover:shadow-lg',
        secondary: 'bg-background-secondary text-text-primary border border-border hover:bg-background-tertiary',
        outline: 'border border-border bg-transparent hover:bg-background-secondary',
        ghost: 'hover:bg-background-secondary hover:text-text-primary',
        destructive: 'bg-semantic-error text-white hover:bg-red-600 shadow-md',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    // Compound variants for specific combinations
    compoundVariants: [
      {
        variant: 'primary',
        size: 'lg',
        className: 'shadow-glow hover:shadow-glow-lg',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'lg',
    },
  }
);

// Export type
export type ButtonVariants = VariantProps<typeof buttonVariants>;

// Component
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant,
  size,
  rounded,
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, rounded }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
```

### 2. Responsive Component Pattern

```tsx
// Responsive card grid
function CardGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(item => (
        <Card key={item.id} {...item} />
      ))}
    </div>
  );
}

// Responsive typography
function ResponsiveHeading({ children }: Props) {
  return (
    <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
      {children}
    </h1>
  );
}

// Responsive layout
function ResponsiveLayout({ sidebar, content }: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="w-full lg:w-64">{sidebar}</aside>
      <main className="flex-1">{content}</main>
    </div>
  );
}
```

### 3. Dark Mode Pattern

```tsx
// Using class-based dark mode
function Card({ children }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg">
      {children}
    </div>
  );
}

// Dark mode provider
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'system',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### 4. Container Query Pattern

```tsx
// Using Tailwind's container queries
function AdaptiveCard({ title, description, image }: Props) {
  return (
    <div className="@container">
      <div className="flex flex-col @lg:flex-row gap-4 p-4">
        <img src={image} className="w-full @lg:w-48 rounded" />
        <div className="flex-1">
          <h3 className="text-lg @lg:text-xl font-bold">{title}</h3>
          <p className="text-sm @lg:text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}
```

## Advanced Patterns

### 1. Custom Utility Classes

```javascript
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, theme }) {
      // Add custom utilities
      addUtilities({
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
      
      // Add custom components
      addComponents({
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      });
    }),
  ],
};
```

### 2. Dynamic Classes with Template Literals

```tsx
// ❌ Don't use string interpolation (won't work with tree-shaking)
<div className={`text-${color}-500`} />

// ✅ Use complete class names
const colorClasses = {
  primary: 'text-primary-500',
  secondary: 'text-secondary-500',
  success: 'text-success-500',
};

<div className={colorClasses[color]} />

// Or use safelist in config for dynamic values
// tailwind.config.js
module.exports = {
  safelist: [
    'text-primary-500',
    'text-secondary-500',
    'bg-primary-500',
    'bg-secondary-500',
  ],
};
```

### 3. Group & Peer Modifiers

```tsx
// Group modifier - style children based on parent state
function Card({ children }: Props) {
  return (
    <div className="group p-6 hover:bg-gray-100 transition">
      <h3 className="group-hover:text-primary-600">Title</h3>
      <p className="text-gray-600 group-hover:text-gray-900">Description</p>
    </div>
  );
}

// Peer modifier - style element based on sibling state
function FormField({ label, id }: Props) {
  return (
    <div>
      <input
        id={id}
        className="peer w-full border rounded px-4 py-2 focus:border-primary-500"
      />
      <label
        htmlFor={id}
        className="peer-focus:text-primary-600 peer-focus:font-medium"
      >
        {label}
      </label>
    </div>
  );
}
```

### 4. Arbitrary Values

```tsx
// Use square brackets for one-off values
<div className="top-[117px]" />
<div className="bg-[#1da1f2]" />
<div className="grid-cols-[200px_1fr_1fr]" />
<div className="text-[clamp(1rem,5vw,3rem)]" />

// With modifiers
<div className="lg:top-[344px]" />
<div className="hover:bg-[#1da1f2]/50" />
```

## Performance Optimization

### 1. JIT (Just-In-Time) Mode
Already enabled by default in Tailwind v3.

```javascript
// tailwind.config.js
module.exports = {
  // JIT is default, but you can configure content sources
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
};
```

### 2. Purge Unused Styles

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Don't purge these classes
  safelist: [
    'bg-red-500',
    'text-3xl',
    {
      pattern: /bg-(red|green|blue)-(100|200|300)/,
      variants: ['lg', 'hover', 'focus'],
    },
  ],
};
```

### 3. CSS Layer Optimization

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  h1 {
    @apply text-4xl font-bold;
  }
  h2 {
    @apply text-3xl font-semibold;
  }
}

/* Custom components */
@layer components {
  .btn-primary {
    @apply bg-gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition;
  }
}

/* Custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

## Accessibility Best Practices

### 1. Focus Styles

```tsx
// Always include focus styles
<button className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Click me
</button>

// Focus-visible for keyboard-only focus
<button className="focus-visible:ring-2 focus-visible:ring-primary-500">
  Click me
</button>
```

### 2. Screen Reader Classes

```tsx
// Hide visually but keep for screen readers
<span className="sr-only">Loading...</span>

// Show only on focus (skip to content links)
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to content
</a>
```

### 3. Color Contrast

```tsx
// Ensure proper contrast ratios
<div className="bg-gray-900 text-white"> {/* ✅ Good contrast */}
  High contrast text
</div>

<div className="bg-gray-100 text-gray-300"> {/* ❌ Poor contrast */}
  Low contrast text
</div>
```

## File Organization

### Recommended Structure

```
src/
├── styles/
│   ├── globals.css          # Tailwind directives and global styles
│   └── components/          # Component-specific styles (rare)
├── lib/
│   └── utils.ts             # cn() helper and utilities
├── components/
│   ├── ui/                  # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   └── features/            # Feature components
│       ├── dashboard/
│       └── auth/
└── config/
    └── tailwind-variants.ts # CVA variant definitions
```

### Utility Helper

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Common Pitfalls & Solutions

### 1. Dynamic Class Names
```tsx
// ❌ Won't work - classes must be complete strings
<div className={`text-${size}`} />

// ✅ Use object mapping
const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};
<div className={sizeClasses[size]} />
```

### 2. Specificity Issues
```tsx
// ❌ Conflicting classes - last one doesn't always win
<div className="p-4 p-8" /> // Which padding?

// ✅ Use cn() to handle conflicts
import { cn } from '@/lib/utils';
<div className={cn('p-4', isLarge && 'p-8')} />
```

### 3. Responsive Breakpoints
```tsx
// ❌ Mobile-last approach
<div className="lg:hidden block" />

// ✅ Mobile-first approach (Tailwind default)
<div className="block lg:hidden" />
```

### 4. Important Modifier
```tsx
// ❌ Using !important in CSS
<div style={{ color: 'red !important' }} />

// ✅ Use Tailwind's ! prefix (rarely needed)
<div className="!text-red-500" />
```

## Integration with Component Libraries

### With Material Design

```tsx
// Combine Tailwind with Material Design principles
const md3Button = cva(
  'inline-flex items-center justify-center transition-all duration-200',
  {
    variants: {
      variant: {
        filled: 'bg-primary text-white shadow-md hover:shadow-lg',
        outlined: 'border-2 border-primary text-primary hover:bg-primary/10',
        text: 'text-primary hover:bg-primary/10',
        elevated: 'bg-surface shadow-md hover:shadow-xl',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-full',
        md: 'h-10 px-6 text-base rounded-full',
        lg: 'h-14 px-8 text-lg rounded-full',
      },
    },
  }
);
```

### With Existing Design Systems

```javascript
// tailwind.config.js - Map existing design tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        // Map from existing design system
        primary: 'var(--md-sys-color-primary)',
        'on-primary': 'var(--md-sys-color-on-primary)',
        surface: 'var(--md-sys-color-surface)',
      },
      spacing: {
        // Map from 8px grid system
        1: '0.25rem',  // 4px
        2: '0.5rem',   // 8px
        3: '0.75rem',  // 12px
        4: '1rem',     // 16px
      },
    },
  },
};
```

## Testing Tailwind Components

```tsx
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('applies correct variant classes', () => {
    const { container } = render(<Button variant="primary">Click</Button>);
    const button = container.querySelector('button');
    
    expect(button).toHaveClass('bg-gradient-primary');
    expect(button).toHaveClass('text-white');
  });
  
  it('handles responsive classes', () => {
    const { container } = render(
      <div className="block lg:hidden">Content</div>
    );
    
    // Test class presence (actual responsive behavior tested in e2e)
    expect(container.firstChild).toHaveClass('block', 'lg:hidden');
  });
});
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Class Variance Authority](https://cva.style/docs)
- [Headless UI](https://headlessui.com/) - Unstyled components for Tailwind
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Tailwind
- [Tailwind Prettier Plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

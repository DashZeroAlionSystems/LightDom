# Tailwind CSS Best Practices & Patterns

## Overview
Comprehensive guide to using Tailwind CSS effectively in the LightDom Design System.

---

## Table of Contents
1. [Utility-First Philosophy](#utility-first-philosophy)
2. [Component Extraction Patterns](#component-extraction-patterns)
3. [Responsive Design](#responsive-design)
4. [Dark Mode Implementation](#dark-mode-implementation)
5. [Customization & Theming](#customization--theming)
6. [Performance Optimization](#performance-optimization)
7. [Accessibility](#accessibility)
8. [Common Patterns](#common-patterns)

---

## Utility-First Philosophy

### Benefits of Utility-First CSS

#### 1. No Naming Fatigue
```jsx
// Traditional CSS: Need to invent class names
<div className="user-card-header-with-avatar-and-action-buttons">

// Tailwind: Describe what you want
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
```

#### 2. Consistent Constraints
```jsx
// Spacing is always from the design system
<div className="p-4">      // 1rem (16px)
<div className="p-6">      // 1.5rem (24px)
<div className="p-8">      // 2rem (32px)

// No arbitrary values like padding: 17px
```

#### 3. Co-located Styles
```jsx
// Styles are with the markup
function Button({ children }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      {children}
    </button>
  );
}
```

#### 4. Mobile-First Responsive
```jsx
// Default mobile, then larger screens
<div className="text-base md:text-lg lg:text-xl">
  Responsive Text
</div>
```

### When to Use Utility Classes

✅ **DO use utilities for:**
- Layout (flex, grid)
- Spacing (margin, padding)
- Colors (background, text, border)
- Typography (font size, weight, line height)
- Common patterns (hover states, transitions)

❌ **DON'T use utilities for:**
- Complex animations
- Highly repetitive patterns (extract to component)
- Third-party component styling (use @apply sparingly)

---

## Component Extraction Patterns

### 1. React Components (Preferred)
Extract repeated patterns into React components:

```tsx
// ❌ Bad: Repeated utility classes
<div>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Save
  </button>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Submit
  </button>
</div>

// ✅ Good: Extract to component
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary',
  size = 'md'
}: ButtonProps) {
  const baseClasses = 'rounded font-medium transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </button>
  );
}

// Usage
<Button>Save</Button>
<Button variant="secondary" size="sm">Cancel</Button>
```

### 2. Class Composition with clsx/classnames
Conditionally compose classes:

```tsx
import clsx from 'clsx';

interface CardProps {
  elevated?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

export function Card({ elevated, clickable, children }: CardProps) {
  return (
    <div
      className={clsx(
        // Base styles
        'rounded-lg p-6 bg-white',
        
        // Conditional styles
        {
          'shadow-lg': elevated,
          'shadow-md': !elevated,
          'cursor-pointer hover:shadow-xl transition-shadow': clickable,
        }
      )}
    >
      {children}
    </div>
  );
}
```

### 3. CVA (Class Variance Authority) Pattern
For complex variant patterns:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const button = cva(
  // Base styles
  'rounded font-medium transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      intent: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    compoundVariants: [
      {
        intent: 'primary',
        size: 'lg',
        class: 'text-lg font-bold',
      },
    ],
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = VariantProps<typeof button> & {
  children: React.ReactNode;
};

export function Button({ intent, size, fullWidth, children }: ButtonProps) {
  return (
    <button className={button({ intent, size, fullWidth })}>
      {children}
    </button>
  );
}
```

### 4. @apply Directive (Use Sparingly)
Only use @apply for truly reusable patterns:

```css
/* ✅ Good: Shared base styles */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
  }
}

/* ❌ Bad: Overusing @apply */
@layer components {
  .card-header-with-actions {
    @apply flex items-center justify-between p-4 bg-white rounded-t-lg border-b;
  }
  /* This should be a React component instead */
}
```

---

## Responsive Design

### Mobile-First Approach
Tailwind uses mobile-first breakpoints:

```jsx
// Default = mobile (< 640px)
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

<div className="
  w-full          /* mobile: full width */
  sm:w-1/2        /* tablet: half width */
  md:w-1/3        /* small desktop: one-third */
  lg:w-1/4        /* large desktop: one-quarter */
  xl:w-1/5        /* extra large: one-fifth */
">
  Responsive Box
</div>
```

### Common Responsive Patterns

#### Responsive Grid
```jsx
// Responsive column count
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Responsive gap
<div className="grid grid-cols-1 gap-2 sm:gap-4 lg:gap-6">
  {/* ... */}
</div>
```

#### Responsive Typography
```jsx
<h1 className="
  text-2xl        /* mobile */
  sm:text-3xl     /* tablet */
  lg:text-4xl     /* desktop */
  xl:text-5xl     /* large desktop */
  font-bold
  leading-tight
">
  Responsive Heading
</h1>
```

#### Responsive Spacing
```jsx
<div className="
  p-4            /* mobile: 1rem */
  sm:p-6         /* tablet: 1.5rem */
  lg:p-8         /* desktop: 2rem */
">
  Content with responsive padding
</div>
```

#### Responsive Layout Switching
```jsx
// Stack on mobile, side-by-side on desktop
<div className="
  flex
  flex-col         /* mobile: vertical */
  lg:flex-row      /* desktop: horizontal */
  gap-4
">
  <div className="flex-1">Sidebar</div>
  <div className="flex-2">Main Content</div>
</div>
```

### Container Queries (Tailwind 3.2+)
```jsx
// Enable container queries in tailwind.config.js
module.exports = {
  theme: {
    extend: {
      containers: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
      },
    },
  },
};

// Usage
<div className="@container">
  <div className="@sm:p-4 @md:p-6 @lg:p-8">
    Content responds to container size
  </div>
</div>
```

---

## Dark Mode Implementation

### Setup Dark Mode
Configure in `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class', // or 'media' for system preference
  // ... rest of config
};
```

### Class Strategy (Recommended)
Toggle dark mode with a class on `<html>` or `<body>`:

```tsx
// Theme context
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Component usage
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  Content that adapts to theme
</div>
```

### Dark Mode Patterns

#### Colors
```jsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
">
```

#### Shadows
```jsx
<div className="
  shadow-md dark:shadow-2xl
  shadow-gray-200 dark:shadow-gray-900
">
```

#### Images
```jsx
// Different images for light/dark
<div>
  <img src="/logo-light.png" className="dark:hidden" alt="Logo" />
  <img src="/logo-dark.png" className="hidden dark:block" alt="Logo" />
</div>

// Or adjust opacity
<img
  src="/logo.png"
  className="dark:opacity-80"
  alt="Logo"
/>
```

#### Gradients
```jsx
<div className="
  bg-gradient-to-r
  from-blue-500 to-purple-600
  dark:from-blue-700 dark:to-purple-800
">
```

---

## Customization & Theming

### Extend the Default Theme
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add custom colors
        brand: {
          50: '#f3e8ff',
          100: '#e4d4f1',
          500: '#7c3aed',
          600: '#6d28d9',
          900: '#3b0764',
        },
      },
      
      spacing: {
        // Add custom spacing
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      
      fontFamily: {
        // Add custom fonts
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      
      borderRadius: {
        // Add custom radii
        '4xl': '2rem',
      },
      
      boxShadow: {
        // Add custom shadows
        'brand': '0 4px 14px 0 rgba(124, 58, 237, 0.15)',
      },
      
      keyframes: {
        // Add custom animations
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
      },
    },
  },
};
```

### CSS Variables for Dynamic Theming
```css
/* globals.css */
@layer base {
  :root {
    --color-primary: 124 58 237; /* RGB values */
    --color-secondary: 6 182 212;
    --spacing-unit: 4px;
  }
  
  .dark {
    --color-primary: 167 139 250; /* Lighter in dark mode */
    --color-secondary: 34 211 238;
  }
}

/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
    },
  },
};

/* Usage with opacity */
<div className="bg-primary/50">  /* 50% opacity */
```

### Plugin System
Create custom utilities:

```js
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, theme }) {
      // Add custom utilities
      addUtilities({
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
          padding: '.5rem 1rem',
          borderRadius: '.25rem',
          fontWeight: '600',
        },
        '.btn-blue': {
          backgroundColor: theme('colors.blue.500'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.blue.700'),
          },
        },
      });
    }),
  ],
};
```

---

## Performance Optimization

### PurgeCSS Configuration
Tailwind automatically purges unused styles in production:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  // Safelist classes that are generated dynamically
  safelist: [
    'bg-blue-500',
    'text-red-600',
    {
      pattern: /bg-(red|green|blue)-(100|500|900)/,
    },
  ],
};
```

### Dynamic Class Names
```tsx
// ❌ Bad: String concatenation (won't be purged correctly)
<div className={`text-${color}-500`}> 

// ✅ Good: Complete class names
const colorClasses = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
};
<div className={colorClasses[color]}>

// ✅ Better: Use safelist for truly dynamic values
// In tailwind.config.js safelist
```

### Bundle Size Optimization
```js
// tailwind.config.js
module.exports = {
  // Only generate utilities you need
  corePlugins: {
    float: false,
    objectFit: false,
    objectPosition: false,
  },
  
  // Limit color palette
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    white: colors.white,
    gray: colors.gray,
    blue: colors.blue,
    // Only include colors you use
  },
};
```

### JIT Mode (Just-In-Time)
Tailwind 3.0+ uses JIT by default:

```js
// Generates classes on-demand
<div className="mt-[17px]">  // Arbitrary value
<div className="bg-[#1da1f2]">  // Custom color
<div className="grid-cols-[200px_1fr_300px]">  // Custom grid
```

---

## Accessibility

### Focus Indicators
```jsx
// Visible focus states
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
">
  Accessible Button
</button>

// Different focus for keyboard vs mouse
<button className="
  focus-visible:ring-2
  focus-visible:ring-blue-500
">
  Keyboard Focus Only
</button>
```

### Screen Reader Utilities
```jsx
// Hide visually, keep for screen readers
<span className="sr-only">
  Loading...
</span>

// Show only for screen readers
<div className="not-sr-only">
  Visible content
</div>
```

### Color Contrast
```jsx
// Ensure sufficient contrast
<div className="
  bg-blue-600 text-white  /* 4.5:1 ratio */
  not bg-blue-400 text-white  /* Insufficient contrast */
">
```

### Reduced Motion
```jsx
// Respect prefers-reduced-motion
<div className="
  transition-transform
  motion-reduce:transition-none
">
  Animated content
</div>
```

---

## Common Patterns

### Card Component
```jsx
<div className="
  bg-white dark:bg-gray-800
  rounded-lg
  shadow-md hover:shadow-lg
  transition-shadow duration-200
  p-6
  border border-gray-200 dark:border-gray-700
">
  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-gray-300">
    Card content
  </p>
</div>
```

### Form Field
```jsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Email
  </label>
  <input
    type="email"
    className="
      w-full
      px-4 py-2
      border border-gray-300 dark:border-gray-600
      rounded-lg
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition-colors
    "
    placeholder="Enter your email"
  />
</div>
```

### Modal/Dialog
```jsx
<div className="
  fixed inset-0
  bg-black/50
  backdrop-blur-sm
  flex items-center justify-center
  p-4
  z-50
">
  <div className="
    bg-white dark:bg-gray-800
    rounded-lg
    shadow-2xl
    max-w-md w-full
    p-6
    transform transition-all
    scale-100 opacity-100
  ">
    <h2 className="text-2xl font-bold mb-4">Modal Title</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Modal content</p>
    <div className="flex justify-end gap-2">
      <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
        Cancel
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Navigation
```jsx
<nav className="
  bg-white dark:bg-gray-900
  border-b border-gray-200 dark:border-gray-800
  sticky top-0
  z-40
">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex-shrink-0">
        <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
      </div>
      
      <div className="hidden md:flex items-center space-x-4">
        <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
          Home
        </a>
        <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
          About
        </a>
      </div>
    </div>
  </div>
</nav>
```

### Loading Skeleton
```jsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

### Badge/Pill
```jsx
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-blue-100 text-blue-800
  dark:bg-blue-900 dark:text-blue-200
">
  Badge
</span>
```

---

## Best Practices Summary

### DO ✅
- Use utility classes for one-off styles
- Extract repeated patterns into components
- Follow mobile-first responsive design
- Use the @apply directive sparingly
- Leverage Tailwind's design tokens
- Configure PurgeCSS properly
- Use complete class names (not concatenated)
- Support dark mode from the start
- Add focus states to interactive elements
- Respect reduced-motion preferences

### DON'T ❌
- Create custom CSS for everything
- Overuse @apply (defeats utility-first purpose)
- Concatenate class names dynamically
- Forget to configure content paths
- Ignore responsive design
- Skip accessibility features
- Mix Tailwind with traditional CSS extensively
- Use arbitrary values excessively
- Forget to test in dark mode
- Neglect hover and focus states

---

**Last Updated**: 2025-10-28
**Version**: 1.0.0
**Tailwind Version**: 3.4+

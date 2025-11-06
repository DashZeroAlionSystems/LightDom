# Tailwind CSS Integration with Material Design 3

## Overview
This guide details how to integrate Tailwind CSS with Material Design 3 principles for a cohesive, modern design system.

---

## Tailwind Configuration

### Complete tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      // Material Design 3 Colors
      colors: {
        // Primary Palette
        primary: {
          DEFAULT: '#6750A4',
          50: '#F6EDFF',
          100: '#EADDFF',
          200: '#D0BCFF',
          300: '#B69DF8',
          400: '#9A82DB',
          500: '#7F67BE',
          600: '#6750A4',
          700: '#4F378B',
          800: '#381E72',
          900: '#21005D',
          950: '#10002B',
        },
        
        // Secondary Palette
        secondary: {
          DEFAULT: '#625B71',
          50: '#F6EDFF',
          100: '#E8DEF8',
          200: '#CCC2DC',
          300: '#B0A7C0',
          400: '#958DA5',
          500: '#7A7289',
          600: '#625B71',
          700: '#4A4458',
          800: '#332D41',
          900: '#1D192B',
          950: '#0F0D16',
        },
        
        // Tertiary Palette
        tertiary: {
          DEFAULT: '#7D5260',
          50: '#FFECF1',
          100: '#FFD8E4',
          200: '#EFB8C8',
          300: '#D29DAC',
          400: '#B58392',
          500: '#986977',
          600: '#7D5260',
          700: '#633B48',
          800: '#492532',
          900: '#31111D',
          950: '#19080E',
        },
        
        // Error Palette
        error: {
          DEFAULT: '#B3261E',
          50: '#FCEEEE',
          100: '#F9DEDC',
          200: '#F2B8B5',
          300: '#EC928E',
          400: '#E46962',
          500: '#DC362E',
          600: '#B3261E',
          700: '#8C1D18',
          800: '#601410',
          900: '#410E0B',
          950: '#210705',
        },
        
        // Neutral Palette
        neutral: {
          DEFAULT: '#79747E',
          0: '#000000',
          10: '#1C1B1F',
          20: '#313033',
          30: '#48464C',
          40: '#605D66',
          50: '#787579',
          60: '#939094',
          70: '#AEAAAE',
          80: '#C9C5CA',
          90: '#E6E1E5',
          95: '#F4EFF4',
          99: '#FFFBFE',
          100: '#FFFFFF',
        },
        
        // Neutral Variant
        'neutral-variant': {
          DEFAULT: '#79747E',
          0: '#000000',
          10: '#1D1A22',
          20: '#322F37',
          30: '#49454F',
          40: '#605D66',
          50: '#787579',
          60: '#939094',
          70: '#AEAAAE',
          80: '#CAC4D0',
          90: '#E7E0EC',
          95: '#F5EEFA',
          99: '#FFFBFE',
          100: '#FFFFFF',
        },
        
        // Surface colors
        surface: {
          DEFAULT: '#FFFBFE',
          dim: '#DED8E1',
          bright: '#FFFBFE',
          container: {
            lowest: '#FFFFFF',
            low: '#F7F2FA',
            DEFAULT: '#F3EDF7',
            high: '#ECE6F0',
            highest: '#E6E0E9',
          },
        },
        
        // Dark theme surfaces
        'surface-dark': {
          DEFAULT: '#1C1B1F',
          dim: '#1C1B1F',
          bright: '#3B383E',
          container: {
            lowest: '#0F0D13',
            low: '#1C1B1F',
            DEFAULT: '#211F26',
            high: '#2B2930',
            highest: '#36343B',
          },
        },
        
        // Semantic colors
        success: {
          DEFAULT: '#4CAF50',
          light: '#81C784',
          dark: '#388E3C',
        },
        warning: {
          DEFAULT: '#FF9800',
          light: '#FFB74D',
          dark: '#F57C00',
        },
        info: {
          DEFAULT: '#2196F3',
          light: '#64B5F6',
          dark: '#1976D2',
        },
      },
      
      // Typography
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Roboto Flex', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      
      fontSize: {
        // Material Design 3 Type Scale
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px', fontWeight: '400' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '400' }],
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '500' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '400' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px', fontWeight: '400' }],
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
      },
      
      // Spacing (8px grid)
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
      },
      
      // Border Radius (Shape Tokens)
      borderRadius: {
        'none': '0',
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '28px',
        '2xl': '32px',
        '3xl': '40px',
        'full': '9999px',
      },
      
      // Box Shadows (Elevation)
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
      },
      
      // Animation Durations
      transitionDuration: {
        '50': '50ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
        '400': '400ms',
        '450': '450ms',
        '500': '500ms',
        '550': '550ms',
        '600': '600ms',
      },
      
      // Animation Easing
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        'emphasized': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
        'emphasized-accelerate': 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
        'legacy': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      
      // Z-index
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
      
      // Container
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [
    // Custom plugins
    function({ addComponents, theme }) {
      addComponents({
        // Material Design 3 Button Components
        '.btn-filled': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          height: '40px',
          paddingLeft: '24px',
          paddingRight: '24px',
          borderRadius: theme('borderRadius.full'),
          backgroundColor: theme('colors.primary.DEFAULT'),
          color: '#FFFFFF',
          fontSize: theme('fontSize.label-large[0]'),
          fontWeight: theme('fontSize.label-large[1].fontWeight'),
          letterSpacing: theme('fontSize.label-large[1].letterSpacing'),
          boxShadow: theme('boxShadow.elevation-0'),
          transition: 'all 200ms cubic-bezier(0.2, 0.0, 0, 1.0)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          border: 'none',
          '&:hover': {
            boxShadow: theme('boxShadow.elevation-1'),
          },
          '&:active': {
            boxShadow: theme('boxShadow.elevation-0'),
          },
        },
        
        '.btn-outlined': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          height: '40px',
          paddingLeft: '24px',
          paddingRight: '24px',
          borderRadius: theme('borderRadius.full'),
          backgroundColor: 'transparent',
          color: theme('colors.primary.DEFAULT'),
          fontSize: theme('fontSize.label-large[0]'),
          fontWeight: theme('fontSize.label-large[1].fontWeight'),
          borderWidth: '1px',
          borderColor: theme('colors.neutral.40'),
          transition: 'all 200ms cubic-bezier(0.2, 0.0, 0, 1.0)',
          cursor: 'pointer',
        },
        
        '.btn-text': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          height: '40px',
          paddingLeft: '12px',
          paddingRight: '12px',
          borderRadius: theme('borderRadius.full'),
          backgroundColor: 'transparent',
          color: theme('colors.primary.DEFAULT'),
          fontSize: theme('fontSize.label-large[0]'),
          fontWeight: theme('fontSize.label-large[1].fontWeight'),
          border: 'none',
          transition: 'all 200ms cubic-bezier(0.2, 0.0, 0, 1.0)',
          cursor: 'pointer',
        },
        
        // Card Components
        '.card-elevated': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderRadius: theme('borderRadius.md'),
          boxShadow: theme('boxShadow.elevation-1'),
          padding: '16px',
          transition: 'all 200ms cubic-bezier(0.2, 0.0, 0, 1.0)',
          '&:hover': {
            boxShadow: theme('boxShadow.elevation-2'),
          },
        },
        
        '.card-filled': {
          backgroundColor: theme('colors.surface.container.DEFAULT'),
          borderRadius: theme('borderRadius.md'),
          padding: '16px',
        },
        
        '.card-outlined': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          borderRadius: theme('borderRadius.md'),
          borderWidth: '1px',
          borderColor: theme('colors.neutral.40'),
          padding: '16px',
        },
        
        // Typography Components
        '.text-display-large': {
          fontSize: theme('fontSize.display-large[0]'),
          lineHeight: theme('fontSize.display-large[1].lineHeight'),
          letterSpacing: theme('fontSize.display-large[1].letterSpacing'),
          fontWeight: theme('fontSize.display-large[1].fontWeight'),
        },
        
        '.text-headline-medium': {
          fontSize: theme('fontSize.headline-medium[0]'),
          lineHeight: theme('fontSize.headline-medium[1].lineHeight'),
          letterSpacing: theme('fontSize.headline-medium[1].letterSpacing'),
          fontWeight: theme('fontSize.headline-medium[1].fontWeight'),
        },
        
        '.text-body-large': {
          fontSize: theme('fontSize.body-large[0]'),
          lineHeight: theme('fontSize.body-large[1].lineHeight'),
          letterSpacing: theme('fontSize.body-large[1].letterSpacing'),
          fontWeight: theme('fontSize.body-large[1].fontWeight'),
        },
      });
    },
    
    // State layers plugin
    function({ addUtilities }) {
      addUtilities({
        '.state-layer': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0',
            borderRadius: 'inherit',
            backgroundColor: 'currentColor',
            opacity: '0',
            transition: 'opacity 50ms cubic-bezier(0.2, 0.0, 0, 1.0)',
          },
          '&:hover::before': {
            opacity: '0.08',
          },
          '&:focus::before': {
            opacity: '0.12',
          },
          '&:active::before': {
            opacity: '0.12',
          },
        },
      });
    },
  ],
};
```

---

## Usage Examples

### Buttons

```tsx
import React from 'react';

// Filled Button
export const FilledButton = ({ children, onClick }) => (
  <button className="btn-filled state-layer" onClick={onClick}>
    {children}
  </button>
);

// Outlined Button
export const OutlinedButton = ({ children, onClick }) => (
  <button className="btn-outlined state-layer" onClick={onClick}>
    {children}
  </button>
);

// Text Button
export const TextButton = ({ children, onClick }) => (
  <button className="btn-text state-layer" onClick={onClick}>
    {children}
  </button>
);

// Custom variant with Tailwind classes
export const PrimaryButton = ({ children, onClick }) => (
  <button
    className="
      inline-flex items-center justify-center gap-2
      h-10 px-6 rounded-full
      bg-primary text-white
      text-label-large font-medium
      shadow-elevation-0 hover:shadow-elevation-1
      transition-all duration-200 ease-standard
      state-layer
    "
    onClick={onClick}
  >
    {children}
  </button>
);
```

### Cards

```tsx
// Elevated Card
export const ElevatedCard = ({ children }) => (
  <div className="card-elevated">
    {children}
  </div>
);

// Filled Card
export const FilledCard = ({ children }) => (
  <div className="card-filled">
    {children}
  </div>
);

// Custom Card with Tailwind
export const ProductCard = ({ title, description, image }) => (
  <div className="
    bg-surface rounded-md p-4
    shadow-elevation-1 hover:shadow-elevation-2
    transition-shadow duration-200 ease-standard
    cursor-pointer
  ">
    <img src={image} alt={title} className="w-full h-48 object-cover rounded-sm mb-3" />
    <h3 className="text-title-large text-neutral-10 mb-2">{title}</h3>
    <p className="text-body-medium text-neutral-50">{description}</p>
  </div>
);
```

### Forms

```tsx
// Text Input with Material Design 3 styling
export const TextInput = ({ label, value, onChange, error, helperText }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-label-medium text-neutral-50 ml-4">
        {label}
      </label>
    )}
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        h-14 px-4 rounded-xs
        bg-surface-container border-b-2
        ${error ? 'border-error' : 'border-neutral-50 focus:border-primary'}
        text-body-large text-neutral-10
        transition-colors duration-200
        outline-none
      `}
    />
    {(error || helperText) && (
      <span className={`text-label-small ml-4 ${error ? 'text-error' : 'text-neutral-50'}`}>
        {error || helperText}
      </span>
    )}
  </div>
);

// Outlined Input
export const OutlinedInput = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-label-medium text-neutral-50 ml-4">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        h-14 px-4 rounded-xs
        bg-transparent border-2 border-neutral-40
        focus:border-2 focus:border-primary
        text-body-large text-neutral-10
        transition-colors duration-200
        outline-none
      "
    />
  </div>
);
```

### Layout Components

```tsx
// Container
export const Container = ({ children, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };
  
  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 md:px-6 lg:px-8`}>
      {children}
    </div>
  );
};

// Grid Layout
export const GridLayout = ({ children, cols = 3 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${gridCols[cols]} gap-4 md:gap-6`}>
      {children}
    </div>
  );
};

// Stack
export const Stack = ({ children, direction = 'vertical', spacing = 4 }) => {
  const directionClass = direction === 'vertical' ? 'flex-col' : 'flex-row';
  const spacingClass = direction === 'vertical' ? `space-y-${spacing}` : `space-x-${spacing}`;
  
  return (
    <div className={`flex ${directionClass} ${spacingClass}`}>
      {children}
    </div>
  );
};
```

### Navigation

```tsx
export const NavigationBar = ({ items }) => (
  <nav className="
    bg-surface-container shadow-elevation-2
    h-16 px-4
    flex items-center justify-between
  ">
    <div className="flex items-center gap-6">
      <h1 className="text-title-large text-neutral-10">LightDom</h1>
      <div className="hidden md:flex items-center gap-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="
              px-4 py-2 rounded-full
              text-label-large text-neutral-10
              hover:bg-neutral-90
              transition-colors duration-200
              state-layer
            "
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  </nav>
);
```

---

## Responsive Design Patterns

```tsx
// Responsive Card Grid
export const ResponsiveCardGrid = ({ cards }) => (
  <div className="
    grid
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    gap-4 md:gap-6
  ">
    {cards.map((card) => (
      <div key={card.id} className="card-elevated">
        {card.content}
      </div>
    ))}
  </div>
);

// Responsive Typography
export const ResponsiveHeading = ({ children }) => (
  <h1 className="
    text-headline-small
    md:text-headline-medium
    lg:text-headline-large
    text-neutral-10
  ">
    {children}
  </h1>
);

// Responsive Spacing
export const ResponsiveSection = ({ children }) => (
  <section className="
    py-8 md:py-12 lg:py-16
    px-4 md:px-6 lg:px-8
  ">
    {children}
  </section>
);
```

---

## Dark Mode Implementation

```tsx
// Toggle dark mode
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="
        w-12 h-12 rounded-full
        bg-surface-container
        flex items-center justify-center
        shadow-elevation-1
        state-layer
      "
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};

// Dark mode styles
export const DarkModeCard = () => (
  <div className="
    bg-surface dark:bg-surface-dark
    text-neutral-10 dark:text-neutral-90
    border border-neutral-80 dark:border-neutral-20
    rounded-md p-6
    shadow-elevation-1
  ">
    <h3 className="text-title-large mb-2">Dark Mode Support</h3>
    <p className="text-body-medium">
      This card automatically adapts to dark mode.
    </p>
  </div>
);
```

---

## Animation Utilities

```tsx
// Fade In Animation
export const FadeIn = ({ children, delay = 0 }) => (
  <div
    className="
      animate-fade-in
      opacity-0
    "
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// Add to global CSS
/*
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 300ms cubic-bezier(0.05, 0.7, 0.1, 1.0) forwards;
}
*/
```

---

## Best Practices

1. **Use Semantic Class Names**: Prefer `bg-primary` over `bg-purple-600`
2. **Compose Utilities**: Build complex components from simple utilities
3. **Responsive Design**: Mobile-first approach with breakpoint prefixes
4. **Dark Mode**: Use `dark:` prefix for dark mode variants
5. **State Variants**: Use `hover:`, `focus:`, `active:` for interactive states
6. **Consistency**: Stick to the design token values
7. **Performance**: Use `@apply` sparingly, prefer utility classes
8. **Maintainability**: Extract common patterns into components

---

## Performance Optimization

```javascript
// Purge unused styles in production
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // ... other config
  
  // Enable JIT mode for faster builds
  mode: 'jit',
  
  // Safelist dynamic classes if needed
  safelist: [
    'bg-primary',
    'bg-secondary',
    'text-primary',
    {
      pattern: /bg-(primary|secondary|tertiary)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ],
};
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Headless UI Components](https://headlessui.com/)
- [Material Design 3 for Tailwind](https://github.com/material-components/material-web)

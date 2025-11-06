# Material Design 3 (Material You) Guidelines

## Overview
Material Design 3 (M3) is Google's latest design system that introduces dynamic color, updated components, and refined design tokens. It emphasizes personalization, accessibility, and adaptive design.

## Core Principles

### 1. Expressive
Material Design 3 provides a foundation for expressing brand and style through color, typography, and shape while maintaining usability and accessibility.

### 2. Adaptive
Components and layouts adapt to different screen sizes, devices, and user preferences (like dark mode and dynamic color).

### 3. Personal
Dynamic color allows the system to adapt to user preferences, creating personalized color schemes from wallpapers or selected colors.

## Color System

### Dynamic Color
M3 introduces dynamic color - the ability to generate entire color palettes from a single source color.

```typescript
// Color roles in M3
interface M3ColorScheme {
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  
  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  // Tertiary colors
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  // Error colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  // Surface colors
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  
  // Outline
  outline: string;
  outlineVariant: string;
  
  // Background
  background: string;
  onBackground: string;
  
  // Surface containers
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  
  // Inverse colors
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  
  // Other
  scrim: string;
  shadow: string;
}
```

### Tonal Palettes
M3 uses tonal palettes - 13 tones from 0 (black) to 100 (white) for each color family.

```typescript
// Tonal palette structure
type TonalPalette = {
  0: string;    // Black
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;   // Mid-tone
  60: string;
  70: string;
  80: string;
  90: string;
  95: string;
  99: string;
  100: string;  // White
};

// Color families
interface ColorFamilies {
  primary: TonalPalette;
  secondary: TonalPalette;
  tertiary: TonalPalette;
  error: TonalPalette;
  neutral: TonalPalette;
  neutralVariant: TonalPalette;
}
```

### Color Mapping
How tones map to roles in light and dark themes:

```typescript
// Light theme mapping
const lightTheme = {
  primary: primary[40],
  onPrimary: primary[100],
  primaryContainer: primary[90],
  onPrimaryContainer: primary[10],
  
  surface: neutral[99],
  onSurface: neutral[10],
  surfaceVariant: neutralVariant[90],
  onSurfaceVariant: neutralVariant[30],
  
  outline: neutralVariant[50],
  outlineVariant: neutralVariant[80],
};

// Dark theme mapping
const darkTheme = {
  primary: primary[80],
  onPrimary: primary[20],
  primaryContainer: primary[30],
  onPrimaryContainer: primary[90],
  
  surface: neutral[10],
  onSurface: neutral[90],
  surfaceVariant: neutralVariant[30],
  onSurfaceVariant: neutralVariant[80],
  
  outline: neutralVariant[60],
  outlineVariant: neutralVariant[30],
};
```

## Typography

### Type Scale
M3 defines 5 main type scales with display, headline, title, body, and label variants.

```typescript
interface M3Typography {
  // Display - Large, expressive text
  displayLarge: {
    fontSize: '57px';
    lineHeight: '64px';
    fontWeight: 400;
    letterSpacing: '-0.25px';
  };
  displayMedium: {
    fontSize: '45px';
    lineHeight: '52px';
    fontWeight: 400;
    letterSpacing: '0px';
  };
  displaySmall: {
    fontSize: '36px';
    lineHeight: '44px';
    fontWeight: 400;
    letterSpacing: '0px';
  };
  
  // Headline - High-emphasis text
  headlineLarge: {
    fontSize: '32px';
    lineHeight: '40px';
    fontWeight: 400;
    letterSpacing: '0px';
  };
  headlineMedium: {
    fontSize: '28px';
    lineHeight: '36px';
    fontWeight: 400;
    letterSpacing: '0px';
  };
  headlineSmall: {
    fontSize: '24px';
    lineHeight: '32px';
    fontWeight: 400;
    letterSpacing: '0px';
  };
  
  // Title - Medium-emphasis text
  titleLarge: {
    fontSize: '22px';
    lineHeight: '28px';
    fontWeight: 400;
    letterSpacing: '0px';
  };
  titleMedium: {
    fontSize: '16px';
    lineHeight: '24px';
    fontWeight: 500;
    letterSpacing: '0.15px';
  };
  titleSmall: {
    fontSize: '14px';
    lineHeight: '20px';
    fontWeight: 500;
    letterSpacing: '0.1px';
  };
  
  // Body - Main text
  bodyLarge: {
    fontSize: '16px';
    lineHeight: '24px';
    fontWeight: 400;
    letterSpacing: '0.5px';
  };
  bodyMedium: {
    fontSize: '14px';
    lineHeight: '20px';
    fontWeight: 400;
    letterSpacing: '0.25px';
  };
  bodySmall: {
    fontSize: '12px';
    lineHeight: '16px';
    fontWeight: 400;
    letterSpacing: '0.4px';
  };
  
  // Label - UI elements
  labelLarge: {
    fontSize: '14px';
    lineHeight: '20px';
    fontWeight: 500;
    letterSpacing: '0.1px';
  };
  labelMedium: {
    fontSize: '12px';
    lineHeight: '16px';
    fontWeight: 500;
    letterSpacing: '0.5px';
  };
  labelSmall: {
    fontSize: '11px';
    lineHeight: '16px';
    fontWeight: 500;
    letterSpacing: '0.5px';
  };
}
```

## Elevation

### Elevation Levels
M3 uses elevation levels 0-5 with corresponding shadows and surface tints.

```typescript
interface M3Elevation {
  level0: {
    elevation: 0;
    shadow: 'none';
    surfaceTint: 0;
  };
  level1: {
    elevation: 1;
    shadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)';
    surfaceTint: 0.05;
  };
  level2: {
    elevation: 2;
    shadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)';
    surfaceTint: 0.08;
  };
  level3: {
    elevation: 3;
    shadow: '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)';
    surfaceTint: 0.11;
  };
  level4: {
    elevation: 4;
    shadow: '0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)';
    surfaceTint: 0.12;
  };
  level5: {
    elevation: 5;
    shadow: '0px 4px 4px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)';
    surfaceTint: 0.14;
  };
}
```

### Surface Tinting
In M3, elevated surfaces are tinted with the primary color instead of just using shadows.

```tsx
function ElevatedSurface({ level = 1, children }: Props) {
  const tintOpacity = [0, 0.05, 0.08, 0.11, 0.12, 0.14][level];
  
  return (
    <div
      style={{
        backgroundColor: `color-mix(in srgb, var(--md-sys-color-surface) ${(1 - tintOpacity) * 100}%, var(--md-sys-color-primary) ${tintOpacity * 100}%)`,
        boxShadow: elevationShadows[level],
      }}
    >
      {children}
    </div>
  );
}
```

## Shape

### Shape Scale
M3 defines shape scales for different component sizes.

```typescript
interface M3Shape {
  // None
  none: {
    borderRadius: '0px';
  };
  
  // Extra Small (Chips)
  extraSmall: {
    borderRadius: '4px';
  };
  extraSmallTop: {
    borderRadius: '4px 4px 0px 0px';
  };
  
  // Small (Buttons)
  small: {
    borderRadius: '8px';
  };
  
  // Medium (Cards)
  medium: {
    borderRadius: '12px';
  };
  
  // Large (Sheets)
  large: {
    borderRadius: '16px';
  };
  largeTop: {
    borderRadius: '16px 16px 0px 0px';
  };
  largeEnd: {
    borderRadius: '0px 16px 16px 0px';
  };
  
  // Extra Large (Dialogs)
  extraLarge: {
    borderRadius: '28px';
  };
  extraLargeTop: {
    borderRadius: '28px 28px 0px 0px';
  };
  
  // Full (Pills)
  full: {
    borderRadius: '9999px';
  };
}
```

## Component Specifications

### Buttons

#### Filled Button
```tsx
interface FilledButtonProps {
  // Appearance
  label: string;
  icon?: ReactNode;
  
  // States
  enabled?: boolean;
  disabled?: boolean;
  hovered?: boolean;
  focused?: boolean;
  pressed?: boolean;
  
  // Behavior
  onClick?: () => void;
}

// Styles
const filledButtonStyles = {
  // Container
  height: '40px',
  paddingHorizontal: '24px',
  borderRadius: '20px', // Full shape
  backgroundColor: 'var(--md-sys-color-primary)',
  
  // Label
  color: 'var(--md-sys-color-on-primary)',
  typography: 'labelLarge',
  
  // States
  hover: {
    stateLayer: 'var(--md-sys-color-on-primary) 8%',
    elevation: 'level1',
  },
  pressed: {
    stateLayer: 'var(--md-sys-color-on-primary) 12%',
  },
  focused: {
    stateLayer: 'var(--md-sys-color-on-primary) 12%',
  },
  disabled: {
    containerOpacity: 0.12,
    labelOpacity: 0.38,
  },
};
```

#### Other Button Variants
- **Filled Tonal**: Uses secondary container color
- **Outlined**: Border with no fill
- **Elevated**: Shadow with no border
- **Text**: No container

### Cards

#### Filled Card
```tsx
interface CardProps {
  variant: 'filled' | 'elevated' | 'outlined';
  children: ReactNode;
}

const cardStyles = {
  filled: {
    backgroundColor: 'var(--md-sys-color-surface-container-highest)',
    color: 'var(--md-sys-color-on-surface)',
    borderRadius: '12px',
    elevation: 'level0',
  },
  elevated: {
    backgroundColor: 'var(--md-sys-color-surface-container-low)',
    color: 'var(--md-sys-color-on-surface)',
    borderRadius: '12px',
    elevation: 'level1',
  },
  outlined: {
    backgroundColor: 'var(--md-sys-color-surface)',
    color: 'var(--md-sys-color-on-surface)',
    border: '1px solid var(--md-sys-color-outline)',
    borderRadius: '12px',
    elevation: 'level0',
  },
};
```

### Text Fields

```tsx
interface TextFieldProps {
  variant: 'filled' | 'outlined';
  label: string;
  value: string;
  onChange: (value: string) => void;
  supportingText?: string;
  error?: boolean;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const textFieldStyles = {
  filled: {
    container: {
      backgroundColor: 'var(--md-sys-color-surface-container-highest)',
      borderRadius: '4px 4px 0px 0px',
      borderBottom: '1px solid var(--md-sys-color-on-surface-variant)',
    },
    focused: {
      borderBottom: '2px solid var(--md-sys-color-primary)',
    },
    error: {
      borderBottom: '2px solid var(--md-sys-color-error)',
    },
  },
  outlined: {
    container: {
      backgroundColor: 'transparent',
      border: '1px solid var(--md-sys-color-outline)',
      borderRadius: '4px',
    },
    focused: {
      border: '2px solid var(--md-sys-color-primary)',
    },
    error: {
      border: '2px solid var(--md-sys-color-error)',
    },
  },
};
```

### FAB (Floating Action Button)

```tsx
interface FABProps {
  size: 'small' | 'medium' | 'large';
  icon: ReactNode;
  label?: string;
  onClick: () => void;
}

const fabStyles = {
  small: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
  },
  medium: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
  },
  large: {
    width: '96px',
    height: '96px',
    borderRadius: '28px',
  },
  // Colors
  surface: {
    backgroundColor: 'var(--md-sys-color-primary-container)',
    color: 'var(--md-sys-color-on-primary-container)',
  },
  primary: {
    backgroundColor: 'var(--md-sys-color-primary)',
    color: 'var(--md-sys-color-on-primary)',
  },
  secondary: {
    backgroundColor: 'var(--md-sys-color-secondary-container)',
    color: 'var(--md-sys-color-on-secondary-container)',
  },
  tertiary: {
    backgroundColor: 'var(--md-sys-color-tertiary-container)',
    color: 'var(--md-sys-color-on-tertiary-container)',
  },
};
```

### Chips

```tsx
interface ChipProps {
  variant: 'assist' | 'filter' | 'input' | 'suggestion';
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

const chipStyles = {
  assist: {
    height: '32px',
    borderRadius: '8px',
    border: '1px solid var(--md-sys-color-outline)',
    backgroundColor: 'transparent',
  },
  filter: {
    height: '32px',
    borderRadius: '8px',
    default: {
      border: '1px solid var(--md-sys-color-outline)',
      backgroundColor: 'transparent',
    },
    selected: {
      backgroundColor: 'var(--md-sys-color-secondary-container)',
      color: 'var(--md-sys-color-on-secondary-container)',
    },
  },
  input: {
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: '1px solid var(--md-sys-color-outline)',
  },
  suggestion: {
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: '1px solid var(--md-sys-color-outline)',
  },
};
```

## Motion & Animation

### Duration & Easing

```typescript
interface M3Motion {
  duration: {
    short1: '50ms';
    short2: '100ms';
    short3: '150ms';
    short4: '200ms';
    medium1: '250ms';
    medium2: '300ms';
    medium3: '350ms';
    medium4: '400ms';
    long1: '450ms';
    long2: '500ms';
    long3: '550ms';
    long4: '600ms';
    extraLong1: '700ms';
    extraLong2: '800ms';
    extraLong3: '900ms';
    extraLong4: '1000ms';
  };
  
  easing: {
    // Emphasized - For significant transitions
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)';
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)';
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)';
    
    // Standard - For simple transitions
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)';
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)';
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)';
    
    // Legacy - For compatibility
    legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1)';
    legacyDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)';
    legacyAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)';
  };
}
```

### Animation Patterns

```tsx
// Entrance animation
const entranceAnimation = {
  from: {
    opacity: 0,
    transform: 'scale(0.8)',
  },
  to: {
    opacity: 1,
    transform: 'scale(1)',
  },
  duration: '300ms',
  easing: 'emphasized-decelerate',
};

// Exit animation
const exitAnimation = {
  from: {
    opacity: 1,
    transform: 'scale(1)',
  },
  to: {
    opacity: 0,
    transform: 'scale(0.8)',
  },
  duration: '200ms',
  easing: 'emphasized-accelerate',
};

// Shared element transition
const sharedElementTransition = {
  duration: '300ms',
  easing: 'emphasized',
  properties: ['transform', 'border-radius', 'opacity'],
};
```

## State Layers

M3 uses state layers for interactive feedback.

```typescript
interface StateLayer {
  hover: {
    opacity: 0.08;
  };
  focus: {
    opacity: 0.12;
  };
  pressed: {
    opacity: 0.12;
  };
  dragged: {
    opacity: 0.16;
  };
}

// Implementation
function StateLayerComponent({ state, children }: Props) {
  const opacity = {
    hover: 0.08,
    focus: 0.12,
    pressed: 0.12,
    dragged: 0.16,
  }[state] || 0;
  
  return (
    <div className="relative">
      {children}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: 'var(--md-sys-color-on-surface)',
          opacity,
        }}
      />
    </div>
  );
}
```

## Accessibility

### Color Contrast
M3 ensures WCAG 2.1 Level AA compliance:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

### Focus Indicators
```typescript
const focusIndicator = {
  outlineColor: 'var(--md-sys-color-primary)',
  outlineWidth: '2px',
  outlineOffset: '2px',
  outlineStyle: 'solid',
};
```

### Touch Targets
Minimum touch target size: 48x48 dp

```tsx
function TouchTarget({ children }: Props) {
  return (
    <div
      style={{
        minWidth: '48px',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}
```

## Implementation Guide

### Setting Up M3 Colors

```typescript
// 1. Generate tonal palettes from source color
import { argbFromHex, themeFromSourceColor } from '@material/material-color-utilities';

const sourceColor = '#6750A4'; // Your brand color
const theme = themeFromSourceColor(argbFromHex(sourceColor));

// 2. Apply to CSS variables
function applyTheme(theme: Theme, isDark: boolean) {
  const scheme = isDark ? theme.schemes.dark : theme.schemes.light;
  
  Object.entries(scheme.toJSON()).forEach(([key, value]) => {
    const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const hex = hexFromArgb(value);
    document.documentElement.style.setProperty(`--md-sys-color-${token}`, hex);
  });
}
```

### Component Library Structure

```
components/
├── md3/
│   ├── Button/
│   │   ├── FilledButton.tsx
│   │   ├── OutlinedButton.tsx
│   │   ├── TextButton.tsx
│   │   └── index.ts
│   ├── Card/
│   │   ├── FilledCard.tsx
│   │   ├── ElevatedCard.tsx
│   │   ├── OutlinedCard.tsx
│   │   └── index.ts
│   ├── Chip/
│   ├── FAB/
│   ├── TextField/
│   └── ...
└── tokens/
    ├── colors.ts
    ├── typography.ts
    ├── elevation.ts
    ├── shape.ts
    └── motion.ts
```

## Resources

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Material Color Utilities](https://github.com/material-foundation/material-color-utilities)
- [Material Theme Builder](https://m3.material.io/theme-builder)
- [Material Design Components](https://github.com/material-components)
- [Figma Material 3 Design Kit](https://www.figma.com/community/file/1035203688168086460)

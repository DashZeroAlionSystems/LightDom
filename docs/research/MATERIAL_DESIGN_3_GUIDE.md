# Material Design 3 Complete Implementation Guide

## Overview
Material Design 3 (Material You) is Google's latest design system emphasizing personalization, accessibility, and expressiveness.

---

## Core Principles

### 1. Personalization
- Dynamic color system based on user preferences
- Adaptive layouts that respond to content and context
- User-controlled themes and customization

### 2. Expressiveness
- Vibrant, bold use of color
- Enhanced motion and transitions
- Larger, more impactful surfaces

### 3. Accessibility
- WCAG 2.1 Level AA compliance
- High contrast modes
- Improved focus indicators
- Better screen reader support

---

## Color System Deep Dive

### Tonal Palettes

Material Design 3 uses five key color palettes:
1. **Primary**: Main brand color
2. **Secondary**: Accents and supporting colors
3. **Tertiary**: Complementary accent color
4. **Error**: Error states and destructive actions
5. **Neutral**: Backgrounds, surfaces, and text

Each palette has 13 tones (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100):

```typescript
export const PrimaryTones = {
  0: '#000000',      // Pure black
  10: '#21005D',     // Darkest primary
  20: '#381E72',
  30: '#4F378B',
  40: '#6750A4',     // Primary (default)
  50: '#7F67BE',
  60: '#9A82DB',
  70: '#B69DF8',
  80: '#D0BCFF',     // Primary container (light)
  90: '#EADDFF',     // Primary container variant
  95: '#F6EDFF',
  99: '#FFFBFE',     // Almost white
  100: '#FFFFFF',    // Pure white
};
```

### Color Roles

Color roles define how colors are used in the UI:

```typescript
// Light Theme
export const LightTheme = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
  
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  
  shadow: '#000000',
  scrim: '#000000',
  
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  
  // Surface tints for elevation
  surfaceTint: '#6750A4',
};

// Dark Theme
export const DarkTheme = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  
  tertiary: '#EFB8C8',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',
  
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
  
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  
  surface: '#1C1B1F',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  
  outline: '#938F99',
  outlineVariant: '#49454F',
  
  shadow: '#000000',
  scrim: '#000000',
  
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#6750A4',
  
  surfaceTint: '#D0BCFF',
};
```

### Dynamic Color Generation

```typescript
/**
 * Generate a tonal palette from a source color
 */
export function generateTonalPalette(sourceColor: string): TonalPalette {
  // Convert to HSL
  const hsl = hexToHSL(sourceColor);
  
  // Generate tones by adjusting lightness
  return {
    0: hslToHex(hsl.h, hsl.s, 0),
    10: hslToHex(hsl.h, hsl.s, 10),
    20: hslToHex(hsl.h, hsl.s, 20),
    30: hslToHex(hsl.h, hsl.s, 30),
    40: hslToHex(hsl.h, hsl.s, 40),
    50: hslToHex(hsl.h, hsl.s, 50),
    60: hslToHex(hsl.h, hsl.s, 60),
    70: hslToHex(hsl.h, hsl.s, 70),
    80: hslToHex(hsl.h, hsl.s, 80),
    90: hslToHex(hsl.h, hsl.s, 90),
    95: hslToHex(hsl.h, hsl.s, 95),
    99: hslToHex(hsl.h, hsl.s, 99),
    100: hslToHex(hsl.h, hsl.s, 100),
  };
}
```

---

## Typography System

### Type Scale

```typescript
export const MaterialTypeScale = {
  // Display - Largest text
  displayLarge: {
    fontFamily: 'Roboto',
    fontSize: '57px',
    lineHeight: '64px',
    fontWeight: 400,
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontFamily: 'Roboto',
    fontSize: '45px',
    lineHeight: '52px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  displaySmall: {
    fontFamily: 'Roboto',
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  
  // Headline
  headlineLarge: {
    fontFamily: 'Roboto',
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontFamily: 'Roboto',
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontFamily: 'Roboto',
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  
  // Title
  titleLarge: {
    fontFamily: 'Roboto',
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 500,
    letterSpacing: '0px',
  },
  titleMedium: {
    fontFamily: 'Roboto',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 500,
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontFamily: 'Roboto',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  
  // Body
  bodyLarge: {
    fontFamily: 'Roboto',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontFamily: 'Roboto',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontFamily: 'Roboto',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0.4px',
  },
  
  // Label
  labelLarge: {
    fontFamily: 'Roboto',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontFamily: 'Roboto',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontFamily: 'Roboto',
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
};
```

### Font Recommendations

1. **Roboto**: Default for Material Design
2. **Roboto Flex**: Variable font for display text
3. **Roboto Mono**: For code and monospaced content
4. **Roboto Serif**: Alternative for editorial content

---

## Shape System

Material Design 3 defines shape tokens for different component sizes:

```typescript
export const ShapeTokens = {
  // Corner Radii
  none: '0px',
  extraSmall: '4px',
  small: '8px',
  medium: '12px',
  large: '16px',
  extraLarge: '28px',
  full: '9999px',
  
  // Component-specific shapes
  button: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  card: {
    small: '8px',
    medium: '12px',
    large: '16px',
  },
  dialog: {
    small: '12px',
    medium: '16px',
    large: '28px',
  },
  chip: {
    small: '4px',
    medium: '8px',
  },
  badge: {
    full: '9999px',
  },
};
```

---

## Elevation System

Material Design 3 uses elevation to create hierarchy:

```typescript
export const ElevationTokens = {
  level0: {
    boxShadow: 'none',
  },
  level1: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  },
  level2: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  },
  level3: {
    boxShadow: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
  },
  level4: {
    boxShadow: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',
  },
  level5: {
    boxShadow: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
  },
};

// Elevation usage guide
export const ElevationUsage = {
  level0: ['Disabled states', 'Flat buttons', 'Inline elements'],
  level1: ['Cards at rest', 'Contained buttons', 'Search bars'],
  level2: ['Cards on hover', 'FAB at rest', 'Nav drawer'],
  level3: ['FAB on hover', 'Dialogs', 'Date pickers'],
  level4: ['Modal bottom sheets', 'Navigation drawer (modal)'],
  level5: ['Navigation bar (modal)', 'Menus'],
};
```

---

## Component Specifications

### Buttons

```typescript
// Filled Button (Primary)
export const FilledButton = {
  container: {
    height: '40px',
    borderRadius: ShapeTokens.full,
    backgroundColor: 'primary',
    paddingHorizontal: '24px',
    elevation: 'level0',
    hover: {
      elevation: 'level1',
      stateLayerOpacity: 0.08,
    },
    focus: {
      elevation: 'level0',
      stateLayerOpacity: 0.12,
    },
    pressed: {
      elevation: 'level0',
      stateLayerOpacity: 0.12,
    },
  },
  label: {
    ...MaterialTypeScale.labelLarge,
    color: 'onPrimary',
  },
};

// Outlined Button
export const OutlinedButton = {
  container: {
    height: '40px',
    borderRadius: ShapeTokens.full,
    borderWidth: '1px',
    borderColor: 'outline',
    backgroundColor: 'transparent',
    paddingHorizontal: '24px',
    hover: {
      stateLayerOpacity: 0.08,
    },
  },
  label: {
    ...MaterialTypeScale.labelLarge,
    color: 'primary',
  },
};

// Text Button
export const TextButton = {
  container: {
    height: '40px',
    borderRadius: ShapeTokens.full,
    backgroundColor: 'transparent',
    paddingHorizontal: '12px',
  },
  label: {
    ...MaterialTypeScale.labelLarge,
    color: 'primary',
  },
};
```

### Cards

```typescript
export const CardSpec = {
  elevated: {
    container: {
      backgroundColor: 'surface',
      borderRadius: ShapeTokens.medium,
      elevation: 'level1',
      padding: '16px',
      hover: {
        elevation: 'level2',
      },
    },
  },
  filled: {
    container: {
      backgroundColor: 'surfaceVariant',
      borderRadius: ShapeTokens.medium,
      elevation: 'level0',
      padding: '16px',
    },
  },
  outlined: {
    container: {
      backgroundColor: 'surface',
      borderRadius: ShapeTokens.medium,
      borderWidth: '1px',
      borderColor: 'outline',
      elevation: 'level0',
      padding: '16px',
    },
  },
};
```

### Text Fields

```typescript
export const TextFieldSpec = {
  filled: {
    container: {
      height: '56px',
      backgroundColor: 'surfaceVariant',
      borderRadius: ShapeTokens.extraSmall,
      borderBottomWidth: '1px',
      borderBottomColor: 'onSurfaceVariant',
      paddingHorizontal: '16px',
      focus: {
        borderBottomWidth: '2px',
        borderBottomColor: 'primary',
      },
      error: {
        borderBottomColor: 'error',
      },
    },
    label: {
      ...MaterialTypeScale.bodyLarge,
      color: 'onSurfaceVariant',
    },
    input: {
      ...MaterialTypeScale.bodyLarge,
      color: 'onSurface',
    },
  },
  outlined: {
    container: {
      height: '56px',
      backgroundColor: 'transparent',
      borderRadius: ShapeTokens.extraSmall,
      borderWidth: '1px',
      borderColor: 'outline',
      paddingHorizontal: '16px',
      focus: {
        borderWidth: '2px',
        borderColor: 'primary',
      },
    },
  },
};
```

---

## Motion & Animation

### Duration

```typescript
export const MotionDuration = {
  short1: '50ms',    // Icon state changes
  short2: '100ms',   // Checkboxes, switches
  short3: '150ms',   // Simple transitions
  short4: '200ms',   // Standard transitions
  medium1: '250ms',  // List items
  medium2: '300ms',  // Expanding panels
  medium3: '350ms',  // Large expanding elements
  medium4: '400ms',  // Full-screen transitions
  long1: '450ms',    // Complex animations
  long2: '500ms',    // Page transitions
  long3: '550ms',    // Large transformations
  long4: '600ms',    // Extra large transitions
};
```

### Easing

```typescript
export const MotionEasing = {
  // Material Design 3 Standard Easing
  standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  
  // Emphasized Easing (recommended for most animations)
  emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
  
  // Legacy easing (for backwards compatibility)
  legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  legacyDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  legacyAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
};
```

### Animation Patterns

```typescript
// Fade In/Out
export const fadeAnimation = {
  enter: {
    duration: MotionDuration.short4,
    easing: MotionEasing.emphasized,
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  exit: {
    duration: MotionDuration.short3,
    easing: MotionEasing.emphasized,
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
};

// Scale In/Out
export const scaleAnimation = {
  enter: {
    duration: MotionDuration.medium2,
    easing: MotionEasing.emphasizedDecelerate,
    from: { transform: 'scale(0.8)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  exit: {
    duration: MotionDuration.short4,
    easing: MotionEasing.emphasizedAccelerate,
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.8)', opacity: 0 },
  },
};

// Slide In/Out
export const slideAnimation = {
  enter: {
    duration: MotionDuration.medium3,
    easing: MotionEasing.emphasizedDecelerate,
    from: { transform: 'translateY(40px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
};
```

---

## State Layers

State layers provide visual feedback for interactive elements:

```typescript
export const StateLayer = {
  hover: {
    opacity: 0.08,
  },
  focus: {
    opacity: 0.12,
  },
  pressed: {
    opacity: 0.12,
  },
  dragged: {
    opacity: 0.16,
  },
};

// Usage example
const ButtonWithStateLayer = styled.button`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    background-color: currentColor;
    transition: opacity ${MotionDuration.short1} ${MotionEasing.standard};
  }
  
  &:hover::before {
    opacity: ${StateLayer.hover.opacity};
  }
  
  &:focus::before {
    opacity: ${StateLayer.focus.opacity};
  }
  
  &:active::before {
    opacity: ${StateLayer.pressed.opacity};
  }
`;
```

---

## Implementation Examples

### Complete Button Component

```typescript
import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const StyledButton = styled.button<{ variant: string; size: string }>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.1px;
  border-radius: 100px;
  transition: all 200ms cubic-bezier(0.2, 0.0, 0, 1.0);
  position: relative;
  overflow: hidden;
  
  /* Size variants */
  ${props => props.size === 'small' && `
    height: 32px;
    padding: 0 16px;
  `}
  
  ${props => props.size === 'medium' && `
    height: 40px;
    padding: 0 24px;
  `}
  
  ${props => props.size === 'large' && `
    height: 48px;
    padding: 0 32px;
  `}
  
  /* Variant styles */
  ${props => props.variant === 'filled' && `
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
    
    &:hover {
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      box-shadow: none;
    }
  `}
  
  ${props => props.variant === 'outlined' && `
    background-color: transparent;
    color: var(--md-sys-color-primary);
    border: 1px solid var(--md-sys-color-outline);
  `}
  
  ${props => props.variant === 'text' && `
    background-color: transparent;
    color: var(--md-sys-color-primary);
    padding: 0 12px;
  `}
  
  /* State layer */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
    transition: opacity 50ms cubic-bezier(0.2, 0.0, 0, 1.0);
  }
  
  &:hover::before {
    opacity: 0.08;
  }
  
  &:focus::before {
    opacity: 0.12;
  }
  
  &:active::before {
    opacity: 0.12;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;
    box-shadow: none;
    
    &::before {
      display: none;
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  disabled = false,
  icon,
  children,
  onClick,
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {children}
    </StyledButton>
  );
};
```

### Complete Card Component

```typescript
import React from 'react';
import styled from 'styled-components';

interface CardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const StyledCard = styled.div<{ variant: string; interactive: boolean }>`
  border-radius: 12px;
  padding: 16px;
  transition: all 200ms cubic-bezier(0.2, 0.0, 0, 1.0);
  
  ${props => props.variant === 'elevated' && `
    background-color: var(--md-sys-color-surface);
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
    
    ${props.interactive && `
      cursor: pointer;
      
      &:hover {
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
      }
    `}
  `}
  
  ${props => props.variant === 'filled' && `
    background-color: var(--md-sys-color-surface-variant);
  `}
  
  ${props => props.variant === 'outlined' && `
    background-color: var(--md-sys-color-surface);
    border: 1px solid var(--md-sys-color-outline);
  `}
`;

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  children,
  onClick,
  className,
}) => {
  return (
    <StyledCard
      variant={variant}
      interactive={!!onClick}
      onClick={onClick}
      className={className}
    >
      {children}
    </StyledCard>
  );
};
```

---

## CSS Custom Properties Setup

```css
/* Light Theme */
:root {
  /* Primary */
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-on-primary-container: #21005D;
  
  /* Secondary */
  --md-sys-color-secondary: #625B71;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #E8DEF8;
  --md-sys-color-on-secondary-container: #1D192B;
  
  /* Tertiary */
  --md-sys-color-tertiary: #7D5260;
  --md-sys-color-on-tertiary: #FFFFFF;
  --md-sys-color-tertiary-container: #FFD8E4;
  --md-sys-color-on-tertiary-container: #31111D;
  
  /* Error */
  --md-sys-color-error: #B3261E;
  --md-sys-color-on-error: #FFFFFF;
  --md-sys-color-error-container: #F9DEDC;
  --md-sys-color-on-error-container: #410E0B;
  
  /* Background */
  --md-sys-color-background: #FFFBFE;
  --md-sys-color-on-background: #1C1B1F;
  
  /* Surface */
  --md-sys-color-surface: #FFFBFE;
  --md-sys-color-on-surface: #1C1B1F;
  --md-sys-color-surface-variant: #E7E0EC;
  --md-sys-color-on-surface-variant: #49454F;
  
  /* Outline */
  --md-sys-color-outline: #79747E;
  --md-sys-color-outline-variant: #CAC4D0;
}

/* Dark Theme */
[data-theme="dark"] {
  --md-sys-color-primary: #D0BCFF;
  --md-sys-color-on-primary: #381E72;
  --md-sys-color-primary-container: #4F378B;
  --md-sys-color-on-primary-container: #EADDFF;
  
  /* ... other dark theme colors */
  
  --md-sys-color-background: #1C1B1F;
  --md-sys-color-on-background: #E6E1E5;
  --md-sys-color-surface: #1C1B1F;
  --md-sys-color-on-surface: #E6E1E5;
}
```

---

## Resources

- [Material Design 3 Official Site](https://m3.material.io/)
- [Material Design 3 Figma Kit](https://www.figma.com/community/file/1035203688168086460)
- [Material Theme Builder](https://m3.material.io/theme-builder)
- [Material Components Web](https://github.com/material-components/material-components-web)

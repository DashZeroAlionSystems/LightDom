# Material Design 3 Implementation Guide

## Overview
Complete implementation guide for Material Design 3 in the LightDom Design System.

---

## Color System Implementation

### Dynamic Color
Material Design 3 introduces dynamic color - colors that adapt to user preferences and context.

```typescript
// Color extraction from user wallpaper (Android 12+)
interface DynamicColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  // ... other color roles
}

function generateDynamicColors(seedColor: string): DynamicColorScheme {
  // Use Material Color Utilities to generate tonal palettes
  const palette = TonalPalette.fromHue(
    Hct.fromInt(argbFromHex(seedColor)).hue
  );
  
  return {
    primary: palette.tone(40),
    onPrimary: palette.tone(100),
    primaryContainer: palette.tone(90),
    onPrimaryContainer: palette.tone(10),
    // ... continue for all roles
  };
}
```

### Tonal Palettes
Generate complete tonal palettes for each color:

```typescript
export function generateTonalPalette(hue: number, chroma: number) {
  const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
  const palette: Record<number, string> = {};
  
  tones.forEach(tone => {
    const color = Hct.from(hue, chroma, tone);
    palette[tone] = hexFromArgb(color.toInt());
  });
  
  return palette;
}

// Usage
const primaryPalette = generateTonalPalette(266, 50); // Purple hue
const secondaryPalette = generateTonalPalette(280, 40); // Pink hue
```

### Surface Tints
Apply subtle color tints to surfaces for depth:

```typescript
interface SurfaceTint {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  color: string;
}

function getSurfaceColor(level: number, scheme: 'light' | 'dark'): string {
  const surfaceTints = {
    light: {
      0: '#FFFBFE', // No tint
      1: '#F7F2FA', // Slight tint
      2: '#F3EDF7',
      3: '#EEE8F4',
      4: '#ECE6F0',
      5: '#E6E0E9',
    },
    dark: {
      0: '#1C1B1F', // No tint
      1: '#201F23',
      2: '#25242A',
      3: '#2A2930',
      4: '#2E2D35',
      5: '#33323A',
    },
  };
  
  return surfaceTints[scheme][level] || surfaceTints[scheme][0];
}
```

### State Layers
Implement hover, focus, and pressed states:

```typescript
interface StateLayerConfig {
  state: 'hover' | 'focus' | 'pressed' | 'dragged';
  opacity: number;
  color: string;
}

function getStateLayer(config: StateLayerConfig): string {
  const { state, opacity: customOpacity, color } = config;
  
  const defaultOpacity = {
    hover: 0.08,
    focus: 0.12,
    pressed: 0.12,
    dragged: 0.16,
  };
  
  const opacity = customOpacity ?? defaultOpacity[state];
  
  // Convert color to RGBA with opacity
  const rgb = hexToRgb(color);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

// Usage in CSS
const buttonStyles = css`
  background-color: ${({ theme }) => theme.colors.primary};
  
  &:hover::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${({ theme }) => 
      getStateLayer({ 
        state: 'hover', 
        color: theme.colors.onPrimary 
      })
    };
  }
  
  &:focus-visible::before {
    background-color: ${({ theme }) => 
      getStateLayer({ 
        state: 'focus', 
        color: theme.colors.onPrimary 
      })
    };
  }
`;
```

---

## Typography Implementation

### Type Scale System
Implement all 15 Material Design 3 type scales:

```typescript
export const MD3TypeScale = {
  displayLarge: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '57px',
    fontWeight: 400,
    lineHeight: '64px',
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '45px',
    fontWeight: 400,
    lineHeight: '52px',
    letterSpacing: '0px',
  },
  displaySmall: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '36px',
    fontWeight: 400,
    lineHeight: '44px',
    letterSpacing: '0px',
  },
  headlineLarge: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '32px',
    fontWeight: 400,
    lineHeight: '40px',
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '28px',
    fontWeight: 400,
    lineHeight: '36px',
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '24px',
    fontWeight: 400,
    lineHeight: '32px',
    letterSpacing: '0px',
  },
  titleLarge: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '22px',
    fontWeight: 400,
    lineHeight: '28px',
    letterSpacing: '0px',
  },
  titleMedium: {
    fontFamily: '"Roboto Medium", sans-serif',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontFamily: '"Roboto Medium", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  bodyLarge: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
    letterSpacing: '0.4px',
  },
  labelLarge: {
    fontFamily: '"Roboto Medium", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontFamily: '"Roboto Medium", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontFamily: '"Roboto Medium", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
};

// Helper to apply type scale
function applyTypeScale(scale: keyof typeof MD3TypeScale) {
  const style = MD3TypeScale[scale];
  
  return css`
    font-family: ${style.fontFamily};
    font-size: ${style.fontSize};
    font-weight: ${style.fontWeight};
    line-height: ${style.lineHeight};
    letter-spacing: ${style.letterSpacing};
  `;
}
```

---

## Shape System Implementation

### Corner Shapes
Define shape tokens for different sizes:

```typescript
export const MD3Shapes = {
  corner: {
    none: '0px',
    extraSmall: '4px',
    small: '8px',
    medium: '12px',
    large: '16px',
    extraLarge: '28px',
    full: '9999px',
  },
  
  // Component-specific shapes
  component: {
    button: 'small', // 8px
    chip: 'small', // 8px
    card: 'medium', // 12px
    dialog: 'extraLarge', // 28px
    fab: 'large', // 16px (for FAB small), extraLarge (28px for FAB large)
    navigationDrawer: 'large', // 16px on one side only
    textField: 'extraSmall', // 4px top corners
    bottomSheet: 'extraLarge', // 28px top corners only
  },
};

// Apply shape with specific corners
function getShape(
  size: keyof typeof MD3Shapes.corner,
  corners: 'all' | 'top' | 'bottom' | 'left' | 'right' | number[] = 'all'
): string {
  const radius = MD3Shapes.corner[size];
  
  if (corners === 'all') {
    return `border-radius: ${radius};`;
  }
  
  if (corners === 'top') {
    return `border-top-left-radius: ${radius}; border-top-right-radius: ${radius};`;
  }
  
  if (corners === 'bottom') {
    return `border-bottom-left-radius: ${radius}; border-bottom-right-radius: ${radius};`;
  }
  
  if (Array.isArray(corners)) {
    const [tl, tr, br, bl] = corners.map(i => MD3Shapes.corner[size]);
    return `border-radius: ${tl} ${tr} ${br} ${bl};`;
  }
  
  return '';
}
```

---

## Motion System Implementation

### Emphasized Easing
Material Design 3's signature easing curve:

```typescript
export const MD3Easing = {
  // Primary curves
  emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  
  // Standard curves
  standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  standardAccelerate: 'cubic-bezier(0.3, 0.0, 1, 1)',
  standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
  
  // Legacy curves (for backwards compatibility)
  legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  legacyAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  legacyDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  
  // Linear
  linear: 'cubic-bezier(0, 0, 1, 1)',
};

export const MD3Duration = {
  // Short (micro-interactions)
  short1: '50ms',
  short2: '100ms',
  short3: '150ms',
  short4: '200ms',
  
  // Medium (most transitions)
  medium1: '250ms',
  medium2: '300ms',
  medium3: '350ms',
  medium4: '400ms',
  
  // Long (complex transitions)
  long1: '450ms',
  long2: '500ms',
  long3: '550ms',
  long4: '600ms',
  
  // Extra Long (page transitions)
  extraLong1: '700ms',
  extraLong2: '800ms',
  extraLong3: '900ms',
  extraLong4: '1000ms',
};
```

### Transition Patterns
Common Material Design 3 transitions:

```typescript
// Fade through (content replacement)
const fadeThrough = css`
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .fade-through-exit {
    animation: fadeOut ${MD3Duration.short4} ${MD3Easing.emphasizedAccelerate};
  }
  
  .fade-through-enter {
    animation: fadeIn ${MD3Duration.short4} ${MD3Easing.emphasizedDecelerate};
    animation-delay: ${MD3Duration.short2};
  }
`;

// Container transform (shared element)
const containerTransform = css`
  .container-transform {
    transition: 
      width ${MD3Duration.medium2} ${MD3Easing.emphasized},
      height ${MD3Duration.medium2} ${MD3Easing.emphasized},
      border-radius ${MD3Duration.medium2} ${MD3Easing.emphasized};
  }
`;

// Elevation change
const elevationChange = css`
  .elevation-change {
    transition: box-shadow ${MD3Duration.short4} ${MD3Easing.emphasized};
  }
`;
```

---

## Component Implementation

### Button Component
Full Material Design 3 button implementation:

```typescript
interface MD3ButtonProps {
  variant: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const MD3Button: React.FC<MD3ButtonProps> = ({
  variant,
  size = 'medium',
  icon,
  disabled,
  children,
  onClick,
}) => {
  const variants = {
    filled: css`
      background-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.onPrimary};
      box-shadow: none;
      
      &:hover::before {
        opacity: ${MD3StateLayer.hover};
      }
      
      &:focus-visible::before {
        opacity: ${MD3StateLayer.focus};
      }
      
      &:active::before {
        opacity: ${MD3StateLayer.pressed};
      }
    `,
    
    outlined: css`
      background-color: transparent;
      color: ${({ theme }) => theme.colors.primary};
      border: 1px solid ${({ theme }) => theme.colors.outline};
      
      &:hover {
        background-color: ${({ theme }) => 
          getStateLayer({ state: 'hover', color: theme.colors.primary })
        };
      }
    `,
    
    text: css`
      background-color: transparent;
      color: ${({ theme }) => theme.colors.primary};
      
      &:hover {
        background-color: ${({ theme }) => 
          getStateLayer({ state: 'hover', color: theme.colors.primary })
        };
      }
    `,
    
    elevated: css`
      background-color: ${({ theme }) => getSurfaceColor(1, 'light')};
      color: ${({ theme }) => theme.colors.primary};
      box-shadow: ${MD3Elevation.level1};
      
      &:hover {
        box-shadow: ${MD3Elevation.level2};
      }
    `,
    
    tonal: css`
      background-color: ${({ theme }) => theme.colors.secondaryContainer};
      color: ${({ theme }) => theme.colors.onSecondaryContainer};
      
      &:hover::before {
        opacity: ${MD3StateLayer.hover};
      }
    `,
  };
  
  const sizes = {
    small: { height: '32px', padding: '0 12px', fontSize: '12px' },
    medium: { height: '40px', padding: '0 24px', fontSize: '14px' },
    large: { height: '48px', padding: '0 28px', fontSize: '16px' },
  };
  
  return (
    <button
      css={[
        baseButtonStyles,
        variants[variant],
        sizes[size],
      ]}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span className="icon">{icon}</span>}
      <span className="label">{children}</span>
    </button>
  );
};

const baseButtonStyles = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: ${MD3Shapes.corner.full};
  font-weight: 500;
  cursor: pointer;
  transition: 
    box-shadow ${MD3Duration.short2} ${MD3Easing.emphasized},
    background-color ${MD3Duration.short2} ${MD3Easing.emphasized};
  
  /* State layer */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: currentColor;
    opacity: 0;
    transition: opacity ${MD3Duration.short1} ${MD3Easing.linear};
    pointer-events: none;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  /* Focus indicator */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
```

### Card Component
Material Design 3 card with elevation tints:

```typescript
interface MD3CardProps {
  variant: 'elevated' | 'filled' | 'outlined';
  clickable?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const MD3Card: React.FC<MD3CardProps> = ({
  variant,
  clickable,
  children,
  onClick,
}) => {
  const variants = {
    elevated: css`
      background-color: ${({ theme }) => getSurfaceColor(1, 'light')};
      box-shadow: ${MD3Elevation.level1};
      
      ${clickable && css`
        cursor: pointer;
        
        &:hover {
          box-shadow: ${MD3Elevation.level2};
        }
        
        &:active {
          box-shadow: ${MD3Elevation.level1};
        }
      `}
    `,
    
    filled: css`
      background-color: ${({ theme }) => theme.colors.surfaceVariant};
      box-shadow: none;
      
      ${clickable && css`
        cursor: pointer;
        
        &:hover {
          background-color: ${({ theme }) => 
            getStateLayer({ 
              state: 'hover', 
              color: theme.colors.onSurface 
            })
          };
        }
      `}
    `,
    
    outlined: css`
      background-color: ${({ theme }) => theme.colors.surface};
      border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
      box-shadow: none;
      
      ${clickable && css`
        cursor: pointer;
        
        &:hover {
          background-color: ${({ theme }) => 
            getStateLayer({ 
              state: 'hover', 
              color: theme.colors.onSurface 
            })
          };
        }
      `}
    `,
  };
  
  return (
    <div
      css={[
        baseCardStyles,
        variants[variant],
      ]}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};

const baseCardStyles = css`
  border-radius: ${MD3Shapes.corner.medium};
  padding: 16px;
  transition: 
    box-shadow ${MD3Duration.short4} ${MD3Easing.emphasized},
    background-color ${MD3Duration.short2} ${MD3Easing.emphasized};
`;
```

---

## Accessibility Implementation

### Focus Indicators
Material Design 3 requires visible focus indicators:

```typescript
const focusIndicatorStyles = css`
  /* Default focus indicator */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${MD3Shapes.corner.small};
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    :focus-visible {
      outline-width: 3px;
      outline-offset: 3px;
    }
  }
  
  /* Remove outline for non-keyboard focus */
  :focus:not(:focus-visible) {
    outline: none;
  }
`;
```

### Color Contrast
Ensure WCAG AA compliance (4.5:1 for text):

```typescript
function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  const minimumRatio = level === 'AA' ? 4.5 : 7;
  
  return ratio >= minimumRatio;
}

// Auto-adjust text color for contrast
function getAccessibleTextColor(
  background: string,
  preferredColor: string
): string {
  if (meetsContrastRequirement(preferredColor, background)) {
    return preferredColor;
  }
  
  // Calculate luminance and return white or black
  const luminance = getLuminance(background);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

---

## Dark Theme Implementation

### Theme Switcher
Implement seamless theme switching:

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  effectiveTheme: 'light' | 'dark';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);
  
  const colors = effectiveTheme === 'light' ? LightTheme.colors : DarkTheme.colors;
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      <ThemeStyleProvider theme={colors}>
        {children}
      </ThemeStyleProvider>
    </ThemeContext.Provider>
  );
};
```

---

## TODO: Implementation Tasks

### High Priority
- [ ] Implement full color token system with all tonal palettes
- [ ] Create all 15 Material Design 3 typography scales
- [ ] Set up shape tokens and apply to all components
- [ ] Implement state layers for all interactive elements
- [ ] Add focus indicators to all focusable elements
- [ ] Ensure color contrast meets WCAG AA standards

### Medium Priority
- [ ] Implement dynamic color extraction
- [ ] Add surface tint system
- [ ] Create motion tokens and transitions
- [ ] Build elevation system with tonal overlays
- [ ] Implement dark theme with proper color mapping
- [ ] Add theme switcher UI

### Low Priority
- [ ] Add reduced motion support
- [ ] Implement high contrast mode
- [ ] Add theme customization API
- [ ] Create theme generator tool
- [ ] Document all design decisions
- [ ] Create Storybook examples

---

**Last Updated**: 2025-10-28
**Version**: 1.0.0
**Compliance**: Material Design 3 (2023)

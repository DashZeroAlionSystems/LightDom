/**
 * Unified Design System for LightDom
 * Consolidates Material Design 3, Tailwind, and custom design tokens
 * 
 * This is the SINGLE SOURCE OF TRUTH for all design system tokens, utilities, and components.
 * All other design system files should be deprecated in favor of this unified system.
 * 
 * @version 2.0.0
 * @date 2025-10-28
 */

import React from 'react';

// ============================================================================
// COLOR SYSTEM - Material Design 3 with Tailwind Integration
// ============================================================================

export const Colors = {
  // Primary Brand Color (Purple)
  primary: {
    50: '#f3e8ff',
    100: '#e4d4f1',
    200: '#d8b9fe',
    300: '#c084fc',
    400: '#a855f7',
    500: '#9333ea',
    600: '#7c3aed',  // Main primary
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#3b0764',
  },

  // Secondary Color (Fuchsia/Pink)
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },

  // Accent Colors
  accent: {
    blue: '#3b82f6',
    cyan: '#06b6d4',
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
    purple: '#9333ea',
    pink: '#ec4899',
  },

  // Semantic Colors
  semantic: {
    success: {
      light: '#86efac',
      main: '#22c55e',
      dark: '#15803d',
    },
    warning: {
      light: '#fcd34d',
      main: '#f59e0b',
      dark: '#b45309',
    },
    error: {
      light: '#fca5a5',
      main: '#ef4444',
      dark: '#b91c1c',
    },
    info: {
      light: '#7dd3fc',
      main: '#0ea5e9',
      dark: '#0369a1',
    },
  },

  // Neutral/Gray Scale
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Dark Theme Specific
  dark: {
    background: '#0a0a0a',
    surface: '#171717',
    surfaceVariant: '#262626',
    border: '#404040',
    borderLight: '#525252',
    
    text: '#fafafa',
    textSecondary: '#a3a3a3',
    textTertiary: '#737373',
    textDisabled: '#525252',
    
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#fafafa',
    onSurface: '#fafafa',
  },

  // Light Theme Specific
  light: {
    background: '#ffffff',
    surface: '#fafafa',
    surfaceVariant: '#f5f5f5',
    border: '#e5e5e5',
    borderLight: '#d4d4d4',
    
    text: '#171717',
    textSecondary: '#525252',
    textTertiary: '#737373',
    textDisabled: '#a3a3a3',
    
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#171717',
    onSurface: '#171717',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
    secondary: 'linear-gradient(135deg, #c026d3 0%, #d946ef 100%)',
    accent: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    glass: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM - Material Design 3 Type Scale
// ============================================================================

export const Typography = {
  // Display Styles (Large headlines)
  display: {
    large: {
      fontSize: '57px',
      lineHeight: '64px',
      fontWeight: 400,
      letterSpacing: '-0.25px',
    },
    medium: {
      fontSize: '45px',
      lineHeight: '52px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
    small: {
      fontSize: '36px',
      lineHeight: '44px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
  },

  // Headline Styles
  headline: {
    large: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
    medium: {
      fontSize: '28px',
      lineHeight: '36px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
    small: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
  },

  // Title Styles
  title: {
    large: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
    medium: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 500,
      letterSpacing: '0.15px',
    },
    small: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
  },

  // Body Styles
  body: {
    large: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
      letterSpacing: '0.5px',
    },
    medium: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0.25px',
    },
    small: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      letterSpacing: '0.4px',
    },
  },

  // Label Styles
  label: {
    large: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
    medium: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
    small: {
      fontSize: '11px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
  },
};

// ============================================================================
// SPACING SYSTEM - 8px Base Unit
// ============================================================================

export const Spacing = {
  0: '0px',
  0.5: '2px',   // 0.5 * 4
  1: '4px',     // 1 * 4
  1.5: '6px',   // 1.5 * 4
  2: '8px',     // 2 * 4 (base unit)
  2.5: '10px',  // 2.5 * 4
  3: '12px',    // 3 * 4
  3.5: '14px',  // 3.5 * 4
  4: '16px',    // 4 * 4
  5: '20px',    // 5 * 4
  6: '24px',    // 6 * 4
  7: '28px',    // 7 * 4
  8: '32px',    // 8 * 4
  9: '36px',    // 9 * 4
  10: '40px',   // 10 * 4
  11: '44px',   // 11 * 4
  12: '48px',   // 12 * 4
  14: '56px',   // 14 * 4
  16: '64px',   // 16 * 4
  20: '80px',   // 20 * 4
  24: '96px',   // 24 * 4
  28: '112px',  // 28 * 4
  32: '128px',  // 32 * 4
  36: '144px',  // 36 * 4
  40: '160px',  // 40 * 4
  44: '176px',  // 44 * 4
  48: '192px',  // 48 * 4
  52: '208px',  // 52 * 4
  56: '224px',  // 56 * 4
  60: '240px',  // 60 * 4
  64: '256px',  // 64 * 4
  72: '288px',  // 72 * 4
  80: '320px',  // 80 * 4
  96: '384px',  // 96 * 4
};

// ============================================================================
// ELEVATION/SHADOW SYSTEM - Material Design 3
// ============================================================================

export const Shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  
  // Colored shadows for brand elements
  primaryGlow: '0 0 20px rgba(124, 58, 237, 0.3)',
  secondaryGlow: '0 0 20px rgba(192, 38, 211, 0.3)',
  successGlow: '0 0 20px rgba(34, 197, 94, 0.3)',
  errorGlow: '0 0 20px rgba(239, 68, 68, 0.3)',
};

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const Radii = {
  none: '0px',
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
};

// ============================================================================
// ANIMATION/TRANSITION SYSTEM
// ============================================================================

export const Animations = {
  // Transition Durations
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing Functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Material Design easing
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },

  // Common Transitions
  transitions: {
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================================================
// BREAKPOINTS SYSTEM (Responsive Design)
// ============================================================================

export const Breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// Z-INDEX SYSTEM
// ============================================================================

export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  notification: 1090,
};

// ============================================================================
// COMPONENT STYLE PRESETS
// ============================================================================

export const ComponentStyles = {
  // Button Variants
  button: {
    filled: {
      background: Colors.gradients.primary,
      color: Colors.dark.onPrimary,
      border: 'none',
      borderRadius: Radii.md,
      padding: `${Spacing[3]} ${Spacing[6]}`,
      fontSize: Typography.label.large.fontSize,
      fontWeight: Typography.label.large.fontWeight,
      boxShadow: Shadows.md,
      transition: Animations.transitions.all,
      cursor: 'pointer',
      '&:hover': {
        boxShadow: Shadows.lg,
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    },
    outlined: {
      background: 'transparent',
      color: Colors.primary[600],
      border: `1px solid ${Colors.primary[600]}`,
      borderRadius: Radii.md,
      padding: `${Spacing[3]} ${Spacing[6]}`,
      fontSize: Typography.label.large.fontSize,
      fontWeight: Typography.label.large.fontWeight,
      transition: Animations.transitions.all,
      cursor: 'pointer',
      '&:hover': {
        background: `${Colors.primary[600]}10`,
      },
    },
    text: {
      background: 'transparent',
      color: Colors.primary[600],
      border: 'none',
      borderRadius: Radii.md,
      padding: `${Spacing[3]} ${Spacing[6]}`,
      fontSize: Typography.label.large.fontSize,
      fontWeight: Typography.label.large.fontWeight,
      transition: Animations.transitions.all,
      cursor: 'pointer',
      '&:hover': {
        background: `${Colors.primary[600]}10`,
      },
    },
  },

  // Card Variants
  card: {
    elevated: {
      background: Colors.dark.surface,
      borderRadius: Radii.lg,
      padding: Spacing[6],
      boxShadow: Shadows.lg,
      border: `1px solid ${Colors.dark.border}`,
      transition: Animations.transitions.all,
      '&:hover': {
        boxShadow: Shadows.xl,
      },
    },
    filled: {
      background: Colors.dark.surfaceVariant,
      borderRadius: Radii.lg,
      padding: Spacing[6],
      border: 'none',
    },
    outlined: {
      background: 'transparent',
      borderRadius: Radii.lg,
      padding: Spacing[6],
      border: `1px solid ${Colors.dark.border}`,
    },
    glass: {
      background: 'rgba(23, 23, 23, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: Radii.lg,
      padding: Spacing[6],
      border: `1px solid ${Colors.dark.borderLight}`,
      boxShadow: Shadows.lg,
    },
  },

  // Input Field
  input: {
    outlined: {
      background: Colors.dark.surface,
      color: Colors.dark.text,
      border: `1px solid ${Colors.dark.border}`,
      borderRadius: Radii.md,
      padding: `${Spacing[3]} ${Spacing[4]}`,
      fontSize: Typography.body.large.fontSize,
      transition: Animations.transitions.all,
      '&:focus': {
        borderColor: Colors.primary[600],
        boxShadow: `0 0 0 3px ${Colors.primary[600]}20`,
        outline: 'none',
      },
      '&::placeholder': {
        color: Colors.dark.textTertiary,
      },
    },
    filled: {
      background: Colors.dark.surfaceVariant,
      color: Colors.dark.text,
      border: 'none',
      borderBottom: `2px solid ${Colors.dark.border}`,
      borderRadius: `${Radii.md} ${Radii.md} 0 0`,
      padding: `${Spacing[4]} ${Spacing[4]} ${Spacing[3]}`,
      fontSize: Typography.body.large.fontSize,
      transition: Animations.transitions.all,
      '&:focus': {
        borderBottomColor: Colors.primary[600],
        outline: 'none',
      },
    },
  },

  // Badge/Chip
  badge: {
    filled: {
      background: Colors.gradients.primary,
      color: Colors.dark.onPrimary,
      borderRadius: Radii.full,
      padding: `${Spacing[1]} ${Spacing[3]}`,
      fontSize: Typography.label.small.fontSize,
      fontWeight: Typography.label.small.fontWeight,
      display: 'inline-flex',
      alignItems: 'center',
      gap: Spacing[1],
    },
    outlined: {
      background: 'transparent',
      color: Colors.primary[600],
      border: `1px solid ${Colors.primary[600]}`,
      borderRadius: Radii.full,
      padding: `${Spacing[1]} ${Spacing[3]}`,
      fontSize: Typography.label.small.fontSize,
      fontWeight: Typography.label.small.fontWeight,
      display: 'inline-flex',
      alignItems: 'center',
      gap: Spacing[1],
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get theme-aware color based on current theme mode
 */
export const getColor = (colorPath: string, theme: 'light' | 'dark' = 'dark') => {
  const parts = colorPath.split('.');
  let color: any = Colors;
  
  for (const part of parts) {
    if (color[part]) {
      color = color[part];
    } else {
      return Colors.dark.text; // Fallback
    }
  }
  
  return typeof color === 'string' ? color : Colors.dark.text;
};

/**
 * Get responsive value based on breakpoint
 */
export const responsive = (values: {
  xs?: any;
  sm?: any;
  md?: any;
  lg?: any;
  xl?: any;
  '2xl'?: any;
}) => {
  // This would be used with CSS-in-JS or inline styles
  return values;
};

/**
 * Merge multiple style objects
 */
export const mergeStyles = (...styles: React.CSSProperties[]): React.CSSProperties => {
  return Object.assign({}, ...styles);
};

// ============================================================================
// TAILWIND CSS CLASS UTILITIES
// ============================================================================

/**
 * Generate Tailwind classes for common patterns
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Preset Tailwind class combinations
export const TailwindPresets = {
  // Container presets
  container: {
    centered: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    fullWidth: 'w-full',
    section: 'py-12 sm:py-16 lg:py-20',
  },

  // Flexbox presets
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-start',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
  },

  // Grid presets
  grid: {
    auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  },

  // Text presets
  text: {
    heading: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    subheading: 'text-lg sm:text-xl font-semibold',
    body: 'text-base leading-relaxed',
    muted: 'text-sm text-gray-500',
  },

  // Card presets
  card: {
    default: 'bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow',
    glass: 'bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-lg p-6',
  },

  // Button presets
  button: {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-medium px-6 py-3 rounded-lg transition-all duration-200',
  },
};

// ============================================================================
// EXPORT DEFAULT DESIGN SYSTEM OBJECT
// ============================================================================

const UnifiedDesignSystem = {
  Colors,
  Typography,
  Spacing,
  Shadows,
  Radii,
  Animations,
  Breakpoints,
  ZIndex,
  ComponentStyles,
  getColor,
  responsive,
  mergeStyles,
  cn,
  TailwindPresets,
};

export default UnifiedDesignSystem;

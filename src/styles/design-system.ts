/**
 * LightDom Space-Bridge Platform - Comprehensive Design System
 * Modern, accessible, and user-friendly design tokens and components
 */

// Color Palette - Modern, accessible colors with semantic meaning
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Secondary Colors (Purple/Violet)
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main secondary
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  
  // Accent Colors (Pink/Magenta)
  accent: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // Main accent
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },
  
  // Success Colors (Green)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // Warning Colors (Orange/Amber)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  // Error Colors (Red)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  // Neutral Colors (Gray/Slate)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Dark Mode Colors - Exodus-inspired
  dark: {
    background: '#0A0E27',      // Deep navy (Exodus-inspired)
    surface: '#151A31',         // Lighter navy for cards
    surfaceElevated: '#1E2438', // Elevated surfaces
    surfaceHover: '#252B45',    // Hover state
    border: '#2E3349',          // Border color
    borderLight: '#40444B',     // Lighter border
    text: '#FFFFFF',            // Primary text
    textSecondary: '#B9BBBE',   // Secondary text
    textTertiary: '#72767D',    // Tertiary text
  },
  
  // Exodus-inspired gradients
  gradients: {
    primary: 'linear-gradient(135deg, #5865F2 0%, #7C5CFF 100%)',
    secondary: 'linear-gradient(135deg, #6C7BFF 0%, #9D7CFF 100%)',
    hero: 'linear-gradient(135deg, #0A0E27 0%, #1E2438 50%, #252B45 100%)',
    card: 'linear-gradient(135deg, #151A31 0%, #1E2438 100%)',
  },
  
  // Light Mode Colors
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceElevated: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
  },
} as const;

// Typography Scale - Modern, readable typography
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
    display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem',    // 128px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Spacing Scale - Consistent spacing system
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// Border Radius - Modern, consistent rounded corners
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Shadows - Modern, layered shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
  
  // Colored shadows for modern effects
  primary: '0 4px 14px 0 rgb(14 165 233 / 0.15)',
  secondary: '0 4px 14px 0 rgb(168 85 247 / 0.15)',
  accent: '0 4px 14px 0 rgb(236 72 153 / 0.15)',
  success: '0 4px 14px 0 rgb(34 197 94 / 0.15)',
  warning: '0 4px 14px 0 rgb(245 158 11 / 0.15)',
  error: '0 4px 14px 0 rgb(239 68 68 / 0.15)',
} as const;

// Animation and Transitions
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Modern easing functions
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    snappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  
  // Predefined animations
  fadeIn: 'fadeIn 0.3s ease-out',
  fadeOut: 'fadeOut 0.3s ease-out',
  slideInUp: 'slideInUp 0.3s ease-out',
  slideInDown: 'slideInDown 0.3s ease-out',
  slideInLeft: 'slideInLeft 0.3s ease-out',
  slideInRight: 'slideInRight 0.3s ease-out',
  scaleIn: 'scaleIn 0.2s ease-out',
  bounce: 'bounce 0.6s ease-in-out',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
} as const;

// Breakpoints - Responsive design system
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale - Layering system
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '3rem',      // 48px
      xl: '3.5rem',    // 56px
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
      xl: '1.25rem 2.5rem',
    },
    borderRadius: borderRadius.lg,
  },
  
  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.75rem 1rem',
      lg: '1rem 1.25rem',
    },
    borderRadius: borderRadius.md,
  },
  
  card: {
    padding: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
    borderRadius: borderRadius.xl,
    shadow: shadows.md,
  },
  
  modal: {
    borderRadius: borderRadius['2xl'],
    shadow: shadows['2xl'],
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  
  tooltip: {
    borderRadius: borderRadius.md,
    shadow: shadows.lg,
    fontSize: typography.fontSize.sm,
  },
} as const;

// Theme configuration
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  components,
} as const;

// CSS Custom Properties for dynamic theming
export const cssVariables = {
  light: {
    '--color-primary': colors.primary[500],
    '--color-secondary': colors.secondary[500],
    '--color-accent': colors.accent[500],
    '--color-success': colors.success[500],
    '--color-warning': colors.warning[500],
    '--color-error': colors.error[500],
    '--color-background': colors.light.background,
    '--color-surface': colors.light.surface,
    '--color-surface-elevated': colors.light.surfaceElevated,
    '--color-border': colors.light.border,
    '--color-text': colors.light.text,
    '--color-text-secondary': colors.light.textSecondary,
    '--color-text-tertiary': colors.light.textTertiary,
  },
  dark: {
    '--color-primary': colors.primary[400],
    '--color-secondary': colors.secondary[400],
    '--color-accent': colors.accent[400],
    '--color-success': colors.success[400],
    '--color-warning': colors.warning[400],
    '--color-error': colors.error[400],
    '--color-background': colors.dark.background,
    '--color-surface': colors.dark.surface,
    '--color-surface-elevated': colors.dark.surfaceElevated,
    '--color-border': colors.dark.border,
    '--color-text': colors.dark.text,
    '--color-text-secondary': colors.dark.textSecondary,
    '--color-text-tertiary': colors.dark.textTertiary,
  },
} as const;

export default theme;
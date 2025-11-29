/**
 * Design System Tokens
 * 
 * Centralized design tokens for consistent styling across all components
 * Following Material Design 3 principles
 */

export const designTokens = {
  // Color System
  colors: {
    // Primary palette
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    
    // Secondary palette
    secondary: {
      50: '#f3e5f5',
      100: '#e1bee7',
      200: '#ce93d8',
      300: '#ba68c8',
      400: '#ab47bc',
      500: '#9c27b0',
      600: '#8e24aa',
      700: '#7b1fa2',
      800: '#6a1b9a',
      900: '#4a148c',
    },
    
    // Semantic colors
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    
    // Neutral colors
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      1000: '#000000',
    },
    
    // Surface colors
    surface: {
      background: '#fafafa',
      paper: '#ffffff',
      elevated: '#ffffff',
    },
  },
  
  // Typography System
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      mono: "'Fira Code', 'Monaco', 'Courier New', monospace",
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
    },
  },
  
  // Spacing System (8px base)
  spacing: {
    0: '0',
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
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Elevation (Box Shadow)
  elevation: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  // Transition
  transition: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  
  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * Component-specific tokens
 */
export const componentTokens = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 24px',
    },
    fontSize: {
      sm: designTokens.typography.fontSize.sm,
      md: designTokens.typography.fontSize.base,
      lg: designTokens.typography.fontSize.lg,
    },
  },
  
  input: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 20px',
    },
  },
  
  card: {
    padding: {
      sm: designTokens.spacing[4],
      md: designTokens.spacing[6],
      lg: designTokens.spacing[8],
    },
    borderRadius: designTokens.borderRadius.lg,
    elevation: designTokens.elevation.md,
  },
  
  modal: {
    maxWidth: {
      sm: '400px',
      md: '600px',
      lg: '800px',
      xl: '1200px',
    },
    padding: designTokens.spacing[6],
  },
};

/**
 * Accessibility tokens
 */
export const a11yTokens = {
  minTouchTarget: '44px',
  minContrastRatio: 4.5, // WCAG AA
  minContrastRatioLarge: 3, // WCAG AA for large text
  focusOutlineWidth: '2px',
  focusOutlineOffset: '2px',
  focusOutlineColor: designTokens.colors.primary[500],
};

/**
 * Animation presets
 */
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: designTokens.transition.duration.normal,
    timing: designTokens.transition.timing.easeOut,
  },
  
  slideUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: designTokens.transition.duration.normal,
    timing: designTokens.transition.timing.spring,
  },
  
  scale: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: designTokens.transition.duration.fast,
    timing: designTokens.transition.timing.spring,
  },
  
  pulse: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' },
    ],
    duration: '2s',
    timing: designTokens.transition.timing.easeInOut,
    iterationCount: 'infinite',
  },
};

export default designTokens;

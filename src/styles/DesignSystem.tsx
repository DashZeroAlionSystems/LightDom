/**
 * Material Design Inspired Design System
 * Professional design system with animations, motion, and precision
 * Following Material Design 3.0 principles with custom enhancements
 */

// ===== COLOR SYSTEM =====
export const ColorSystem = {
  // Primary Colors - Material Design 3.0 inspired
  primary: {
    50: '#f3f0ff',
    100: '#e4d9ff',
    200: '#d0b9ff',
    300: '#b794ff',
    400: '#9d75ff',
    500: '#7c3aed', // Primary
    600: '#6d28d9',
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#3730a3',
  },
  
  // Secondary Colors
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4', // Secondary
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  
  // Semantic Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Success
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral Colors - Material Design inspired
  neutral: {
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
  },
  
  // Surface Colors
  surface: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    500: '#1f2937', // Dark surface
    700: '#111827', // Dark background
    900: '#030712', // Deepest background
  },
  
  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6b7280',
    disabled: '#9ca3af',
    inverse: '#ffffff',
    inverseSecondary: '#e5e7eb',
  },
};

// ===== TYPOGRAPHY SYSTEM =====
export const TypographySystem = {
  // Font Families
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    display: '"Inter Display", "Inter", sans-serif',
  },
  
  // Font Sizes - Following Material Design scale
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
  },
  
  // Font Weights
  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ===== SPACING SYSTEM =====
export const SpacingSystem = {
  // Following 8pt grid system
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
};

// ===== SHADOW SYSTEM =====
export const ShadowSystem = {
  // Material Design elevation system
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Colored shadows for depth
  primary: '0 4px 14px 0 rgba(124, 58, 237, 0.15)',
  secondary: '0 4px 14px 0 rgba(6, 182, 212, 0.15)',
  success: '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
  warning: '0 4px 14px 0 rgba(245, 158, 11, 0.15)',
  error: '0 4px 14px 0 rgba(239, 68, 68, 0.15)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// ===== BORDER RADIUS SYSTEM =====
export const BorderRadiusSystem = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// ===== ANIMATION SYSTEM =====
export const AnimationSystem = {
  // Durations - Material Design timing
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  
  // Easing functions - Material Design curves
  easing: {
    // Standard
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Material Design custom curves
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    standardDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    standardAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
  },
  
  // Preset animations
  transitions: {
    // Fade animations
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: '300ms',
      easing: 'ease-out',
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: '150ms',
      easing: 'ease-in',
    },
    
    // Slide animations
    slideUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
      duration: '300ms',
      easing: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    slideDown: {
      from: { transform: 'translateY(-20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
      duration: '300ms',
      easing: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    slideLeft: {
      from: { transform: 'translateX(20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
      duration: '300ms',
      easing: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    slideRight: {
      from: { transform: 'translateX(-20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
      duration: '300ms',
      easing: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    
    // Scale animations
    scaleIn: {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
      duration: '200ms',
      easing: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.9)', opacity: 0 },
      duration: '150ms',
      easing: 'ease-in',
    },
    
    // Bounce animations
    bounceIn: {
      '0%': { transform: 'scale(0.3)', opacity: 0 },
      '50%': { transform: 'scale(1.05)' },
      '70%': { transform: 'scale(0.9)' },
      '100%': { transform: 'scale(1)', opacity: 1 },
      duration: '500ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Hover effects
  hover: {
    lift: {
      transition: 'transform 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0), box-shadow 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    scale: {
      transition: 'transform 150ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        transform: 'scale(1.02)',
      },
    },
    glow: {
      transition: 'box-shadow 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
      },
    },
    brighten: {
      transition: 'filter 150ms ease',
      hover: {
        filter: 'brightness(1.1)',
      },
    },
  },
};

// ===== MOTION SYSTEM =====
export const MotionSystem = {
  // Micro-interactions
  micro: {
    buttonPress: {
      transition: 'transform 50ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      active: {
        transform: 'scale(0.98)',
      },
    },
    checkbox: {
      transition: 'all 150ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      active: {
        transform: 'scale(1.1)',
      },
    },
    switch: {
      transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
  },
  
  // Page transitions
  page: {
    enter: {
      animation: 'slideInRight 300ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    exit: {
      animation: 'slideOutLeft 300ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
  },
  
  // Loading states
  loading: {
    pulse: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    spin: {
      animation: 'spin 1s linear infinite',
    },
    bounce: {
      animation: 'bounce 1s infinite',
    },
  },
};

// ===== COMPONENT SYSTEM =====
export const ComponentSystem = {
  // Button variants
  button: {
    primary: {
      background: `linear-gradient(135deg, ${ColorSystem.primary[500]} 0%, ${ColorSystem.primary[600]} 100%)`,
      color: ColorSystem.text.inverse,
      border: 'none',
      boxShadow: ShadowSystem.primary,
      transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        background: `linear-gradient(135deg, ${ColorSystem.primary[600]} 0%, ${ColorSystem.primary[700]} 100%)`,
        transform: 'translateY(-1px)',
        boxShadow: `0 6px 20px -5px rgba(124, 58, 237, 0.25)`,
      },
      active: {
        transform: 'translateY(0px) scale(0.98)',
      },
    },
    
    secondary: {
      background: ColorSystem.surface[500],
      color: ColorSystem.text.inverse,
      border: `1px solid ${ColorSystem.surface[300]}`,
      transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        background: ColorSystem.surface[400],
        transform: 'translateY(-1px)',
        boxShadow: ShadowSystem.md,
      },
    },
    
    ghost: {
      background: 'transparent',
      color: ColorSystem.primary[500],
      border: `1px solid ${ColorSystem.primary[500]}`,
      transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        background: ColorSystem.primary[500],
        color: ColorSystem.text.inverse,
        transform: 'translateY(-1px)',
      },
    },
  },
  
  // Card variants
  card: {
    elevated: {
      background: ColorSystem.surface[0],
      borderRadius: BorderRadiusSystem.xl,
      boxShadow: ShadowSystem.lg,
      transition: 'all 300ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        transform: 'translateY(-4px)',
        boxShadow: ShadowSystem.xl,
      },
    },
    
    flat: {
      background: ColorSystem.surface[50],
      border: `1px solid ${ColorSystem.surface[200]}`,
      borderRadius: BorderRadiusSystem.lg,
      transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        borderColor: ColorSystem.primary[300],
        boxShadow: ShadowSystem.sm,
      },
    },
    
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: BorderRadiusSystem.xl,
      transition: 'all 300ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      hover: {
        background: 'rgba(255, 255, 255, 0.15)',
        transform: 'translateY(-2px)',
      },
    },
  },
  
  // Input variants
  input: {
    standard: {
      background: ColorSystem.surface[0],
      border: `1px solid ${ColorSystem.surface[300]}`,
      borderRadius: BorderRadiusSystem.lg,
      transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      focus: {
        borderColor: ColorSystem.primary[500],
        boxShadow: `0 0 0 3px rgba(124, 58, 237, 0.1)`,
      },
      hover: {
        borderColor: ColorSystem.surface[400],
      },
    },
    
    filled: {
      background: ColorSystem.surface[100],
      border: 'none',
      borderRadius: BorderRadiusSystem.lg,
      transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      focus: {
        background: ColorSystem.surface[0],
        boxShadow: `0 0 0 3px rgba(124, 58, 237, 0.1)`,
      },
    },
  },
};

// ===== RESPONSIVE SYSTEM =====
export const ResponsiveSystem = {
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
  
  containers: {
    xs: '100%',
    sm: '540px',
    md: '720px',
    lg: '960px',
    xl: '1140px',
    xxl: '1320px',
  },
  
  spacing: {
    responsive: {
      padding: {
        xs: SpacingSystem[4],
        sm: SpacingSystem[6],
        md: SpacingSystem[8],
        lg: SpacingSystem[10],
        xl: SpacingSystem[12],
      },
    },
  },
};

// ===== UTILITY CLASSES =====
export const UtilityClasses = {
  // Text utilities
  text: {
    gradient: {
      background: `linear-gradient(135deg, ${ColorSystem.primary[500]} 0%, ${ColorSystem.secondary[500]} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadow: {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  },
  
  // Background utilities
  background: {
    gradient: {
      primary: `linear-gradient(135deg, ${ColorSystem.primary[500]} 0%, ${ColorSystem.primary[600]} 100%)`,
      secondary: `linear-gradient(135deg, ${ColorSystem.secondary[500]} 0%, ${ColorSystem.secondary[600]} 100%)`,
      success: `linear-gradient(135deg, ${ColorSystem.success[500]} 0%, ${ColorSystem.success[600]} 100%)`,
      warning: `linear-gradient(135deg, ${ColorSystem.warning[500]} 0%, ${ColorSystem.warning[600]} 100%)`,
      error: `linear-gradient(135deg, ${ColorSystem.error[500]} 0%, ${ColorSystem.error[600]} 100%)`,
    },
    pattern: {
      dots: `radial-gradient(circle, ${ColorSystem.surface[300]} 1px, transparent 1px)`,
      grid: `linear-gradient(${ColorSystem.surface[200]} 1px, transparent 1px), linear-gradient(90deg, ${ColorSystem.surface[200]} 1px, transparent 1px)`,
    },
  },
};

// ===== CSS KEYFRAMES =====
export const Keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  slideUp: `
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  slideDown: `
    @keyframes slideDown {
      from { 
        opacity: 0;
        transform: translateY(-20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  slideInRight: `
    @keyframes slideInRight {
      from { 
        opacity: 0;
        transform: translateX(100%);
      }
      to { 
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,
  
  slideOutLeft: `
    @keyframes slideOutLeft {
      from { 
        opacity: 1;
        transform: translateX(0);
      }
      to { 
        opacity: 0;
        transform: translateX(-100%);
      }
    }
  `,
  
  scaleIn: `
    @keyframes scaleIn {
      from { 
        opacity: 0;
        transform: scale(0.9);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  
  bounce: `
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0, 0, 0);
      }
      40%, 43% {
        transform: translate3d(0, -30px, 0);
      }
      70% {
        transform: translate3d(0, -15px, 0);
      }
      90% {
        transform: translate3d(0, -4px, 0);
      }
    }
  `,
};

// Export default design system
export default {
  colors: ColorSystem,
  typography: TypographySystem,
  spacing: SpacingSystem,
  shadows: ShadowSystem,
  borderRadius: BorderRadiusSystem,
  animation: AnimationSystem,
  motion: MotionSystem,
  components: ComponentSystem,
  responsive: ResponsiveSystem,
  utilities: UtilityClasses,
  keyframes: Keyframes,
};

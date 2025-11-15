/**
 * Theme Configuration System
 * 
 * Config-driven theme system with live preview and anime.js integration
 * Inspired by Material Design and animejs.com interactive controls
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeAnimations {
  duration: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    spring: string;
    bounce: string;
  };
  stagger: {
    fast: number;
    normal: number;
    slow: number;
  };
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  animations: ThemeAnimations;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
}

// ============================================================================
// Default Theme Configuration
// ============================================================================

export const defaultTheme: Theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#1890ff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '3rem',
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
      relaxed: 1.8,
    },
  },
  animations: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 400,
      slow: 800,
    },
    easing: {
      linear: 'linear',
      easeIn: 'easeInQuad',
      easeOut: 'easeOutExpo',
      easeInOut: 'easeInOutQuad',
      spring: 'easeOutElastic(1, .6)',
      bounce: 'easeOutBounce',
    },
    stagger: {
      fast: 50,
      normal: 100,
      slow: 200,
    },
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
};

// ============================================================================
// Theme Presets
// ============================================================================

export const darkTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#404040',
  },
};

export const lightTheme: Theme = defaultTheme;

export const oceanTheme: Theme = {
  ...defaultTheme,
  colors: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#22d3ee',
    background: '#ffffff',
    surface: '#f0f9ff',
    text: '#0c4a6e',
    textSecondary: '#475569',
    border: '#bae6fd',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export const sunsetTheme: Theme = {
  ...defaultTheme,
  colors: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    background: '#ffffff',
    surface: '#fff7ed',
    text: '#7c2d12',
    textSecondary: '#78716c',
    border: '#fed7aa',
    success: '#84cc16',
    warning: '#eab308',
    error: '#dc2626',
    info: '#06b6d4',
  },
};

export const forestTheme: Theme = {
  ...defaultTheme,
  colors: {
    primary: '#16a34a',
    secondary: '#15803d',
    accent: '#4ade80',
    background: '#ffffff',
    surface: '#f0fdf4',
    text: '#14532d',
    textSecondary: '#57534e',
    border: '#bbf7d0',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export const themePresets = {
  light: lightTheme,
  dark: darkTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  forest: forestTheme,
};

// ============================================================================
// Theme Utilities
// ============================================================================

/**
 * Generate CSS variables from theme
 */
export function generateCSSVariables(theme: Theme): Record<string, string> {
  return {
    // Colors
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text': theme.colors.text,
    '--theme-text-secondary': theme.colors.textSecondary,
    '--theme-border': theme.colors.border,
    '--theme-success': theme.colors.success,
    '--theme-warning': theme.colors.warning,
    '--theme-error': theme.colors.error,
    '--theme-info': theme.colors.info,
    
    // Spacing
    '--theme-spacing-xs': `${theme.spacing.xs}px`,
    '--theme-spacing-sm': `${theme.spacing.sm}px`,
    '--theme-spacing-md': `${theme.spacing.md}px`,
    '--theme-spacing-lg': `${theme.spacing.lg}px`,
    '--theme-spacing-xl': `${theme.spacing.xl}px`,
    '--theme-spacing-xxl': `${theme.spacing.xxl}px`,
    
    // Typography
    '--theme-font-family': theme.typography.fontFamily,
    '--theme-font-size-base': theme.typography.fontSize.base,
    '--theme-line-height-normal': theme.typography.lineHeight.normal.toString(),
    
    // Border Radius
    '--theme-radius-sm': `${theme.borderRadius.sm}px`,
    '--theme-radius-md': `${theme.borderRadius.md}px`,
    '--theme-radius-lg': `${theme.borderRadius.lg}px`,
    
    // Shadows
    '--theme-shadow-sm': theme.shadows.sm,
    '--theme-shadow-md': theme.shadows.md,
    '--theme-shadow-lg': theme.shadows.lg,
  };
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  const cssVariables = generateCSSVariables(theme);
  const root = document.documentElement;
  
  Object.entries(cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Get gradient from theme colors
 */
export function getGradient(theme: Theme, direction: number = 135): string {
  return `linear-gradient(${direction}deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`;
}

/**
 * Get text gradient styles
 */
export function getTextGradient(theme: Theme): React.CSSProperties {
  return {
    background: getGradient(theme),
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };
}

/**
 * Merge custom theme with default theme
 */
export function mergeTheme(customTheme: Partial<Theme>): Theme {
  return {
    colors: { ...defaultTheme.colors, ...customTheme.colors },
    spacing: { ...defaultTheme.spacing, ...customTheme.spacing },
    typography: { ...defaultTheme.typography, ...customTheme.typography },
    animations: { ...defaultTheme.animations, ...customTheme.animations },
    borderRadius: { ...defaultTheme.borderRadius, ...customTheme.borderRadius },
    shadows: { ...defaultTheme.shadows, ...customTheme.shadows },
  };
}

/**
 * Export theme as JSON
 */
export function exportTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Import theme from JSON
 */
export function importTheme(json: string): Theme {
  try {
    const parsed = JSON.parse(json);
    return mergeTheme(parsed);
  } catch (error) {
    console.error('Failed to import theme:', error);
    return defaultTheme;
  }
}

export default {
  defaultTheme,
  darkTheme,
  lightTheme,
  oceanTheme,
  sunsetTheme,
  forestTheme,
  themePresets,
  generateCSSVariables,
  applyTheme,
  getGradient,
  getTextGradient,
  mergeTheme,
  exportTheme,
  importTheme,
};

/**
 * Design System Provider
 * 
 * This component wraps the entire frontend application and provides:
 * 1. CSS custom properties for design tokens
 * 2. Theme context (light/dark mode)
 * 3. Motion preferences for accessibility
 * 4. Design system configuration context
 * 
 * Usage:
 * ```tsx
 * import { DesignSystemProvider } from '@/design-system/DesignSystemProvider';
 * 
 * function App() {
 *   return (
 *     <DesignSystemProvider>
 *       <YourApp />
 *     </DesignSystemProvider>
 *   );
 * }
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ============================================================================
// Design Tokens (mirrors src/design-system/tokens.ts for frontend use)
// ============================================================================

export const designTokens = {
  colors: {
    // Primary palette - Exodus-inspired
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#5865f2', // Main primary - Discord/Exodus blue
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    secondary: {
      50: '#f3e5f5',
      100: '#e1bee7',
      200: '#ce93d8',
      300: '#ba68c8',
      400: '#ab47bc',
      500: '#7c5cff', // Main secondary - Purple accent
      600: '#8e24aa',
      700: '#7b1fa2',
      800: '#6a1b9a',
      900: '#4a148c',
    },
    semantic: {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    },
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
  },
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      mono: "'Fira Code', 'Monaco', 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
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
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  elevation: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(88, 101, 242, 0.4)',
    glowPurple: '0 0 20px rgba(124, 92, 255, 0.4)',
  },
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
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// ============================================================================
// UX/UI Rules - Styleguide enforcement
// ============================================================================

export const styleguideRules = {
  buttons: {
    minTouchTarget: 44,
    defaultHeight: 40,
    smallHeight: 32,
    largeHeight: 48,
    borderRadius: '0.5rem',
    loadingStateRequired: true,
  },
  cards: {
    padding: {
      small: '1rem',
      medium: '1.5rem',
      large: '2rem',
    },
    borderRadius: '0.75rem',
    gap: '1rem',
  },
  inputs: {
    height: {
      small: 32,
      medium: 40,
      large: 48,
    },
    borderRadius: '0.5rem',
    minLabelWidth: 80,
  },
  navigation: {
    sidebarWidthExpanded: 280,
    sidebarWidthCollapsed: 64,
    iconSize: 20,
    maxLabelLength: 20,
  },
  dashboards: {
    kpiGridColumns: 4,
    maxHierarchyLevels: 4,
    sectionGap: '1.5rem',
  },
  accessibility: {
    minContrastRatio: 4.5,
    focusOutlineWidth: '2px',
    focusOutlineOffset: '2px',
    minFontSize: '12px',
  },
  motion: {
    respectReducedMotion: true,
    maxAnimationDuration: 1000,
    defaultTransition: '250ms ease-in-out',
  },
};

// ============================================================================
// Context Types
// ============================================================================

type Theme = 'light' | 'dark' | 'system';
type MotionPreference = 'full' | 'reduced' | 'none';

interface DesignSystemContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  motionPreference: MotionPreference;
  setMotionPreference: (pref: MotionPreference) => void;
  tokens: typeof designTokens;
  rules: typeof styleguideRules;
  isDark: boolean;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

interface DesignSystemProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultMotionPreference?: MotionPreference;
}

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  defaultTheme = 'dark',
  defaultMotionPreference = 'full',
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [motionPreference, setMotionPreferenceState] = useState<MotionPreference>(defaultMotionPreference);
  const [isDark, setIsDark] = useState(defaultTheme === 'dark');

  // Handle system theme preference
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDark]);

  // Handle reduced motion preference
  useEffect(() => {
    const root = document.documentElement;
    if (motionPreference === 'none') {
      root.style.setProperty('--animation-duration', '0s');
    } else if (motionPreference === 'reduced') {
      root.style.setProperty('--animation-duration', '0.1s');
    } else {
      root.style.removeProperty('--animation-duration');
    }

    // Also check system preference
    if (motionPreference === 'full') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        root.style.setProperty('--animation-duration', '0.1s');
      }
    }
  }, [motionPreference]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('lightdom-theme', newTheme);
    } catch {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

  const setMotionPreference = useCallback((newPref: MotionPreference) => {
    setMotionPreferenceState(newPref);
    try {
      localStorage.setItem('lightdom-motion', newPref);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Load persisted preferences on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('lightdom-theme') as Theme | null;
      const savedMotion = localStorage.getItem('lightdom-motion') as MotionPreference | null;
      if (savedTheme) setThemeState(savedTheme);
      if (savedMotion) setMotionPreferenceState(savedMotion);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const value: DesignSystemContextType = {
    theme,
    setTheme,
    motionPreference,
    setMotionPreference,
    tokens: designTokens,
    rules: styleguideRules,
    isDark,
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

// ============================================================================
// Utility hook for checking styleguide compliance
// ============================================================================

export function useStyleguideCheck() {
  const { rules } = useDesignSystem();

  const checkButtonCompliance = useCallback((height: number, hasLoadingState: boolean) => {
    const issues: string[] = [];
    if (height < rules.buttons.minTouchTarget) {
      issues.push(`Button height ${height}px is below minimum touch target of ${rules.buttons.minTouchTarget}px`);
    }
    if (rules.buttons.loadingStateRequired && !hasLoadingState) {
      issues.push('Button should have a loading state for async actions');
    }
    return issues;
  }, [rules]);

  const checkContrastCompliance = useCallback((contrastRatio: number) => {
    if (contrastRatio < rules.accessibility.minContrastRatio) {
      return `Contrast ratio ${contrastRatio}:1 is below WCAG AA minimum of ${rules.accessibility.minContrastRatio}:1`;
    }
    return null;
  }, [rules]);

  return {
    checkButtonCompliance,
    checkContrastCompliance,
    rules,
  };
}

export default DesignSystemProvider;

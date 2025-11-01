/**
 * Enhanced Design System
 * Professional Material Design 3.0 implementation with refined spacing and typography
 */

// Enhanced Color System
export const EnhancedColors = {
  // Primary Brand Colors
  primary: {
    50: '#f3e8ff',
    100: '#e4d4f1',
    200: '#d8b9fe',
    300: '#c084fc',
    400: '#a855f7',
    500: '#9333ea',
    600: '#7c3aed', // Main primary
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#3b0764',
  },

  // Secondary Colors
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

  // Semantic Colors
  success: {
    50: '#dcfce7',
    100: '#bbf7d0',
    200: '#86efac',
    300: '#4ade80',
    400: '#22c55e',
    500: '#16a34a',
    600: '#15803d',
    700: '#166534',
    800: '#14532d',
    900: '#052e16',
  },

  warning: {
    50: '#fef3c7',
    100: '#fde68a',
    200: '#fcd34d',
    300: '#fbbf24',
    400: '#f59e0b',
    500: '#d97706',
    600: '#b45309',
    700: '#92400e',
    800: '#78350f',
    900: '#451a03',
  },

  error: {
    50: '#fee2e2',
    100: '#fecaca',
    200: '#fca5a5',
    300: '#f87171',
    400: '#ef4444',
    500: '#dc2626',
    600: '#b91c1c',
    700: '#991b1b',
    800: '#7f1d1d',
    900: '#450a0a',
  },

  info: {
    50: '#e0f2fe',
    100: '#bae6fd',
    200: '#7dd3fc',
    300: '#38bdf8',
    400: '#0ea5e9',
    500: '#0284c7',
    600: '#0369a1',
    700: '#075985',
    800: '#0c4a6e',
    900: '#082f49',
  },

  // Neutral Colors (Dark Theme)
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
    surfaceLight: '#262626',
    surfaceElevated: '#404040',
    border: '#404040',
    borderLight: '#525252',
    text: '#fafafa',
    textSecondary: '#a3a3a3',
    textTertiary: '#737373',
    textDisabled: '#525252',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)',
    secondary: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    surface: 'linear-gradient(135deg, #171717 0%, #262626 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
};

// Enhanced Spacing System (4px base unit for more precision)
export const EnhancedSpacing = {
  // Base spacing (4px unit)
  unit: '4px',
  xs: '4px',    // 1 unit
  sm: '8px',    // 2 units
  md: '16px',   // 4 units
  lg: '24px',   // 6 units
  xl: '32px',   // 8 units
  xxl: '48px',  // 12 units
  xxxl: '64px', // 16 units
  
  // Micro spacing for fine-tuning
  micro: '2px',  // 0.5 unit
  tiny: '6px',   // 1.5 units
  
  // Component-specific spacing
  component: {
    xs: '12px',  // 3 units
    sm: '20px',  // 5 units
    md: '28px',  // 7 units
    lg: '36px',  // 9 units
    xl: '44px',  // 11 units
  },
  
  // Layout spacing
  layout: {
    xs: '80px',   // 20 units
    sm: '120px',  // 30 units
    md: '160px',  // 40 units
    lg: '200px',  // 50 units
    xl: '240px',  // 60 units
  },
};

// Enhanced Typography System
export const EnhancedTypography = {
  // Display Styles
  displayLarge: {
    fontSize: '57px',
    lineHeight: '64px',
    fontWeight: 400,
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontSize: '45px',
    lineHeight: '52px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  displaySmall: {
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 400,
    letterSpacing: '0px',
  },

  // Headline Styles
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 400,
    letterSpacing: '0px',
  },

  // Title Styles
  titleLarge: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 500,
    letterSpacing: '0px',
  },
  titleMedium: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  titleSmall: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },

  // Body Styles
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0.4px',
  },

  // Label Styles
  labelLarge: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
};

// Enhanced Elevation System
export const EnhancedElevation = {
  level0: 'none',
  level1: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
  level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',
  level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
};

// Enhanced Border Radius
export const EnhancedBorderRadius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '28px',
  full: '9999px',
};

// Enhanced Component Sizes
export const EnhancedComponentSizes = {
  // Card Sizes (consistent heights)
  card: {
    xs: { height: '100px', padding: EnhancedSpacing.sm },
    sm: { height: '120px', padding: EnhancedSpacing.md },
    md: { height: '160px', padding: EnhancedSpacing.md },
    lg: { height: '200px', padding: EnhancedSpacing.lg },
    xl: { height: '240px', padding: EnhancedSpacing.lg },
  },

  // Button Sizes
  button: {
    xs: { height: '28px', padding: '0 12px', fontSize: '12px' },
    sm: { height: '32px', padding: '0 16px', fontSize: '14px' },
    md: { height: '40px', padding: '0 24px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 32px', fontSize: '16px' },
    xl: { height: '56px', padding: '0 40px', fontSize: '18px' },
  },

  // Sidebar Sizes
  sidebar: {
    collapsed: '80px',
    sm: '240px',
    md: '280px',
    lg: '320px',
    xl: '360px',
  },

  // Header Sizes
  header: {
    sm: '56px',
    md: '64px',
    lg: '72px',
    xl: '80px',
  },

  // Input Sizes
  input: {
    sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
    md: { height: '40px', padding: '0 16px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 20px', fontSize: '16px' },
  },
};

// Enhanced Breakpoints
export const EnhancedBreakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
  xxxl: '1600px',
};

// Enhanced Transitions
export const EnhancedTransitions = {
  duration: {
    fast: '100ms',
    short: '150ms',
    medium: '300ms',
    long: '500ms',
    longer: '700ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
};

// Enhanced Component Styles
export const EnhancedComponents = {
  // Card Component
  card: {
    backgroundColor: EnhancedColors.dark.surface,
    border: `1px solid ${EnhancedColors.dark.border}`,
    borderRadius: EnhancedBorderRadius.md,
    boxShadow: EnhancedElevation.level1,
    transition: `all ${EnhancedTransitions.duration.medium} ${EnhancedTransitions.easing.standard}`,
    '&:hover': {
      boxShadow: EnhancedElevation.level2,
      transform: 'translateY(-2px)',
    },
  },

  // Button Component
  button: {
    borderRadius: EnhancedBorderRadius.sm,
    fontWeight: 500,
    transition: `all ${EnhancedTransitions.duration.short} ${EnhancedTransitions.easing.standard}`,
    textTransform: 'none',
    boxShadow: EnhancedElevation.level0,
    '&:hover': {
      boxShadow: EnhancedElevation.level1,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      boxShadow: EnhancedElevation.level0,
      transform: 'translateY(0)',
    },
  },

  // Input Component
  input: {
    backgroundColor: EnhancedColors.dark.surface,
    border: `1px solid ${EnhancedColors.dark.border}`,
    borderRadius: EnhancedBorderRadius.sm,
    color: EnhancedColors.dark.text,
    transition: `all ${EnhancedTransitions.duration.short} ${EnhancedTransitions.easing.standard}`,
    '&:focus': {
      borderColor: EnhancedColors.primary[600],
      boxShadow: `0 0 0 2px ${EnhancedColors.primary[100]}`,
    },
  },

  // Sidebar Component
  sidebar: {
    backgroundColor: EnhancedColors.dark.surface,
    borderRight: `1px solid ${EnhancedColors.dark.border}`,
    boxShadow: EnhancedElevation.level1,
    transition: `all ${EnhancedTransitions.duration.medium} ${EnhancedTransitions.easing.standard}`,
  },

  // Header Component
  header: {
    backgroundColor: EnhancedColors.dark.surface,
    borderBottom: `1px solid ${EnhancedColors.dark.border}`,
    boxShadow: EnhancedElevation.level1,
  },
};

// Utility Functions
export const EnhancedUtils = {
  // Get spacing value
  spacing: (value: keyof typeof EnhancedSpacing) => EnhancedSpacing[value],
  
  // Get color value
  color: (path: string) => {
    const keys = path.split('.');
    let value: any = EnhancedColors;
    for (const key of keys) {
      value = value[key];
    }
    return value;
  },
  
  // Get typography style
  typography: (style: keyof typeof EnhancedTypography) => EnhancedTypography[style],
  
  // Get elevation
  elevation: (level: keyof typeof EnhancedElevation) => EnhancedElevation[level],
  
  // Responsive utility
  responsive: (property: string, values: Record<string, string>) => {
    return Object.entries(values)
      .map(([breakpoint, value]) => {
        if (breakpoint === 'xs') {
          return `${property}: ${value};`;
        }
        return `@media (min-width: ${EnhancedBreakpoints[breakpoint as keyof typeof EnhancedBreakpoints]}) { ${property}: ${value}; }`;
      })
      .join('\n');
  },
};

export default {
  colors: EnhancedColors,
  spacing: EnhancedSpacing,
  typography: EnhancedTypography,
  elevation: EnhancedElevation,
  borderRadius: EnhancedBorderRadius,
  componentSizes: EnhancedComponentSizes,
  breakpoints: EnhancedBreakpoints,
  transitions: EnhancedTransitions,
  components: EnhancedComponents,
  utils: EnhancedUtils,
};

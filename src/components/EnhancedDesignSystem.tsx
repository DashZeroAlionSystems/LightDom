/**
 * Enhanced Design System for Professional Dashboard
 * Material Design 3.0 inspired with precise spacing and professional styling
 */

export const Colors = {
  // Primary palette
  primary: '#7c3aed',
  primaryLight: '#a78bfa',
  primaryDark: '#5b21b6',
  
  // Semantic colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  info: '#3b82f6',
  infoLight: '#60a5fa',
  
  // Surface colors
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  surfaceVariant: '#1f1f1f',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  textTertiary: '#666666',
  textDisabled: '#404040',
  
  // Border colors
  border: '#333333',
  borderLight: '#404040',
  borderFocus: '#7c3aed',
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    surface: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
  },
  
  // Status colors
  status: {
    online: '#10b981',
    offline: '#ef4444',
    pending: '#f59e0b',
    maintenance: '#3b82f6',
  },
};

export const Spacing = {
  // 4px base unit system
  xs: '4px',    // 4px
  sm: '8px',    // 8px
  md: '16px',   // 16px
  lg: '24px',   // 24px
  xl: '32px',   // 32px
  xxl: '48px',  // 48px
  xxxl: '64px', // 64px
  
  // Micro spacing for precise control
  micro: '2px',
  tiny: '6px',
  small: '12px',
  medium: '20px',
  large: '28px',
  xlarge: '40px',
  
  // Component spacing
  componentPadding: '20px',
  cardPadding: '24px',
  sectionMargin: '32px',
  sidebarPadding: '16px',
};

export const Typography = {
  // Font families
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  monoFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  
  // Font sizes
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    huge: '40px',
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};

export const Elevation = {
  // Shadow levels for depth
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Colored shadows
  primary: '0 4px 14px 0 rgba(124, 58, 237, 0.2)',
  success: '0 4px 14px 0 rgba(16, 185, 129, 0.2)',
  warning: '0 4px 14px 0 rgba(245, 158, 11, 0.2)',
  error: '0 4px 14px 0 rgba(239, 68, 68, 0.2)',
  info: '0 4px 14px 0 rgba(59, 130, 246, 0.2)',
};

export const BorderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  full: '50%',
};

// Animation durations
const animationDuration = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  slower: '500ms',
};

// Animation easing functions
const animationEasing = {
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const Animation = {
  duration: animationDuration,
  easing: animationEasing,
  
  // Common transitions
  transitions: {
    color: `color ${animationDuration.normal} ${animationEasing.ease}`,
    background: `background ${animationDuration.normal} ${animationEasing.ease}`,
    border: `border ${animationDuration.normal} ${animationEasing.ease}`,
    transform: `transform ${animationDuration.normal} ${animationEasing.ease}`,
    opacity: `opacity ${animationDuration.normal} ${animationEasing.ease}`,
    all: `all ${animationDuration.normal} ${animationEasing.ease}`,
  },
};

export const Breakpoints = {
  xs: '480px',
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1536px',
  xxl: '1920px',
};

export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
};

// Component-specific styles
export const ComponentStyles = {
  card: {
    background: Colors.surface,
    border: `1px solid ${Colors.border}`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    boxShadow: Elevation.md,
    transition: Animation.transitions.all,
  },
  
  cardHover: {
    boxShadow: Elevation.lg,
    transform: 'translateY(-2px)',
    borderColor: Colors.borderFocus,
  },
  
  button: {
    padding: `${Spacing.sm} ${Spacing.md}`,
    borderRadius: BorderRadius.md,
    fontWeight: Typography.fontWeight.medium,
    transition: Animation.transitions.all,
    cursor: 'pointer',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  
  input: {
    padding: `${Spacing.sm} ${Spacing.md}`,
    borderRadius: BorderRadius.md,
    border: `1px solid ${Colors.border}`,
    background: Colors.surface,
    color: Colors.text,
    fontSize: Typography.fontSize.base,
    transition: Animation.transitions.all,
  },
  
  inputFocus: {
    borderColor: Colors.borderFocus,
    boxShadow: `0 0 0 3px rgba(124, 58, 237, 0.1)`,
  },
  
  sidebar: {
    width: '280px',
    background: Colors.surface,
    borderRight: `1px solid ${Colors.border}`,
    padding: Spacing.sidebarPadding,
    transition: Animation.transitions.all,
  },
  
  sidebarCollapsed: {
    width: '80px',
    padding: `${Spacing.md} ${Spacing.sm}`,
  },
  
  header: {
    height: '72px',
    background: Colors.surface,
    borderBottom: `1px solid ${Colors.border}`,
    padding: `0 ${Spacing.lg}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  progress: {
    height: '8px',
    borderRadius: BorderRadius.sm,
    background: Colors.surfaceVariant,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.sm,
    transition: Animation.transitions.all,
  },
};

export default {
  Colors,
  Spacing,
  Typography,
  Elevation,
  BorderRadius,
  Animation,
  Breakpoints,
  ZIndex,
  ComponentStyles,
};

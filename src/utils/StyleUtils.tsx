/**
 * Style Utilities - Easy Application of Design System
 * Helper functions and utilities for applying design system styles
 */

import DesignSystem from '../styles/DesignSystem';
import { CSSProperties } from 'react';

// ===== COLOR UTILITIES =====
export const getColor = (colorPath: string, shade: string = '500'): string => {
  const [colorName] = colorPath.split('.');
  const colorGroup = DesignSystem.colors[colorName as keyof typeof DesignSystem.colors];
  return colorGroup?.[shade as keyof typeof colorGroup] || colorPath;
};

export const getGradient = (type: 'primary' | 'secondary' | 'success' | 'warning' | 'error'): string => {
  const gradients = {
    primary: `linear-gradient(135deg, ${DesignSystem.colors.primary[500]} 0%, ${DesignSystem.colors.primary[600]} 100%)`,
    secondary: `linear-gradient(135deg, ${DesignSystem.colors.secondary[500]} 0%, ${DesignSystem.colors.secondary[600]} 100%)`,
    success: `linear-gradient(135deg, ${DesignSystem.colors.success[500]} 0%, ${DesignSystem.colors.success[600]} 100%)`,
    warning: `linear-gradient(135deg, ${DesignSystem.colors.warning[500]} 0%, ${DesignSystem.colors.warning[600]} 100%)`,
    error: `linear-gradient(135deg, ${DesignSystem.colors.error[500]} 0%, ${DesignSystem.colors.error[600]} 100%)`,
  };
  return gradients[type];
};

// ===== TYPOGRAPHY UTILITIES =====
export const getTextStyle = (variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption'): CSSProperties => {
  const variants = {
    h1: {
      fontSize: DesignSystem.typography.fontSize['6xl'],
      fontWeight: DesignSystem.typography.fontWeight.bold,
      lineHeight: DesignSystem.typography.lineHeight.tight,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
    },
    h2: {
      fontSize: DesignSystem.typography.fontSize['5xl'],
      fontWeight: DesignSystem.typography.fontWeight.bold,
      lineHeight: DesignSystem.typography.lineHeight.tight,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
    },
    h3: {
      fontSize: DesignSystem.typography.fontSize['4xl'],
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      lineHeight: DesignSystem.typography.lineHeight.tight,
    },
    h4: {
      fontSize: DesignSystem.typography.fontSize['3xl'],
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      lineHeight: DesignSystem.typography.lineHeight.snug,
    },
    h5: {
      fontSize: DesignSystem.typography.fontSize['2xl'],
      fontWeight: DesignSystem.typography.fontWeight.medium,
      lineHeight: DesignSystem.typography.lineHeight.snug,
    },
    h6: {
      fontSize: DesignSystem.typography.fontSize.xl,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      lineHeight: DesignSystem.typography.lineHeight.normal,
    },
    body: {
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      lineHeight: DesignSystem.typography.lineHeight.normal,
    },
    caption: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      lineHeight: DesignSystem.typography.lineHeight.normal,
      color: DesignSystem.colors.text.tertiary,
    },
  };
  return variants[variant];
};

// ===== SPACING UTILITIES =====
export const getSpacing = (size: keyof typeof DesignSystem.spacing): string => {
  return DesignSystem.spacing[size];
};

export const getResponsiveSpacing = (property: 'padding' | 'margin', size: keyof typeof DesignSystem.spacing): CSSProperties => {
  return {
    [property]: DesignSystem.spacing[size],
  };
};

// ===== SHADOW UTILITIES =====
export const getShadow = (type: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'): string => {
  return DesignSystem.shadows[type];
};

// ===== BORDER RADIUS UTILITIES =====
export const getBorderRadius = (size: keyof typeof DesignSystem.borderRadius): string => {
  return DesignSystem.borderRadius[size];
};

// ===== ANIMATION UTILITIES =====
export const getAnimation = (type: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn' | 'bounceIn'): CSSProperties => {
  const animations = {
    fadeIn: {
      animation: 'fadeIn 0.3s ease-out',
    },
    slideUp: {
      animation: 'slideUp 0.3s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    slideDown: {
      animation: 'slideDown 0.3s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    scaleIn: {
      animation: 'scaleIn 0.2s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    bounceIn: {
      animation: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  };
  return animations[type];
};

export const getTransition = (type: 'fast' | 'normal' | 'slow' | 'colors' | 'opacity' | 'transform' | 'shadow'): CSSProperties => {
  const transitions = {
    fast: {
      transition: 'all 0.15s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    normal: {
      transition: 'all 0.3s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    slow: {
      transition: 'all 0.5s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    colors: {
      transition: 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease',
    },
    opacity: {
      transition: 'opacity 0.3s ease',
    },
    transform: {
      transition: 'transform 0.3s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    shadow: {
      transition: 'box-shadow 0.3s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
  };
  return transitions[type];
};

// ===== HOVER EFFECT UTILITIES =====
export const getHoverEffect = (type: 'lift' | 'scale' | 'glow' | 'brighten'): CSSProperties => {
  const effects = {
    lift: {
      transition: 'transform 0.2s cubic-bezier(0.2, 0.0, 0.0, 1.0), box-shadow 0.2s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    scale: {
      transition: 'transform 0.15s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    glow: {
      transition: 'box-shadow 0.2s cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
    brighten: {
      transition: 'filter 0.15s ease',
    },
  };
  return effects[type];
};

export const getHoverStyles = (type: 'lift' | 'scale' | 'glow' | 'brighten'): CSSProperties => {
  const styles = {
    lift: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    scale: {
      transform: 'scale(1.02)',
    },
    glow: {
      boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
    },
    brighten: {
      filter: 'brightness(1.1)',
    },
  };
  return styles[type];
};

// ===== COMPONENT STYLE UTILITIES =====
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'ghost'): CSSProperties => {
  return DesignSystem.components.button[variant];
};

export const getCardStyle = (variant: 'elevated' | 'flat' | 'glass'): CSSProperties => {
  return DesignSystem.components.card[variant];
};

export const getInputStyle = (variant: 'standard' | 'filled'): CSSProperties => {
  return DesignSystem.components.input[variant];
};

// ===== RESPONSIVE UTILITIES =====
export const getBreakpoint = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'): string => {
  return DesignSystem.responsive.breakpoints[size];
};

export const getContainerStyle = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'): CSSProperties => {
  return {
    maxWidth: DesignSystem.responsive.containers[size],
    margin: '0 auto',
    padding: '0 16px',
  };
};

// ===== LAYOUT UTILITIES =====
export const getFlexStyle = (direction: 'row' | 'column', justify: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around', align: 'flex-start' | 'center' | 'flex-end' | 'stretch'): CSSProperties => {
  return {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
  };
};

export const getGridStyle = (columns: number, gap: keyof typeof DesignSystem.spacing): CSSProperties => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: DesignSystem.spacing[gap],
  };
};

// ===== UTILITY CLASSES GENERATOR =====
export const generateUtilityClasses = (): Record<string, CSSProperties> => {
  const classes: Record<string, CSSProperties> = {};

  // Color utilities
  Object.keys(DesignSystem.colors).forEach((colorGroup) => {
    const colors = DesignSystem.colors[colorGroup as keyof typeof DesignSystem.colors];
    Object.keys(colors).forEach((shade) => {
      classes[`text-${colorGroup}-${shade}`] = { color: colors[shade as keyof typeof colors] };
      classes[`bg-${colorGroup}-${shade}`] = { backgroundColor: colors[shade as keyof typeof colors] };
      classes[`border-${colorGroup}-${shade}`] = { borderColor: colors[shade as keyof typeof colors] };
    });
  });

  // Spacing utilities
  Object.keys(DesignSystem.spacing).forEach((size) => {
    const spacing = DesignSystem.spacing[size as keyof typeof DesignSystem.spacing];
    classes[`p-${size}`] = { padding: spacing };
    classes[`m-${size}`] = { margin: spacing };
    classes[`px-${size}`] = { paddingLeft: spacing, paddingRight: spacing };
    classes[`py-${size}`] = { paddingTop: spacing, paddingBottom: spacing };
    classes[`pl-${size}`] = { paddingLeft: spacing };
    classes[`pr-${size}`] = { paddingRight: spacing };
    classes[`pt-${size}`] = { paddingTop: spacing };
    classes[`pb-${size}`] = { paddingBottom: spacing };
    classes[`ml-${size}`] = { marginLeft: spacing };
    classes[`mr-${size}`] = { marginRight: spacing };
    classes[`mt-${size}`] = { marginTop: spacing };
    classes[`mb-${size}`] = { marginBottom: spacing };
  });

  // Border radius utilities
  Object.keys(DesignSystem.borderRadius).forEach((size) => {
    const radius = DesignSystem.borderRadius[size as keyof typeof DesignSystem.borderRadius];
    classes[`rounded-${size}`] = { borderRadius: radius };
  });

  // Shadow utilities
  Object.keys(DesignSystem.shadows).forEach((type) => {
    const shadow = DesignSystem.shadows[type as keyof typeof DesignSystem.shadows];
    classes[`shadow-${type}`] = { boxShadow: shadow };
  });

  return classes;
};

// ===== THEME UTILITIES =====
export const createTheme = (isDark: boolean = false): Record<string, any> => {
  return {
    colors: isDark ? {
      ...DesignSystem.colors,
      background: DesignSystem.colors.surface[700],
      surface: DesignSystem.colors.surface[500],
      text: DesignSystem.colors.text.inverse,
      textSecondary: DesignSystem.colors.text.inverseSecondary,
    } : DesignSystem.colors,
    typography: DesignSystem.typography,
    spacing: DesignSystem.spacing,
    shadows: DesignSystem.shadows,
    borderRadius: DesignSystem.borderRadius,
    animation: DesignSystem.animation,
    components: DesignSystem.components,
  };
};

// ===== ANIMATION DELAY UTILITIES =====
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

export const getStaggerAnimation = (type: 'fadeIn' | 'slideUp', count: number): string[] => {
  const delays: string[] = [];
  for (let i = 0; i < count; i++) {
    delays.push(`${type} 0.3s ease-out ${i * 50}ms backwards`);
  }
  return delays;
};

// ===== PERFORMANCE UTILITIES =====
export const getPerformanceStyles = (): CSSProperties => {
  return {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
  };
};

export const willChange = (property: 'transform' | 'opacity' | 'scroll'): CSSProperties => {
  return {
    willChange: property,
  };
};

// ===== ACCESSIBILITY UTILITIES =====
export const getFocusStyles = (): CSSProperties => {
  return {
    outline: '2px solid ' + DesignSystem.colors.primary[500],
    outlineOffset: '2px',
  };
};

export const getReducedMotionStyles = (): CSSProperties => {
  return {
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none !important',
      transition: 'none !important',
    },
  } as any;
};

// ===== COMPREHENSIVE STYLE COMPOSERS =====
export const composeStyle = (...styles: Array<Record<string, any> | undefined>): any => {
  return styles.reduce((acc, style) => ({ ...acc, ...(style || {}) }), {} as any);
};

export const createComponentStyle = (config: {
  backgroundColor?: string;
  color?: string;
  padding?: keyof typeof DesignSystem.spacing;
  margin?: keyof typeof DesignSystem.spacing;
  borderRadius?: keyof typeof DesignSystem.borderRadius;
  shadow?: keyof typeof DesignSystem.shadows;
  animation?: keyof typeof DesignSystem.animation.transitions;
  hover?: keyof typeof DesignSystem.animation.hover;
}): CSSProperties => {
  const style: CSSProperties = {};

  if (config.backgroundColor) style.backgroundColor = config.backgroundColor;
  if (config.color) style.color = config.color;
  if (config.padding) style.padding = DesignSystem.spacing[config.padding];
  if (config.margin) style.margin = DesignSystem.spacing[config.margin];
  if (config.borderRadius) style.borderRadius = DesignSystem.borderRadius[config.borderRadius];
  if (config.shadow) style.boxShadow = DesignSystem.shadows[config.shadow];
  if (config.animation) Object.assign(style, DesignSystem.animation.transitions[config.animation]);
  if (config.hover) Object.assign(style, DesignSystem.animation.hover[config.hover]);

  return style;
};

// Export all utilities
export default {
  colors: {
    getColor,
    getGradient,
  },
  typography: {
    getTextStyle,
  },
  spacing: {
    getSpacing,
    getResponsiveSpacing,
  },
  shadows: {
    getShadow,
  },
  borderRadius: {
    getBorderRadius,
  },
  animation: {
    getAnimation,
    getTransition,
    getStaggerDelay,
    getStaggerAnimation,
  },
  hover: {
    getHoverEffect,
    getHoverStyles,
  },
  components: {
    getButtonStyle,
    getCardStyle,
    getInputStyle,
  },
  responsive: {
    getBreakpoint,
    getContainerStyle,
  },
  layout: {
    getFlexStyle,
    getGridStyle,
  },
  utilities: {
    generateUtilityClasses,
    composeStyle,
    createComponentStyle,
  },
  theme: {
    createTheme,
  },
  performance: {
    getPerformanceStyles,
    willChange,
  },
  accessibility: {
    getFocusStyles,
    getReducedMotionStyles,
  },
};

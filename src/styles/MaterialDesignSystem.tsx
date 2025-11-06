/**
 * LightDom Material Design System
 * Professional design system following Material Design 3.0 principles
 * Consistent spacing, typography, and component sizing
 */

import React from 'react';
import { Button, Card, Typography, Space, Badge, Avatar, Progress, Alert, Tag, Tooltip, Divider } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const { Text, Title } = Typography;

// Material Design 3.0 Color System
export const MaterialColors = {
  // Primary Color Palette
  primary: {
    0: '#f3e8ff',
    10: '#e4d4f1',
    20: '#d8b9fe',
    30: '#c084fc',
    40: '#a855f7',
    50: '#9333ea',
    60: '#7c3aed',
    70: '#6d28d9',
    80: '#5b21b6',
    90: '#4c1d95',
    95: '#3b0764',
    100: '#2e1065',
  },

  // Secondary Color Palette
  secondary: {
    0: '#fdf4ff',
    10: '#fae8ff',
    20: '#f5d0fe',
    30: '#f0abfc',
    40: '#e879f9',
    50: '#d946ef',
    60: '#c026d3',
    70: '#a21caf',
    80: '#86198f',
    90: '#701a75',
    95: '#4a044e',
    100: '#2e1065',
  },

  // Neutral Color Palette
  neutral: {
    0: '#fafafa',
    10: '#f5f5f5',
    20: '#e5e5e5',
    30: '#d4d4d4',
    40: '#a3a3a3',
    50: '#737373',
    60: '#525252',
    70: '#404040',
    80: '#262626',
    90: '#171717',
    95: '#0a0a0a',
    100: '#000000',
  },

  // Semantic Colors
  success: {
    10: '#dcfce7',
    20: '#bbf7d0',
    30: '#86efac',
    40: '#4ade80',
    50: '#22c55e',
    60: '#16a34a',
    70: '#15803d',
    80: '#166534',
    90: '#14532d',
    95: '#052e16',
  },

  warning: {
    10: '#fef3c7',
    20: '#fde68a',
    30: '#fcd34d',
    40: '#fbbf24',
    50: '#f59e0b',
    60: '#d97706',
    70: '#b45309',
    80: '#92400e',
    90: '#78350f',
    95: '#451a03',
  },

  error: {
    10: '#fee2e2',
    20: '#fecaca',
    30: '#fca5a5',
    40: '#f87171',
    50: '#ef4444',
    60: '#dc2626',
    70: '#b91c1c',
    80: '#991b1b',
    90: '#7f1d1d',
    95: '#450a0a',
  },

  info: {
    10: '#e0f2fe',
    20: '#bae6fd',
    30: '#7dd3fc',
    40: '#38bdf8',
    50: '#0ea5e9',
    60: '#0284c7',
    70: '#0369a1',
    80: '#075985',
    90: '#0c4a6e',
    95: '#082f49',
  },
};

// Material Design Spacing System (8px base unit)
export const MaterialSpacing = {
  xs: '4px',   // 0.5rem
  sm: '8px',   // 1rem
  md: '16px',  // 2rem
  lg: '24px',  // 3rem
  xl: '32px',  // 4rem
  xxl: '48px', // 6rem
  xxxl: '64px', // 8rem
};

// Material Design Typography System
export const MaterialTypography = {
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

// Material Design Elevation System
export const MaterialElevation = {
  level0: 'none',
  level1: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
  level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',
  level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
};

// Material Design Border Radius
export const MaterialBorderRadius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '28px',
  full: '9999px',
};

// Material Design Component Sizes
export const MaterialComponentSizes = {
  // Card Sizes
  card: {
    sm: {
      height: '120px',
      padding: '16px',
    },
    md: {
      height: '160px',
      padding: '20px',
    },
    lg: {
      height: '200px',
      padding: '24px',
    },
  },

  // Button Sizes
  button: {
    sm: {
      height: '32px',
      padding: '0 16px',
      fontSize: '14px',
    },
    md: {
      height: '40px',
      padding: '0 24px',
      fontSize: '14px',
    },
    lg: {
      height: '48px',
      padding: '0 32px',
      fontSize: '16px',
    },
  },

  // Sidebar Sizes
  sidebar: {
    sm: '240px',
    md: '280px',
    lg: '320px',
  },

  // Header Sizes
  header: {
    sm: '56px',
    md: '64px',
    lg: '72px',
  },
};

// Material Design Breakpoints
export const MaterialBreakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
};

// Material Design Transitions
export const MaterialTransitions = {
  duration: {
    short: '150ms',
    medium: '300ms',
    long: '500ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
};

// Material Design Dark Theme
export const MaterialDarkTheme = {
  background: {
    default: MaterialColors.neutral[95],
    surface: MaterialColors.neutral[90],
    elevated: MaterialColors.neutral[80],
  },
  text: {
    primary: MaterialColors.neutral[10],
    secondary: MaterialColors.neutral[40],
    tertiary: MaterialColors.neutral[60],
  },
  border: {
    default: MaterialColors.neutral[80],
    elevated: MaterialColors.neutral[70],
  },
  shadow: {
    color: 'rgba(0, 0, 0, 0.8)',
  },
};

// Material Design Component Styles
export const MaterialComponents = {
  // Card Component
  card: {
    backgroundColor: MaterialDarkTheme.background.surface,
    border: `1px solid ${MaterialDarkTheme.border.default}`,
    borderRadius: MaterialBorderRadius.md,
    boxShadow: MaterialElevation.level1,
    transition: `all ${MaterialTransitions.duration.medium} ${MaterialTransitions.easing.standard}`,
    '&:hover': {
      boxShadow: MaterialElevation.level2,
      transform: 'translateY(-2px)',
    },
  },

  // Button Component
  button: {
    borderRadius: MaterialBorderRadius.sm,
    fontWeight: 500,
    transition: `all ${MaterialTransitions.duration.short} ${MaterialTransitions.easing.standard}`,
    textTransform: 'none',
    boxShadow: MaterialElevation.level0,
    '&:hover': {
      boxShadow: MaterialElevation.level1,
    },
    '&:active': {
      boxShadow: MaterialElevation.level0,
    },
  },

  // Input Component
  input: {
    backgroundColor: MaterialDarkTheme.background.surface,
    border: `1px solid ${MaterialDarkTheme.border.default}`,
    borderRadius: MaterialBorderRadius.sm,
    color: MaterialDarkTheme.text.primary,
    '&:focus': {
      borderColor: MaterialColors.primary[60],
      boxShadow: `0 0 0 2px ${MaterialColors.primary[20]}`,
    },
  },

  // Sidebar Component
  sidebar: {
    backgroundColor: MaterialDarkTheme.background.surface,
    borderRight: `1px solid ${MaterialDarkTheme.border.default}`,
    boxShadow: MaterialElevation.level1,
  },

  // Header Component
  header: {
    backgroundColor: MaterialDarkTheme.background.surface,
    borderBottom: `1px solid ${MaterialDarkTheme.border.default}`,
    boxShadow: MaterialElevation.level1,
  },
};

// Material Design Utility Classes
export const MaterialUtils = {
  // Responsive utilities
  responsive: (property: string, values: Record<string, string>) => {
    return Object.entries(values)
      .map(([breakpoint, value]) => {
        if (breakpoint === 'xs') {
          return `${property}: ${value};`;
        }
        return `@media (min-width: ${MaterialBreakpoints[breakpoint as keyof typeof MaterialBreakpoints]}) { ${property}: ${value}; }`;
      })
      .join('\n');
  },

  // Focus styles
  focusRing: (color: string = MaterialColors.primary[60]) => ({
    '&:focus-visible': {
      outline: `2px solid ${color}`,
      outlineOffset: '2px',
    },
  }),

  // Truncate text
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // Visually hidden
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// Material Design Workflow Components
export const MaterialWorkflowComponents = {
  // Workflow Card Component
  WorkflowCard: React.forwardRef<
    HTMLDivElement,
    {
      title: string;
      description?: string;
      status?: 'idle' | 'running' | 'completed' | 'error' | 'warning';
      progress?: number;
      actions?: React.ReactNode;
      children?: React.ReactNode;
      className?: string;
      onClick?: () => void;
    }
  >(({ title, description, status = 'idle', progress, actions, children, className, onClick }, ref) => {
    const statusConfig = {
      idle: { color: MaterialColors.neutral[50], bg: MaterialColors.neutral[10] },
      running: { color: MaterialColors.primary[60], bg: MaterialColors.primary[10] },
      completed: { color: MaterialColors.success[60], bg: MaterialColors.success[10] },
      error: { color: MaterialColors.error[60], bg: MaterialColors.error[10] },
      warning: { color: MaterialColors.warning[60], bg: MaterialColors.warning[10] },
    };

    return (
      <motion.div
        ref={ref}
        className={className}
        style={{
          backgroundColor: MaterialDarkTheme.background.surface,
          border: `1px solid ${MaterialDarkTheme.border.default}`,
          borderRadius: MaterialBorderRadius.lg,
          boxShadow: MaterialElevation.level1,
          padding: MaterialSpacing.lg,
          transition: `all ${MaterialTransitions.duration.medium} ${MaterialTransitions.easing.standard}`,
          cursor: onClick ? 'pointer' : 'default',
        }}
        whileHover={onClick ? { y: -2, boxShadow: MaterialElevation.level2 } : {}}
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: MaterialSpacing.md }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: MaterialSpacing.sm, marginBottom: MaterialSpacing.xs }}>
              <Title level={4} style={{ margin: 0, color: MaterialDarkTheme.text.primary, fontSize: MaterialTypography.titleMedium.fontSize }}>
                {title}
              </Title>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: statusConfig[status].color,
                  boxShadow: `0 0 8px ${statusConfig[status].color}40`,
                }}
              />
            </div>
            {description && (
              <Text style={{ color: MaterialDarkTheme.text.secondary, fontSize: MaterialTypography.bodyMedium.fontSize }}>
                {description}
              </Text>
            )}
          </div>
          {actions && (
            <div style={{ marginLeft: MaterialSpacing.md }}>
              {actions}
            </div>
          )}
        </div>

        {progress !== undefined && (
          <div style={{ marginBottom: MaterialSpacing.md }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: MaterialSpacing.xs }}>
              <Text style={{ fontSize: MaterialTypography.labelMedium.fontSize, color: MaterialDarkTheme.text.secondary }}>
                Progress
              </Text>
              <Text style={{ fontSize: MaterialTypography.labelMedium.fontSize, color: MaterialDarkTheme.text.primary, fontWeight: 500 }}>
                {Math.round(progress)}%
              </Text>
            </div>
            <Progress
              percent={progress}
              size="small"
              strokeColor={statusConfig[status].color}
              showInfo={false}
              style={{ margin: 0 }}
            />
          </div>
        )}

        {children && (
          <div style={{ marginTop: MaterialSpacing.md }}>
            {children}
          </div>
        )}
      </motion.div>
    );
  }),

  // Status Indicator Component
  StatusIndicator: React.forwardRef<
    HTMLDivElement,
    {
      status: 'idle' | 'running' | 'completed' | 'error' | 'warning' | 'info';
      label?: string;
      size?: 'sm' | 'md' | 'lg';
      animated?: boolean;
      className?: string;
    }
  >(({ status, label, size = 'md', animated = false, className }, ref) => {
    const sizeConfig = {
      sm: { width: 6, height: 6, fontSize: '12px' },
      md: { width: 8, height: 8, fontSize: '14px' },
      lg: { width: 12, height: 12, fontSize: '16px' },
    };

    const statusConfig = {
      idle: { color: MaterialColors.neutral[50], bg: MaterialColors.neutral[10], text: 'Idle' },
      running: { color: MaterialColors.primary[60], bg: MaterialColors.primary[10], text: 'Running' },
      completed: { color: MaterialColors.success[60], bg: MaterialColors.success[10], text: 'Completed' },
      error: { color: MaterialColors.error[60], bg: MaterialColors.error[10], text: 'Error' },
      warning: { color: MaterialColors.warning[60], bg: MaterialColors.warning[10], text: 'Warning' },
      info: { color: MaterialColors.info[60], bg: MaterialColors.info[10], text: 'Info' },
    };

    return (
      <motion.div
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: MaterialSpacing.xs,
          padding: `${MaterialSpacing.xs} ${MaterialSpacing.sm}`,
          backgroundColor: statusConfig[status].bg,
          borderRadius: MaterialBorderRadius.full,
          border: `1px solid ${statusConfig[status].color}20`,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          style={{
            width: sizeConfig[size].width,
            height: sizeConfig[size].height,
            borderRadius: '50%',
            backgroundColor: statusConfig[status].color,
          }}
          animate={animated ? {
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          } : {}}
          transition={animated ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          } : {}}
        />
        <Text
          style={{
            fontSize: sizeConfig[size].fontSize,
            color: statusConfig[status].color,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {label || statusConfig[status].text}
        </Text>
      </motion.div>
    );
  }),

  // Action Button Component
  ActionButton: React.forwardRef<
    HTMLButtonElement,
    {
      variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
      size?: 'sm' | 'md' | 'lg';
      icon?: React.ReactNode;
      children: React.ReactNode;
      loading?: boolean;
      disabled?: boolean;
      onClick?: () => void;
      className?: string;
      style?: React.CSSProperties;
    }
  >(({ variant = 'primary', size = 'md', icon, children, loading, disabled, onClick, className, style }, ref) => {
    const variantConfig = {
      primary: {
        background: `linear-gradient(135deg, ${MaterialColors.primary[60]} 0%, ${MaterialColors.primary[70]} 100%)`,
        color: 'white',
        border: 'none',
        hoverBg: `linear-gradient(135deg, ${MaterialColors.primary[70]} 0%, ${MaterialColors.primary[80]} 100%)`,
      },
      secondary: {
        background: MaterialDarkTheme.background.surface,
        color: MaterialDarkTheme.text.primary,
        border: `1px solid ${MaterialDarkTheme.border.default}`,
        hoverBg: MaterialDarkTheme.background.elevated,
      },
      success: {
        background: `linear-gradient(135deg, ${MaterialColors.success[60]} 0%, ${MaterialColors.success[70]} 100%)`,
        color: 'white',
        border: 'none',
        hoverBg: `linear-gradient(135deg, ${MaterialColors.success[70]} 0%, ${MaterialColors.success[80]} 100%)`,
      },
      warning: {
        background: `linear-gradient(135deg, ${MaterialColors.warning[60]} 0%, ${MaterialColors.warning[70]} 100%)`,
        color: 'white',
        border: 'none',
        hoverBg: `linear-gradient(135deg, ${MaterialColors.warning[70]} 0%, ${MaterialColors.warning[80]} 100%)`,
      },
      error: {
        background: `linear-gradient(135deg, ${MaterialColors.error[60]} 0%, ${MaterialColors.error[70]} 100%)`,
        color: 'white',
        border: 'none',
        hoverBg: `linear-gradient(135deg, ${MaterialColors.error[70]} 0%, ${MaterialColors.error[80]} 100%)`,
      },
    };

    const sizeConfig = {
      sm: { padding: '6px 12px', fontSize: '12px', height: '32px' },
      md: { padding: '8px 16px', fontSize: '14px', height: '40px' },
      lg: { padding: '12px 24px', fontSize: '16px', height: '48px' },
    };

    return (
      <motion.button
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: MaterialSpacing.sm,
          padding: sizeConfig[size].padding,
          height: sizeConfig[size].height,
          fontSize: sizeConfig[size].fontSize,
          fontWeight: 500,
          borderRadius: MaterialBorderRadius.md,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: `all ${MaterialTransitions.duration.short} ${MaterialTransitions.easing.standard}`,
          boxShadow: disabled ? 'none' : MaterialElevation.level1,
          ...variantConfig[variant],
          ...style,
        }}
        onClick={disabled || loading ? undefined : onClick}
        whileHover={!disabled && !loading ? { scale: 1.02, boxShadow: MaterialElevation.level2 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 16, height: 16, border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%' }}
          />
        )}
        {!loading && icon && icon}
        <span>{children}</span>
      </motion.button>
    );
  }),

  // Progress Tracker Component
  ProgressTracker: React.forwardRef<
    HTMLDivElement,
    {
      steps: Array<{
        id: string;
        title: string;
        description?: string;
        status: 'pending' | 'running' | 'completed' | 'error';
      }>;
      currentStep?: string;
      className?: string;
    }
  >(({ steps, currentStep, className }, ref) => {
    const getStepStatus = (step: typeof steps[0]) => {
      if (step.status === 'completed') return 'completed';
      if (step.status === 'error') return 'error';
      if (step.id === currentStep) return 'running';
      return 'pending';
    };

    const statusConfig = {
      pending: { color: MaterialColors.neutral[40], bg: MaterialColors.neutral[20] },
      running: { color: MaterialColors.primary[60], bg: MaterialColors.primary[20] },
      completed: { color: MaterialColors.success[60], bg: MaterialColors.success[20] },
      error: { color: MaterialColors.error[60], bg: MaterialColors.error[20] },
    };

    return (
      <div ref={ref} className={className} style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
          {/* Progress Line */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              height: '2px',
              backgroundColor: MaterialDarkTheme.border.default,
              zIndex: 1,
            }}
          />

          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const isCompleted = status === 'completed';
            const isRunning = status === 'running';
            const isLast = index === steps.length - 1;

            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: isLast ? 'none' : 1,
                  zIndex: 2,
                }}
              >
                {/* Step Circle */}
                <motion.div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: statusConfig[status].bg,
                    border: `2px solid ${statusConfig[status].color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: MaterialSpacing.sm,
                    boxShadow: isRunning ? `0 0 20px ${statusConfig[status].color}40` : MaterialElevation.level1,
                  }}
                  animate={isRunning ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={isRunning ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  } : {}}
                >
                  {isCompleted ? (
                    <span style={{ color: statusConfig[status].color, fontSize: '16px' }}>✓</span>
                  ) : isRunning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: `2px solid ${statusConfig[status].color}`,
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    <span style={{ color: statusConfig[status].color, fontSize: '16px', fontWeight: 'bold' }}>
                      {index + 1}
                    </span>
                  )}
                </motion.div>

                {/* Step Content */}
                <div style={{ textAlign: 'center', maxWidth: '120px' }}>
                  <Text
                    style={{
                      fontSize: MaterialTypography.labelMedium.fontSize,
                      fontWeight: 500,
                      color: status === 'pending' ? MaterialDarkTheme.text.tertiary : MaterialDarkTheme.text.primary,
                      display: 'block',
                      marginBottom: '2px',
                    }}
                  >
                    {step.title}
                  </Text>
                  {step.description && (
                    <Text
                      style={{
                        fontSize: MaterialTypography.bodySmall.fontSize,
                        color: MaterialDarkTheme.text.secondary,
                        lineHeight: 1.2,
                      }}
                    >
                      {step.description}
                    </Text>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }),

  // Notification Toast Component
  NotificationToast: React.forwardRef<
    HTMLDivElement,
    {
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message?: string;
      action?: React.ReactNode;
      onClose?: () => void;
      duration?: number;
      className?: string;
    }
  >(({ type, title, message, action, onClose, duration = 5000, className }, ref) => {
    const typeConfig = {
      success: { color: MaterialColors.success[60], bg: MaterialColors.success[10], icon: '✓' },
      error: { color: MaterialColors.error[60], bg: MaterialColors.error[10], icon: '✕' },
      warning: { color: MaterialColors.warning[60], bg: MaterialColors.warning[10], icon: '⚠' },
      info: { color: MaterialColors.info[60], bg: MaterialColors.info[10], icon: 'ℹ' },
    };

    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          onClose?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    if (!visible) return null;

    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          className={className}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: MaterialSpacing.md,
            padding: MaterialSpacing.md,
            backgroundColor: MaterialDarkTheme.background.surface,
            border: `1px solid ${typeConfig[type].color}30`,
            borderRadius: MaterialBorderRadius.md,
            boxShadow: MaterialElevation.level3,
            maxWidth: '400px',
            position: 'relative',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Colored left border */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: typeConfig[type].color,
            }}
          />

          {/* Icon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: typeConfig[type].bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: typeConfig[type].color,
              fontSize: '16px',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {typeConfig[type].icon}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: MaterialTypography.labelLarge.fontSize,
                fontWeight: 600,
                color: MaterialDarkTheme.text.primary,
                display: 'block',
                marginBottom: message ? '4px' : 0,
              }}
            >
              {title}
            </Text>
            {message && (
              <Text
                style={{
                  fontSize: MaterialTypography.bodyMedium.fontSize,
                  color: MaterialDarkTheme.text.secondary,
                  lineHeight: 1.4,
                }}
              >
                {message}
              </Text>
            )}
            {action && (
              <div style={{ marginTop: MaterialSpacing.sm }}>
                {action}
              </div>
            )}
          </div>

          {/* Close button */}
          {onClose && (
            <button
              onClick={() => {
                setVisible(false);
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: MaterialDarkTheme.text.tertiary,
                cursor: 'pointer',
                padding: '4px',
                borderRadius: MaterialBorderRadius.sm,
                fontSize: '18px',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }),
};

export default {
  colors: MaterialColors,
  spacing: MaterialSpacing,
  typography: MaterialTypography,
  elevation: MaterialElevation,
  borderRadius: MaterialBorderRadius,
  componentSizes: MaterialComponentSizes,
  breakpoints: MaterialBreakpoints,
  transitions: MaterialTransitions,
  darkTheme: MaterialDarkTheme,
  components: MaterialComponents,
  workflowComponents: MaterialWorkflowComponents,
  utils: MaterialUtils,
};

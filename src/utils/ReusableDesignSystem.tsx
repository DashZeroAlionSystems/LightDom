/**
 * Material Design 3 Reusable Components
 * Complete MD3 implementation with hooks and components
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, Button, Space, Typography, Row, Col, Progress, Divider } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  MoreOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import MD3DesignSystem from '../styles/NewDesignSystem';

const { Title, Text } = Typography;

// ===== HOOKS =====

/**
 * Theme Hook - Manages light/dark theme state
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const themeConfig = useMemo(() => MD3DesignSystem[theme], [theme]);

  return { theme, toggleTheme, themeConfig };
};

/**
 * Loading Hook - Manages loading states
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);
  const toggleLoading = useCallback(() => setLoading(prev => !prev), []);

  return { loading, setLoading, startLoading, stopLoading, toggleLoading };
};

/**
 * Async Data Hook - Handles API calls with loading and error states
 */
export const useAsyncData = <T,>(
  fetcher: () => Promise<T>,
  options: { autoLoad?: boolean; fallback?: T } = {}
) => {
  const { autoLoad = false, fallback } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { loading, startLoading, stopLoading } = useLoading(false);

  const loadData = useCallback(async () => {
    try {
      startLoading();
      setError(null);
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      if (fallback) setData(fallback);
      return fallback;
    } finally {
      stopLoading();
    }
  }, [fetcher, fallback, startLoading, stopLoading]);

  React.useEffect(() => {
    if (autoLoad) loadData();
  }, [autoLoad, loadData]);

  return { data, error, loading, loadData, setData };
};

// ===== COMPONENTS =====

/**
 * Status Card Component - Material Design 3
 */
interface StatusCardProps {
  title: string;
  status: 'healthy' | 'degraded' | 'syncing' | 'error';
  icon: React.ReactNode;
  metrics?: Array<{ label: string; value: string | number }>;
  onClick?: () => void;
  loading?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  status,
  icon,
  metrics = [],
  onClick,
  loading = false
}) => {
  const { theme } = useTheme();

  const statusConfig = {
    healthy: { color: MD3DesignSystem.getColor('success', theme), bgColor: `${MD3DesignSystem.getColor('success', theme)}1A` },
    degraded: { color: MD3DesignSystem.getColor('warning', theme), bgColor: `${MD3DesignSystem.getColor('warning', theme)}1A` },
    syncing: { color: MD3DesignSystem.getColor('info', theme), bgColor: `${MD3DesignSystem.getColor('info', theme)}1A` },
    error: { color: MD3DesignSystem.getColor('error', theme), bgColor: `${MD3DesignSystem.getColor('error', theme)}1A` }
  };

  const config = statusConfig[status];

  return (
    <Card
      hoverable={!!onClick}
      style={{
        height: '100%',
        borderRadius: MD3DesignSystem.getShape('large'),
        border: `1px solid ${MD3DesignSystem.getColor('outlineVariant', theme)}`,
        background: MD3DesignSystem.getColor('surface', theme),
        boxShadow: MD3DesignSystem.getElevation('level1'),
        transition: `all ${MD3DesignSystem.getMotion('duration', 'medium2')} ${MD3DesignSystem.getMotion('easing', 'standard')}`,
        cursor: onClick ? 'pointer' : 'default'
      }}
      bodyStyle={{
        padding: MD3DesignSystem.getSpacing(24),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
      }}
      onClick={onClick}
      loading={loading}
    >
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: MD3DesignSystem.getShape('full'),
        backgroundColor: config.bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: MD3DesignSystem.getSpacing(16),
      }}>
        <div style={{ fontSize: '24px', color: config.color }}>
          {icon}
        </div>
      </div>

      <Title level={4} style={{
        margin: `${MD3DesignSystem.getSpacing(4)} 0`,
        color: MD3DesignSystem.getColor('onSurface', theme),
        ...MD3DesignSystem.getTypography('titleMedium')
      }}>
        {title}
      </Title>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: MD3DesignSystem.getSpacing(16),
      }}>
        {status === 'healthy' && <CheckCircleOutlined style={{ color: config.color }} />}
        {status === 'degraded' && <ExclamationCircleOutlined style={{ color: config.color }} />}
        {status === 'syncing' && <SyncOutlined spin style={{ color: config.color }} />}
        {status === 'error' && <CloseCircleOutlined style={{ color: config.color }} />}
        <Text style={{
          marginLeft: MD3DesignSystem.getSpacing(8),
          color: config.color,
          ...MD3DesignSystem.getTypography('labelLarge')
        }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </div>

      {metrics.length > 0 && (
        <div style={{ marginTop: 'auto', width: '100%' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: MD3DesignSystem.getSpacing(12)
          }}>
            {metrics.map((metric, index) => (
              <div key={index} style={{ textAlign: 'center', flex: '1 1 auto' }}>
                <Text style={{
                  fontSize: '12px',
                  color: MD3DesignSystem.getColor('onSurfaceVariant', theme),
                  display: 'block'
                }}>
                  {metric.label}
                </Text>
                <Text strong style={{
                  fontSize: '14px',
                  color: MD3DesignSystem.getColor('onSurface', theme),
                }}>
                  {metric.value}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

/**
 * Metric Card Component - Material Design 3
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string; direction: 'up' | 'down' | 'neutral' };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  onClick,
  loading = false
}) => {
  const { theme } = useTheme();

  const colorMap = {
    primary: MD3DesignSystem.getColor('primary', theme),
    secondary: MD3DesignSystem.getColor('secondary', theme),
    success: MD3DesignSystem.getColor('success', theme),
    warning: MD3DesignSystem.getColor('warning', theme),
    error: MD3DesignSystem.getColor('error', theme)
  };

  const gradient = `linear-gradient(135deg, ${colorMap[color]} 0%, ${colorMap[color]}dd 100%)`;

  return (
    <Card
      hoverable={!!onClick}
      style={{
        height: '100%',
        borderRadius: MD3DesignSystem.getShape('large'),
        border: `1px solid ${MD3DesignSystem.getColor('outlineVariant', theme)}`,
        background: MD3DesignSystem.getColor('surface', theme),
        boxShadow: MD3DesignSystem.getElevation('level1'),
        transition: `all ${MD3DesignSystem.getMotion('duration', 'medium2')} ${MD3DesignSystem.getMotion('easing', 'standard')}`,
        cursor: onClick ? 'pointer' : 'default'
      }}
      bodyStyle={{
        padding: MD3DesignSystem.getSpacing(24),
        height: '100%',
      }}
      onClick={onClick}
      loading={loading}
    >
      <Row align="middle" gutter={16}>
        <Col>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: MD3DesignSystem.getShape('medium'),
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 6px ${colorMap[color]}40`
          }}>
            <div style={{ fontSize: '24px', color: '#ffffff' }}>
              {icon}
            </div>
          </div>
        </Col>
        <Col flex="auto">
          <Text type="secondary" style={MD3DesignSystem.getTypography('bodyMedium')}>
            {title}
          </Text>
          <Title level={3} style={{
            margin: '4px 0 0',
            ...MD3DesignSystem.getTypography('headlineSmall'),
            color: MD3DesignSystem.getColor('onSurface', theme)
          }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Title>
        </Col>
      </Row>

      {trend && (
        <div style={{
          marginTop: MD3DesignSystem.getSpacing(12),
          display: 'flex',
          alignItems: 'center'
        }}>
          {trend.direction === 'up' && <ArrowUpOutlined style={{ color: MD3DesignSystem.getColor('success', theme), marginRight: '4px' }} />}
          {trend.direction === 'down' && <ArrowDownOutlined style={{ color: MD3DesignSystem.getColor('error', theme), marginRight: '4px' }} />}
          <Text type="secondary" style={{
            ...MD3DesignSystem.getTypography('bodySmall'),
            color: trend.direction === 'up' ? MD3DesignSystem.getColor('success', theme) :
                   trend.direction === 'down' ? MD3DesignSystem.getColor('error', theme) :
                   MD3DesignSystem.getColor('onSurfaceVariant', theme)
          }}>
            {trend.direction === 'up' && '+'}
            {trend.value}% {trend.label}
          </Text>
        </div>
      )}
    </Card>
  );
};

/**
 * Chip Component - Material Design 3
 */
interface ChipProps {
  children: React.ReactNode;
  variant?: 'assist' | 'filter' | 'input' | 'suggestion';
  selected?: boolean;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onClick?: () => void;
  onDelete?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'assist',
  selected = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  onClick,
  onDelete
}) => {
  const { theme } = useTheme();

  const getChipStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: MD3DesignSystem.getSpacing(8),
      padding: `${MD3DesignSystem.getSpacing(6)} ${MD3DesignSystem.getSpacing(16)}`,
      borderRadius: MD3DesignSystem.getShape('extraLarge'),
      fontSize: '14px',
      fontWeight: 500,
      letterSpacing: '0.1px',
      lineHeight: '20px',
      cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
      transition: `all ${MD3DesignSystem.getMotion('duration', 'short2')} ${MD3DesignSystem.getMotion('easing', 'standard')}`,
      opacity: disabled ? 0.38 : 1,
    };

    switch (variant) {
      case 'assist':
        return {
          ...baseStyles,
          backgroundColor: selected
            ? MD3DesignSystem.getColor('secondaryContainer', theme)
            : MD3DesignSystem.getColor('surfaceVariant', theme),
          color: selected
            ? MD3DesignSystem.getColor('onSecondaryContainer', theme)
            : MD3DesignSystem.getColor('onSurfaceVariant', theme),
        };
      case 'filter':
        return {
          ...baseStyles,
          backgroundColor: selected
            ? MD3DesignSystem.getColor('primary', theme)
            : 'transparent',
          color: selected
            ? MD3DesignSystem.getColor('onPrimary', theme)
            : MD3DesignSystem.getColor('onSurfaceVariant', theme),
          border: selected ? 'none' : `1px solid ${MD3DesignSystem.getColor('outline', theme)}`,
        };
      case 'input':
        return {
          ...baseStyles,
          backgroundColor: MD3DesignSystem.getColor('surfaceContainerHigh', theme) || MD3DesignSystem.getColor('surface', theme),
          color: MD3DesignSystem.getColor('onSurface', theme),
        };
      case 'suggestion':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: MD3DesignSystem.getColor('onSurfaceVariant', theme),
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div
      style={getChipStyles()}
      onClick={!disabled ? onClick : undefined}
    >
      {leadingIcon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {leadingIcon}
        </span>
      )}
      <span>{children}</span>
      {trailingIcon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {trailingIcon}
        </span>
      )}
      {onDelete && (
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            padding: 0,
            width: '16px',
            height: '16px',
            fontSize: '12px',
            color: 'inherit',
          }}
        />
      )}
    </div>
  );
};

/**
 * Progress Indicator Component - Material Design 3
 */
interface ProgressProps {
  type?: 'linear' | 'circular';
  percent: number;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  showInfo?: boolean;
  status?: 'normal' | 'exception' | 'active' | 'success';
}

export const ProgressIndicator: React.FC<ProgressProps> = ({
  type = 'linear',
  percent,
  size = 'medium',
  color = 'primary',
  showInfo = false,
  status = 'normal'
}) => {
  const { theme } = useTheme();

  const getColor = () => {
    switch (color) {
      case 'primary': return MD3DesignSystem.getColor('primary', theme);
      case 'secondary': return MD3DesignSystem.getColor('secondary', theme);
      case 'tertiary': return MD3DesignSystem.getColor('tertiary', theme);
      case 'error': return MD3DesignSystem.getColor('error', theme);
      default: return MD3DesignSystem.getColor('primary', theme);
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small': return 4;
      case 'medium': return 6;
      case 'large': return 8;
      default: return 6;
    }
  };

  if (type === 'circular') {
    return (
      <div style={{
        width: getSize() * 8,
        height: getSize() * 8,
        position: 'relative',
        display: 'inline-block'
      }}>
        <Progress
          type="circle"
          percent={percent}
          width={getSize() * 8}
          strokeColor={getColor()}
          strokeWidth={getSize()}
          showInfo={showInfo}
          status={status}
        />
      </div>
    );
  }

  return (
    <Progress
      percent={percent}
      strokeColor={getColor()}
      strokeWidth={getSize()}
      showInfo={showInfo}
      status={status}
    />
  );
};

/**
 * Floating Action Button (FAB) - Material Design 3
 */
interface FABProps {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
  size?: 'small' | 'medium' | 'large' | 'extended';
  extendedText?: string;
  onClick: () => void;
  disabled?: boolean;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  variant = 'primary',
  size = 'medium',
  extendedText,
  onClick,
  disabled = false
}) => {
  const { theme } = useTheme();

  const getFABStyles = () => {
    const baseSize = size === 'extended' ? 56 : (size === 'large' ? 56 : size === 'medium' ? 56 : 40);
    const iconSize = size === 'small' ? 20 : 24;

    let backgroundColor, color, boxShadow;

    switch (variant) {
      case 'primary':
        backgroundColor = MD3DesignSystem.getColor('primaryContainer', theme);
        color = MD3DesignSystem.getColor('onPrimaryContainer', theme);
        boxShadow = MD3DesignSystem.getElevation('level3');
        break;
      case 'secondary':
        backgroundColor = MD3DesignSystem.getColor('secondaryContainer', theme);
        color = MD3DesignSystem.getColor('onSecondaryContainer', theme);
        boxShadow = MD3DesignSystem.getElevation('level3');
        break;
      case 'tertiary':
        backgroundColor = MD3DesignSystem.getColor('tertiaryContainer', theme);
        color = MD3DesignSystem.getColor('onTertiaryContainer', theme);
        boxShadow = MD3DesignSystem.getElevation('level3');
        break;
      case 'surface':
        backgroundColor = MD3DesignSystem.getColor('surfaceContainerHigh', theme) || MD3DesignSystem.getColor('surface', theme);
        color = MD3DesignSystem.getColor('primary', theme);
        boxShadow = MD3DesignSystem.getElevation('level3');
        break;
    }

    return {
      width: size === 'extended' ? 'auto' : baseSize,
      height: baseSize,
      borderRadius: size === 'extended' ? MD3DesignSystem.getShape('large') : MD3DesignSystem.getShape('large'),
      backgroundColor,
      color,
      boxShadow,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: size === 'extended' ? MD3DesignSystem.getSpacing(12) : 0,
      padding: size === 'extended' ? `0 ${MD3DesignSystem.getSpacing(20)}` : 0,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${MD3DesignSystem.getMotion('duration', 'short2')} ${MD3DesignSystem.getMotion('easing', 'standard')}`,
      opacity: disabled ? 0.38 : 1,
      fontSize: '14px',
      fontWeight: 500,
      letterSpacing: '0.1px',
    };
  };

  return (
    <button
      style={getFABStyles()}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      <span style={{ fontSize: size === 'small' ? '20px' : '24px', display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      {size === 'extended' && extendedText && (
        <span>{extendedText}</span>
      )}
    </button>
  );
};

/**
 * List Item Component - Material Design 3
 */
interface ListItemProps {
  title: string;
  subtitle?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leadingIcon,
  trailingIcon,
  onClick,
  selected = false,
  disabled = false
}) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        padding: `${MD3DesignSystem.getSpacing(16)} ${MD3DesignSystem.getSpacing(24)}`,
        display: 'flex',
        alignItems: 'center',
        gap: MD3DesignSystem.getSpacing(16),
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        backgroundColor: selected ? `${MD3DesignSystem.getColor('primary', theme)}08` : 'transparent',
        borderRadius: selected ? MD3DesignSystem.getShape('medium') : 0,
        transition: `all ${MD3DesignSystem.getMotion('duration', 'short2')} ${MD3DesignSystem.getMotion('easing', 'standard')}`,
        opacity: disabled ? 0.38 : 1,
      }}
      onClick={!disabled ? onClick : undefined}
    >
      {leadingIcon && (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: MD3DesignSystem.getShape('medium'),
          backgroundColor: MD3DesignSystem.getColor('surfaceVariant', theme),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {leadingIcon}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <Text strong style={{
          color: MD3DesignSystem.getColor('onSurface', theme),
          ...MD3DesignSystem.getTypography('bodyLarge'),
          display: 'block',
          marginBottom: subtitle ? MD3DesignSystem.getSpacing(4) : 0,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            color: MD3DesignSystem.getColor('onSurfaceVariant', theme),
            ...MD3DesignSystem.getTypography('bodyMedium'),
          }}>
            {subtitle}
          </Text>
        )}
      </div>

      {trailingIcon && (
        <div style={{ flexShrink: 0 }}>
          {trailingIcon}
        </div>
      )}
    </div>
  );
};

/**
 * Section Header Component - Material Design 3
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  level = 2
}) => {
  const { theme } = useTheme();

  return (
    <div style={{
      marginBottom: MD3DesignSystem.getSpacing(24),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }}>
      <div>
        <Title level={level} style={{
          margin: 0,
          color: MD3DesignSystem.getColor('onBackground', theme),
          ...MD3DesignSystem.getTypography('headlineLarge')
        }}>
          {title}
        </Title>
        {subtitle && (
          <Text type="secondary" style={MD3DesignSystem.getTypography('bodyMedium')}>
            {subtitle}
          </Text>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// ===== UTILITY FUNCTIONS =====

/**
 * Format number with appropriate suffix (K, M, B)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Get status configuration for consistent status handling
 */
export const getStatusConfig = (status: string) => {
  const configs = {
    healthy: { color: 'success', icon: CheckCircleOutlined, label: 'Healthy' },
    degraded: { color: 'warning', icon: ExclamationCircleOutlined, label: 'Degraded' },
    syncing: { color: 'info', icon: SyncOutlined, label: 'Syncing' },
    error: { color: 'error', icon: CloseCircleOutlined, label: 'Error' },
    success: { color: 'success', icon: CheckCircleOutlined, label: 'Success' },
    warning: { color: 'warning', icon: ExclamationCircleOutlined, label: 'Warning' },
    info: { color: 'info', icon: InfoCircleOutlined, label: 'Info' }
  };
  return configs[status as keyof typeof configs] || configs.info;
};

// ===== MATERIAL TAILWIND INSPIRED COMPONENTS =====

/**
 * Enhanced Button Component - Material Tailwind inspired API
 */
interface MTButtonProps {
  variant?: 'filled' | 'outlined' | 'gradient' | 'text';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  fullWidth?: boolean;
  loading?: boolean;
  ripple?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const MTButton: React.FC<MTButtonProps> = ({
  variant = 'filled',
  size = 'md',
  color = 'primary',
  fullWidth = false,
  loading = false,
  ripple = true,
  className = '',
  children,
  onClick,
  disabled = false
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-3
    font-medium rounded-lg transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  const getVariantClasses = () => {
    const variants = {
      filled: {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
        secondary: 'bg-slate-500 hover:bg-slate-600 text-white shadow-lg hover:shadow-xl focus:ring-slate-500',
        success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
        error: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
        info: 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg hover:shadow-xl focus:ring-cyan-500',
      },
      outlined: {
        primary: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus:ring-blue-500',
        secondary: 'border-2 border-slate-500 text-slate-500 hover:bg-slate-500 hover:text-white focus:ring-slate-500',
        success: 'border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white focus:ring-green-500',
        warning: 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white focus:ring-yellow-500',
        error: 'border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:ring-red-500',
        info: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white focus:ring-cyan-500',
      },
      gradient: {
        primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
        secondary: 'bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 text-white shadow-lg hover:shadow-xl focus:ring-slate-500',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
        error: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
        info: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-cyan-500',
      },
      text: {
        primary: 'text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
        secondary: 'text-slate-500 hover:bg-slate-50 focus:ring-slate-500',
        success: 'text-green-500 hover:bg-green-50 focus:ring-green-500',
        warning: 'text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-500',
        error: 'text-red-500 hover:bg-red-50 focus:ring-red-500',
        info: 'text-cyan-500 hover:bg-cyan-50 focus:ring-cyan-500',
      }
    };

    return variants[variant]?.[color] || variants.filled.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    return sizes[size];
  };

  return (
    <button
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};

/**
 * Card Components - Material Tailwind inspired structure
 */
interface MTCardProps {
  variant?: 'filled' | 'outlined' | 'elevated';
  color?: 'white' | 'transparent' | 'gray';
  shadow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const MTCard: React.FC<MTCardProps> = ({
  variant = 'filled',
  color = 'white',
  shadow = true,
  className = '',
  children
}) => {
  const getCardClasses = () => {
    let baseClasses = 'rounded-xl overflow-hidden transition-all duration-300';

    // Variant styles
    switch (variant) {
      case 'filled':
        baseClasses += color === 'white' ? ' bg-white' : color === 'gray' ? ' bg-gray-50' : ' bg-transparent';
        break;
      case 'outlined':
        baseClasses += ' border-2 border-gray-200 bg-transparent';
        break;
      case 'elevated':
        baseClasses += ' bg-white shadow-lg hover:shadow-xl';
        break;
    }

    // Shadow
    if (shadow && variant !== 'elevated') {
      baseClasses += ' shadow-md hover:shadow-lg';
    }

    return `${baseClasses} ${className}`;
  };

  return (
    <div className={getCardClasses()}>
      {children}
    </div>
  );
};

interface MTCardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const MTCardHeader: React.FC<MTCardHeaderProps> = ({ className = '', children }) => (
  <div className={`p-6 pb-0 ${className}`}>
    {children}
  </div>
);

interface MTCardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export const MTCardBody: React.FC<MTCardBodyProps> = ({ className = '', children }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

interface MTCardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const MTCardFooter: React.FC<MTCardFooterProps> = ({ className = '', children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

/**
 * Typography Components - Material Tailwind inspired
 */
interface MTTypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'lead' | 'paragraph' | 'small';
  color?: 'inherit' | 'black' | 'white' | 'gray' | 'blue' | 'red' | 'green';
  className?: string;
  children: React.ReactNode;
}

export const MTTypography: React.FC<MTTypographyProps> = ({
  variant = 'paragraph',
  color = 'inherit',
  className = '',
  children
}) => {
  const getTypographyClasses = () => {
    const variants = {
      h1: 'text-4xl font-bold tracking-tight',
      h2: 'text-3xl font-semibold tracking-tight',
      h3: 'text-2xl font-semibold tracking-tight',
      h4: 'text-xl font-semibold tracking-tight',
      h5: 'text-lg font-semibold',
      h6: 'text-base font-semibold',
      lead: 'text-xl font-normal leading-relaxed',
      paragraph: 'text-base font-normal leading-relaxed',
      small: 'text-sm font-normal leading-normal'
    };

    const colors = {
      inherit: '',
      black: 'text-black',
      white: 'text-white',
      gray: 'text-gray-600',
      blue: 'text-blue-600',
      red: 'text-red-600',
      green: 'text-green-600'
    };

    return `${variants[variant]} ${colors[color]} ${className}`;
  };

  return <div className={getTypographyClasses()}>{children}</div>;
};

/**
 * Input Component - Material Tailwind inspired
 */
interface MTInputProps {
  variant?: 'standard' | 'outlined' | 'static';
  size?: 'md' | 'lg';
  color?: 'black' | 'white';
  label?: string;
  error?: boolean;
  success?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

export const MTInput: React.FC<MTInputProps> = ({
  variant = 'outlined',
  size = 'md',
  color = 'black',
  label,
  error = false,
  success = false,
  className = '',
  value,
  onChange,
  placeholder,
  type = 'text'
}) => {
  const getInputClasses = () => {
    let baseClasses = 'w-full bg-transparent placeholder:text-gray-500 focus:outline-none';

    if (variant === 'outlined') {
      baseClasses += ' border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
    } else if (variant === 'standard') {
      baseClasses += ' border-b border-gray-300 px-0 py-2 focus:border-blue-500';
    }

    if (size === 'lg') {
      baseClasses += variant === 'outlined' ? ' text-lg' : ' text-base';
    }

    if (error) baseClasses += ' border-red-500 focus:border-red-500 focus:ring-red-500';
    if (success) baseClasses += ' border-green-500 focus:border-green-500 focus:ring-green-500';

    return `${baseClasses} ${className}`;
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={getInputClasses()}
      />
    </div>
  );
};

/**
 * Avatar Component - Material Tailwind inspired
 */
interface MTAavatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circular' | 'rounded' | 'square';
  className?: string;
  children?: React.ReactNode;
}

export const MTAvatar: React.FC<MTAavatarProps> = ({
  src,
  alt = '',
  size = 'md',
  variant = 'circular',
  className = '',
  children
}) => {
  const getSizeClasses = () => {
    const sizes = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-14 h-14',
      '2xl': 'w-16 h-16'
    };
    return sizes[size];
  };

  const getVariantClasses = () => {
    const variants = {
      circular: 'rounded-full',
      rounded: 'rounded-lg',
      square: 'rounded-none'
    };
    return variants[variant];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${getSizeClasses()} ${getVariantClasses()} object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${getSizeClasses()} ${getVariantClasses()} bg-gray-200 flex items-center justify-center text-gray-600 font-medium ${className}`}>
      {children || alt.charAt(0).toUpperCase()}
    </div>
  );
};

/**
 * Badge Component - Material Tailwind inspired
 */
interface MTBadgeProps {
  content?: string | number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  children?: React.ReactNode;
}

export const MTBadge: React.FC<MTBadgeProps> = ({
  content,
  color = 'primary',
  variant = 'filled',
  size = 'md',
  className = '',
  children
}) => {
  const getBadgeClasses = () => {
    const colors = {
      primary: {
        filled: 'bg-blue-500 text-white',
        outlined: 'border border-blue-500 text-blue-500 bg-transparent',
        ghost: 'bg-blue-100 text-blue-800'
      },
      secondary: {
        filled: 'bg-gray-500 text-white',
        outlined: 'border border-gray-500 text-gray-500 bg-transparent',
        ghost: 'bg-gray-100 text-gray-800'
      },
      success: {
        filled: 'bg-green-500 text-white',
        outlined: 'border border-green-500 text-green-500 bg-transparent',
        ghost: 'bg-green-100 text-green-800'
      },
      warning: {
        filled: 'bg-yellow-500 text-white',
        outlined: 'border border-yellow-500 text-yellow-500 bg-transparent',
        ghost: 'bg-yellow-100 text-yellow-800'
      },
      error: {
        filled: 'bg-red-500 text-white',
        outlined: 'border border-red-500 text-red-500 bg-transparent',
        ghost: 'bg-red-100 text-red-800'
      },
      info: {
        filled: 'bg-cyan-500 text-white',
        outlined: 'border border-cyan-500 text-cyan-500 bg-transparent',
        ghost: 'bg-cyan-100 text-cyan-800'
      }
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm'
    };

    return `inline-flex items-center font-medium rounded-full ${colors[color][variant]} ${sizes[size]} ${className}`;
  };

  return (
    <span className={getBadgeClasses()}>
      {content}
      {children}
    </span>
  );
};

/**
 * Progress Bar Component - Material Tailwind inspired
 */
interface MTProgressBarProps {
  value: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'striped';
  className?: string;
  showValue?: boolean;
}

export const MTProgressBar: React.FC<MTProgressBarProps> = ({
  value,
  color = 'primary',
  size = 'md',
  variant = 'filled',
  className = '',
  showValue = false
}) => {
  const getProgressClasses = () => {
    const colors = {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-cyan-500'
    };

    const sizes = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    };

    let progressClasses = `${colors[color]} ${sizes[size]} rounded-full transition-all duration-300`;

    if (variant === 'striped') {
      progressClasses += ' bg-gradient-to-r from-transparent to-white/20 bg-[length:20px_20px]';
    }

    return progressClasses;
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`}>
      <div
        className={getProgressClasses()}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
      {showValue && (
        <div className="text-xs text-gray-600 mt-1 text-center">
          {value}%
        </div>
      )}
    </div>
  );
};

/**
 * Spinner/Loading Component - Material Tailwind inspired
 */
interface MTSpinnerProps {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MTSpinner: React.FC<MTSpinnerProps> = ({
  color = 'primary',
  size = 'md',
  className = ''
}) => {
  const colors = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
    info: 'border-cyan-500'
  };

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-transparent ${colors[color]} border-t-current`}></div>
    </div>
  );
};

/**
 * Alert Component - Material Tailwind inspired
 */
interface MTAlertProps {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  variant?: 'filled' | 'outlined' | 'ghost';
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const MTAlert: React.FC<MTAlertProps> = ({
  color = 'primary',
  variant = 'filled',
  className = '',
  children,
  onClose
}) => {
  const getAlertClasses = () => {
    const colors = {
      primary: {
        filled: 'bg-blue-50 border-blue-200 text-blue-800',
        outlined: 'border border-blue-200 text-blue-800 bg-transparent',
        ghost: 'bg-blue-50 text-blue-800'
      },
      secondary: {
        filled: 'bg-gray-50 border-gray-200 text-gray-800',
        outlined: 'border border-gray-200 text-gray-800 bg-transparent',
        ghost: 'bg-gray-50 text-gray-800'
      },
      success: {
        filled: 'bg-green-50 border-green-200 text-green-800',
        outlined: 'border border-green-200 text-green-800 bg-transparent',
        ghost: 'bg-green-50 text-green-800'
      },
      warning: {
        filled: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        outlined: 'border border-yellow-200 text-yellow-800 bg-transparent',
        ghost: 'bg-yellow-50 text-yellow-800'
      },
      error: {
        filled: 'bg-red-50 border-red-200 text-red-800',
        outlined: 'border border-red-200 text-red-800 bg-transparent',
        ghost: 'bg-red-50 text-red-800'
      },
      info: {
        filled: 'bg-cyan-50 border-cyan-200 text-cyan-800',
        outlined: 'border border-cyan-200 text-cyan-800 bg-transparent',
        ghost: 'bg-cyan-50 text-cyan-800'
      }
    };

    return `p-4 rounded-lg border ${colors[color][variant]} ${className}`;
  };

  return (
    <div className={getAlertClasses()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-current opacity-50 hover:opacity-75"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// ===== ADVANCED MATERIAL DESIGN 3 COMPONENTS =====

/**
 * Chart Container Component - Material Design 3
 * Wrapper for chart components with proper styling and responsiveness
 */
interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  children: React.ReactNode;
  loading?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  height = 300,
  className = '',
  children,
  loading = false
}) => {
  const { theme } = useTheme();

  return (
    <MTCard variant="elevated" className={className}>
      {(title || subtitle) && (
        <MTCardHeader>
          {title && <MTTypography variant="h5" className="text-gray-900 font-semibold">{title}</MTTypography>}
          {subtitle && <MTTypography variant="paragraph" className="text-gray-600 mt-1">{subtitle}</MTTypography>}
        </MTCardHeader>
      )}
      <MTCardBody className="p-6">
        <div
          className="relative"
          style={{ height: `${height}px` }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <MTSpinner size="lg" />
            </div>
          )}
          {children}
        </div>
      </MTCardBody>
    </MTCard>
  );
};

/**
 * KPI Card Component - Material Design 3
 * Key Performance Indicator display with trend indicators
 */
interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  change,
  changeLabel,
  icon,
  color = 'primary',
  trend,
  loading = false,
  className = ''
}) => {
  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return null;
    const IconComponent = trend === 'up' ? ArrowUpOutlined : ArrowDownOutlined;
    const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
    return <IconComponent className={`${trendColor} text-sm`} />;
  };

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-gray-600';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <MTCard variant="elevated" className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <MTCardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <MTTypography variant="paragraph" className="text-gray-600 font-medium uppercase tracking-wide text-xs">
              {title}
            </MTTypography>
            <div className="flex items-baseline mt-2">
              <MTTypography variant="h2" className="text-gray-900 font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </MTTypography>
              {unit && (
                <MTTypography variant="paragraph" className="text-gray-600 ml-1">
                  {unit}
                </MTTypography>
              )}
            </div>
            {(change !== undefined || changeLabel) && (
              <div className="flex items-center mt-2">
                {getTrendIcon()}
                <MTTypography variant="paragraph" className={`ml-1 font-medium ${getTrendColor()}`}>
                  {change !== undefined && `${change > 0 ? '+' : ''}${change}%`}
                  {changeLabel && ` ${changeLabel}`}
                </MTTypography>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${
            color === 'primary' ? 'bg-blue-50' :
            color === 'success' ? 'bg-green-50' :
            color === 'warning' ? 'bg-yellow-50' :
            'bg-cyan-50'
          }`}>
            <div className={`text-xl ${
              color === 'primary' ? 'text-blue-600' :
              color === 'success' ? 'text-green-600' :
              color === 'warning' ? 'text-yellow-600' :
              'text-cyan-600'
            }`}>
              {icon}
            </div>
          </div>
        </div>
      </MTCardBody>
    </MTCard>
  );
};

/**
 * Data Table Component - Material Design 3
 * Advanced table with sorting, filtering, and pagination
 */
interface DataTableColumn {
  key: string;
  title: string;
  dataIndex: string;
  sortable?: boolean;
  width?: number;
  render?: (value: any, record: any) => React.ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  pagination,
  onSort,
  className = ''
}) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  };

  return (
    <MTCard variant="elevated" className={className}>
      <MTCardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ArrowUpOutlined
                            className={`text-xs ${
                              sortKey === column.key && sortOrder === 'asc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                          <ArrowDownOutlined
                            className={`text-xs -mt-1 ${
                              sortKey === column.key && sortOrder === 'desc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <MTSpinner size="md" />
                    <MTTypography variant="paragraph" className="text-gray-600 mt-2">
                      Loading data...
                    </MTTypography>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <MTTypography variant="paragraph" className="text-gray-600">
                      No data available
                    </MTTypography>
                  </td>
                </tr>
              ) : (
                data.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    {columns.map(column => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.render
                          ? column.render(record[column.dataIndex], record)
                          : (
                            <MTTypography variant="paragraph" className="text-gray-900">
                              {record[column.dataIndex]}
                            </MTTypography>
                          )
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <MTTypography variant="paragraph" className="text-gray-600">
                Showing {((pagination.current - 1) * pagination.pageSize) + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} entries
              </MTTypography>
              <div className="flex space-x-2">
                <MTButton
                  variant="outlined"
                  size="sm"
                  disabled={pagination.current === 1}
                  onClick={() => pagination.onChange(pagination.current - 1)}
                >
                  Previous
                </MTButton>
                <MTButton
                  variant="outlined"
                  size="sm"
                  disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
                  onClick={() => pagination.onChange(pagination.current + 1)}
                >
                  Next
                </MTButton>
              </div>
            </div>
          </div>
        )}
      </MTCardBody>
    </MTCard>
  );
};

/**
 * Navigation Drawer Component - Material Design 3
 * Collapsible navigation drawer with proper MD3 styling
 */
interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

interface NavigationDrawerProps {
  items: NavItem[];
  activeKey?: string;
  collapsed?: boolean;
  onItemClick?: (key: string) => void;
  className?: string;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  items,
  activeKey,
  collapsed = false,
  onItemClick,
  className = ''
}) => {
  return (
    <div className={`fixed left-0 top-0 bottom-0 z-10 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } bg-white shadow-lg border-r border-gray-200 ${className}`}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ThunderboltOutlined className="text-white text-sm" />
            </div>
            <MTTypography variant="h6" className="text-gray-900 font-bold">
              LightDom
            </MTTypography>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <ThunderboltOutlined className="text-white text-sm" />
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="py-4">
        {items.map(item => (
          <div
            key={item.key}
            className={`flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
              activeKey === item.key
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            onClick={() => onItemClick?.(item.key)}
          >
            <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>
              {item.icon}
            </span>
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <MTBadge content={item.badge} color="primary" size="sm" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Breadcrumb Navigation Component - Material Design 3
 */
interface BreadcrumbItem {
  title: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = ''
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400 mx-2">{separator}</span>
          )}
          {item.href || item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              {item.title}
            </button>
          ) : (
            <span className="text-gray-900 font-medium">{item.title}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * Tab Navigation Component - Material Design 3
 */
interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: 'standard' | 'filled' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  onChange,
  variant = 'standard',
  className = ''
}) => {
  const getTabClasses = (isActive: boolean, disabled: boolean) => {
    const baseClasses = 'px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

    if (disabled) {
      return `${baseClasses} text-gray-400 cursor-not-allowed`;
    }

    switch (variant) {
      case 'standard':
        return `${baseClasses} ${
          isActive
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
        }`;
      case 'filled':
        return `${baseClasses} rounded-lg ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`;
      case 'pills':
        return `${baseClasses} rounded-full ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {items.map(item => (
        <button
          key={item.key}
          disabled={item.disabled}
          className={getTabClasses(activeKey === item.key, !!item.disabled)}
          onClick={() => !item.disabled && onChange?.(item.key)}
        >
          <div className="flex items-center space-x-2">
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <MTBadge content={item.badge} color="primary" size="sm" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

/**
 * Modal/Dialog Component - Material Design 3
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  className = ''
}) => {
  if (!open) return null;

  const getSizeClasses = () => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };
    return sizes[size];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${getSizeClasses()} max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <MTTypography variant="h5" className="text-gray-900 font-semibold">
              {title}
            </MTTypography>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Snackbar/Toast Component - Material Design 3
 */
interface SnackbarProps {
  open: boolean;
  message: string;
  action?: React.ReactNode;
  duration?: number;
  onClose: () => void;
  severity?: 'success' | 'error' | 'warning' | 'info';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  action,
  duration = 4000,
  onClose,
  severity = 'info',
  position = 'bottom-right'
}) => {
  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  const getPositionClasses = () => {
    const positions = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position];
  };

  const getSeverityClasses = () => {
    const severities = {
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-600 text-black',
      info: 'bg-blue-600 text-white'
    };
    return severities[severity];
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className={`${getSeverityClasses()} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-80 max-w-md`}>
        <MTTypography variant="paragraph" className="flex-1">
          {message}
        </MTTypography>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/**
 * Form Components - Material Design 3
 */
interface SelectProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  error = false,
  helperText,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {helperText && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Switch Component - Material Design 3
 */
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = ''
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        container: 'w-8 h-5',
        knob: 'w-3 h-3',
        translate: 'translate-x-3'
      },
      md: {
        container: 'w-11 h-6',
        knob: 'w-4 h-4',
        translate: 'translate-x-5'
      }
    };
    return sizes[size];
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <button
        type="button"
        disabled={disabled}
        className={`relative inline-flex ${sizeClasses.container} items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={`inline-block ${sizeClasses.knob} bg-white rounded-full shadow transform transition-transform duration-200 ${
            checked ? sizeClasses.translate : 'translate-x-1'
          }`}
        />
      </button>
      {label && (
        <MTTypography variant="paragraph" className="text-gray-900">
          {label}
        </MTTypography>
      )}
    </div>
  );
};

/**
 * Slider Component - Material Design 3
 */
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  showValue = false,
  className = ''
}) => {
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <MTTypography variant="paragraph" className="text-gray-900 font-medium">
              {label}
            </MTTypography>
          )}
          {showValue && (
            <MTTypography variant="paragraph" className="text-gray-600">
              {value}
            </MTTypography>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
};

// ===== UPDATED EXPORT =====
export default {
  // MD3 Components
  useTheme,
  useLoading,
  useAsyncData,
  StatusCard,
  MetricCard,
  Chip,
  ProgressIndicator,
  FAB,
  ListItem,
  SectionHeader,
  formatNumber,
  getStatusConfig,

  // Material Tailwind Components
  MTButton,
  MTCard,
  MTCardHeader,
  MTCardBody,
  MTCardFooter,
  MTTypography,
  MTInput,
  MTAvatar,
  MTBadge,
  MTProgressBar,
  MTSpinner,
  MTAlert,

  // Advanced MD3 Components
  ChartContainer,
  KPICard,
  DataTable,
  NavigationDrawer,
  Breadcrumb,
  Tabs,
  Modal,
  Snackbar,
  Select,
  Switch,
  Slider,
};

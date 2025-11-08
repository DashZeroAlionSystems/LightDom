/**
 * Advanced Reusable Component Architecture
 * Following React best practices: composition, props interfaces, variants, focused components
 * Based on Material Design 3 and admin UX research
 */

import {
  Card as UiCard,
  CardContent as UiCardContent,
  CardFooter as UiCardFooter,
  CardHeader as UiCardHeader,
  CardTitle as UiCardTitle,
} from '@/components/ui';
import React, { ReactNode } from 'react';
import MD3DesignSystem, { MD3Spacing } from '../styles/NewDesignSystem';

// Simple replacements for antd components
const Typography = {
  Title: ({
    level,
    children,
    className,
  }: {
    level: number;
    children: ReactNode;
    className?: string;
  }) => {
    return React.createElement(`h${level}`, { className }, children);
  },
  Text: ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
};

const Divider = ({ className }: { className?: string }) => (
  <hr className={`border-gray-200 ${className}`} />
);

const { Title, Text } = Typography;

// ===== COMPONENT ARCHITECTURE PATTERNS =====

/**
 * Base Component Props Interface
 * All components should extend this for consistency
 */
interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  'data-testid'?: string;
}

/**
 * Variant-based Component Pattern
 * Components with multiple visual variants
 */
interface VariantComponentProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Interactive Component Props
 * Components that handle user interactions
 */
interface InteractiveComponentProps extends VariantComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onFocus?: () => void;
}

// ===== ADVANCED COMPONENT COMPOSITION =====

/**
 * Card Composition Pattern
 * Header + Body + Footer composition for complex cards
 */
interface CardCompositionProps extends BaseComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof MD3Spacing;
  shadow?: boolean;
}

// Wrap the canonical design-system Card so DSCard aliases render with the same tokens
const CardRoot: React.FC<CardCompositionProps> = ({
  variant = 'elevated',
  padding = 24,
  shadow = true,
  className = '',
  children,
  ...props
}) => {
  // Map AdvancedReusable props to the design-system Card props
  return (
    <UiCard variant={variant as any} className={className} {...(props as any)}>
      {children}
    </UiCard>
  );
};

interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  divider?: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  divider = true,
  className = '',
  children,
  ...props
}) => (
  <UiCardHeader className={className} {...(props as any)}>
    {(title || subtitle || action) && (
      <div className='flex items-center justify-between mb-4'>
        <div className='flex-1'>
          {title && <UiCardTitle className='text-gray-900 font-semibold mb-1'>{title}</UiCardTitle>}
          {subtitle && <Text className='text-gray-600 text-sm'>{subtitle}</Text>}
        </div>
        {action && <div className='ml-4'>{action}</div>}
      </div>
    )}
    {children}
    {divider && <Divider className='my-4' />}
  </UiCardHeader>
);

interface CardBodyProps extends BaseComponentProps {
  padding?: keyof typeof MD3Spacing;
}

const CardBody: React.FC<CardBodyProps> = ({
  padding = 24,
  className = '',
  children,
  ...props
}) => {
  return (
    <UiCardContent className={className} {...(props as any)}>
      {children}
    </UiCardContent>
  );
};

interface CardFooterProps extends BaseComponentProps {
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter: React.FC<CardFooterProps> = ({
  divider = true,
  justify = 'end',
  className = '',
  children,
  ...props
}) => {
  // UiCardFooter expects children; we keep a small layout wrapper for justify
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }[justify];

  return (
    <>
      {divider && <Divider className='my-0' />}
      <UiCardFooter className={`${justifyClass} ${className}`} {...(props as any)}>
        {children}
      </UiCardFooter>
    </>
  );
};

// ===== FOCUSSED SMALL COMPONENTS =====

/**
 * Button Component - Highly customizable with variants
 */
interface ButtonProps extends InteractiveComponentProps {
  fullWidth?: boolean;
  icon?: ReactNode;
  shape?: 'rounded' | 'square' | 'circle';
  type?: 'button' | 'submit' | 'reset';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'md',
  color = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  shape = 'rounded',
  type = 'button',
  icon,
  children,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-3
    font-medium transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-none' : 'rounded-lg'}
  `;

  const getVariantClasses = () => {
    const variants = {
      filled: {
        primary:
          'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
        secondary:
          'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl focus:ring-gray-500',
        success:
          'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
        warning:
          'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
        error:
          'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
        info: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl focus:ring-cyan-500',
      },
      outlined: {
        primary:
          'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
        secondary:
          'border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white focus:ring-gray-500',
        success:
          'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-green-500',
        warning:
          'border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white focus:ring-yellow-500',
        error:
          'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500',
        info: 'border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white focus:ring-cyan-500',
      },
      text: {
        primary: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        secondary: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
        success: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
        warning: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
        error: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
        info: 'text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500',
      },
    };

    return variants[variant]?.[color] || variants.filled.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl',
    };
    return sizes[size];
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent' />
      )}
      {icon && <span className='flex items-center'>{icon}</span>}
      {children}
    </button>
  );
};

// ===== FOCUSSED SMALL COMPONENTS =====

/**
 * Badge Component - Status and notification display
 */
interface BadgeProps extends VariantComponentProps {
  content?: string | number;
  dot?: boolean;
  showZero?: boolean;
  maxCount?: number;
  children?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'filled',
  color = 'primary',
  size = 'md',
  content,
  dot = false,
  showZero = false,
  maxCount,
  children,
  className = '',
  ...props
}) => {
  const getBadgeClasses = () => {
    const colors = {
      primary: {
        filled: 'bg-blue-500 text-white',
        outlined: 'border border-blue-500 text-blue-500 bg-transparent',
        ghost: 'bg-blue-100 text-blue-800',
      },
      secondary: {
        filled: 'bg-gray-500 text-white',
        outlined: 'border border-gray-500 text-gray-500 bg-transparent',
        ghost: 'bg-gray-100 text-gray-800',
      },
      success: {
        filled: 'bg-green-500 text-white',
        outlined: 'border border-green-500 text-green-500 bg-transparent',
        ghost: 'bg-green-100 text-green-800',
      },
      warning: {
        filled: 'bg-yellow-500 text-white',
        outlined: 'border border-yellow-500 text-yellow-500 bg-transparent',
        ghost: 'bg-yellow-100 text-yellow-800',
      },
      error: {
        filled: 'bg-red-500 text-white',
        outlined: 'border border-red-500 text-red-500 bg-transparent',
        ghost: 'bg-red-100 text-red-800',
      },
      info: {
        filled: 'bg-cyan-500 text-white',
        outlined: 'border border-cyan-500 text-cyan-500 bg-transparent',
        ghost: 'bg-cyan-100 text-cyan-800',
      },
    };

    const sizes = {
      xs: 'px-1.5 py-0.5 text-xs',
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
      xl: 'px-3.5 py-1.5 text-lg',
    };

    if (dot) {
      return `inline-block w-2 h-2 rounded-full ${colors[color].filled}`;
    }

    return `inline-flex items-center font-medium rounded-full ${colors[color][variant]} ${sizes[size]} ${className}`;
  };

  if (dot) {
    return (
      <span className={getBadgeClasses()} {...props}>
        {children}
      </span>
    );
  }

  if (content === undefined || content === null || (content === 0 && !showZero)) {
    return <>{children}</>;
  }

  const displayContent =
    maxCount && typeof content === 'number' && content > maxCount ? `${maxCount}+` : content;

  return (
    <span className='relative inline-block'>
      {children}
      <span className={`${getBadgeClasses()} absolute -top-2 -right-2`} {...props}>
        {displayContent}
      </span>
    </span>
  );
};

/**
 * Avatar Component - User representation
 */
interface AvatarProps extends VariantComponentProps {
  src?: string;
  alt?: string;
  fallback?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  variant = 'circular',
  fallback,
  icon,
  children,
  className = '',
  ...props
}) => {
  const getSizeClasses = () => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-14 h-14 text-xl',
      '2xl': 'w-16 h-16 text-2xl',
    };
    return sizes[size];
  };

  const getVariantClasses = () => {
    const variants = {
      circular: 'rounded-full',
      rounded: 'rounded-lg',
      square: 'rounded-none',
    };
    return variants[variant];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${getSizeClasses()} ${getVariantClasses()} object-cover ${className}`}
        {...props}
      />
    );
  }

  const content = children || fallback || alt.charAt(0).toUpperCase();

  return (
    <div
      className={`${getSizeClasses()} ${getVariantClasses()} bg-gray-200 flex items-center justify-center text-gray-600 font-medium ${className}`}
      {...props}
    >
      {icon || content}
    </div>
  );
};

/**
 * Progress Component - Visual progress indicators
 */
interface ProgressProps extends BaseComponentProps {
  type?: 'line' | 'circle' | 'dashboard';
  percent: number;
  showInfo?: boolean;
  status?: 'normal' | 'exception' | 'active' | 'success';
  strokeWidth?: number;
  size?: number;
  width?: number;
  strokeColor?: string;
  format?: (percent: number) => ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export const Progress: React.FC<ProgressProps> = ({
  variant = 'primary',
  type = 'line',
  percent,
  showInfo = true,
  status,
  strokeWidth = 6,
  size = 80,
  format,
  className = '',
  ...props
}) => {
  const getColor = () => {
    switch (variant) {
      case 'primary':
        return '#2563eb';
      case 'secondary':
        return '#6b7280';
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
        return '#06b6d4';
      default:
        return '#2563eb';
    }
  };

  if (type === 'circle' || type === 'dashboard') {
    return (
      <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
        <Progress
          type={type}
          percent={percent}
          width={size}
          strokeColor={getColor()}
          strokeWidth={strokeWidth}
          showInfo={showInfo}
          status={status}
          format={format}
        />
      </div>
    );
  }

  return (
    <Progress
      percent={percent}
      strokeColor={getColor()}
      strokeWidth={strokeWidth}
      showInfo={showInfo}
      status={status}
      format={format}
      className={className}
      {...props}
    />
  );
};

/**
 * Switch Component - Toggle functionality
 */
interface SwitchProps extends InteractiveComponentProps {
  checked: boolean;
  label?: string;
  onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  label,
  disabled = false,
  size = 'md',
  onChange,
  className = '',
  ...props
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        container: 'w-8 h-5',
        knob: 'w-3 h-3',
        translate: 'translate-x-3',
      },
      md: {
        container: 'w-11 h-6',
        knob: 'w-4 h-4',
        translate: 'translate-x-5',
      },
      lg: {
        container: 'w-14 h-7',
        knob: 'w-5 h-5',
        translate: 'translate-x-7',
      },
    };
    return sizes[size];
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <button
        type='button'
        disabled={disabled}
        className={`relative inline-flex ${sizeClasses.container} items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onChange(!checked)}
        {...props}
      >
        <span
          className={`inline-block ${sizeClasses.knob} bg-white rounded-full shadow transform transition-transform duration-200 ${
            checked ? sizeClasses.translate : 'translate-x-1'
          }`}
        />
      </button>
      {label && <span className='text-sm font-medium text-gray-700'>{label}</span>}
    </div>
  );
};

/**
 * Input Component - Focused and accessible
 */
interface InputProps extends InteractiveComponentProps {
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  onChange?: (value: string) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  error,
  helperText,
  required = false,
  type = 'text',
  disabled = false,
  size = 'md',
  onChange,
  prefix,
  suffix,
  className = '',
  ...props
}) => {
  const getInputClasses = () => {
    let baseClasses =
      'w-full bg-transparent placeholder:text-gray-500 focus:outline-none transition-colors duration-200';

    if (error) {
      baseClasses += ' border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500';
    } else {
      baseClasses += ' border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
    }

    if (disabled) {
      baseClasses += ' bg-gray-100 cursor-not-allowed text-gray-500';
    }

    // Size variants
    switch (size) {
      case 'xs':
        baseClasses += ' px-3 py-1.5 text-xs rounded';
        break;
      case 'sm':
        baseClasses += ' px-4 py-2 text-sm rounded-md';
        break;
      case 'md':
        baseClasses += ' px-4 py-3 text-base rounded-lg';
        break;
      case 'lg':
        baseClasses += ' px-4 py-3 text-lg rounded-lg';
        break;
      case 'xl':
        baseClasses += ' px-6 py-4 text-xl rounded-xl';
        break;
    }

    return `${baseClasses} border ${className}`;
  };

  return (
    <div className='space-y-1'>
      {label && (
        <label className='block text-sm font-medium text-gray-700'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <div className='relative'>
        {prefix && (
          <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
            {prefix}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          className={`${getInputClasses()} ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
          {...props}
        />

        {suffix && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
            {suffix}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// ===== FOCUSSED SMALL COMPONENTS =====

/**
 * Select Component - Dropdown selections
 */
interface SelectProps extends InteractiveComponentProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  multiple?: boolean;
  onChange?: (value: string | (string | number)[]) => void;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  required = false,
  multiple = false,
  disabled = false,
  size = 'md',
  onChange,
  className = '',
  ...props
}) => {
  const getSelectClasses = () => {
    let baseClasses =
      'w-full bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-colors duration-200';

    if (error) {
      baseClasses += ' border-red-500 focus:ring-red-500';
    } else {
      baseClasses += ' border-gray-300';
    }

    if (disabled) {
      baseClasses += ' bg-gray-100 cursor-not-allowed text-gray-500';
    }

    // Size variants
    switch (size) {
      case 'xs':
        baseClasses += ' px-3 py-1.5 text-xs';
        break;
      case 'sm':
        baseClasses += ' px-4 py-2 text-sm';
        break;
      case 'md':
        baseClasses += ' px-4 py-3 text-base';
        break;
      case 'lg':
        baseClasses += ' px-4 py-3 text-lg';
        break;
      case 'xl':
        baseClasses += ' px-6 py-4 text-xl';
        break;
    }

    return `${baseClasses} ${className}`;
  };

  return (
    <div className='space-y-1'>
      {label && (
        <label className='block text-sm font-medium text-gray-700'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <div className='relative'>
        <select
          value={value}
          onChange={e =>
            onChange?.(
              multiple
                ? Array.from(e.target.selectedOptions, option => option.value)
                : e.target.value
            )
          }
          disabled={disabled}
          multiple={multiple}
          required={required}
          className={getSelectClasses()}
          {...props}
        >
          {!multiple && (
            <option value='' disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none'>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </div>
      </div>

      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// ===== COMPOSITION EXPORTS =====
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
};

// ===== COMPONENT EXPORTS =====
export default {
  // Core Components
  Button,
  Badge,
  Avatar,
  Progress,
  Switch,
  Input,
  Select,

  // Card Composition
  Card,

  // Re-export MD3 utilities
  ...MD3DesignSystem,
};

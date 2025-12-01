/**
 * Atomic Design Component System
 * 
 * Implements atomic design methodology with reusable component patterns
 * that can be analyzed and improved by neural networks
 */

import React from 'react';
import { designTokens } from './tokens';

// ============================================================================
// ATOMS - Basic building blocks
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing[2],
    border: 'none',
    borderRadius: designTokens.borderRadius.md,
    fontFamily: designTokens.typography.fontFamily.primary,
    fontWeight: designTokens.typography.fontWeight.medium,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: `all ${designTokens.transition.duration.fast} ${designTokens.transition.timing.easeInOut}`,
    opacity: disabled || isLoading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  const variantStyles = {
    filled: {
      background: designTokens.colors.primary[500],
      color: '#ffffff',
    },
    outlined: {
      background: 'transparent',
      border: `2px solid ${designTokens.colors.primary[500]}`,
      color: designTokens.colors.primary[500],
    },
    text: {
      background: 'transparent',
      color: designTokens.colors.primary[500],
    },
    elevated: {
      background: designTokens.colors.surface.elevated,
      color: designTokens.colors.neutral[900],
      boxShadow: designTokens.elevation.md,
    },
  };

  const sizeStyles = {
    sm: {
      height: '32px',
      padding: '0 12px',
      fontSize: designTokens.typography.fontSize.sm,
    },
    md: {
      height: '40px',
      padding: '0 16px',
      fontSize: designTokens.typography.fontSize.base,
    },
    lg: {
      height: '48px',
      padding: '0 24px',
      fontSize: designTokens.typography.fontSize.lg,
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  return (
    <button
      style={combinedStyles}
      disabled={disabled || isLoading}
      className={`atomic-button atomic-button-${variant} atomic-button-${size} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="spinner">⏳</span>
      ) : (
        <>
          {leftIcon && <span className="icon-left">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="icon-right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: designTokens.spacing[2],
    width: fullWidth ? '100%' : 'auto',
  };

  const inputWrapperStyles = {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyles = {
    width: '100%',
    height: '40px',
    padding: `0 ${leftIcon ? '40px' : '12px'} 0 ${leftIcon ? '40px' : '12px'}`,
    border: `1px solid ${error ? designTokens.colors.error : designTokens.colors.neutral[300]}`,
    borderRadius: designTokens.borderRadius.md,
    fontSize: designTokens.typography.fontSize.base,
    fontFamily: designTokens.typography.fontFamily.primary,
    outline: 'none',
    transition: `all ${designTokens.transition.duration.fast} ${designTokens.transition.timing.easeInOut}`,
  };

  const iconStyles = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    color: designTokens.colors.neutral[500],
  };

  return (
    <div style={containerStyles} className={`atomic-input-container ${className}`}>
      {label && (
        <label style={{
          fontSize: designTokens.typography.fontSize.sm,
          fontWeight: designTokens.typography.fontWeight.medium,
          color: designTokens.colors.neutral[700],
        }}>
          {label}
        </label>
      )}
      
      <div style={inputWrapperStyles}>
        {leftIcon && (
          <span style={{ ...iconStyles, left: '12px' }}>{leftIcon}</span>
        )}
        
        <input
          style={inputStyles}
          className="atomic-input"
          {...props}
        />
        
        {rightIcon && (
          <span style={{ ...iconStyles, right: '12px' }}>{rightIcon}</span>
        )}
      </div>
      
      {(error || helperText) && (
        <span style={{
          fontSize: designTokens.typography.fontSize.sm,
          color: error ? designTokens.colors.error : designTokens.colors.neutral[600],
        }}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// MOLECULES - Combinations of atoms
// ============================================================================

export interface CardProps {
  variant?: 'filled' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  children,
  className = '',
  onClick,
}) => {
  const variantStyles = {
    filled: {
      background: designTokens.colors.surface.paper,
      border: 'none',
    },
    outlined: {
      background: designTokens.colors.surface.paper,
      border: `1px solid ${designTokens.colors.neutral[200]}`,
    },
    elevated: {
      background: designTokens.colors.surface.elevated,
      boxShadow: designTokens.elevation.md,
      border: 'none',
    },
  };

  const paddingStyles = {
    none: '0',
    sm: designTokens.spacing[4],
    md: designTokens.spacing[6],
    lg: designTokens.spacing[8],
  };

  const cardStyles = {
    ...variantStyles[variant],
    padding: paddingStyles[padding],
    borderRadius: designTokens.borderRadius.lg,
    transition: `all ${designTokens.transition.duration.normal} ${designTokens.transition.timing.easeInOut}`,
    cursor: onClick ? 'pointer' : 'default',
  };

  return (
    <div
      style={cardStyles}
      className={`atomic-card atomic-card-${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export interface FormGroupProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  children,
  required = false,
  error,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: designTokens.spacing[2],
      marginBottom: designTokens.spacing[4],
    }} className="atomic-form-group">
      <label style={{
        fontSize: designTokens.typography.fontSize.sm,
        fontWeight: designTokens.typography.fontWeight.medium,
        color: designTokens.colors.neutral[700],
      }}>
        {label}
        {required && <span style={{ color: designTokens.colors.error, marginLeft: '4px' }}>*</span>}
      </label>
      
      {children}
      
      {error && (
        <span style={{
          fontSize: designTokens.typography.fontSize.sm,
          color: designTokens.colors.error,
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// ORGANISMS - Complex components built from molecules and atoms
// ============================================================================

export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = { email: '', password: '' };
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({ email, password });
  };

  return (
    <Card variant="elevated" padding="lg">
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing[4],
        minWidth: '320px',
      }}>
        <h2 style={{
          fontSize: designTokens.typography.fontSize['2xl'],
          fontWeight: designTokens.typography.fontWeight.bold,
          color: designTokens.colors.neutral[900],
          marginBottom: designTokens.spacing[2],
        }}>
          Sign In
        </h2>
        
        <FormGroup label="Email" required error={errors.email}>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
        </FormGroup>
        
        <FormGroup label="Password" required error={errors.password}>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
        </FormGroup>
        
        <Button
          type="submit"
          variant="filled"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>
    </Card>
  );
};

// ============================================================================
// Component Metadata for Neural Network Training
// ============================================================================

export const ComponentMetadata = {
  Button: {
    category: 'atom',
    complexity: 2,
    interactivity: 'high',
    accessibility: {
      hasAriaLabels: true,
      keyboardAccessible: true,
      hasVisibleFocus: true,
      hasProperContrast: true,
    },
    designPatterns: ['material-design-3', 'atomic-design'],
  },
  
  Input: {
    category: 'atom',
    complexity: 3,
    interactivity: 'high',
    accessibility: {
      hasAriaLabels: true,
      keyboardAccessible: true,
      hasVisibleFocus: true,
      hasErrorStates: true,
    },
    designPatterns: ['material-design-3', 'form-controls'],
  },
  
  Card: {
    category: 'molecule',
    complexity: 2,
    interactivity: 'low',
    accessibility: {
      hasSemanticHTML: true,
      responsive: true,
    },
    designPatterns: ['material-design-3', 'container-pattern'],
  },
  
  FormGroup: {
    category: 'molecule',
    complexity: 3,
    interactivity: 'medium',
    accessibility: {
      hasLabels: true,
      hasErrorHandling: true,
      hasRequiredIndicators: true,
    },
    designPatterns: ['form-pattern', 'validation'],
  },
  
  LoginForm: {
    category: 'organism',
    complexity: 7,
    interactivity: 'high',
    accessibility: {
      hasFormValidation: true,
      hasErrorHandling: true,
      hasLoadingStates: true,
      keyboardAccessible: true,
    },
    designPatterns: ['authentication', 'form-pattern', 'validation'],
  },
};

export default {
  Button,
  Input,
  Card,
  FormGroup,
  LoginForm,
  ComponentMetadata,
};

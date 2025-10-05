import React from 'react';
import { cn } from '../../utils/cn';

interface GradientTextProps {
  children: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'rainbow' | 'ocean' | 'sunset' | 'forest';
  className?: string;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = 'primary',
  className,
  animate = false,
  size = 'md',
  weight = 'semibold',
}) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-r from-primary to-primary-hover',
    secondary: 'bg-gradient-to-r from-secondary to-secondary-hover',
    accent: 'bg-gradient-to-r from-accent to-accent-hover',
    success: 'bg-gradient-to-r from-success to-success-hover',
    warning: 'bg-gradient-to-r from-warning to-warning-hover',
    error: 'bg-gradient-to-r from-error to-error-hover',
    rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500',
    ocean: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    sunset: 'bg-gradient-to-r from-orange-400 via-pink-500 to-red-500',
    forest: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  return (
    <span
      className={cn(
        'bg-clip-text text-transparent',
        gradientClasses[gradient],
        sizeClasses[size],
        weightClasses[weight],
        animate && 'animate-gradient',
        className
      )}
      style={animate ? {
        backgroundSize: '200% 200%',
        animation: 'gradient 3s ease infinite',
      } : undefined}
    >
      {children}
    </span>
  );
};

// Animated gradient background component
interface GradientBackgroundProps {
  gradient?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'rainbow' | 'ocean' | 'sunset' | 'forest';
  className?: string;
  animate?: boolean;
  children?: React.ReactNode;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  gradient = 'primary',
  className,
  animate = false,
  children,
}) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20',
    secondary: 'bg-gradient-to-br from-secondary/20 via-secondary/10 to-accent/20',
    accent: 'bg-gradient-to-br from-accent/20 via-accent/10 to-primary/20',
    success: 'bg-gradient-to-br from-success/20 via-success/10 to-success/30',
    warning: 'bg-gradient-to-br from-warning/20 via-warning/10 to-warning/30',
    error: 'bg-gradient-to-br from-error/20 via-error/10 to-error/30',
    rainbow: 'bg-gradient-to-br from-red-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 via-indigo-500/20 to-purple-500/20',
    ocean: 'bg-gradient-to-br from-blue-400/20 via-blue-500/20 to-blue-600/20',
    sunset: 'bg-gradient-to-br from-orange-400/20 via-pink-500/20 to-red-500/20',
    forest: 'bg-gradient-to-br from-green-400/20 via-green-500/20 to-green-600/20',
  };

  return (
    <div
      className={cn(
        gradientClasses[gradient],
        animate && 'animate-gradient',
        className
      )}
      style={animate ? {
        backgroundSize: '200% 200%',
        animation: 'gradient 3s ease infinite',
      } : undefined}
    >
      {children}
    </div>
  );
};

// Gradient border component
interface GradientBorderProps {
  gradient?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'rainbow' | 'ocean' | 'sunset' | 'forest';
  className?: string;
  animate?: boolean;
  children?: React.ReactNode;
  width?: 'thin' | 'medium' | 'thick';
}

const GradientBorder: React.FC<GradientBorderProps> = ({
  gradient = 'primary',
  className,
  animate = false,
  children,
  width = 'medium',
}) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-r from-primary to-primary-hover',
    secondary: 'bg-gradient-to-r from-secondary to-secondary-hover',
    accent: 'bg-gradient-to-r from-accent to-accent-hover',
    success: 'bg-gradient-to-r from-success to-success-hover',
    warning: 'bg-gradient-to-r from-warning to-warning-hover',
    error: 'bg-gradient-to-r from-error to-error-hover',
    rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500',
    ocean: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    sunset: 'bg-gradient-to-r from-orange-400 via-pink-500 to-red-500',
    forest: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600',
  };

  const widthClasses = {
    thin: 'p-[1px]',
    medium: 'p-[2px]',
    thick: 'p-[4px]',
  };

  return (
    <div
      className={cn(
        'rounded-lg',
        gradientClasses[gradient],
        widthClasses[width],
        animate && 'animate-gradient',
        className
      )}
      style={animate ? {
        backgroundSize: '200% 200%',
        animation: 'gradient 3s ease infinite',
      } : undefined}
    >
      <div className="bg-surface-elevated rounded-lg h-full w-full">
        {children}
      </div>
    </div>
  );
};

export { GradientText, GradientBackground, GradientBorder };
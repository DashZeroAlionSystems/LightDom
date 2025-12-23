/**
 * Card Component - Design System
 * Exodus-inspired cards with gradients and hover effects
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl border transition-all duration-300';
  
  const variantStyles = {
    default: 'bg-surface border-border',
    gradient: 'bg-gradient-card border-border',
    elevated: 'bg-background-elevated border-border-light shadow-lg',
  };
  
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverStyles = hoverable ? 'hover:border-border-light hover:scale-105 hover:-translate-y-1' : '';
  
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

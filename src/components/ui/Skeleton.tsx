/**
 * Skeleton Component
 * Material Design 3 compliant loading skeleton component
 */

import React from 'react';

export interface SkeletonProps {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional CSS classes */
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  const defaultHeight = {
    text: '1em',
    circular: '3rem',
    rectangular: '3rem',
    rounded: '3rem',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : '3rem'),
    height: height || defaultHeight[variant],
  };

  return (
    <div
      className={`
        bg-surface-variant
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton Group Component
 * Renders multiple skeletons in a pattern
 */
export interface SkeletonGroupProps {
  /** Number of skeleton items */
  count?: number;
  /** Spacing between skeletons */
  spacing?: number;
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count = 3,
  spacing = 3,
  variant = 'text',
  animation = 'pulse',
  className = '',
}) => {
  return (
    <div className={`space-y-${spacing} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant={variant} animation={animation} />
      ))}
    </div>
  );
};

/**
 * Card Skeleton Component
 * Pre-configured skeleton for card loading states
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height="10rem" />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  );
};

/**
 * List Skeleton Component
 * Pre-configured skeleton for list loading states
 */
export const ListSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Table Skeleton Component
 * Pre-configured skeleton for table loading states
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4 pb-2 border-b border-outline">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="flex-1">
            <Skeleton variant="text" width="60%" />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <Skeleton variant="text" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

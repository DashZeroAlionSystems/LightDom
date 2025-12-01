import { cn } from '@/lib/utils';
import React from 'react';

export interface KaggleBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

/**
 * KaggleBadge - Material Design badge/tag component
 *
 * Extracted from Kaggle's badge patterns. Supports multiple variants,
 * sizes, icons, and removable functionality.
 *
 * @example
 * ```tsx
 * <KaggleBadge variant="primary" size="md">
 *   Featured
 * </KaggleBadge>
 *
 * <KaggleBadge variant="success" icon={<CheckIcon />}>
 *   Completed
 * </KaggleBadge>
 *
 * <KaggleBadge variant="danger" onRemove={() => console.log('removed')}>
 *   Error
 * </KaggleBadge>
 * ```
 */
export const KaggleBadge: React.FC<KaggleBadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  rounded = false,
  icon,
  onRemove,
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    primary: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200',
    info: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold transition-colors',
        rounded ? 'rounded-full' : 'rounded',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className='inline-flex'>{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type='button'
          onClick={onRemove}
          className='inline-flex items-center justify-center hover:bg-black hover:bg-opacity-10 rounded-full transition-colors'
          style={{ width: '16px', height: '16px' }}
          aria-label='Remove badge'
        >
          <svg
            className='w-3 h-3'
            fill='currentColor'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              fillRule='evenodd'
              d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default KaggleBadge;

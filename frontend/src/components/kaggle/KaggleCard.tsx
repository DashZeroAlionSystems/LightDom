import { cn } from '@/lib/utils';
import React from 'react';

export interface KaggleCardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  onClick?: () => void;
  image?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  footer?: React.ReactNode;
  hoverable?: boolean;
}

/**
 * KaggleCard - Material Design card component
 *
 * Extracted from Kaggle's design system. Supports multiple variants,
 * images, badges, and interactive states.
 *
 * @example
 * ```tsx
 * <KaggleCard
 *   variant="elevated"
 *   image="/dataset.jpg"
 *   title="COVID-19 Dataset"
 *   description="Comprehensive pandemic data"
 *   badge="Featured"
 *   badgeVariant="primary"
 *   footer={<KaggleButton>View Dataset</KaggleButton>}
 * />
 * ```
 */
export const KaggleCard: React.FC<KaggleCardProps> = ({
  children,
  className,
  variant = 'default',
  onClick,
  image,
  imageAlt,
  title,
  description,
  badge,
  badgeVariant = 'primary',
  footer,
  hoverable = true,
}) => {
  const badgeColors = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
  };

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200 overflow-hidden',
        {
          'bg-white border border-gray-200': variant === 'default',
          'bg-white shadow-md': variant === 'elevated',
          'bg-white border-2 border-blue-200': variant === 'outlined',
          'bg-white border border-gray-200 cursor-pointer': variant === 'interactive',
          'hover:shadow-lg': hoverable && variant === 'elevated',
          'hover:shadow-md hover:border-blue-400':
            hoverable && (variant === 'interactive' || variant === 'default'),
          'hover:border-blue-400': hoverable && variant === 'outlined',
        },
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
    >
      {image && (
        <div className='w-full h-48 overflow-hidden'>
          <img
            src={image}
            alt={imageAlt || title || 'Card image'}
            className='w-full h-full object-cover transition-transform duration-200 hover:scale-105'
          />
        </div>
      )}

      <div className='p-4'>
        {badge && (
          <span
            className={cn(
              'inline-block px-2 py-1 text-xs font-semibold rounded mb-2',
              badgeColors[badgeVariant]
            )}
          >
            {badge}
          </span>
        )}

        {title && <h3 className='text-lg font-bold text-gray-900 mb-2 line-clamp-2'>{title}</h3>}

        {description && <p className='text-sm text-gray-600 mb-3 line-clamp-3'>{description}</p>}

        {children}
      </div>

      {footer && <div className='px-4 py-3 bg-gray-50 border-t border-gray-200'>{footer}</div>}
    </div>
  );
};

export default KaggleCard;

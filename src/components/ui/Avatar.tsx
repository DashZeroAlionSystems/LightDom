/**
 * Avatar Component - Material Design 3
 * User profile images with fallback initials and status indicators
 */

import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, getInitials } from '../../lib/utils';

const avatarVariants = cva(
  [
    'relative inline-flex items-center justify-center overflow-hidden rounded-full',
    'bg-primary text-on-primary font-medium select-none',
    'transition-all duration-medium-2 ease-standard'
  ],
  {
    variants: {
      size: {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        '2xl': 'w-20 h-20 text-xl'
      },
      variant: {
        default: 'bg-primary text-on-primary',
        secondary: 'bg-secondary text-on-secondary',
        tertiary: 'bg-tertiary text-on-tertiary',
        surface: 'bg-surface-container-highest text-on-surface'
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
);

const statusVariants = cva(
  [
    'absolute rounded-full border-2 border-surface',
    'bottom-0 right-0'
  ],
  {
    variants: {
      size: {
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
        xl: 'w-4 h-4',
        '2xl': 'w-5 h-5'
      },
      status: {
        online: 'bg-success',
        offline: 'bg-surface-variant',
        away: 'bg-warning',
        busy: 'bg-error'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /**
   * Image source URL
   */
  src?: string;
  /**
   * Alt text for the image
   */
  alt?: string;
  /**
   * Name to generate initials from if no image
   */
  name?: string;
  /**
   * Custom initials to display (overrides name)
   */
  initials?: string;
  /**
   * Status indicator
   */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /**
   * Custom fallback content
   */
  fallback?: React.ReactNode;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    size, 
    variant,
    src, 
    alt, 
    name, 
    initials,
    status,
    fallback,
    ...props 
  }, ref) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const displayInitials = initials || (name ? getInitials(name) : '');
    const displayAlt = alt || name || 'Avatar';

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageLoaded(false);
      setImageError(true);
    };

    const showImage = src && imageLoaded && !imageError;
    const showFallback = !showImage;

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, variant, className }))}
        {...props}
      >
        {/* Image */}
        {src && (
          <img
            src={src}
            alt={displayAlt}
            className={cn(
              'w-full h-full object-cover',
              showImage ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Fallback content */}
        {showFallback && (
          <div className="flex items-center justify-center w-full h-full">
            {fallback || (
              displayInitials ? (
                <span className="font-medium leading-none">
                  {displayInitials}
                </span>
              ) : (
                // Default user icon
                <svg
                  className="w-1/2 h-1/2 text-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              )
            )}
          </div>
        )}

        {/* Status indicator */}
        {status && (
          <div
            className={cn(statusVariants({ size, status }))}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

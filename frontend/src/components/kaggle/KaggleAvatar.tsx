import { cn } from '@/lib/utils';
import React from 'react';

export interface KaggleAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  border?: boolean;
  onClick?: () => void;
}

/**
 * KaggleAvatar - Material Design avatar component
 *
 * Extracted from Kaggle's user profile patterns. Supports multiple sizes,
 * shapes, status indicators, and fallback text.
 *
 * @example
 * ```tsx
 * <KaggleAvatar
 *   src="/user.jpg"
 *   alt="John Doe"
 *   size="md"
 *   status="online"
 * />
 *
 * <KaggleAvatar
 *   fallback="JD"
 *   size="lg"
 *   shape="square"
 * />
 * ```
 */
export const KaggleAvatar: React.FC<KaggleAvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  shape = 'circle',
  status,
  border = false,
  onClick,
}) => {
  const [error, setError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(!!src);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  React.useEffect(() => {
    if (src) {
      setIsLoading(true);
      setError(false);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setIsLoading(false);
  };

  const getFallbackText = () => {
    if (fallback) return fallback;
    if (alt) {
      const words = alt.split(' ');
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return alt[0].toUpperCase();
    }
    return '?';
  };

  const showFallback = error || !src;

  return (
    <div className='relative inline-block'>
      <div
        className={cn(
          'flex items-center justify-center font-semibold overflow-hidden transition-all',
          {
            'rounded-full': shape === 'circle',
            'rounded-lg': shape === 'square',
            'ring-2 ring-white': border,
            'cursor-pointer hover:opacity-80': onClick,
          },
          sizeClasses[size],
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
      >
        {isLoading && !showFallback && (
          <div className='absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse'>
            <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
          </div>
        )}

        {showFallback ? (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center text-white',
              'bg-gradient-to-br from-blue-500 to-blue-600'
            )}
          >
            {getFallbackText()}
          </div>
        ) : (
          <img
            src={src}
            alt={alt || 'Avatar'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn('w-full h-full object-cover', {
              'opacity-0': isLoading,
              'opacity-100': !isLoading,
            })}
          />
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white',
            statusColors[status],
            statusSizes[size]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default KaggleAvatar;

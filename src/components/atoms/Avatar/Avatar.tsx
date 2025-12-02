import { cn, getInitials } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-medium transition-all',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
      variant: {
        primary: 'from-primary/80 to-primary text-primary-foreground',
        secondary: 'from-secondary/80 to-secondary text-secondary-foreground',
        gradient: 'from-purple-500 to-pink-500 text-white',
        success: 'from-green-400 to-green-600 text-white',
        warning: 'from-yellow-400 to-orange-500 text-white',
        error: 'from-red-400 to-red-600 text-white',
        neutral: 'from-gray-300 to-gray-500 text-gray-900 dark:from-gray-600 dark:to-gray-800 dark:text-white',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
      shape: 'circle',
    },
  }
);

const statusVariants = cva('absolute border-2 border-background rounded-full', {
  variants: {
    status: {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    },
    size: {
      xs: 'h-1.5 w-1.5 -bottom-0 -right-0',
      sm: 'h-2 w-2 -bottom-0 -right-0',
      md: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5',
      lg: 'h-3 w-3 -bottom-0.5 -right-0.5',
      xl: 'h-4 w-4 -bottom-1 -right-1',
      '2xl': 'h-5 w-5 -bottom-1 -right-1',
    },
  },
});

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Name for generating initials */
  name?: string;
  /** Online status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Ring/border highlight */
  ring?: boolean;
  /** Fallback icon when no image or name */
  fallback?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size,
  variant,
  shape,
  status,
  ring,
  fallback,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Reset imageError when src changes
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      );
    }

    if (name) {
      return <span>{getInitials(name)}</span>;
    }

    if (fallback) {
      return fallback;
    }

    // Default user icon
    return (
      <svg
        className="h-1/2 w-1/2"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div
      className={cn(
        avatarVariants({ size, variant, shape }),
        ring && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        className
      )}
      {...props}
    >
      {renderContent()}
      {status && (
        <span className={cn(statusVariants({ status, size }))} aria-label={status} />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

// Avatar Group Component
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars to show before "+N" */
  max?: number;
  /** Size of avatars */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max = 4,
  size = 'md',
  children,
  className,
  ...props
}) => {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const hiddenCount = childArray.length - max;

  const spacing = {
    xs: '-space-x-2',
    sm: '-space-x-3',
    md: '-space-x-4',
    lg: '-space-x-5',
    xl: '-space-x-6',
    '2xl': '-space-x-8',
  };

  return (
    <div className={cn('flex', spacing[size], className)} {...props}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="relative ring-2 ring-background rounded-full">
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
            : child}
        </div>
      ))}
      {hiddenCount > 0 && (
        <Avatar
          size={size}
          variant="neutral"
          name={`+${hiddenCount}`}
          className="ring-2 ring-background"
        />
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';

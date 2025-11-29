import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface AddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Main button text */
  label?: string;
  /** Description or bonus action text */
  description?: string;
  /** Icon to show (defaults to Plus icon) */
  icon?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'outlined';
  /** Full width button */
  fullWidth?: boolean;
}

export const AddButton = ({
  label = 'Add',
  description,
  icon,
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}: AddButtonProps) => {
  const sizeClasses = {
    sm: {
      button: 'px-3 py-1.5 text-sm',
      icon: 'h-4 w-4',
      description: 'text-xs',
    },
    md: {
      button: 'px-4 py-2.5 text-base',
      icon: 'h-5 w-5',
      description: 'text-sm',
    },
    lg: {
      button: 'px-5 py-3 text-lg',
      icon: 'h-6 w-6',
      description: 'text-base',
    },
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outlined: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/10',
  };

  const IconComponent = icon || <Plus className={cn(sizeClasses[size].icon)} />;

  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size].button,
        fullWidth && 'w-full justify-center',
        className
      )}
      {...props}
    >
      <span className="flex-shrink-0">{IconComponent}</span>
      <div className="flex flex-col items-start">
        <span className="font-semibold">{label}</span>
        {description && (
          <span
            className={cn(
              'font-normal opacity-90',
              sizeClasses[size].description
            )}
          >
            {description}
          </span>
        )}
      </div>
    </button>
  );
};

AddButton.displayName = 'AddButton';

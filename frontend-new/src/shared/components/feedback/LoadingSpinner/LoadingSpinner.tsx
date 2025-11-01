import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional message to display below spinner
   */
  message?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * LoadingSpinner Component
 *
 * Displays an animated loading spinner with optional message.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" message="Loading data..." />
 * ```
 */
export const LoadingSpinner = ({ size = 'md', message, className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-color-primary-500', sizeClasses[size])} />
      {message && (
        <p className="text-sm text-color-text-secondary animate-pulse">{message}</p>
      )}
    </div>
  );
};

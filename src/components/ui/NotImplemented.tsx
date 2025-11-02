import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

export interface NotImplementedProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  reason?: string;
  showOverlay?: boolean;
  variant?: 'subtle' | 'prominent';
}

export const NotImplemented = React.forwardRef<HTMLDivElement, NotImplementedProps>(
  ({ children, reason, showOverlay = true, variant = 'subtle', className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {/* The component to be rendered */}
        <div
          className={cn(
            'transition-all duration-300',
            showOverlay && 'pointer-events-none opacity-50 grayscale'
          )}
        >
          {children}
        </div>

        {/* Not implemented overlay */}
        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-sm rounded-xl">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 shadow-level-2',
                variant === 'prominent'
                  ? 'bg-warning-container border border-warning text-warning'
                  : 'bg-surface-container-high border border-outline text-on-surface-variant'
              )}
            >
              {variant === 'prominent' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {reason || 'Not Implemented'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

NotImplemented.displayName = 'NotImplemented';

export interface NotImplementedWrapperProps {
  isImplemented: boolean;
  reason?: string;
  variant?: 'subtle' | 'prominent';
  children: React.ReactNode;
}

export const NotImplementedWrapper: React.FC<NotImplementedWrapperProps> = ({
  isImplemented,
  reason,
  variant = 'subtle',
  children,
}) => {
  if (isImplemented) {
    return <>{children}</>;
  }

  return (
    <NotImplemented reason={reason} variant={variant}>
      {children}
    </NotImplemented>
  );
};

export default NotImplemented;

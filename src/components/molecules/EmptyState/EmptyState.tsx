import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';

const emptyStateStyles = cva(
  'flex flex-col items-center justify-center text-center p-8 rounded-lg',
  {
    variants: {
      variant: {
        default: 'bg-background',
        bordered: 'border-2 border-dashed border-border',
        filled: 'bg-muted',
      },
      size: {
        sm: 'min-h-[200px] max-w-sm',
        md: 'min-h-[300px] max-w-md',
        lg: 'min-h-[400px] max-w-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface EmptyStateProps extends VariantProps<typeof emptyStateStyles> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant,
  size,
  className,
}) => {
  return (
    <div className={`${emptyStateStyles({ variant, size })} ${className || ''}`}>
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50">
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement, {
                className: 'w-16 h-16',
              })
            : icon}
        </div>
      )}

      <Typography variant="h5" className="mb-2">
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" className="text-muted-foreground mb-6 max-w-sm">
          {description}
        </Typography>
      )}

      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button onClick={action.onClick} variant="default" size="md">
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="md">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

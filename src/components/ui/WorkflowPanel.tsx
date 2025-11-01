import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const workflowPanelVariants = cva(
  [
    'relative flex flex-col gap-4 rounded-3xl border px-6 py-5 shadow-level-1',
    'bg-surface-container-high text-on-surface transition-all duration-medium-2 ease-emphasized'
  ],
  {
    variants: {
      status: {
        default: 'border-outline',
        info: 'border-primary/60 bg-primary-container/40',
        success: 'border-success/70 bg-success-container/20',
        warning: 'border-warning/70 bg-warning-container/15',
        error: 'border-error/70 bg-error-container/15'
      },
      emphasis: {
        normal: '',
        elevated: 'shadow-level-2 bg-surface-container-highest',
        subtle: 'shadow-none bg-surface'
      }
    },
    defaultVariants: {
      status: 'default',
      emphasis: 'normal'
    }
  }
);

export interface WorkflowPanelProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof workflowPanelVariants> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}

const WorkflowPanel = React.forwardRef<HTMLElement, WorkflowPanelProps>(
  (
    { title, description, actions, meta, status, emphasis, className, children, ...props },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(workflowPanelVariants({ status, emphasis }), className)}
        {...props}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="md3-title-large text-on-surface truncate" title={title}>
                {title}
              </h3>
            )}
            {description && (
              <p className="md3-body-medium text-on-surface-variant mt-1">
                {description}
              </p>
            )}
          </div>

          {(actions || meta) && (
            <div className="flex flex-col gap-3 md:items-end">
              {meta && <div className="md3-label-medium text-on-surface-variant/80">{meta}</div>}
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
        </div>

        {children && <div className="flex flex-col gap-4">{children}</div>}
      </section>
    );
  }
);

WorkflowPanel.displayName = 'WorkflowPanel';

export interface WorkflowPanelSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const WorkflowPanelSection: React.FC<WorkflowPanelSectionProps> = ({
  inset = false,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col gap-3 border-t border-outline-variant pt-4',
      inset && 'md:ml-6',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const WorkflowPanelFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col gap-3 border-t border-outline-variant pt-4 md:flex-row md:items-center md:justify-between',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export { WorkflowPanel, WorkflowPanelSection, WorkflowPanelFooter };

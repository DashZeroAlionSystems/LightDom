import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const composeShellVariants = cva(
  'relative flex flex-col rounded-3xl border border-outline/40 bg-surface-container-high text-on-surface shadow-level-2 transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'p-4 gap-3',
        md: 'p-5 gap-4',
        lg: 'p-6 gap-5'
      },
      focused: {
        true: 'border-primary/60 shadow-level-3 ring-4 ring-primary/10',
        false: 'hover:border-primary/40 hover:shadow-level-3'
      },
      disabled: {
        true: 'opacity-60 pointer-events-none',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      focused: false,
      disabled: false
    }
  }
);

const composeHeaderVariants = cva('flex items-center justify-between gap-3 text-sm text-on-surface-variant', {
  variants: {
    density: {
      snug: 'text-xs',
      relaxed: 'text-sm'
    }
  },
  defaultVariants: {
    density: 'relaxed'
  }
});

const composeToolbarVariants = cva('flex items-center gap-2 text-on-surface-variant', {
  variants: {
    align: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end'
    }
  },
  defaultVariants: {
    align: 'start'
  }
});

export interface PromptComposeShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof composeShellVariants> {
  header?: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
}

export const PromptComposeShell = React.forwardRef<HTMLDivElement, PromptComposeShellProps>(
  ({ className, size, focused, disabled, header, toolbar, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(composeShellVariants({ size, focused, disabled, className }))}
        {...props}
      >
        {header}
        <div className="flex flex-col gap-3">{children}</div>
        {toolbar}
        {footer && <div className="border-t border-outline-variant/50 pt-4 text-xs text-on-surface-variant">{footer}</div>}
      </div>
    );
  }
);

PromptComposeShell.displayName = 'PromptComposeShell';

export interface PromptComposeHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof composeHeaderVariants> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const PromptComposeHeader: React.FC<PromptComposeHeaderProps> = ({
  className,
  density,
  leading,
  trailing,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', composeHeaderVariants({ density }), className)} {...props}>
      <div className="flex items-center gap-2 text-on-surface-variant">
        {leading}
        <span>{children}</span>
      </div>
      {trailing && <div className="flex items-center gap-2 text-on-surface-variant">{trailing}</div>}
    </div>
  );
};

export interface PromptComposeToolbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof composeToolbarVariants> {}

export const PromptComposeToolbar: React.FC<PromptComposeToolbarProps> = ({ className, align, children, ...props }) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-on-surface-variant', composeToolbarVariants({ align }), className)} {...props}>
      {children}
    </div>
  );
};

export interface PromptComposeInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
  leadingAddon?: React.ReactNode;
  trailingAddon?: React.ReactNode;
}

export const PromptComposeInput = React.forwardRef<HTMLTextAreaElement, PromptComposeInputProps>(
  ({ className, minRows = 3, maxRows = 8, leadingAddon, trailingAddon, ...props }, ref) => {
    return (
      <div className="relative flex items-start gap-3">
        {leadingAddon && <div className="pt-2 text-on-surface-variant">{leadingAddon}</div>}
        <textarea
          ref={ref}
          rows={minRows}
          className={cn(
            'w-full resize-none rounded-2xl border border-outline/30 bg-surface px-4 py-3 text-sm text-on-surface',
            'placeholder:text-on-surface-variant/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            'selection:bg-primary/20 selection:text-on-primary',
            className
          )}
          style={{ maxHeight: `${maxRows * 1.5}rem` }}
          {...props}
        />
        {trailingAddon && <div className="pt-2 text-on-surface-variant">{trailingAddon}</div>}
      </div>
    );
  }
);

PromptComposeInput.displayName = 'PromptComposeInput';

export interface PromptComposeTokenProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon?: React.ReactNode;
  tone?: 'default' | 'accent' | 'warning';
}

export const PromptComposeToken: React.FC<PromptComposeTokenProps> = ({ className, icon, tone = 'default', children, ...props }) => {
  const toneStyles = {
    default: 'bg-surface-container-high text-on-surface border border-outline/40',
    accent: 'bg-primary/10 text-primary border border-primary/30',
    warning: 'bg-warning-container text-on-warning-container border border-warning/30'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {children}
    </span>
  );
};

export interface PromptComposeActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
}

export const PromptComposeAction: React.FC<PromptComposeActionProps> = ({ className, icon, label, active, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-2 rounded-full border border-outline/40 bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant transition-all duration-150',
        'hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        active && 'border-primary bg-primary/10 text-primary shadow-level-1',
        className
      )}
      {...props}
    >
      <span className="text-sm">{icon}</span>
      {label && <span>{label}</span>}
    </button>
  );
};

export interface PromptComposeFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  helpers?: React.ReactNode;
  usage?: React.ReactNode;
}

export const PromptComposeFooter: React.FC<PromptComposeFooterProps> = ({ className, helpers, usage, children, ...props }) => {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant', className)} {...props}>
      <div className="flex items-center gap-2 text-xs text-on-surface-variant/80">{helpers}</div>
      <div className="flex items-center gap-4">
        {children}
        {usage && <span className="font-medium text-on-surface">{usage}</span>}
      </div>
    </div>
  );
};

export const PromptCompose = {
  Shell: PromptComposeShell,
  Header: PromptComposeHeader,
  Toolbar: PromptComposeToolbar,
  Input: PromptComposeInput,
  Token: PromptComposeToken,
  Action: PromptComposeAction,
  Footer: PromptComposeFooter
};

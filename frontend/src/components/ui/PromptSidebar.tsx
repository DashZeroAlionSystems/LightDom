import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarShellVariants = cva(
  'flex flex-col gap-4 rounded-3xl border border-outline/40 bg-surface-container-high p-4 text-on-surface shadow-level-2',
  {
    variants: {
      size: {
        sm: 'p-4 gap-3',
        md: 'p-5 gap-4',
        lg: 'p-6 gap-5'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

export interface PromptSidebarShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarShellVariants> {}

export const PromptSidebarShell = React.forwardRef<HTMLDivElement, PromptSidebarShellProps>(
  ({ className, size, children, ...props }, ref) => (
    <div ref={ref} className={cn(sidebarShellVariants({ size }), className)} {...props}>
      {children}
    </div>
  )
);

PromptSidebarShell.displayName = 'PromptSidebarShell';

const sectionHeaderVariants = cva('flex w-full items-center gap-3 rounded-2xl px-3 py-2 transition-all', {
  variants: {
    tone: {
      neutral: 'hover:bg-surface border border-transparent hover:border-outline/40',
      accent: 'hover:bg-primary/10 border border-primary/20 text-primary',
      subdued: 'hover:bg-surface/60 border border-outline/30 text-on-surface-variant'
    }
  },
  defaultVariants: {
    tone: 'neutral'
  }
});

export interface PromptSidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  tone?: VariantProps<typeof sectionHeaderVariants>['tone'];
  actions?: React.ReactNode;
  defaultOpen?: boolean;
}

export const PromptSidebarSection: React.FC<PromptSidebarSectionProps> = ({
  title,
  icon,
  badge,
  meta,
  tone,
  actions,
  defaultOpen = true,
  children,
  className,
  ...props
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('group rounded-2xl border border-outline/30 bg-surface-container-high/80', className)} {...props}>
      <div className="flex items-center gap-2 px-3 pt-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'flex flex-1 items-center gap-3 rounded-2xl px-0 py-2 text-left transition-all',
            sectionHeaderVariants({ tone })
          )}
        >
          {icon && <div className="rounded-xl bg-surface/70 p-2 text-on-surface-variant">{icon}</div>}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold">{title}</span>
              {badge && <span className="whitespace-nowrap text-xs">{badge}</span>}
            </div>
            {meta && <span className="truncate text-xs text-on-surface-variant/80">{meta}</span>}
          </div>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-on-surface-variant transition-transform duration-200', open && 'rotate-180')} />
        </button>
        {actions && (
          <div className="ml-1 flex items-center gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            {actions}
          </div>
        )}
      </div>
      <div
        className={cn(
          'grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0 overflow-hidden border-t border-outline/20 px-3 py-3">{children}</div>
      </div>
    </div>
  );
};

const itemVariants = cva(
  'group relative flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-transparent px-3 py-2 transition-all duration-150',
  {
    variants: {
      active: {
        true: 'border-primary/40 bg-primary/10 text-primary shadow-level-1',
        false: 'hover:border-outline/40 hover:bg-surface'
      }
    },
    defaultVariants: {
      active: false
    }
  }
);

const indicatorVariants = {
  none: 'bg-transparent',
  gitAdd: 'bg-success',
  gitRemove: 'bg-error',
  gitMerge: 'bg-primary',
  review: 'bg-tertiary',
  custom: ''
} as const;

export type PromptSidebarIndicator = keyof typeof indicatorVariants;

const titleFormatVariants = {
  plain: 'text-sm font-medium text-on-surface',
  code: 'font-mono text-xs tracking-tight text-primary/90',
  hierarchy: 'text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant'
} as const;

export interface PromptSidebarItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'children'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  action?: {
    icon: React.ReactNode;
    label?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  indicator?: PromptSidebarIndicator;
  indicatorColor?: string;
  active?: boolean;
  titleFormat?: keyof typeof titleFormatVariants;
}

export const PromptSidebarItem = React.forwardRef<HTMLButtonElement, PromptSidebarItemProps>(
  (
    {
      icon,
      title,
      description,
      badge,
      meta,
      action,
      indicator = 'none',
      indicatorColor,
      active = false,
      titleFormat = 'plain',
      className,
      ...props
    },
    ref
  ) => {
    const indicatorStyle = indicator === 'custom' && indicatorColor ? indicatorColor : indicatorVariants[indicator];

    return (
      <button
        ref={ref}
        className={cn(itemVariants({ active }), 'group/item', className)}
        {...props}
      >
        <span
          className={cn(
            'absolute inset-y-2 right-2 w-1 rounded-full transition-opacity duration-200',
            indicator !== 'none' ? 'opacity-70' : 'opacity-0'
          )}
          style={indicator === 'custom' && indicatorColor ? { backgroundColor: indicatorColor } : undefined}
          data-indicator={indicator}
        >
          {indicator !== 'custom' && indicator !== 'none' && <span className={cn('block h-full w-full rounded-full', indicatorStyle)} />}
        </span>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-surface text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
            {icon}
          </span>
        )}
        <span className="flex flex-1 flex-col gap-1 text-left">
          <span className={cn('flex items-center gap-2', titleFormatVariants[titleFormat])}>
            {title}
            {badge && <span className="text-xs text-on-surface-variant/80">{badge}</span>}
          </span>
          {description && <span className="text-xs text-on-surface-variant/80">{description}</span>}
          {meta && <span className="text-[11px] text-on-surface-variant/60">{meta}</span>}
        </span>
        {action && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              action.onClick?.(event);
            }}
            className="flex h-8 min-w-[2rem] items-center justify-center rounded-full border border-outline/50 bg-surface-container-high px-3 text-xs font-medium text-on-surface-variant opacity-0 transition-all duration-150 hover:border-primary/50 hover:text-primary focus-visible:opacity-100 group-hover/item:opacity-100"
          >
            <span className="mr-1 text-sm" aria-hidden>
              {action.icon}
            </span>
            {action.label}
          </button>
        )}
      </button>
    );
  }
);

PromptSidebarItem.displayName = 'PromptSidebarItem';

export const PromptSidebarDivider: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('my-2 h-px bg-outline/20', className)} {...props} />
);

export const PromptSidebar = {
  Shell: PromptSidebarShell,
  Section: PromptSidebarSection,
  Item: PromptSidebarItem,
  Divider: PromptSidebarDivider
};

/**
 * Workspace layout primitives for multi-pane editing surfaces.
 * Provides MD3-aligned shells for primary navigation, content canvas, and inspector side panels.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface WorkspaceLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Primary navigation content, rendered on the left rail */
  sidebar: React.ReactNode;
  /** Inspector / secondary panel content rendered on the right rail */
  inspector: React.ReactNode;
  /** Optional header rendered above the main content */
  header?: React.ReactNode;
  /** Main workspace children */
  children: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  sidebar,
  inspector,
  header,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'min-h-screen w-full bg-surface-container-low text-on-surface',
        'grid grid-cols-[320px,1fr,380px] gap-5 px-5 py-6',
        'lg:grid-cols-[280px,1fr,360px] sm:grid-cols-1 sm:px-3 sm:py-4',
        className
      )}
      {...props}
    >
      <aside className="hidden flex-col gap-4 rounded-3xl border border-outline/30 bg-surface-container-high p-5 shadow-level-1 md:flex">
        {sidebar}
      </aside>

      <main className="flex min-h-[70vh] flex-col gap-4 rounded-3xl border border-outline/30 bg-surface p-6 shadow-level-1">
        {header && <div className="flex flex-col gap-3 border-b border-outline/20 pb-4">{header}</div>}
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>

      <aside className="hidden flex-col gap-4 rounded-3xl border border-outline/30 bg-surface-container-high p-5 shadow-level-1 xl:flex">
        {inspector}
      </aside>
    </div>
  );
};

export interface WorkspaceRailSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const WorkspaceRailSection: React.FC<WorkspaceRailSectionProps> = ({
  title,
  description,
  actions,
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex flex-col gap-3 rounded-2xl border border-outline/15 bg-surface-container p-4', className)}
    {...props}
  >
    {(title || description || actions) && (
      <div className="flex items-start justify-between gap-3">
        <div>
          {title && <h3 className="md3-title-small text-on-surface">{title}</h3>}
          {description && <p className="md3-body-small text-on-surface-variant mt-1">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export interface WorkspaceTabsProps extends Omit<DivProps, 'onSelect'> {
  tabs: Array<{
    id: string;
    label: string;
    subtitle?: string;
    version?: string;
    active?: boolean;
    dirty?: boolean;
  }>;
  onSelect?: (id: string) => void;
  onClose?: (id: string) => void;
}

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({ tabs, onSelect, onClose, className, ...props }) => (
  <div
    className={cn(
      'flex items-center gap-2 overflow-x-auto rounded-2xl border border-outline/20 bg-surface-container-low p-2',
      className
    )}
    {...props}
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onSelect?.(tab.id)}
        className={cn(
          'group relative inline-flex items-center gap-3 rounded-xl px-4 py-2 text-left transition-all',
          tab.active
            ? 'bg-primary/12 text-on-surface shadow-level-1'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        )}
      >
        <div className="flex flex-col leading-tight">
          <span className="md3-title-small">{tab.label}</span>
          {tab.subtitle && <span className="md3-body-small text-on-surface-variant/80">{tab.subtitle}</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant/70">
          {tab.version && <span className="rounded-full bg-outline/20 px-2 py-0.5">v{tab.version}</span>}
          {tab.dirty && <span className="text-warning">•</span>}
        </div>
        {onClose && (
          <span
            role="button"
            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-outline/10"
            onClick={(event) => {
              event.stopPropagation();
              onClose(tab.id);
            }}
          >
            ×
          </span>
        )}
      </button>
    ))}
  </div>
);

export interface WorkspaceToggleGroupOption {
  value: string;
  label: string;
  badge?: string;
}

export interface WorkspaceToggleGroupProps extends Omit<DivProps, 'onChange'> {
  options: WorkspaceToggleGroupOption[];
  value: string;
  onChange: (value: string) => void;
}

export const WorkspaceToggleGroup: React.FC<WorkspaceToggleGroupProps> = ({
  options,
  value,
  onChange,
  className,
  ...props
}) => (
  <div
    className={cn(
      'inline-flex items-center gap-1 rounded-full border border-outline/20 bg-surface-container-high p-1',
      className
    )}
    {...props}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'relative inline-flex items-center gap-2 rounded-full px-4 py-2 md3-label-medium transition-all',
            active
              ? 'bg-primary text-on-primary shadow-level-1'
              : 'text-on-surface-variant hover:bg-surface-container-high/80'
          )}
        >
          {option.label}
          {option.badge && (
            <span className={cn('rounded-full px-2 py-0.5 text-xs', active ? 'bg-primary/20' : 'bg-outline/20')}>
              {option.badge}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export interface WorkspaceSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

export const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({
  title,
  meta,
  actions,
  className,
  children,
  ...props
}) => (
  <section className={cn('flex flex-col gap-4 rounded-2xl border border-outline/15 bg-surface-container p-5', className)} {...props}>
    {(title || meta || actions) && (
      <header className="flex items-start justify-between gap-4">
        <div>
          {title && <h2 className="md3-title-medium text-on-surface">{title}</h2>}
          {meta && <div className="md3-body-small text-on-surface-variant/80 mt-1">{meta}</div>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
    )}
    {children}
  </section>
);

export default WorkspaceLayout;

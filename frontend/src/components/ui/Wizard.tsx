import React, { createContext, useContext, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, AlertTriangle, PauseCircle, Play } from 'lucide-react';

export type WizardStepStatus = 'pending' | 'active' | 'completed' | 'blocked';

export interface WizardStepMeta {
  caption?: string;
  badge?: string;
  timestamp?: string;
  helperText?: string;
}

export interface WizardStepDescriptor {
  id: string;
  title: string;
  subtitle?: string;
  status: WizardStepStatus;
  icon?: React.ReactNode;
  meta?: WizardStepMeta;
}

interface WizardContextValue {
  steps: WizardStepDescriptor[];
  activeStepId: string;
  setActiveStep?: (id: string) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

const statusStyles: Record<WizardStepStatus, { icon: React.ReactNode; tone: string; border: string; dot: string }> = {
  pending: {
    icon: <Circle className="h-4 w-4" />,
    tone: 'text-on-surface-variant',
    border: 'border-outline-variant',
    dot: 'bg-outline-variant',
  },
  active: {
    icon: <Play className="h-4 w-4" />,
    tone: 'text-primary',
    border: 'border-primary',
    dot: 'bg-primary',
  },
  completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    tone: 'text-success',
    border: 'border-success',
    dot: 'bg-success',
  },
  blocked: {
    icon: <AlertTriangle className="h-4 w-4" />,
    tone: 'text-error',
    border: 'border-error',
    dot: 'bg-error',
  },
};

export interface WizardProps {
  title: string;
  description?: string;
  steps: WizardStepDescriptor[];
  activeStepId: string;
  onStepChange?: (stepId: string) => void;
  className?: string;
  actions?: React.ReactNode;
  sideContent?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const Wizard: React.FC<WizardProps> = ({
  title,
  description,
  steps,
  activeStepId,
  onStepChange,
  actions,
  sideContent,
  footer,
  className,
  children,
}) => {
  const completedCount = steps.filter((step) => step.status === 'completed').length;
  const progressLabel = `${completedCount}/${steps.length} steps complete`;

  const contextValue = useMemo<WizardContextValue>(
    () => ({ steps, activeStepId, setActiveStep: onStepChange }),
    [steps, activeStepId, onStepChange],
  );

  return (
    <WizardContext.Provider value={contextValue}>
      <section className={cn('flex flex-col gap-6 rounded-3xl border border-outline bg-surface-container-high p-6 shadow-level-2', className)}>
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="md3-headline-small text-on-surface">{title}</h2>
            {description && (
              <p className="md3-body-medium text-on-surface-variant max-w-3xl">{description}</p>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container/60 px-3 py-1 text-xs font-medium text-on-surface-variant">
              <span className="inline-flex h-2 w-2 items-center justify-center rounded-full bg-primary" />
              {progressLabel}
            </span>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <nav className="space-y-4">
            {steps.map((step, index) => {
              const isActive = step.id === activeStepId;
              const styles = statusStyles[step.status];

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange?.(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    styles.border,
                    isActive ? 'bg-primary-container/20 shadow-level-1' : 'hover:bg-surface-container-highest',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                      <span className={cn('absolute h-full w-full rounded-full border', styles.border)} />
                      <span className={cn('relative inline-flex h-2 w-2 rounded-full', styles.dot)} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('md3-title-small', styles.tone)}>{step.title}</span>
                        {step.meta?.badge && (
                          <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                            {step.meta.badge}
                          </span>
                        )}
                      </div>
                      {step.subtitle && (
                        <p className="md3-body-small text-on-surface-variant">{step.subtitle}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/80">
                        <span className="inline-flex items-center gap-1">
                          <span className="flex h-4 w-4 items-center justify-center">{styles.icon}</span>
                          {step.status === 'blocked'
                            ? 'Action required'
                            : step.status === 'completed'
                              ? 'Completed'
                              : step.status === 'active'
                                ? 'In progress'
                                : 'Pending'}
                        </span>
                        {step.meta?.timestamp && (
                          <span>• Updated {step.meta.timestamp}</span>
                        )}
                        {step.meta?.caption && (
                          <span>• {step.meta.caption}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-on-surface-variant">{index + 1}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="space-y-6">
            {sideContent}
            {children}
          </div>
        </div>

        {footer && <div className="border-t border-outline-variant pt-4">{footer}</div>}
      </section>
    </WizardContext.Provider>
  );
};

export interface WizardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  stepId: string;
}

export const WizardContent: React.FC<WizardContentProps> = ({ stepId, className, children, ...props }) => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('WizardContent must be used within a Wizard');
  }

  if (context.activeStepId !== stepId) {
    return null;
  }

  return (
    <div
      className={cn('rounded-3xl border border-outline bg-surface p-6 shadow-level-1', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface WizardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({ leading, trailing, className, children, ...props }) => (
  <div
    className={cn(
      'flex flex-col gap-3 rounded-3xl border border-outline bg-surface-container-high px-4 py-3 md:flex-row md:items-center md:justify-between',
      className,
    )}
    {...props}
  >
    <div className="flex flex-col gap-1 text-on-surface-variant">
      {leading}
      {children}
    </div>
    <div className="flex flex-wrap items-center gap-2">{trailing}</div>
  </div>
);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a Wizard');
  }
  return context;
};

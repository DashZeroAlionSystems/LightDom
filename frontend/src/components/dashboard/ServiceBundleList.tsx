import React from 'react';
import { CheckCircle2, Circle, Clock, Play, Power, ShieldAlert, ShieldCheck, ThermometerSun } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ServiceActionButton,
} from '@/components/ui';
import { cn } from '@/lib/utils';

export type ServiceStatus = 'running' | 'starting' | 'degraded' | 'stopped' | 'failed' | 'disabled';

type StatusPresentation = {
  label: string;
  tone: 'success' | 'warning' | 'error' | 'neutral';
  icon: React.ReactNode;
};

export const SERVICE_STATUS_META: Record<ServiceStatus, StatusPresentation> = {
  running: {
    label: 'Running',
    tone: 'success',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  starting: {
    label: 'Starting',
    tone: 'warning',
    icon: <Clock className="h-4 w-4" />,
  },
  degraded: {
    label: 'Degraded',
    tone: 'warning',
    icon: <ThermometerSun className="h-4 w-4" />,
  },
  stopped: {
    label: 'Stopped',
    tone: 'neutral',
    icon: <Circle className="h-4 w-4" />,
  },
  failed: {
    label: 'Failed',
    tone: 'error',
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  disabled: {
    label: 'Disabled',
    tone: 'neutral',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
};

export const SERVICE_STATUS_TONE_CLASSES: Record<StatusPresentation['tone'], string> = {
  success: 'bg-success/15 text-on-success',
  warning: 'bg-warning/15 text-on-warning',
  error: 'bg-error/15 text-on-error',
  neutral: 'bg-surface-container text-on-surface-variant',
};

export interface ServiceSummary {
  id: string;
  name: string;
  status: ServiceStatus;
  description?: string;
  healthSummary?: string;
  featureFlag?: string;
  manifestRef?: string;
}

export interface ServiceBundleSummary {
  id: string;
  name: string;
  description?: string;
  status: ServiceStatus;
  manifestPath?: string;
  featureFlag?: string;
  tags?: string[];
  services: ServiceSummary[];
  actions?: {
    startLabel?: string;
    stopLabel?: string;
  };
}

export interface ServiceBundleListProps {
  bundles: ServiceBundleSummary[];
  onSelectBundle?: (bundleId: string) => void;
  onStartBundle?: (bundleId: string) => Promise<void> | void;
  onStopBundle?: (bundleId: string) => Promise<void> | void;
  onToggleService?: (bundleId: string, serviceId: string) => Promise<void> | void;
  className?: string;
}

const renderStatusBadge = (status: ServiceStatus) => {
  const presentation = SERVICE_STATUS_META[status];

  return (
    <Badge
      size="sm"
      variant="outline"
      className={cn(
        'flex items-center gap-1 border-0 px-2 py-1 font-medium',
        SERVICE_STATUS_TONE_CLASSES[presentation.tone],
      )}
    >
      {presentation.icon}
      <span>{presentation.label}</span>
    </Badge>
  );
};

export const ServiceBundleList: React.FC<ServiceBundleListProps> = ({
  bundles,
  onSelectBundle,
  onStartBundle,
  onStopBundle,
  onToggleService,
  className,
}) => {
  return (
    <div className={cn('grid gap-5 md:grid-cols-2 xl:grid-cols-3', className)}>
      {bundles.map((bundle) => {
        const presentation = SERVICE_STATUS_META[bundle.status];
        const isRunning = bundle.status === 'running' || bundle.status === 'starting';

        return (
          <Card
            key={bundle.id}
            className="flex h-full flex-col rounded-3xl border border-outline/40 bg-surface-container-high shadow-level-1 transition-all duration-200 hover:border-outline hover:shadow-level-2"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <CardTitle className="text-lg text-on-surface">{bundle.name}</CardTitle>
                  {bundle.description && (
                    <CardDescription className="text-sm text-on-surface-variant">
                      {bundle.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {renderStatusBadge(bundle.status)}
                  {bundle.featureFlag && (
                    <Badge size="sm" variant="outline" className="border-primary/40 text-primary">
                      {bundle.featureFlag}
                    </Badge>
                  )}
                </div>
              </div>

              {bundle.tags && bundle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {bundle.tags.map((tag) => (
                    <Badge key={tag} size="sm" variant="outline" className="border-outline/40 text-on-surface-variant">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="rounded-2xl border border-outline/30 bg-surface p-3">
                <div className="mb-2 flex items-center justify-between text-sm text-on-surface-variant">
                  <span className="font-medium">Services</span>
                  <span>{bundle.services.length}</span>
                </div>
                <ul className="space-y-2">
                  {bundle.services.map((service) => {
                    const servicePresentation = SERVICE_STATUS_META[service.status];

                    return (
                      <li
                        key={service.id}
                        className="group flex items-start justify-between gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm transition-all duration-150 hover:border-outline/40 hover:bg-surface-container-high"
                      >
                        <div className="flex flex-1 flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-on-surface">
                            <span className="font-medium">{service.name}</span>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                SERVICE_STATUS_TONE_CLASSES[servicePresentation.tone],
                              )}
                            >
                              {servicePresentation.icon}
                              {servicePresentation.label}
                            </span>
                          </div>
                          {(service.description || service.healthSummary) && (
                            <p className="text-xs text-on-surface-variant/80">
                              {service.healthSummary ?? service.description}
                            </p>
                          )}
                          {service.featureFlag && (
                            <span className="text-[11px] text-primary/80">Flag: {service.featureFlag}</span>
                          )}
                        </div>

                        {onToggleService && (
                          <Button
                            size="sm"
                            variant="text"
                            className="mt-1 text-xs text-primary"
                            onClick={() => onToggleService(bundle.id, service.id)}
                          >
                            Toggle
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {bundle.manifestPath && (
                <div className="rounded-2xl border border-outline/20 bg-surface-container p-3 text-xs text-on-surface-variant/80">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant/70">
                    Manifest
                  </span>
                  <p className="mt-1 truncate text-sm text-on-surface">{bundle.manifestPath}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex gap-2">
                  {onStartBundle && (
                    <ServiceActionButton
                      label={bundle.actions?.startLabel ?? 'Start bundle'}
                      description="Launch all services"
                      icon={<Play className="h-4 w-4" />}
                      onAction={() => onStartBundle(bundle.id)}
                      variant="primary"
                      status={isRunning ? 'running' : undefined}
                    />
                  )}
                  {onStopBundle && (
                    <ServiceActionButton
                      label={bundle.actions?.stopLabel ?? 'Stop bundle'}
                      description="Stop running services"
                      icon={<Power className="h-4 w-4" />}
                      onAction={() => onStopBundle(bundle.id)}
                      variant="secondary"
                    />
                  )}
                </div>

                {onSelectBundle && (
                  <Button
                    size="sm"
                    variant="text"
                    className="text-sm text-primary"
                    onClick={() => onSelectBundle(bundle.id)}
                  >
                    Inspect
                  </Button>
                )}
              </div>

              <div className="flex w-full items-center justify-between rounded-2xl border border-outline/20 bg-surface p-3 text-xs text-on-surface-variant/80">
                <span>Bundle status</span>
                <div className="flex items-center gap-2 text-on-surface">
                  {presentation.icon}
                  <span className="font-medium">{presentation.label}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

ServiceBundleList.displayName = 'ServiceBundleList';

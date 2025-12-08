import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  type CrawleePipelineConfig,
  type CrawleeStatus,
  crawleeStatusBackgrounds,
  crawleeStatusColors,
} from '@/config/crawleeUiConfig';
import { CheckCircle2, Clock, PlayCircle, Settings2 } from 'lucide-react';
import React from 'react';

const statusLabel: Record<string, string> = {
  completed: 'Completed',
  pending: 'Pending',
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  paused: 'Paused',
};

const resolveStatusClass = (status: CrawleeStatus | 'completed' | 'pending') => {
  if (status === 'completed') {
    return {
      text: 'text-emerald-400',
      background: 'bg-emerald-500/10',
    };
  }
  if (status === 'pending') {
    return {
      text: 'text-slate-300',
      background: 'bg-slate-500/10',
    };
  }
  return {
    text: crawleeStatusColors[status],
    background: crawleeStatusBackgrounds[status],
  };
};

interface CrawleePipelinePanelProps {
  pipelines: CrawleePipelineConfig[];
}

export const CrawleePipelinePanel: React.FC<CrawleePipelinePanelProps> = ({ pipelines }) => {
  return (
    <div className='space-y-4'>
      {pipelines.map(pipeline => (
        <Card key={pipeline.id} className='border border-outline/20 bg-surface-container'>
          <CardHeader className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-on-surface'>{pipeline.name}</CardTitle>
              <p className='text-xs text-on-surface-variant'>Owned by {pipeline.owner}</p>
            </div>
            <div className='flex flex-wrap gap-2 text-xs text-on-surface-variant'>
              <span className='inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1'>
                <Clock className='h-3.5 w-3.5' />
                {pipeline.runtime}
              </span>
              <span className='inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1'>
                <PlayCircle className='h-3.5 w-3.5' />
                {pipeline.nextRun}
              </span>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {pipeline.steps.map(step => {
              const classes = resolveStatusClass(step.status);
              return (
                <div
                  key={step.id}
                  className='flex flex-col gap-2 rounded-2xl border border-outline/15 bg-surface px-4 py-3 text-sm text-on-surface md:flex-row md:items-center md:justify-between'
                >
                  <div className='flex items-center gap-3'>
                    <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                      {step.status === 'completed' ? (
                        <CheckCircle2 className='h-4 w-4' />
                      ) : (
                        <Settings2 className='h-4 w-4' />
                      )}
                    </span>
                    <div>
                      <p className='font-semibold'>{step.label}</p>
                      {step.description ? (
                        <p className='text-xs text-on-surface-variant'>{step.description}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className='flex flex-col items-start gap-2 md:items-end'>
                    <span className='text-xs text-on-surface-variant'>~ {step.duration}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${classes.background} ${classes.text}`}
                    >
                      {statusLabel[step.status] ?? step.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

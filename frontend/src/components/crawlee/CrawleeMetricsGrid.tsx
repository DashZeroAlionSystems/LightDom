import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  type CrawleeMetricConfig,
  type CrawleeTrend,
  crawleeStatusBackgrounds,
  crawleeStatusColors,
} from '@/config/crawleeUiConfig';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import React from 'react';

const trendIcon: Record<CrawleeTrend, React.FC<React.SVGProps<SVGSVGElement>>> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  steady: Minus,
};

interface CrawleeMetricsGridProps {
  metrics: CrawleeMetricConfig[];
}

export const CrawleeMetricsGrid: React.FC<CrawleeMetricsGridProps> = ({ metrics }) => {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {metrics.map(metric => {
        const statusColor = metric.status
          ? crawleeStatusColors[metric.status]
          : 'text-on-surface-variant';
        const statusBackground = metric.status
          ? crawleeStatusBackgrounds[metric.status]
          : 'bg-surface-container-low';
        const TrendIcon = trendIcon[metric.trend ?? 'steady'];

        return (
          <Card
            key={metric.id}
            className='border border-outline/20 bg-surface-container hover:border-outline/40 transition-colors'
          >
            <CardHeader className='space-y-1'>
              <CardTitle className='text-sm font-medium text-on-surface'>{metric.label}</CardTitle>
              {metric.subtitle ? (
                <p className='text-xs text-on-surface-variant'>{metric.subtitle}</p>
              ) : null}
            </CardHeader>
            <CardContent className='flex items-end justify-between'>
              <div>
                <p className='text-2xl font-semibold text-on-surface'>{metric.value}</p>
                {metric.delta ? (
                  <div className='mt-2 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium text-on-surface'>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${statusBackground} ${statusColor}`}
                    >
                      <TrendIcon className='h-3.5 w-3.5' />
                      {metric.delta}
                    </span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

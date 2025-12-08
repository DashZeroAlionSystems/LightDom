import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  type CrawleeCrawlerConfig,
  crawleeStatusBackgrounds,
  crawleeStatusColors,
} from '@/config/crawleeUiConfig';
import { Gauge, Timer, Zap } from 'lucide-react';
import React from 'react';

interface CrawleeCrawlerBoardProps {
  crawlers: CrawleeCrawlerConfig[];
}

export const CrawleeCrawlerBoard: React.FC<CrawleeCrawlerBoardProps> = ({ crawlers }) => {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {crawlers.map(crawler => {
        const statusColor = crawleeStatusColors[crawler.status];
        const statusBackground = crawleeStatusBackgrounds[crawler.status];
        return (
          <Card
            key={crawler.id}
            className='flex h-full flex-col border border-outline/20 bg-surface-container'
          >
            <CardHeader className='flex flex-row items-start justify-between gap-3'>
              <div>
                <CardTitle className='text-base text-on-surface'>{crawler.name}</CardTitle>
                <p className='text-xs text-on-surface-variant'>{crawler.description}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBackground} ${statusColor}`}
              >
                {crawler.status.toUpperCase()}
              </span>
            </CardHeader>
            <CardContent className='flex flex-1 flex-col gap-4'>
              <div className='grid grid-cols-2 gap-3 text-xs text-on-surface-variant'>
                <div className='rounded-xl border border-outline/10 bg-surface px-3 py-2'>
                  <span className='text-foreground font-semibold text-sm'>{crawler.cadence}</span>
                  <p className='mt-1 flex items-center gap-2'>
                    <Timer className='h-3.5 w-3.5 text-on-surface-variant' />
                    Last run {crawler.lastRun}
                  </p>
                </div>
                <div className='rounded-xl border border-outline/10 bg-surface px-3 py-2'>
                  <span className='text-foreground font-semibold text-sm'>{crawler.coverage}</span>
                  <p className='mt-1 flex items-center gap-2'>
                    <Zap className='h-3.5 w-3.5 text-on-surface-variant' />
                    {crawler.activeSeeds} active seeds
                  </p>
                </div>
                <div className='rounded-xl border border-outline/10 bg-surface px-3 py-2'>
                  <span className='text-foreground font-semibold text-sm'>
                    {crawler.totalDocs} documents
                  </span>
                  <p className='mt-1'>Success rate {(crawler.successRate * 100).toFixed(1)}%</p>
                  <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low'>
                    <div
                      className='h-full rounded-full bg-primary'
                      style={{ width: `${Math.min(100, Math.max(0, crawler.successRate * 100))}%` }}
                    />
                  </div>
                </div>
                <div className='rounded-xl border border-outline/10 bg-surface px-3 py-2'>
                  <span className='text-foreground font-semibold text-sm'>Health</span>
                  <p className='mt-1 flex items-center gap-2'>
                    <Gauge className='h-3.5 w-3.5 text-on-surface-variant' />
                    {crawler.alerts?.length
                      ? `${crawler.alerts.length} alerts`
                      : 'All systems nominal'}
                  </p>
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                {crawler.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant='outline'
                    className='rounded-full border-outline/30 text-xs text-on-surface-variant'
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {crawler.alerts?.length ? (
                <div className='rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-on-surface'>
                  <p className='font-medium text-rose-300'>Active Alerts</p>
                  <ul className='mt-1 list-disc pl-4 text-xs text-rose-200/80'>
                    {crawler.alerts.map(alert => (
                      <li key={alert}>{alert}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

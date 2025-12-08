import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  type CrawleeEventConfig,
  crawleeStatusBackgrounds,
  crawleeStatusColors,
} from '@/config/crawleeUiConfig';
import { Activity } from 'lucide-react';
import React from 'react';

interface CrawleeEventTimelineProps {
  events: CrawleeEventConfig[];
}

export const CrawleeEventTimeline: React.FC<CrawleeEventTimelineProps> = ({ events }) => {
  return (
    <Card className='border border-outline/20 bg-surface-container'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='text-on-surface text-base'>Operational Timeline</CardTitle>
          <p className='text-xs text-on-surface-variant'>
            Live events across crawlers and pipelines.
          </p>
        </div>
        <Badge
          variant='outline'
          className='rounded-full border-outline/30 text-xs text-on-surface-variant'
        >
          <Activity className='mr-1 h-3.5 w-3.5' />
          Live feed
        </Badge>
      </CardHeader>
      <CardContent className='space-y-4'>
        {events.map(event => {
          const color = crawleeStatusColors[event.severity];
          const background = crawleeStatusBackgrounds[event.severity];
          return (
            <div key={event.id} className='flex gap-3'>
              <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${color}`} />
              <div className='flex-1 space-y-1 rounded-xl border border-outline/10 bg-surface px-4 py-2'>
                <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
                  <p className='text-sm font-semibold text-on-surface'>{event.source}</p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${background} ${color}`}
                  >
                    {event.severity.toUpperCase()}
                  </span>
                </div>
                <p className='text-xs text-on-surface-variant'>
                  {new Date(event.timestamp).toLocaleString()}
                </p>
                <p className='text-sm text-on-surface'>{event.message}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

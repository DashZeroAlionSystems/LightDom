import type {
  CrawleeActionConfig,
  CrawleeCrawlerConfig,
  CrawleeEventConfig,
  CrawleeMetricConfig,
  CrawleePipelineConfig,
  CrawleeSeedSourceConfig,
} from '@/config/crawleeUiConfig';
import { crawleeUiConfig } from '@/config/crawleeUiConfig';
import React from 'react';
import { CrawleeActionBar } from './CrawleeActionBar';
import { CrawleeCrawlerBoard } from './CrawleeCrawlerBoard';
import { CrawleeEventTimeline } from './CrawleeEventTimeline';
import { CrawleeMetricsGrid } from './CrawleeMetricsGrid';
import { CrawleePipelinePanel } from './CrawleePipelinePanel';
import { CrawleeSeedPanel } from './CrawleeSeedPanel';

export interface CrawleeControlCenterProps {
  metrics?: CrawleeMetricConfig[];
  actions?: CrawleeActionConfig[];
  crawlers?: CrawleeCrawlerConfig[];
  pipelines?: CrawleePipelineConfig[];
  seeds?: CrawleeSeedSourceConfig[];
  events?: CrawleeEventConfig[];
  onActionSelect?: (action: CrawleeActionConfig) => void;
}

export const CrawleeControlCenter: React.FC<CrawleeControlCenterProps> = ({
  metrics = crawleeUiConfig.metrics,
  actions = crawleeUiConfig.actions,
  crawlers = crawleeUiConfig.crawlers,
  pipelines = crawleeUiConfig.pipelines,
  seeds = crawleeUiConfig.seeds,
  events = crawleeUiConfig.events,
  onActionSelect,
}) => {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <CrawleeMetricsGrid metrics={metrics} />
        <CrawleeActionBar actions={actions} onActionSelect={onActionSelect} />
      </div>

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]'>
        <div className='space-y-6'>
          <CrawleeCrawlerBoard crawlers={crawlers} />
          <CrawleePipelinePanel pipelines={pipelines} />
        </div>
        <div className='space-y-6'>
          <CrawleeSeedPanel sources={seeds} />
          <CrawleeEventTimeline events={events} />
        </div>
      </div>
    </div>
  );
};

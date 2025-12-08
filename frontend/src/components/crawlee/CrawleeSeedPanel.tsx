import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { CrawleeSeedSourceConfig } from '@/config/crawleeUiConfig';
import { Globe2, LinkIcon, Network, UploadCloud } from 'lucide-react';
import React from 'react';

const seedIconMap: Record<
  CrawleeSeedSourceConfig['type'],
  React.FC<React.SVGProps<SVGSVGElement>>
> = {
  sitemap: LinkIcon,
  rss: Globe2,
  manual: UploadCloud,
  api: Network,
};

interface CrawleeSeedPanelProps {
  sources: CrawleeSeedSourceConfig[];
}

export const CrawleeSeedPanel: React.FC<CrawleeSeedPanelProps> = ({ sources }) => {
  return (
    <Card className='border border-outline/20 bg-surface-container'>
      <CardHeader>
        <CardTitle className='text-on-surface text-base'>Seed Source Inventory</CardTitle>
        <p className='text-xs text-on-surface-variant'>
          Track freshness across all ingestion points.
        </p>
      </CardHeader>
      <CardContent className='space-y-3'>
        {sources.map(source => {
          const Icon = seedIconMap[source.type];
          return (
            <div
              key={source.id}
              className='flex items-center justify-between gap-4 rounded-2xl border border-outline/15 bg-surface px-4 py-3'
            >
              <div className='flex items-center gap-3'>
                <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <Icon className='h-5 w-5' />
                </span>
                <div>
                  <p className='text-sm font-semibold text-on-surface'>{source.label}</p>
                  <p className='text-xs text-on-surface-variant'>{source.description}</p>
                </div>
              </div>
              <div className='text-right text-xs text-on-surface-variant'>
                <p className='text-sm font-semibold text-on-surface'>{source.count} feeds</p>
                <p>{source.freshness}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

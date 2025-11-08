import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardSection } from './Card';
import { Button } from './Button';
import ToggleSwitch from './ToggleSwitch';
import { cn } from '@/lib/utils';

export interface CrawlerConfig {
  parallelCrawlers: number;
  maxDepth: number;
  respectRobotsTxt: boolean;
  rateLimit: number;
  timeout: number;
}

export interface ConfigPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: CrawlerConfig;
  onChange?: (cfg: CrawlerConfig) => void;
  title?: string;
  autoApply?: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  value,
  onChange,
  title = 'Crawler Settings',
  autoApply = false,
  className,
  ...props
}) => {
  const initial: CrawlerConfig = value || {
    parallelCrawlers: 3,
    maxDepth: 3,
    respectRobotsTxt: true,
    rateLimit: 10,
    timeout: 30000,
  };

  const [cfg, setCfg] = useState<CrawlerConfig>(initial);

  useEffect(() => {
    if (value) setCfg(value);
  }, [value]);

  useEffect(() => {
    if (autoApply) onChange?.(cfg);
  }, [cfg, autoApply]);

  const update = (k: keyof CrawlerConfig, v: any) => {
    setCfg((s) => {
      const next = { ...s, [k]: v } as CrawlerConfig;
      return next;
    });
  };

  const apply = () => onChange?.(cfg);
  const reset = () => setCfg(initial);

  return (
    <div className={cn('w-full', className)} {...props}>
      <Card header={<CardHeader title={title} />}>
        <div className="space-y-4 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Parallel Crawlers</label>
              <input
                type="number"
                min={1}
                max={100}
                value={cfg.parallelCrawlers}
                onChange={(e) => update('parallelCrawlers', Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Depth</label>
              <input
                type="number"
                min={1}
                max={20}
                value={cfg.maxDepth}
                onChange={(e) => update('maxDepth', Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rate Limit (req/s)</label>
              <input
                type="number"
                min={0}
                max={1000}
                value={cfg.rateLimit}
                onChange={(e) => update('rateLimit', Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Timeout (ms)</label>
              <input
                type="number"
                min={1000}
                max={600000}
                value={cfg.timeout}
                onChange={(e) => update('timeout', Math.max(1000, Number(e.target.value) || 1000))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ToggleSwitch checked={cfg.respectRobotsTxt} onChange={(v) => update('respectRobotsTxt', v)} label="Respect robots.txt" />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={reset} size="sm">Reset</Button>
              <Button variant="primary" onClick={apply} size="sm">Apply</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfigPanel;

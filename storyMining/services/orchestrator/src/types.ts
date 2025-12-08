export interface StoryMinerConfig {
  redis: {
    host: string;
    port: number;
    db?: number;
    prefix?: string;
  };
  queues: {
    discovery: string;
    crawler: string;
    classifier: string;
    enrichment: string;
  };
}

export interface DiscoveryJob {
  source: 'github' | 'showcase' | 'custom';
  payload: Record<string, unknown>;
}

export interface CrawlJob {
  url: string;
  storyId?: string;
  batchId: string;
  origin?: string;
  metadata?: Record<string, unknown>;
}

export interface CrawlAssets {
  screenshotPath: string;
  htmlPath: string;
  metadataPath: string;
  layersPath: string;
}

export interface ClassifierJob {
  batchId: string;
  sourceUrl?: string;
  origin?: string;
  assets: CrawlAssets;
}

export type StoryMinerJob =
  | { type: 'discovery'; data: DiscoveryJob }
  | { type: 'crawl'; data: CrawlJob }
  | { type: 'classify'; data: ClassifierJob };

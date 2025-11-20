import { z } from 'zod';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

const MiningDataSchema = z.object({
  totalMined: z.number().nonnegative().default(0),
  activeMiners: z.number().nonnegative().default(0),
  tokensEarned: z.number().nonnegative().default(0),
  miningRate: z.number().nonnegative().default(0),
  efficiency: z.number().nonnegative().default(0),
  minedToday: z.number().nonnegative().default(0),
  minedThisWeek: z.number().nonnegative().default(0),
  totalSizeMinedBytes: z.number().nonnegative().default(0),
  spaceReclaimedBytes: z.number().nonnegative().default(0),
  crawlerStatus: z.string().default('unknown'),
  lastUpdate: z.string().optional(),
});

const CrawlerStatsSchema = z.object({
  isRunning: z.boolean().default(false),
  crawledCount: z.number().nonnegative().default(0),
  discoveredCount: z.number().nonnegative().default(0),
  crawledToday: z.number().nonnegative().default(0),
  avgSeoScore: z.number().nonnegative().default(0),
  totalSpaceSaved: z.number().nonnegative().default(0),
  seoTrainingRecords: z.number().nonnegative().default(0),
});

const RecentCrawlSchema = z.object({
  url: z.string(),
  domain: z.string(),
  crawledAt: z.string(),
  seoScore: z.number().optional(),
  sizeBytes: z.number().optional(),
  spaceSaved: z.number().optional(),
});

export type MiningData = z.infer<typeof MiningDataSchema>;
export type CrawlerStats = z.infer<typeof CrawlerStatsSchema>;
export type RecentCrawl = z.infer<typeof RecentCrawlSchema>;

const jsonFetch = async <TSchema extends z.ZodTypeAny>(
  endpoint: string,
  schema: TSchema,
  init?: RequestInit
): Promise<z.output<TSchema>> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request to ${endpoint} failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return schema.parse(data);
};

const RecentCrawlsResponseSchema = z.object({
  crawls: z.array(RecentCrawlSchema).default([]),
});

const getMiningData = (): Promise<MiningData> =>
  jsonFetch('/metaverse/mining-data', MiningDataSchema);

const getCrawlerStats = (): Promise<CrawlerStats> =>
  jsonFetch('/crawler/stats', CrawlerStatsSchema);

const getRecentCrawls = async (limit = 5): Promise<RecentCrawl[]> => {
  const result = await jsonFetch(`/crawler/recent?limit=${limit}`, RecentCrawlsResponseSchema);
  return result.crawls ?? [];
};

const getDashboardData = async (limit = 5): Promise<DashboardData> => {
  const [mining, crawler, recentCrawls] = await Promise.all([
    getMiningData(),
    getCrawlerStats(),
    getRecentCrawls(limit),
  ]);

  return {
    mining,
    crawler,
    recentCrawls,
  };
};

export const dashboardApi = {
  getMiningData,
  getCrawlerStats,
  getRecentCrawls,
  getDashboardData,
};

export type DashboardData = {
  mining: MiningData;
  crawler: CrawlerStats;
  recentCrawls: RecentCrawl[];
};

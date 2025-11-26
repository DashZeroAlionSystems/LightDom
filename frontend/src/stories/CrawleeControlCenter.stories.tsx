import {
  CrawleeActionBar,
  CrawleeControlCenter,
  CrawleeCrawlerBoard,
  CrawleeEventTimeline,
  CrawleeMetricsGrid,
  CrawleePipelinePanel,
  CrawleeSeedPanel,
} from '@/components/crawlee';
import { crawleeUiConfig } from '@/config/crawleeUiConfig';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Crawler/Crawlee Control Center',
  component: CrawleeControlCenter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Crawlee Control Center

A Material-inspired command center for orchestrating Crawlee crawlers. The UI is composed of atom-focused
panels so teams can remix telemetry, pipeline health, and configuration surfaces as needed.

- **Metrics Grid** — high-level telemetry with trend awareness
- **Action Palette** — quick workflows for creation, throttling, and exports
- **Crawler Board** — operational view of every crawler with health and alerts
- **Pipeline Panel** — visualises enrichment stages, owners, and runtime cadence
- **Seed Inventory** — tracks ingestion sources and freshness windows
- **Event Timeline** — live log of operations, alerts, and automation responses
        `,
      },
    },
  },
  decorators: [
    Story => (
      <div className='min-h-screen bg-surface-container-low p-6 text-on-surface'>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const MetricsOverview: Story = {
  render: () => <CrawleeMetricsGrid metrics={crawleeUiConfig.metrics} />,
};

export const ActionPalette: Story = {
  render: () => (
    <CrawleeActionBar
      actions={crawleeUiConfig.actions}
      onActionSelect={action => console.log('Action selected:', action.id)}
    />
  ),
};

export const CrawlerConfigurations: Story = {
  render: () => <CrawleeCrawlerBoard crawlers={crawleeUiConfig.crawlers} />,
};

export const PipelinePlanner: Story = {
  render: () => <CrawleePipelinePanel pipelines={crawleeUiConfig.pipelines} />,
};

export const SeedInventory: Story = {
  render: () => <CrawleeSeedPanel sources={crawleeUiConfig.seeds} />,
};

export const EventTimeline: Story = {
  render: () => <CrawleeEventTimeline events={crawleeUiConfig.events} />,
};

export const FullExperience: Story = {
  render: () => (
    <CrawleeControlCenter onActionSelect={action => console.log('Triggered:', action.label)} />
  ),
};

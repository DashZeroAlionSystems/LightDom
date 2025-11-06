import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Sparkles, MessageCircle, RefreshCw, GitBranch, Database } from 'lucide-react';

import {
  PromptSidebarShell,
  PromptSidebarSection,
  PromptSidebarItem,
  PromptSidebarDivider,
} from '@/components/ui';

const meta: Meta<typeof PromptSidebarShell> = {
  title: 'Dashboard/Prompt Sidebar',
  component: PromptSidebarShell,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-5xl">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PromptSidebarShell>;

export const ConversationInsights: Story = {
  name: 'Conversation Insights',
  render: () => (
    <PromptSidebarShell>
      <PromptSidebarSection
        title="Latest response"
        icon={<Sparkles className="h-4 w-4" />}
        meta="10:42"
        tone="accent"
        actions={
          <button type="button" className="text-xs font-medium text-on-surface-variant hover:text-primary">
            Reset
          </button>
        }
      >
        <p className="text-sm text-on-surface">
          DeepSeek suggests extending the crawler workflow with a nightly QA pass and adding diff alerts for schema drift.
        </p>
        <div className="mt-3 rounded-xl border border-outline/20 bg-surface p-3 text-xs text-on-surface-variant">
          Workflow generator is queued for rerun once metrics stabilise.
        </div>
      </PromptSidebarSection>

      <PromptSidebarDivider />

      <PromptSidebarSection
        title="Recent conversation"
        icon={<MessageCircle className="h-4 w-4" />}
        meta="5 entries"
      >
        <div className="space-y-2">
          <PromptSidebarItem
            title="DeepSeek"
            titleFormat="code"
            description="Nightly QA run scheduled across 42 target domains."
            meta="10:42"
            indicator="gitMerge"
            active
          />
          <PromptSidebarItem
            title="You"
            description="Prioritise backlink inventory after crawler refresh."
            meta="10:39"
          />
          <PromptSidebarItem
            title="DeepSeek"
            titleFormat="code"
            description="Crawler metrics recovered to 97% uptime."
            meta="10:35"
            indicator="review"
          />
        </div>
      </PromptSidebarSection>

      <PromptSidebarSection
        title="Datasets referenced"
        icon={<Database className="h-4 w-4" />}
        meta="Crawl logs • SEO index"
        tone="subdued"
        defaultOpen={false}
      >
        <ul className="space-y-1 text-xs text-on-surface-variant/80">
          <li>crawler.metrics.latest.json</li>
          <li>backlink-inventory.parquet</li>
          <li>seo-radar.csv</li>
        </ul>
      </PromptSidebarSection>
    </PromptSidebarShell>
  ),
};

export const WorkflowShortcuts: Story = {
  name: 'Workflow Shortcuts',
  render: () => (
    <PromptSidebarShell className="bg-surface">
      <PromptSidebarSection
        title="Quick actions"
        icon={<RefreshCw className="h-4 w-4" />}
        meta="Updated 5m ago"
        actions={<button className="text-xs text-primary" type="button">Manage</button>}
      >
        <div className="space-y-2">
          <PromptSidebarItem
            title="Sync crawler stats"
            description="Pull the latest metrics snapshot"
            indicator="gitAdd"
            action={{ icon: <RefreshCw className="h-4 w-4" />, label: 'Run' }}
          />
          <PromptSidebarItem
            title="Generate PR plan"
            titleFormat="hierarchy"
            description="Draft release checklist from runtime diffs"
            indicator="custom"
            indicatorColor="#8b5cf6"
            action={{ icon: <GitBranch className="h-4 w-4" />, label: 'Open' }}
          />
        </div>
      </PromptSidebarSection>
    </PromptSidebarShell>
  ),
};

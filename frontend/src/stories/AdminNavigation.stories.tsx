import type { Meta, StoryObj } from '@storybook/react';
import { useMemo } from 'react';
import AdminNavigationPanel from '@/components/admin/AdminNavigationPanel';
import AdminConsoleWorkspace, {
  type AdminConsoleWorkspaceProps,
} from '@/components/admin/AdminConsoleWorkspace';
import type { AdminNavigationCategory } from '@/services/adminNavigation';
import type { AdminNavigationStatus } from '@/hooks/useAdminNavigation';

const mockCategories: AdminNavigationCategory[] = [
  {
    category_id: 'cat_seo_automation',
    category: 'SEO Automation',
    subcategory: 'Crawler orchestration',
    icon: '🛠️',
    sort_order: 1,
    schema_version: '1.0.0',
    knowledge_graph_attributes: {
      persona: 'Automation Lead',
      primaryKpis: ['Crawler uptime', 'Tokens earned'],
      quickActions: ['View logs', 'Launch enrichment'],
    },
    updated_at: new Date().toISOString(),
    templates: [
      {
        template_id: 'tpl_enrichment',
        name: 'Content enrichment pipeline',
        description: 'Generates schema.org annotations and orchestrates DeepSeek QA.',
        category: 'SEO Automation',
        subcategory: 'Crawler orchestration',
        icon: '✨',
        sort_order: 1,
        schema_version: '1.2.0',
        knowledge_graph_attributes: {
          contentSources: ['n8n/templates/enrichment.json'],
          aiModels: ['deepseek-chat', 'ollama-mixtral'],
        },
        status_steps: [
          { index: 0, id: 'discover', title: 'Discover URLs', status: 'Running' },
          { index: 1, id: 'cluster', title: 'Cluster intents', status: 'Pending' },
          { index: 2, id: 'enrich', title: 'Enrich metadata', status: 'Idle' },
        ],
        workflow_summary: {
          prompt: 'Enrich SaaS landing pages with structured data and internal link hints.',
          lastRun: '2025-11-08T17:12:00Z',
        },
        source_path: 'n8n/templates/content-enrichment.json',
        updated_at: new Date().toISOString(),
      },
    ],
    subcategories: {
      'Crawler orchestration': [],
    },
  },
  {
    category_id: 'cat_systems',
    category: 'Systems',
    subcategory: 'Observability',
    icon: '📊',
    sort_order: 2,
    schema_version: '1.0.0',
    knowledge_graph_attributes: {
      dashboards: ['crawler-health', 'ai-audit'],
      alerts: ['schema drift', 'crawler downtime'],
    },
    updated_at: new Date().toISOString(),
    templates: [],
    subcategories: {
      Observability: [],
    },
  },
];

const templateCount = mockCategories.reduce((acc, category) => acc + category.templates.length, 0);

const adminNavigationMeta: Meta<typeof AdminNavigationPanel> = {
  title: 'Admin/Admin Navigation Panel',
  component: AdminNavigationPanel,
  parameters: {
    layout: 'centered',
  },
};

export default adminNavigationMeta;

type PanelStory = StoryObj<typeof AdminNavigationPanel>;

export const ReadyState: PanelStory = {
  args: {
    categories: mockCategories,
    status: 'ready',
    templateCount,
    selectedCategoryId: mockCategories[0].category_id,
    selectedTemplateId: mockCategories[0].templates[0].template_id,
  },
};

export const LoadingState: PanelStory = {
  args: {
    categories: [],
    status: 'loading',
    templateCount: 0,
  },
};

export const EmptyState: PanelStory = {
  args: {
    categories: [],
    status: 'ready',
    templateCount: 0,
  },
};

const useMockAdminNavigation = () => {
  return useMemo(() => {
    const status: AdminNavigationStatus = 'ready';
    return {
      categories: mockCategories,
      status,
      error: null,
      templateCount,
      refresh: async () => undefined,
    };
  }, []);
};

const workspaceMeta: Meta<typeof AdminConsoleWorkspace> = {
  title: 'Admin/Admin Console Workspace',
  component: AdminConsoleWorkspace,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-background p-6'>
        <div className='mx-auto max-w-6xl'>
          <Story />
        </div>
      </div>
    ),
  ],
};

export const WorkspaceDemo: StoryObj<typeof AdminConsoleWorkspace> = {
  name: 'Workspace with Navigation',
  render: (args: AdminConsoleWorkspaceProps) => (
    <AdminConsoleWorkspace {...args} />
  ),
  args: {
    navigationHook: useMockAdminNavigation,
  },
};

export { workspaceMeta as AdminConsoleWorkspaceStories };

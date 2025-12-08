import * as LucideIcons from 'lucide-react';

export type AdminSidebarFeatureFlag =
  | 'systemMonitoring'
  | 'billing'
  | 'crawlerOps'
  | 'workflows'
  | 'developerTools'
  | 'metaverse'
  | 'content'
  | 'data'
  | 'experimental';

export type AdminSidebarActionId = 'create-page' | 'create-dashboard';

export interface AdminSidebarBaseItem {
  id: string;
  label: string;
  description?: string;
  featureFlag?: AdminSidebarFeatureFlag;
  badge?: string;
  icon: keyof typeof LucideIcons;
}

export interface AdminSidebarLinkConfig extends AdminSidebarBaseItem {
  type?: 'link';
  path: string;
  external?: boolean;
}

export interface AdminSidebarActionConfig extends AdminSidebarBaseItem {
  type: 'action';
  actionId: AdminSidebarActionId;
}

export type AdminSidebarItemConfig = AdminSidebarLinkConfig | AdminSidebarActionConfig;

export interface AdminSidebarSectionConfig {
  id: string;
  title: string;
  defaultOpen?: boolean;
  items: AdminSidebarItemConfig[];
}

export type AdminSidebarFeatureToggles = Partial<Record<AdminSidebarFeatureFlag, boolean>>;

export interface AdminSidebarConfigOptions {
  featureToggles?: AdminSidebarFeatureToggles;
  exclude?: string[];
  include?: string[];
}

export const defaultAdminSidebarSections: AdminSidebarSectionConfig[] = [
  {
    id: 'overview',
    title: 'Overview',
    defaultOpen: true,
    items: [
      {
        id: 'dashboard',
        label: 'Command Center',
        description: 'Unified admin dashboard',
        icon: 'LayoutDashboard',
        path: '/admin-dashboard',
        type: 'link',
      },
      {
        id: 'prompt-console',
        label: 'Prompt Console',
        description: 'DeepSeek & automation control',
        icon: 'TerminalSquare',
        path: '/prompt-console',
        type: 'link',
        featureFlag: 'developerTools',
      },
      {
        id: 'settings',
        label: 'Platform Settings',
        description: 'Configure system wide defaults',
        icon: 'Settings2',
        path: '/settings',
        type: 'link',
      },
    ],
  },
  {
    id: 'build',
    title: 'Build & Launch',
    defaultOpen: true,
    items: [
      {
        id: 'create-page',
        label: 'New Experience',
        description: 'Scaffold a production-ready page',
        icon: 'FilePlus2',
        type: 'action',
        actionId: 'create-page',
      },
      {
        id: 'create-dashboard',
        label: 'Analytics Workspace',
        description: 'Generate dashboard boilerplate',
        icon: 'BarChart4',
        type: 'action',
        actionId: 'create-dashboard',
      },
      {
        id: 'workflow-wizard',
        label: 'Workflow Studio',
        description: 'Design orchestrated automation',
        icon: 'Workflow',
        path: '/workflow-wizard',
        type: 'link',
        featureFlag: 'workflows',
      },
      {
        id: 'component-bundles',
        label: 'Component Bundles',
        description: 'Reusable UI + logic packs',
        icon: 'PackagePlus',
        path: '/component-bundles',
        type: 'link',
        featureFlag: 'content',
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    defaultOpen: true,
    items: [
      {
        id: 'crawler-dashboard',
        label: 'Crawler Dashboard',
        description: 'SEO harvesting & seeders',
        icon: 'Radar',
        path: '/crawlee-manager',
        type: 'link',
        featureFlag: 'crawlerOps',
      },
      {
        id: 'data-mining',
        label: 'Data Mining Ops',
        description: 'Automation pipelines & tasks',
        icon: 'DatabaseZap',
        path: '/data-mining',
        type: 'link',
        featureFlag: 'data',
      },
      {
        id: 'service-graph',
        label: 'Service Graph',
        description: 'Observe services & flows',
        icon: 'ActivitySquare',
        path: '/service-graph',
        type: 'link',
        featureFlag: 'systemMonitoring',
      },
      {
        id: 'workflows',
        label: 'Runbooks',
        description: 'Manage end-to-end workflows',
        icon: 'GitBranch',
        path: '/workflows',
        type: 'link',
        featureFlag: 'workflows',
      },
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoring & Finance',
    defaultOpen: false,
    items: [
      {
        id: 'self-organizing',
        label: 'Self-Organizing Ops',
        description: 'Autonomous adjustments',
        icon: 'Cpu',
        path: '/self-organizing-dashboard',
        type: 'link',
        featureFlag: 'systemMonitoring',
      },
      {
        id: 'security-audit',
        label: 'Security Audit',
        description: 'Audit & compliance center',
        icon: 'ShieldCheck',
        path: '/security-audit-report',
        type: 'link',
        featureFlag: 'systemMonitoring',
      },
      {
        id: 'billing',
        label: 'Billing Intelligence',
        description: 'Revenue, plans, subscriptions',
        icon: 'CreditCard',
        path: '/dashboard/admin/billing',
        type: 'link',
        featureFlag: 'billing',
      },
    ],
  },
  {
    id: 'futures',
    title: 'Labs & Experimental',
    defaultOpen: false,
    items: [
      {
        id: 'metaverse',
        label: 'Metaverse Bridge',
        description: 'NFT and virtual land',
        icon: 'Sparkles',
        path: '/metaverse-nft',
        type: 'link',
        featureFlag: 'metaverse',
      },
      {
        id: 'space-mining',
        label: 'Space Mining',
        description: '3D DOM mining simulations',
        icon: 'Rocket',
        path: '/space-mining',
        type: 'link',
        featureFlag: 'experimental',
      },
    ],
  },
];

export const adminSidebarDefaults = {
  featureToggles: {
    systemMonitoring: true,
    billing: true,
    crawlerOps: true,
    workflows: true,
    developerTools: true,
    metaverse: false,
    content: true,
    data: true,
    experimental: false,
  } satisfies Required<AdminSidebarFeatureToggles>,
};

export const getAdminSidebarSections = (
  options: AdminSidebarConfigOptions = {}
): AdminSidebarSectionConfig[] => {
  const { featureToggles = {}, include = [], exclude = [] } = options;
  const mergedFlags: AdminSidebarFeatureToggles = {
    ...adminSidebarDefaults.featureToggles,
    ...featureToggles,
  };

  const shouldInclude = (id: string, flag?: AdminSidebarFeatureFlag) => {
    if (include.length > 0 && include.includes(id)) {
      return true;
    }

    if (exclude.includes(id)) {
      return false;
    }

    if (!flag) {
      return true;
    }

    return mergedFlags[flag] !== false;
  };

  return defaultAdminSidebarSections
    .map(section => {
      const filteredItems = section.items.filter(item => shouldInclude(item.id, item.featureFlag));
      if (filteredItems.length === 0) {
        return null;
      }
      return { ...section, items: filteredItems };
    })
    .filter((section): section is AdminSidebarSectionConfig => Boolean(section));
};

export type { AdminSidebarItemConfig, AdminSidebarSectionConfig as AdminSidebarSection };

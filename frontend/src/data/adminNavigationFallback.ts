import type { AdminNavigationCategory } from '@/services/adminNavigation';

function createTimestamp(): string {
  return new Date().toISOString();
}

export function getFallbackAdminNavigation(): AdminNavigationCategory[] {
  const timestamp = createTimestamp();

  return [
    {
      category_id: 'cat_campaign_ops',
      category: 'Campaign Automation',
      subcategory: 'Prompted launches',
      icon: '🚀',
      sort_order: 1,
      schema_version: '1.0.0',
      knowledge_graph_attributes: {
        persona: 'Campaign Strategist',
        quickLinks: ['Launch enrichment', 'Review schema alignment'],
        healthSignals: ['Prompt quality', 'Crawler readiness'],
      },
      updated_at: timestamp,
      templates: [
        {
          template_id: 'tpl_campaign_prompt_launch',
          name: 'Prompt-driven campaign kickoff',
          description: 'Guide DeepSeek to design a multi-channel campaign from a seed prompt.',
          category: 'Campaign Automation',
          subcategory: 'Prompted launches',
          icon: '🧭',
          sort_order: 1,
          schema_version: '1.0.0',
          knowledge_graph_attributes: {
            defaultPrompt:
              'You are the campaign orchestrator. Convert the strategist prompt into a sequenced launch plan with SEO, paid, and on-site actions.',
            attributePresets: ['Keyword clusters', 'Content blocks', 'Schema.org types'],
            categoryPresets: ['Content intelligence', 'Authority signals'],
            datasetNameSuggestion: 'campaign_launch_{date}',
            autoTrain: true,
          },
          status_steps: [
            { index: 0, id: 'prompt-intake', title: 'Review strategist prompt', status: 'Pending' },
            { index: 1, id: 'channel-plan', title: 'Draft channel playbooks', status: 'Idle' },
            { index: 2, id: 'qa-sync', title: 'Sync with QA queue', status: 'Idle' },
          ],
          workflow_summary: {
            prompt:
              'Create a launch-ready campaign from the provided strategist briefing prompt. Prioritize SEO and onsite actions first, then layer paid media testing.',
            owner: 'Campaign Ops',
          },
          source_path: 'fallback://campaign/kickoff.json',
          updated_at: timestamp,
        },
        {
          template_id: 'tpl_campaign_library_sync',
          name: 'Campaign knowledge sync',
          description: 'Align campaign prompts with existing strategy library and DeepSeek notes.',
          category: 'Campaign Automation',
          subcategory: 'Prompted launches',
          icon: '🗃️',
          sort_order: 2,
          schema_version: '1.0.0',
          knowledge_graph_attributes: {
            defaultPrompt:
              'Summarize existing campaign learnings relevant to the strategist prompt and surface category gaps.',
            attributePresets: ['Authority signals', 'Content blocks'],
            categoryPresets: ['Metadata', 'Performance'],
            datasetNameSuggestion: 'campaign_sync_{date}',
            autoTrain: false,
          },
          status_steps: [
            { index: 0, id: 'match-library', title: 'Match strategist prompt to library', status: 'Running' },
            { index: 1, id: 'surface-gaps', title: 'Surface library gaps', status: 'Pending' },
          ],
          workflow_summary: {
            prompt:
              'Cross-reference strategist prompts with historical campaign learnings and provide a prioritized summary of reusable assets.',
            owner: 'Knowledge Ops',
          },
          source_path: 'fallback://campaign/library-sync.json',
          updated_at: timestamp,
        },
      ],
      subcategories: {
        'Prompted launches': [],
      },
    },
    {
      category_id: 'cat_seo_automation',
      category: 'SEO Automation',
      subcategory: 'Crawler orchestration',
      icon: '🛠️',
      sort_order: 2,
      schema_version: '1.2.0',
      knowledge_graph_attributes: {
        persona: 'Automation Lead',
        primaryKpis: ['Crawler uptime', 'Tokens earned'],
        quickActions: ['View logs', 'Launch enrichment'],
      },
      updated_at: timestamp,
      templates: [
        {
          template_id: 'tpl_enrichment',
          name: 'Content enrichment pipeline',
          description: 'Generate schema.org annotations and orchestrate DeepSeek QA.',
          category: 'SEO Automation',
          subcategory: 'Crawler orchestration',
          icon: '✨',
          sort_order: 1,
          schema_version: '1.2.0',
          knowledge_graph_attributes: {
            defaultPrompt:
              'Enrich SaaS landing pages with structured data, internal link hints, and new CTA variants.',
            attributePresets: ['Schema.org types', 'Core Web Vitals', 'Content blocks'],
            categoryPresets: ['Metadata', 'Content intelligence'],
            datasetNameSuggestion: 'seo_enrichment_{date}',
            autoTrain: true,
          },
          status_steps: [
            { index: 0, id: 'discover', title: 'Discover URLs', status: 'Running' },
            { index: 1, id: 'cluster', title: 'Cluster intents', status: 'Pending' },
            { index: 2, id: 'enrich', title: 'Enrich metadata', status: 'Idle' },
          ],
          workflow_summary: {
            prompt:
              'Enrich SaaS landing pages with structured data and internal link hints based on the strategist prompt.',
            lastRun: timestamp,
          },
          source_path: 'fallback://seo/content-enrichment.json',
          updated_at: timestamp,
        },
      ],
      subcategories: {
        'Crawler orchestration': [],
      },
    },
    {
      category_id: 'cat_insights',
      category: 'Insights & QA',
      subcategory: 'Campaign audits',
      icon: '🧪',
      sort_order: 3,
      schema_version: '1.0.0',
      knowledge_graph_attributes: {
        dashboards: ['Campaign QA', 'Schema Drift'],
        alerts: ['Prompt gaps', 'Missing structured data'],
      },
      updated_at: timestamp,
      templates: [
        {
          template_id: 'tpl_prompt_quality_review',
          name: 'Prompt quality review',
          description: 'Score strategist prompts before they enter DeepSeek orchestration.',
          category: 'Insights & QA',
          subcategory: 'Campaign audits',
          icon: '📝',
          sort_order: 1,
          schema_version: '1.0.0',
          knowledge_graph_attributes: {
            defaultPrompt:
              'Evaluate the strategist prompt for clarity, required data sources, and blocker risks before launch.',
            attributePresets: ['Meta tags', 'Keyword clusters'],
            categoryPresets: ['Metadata', 'Performance'],
            datasetNameSuggestion: 'prompt_quality_{date}',
            autoTrain: false,
          },
          status_steps: [
            { index: 0, id: 'lint', title: 'Prompt linting', status: 'Running' },
            { index: 1, id: 'send-feedback', title: 'Send strategist feedback', status: 'Pending' },
          ],
          workflow_summary: {
            prompt:
              'Review the strategist prompt for missing context, misaligned KPIs, and blockers before the campaign launches.',
            owner: 'QA Ops',
          },
          source_path: 'fallback://insights/prompt-review.json',
          updated_at: timestamp,
        },
      ],
      subcategories: {
        'Campaign audits': [],
      },
    },
  ];
}

export default getFallbackAdminNavigation;

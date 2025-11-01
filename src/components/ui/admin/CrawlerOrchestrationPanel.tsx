import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Tag,
  List,
  Typography,
  Divider,
  Statistic,
  message,
  Timeline,
  Progress,
  Tooltip
} from 'antd';
import {
  RobotOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ShareAltOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  CopyOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SchemaAttribute {
  key: string;
  label: string;
  description: string;
  category: string;
  weight?: number;
}

interface SchemaDefinition {
  label: string;
  description: string;
  attributes: SchemaAttribute[];
  defaultDatasetName: string;
  promptExamples: string[];
}

interface CrawlerStats {
  total_urls_crawled: number;
  total_space_saved: number;
  total_tokens_earned: number;
  avg_space_per_url: number;
  active_workers: number;
  statusBreakdown: Array<{ status: string; count: number }>;
}

interface ActiveCrawler {
  crawler_id: string;
  specialization: string;
  status: string;
  current_url: string;
  pages_per_second: number;
  efficiency_percent: number;
  total_pages_processed: number;
  total_space_harvested: number;
}

interface OptimizationSummary {
  id: number;
  url: string;
  space_saved_bytes: number;
  tokens_earned: number;
  crawl_timestamp: string;
}

interface WorkflowEvent {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  details: string;
  timestamp: string;
}

interface GeneratedSeed {
  url: string;
  intent: string;
  cadence: 'hourly' | 'daily' | 'weekly';
  schemaAttributes: string[];
  weight: number;
}

interface GeneratedWorkflowConfig {
  schema: {
    key: string;
    label: string;
    attributes: SchemaAttribute[];
  };
  dataset: {
    name: string;
    description: string;
    target: string;
  };
  prompt: string;
  categories: string[];
  seeds: GeneratedSeed[];
  hyperparameters: {
    crawlerInstances: number;
    autoTrain: boolean;
  };
  createdAt: string;
}

interface PersistedWorkflowSummary {
  id: string;
  schemaKey: string;
  prompt: string;
  datasetName: string;
  attributes: string[];
  categories: string[];
  seeds: number;
  createdAt: string;
}

const STORAGE_KEY = 'ldom::crawlerWorkflows';

const schemaLibrary: Record<string, SchemaDefinition> = {
  'seo-content': {
    label: 'SEO Content Schema',
    description: 'Structured data for SEO analysis including meta information, keywords, and link signals.',
    defaultDatasetName: 'SEO_Content_Classifier',
    promptExamples: [
      'Cluster SaaS landing pages by conversion intent and content depth.',
      'Extract meta data and key vitals for technical SEO optimization.'
    ],
    attributes: [
      { key: 'metaTags', label: 'Meta Tags', description: 'Title, description, and OpenGraph tags for the page.', category: 'Metadata', weight: 1 },
      { key: 'keywords', label: 'Keyword Density', description: 'Extract and score important keywords and queries.', category: 'Content Intelligence', weight: 0.9 },
      { key: 'backlinks', label: 'Backlink Graph', description: 'Document inbound/outbound link relationships.', category: 'Authority Signals', weight: 0.8 },
      { key: 'coreVitals', label: 'Core Web Vitals', description: 'Largest Contentful Paint, CLS, FID metrics.', category: 'Performance', weight: 0.85 },
      { key: 'contentBlocks', label: 'Content Blocks', description: 'Break page into logical sections with headings hierarchy.', category: 'Content Intelligence', weight: 0.75 },
      { key: 'schemaOrg', label: 'Schema.org Types', description: 'Identify structured data types already on the page.', category: 'Metadata', weight: 0.6 },
    ],
  },
  'competitor-landscape': {
    label: 'Competitor Landscape Schema',
    description: 'Benchmark competitor domains and capture positioning signals for comparisons.',
    defaultDatasetName: 'SEO_Competitor_Benchmark',
    promptExamples: [
      'Compare top fintech competitors for organic market share.',
      'Surface backlink gaps and overlapping referring domains to prioritize outreach.'
    ],
    attributes: [
      { key: 'trafficEstimates', label: 'Traffic Estimates', description: 'Estimated visits and ranking positions.', category: 'Performance', weight: 1 },
      { key: 'contentGaps', label: 'Content Gaps', description: 'Missed topics relative to seed domain.', category: 'Content Intelligence', weight: 0.85 },
      { key: 'backlinkOverlap', label: 'Backlink Overlap', description: 'Shared and unique referring domains.', category: 'Authority Signals', weight: 0.9 },
      { key: 'landingPages', label: 'Key Landing Pages', description: 'High-performing URLs by topic.', category: 'Metadata', weight: 0.7 },
    ],
  },
  'content-brief': {
    label: 'Content Brief Schema',
    description: 'Generate data to guide new content production with outline and questions.',
    defaultDatasetName: 'SEO_Content_Brief_Generator',
    promptExamples: [
      'Produce a long-form pillar page brief for "AI marketing automation".',
      'Derive FAQ and outline guidance for programmatic SEO landing pages.'
    ],
    attributes: [
      { key: 'outline', label: 'Outline Suggestions', description: 'Recommended headings and structure.', category: 'Content Intelligence', weight: 1 },
      { key: 'faqs', label: 'Questions & FAQs', description: 'People-also-ask style questions.', category: 'Audience Insights', weight: 0.85 },
      { key: 'resources', label: 'Reference Resources', description: 'Supporting research links and citations.', category: 'Authority Signals', weight: 0.75 },
      { key: 'competitiveScore', label: 'Competitive Difficulty', description: 'Difficulty to rank versus competition.', category: 'Performance', weight: 0.7 },
    ],
  },
};

const schemaPresets: Record<string, { seeds: GeneratedSeed[]; categories: string[]; crawlerInstances: number }> = {
  'seo-content': {
    categories: ['Metadata', 'Content Intelligence', 'Authority Signals', 'Performance'],
    crawlerInstances: 3,
    seeds: [
      {
        url: 'https://marketingexamples.com/seo',
        intent: 'best-practices-breakdown',
        cadence: 'daily',
        schemaAttributes: ['metaTags', 'keywords', 'coreVitals', 'contentBlocks'],
        weight: 1,
      },
      {
        url: 'https://ahrefs.com/blog/',
        intent: 'topic-authority',
        cadence: 'daily',
        schemaAttributes: ['metaTags', 'keywords', 'backlinks', 'schemaOrg'],
        weight: 0.95,
      },
      {
        url: 'https://backlinko.com/blog',
        intent: 'conversion-copy',
        cadence: 'weekly',
        schemaAttributes: ['metaTags', 'keywords', 'contentBlocks'],
        weight: 0.9,
      },
    ],
  },
  'competitor-landscape': {
    categories: ['Performance', 'Authority Signals', 'Content Intelligence'],
    crawlerInstances: 4,
    seeds: [
      {
        url: 'https://www.similarweb.com/top-websites/business-and-consumer-services/marketing-and-advertising/',
        intent: 'benchmarking',
        cadence: 'weekly',
        schemaAttributes: ['trafficEstimates', 'landingPages'],
        weight: 1,
      },
      {
        url: 'https://semrush.com/marketplace/blog',
        intent: 'content-gap',
        cadence: 'daily',
        schemaAttributes: ['contentGaps', 'backlinkOverlap'],
        weight: 0.95,
      },
    ],
  },
  'content-brief': {
    categories: ['Content Intelligence', 'Audience Insights', 'Authority Signals', 'Performance'],
    crawlerInstances: 2,
    seeds: [
      {
        url: 'https://www.gartner.com/en/insights/marketing',
        intent: 'enterprise-research',
        cadence: 'weekly',
        schemaAttributes: ['outline', 'resources', 'competitiveScore'],
        weight: 0.9,
      },
      {
        url: 'https://moz.com/learn/seo',
        intent: 'educational-overview',
        cadence: 'weekly',
        schemaAttributes: ['outline', 'faqs', 'resources'],
        weight: 0.95,
      },
    ],
  },
};

const defaultWorkflowStates: WorkflowEvent[] = [
  {
    id: 'prompt-intake',
    title: 'Prompt Intake',
    status: 'pending',
    details: 'Awaiting prompt configuration.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'schema-alignment',
    title: 'Schema Alignment',
    status: 'pending',
    details: 'Map requested attributes to crawler schema.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'crawler-seeding',
    title: 'Crawler Seeding',
    status: 'pending',
    details: 'Push seed URLs and categories to workers.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'dataset-training',
    title: 'Dataset Training',
    status: 'pending',
    details: 'Prepare training shards and dispatch to neural instances.',
    timestamp: new Date().toISOString(),
  },
];

const statusColor = (status: WorkflowEvent['status']) => {
  switch (status) {
    case 'complete':
      return 'green';
    case 'running':
      return 'blue';
    case 'error':
      return 'red';
    default:
      return 'default';
  }
};

export const CrawlerOrchestrationPanel: React.FC = () => {
  const [stats, setStats] = useState<CrawlerStats | null>(null);
  const [activeCrawlers, setActiveCrawlers] = useState<ActiveCrawler[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationSummary[]>([]);
  const [workflowEvents, setWorkflowEvents] = useState<WorkflowEvent[]>(defaultWorkflowStates);
  const [selectedSchema, setSelectedSchema] = useState<string>('seo-content');
  const [generatedConfig, setGeneratedConfig] = useState<string>('');
  const [persistedWorkflows, setPersistedWorkflows] = useState<PersistedWorkflowSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const availableAttributes = useMemo(() => {
    return schemaLibrary[selectedSchema]?.attributes ?? [];
  }, [selectedSchema]);

  const defaultCategories = useMemo(() => {
    const fromSchema = schemaLibrary[selectedSchema]?.attributes ?? [];
    const categories = new Set<string>();
    fromSchema.forEach((attr) => categories.add(attr.category));
    const presetCategories = schemaPresets[selectedSchema]?.categories ?? [];
    presetCategories.forEach((cat) => categories.add(cat));
    return Array.from(categories);
  }, [selectedSchema]);

  const restorePersistedWorkflows = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedWorkflowSummary[];
        setPersistedWorkflows(parsed);
      }
    } catch (error) {
      console.warn('Failed to restore workflow history', error);
    }
  }, []);

  useEffect(() => {
    restorePersistedWorkflows();
  }, [restorePersistedWorkflows]);

  const buildGeneratedConfig = useCallback(
    (schemaKey: string): GeneratedWorkflowConfig => {
      const schemaDefinition = schemaLibrary[schemaKey];
      const preset = schemaPresets[schemaKey];
      const now = new Date();
      const attributes = schemaDefinition?.attributes ?? [];
      const datasetName = `${schemaDefinition?.defaultDatasetName ?? 'SEO_Dataset'}_${now
        .toISOString()
        .slice(0, 10)}`;

      return {
        schema: {
          key: schemaKey,
          label: schemaDefinition?.label ?? schemaKey,
          attributes,
        },
        dataset: {
          name: datasetName,
          description: schemaDefinition?.description ?? 'Dataset generated from crawler workflow.',
          target: schemaDefinition?.promptExamples?.[0] ?? 'SEO automation pipeline',
        },
        prompt:
          schemaDefinition?.promptExamples?.[0] ??
          'Launch a crawler workflow focused on organic performance improvements.',
        categories: schemaPresets[schemaKey]?.categories ?? defaultCategories,
        seeds: preset?.seeds ?? [],
        hyperparameters: {
          crawlerInstances: preset?.crawlerInstances ?? 1,
          autoTrain: true,
        },
        createdAt: now.toISOString(),
      };
    },
    [defaultCategories],
  );

  const regenerateConfig = useCallback(
    (schemaKey: string) => {
      const config = buildGeneratedConfig(schemaKey);
      const json = JSON.stringify(config, null, 2);
      setGeneratedConfig(json);
      form.setFieldsValue({
        seedConfig: json,
        attributes: config.schema.attributes.map((attr) => attr.key),
        categories: config.categories,
        datasetName: config.dataset.name,
        prompt: config.prompt,
        instances: config.hyperparameters.crawlerInstances,
        autoTrain: config.hyperparameters.autoTrain,
      });
    },
    [buildGeneratedConfig, form],
  );

  useEffect(() => {
    regenerateConfig(selectedSchema);
  }, [selectedSchema, regenerateConfig]);

  const fetchCrawlerData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, activeRes, optRes] = await Promise.all([
        fetch('/api/crawler/stats'),
        fetch('/api/crawler/active'),
        fetch('/api/crawler/optimizations?limit=5'),
      ]);

      if (statsRes.ok) {
        const data = (await statsRes.json()) as CrawlerStats;
        setStats(data);
      }
      if (activeRes.ok) {
        const data = (await activeRes.json()) as ActiveCrawler[];
        setActiveCrawlers(data);
      }
      if (optRes.ok) {
        const data = (await optRes.json()) as OptimizationSummary[];
        setOptimizations(data);
      }
    } catch (error) {
      console.error('Failed to load crawler data', error);
      message.error('Unable to fetch crawler status from API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrawlerData();
    const interval = setInterval(fetchCrawlerData, 10000);
    return () => clearInterval(interval);
  }, [fetchCrawlerData]);

  const updateWorkflowState = (id: string, status: WorkflowEvent['status'], details?: string) => {
    setWorkflowEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              status,
              details: details ?? event.details,
              timestamp: new Date().toISOString(),
            }
          : event,
      ),
    );
  };

  const appendWorkflowEvent = (event: WorkflowEvent) => {
    setWorkflowEvents((prev) => [{ ...event }, ...prev]);
  };

  const persistWorkflowRun = (summary: PersistedWorkflowSummary) => {
    if (typeof window === 'undefined') return;
    try {
      const current = window.localStorage.getItem(STORAGE_KEY);
      const parsed = current ? (JSON.parse(current) as PersistedWorkflowSummary[]) : [];
      const updated = [summary, ...parsed].slice(0, 25);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPersistedWorkflows(updated);
    } catch (error) {
      console.error('Failed to persist workflow summary', error);
    }
  };

  const handleWorkflowLaunch = async (values: any) => {
    const {
      prompt,
      datasetName,
      attributes = [],
      categories = [],
      autoTrain,
      instances = 1,
      seedConfig,
    } = values;

    if (!prompt) {
      message.error('Provide a prompt describing the training and crawling goals.');
      return;
    }

    let parsedConfig: GeneratedWorkflowConfig | null = null;
    try {
      parsedConfig = JSON.parse(seedConfig || generatedConfig || '{}') as GeneratedWorkflowConfig;
    } catch (error) {
      message.error('Generated seed configuration is not valid JSON.');
      return;
    }

    const seeds = parsedConfig?.seeds ?? [];

    if (!seeds.length) {
      message.error('No seed URLs available for the selected schema.');
      return;
    }

    const resolvedAttributes =
      (parsedConfig?.schema?.attributes?.map((attr) => attr.key) ?? attributes ?? []).filter(Boolean);
    const resolvedCategories = parsedConfig?.categories?.length ? parsedConfig.categories : categories;
    const resolvedDatasetName = datasetName || parsedConfig?.dataset?.name || 'Generated Dataset';
    const resolvedInstances = parsedConfig?.hyperparameters?.crawlerInstances ?? instances;
    const resolvedAutoTrain = parsedConfig?.hyperparameters?.autoTrain ?? autoTrain;
    const workflowId = `workflow-${Date.now()}`;
    const configToPersist: GeneratedWorkflowConfig = {
      ...parsedConfig,
      schema: {
        ...parsedConfig.schema,
        key: selectedSchema,
      },
    };

    setSubmitting(true);
    updateWorkflowState('prompt-intake', 'running', 'Processing prompt for workflow orchestration.');
    updateWorkflowState('schema-alignment', 'running', `Mapping ${resolvedAttributes.length} attributes to schema.`);

    try {
        for (const seed of seeds) {
        const payload = {
          url: seed.url,
          priority: Math.max(1, Math.round(seed.weight * 10)),
          intent: seed.intent,
          cadence: seed.cadence,
          schemaAttributes: seed.schemaAttributes,
        };
        const response = await fetch('/api/crawler/crawl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(payload.message || `Failed to queue ${seed.url}`);
        }
      }

      updateWorkflowState(
        'crawler-seeding',
        'running',
        `Seeded ${seeds.length} starting URLs across ${resolvedInstances} crawler instance(s).`,
      );

      if (resolvedAutoTrain) {
        updateWorkflowState(
          'dataset-training',
          'running',
          `Preparing training dataset “${resolvedDatasetName}” with ${resolvedAttributes.length} feature groups and categories ${resolvedCategories.join(', ') || 'default'}.`,
        );
      }

      appendWorkflowEvent({
        id: workflowId,
        title: `Workflow launched for ${resolvedDatasetName}`,
        status: 'running',
        details: prompt,
        timestamp: new Date().toISOString(),
      });

      message.success('Crawler workflow launched. Workers will begin processing soon.');
      form.resetFields(['prompt', 'datasetName']);
      regenerateConfig(selectedSchema);
      fetchCrawlerData();

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(`ldom::workflow::${workflowId}`, JSON.stringify(configToPersist));
        } catch (storageError) {
          console.warn('Failed to persist workflow configuration', storageError);
        }
      }

      setTimeout(() => {
        updateWorkflowState('crawler-seeding', 'complete', 'Crawler queue populated successfully.');
        updateWorkflowState(
          'dataset-training',
          resolvedAutoTrain ? 'running' : 'complete',
          resolvedAutoTrain
            ? 'Awaiting crawler output before training can start.'
            : 'Manual training flow selected; waiting for operator.',
        );
        updateWorkflowState('schema-alignment', 'complete');
        updateWorkflowState('prompt-intake', 'complete');
      }, 1200);

      persistWorkflowRun({
        id: workflowId,
        schemaKey: selectedSchema,
        prompt,
        datasetName: resolvedDatasetName,
        attributes: resolvedAttributes,
        categories: resolvedCategories,
        seeds: seeds.length,
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Failed to launch crawler workflow', error);
      message.error(error?.message || 'Failed to launch crawler workflow');
      updateWorkflowState('prompt-intake', 'error', 'Prompt processing failed.');
      updateWorkflowState('schema-alignment', 'error', 'Schema alignment blocked.');
      updateWorkflowState('crawler-seeding', 'error', 'Unable to seed crawler queue.');
    } finally {
      setSubmitting(false);
    }
  };

  const schemaOptions = Object.entries(schemaLibrary).map(([key, meta]) => ({
    label: meta.label,
    value: key,
  }));

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div>
        <Title level={3} style={{ marginBottom: 4 }}>
          Crawler Workflow Orchestration
        </Title>
        <Text type="secondary">
          Configure prompt-driven SEO data mining pipelines. Define schema attributes, seed URLs, and training
          preferences to spin up crawler instances and feed neural training workflows.
        </Text>
      </div>

      <Card loading={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="URLs Crawled (24h)"
              value={stats?.total_urls_crawled ?? 0}
              prefix={<RobotOutlined style={{ color: '#1677ff' }} />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Total Space Saved"
              value={`${((stats?.total_space_saved ?? 0) / 1024 / 1024).toFixed(1)} MB`}
              prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Tokens Earned"
              value={(stats?.total_tokens_earned ?? 0).toFixed(2)}
              suffix="LDOM"
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Active Crawlers"
              value={activeCrawlers.filter((crawler) => crawler.status !== 'idle').length}
              suffix={` / ${activeCrawlers.length}`}
              prefix={<DeploymentUnitOutlined style={{ color: '#722ed1' }} />}
            />
          </Col>
        </Row>
      </Card>

      <Card title="Prompt & Schema Configuration" extra={<Tag color="blue">SEO Focus</Tag>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleWorkflowLaunch}
          initialValues={{ schema: selectedSchema, autoTrain: true }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Form.Item
                name="prompt"
                label="Workflow prompt"
                rules={[{ required: true, message: 'Describe what the crawler and training workflow should do.' }]}
              >
                <Input.TextArea
                  rows={5}
                  placeholder="Example: Crawl top SaaS competitor landing pages for keyword clustering and build training data for conversion intent classifier."
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="schema" label="Schema template" initialValue={selectedSchema}>
                <Select
                  options={schemaOptions}
                  value={selectedSchema}
                  onChange={(value) => {
                    setSelectedSchema(value);
                    regenerateConfig(value);
                  }}
                />
              </Form.Item>
              <div>
                <Text strong>Schema description</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary" style={{ display: 'block' }}>
                  {schemaLibrary[selectedSchema]?.description}
                </Text>
                <Divider style={{ margin: '12px 0' }} />
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedConfig).then(() =>
                      message.success('Workflow seed configuration copied to clipboard.'),
                    );
                  }}
                >
                  Copy config JSON
                </Button>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="attributes"
                label="Attributes to capture"
                rules={[{ required: true, message: 'Select at least one attribute to map into the dataset.' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select schema attributes"
                  options={availableAttributes.map((attr) => ({
                    label: attr.label,
                    value: attr.key,
                  }))}
                  value={availableAttributes.map((attr) => attr.key)}
                  onChange={(values) => {
                    form.setFieldsValue({ attributes: values });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="categories"
                label="Topic categories"
                defaultValue={defaultCategories}
              >
                <Select
                  mode="tags"
                  placeholder="Add categories like performance, backlinks, content depth"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="seedConfig"
                label="Generated seed configuration"
                rules={[{ required: true, message: 'Seed configuration JSON is required.' }]}
              >
                <Input.TextArea
                  rows={10}
                  value={generatedConfig}
                  onChange={(event) => {
                    setGeneratedConfig(event.target.value);
                    form.setFieldsValue({ seedConfig: event.target.value });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item name="instances" label="Crawler instances" initialValue={schemaPresets[selectedSchema]?.crawlerInstances ?? 1}>
                    <Select
                      options={[1, 2, 3, 4, 6, 8].map((count) => ({ label: `${count}x`, value: count }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="autoTrain"
                    label="Auto-train"
                    valuePropName="checked"
                    initialValue
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="datasetName" label="Dataset name">
                    <Input placeholder="SEO Intent Classifier v1" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              <Text strong>Schema attribute definitions</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {availableAttributes.map((attr) => (
                  <Tooltip key={attr.key} title={`${attr.description} • Category: ${attr.category}`}>
                    <Tag color="geekblue">{attr.label}</Tag>
                  </Tooltip>
                ))}
              </div>
            </div>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<ShareAltOutlined />}>
              Launch workflow
            </Button>
          </Space>
        </Form>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Workflow status" extra={<SyncOutlined onClick={fetchCrawlerData} style={{ cursor: 'pointer' }} />}>
            <Timeline>
              {workflowEvents.map((event) => (
                <Timeline.Item key={event.id} color={statusColor(event.status)}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space>
                      {event.status === 'complete' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      {event.status === 'error' && <WarningOutlined style={{ color: '#ff4d4f' }} />}
                      <Text strong>{event.title}</Text>
                      <Tag color={statusColor(event.status)} style={{ textTransform: 'capitalize' }}>
                        {event.status}
                      </Tag>
                    </Space>
                    <Text type="secondary">{event.details}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(event.timestamp).toLocaleString()}
                    </Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          <Card
            title="Workflow history"
            extra={
              <Button type="link" icon={<SearchOutlined />} onClick={restorePersistedWorkflows}>
                Refresh
              </Button>
            }
            style={{ marginTop: 16 }}
          >
            <List
              dataSource={persistedWorkflows}
              locale={{ emptyText: 'No workflows persisted yet.' }}
              renderItem={(workflow) => (
                <List.Item key={workflow.id}>
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Space align="center">
                      <RobotOutlined />
                      <Text strong>{workflow.datasetName}</Text>
                      <Tag>{schemaLibrary[workflow.schemaKey]?.label ?? workflow.schemaKey}</Tag>
                      <Tag color="purple">{workflow.seeds} seeds</Tag>
                    </Space>
                    <Text type="secondary">Prompt: {workflow.prompt}</Text>
                    <Space wrap>
                      {workflow.attributes.map((attr) => (
                        <Tag key={attr} color="geekblue">
                          {attr}
                        </Tag>
                      ))}
                    </Space>
                    <Space wrap>
                      {workflow.categories.map((category) => (
                        <Tag key={category} color="magenta">
                          {category}
                        </Tag>
                      ))}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(workflow.createdAt).toLocaleString()}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Active crawler instances" extra={<Tag color="purple">Live</Tag>}>
            <List
              dataSource={activeCrawlers}
              locale={{ emptyText: 'No active crawlers detected.' }}
              renderItem={(crawler) => (
                <List.Item key={crawler.crawler_id}>
                  <Space direction="vertical" style={{ width: '100%' }} size={4}>
                    <Space align="center">
                      <RobotOutlined />
                      <Text strong>{crawler.crawler_id}</Text>
                      <Tag color={crawler.status === 'active' ? 'blue' : crawler.status === 'processing' ? 'purple' : 'default'}>
                        {crawler.status.toUpperCase()}
                      </Tag>
                    </Space>
                    <Space split={<Divider type="vertical" />}> 
                      <Text type="secondary">{crawler.current_url || 'Idle'}</Text>
                      <Text type="secondary">{`${crawler.pages_per_second.toFixed(2)} pages/s`}</Text>
                      <Text type="secondary">{`${crawler.efficiency_percent}% efficiency`}</Text>
                    </Space>
                    <Progress percent={Math.min(100, crawler.efficiency_percent)} size="small" status="active" />
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          <Card title="Recent optimization highlights" style={{ marginTop: 16 }}>
            <List
              dataSource={optimizations}
              locale={{ emptyText: 'No optimizations recorded yet.' }}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Space align="center">
                      <ExperimentOutlined />
                      <Text strong>{item.url}</Text>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <Tag color="green">{`${(item.space_saved_bytes / 1024).toFixed(1)} KB saved`}</Tag>
                      <Tag color="gold">{`${item.tokens_earned.toFixed(2)} LDOM`}</Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.crawl_timestamp).toLocaleString()}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default CrawlerOrchestrationPanel;

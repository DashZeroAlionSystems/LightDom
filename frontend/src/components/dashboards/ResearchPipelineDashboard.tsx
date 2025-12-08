import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Tabs, Statistic, Row, Col, Modal, Input, Select, message, Space, Typography } from 'antd';
import { 
  FileSearchOutlined, 
  SyncOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  CodeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import apiService from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ResearchPipelineDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [codeExamples, setCodeExamples] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [articleDetailVisible, setArticleDetailVisible] = useState(false);
  const [scrapeModalVisible, setScrapeModalVisible] = useState(false);
  const [scrapeTopics, setScrapeTopics] = useState<string[]>(['ai', 'ml', 'llm']);
  const [scrapeLimit, setScrapeLimit] = useState(50);

  useEffect(() => {
    loadStatus();
    loadArticles();
    loadPapers();
    loadFeatures();
    loadCampaigns();
    loadCodeExamples();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await apiService.researchPipelineAPI.getStatus();
      setStatus(data);
    } catch (error: any) {
      message.error('Failed to load status: ' + error.message);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await apiService.researchPipelineAPI.getArticles({ limit: 100 });
      setArticles(data.articles || []);
    } catch (error: any) {
      message.error('Failed to load articles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPapers = async () => {
    try {
      const data = await apiService.researchPipelineAPI.getPapers({ limit: 100 });
      setPapers(data.papers || []);
    } catch (error: any) {
      message.error('Failed to load papers: ' + error.message);
    }
  };

  const loadFeatures = async () => {
    try {
      const data = await apiService.researchPipelineAPI.getFeatures();
      setFeatures(data.features || []);
    } catch (error: any) {
      message.error('Failed to load features: ' + error.message);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await apiService.researchPipelineAPI.getCampaigns();
      setCampaigns(data.campaigns || []);
    } catch (error: any) {
      message.error('Failed to load campaigns: ' + error.message);
    }
  };

  const loadCodeExamples = async () => {
    try {
      const data = await apiService.researchPipelineAPI.getCodeExamples();
      setCodeExamples(data.examples || []);
    } catch (error: any) {
      message.error('Failed to load code examples: ' + error.message);
    }
  };

  const handleScrape = async () => {
    setLoading(true);
    try {
      const result = await apiService.researchPipelineAPI.scrapeArticles({
        topics: scrapeTopics,
        limit: scrapeLimit
      });
      message.success(`Scraped ${result.articlesFound} articles`);
      setScrapeModalVisible(false);
      loadArticles();
      loadStatus();
    } catch (error: any) {
      message.error('Failed to scrape articles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async (campaignId: string) => {
    setLoading(true);
    try {
      await apiService.researchPipelineAPI.startCampaign(campaignId);
      message.success('Campaign started');
      loadCampaigns();
      loadStatus();
    } catch (error: any) {
      message.error('Failed to start campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopCampaign = async (campaignId: string) => {
    setLoading(true);
    try {
      await apiService.researchPipelineAPI.stopCampaign(campaignId);
      message.success('Campaign stopped');
      loadCampaigns();
      loadStatus();
    } catch (error: any) {
      message.error('Failed to stop campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showArticleDetail = async (articleId: string) => {
    try {
      const data = await apiService.researchPipelineAPI.getArticle(articleId);
      setSelectedArticle(data);
      setArticleDetailVisible(true);
    } catch (error: any) {
      message.error('Failed to load article details: ' + error.message);
    }
  };

  const articleColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Button type="link" onClick={() => showArticleDetail(record.id)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags?.slice(0, 3).map((tag: string) => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'processed' ? 'green' : status === 'analyzing' ? 'orange' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Scraped',
      dataIndex: 'scraped_at',
      key: 'scraped_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          size="small"
          href={record.url}
          target="_blank"
        >
          View Source
        </Button>
      ),
    },
  ];

  const paperColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Authors',
      dataIndex: 'authors',
      key: 'authors',
      render: (authors: string[]) => authors?.join(', '),
    },
    {
      title: 'Published',
      dataIndex: 'published_date',
      key: 'published_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Citations',
      dataIndex: 'citation_count',
      key: 'citation_count',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          size="small"
          href={record.arxiv_url}
          target="_blank"
        >
          View Paper
        </Button>
      ),
    },
  ];

  const featureColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="purple">{category}</Tag>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'implemented' ? 'green' : status === 'in_progress' ? 'blue' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Score',
      dataIndex: 'feasibility_score',
      key: 'feasibility_score',
      render: (score: number) => `${(score * 100).toFixed(0)}%`,
    },
  ];

  const campaignColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Topics',
      dataIndex: 'topics',
      key: 'topics',
      render: (topics: string[]) => (
        <>
          {topics?.map((topic: string) => (
            <Tag key={topic}>{topic}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Articles',
      dataIndex: 'articles_count',
      key: 'articles_count',
    },
    {
      title: 'Last Run',
      dataIndex: 'last_run_at',
      key: 'last_run_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.is_active ? (
            <Button 
              size="small" 
              onClick={() => handleStopCampaign(record.id)}
              loading={loading}
            >
              Stop
            </Button>
          ) : (
            <Button 
              type="primary"
              size="small" 
              onClick={() => handleStartCampaign(record.id)}
              loading={loading}
            >
              Start
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const codeExampleColumns = [
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      render: (lang: string) => <Tag color="blue">{lang}</Tag>,
    },
    {
      title: 'Lines',
      dataIndex: 'line_count',
      key: 'line_count',
    },
    {
      title: 'Quality',
      dataIndex: 'quality_score',
      key: 'quality_score',
      render: (score: number) => `${(score * 100).toFixed(0)}%`,
    },
    {
      title: 'Article',
      dataIndex: 'article_title',
      key: 'article_title',
    },
    {
      title: 'Extracted',
      dataIndex: 'extracted_at',
      key: 'extracted_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ExperimentOutlined /> Research Pipeline
        </Title>
        <Paragraph>
          AI-powered research article scraping, paper analysis, feature extraction, and code example discovery
        </Paragraph>
      </div>

      {/* Status Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Articles"
              value={status?.stats?.total_articles || 0}
              prefix={<FileSearchOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Articles Today"
              value={status?.stats?.articles_today || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Research Papers"
              value={status?.stats?.total_papers || 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Features"
              value={status?.stats?.total_features || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Code Examples"
              value={status?.stats?.total_code_examples || 0}
              prefix={<CodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Active Campaigns"
              value={status?.stats?.active_campaigns || 0}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="articles">
          <TabPane tab="Articles" key="articles">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={() => setScrapeModalVisible(true)}
                  loading={loading}
                >
                  Scrape Articles
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadArticles}
                >
                  Refresh
                </Button>
              </Space>
            </div>
            <Table
              columns={articleColumns}
              dataSource={articles}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="Research Papers" key="papers">
            <div style={{ marginBottom: 16 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadPapers}
              >
                Refresh
              </Button>
            </div>
            <Table
              columns={paperColumns}
              dataSource={papers}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="Feature Recommendations" key="features">
            <div style={{ marginBottom: 16 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadFeatures}
              >
                Refresh
              </Button>
            </div>
            <Table
              columns={featureColumns}
              dataSource={features}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="Campaigns" key="campaigns">
            <div style={{ marginBottom: 16 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadCampaigns}
              >
                Refresh
              </Button>
            </div>
            <Table
              columns={campaignColumns}
              dataSource={campaigns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="Code Examples" key="code">
            <div style={{ marginBottom: 16 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadCodeExamples}
              >
                Refresh
              </Button>
            </div>
            <Table
              columns={codeExampleColumns}
              dataSource={codeExamples}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Scrape Modal */}
      <Modal
        title="Scrape Articles"
        open={scrapeModalVisible}
        onOk={handleScrape}
        onCancel={() => setScrapeModalVisible(false)}
        confirmLoading={loading}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Topics:</Text>
          <Select
            mode="tags"
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Enter topics (e.g., ai, ml, llm)"
            value={scrapeTopics}
            onChange={setScrapeTopics}
          >
            <Option value="ai">AI</Option>
            <Option value="ml">Machine Learning</Option>
            <Option value="llm">LLM</Option>
            <Option value="nlp">NLP</Option>
            <Option value="deeplearning">Deep Learning</Option>
          </Select>
        </div>
        <div>
          <Text strong>Limit:</Text>
          <Input
            type="number"
            style={{ marginTop: 8 }}
            value={scrapeLimit}
            onChange={(e) => setScrapeLimit(Number(e.target.value))}
            min={1}
            max={200}
          />
        </div>
      </Modal>

      {/* Article Detail Modal */}
      <Modal
        title="Article Details"
        open={articleDetailVisible}
        onCancel={() => setArticleDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setArticleDetailVisible(false)}>
            Close
          </Button>,
          <Button 
            key="view" 
            type="primary"
            href={selectedArticle?.url}
            target="_blank"
          >
            View Source
          </Button>,
        ]}
        width={800}
      >
        {selectedArticle && (
          <div>
            <Title level={4}>{selectedArticle.title}</Title>
            <Paragraph>
              <Text strong>Author:</Text> {selectedArticle.author}
            </Paragraph>
            <Paragraph>
              <Text strong>Tags:</Text>{' '}
              {selectedArticle.tags?.map((tag: string) => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
            </Paragraph>
            <Paragraph>
              <Text strong>Status:</Text>{' '}
              <Tag color={selectedArticle.status === 'processed' ? 'green' : 'default'}>
                {selectedArticle.status}
              </Tag>
            </Paragraph>
            <Paragraph>
              <Text strong>Summary:</Text>
              <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                {selectedArticle.summary || 'No summary available'}
              </div>
            </Paragraph>
            {selectedArticle.code_examples?.length > 0 && (
              <Paragraph>
                <Text strong>Code Examples:</Text>
                <div style={{ marginTop: 8 }}>
                  {selectedArticle.code_examples.map((example: any, index: number) => (
                    <Tag key={index} color="blue">
                      {example.language} ({example.lineCount} lines)
                    </Tag>
                  ))}
                </div>
              </Paragraph>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResearchPipelineDashboard;

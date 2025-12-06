import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Tabs, Progress, Badge, Space, Tooltip } from 'antd';
import { 
  FileTextOutlined, 
  BulbOutlined, 
  RocketOutlined, 
  DollarOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import './AIResearchDashboard.css';

const { TabPane } = Tabs;

export default function AIResearchDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/research/dashboard');
      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const triggerScrape = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/research/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: ['ai', 'ml', 'llm'], limit: 50 })
      });
      const result = await response.json();
      console.log('Scrape result:', result);
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to trigger scrape:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePaper = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/research/papers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusArea: 'ai-ml-integration', limit: 50 })
      });
      const result = await response.json();
      console.log('Paper generated:', result);
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to generate paper:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="research-dashboard-loading">
        <SyncOutlined spin style={{ fontSize: 48, color: '#1890ff' }} />
        <p>Loading AI Research Pipeline...</p>
      </div>
    );
  }

  const { stats, topTopics, topFeatures, recentArticles } = dashboardData;

  // Stats cards configuration
  const statsConfig = [
    {
      title: 'Total Articles',
      value: stats.total_articles,
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      title: 'Features Identified',
      value: stats.total_features,
      icon: <BulbOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: 'Active Campaigns',
      value: stats.active_campaigns,
      icon: <RocketOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1'
    },
    {
      title: 'Research Papers',
      value: stats.total_papers,
      icon: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16'
    },
    {
      title: 'Service Packages',
      value: stats.total_packages,
      icon: <DollarOutlined style={{ color: '#13c2c2' }} />,
      color: '#13c2c2'
    },
    {
      title: 'Est. Revenue',
      value: `$${(stats.total_revenue || 0).toLocaleString()}`,
      icon: <DollarOutlined style={{ color: '#eb2f96' }} />,
      color: '#eb2f96',
      prefix: '$'
    }
  ];

  // Topics table columns
  const topicColumns = [
    {
      title: 'Topic',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Tag color="blue">{record.category}</Tag>
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Articles',
      dataIndex: 'article_count',
      key: 'article_count',
      sorter: (a, b) => a.article_count - b.article_count,
      render: (count) => <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
    },
    {
      title: 'Trending Score',
      dataIndex: 'trending_score',
      key: 'trending_score',
      render: (score) => (
        <Progress 
          percent={Math.round(score * 10)} 
          size="small" 
          strokeColor="#1890ff"
          format={(percent) => `${score.toFixed(1)}`}
        />
      )
    },
    {
      title: 'Actionable',
      dataIndex: 'is_actionable',
      key: 'is_actionable',
      render: (actionable) => (
        actionable ? 
          <Tag color="success" icon={<CheckCircleOutlined />}>Yes</Tag> : 
          <Tag color="default">No</Tag>
      )
    }
  ];

  // Features table columns
  const featureColumns = [
    {
      title: 'Feature',
      dataIndex: 'feature_name',
      key: 'feature_name',
      ellipsis: true
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const colors = {
          'enhancement': 'blue',
          'new-feature': 'green',
          'integration': 'purple',
          'optimization': 'orange'
        };
        return <Tag color={colors[category] || 'default'}>{category}</Tag>;
      }
    },
    {
      title: 'Impact',
      dataIndex: 'impact_level',
      key: 'impact_level',
      render: (level) => {
        const colors = {
          'critical': 'red',
          'high': 'orange',
          'medium': 'blue',
          'low': 'default'
        };
        return <Tag color={colors[level]}>{level}</Tag>;
      }
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue_potential',
      key: 'revenue_potential',
      render: (potential) => {
        const icons = {
          'high': <DollarOutlined style={{ color: '#52c41a' }} />,
          'medium': <DollarOutlined style={{ color: '#1890ff' }} />,
          'low': <DollarOutlined style={{ color: '#d9d9d9' }} />
        };
        return <Space>{icons[potential]} {potential}</Space>;
      }
    },
    {
      title: 'Effort',
      dataIndex: 'effort_estimate',
      key: 'effort_estimate',
      render: (effort) => <Tag>{effort}</Tag>
    }
  ];

  // Articles table columns
  const articleColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <a href={record.url} target="_blank" rel="noopener noreferrer">{text}</a>
      )
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <Space size={[0, 8]} wrap>
          {(tags || []).slice(0, 3).map(tag => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Relevance',
      dataIndex: 'relevance_score',
      key: 'relevance_score',
      render: (score) => (
        <Progress 
          percent={Math.round((score || 0) * 100)} 
          size="small" 
          strokeColor="#52c41a"
        />
      )
    },
    {
      title: 'Scraped',
      dataIndex: 'scraped_at',
      key: 'scraped_at',
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <ClockCircleOutlined /> {new Date(date).toLocaleDateString()}
        </Tooltip>
      )
    }
  ];

  return (
    <div className="ai-research-dashboard">
      <div className="dashboard-header">
        <h1>
          <ThunderboltOutlined /> AI Research Pipeline
        </h1>
        <Space>
          <Button type="primary" icon={<SyncOutlined />} onClick={fetchDashboardData}>
            Refresh
          </Button>
          <Button icon={<FileTextOutlined />} onClick={triggerScrape}>
            Scrape Articles
          </Button>
          <Button icon={<BulbOutlined />} onClick={generatePaper}>
            Generate Paper
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        {statsConfig.map((stat, index) => (
          <Col xs={24} sm={12} md={8} lg={4} key={index}>
            <Card className="stat-card" hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="dashboard-tabs">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={<><BulbOutlined /> Top Trending Topics</>}
                className="data-card"
              >
                <Table
                  dataSource={topTopics}
                  columns={topicColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title={<><RocketOutlined /> High Priority Features</>}
                className="data-card"
              >
                <Table
                  dataSource={topFeatures}
                  columns={featureColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Recent Articles" key="articles">
          <Card title={<><FileTextOutlined /> Recent Articles</>}>
            <Table
              dataSource={recentArticles}
              columns={articleColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Features" key="features">
          <Card title={<><BulbOutlined /> All Feature Recommendations</>}>
            <Table
              dataSource={topFeatures}
              columns={featureColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Topics" key="topics">
          <Card title={<><TagsOutlined /> AI/ML/LLM Topics</>}>
            <Table
              dataSource={topTopics}
              columns={topicColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}

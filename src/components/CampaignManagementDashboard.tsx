/**
 * Campaign Management Dashboard
 * 
 * Central dashboard for managing SEO campaigns with DeepSeek AI assistance.
 * Provides real-time monitoring, workflow management, and data mining controls.
 */

import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Statistic, Table, Button, Space, Tag, Progress, message } from 'antd';
import {
  RocketOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { DeepSeekCampaignChat } from './DeepSeekCampaignChat';
import { VisualWorkflowBuilder } from './VisualWorkflowBuilder';

const { Content } = Layout;

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  dataMined: number;
  workflows: number;
  insights: number;
  anomalies: number;
  createdAt: Date;
  lastActivity: Date;
}

interface DataMiningStats {
  totalRecords: number;
  todayRecords: number;
  avgQuality: number;
  anomaliesDetected: number;
}

export const CampaignManagementDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DataMiningStats>({
    totalRecords: 0,
    todayRecords: 0,
    avgQuality: 0,
    anomaliesDetected: 0,
  });
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'workflows'>('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
    loadStats();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      loadCampaigns();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/campaigns/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const createCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Campaign ${campaigns.length + 1}`,
          description: 'Auto-generated campaign',
        }),
      });

      if (response.ok) {
        message.success('Campaign created successfully!');
        loadCampaigns();
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      message.error('Failed to create campaign');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: 'POST',
      });

      if (response.ok) {
        message.success('Campaign paused');
        loadCampaigns();
      }
    } catch (error) {
      message.error('Failed to pause campaign');
    }
  };

  const resumeCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/resume`, {
        method: 'POST',
      });

      if (response.ok) {
        message.success('Campaign resumed');
        loadCampaigns();
      }
    } catch (error) {
      message.error('Failed to resume campaign');
    }
  };

  const campaignColumns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Campaign) => (
        <Space>
          <RocketOutlined />
          <span>{name}</span>
          {record.anomalies > 0 && (
            <Tag color="red" icon={<WarningOutlined />}>
              {record.anomalies} Anomalies
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          active: 'green',
          paused: 'orange',
          completed: 'blue',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: 'Data Mined',
      dataIndex: 'dataMined',
      key: 'dataMined',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: 'Workflows',
      dataIndex: 'workflows',
      key: 'workflows',
    },
    {
      title: 'Insights',
      dataIndex: 'insights',
      key: 'insights',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Campaign) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelectedCampaign(record)}
          >
            View
          </Button>
          {record.status === 'active' ? (
            <Button size="small" onClick={() => pauseCampaign(record.id)}>
              Pause
            </Button>
          ) : (
            <Button size="small" type="primary" onClick={() => resumeCampaign(record.id)}>
              Resume
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
            Campaign Management Dashboard
          </h1>
          <p style={{ fontSize: 16, color: '#666' }}>
            Manage your SEO campaigns with AI-powered insights and automation
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Campaigns"
                value={campaigns.length}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Data Mined"
                value={stats.totalRecords}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                +{stats.todayRecords.toLocaleString()} today
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Data Quality"
                value={stats.avgQuality}
                suffix="%"
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Anomalies Detected"
                value={stats.anomaliesDetected}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Area */}
        <Row gutter={16}>
          {/* Left Panel - Campaigns Table */}
          <Col xs={24} lg={14}>
            <Card
              title="Active Campaigns"
              extra={
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={createCampaign}
                  loading={loading}
                >
                  Create Campaign
                </Button>
              }
            >
              <Table
                dataSource={campaigns}
                columns={campaignColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>

            {/* Workflows Section */}
            {activeTab === 'workflows' && (
              <Card style={{ marginTop: 16 }}>
                <VisualWorkflowBuilder />
              </Card>
            )}
          </Col>

          {/* Right Panel - AI Chat & Controls */}
          <Col xs={24} lg={10}>
            <Card
              tabList={[
                { key: 'overview', tab: 'Overview' },
                { key: 'chat', tab: 'DeepSeek Chat' },
                { key: 'workflows', tab: 'Workflows' },
              ]}
              activeTabKey={activeTab}
              onTabChange={(key) => setActiveTab(key as any)}
            >
              {activeTab === 'overview' && (
                <div>
                  <h3>Campaign Overview</h3>
                  {selectedCampaign ? (
                    <div>
                      <p><strong>Name:</strong> {selectedCampaign.name}</p>
                      <p><strong>Status:</strong> {selectedCampaign.status}</p>
                      <p><strong>Progress:</strong> {selectedCampaign.progress}%</p>
                      <p><strong>Data Mined:</strong> {selectedCampaign.dataMined.toLocaleString()} records</p>
                      <p><strong>Workflows:</strong> {selectedCampaign.workflows}</p>
                      <p><strong>Insights:</strong> {selectedCampaign.insights}</p>
                      <p><strong>Anomalies:</strong> {selectedCampaign.anomalies}</p>
                    </div>
                  ) : (
                    <p style={{ color: '#999' }}>Select a campaign to view details</p>
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div style={{ height: 600 }}>
                  <DeepSeekCampaignChat />
                </div>
              )}

              {activeTab === 'workflows' && (
                <div>
                  <h3>Quick Workflow Actions</h3>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      block
                      onClick={() => {
                        message.info('Opening workflow builder...');
                        // Navigate to workflow builder tab in main panel
                      }}
                    >
                      Create New Workflow
                    </Button>
                    <Button block>View All Workflows</Button>
                    <Button block>Workflow Templates</Button>
                  </Space>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<DatabaseOutlined />}>
                  Mine Blockchain Data
                </Button>
                <Button block icon={<LineChartOutlined />}>
                  Analyze Market Trends
                </Button>
                <Button block icon={<ThunderboltOutlined />}>
                  Optimize All Campaigns
                </Button>
                <Button block icon={<WarningOutlined />}>
                  Review Anomalies
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

/**
 * Comprehensive Crawler Management Dashboard
 * 
 * Main dashboard that integrates:
 * - Campaign management
 * - Cluster management
 * - Seeding service management
 * - Real-time monitoring
 */

import React, { useState } from 'react';
import {
  Layout,
  Tabs,
  Card,
  Typography,
  Space,
  Badge
} from 'antd';
import {
  RocketOutlined,
  ClusterOutlined,
  ApiOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import CrawlerCampaignDashboard from './CrawlerCampaignDashboard';
import CrawlerClusterManagement from './CrawlerClusterManagement';
import SeedingServiceManagement from './SeedingServiceManagement';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const ComprehensiveCrawlerDashboard: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState<any>(null);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card
          style={{ marginBottom: 24 }}
          bodyStyle={{ padding: '24px 32px' }}
        >
          <Space direction="vertical" size="small">
            <Title level={2} style={{ margin: 0 }}>
              <RocketOutlined style={{ marginRight: 12 }} />
              Crawler Management System
            </Title>
            <Typography.Text type="secondary">
              Comprehensive crawler campaign management with clustering, seeding services, and real-time monitoring
            </Typography.Text>
          </Space>
        </Card>

        <Tabs
          defaultActiveKey="campaigns"
          type="card"
          size="large"
          items={[
            {
              key: 'campaigns',
              label: (
                <Space>
                  <RocketOutlined />
                  Campaigns
                </Space>
              ),
              children: <CrawlerCampaignDashboard />
            },
            {
              key: 'clusters',
              label: (
                <Space>
                  <ClusterOutlined />
                  Clusters
                  {selectedCluster && (
                    <Badge
                      count={selectedCluster.campaigns?.length || 0}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  )}
                </Space>
              ),
              children: (
                <CrawlerClusterManagement onSelectCluster={setSelectedCluster} />
              )
            },
            {
              key: 'seeding',
              label: (
                <Space>
                  <ApiOutlined />
                  Seeding Services
                </Space>
              ),
              children: <SeedingServiceManagement />
            },
            {
              key: 'analytics',
              label: (
                <Space>
                  <BarChartOutlined />
                  Analytics
                </Space>
              ),
              children: (
                <Card>
                  <Typography.Title level={4}>
                    Analytics Dashboard
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Coming soon: Real-time analytics, performance metrics, and reporting
                  </Typography.Text>
                </Card>
              )
            }
          ]}
        />
      </Content>
    </Layout>
  );
};

export default ComprehensiveCrawlerDashboard;

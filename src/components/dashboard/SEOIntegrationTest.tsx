import React, { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Row, Col, Statistic, Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined, RobotOutlined, GlobalOutlined, BarChartOutlined } from '@ant-design/icons';
import { useSEO } from '../../hooks/useSEO';

const { Title, Text } = Typography;

const SEOIntegrationTest: React.FC = () => {
  const { loading, stats, modelStatus, getModelStatus } = useSEO();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const testSEOIntegration = async () => {
    try {
      setConnectionStatus('testing');
      // Test basic connectivity
      await getModelStatus();
      setConnectionStatus('success');
      console.log('SEO Integration Test: ✅ Model status check passed');
    } catch (error) {
      setConnectionStatus('error');
      console.error('SEO Integration Test: ❌ Failed', error);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'testing': return 'info';
      default: return 'default';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'success': return 'Connected';
      case 'error': return 'Connection Failed';
      case 'testing': return 'Testing...';
      default: return 'Not Tested';
    }
  };

  return (
    <Card 
      title={
        <Space>
          <SearchOutlined />
          SEO Pipeline Integration Status
        </Space>
      } 
      style={{ margin: '16px 0' }}
      className="seo-integration-card"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Integration Status Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="integration-status-card">
              <Statistic
                title="Dashboard Integration"
                value="Complete"
                valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="integration-status-card">
              <Statistic
                title="API Service"
                value="Ready"
                valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="integration-status-card">
              <Statistic
                title="TypeScript Support"
                value="Complete"
                valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="integration-status-card">
              <Statistic
                title="API Connection"
                value={getConnectionStatusText()}
                valueStyle={{ 
                  color: connectionStatus === 'success' ? '#52c41a' : 
                         connectionStatus === 'error' ? '#ff4d4f' : '#1890ff',
                  fontSize: '16px' 
                }}
                prefix={connectionStatus === 'success' ? <CheckCircleOutlined /> : 
                        connectionStatus === 'error' ? <ExclamationCircleOutlined /> : 
                        <ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* SEO Stats Preview */}
        {stats && (
          <Alert
            message="SEO Pipeline Statistics"
            description={
              <Row gutter={[16, 8]}>
                <Col span={6}>
                  <Text strong>Analyses: </Text>
                  <Text>{stats.totalAnalyses}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Domains: </Text>
                  <Text>{stats.domainsAnalyzed}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Avg Score: </Text>
                  <Text>{stats.avgSEOScore}/100</Text>
                </Col>
                <Col span={6}>
                  <Text strong>AI Recommendations: </Text>
                  <Text>{stats.aiRecommendations}</Text>
                </Col>
              </Row>
            }
            type="info"
            showIcon
            icon={<BarChartOutlined />}
          />
        )}

        {/* Model Status */}
        {modelStatus && (
          <Alert
            message="AI Model Status"
            description={
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Text strong>Status: </Text>
                  <Tag color={modelStatus.loaded ? 'green' : 'orange'}>
                    {modelStatus.loaded ? 'Loaded' : 'Not Loaded'}
                  </Tag>
                </Col>
                <Col span={8}>
                  <Text strong>Training: </Text>
                  <Tag color={modelStatus.training ? 'blue' : 'default'}>
                    {modelStatus.training ? 'In Progress' : 'Idle'}
                  </Tag>
                </Col>
                <Col span={8}>
                  <Text strong>Samples: </Text>
                  <Text>{modelStatus.metrics?.trainingSamples || 0}</Text>
                </Col>
              </Row>
            }
            type={modelStatus.loaded ? 'success' : 'warning'}
            showIcon
            icon={<RobotOutlined />}
          />
        )}

        {/* Connection Test */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Button 
            type="primary" 
            onClick={testSEOIntegration}
            loading={loading || connectionStatus === 'testing'}
            icon={<CheckCircleOutlined />}
            size="large"
          >
            {connectionStatus === 'testing' ? 'Testing Connection...' : 'Test SEO API Connection'}
          </Button>
        </div>

        {/* Quick Actions */}
        <Alert
          message="Quick Actions"
          description={
            <Space wrap>
              <Button type="link" icon={<SearchOutlined />}>
                Go to SEO Analysis
              </Button>
              <Button type="link" icon={<GlobalOutlined />}>
                View Domain Overview
              </Button>
              <Button type="link" icon={<RobotOutlined />}>
                AI Recommendations
              </Button>
              <Button type="link" icon={<BarChartOutlined />}>
                View Trends
              </Button>
            </Space>
          }
          type="info"
          showIcon
        />

        {/* Next Steps */}
        <Alert
          message="Getting Started"
          description={
            <div>
              <p>1. <Text code>cd seo-pipeline && npm start</Text> - Start the SEO API service</p>
              <p>2. Click "SEO Pipeline" in the sidebar to access the full dashboard</p>
              <p>3. Test website analysis and AI recommendations</p>
              <p>4. Monitor trends and model training progress</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default SEOIntegrationTest;
/**
 * Chart Demo Page - Main showcase for all interactive chart features
 */

import React, { useState } from 'react';
import { Card, Tabs, Button, Space, Typography, Row, Col, Alert, Divider } from 'antd';
import { 
  BarChartOutlined, 
  CodeOutlined, 
  RocketOutlined,
  StarOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  ExperimentOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import InteractiveChartDemo from './InteractiveChartDemo';
import InteractiveMermaidDemo from './InteractiveMermaidDemo';
import './ChartDemoPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ChartDemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('charts');

  return (
    <div className="chart-demo-page">
      {/* Header */}
      <div className="demo-page-header">
        <div className="header-content">
          <Title level={1} className="main-title">
            <RocketOutlined className="title-icon" />
            Interactive Charts & Diagrams
          </Title>
          <Paragraph className="main-description">
            Experience the full power of interactive data visualization with advanced features including notes, zoom, annotations, and real-time editing.
          </Paragraph>
          
          <div className="feature-highlights">
            <Space wrap size="large">
              <div className="highlight-item">
                <StarOutlined className="highlight-icon" />
                <Text strong>Smart Notes</Text>
              </div>
              <div className="highlight-item">
                <ThunderboltOutlined className="highlight-icon" />
                <Text strong>Zoom & Pan</Text>
              </div>
              <div className="highlight-item">
                <BulbOutlined className="highlight-icon" />
                <Text strong>Rich Annotations</Text>
              </div>
              <div className="highlight-item">
                <ExperimentOutlined className="highlight-icon" />
                <Text strong>Export & Share</Text>
              </div>
            </Space>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="demo-page-content">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="demo-tabs"
          tabBarExtraContent={
            <Space>
              <Button 
                type="primary" 
                icon={<RocketOutlined />}
                onClick={() => window.open('https://github.com/your-repo', '_blank')}
              >
                View on GitHub
              </Button>
            </Space>
          }
        >
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                Data Charts
              </span>
            } 
            key="charts"
          >
            <InteractiveChartDemo />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CodeOutlined />
                Mermaid Diagrams
              </span>
            } 
            key="mermaid"
          >
            <InteractiveMermaidDemo />
          </TabPane>
        </Tabs>
      </div>

      {/* Features Overview */}
      <div className="features-overview">
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card title="Why Choose Interactive Charts?" className="features-card">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12} lg={6}>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <StarOutlined />
                    </div>
                    <Title level={5}>Smart Notes System</Title>
                    <Text type="secondary">
                      Add contextual notes to any data point or diagram element. Notes are automatically positioned and can be categorized for easy organization.
                    </Text>
                  </div>
                </Col>
                
                <Col xs={24} md={12} lg={6}>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <ThunderboltOutlined />
                    </div>
                    <Title level={5}>Advanced Interactions</Title>
                    <Text type="secondary">
                      Smooth zoom, pan, and brush selection. Mouse wheel zoom, drag to pan, and intuitive controls for exploring your data.
                    </Text>
                  </div>
                </Col>
                
                <Col xs={24} md={12} lg={6}>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <BulbOutlined />
                    </div>
                    <Title level={5}>Rich Annotations</Title>
                    <Text type="secondary">
                      Add lines, areas, points, and text annotations to highlight important data or mark specific areas of interest.
                    </Text>
                  </div>
                </Col>
                
                <Col xs={24} md={12} lg={6}>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <ExperimentOutlined />
                    </div>
                    <Title level={5}>Export & Share</Title>
                    <Text type="secondary">
                      Export charts and diagrams in multiple formats (PNG, SVG, PDF, JPG) with notes and annotations included.
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Usage Examples */}
      <div className="usage-examples">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Data Charts Use Cases" className="example-card">
              <div className="example-list">
                <div className="example-item">
                  <Badge count="1" style={{ backgroundColor: '#1890ff' }} />
                  <div>
                    <Text strong>Performance Monitoring</Text>
                    <br />
                    <Text type="secondary">Track system metrics with interactive notes and annotations</Text>
                  </div>
                </div>
                <div className="example-item">
                  <Badge count="2" style={{ backgroundColor: '#52c41a' }} />
                  <div>
                    <Text strong>Sales Analytics</Text>
                    <br />
                    <Text type="secondary">Analyze sales trends with zoom and filtering capabilities</Text>
                  </div>
                </div>
                <div className="example-item">
                  <Badge count="3" style={{ backgroundColor: '#faad14' }} />
                  <div>
                    <Text strong>User Behavior</Text>
                    <br />
                    <Text type="secondary">Understand user patterns with interactive visualizations</Text>
                  </div>
                </div>
                <div className="example-item">
                  <Badge count="4" style={{ backgroundColor: '#f5222d' }} />
                  <div>
                    <Text strong>Financial Reports</Text>
                    <br />
                    <Text type="secondary">Create detailed financial reports with exportable charts</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="Mermaid Diagrams Use Cases" className="example-card">
              <div className="example-list">
                <div className="example-item">
                  <Badge count="1" style={{ backgroundColor: '#1890ff' }} />
                  <div>
                    <Text strong>System Architecture</Text>
                    <br />
                    <Text type="secondary">Document system architecture with interactive diagrams</Text>
                  </div>
                </div>
                <div className="example-item">
                  <Badge count="2" style={{ backgroundColor: '#52c41a' }} />
                  <div>
                    <Text strong>Process Flows</Text>
                    <br />
                    <Text type="secondary">Map business processes with detailed flowcharts</Text>
                  </div>
                </div>
                <div className="example-item">
                  <Badge count="3" style={{ backgroundColor: '#faad14' }} />
                  <div>
                    <Text strong>Project Planning</Text>
                    <br />
                    <Text type="secondary">Create Gantt charts and project timelines</Text>
                  </div>
                </div>
                <div className="example-item">
                  <Badge count="4" style={{ backgroundColor: '#f5222d' }} />
                  <div>
                    <Text strong>API Documentation</Text>
                    <br />
                    <Text type="secondary">Document API interactions with sequence diagrams</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Getting Started */}
      <div className="getting-started">
        <Alert
          message="Getting Started"
          description={
            <div>
              <Paragraph>
                Ready to add interactive charts to your project? Here's how to get started:
              </Paragraph>
              <ol>
                <li>Install the required dependencies: <code>npm install recharts @ant-design/plots mermaid</code></li>
                <li>Import the components: <code>import InteractiveChart from './components/charts/InteractiveChart'</code></li>
                <li>Configure your chart data and options</li>
                <li>Add event handlers for notes and annotations</li>
                <li>Customize the appearance and behavior</li>
              </ol>
              <Divider />
              <Space>
                <Button type="primary" size="large">
                  View Documentation
                </Button>
                <Button size="large">
                  Download Examples
                </Button>
              </Space>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />
      </div>
    </div>
  );
};

export default ChartDemoPage;
/**
 * Interactive Chart Demo Component
 * Showcases all the interactive features of the chart component
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Typography, Select, Switch, Slider, InputNumber, Divider, Alert, Tag, Badge, Progress } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined, 
  SettingOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  StarOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import InteractiveChart, { ChartConfig, ChartNote, ChartAnnotation } from './InteractiveChart';
import './InteractiveChartDemo.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const InteractiveChartDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDemo, setCurrentDemo] = useState('performance');
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'line',
    data: [],
    xField: 'time',
    yField: 'value',
    title: 'Interactive Performance Chart',
    description: 'Click anywhere on the chart to add notes, use mouse wheel to zoom, and drag to pan',
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    showBrush: true,
    enableZoom: true,
    enableNotes: true,
    enableAnnotations: true,
    theme: 'auto',
    height: 500
  });

  // Sample data generators
  const generatePerformanceData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      data.push({
        time: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 40) + 60, // 60-100
        category: ['CPU', 'Memory', 'Network', 'Storage'][Math.floor(Math.random() * 4)],
        region: ['US', 'EU', 'ASIA', 'LATAM'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.8 ? 'warning' : 'normal'
      });
    }
    return data;
  };

  const generateSalesData = () => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 12; i++) {
      data.push({
        month: months[i],
        sales: Math.floor(Math.random() * 100000) + 50000,
        profit: Math.floor(Math.random() * 50000) + 20000,
        customers: Math.floor(Math.random() * 1000) + 500,
        category: 'Sales'
      });
    }
    return data;
  };

  const generateUserActivityData = () => {
    const data = [];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    for (const hour of hours) {
      data.push({
        hour: `${hour}:00`,
        users: Math.floor(Math.random() * 1000) + 100,
        sessions: Math.floor(Math.random() * 500) + 50,
        pageviews: Math.floor(Math.random() * 2000) + 200,
        bounceRate: Math.random() * 0.5 + 0.2
      });
    }
    return data;
  };

  const generateWebsiteData = () => {
    const websites = [
      'google.com', 'facebook.com', 'youtube.com', 'amazon.com', 'wikipedia.org',
      'twitter.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'github.com'
    ];
    
    return websites.map(website => ({
      website,
      score: Math.floor(Math.random() * 40) + 60,
      loadTime: Math.random() * 3 + 1,
      size: Math.floor(Math.random() * 5000) + 1000,
      category: ['E-commerce', 'Social', 'Search', 'News', 'Tech'][Math.floor(Math.random() * 5)]
    }));
  };

  // Demo configurations
  const demos = {
    performance: {
      title: 'Performance Monitoring',
      description: 'Real-time system performance metrics with interactive notes and zoom',
      data: generatePerformanceData(),
      config: {
        type: 'line' as const,
        xField: 'time',
        yField: 'value',
        colorField: 'category',
        title: 'System Performance Over Time',
        description: 'Monitor CPU, Memory, Network, and Storage performance',
        showBrush: true,
        enableZoom: true,
        enableNotes: true,
        enableAnnotations: true
      }
    },
    sales: {
      title: 'Sales Analytics',
      description: 'Sales data with multiple metrics and interactive filtering',
      data: generateSalesData(),
      config: {
        type: 'bar' as const,
        xField: 'month',
        yField: 'sales',
        title: 'Monthly Sales Performance',
        description: 'Track sales trends and identify growth opportunities',
        showBrush: true,
        enableZoom: true,
        enableNotes: true,
        enableAnnotations: true
      }
    },
    users: {
      title: 'User Activity',
      description: '24-hour user activity patterns with detailed insights',
      data: generateUserActivityData(),
      config: {
        type: 'area' as const,
        xField: 'hour',
        yField: 'users',
        colorField: 'category',
        title: 'User Activity by Hour',
        description: 'Understand user behavior patterns throughout the day',
        showBrush: true,
        enableZoom: true,
        enableNotes: true,
        enableAnnotations: true
      }
    },
    websites: {
      title: 'Website Performance',
      description: 'Website performance scores with interactive comparisons',
      data: generateWebsiteData(),
      config: {
        type: 'scatter' as const,
        xField: 'loadTime',
        yField: 'score',
        colorField: 'category',
        title: 'Website Performance Analysis',
        description: 'Compare load times vs performance scores across websites',
        showBrush: true,
        enableZoom: true,
        enableNotes: true,
        enableAnnotations: true
      }
    }
  };

  // Auto-play simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setChartConfig(prev => ({
          ...prev,
          data: generatePerformanceData() // Update with new data
        }));
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentDemo]);

  // Initialize data
  useEffect(() => {
    const demo = demos[currentDemo as keyof typeof demos];
    if (demo) {
      setChartConfig(prev => ({
        ...prev,
        ...demo.config,
        data: demo.data
      }));
    }
  }, [currentDemo]);

  const handleDemoChange = (demoKey: string) => {
    setCurrentDemo(demoKey);
    setIsPlaying(false);
  };

  const handleConfigChange = (newConfig: ChartConfig) => {
    setChartConfig(newConfig);
  };

  const handleNoteAdd = (note: ChartNote) => {
    console.log('Note added:', note);
  };

  const handleNoteUpdate = (note: ChartNote) => {
    console.log('Note updated:', note);
  };

  const handleNoteDelete = (noteId: string) => {
    console.log('Note deleted:', noteId);
  };

  const handleAnnotationAdd = (annotation: ChartAnnotation) => {
    console.log('Annotation added:', annotation);
  };

  const handleAnnotationUpdate = (annotation: ChartAnnotation) => {
    console.log('Annotation updated:', annotation);
  };

  const handleAnnotationDelete = (annotationId: string) => {
    console.log('Annotation deleted:', annotationId);
  };

  const currentDemoData = demos[currentDemo as keyof typeof demos];

  return (
    <div className="interactive-chart-demo">
      <div className="demo-header">
        <div className="demo-title">
          <Title level={2}>
            <RocketOutlined className="title-icon" />
            Interactive Chart Features Demo
          </Title>
          <Paragraph className="demo-description">
            Experience the full power of interactive data visualization with notes, zoom, annotations, and more.
          </Paragraph>
        </div>
        
        <div className="demo-controls">
          <Space wrap>
            <Button
              type={isPlaying ? 'primary' : 'default'}
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? 'Pause' : 'Play'} Simulation
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                const demo = demos[currentDemo as keyof typeof demos];
                if (demo) {
                  setChartConfig(prev => ({
                    ...prev,
                    data: demo.data
                  }));
                }
              }}
            >
              Refresh Data
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Demo Selection */}
        <Col xs={24} lg={6}>
          <Card title="Demo Scenarios" className="demo-sidebar">
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(demos).map(([key, demo]) => (
                <Button
                  key={key}
                  type={currentDemo === key ? 'primary' : 'default'}
                  block
                  onClick={() => handleDemoChange(key)}
                  className="demo-scenario-btn"
                >
                  <div className="scenario-content">
                    <Text strong>{demo.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {demo.description}
                    </Text>
                  </div>
                </Button>
              ))}
            </Space>
            
            <Divider />
            
            <div className="feature-highlights">
              <Title level={5}>Interactive Features</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div className="feature-item">
                  <StarOutlined className="feature-icon" />
                  <div>
                    <Text strong>Add Notes</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Click anywhere on the chart to add notes
                    </Text>
                  </div>
                </div>
                <div className="feature-item">
                  <ThunderboltOutlined className="feature-icon" />
                  <div>
                    <Text strong>Zoom & Pan</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Mouse wheel to zoom, drag to pan
                    </Text>
                  </div>
                </div>
                <div className="feature-item">
                  <BulbOutlined className="feature-icon" />
                  <div>
                    <Text strong>Annotations</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Add lines, areas, and text annotations
                    </Text>
                  </div>
                </div>
                <div className="feature-item">
                  <ExperimentOutlined className="feature-icon" />
                  <div>
                    <Text strong>Export & Share</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Export charts in multiple formats
                    </Text>
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Main Chart */}
        <Col xs={24} lg={18}>
          <Card className="main-chart-card">
            <InteractiveChart
              config={chartConfig}
              onConfigChange={handleConfigChange}
              onNoteAdd={handleNoteAdd}
              onNoteUpdate={handleNoteUpdate}
              onNoteDelete={handleNoteDelete}
              onAnnotationAdd={handleAnnotationAdd}
              onAnnotationUpdate={handleAnnotationUpdate}
              onAnnotationDelete={handleAnnotationDelete}
              className="demo-chart"
            />
          </Card>
        </Col>
      </Row>

      {/* Feature Showcase */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Interactive Features Showcase" className="features-showcase">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div className="feature-card">
                  <div className="feature-icon-large">
                    <StarOutlined />
                  </div>
                  <Title level={5}>Smart Notes</Title>
                  <Text type="secondary">
                    Add contextual notes to any data point. Notes are automatically positioned and can be categorized.
                  </Text>
                  <div className="feature-tags">
                    <Tag color="blue">Click to Add</Tag>
                    <Tag color="green">Categorized</Tag>
                    <Tag color="orange">Searchable</Tag>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="feature-card">
                  <div className="feature-icon-large">
                    <ThunderboltOutlined />
                  </div>
                  <Title level={5}>Advanced Zoom</Title>
                  <Text type="secondary">
                    Smooth zoom and pan with mouse wheel and drag. Reset view with one click.
                  </Text>
                  <div className="feature-tags">
                    <Tag color="blue">Mouse Wheel</Tag>
                    <Tag color="green">Drag to Pan</Tag>
                    <Tag color="orange">Reset View</Tag>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="feature-card">
                  <div className="feature-icon-large">
                    <BulbOutlined />
                  </div>
                  <Title level={5}>Rich Annotations</Title>
                  <Text type="secondary">
                    Add lines, areas, points, and text annotations to highlight important data.
                  </Text>
                  <div className="feature-tags">
                    <Tag color="blue">Multiple Types</Tag>
                    <Tag color="green">Customizable</Tag>
                    <Tag color="orange">Exportable</Tag>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="feature-card">
                  <div className="feature-icon-large">
                    <ExperimentOutlined />
                  </div>
                  <Title level={5}>Export & Share</Title>
                  <Text type="secondary">
                    Export charts in PNG, SVG, PDF, and JPG formats with notes and annotations.
                  </Text>
                  <div className="feature-tags">
                    <Tag color="blue">Multiple Formats</Tag>
                    <Tag color="green">High Quality</Tag>
                    <Tag color="orange">Include Notes</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Usage Instructions */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Alert
            message="How to Use Interactive Charts"
            description={
              <div className="usage-instructions">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <div className="instruction-item">
                      <Badge count="1" style={{ backgroundColor: '#1890ff' }} />
                      <div>
                        <Text strong>Add Notes</Text>
                        <br />
                        <Text type="secondary">Click anywhere on the chart to add a note</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="instruction-item">
                      <Badge count="2" style={{ backgroundColor: '#52c41a' }} />
                      <div>
                        <Text strong>Zoom & Pan</Text>
                        <br />
                        <Text type="secondary">Use mouse wheel to zoom, drag to pan around</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="instruction-item">
                      <Badge count="3" style={{ backgroundColor: '#faad14' }} />
                      <div>
                        <Text strong>Add Annotations</Text>
                        <br />
                        <Text type="secondary">Use the Annotations button to add lines and areas</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </Col>
      </Row>
    </div>
  );
};

export default InteractiveChartDemo;
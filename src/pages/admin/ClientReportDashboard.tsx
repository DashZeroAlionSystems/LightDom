/**
 * Client Report Generation Dashboard
 * Generates comprehensive analytics reports for clients with 3D visualizations
 * Created: 2025-11-06
 */

import React, { useState } from 'react';
import {
  Card,
  Button,
  Select,
  DatePicker,
  Space,
  Spin,
  message,
  Row,
  Col,
  Statistic,
  Tabs,
  Table,
  Tag,
  Progress
} from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  BarChartOutlined,
  GlobalOutlined,
  RocketOutlined,
  DatabaseOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import ClientAnalyticsService from '../../services/ClientAnalyticsService';
import type { ClientReport } from '../../services/ClientAnalyticsService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ClientReportDashboard: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ClientReport | null>(null);
  const [clients, setClients] = useState<any[]>([
    { id: '1', name: 'Acme Corporation', email: 'admin@acme.com' },
    { id: '2', name: 'TechStart Inc', email: 'info@techstart.com' },
    { id: '3', name: 'Global Solutions', email: 'contact@globalsolutions.com' }
  ]);

  const generateReport = async () => {
    if (!selectedClient) {
      message.warning('Please select a client');
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange?.[0]?.toISOString();
      const endDate = dateRange?.[1]?.toISOString();

      const generatedReport = await ClientAnalyticsService.generateClientReport(
        selectedClient,
        {
          startDate,
          endDate,
          includeVisualizations: true
        }
      );

      setReport(generatedReport);
      message.success('Report generated successfully!');
    } catch (error: any) {
      message.error(`Failed to generate report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'json' | 'html' | 'pdf') => {
    if (!report) return;

    try {
      const exported = await ClientAnalyticsService.exportReport(report, format);
      
      // Create download link
      const blob = new Blob([exported], { 
        type: format === 'json' ? 'application/json' : 'text/html' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `client-report-${report.clientName}-${Date.now()}.${format}`;
      link.click();
      URL.revokeObjectURL(url);

      message.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      message.error(`Failed to export report: ${error.message}`);
    }
  };

  const renderReportHeader = () => {
    if (!report) return null;

    const infographic = ClientAnalyticsService.generateInfographicData(report);

    return (
      <Card>
        <h2>{report.clientName} - Analytics Report</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Period: {new Date(report.reportPeriod.start).toLocaleDateString()} - {new Date(report.reportPeriod.end).toLocaleDateString()}
        </p>

        <Row gutter={16}>
          {infographic.headerStats.map((stat: any, idx: number) => (
            <Col span={6} key={idx}>
              <Card bordered={false} style={{ borderLeft: `4px solid ${stat.color}` }}>
                <Statistic
                  title={stat.label}
                  value={stat.value}
                  valueStyle={{ color: stat.color }}
                  prefix={
                    stat.icon === 'database' ? <DatabaseOutlined /> :
                    stat.icon === 'globe' ? <GlobalOutlined /> :
                    stat.icon === 'rocket' ? <RocketOutlined /> :
                    <TrophyOutlined />
                  }
                />
                {stat.trend && (
                  <div style={{ marginTop: 8, color: '#52c41a', fontSize: 14 }}>
                    {stat.trend}
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  const renderWebsitePerformance = () => {
    if (!report) return null;

    const columns = [
      {
        title: 'Website URL',
        dataIndex: 'url',
        key: 'url',
        render: (url: string) => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
      },
      {
        title: 'Space Saved',
        dataIndex: ['optimization', 'spaceOptimized'],
        key: 'spaceSaved',
        render: (bytes: number) => `${(bytes / 1024).toFixed(2)} KB`,
        sorter: (a: any, b: any) => a.optimization.spaceOptimized - b.optimization.spaceOptimized
      },
      {
        title: 'Load Time',
        dataIndex: ['performance', 'loadTime'],
        key: 'loadTime',
        render: (ms: number) => `${ms.toFixed(2)}ms`,
        sorter: (a: any, b: any) => a.performance.loadTime - b.performance.loadTime
      },
      {
        title: 'SEO Score',
        dataIndex: ['seo', 'score'],
        key: 'seoScore',
        render: (score: number) => (
          <div>
            <Progress
              percent={score}
              size="small"
              status={score >= 80 ? 'success' : score >= 60 ? 'normal' : 'exception'}
            />
          </div>
        ),
        sorter: (a: any, b: any) => a.seo.score - b.seo.score
      },
      {
        title: 'Biome',
        dataIndex: ['optimization', 'biomeType'],
        key: 'biome',
        render: (biome: string) => (
          <Tag color={
            biome === 'forest' ? 'green' :
            biome === 'ocean' ? 'blue' :
            biome === 'desert' ? 'orange' :
            'default'
          }>
            {biome.toUpperCase()}
          </Tag>
        )
      },
      {
        title: 'DOM Layers',
        dataIndex: ['domComplexity', 'renderLayers'],
        key: 'layers',
        render: (layers: number) => layers
      }
    ];

    return (
      <Card title="Website Performance Details">
        <Table
          dataSource={report.websites}
          columns={columns}
          rowKey="url"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    );
  };

  const render3DVisualization = () => {
    if (!report || !report.visualizations.domLayersData) return null;

    return (
      <Card title="3D DOM Structure Visualization">
        <p style={{ marginBottom: 16, color: '#666' }}>
          Interactive 3D visualization of DOM rendering layers. Each website's DOM structure 
          is represented as stacked layers in 3D space.
        </p>
        
        {report.visualizations.domLayersData.map((siteData: any, idx: number) => (
          <Card key={idx} type="inner" style={{ marginBottom: 16 }}>
            <h4>{siteData.url}</h4>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total Layers"
                  value={siteData.layers.length}
                  prefix={<BarChartOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Elements"
                  value={siteData.complexity.totalElements}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Max Depth"
                  value={siteData.complexity.depth}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 16, background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
              <h5>Layer Structure:</h5>
              {siteData.layers.map((layer: any, layerIdx: number) => (
                <div
                  key={layer.id}
                  style={{
                    background: layer.color,
                    opacity: layer.opacity,
                    padding: '8px 12px',
                    marginBottom: 4,
                    borderRadius: 4,
                    color: 'white',
                    fontSize: 12
                  }}
                >
                  Layer {layerIdx}: {layer.elements.toFixed(0)} elements
                  {layer.metadata.paintLayer && <Tag color="green" style={{ marginLeft: 8 }}>Paint Layer</Tag>}
                  {layer.metadata.compositingLayer && <Tag color="blue" style={{ marginLeft: 8 }}>Compositing</Tag>}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
              <strong>Note:</strong> In a full implementation, this would render an interactive 3D canvas 
              using Three.js where users can rotate, zoom, and explore the DOM layer structure.
            </div>
          </Card>
        ))}
      </Card>
    );
  };

  const renderInsights = () => {
    if (!report) return null;

    return (
      <Card title="Key Insights & Recommendations">
        <h4>Top Issues Found:</h4>
        {report.summary.topIssues.length > 0 ? (
          <ul>
            {report.summary.topIssues.map((issue, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <Tag color="warning">⚠️</Tag> {issue}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#52c41a' }}>✓ No major issues found!</p>
        )}

        <h4 style={{ marginTop: 24 }}>Performance Summary:</h4>
        <ul>
          <li>Total websites analyzed: <strong>{report.websites.length}</strong></li>
          <li>Total space saved: <strong>{(report.summary.totalSpaceSaved / 1024 / 1024).toFixed(2)} MB</strong></li>
          <li>Average performance gain: <strong>{report.summary.averagePerformanceGain.toFixed(1)}%</strong></li>
          <li>Total optimizations: <strong>{report.summary.totalOptimizations}</strong></li>
        </ul>

        <Card type="inner" style={{ marginTop: 16, background: '#f0f9ff' }}>
          <h4>💡 Recommendations:</h4>
          <ul>
            <li>Continue monitoring SEO scores and address issues promptly</li>
            <li>Consider implementing lazy loading for heavy DOM elements</li>
            <li>Review and optimize render-blocking resources</li>
            <li>Keep optimizing based on biome-specific strategies</li>
          </ul>
        </Card>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Client Analytics Report Generator"
        extra={<Tag color="blue">On-Demand Reports</Tag>}
      >
        {/* Report Generation Controls */}
        <Card type="inner" style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Select Client
              </label>
              <Select
                style={{ width: '100%' }}
                placeholder="Choose a client"
                value={selectedClient}
                onChange={setSelectedClient}
              >
                {clients.map(client => (
                  <Option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Date Range (Optional)
              </label>
              <RangePicker
                style={{ width: '100%' }}
                onChange={(dates) => setDateRange(dates as [any, any])}
              />
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Default: Last 30 days
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<FileTextOutlined />}
              onClick={generateReport}
              loading={loading}
              block
            >
              Generate Report
            </Button>
          </Space>
        </Card>

        {/* Report Display */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Generating comprehensive report...</p>
          </div>
        )}

        {report && !loading && (
          <>
            {/* Export Options */}
            <div style={{ marginBottom: 24, textAlign: 'right' }}>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={() => exportReport('json')}>
                  Export JSON
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => exportReport('html')}>
                  Export HTML
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => exportReport('pdf')}>
                  Export PDF
                </Button>
              </Space>
            </div>

            {/* Report Content */}
            {renderReportHeader()}

            <Tabs defaultActiveKey="performance" style={{ marginTop: 24 }}>
              <TabPane tab="Performance Details" key="performance">
                {renderWebsitePerformance()}
              </TabPane>

              <TabPane tab="3D Visualizations" key="3d">
                {render3DVisualization()}
              </TabPane>

              <TabPane tab="Insights & Recommendations" key="insights">
                {renderInsights()}
              </TabPane>

              <TabPane tab="Raw Data" key="raw">
                <Card>
                  <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto', maxHeight: 600 }}>
                    {JSON.stringify(report, null, 2)}
                  </pre>
                </Card>
              </TabPane>
            </Tabs>
          </>
        )}

        {!report && !loading && (
          <Card style={{ textAlign: 'center', padding: 48 }}>
            <FileTextOutlined style={{ fontSize: 72, color: '#d9d9d9', marginBottom: 16 }} />
            <h3>No Report Generated</h3>
            <p style={{ color: '#666' }}>
              Select a client and click "Generate Report" to create a comprehensive analytics report
              with 3D visualizations and actionable insights.
            </p>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default ClientReportDashboard;

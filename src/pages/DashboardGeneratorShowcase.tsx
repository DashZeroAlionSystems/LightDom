/**
 * Dashboard Generator Showcase
 * End-to-end testing and demonstration of dashboard generation system
 */

import React, { useState } from 'react';
import { Card, Tabs, Button, Space, Typography, Alert, Divider } from 'antd';
import {
  LayoutDashboard,
  Zap,
  Eye,
  Code,
  FileJson,
} from 'lucide-react';
import DashboardGenerator from '../components/design-system/DashboardGenerator';
import {
  StatCardWidget,
  ChartWidget,
  TableWidget,
  ListWidget,
  ProgressWidget,
  TimelineWidget,
} from '../components/dashboard-widgets';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

export default function DashboardGeneratorShowcase() {
  const [activeTab, setActiveTab] = useState('generator');
  const [generatedDashboard, setGeneratedDashboard] = useState<any>(null);

  // Sample data for widget demonstrations
  const sampleChartData = [
    { name: 'Mon', visits: 2400, sales: 400 },
    { name: 'Tue', visits: 1398, sales: 300 },
    { name: 'Wed', visits: 9800, sales: 200 },
    { name: 'Thu', visits: 3908, sales: 278 },
    { name: 'Fri', visits: 4800, sales: 189 },
    { name: 'Sat', visits: 3800, sales: 239 },
    { name: 'Sun', visits: 4300, sales: 349 },
  ];

  const samplePieData = [
    { name: 'Direct', value: 400 },
    { name: 'Organic', value: 300 },
    { name: 'Referral', value: 200 },
    { name: 'Social', value: 100 },
  ];

  const sampleTableData = [
    {
      key: '1',
      user: 'John Doe',
      email: 'john@example.com',
      action: 'Purchase',
      value: '$125.00',
      timestamp: '2025-11-01T10:30:00Z',
    },
    {
      key: '2',
      user: 'Jane Smith',
      email: 'jane@example.com',
      action: 'Sign Up',
      value: '$0.00',
      timestamp: '2025-11-01T10:25:00Z',
    },
    {
      key: '3',
      user: 'Bob Johnson',
      email: 'bob@example.com',
      action: 'Upgrade',
      value: '$49.00',
      timestamp: '2025-11-01T10:20:00Z',
    },
  ];

  const sampleTableColumns = [
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Action', dataIndex: 'action', key: 'action' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
  ];

  const sampleTimelineItems = [
    {
      id: '1',
      title: 'Campaign launched',
      description: 'Marketing campaign #2341 started',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'success' as const,
      icon: 'check',
    },
    {
      id: '2',
      title: 'Workflow completed',
      description: 'SEO analysis finished for 25 pages',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: 'success' as const,
      icon: 'check',
    },
    {
      id: '3',
      title: 'Error detected',
      description: 'Crawling failed for example.com',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      type: 'error' as const,
      icon: 'alert',
    },
  ];

  const handleDashboardGenerated = (dashboard: any) => {
    console.log('Dashboard generated:', dashboard);
    setGeneratedDashboard(dashboard);
    setActiveTab('preview');
  };

  const renderGenerator = () => (
    <DashboardGenerator
      onComplete={handleDashboardGenerated}
      onCancel={() => console.log('Cancelled')}
    />
  );

  const renderWidgetShowcase = () => (
    <div className="p-6 space-y-8">
      <div>
        <Title level={3}>Reusable Dashboard Widgets</Title>
        <Paragraph type="secondary">
          All widgets follow Material Design 3 and are fully schema-driven
        </Paragraph>
      </div>

      <Divider />

      <div>
        <Title level={4}>Stat Card Widgets</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardWidget
            title="Total Users"
            value={2543}
            change={12.5}
            trend="up"
            icon="users"
            format="number"
            comparisonLabel="vs last month"
          />
          <StatCardWidget
            title="Revenue"
            value={45231}
            change={8.2}
            trend="up"
            icon="dollar"
            format="currency"
          />
          <StatCardWidget
            title="Conversion Rate"
            value={3.24}
            change={-2.4}
            trend="down"
            icon="activity"
            format="percentage"
            threshold={3}
          />
          <StatCardWidget
            title="Active Sessions"
            value={573}
            change={23.1}
            trend="up"
            icon="activity"
          />
        </div>
      </div>

      <Divider />

      <div>
        <Title level={4}>Chart Widgets</Title>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartWidget
            title="Traffic & Sales Trend"
            description="Last 7 days performance"
            chartType="line"
            data={sampleChartData}
            dataKeys={{ xAxis: 'name', yAxis: ['visits', 'sales'] }}
            colors={['#6750A4', '#7958A5']}
          />
          <ChartWidget
            title="Traffic Sources"
            description="Distribution by source"
            chartType="donut"
            data={samplePieData}
            dataKeys={{ name: 'name', value: 'value' }}
            colors={['#6750A4', '#7958A5', '#D0BCFF', '#958DA5']}
          />
          <ChartWidget
            title="Weekly Activity"
            description="Visitor trends over time"
            chartType="area"
            data={sampleChartData}
            dataKeys={{ xAxis: 'name', yAxis: 'visits' }}
            colors={['#6750A4']}
          />
          <ChartWidget
            title="Performance Comparison"
            description="Visits vs sales by day"
            chartType="bar"
            data={sampleChartData}
            dataKeys={{ xAxis: 'name', yAxis: ['visits', 'sales'] }}
            colors={['#6750A4', '#7958A5']}
          />
        </div>
      </div>

      <Divider />

      <div>
        <Title level={4}>Table Widget</Title>
        <TableWidget
          title="Recent Conversions"
          description="Latest user actions and purchases"
          columns={sampleTableColumns}
          data={sampleTableData}
          pagination={true}
          pageSize={5}
        />
      </div>

      <Divider />

      <div>
        <Title level={4}>Progress & Timeline Widgets</Title>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProgressWidget
            title="Campaign Progress"
            description="Current campaign completion"
            percent={75}
            status="active"
            strokeColor="#6750A4"
          />
          <TimelineWidget
            title="Recent Activity"
            description="Latest system events"
            items={sampleTimelineItems}
          />
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    if (!generatedDashboard) {
      return (
        <div className="p-6">
          <Alert
            message="No Dashboard Generated"
            description="Use the Generator tab to create a dashboard first"
            type="info"
            showIcon
          />
        </div>
      );
    }

    return (
      <div className="p-6 space-y-4">
        <div>
          <Title level={3}>{generatedDashboard.name}</Title>
          <Paragraph type="secondary">{generatedDashboard.description}</Paragraph>
        </div>

        <Card>
          <pre className="bg-surface p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(generatedDashboard, null, 2)}
          </pre>
        </Card>
      </div>
    );
  };

  const renderDocumentation = () => (
    <div className="p-6 prose max-w-none">
      <Title level={3}>Dashboard Generator Documentation</Title>

      <Alert
        message="Quick Start"
        description={
          <div className="space-y-2">
            <p>1. Run database migration: <code>psql -U postgres -d lightdom -f database/134-dashboard-generator-schema.sql</code></p>
            <p>2. Start Ollama: <code>ollama pull deepseek-r1 && ollama serve</code></p>
            <p>3. Configure environment: <code>VITE_OLLAMA_API_URL=http://localhost:11434</code></p>
            <p>4. Use the Generator tab to create your first dashboard</p>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      <Divider />

      <Title level={4}>Features</Title>
      <ul>
        <li>AI-powered dashboard generation from natural language prompts</li>
        <li>8 pre-configured dashboard types (Analytics, Monitoring, Workflow, CRM, etc.)</li>
        <li>6 reusable widget types (Stat Cards, Charts, Tables, Lists, Progress, Timeline)</li>
        <li>Material Design 3 compliant components</li>
        <li>Schema-driven architecture with database persistence</li>
        <li>Component linking to atoms and design tokens</li>
        <li>n8n workflow integration support</li>
        <li>Real-time preview and configuration</li>
        <li>Training data collection for ML improvement</li>
        <li>Dashboard templates and cloning</li>
        <li>Analytics and usage tracking</li>
      </ul>

      <Divider />

      <Title level={4}>Widget Types</Title>
      <ul>
        <li><strong>Stat Card</strong>: Single metric with trend, icon, and comparison</li>
        <li><strong>Chart</strong>: Line, bar, area, pie, donut charts with multiple data series</li>
        <li><strong>Table</strong>: Sortable, paginated data tables</li>
        <li><strong>List</strong>: Custom-rendered list items with pagination</li>
        <li><strong>Progress</strong>: Progress bars and circular indicators</li>
        <li><strong>Timeline</strong>: Chronological activity feed with icons and types</li>
      </ul>

      <Divider />

      <Title level={4}>Example Prompts</Title>
      <Card className="mb-4">
        <Text strong>Analytics Dashboard:</Text>
        <Paragraph className="mt-2">
          "Create an analytics dashboard showing website traffic by source, conversion funnel, top pages with real-time updates, and revenue trends for the last 30 days"
        </Paragraph>
      </Card>
      <Card className="mb-4">
        <Text strong>Monitoring Dashboard:</Text>
        <Paragraph className="mt-2">
          "Build a system monitoring dashboard tracking API response times, error rates, CPU and memory usage with alert thresholds, and recent error logs"
        </Paragraph>
      </Card>
      <Card>
        <Text strong>Workflow Dashboard:</Text>
        <Paragraph className="mt-2">
          "Design a workflow management dashboard with active campaigns, task kanban board, workflow success rates, execution timeline, and scheduled workflows"
        </Paragraph>
      </Card>

      <Divider />

      <Title level={4}>API Endpoints</Title>
      <ul>
        <li><code>POST /api/dashboards/generate</code> - Generate dashboard from prompt</li>
        <li><code>POST /api/dashboards</code> - Create/save dashboard</li>
        <li><code>GET /api/dashboards</code> - List all dashboards</li>
        <li><code>GET /api/dashboards/:id</code> - Get dashboard by ID</li>
        <li><code>PUT /api/dashboards/:id</code> - Update dashboard</li>
        <li><code>DELETE /api/dashboards/:id</code> - Delete dashboard</li>
        <li><code>POST /api/dashboards/:id/clone</code> - Clone dashboard</li>
        <li><code>GET /api/dashboards/templates/list</code> - Get templates</li>
      </ul>

      <Divider />

      <Title level={4}>Schema Linking</Title>
      <Paragraph>
        Dashboards automatically link to existing components and atoms from the design system.
        Widgets can reference design tokens (colors, spacing, typography) and reuse component schemas
        for consistent styling and behavior across the application.
      </Paragraph>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-container">
      <div className="bg-primary text-on-primary py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <LayoutDashboard className="w-10 h-10" />
            <Title level={1} className="text-on-primary mb-0">
              Dashboard Generator Showcase
            </Title>
          </div>
          <Paragraph className="text-on-primary/80 text-lg mb-0">
            AI-powered dashboard creation with Material Design 3 components
          </Paragraph>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane
            tab={
              <Space>
                <Zap className="w-4 h-4" />
                <span>Generator</span>
              </Space>
            }
            key="generator"
          >
            {renderGenerator()}
          </TabPane>

          <TabPane
            tab={
              <Space>
                <LayoutDashboard className="w-4 h-4" />
                <span>Widgets</span>
              </Space>
            }
            key="widgets"
          >
            {renderWidgetShowcase()}
          </TabPane>

          <TabPane
            tab={
              <Space>
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </Space>
            }
            key="preview"
          >
            {renderPreview()}
          </TabPane>

          <TabPane
            tab={
              <Space>
                <FileJson className="w-4 h-4" />
                <span>Documentation</span>
              </Space>
            }
            key="docs"
          >
            {renderDocumentation()}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Monitoring Dashboard
 * Real-time dashboard for monitoring workflows, AI interactions, and system metrics
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Tag,
  Progress,
  Space,
  Typography,
  Badge,
  Timeline,
  Table,
  Tabs,
} from 'antd';
import {
  DashboardOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { useDataStream } from '../hooks/useDataStream';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { DataStreamChart } from './DataStreamChart';
import { ToolCallHistory } from './ToolCallHistory';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export interface MonitoringDashboardProps {
  workflowId?: string;
  refreshInterval?: number;
  showAIConversations?: boolean;
  showDataStreams?: boolean;
  showAnalytics?: boolean;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  workflowId,
  refreshInterval = 5000,
  showAIConversations = true,
  showDataStreams = true,
  showAnalytics = true,
}) => {
  const { executions, getWorkflowExecutions } = useWorkflowExecution();
  const { streams, metrics } = useDataStream();
  const [stats, setStats] = useState({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    runningExecutions: 0,
    successRate: 0,
  });

  // Refresh data periodically
  useEffect(() => {
    const fetchData = async () => {
      if (workflowId) {
        await getWorkflowExecutions(workflowId);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [workflowId, refreshInterval, getWorkflowExecutions]);

  // Calculate statistics
  useEffect(() => {
    const total = executions.length;
    const successful = executions.filter((e) => e.status === 'completed').length;
    const failed = executions.filter((e) => e.status === 'failed').length;
    const running = executions.filter((e) => e.status === 'running').length;

    setStats({
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      runningExecutions: running,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
    });
  }, [executions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      case 'running':
        return <ClockCircleOutlined spin />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const executionColumns = [
    {
      title: 'Execution ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code>{id.slice(0, 8)}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={status.toUpperCase()} />
      ),
    },
    {
      title: 'Started',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: any, record: any) => {
        if (record.completedAt) {
          const duration =
            new Date(record.completedAt).getTime() - new Date(record.startedAt).getTime();
          return `${(duration / 1000).toFixed(2)}s`;
        }
        return <Tag icon={<ClockCircleOutlined spin />}>Running...</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>
        <DashboardOutlined /> Monitoring Dashboard
      </Title>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Executions"
              value={stats.totalExecutions}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Successful"
              value={stats.successfulExecutions}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Failed"
              value={stats.failedExecutions}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={stats.successRate}
              suffix="%"
              valueStyle={{ color: stats.successRate > 80 ? '#3f8600' : '#cf1322' }}
            />
            <Progress
              percent={stats.successRate}
              size="small"
              showInfo={false}
              strokeColor={stats.successRate > 80 ? '#3f8600' : '#cf1322'}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for different views */}
      <Tabs defaultActiveKey="executions">
        <TabPane tab="Workflow Executions" key="executions">
          <Card>
            <Table
              dataSource={executions}
              columns={executionColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No executions yet' }}
            />
          </Card>
        </TabPane>

        {showDataStreams && (
          <TabPane tab="Data Streams" key="streams">
            <Row gutter={[16, 16]}>
              {streams.map((stream) => (
                <Col xs={24} lg={12} key={stream.id}>
                  <DataStreamChart stream={stream} />
                </Col>
              ))}
              {streams.length === 0 && (
                <Col xs={24}>
                  <Card>
                    <Text type="secondary">No active data streams</Text>
                  </Card>
                </Col>
              )}
            </Row>
          </TabPane>
        )}

        {showAIConversations && (
          <TabPane
            tab={
              <span>
                <RobotOutlined /> AI Tool Calls
              </span>
            }
            key="tools"
          >
            <ToolCallHistory />
          </TabPane>
        )}

        {showAnalytics && (
          <TabPane
            tab={
              <span>
                <LineChartOutlined /> Analytics
              </span>
            }
            key="analytics"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Execution Timeline">
                  <Timeline>
                    {executions.slice(0, 10).map((exec) => (
                      <Timeline.Item
                        key={exec.id}
                        dot={getStatusIcon(exec.status)}
                        color={
                          exec.status === 'completed'
                            ? 'green'
                            : exec.status === 'failed'
                            ? 'red'
                            : 'blue'
                        }
                      >
                        <Space direction="vertical" size="small">
                          <Text strong>{new Date(exec.startedAt).toLocaleString()}</Text>
                          <Tag color={getStatusColor(exec.status)}>{exec.status}</Tag>
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="System Metrics">
                  <List
                    dataSource={[
                      { label: 'Active Streams', value: streams.filter((s) => s.active).length },
                      { label: 'Total Data Points', value: metrics.totalDataPoints || 0 },
                      { label: 'Avg Processing Time', value: `${metrics.avgProcessingTime || 0}ms` },
                      { label: 'Error Rate', value: `${metrics.errorRate || 0}%` },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta title={item.label} description={<Text strong>{item.value}</Text>} />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;

/**
 * Real-time Monitoring Dashboard
 * Exodus wallet-inspired system monitoring interface
 * Live performance metrics and alerts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Statistic,
  Progress,
  Table,
  Button,
  Alert,
  Badge,
  List,
  Avatar,
  Tag,
  Divider,
  Select,
  Switch,
  Tooltip,
  Timeline,
  Drawer,
  Modal,
  message,
} from 'antd';
import {
  MonitorOutlined,
  ServerOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  SecurityScanOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  BellOutlined,
  EyeOutlined,
  ToolOutlined,
  HeatMapOutlined,
  DashboardOutlined,
  GlobalOutlined,
  WalletOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Line, Area, Column, Gauge, Heatmap } from '@ant-design/plots';
import LightDomDesignSystem, {
  LightDomColors,
  LightDomShadows,
  StatsCard,
} from '../../styles/LightDomDesignSystem';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface SystemMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  gpu?: number;
  temperature: number;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  cpu: number;
  memory: number;
  uptime: number;
  lastCheck: string;
  endpoint: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  service: string;
  resolved: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

const MonitoringDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(2000);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedService, setSelectedService] = useState('all');
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics>({
    timestamp: new Date().toISOString(),
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    temperature: 0,
  });

  // Real-time data simulation
  useEffect(() => {
    const generateMetrics = (): SystemMetrics => ({
      timestamp: new Date().toISOString(),
      cpu: Math.random() * 40 + 30,
      memory: Math.random() * 30 + 50,
      disk: Math.random() * 20 + 65,
      network: Math.random() * 60 + 20,
      temperature: Math.random() * 20 + 45,
    });

    const generateServiceStatus = (): ServiceStatus[] => [
      {
        id: '1',
        name: 'API Server',
        status: Math.random() > 0.1 ? 'healthy' : 'warning',
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 40 + 30,
        uptime: Math.random() * 86400 + 3600,
        lastCheck: new Date().toISOString(),
        endpoint: 'http://localhost:3001',
      },
      {
        id: '2',
        name: 'Mining Service',
        status: Math.random() > 0.05 ? 'healthy' : 'critical',
        cpu: Math.random() * 50 + 40,
        memory: Math.random() * 30 + 45,
        uptime: Math.random() * 86400 + 1800,
        lastCheck: new Date().toISOString(),
        endpoint: 'http://localhost:3002',
      },
      {
        id: '3',
        name: 'Database',
        status: Math.random() > 0.02 ? 'healthy' : 'offline',
        cpu: Math.random() * 20 + 15,
        memory: Math.random() * 25 + 35,
        uptime: Math.random() * 86400 + 7200,
        lastCheck: new Date().toISOString(),
        endpoint: 'postgresql://localhost:5432',
      },
      {
        id: '4',
        name: 'Redis Cache',
        status: 'healthy',
        cpu: Math.random() * 15 + 5,
        memory: Math.random() * 20 + 10,
        uptime: Math.random() * 86400 + 14400,
        lastCheck: new Date().toISOString(),
        endpoint: 'redis://localhost:6379',
      },
      {
        id: '5',
        name: 'WebSocket Server',
        status: Math.random() > 0.08 ? 'healthy' : 'warning',
        cpu: Math.random() * 25 + 10,
        memory: Math.random() * 15 + 20,
        uptime: Math.random() * 86400 + 900,
        lastCheck: new Date().toISOString(),
        endpoint: 'ws://localhost:3003',
      },
    ];

    const generateAlerts = (): Alert[] => [
      {
        id: '1',
        type: 'warning',
        severity: 'medium',
        title: 'High CPU Usage',
        message: 'API Server CPU usage exceeded 80%',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        service: 'API Server',
        resolved: false,
      },
      {
        id: '2',
        type: 'error',
        severity: 'high',
        title: 'Database Connection Failed',
        message: 'Unable to connect to primary database',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        service: 'Database',
        resolved: false,
      },
      {
        id: '3',
        type: 'info',
        severity: 'low',
        title: 'Service Restarted',
        message: 'Mining Service restarted successfully',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        service: 'Mining Service',
        resolved: true,
      },
    ];

    const generateLogs = (): LogEntry[] => [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        service: 'API Server',
        message: 'Request processed successfully',
        metadata: { method: 'GET', path: '/api/status', duration: '45ms' },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        level: 'warn',
        service: 'Mining Service',
        message: 'Mining efficiency below optimal',
        metadata: { efficiency: '78%', threshold: '85%' },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'error',
        service: 'Database',
        message: 'Connection timeout',
        metadata: { timeout: '30s', retries: '3' },
      },
    ];

    // Initialize data
    setServices(generateServiceStatus());
    setAlerts(generateAlerts());
    setLogs(generateLogs());

    // Set up real-time updates
    if (autoRefresh) {
      const interval = setInterval(() => {
        const newMetrics = generateMetrics();
        setCurrentMetrics(newMetrics);
        
        setSystemMetrics(prev => {
          const updated = [...prev, newMetrics];
          return updated.slice(-50); // Keep last 50 data points
        });

        // Update services occasionally
        if (Math.random() > 0.7) {
          setServices(generateServiceStatus());
        }

        // Add new logs occasionally
        if (Math.random() > 0.8) {
          setLogs(prev => [generateLogs()[0], ...prev].slice(0, 100));
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Chart configurations
  const systemPerformanceConfig = {
    data: systemMetrics.map(metric => ({
      time: new Date(metric.timestamp).toLocaleTimeString(),
      cpu: metric.cpu,
      memory: metric.memory,
      disk: metric.disk,
      network: metric.network,
    })),
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: [
      LightDomColors.primary[500],
      LightDomColors.accent.orange,
      LightDomColors.accent.purple,
      LightDomColors.accent.green,
    ],
  };

  const gaugeConfig = {
    percent: currentMetrics.cpu / 100,
    range: {
      color: [
        '#30BF78',
        '#FAAD14',
        '#F4664A',
      ],
    },
    indicator: {
      pointer: { style: { stroke: '#D0D0D0' } },
      pin: { style: { stroke: '#D0D0D0' } },
    },
    statistic: {
      content: {
        style: {
          fontSize: '36px',
          lineHeight: '36px',
          color: LightDomColors.dark.text,
        },
        formatter: () => `${currentMetrics.cpu.toFixed(1)}%`,
      },
    },
  };

  // Service table columns
  const serviceColumns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ServiceStatus) => (
        <Space>
          <Avatar
            icon={
              record.status === 'healthy' ? (
                <CheckCircleOutlined />
              ) : record.status === 'warning' ? (
                <ExclamationCircleOutlined />
              ) : record.status === 'critical' ? (
                <CloseCircleOutlined />
              ) : (
                <WarningOutlined />
              )
            }
            style={{
              backgroundColor:
                record.status === 'healthy'
                  ? LightDomColors.status.success
                  : record.status === 'warning'
                  ? LightDomColors.status.warning
                  : record.status === 'critical'
                  ? LightDomColors.status.error
                  : LightDomColors.dark.border,
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: '12px', color: LightDomColors.dark.textSecondary }}>
              {record.endpoint}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={
            status === 'healthy'
              ? 'green'
              : status === 'warning'
              ? 'orange'
              : status === 'critical'
              ? 'red'
              : 'default'
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (value: number) => (
        <Progress
          percent={value}
          size="small"
          strokeColor={
            value > 80
              ? LightDomColors.status.error
              : value > 60
              ? LightDomColors.status.warning
              : LightDomColors.status.success
          }
        />
      ),
    },
    {
      title: 'Memory',
      dataIndex: 'memory',
      key: 'memory',
      render: (value: number) => (
        <Progress
          percent={value}
          size="small"
          strokeColor={
            value > 80
              ? LightDomColors.status.error
              : value > 60
              ? LightDomColors.status.warning
              : LightDomColors.status.success
          }
        />
      ),
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
      render: (value: number) => (
        <Text style={{ fontSize: '12px' }}>
          {Math.floor(value / 3600)}h {Math.floor((value % 3600) / 60)}m
        </Text>
      ),
    },
  ];

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    message.success('Alert resolved');
  };

  const handleServiceAction = (serviceId: string, action: string) => {
    message.success(`${action} action initiated for service ${serviceId}`);
  };

  const getAlertCount = (type?: string) => {
    const filtered = type
      ? alerts.filter(alert => alert.type === type && !alert.resolved)
      : alerts.filter(alert => !alert.resolved);
    return filtered.length;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: LightDomColors.dark.background }}>
      {/* Monitoring Header */}
      <Header
        style={{
          background: LightDomColors.dark.surface,
          borderBottom: `1px solid ${LightDomColors.dark.border}`,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <MonitorOutlined style={{ fontSize: '24px', color: LightDomColors.primary[500] }} />
          <Title level={3} style={{ margin: 0, color: LightDomColors.dark.text }}>
            System Monitoring
          </Title>
          <Badge count={getAlertCount()} style={{ backgroundColor: LightDomColors.status.error }}>
            <AlertOutlined style={{ color: LightDomColors.accent.orange }} />
          </Badge>
        </div>

        <Space>
          <Select
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            style={{ width: 120 }}
          >
            <Option value="5m">5 min</Option>
            <Option value="1h">1 hour</Option>
            <Option value="6h">6 hours</Option>
            <Option value="24h">24 hours</Option>
          </Select>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ color: LightDomColors.dark.textSecondary }}>Auto-refresh</Text>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              size="small"
            />
          </div>

          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => message.info('Export functionality coming soon')}
          >
            Export
          </Button>
          
          <Button
            type="text"
            icon={<FullscreenOutlined />}
            onClick={() => message.info('Fullscreen mode coming soon')}
          >
            Fullscreen
          </Button>
        </Space>
      </Header>

      {/* Main Content */}
      <Content style={{ padding: '24px', overflow: 'auto' }}>
        {/* Critical Alerts */}
        {getAlertCount('error') > 0 && (
          <Alert
            message="Critical Alerts Detected"
            description={`${getAlertCount('error')} critical alerts require immediate attention`}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '24px' }}
            action={
              <Button size="small" danger>
                View All Alerts
              </Button>
            }
          />
        )}

        {/* System Overview */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard
              title="CPU Usage"
              value={`${currentMetrics.cpu.toFixed(1)}%`}
              change={currentMetrics.cpu > 50 ? 5.2 : -2.1}
              icon={<MonitorOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard
              title="Memory Usage"
              value={`${currentMetrics.memory.toFixed(1)}%`}
              change={currentMetrics.memory > 60 ? 8.7 : -3.4}
              icon={<DatabaseOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard
              title="Disk Usage"
              value={`${currentMetrics.disk.toFixed(1)}%`}
              change={2.3}
              icon={<CloudOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard
              title="Network I/O"
              value={`${currentMetrics.network.toFixed(1)}%`}
              change={12.8}
              icon={<GlobalOutlined />}
            />
          </Col>
        </Row>

        {/* Performance Charts */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col span={16}>
            <Card
              title="System Performance"
              style={{
                background: LightDomColors.dark.surface,
                border: `1px solid ${LightDomColors.dark.border}`,
              }}
            >
              <Area {...systemPerformanceConfig} height={300} />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title="Current CPU Load"
              style={{
                background: LightDomColors.dark.surface,
                border: `1px solid ${LightDomColors.dark.border}`,
              }}
            >
              <Gauge {...gaugeConfig} height={250} />
            </Card>
          </Col>
        </Row>

        {/* Services Status */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card
              title="Service Status"
              extra={
                <Space>
                  <Select
                    value={selectedService}
                    onChange={setSelectedService}
                    style={{ width: 150 }}
                  >
                    <Option value="all">All Services</Option>
                    <Option value="api">API Services</Option>
                    <Option value="database">Database</Option>
                    <Option value="cache">Cache</Option>
                  </Select>
                  <Button icon={<SettingOutlined />}>
                    Configure
                  </Button>
                </Space>
              }
              style={{
                background: LightDomColors.dark.surface,
                border: `1px solid ${LightDomColors.dark.border}`,
              }}
            >
              <Table
                columns={serviceColumns}
                dataSource={services}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* Alerts and Logs */}
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card
              title="Recent Alerts"
              extra={
                <Badge count={getAlertCount()}>
                  <Button icon={<BellOutlined />} size="small">
                    View All
                  </Button>
                </Badge>
              }
              style={{
                background: LightDomColors.dark.surface,
                border: `1px solid ${LightDomColors.dark.border}`,
              }}
            >
              <List
                dataSource={alerts.slice(0, 5)}
                renderItem={(alert) => (
                  <List.Item
                    actions={[
                      !alert.resolved && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      ),
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setSelectedAlert(alert);
                          setDetailsVisible(true);
                        }}
                      >
                        Details
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={
                            alert.type === 'error' ? (
                              <CloseCircleOutlined />
                            ) : alert.type === 'warning' ? (
                              <ExclamationCircleOutlined />
                            ) : (
                              <InfoCircleOutlined />
                            )
                          }
                          style={{
                            backgroundColor:
                              alert.type === 'error'
                                ? LightDomColors.status.error
                                : alert.type === 'warning'
                                ? LightDomColors.status.warning
                                : LightDomColors.status.info,
                          }}
                        />
                      }
                      title={
                        <Space>
                          {alert.title}
                          <Tag color={alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'orange' : 'blue'}>
                            {alert.severity.toUpperCase()}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text style={{ fontSize: '12px' }}>{alert.message}</Text>
                          <Text style={{ fontSize: '11px', color: LightDomColors.dark.textSecondary }}>
                            {alert.service} • {new Date(alert.timestamp).toLocaleString()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={12}>
            <Card
              title="System Logs"
              extra={
                <Button icon={<ToolOutlined />} size="small">
                  View Logs
                </Button>
              }
              style={{
                background: LightDomColors.dark.surface,
                border: `1px solid ${LightDomColors.dark.border}`,
              }}
            >
              <Timeline
                mode="left"
                items={logs.slice(0, 5).map((log) => ({
                  color:
                    log.level === 'error'
                      ? LightDomColors.status.error
                      : log.level === 'warn'
                      ? LightDomColors.status.warning
                      : log.level === 'info'
                      ? LightDomColors.status.info
                      : LightDomColors.dark.border,
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text style={{ fontSize: '12px' }}>{log.message}</Text>
                      <Space>
                        <Tag size="small">{log.service}</Tag>
                        <Tag size="small" color={log.level === 'error' ? 'red' : log.level === 'warn' ? 'orange' : 'blue'}>
                          {log.level.toUpperCase()}
                        </Tag>
                        <Text style={{ fontSize: '11px', color: LightDomColors.dark.textSecondary }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </Text>
                      </Space>
                    </Space>
                  ),
                }))}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Alert Details Drawer */}
      <Drawer
        title="Alert Details"
        placement="right"
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        width={500}
      >
        {selectedAlert && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message={selectedAlert.title}
              description={selectedAlert.message}
              type={selectedAlert.type}
              showIcon
            />
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Service:</Text> {selectedAlert.service}
              </div>
              <div>
                <Text strong>Severity:</Text>{' '}
                <Tag color={selectedAlert.severity === 'critical' ? 'red' : selectedAlert.severity === 'high' ? 'orange' : 'blue'}>
                  {selectedAlert.severity.toUpperCase()}
                </Tag>
              </div>
              <div>
                <Text strong>Time:</Text> {new Date(selectedAlert.timestamp).toLocaleString()}
              </div>
              <div>
                <Text strong>Status:</Text>{' '}
                {selectedAlert.resolved ? (
                  <Tag color="green">RESOLVED</Tag>
                ) : (
                  <Tag color="orange">ACTIVE</Tag>
                )}
              </div>
            </Space>
            
            <Divider />
            
            <Space>
              {!selectedAlert.resolved && (
                <Button type="primary" onClick={() => handleResolveAlert(selectedAlert.id)}>
                  Mark as Resolved
                </Button>
              )}
              <Button>View Related Logs</Button>
              <Button>Service Actions</Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </Layout>
  );
};

export default MonitoringDashboard;

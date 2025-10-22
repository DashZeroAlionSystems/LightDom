/**
 * System Monitoring Component
 * Real-time system monitoring dashboard for administrators
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  Tag,
  Alert,
  Table,
  Badge
} from 'antd';
import {
  MonitorOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  requests: number;
  errors: number;
}

const SystemMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 28
  });

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Server',
      status: 'running',
      uptime: '7d 12h 34m',
      requests: 45230,
      errors: 12
    },
    {
      name: 'Database',
      status: 'running',
      uptime: '15d 8h 22m',
      requests: 128490,
      errors: 3
    },
    {
      name: 'Cache Server',
      status: 'running',
      uptime: '7d 12h 34m',
      requests: 89234,
      errors: 0
    },
    {
      name: 'Background Workers',
      status: 'running',
      uptime: '7d 12h 34m',
      requests: 23456,
      errors: 45
    },
    {
      name: 'Email Service',
      status: 'running',
      uptime: '7d 12h 34m',
      requests: 1234,
      errors: 2
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 20) + 50,
        disk: Math.floor(Math.random() * 10) + 35,
        network: Math.floor(Math.random() * 40) + 20
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getProgressColor = (value: number) => {
    if (value < 50) return '#52c41a';
    if (value < 75) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ServiceStatus) => (
        <Space>
          <Badge status={getStatusColor(record.status) as any} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime'
    },
    {
      title: 'Requests',
      dataIndex: 'requests',
      key: 'requests',
      render: (value: number) => value.toLocaleString()
    },
    {
      title: 'Errors',
      dataIndex: 'errors',
      key: 'errors',
      render: (value: number) => (
        <Tag color={value > 10 ? 'red' : value > 0 ? 'orange' : 'green'}>
          {value}
        </Tag>
      )
    }
  ];

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>
          <MonitorOutlined /> System Monitoring
        </Title>

        <Alert
          message="System Status: All Services Operational"
          description="All critical services are running normally. System health is excellent."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: '24px' }}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="CPU Usage"
                value={metrics.cpu}
                suffix="%"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: getProgressColor(metrics.cpu) }}
              />
              <Progress
                percent={metrics.cpu}
                strokeColor={getProgressColor(metrics.cpu)}
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {metrics.cpu < 50 ? 'Normal' : metrics.cpu < 75 ? 'Moderate' : 'High'} load
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Memory Usage"
                value={metrics.memory}
                suffix="%"
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: getProgressColor(metrics.memory) }}
              />
              <Progress
                percent={metrics.memory}
                strokeColor={getProgressColor(metrics.memory)}
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {metrics.memory < 50 ? 'Normal' : metrics.memory < 75 ? 'Moderate' : 'High'} usage
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Disk Usage"
                value={metrics.disk}
                suffix="%"
                prefix={<CloudServerOutlined />}
                valueStyle={{ color: getProgressColor(metrics.disk) }}
              />
              <Progress
                percent={metrics.disk}
                strokeColor={getProgressColor(metrics.disk)}
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {metrics.disk < 50 ? 'Normal' : metrics.disk < 75 ? 'Moderate' : 'High'} usage
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Network Usage"
                value={metrics.network}
                suffix="%"
                prefix={<ApiOutlined />}
                valueStyle={{ color: getProgressColor(metrics.network) }}
              />
              <Progress
                percent={metrics.network}
                strokeColor={getProgressColor(metrics.network)}
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {metrics.network < 50 ? 'Normal' : metrics.network < 75 ? 'Moderate' : 'High'} traffic
              </Text>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card>
        <Title level={4} style={{ marginBottom: '16px' }}>
          Service Status
        </Title>
        <Table
          columns={columns}
          dataSource={services}
          rowKey="name"
          pagination={false}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Total API Requests (24h)"
              value={287647}
              prefix={<ApiOutlined />}
              suffix={
                <span style={{ fontSize: '14px' }}>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} /> 12.5%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Error Rate (24h)"
              value={0.08}
              precision={2}
              suffix="%"
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemMonitoring;

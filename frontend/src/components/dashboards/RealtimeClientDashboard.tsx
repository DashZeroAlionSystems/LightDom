import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Row, Col, Statistic, Input, Modal, Select, message, Tabs } from 'antd';
import { ReloadOutlined, SendOutlined, UserOutlined, GlobalOutlined, ThunderboltOutlined, DashboardOutlined } from '@ant-design/icons';
import { realtimeClientAPI } from '../../services/apiService';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const RealtimeClientDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [commandModalVisible, setCommandModalVisible] = useState(false);
  const [broadcastModalVisible, setBroadcastModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [commandData, setCommandData] = useState({ command: '', data: '' });
  const [broadcastData, setBroadcastData] = useState({ event: '', data: '' });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, clientsRes, sitesRes] = await Promise.all([
        realtimeClientAPI.getStatus(),
        realtimeClientAPI.getClients(),
        realtimeClientAPI.getSites()
      ]);

      if (statusRes.success) setStatus(statusRes);
      if (clientsRes.success) setClients(clientsRes.clients || []);
      if (sitesRes.success) setSites(sitesRes.sites || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCommand = async () => {
    if (!selectedClient || !commandData.command) {
      message.warning('Please select a client and enter a command');
      return;
    }

    try {
      let parsedData = {};
      if (commandData.data) {
        parsedData = JSON.parse(commandData.data);
      }

      const result = await realtimeClientAPI.sendCommand(
        selectedClient.id,
        commandData.command,
        parsedData
      );

      if (result.success) {
        message.success('Command sent successfully');
        setCommandModalVisible(false);
        setCommandData({ command: '', data: '' });
        setSelectedClient(null);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to send command');
    }
  };

  const handleBroadcast = async () => {
    if (!selectedSite || !broadcastData.event) {
      message.warning('Please select a site and enter an event');
      return;
    }

    try {
      let parsedData = {};
      if (broadcastData.data) {
        parsedData = JSON.parse(broadcastData.data);
      }

      const result = await realtimeClientAPI.broadcast(
        selectedSite,
        broadcastData.event,
        parsedData
      );

      if (result.success) {
        message.success('Broadcast sent successfully');
        setBroadcastModalVisible(false);
        setBroadcastData({ event: '', data: '' });
        setSelectedSite('');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to broadcast');
    }
  };

  const clientColumns = [
    {
      title: 'Client ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Site ID',
      dataIndex: 'siteId',
      key: 'siteId',
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      key: 'userAgent',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Connected',
      dataIndex: 'connectedAt',
      key: 'connectedAt',
      render: (time: string) => new Date(time).toLocaleTimeString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'connected' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<SendOutlined />}
          onClick={() => {
            setSelectedClient(record);
            setCommandModalVisible(true);
          }}
        >
          Send Command
        </Button>
      ),
    },
  ];

  const siteColumns = [
    {
      title: 'Site ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: 'Connected Clients',
      dataIndex: 'connectedClients',
      key: 'connectedClients',
      render: (count: number) => (
        <Tag color="blue">{count || 0}</Tag>
      ),
    },
    {
      title: 'Total Messages',
      dataIndex: 'totalMessages',
      key: 'totalMessages',
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      render: (time: string) => time ? new Date(time).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<ThunderboltOutlined />}
          onClick={() => {
            setSelectedSite(record.id);
            setBroadcastModalVisible(true);
          }}
        >
          Broadcast
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            Real-Time Client Management
          </h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Monitor and manage real-time WebSocket connections
          </p>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Service Status"
              value={status?.status || 'Unknown'}
              valueStyle={{ color: status?.status === 'running' ? '#3f8600' : '#cf1322' }}
              prefix={<DashboardOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Connected Clients"
              value={status?.statistics?.connectedClients || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Sites"
              value={sites.length}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Messages"
              value={status?.statistics?.totalMessages || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Real-Time Management"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        <Tabs defaultActiveKey="clients">
          <TabPane tab="Connected Clients" key="clients">
            <Table
              columns={clientColumns}
              dataSource={clients}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Monitored Sites" key="sites">
            <Table
              columns={siteColumns}
              dataSource={sites}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Statistics" key="statistics">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Connection Statistics">
                  <Statistic
                    title="Total Connections"
                    value={status?.statistics?.totalConnections || 0}
                    style={{ marginBottom: '16px' }}
                  />
                  <Statistic
                    title="Active Connections"
                    value={status?.statistics?.connectedClients || 0}
                    style={{ marginBottom: '16px' }}
                  />
                  <Statistic
                    title="Disconnected"
                    value={(status?.statistics?.totalConnections || 0) - (status?.statistics?.connectedClients || 0)}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Message Statistics">
                  <Statistic
                    title="Total Messages"
                    value={status?.statistics?.totalMessages || 0}
                    style={{ marginBottom: '16px' }}
                  />
                  <Statistic
                    title="Messages per Client"
                    value={
                      status?.statistics?.connectedClients > 0
                        ? Math.round((status?.statistics?.totalMessages || 0) / status?.statistics?.connectedClients)
                        : 0
                    }
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Send Command Modal */}
      <Modal
        title="Send Command to Client"
        open={commandModalVisible}
        onOk={handleSendCommand}
        onCancel={() => {
          setCommandModalVisible(false);
          setSelectedClient(null);
          setCommandData({ command: '', data: '' });
        }}
        okText="Send"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Client ID:</label>
            <Input value={selectedClient?.id || ''} disabled />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Command:</label>
            <Select
              style={{ width: '100%' }}
              value={commandData.command}
              onChange={(value) => setCommandData({ ...commandData, command: value })}
              placeholder="Select command"
            >
              <Option value="reload">Reload Page</Option>
              <Option value="navigate">Navigate</Option>
              <Option value="update">Update Content</Option>
              <Option value="track">Track Event</Option>
              <Option value="custom">Custom Command</Option>
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Data (JSON):</label>
            <TextArea
              rows={6}
              value={commandData.data}
              onChange={(e) => setCommandData({ ...commandData, data: e.target.value })}
              placeholder='{"key": "value"}'
            />
            <small style={{ color: '#666' }}>Optional: JSON data to send with command</small>
          </div>
        </Space>
      </Modal>

      {/* Broadcast Modal */}
      <Modal
        title="Broadcast to Site"
        open={broadcastModalVisible}
        onOk={handleBroadcast}
        onCancel={() => {
          setBroadcastModalVisible(false);
          setSelectedSite('');
          setBroadcastData({ event: '', data: '' });
        }}
        okText="Broadcast"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Site ID:</label>
            <Input value={selectedSite} disabled />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Event:</label>
            <Select
              style={{ width: '100%' }}
              value={broadcastData.event}
              onChange={(value) => setBroadcastData({ ...broadcastData, event: value })}
              placeholder="Select event"
            >
              <Option value="notification">Notification</Option>
              <Option value="update">Update</Option>
              <Option value="alert">Alert</Option>
              <Option value="refresh">Refresh</Option>
              <Option value="custom">Custom Event</Option>
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Data (JSON):</label>
            <TextArea
              rows={6}
              value={broadcastData.data}
              onChange={(e) => setBroadcastData({ ...broadcastData, data: e.target.value })}
              placeholder='{"message": "Hello all clients!"}'
            />
            <small style={{ color: '#666' }}>Optional: JSON data to broadcast</small>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default RealtimeClientDashboard;

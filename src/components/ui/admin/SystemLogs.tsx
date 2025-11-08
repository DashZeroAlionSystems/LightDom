/**
 * System Logs Component
 * View and filter system logs for debugging and monitoring
 */

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { Card as DSCard } from '../../../utils/AdvancedReusableComponents';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  details?: string;
  user?: string;
  ip?: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      level: 'info',
      service: 'API Server',
      message: 'User authentication successful',
      user: 'john@example.com',
      ip: '192.168.1.1',
      details: 'User logged in successfully using OAuth2',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      level: 'warning',
      service: 'Database',
      message: 'Slow query detected',
      details: 'Query execution took 3.5s, which is above the threshold of 2s',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      level: 'error',
      service: 'Background Worker',
      message: 'Failed to process job',
      details: 'Job ID: 12345, Error: Connection timeout',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      level: 'info',
      service: 'Cache Server',
      message: 'Cache cleared successfully',
      user: 'admin@example.com',
      details: 'Manual cache clear operation completed',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      level: 'debug',
      service: 'API Server',
      message: 'Request processed',
      details: 'GET /api/users - 200 OK - 45ms',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      level: 'error',
      service: 'Email Service',
      message: 'Failed to send email',
      details: 'SMTP connection error: Connection refused',
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      level: 'warning',
      service: 'API Server',
      message: 'Rate limit approaching',
      user: 'user@example.com',
      ip: '10.0.0.5',
      details: 'User has made 95 requests in the last minute (limit: 100)',
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      level: 'info',
      service: 'Database',
      message: 'Backup completed successfully',
      details: 'Database backup created: backup_2024_10_22.sql.gz',
    },
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'blue';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      case 'debug':
        return 'green';
      default:
        return 'default';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <InfoCircleOutlined />;
      case 'warning':
        return <WarningOutlined />;
      case 'error':
        return <CloseCircleOutlined />;
      case 'debug':
        return <CheckCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setDetailsModalVisible(true);
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Service', 'Message', 'User', 'IP', 'Details'].join(','),
      ...filteredLogs.map(log =>
        [
          log.timestamp.toISOString(),
          log.level,
          log.service,
          `"${log.message}"`,
          log.user || '',
          log.ip || '',
          `"${log.details || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: Date) => <Text style={{ fontSize: '12px' }}>{date.toLocaleString()}</Text>,
      width: 180,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag icon={getLevelIcon(level)} color={getLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
      width: 150,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user?: string) => user || '-',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LogEntry) => (
        <Tooltip title='View Details'>
          <Button
            type='text'
            icon={<EyeOutlined />}
            size='small'
            onClick={() => handleViewDetails(record)}
          />
        </Tooltip>
      ),
      width: 80,
    },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchText.toLowerCase()) ||
      log.service.toLowerCase().includes(searchText.toLowerCase()) ||
      (log.user && log.user.toLowerCase().includes(searchText.toLowerCase()));
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesService = selectedService === 'all' || log.service === selectedService;
    return matchesSearch && matchesLevel && matchesService;
  });

  const services = Array.from(new Set(logs.map(log => log.service)));

  return (
    <div>
      <DSCard.Root>
        <DSCard.Body>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              <HistoryOutlined /> System Logs
            </Title>
            <Button icon={<DownloadOutlined />} onClick={handleExportLogs}>
              Export Logs
            </Button>
          </div>

          <Space style={{ marginBottom: '16px', width: '100%' }} direction='vertical'>
            <Space wrap>
              <Search
                placeholder='Search logs...'
                allowClear
                style={{ width: 300 }}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                style={{ width: 150 }}
                placeholder='Filter by level'
                value={selectedLevel}
                onChange={setSelectedLevel}
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option value='all'>All Levels</Select.Option>
                <Select.Option value='info'>Info</Select.Option>
                <Select.Option value='warning'>Warning</Select.Option>
                <Select.Option value='error'>Error</Select.Option>
                <Select.Option value='debug'>Debug</Select.Option>
              </Select>
              <Select
                style={{ width: 180 }}
                placeholder='Filter by service'
                value={selectedService}
                onChange={setSelectedService}
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option value='all'>All Services</Select.Option>
                {services.map(service => (
                  <Select.Option key={service} value={service}>
                    {service}
                  </Select.Option>
                ))}
              </Select>
              <RangePicker style={{ width: 300 }} />
            </Space>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey='id'
            size='small'
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: total => `Total ${total} logs`,
            }}
          />
        </DSCard.Body>
      </DSCard.Root>

      <Modal
        title='Log Details'
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedLog && (
          <Space direction='vertical' style={{ width: '100%' }}>
            <div>
              <Text strong>Timestamp:</Text>
              <br />
              <Text>{selectedLog.timestamp.toLocaleString()}</Text>
            </div>
            <div>
              <Text strong>Level:</Text>
              <br />
              <Tag icon={getLevelIcon(selectedLog.level)} color={getLevelColor(selectedLog.level)}>
                {selectedLog.level.toUpperCase()}
              </Tag>
            </div>
            <div>
              <Text strong>Service:</Text>
              <br />
              <Text>{selectedLog.service}</Text>
            </div>
            <div>
              <Text strong>Message:</Text>
              <br />
              <Text>{selectedLog.message}</Text>
            </div>
            {selectedLog.user && (
              <div>
                <Text strong>User:</Text>
                <br />
                <Text>{selectedLog.user}</Text>
              </div>
            )}
            {selectedLog.ip && (
              <div>
                <Text strong>IP Address:</Text>
                <br />
                <Text code>{selectedLog.ip}</Text>
              </div>
            )}
            {selectedLog.details && (
              <div>
                <Text strong>Details:</Text>
                <br />
                <Paragraph
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '4px',
                    marginTop: '8px',
                  }}
                  copyable
                >
                  {selectedLog.details}
                </Paragraph>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default SystemLogs;

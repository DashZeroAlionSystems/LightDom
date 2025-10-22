import React, { useState, useEffect } from 'react';
import {
  Card,
  Timeline,
  Typography,
  Tag,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Spin,
  Empty
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface HistoryItem {
  id: string;
  timestamp: string;
  type: 'optimization' | 'login' | 'payment' | 'settings' | 'error';
  title: string;
  description: string;
  status: 'success' | 'pending' | 'failed' | 'info';
  metadata?: Record<string, any>;
}

const HistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, filterType, searchQuery]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockHistory: HistoryItem[] = [
        {
          id: '1',
          timestamp: '2025-10-22T14:30:00Z',
          type: 'optimization',
          title: 'Website Optimization Completed',
          description: 'Successfully optimized example.com - Saved 125KB, Load time reduced by 32%',
          status: 'success',
          metadata: { website: 'example.com', spaceSaved: 125000, improvement: 32 }
        },
        {
          id: '2',
          timestamp: '2025-10-22T10:15:00Z',
          type: 'login',
          title: 'User Login',
          description: 'Logged in from Chrome on Windows',
          status: 'info',
          metadata: { browser: 'Chrome', os: 'Windows' }
        },
        {
          id: '3',
          timestamp: '2025-10-21T16:45:00Z',
          type: 'payment',
          title: 'Subscription Renewed',
          description: 'Pro plan subscription renewed for $29/month',
          status: 'success',
          metadata: { plan: 'Pro', amount: 29 }
        },
        {
          id: '4',
          timestamp: '2025-10-21T12:20:00Z',
          type: 'optimization',
          title: 'Optimization Started',
          description: 'Starting optimization for blog.example.com',
          status: 'pending',
          metadata: { website: 'blog.example.com' }
        },
        {
          id: '5',
          timestamp: '2025-10-20T09:30:00Z',
          type: 'settings',
          title: 'Settings Updated',
          description: 'Updated notification preferences and email settings',
          status: 'success',
          metadata: { changes: ['notifications', 'email'] }
        },
        {
          id: '6',
          timestamp: '2025-10-19T18:55:00Z',
          type: 'error',
          title: 'Optimization Failed',
          description: 'Failed to optimize store.example.com - Connection timeout',
          status: 'failed',
          metadata: { website: 'store.example.com', error: 'Connection timeout' }
        }
      ];
      
      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = history;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredHistory(filtered);
  };

  const getIcon = (type: string, status: string) => {
    if (status === 'success') return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (status === 'failed') return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    if (status === 'pending') return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    if (status === 'info') return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    return <WarningOutlined style={{ color: '#faad14' }} />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'blue';
      case 'login': return 'green';
      case 'payment': return 'purple';
      case 'settings': return 'orange';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '1rem' }}>
          <Text type="secondary">Loading history...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Activity History</Title>
        <Button icon={<DownloadOutlined />} onClick={exportHistory}>
          Export History
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Space style={{ width: '100%', marginBottom: '16px' }} wrap>
          <Search
            placeholder="Search history..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'optimization', label: 'Optimizations' },
              { value: 'login', label: 'Logins' },
              { value: 'payment', label: 'Payments' },
              { value: 'settings', label: 'Settings' },
              { value: 'error', label: 'Errors' }
            ]}
          />
          
          <RangePicker />
        </Space>

        {filteredHistory.length === 0 ? (
          <Empty description="No history found" />
        ) : (
          <Timeline mode="left">
            {filteredHistory.map(item => (
              <Timeline.Item
                key={item.id}
                dot={getIcon(item.type, item.status)}
                label={new Date(item.timestamp).toLocaleString()}
              >
                <Card size="small" hoverable>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <Space>
                        <Text strong>{item.title}</Text>
                        <Tag color={getTypeColor(item.type)}>{item.type.toUpperCase()}</Tag>
                      </Space>
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary">{item.description}</Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Card>
    </div>
  );
};

export default HistoryPage;

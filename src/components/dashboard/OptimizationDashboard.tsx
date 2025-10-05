import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Progress,
  Modal,
  Form,
  message,
  Space,
  Typography,
  Tabs,
  List,
  Avatar,
  Tooltip,
  Badge,
  Alert,
  Spin,
  Empty,
  Statistic,
  Timeline
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  SettingOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  OptimizationOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useOptimization } from '../../hooks/useOptimization';
import { useWebsites } from '../../hooks/useWebsites';
import { useAuth } from '../../hooks/useAuth';
import './OptimizationDashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface OptimizationDashboardProps {
  className?: string;
}

const OptimizationDashboard: React.FC<OptimizationDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const { 
    optimizations, 
    createOptimization, 
    updateOptimization, 
    deleteOptimization,
    runOptimization,
    loading: optimizationLoading 
  } = useOptimization();
  const { websites, loading: websitesLoading } = useWebsites();
  
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState(null);
  const [form] = Form.useForm();

  // Table columns
  const columns = [
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (website: string, record: any) => (
        <div className="website-cell">
          <Avatar icon={<GlobalOutlined />} size="small" />
          <div className="website-info">
            <Text strong>{website}</Text>
            <br />
            <Text type="secondary" className="website-url">{record.url}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: any) => (
        <div className="progress-cell">
          <Progress
            percent={progress}
            size="small"
            strokeColor={getProgressColor(progress)}
            status={record.status === 'failed' ? 'exception' : 'normal'}
          />
          <Text type="secondary" className="progress-text">
            {progress}%
          </Text>
        </div>
      ),
    },
    {
      title: 'Score Improvement',
      dataIndex: 'scoreImprovement',
      key: 'scoreImprovement',
      render: (improvement: number) => (
        <div className="score-improvement">
          <Text 
            strong 
            style={{ color: improvement > 0 ? '#52c41a' : '#f5222d' }}
          >
            {improvement > 0 ? '+' : ''}{improvement}%
          </Text>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text type="secondary">{formatDate(date)}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Run Optimization">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRunOptimization(record)}
              disabled={record.status === 'running'}
            />
          </Tooltip>
          <Tooltip title="Download Report">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadReport(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteOptimization(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      'Image Optimization': 'blue',
      'CSS Optimization': 'green',
      'JavaScript Optimization': 'orange',
      'HTML Optimization': 'red',
      'Performance': 'purple',
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'default',
      'running': 'processing',
      'completed': 'success',
      'failed': 'error',
      'paused': 'warning',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': <ClockCircleOutlined />,
      'running': <PlayCircleOutlined />,
      'completed': <CheckCircleOutlined />,
      'failed': <ExclamationCircleOutlined />,
      'paused': <PauseCircleOutlined />,
    };
    return icons[status];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 50) return '#faad14';
    return '#1890ff';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleViewDetails = (optimization: any) => {
    setSelectedOptimization(optimization);
    setIsModalVisible(true);
  };

  const handleRunOptimization = async (optimization: any) => {
    try {
      await runOptimization(optimization.id);
      message.success('Optimization started successfully');
    } catch (error) {
      message.error('Failed to start optimization');
    }
  };

  const handleDownloadReport = (optimization: any) => {
    // Implement download functionality
    message.info('Download started...');
  };

  const handleDeleteOptimization = async (optimization: any) => {
    Modal.confirm({
      title: 'Delete Optimization',
      content: 'Are you sure you want to delete this optimization?',
      onOk: async () => {
        try {
          await deleteOptimization(optimization.id);
          message.success('Optimization deleted successfully');
        } catch (error) {
          message.error('Failed to delete optimization');
        }
      },
    });
  };

  const handleCreateOptimization = () => {
    form.resetFields();
    setSelectedOptimization(null);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (selectedOptimization) {
        await updateOptimization(selectedOptimization.id, values);
        message.success('Optimization updated successfully');
      } else {
        await createOptimization(values);
        message.success('Optimization created successfully');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to save optimization');
    }
  };

  const filteredOptimizations = optimizations?.filter(opt => {
    const matchesSearch = opt.website.toLowerCase().includes(searchText.toLowerCase()) ||
                         opt.type.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || opt.status === statusFilter;
    const matchesType = typeFilter === 'all' || opt.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const stats = {
    total: optimizations?.length || 0,
    completed: optimizations?.filter(opt => opt.status === 'completed').length || 0,
    running: optimizations?.filter(opt => opt.status === 'running').length || 0,
    failed: optimizations?.filter(opt => opt.status === 'failed').length || 0,
  };

  if (optimizationLoading || websitesLoading) {
    return (
      <div className="optimization-dashboard-loading">
        <Spin size="large" />
        <Text>Loading optimization data...</Text>
      </div>
    );
  }

  return (
    <div className={`optimization-dashboard ${className || ''}`}>
      {/* Header */}
      <Card className="dashboard-header" bordered={false}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2}>DOM Optimization</Title>
            <Paragraph type="secondary">
              Manage and monitor your website optimizations
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOptimization}>
                New Optimization
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Optimizations"
              value={stats.total}
              prefix={<OptimizationOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Running"
              value={stats.running}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Failed"
              value={stats.failed}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filters-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search optimizations..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="running">Running</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
              <Option value="paused">Paused</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Types</Option>
              <Option value="Image Optimization">Image Optimization</Option>
              <Option value="CSS Optimization">CSS Optimization</Option>
              <Option value="JavaScript Optimization">JavaScript Optimization</Option>
              <Option value="HTML Optimization">HTML Optimization</Option>
              <Option value="Performance">Performance</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button icon={<FilterOutlined />}>
              More Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Optimizations Table */}
      <Card className="optimizations-table-card">
        <Table
          columns={columns}
          dataSource={filteredOptimizations}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} optimizations`,
          }}
          loading={optimizationLoading}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedOptimization ? 'Edit Optimization' : 'Create New Optimization'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="website"
            label="Website"
            rules={[{ required: true, message: 'Please select a website' }]}
          >
            <Select placeholder="Select website">
              {websites?.map(website => (
                <Option key={website.id} value={website.domain}>
                  {website.domain}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Optimization Type"
            rules={[{ required: true, message: 'Please select optimization type' }]}
          >
            <Select placeholder="Select optimization type">
              <Option value="Image Optimization">Image Optimization</Option>
              <Option value="CSS Optimization">CSS Optimization</Option>
              <Option value="JavaScript Optimization">JavaScript Optimization</Option>
              <Option value="HTML Optimization">HTML Optimization</Option>
              <Option value="Performance">Performance</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Priority"
            initialValue="medium"
          >
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OptimizationDashboard;

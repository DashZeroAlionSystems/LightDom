/**
 * Workflow List Panel Component
 * Beautiful, functional panel for managing workflows with action buttons
 */

import React, { useState } from 'react';
import {
  Card,
  List,
  Button,
  Space,
  Tag,
  Tooltip,
  Dropdown,
  Input,
  Select,
  Empty,
  Avatar,
  Badge,
  Modal,
  message,
  Popconfirm,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Search } = Input;
const { Option } = Select;

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  type: string;
  category: string;
  lastRun?: string;
  nextRun?: string;
  runs: number;
  successRate: number;
  createdAt: string;
  author: string;
}

interface WorkflowListPanelProps {
  workflows: Workflow[];
  loading?: boolean;
  onRun: (id: string) => void;
  onPause: (id: string) => void;
  onClone: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onCreate?: () => void;
}

export const WorkflowListPanel: React.FC<WorkflowListPanelProps> = ({
  workflows,
  loading = false,
  onRun,
  onPause,
  onClone,
  onEdit,
  onDelete,
  onView,
  onCreate,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      idle: 'default',
      running: 'processing',
      completed: 'success',
      failed: 'error',
      paused: 'warning',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      idle: <ClockCircleOutlined />,
      running: <SyncOutlined spin />,
      completed: <CheckCircleOutlined />,
      failed: <ExclamationCircleOutlined />,
      paused: <PauseCircleOutlined />,
    };
    return icons[status];
  };

  const getActionMenu = (workflow: Workflow): MenuProps['items'] => [
    {
      key: 'run',
      icon: <PlayCircleOutlined />,
      label: 'Run Now',
      onClick: () => onRun(workflow.id),
      disabled: workflow.status === 'running',
    },
    {
      key: 'pause',
      icon: <PauseCircleOutlined />,
      label: 'Pause',
      onClick: () => onPause(workflow.id),
      disabled: workflow.status !== 'running',
    },
    {
      type: 'divider',
    },
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => onView(workflow.id),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => onEdit(workflow.id),
    },
    {
      key: 'clone',
      icon: <CopyOutlined />,
      label: 'Clone',
      onClick: () => {
        onClone(workflow.id);
        message.success(`Workflow "${workflow.name}" cloned`);
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => message.info('Settings panel would open'),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Delete Workflow',
          content: `Are you sure you want to delete "${workflow.name}"?`,
          okText: 'Delete',
          okType: 'danger',
          onOk: () => onDelete(workflow.id),
        });
      },
    },
  ];

  // Filter workflows
  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          w.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || w.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(workflows.map(w => w.category)));

  const renderListItem = (workflow: Workflow) => (
    <List.Item
      key={workflow.id}
      actions={[
        <Tooltip title="Run Workflow">
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            size="small"
            onClick={() => onRun(workflow.id)}
            disabled={workflow.status === 'running'}
          />
        </Tooltip>,
        <Tooltip title="View Details">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onView(workflow.id)}
          />
        </Tooltip>,
        <Tooltip title="Edit">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(workflow.id)}
          />
        </Tooltip>,
        <Tooltip title="Clone">
          <Button
            icon={<CopyOutlined />}
            size="small"
            onClick={() => onClone(workflow.id)}
          />
        </Tooltip>,
        <Dropdown menu={{ items: getActionMenu(workflow) }} trigger={['click']}>
          <Button icon={<MoreOutlined />} size="small" />
        </Dropdown>,
      ]}
    >
      <List.Item.Meta
        avatar={
          <Badge count={workflow.runs} showZero>
            <Avatar
              style={{
                backgroundColor:
                  workflow.status === 'completed' ? '#52c41a' :
                  workflow.status === 'running' ? '#1890ff' :
                  workflow.status === 'failed' ? '#ff4d4f' : '#8c8c8c',
              }}
              icon={getStatusIcon(workflow.status)}
            />
          </Badge>
        }
        title={
          <Space>
            <strong>{workflow.name}</strong>
            <Tag color={getStatusColor(workflow.status)}>{workflow.status}</Tag>
            <Tag>{workflow.category}</Tag>
          </Space>
        }
        description={
          <div>
            <p style={{ margin: '4px 0' }}>{workflow.description}</p>
            <Space size="small" style={{ fontSize: '12px', color: '#8c8c8c' }}>
              <span>
                <ThunderboltOutlined /> Success Rate: {workflow.successRate}%
              </span>
              {workflow.lastRun && (
                <span>
                  <ClockCircleOutlined /> Last run: {new Date(workflow.lastRun).toLocaleString()}
                </span>
              )}
              <span>Author: {workflow.author}</span>
            </Space>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <Card
      title={
        <Space>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Workflows</span>
          <Badge count={filteredWorkflows.length} showZero style={{ backgroundColor: '#52c41a' }} />
        </Space>
      }
      extra={
        onCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
          >
            Create Workflow
          </Button>
        )
      }
    >
      {/* Filters */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Space style={{ width: '100%' }}>
          <Search
            placeholder="Search workflows..."
            allowClear
            enterButton={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Status</Option>
            <Option value="idle">Idle</Option>
            <Option value="running">Running</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
            <Option value="paused">Paused</Option>
          </Select>
          <Select
            placeholder="Filter by category"
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Categories</Option>
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Space>
      </Space>

      {/* List */}
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={filteredWorkflows}
        locale={{
          emptyText: (
            <Empty
              description={
                searchText || filterStatus !== 'all' || filterCategory !== 'all'
                  ? 'No workflows match your filters'
                  : 'No workflows yet. Create your first workflow!'
              }
            >
              {onCreate && (
                <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                  Create Workflow
                </Button>
              )}
            </Empty>
          ),
        }}
        renderItem={renderListItem}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} workflows`,
        }}
      />
    </Card>
  );
};

export default WorkflowListPanel;

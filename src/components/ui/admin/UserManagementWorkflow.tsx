/**
 * User Management Workflow Component
 * Comprehensive workflow for complete user lifecycle management
 * Auto-generates memories and workflows for user operations
 */

import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  RobotOutlined,
  SafetyOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import { Card as DSCard } from '../../../utils/AdvancedReusableComponents';
import './AdminStyles.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

// Workflow Memory System
interface WorkflowMemory {
  id: string;
  type: 'user_creation' | 'user_update' | 'user_deletion' | 'bulk_operation' | 'permission_change';
  timestamp: Date;
  userId?: string;
  action: string;
  details: any;
  status: 'success' | 'error' | 'pending';
  workflowId: string;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'wait' | 'process' | 'finish' | 'error';
  data?: any;
}

interface UserWorkflow {
  id: string;
  type: 'create_user' | 'edit_user' | 'delete_user' | 'bulk_manage' | 'permission_workflow';
  steps: WorkflowStep[];
  currentStep: number;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  userData?: any;
  memories: WorkflowMemory[];
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: Date;
  };
  stats?: {
    optimizations: number;
    storage: number;
    apiCalls: number;
  };
  permissions?: string[];
  location?: string;
  verified?: boolean;
  workflowHistory?: UserWorkflow[];
}

const UserManagementWorkflow: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<UserWorkflow | null>(null);
  const [workflowMemories, setWorkflowMemories] = useState<WorkflowMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isWorkflowModalVisible, setIsWorkflowModalVisible] = useState(false);
  const [isUserDetailsVisible, setIsUserDetailsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [createUserForm] = Form.useForm();
  const [editUserForm] = Form.useForm();
  const [bulkActionForm] = Form.useForm();

  // Initialize with sample data
  useEffect(() => {
    const sampleUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date(),
        avatar: '',
        subscription: { plan: 'Enterprise', status: 'active', expiresAt: new Date('2025-01-01') },
        stats: { optimizations: 1250, storage: 15.5, apiCalls: 45000 },
        permissions: ['read', 'write', 'delete', 'admin'],
        location: 'New York, USA',
        verified: true,
        workflowHistory: [],
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-02-15'),
        lastLogin: new Date(),
        avatar: '',
        subscription: { plan: 'Pro', status: 'active', expiresAt: new Date('2024-12-15') },
        stats: { optimizations: 456, storage: 5.2, apiCalls: 12000 },
        permissions: ['read', 'write'],
        location: 'London, UK',
        verified: true,
        workflowHistory: [],
      },
    ];
    setUsers(sampleUsers);
  }, []);

  // Workflow Memory Management
  const createWorkflowMemory = useCallback(
    (
      type: WorkflowMemory['type'],
      action: string,
      details: any,
      userId?: string,
      status: WorkflowMemory['status'] = 'success'
    ): WorkflowMemory => {
      const memory: WorkflowMemory = {
        id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: new Date(),
        userId,
        action,
        details,
        status,
        workflowId: activeWorkflow?.id || 'system',
      };

      setWorkflowMemories(prev => [memory, ...prev]);
      return memory;
    },
    [activeWorkflow]
  );

  // Workflow Creation Functions
  const createUserCreationWorkflow = useCallback((): UserWorkflow => {
    const workflow: UserWorkflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'create_user',
      steps: [
        {
          id: 'step_1',
          title: 'Gather User Information',
          description: 'Collect basic user details and preferences',
          status: 'process',
        },
        {
          id: 'step_2',
          title: 'Validate Information',
          description: 'Verify email uniqueness and data integrity',
          status: 'wait',
        },
        {
          id: 'step_3',
          title: 'Set Permissions & Role',
          description: 'Assign appropriate permissions and user role',
          status: 'wait',
        },
        {
          id: 'step_4',
          title: 'Create User Account',
          description: 'Generate user account and send welcome email',
          status: 'wait',
        },
        {
          id: 'step_5',
          title: 'Initialize User Profile',
          description: 'Set up user profile and default settings',
          status: 'wait',
        },
      ],
      currentStep: 0,
      status: 'active',
      createdAt: new Date(),
      memories: [],
    };

    setActiveWorkflow(workflow);
    createWorkflowMemory(
      'user_creation',
      'Workflow initialized',
      { workflowId: workflow.id },
      undefined,
      'pending'
    );
    return workflow;
  }, [createWorkflowMemory]);

  const createUserEditWorkflow = useCallback(
    (user: User): UserWorkflow => {
      const workflow: UserWorkflow = {
        id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'edit_user',
        steps: [
          {
            id: 'step_1',
            title: 'Load Current User Data',
            description: 'Retrieve existing user information',
            status: 'process',
            data: user,
          },
          {
            id: 'step_2',
            title: 'Apply Changes',
            description: 'Update user information with new values',
            status: 'wait',
          },
          {
            id: 'step_3',
            title: 'Validate Changes',
            description: 'Ensure changes are valid and consistent',
            status: 'wait',
          },
          {
            id: 'step_4',
            title: 'Update Database',
            description: 'Persist changes to database',
            status: 'wait',
          },
          {
            id: 'step_5',
            title: 'Notify User',
            description: 'Send notification about account changes',
            status: 'wait',
          },
        ],
        currentStep: 0,
        status: 'active',
        createdAt: new Date(),
        userData: user,
        memories: [],
      };

      setActiveWorkflow(workflow);
      createWorkflowMemory(
        'user_update',
        'Edit workflow initialized',
        { userId: user.id, workflowId: workflow.id },
        user.id,
        'pending'
      );
      return workflow;
    },
    [createWorkflowMemory]
  );

  // Workflow Execution Functions
  const executeWorkflowStep = useCallback(async (workflow: UserWorkflow, stepIndex: number) => {
    setLoading(true);

    try {
      const step = workflow.steps[stepIndex];

      // Update step status to processing
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map((s, i) =>
          i === stepIndex ? { ...s, status: 'process' as const } : s
        ),
        currentStep: stepIndex,
      };

      setActiveWorkflow(updatedWorkflow);

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Execute step logic based on type
      switch (workflow.type) {
        case 'create_user':
          await executeCreateUserStep(updatedWorkflow, stepIndex);
          break;
        case 'edit_user':
          await executeEditUserStep(updatedWorkflow, stepIndex);
          break;
      }

      // Mark step as completed
      const completedWorkflow = {
        ...updatedWorkflow,
        steps: updatedWorkflow.steps.map((s, i) =>
          i === stepIndex ? { ...s, status: 'finish' as const } : s
        ),
      };

      // Move to next step or complete workflow
      if (stepIndex < workflow.steps.length - 1) {
        completedWorkflow.currentStep = stepIndex + 1;
        completedWorkflow.steps[stepIndex + 1].status = 'process';
      } else {
        completedWorkflow.status = 'completed';
        completedWorkflow.completedAt = new Date();
        createWorkflowMemory(
          'user_creation',
          'Workflow completed',
          {
            workflowId: workflow.id,
            totalSteps: workflow.steps.length,
          },
          workflow.userData?.id,
          'success'
        );
      }

      setActiveWorkflow(completedWorkflow);
    } catch (error) {
      // Mark step as error
      const errorWorkflow = {
        ...workflow,
        steps: workflow.steps.map((s, i) =>
          i === stepIndex ? { ...s, status: 'error' as const } : s
        ),
        status: 'failed',
      };

      setActiveWorkflow(errorWorkflow);
      createWorkflowMemory(
        'user_creation',
        'Workflow step failed',
        {
          workflowId: workflow.id,
          stepIndex,
          error: error.message,
        },
        workflow.userData?.id,
        'error'
      );

      message.error(`Step ${stepIndex + 1} failed: ${error.message}`);
    }

    setLoading(false);
  }, []);

  const executeCreateUserStep = async (workflow: UserWorkflow, stepIndex: number) => {
    const formData = createUserForm.getFieldsValue();

    switch (stepIndex) {
      case 0: // Gather Information
        if (!formData.name || !formData.email) {
          throw new Error('Name and email are required');
        }
        createWorkflowMemory(
          'user_creation',
          'User information gathered',
          formData,
          undefined,
          'success'
        );
        break;

      case 1: // Validate Information
        const existingUser = users.find(u => u.email === formData.email);
        if (existingUser) {
          throw new Error('Email already exists');
        }
        createWorkflowMemory(
          'user_creation',
          'Information validated',
          { email: formData.email },
          undefined,
          'success'
        );
        break;

      case 2: // Set Permissions & Role
        createWorkflowMemory(
          'user_creation',
          'Permissions and role set',
          {
            role: formData.role,
            permissions: formData.permissions,
          },
          undefined,
          'success'
        );
        break;

      case 3: // Create User Account
        const newUser: User = {
          id: `user_${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role || 'user',
          status: 'active',
          createdAt: new Date(),
          permissions: formData.permissions || ['read'],
          verified: false,
          stats: { optimizations: 0, storage: 0, apiCalls: 0 },
          workflowHistory: [workflow],
        };

        setUsers(prev => [...prev, newUser]);
        createWorkflowMemory(
          'user_creation',
          'User account created',
          { userId: newUser.id },
          newUser.id,
          'success'
        );
        break;

      case 4: // Initialize Profile
        createWorkflowMemory(
          'user_creation',
          'User profile initialized',
          { userId: workflow.userData?.id },
          workflow.userData?.id,
          'success'
        );
        message.success('User created successfully!');
        break;
    }
  };

  const executeEditUserStep = async (workflow: UserWorkflow, stepIndex: number) => {
    const formData = editUserForm.getFieldsValue();

    switch (stepIndex) {
      case 0: // Load Current Data
        createWorkflowMemory(
          'user_update',
          'Current user data loaded',
          { userId: workflow.userData?.id },
          workflow.userData?.id,
          'success'
        );
        break;

      case 1: // Apply Changes
        createWorkflowMemory(
          'user_update',
          'Changes applied',
          formData,
          workflow.userData?.id,
          'success'
        );
        break;

      case 2: // Validate Changes
        if (formData.email && formData.email !== workflow.userData?.email) {
          const existingUser = users.find(
            u => u.email === formData.email && u.id !== workflow.userData?.id
          );
          if (existingUser) {
            throw new Error('Email already exists');
          }
        }
        createWorkflowMemory(
          'user_update',
          'Changes validated',
          formData,
          workflow.userData?.id,
          'success'
        );
        break;

      case 3: // Update Database
        setUsers(prev =>
          prev.map(u =>
            u.id === workflow.userData?.id
              ? { ...u, ...formData, workflowHistory: [...(u.workflowHistory || []), workflow] }
              : u
          )
        );
        createWorkflowMemory(
          'user_update',
          'Database updated',
          { userId: workflow.userData?.id },
          workflow.userData?.id,
          'success'
        );
        break;

      case 4: // Notify User
        createWorkflowMemory(
          'user_update',
          'User notified',
          { userId: workflow.userData?.id },
          workflow.userData?.id,
          'success'
        );
        message.success('User updated successfully!');
        break;
    }
  };

  // UI Helper Functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'moderator':
        return 'orange';
      case 'user':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // Event Handlers
  const handleStartCreateUserWorkflow = () => {
    createUserCreationWorkflow();
    setIsWorkflowModalVisible(true);
  };

  const handleStartEditUserWorkflow = (user: User) => {
    createUserEditWorkflow(user);
    editUserForm.setFieldsValue(user);
    setIsWorkflowModalVisible(true);
  };

  const handleWorkflowStepComplete = () => {
    if (activeWorkflow && activeWorkflow.currentStep < activeWorkflow.steps.length) {
      executeWorkflowStep(activeWorkflow, activeWorkflow.currentStep);
    }
  };

  const handleCancelWorkflow = () => {
    if (activeWorkflow) {
      const cancelledWorkflow = {
        ...activeWorkflow,
        status: 'cancelled' as const,
        completedAt: new Date(),
      };

      createWorkflowMemory(
        'user_creation',
        'Workflow cancelled',
        {
          workflowId: activeWorkflow.id,
          cancelledAt: new Date(),
        },
        activeWorkflow.userData?.id,
        'error'
      );

      setActiveWorkflow(cancelledWorkflow);
    }
    setIsWorkflowModalVisible(false);
    createUserForm.resetFields();
    editUserForm.resetFields();
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsVisible(true);
  };

  // Table columns
  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Badge dot={record.verified} status='success'>
            <Avatar
              src={record.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: record.verified ? '#52c41a' : '#d9d9d9' }}
            />
          </Badge>
          <div>
            <div>
              <Text strong>{record.name}</Text>
              {record.verified && (
                <Tooltip title='Verified User'>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                </Tooltip>
              )}
            </div>
            <Text type='secondary' style={{ fontSize: '12px' }}>
              <MailOutlined /> {record.email}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)} icon={<SafetyOutlined />}>
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Moderator', value: 'moderator' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={status.toUpperCase()} />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Workflows',
      key: 'workflows',
      render: (record: User) => <Text>{record.workflowHistory?.length || 0} workflows</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title='View Details'>
            <Button
              type='text'
              icon={<EyeOutlined />}
              size='small'
              onClick={() => handleViewUserDetails(record)}
            />
          </Tooltip>
          <Tooltip title='Edit User (Workflow)'>
            <Button
              type='text'
              icon={<EditOutlined />}
              size='small'
              onClick={() => handleStartEditUserWorkflow(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <RobotOutlined /> User Management Workflow
        </Title>
        <Text type='secondary'>
          Complete user lifecycle management with intelligent workflows and memory generation
        </Text>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <DSCard.Root variant='elevated'>
            <DSCard.Body>
              <Statistic
                title='Total Users'
                value={users.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DSCard.Root variant='elevated'>
            <DSCard.Body>
              <Statistic
                title='Active Workflows'
                value={workflowMemories.filter(m => m.status === 'pending').length}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DSCard.Root variant='elevated'>
            <DSCard.Body>
              <Statistic
                title='Completed Actions'
                value={workflowMemories.filter(m => m.status === 'success').length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DSCard.Root variant='elevated'>
            <DSCard.Body>
              <Statistic
                title='Memory Entries'
                value={workflowMemories.length}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </Col>
      </Row>

      <Tabs defaultActiveKey='1'>
        <TabPane tab='User Management' key='1'>
          <DSCard.Root>
            <DSCard.Body>
              {/* Action Bar */}
              <div
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <Space wrap>
                  <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={handleStartCreateUserWorkflow}
                    size='large'
                  >
                    Create User (Workflow)
                  </Button>
                </Space>
                <Space wrap>
                  <Search
                    placeholder='Search users...'
                    allowClear
                    style={{ width: 300 }}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    prefix={<UserOutlined />}
                  />
                  <Select
                    style={{ width: 150 }}
                    placeholder='Filter by role'
                    value={selectedRole}
                    onChange={setSelectedRole}
                  >
                    <Select.Option value='all'>All Roles</Select.Option>
                    <Select.Option value='admin'>Admin</Select.Option>
                    <Select.Option value='moderator'>Moderator</Select.Option>
                    <Select.Option value='user'>User</Select.Option>
                  </Select>
                  <Select
                    style={{ width: 150 }}
                    placeholder='Filter by status'
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                  >
                    <Select.Option value='all'>All Statuses</Select.Option>
                    <Select.Option value='active'>Active</Select.Option>
                    <Select.Option value='inactive'>Inactive</Select.Option>
                    <Select.Option value='suspended'>Suspended</Select.Option>
                  </Select>
                </Space>
              </div>

              {/* Users Table */}
              <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey='id'
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </TabPane>

        <TabPane tab='Workflow Memories' key='2'>
          <DSCard.Root>
            <DSCard.Body>
              <Title level={4}>Workflow Memory Log</Title>
              <Text type='secondary'>
                AI-generated memories of all user management operations and workflows
              </Text>

              <div style={{ marginTop: '16px', maxHeight: '600px', overflow: 'auto' }}>
                <Timeline>
                  {workflowMemories.map(memory => (
                    <Timeline.Item
                      key={memory.id}
                      color={
                        memory.status === 'success'
                          ? 'green'
                          : memory.status === 'error'
                            ? 'red'
                            : 'blue'
                      }
                    >
                      <DSCard.Root variant='outlined' className='mb-2'>
                        <DSCard.Body className='p-3'>
                          <Space direction='vertical' style={{ width: '100%' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Text strong>{memory.action}</Text>
                              <Tag
                                color={
                                  memory.status === 'success'
                                    ? 'success'
                                    : memory.status === 'error'
                                      ? 'error'
                                      : 'processing'
                                }
                              >
                                {memory.status.toUpperCase()}
                              </Tag>
                            </div>
                            <Text type='secondary' style={{ fontSize: '12px' }}>
                              {memory.timestamp.toLocaleString()}
                            </Text>
                            {memory.userId && (
                              <Text style={{ fontSize: '12px' }}>User ID: {memory.userId}</Text>
                            )}
                            <Text code style={{ fontSize: '11px' }}>
                              {JSON.stringify(memory.details, null, 2)}
                            </Text>
                          </Space>
                        </DSCard.Body>
                      </DSCard.Root>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </DSCard.Body>
          </DSCard.Root>
        </TabPane>

        <TabPane tab='Active Workflows' key='3'>
          <DSCard.Root>
            <DSCard.Body>
              <Title level={4}>Active Workflow Sessions</Title>
              {activeWorkflow ? (
                <div>
                  <Alert
                    message={`Active: ${activeWorkflow.type.replace('_', ' ').toUpperCase()}`}
                    description={`Workflow ID: ${activeWorkflow.id}`}
                    type='info'
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />

                  <Steps current={activeWorkflow.currentStep} direction='vertical'>
                    {activeWorkflow.steps.map((step, index) => (
                      <Step
                        key={step.id}
                        title={step.title}
                        description={step.description}
                        status={step.status}
                        icon={step.status === 'process' ? <LoadingOutlined /> : undefined}
                      />
                    ))}
                  </Steps>

                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Space>
                      <Button
                        type='primary'
                        onClick={handleWorkflowStepComplete}
                        loading={loading}
                        disabled={activeWorkflow.status !== 'active'}
                      >
                        {activeWorkflow.currentStep < activeWorkflow.steps.length - 1
                          ? 'Execute Next Step'
                          : 'Complete Workflow'}
                      </Button>
                      <Button onClick={handleCancelWorkflow}>Cancel Workflow</Button>
                    </Space>
                  </div>
                </div>
              ) : (
                <Alert
                  message='No Active Workflow'
                  description='Start a user management workflow to see it here'
                  type='info'
                  showIcon
                />
              )}
            </DSCard.Body>
          </DSCard.Root>
        </TabPane>
      </Tabs>

      {/* Workflow Modal */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined />
            {activeWorkflow?.type.replace('_', ' ').toUpperCase()} Workflow
          </Space>
        }
        open={isWorkflowModalVisible}
        onCancel={handleCancelWorkflow}
        footer={null}
        width={800}
        maskClosable={false}
      >
        {activeWorkflow && (
          <div>
            <Alert
              message='Intelligent Workflow System'
              description='This workflow will guide you through the complete process with AI-generated memories and validation at each step.'
              type='info'
              showIcon
              style={{ marginBottom: '24px' }}
            />

            {activeWorkflow.type === 'create_user' && (
              <Form form={createUserForm} layout='vertical'>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name='name'
                      label='Full Name'
                      rules={[{ required: true, message: 'Name is required' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder='John Doe' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='email'
                      label='Email'
                      rules={[
                        { required: true, message: 'Email is required' },
                        { type: 'email', message: 'Invalid email format' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder='john@example.com' />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name='phone' label='Phone Number'>
                      <Input prefix={<PhoneOutlined />} placeholder='+1234567890' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='role'
                      label='Role'
                      rules={[{ required: true, message: 'Role is required' }]}
                    >
                      <Select placeholder='Select role'>
                        <Select.Option value='user'>User</Select.Option>
                        <Select.Option value='moderator'>Moderator</Select.Option>
                        <Select.Option value='admin'>Admin</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name='permissions' label='Permissions'>
                  <Select mode='multiple' placeholder='Select permissions'>
                    <Select.Option value='read'>Read</Select.Option>
                    <Select.Option value='write'>Write</Select.Option>
                    <Select.Option value='delete'>Delete</Select.Option>
                    <Select.Option value='moderate'>Moderate</Select.Option>
                    <Select.Option value='admin'>Admin</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            )}

            {activeWorkflow.type === 'edit_user' && (
              <Form form={editUserForm} layout='vertical'>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name='name' label='Full Name'>
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name='email' label='Email'>
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name='role' label='Role'>
                      <Select>
                        <Select.Option value='user'>User</Select.Option>
                        <Select.Option value='moderator'>Moderator</Select.Option>
                        <Select.Option value='admin'>Admin</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name='status' label='Status'>
                      <Select>
                        <Select.Option value='active'>Active</Select.Option>
                        <Select.Option value='inactive'>Inactive</Select.Option>
                        <Select.Option value='suspended'>Suspended</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  type='primary'
                  onClick={handleWorkflowStepComplete}
                  loading={loading}
                  disabled={activeWorkflow.status !== 'active'}
                  size='large'
                >
                  Start Workflow
                  <ArrowRightOutlined />
                </Button>
                <Button onClick={handleCancelWorkflow} size='large'>
                  Cancel
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* User Details Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar src={selectedUser?.avatar} icon={<UserOutlined />} />
            <span>{selectedUser?.name}</span>
            {selectedUser?.verified && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
          </Space>
        }
        placement='right'
        onClose={() => setIsUserDetailsVisible(false)}
        open={isUserDetailsVisible}
        width={600}
      >
        {selectedUser && (
          <Tabs defaultActiveKey='1'>
            <TabPane tab='Profile' key='1'>
              <Descriptions column={1} bordered>
                <Descriptions.Item label='Email'>
                  <Space>
                    <MailOutlined />
                    {selectedUser.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label='Role'>
                  <Tag color={getRoleColor(selectedUser.role)}>
                    {selectedUser.role.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label='Status'>
                  <Badge
                    status={getStatusColor(selectedUser.status) as any}
                    text={selectedUser.status.toUpperCase()}
                  />
                </Descriptions.Item>
                <Descriptions.Item label='Created'>
                  {selectedUser.createdAt.toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab='Workflow History' key='2'>
              <Timeline>
                {selectedUser.workflowHistory?.map(workflow => (
                  <Timeline.Item
                    key={workflow.id}
                    color={
                      workflow.status === 'completed'
                        ? 'green'
                        : workflow.status === 'failed'
                          ? 'red'
                          : 'blue'
                    }
                  >
                    <DSCard.Root variant='outlined' className='mb-2'>
                      <DSCard.Body className='p-3'>
                        <Text strong>{workflow.type.replace('_', ' ').toUpperCase()}</Text>
                        <br />
                        <Text type='secondary' style={{ fontSize: '12px' }}>
                          Started: {workflow.createdAt.toLocaleString()}
                        </Text>
                        <br />
                        <Text type='secondary' style={{ fontSize: '12px' }}>
                          Status:{' '}
                          <Tag
                            color={
                              workflow.status === 'completed'
                                ? 'success'
                                : workflow.status === 'failed'
                                  ? 'error'
                                  : 'processing'
                            }
                          >
                            {workflow.status.toUpperCase()}
                          </Tag>
                        </Text>
                      </DSCard.Body>
                    </DSCard.Root>
                  </Timeline.Item>
                )) || <Text type='secondary'>No workflow history available</Text>}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default UserManagementWorkflow;

import React, { useState, useEffect } from 'react';
import {
  // MD3 Components
  StatusCard,
  MetricCard,
  Chip,
  ProgressIndicator,
  FAB,
  ListItem,
  SectionHeader,
  useTheme,
  useAsyncData,
  formatNumber,

  // Material Tailwind Components
  MTButton,
  MTCard,
  MTCardHeader,
  MTCardBody,
  MTCardFooter,
  MTTypography,
  MTInput,
  MTAvatar,
  MTBadge,
  MTProgressBar,
  MTSpinner,
  MTAlert,

  // Advanced MD3 Components
  ChartContainer,
  KPICard,
  DataTable,
  NavigationDrawer,
  Breadcrumb,
  Tabs,
  Modal,
  Snackbar,
  Select,
  Switch,
  Slider,
} from '../../utils/ReusableDesignSystem';
import {
  Layout,
  Row,
  Col,
  Space,
  Divider
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  BellOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  FilterOutlined,
  MoreOutlined,
  SearchOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  CloudOutlined,
  GlobalOutlined,
  RocketOutlined,
  TrophyOutlined,
  StarOutlined,
  HeartOutlined,
  LikeOutlined,
  DislikeOutlined,
  FireOutlined,
  ThunderboltOutlined as ThunderIcon,
  WifiOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  ShareOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  BulbOutlined,
  ExperimentOutlined,
  ToolOutlined,
} from '@ant-design/icons';

/**
 * Amazing Material Design 3 Dashboard Demo
 * Showcasing the complete advanced MD3 design system
 */
const AmazingMD3Dashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(75);

  // Navigation items for drawer
  const navItems = [
    { key: 'overview', icon: <DashboardOutlined />, label: 'Dashboard', badge: 0 },
    { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics', badge: 3 },
    { key: 'users', icon: <TeamOutlined />, label: 'Users', badge: 12 },
    { key: 'commerce', icon: <ShoppingCartOutlined />, label: 'Commerce', badge: 0 },
    { key: 'content', icon: <FileTextOutlined />, label: 'Content', badge: 5 },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings', badge: 0 },
  ];

  // Tab items
  const tabItems = [
    { key: 'overview', label: 'Overview', icon: <DashboardOutlined /> },
    { key: 'performance', label: 'Performance', icon: <BarChartOutlined /> },
    { key: 'users', label: 'Users', icon: <TeamOutlined /> },
    { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
  ];

  // Sample data
  const kpiData = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: 12.5,
      changeLabel: 'vs last month',
      icon: <DollarOutlined />,
      color: 'success' as const,
      trend: 'up' as const
    },
    {
      title: 'Active Users',
      value: '45,231',
      change: 8.2,
      changeLabel: 'vs last month',
      icon: <TeamOutlined />,
      color: 'primary' as const,
      trend: 'up' as const
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: -2.1,
      changeLabel: 'vs last month',
      icon: <ThunderboltOutlined />,
      color: 'warning' as const,
      trend: 'down' as const
    },
    {
      title: 'System Uptime',
      value: '99.98%',
      change: 0.02,
      changeLabel: 'vs last month',
      icon: <CloudOutlined />,
      color: 'info' as const,
      trend: 'up' as const
    },
  ];

  const systemHealthData = [
    {
      title: 'API Gateway',
      status: 'healthy' as const,
      icon: <ApiOutlined />,
      metrics: [
        { label: 'Response Time', value: '42ms' },
        { label: 'Requests/min', value: '1,247' }
      ]
    },
    {
      title: 'Database',
      status: 'healthy' as const,
      icon: <DatabaseOutlined />,
      metrics: [
        { label: 'Connections', value: '156' },
        { label: 'Query Time', value: '8ms' }
      ]
    },
    {
      title: 'Cache Layer',
      status: 'syncing' as const,
      icon: <ThunderboltOutlined />,
      metrics: [
        { label: 'Hit Rate', value: '94.2%' },
        { label: 'Memory Usage', value: '2.1GB' }
      ]
    },
    {
      title: 'CDN',
      status: 'healthy' as const,
      icon: <GlobalOutlined />,
      metrics: [
        { label: 'Edge Locations', value: '47' },
        { label: 'Cache Hit', value: '89.7%' }
      ]
    },
  ];

  const tableColumns = [
    {
      key: 'user',
      title: 'User',
      dataIndex: 'user',
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-3">
          <MTAvatar size="sm">{record.avatar}</MTAvatar>
          <div>
            <MTTypography variant="body2" className="font-medium text-gray-900">
              {record.name}
            </MTTypography>
            <MTTypography variant="small" className="text-gray-600">
              {record.email}
            </MTTypography>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      render: (value: string) => (
        <MTBadge
          content={value}
          variant="ghost"
          color={value === 'Admin' ? 'error' : value === 'Editor' ? 'warning' : 'info'}
        />
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (value: string) => (
        <MTBadge
          content={value}
          variant="filled"
          color={value === 'Active' ? 'success' : value === 'Inactive' ? 'gray' : 'warning'}
        />
      )
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      dataIndex: 'lastLogin',
      sortable: true
    },
    {
      key: 'actions',
      title: 'Actions',
      render: () => (
        <Space>
          <MTButton variant="text" size="sm" color="primary">
            <EditOutlined />
          </MTButton>
          <MTButton variant="text" size="sm" color="error">
            <DeleteOutlined />
          </MTButton>
        </Space>
      )
    }
  ];

  const tableData = [
    {
      key: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'JD',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2 hours ago'
    },
    {
      key: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'JS',
      role: 'Editor',
      status: 'Active',
      lastLogin: '1 day ago'
    },
    {
      key: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      avatar: 'BJ',
      role: 'User',
      status: 'Inactive',
      lastLogin: '1 week ago'
    },
    {
      key: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      avatar: 'AB',
      role: 'Editor',
      status: 'Active',
      lastLogin: '3 hours ago'
    },
    {
      key: '5',
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      avatar: 'CW',
      role: 'User',
      status: 'Pending',
      lastLogin: 'Never'
    },
  ];

  const breadcrumbItems = [
    { title: 'Dashboard' },
    { title: 'Analytics' },
    { title: 'Overview' }
  ];

  // Sample chart data (mock implementation)
  const renderSampleChart = (type: string, height: number = 200) => (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">
          {type === 'bar' && <BarChartOutlined className="text-blue-600" />}
          {type === 'line' && <LineChartOutlined className="text-green-600" />}
          {type === 'pie' && <PieChartOutlined className="text-purple-600" />}
          {type === 'area' && <AreaChartOutlined className="text-orange-600" />}
        </div>
        <MTTypography variant="body2" className="text-gray-600">
          {type.charAt(0).toUpperCase() + type.slice(1)} Chart Placeholder
        </MTTypography>
        <MTTypography variant="small" className="text-gray-500 mt-1">
          Replace with your preferred charting library
        </MTTypography>
      </div>
    </div>
  );

  const recentActivities = [
    {
      title: 'New user registration',
      subtitle: 'Sarah Johnson joined the platform',
      timestamp: '2 minutes ago',
      status: 'success' as const,
      leadingIcon: <CheckCircleOutlined className="text-green-600" />
    },
    {
      title: 'Payment processed',
      subtitle: '$299.99 received from Mike Chen',
      timestamp: '15 minutes ago',
      status: 'success' as const,
      leadingIcon: <DollarOutlined className="text-green-600" />
    },
    {
      title: 'System maintenance completed',
      subtitle: 'Database optimization finished successfully',
      timestamp: '1 hour ago',
      status: 'info' as const,
      leadingIcon: <ThunderboltOutlined className="text-blue-600" />
    },
    {
      title: 'Security alert',
      subtitle: 'Unusual login attempt detected',
      timestamp: '2 hours ago',
      status: 'warning' as const,
      leadingIcon: <ExclamationCircleOutlined className="text-yellow-600" />
    },
    {
      title: 'Backup completed',
      subtitle: 'Daily backup finished at 3:00 AM',
      timestamp: '6 hours ago',
      status: 'success' as const,
      leadingIcon: <CloudOutlined className="text-green-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Drawer */}
      <NavigationDrawer
        items={navItems}
        activeKey="overview"
        collapsed={collapsed}
        onItemClick={(key) => console.log('Navigate to:', key)}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        collapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>

              <div>
                <MTTypography variant="h4" className="text-gray-900 font-semibold">
                  Analytics Dashboard
                </MTTypography>
                <MTTypography variant="paragraph" className="text-gray-600 text-sm">
                  Monitor your platform performance and insights
                </MTTypography>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dashboard..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>

              {/* Filter Chips */}
              <Space>
                <Chip
                  variant="filter"
                  selected={selectedFilter === 'all'}
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </Chip>
                <Chip
                  variant="filter"
                  selected={selectedFilter === 'today'}
                  onClick={() => setSelectedFilter('today')}
                >
                  Today
                </Chip>
                <Chip
                  variant="filter"
                  selected={selectedFilter === 'week'}
                  onClick={() => setSelectedFilter('week')}
                >
                  This Week
                </Chip>
              </Space>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
                <BellOutlined />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
                <SettingOutlined />
              </button>

              {/* Theme Toggle */}
              <MTButton
                variant="outlined"
                size="sm"
                onClick={toggleTheme}
                className="ml-2"
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </MTButton>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-6 py-3 bg-white border-b border-gray-200">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Content */}
        <main className="p-6">
          {/* Tabs */}
          <div className="mb-6">
            <Tabs
              items={tabItems}
              activeKey={activeTab}
              onChange={setActiveTab}
              variant="standard"
            />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                changeLabel={kpi.changeLabel}
                icon={kpi.icon}
                color={kpi.color}
                trend={kpi.trend}
              />
            ))}
          </div>

          {/* System Health Cards */}
          <SectionHeader title="System Health" subtitle="Monitor your infrastructure status" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {systemHealthData.map((system, index) => (
              <StatusCard
                key={index}
                title={system.title}
                status={system.status}
                icon={system.icon}
                metrics={system.metrics}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartContainer
              title="Revenue Trend"
              subtitle="Monthly revenue over the last 12 months"
              height={300}
            >
              {renderSampleChart('line', 250)}
            </ChartContainer>

            <ChartContainer
              title="User Growth"
              subtitle="New user registrations by month"
              height={300}
            >
              {renderSampleChart('bar', 250)}
            </ChartContainer>

            <ChartContainer
              title="Traffic Sources"
              subtitle="Where your users are coming from"
              height={300}
            >
              {renderSampleChart('pie', 250)}
            </ChartContainer>

            <ChartContainer
              title="Performance Metrics"
              subtitle="Key performance indicators over time"
              height={300}
            >
              {renderSampleChart('area', 250)}
            </ChartContainer>
          </div>

          {/* Data Table and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Users Table */}
            <div className="lg:col-span-2">
              <DataTable
                columns={tableColumns}
                data={tableData}
                pagination={{
                  current: 1,
                  total: 25,
                  pageSize: 5,
                  onChange: (page) => console.log('Page changed to:', page)
                }}
                onSort={(key, order) => console.log('Sort:', key, order)}
              />
            </div>

            {/* Recent Activities */}
            <div>
              <MTCard variant="elevated">
                <MTCardHeader>
                  <div className="flex items-center justify-between">
                    <MTTypography variant="h5" className="text-gray-900 font-semibold">
                      Recent Activity
                    </MTTypography>
                    <MTButton variant="text" size="sm">
                      View All
                    </MTButton>
                  </div>
                </MTCardHeader>
                <MTCardBody className="p-0">
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {recentActivities.map((activity, index) => (
                      <ListItem
                        key={index}
                        title={activity.title}
                        subtitle={activity.subtitle}
                        leadingIcon={activity.leadingIcon}
                        trailingIcon={
                          <MTTypography variant="small" className="text-gray-500">
                            {activity.timestamp}
                          </MTTypography>
                        }
                      />
                    ))}
                  </div>
                </MTCardBody>
              </MTCard>
            </div>
          </div>

          {/* Interactive Components Demo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Components */}
            <MTCard variant="elevated">
              <MTCardHeader>
                <MTTypography variant="h5" className="text-gray-900 font-semibold">
                  Form Components
                </MTTypography>
              </MTCardHeader>
              <MTCardBody>
                <div className="space-y-6">
                  <MTInput
                    label="Full Name"
                    placeholder="Enter your full name"
                    variant="outlined"
                  />

                  <Select
                    label="User Role"
                    placeholder="Select a role"
                    options={[
                      { value: 'admin', label: 'Administrator' },
                      { value: 'editor', label: 'Editor' },
                      { value: 'user', label: 'User' },
                      { value: 'viewer', label: 'Viewer' }
                    ]}
                  />

                  <div className="space-y-4">
                    <Switch
                      checked={switchValue}
                      onChange={setSwitchValue}
                      label="Enable notifications"
                    />

                    <div>
                      <MTTypography variant="body2" className="text-gray-700 mb-2">
                        Volume Level: {sliderValue}%
                      </MTTypography>
                      <Slider
                        value={sliderValue}
                        onChange={setSliderValue}
                        min={0}
                        max={100}
                        showValue
                      />
                    </div>
                  </div>

                  <Space>
                    <MTButton variant="filled" color="primary">
                      Save Changes
                    </MTButton>
                    <MTButton variant="outlined" color="secondary">
                      Cancel
                    </MTButton>
                  </Space>
                </div>
              </MTCardBody>
            </MTCard>

            {/* Progress and Alerts */}
            <div className="space-y-6">
              {/* Progress Indicators */}
              <MTCard variant="elevated">
                <MTCardHeader>
                  <MTTypography variant="h5" className="text-gray-900 font-semibold">
                    System Resources
                  </MTTypography>
                </MTCardHeader>
                <MTCardBody>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <MTTypography variant="small" className="text-gray-600 font-medium">
                          CPU Usage
                        </MTTypography>
                        <MTTypography variant="small" className="text-gray-900 font-medium">
                          67%
                        </MTTypography>
                      </div>
                      <MTProgressBar value={67} color="primary" size="sm" showValue />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <MTTypography variant="small" className="text-gray-600 font-medium">
                          Memory
                        </MTTypography>
                        <MTTypography variant="small" className="text-gray-900 font-medium">
                          84%
                        </MTTypography>
                      </div>
                      <MTProgressBar value={84} color="success" size="sm" showValue />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <MTTypography variant="small" className="text-gray-600 font-medium">
                          Storage
                        </MTTypography>
                        <MTTypography variant="small" className="text-gray-900 font-medium">
                          45%
                        </MTTypography>
                      </div>
                      <MTProgressBar value={45} color="info" size="sm" showValue />
                    </div>
                  </div>
                </MTCardBody>
              </MTCard>

              {/* Alerts */}
              <MTAlert color="success" variant="filled">
                <strong>Success!</strong> Your changes have been saved successfully.
              </MTAlert>

              <MTAlert color="warning" variant="outlined">
                <strong>Warning:</strong> Your session will expire in 5 minutes.
              </MTAlert>

              <MTAlert color="error" variant="ghost">
                <strong>Error:</strong> Failed to connect to the server. Please try again.
              </MTAlert>
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-20">
        <FAB
          icon={<PlusOutlined />}
          variant="primary"
          size="large"
          onClick={() => setModalOpen(true)}
        />
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Item"
      >
        <div className="space-y-4">
          <MTInput
            label="Item Name"
            placeholder="Enter item name"
            variant="outlined"
          />
          <Select
            label="Category"
            placeholder="Select category"
            options={[
              { value: 'product', label: 'Product' },
              { value: 'service', label: 'Service' },
              { value: 'content', label: 'Content' }
            ]}
          />
          <MTTypography variant="body2" className="text-gray-600">
            This is a demo modal showcasing the Material Design 3 modal component with proper styling and animations.
          </MTTypography>
        </div>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        message="Action completed successfully!"
        severity="success"
        onClose={() => setSnackbarOpen(false)}
      />
    </div>
  );
};

export default AmazingMD3Dashboard;

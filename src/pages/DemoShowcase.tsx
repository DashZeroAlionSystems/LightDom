/**
 * Demo Showcase Page
 * 
 * Central hub for all LightDom demonstrations
 * Provides easy navigation and discovery of platform features
 */

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Input, Tabs, Badge, Tooltip, Empty, Button, Statistic } from 'antd';
import {
  RocketOutlined,
  DatabaseOutlined,
  BlockOutlined,
  AppstoreOutlined,
  ApiOutlined,
  ExperimentOutlined,
  ToolOutlined,
  StarFilled,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

interface Demo {
  id: string;
  name: string;
  description: string;
  category: string;
  route?: string;
  file?: string;
  status: 'ready' | 'needs-deps' | 'needs-api' | 'needs-db';
  enhanced?: boolean;
  type: 'react' | 'node' | 'html';
  features: string[];
  icon: React.ReactNode;
}

const demos: Demo[] = [
  // Interactive Demos (React Components)
  {
    id: 'space-mining',
    name: 'Space Mining Dashboard',
    description: 'Real-time blockchain-powered DOM space mining with metaverse integration. Features live hash rate tracking, block mining simulation, and LIGHTDOM token rewards.',
    category: 'Interactive Demos',
    route: '/space-mining',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['Blockchain Mining', 'Live Updates', 'Token Rewards', 'Real-time Stats'],
    icon: <RocketOutlined />
  },
  {
    id: 'metaverse-marketplace',
    name: 'Metaverse NFT Marketplace',
    description: 'Complete NFT marketplace with minting, trading, wallet management, and real-time price tracking. Create, buy, and sell unique DOM spaces and structures.',
    category: 'Interactive Demos',
    route: '/demos/nft-marketplace',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['NFT Minting', 'Trading', 'Wallet', 'Favorites', 'Search & Filter'],
    icon: <AppstoreOutlined />
  },
  {
    id: 'onboarding-viz',
    name: 'Onboarding Visualization',
    description: 'Interactive visualization of automated user onboarding flow with real-time progress tracking, SEO analysis, and statistics dashboard.',
    category: 'Interactive Demos',
    route: '/demos/onboarding',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['Progress Tracking', 'SEO Analysis', 'Statistics', 'Step Visualization'],
    icon: <ExperimentOutlined />
  },
  {
    id: 'onboarding',
    name: 'User Onboarding Flow (Node)',
    description: 'Command-line version with enhanced terminal output, color-coded steps, and JSON export.',
    category: 'Interactive Demos',
    file: 'demo-onboarding.js',
    status: 'ready',
    enhanced: true,
    type: 'node',
    features: ['Terminal UI', 'ANSI Colors', 'JSON Export', 'Statistics'],
    icon: <ExperimentOutlined />
  },
  {
    id: 'lightdom-slots',
    name: 'Light DOM Slots System',
    description: 'Interactive demonstration of Light DOM slot system with dynamic content projection, lazy loading, and real-time composition.',
    category: 'Interactive Demos',
    route: '/demos/lightdom-slots',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['Slot Management', 'Lazy Loading', 'Virtual DOM', 'Optimization'],
    icon: <LayoutOutlined />
  },

  // Data Mining & SEO
  {
    id: 'datamining-advanced',
    name: 'Advanced Data Mining',
    description: 'Full data mining orchestration with Playwright and Puppeteer integration.',
    category: 'Data Mining & SEO',
    file: 'demo-advanced-datamining.js',
    status: 'needs-deps',
    type: 'node',
    features: ['Playwright', 'Puppeteer', 'Chrome DevTools', 'Workflows'],
    icon: <DatabaseOutlined />
  },
  {
    id: 'dom-3d-mining',
    name: '3D DOM Mining',
    description: 'Mine URLs and generate 3D DOM models with schema linking and visualization.',
    category: 'Data Mining & SEO',
    file: 'demo-dom-3d-mining.js',
    status: 'needs-deps',
    type: 'node',
    features: ['3D Models', 'Schema Linking', 'Visualization', 'Analysis'],
    icon: <BlockOutlined />
  },

  // Blockchain & Mining
  {
    id: 'blockchain-optimization',
    name: 'Blockchain Algorithm Benchmark',
    description: 'Visual comparison of PoW, PoS, PoO, and DPoS algorithms with real-time performance metrics and recommendations.',
    category: 'Blockchain & Mining',
    route: '/demos/blockchain-benchmark',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['Algorithm Comparison', 'Real-time Metrics', 'Performance Analysis', 'Recommendations'],
    icon: <BlockOutlined />
  },
  {
    id: 'blockchain-optimization-node',
    name: 'Blockchain Algorithm Optimization (Node)',
    description: 'Command-line benchmark of blockchain algorithms for SEO data mining.',
    category: 'Blockchain & Mining',
    file: 'demo-blockchain-algorithm-optimization.js',
    status: 'ready',
    type: 'node',
    features: ['Algorithm Benchmark', 'Performance Testing', 'Optimization'],
    icon: <BlockOutlined />
  },

  // Component & Design Systems
  {
    id: 'component-dashboard',
    name: 'Component Dashboard Generator',
    description: 'Auto-generate React dashboard components with full CRUD functionality.',
    category: 'Component Systems',
    file: 'demo-component-dashboard-generator.js',
    status: 'ready',
    type: 'node',
    features: ['Auto Generation', 'CRUD', 'React Components'],
    icon: <AppstoreOutlined />
  },
  {
    id: 'design-system',
    name: 'Design System Enhancement',
    description: 'SEO report generation and design pattern analysis with live components.',
    category: 'Component Systems',
    file: 'demo-design-system-enhancement.js',
    status: 'ready',
    type: 'node',
    features: ['Design Patterns', 'SEO Reports', 'Analysis'],
    icon: <AppstoreOutlined />
  },

  // Agent & Workflow Systems
  {
    id: 'workflow-execution',
    name: 'Workflow Execution Visualization',
    description: 'Interactive visualization of memory-driven workflow automation with real-time execution tracking and step-by-step progress monitoring.',
    category: 'Agent & Workflow',
    route: '/demos/workflow-execution',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['Real-time Execution', 'Memory Optimization', 'Step Tracking', 'Multiple Workflows'],
    icon: <ApiOutlined />
  },
  {
    id: 'agent-orchestration',
    name: 'Agent Orchestration',
    description: 'Natural language to component generation workflow with AI agents.',
    category: 'Agent & Workflow',
    file: 'demo-agent-orchestration.js',
    status: 'ready',
    type: 'node',
    features: ['AI Agents', 'NL Processing', 'Component Gen'],
    icon: <ApiOutlined />
  },
  {
    id: 'workflow',
    name: 'Memory Workflow (Node)',
    description: 'Command-line workflow execution with memory-driven optimizations.',
    category: 'Agent & Workflow',
    file: 'demo-workflow.js',
    status: 'ready',
    type: 'node',
    features: ['Workflows', 'Memory', 'Optimization'],
    icon: <ApiOutlined />
  },
  {
    id: 'workflow-builder',
    name: 'Workflow Builder (Complete)',
    description: 'Full-featured workflow creation system with visual editor, validation, execution, and save/load. Demonstrates atomic → composite → dashboard architecture with real functionality.',
    category: 'Agent & Workflow',
    route: '/demos/workflow-builder',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['Visual Editor', 'Drag Nodes', 'Connections', 'Validation', 'Execution', 'Save/Load', 'Real-time Logs'],
    icon: <ApiOutlined />
  },
  {
    id: 'bridge-usecases',
    name: 'Bridge Use Cases Showcase',
    description: 'Interactive demonstrations of 6 innovative bridge use cases including chat commerce, product store injection, mining discovery, collaborative mining, and smart contract marketplace.',
    category: 'Interactive Demos',
    route: '/demos/bridge-usecases',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['Search Injection', 'Chat Commerce', 'Mining Discovery', 'Site Injection', 'Collaborative Mining', 'Smart Contracts'],
    icon: <ApiOutlined />
  },
  {
    id: '3d-mining',
    name: '3D DOM Mining Visualization',
    description: 'Interactive 3D visualization of DOM space mining with real-time node discovery, schema detection, and importance scoring. Features multi-layer depth rendering and training data export.',
    category: 'Data Mining & SEO',
    route: '/demos/3d-mining',
    status: 'ready',
    enhanced: true,
    type: 'react',
    features: ['3D Visualization', 'Real-time Mining', 'Schema Detection', 'Layer Analysis', 'Data Export', 'Importance Scoring'],
    icon: <DatabaseOutlined />
  },
];

const categories = [
  'All',
  'Interactive Demos',
  'Data Mining & SEO',
  'Blockchain & Mining',
  'Component Systems',
  'Agent & Workflow'
];

const DemoShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: Demo['status']) => {
    const statusConfig = {
      'ready': { color: 'success', text: 'Ready', icon: <CheckCircleOutlined /> },
      'needs-deps': { color: 'warning', text: 'Needs Dependencies', icon: <WarningOutlined /> },
      'needs-api': { color: 'warning', text: 'Needs API', icon: <WarningOutlined /> },
      'needs-db': { color: 'warning', text: 'Needs Database', icon: <WarningOutlined /> }
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getTypeBadge = (type: Demo['type']) => {
    const typeConfig = {
      'react': { color: 'blue', icon: '⚛️' },
      'node': { color: 'green', icon: '⚙️' },
      'html': { color: 'orange', icon: '🌐' }
    };

    const config = typeConfig[type];
    return (
      <Tag color={config.color}>
        {config.icon} {type.toUpperCase()}
      </Tag>
    );
  };

  const filteredDemos = demos.filter(demo => {
    const matchesCategory = selectedCategory === 'All' || demo.category === selectedCategory;
    const matchesSearch = demo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          demo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          demo.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: demos.length,
    ready: demos.filter(d => d.status === 'ready').length,
    enhanced: demos.filter(d => d.enhanced).length,
    react: demos.filter(d => d.type === 'react').length
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Title level={1} className="!text-white mb-4">
            <RocketOutlined className="mr-3" />
            LightDom Demo Showcase
          </Title>
          <Paragraph className="text-slate-300 text-lg mb-6">
            Explore all platform demonstrations and features
          </Paragraph>

          {/* Stats */}
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card className="bg-slate-800 border-slate-700">
                <Statistic
                  title={<span className="text-slate-400">Total Demos</span>}
                  value={stats.total}
                  valueStyle={{ color: '#60a5fa' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="bg-slate-800 border-slate-700">
                <Statistic
                  title={<span className="text-slate-400">Ready to Run</span>}
                  value={stats.ready}
                  valueStyle={{ color: '#10b981' }}
                  suffix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="bg-slate-800 border-slate-700">
                <Statistic
                  title={<span className="text-slate-400">Enhanced</span>}
                  value={stats.enhanced}
                  valueStyle={{ color: '#c084fc' }}
                  suffix={<StarFilled />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card className="bg-slate-800 border-slate-700">
                <Statistic
                  title={<span className="text-slate-400">React Components</span>}
                  value={stats.react}
                  valueStyle={{ color: '#60a5fa' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Search */}
          <Search
            placeholder="Search demos by name, description, or features..."
            allowClear
            size="large"
            className="mb-6"
            style={{ maxWidth: 600, margin: '0 auto' }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <Tabs
          activeKey={selectedCategory}
          onChange={setSelectedCategory}
          size="large"
          className="mb-6"
          items={categories.map(cat => ({
            key: cat,
            label: (
              <span>
                {cat}
                <Badge
                  count={cat === 'All' ? demos.length : demos.filter(d => d.category === cat).length}
                  className="ml-2"
                  style={{ backgroundColor: '#2563eb' }}
                />
              </span>
            )
          }))}
        />

        {/* Demo Grid */}
        <Row gutter={[24, 24]}>
          {filteredDemos.map(demo => (
            <Col xs={24} md={12} lg={8} key={demo.id}>
              <Card
                className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all h-full"
                hoverable
                title={
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white">
                      {demo.icon}
                      {demo.name}
                    </span>
                    {demo.enhanced && (
                      <Tooltip title="Recently Enhanced">
                        <StarFilled className="text-yellow-400" />
                      </Tooltip>
                    )}
                  </div>
                }
                extra={
                  <div className="flex gap-2">
                    {getStatusBadge(demo.status)}
                    {getTypeBadge(demo.type)}
                  </div>
                }
                actions={[
                  demo.route ? (
                    <Link to={demo.route}>
                      <Button type="primary" icon={<RocketOutlined />}>
                        Launch Demo
                      </Button>
                    </Link>
                  ) : (
                    <Tooltip title={`Run: node ${demo.file}`}>
                      <Button icon={<ToolOutlined />}>
                        View Instructions
                      </Button>
                    </Tooltip>
                  )
                ]}
              >
                <Paragraph className="text-slate-300 mb-4 min-h-[80px]">
                  {demo.description}
                </Paragraph>

                <div className="mb-3">
                  <Text className="text-slate-400 text-sm font-semibold">Features:</Text>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {demo.features.map((feature, idx) => (
                      <Tag key={idx} color="blue" className="text-xs">
                        {feature}
                      </Tag>
                    ))}
                  </div>
                </div>

                {demo.file && (
                  <Text className="text-slate-500 text-xs font-mono">
                    📁 {demo.file}
                  </Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {filteredDemos.length === 0 && (
          <div className="text-center py-12">
            <Empty
              description={
                <span className="text-slate-400">
                  No demos found matching your search
                </span>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoShowcase;

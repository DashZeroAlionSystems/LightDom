/**
 * Professional Sidebar Component
 * Material Design 3.0 inspired sidebar with consistent sizing and responsive design
 */

import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Typography,
  Space,
  Badge,
  Divider,
  Tooltip,
  Card,
  Progress,
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  WalletOutlined,
  TrophyOutlined,
  RocketOutlined,
  BarChartOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  BellOutlined,
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ApiOutlined,
  GlobalOutlined,
  SearchOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  ExperimentOutlined,
  BugOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import MaterialDesignSystem, {
  MaterialColors,
  MaterialSpacing,
  MaterialTypography,
  MaterialElevation,
  MaterialBorderRadius,
  MaterialComponentSizes,
  MaterialDarkTheme,
  MaterialTransitions,
} from '../styles/MaterialDesignSystem';

const { Sider } = Layout;
const { Title, Text } = Typography;

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  miningActive?: boolean;
  onMiningToggle?: () => void;
  selectedKey?: string;
  onMenuSelect?: (key: string) => void;
}

const ProfessionalSidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onCollapse,
  miningActive = false,
  onMiningToggle,
  selectedKey = 'dashboard',
  onMenuSelect,
}) => {
  const [notifications] = useState(5);

  // Navigation menu items with consistent structure
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      description: 'Overview and stats',
    },
    {
      key: 'mining',
      icon: <ThunderboltOutlined />,
      label: 'Mining Console',
      description: 'Mining operations',
    },
    {
      key: 'space-mining',
      icon: <RocketOutlined />,
      label: 'Space Mining',
      description: 'Space mining dashboard',
    },
    {
      key: 'metaverse-mining',
      icon: <GlobalOutlined />,
      label: 'Metaverse Mining',
      description: 'Virtual mining operations',
    },
    {
      key: 'metaverse-marketplace',
      icon: <ApiOutlined />,
      label: 'Metaverse Marketplace',
      description: 'Virtual marketplace',
    },
    {
      key: 'metaverse-mining-rewards',
      icon: <TrophyOutlined />,
      label: 'Mining Rewards',
      description: 'Mining rewards & achievements',
    },
    {
      key: 'optimizer',
      icon: <ExperimentOutlined />,
      label: 'DOM Optimizer',
      description: 'Website optimization',
    },
    {
      key: 'space-optimization',
      icon: <BarChartOutlined />,
      label: 'Space Optimization',
      description: 'Space optimization tools',
    },
    {
      key: 'portfolio',
      icon: <WalletOutlined />,
      label: 'Portfolio',
      description: 'Assets and balances',
    },
    {
      key: 'blockchain',
      icon: <DatabaseOutlined />,
      label: 'Blockchain Storage',
      description: 'Blockchain data management',
    },
    {
      key: 'blockchain-models',
      icon: <ClusterOutlined />,
      label: 'Blockchain Models',
      description: 'Model storage & management',
    },
    {
      key: 'seo-optimization',
      icon: <GlobalOutlined />,
      label: 'SEO Optimization',
      description: 'SEO optimization tools',
    },
    {
      key: 'seo-datamining',
      icon: <SearchOutlined />,
      label: 'SEO Data Mining',
      description: 'SEO data mining dashboard',
    },
    {
      key: 'seo-marketplace',
      icon: <ApiOutlined />,
      label: 'SEO Marketplace',
      description: 'SEO tools marketplace',
    },
    {
      key: 'workflow-simulation',
      icon: <ExperimentOutlined />,
      label: 'Workflow Simulation',
      description: 'Workflow simulation tools',
    },
    {
      key: 'testing',
      icon: <BugOutlined />,
      label: 'Testing Dashboard',
      description: 'Testing and debugging',
    },
    {
      key: 'advanced-nodes',
      icon: <ClusterOutlined />,
      label: 'Advanced Nodes',
      description: 'Advanced node management',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      description: 'Performance data',
    },
    {
      key: 'websites',
      icon: <GlobalOutlined />,
      label: 'Websites',
      description: 'Website management',
    },
    {
      key: 'history',
      icon: <ClockCircleOutlined />,
      label: 'History',
      description: 'Activity history',
    },
    {
      key: 'achievements',
      icon: <TrophyOutlined />,
      label: 'Achievements',
      description: 'Rewards and badges',
    },
    {
      key: 'marketplace',
      icon: <ApiOutlined />,
      label: 'Marketplace',
      description: 'Tools and services',
    },
    {
      key: 'metaverse',
      icon: <GlobalOutlined />,
      label: 'Metaverse',
      description: 'Virtual world',
    },
    {
      key: 'explorer',
      icon: <SearchOutlined />,
      label: 'Explorer',
      description: 'Blockchain explorer',
    },
    {
      key: 'database',
      icon: <DatabaseOutlined />,
      label: 'Database',
      description: 'Data management',
    },
    {
      key: 'cluster',
      icon: <ClusterOutlined />,
      label: 'Cluster',
      description: 'Node management',
    },
    {
      key: 'laboratory',
      icon: <BugOutlined />,
      label: 'Laboratory',
      description: 'R&D tools',
    },
    {
      key: 'workflow-demo',
      icon: <ExperimentOutlined />,
      label: 'Workflow Demo',
      description: 'Component showcase',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      description: 'Configuration',
    },
  ];

  return (
    <Sider
      width={MaterialComponentSizes.sidebar.lg}
      collapsedWidth={80}
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        backgroundColor: MaterialDarkTheme.background.surface,
        borderRight: `1px solid ${MaterialDarkTheme.border.default}`,
        boxShadow: MaterialElevation.level1,
        transition: `all ${MaterialTransitions.duration.medium} ${MaterialTransitions.easing.standard}`,
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Logo and Brand */}
      <div style={{
        padding: MaterialSpacing.md,
        borderBottom: `1px solid ${MaterialDarkTheme.border.default}`,
        minHeight: MaterialComponentSizes.header.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed ? (
          <Space align="center" size={MaterialSpacing.sm}>
            <div style={{
              width: '40px',
              height: '40px',
              background: MaterialColors.gradients?.primary || `linear-gradient(135deg, ${MaterialColors.primary[60]} 0%, ${MaterialColors.primary[80]} 100%)`,
              borderRadius: MaterialBorderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: MaterialElevation.level2,
            }}>
              LD
            </div>
            <div>
              <Title 
                level={4} 
                style={{ 
                  margin: 0, 
                  color: MaterialDarkTheme.text.primary,
                  fontSize: MaterialTypography.titleMedium.fontSize,
                  fontWeight: MaterialTypography.titleMedium.fontWeight,
                  lineHeight: MaterialTypography.titleMedium.lineHeight,
                }}
              >
                LightDom
              </Title>
              <Text 
                style={{ 
                  fontSize: MaterialTypography.bodySmall.fontSize,
                  color: MaterialDarkTheme.text.secondary,
                  fontWeight: MaterialTypography.bodySmall.fontWeight,
                }}
              >
                Professional Platform
              </Text>
            </div>
          </Space>
        ) : (
          <div style={{
            width: '40px',
            height: '40px',
            background: MaterialColors.gradients?.primary || `linear-gradient(135deg, ${MaterialColors.primary[60]} 0%, ${MaterialColors.primary[80]} 100%)`,
            borderRadius: MaterialBorderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: MaterialElevation.level2,
          }}>
            LD
          </div>
        )}
        
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse?.(!collapsed)}
          style={{
            color: MaterialDarkTheme.text.secondary,
            borderRadius: MaterialBorderRadius.sm,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </div>

      {/* Mining Status Card */}
      {!collapsed && (
        <div style={{ padding: MaterialSpacing.md }}>
          <Card
            size="small"
            style={{
              backgroundColor: MaterialDarkTheme.background.elevated,
              border: `1px solid ${MaterialColors.primary[30]}`,
              borderRadius: MaterialBorderRadius.md,
              boxShadow: MaterialElevation.level1,
              marginBottom: MaterialSpacing.md,
            }}
            bodyStyle={{ padding: MaterialSpacing.md }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: MaterialSpacing.sm }}>
                <ThunderboltOutlined 
                  style={{ 
                    fontSize: '32px', 
                    color: MaterialColors.primary[60],
                  }} 
                />
              </div>
              
              <Button
                type={miningActive ? 'default' : 'primary'}
                size="large"
                icon={miningActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={onMiningToggle}
                style={{ 
                  width: '100%', 
                  marginBottom: MaterialSpacing.sm,
                  height: MaterialComponentSizes.button.md.height,
                  fontWeight: 500,
                  borderRadius: MaterialBorderRadius.sm,
                  background: miningActive ? 'transparent' : MaterialColors.primary[60],
                  border: miningActive ? `1px solid ${MaterialDarkTheme.border.default}` : 'none',
                  color: miningActive ? MaterialDarkTheme.text.primary : 'white',
                  transition: `all ${MaterialTransitions.duration.short} ${MaterialTransitions.easing.standard}`,
                }}
              >
                {miningActive ? 'Stop Mining' : 'Start Mining'}
              </Button>
              
              <div style={{ 
                fontSize: MaterialTypography.bodySmall.fontSize,
                color: miningActive ? MaterialColors.success[50] : MaterialDarkTheme.text.secondary,
                fontWeight: MaterialTypography.labelMedium.fontWeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: miningActive ? MaterialColors.success[50] : MaterialDarkTheme.text.tertiary,
                  animation: miningActive ? 'pulse 2s infinite' : 'none',
                }} />
                {miningActive ? 'Mining Active' : 'Mining Inactive'}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: collapsed ? `${MaterialSpacing.sm} 0` : `0 ${MaterialSpacing.md}`,
      }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => onMenuSelect?.(key)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: MaterialTypography.bodyMedium.fontSize,
          }}
          items={menuItems.map((item, index) => ({
            key: item.key,
            icon: (
              <Tooltip 
                title={collapsed ? item.label : ''} 
                placement="right"
              >
                <span style={{ 
                  color: selectedKey === item.key ? MaterialColors.primary[60] : MaterialDarkTheme.text.secondary,
                  fontSize: '16px',
                }}>
                  {item.icon}
                </span>
              </Tooltip>
            ),
            label: !collapsed && (
              <div>
                <div style={{ 
                  color: selectedKey === item.key ? MaterialColors.primary[60] : MaterialDarkTheme.text.primary,
                  fontWeight: selectedKey === item.key ? 600 : 400,
                  fontSize: MaterialTypography.bodyMedium.fontSize,
                }}>
                  {item.label}
                </div>
                {!collapsed && (
                  <div style={{ 
                    fontSize: MaterialTypography.bodySmall.fontSize,
                    color: MaterialDarkTheme.text.tertiary,
                    marginTop: '2px',
                  }}>
                    {item.description}
                  </div>
                )}
              </div>
            ),
            style: {
              margin: collapsed ? '4px 8px' : '4px 0',
              borderRadius: MaterialBorderRadius.sm,
              transition: `all ${MaterialTransitions.duration.short} ${MaterialTransitions.easing.standard}`,
            },
          }))}
        />
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div style={{ 
          padding: MaterialSpacing.md,
          borderTop: `1px solid ${MaterialDarkTheme.border.default}`,
        }}>
          <Card
            size="small"
            style={{
              backgroundColor: MaterialDarkTheme.background.elevated,
              border: `1px solid ${MaterialDarkTheme.border.default}`,
              borderRadius: MaterialBorderRadius.md,
              boxShadow: MaterialElevation.level1,
            }}
            bodyStyle={{ padding: MaterialSpacing.sm }}
          >
            <Space align="center" size={MaterialSpacing.sm}>
              <Avatar 
                size={40} 
                icon={<UserOutlined />}
                style={{
                  backgroundColor: MaterialColors.primary[60],
                  border: `2px solid ${MaterialColors.primary[40]}`,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: MaterialTypography.bodyMedium.fontSize,
                  fontWeight: 600,
                  color: MaterialDarkTheme.text.primary,
                  marginBottom: '2px',
                }}>
                  Professional User
                </div>
                <div style={{ 
                  fontSize: MaterialTypography.bodySmall.fontSize,
                  color: MaterialDarkTheme.text.secondary,
                }}>
                  Administrator
                </div>
              </div>
              <Badge count={notifications} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{
                    color: MaterialDarkTheme.text.secondary,
                    borderRadius: MaterialBorderRadius.sm,
                    width: '32px',
                    height: '32px',
                  }}
                />
              </Badge>
            </Space>
          </Card>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 ${MaterialColors.success[50]}40;
          }
          70% {
            box-shadow: 0 0 0 10px ${MaterialColors.success[50]}00;
          }
          100% {
            box-shadow: 0 0 0 0 ${MaterialColors.success[50]}00;
          }
        }
        
        .ant-menu-item {
          transition: all ${MaterialTransitions.duration.short} ${MaterialTransitions.easing.standard} !important;
          margin: 4px 8px !important;
          border-radius: ${MaterialBorderRadius.sm} !important;
        }
        
        .ant-menu-item:hover {
          transform: translateX(4px) !important;
          background-color: ${MaterialColors.primary[10]} !important;
        }
        
        .ant-menu-item-selected {
          background-color: ${MaterialColors.primary[10]} !important;
          border-radius: ${MaterialBorderRadius.sm} !important;
        }
        
        .ant-menu-item-selected::after {
          display: none !important;
        }
      `}</style>
    </Sider>
  );
};

export default ProfessionalSidebar;

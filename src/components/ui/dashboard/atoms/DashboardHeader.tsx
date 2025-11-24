/**
 * Dashboard Header Atom - Material Design 3.0
 * 
 * A consistent header component for dashboard pages
 * Includes title, breadcrumbs, actions, and tabs
 */

import React, { ReactNode } from 'react';
import { Typography, Space, Breadcrumb, Button, Tabs } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { MaterialColors, MaterialSpacing } from '../../../../styles/MaterialDesignSystem';

const { Title, Text } = Typography;

export interface BreadcrumbItem {
  label: string;
  icon?: ReactNode;
  href?: string;
}

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
}

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  extra?: ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  icon,
  breadcrumbs,
  actions,
  tabs,
  activeTab,
  onTabChange,
  extra,
}) => {
  return (
    <div style={{ 
      marginBottom: MaterialSpacing.lg,
      borderBottom: `1px solid ${MaterialColors.neutral[20]}`,
      paddingBottom: MaterialSpacing.md,
    }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb style={{ marginBottom: MaterialSpacing.sm }}>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          {breadcrumbs.map((item, index) => (
            <Breadcrumb.Item key={index} href={item.href}>
              {item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}
              {item.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      {/* Header Content */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: tabs ? MaterialSpacing.md : 0,
      }}>
        {/* Title and Subtitle */}
        <Space direction="vertical" size="small">
          <div style={{ display: 'flex', alignItems: 'center', gap: MaterialSpacing.sm }}>
            {icon && (
              <div style={{ 
                fontSize: 32, 
                color: MaterialColors.primary[50],
                display: 'flex',
                alignItems: 'center',
              }}>
                {icon}
              </div>
            )}
            <Title 
              level={2} 
              style={{ 
                margin: 0,
                color: MaterialColors.neutral[90],
                fontWeight: 700,
              }}
            >
              {title}
            </Title>
          </div>
          {subtitle && (
            <Text style={{ 
              fontSize: 16, 
              color: MaterialColors.neutral[60],
            }}>
              {subtitle}
            </Text>
          )}
        </Space>

        {/* Actions */}
        {actions && (
          <Space size="middle">
            {actions}
          </Space>
        )}
      </div>

      {/* Extra Content */}
      {extra && (
        <div style={{ marginTop: MaterialSpacing.md }}>
          {extra}
        </div>
      )}

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={tabs.map(tab => ({
            key: tab.key,
            label: (
              <span>
                {tab.icon && <span style={{ marginRight: 8 }}>{tab.icon}</span>}
                {tab.label}
              </span>
            ),
          }))}
          style={{ marginTop: MaterialSpacing.sm }}
        />
      )}
    </div>
  );
};

export default DashboardHeader;

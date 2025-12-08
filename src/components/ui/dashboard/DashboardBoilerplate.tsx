/**
 * Dashboard Boilerplate Template - Material Design 3.0
 * 
 * A complete, reusable dashboard template that can be used for any category
 * Follows Material Design 3.0 principles and connects to database
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { Row, Col, Button, Empty, Spin } from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import DashboardCard from './atoms/DashboardCard';
import DashboardStat from './atoms/DashboardStat';
import DashboardHeader from './atoms/DashboardHeader';
import DashboardGrid from './atoms/DashboardGrid';
import DashboardSection from './atoms/DashboardSection';
import { MaterialSpacing } from '../../../styles/MaterialDesignSystem';

export interface DashboardBoilerplateProps {
  // Category Information
  categoryId: string;
  categoryName: string;
  categoryDisplayName: string;
  categoryIcon?: ReactNode;
  categoryDescription?: string;

  // Header Configuration
  breadcrumbs?: Array<{ label: string; icon?: ReactNode; href?: string }>;
  tabs?: Array<{ key: string; label: string; icon?: ReactNode }>;
  activeTab?: string;
  onTabChange?: (key: string) => void;

  // Stats Configuration
  stats?: Array<{
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string | number;
    description?: string;
  }>;

  // Main Content
  children?: ReactNode;

  // Actions
  onRefresh?: () => void;
  onCreate?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  customActions?: ReactNode;

  // Data
  loading?: boolean;
  error?: string | null;

  // API Configuration
  apiEndpoint?: string;
  fetchOnMount?: boolean;
}

const DashboardBoilerplate: React.FC<DashboardBoilerplateProps> = ({
  categoryId,
  categoryName,
  categoryDisplayName,
  categoryIcon,
  categoryDescription,
  breadcrumbs,
  tabs,
  activeTab,
  onTabChange,
  stats = [],
  children,
  onRefresh,
  onCreate,
  onExport,
  onSettings,
  customActions,
  loading = false,
  error = null,
  apiEndpoint,
  fetchOnMount = true,
}) => {
  const [data, setData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch data from API if endpoint provided
  useEffect(() => {
    if (fetchOnMount && apiEndpoint) {
      fetchData();
    }
  }, [apiEndpoint, fetchOnMount]);

  const fetchData = async () => {
    if (!apiEndpoint) return;
    
    setDataLoading(true);
    try {
      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchData();
    }
  };

  // Build default actions
  const defaultActions = (
    <>
      {onRefresh || apiEndpoint ? (
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
      ) : null}
      {onCreate && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Create New
        </Button>
      )}
      {onExport && (
        <Button icon={<DownloadOutlined />} onClick={onExport}>
          Export
        </Button>
      )}
      {onSettings && (
        <Button icon={<SettingOutlined />} onClick={onSettings}>
          Settings
        </Button>
      )}
      {customActions}
    </>
  );

  const isLoading = loading || dataLoading;

  return (
    <div style={{ padding: MaterialSpacing.lg }}>
      {/* Dashboard Header */}
      <DashboardHeader
        title={categoryDisplayName}
        subtitle={categoryDescription}
        icon={categoryIcon}
        breadcrumbs={breadcrumbs}
        actions={defaultActions}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Error State */}
      {error && (
        <DashboardCard style={{ marginBottom: MaterialSpacing.lg }}>
          <Empty
            description={error}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </DashboardCard>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 400,
        }}>
          <Spin size="large" tip="Loading dashboard data..." />
        </div>
      )}

      {/* Stats Section */}
      {!isLoading && !error && stats.length > 0 && (
        <DashboardSection divider={false} marginTop={false}>
          <DashboardGrid columns={stats.length > 4 ? 4 : stats.length as any}>
            {stats.map((stat, index) => (
              <DashboardCard key={index} hoverable={false}>
                <DashboardStat
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  trend={stat.trend}
                  trendValue={stat.trendValue}
                  description={stat.description}
                />
              </DashboardCard>
            ))}
          </DashboardGrid>
        </DashboardSection>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <DashboardSection 
          divider={stats.length > 0}
          marginTop={stats.length > 0}
        >
          {children || (
            <DashboardCard>
              <Empty
                description="No content configured for this dashboard"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </DashboardCard>
          )}
        </DashboardSection>
      )}
    </div>
  );
};

export default DashboardBoilerplate;

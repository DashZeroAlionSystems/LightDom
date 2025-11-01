/**
 * Reusable Dashboard Widget Components
 * Material Design 3 compliant, schema-driven widgets
 * Following n8n patterns for component composition
 */

import React, { useEffect, useState } from 'react';
import { Card, Statistic, Progress, Table, List, Tag, Space, Typography, Spin, Empty } from 'antd';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const { Title, Text } = Typography;

// ============================================================================
// Base Widget Wrapper
// ============================================================================

interface WidgetWrapperProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  refreshInterval?: number;
  onRefresh?: () => void;
}

export function WidgetWrapper({
  title,
  description,
  loading,
  error,
  children,
  actions,
  refreshInterval,
  onRefresh,
}: WidgetWrapperProps) {
  useEffect(() => {
    if (refreshInterval && onRefresh) {
      const interval = setInterval(onRefresh, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, onRefresh]);

  return (
    <Card
      title={title}
      extra={actions}
      className="h-full shadow-sm hover:shadow-md transition-shadow"
    >
      {description && (
        <Text type="secondary" className="block mb-4">
          {description}
        </Text>
      )}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Spin size="large" />
        </div>
      )}
      {error && (
        <Empty
          description={<Text type="danger">{error}</Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
      {!loading && !error && children}
    </Card>
  );
}

// ============================================================================
// Stat Card Widget
// ============================================================================

interface StatCardWidgetProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon?: string;
  format?: 'number' | 'percentage' | 'currency';
  description?: string;
  loading?: boolean;
  threshold?: number;
  comparisonLabel?: string;
}

export function StatCardWidget({
  title,
  value,
  change,
  trend,
  icon,
  format = 'number',
  description,
  loading,
  threshold,
  comparisonLabel = 'vs last period',
}: StatCardWidgetProps) {
  const IconComponent = getIconComponent(icon);
  const isOverThreshold = threshold && Number(value) > threshold;

  const formattedValue = formatValue(value, format);
  const trendColor = trend === 'up' ? 'text-success' : 'text-error';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <WidgetWrapper loading={loading}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Text type="secondary" className="text-sm">
            {title}
          </Text>
          <div className="mt-2">
            <Title level={3} className="mb-0">
              {formattedValue}
            </Title>
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              <Text className={trendColor}>
                {change > 0 ? '+' : ''}
                {change}%
              </Text>
              <Text type="secondary" className="text-xs">
                {comparisonLabel}
              </Text>
            </div>
          )}
          {description && (
            <Text type="secondary" className="text-xs mt-1 block">
              {description}
            </Text>
          )}
        </div>
        {IconComponent && (
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${
              isOverThreshold ? 'bg-error/10' : 'bg-primary/10'
            }`}
          >
            <IconComponent
              className={`h-6 w-6 ${isOverThreshold ? 'text-error' : 'text-primary'}`}
            />
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}

// ============================================================================
// Chart Widget
// ============================================================================

interface ChartWidgetProps {
  title: string;
  description?: string;
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'donut';
  data: any[];
  dataKeys?: {
    xAxis?: string;
    yAxis?: string | string[];
    name?: string;
    value?: string;
  };
  colors?: string[];
  loading?: boolean;
  height?: number;
}

export function ChartWidget({
  title,
  description,
  chartType,
  data,
  dataKeys = {},
  colors = ['#6750A4', '#7958A5', '#D0BCFF', '#958DA5'],
  loading,
  height = 300,
}: ChartWidgetProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={dataKeys.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {Array.isArray(dataKeys.yAxis) ? (
                dataKeys.yAxis.map((key, idx) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={dataKeys.yAxis || 'value'}
                  stroke={colors[0]}
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={dataKeys.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {Array.isArray(dataKeys.yAxis) ? (
                dataKeys.yAxis.map((key, idx) => (
                  <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} />
                ))
              ) : (
                <Bar dataKey={dataKeys.yAxis || 'value'} fill={colors[0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={dataKeys.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {Array.isArray(dataKeys.yAxis) ? (
                dataKeys.yAxis.map((key, idx) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.6}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey={dataKeys.yAxis || 'value'}
                  stroke={colors[0]}
                  fill={colors[0]}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={chartType === 'donut' ? 80 : 100}
                innerRadius={chartType === 'donut' ? 50 : 0}
                fill="#8884d8"
                dataKey={dataKeys.value || 'value'}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <Empty description="Unsupported chart type" />;
    }
  };

  return (
    <WidgetWrapper title={title} description={description} loading={loading}>
      {data && data.length > 0 ? (
        renderChart()
      ) : (
        <Empty description="No data available" />
      )}
    </WidgetWrapper>
  );
}

// ============================================================================
// Table Widget
// ============================================================================

interface TableWidgetProps {
  title: string;
  description?: string;
  columns: any[];
  data: any[];
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (record: any) => void;
}

export function TableWidget({
  title,
  description,
  columns,
  data,
  loading,
  pagination = true,
  pageSize = 10,
  onRowClick,
}: TableWidgetProps) {
  return (
    <WidgetWrapper title={title} description={description} loading={loading}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={pagination ? { pageSize } : false}
        onRow={(record) => ({
          onClick: () => onRowClick && onRowClick(record),
          style: { cursor: onRowClick ? 'pointer' : 'default' },
        })}
        scroll={{ x: true }}
      />
    </WidgetWrapper>
  );
}

// ============================================================================
// List Widget
// ============================================================================

interface ListWidgetProps {
  title: string;
  description?: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

export function ListWidget({
  title,
  description,
  items,
  renderItem,
  loading,
  pagination = false,
  pageSize = 10,
}: ListWidgetProps) {
  return (
    <WidgetWrapper title={title} description={description} loading={loading}>
      <List
        dataSource={items}
        renderItem={renderItem}
        pagination={pagination ? { pageSize } : false}
      />
    </WidgetWrapper>
  );
}

// ============================================================================
// Progress Widget
// ============================================================================

interface ProgressWidgetProps {
  title: string;
  description?: string;
  percent: number;
  status?: 'success' | 'exception' | 'active' | 'normal';
  showInfo?: boolean;
  strokeColor?: string;
  type?: 'line' | 'circle' | 'dashboard';
  loading?: boolean;
}

export function ProgressWidget({
  title,
  description,
  percent,
  status,
  showInfo = true,
  strokeColor,
  type = 'line',
  loading,
}: ProgressWidgetProps) {
  return (
    <WidgetWrapper title={title} description={description} loading={loading}>
      <div className="py-4">
        <Progress
          percent={percent}
          status={status}
          showInfo={showInfo}
          strokeColor={strokeColor}
          type={type}
        />
      </div>
    </WidgetWrapper>
  );
}

// ============================================================================
// Activity Timeline Widget
// ============================================================================

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
}

interface TimelineWidgetProps {
  title: string;
  description?: string;
  items: TimelineItem[];
  loading?: boolean;
}

export function TimelineWidget({
  title,
  description,
  items,
  loading,
}: TimelineWidgetProps) {
  return (
    <WidgetWrapper title={title} description={description} loading={loading}>
      <div className="space-y-4">
        {items.map((item, index) => {
          const IconComponent = getIconComponent(item.icon);
          const colorClass = getTypeColor(item.type);

          return (
            <div key={item.id} className="flex gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${colorClass}`}
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Text strong>{item.title}</Text>
                  <Text type="secondary" className="text-xs">
                    {formatTimestamp(item.timestamp)}
                  </Text>
                </div>
                {item.description && (
                  <Text type="secondary" className="text-sm">
                    {item.description}
                  </Text>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function getIconComponent(icon?: string) {
  const iconMap: Record<string, any> = {
    users: Users,
    dollar: DollarSign,
    activity: Activity,
    trending_up: TrendingUp,
    trending_down: TrendingDown,
    check: CheckCircle,
    alert: AlertCircle,
    clock: Clock,
  };

  return icon ? iconMap[icon] : null;
}

function formatValue(value: string | number, format: string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(numValue);
    case 'percentage':
      return `${numValue}%`;
    default:
      return numValue.toLocaleString();
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getTypeColor(type?: string): string {
  const colorMap: Record<string, string> = {
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
  };

  return type ? colorMap[type] : 'bg-primary/10 text-primary';
}

// Export all widget components
export const DashboardWidgets = {
  WidgetWrapper,
  StatCardWidget,
  ChartWidget,
  TableWidget,
  ListWidget,
  ProgressWidget,
  TimelineWidget,
};

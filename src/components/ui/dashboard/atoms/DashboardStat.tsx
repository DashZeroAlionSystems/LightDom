/**
 * Dashboard Stat Atom - Material Design 3.0
 * 
 * A consistent statistic display component for dashboards
 * Shows key metrics with icons, trends, and formatting
 */

import React, { ReactNode } from 'react';
import { Statistic, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { MaterialColors, MaterialSpacing } from '../../../../styles/MaterialDesignSystem';

const { Text } = Typography;

export interface DashboardStatProps {
  title: string;
  value: string | number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  description?: string;
  valueStyle?: React.CSSProperties;
  loading?: boolean;
  precision?: number;
  decimalSeparator?: string;
  groupSeparator?: string;
}

const DashboardStat: React.FC<DashboardStatProps> = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  trend,
  trendValue,
  description,
  valueStyle = {},
  loading = false,
  precision,
  decimalSeparator,
  groupSeparator,
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return MaterialColors.success[50];
      case 'down':
        return MaterialColors.error[50];
      default:
        return MaterialColors.neutral[50];
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpOutlined />;
      case 'down':
        return <ArrowDownOutlined />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Title and Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: MaterialSpacing.xs }}>
          {icon && (
            <div style={{ 
              fontSize: 20, 
              color: MaterialColors.primary[50],
              display: 'flex',
              alignItems: 'center',
            }}>
              {icon}
            </div>
          )}
          <Text style={{ 
            fontSize: 14, 
            color: MaterialColors.neutral[60],
            fontWeight: 500,
          }}>
            {title}
          </Text>
        </div>

        {/* Value */}
        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          loading={loading}
          precision={precision}
          decimalSeparator={decimalSeparator}
          groupSeparator={groupSeparator}
          valueStyle={{
            fontSize: 28,
            fontWeight: 600,
            color: MaterialColors.neutral[90],
            ...valueStyle,
          }}
        />

        {/* Trend and Description */}
        {(trend || description) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: MaterialSpacing.sm }}>
            {trend && trendValue && (
              <Space size={4} style={{ color: getTrendColor() }}>
                {getTrendIcon()}
                <Text style={{ fontSize: 12, color: getTrendColor(), fontWeight: 500 }}>
                  {trendValue}
                </Text>
              </Space>
            )}
            {description && (
              <Text style={{ 
                fontSize: 12, 
                color: MaterialColors.neutral[50],
              }}>
                {description}
              </Text>
            )}
          </div>
        )}
      </Space>
    </div>
  );
};

export default DashboardStat;

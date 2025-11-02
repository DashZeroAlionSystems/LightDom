/**
 * Enhanced Admin Overview - Uses new atomic component system
 * Demonstrates composition of atoms into molecules and organisms
 */

import React, { useState, useEffect } from 'react';
import { Row, Col, Spin } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  DatabaseOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ApiOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { StatCard } from '../molecules/StatCard';
import { InfoPanel, DetailRow } from '../molecules/InfoPanel';
import { Heading, Text } from '../atoms/Typography';
import { StatusBadge } from '../atoms/Badge';

// Utility constants
const BYTES_TO_GB = 1024 * 1024 * 1024;

// Utility function for byte conversion
const bytesToGB = (bytes: number): string => {
  return (bytes / BYTES_TO_GB).toFixed(2);
};

interface SystemHealth {
  api: { status: 'online' | 'offline'; latency: number };
  database: { status: 'online' | 'offline'; connections: number };
  cache: { status: 'online' | 'offline'; hitRate: number };
  storage: { status: 'online' | 'offline'; used: number; total: number };
}

interface QuickStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  optimizations: number;
  spaceSaved: number;
  activeMiners: number;
}

const EnhancedAdminOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls
      setSystemHealth({
        api: { status: 'online', latency: 45 },
        database: { status: 'online', connections: 12 },
        cache: { status: 'online', hitRate: 94.5 },
        storage: { status: 'online', used: 234, total: 500 },
      });

      setQuickStats({
        totalUsers: 15420,
        activeUsers: 2340,
        revenue: 45678,
        optimizations: 8934,
        spaceSaved: 123456789012,
        activeMiners: 89,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Heading level="h2" className="mb-2">
          Admin Overview
        </Heading>
        <Text color="muted" size="lg">
          Monitor your platform's performance and key metrics at a glance
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label="Total Users"
            value={quickStats?.totalUsers.toLocaleString() || '0'}
            icon={<TeamOutlined style={{ fontSize: 24 }} />}
            variant="primary"
            trend={{
              direction: 'up',
              value: '12.5%',
              label: 'from last month',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label="Active Users"
            value={quickStats?.activeUsers.toLocaleString() || '0'}
            icon={<UserOutlined style={{ fontSize: 24 }} />}
            variant="success"
            trend={{
              direction: 'up',
              value: '8.3%',
              label: 'from last week',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label="Monthly Revenue"
            value={`$${quickStats?.revenue.toLocaleString() || '0'}`}
            icon={<DollarOutlined style={{ fontSize: 24 }} />}
            variant="warning"
            trend={{
              direction: 'up',
              value: '15.2%',
              label: 'from last month',
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label="Active Miners"
            value={quickStats?.activeMiners || 0}
            icon={<RocketOutlined style={{ fontSize: 24 }} />}
            variant="default"
            trend={{
              direction: 'up',
              value: '5',
              label: 'new today',
            }}
          />
        </Col>
      </Row>

      {/* System Health & Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <InfoPanel
            title="System Health"
            description="Real-time system status and performance"
            icon={<CheckCircleOutlined style={{ fontSize: 20 }} />}
            status="active"
          >
            <div className="space-y-2">
              <DetailRow
                label="API Service"
                value={
                  systemHealth?.api.status === 'online' ? (
                    <StatusBadge status="online" />
                  ) : (
                    <StatusBadge status="offline" />
                  )
                }
                icon={<ApiOutlined />}
              />
              <DetailRow
                label="Latency"
                value={`${systemHealth?.api.latency || 0}ms`}
              />
              <DetailRow
                label="Database"
                value={
                  systemHealth?.database.status === 'online' ? (
                    <StatusBadge status="online" />
                  ) : (
                    <StatusBadge status="offline" />
                  )
                }
                icon={<DatabaseOutlined />}
              />
              <DetailRow
                label="Connections"
                value={systemHealth?.database.connections || 0}
              />
              <DetailRow
                label="Cache"
                value={
                  systemHealth?.cache.status === 'online' ? (
                    <StatusBadge status="online" />
                  ) : (
                    <StatusBadge status="offline" />
                  )
                }
                icon={<CloudServerOutlined />}
              />
              <DetailRow
                label="Hit Rate"
                value={`${systemHealth?.cache.hitRate || 0}%`}
              />
            </div>
          </InfoPanel>
        </Col>

        <Col xs={24} lg={12}>
          <InfoPanel
            title="Storage & Performance"
            description="Resource utilization metrics"
            icon={<DatabaseOutlined style={{ fontSize: 20 }} />}
            status="active"
          >
            <div className="space-y-2">
              <DetailRow
                label="Storage Used"
                value={`${systemHealth?.storage.used || 0} GB`}
              />
              <DetailRow
                label="Total Storage"
                value={`${systemHealth?.storage.total || 0} GB`}
              />
              <DetailRow
                label="Utilization"
                value={`${Math.round(
                  ((systemHealth?.storage.used || 0) /
                    (systemHealth?.storage.total || 1)) *
                    100
                )}%`}
              />
              <DetailRow
                label="Optimizations"
                value={quickStats?.optimizations.toLocaleString() || '0'}
              />
              <DetailRow
                label="Space Saved"
                value={`${bytesToGB(quickStats?.spaceSaved || 0)} GB`}
              />
            </div>
          </InfoPanel>
        </Col>
      </Row>

      {/* Recent Activity */}
      <InfoPanel
        title="Recent Activity"
        description="Latest system events and updates"
        icon={<ExclamationCircleOutlined style={{ fontSize: 20 }} />}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircleOutlined className="text-green-600 text-lg mt-0.5" />
            <div className="flex-1">
              <Text weight="medium">New user registration</Text>
              <Text size="sm" color="muted" className="block mt-1">
                alice@example.com registered 2 minutes ago
              </Text>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <ExclamationCircleOutlined className="text-yellow-600 text-lg mt-0.5" />
            <div className="flex-1">
              <Text weight="medium">High API usage detected</Text>
              <Text size="sm" color="muted" className="block mt-1">
                IP 192.168.1.100 exceeded rate limit 15 minutes ago
              </Text>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <ApiOutlined className="text-blue-600 text-lg mt-0.5" />
            <div className="flex-1">
              <Text weight="medium">Blockchain sync completed</Text>
              <Text size="sm" color="muted" className="block mt-1">
                Block #12345 synced 1 hour ago
              </Text>
            </div>
          </div>
        </div>
      </InfoPanel>
    </div>
  );
};

export default EnhancedAdminOverview;

/**
 * Settings Overview Component
 * Quick overview of key application settings
 */

import React from 'react';
import { Card, Row, Col, Statistic, Tag, Space, Typography, Tooltip, Progress } from 'antd';
import {
  SettingOutlined,
  ThunderboltOutlined,
  BlockOutlined,
  SecurityScanOutlined,
  ApiOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  MailOutlined,
  MonitorOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useAdminSettings } from '../../../hooks/state/useAdminSettings';

const { Title, Text } = Typography;

interface SettingsOverviewProps {
  className?: string;
}

const SettingsOverview: React.FC<SettingsOverviewProps> = ({ className }) => {
  const { settings, loading } = useAdminSettings();

  if (loading || !settings) {
    return (
      <Card loading className={className}>
        <Title level={4}>Settings Overview</Title>
      </Card>
    );
  }

  const getStatusIcon = (value: boolean) => {
    return value ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
    );
  };

  const getStatusColor = (value: boolean) => {
    return value ? 'success' : 'warning';
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'red';
      case 'staging': return 'orange';
      case 'development': return 'green';
      default: return 'default';
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'light': return 'blue';
      case 'dark': return 'purple';
      case 'auto': return 'cyan';
      default: return 'default';
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'mainnet': return 'red';
      case 'testnet': return 'orange';
      case 'local': return 'green';
      default: return 'default';
    }
  };

  return (
    <div className={className}>
      <Title level={4}>
        <SettingOutlined /> Settings Overview
      </Title>
      
      <Row gutter={[16, 16]}>
        {/* General Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="Environment"
              value={settings.general.environment}
              prefix={<SettingOutlined />}
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color={getEnvironmentColor(settings.general.environment)}>
                {settings.general.environment.toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">Debug:</Text> {getStatusIcon(settings.general.debugMode)}
                </div>
                <div>
                  <Text type="secondary">Maintenance:</Text> {getStatusIcon(settings.general.maintenanceMode)}
                </div>
                <div>
                  <Text type="secondary">Registration:</Text> {getStatusIcon(settings.general.enableRegistration)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Performance Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="Performance"
              value={settings.performance.maxConcurrentOptimizations}
              prefix={<ThunderboltOutlined />}
              suffix="concurrent"
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">Cache:</Text> {getStatusIcon(settings.performance.cacheEnabled)}
                </div>
                <div>
                  <Text type="secondary">Compression:</Text> {getStatusIcon(settings.performance.enableCompression)}
                </div>
                <div>
                  <Text type="secondary">CDN:</Text> {getStatusIcon(settings.performance.enableCDN)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Blockchain Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="Blockchain"
              value={settings.blockchain.network}
              prefix={<BlockOutlined />}
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color={getNetworkColor(settings.blockchain.network)}>
                {settings.blockchain.network.toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">Auto Gas:</Text> {getStatusIcon(settings.blockchain.enableAutoGasEstimation)}
                </div>
                <div>
                  <Text type="secondary">Mining:</Text> {getStatusIcon(settings.blockchain.enableMining)}
                </div>
                <div>
                  <Text type="secondary">Events:</Text> {getStatusIcon(settings.blockchain.enableEventLogging)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="Security"
              value={settings.security.enableHTTPS ? 'HTTPS' : 'HTTP'}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">CORS:</Text> {getStatusIcon(settings.security.enableCORS)}
                </div>
                <div>
                  <Text type="secondary">Rate Limit:</Text> {getStatusIcon(settings.security.enableRateLimiting)}
                </div>
                <div>
                  <Text type="secondary">2FA:</Text> {getStatusIcon(settings.security.enableTwoFactorAuth)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* API Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="API"
              value={settings.api.apiVersion}
              prefix={<ApiOutlined />}
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">Swagger:</Text> {getStatusIcon(settings.api.enableSwagger)}
                </div>
                <div>
                  <Text type="secondary">GraphQL:</Text> {getStatusIcon(settings.api.enableGraphQL)}
                </div>
                <div>
                  <Text type="secondary">WebSocket:</Text> {getStatusIcon(settings.api.enableWebSocket)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* UI Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="Theme"
              value={settings.ui.theme}
              prefix={<BgColorsOutlined />}
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color={getThemeColor(settings.ui.theme)}>
                {settings.ui.theme.toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">Animations:</Text> {getStatusIcon(settings.ui.enableAnimations)}
                </div>
                <div>
                  <Text type="secondary">Tooltips:</Text> {getStatusIcon(settings.ui.enableTooltips)}
                </div>
                <div>
                  <Text type="secondary">Notifications:</Text> {getStatusIcon(settings.ui.enableNotifications)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Database Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="Database"
              value={settings.database.host}
              prefix={<DatabaseOutlined />}
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">SSL:</Text> {getStatusIcon(settings.database.ssl)}
                </div>
                <div>
                  <Text type="secondary">Backup:</Text> {getStatusIcon(settings.database.enableBackup)}
                </div>
                <div>
                  <Text type="secondary">Replication:</Text> {getStatusIcon(settings.database.enableReplication)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Email Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="Email"
              value={settings.email.provider}
              prefix={<MailOutlined />}
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">TLS:</Text> {getStatusIcon(settings.email.enableTLS)}
                </div>
                <div>
                  <Text type="secondary">Auth:</Text> {getStatusIcon(settings.email.enableAuthentication)}
                </div>
                <div>
                  <Text type="secondary">Queue:</Text> {getStatusIcon(settings.email.enableEmailQueue)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Monitoring Settings */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card size="small" className="settings-overview-card">
            <Statistic
              title="Monitoring"
              value={settings.monitoring.logLevel}
              prefix={<MonitorOutlined />}
              valueStyle={{ fontSize: '14px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">Metrics:</Text> {getStatusIcon(settings.monitoring.enableMetrics)}
                </div>
                <div>
                  <Text type="secondary">Health:</Text> {getStatusIcon(settings.monitoring.enableHealthChecks)}
                </div>
                <div>
                  <Text type="secondary">Alerts:</Text> {getStatusIcon(settings.monitoring.enableAlerting)}
                </div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <style>{`
        .settings-overview-card {
          height: 100%;
          transition: all 0.3s ease;
        }
        
        .settings-overview-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        
        .settings-overview-card .ant-statistic-title {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .settings-overview-card .ant-statistic-content {
          font-size: 14px;
          color: #262626;
        }
      `}</style>
    </div>
  );
};

export default SettingsOverview;
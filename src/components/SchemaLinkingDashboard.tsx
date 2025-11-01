import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Button, Switch, message, Spin, Tag, Statistic, Progress, Badge } from 'antd';
import {
  DatabaseOutlined,
  LinkOutlined,
  AppstoreOutlined,
  BranchesOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  BulbOutlined,
  NodeIndexOutlined,
  ApiOutlined,
  SettingOutlined,
  DashboardOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import SchemaVisualization from './schema-linking/SchemaVisualization';
import WorkflowVisualization from './schema-linking/WorkflowVisualization';
import ComponentGallery from './schema-linking/ComponentGallery';
import InfoChartReport from './schema-linking/InfoChartReport';
import DashboardPreview from './schema-linking/DashboardPreview';

const { TabPane } = Tabs;

interface SchemaLinkingDashboardProps {
  darkMode?: boolean;
  onDarkModeToggle?: (enabled: boolean) => void;
}

interface AnalysisData {
  tables: number;
  relationships: number;
  features: number;
  dashboards?: any[];
  workflows?: any[];
}

const SchemaLinkingDashboard: React.FC<SchemaLinkingDashboardProps> = ({
  darkMode: initialDarkMode = false,
  onDarkModeToggle
}) => {
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [runnerStatus, setRunnerStatus] = useState<any>(null);

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (onDarkModeToggle) {
      onDarkModeToggle(enabled);
    }
  };

  useEffect(() => {
    loadInitialData();
    loadRunnerStatus();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load schema analysis
      const analysisResponse = await fetch('/api/schema-linking/analyze');
      const analysisResult = await analysisResponse.json();
      
      if (analysisResult.success) {
        setAnalysisData(analysisResult.data);
      }

      // Load features
      const featuresResponse = await fetch('/api/schema-linking/features');
      const featuresResult = await featuresResponse.json();
      
      if (featuresResult.success) {
        setFeatures(featuresResult.data.features);
        if (featuresResult.data.features.length > 0) {
          setSelectedFeature(featuresResult.data.features[0].name);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('Failed to load schema data');
    } finally {
      setLoading(false);
    }
  };

  const loadRunnerStatus = async () => {
    try {
      const response = await fetch('/api/schema-linking/runner/status');
      const result = await response.json();
      if (result.success) {
        setRunnerStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to load runner status:', error);
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schema-linking/runner/run', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        message.success('Schema analysis completed successfully');
        await loadInitialData();
      } else {
        message.error('Failed to run analysis');
      }
    } catch (error) {
      console.error('Failed to run analysis:', error);
      message.error('Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/schema-linking/export', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        message.success(`Exported to ${result.data.outputPath}`);
      }
    } catch (error) {
      console.error('Failed to export:', error);
      message.error('Failed to export schemas');
    }
  };

  const handleStartRunner = async () => {
    try {
      const response = await fetch('/api/schema-linking/runner/start', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        message.success('Automated runner started');
        await loadRunnerStatus();
      }
    } catch (error) {
      message.error('Failed to start runner');
    }
  };

  const handleStopRunner = async () => {
    try {
      const response = await fetch('/api/schema-linking/runner/stop', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        message.success('Automated runner stopped');
        await loadRunnerStatus();
      }
    } catch (error) {
      message.error('Failed to stop runner');
    }
  };

  return (
    <div className={`schema-linking-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      <style>{`
        .schema-linking-dashboard {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
        }
        .schema-linking-dashboard.dark-mode {
          background: #141414;
          color: #fff;
        }
        .schema-linking-dashboard.dark-mode .ant-card {
          background: #1f1f1f;
          border-color: #303030;
        }
        .schema-linking-dashboard.dark-mode .ant-statistic-title,
        .schema-linking-dashboard.dark-mode .ant-card-head-title {
          color: rgba(255, 255, 255, 0.85);
        }
        .schema-linking-dashboard.dark-mode .ant-tabs-tab {
          color: rgba(255, 255, 255, 0.65);
        }
        .schema-linking-dashboard.dark-mode .ant-tabs-tab-active {
          color: #1890ff;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .dashboard-title {
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .dashboard-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .stats-card {
          margin-bottom: 24px;
        }
        .feature-selector {
          margin-bottom: 16px;
        }
      `}</style>

      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <DatabaseOutlined /> Schema Linking Dashboard
        </h1>
        <div className="dashboard-actions">
          <Switch
            checked={darkMode}
            onChange={handleDarkModeToggle}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRunAnalysis} loading={loading}>
            Run Analysis
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
          {runnerStatus?.isRunning ? (
            <Button danger onClick={handleStopRunner}>
              Stop Runner
            </Button>
          ) : (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartRunner}>
              Start Runner
            </Button>
          )}
        </div>
      </div>

      {loading && !analysisData ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Loading schema data..." />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="stats-card">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Database Tables"
                  value={analysisData?.tables || 0}
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Relationships"
                  value={analysisData?.relationships || 0}
                  prefix={<LinkOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Feature Groups"
                  value={analysisData?.features || 0}
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Runner Status"
                  value={runnerStatus?.isRunning ? 'Running' : 'Stopped'}
                  prefix={<ApiOutlined />}
                  valueStyle={{ color: runnerStatus?.isRunning ? '#52c41a' : '#8c8c8c' }}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
              <TabPane
                tab={
                  <span>
                    <NodeIndexOutlined /> Schema Overview
                  </span>
                }
                key="overview"
              >
                <SchemaVisualization
                  features={features}
                  selectedFeature={selectedFeature}
                  onFeatureSelect={setSelectedFeature}
                  darkMode={darkMode}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BranchesOutlined /> Workflow
                  </span>
                }
                key="workflow"
              >
                <WorkflowVisualization
                  feature={selectedFeature}
                  darkMode={darkMode}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <AppstoreOutlined /> Components
                  </span>
                }
                key="components"
              >
                <ComponentGallery
                  feature={selectedFeature}
                  darkMode={darkMode}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <DashboardOutlined /> Dashboard Preview
                  </span>
                }
                key="dashboard"
              >
                <DashboardPreview
                  feature={selectedFeature}
                  darkMode={darkMode}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <LineChartOutlined /> Reports
                  </span>
                }
                key="reports"
              >
                <InfoChartReport
                  analysisData={analysisData}
                  features={features}
                  darkMode={darkMode}
                />
              </TabPane>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
};

export default SchemaLinkingDashboard;

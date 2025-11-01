import React, { useMemo } from 'react';
import { Card, Row, Col, Progress, Statistic, Tag, Timeline, Empty } from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  DatabaseOutlined,
  LinkOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Column, Pie, Line } from '@ant-design/plots';

interface InfoChartReportProps {
  analysisData: any;
  features: any[];
  darkMode: boolean;
}

const InfoChartReport: React.FC<InfoChartReportProps> = ({
  analysisData,
  features,
  darkMode
}) => {
  // Prepare data for charts
  const featureDistribution = useMemo(() => {
    return features.map(f => ({
      feature: f.name,
      tables: f.tables?.length || 0,
      settings: f.settings?.length || 0,
      options: f.options?.length || 0
    }));
  }, [features]);

  const relationshipTypeData = useMemo(() => {
    const types: Record<string, number> = {
      foreign_key: 0,
      semantic: 0,
      naming_pattern: 0
    };
    
    // This would come from the API in a real scenario
    // For now, creating sample data
    return [
      { type: 'Foreign Key', value: Math.floor((analysisData?.relationships || 0) * 0.6) },
      { type: 'Semantic', value: Math.floor((analysisData?.relationships || 0) * 0.3) },
      { type: 'Naming Pattern', value: Math.floor((analysisData?.relationships || 0) * 0.1) }
    ];
  }, [analysisData]);

  const tablesByFeature = useMemo(() => {
    return features.map(f => ({
      name: f.name,
      value: f.tables?.length || 0
    }));
  }, [features]);

  // Column chart config for feature distribution
  const columnConfig: any = {
    data: featureDistribution,
    xField: 'feature',
    yField: 'tables',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    theme: darkMode ? 'dark' : 'light',
    color: ['#1890ff', '#52c41a', '#faad14'],
    label: {
      position: 'top',
      style: {
        fill: darkMode ? '#fff' : '#000',
        opacity: 0.6,
      },
    },
  };

  // Pie chart config for relationship types
  const pieConfig: any = {
    data: relationshipTypeData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    theme: darkMode ? 'dark' : 'light',
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
      style: {
        fill: darkMode ? '#fff' : '#000',
      },
    },
    statistic: {
      title: {
        style: {
          color: darkMode ? '#fff' : '#000',
          fontSize: '14px',
        },
        content: 'Total',
      },
      content: {
        style: {
          color: darkMode ? '#fff' : '#000',
          fontSize: '24px',
        },
        content: analysisData?.relationships || 0,
      },
    },
  };

  const calculateCoverage = () => {
    const totalPossible = (analysisData?.tables || 0) * ((analysisData?.tables || 0) - 1) / 2;
    const actual = analysisData?.relationships || 0;
    return totalPossible > 0 ? Math.min((actual / totalPossible) * 100, 100) : 0;
  };

  const getQualityScore = () => {
    const coverage = calculateCoverage();
    const featureOrganization = features.length > 0 ? (features.length / (analysisData?.tables || 1)) * 100 : 0;
    return Math.min((coverage + featureOrganization) / 2, 100);
  };

  return (
    <div className="info-chart-report">
      <style>{`
        .info-chart-report {
          padding: 16px 0;
        }
        .metrics-grid {
          margin-bottom: 24px;
        }
        .chart-card {
          margin-bottom: 16px;
        }
        .metric-card {
          text-align: center;
          padding: 20px;
        }
        .metric-value {
          font-size: 36px;
          font-weight: bold;
          margin: 12px 0;
        }
        .metric-label {
          color: #8c8c8c;
          font-size: 14px;
        }
        .insight-card {
          margin-top: 16px;
          padding: 16px;
          background: ${darkMode ? '#262626' : '#f6ffed'};
          border: 1px solid ${darkMode ? '#434343' : '#b7eb8f'};
          border-radius: 8px;
        }
        .dark-mode .insight-card {
          background: #162312;
          border-color: #274916;
        }
        .quality-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 20px 0;
        }
      `}</style>

      {analysisData ? (
        <>
          {/* Key Metrics */}
          <Row gutter={[16, 16]} className="metrics-grid">
            <Col xs={24} sm={12} md={6}>
              <Card className="metric-card">
                <DatabaseOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                <div className="metric-value" style={{ color: '#1890ff' }}>
                  {analysisData.tables || 0}
                </div>
                <div className="metric-label">Database Tables</div>
                <Progress
                  percent={100}
                  strokeColor="#1890ff"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card className="metric-card">
                <LinkOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <div className="metric-value" style={{ color: '#52c41a' }}>
                  {analysisData.relationships || 0}
                </div>
                <div className="metric-label">Relationships</div>
                <Progress
                  percent={calculateCoverage()}
                  strokeColor="#52c41a"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card className="metric-card">
                <AppstoreOutlined style={{ fontSize: 32, color: '#faad14' }} />
                <div className="metric-value" style={{ color: '#faad14' }}>
                  {analysisData.features || 0}
                </div>
                <div className="metric-label">Feature Groups</div>
                <Progress
                  percent={(features.length / (analysisData.tables || 1)) * 100}
                  strokeColor="#faad14"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card className="metric-card">
                <CheckCircleOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                <div className="metric-value" style={{ color: '#722ed1' }}>
                  {getQualityScore().toFixed(0)}%
                </div>
                <div className="metric-label">Quality Score</div>
                <Progress
                  percent={getQualityScore()}
                  strokeColor="#722ed1"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card title="Tables by Feature" className="chart-card">
                {tablesByFeature.length > 0 ? (
                  <Column
                    data={tablesByFeature}
                    xField="name"
                    yField="value"
                    theme={darkMode ? 'dark' : 'light'}
                    columnStyle={{
                      radius: [8, 8, 0, 0],
                    }}
                    color={['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96']}
                    label={{
                      position: 'top',
                      style: {
                        fill: darkMode ? '#fff' : '#000',
                        opacity: 0.8,
                      },
                    }}
                  />
                ) : (
                  <Empty description="No data available" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card title="Relationship Types" className="chart-card">
                {relationshipTypeData.length > 0 ? (
                  <Pie {...pieConfig} />
                ) : (
                  <Empty description="No relationships found" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Insights and Recommendations */}
          <Card title="Analysis Insights" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="insight-card">
                  <h4>
                    <RiseOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    Strengths
                  </h4>
                  <ul style={{ marginBottom: 0 }}>
                    {analysisData.relationships > 0 && (
                      <li>Strong table relationships detected ({analysisData.relationships} links)</li>
                    )}
                    {features.length > 0 && (
                      <li>Well-organized features ({features.length} groups identified)</li>
                    )}
                    {getQualityScore() > 70 && (
                      <li>High quality schema structure</li>
                    )}
                  </ul>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="insight-card" style={{ background: darkMode ? '#2b1d16' : '#fff7e6', borderColor: darkMode ? '#594214' : '#ffd591' }}>
                  <h4>
                    <ClockCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    Recommendations
                  </h4>
                  <ul style={{ marginBottom: 0 }}>
                    {calculateCoverage() < 50 && (
                      <li>Consider adding more explicit relationships between tables</li>
                    )}
                    {features.length < 3 && (
                      <li>More feature groupings could improve organization</li>
                    )}
                    <li>Run automated analysis regularly to maintain schema health</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Feature Details Timeline */}
          {features.length > 0 && (
            <Card title="Feature Organization Timeline" style={{ marginTop: 16 }}>
              <Timeline>
                {features.map((feature, index) => (
                  <Timeline.Item
                    key={feature.name}
                    color="blue"
                    dot={<AppstoreOutlined />}
                  >
                    <div>
                      <strong>{feature.name}</strong>
                      <div style={{ marginTop: 4 }}>
                        <Tag color="blue">{feature.tables?.length || 0} tables</Tag>
                        <Tag color="green">{feature.settings?.length || 0} settings</Tag>
                        <Tag color="orange">{feature.options?.length || 0} options</Tag>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          )}
        </>
      ) : (
        <Empty
          description="No analysis data available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default InfoChartReport;

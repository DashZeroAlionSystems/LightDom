/**
 * Schema Linking Dashboard
 * 
 * Dashboard for database schema analysis, relationship discovery,
 * feature grouping, and automated schema linking.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Tabs,
  Modal,
  List,
  Badge,
  Tooltip,
  Empty,
  message,
  Progress,
  Tree,
  Descriptions,
  Alert,
} from 'antd';
import {
  DatabaseOutlined,
  ApiOutlined,
  ClusterOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  SyncOutlined,
  ReloadOutlined,
  EyeOutlined,
  ExportOutlined,
  BranchesOutlined,
  TableOutlined,
  LinkOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { schemaLinkingAPI, TableMetadata, SchemaRelationship, FeatureGrouping, RunnerStatus } from '../../services/apiService';

const { TabPane } = Tabs;

export const SchemaLinkingDashboard: React.FC = () => {
  // State
  const [tables, setTables] = useState<TableMetadata[]>([]);
  const [relationships, setRelationships] = useState<SchemaRelationship[]>([]);
  const [features, setFeatures] = useState<FeatureGrouping[]>([]);
  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'table' | 'feature' | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tablesData, relationshipsData, featuresData, statusData] = await Promise.all([
        schemaLinkingAPI.getTables(),
        schemaLinkingAPI.getRelationships(),
        schemaLinkingAPI.getFeatures(),
        schemaLinkingAPI.getRunnerStatus(),
      ]);
      setTables(tablesData);
      setRelationships(relationshipsData);
      setFeatures(featuresData);
      setRunnerStatus(statusData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load schema data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleAnalyzeSchema = async () => {
    setAnalyzing(true);
    try {
      const result = await schemaLinkingAPI.analyzeSchema();
      message.success(`Schema analyzed: ${result.tables} tables, ${result.relationships} relationships, ${result.features} features`);
      fetchData();
    } catch (error) {
      message.error('Failed to analyze schema');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartRunner = async () => {
    try {
      const status = await schemaLinkingAPI.startRunner();
      setRunnerStatus(status);
      message.success('Schema linking runner started');
    } catch (error) {
      message.error('Failed to start runner');
    }
  };

  const handleStopRunner = async () => {
    try {
      const status = await schemaLinkingAPI.stopRunner();
      setRunnerStatus(status);
      message.success('Schema linking runner stopped');
    } catch (error) {
      message.error('Failed to stop runner');
    }
  };

  const handleRunCycle = async () => {
    try {
      await schemaLinkingAPI.runCycle();
      message.success('Linking cycle completed');
      fetchData();
    } catch (error) {
      message.error('Failed to run linking cycle');
    }
  };

  const handleExportSchemas = async () => {
    try {
      const result = await schemaLinkingAPI.exportSchemas();
      message.success(`Schemas exported to ${result.outputPath}`);
    } catch (error) {
      message.error('Failed to export schemas');
    }
  };

  const handleViewTable = (table: TableMetadata) => {
    setSelectedItem(table);
    setSelectedItemType('table');
    setViewModalVisible(true);
  };

  const handleViewFeature = async (feature: FeatureGrouping) => {
    try {
      const schema = await schemaLinkingAPI.getFeatureSchema(feature.name);
      setSelectedItem({ ...feature, schema });
      setSelectedItemType('feature');
      setViewModalVisible(true);
    } catch (error) {
      message.error('Failed to load feature details');
    }
  };

  // Relationship type color
  const getRelationshipColor = (type: string) => {
    const colors: Record<string, string> = {
      foreign_key: 'green',
      semantic: 'blue',
      naming_pattern: 'orange',
    };
    return colors[type] || 'default';
  };

  // Table columns
  const tableColumns = [
    {
      title: 'Table',
      key: 'name',
      render: (_: any, record: TableMetadata) => (
        <Space>
          <TableOutlined />
          <a onClick={() => handleViewTable(record)}>{record.name}</a>
        </Space>
      ),
    },
    {
      title: 'Schema',
      dataIndex: 'schema',
      key: 'schema',
      render: (schema: string) => <Tag>{schema}</Tag>,
    },
    {
      title: 'Columns',
      key: 'columns',
      render: (_: any, record: TableMetadata) => (
        <Badge count={record.columns?.length || 0} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Primary Key',
      key: 'primaryKey',
      render: (_: any, record: TableMetadata) => (
        record.primaryKey?.length ? (
          <Tag color="gold">{record.primaryKey.join(', ')}</Tag>
        ) : '-'
      ),
    },
    {
      title: 'Foreign Keys',
      key: 'foreignKeys',
      render: (_: any, record: TableMetadata) => (
        <Badge count={record.foreignKeys?.length || 0} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TableMetadata) => (
        <Tooltip title="View Details">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewTable(record)} />
        </Tooltip>
      ),
    },
  ];

  // Relationship columns
  const relationshipColumns = [
    {
      title: 'Source',
      dataIndex: 'sourceTable',
      key: 'sourceTable',
      render: (table: string) => <Tag icon={<TableOutlined />}>{table}</Tag>,
    },
    {
      title: '',
      key: 'arrow',
      render: () => <LinkOutlined style={{ color: '#1890ff' }} />,
      width: 40,
    },
    {
      title: 'Target',
      dataIndex: 'targetTable',
      key: 'targetTable',
      render: (table: string) => <Tag icon={<TableOutlined />}>{table}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={getRelationshipColor(type)}>{type.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence: number) => (
        <Progress
          percent={Math.round(confidence * 100)}
          size="small"
          status={confidence >= 0.8 ? 'success' : confidence >= 0.5 ? 'normal' : 'exception'}
        />
      ),
      width: 120,
    },
    {
      title: 'Columns',
      dataIndex: 'columns',
      key: 'columns',
      render: (columns: string[]) => columns?.join(', ') || '-',
    },
  ];

  // Feature columns
  const featureColumns = [
    {
      title: 'Feature',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: FeatureGrouping) => (
        <Space>
          <AppstoreOutlined />
          <a onClick={() => handleViewFeature(record)}>{name}</a>
        </Space>
      ),
    },
    {
      title: 'Tables',
      key: 'tables',
      render: (_: any, record: FeatureGrouping) => (
        <Badge count={record.tables?.length || 0} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Relationships',
      key: 'relationships',
      render: (_: any, record: FeatureGrouping) => (
        <Badge count={record.relationships?.length || 0} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || '-',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FeatureGrouping) => (
        <Tooltip title="View Schema Map">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewFeature(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <h2 style={{ margin: 0 }}>Schema Linking</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                      Database schema analysis, relationships, and feature mapping
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                    Refresh
                  </Button>
                  <Button icon={<SyncOutlined />} onClick={handleAnalyzeSchema} loading={analyzing}>
                    Analyze Schema
                  </Button>
                  <Button icon={<ExportOutlined />} onClick={handleExportSchemas}>
                    Export
                  </Button>
                  {runnerStatus?.isRunning ? (
                    <Button type="primary" danger icon={<PauseOutlined />} onClick={handleStopRunner}>
                      Stop Runner
                    </Button>
                  ) : (
                    <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartRunner}>
                      Start Runner
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Stats Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tables"
              value={tables.length}
              prefix={<TableOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Relationships"
              value={relationships.length}
              prefix={<LinkOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Features"
              value={features.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Runner Status"
              value={runnerStatus?.isRunning ? 'Running' : 'Stopped'}
              prefix={runnerStatus?.isRunning ? <SyncOutlined spin /> : <PauseOutlined />}
              valueStyle={{ color: runnerStatus?.isRunning ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>

        {/* Runner Info */}
        {runnerStatus && (
          <Col span={24}>
            <Alert
              message={`Schema Linking Runner: ${runnerStatus.isRunning ? 'Active' : 'Inactive'}`}
              description={
                <Space>
                  <span>Cycles completed: {runnerStatus.cyclesCompleted}</span>
                  <span>|</span>
                  <span>Errors: {runnerStatus.errors}</span>
                  {runnerStatus.lastRun && (
                    <>
                      <span>|</span>
                      <span>Last run: {new Date(runnerStatus.lastRun).toLocaleString()}</span>
                    </>
                  )}
                  <Button size="small" onClick={handleRunCycle}>
                    Run Single Cycle
                  </Button>
                </Space>
              }
              type={runnerStatus.isRunning ? 'success' : 'info'}
              showIcon
            />
          </Col>
        )}

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Tables" key="tables">
                {tables.length > 0 ? (
                  <Table
                    dataSource={tables}
                    columns={tableColumns}
                    rowKey="name"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                ) : (
                  <Empty description="No tables discovered yet">
                    <Button type="primary" onClick={handleAnalyzeSchema} loading={analyzing}>
                      Analyze Schema
                    </Button>
                  </Empty>
                )}
              </TabPane>

              <TabPane tab="Relationships" key="relationships">
                {relationships.length > 0 ? (
                  <Table
                    dataSource={relationships}
                    columns={relationshipColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                ) : (
                  <Empty description="No relationships discovered yet">
                    <Button type="primary" onClick={handleAnalyzeSchema} loading={analyzing}>
                      Analyze Schema
                    </Button>
                  </Empty>
                )}
              </TabPane>

              <TabPane tab="Features" key="features">
                {features.length > 0 ? (
                  <Table
                    dataSource={features}
                    columns={featureColumns}
                    rowKey="name"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                ) : (
                  <Empty description="No features discovered yet">
                    <Button type="primary" onClick={handleAnalyzeSchema} loading={analyzing}>
                      Analyze Schema
                    </Button>
                  </Empty>
                )}
              </TabPane>

              <TabPane tab="Statistics" key="statistics">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card title="Relationship Types" size="small">
                      <List
                        dataSource={[
                          { type: 'foreign_key', count: relationships.filter(r => r.type === 'foreign_key').length },
                          { type: 'semantic', count: relationships.filter(r => r.type === 'semantic').length },
                          { type: 'naming_pattern', count: relationships.filter(r => r.type === 'naming_pattern').length },
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Tag color={getRelationshipColor(item.type)}>{item.type.replace('_', ' ')}</Tag>
                              <Badge count={item.count} showZero style={{ backgroundColor: '#1890ff' }} />
                            </Space>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card title="Tables by Schema" size="small">
                      <List
                        dataSource={Object.entries(
                          tables.reduce((acc, t) => {
                            acc[t.schema] = (acc[t.schema] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )}
                        renderItem={([schema, count]) => (
                          <List.Item>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Tag>{schema}</Tag>
                              <Badge count={count as number} showZero style={{ backgroundColor: '#52c41a' }} />
                            </Space>
                          </List.Item>
                        )}
                        locale={{ emptyText: 'No schema data' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card title="Runner Statistics" size="small">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Status">
                          {runnerStatus?.isRunning ? (
                            <Tag color="green">Running</Tag>
                          ) : (
                            <Tag color="orange">Stopped</Tag>
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cycles">
                          {runnerStatus?.cyclesCompleted || 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Errors">
                          {runnerStatus?.errors || 0}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* View Details Modal */}
      <Modal
        title={
          selectedItemType === 'table' ? (
            <Space><TableOutlined /> Table: {selectedItem?.name}</Space>
          ) : (
            <Space><AppstoreOutlined /> Feature: {selectedItem?.name}</Space>
          )
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedItem && selectedItemType === 'table' && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Schema">{selectedItem.schema}</Descriptions.Item>
              <Descriptions.Item label="Primary Key">
                {selectedItem.primaryKey?.join(', ') || 'None'}
              </Descriptions.Item>
            </Descriptions>
            
            <h4 style={{ marginTop: 16 }}>Columns ({selectedItem.columns?.length || 0})</h4>
            <Table
              dataSource={selectedItem.columns || []}
              columns={[
                { title: 'Column', dataIndex: 'name', key: 'name' },
                { title: 'Type', dataIndex: 'dataType', key: 'dataType' },
                { title: 'Nullable', dataIndex: 'isNullable', key: 'isNullable', render: (v: boolean) => v ? 'Yes' : 'No' },
                { title: 'Default', dataIndex: 'defaultValue', key: 'defaultValue', render: (v: any) => v || '-' },
              ]}
              rowKey="name"
              size="small"
              pagination={false}
            />

            {selectedItem.foreignKeys?.length > 0 && (
              <>
                <h4 style={{ marginTop: 16 }}>Foreign Keys ({selectedItem.foreignKeys.length})</h4>
                <Table
                  dataSource={selectedItem.foreignKeys}
                  columns={[
                    { title: 'Column', dataIndex: 'column', key: 'column' },
                    { title: 'Reference Table', dataIndex: 'referenceTable', key: 'referenceTable' },
                    { title: 'Reference Column', dataIndex: 'referenceColumn', key: 'referenceColumn' },
                  ]}
                  rowKey="column"
                  size="small"
                  pagination={false}
                />
              </>
            )}
          </div>
        )}

        {selectedItem && selectedItemType === 'feature' && (
          <div>
            <p><strong>Description:</strong> {selectedItem.description || 'No description'}</p>
            
            <h4>Tables ({selectedItem.tables?.length || 0})</h4>
            <Space wrap>
              {selectedItem.tables?.map((table: string) => (
                <Tag key={table} icon={<TableOutlined />}>{table}</Tag>
              ))}
            </Space>

            <h4 style={{ marginTop: 16 }}>Relationships ({selectedItem.relationships?.length || 0})</h4>
            <Space wrap>
              {selectedItem.relationships?.map((rel: string, i: number) => (
                <Tag key={i} icon={<LinkOutlined />} color="blue">{rel}</Tag>
              ))}
            </Space>

            {selectedItem.schema && (
              <>
                <h4 style={{ marginTop: 16 }}>Linked Schema Map</h4>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, maxHeight: 300, overflow: 'auto' }}>
                  {JSON.stringify(selectedItem.schema, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SchemaLinkingDashboard;

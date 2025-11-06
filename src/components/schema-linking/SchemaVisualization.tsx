import React, { useState, useEffect } from 'react';
import { Card, Select, Tree, Tag, Descriptions, Empty, Spin } from 'antd';
import {
  DatabaseOutlined,
  TableOutlined,
  LinkOutlined,
  SettingOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

const { Option } = Select;

interface SchemaVisualizationProps {
  features: any[];
  selectedFeature: string | null;
  onFeatureSelect: (feature: string) => void;
  darkMode: boolean;
}

const SchemaVisualization: React.FC<SchemaVisualizationProps> = ({
  features,
  selectedFeature,
  onFeatureSelect,
  darkMode
}) => {
  const [featureSchema, setFeatureSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [relationships, setRelationships] = useState<any[]>([]);

  useEffect(() => {
    if (selectedFeature) {
      loadFeatureSchema(selectedFeature);
    }
  }, [selectedFeature]);

  const loadFeatureSchema = async (featureName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/schema-linking/features/${featureName}`);
      const result = await response.json();
      
      if (result.success) {
        setFeatureSchema(result.data);
        setRelationships(result.data.relationships || []);
      }
    } catch (error) {
      console.error('Failed to load feature schema:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTreeData = (): DataNode[] => {
    if (!featureSchema) return [];

    const treeData: DataNode[] = [{
      title: (
        <span>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          {featureSchema.feature}
        </span>
      ),
      key: 'feature',
      children: featureSchema.tables?.map((table: any) => ({
        title: (
          <span>
            <TableOutlined style={{ marginRight: 8 }} />
            {table.name}
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {table.columns?.length || 0} columns
            </Tag>
          </span>
        ),
        key: `table-${table.name}`,
        children: table.columns?.map((column: any) => ({
          title: (
            <span>
              {column.name}
              <Tag color={column.nullable ? 'default' : 'green'} style={{ marginLeft: 8 }}>
                {column.type}
              </Tag>
              {!column.nullable && <CheckCircleOutlined style={{ marginLeft: 4, color: '#52c41a' }} />}
            </span>
          ),
          key: `column-${table.name}-${column.name}`,
          isLeaf: true
        }))
      }))
    }];

    return treeData;
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'foreign_key':
        return '#52c41a';
      case 'semantic':
        return '#1890ff';
      case 'naming_pattern':
        return '#faad14';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <div className="schema-visualization">
      <style>{`
        .schema-visualization {
          padding: 16px 0;
        }
        .feature-select {
          margin-bottom: 20px;
        }
        .schema-tree {
          margin-bottom: 24px;
        }
        .relationship-card {
          margin-top: 16px;
        }
        .relationship-item {
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dark-mode .relationship-item {
          border-color: #434343;
          background: #262626;
        }
        .relationship-arrow {
          margin: 0 12px;
          color: #8c8c8c;
        }
        .strength-indicator {
          display: inline-block;
          width: 60px;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          margin-left: 8px;
        }
        .strength-fill {
          height: 100%;
          background: linear-gradient(90deg, #52c41a, #1890ff);
          transition: width 0.3s;
        }
      `}</style>

      <div className="feature-select">
        <Select
          style={{ width: '100%' }}
          placeholder="Select a feature"
          value={selectedFeature}
          onChange={onFeatureSelect}
          size="large"
        >
          {features.map((feature) => (
            <Option key={feature.name} value={feature.name}>
              <DatabaseOutlined /> {feature.name}
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {feature.tables?.length || 0} tables
              </Tag>
            </Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Loading schema..." />
        </div>
      ) : featureSchema ? (
        <>
          <Card title="Schema Structure" className="schema-tree">
            <Tree
              showLine={{ showLeafIcon: false }}
              defaultExpandAll
              treeData={buildTreeData()}
            />
          </Card>

          <Card title="Feature Details" style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Feature Name">
                {featureSchema.feature}
              </Descriptions.Item>
              <Descriptions.Item label="Tables">
                {featureSchema.tables?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Settings">
                {featureSchema.settings?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Options">
                {featureSchema.options?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Dashboards">
                {featureSchema.dashboards?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Generated At">
                {featureSchema.generatedAt ? new Date(featureSchema.generatedAt).toLocaleString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {relationships.length > 0 && (
            <Card
              title={
                <span>
                  <LinkOutlined /> Relationships ({relationships.length})
                </span>
              }
              className="relationship-card"
            >
              {relationships.map((rel, index) => (
                <div key={index} className="relationship-item">
                  <div style={{ flex: 1 }}>
                    <Tag color={getRelationshipColor(rel.type)}>
                      {rel.type.replace('_', ' ').toUpperCase()}
                    </Tag>
                    <span style={{ marginLeft: 8 }}>
                      {rel.source?.table || 'N/A'}
                    </span>
                    <span className="relationship-arrow">→</span>
                    <span>
                      {rel.target?.table || 'N/A'}
                    </span>
                  </div>
                  <div>
                    {rel.strength && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', marginRight: 8 }}>
                          Strength: {(rel.strength * 100).toFixed(0)}%
                        </span>
                        <div className="strength-indicator">
                          <div
                            className="strength-fill"
                            style={{ width: `${rel.strength * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {featureSchema.settings && featureSchema.settings.length > 0 && (
            <Card
              title={
                <span>
                  <SettingOutlined /> Settings Fields
                </span>
              }
              style={{ marginTop: 16 }}
            >
              {featureSchema.settings.map((setting: string, index: number) => (
                <Tag key={index} color="cyan" style={{ margin: '4px' }}>
                  {setting}
                </Tag>
              ))}
            </Card>
          )}
        </>
      ) : (
        <Empty description="Select a feature to view schema" />
      )}
    </div>
  );
};

export default SchemaVisualization;

import React from 'react';
import { Card, Descriptions, Tag, Space, Button, Tabs, Table, Timeline } from 'antd';
import {
  CloseOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;

interface NeuralNetworkDetailViewProps {
  instance: any;
  onRefresh: () => void;
  onClose: () => void;
}

export const NeuralNetworkDetailView: React.FC<NeuralNetworkDetailViewProps> = ({
  instance,
  onRefresh,
  onClose,
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ready: 'green',
      training: 'blue',
      initializing: 'orange',
      paused: 'default',
      error: 'red',
    };
    return colors[status] || 'default';
  };

  const dataStreamColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'stream_type',
      key: 'stream_type',
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Source',
      dataIndex: 'source_type',
      key: 'source_type',
    },
    {
      title: 'Destination',
      dataIndex: 'destination_type',
      key: 'destination_type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>,
    },
  ];

  const attributeColumns = [
    {
      title: 'Name',
      dataIndex: 'attribute_name',
      key: 'attribute_name',
    },
    {
      title: 'Type',
      dataIndex: 'attribute_type',
      key: 'attribute_type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Training Enabled',
      dataIndex: 'training_config',
      key: 'training_enabled',
      render: (config: any) => 
        config?.enabled ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <span>{instance.name}</span>
            <Tag color={getStatusColor(instance.status)}>
              {instance.status.toUpperCase()}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
            <Button icon={<CloseOutlined />} onClick={onClose}>
              Close
            </Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Model Type">
            <Tag>{instance.model_type?.replace('_', ' ').toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(instance.status)}>
              {instance.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Data Streams">
            {instance.data_stream_count || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Active Attributes">
            {instance.active_attribute_count || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Training Data Records">
            {instance.training_data_count || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Accuracy">
            {instance.accuracy ? `${(instance.accuracy * 100).toFixed(2)}%` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Avg Trust Score">
            {instance.avg_trust_score 
              ? `${(instance.avg_trust_score * 100).toFixed(2)}%`
              : 'N/A'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Avg Quality Score">
            {instance.avg_quality_score
              ? `${(instance.avg_quality_score * 100).toFixed(2)}%`
              : 'N/A'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(instance.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {new Date(instance.updated_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {instance.description && (
          <Card type="inner" title="Description" className="mt-4">
            <p>{instance.description}</p>
          </Card>
        )}
      </Card>

      <Tabs defaultActiveKey="dataStreams" className="mt-4">
        <TabPane
          tab={
            <span>
              <BranchesOutlined />
              Data Streams ({instance.data_streams?.length || 0})
            </span>
          }
          key="dataStreams"
        >
          <Card>
            <Table
              dataSource={instance.data_streams || []}
              columns={dataStreamColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined />
              Attributes ({instance.attributes?.length || 0})
            </span>
          }
          key="attributes"
        >
          <Card>
            <Table
              dataSource={instance.attributes || []}
              columns={attributeColumns}
              rowKey="id"
              pagination={false}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="pl-4">
                    <p><strong>Algorithm Config:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded">
                      {JSON.stringify(record.algorithm_config, null, 2)}
                    </pre>
                    {record.seo_config && (
                      <>
                        <p><strong>SEO Config:</strong></p>
                        <pre className="bg-gray-100 p-2 rounded mt-2">
                          {JSON.stringify(record.seo_config, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                ),
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <DatabaseOutlined />
              Crawler Integration
            </span>
          }
          key="crawler"
        >
          <Card>
            {instance.crawler_config ? (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Status">
                  <Tag color={instance.crawler_config.status === 'active' ? 'green' : 'default'}>
                    {instance.crawler_config.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Optimization Config">
                  <pre className="bg-gray-100 p-2 rounded">
                    {JSON.stringify(instance.crawler_config.optimization_config, null, 2)}
                  </pre>
                </Descriptions.Item>
                <Descriptions.Item label="Extraction Config">
                  <pre className="bg-gray-100 p-2 rounded">
                    {JSON.stringify(instance.crawler_config.extraction_config, null, 2)}
                  </pre>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <p className="text-gray-500">No crawler integration configured</p>
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <PlayCircleOutlined />
              Seeder Integration
            </span>
          }
          key="seeder"
        >
          <Card>
            {instance.seeder_config ? (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Status">
                  <Tag color={instance.seeder_config.status === 'active' ? 'green' : 'default'}>
                    {instance.seeder_config.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Translation Config">
                  <pre className="bg-gray-100 p-2 rounded">
                    {JSON.stringify(instance.seeder_config.translation_config, null, 2)}
                  </pre>
                </Descriptions.Item>
                <Descriptions.Item label="URL Generation Config">
                  <pre className="bg-gray-100 p-2 rounded">
                    {JSON.stringify(instance.seeder_config.url_generation_config, null, 2)}
                  </pre>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <p className="text-gray-500">No seeder integration configured</p>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

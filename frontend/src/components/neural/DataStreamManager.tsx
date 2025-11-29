import React, { useState } from 'react';
import { Card, Button, Space, Table, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, BranchesOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface DataStreamManagerProps {
  instance: any;
}

export const DataStreamManager: React.FC<DataStreamManagerProps> = ({ instance }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAddStream = async (values: any) => {
    setLoading(true);
    try {
      const processedValues = {
        ...values,
        source_config: values.source_config ? JSON.parse(values.source_config) : {},
        destination_config: values.destination_config ? JSON.parse(values.destination_config) : {},
      };

      const response = await fetch(
        `/api/neural-network-dashboard/instances/${instance.id}/data-streams`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(processedValues),
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success('Data stream added successfully');
        setModalVisible(false);
        form.resetFields();
        // Refresh instance data
        window.location.reload();
      } else {
        message.error(result.error || 'Failed to add data stream');
      }
    } catch (error: any) {
      console.error('Error adding data stream:', error);
      message.error(error.message || 'Failed to add data stream');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
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
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <BranchesOutlined />
          Data Streams
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Data Stream
        </Button>
      }
    >
      <Table
        dataSource={instance?.data_streams || []}
        columns={columns}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowRender: (record) => (
            <div className="pl-4">
              <p><strong>Source Config:</strong></p>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(record.source_config, null, 2)}
              </pre>
              <p className="mt-2"><strong>Destination Config:</strong></p>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(record.destination_config, null, 2)}
              </pre>
              {record.attribute_mappings && record.attribute_mappings.length > 0 && (
                <>
                  <p className="mt-2"><strong>Attribute Mappings:</strong></p>
                  <pre className="bg-gray-100 p-2 rounded">
                    {JSON.stringify(record.attribute_mappings, null, 2)}
                  </pre>
                </>
              )}
            </div>
          ),
        }}
      />

      <Modal
        title="Add Data Stream"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddStream}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="e.g., Training Data Input" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={2} placeholder="Describe the data stream purpose" />
          </Form.Item>

          <Form.Item
            label="Stream Type"
            name="stream_type"
            rules={[{ required: true, message: 'Please select a stream type' }]}
          >
            <Select placeholder="Select stream type">
              <Option value="input">Input</Option>
              <Option value="output">Output</Option>
              <Option value="training">Training</Option>
              <Option value="evaluation">Evaluation</Option>
              <Option value="prediction">Prediction</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Source Type"
            name="source_type"
            rules={[{ required: true, message: 'Please select a source type' }]}
          >
            <Select placeholder="Select source type">
              <Option value="database">Database</Option>
              <Option value="api">API</Option>
              <Option value="file">File</Option>
              <Option value="stream">Stream</Option>
              <Option value="model">Model</Option>
              <Option value="attributes">Attributes</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Source Config (JSON)" name="source_config">
            <TextArea
              rows={4}
              placeholder={'{\n  "table": "training_data",\n  "query": "SELECT *"\n}'}
            />
          </Form.Item>

          <Form.Item
            label="Destination Type"
            name="destination_type"
            rules={[{ required: true, message: 'Please select a destination type' }]}
          >
            <Select placeholder="Select destination type">
              <Option value="model">Model</Option>
              <Option value="database">Database</Option>
              <Option value="api">API</Option>
              <Option value="file">File</Option>
              <Option value="stream">Stream</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Destination Config (JSON)" name="destination_config">
            <TextArea
              rows={4}
              placeholder={'{\n  "table": "predictions",\n  "batch_size": 100\n}'}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Stream
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

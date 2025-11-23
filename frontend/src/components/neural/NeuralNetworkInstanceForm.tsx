import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Card, Switch, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface NeuralNetworkInstanceFormProps {
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  initialValues?: any;
}

export const NeuralNetworkInstanceForm: React.FC<NeuralNetworkInstanceFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/neural-network-dashboard/templates');
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    if (templates && templates[templateKey]) {
      const template = templates[templateKey];
      setSelectedTemplate(templateKey);
      form.setFieldsValue({
        model_type: template.model_type,
        architecture: JSON.stringify(template.architecture, null, 2),
        training_config: JSON.stringify(template.training_config, null, 2),
        load_default_models: template.load_default_models,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const processedValues = {
        ...values,
        architecture: values.architecture ? JSON.parse(values.architecture) : {},
        training_config: values.training_config ? JSON.parse(values.training_config) : {},
        data_config: values.data_config ? JSON.parse(values.data_config) : {},
      };

      await onSubmit(processedValues);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      message.error(error.message || 'Failed to create neural network instance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {templates && (
        <Card title="Use Template" className="mb-4">
          <Space wrap>
            {Object.entries(templates).map(([key, template]: [string, any]) => (
              <Button
                key={key}
                type={selectedTemplate === key ? 'primary' : 'default'}
                onClick={() => handleTemplateSelect(key)}
              >
                {template.name}
              </Button>
            ))}
          </Space>
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          load_default_models: true,
          ...initialValues,
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="e.g., SEO Crawler Neural Network" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea
            rows={3}
            placeholder="Describe the purpose and use case of this neural network"
          />
        </Form.Item>

        <Form.Item
          label="Model Type"
          name="model_type"
          rules={[{ required: true, message: 'Please select a model type' }]}
        >
          <Select placeholder="Select model type">
            <Option value="scraping">Scraping</Option>
            <Option value="seo">SEO Optimization</Option>
            <Option value="data_mining">Data Mining</Option>
            <Option value="content">Content Generation</Option>
            <Option value="performance">Performance Optimization</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Architecture (JSON)" name="architecture">
          <TextArea
            rows={6}
            placeholder={'{\n  "layers": [\n    {"type": "dense", "units": 128}\n  ]\n}'}
          />
        </Form.Item>

        <Form.Item label="Training Config (JSON)" name="training_config">
          <TextArea
            rows={6}
            placeholder={'{\n  "epochs": 50,\n  "batch_size": 32,\n  "learning_rate": 0.001\n}'}
          />
        </Form.Item>

        <Form.Item label="Data Config (JSON)" name="data_config">
          <TextArea
            rows={4}
            placeholder={'{\n  "source": "database",\n  "validation_split": 0.2\n}'}
          />
        </Form.Item>

        <Form.Item
          label="Load Default Models"
          name="load_default_models"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
              Create Instance
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

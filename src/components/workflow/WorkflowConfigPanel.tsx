/**
 * Workflow Configuration Panel
 * 
 * Advanced configuration panel for workflows
 * Features:
 * - Settings management
 * - Atom configuration
 * - Component linking
 * - Validation rules
 * - Schema binding
 */

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Button, Card, Space, Tabs, message, Tree, Tag } from 'antd';
import { SettingOutlined, LinkOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

interface Props {
  workflows: any[];
  selectedWorkflow: string | null;
  onUpdate: () => void;
  darkMode: boolean;
}

const WorkflowConfigPanel: React.FC<Props> = ({
  workflows,
  selectedWorkflow,
  onUpdate,
  darkMode
}) => {
  const [form] = Form.useForm();
  const [workflowConfig, setWorkflowConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedWorkflow) {
      loadConfig();
    }
  }, [selectedWorkflow]);

  const loadConfig = async () => {
    if (!selectedWorkflow) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/workflow-generator/config/${selectedWorkflow}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflowConfig(data);
        form.setFieldsValue(data);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const response = await fetch(`/api/workflow-generator/setups/${selectedWorkflow}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Configuration saved successfully');
        onUpdate();
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      message.error('Failed to save configuration');
    }
  };

  if (!selectedWorkflow) {
    return (
      <div className="text-center py-12 text-gray-500">
        Select a workflow to configure
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Tabs defaultActiveKey="general">
        <TabPane tab={<span><SettingOutlined /> General</span>} key="general">
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Workflow Name">
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item name="enabled" label="Enabled" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="autoExecute" label="Auto Execute" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab={<span><LinkOutlined /> Schema Linking</span>} key="schema">
          <Card size="small" className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Linked Schemas</div>
            {workflowConfig?.tables?.map((table: string, idx: number) => (
              <Tag key={idx} color="blue">{table}</Tag>
            ))}
          </Card>

          <Card size="small" className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Relationships</div>
            {workflowConfig?.relationships?.map((rel: any, idx: number) => (
              <div key={idx} className="mb-2">
                <Tag color="green">{rel.from}</Tag>
                <span className="mx-2">→</span>
                <Tag color="green">{rel.to}</Tag>
                <span className="ml-2 text-xs text-gray-500">({rel.type})</span>
              </div>
            ))}
          </Card>
        </TabPane>

        <TabPane tab={<span><CheckCircleOutlined /> Validation</span>} key="validation">
          <div className="space-y-4">
            <Card title="Validation Rules" size="small">
              {workflowConfig?.atoms?.map((atom: any, idx: number) => (
                atom.validation && atom.validation.length > 0 && (
                  <div key={idx} className={`p-3 mb-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="font-medium">{atom.field}</div>
                    <div className="mt-1 flex gap-2">
                      {atom.validation.map((rule: any, ridx: number) => (
                        <Tag key={ridx} color="blue" className="text-xs">
                          {rule.type}: {JSON.stringify(rule.value)}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </Card>
          </div>
        </TabPane>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Space>
          <Button onClick={loadConfig}>Reset</Button>
          <Button type="primary" onClick={handleSave} loading={loading}>
            Save Configuration
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default WorkflowConfigPanel;

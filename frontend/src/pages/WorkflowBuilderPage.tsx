import React, { useState, useEffect } from 'react';
import { Card, Button, List, Modal, message, Tag, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { VisualWorkflowBuilder } from '../components/VisualWorkflowBuilder';

export const WorkflowBuilderPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [isBuilderVisible, setIsBuilderVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflow-admin/workflows/summary');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
      message.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedWorkflow(null);
    setIsBuilderVisible(true);
  };

  const handleEditWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setIsBuilderVisible(true);
  };

  const handleSaveWorkflow = async (workflow: any) => {
    try {
      const endpoint = selectedWorkflow?.id 
        ? `/api/workflow-admin/workflows/${selectedWorkflow.id}`
        : '/api/workflow-admin/workflows';
      
      const method = selectedWorkflow?.id ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });

      if (response.ok) {
        message.success('Workflow saved successfully');
        setIsBuilderVisible(false);
        loadWorkflows();
      } else {
        message.error('Failed to save workflow');
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      message.error('Failed to save workflow');
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflow-admin/workflows/${workflowId}/execute`, {
        method: 'POST'
      });

      if (response.ok) {
        message.success('Workflow execution started');
        loadWorkflows();
      } else {
        message.error('Failed to execute workflow');
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      message.error('Failed to execute workflow');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'processing';
      case 'failed':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Visual Workflow Builder"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Create New Workflow
          </Button>
        }
      >
        <Tabs
          defaultActiveKey="list"
          items={[
            {
              key: 'list',
              label: 'Workflow List',
              children: (
                <List
                  loading={loading}
                  dataSource={workflows}
                  renderItem={(workflow: any) => (
                    <List.Item
                      actions={[
                        <Button 
                          icon={<EditOutlined />}
                          onClick={() => handleEditWorkflow(workflow)}
                        >
                          Edit
                        </Button>,
                        <Button 
                          icon={<PlayCircleOutlined />}
                          type="primary"
                          onClick={() => handleExecuteWorkflow(workflow.id)}
                          disabled={workflow.status === 'in_progress'}
                        >
                          Execute
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={workflow.campaignName || workflow.name}
                        description={
                          <div>
                            <div>{workflow.tasks?.length || 0} tasks</div>
                            <div style={{ marginTop: '8px' }}>
                              <Tag color={getStatusColor(workflow.status)}>
                                {workflow.status}
                              </Tag>
                              {workflow.seoScore && (
                                <Tag color="blue">SEO Score: {workflow.seoScore}</Tag>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={selectedWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
        open={isBuilderVisible}
        onCancel={() => setIsBuilderVisible(false)}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        bodyStyle={{ height: 'calc(90vh - 110px)' }}
      >
        <VisualWorkflowBuilder
          initialWorkflow={selectedWorkflow}
          onSave={handleSaveWorkflow}
          onExecute={handleExecuteWorkflow}
        />
      </Modal>
    </div>
  );
};

export default WorkflowBuilderPage;

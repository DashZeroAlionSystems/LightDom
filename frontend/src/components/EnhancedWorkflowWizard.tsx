/**
 * Enhanced Workflow Setup Wizard
 * 
 * Features:
 * - Database schema verification and creation
 * - Workflow task selection with prompts
 * - Linked schema mapping and configuration
 * - Automatic database persistence
 * - Integration with Ollama for AI generation
 */

import React, { useState, useEffect } from 'react';
import {
  Steps,
  Button,
  Input,
  Select,
  Form,
  Space,
  message,
  Card,
  Tag,
  Table,
  Checkbox,
  Divider,
  Alert,
  Collapse,
  Tree,
  Modal,
  Spin
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  LinkOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ApiOutlined
} from '@ant-design/icons';

const { Step } = Steps;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Option } = Select;

interface WorkflowTask {
  id: string;
  task_key: string;
  task_label: string;
  schema_refs: string[];
  handler_type: string;
  handler_config: any;
  is_optional: boolean;
  ordering: number;
  ui_wizard_step: number;
  selected: boolean;
  prompt?: string;
}

interface SchemaLink {
  schema_uri: string;
  role: string;
  component_id?: string;
  atom_id?: string;
}

interface Props {
  onComplete: (workflow: any) => void;
  darkMode?: boolean;
}

const EnhancedWorkflowWizard: React.FC<Props> = ({ onComplete, darkMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{tables: any[], verified: boolean}>({ tables: [], verified: false });
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<WorkflowTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<WorkflowTask[]>([]);
  const [schemaLinks, setSchemaLinks] = useState<SchemaLink[]>([]);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [linkedSchemaData, setLinkedSchemaData] = useState<any>(null);

  const steps = [
    { title: 'Database Setup', description: 'Verify schemas' },
    { title: 'Template Selection', description: 'Choose workflow type' },
    { title: 'Task Configuration', description: 'Select tasks & prompts' },
    { title: 'Schema Linking', description: 'Map relationships' },
    { title: 'Generate & Review', description: 'Create workflow' },
  ];

  // Step 1: Verify database schemas
  useEffect(() => {
    if (currentStep === 0) {
      verifyDatabaseSchemas();
    }
  }, [currentStep]);

  const verifyDatabaseSchemas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow/verify-schemas');
      if (response.ok) {
        const data = await response.json();
        setDbStatus({
          tables: data.tables || [],
          verified: data.verified
        });
        
        if (!data.verified) {
          message.warning('Some database tables need to be created');
        } else {
          message.success('All database schemas verified');
        }
      }
    } catch (error) {
      console.error('Failed to verify schemas:', error);
      message.error('Failed to verify database schemas');
    } finally {
      setLoading(false);
    }
  };

  const createMissingTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow/create-schemas', { method: 'POST' });
      if (response.ok) {
        message.success('Database schemas created successfully');
        await verifyDatabaseSchemas();
      }
    } catch (error) {
      console.error('Failed to create schemas:', error);
      message.error('Failed to create database schemas');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Load workflow templates
  useEffect(() => {
    if (currentStep === 1) {
      loadWorkflowTemplates();
    }
  }, [currentStep]);

  const loadWorkflowTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow/templates');
      if (response.ok) {
        const data = await response.json();
        setAvailableTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      message.error('Failed to load workflow templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/workflow/templates/${templateId}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTasks(data.tasks.map((t: any) => ({ ...t, selected: false })));
      }
    } catch (error) {
      console.error('Failed to load template tasks:', error);
      message.error('Failed to load template tasks');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Task selection and prompt configuration
  const handleTaskToggle = (taskId: string) => {
    setAvailableTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, selected: !task.selected } : task
      )
    );
  };

  const handlePromptUpdate = (taskId: string, prompt: string) => {
    setAvailableTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, prompt } : task
      )
    );
  };

  // Step 4: Schema linking
  const loadSchemaLinkingData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schema-linking/latest');
      if (response.ok) {
        const data = await response.json();
        setLinkedSchemaData(data);
        
        // Auto-suggest schema links based on tasks
        const suggestedLinks = selectedTasks.flatMap(task => 
          task.schema_refs.map(ref => ({
            schema_uri: ref,
            role: task.task_key,
            component_id: undefined,
            atom_id: undefined
          }))
        );
        setSchemaLinks(suggestedLinks);
      }
    } catch (error) {
      console.error('Failed to load schema linking data:', error);
      message.error('Failed to load schema linking data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchemaLink = () => {
    setSchemaLinks(prev => [...prev, {
      schema_uri: '',
      role: '',
    }]);
  };

  const handleRemoveSchemaLink = (index: number) => {
    setSchemaLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSchemaLinkChange = (index: number, field: string, value: any) => {
    setSchemaLinks(prev => 
      prev.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    );
  };

  // Step 5: Generate workflow
  const handleGenerateWorkflow = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const tasks = availableTasks.filter(t => t.selected);

      const payload = {
        template_id: selectedTemplate,
        name: values.name,
        description: values.description,
        tasks: tasks,
        schema_links: schemaLinks,
        metadata: {
          created_at: new Date().toISOString(),
          primary_prompt: values.primary_prompt,
        }
      };

      // Use Ollama to generate workflow structure
      const ollamaResponse = await fetch('/api/ollama/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'create_workflow_from_description',
          parameters: {
            workflow_description: values.description,
            tasks: tasks.map(t => ({ name: t.task_label, prompt: t.prompt })),
            schema_context: JSON.stringify(schemaLinks)
          }
        })
      });

      if (ollamaResponse.ok) {
        const ollamaData = await ollamaResponse.json();
        
        // Save to database
        const saveResponse = await fetch('/api/workflow/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            generated_structure: ollamaData.result,
            atoms: ollamaData.result.atoms || [],
            components: ollamaData.result.components || [],
            dashboards: ollamaData.result.dashboards || [],
          })
        });

        if (saveResponse.ok) {
          const savedWorkflow = await saveResponse.json();
          setGeneratedWorkflow(savedWorkflow);
          message.success('Workflow generated and saved successfully!');
        } else {
          throw new Error('Failed to save workflow');
        }
      } else {
        throw new Error('Failed to generate workflow with Ollama');
      }
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      message.error('Failed to generate workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      if (generatedWorkflow) {
        onComplete(generatedWorkflow);
        form.resetFields();
        setCurrentStep(0);
        setGeneratedWorkflow(null);
        setSelectedTasks([]);
        setSchemaLinks([]);
      }
    } catch (error) {
      console.error('Failed to complete workflow:', error);
      message.error('Failed to complete workflow');
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setSelectedTasks(availableTasks.filter(t => t.selected));
    }
    if (currentStep === 3) {
      loadSchemaLinkingData();
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Database Setup
        return (
          <Spin spinning={loading}>
            <Alert
              message="Database Schema Verification"
              description="Verifying that all required database tables exist for workflow management"
              type="info"
              icon={<DatabaseOutlined />}
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card title="Database Status">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Schema Verification:</span>
                  <Tag color={dbStatus.verified ? 'success' : 'warning'} icon={dbStatus.verified ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>
                    {dbStatus.verified ? 'Verified' : 'Incomplete'}
                  </Tag>
                </div>

                {dbStatus.tables.length > 0 && (
                  <Table
                    size="small"
                    dataSource={dbStatus.tables}
                    columns={[
                      { title: 'Table Name', dataIndex: 'table_name', key: 'table_name' },
                      { title: 'Schema', dataIndex: 'schema_name', key: 'schema_name' },
                      { title: 'Status', dataIndex: 'exists', key: 'exists', render: (exists: boolean) => (
                        <Tag color={exists ? 'success' : 'error'}>
                          {exists ? 'Exists' : 'Missing'}
                        </Tag>
                      )},
                    ]}
                    pagination={false}
                  />
                )}

                {!dbStatus.verified && (
                  <Button
                    type="primary"
                    icon={<DatabaseOutlined />}
                    onClick={createMissingTables}
                    loading={loading}
                  >
                    Create Missing Tables
                  </Button>
                )}
              </div>
            </Card>
          </Spin>
        );

      case 1:
        // Template Selection
        return (
          <Spin spinning={loading}>
            <Form.Item
              name="name"
              label="Workflow Name"
              rules={[{ required: true, message: 'Please enter workflow name' }]}
            >
              <Input placeholder="e.g., user-management-workflow" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Workflow Description"
              rules={[{ required: true, message: 'Please describe your workflow' }]}
            >
              <TextArea 
                rows={3}
                placeholder="Describe what this workflow should accomplish"
              />
            </Form.Item>

            <Form.Item
              name="primary_prompt"
              label="Primary AI Prompt"
              tooltip="This prompt will guide the AI in generating workflow components"
            >
              <TextArea 
                rows={4}
                placeholder="e.g., Generate a comprehensive user management system with CRUD operations, role-based access control, and audit logging"
              />
            </Form.Item>

            <Divider />

            <div className="mb-4">
              <h4 className="font-medium mb-2">Select Workflow Template</h4>
              <div className="grid grid-cols-2 gap-4">
                {availableTemplates.map(template => (
                  <Card
                    key={template.id}
                    hoverable
                    className={selectedTemplate === template.id ? 'border-blue-500 border-2' : ''}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="font-medium">{template.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                    {template.default_tasks && (
                      <Tag color="blue" className="mt-2">
                        {template.default_tasks.length} default tasks
                      </Tag>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </Spin>
        );

      case 2:
        // Task Configuration
        return (
          <Spin spinning={loading}>
            <Alert
              message="Select Tasks and Configure Prompts"
              description="Choose which tasks to include in your workflow and customize their AI prompts"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div className="space-y-4">
              {availableTasks.map(task => (
                <Card
                  key={task.id}
                  size="small"
                  className={task.selected ? 'border-blue-500' : ''}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={task.selected}
                      onChange={() => handleTaskToggle(task.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{task.task_label}</div>
                      <div className="text-sm text-gray-500">
                        Type: {task.handler_type}
                        {task.is_optional && <Tag color="orange" className="ml-2">Optional</Tag>}
                      </div>
                      
                      {task.selected && (
                        <div className="mt-3">
                          <TextArea
                            rows={2}
                            placeholder={`Enter custom prompt for ${task.task_label}...`}
                            value={task.prompt || ''}
                            onChange={(e) => handlePromptUpdate(task.id, e.target.value)}
                          />
                          
                          {task.schema_refs && task.schema_refs.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Schema References:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {task.schema_refs.map((ref, idx) => (
                                  <Tag key={idx} color="geekblue" icon={<LinkOutlined />}>
                                    {ref}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {availableTasks.filter(t => t.selected).length === 0 && (
              <Alert
                message="No tasks selected"
                description="Please select at least one task to continue"
                type="warning"
                showIcon
              />
            )}
          </Spin>
        );

      case 3:
        // Schema Linking
        return (
          <Spin spinning={loading}>
            <Alert
              message="Schema Linking Configuration"
              description="Map schema.org URIs to components and atoms for semantic understanding"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div className="space-y-4">
              {schemaLinks.map((link, index) => (
                <Card key={index} size="small">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Input
                        placeholder="Schema URI (e.g., https://schema.org/Person)"
                        value={link.schema_uri}
                        onChange={(e) => handleSchemaLinkChange(index, 'schema_uri', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Role"
                        value={link.role}
                        onChange={(e) => handleSchemaLinkChange(index, 'role', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        placeholder="Link Type"
                        style={{ width: '100%' }}
                        value={link.component_id ? 'component' : link.atom_id ? 'atom' : undefined}
                        onChange={(value) => {
                          if (value === 'component') {
                            handleSchemaLinkChange(index, 'component_id', 'temp');
                            handleSchemaLinkChange(index, 'atom_id', undefined);
                          } else {
                            handleSchemaLinkChange(index, 'atom_id', 'temp');
                            handleSchemaLinkChange(index, 'component_id', undefined);
                          }
                        }}
                      >
                        <Option value="component">Component</Option>
                        <Option value="atom">Atom</Option>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => handleRemoveSchemaLink(index)}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={handleAddSchemaLink}
                icon={<PlusOutlined />}
                block
              >
                Add Schema Link
              </Button>
            </div>

            {linkedSchemaData && (
              <Card title="Linked Schema Analysis" className="mt-4" size="small">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{linkedSchemaData.total_tables || 0}</div>
                    <div className="text-sm text-gray-500">Tables</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{linkedSchemaData.total_relationships || 0}</div>
                    <div className="text-sm text-gray-500">Relationships</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{linkedSchemaData.total_features || 0}</div>
                    <div className="text-sm text-gray-500">Features</div>
                  </div>
                </div>
              </Card>
            )}
          </Spin>
        );

      case 4:
        // Generate & Review
        return (
          <Spin spinning={loading}>
            {!generatedWorkflow ? (
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Generate Workflow</h3>
                  <p className="text-gray-500">
                    Review your configuration and click to generate the complete workflow structure
                  </p>
                </div>

                <Card>
                  <div className="space-y-3 text-left">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">{form.getFieldValue('name')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tasks:</span>
                      <span className="ml-2">{selectedTasks.length} selected</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Schema Links:</span>
                      <span className="ml-2">{schemaLinks.length} configured</span>
                    </div>
                  </div>
                </Card>

                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handleGenerateWorkflow}
                  icon={<ApiOutlined />}
                >
                  Generate Workflow with AI
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert
                  message="Workflow Generated Successfully"
                  description="Review the generated workflow below. Click Complete to finalize."
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />

                <Card title="Generated Workflow Summary">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {generatedWorkflow.atoms?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Atoms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {generatedWorkflow.components?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Components</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {generatedWorkflow.dashboards?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Dashboards</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {generatedWorkflow.schema_links?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Schema Links</div>
                    </div>
                  </div>
                </Card>

                {generatedWorkflow.components && generatedWorkflow.components.length > 0 && (
                  <Card title="Generated Components" size="small">
                    <Collapse>
                      {generatedWorkflow.components.map((comp: any, idx: number) => (
                        <Panel header={comp.name} key={idx}>
                          <div className="space-y-2">
                            <div><strong>Variant:</strong> {comp.variant || 'default'}</div>
                            <div><strong>Description:</strong> {comp.description}</div>
                            {comp.atoms && comp.atoms.length > 0 && (
                              <div>
                                <strong>Atoms:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {comp.atoms.map((atom: string, i: number) => (
                                    <Tag key={i}>{atom}</Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Panel>
                      ))}
                    </Collapse>
                  </Card>
                )}
              </div>
            )}
          </Spin>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <Steps current={currentStep} className="mb-8">
          {steps.map(item => (
            <Step key={item.title} title={item.title} description={item.description} />
          ))}
        </Steps>

        <Form form={form} layout="vertical" className="mb-6">
          {renderStepContent()}
        </Form>

        <div className="flex justify-between">
          <Button onClick={handlePrevious} disabled={currentStep === 0 || loading}>
            Previous
          </Button>
          <Space>
            {currentStep < steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !dbStatus.verified) ||
                  (currentStep === 1 && !selectedTemplate) ||
                  (currentStep === 2 && selectedTasks.length === 0) ||
                  loading
                }
              >
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && generatedWorkflow && (
              <Button type="primary" onClick={handleComplete} disabled={loading}>
                Complete Workflow
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedWorkflowWizard;

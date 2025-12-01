/**
 * Visual Component Generator Service
 * 
 * Automatically generates React components with visual editing capabilities
 * based on CRUD API definitions and configuration schemas
 */

class VisualComponentGenerator {
  constructor(config = {}) {
    this.config = {
      framework: config.framework || 'react',
      uiLibrary: config.uiLibrary || 'antd',
      typescript: config.typescript !== false,
      ...config
    };

    this.componentTemplates = this.initializeTemplates();
  }

  /**
   * Initialize component templates
   */
  initializeTemplates() {
    return {
      react: {
        list: this.generateReactListTemplate.bind(this),
        create: this.generateReactCreateTemplate.bind(this),
        edit: this.generateReactEditTemplate.bind(this),
        view: this.generateReactViewTemplate.bind(this),
        visualEditor: this.generateReactVisualEditorTemplate.bind(this)
      }
    };
  }

  /**
   * Generate complete component package
   */
  generateComponentPackage(entityName, crudAPI, schema) {
    const components = {};
    
    // Generate CRUD components
    components.list = this.generateListComponent(entityName, crudAPI, schema);
    components.create = this.generateCreateComponent(entityName, crudAPI, schema);
    components.edit = this.generateEditComponent(entityName, crudAPI, schema);
    components.view = this.generateViewComponent(entityName, crudAPI, schema);
    
    // Generate visual editor
    components.visualEditor = this.generateVisualEditorComponent(entityName, crudAPI, schema);
    
    // Generate configuration editor
    components.configEditor = this.generateConfigEditorComponent(entityName, schema);
    
    return {
      entityName,
      framework: this.config.framework,
      components,
      routes: this.generateRoutes(entityName),
      api: crudAPI,
      schema
    };
  }

  /**
   * Generate List Component
   */
  generateListComponent(entityName, crudAPI, schema) {
    const template = this.componentTemplates[this.config.framework].list;
    return template(entityName, crudAPI, schema);
  }

  /**
   * Generate Create Component
   */
  generateCreateComponent(entityName, crudAPI, schema) {
    const template = this.componentTemplates[this.config.framework].create;
    return template(entityName, crudAPI, schema);
  }

  /**
   * Generate Edit Component
   */
  generateEditComponent(entityName, crudAPI, schema) {
    const template = this.componentTemplates[this.config.framework].edit;
    return template(entityName, crudAPI, schema);
  }

  /**
   * Generate View Component
   */
  generateViewComponent(entityName, crudAPI, schema) {
    const template = this.componentTemplates[this.config.framework].view;
    return template(entityName, crudAPI, schema);
  }

  /**
   * Generate Visual Editor Component
   */
  generateVisualEditorComponent(entityName, crudAPI, schema) {
    const template = this.componentTemplates[this.config.framework].visualEditor;
    return template(entityName, crudAPI, schema);
  }

  /**
   * Generate Configuration Editor Component
   */
  generateConfigEditorComponent(entityName, schema) {
    const fields = schema.fields || [];
    
    return {
      name: `${entityName}ConfigEditor`,
      code: this.generateConfigEditorCode(entityName, fields),
      description: `Configuration editor for ${entityName} with visual JSON editing`,
      features: [
        'JSON schema validation',
        'Visual form builder',
        'Live preview',
        'Configuration templates'
      ]
    };
  }

  /**
   * React List Template
   */
  generateReactListTemplate(entityName, crudAPI, schema) {
    const fields = schema.fields || [];
    const columns = this.generateTableColumns(fields);
    
    const code = `import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const ${entityName}List = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('${crudAPI.list}?page=\${pagination.current}&pageSize=\${pagination.pageSize}');
      const result = await response.json();
      setData(result.data || []);
      setPagination({ ...pagination, total: result.total });
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this item?',
      onOk: async () => {
        try {
          await fetch(\`${crudAPI.delete.replace(':id', '\${id}')}\`, { method: 'DELETE' });
          message.success('Deleted successfully');
          fetchData();
        } catch (error) {
          message.error('Failed to delete');
        }
      }
    });
  };

  const columns = [
${columns.map(col => `    {
      title: '${col.title}',
      dataIndex: '${col.dataIndex}',
      key: '${col.key}',
      sorter: ${col.sortable},
      ${col.render ? `render: ${col.render}` : ''}
    }`).join(',\n')}
    ,
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => window.location.href = \`/${entityName.toLowerCase()}s/\${record.id}\`} />
          <Button icon={<EditOutlined />} onClick={() => window.location.href = \`/${entityName.toLowerCase()}s/\${record.id}/edit\`} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => window.location.href = '/${entityName.toLowerCase()}s/create'}
        >
          Create ${entityName}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={(newPagination) => setPagination(newPagination)}
        rowKey="id"
      />
    </div>
  );
};

export default ${entityName}List;`;

    return {
      name: `${entityName}List`,
      code,
      description: `List view for ${entityName} with CRUD operations`,
      dependencies: ['react', 'antd']
    };
  }

  /**
   * React Create Template
   */
  generateReactCreateTemplate(entityName, crudAPI, schema) {
    const fields = schema.fields || [];
    const formFields = this.generateFormFields(fields);
    
    const code = `import React from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const ${entityName}Create = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('${crudAPI.create}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (response.ok) {
        message.success('${entityName} created successfully');
        navigate('/${entityName.toLowerCase()}s');
      } else {
        message.error('Failed to create ${entityName}');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create ${entityName}">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
${formFields.map(field => `        <Form.Item
          label="${field.label}"
          name="${field.name}"
          rules={${JSON.stringify(field.rules)}}
        >
          ${field.component}
        </Form.Item>`).join('\n')}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/${entityName.toLowerCase()}s')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ${entityName}Create;`;

    return {
      name: `${entityName}Create`,
      code,
      description: `Create form for ${entityName}`,
      dependencies: ['react', 'antd', 'react-router-dom']
    };
  }

  /**
   * React Edit Template
   */
  generateReactEditTemplate(entityName, crudAPI, schema) {
    const fields = schema.fields || [];
    const formFields = this.generateFormFields(fields);
    
    const code = `import React, { useEffect } from 'react';
import { Form, Input, Button, message, Card, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

const ${entityName}Edit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const response = await fetch(\`${crudAPI.view.replace(':id', '\${id}')}\`);
      const result = await response.json();
      form.setFieldsValue(result.data);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(\`${crudAPI.update.replace(':id', '\${id}')}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (response.ok) {
        message.success('${entityName} updated successfully');
        navigate('/${entityName.toLowerCase()}s');
      } else {
        message.error('Failed to update ${entityName}');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Spin size="large" />;
  }

  return (
    <Card title="Edit ${entityName}">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
${formFields.map(field => `        <Form.Item
          label="${field.label}"
          name="${field.name}"
          rules={${JSON.stringify(field.rules)}}
        >
          ${field.component}
        </Form.Item>`).join('\n')}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/${entityName.toLowerCase()}s')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ${entityName}Edit;`;

    return {
      name: `${entityName}Edit`,
      code,
      description: `Edit form for ${entityName}`,
      dependencies: ['react', 'antd', 'react-router-dom']
    };
  }

  /**
   * React View Template
   */
  generateReactViewTemplate(entityName, crudAPI, schema) {
    const fields = schema.fields || [];
    
    const code = `import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const ${entityName}View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(\`${crudAPI.view.replace(':id', '\${id}')}\`);
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Card 
      title="${entityName} Details"
      extra={
        <>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(\`/${entityName.toLowerCase()}s/\${id}/edit\`)}
          >
            Edit
          </Button>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/${entityName.toLowerCase()}s')}
            style={{ marginLeft: 8 }}
          >
            Back
          </Button>
        </>
      }
    >
      <Descriptions bordered column={1}>
${fields.map(field => `        <Descriptions.Item label="${field.label || field.name}">
          {data?.${field.name}}
        </Descriptions.Item>`).join('\n')}
      </Descriptions>
    </Card>
  );
};

export default ${entityName}View;`;

    return {
      name: `${entityName}View`,
      code,
      description: `Detail view for ${entityName}`,
      dependencies: ['react', 'antd', 'react-router-dom']
    };
  }

  /**
   * React Visual Editor Template
   */
  generateReactVisualEditorTemplate(entityName, crudAPI, schema) {
    const code = `import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Button } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ${entityName}VisualEditor = () => {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card title="Component Palette">
            {/* Component palette items */}
            <div>Drag components here</div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Canvas">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="canvas">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ minHeight: 400, border: '1px dashed #ccc', padding: 16 }}
                  >
                    {components.map((component, index) => (
                      <Draggable key={component.id} draggableId={component.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedComponent(component)}
                          >
                            {component.name}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Properties">
            {selectedComponent ? (
              <div>
                {/* Component properties editor */}
                <p>Edit properties for: {selectedComponent.name}</p>
              </div>
            ) : (
              <p>Select a component to edit properties</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ${entityName}VisualEditor;`;

    return {
      name: `${entityName}VisualEditor`,
      code,
      description: `Visual drag-and-drop editor for ${entityName}`,
      dependencies: ['react', 'antd', 'react-beautiful-dnd']
    };
  }

  /**
   * Generate table columns configuration
   */
  generateTableColumns(fields) {
    return fields.map(field => ({
      title: field.label || field.name,
      dataIndex: field.name,
      key: field.name,
      sortable: field.sortable !== false,
      render: field.type === 'date' ? 
        `(text) => new Date(text).toLocaleDateString()` : null
    }));
  }

  /**
   * Generate form fields
   */
  generateFormFields(fields) {
    return fields.map(field => {
      const rules = [];
      if (field.required) {
        rules.push({ required: true, message: `Please input ${field.label || field.name}` });
      }
      
      let component = '<Input />';
      
      switch (field.type) {
        case 'text':
        case 'textarea':
          component = '<Input.TextArea rows={4} />';
          break;
        case 'number':
          component = '<Input type="number" />';
          break;
        case 'email':
          component = '<Input type="email" />';
          rules.push({ type: 'email', message: 'Please enter a valid email' });
          break;
        case 'url':
          component = '<Input type="url" />';
          rules.push({ type: 'url', message: 'Please enter a valid URL' });
          break;
        case 'select':
          component = `<Select>\n${(field.options || []).map(opt => 
            `            <Select.Option value="${opt}">${opt}</Select.Option>`
          ).join('\n')}\n          </Select>`;
          break;
        case 'date':
          component = '<DatePicker />';
          break;
        case 'boolean':
          component = '<Switch />';
          break;
        default:
          component = '<Input />';
      }
      
      return {
        name: field.name,
        label: field.label || field.name,
        rules,
        component
      };
    });
  }

  /**
   * Generate configuration editor code
   */
  generateConfigEditorCode(entityName, fields) {
    return `import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs } from 'antd';
import MonacoEditor from '@monaco-editor/react';

const ${entityName}ConfigEditor = ({ initialConfig, onSave }) => {
  const [form] = Form.useForm();
  const [jsonConfig, setJsonConfig] = useState(JSON.stringify(initialConfig, null, 2));
  const [activeTab, setActiveTab] = useState('visual');

  const handleSave = () => {
    if (activeTab === 'visual') {
      const formValues = form.getFieldsValue();
      onSave(formValues);
    } else {
      try {
        const config = JSON.parse(jsonConfig);
        onSave(config);
      } catch (error) {
        message.error('Invalid JSON configuration');
      }
    }
  };

  return (
    <Card title="${entityName} Configuration">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Visual Editor" key="visual">
          <Form form={form} layout="vertical" initialValues={initialConfig}>
${fields.map(field => `            <Form.Item label="${field.label || field.name}" name="${field.name}">
              <Input />
            </Form.Item>`).join('\n')}
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane tab="JSON Editor" key="json">
          <MonacoEditor
            height="400px"
            language="json"
            value={jsonConfig}
            onChange={setJsonConfig}
            options={{
              minimap: { enabled: false },
              formatOnPaste: true,
              formatOnType: true
            }}
          />
        </Tabs.TabPane>
      </Tabs>
      <Button type="primary" onClick={handleSave} style={{ marginTop: 16 }}>
        Save Configuration
      </Button>
    </Card>
  );
};

export default ${entityName}ConfigEditor;`;
  }

  /**
   * Generate routes configuration
   */
  generateRoutes(entityName) {
    const basePath = `/${entityName.toLowerCase()}s`;
    
    return [
      {
        path: basePath,
        component: `${entityName}List`,
        exact: true
      },
      {
        path: `${basePath}/create`,
        component: `${entityName}Create`,
        exact: true
      },
      {
        path: `${basePath}/:id`,
        component: `${entityName}View`,
        exact: true
      },
      {
        path: `${basePath}/:id/edit`,
        component: `${entityName}Edit`,
        exact: true
      },
      {
        path: `${basePath}/visual-editor`,
        component: `${entityName}VisualEditor`,
        exact: true
      }
    ];
  }
}

export default VisualComponentGenerator;

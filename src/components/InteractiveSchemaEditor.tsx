/**
 * Interactive Schema Config Editor
 * Real-time bi-directional schema editing with WebSocket
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Tree,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Spin,
  Row,
  Col,
  Divider,
  Alert,
  Timeline,
  Badge,
} from 'antd';
import {
  ApiOutlined,
  LinkOutlined,
  DisconnectOutlined,
  SyncOutlined,
  SaveOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';

const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = Tree;

interface Schema {
  id: number;
  name: string;
  description: string;
  category: string;
  schema_definition: any;
}

interface SchemaEditorProps {
  serverId: number;
  serverName?: string;
  onClose?: () => void;
}

export const InteractiveSchemaEditor: React.FC<SchemaEditorProps> = ({
  serverId,
  serverName,
  onClose,
}) => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const socketRef = useRef<Socket | null>(null);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    startSession();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverId]);

  const startSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mcp/schema-editor/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId,
          clientId: `client-${Date.now()}`
        })
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        connectWebSocket(data.wsUrl);
      } else {
        message.error('Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      message.error('Failed to start editing session');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = (wsUrl: string) => {
    const socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setConnected(true);
      message.success('Connected to schema editor');
      addActivity('Connected to editing session', 'success');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      message.warning('Disconnected from schema editor');
      addActivity('Disconnected from session', 'warning');
    });

    socket.on('schemas-loaded', (loadedSchemas: Schema[]) => {
      setSchemas(loadedSchemas);
      addActivity(`Loaded ${loadedSchemas.length} schemas`, 'info');
    });

    socket.on('schema-updated', (data: any) => {
      // Update local schema
      setSchemas(prev =>
        prev.map(s =>
          s.id === data.schemaId
            ? { ...s, schema_definition: data.updates }
            : s
        )
      );
      addActivity(`Schema ${data.schemaId} updated by another user`, 'info');
      message.info('Schema updated by another user');
    });

    socket.on('schema-linked', (data: any) => {
      addActivity(`Schema linked to server`, 'success');
    });

    socket.on('schema-unlinked', (data: any) => {
      addActivity(`Schema unlinked from server`, 'warning');
    });

    socket.on('error', (error: any) => {
      message.error(error.message);
      addActivity(`Error: ${error.message}`, 'error');
    });

    socketRef.current = socket;
  };

  const addActivity = (message: string, type: string) => {
    setActivity(prev => [
      {
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev.slice(0, 19) // Keep last 20 items
    ]);
  };

  const handleUpdateSchema = async (values: any) => {
    if (!selectedSchema || !socketRef.current) return;

    const updates = {
      ...selectedSchema.schema_definition,
      ...values
    };

    socketRef.current.emit('update-schema', {
      schemaId: selectedSchema.id,
      updates
    });

    addActivity(`Updated schema: ${selectedSchema.name}`, 'success');
    setEditMode(false);
  };

  const handleLinkSchema = async (schemaId: number) => {
    if (!socketRef.current) return;

    socketRef.current.emit('link-schema', { schemaId });
    addActivity(`Linking schema ${schemaId}...`, 'info');
  };

  const handleUnlinkSchema = async (schemaId: number) => {
    if (!socketRef.current) return;

    socketRef.current.emit('unlink-schema', { schemaId });
    addActivity(`Unlinking schema ${schemaId}...`, 'info');
  };

  const renderSchemaTree = (schema: Schema) => {
    const definition = schema.schema_definition;
    
    const buildTree = (obj: any, parentKey = '') => {
      return Object.entries(obj || {}).map(([key, value]) => {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return (
            <TreeNode
              key={fullKey}
              title={
                <span>
                  <Tag color="blue">{key}</Tag>
                  <span style={{ marginLeft: 8, color: '#888' }}>object</span>
                </span>
              }
            >
              {buildTree(value, fullKey)}
            </TreeNode>
          );
        }
        
        return (
          <TreeNode
            key={fullKey}
            title={
              <span>
                <Tag color="green">{key}</Tag>
                <span style={{ marginLeft: 8, color: '#888' }}>
                  {Array.isArray(value) ? 'array' : typeof value}
                </span>
                {value && <span style={{ marginLeft: 8 }}>: {JSON.stringify(value)}</span>}
              </span>
            }
          />
        );
      });
    };

    return <Tree showLine>{buildTree(definition)}</Tree>;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={16}>
            <h2>
              <EditOutlined /> Interactive Schema Editor
              {serverName && <span style={{ marginLeft: 12, fontSize: '16px', color: '#888' }}>
                Server: {serverName}
              </span>}
            </h2>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Badge status={connected ? 'success' : 'error'} text={connected ? 'Connected' : 'Disconnected'} />
              {onClose && (
                <Button onClick={onClose}>Close</Button>
              )}
            </Space>
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p>Starting editing session...</p>
          </div>
        ) : (
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Schemas" size="small">
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {schemas.map(schema => (
                    <Card
                      key={schema.id}
                      size="small"
                      style={{ marginBottom: 8, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedSchema(schema);
                        form.setFieldsValue(schema.schema_definition);
                      }}
                      bodyStyle={{
                        backgroundColor: selectedSchema?.id === schema.id ? '#e6f7ff' : 'white'
                      }}
                    >
                      <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <strong>{schema.name}</strong>
                        <Tag color="blue">{schema.category}</Tag>
                        {schema.description && (
                          <span style={{ fontSize: '12px', color: '#888' }}>
                            {schema.description}
                          </span>
                        )}
                      </Space>
                    </Card>
                  ))}
                </div>
              </Card>
            </Col>

            <Col span={10}>
              <Card
                title={selectedSchema ? `Editing: ${selectedSchema.name}` : 'Select a schema'}
                size="small"
                extra={
                  selectedSchema && (
                    <Space>
                      <Button
                        type={editMode ? 'default' : 'primary'}
                        icon={<EditOutlined />}
                        onClick={() => setEditMode(!editMode)}
                      >
                        {editMode ? 'Cancel' : 'Edit'}
                      </Button>
                      <Button
                        icon={<LinkOutlined />}
                        onClick={() => handleLinkSchema(selectedSchema.id)}
                      >
                        Link
                      </Button>
                      <Button
                        icon={<DisconnectOutlined />}
                        onClick={() => handleUnlinkSchema(selectedSchema.id)}
                      >
                        Unlink
                      </Button>
                    </Space>
                  )
                }
              >
                {selectedSchema ? (
                  editMode ? (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleUpdateSchema}
                    >
                      <Form.Item name="type" label="Type">
                        <Input />
                      </Form.Item>
                      <Form.Item name="properties" label="Properties (JSON)">
                        <TextArea
                          rows={10}
                          placeholder='{"field": {"type": "string"}}'
                        />
                      </Form.Item>
                      <Form.Item>
                        <Space>
                          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                            Save Changes
                          </Button>
                          <Button onClick={() => setEditMode(false)}>
                            Cancel
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  ) : (
                    <div>
                      <Divider>Schema Structure</Divider>
                      {renderSchemaTree(selectedSchema)}
                      
                      <Divider>JSON Definition</Divider>
                      <pre style={{
                        backgroundColor: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        {JSON.stringify(selectedSchema.schema_definition, null, 2)}
                      </pre>
                    </div>
                  )
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    Select a schema to view or edit
                  </div>
                )}
              </Card>
            </Col>

            <Col span={6}>
              <Card title="Activity" size="small">
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <Timeline>
                    {activity.map((item, index) => (
                      <Timeline.Item
                        key={index}
                        color={
                          item.type === 'success' ? 'green' :
                          item.type === 'error' ? 'red' :
                          item.type === 'warning' ? 'orange' : 'blue'
                        }
                      >
                        <p style={{ margin: 0, fontSize: '12px' }}>
                          {item.timestamp}
                        </p>
                        <p style={{ margin: 0 }}>{item.message}</p>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default InteractiveSchemaEditor;

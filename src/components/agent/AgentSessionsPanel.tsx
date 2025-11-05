/**
 * Agent Sessions Panel Component
 * VSCode-style collapsible panel for managing AI agent sessions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  List,
  Badge,
  Space,
  Typography,
  Collapse,
  Tag,
  Tooltip,
  Input,
  Select,
  Modal,
  Form,
  message,
  Avatar,
  Progress,
  Dropdown,
  Menu,
  Divider
} from 'antd';
import {
  RobotOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  EyeOutlined,
  MoreOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  BulbOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './AgentSessionsPanel.css';

const { Panel } = Collapse;
const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AgentSession {
  session_id: string;
  name: string;
  description?: string;
  agent_type: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

interface AgentInstance {
  instance_id: string;
  session_id: string;
  name: string;
  model_name: string;
  specialization?: string;
  capabilities?: string[];
  status: 'initializing' | 'ready' | 'busy' | 'error' | 'stopped';
  delegation_enabled?: boolean;
  auto_prompt_generation?: boolean;
}

interface Repository {
  repo_id: string;
  repo_name: string;
  repo_url?: string;
  branch?: string;
}

interface KnowledgeSection {
  section_id: string;
  name: string;
  description?: string;
  coverage_score: number;
}

interface AgentSessionsPanelProps {
  onSessionSelect?: (session: AgentSession) => void;
  onAgentSelect?: (agent: AgentInstance) => void;
  adminMode?: boolean;
}

export const AgentSessionsPanel: React.FC<AgentSessionsPanelProps> = ({
  onSessionSelect,
  onAgentSelect,
  adminMode = false
}) => {
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [agents, setAgents] = useState<Record<string, AgentInstance[]>>({});
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'single'>('list');
  
  // Modals
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  
  // Form states
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [knowledgeSections, setKnowledgeSections] = useState<KnowledgeSection[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  
  const [sessionForm] = Form.useForm();
  const [agentForm] = Form.useForm();
  const [promptForm] = Form.useForm();

  useEffect(() => {
    loadSessions();
    loadRepositories();
    loadKnowledgeSections();
    loadSpecializations();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadAgentsForSession(selectedSession);
    }
  }, [selectedSession]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/agent/sessions');
      setSessions(response.data);
      
      // Auto-select first active session
      const activeSession = response.data.find((s: AgentSession) => s.status === 'active');
      if (activeSession && !selectedSession) {
        setSelectedSession(activeSession.session_id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      message.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadAgentsForSession = async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/agent/instances?session_id=${sessionId}`);
      setAgents(prev => ({ ...prev, [sessionId]: response.data }));
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadRepositories = async () => {
    try {
      const response = await axios.get('/api/agent/enhanced/repositories');
      setRepositories(response.data);
    } catch (error) {
      console.error('Error loading repositories:', error);
    }
  };

  const loadKnowledgeSections = async () => {
    try {
      const response = await axios.get('/api/agent/enhanced/knowledge-sections');
      setKnowledgeSections(response.data);
    } catch (error) {
      console.error('Error loading knowledge sections:', error);
    }
  };

  const loadSpecializations = async () => {
    try {
      const response = await axios.get('/api/agent/enhanced/specializations');
      setSpecializations(response.data);
    } catch (error) {
      console.error('Error loading specializations:', error);
    }
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleCreateSession = async (values: any) => {
    try {
      const response = await axios.post('/api/agent/sessions', {
        name: values.name,
        description: values.description,
        agent_type: values.agent_type || 'deepseek'
      });
      
      message.success('Session created successfully');
      setShowNewSessionModal(false);
      sessionForm.resetFields();
      await loadSessions();
      setSelectedSession(response.data.session_id);
    } catch (error) {
      console.error('Error creating session:', error);
      message.error('Failed to create session');
    }
  };

  const handleCreateAgent = async (values: any) => {
    if (!selectedSession) {
      message.error('Please select a session first');
      return;
    }

    try {
      const response = await axios.post('/api/agent/enhanced/create', {
        session_id: selectedSession,
        name: values.name,
        model_name: values.model_name || 'deepseek-coder',
        specialization: values.specialization,
        capabilities: values.capabilities || [],
        knowledge_graph_sections: values.knowledge_sections || [],
        repository_ids: values.repositories || [],
        fine_tune_before_start: values.fine_tune || false,
        delegation_enabled: values.delegation_enabled !== false,
        auto_prompt_generation: values.auto_prompt !== false
      });
      
      message.success('Agent created successfully');
      setShowNewAgentModal(false);
      agentForm.resetFields();
      await loadAgentsForSession(selectedSession);
      setSelectedAgent(response.data.instance_id);
      
      if (onAgentSelect) {
        onAgentSelect(response.data);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      message.error('Failed to create agent');
    }
  };

  const handleStartAgentSession = async (values: any) => {
    if (!selectedAgent) {
      message.error('Please select an agent');
      return;
    }

    try {
      // If user provided instructions, create a message
      if (values.instructions) {
        await axios.post('/api/agent/messages', {
          session_id: selectedSession,
          instance_id: selectedAgent,
          content: values.instructions
        });
      }

      message.success('Agent session started');
      setShowPromptModal(false);
      promptForm.resetFields();
    } catch (error) {
      console.error('Error starting agent session:', error);
      message.error('Failed to start agent session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    Modal.confirm({
      title: 'Delete Session',
      content: 'Are you sure you want to delete this session? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.delete(`/api/agent/sessions/${sessionId}`);
          message.success('Session deleted');
          await loadSessions();
          if (selectedSession === sessionId) {
            setSelectedSession(null);
          }
        } catch (error) {
          console.error('Error deleting session:', error);
          message.error('Failed to delete session');
        }
      }
    });
  };

  const handleDeleteAgent = async (agentId: string) => {
    Modal.confirm({
      title: 'Delete Agent',
      content: 'Are you sure you want to delete this agent instance?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.delete(`/api/agent/instances/${agentId}`);
          message.success('Agent deleted');
          if (selectedSession) {
            await loadAgentsForSession(selectedSession);
          }
          if (selectedAgent === agentId) {
            setSelectedAgent(null);
          }
        } catch (error) {
          console.error('Error deleting agent:', error);
          message.error('Failed to delete agent');
        }
      }
    });
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'busy':
      case 'initializing':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'paused':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return 'success';
      case 'busy':
      case 'initializing':
        return 'processing';
      case 'paused':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderAgentCard = (agent: AgentInstance) => {
    const metadata = agent as any;
    const capabilities = metadata.capabilities || [];
    const specialization = metadata.specialization;

    const menu = (
      <Menu>
        <Menu.Item key="view" icon={<EyeOutlined />}>
          View Details
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          Configure
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteAgent(agent.instance_id)}>
          Delete Agent
        </Menu.Item>
      </Menu>
    );

    return (
      <Card
        key={agent.instance_id}
        className={`agent-card ${selectedAgent === agent.instance_id ? 'selected' : ''}`}
        size="small"
        hoverable
        onClick={() => {
          setSelectedAgent(agent.instance_id);
          if (onAgentSelect) {
            onAgentSelect(agent);
          }
        }}
        style={{ marginBottom: 8 }}
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Text strong style={{ fontSize: 14 }}>{agent.name}</Text>
            </Space>
            <Space>
              <Badge status={getStatusColor(agent.status)} />
              <Dropdown overlay={menu} trigger={['click']}>
                <Button type="text" size="small" icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          </div>
          
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {agent.model_name}
            </Text>
          </div>

          {specialization && (
            <Tag color="purple" style={{ fontSize: 11 }}>
              <BulbOutlined /> {specialization}
            </Tag>
          )}

          {capabilities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {capabilities.slice(0, 3).map((cap: string) => (
                <Tag key={cap} style={{ fontSize: 10, margin: 0 }}>
                  {cap}
                </Tag>
              ))}
              {capabilities.length > 3 && (
                <Tag style={{ fontSize: 10, margin: 0 }}>+{capabilities.length - 3}</Tag>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {agent.delegation_enabled && (
              <Tooltip title="Delegation enabled">
                <ThunderboltOutlined style={{ fontSize: 12, color: '#1890ff' }} />
              </Tooltip>
            )}
            {agent.auto_prompt_generation && (
              <Tooltip title="Auto-prompt generation">
                <BulbOutlined style={{ fontSize: 12, color: '#faad14' }} />
              </Tooltip>
            )}
          </div>
        </Space>
      </Card>
    );
  };

  const renderSessionPanel = (session: AgentSession) => {
    const sessionAgents = agents[session.session_id] || [];

    return (
      <Panel
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Space>
              {getStatusIcon(session.status)}
              <Text strong>{session.name}</Text>
              <Tag color={session.agent_type === 'deepseek' ? 'blue' : 'default'} style={{ fontSize: 11 }}>
                {session.agent_type}
              </Tag>
            </Space>
            <Space onClick={e => e.stopPropagation()}>
              <Badge count={sessionAgents.length} showZero />
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(session.session_id);
                }}
              />
            </Space>
          </div>
        }
        key={session.session_id}
        className="session-panel"
      >
        {session.description && (
          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
            {session.description}
          </Paragraph>
        )}

        <div style={{ marginBottom: 12 }}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            size="small"
            block
            onClick={() => {
              setSelectedSession(session.session_id);
              setShowNewAgentModal(true);
            }}
          >
            Add Agent
          </Button>
        </div>

        <List
          dataSource={sessionAgents}
          renderItem={renderAgentCard}
          locale={{ emptyText: 'No agents in this session' }}
        />
      </Panel>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="agent-sessions-panel">
      <Card
        className="panel-header"
        size="small"
        bodyStyle={{ padding: '12px' }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <RobotOutlined style={{ fontSize: 18, color: '#1890ff' }} />
            <Title level={5} style={{ margin: 0 }}>Agent Sessions</Title>
          </Space>
          <Space>
            <Tooltip title={viewMode === 'list' ? 'Switch to single view' : 'Switch to list view'}>
              <Button
                type="text"
                size="small"
                icon={viewMode === 'list' ? <CodeOutlined /> : <BranchesOutlined />}
                onClick={() => setViewMode(viewMode === 'list' ? 'single' : 'list')}
              />
            </Tooltip>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setShowNewSessionModal(true)}
            >
              New Session
            </Button>
          </Space>
        </Space>
      </Card>

      <div className="panel-content" style={{ padding: '12px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <LoadingOutlined style={{ fontSize: 32 }} />
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <RobotOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <Paragraph type="secondary">No agent sessions yet. Create one to get started.</Paragraph>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowNewSessionModal(true)}>
              Create First Session
            </Button>
          </div>
        ) : viewMode === 'list' ? (
          <Collapse
            accordion
            activeKey={selectedSession || undefined}
            onChange={(key) => {
              const sessionId = Array.isArray(key) ? key[0] : key;
              setSelectedSession(sessionId as string);
              if (sessionId) {
                const session = sessions.find(s => s.session_id === sessionId);
                if (session && onSessionSelect) {
                  onSessionSelect(session);
                }
              }
            }}
            className="sessions-collapse"
          >
            {sessions.map(renderSessionPanel)}
          </Collapse>
        ) : (
          <div>
            <Select
              style={{ width: '100%', marginBottom: 16 }}
              placeholder="Select a session"
              value={selectedSession}
              onChange={(value) => {
                setSelectedSession(value);
                const session = sessions.find(s => s.session_id === value);
                if (session && onSessionSelect) {
                  onSessionSelect(session);
                }
              }}
            >
              {sessions.map(session => (
                <Option key={session.session_id} value={session.session_id}>
                  <Space>
                    {getStatusIcon(session.status)}
                    {session.name}
                  </Space>
                </Option>
              ))}
            </Select>

            {selectedSession && (
              <div>
                {(agents[selectedSession] || []).map(renderAgentCard)}
                
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  size="small"
                  block
                  style={{ marginTop: 12 }}
                  onClick={() => setShowNewAgentModal(true)}
                >
                  Add Agent
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedAgent && (
          <div style={{ marginTop: 16 }}>
            <Divider />
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              block
              onClick={() => setShowPromptModal(true)}
            >
              Start Agent Session
            </Button>
          </div>
        )}
      </div>

      {/* New Session Modal */}
      <Modal
        title="Create New Agent Session"
        open={showNewSessionModal}
        onCancel={() => {
          setShowNewSessionModal(false);
          sessionForm.resetFields();
        }}
        onOk={() => sessionForm.submit()}
        width={500}
      >
        <Form form={sessionForm} layout="vertical" onFinish={handleCreateSession}>
          <Form.Item
            name="name"
            label="Session Name"
            rules={[{ required: true, message: 'Please enter a session name' }]}
          >
            <Input placeholder="e.g., Feature Development, Bug Fix, Code Review" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="What are you working on?" />
          </Form.Item>
          <Form.Item name="agent_type" label="Agent Type" initialValue="deepseek">
            <Select>
              <Option value="deepseek">DeepSeek</Option>
              <Option value="gpt4">GPT-4</Option>
              <Option value="claude">Claude</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* New Agent Modal */}
      <Modal
        title={adminMode ? "Create Agent (Admin)" : "Create Agent"}
        open={showNewAgentModal}
        onCancel={() => {
          setShowNewAgentModal(false);
          agentForm.resetFields();
        }}
        onOk={() => agentForm.submit()}
        width={700}
      >
        <Form form={agentForm} layout="vertical" onFinish={handleCreateAgent}>
          <Form.Item
            name="name"
            label="Agent Name"
            rules={[{ required: true, message: 'Please enter an agent name' }]}
          >
            <Input placeholder="e.g., Frontend Developer, API Specialist" />
          </Form.Item>
          
          <Form.Item name="model_name" label="Model" initialValue="deepseek-coder">
            <Select>
              <Option value="deepseek-coder">DeepSeek Coder</Option>
              <Option value="deepseek-chat">DeepSeek Chat</Option>
              <Option value="deepseek-reasoner">DeepSeek Reasoner</Option>
            </Select>
          </Form.Item>

          <Form.Item name="specialization" label="Specialization">
            <Select allowClear placeholder="Select a specialization">
              {specializations.map(spec => (
                <Option key={spec.specialization_id} value={spec.name}>
                  {spec.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="capabilities" label="Capabilities">
            <Select mode="tags" placeholder="Add capabilities">
              <Option value="code_generation">Code Generation</Option>
              <Option value="code_review">Code Review</Option>
              <Option value="debugging">Debugging</Option>
              <Option value="refactoring">Refactoring</Option>
              <Option value="testing">Testing</Option>
              <Option value="documentation">Documentation</Option>
            </Select>
          </Form.Item>

          <Form.Item name="repositories" label="Repositories">
            <Select mode="multiple" placeholder="Select repositories">
              {repositories.map(repo => (
                <Option key={repo.repo_id} value={repo.repo_id}>
                  <FolderOpenOutlined /> {repo.repo_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="knowledge_sections" label="Knowledge Graph Sections">
            <Select mode="multiple" placeholder="Select knowledge sections">
              {knowledgeSections.map(section => (
                <Option key={section.section_id} value={section.section_id}>
                  <DatabaseOutlined /> {section.name} ({(section.coverage_score * 100).toFixed(0)}%)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="delegation_enabled" label="Enable Delegation" valuePropName="checked" initialValue={true}>
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>

          <Form.Item name="auto_prompt" label="Auto-Prompt Generation" valuePropName="checked" initialValue={true}>
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>

          <Form.Item name="fine_tune" label="Fine-tune Before Start" valuePropName="checked" initialValue={false}>
            <Select>
              <Option value={true}>Yes (slower startup)</Option>
              <Option value={false}>No (ready immediately)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Prompt Modal */}
      <Modal
        title="Start Agent Session"
        open={showPromptModal}
        onCancel={() => {
          setShowPromptModal(false);
          promptForm.resetFields();
        }}
        onOk={() => promptForm.submit()}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setShowPromptModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => promptForm.submit()}
          >
            Start Session
          </Button>
        ]}
      >
        <Form form={promptForm} layout="vertical" onFinish={handleStartAgentSession}>
          <Form.Item name="instructions" label="Instructions for Agent">
            <TextArea
              rows={6}
              placeholder="Describe what you want the agent to work on..."
            />
          </Form.Item>
          <Paragraph type="secondary" style={{ fontSize: 12 }}>
            The agent will use its knowledge graph context and capabilities to complete the task.
            DeepSeek can also provide additional instructions automatically.
          </Paragraph>
        </Form>
      </Modal>
    </div>
  );
};

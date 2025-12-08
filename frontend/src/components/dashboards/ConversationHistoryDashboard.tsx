import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Tabs, Tag, Input, Space, Modal, Form, Select, Statistic, Row, Col, Badge } from 'antd';
import { MessageOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, FolderOutlined, FileSearchOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';

const { TabPane } = Tabs;
const { Search } = Input;

const ConversationHistoryDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);
  const [learningPatterns, setLearningPatterns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messagesModalVisible, setMessagesModalVisible] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  // Fetch conversations
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await apiService.conversationHistoryAPI.getConversations();
      if (response.success) {
        setConversations(response.conversations || []);
      } else {
        message.error('Failed to fetch conversations');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch knowledge graph
  const fetchKnowledgeGraph = async () => {
    setLoading(true);
    try {
      const response = await apiService.conversationHistoryAPI.getKnowledgeGraph();
      if (response.success) {
        setKnowledgeGraph(response.knowledgeGraph);
      } else {
        message.error('Failed to fetch knowledge graph');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch knowledge graph');
    } finally {
      setLoading(false);
    }
  };

  // Fetch learning patterns
  const fetchLearningPatterns = async () => {
    setLoading(true);
    try {
      const response = await apiService.conversationHistoryAPI.getLearningPatterns();
      if (response.success) {
        setLearningPatterns(response.patterns || []);
      } else {
        message.error('Failed to fetch learning patterns');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch learning patterns');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await apiService.conversationHistoryAPI.getStats();
      if (response.success) {
        setStats(response.stats);
      } else {
        message.error('Failed to fetch statistics');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  // View messages
  const viewMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await apiService.conversationHistoryAPI.getMessages(conversationId);
      if (response.success) {
        setMessages(response.history || []);
        setMessagesModalVisible(true);
      } else {
        message.error('Failed to fetch messages');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Archive conversation
  const archiveConversation = async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await apiService.conversationHistoryAPI.archiveConversation(conversationId);
      if (response.success) {
        message.success('Conversation archived successfully');
        fetchConversations();
      } else {
        message.error('Failed to archive conversation');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to archive conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, []);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = searchText
      ? conv.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        conv.userId?.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Conversations table columns
  const conversationColumns = [
    {
      title: 'Conversation ID',
      dataIndex: 'conversationId',
      key: 'conversationId',
      ellipsis: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Messages',
      dataIndex: 'messageCount',
      key: 'messageCount',
      render: (count: number) => <Badge count={count} showZero color="blue" />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'gray'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<MessageOutlined />}
            onClick={() => viewMessages(record.conversationId)}
          >
            Messages
          </Button>
          <Button
            size="small"
            onClick={() => archiveConversation(record.conversationId)}
          >
            Archive
          </Button>
        </Space>
      ),
    },
  ];

  // Learning patterns columns
  const patternColumns = [
    {
      title: 'Pattern Type',
      dataIndex: 'patternType',
      key: 'patternType',
    },
    {
      title: 'Success',
      dataIndex: 'success',
      key: 'success',
      render: (success: boolean) => (
        <Tag color={success ? 'green' : 'red'}>
          {success ? 'SUCCESS' : 'FAILURE'}
        </Tag>
      ),
    },
    {
      title: 'Occurrences',
      dataIndex: 'occurrences',
      key: 'occurrences',
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Conversation History</h1>
      <p>Manage DeepSeek conversation history, knowledge graph, and learning patterns</p>

      <Tabs defaultActiveKey="conversations">
        <TabPane tab="Conversations" key="conversations">
          <Card>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Search
                  placeholder="Search by title or user ID"
                  allowClear
                  style={{ width: 300 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                />
                <Select
                  style={{ width: 150 }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: 'All Status', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Archived', value: 'archived' },
                  ]}
                />
              </Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchConversations}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>

            <Table
              columns={conversationColumns}
              dataSource={filteredConversations}
              loading={loading}
              rowKey="conversationId"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Knowledge Graph" key="knowledge">
          <Card
            title="Knowledge Graph"
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchKnowledgeGraph}
                loading={loading}
              >
                Refresh
              </Button>
            }
          >
            {knowledgeGraph ? (
              <div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Statistic
                      title="Total Entities"
                      value={knowledgeGraph.entityCount || 0}
                      prefix={<FolderOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Relationships"
                      value={knowledgeGraph.relationshipCount || 0}
                      prefix={<FileSearchOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Connected Nodes"
                      value={knowledgeGraph.connectedNodes || 0}
                    />
                  </Col>
                </Row>
                <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
                  {JSON.stringify(knowledgeGraph, null, 2)}
                </pre>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>
                No knowledge graph data available. Click Refresh to load.
              </p>
            )}
          </Card>
        </TabPane>

        <TabPane tab="Learning Patterns" key="patterns">
          <Card
            title="Learning Patterns"
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchLearningPatterns}
                loading={loading}
              >
                Refresh
              </Button>
            }
          >
            <Table
              columns={patternColumns}
              dataSource={learningPatterns}
              loading={loading}
              rowKey={(record) => `${record.patternType}-${record.lastSeen}`}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Statistics" key="stats">
          <Card title="System Statistics">
            {stats && (
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Conversations"
                    value={stats.totalConversations || 0}
                    prefix={<MessageOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Messages"
                    value={stats.totalMessages || 0}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Active Conversations"
                    value={stats.activeConversations || 0}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Learning Patterns"
                    value={stats.learningPatternsCount || 0}
                  />
                </Col>
              </Row>
            )}
            {!stats && (
              <p style={{ textAlign: 'center', color: '#999' }}>Loading statistics...</p>
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Messages Modal */}
      <Modal
        title="Conversation Messages"
        open={messagesModalVisible}
        onCancel={() => setMessagesModalVisible(false)}
        footer={null}
        width={800}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: 12,
              padding: 12,
              background: msg.role === 'user' ? '#e6f7ff' : '#f0f0f0',
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              <Tag color={msg.role === 'user' ? 'blue' : 'green'}>
                {msg.role?.toUpperCase()}
              </Tag>
              <span style={{ fontSize: 12, color: '#666' }}>
                {new Date(msg.timestamp).toLocaleString()}
              </span>
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default ConversationHistoryDashboard;

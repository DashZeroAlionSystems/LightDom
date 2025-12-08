/**
 * Feedback Loop Dashboard
 * 
 * Manages user feedback, preferences, A/B testing campaigns, and communication logs
 * for continuous improvement of AI responses and user experience.
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Table,
  Form,
  Input,
  Select,
  InputNumber,
  Modal,
  message,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Progress,
  List,
  DatePicker,
  Radio,
  Divider,
  Tooltip,
  Alert,
} from 'antd';
import {
  LikeOutlined,
  DislikeOutlined,
  ExperimentOutlined,
  SettingOutlined,
  MessageOutlined,
  BarChartOutlined,
  ReloadOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { feedbackLoopAPI } from '@/services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FeedbackLoopDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [loading, setLoading] = useState(false);

  // Feedback state
  const [feedbackSummary, setFeedbackSummary] = useState<any>(null);
  const [feedbackFilters, setFeedbackFilters] = useState<any>({});

  // Preferences state
  const [preferences, setPreferences] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  // A/B Testing state
  const [abTestCampaigns, setAbTestCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignPerformance, setCampaignPerformance] = useState<any>(null);

  // Communication logs state
  const [communicationLogs, setCommunicationLogs] = useState<any[]>([]);
  const [logFilters, setLogFilters] = useState<any>({});

  // Modals
  const [isSubmitFeedbackModalVisible, setIsSubmitFeedbackModalVisible] = useState(false);
  const [isCreateCampaignModalVisible, setIsCreateCampaignModalVisible] = useState(false);
  const [isSetPreferenceModalVisible, setIsSetPreferenceModalVisible] = useState(false);

  // Forms
  const [feedbackForm] = Form.useForm();
  const [campaignForm] = Form.useForm();
  const [preferenceForm] = Form.useForm();

  useEffect(() => {
    generateSessionId();
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback') {
      loadFeedbackSummary();
    } else if (activeTab === 'preferences' && sessionId) {
      loadPreferences();
    } else if (activeTab === 'ab-testing') {
      loadABTestCampaigns();
    } else if (activeTab === 'logs') {
      loadCommunicationLogs();
    }
  }, [activeTab, feedbackFilters, sessionId, logFilters]);

  const generateSessionId = async () => {
    try {
      const result = await feedbackLoopAPI.generateSessionId();
      setSessionId(result.sessionId);
    } catch (error) {
      console.error('Failed to generate session ID:', error);
      message.error('Failed to generate session ID');
    }
  };

  const loadFeedbackSummary = async () => {
    setLoading(true);
    try {
      const result = await feedbackLoopAPI.getFeedbackSummary(feedbackFilters);
      setFeedbackSummary(result.summary);
    } catch (error) {
      console.error('Failed to load feedback summary:', error);
      message.error('Failed to load feedback summary');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const result = await feedbackLoopAPI.getPreferences(sessionId);
      setPreferences(result.preferences || []);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      message.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const loadABTestCampaigns = async () => {
    setLoading(true);
    try {
      // Mock data since we don't have a list endpoint
      setAbTestCampaigns([]);
    } catch (error) {
      console.error('Failed to load A/B test campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunicationLogs = async () => {
    setLoading(true);
    try {
      const result = await feedbackLoopAPI.getCommunicationLogs(logFilters);
      setCommunicationLogs(result.logs || []);
    } catch (error) {
      console.error('Failed to load communication logs:', error);
      message.error('Failed to load communication logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (values: any) => {
    try {
      await feedbackLoopAPI.submitFeedback({
        ...values,
        sessionId,
      });
      message.success('Feedback submitted successfully');
      setIsSubmitFeedbackModalVisible(false);
      feedbackForm.resetFields();
      loadFeedbackSummary();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      message.error('Failed to submit feedback');
    }
  };

  const handleSetPreference = async (values: any) => {
    try {
      await feedbackLoopAPI.setPreference({
        ...values,
        sessionId,
      });
      message.success('Preference set successfully');
      setIsSetPreferenceModalVisible(false);
      preferenceForm.resetFields();
      loadPreferences();
    } catch (error) {
      console.error('Failed to set preference:', error);
      message.error('Failed to set preference');
    }
  };

  const handleCreateCampaign = async (values: any) => {
    try {
      const variantsArray = values.variants.split(',').map((v: string) => ({
        id: v.trim(),
        name: v.trim(),
        weight: 1,
      }));

      await feedbackLoopAPI.createABTestCampaign({
        ...values,
        variants: variantsArray,
      });
      message.success('A/B test campaign created successfully');
      setIsCreateCampaignModalVisible(false);
      campaignForm.resetFields();
      loadABTestCampaigns();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      message.error('Failed to create campaign');
    }
  };

  const handleStartCampaign = async (campaignId: number) => {
    try {
      await feedbackLoopAPI.startABTestCampaign(campaignId);
      message.success('Campaign started successfully');
      loadABTestCampaigns();
    } catch (error) {
      console.error('Failed to start campaign:', error);
      message.error('Failed to start campaign');
    }
  };

  const handleCompleteCampaign = async (campaignId: number, winningVariant?: string) => {
    try {
      await feedbackLoopAPI.completeCampaign(campaignId, winningVariant);
      message.success('Campaign completed successfully');
      loadABTestCampaigns();
    } catch (error) {
      console.error('Failed to complete campaign:', error);
      message.error('Failed to complete campaign');
    }
  };

  const loadCampaignPerformance = async (campaignId: number) => {
    try {
      const result = await feedbackLoopAPI.getCampaignPerformance(campaignId);
      setCampaignPerformance(result.performance);
    } catch (error) {
      console.error('Failed to load campaign performance:', error);
      message.error('Failed to load campaign performance');
    }
  };

  const feedbackColumns = [
    {
      title: 'Type',
      dataIndex: 'feedbackType',
      key: 'feedbackType',
      render: (type: string) => {
        const color = type === 'positive' ? 'green' : type === 'negative' ? 'red' : 'gray';
        const icon = type === 'positive' ? <LikeOutlined /> : type === 'negative' ? <DislikeOutlined /> : null;
        return <Tag color={color} icon={icon}>{type}</Tag>;
      },
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Avg Strength',
      dataIndex: 'avgStrength',
      key: 'avgStrength',
      render: (strength: number) => strength?.toFixed(2),
    },
  ];

  const preferencesColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => <Tag>{source}</Tag>,
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence_score',
      key: 'confidence_score',
      render: (score: number) => score ? <Progress percent={score * 100} size="small" /> : 'N/A',
    },
  ];

  const campaignsColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : status === 'completed' ? 'blue' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Variants',
      dataIndex: 'variants',
      key: 'variants',
      render: (variants: any[]) => variants?.length || 0,
    },
    {
      title: 'Target Metric',
      dataIndex: 'target_metric',
      key: 'target_metric',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'draft' && (
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartCampaign(record.id)}
            >
              Start
            </Button>
          )}
          {record.status === 'active' && (
            <>
              <Button
                size="small"
                icon={<BarChartOutlined />}
                onClick={() => {
                  setSelectedCampaign(record);
                  loadCampaignPerformance(record.id);
                }}
              >
                View
              </Button>
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleCompleteCampaign(record.id)}
              >
                Complete
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const logsColumns = [
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: 'log_type',
      key: 'log_type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      render: (dir: string) => <Tag color={dir === 'inbound' ? 'green' : 'blue'}>{dir}</Tag>,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'success' ? 'green' : 'red'}>{status}</Tag>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <MessageOutlined />
            <span>Feedback Loop Dashboard</span>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Session ID">
              <Tag color="purple">{sessionId}</Tag>
            </Tooltip>
            <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Feedback Tab */}
          <TabPane
            tab={
              <span>
                <LikeOutlined />
                Feedback Summary
              </span>
            }
            key="feedback"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Feedback"
                      value={feedbackSummary?.totalCount || 0}
                      prefix={<MessageOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Positive Rate"
                      value={feedbackSummary?.positiveRate || 0}
                      suffix="%"
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<LikeOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Avg Strength"
                      value={feedbackSummary?.avgStrength || 0}
                      precision={2}
                      prefix={<BarChartOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Card
                title="Feedback Filters"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsSubmitFeedbackModalVisible(true)}>
                    Submit Feedback
                  </Button>
                }
              >
                <Form layout="inline" onValuesChange={(_, values) => setFeedbackFilters(values)}>
                  <Form.Item name="modelUsed" label="Model">
                    <Input placeholder="Model name" style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="templateStyle" label="Template Style">
                    <Input placeholder="Template style" style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="feedbackType" label="Type">
                    <Select placeholder="Select type" style={{ width: 150 }} allowClear>
                      <Option value="positive">Positive</Option>
                      <Option value="negative">Negative</Option>
                      <Option value="neutral">Neutral</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>

              <Card title="Feedback by Type">
                <Table
                  columns={feedbackColumns}
                  dataSource={feedbackSummary?.byType || []}
                  loading={loading}
                  pagination={false}
                  rowKey="feedbackType"
                />
              </Card>
            </Space>
          </TabPane>

          {/* Preferences Tab */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Preferences
              </span>
            }
            key="preferences"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Alert
                message="User Preferences"
                description="Manage learned preferences from user feedback and explicit settings."
                type="info"
                showIcon
              />

              <Card
                title={`Preferences for Session: ${sessionId}`}
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsSetPreferenceModalVisible(true)}>
                    Set Preference
                  </Button>
                }
              >
                <Table
                  columns={preferencesColumns}
                  dataSource={preferences}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  rowKey="id"
                />
              </Card>
            </Space>
          </TabPane>

          {/* A/B Testing Tab */}
          <TabPane
            tab={
              <span>
                <ExperimentOutlined />
                A/B Testing
              </span>
            }
            key="ab-testing"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Alert
                message="A/B Testing Campaigns"
                description="Create and manage A/B tests to optimize response quality and user experience."
                type="info"
                showIcon
              />

              <Card
                title="Active Campaigns"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateCampaignModalVisible(true)}>
                    Create Campaign
                  </Button>
                }
              >
                <Table
                  columns={campaignsColumns}
                  dataSource={abTestCampaigns}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  rowKey="id"
                />
              </Card>

              {selectedCampaign && campaignPerformance && (
                <Card title={`Performance: ${selectedCampaign.name}`}>
                  <Row gutter={16}>
                    {campaignPerformance.variants?.map((variant: any) => (
                      <Col span={8} key={variant.id}>
                        <Card>
                          <Statistic title={variant.name} value={variant.conversionRate} suffix="%" />
                          <Divider />
                          <p>Interactions: {variant.interactions}</p>
                          <p>Conversions: {variant.conversions}</p>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              )}
            </Space>
          </TabPane>

          {/* Communication Logs Tab */}
          <TabPane
            tab={
              <span>
                <MessageOutlined />
                Communication Logs
              </span>
            }
            key="logs"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card title="Log Filters">
                <Form layout="inline" onValuesChange={(_, values) => setLogFilters(values)}>
                  <Form.Item name="sessionId" label="Session ID">
                    <Input placeholder="Session ID" style={{ width: 250 }} />
                  </Form.Item>
                  <Form.Item name="logType" label="Log Type">
                    <Select placeholder="Select type" style={{ width: 150 }} allowClear>
                      <Option value="user_action">User Action</Option>
                      <Option value="system_event">System Event</Option>
                      <Option value="error">Error</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="serviceName" label="Service">
                    <Input placeholder="Service name" style={{ width: 200 }} />
                  </Form.Item>
                </Form>
              </Card>

              <Card title="Communication Logs">
                <Table
                  columns={logsColumns}
                  dataSource={communicationLogs}
                  loading={loading}
                  pagination={{ pageSize: 20 }}
                  rowKey="id"
                />
              </Card>
            </Space>
          </TabPane>
        </Tabs>
      </Card>

      {/* Submit Feedback Modal */}
      <Modal
        title="Submit Feedback"
        open={isSubmitFeedbackModalVisible}
        onCancel={() => setIsSubmitFeedbackModalVisible(false)}
        footer={null}
      >
        <Form form={feedbackForm} layout="vertical" onFinish={handleSubmitFeedback}>
          <Form.Item name="conversationId" label="Conversation ID" rules={[{ required: true }]}>
            <Input placeholder="Enter conversation ID" />
          </Form.Item>
          <Form.Item name="messageId" label="Message ID" rules={[{ required: true }]}>
            <Input placeholder="Enter message ID" />
          </Form.Item>
          <Form.Item name="feedbackType" label="Feedback Type" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="positive">Positive</Radio>
              <Radio value="negative">Negative</Radio>
              <Radio value="neutral">Neutral</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="feedbackStrength" label="Strength (1-5)">
            <InputNumber min={1} max={5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="prompt" label="Prompt" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Enter the prompt" />
          </Form.Item>
          <Form.Item name="response" label="Response" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Enter the response" />
          </Form.Item>
          <Form.Item name="feedbackReason" label="Reason">
            <TextArea rows={2} placeholder="Optional feedback reason" />
          </Form.Item>
          <Form.Item name="modelUsed" label="Model">
            <Input placeholder="e.g., gpt-4, deepseek" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Feedback
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Set Preference Modal */}
      <Modal
        title="Set Preference"
        open={isSetPreferenceModalVisible}
        onCancel={() => setIsSetPreferenceModalVisible(false)}
        footer={null}
      >
        <Form form={preferenceForm} layout="vertical" onFinish={handleSetPreference}>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Input placeholder="e.g., response_style, language" />
          </Form.Item>
          <Form.Item name="key" label="Key" rules={[{ required: true }]}>
            <Input placeholder="e.g., preferred_template, tone" />
          </Form.Item>
          <Form.Item name="value" label="Value" rules={[{ required: true }]}>
            <Input placeholder="Preference value" />
          </Form.Item>
          <Form.Item name="source" label="Source">
            <Select placeholder="Select source">
              <Option value="explicit">Explicit</Option>
              <Option value="inferred">Inferred</Option>
              <Option value="system">System</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Set Preference
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Campaign Modal */}
      <Modal
        title="Create A/B Test Campaign"
        open={isCreateCampaignModalVisible}
        onCancel={() => setIsCreateCampaignModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={campaignForm} layout="vertical" onFinish={handleCreateCampaign}>
          <Form.Item name="name" label="Campaign Name" rules={[{ required: true }]}>
            <Input placeholder="Enter campaign name" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Describe the campaign" />
          </Form.Item>
          <Form.Item
            name="variants"
            label="Variants (comma-separated)"
            rules={[{ required: true }]}
            extra="e.g., variant_a, variant_b, variant_c"
          >
            <Input placeholder="variant_a, variant_b" />
          </Form.Item>
          <Form.Item name="targetMetric" label="Target Metric" rules={[{ required: true }]}>
            <Input placeholder="e.g., conversion_rate, engagement" />
          </Form.Item>
          <Form.Item name="sampleSize" label="Sample Size">
            <InputNumber min={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="durationDays" label="Duration (days)">
            <InputNumber min={1} max={90} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Campaign
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeedbackLoopDashboard;

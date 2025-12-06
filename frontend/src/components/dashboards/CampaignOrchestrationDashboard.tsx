import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Statistic, 
  Row, 
  Col,
  message,
  Spin,
  Typography,
  Divider,
  Descriptions
} from 'antd';
import { 
  PlayCircleOutlined, 
  PlusOutlined, 
  ReloadOutlined,
  SearchOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  RocketOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { campaignOrchestrationAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const CampaignOrchestrationDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [researches, setResearches] = useState<any[]>([]);
  const [miningInstances, setMiningInstances] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalResearches: 0,
    totalMining: 0
  });

  // Modals
  const [createCampaignModal, setCreateCampaignModal] = useState(false);
  const [researchModal, setResearchModal] = useState(false);
  const [miningModal, setMiningModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedResearch, setSelectedResearch] = useState<any>(null);

  const [form] = Form.useForm();
  const [researchForm] = Form.useForm();
  const [miningForm] = Form.useForm();

  useEffect(() => {
    loadCampaigns();
    loadResearches();
    loadMiningInstances();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignOrchestrationAPI.getCampaigns();
      setCampaigns(data.campaigns || []);
      setStats(prev => ({ ...prev, totalCampaigns: data.campaigns?.length || 0 }));
    } catch (error: any) {
      message.error(error.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const loadResearches = async () => {
    try {
      const data = await campaignOrchestrationAPI.getResearches();
      setResearches(data.researches || []);
      setStats(prev => ({ ...prev, totalResearches: data.researches?.length || 0 }));
    } catch (error: any) {
      message.error(error.message || 'Failed to load researches');
    }
  };

  const loadMiningInstances = async () => {
    try {
      const data = await campaignOrchestrationAPI.getMiningInstances();
      setMiningInstances(data.instances || []);
      setStats(prev => ({ ...prev, totalMining: data.instances?.length || 0 }));
    } catch (error: any) {
      message.error(error.message || 'Failed to load mining instances');
    }
  };

  const handleCreateCampaign = async (values: any) => {
    try {
      setLoading(true);
      await campaignOrchestrationAPI.createCampaignFromPrompt(values.prompt, values.name, values.description, values.options);
      message.success('Campaign created successfully');
      setCreateCampaignModal(false);
      form.resetFields();
      loadCampaigns();
    } catch (error: any) {
      message.error(error.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async (campaignId: string) => {
    try {
      await campaignOrchestrationAPI.startCampaign(campaignId);
      message.success('Campaign started successfully');
      loadCampaigns();
    } catch (error: any) {
      message.error(error.message || 'Failed to start campaign');
    }
  };

  const handleKickoffResearch = async (values: any) => {
    try {
      setLoading(true);
      await campaignOrchestrationAPI.kickoffResearch(values.campaignId, values.options);
      message.success('Research started successfully');
      setResearchModal(false);
      researchForm.resetFields();
      loadResearches();
    } catch (error: any) {
      message.error(error.message || 'Failed to start research');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverAttributes = async (researchId: string) => {
    try {
      await campaignOrchestrationAPI.discoverAttributes(researchId);
      message.success('Attribute discovery started');
      loadResearches();
    } catch (error: any) {
      message.error(error.message || 'Failed to discover attributes');
    }
  };

  const handleCreateMining = async (values: any) => {
    try {
      setLoading(true);
      await campaignOrchestrationAPI.createMiningWithAttributes(
        values.campaignId,
        values.attributeIds,
        values.options
      );
      message.success('Mining instance created successfully');
      setMiningModal(false);
      miningForm.resetFields();
      loadMiningInstances();
    } catch (error: any) {
      message.error(error.message || 'Failed to create mining instance');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMining = async (miningId: string) => {
    try {
      await campaignOrchestrationAPI.startMining(miningId);
      message.success('Mining started successfully');
      loadMiningInstances();
    } catch (error: any) {
      message.error(error.message || 'Failed to start mining');
    }
  };

  const campaignColumns = [
    {
      title: 'Campaign ID',
      dataIndex: 'campaign_id',
      key: 'campaign_id',
      render: (text: string) => <Text code>{text?.substring(0, 8)}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : status === 'completed' ? 'blue' : 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            size="small"
            onClick={() => handleStartCampaign(record.campaign_id)}
          >
            Start
          </Button>
          <Button 
            icon={<SearchOutlined />} 
            size="small"
            onClick={() => setSelectedCampaign(record)}
          >
            Details
          </Button>
        </Space>
      )
    }
  ];

  const researchColumns = [
    {
      title: 'Research ID',
      dataIndex: 'research_id',
      key: 'research_id',
      render: (text: string) => <Text code>{text?.substring(0, 8)}</Text>
    },
    {
      title: 'Campaign',
      dataIndex: 'campaign_id',
      key: 'campaign_id',
      render: (text: string) => <Text code>{text?.substring(0, 8)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : status === 'completed' ? 'blue' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Attributes Found',
      dataIndex: 'attributes_count',
      key: 'attributes_count',
      render: (count: number) => count || 0
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="primary" 
            icon={<ExperimentOutlined />} 
            size="small"
            onClick={() => handleDiscoverAttributes(record.research_id)}
          >
            Discover
          </Button>
          <Button 
            icon={<SearchOutlined />} 
            size="small"
            onClick={() => setSelectedResearch(record)}
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  const miningColumns = [
    {
      title: 'Mining ID',
      dataIndex: 'mining_id',
      key: 'mining_id',
      render: (text: string) => <Text code>{text?.substring(0, 8)}</Text>
    },
    {
      title: 'Campaign',
      dataIndex: 'campaign_id',
      key: 'campaign_id',
      render: (text: string) => <Text code>{text?.substring(0, 8)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'running' ? 'green' : status === 'completed' ? 'blue' : status === 'queued' ? 'orange' : 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Attributes',
      dataIndex: 'attribute_count',
      key: 'attribute_count',
      render: (count: number) => count || 0
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress || 0}%`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="primary" 
            icon={<RocketOutlined />} 
            size="small"
            onClick={() => handleStartMining(record.mining_id)}
            disabled={record.status === 'running'}
          >
            Start
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Campaign Orchestration</Title>
      <Text type="secondary">Manage SEO campaign orchestration with research and data mining</Text>

      <Row gutter={16} style={{ marginTop: '24px', marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Campaigns" 
              value={stats.totalCampaigns} 
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Active Campaigns" 
              value={stats.activeCampaigns} 
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Researches" 
              value={stats.totalResearches} 
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Mining Instances" 
              value={stats.totalMining} 
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="campaigns">
        <TabPane tab="Campaigns" key="campaigns">
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setCreateCampaignModal(true)}
              >
                Create Campaign
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadCampaigns}>
                Refresh
              </Button>
            </Space>
            <Table 
              columns={campaignColumns} 
              dataSource={campaigns}
              loading={loading}
              rowKey="campaign_id"
            />
          </Card>
        </TabPane>

        <TabPane tab="Research Instances" key="research">
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setResearchModal(true)}
              >
                Kickoff Research
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadResearches}>
                Refresh
              </Button>
            </Space>
            <Table 
              columns={researchColumns} 
              dataSource={researches}
              loading={loading}
              rowKey="research_id"
            />
          </Card>
        </TabPane>

        <TabPane tab="Data Mining" key="mining">
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setMiningModal(true)}
              >
                Create Mining Instance
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadMiningInstances}>
                Refresh
              </Button>
            </Space>
            <Table 
              columns={miningColumns} 
              dataSource={miningInstances}
              loading={loading}
              rowKey="mining_id"
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Create Campaign Modal */}
      <Modal
        title="Create Campaign from Prompt"
        open={createCampaignModal}
        onCancel={() => setCreateCampaignModal(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCampaign}>
          <Form.Item 
            name="prompt" 
            label="Campaign Prompt" 
            rules={[{ required: true, message: 'Please enter a prompt' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe your campaign in natural language..."
            />
          </Form.Item>

          <Form.Item name="name" label="Campaign Name">
            <Input placeholder="Optional campaign name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Optional description" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Campaign
              </Button>
              <Button onClick={() => setCreateCampaignModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Kickoff Research Modal */}
      <Modal
        title="Kickoff Research"
        open={researchModal}
        onCancel={() => setResearchModal(false)}
        footer={null}
        width={500}
      >
        <Form form={researchForm} layout="vertical" onFinish={handleKickoffResearch}>
          <Form.Item 
            name="campaignId" 
            label="Campaign" 
            rules={[{ required: true, message: 'Please select a campaign' }]}
          >
            <Select placeholder="Select campaign">
              {campaigns.map(c => (
                <Option key={c.campaign_id} value={c.campaign_id}>
                  {c.name || c.campaign_id.substring(0, 8)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Start Research
              </Button>
              <Button onClick={() => setResearchModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Mining Modal */}
      <Modal
        title="Create Mining Instance"
        open={miningModal}
        onCancel={() => setMiningModal(false)}
        footer={null}
        width={500}
      >
        <Form form={miningForm} layout="vertical" onFinish={handleCreateMining}>
          <Form.Item 
            name="campaignId" 
            label="Campaign" 
            rules={[{ required: true, message: 'Please select a campaign' }]}
          >
            <Select placeholder="Select campaign">
              {campaigns.map(c => (
                <Option key={c.campaign_id} value={c.campaign_id}>
                  {c.name || c.campaign_id.substring(0, 8)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="attributeIds" 
            label="Attributes" 
            rules={[{ required: true, message: 'Please enter attribute IDs' }]}
          >
            <Select mode="tags" placeholder="Enter attribute IDs">
              {/* Dynamically populated from research */}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Mining Instance
              </Button>
              <Button onClick={() => setMiningModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <Modal
          title="Campaign Details"
          open={!!selectedCampaign}
          onCancel={() => setSelectedCampaign(null)}
          footer={null}
          width={700}
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Campaign ID">{selectedCampaign.campaign_id}</Descriptions.Item>
            <Descriptions.Item label="Name">{selectedCampaign.name}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedCampaign.description}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedCampaign.status === 'active' ? 'green' : 'default'}>
                {selectedCampaign.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">{new Date(selectedCampaign.created_at).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </div>
  );
};

export default CampaignOrchestrationDashboard;

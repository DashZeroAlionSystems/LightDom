import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  Tag,
  Button,
  Modal,
  Select,
  Divider,
  Alert,
  Timeline,
  Badge,
  Tabs,
  Space,
  Tooltip,
  message
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  RocketOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  LineChartOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import './SEOTrainingAdminDashboard.css';

const { TabPane } = Tabs;
const { Option } = Select;

interface SiteStats {
  siteId: string;
  siteName: string;
  domain: string;
  totalContributions: number;
  avgQualityScore: number;
  totalRewards: number;
  lastContribution: string;
  featuresProvided: number;
  contributionTrend: 'up' | 'down' | 'stable';
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface TrainingRun {
  id: string;
  modelName: string;
  modelType: 'xgboost' | 'lightgbm' | 'neural_network' | 'bert_finetune';
  status: 'training' | 'completed' | 'failed' | 'pending';
  progress: number;
  currentEpoch?: number;
  totalEpochs?: number;
  ndcg: number;
  map: number;
  precision: number;
  recall: number;
  datasetSize: number;
  startTime: string;
  estimatedCompletion?: string;
  featureImportance?: { feature: string; score: number }[];
}

interface FeatureScoreThreshold {
  featureName: string;
  category: string;
  minGood: number;
  maxGood: number;
  minExcellent: number;
  maxExcellent: number;
  weight: number;
  currentAvg: number;
  description: string;
}

interface LiveMetrics {
  timestamp: string;
  loss: number;
  ndcg: number;
  map: number;
  learningRate: number;
}

const SEOTrainingAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedModelType, setSelectedModelType] = useState<string>('all');
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);

  // State for dashboard data
  const [overviewStats, setOverviewStats] = useState({
    totalSites: 0,
    totalContributions: 0,
    avgQualityScore: 0,
    activeTrainingRuns: 0,
    totalModels: 0,
    bestModelNDCG: 0,
    datasetReadiness: 0,
    totalRewards: 0
  });

  const [siteStats, setSiteStats] = useState<SiteStats[]>([]);
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>([]);
  const [featureThresholds, setFeatureThresholds] = useState<FeatureScoreThreshold[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics[]>([]);
  const [qualityDistribution, setQualityDistribution] = useState<any[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch overview stats
      const overviewRes = await fetch('/api/seo/training/admin/overview');
      const overview = await overviewRes.json();
      setOverviewStats(overview);

      // Fetch site-level stats
      const sitesRes = await fetch('/api/seo/training/admin/sites');
      const sites = await sitesRes.json();
      setSiteStats(sites);

      // Fetch training runs
      const runsRes = await fetch('/api/seo/models?status=active');
      const runs = await runsRes.json();
      setTrainingRuns(runs);

      // Fetch feature thresholds
      const thresholdsRes = await fetch('/api/seo/training/admin/feature-thresholds');
      const thresholds = await thresholdsRes.json();
      setFeatureThresholds(thresholds);

      // Fetch quality distribution
      const qualityRes = await fetch('/api/seo/training/admin/quality-distribution');
      const quality = await qualityRes.json();
      setQualityDistribution(quality);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch live metrics for active training runs
  const fetchLiveMetrics = async (runId: string) => {
    try {
      const res = await fetch(`/api/seo/training/${runId}/live-metrics`);
      const metrics = await res.json();
      setLiveMetrics(metrics);
    } catch (error) {
      console.error('Error fetching live metrics:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 seconds
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Start new training run
  const handleStartTraining = async (config: any) => {
    try {
      const res = await fetch('/api/seo/models/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        message.success('Training started successfully');
        setTrainingModalVisible(false);
        fetchDashboardData();
      } else {
        message.error('Failed to start training');
      }
    } catch (error) {
      console.error('Error starting training:', error);
      message.error('Error starting training');
    }
  };

  // Control training run (pause/resume/stop)
  const handleTrainingControl = async (runId: string, action: 'pause' | 'resume' | 'stop') => {
    try {
      const res = await fetch(`/api/seo/training/${runId}/${action}`, {
        method: 'POST'
      });

      if (res.ok) {
        message.success(`Training ${action}d successfully`);
        fetchDashboardData();
      } else {
        message.error(`Failed to ${action} training`);
      }
    } catch (error) {
      console.error(`Error ${action}ing training:`, error);
      message.error(`Error ${action}ing training`);
    }
  };

  // Deploy model to production
  const handleDeployModel = async (modelId: string) => {
    try {
      const res = await fetch(`/api/seo/models/${modelId}/deploy`, {
        method: 'POST'
      });

      if (res.ok) {
        message.success('Model deployed successfully');
        fetchDashboardData();
      } else {
        message.error('Failed to deploy model');
      }
    } catch (error) {
      console.error('Error deploying model:', error);
      message.error('Error deploying model');
    }
  };

  // Color schemes
  const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884d8'];
  const QUALITY_COLORS = {
    excellent: '#52c41a',
    good: '#1890ff',
    fair: '#faad14',
    poor: '#f5222d'
  };

  // Site stats table columns
  const siteColumns = [
    {
      title: 'Site',
      dataIndex: 'siteName',
      key: 'siteName',
      render: (text: string, record: SiteStats) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.domain}</div>
        </div>
      )
    },
    {
      title: 'Contributions',
      dataIndex: 'totalContributions',
      key: 'totalContributions',
      sorter: (a: SiteStats, b: SiteStats) => a.totalContributions - b.totalContributions,
      render: (value: number, record: SiteStats) => (
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{value}</div>
          <Tag color={record.contributionTrend === 'up' ? 'green' : record.contributionTrend === 'down' ? 'red' : 'blue'}>
            {record.contributionTrend}
          </Tag>
        </div>
      )
    },
    {
      title: 'Quality Score',
      dataIndex: 'avgQualityScore',
      key: 'avgQualityScore',
      sorter: (a: SiteStats, b: SiteStats) => a.avgQualityScore - b.avgQualityScore,
      render: (score: number, record: SiteStats) => (
        <div>
          <Progress
            percent={score}
            size="small"
            strokeColor={QUALITY_COLORS[record.dataQuality]}
            format={(percent) => `${percent}/100`}
          />
          <Tag color={QUALITY_COLORS[record.dataQuality]} style={{ marginTop: '4px' }}>
            {record.dataQuality}
          </Tag>
        </div>
      )
    },
    {
      title: 'Features',
      dataIndex: 'featuresProvided',
      key: 'featuresProvided',
      render: (value: number) => (
        <Statistic value={value} suffix="/ 194" valueStyle={{ fontSize: '14px' }} />
      )
    },
    {
      title: 'Rewards',
      dataIndex: 'totalRewards',
      key: 'totalRewards',
      sorter: (a: SiteStats, b: SiteStats) => a.totalRewards - b.totalRewards,
      render: (value: number) => (
        <Statistic value={value} suffix="DSH" valueStyle={{ fontSize: '14px', color: '#1890ff' }} />
      )
    },
    {
      title: 'Last Contribution',
      dataIndex: 'lastContribution',
      key: 'lastContribution',
      render: (date: string) => new Date(date).toLocaleString()
    }
  ];

  // Training runs table columns
  const trainingColumns = [
    {
      title: 'Model',
      dataIndex: 'modelName',
      key: 'modelName',
      render: (text: string, record: TrainingRun) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <Tag color="blue">{record.modelType}</Tag>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: TrainingRun) => (
        <div>
          <Badge
            status={
              status === 'training' ? 'processing' :
              status === 'completed' ? 'success' :
              status === 'failed' ? 'error' : 'default'
            }
            text={status.toUpperCase()}
          />
          {status === 'training' && (
            <Progress percent={record.progress} size="small" style={{ marginTop: '4px' }} />
          )}
          {record.currentEpoch && record.totalEpochs && (
            <div style={{ fontSize: '12px', color: '#888' }}>
              Epoch {record.currentEpoch}/{record.totalEpochs}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: TrainingRun) => (
        <div>
          <div>NDCG@10: <strong>{record.ndcg.toFixed(4)}</strong></div>
          <div>MAP: <strong>{record.map.toFixed(4)}</strong></div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            P@10: {record.precision.toFixed(3)} | R@10: {record.recall.toFixed(3)}
          </div>
        </div>
      )
    },
    {
      title: 'Dataset',
      dataIndex: 'datasetSize',
      key: 'datasetSize',
      render: (size: number) => `${size.toLocaleString()} samples`
    },
    {
      title: 'Started',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string, record: TrainingRun) => (
        <div>
          <div>{new Date(time).toLocaleString()}</div>
          {record.estimatedCompletion && (
            <div style={{ fontSize: '12px', color: '#888' }}>
              ETA: {new Date(record.estimatedCompletion).toLocaleTimeString()}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TrainingRun) => (
        <Space>
          {record.status === 'training' && (
            <>
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={() => handleTrainingControl(record.id, 'pause')}
              >
                Pause
              </Button>
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => handleTrainingControl(record.id, 'stop')}
              >
                Stop
              </Button>
            </>
          )}
          {record.status === 'completed' && (
            <Button
              size="small"
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={() => handleDeployModel(record.id)}
            >
              Deploy
            </Button>
          )}
          <Button
            size="small"
            icon={<LineChartOutlined />}
            onClick={() => fetchLiveMetrics(record.id)}
          >
            Metrics
          </Button>
        </Space>
      )
    }
  ];

  // Feature threshold table columns
  const thresholdColumns = [
    {
      title: 'Feature',
      dataIndex: 'featureName',
      key: 'featureName',
      render: (text: string, record: FeatureScoreThreshold) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <Tag color="blue">{record.category}</Tag>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
            {record.description}
          </div>
        </div>
      )
    },
    {
      title: 'Good Range',
      key: 'goodRange',
      render: (_: any, record: FeatureScoreThreshold) => (
        <Tag color="green">
          {record.minGood} - {record.maxGood}
        </Tag>
      )
    },
    {
      title: 'Excellent Range',
      key: 'excellentRange',
      render: (_: any, record: FeatureScoreThreshold) => (
        <Tag color="gold">
          {record.minExcellent} - {record.maxExcellent}
        </Tag>
      )
    },
    {
      title: 'Current Avg',
      dataIndex: 'currentAvg',
      key: 'currentAvg',
      render: (value: number, record: FeatureScoreThreshold) => {
        const isGood = value >= record.minGood && value <= record.maxGood;
        const isExcellent = value >= record.minExcellent && value <= record.maxExcellent;
        return (
          <Tag color={isExcellent ? 'gold' : isGood ? 'green' : 'red'}>
            {value.toFixed(2)}
          </Tag>
        );
      }
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (value: number) => (
        <Progress
          percent={value * 100}
          size="small"
          format={(percent) => `${(percent! / 100).toFixed(2)}x`}
        />
      )
    }
  ];

  return (
    <div className="seo-training-admin-dashboard">
      <div className="dashboard-header">
        <h1>
          <RocketOutlined /> SEO Training Admin Dashboard
        </h1>
        <Space>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            type={autoRefresh ? 'primary' : 'default'}
            icon={<ClockCircleOutlined />}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => setTrainingModalVisible(true)}
          >
            Start New Training
          </Button>
        </Space>
      </div>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Sites"
              value={overviewStats.totalSites}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Contributions"
              value={overviewStats.totalContributions}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Quality Score"
              value={overviewStats.avgQualityScore}
              suffix="/ 100"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <Progress
              percent={overviewStats.avgQualityScore}
              size="small"
              showInfo={false}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Best Model NDCG@10"
              value={overviewStats.bestModelNDCG}
              prefix={<TrophyOutlined />}
              precision={4}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Training Runs"
              value={overviewStats.activeTrainingRuns}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Models"
              value={overviewStats.totalModels}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Dataset Readiness"
              value={overviewStats.datasetReadiness}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={overviewStats.datasetReadiness}
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Rewards Paid"
              value={overviewStats.totalRewards}
              suffix="DSH"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs defaultActiveKey="sites">
          {/* Site-Level Statistics */}
          <TabPane tab="Site Statistics" key="sites">
            <Table
              columns={siteColumns}
              dataSource={siteStats}
              rowKey="siteId"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          {/* Training Runs */}
          <TabPane tab="Training Runs" key="training">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Real-Time Training Monitor"
                description="Monitor active training runs in real-time. All metrics update every 5 seconds."
                type="info"
                showIcon
              />

              <Table
                columns={trainingColumns}
                dataSource={trainingRuns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                expandable={{
                  expandedRowRender: (record) => (
                    <Card title="Live Training Metrics" size="small">
                      {liveMetrics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={liveMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="loss" stroke="#8884d8" name="Loss" />
                            <Line type="monotone" dataKey="ndcg" stroke="#82ca9d" name="NDCG@10" />
                            <Line type="monotone" dataKey="map" stroke="#ffc658" name="MAP" />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <Button
                            type="primary"
                            icon={<LineChartOutlined />}
                            onClick={() => fetchLiveMetrics(record.id)}
                          >
                            Load Live Metrics
                          </Button>
                        </div>
                      )}
                    </Card>
                  )
                }}
              />
            </Space>
          </TabPane>

          {/* Feature Score Thresholds */}
          <TabPane tab="Feature Scoring" key="features">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Feature Quality Thresholds"
                description="Define what constitutes 'good' vs 'bad' data for each SEO feature. These thresholds determine data quality scoring and model training eligibility."
                type="warning"
                showIcon
              />

              <Table
                columns={thresholdColumns}
                dataSource={featureThresholds}
                rowKey="featureName"
                loading={loading}
                pagination={{ pageSize: 20 }}
              />
            </Space>
          </TabPane>

          {/* Quality Distribution */}
          <TabPane tab="Data Quality" key="quality">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Quality Score Distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={qualityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#1890ff" name="Contributions" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Quality Categories">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Excellent (90-100)', value: 25, color: '#52c41a' },
                          { name: 'Good (70-89)', value: 45, color: '#1890ff' },
                          { name: 'Fair (50-69)', value: 20, color: '#faad14' },
                          { name: 'Poor (<50)', value: 10, color: '#f5222d' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {qualityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Training Configuration Modal */}
      <TrainingConfigModal
        visible={trainingModalVisible}
        onCancel={() => setTrainingModalVisible(false)}
        onSubmit={handleStartTraining}
      />
    </div>
  );
};

// Training Configuration Modal Component
interface TrainingConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (config: any) => void;
}

const TrainingConfigModal: React.FC<TrainingConfigModalProps> = ({ visible, onCancel, onSubmit }) => {
  const [form, setForm] = useState({
    modelName: 'seo-ranking-model',
    modelType: 'xgboost',
    learningRate: 0.05,
    nEstimators: 400,
    maxDepth: 6,
    minDatasetSize: 1000,
    useIncrementalLearning: false,
    deployOnComplete: false
  });

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Modal
      title="Start New Training Run"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <label>Model Type</label>
          <Select
            value={form.modelType}
            onChange={(value) => setForm({ ...form, modelType: value })}
            style={{ width: '100%' }}
          >
            <Option value="xgboost">XGBoost (LambdaMART)</Option>
            <Option value="lightgbm">LightGBM (Fast Training)</Option>
            <Option value="neural_network">Neural Network (Deep Learning)</Option>
            <Option value="bert_finetune">BERT Fine-Tuned (Semantic SEO)</Option>
          </Select>
        </div>

        <div>
          <label>Model Name</label>
          <input
            type="text"
            value={form.modelName}
            onChange={(e) => setForm({ ...form, modelName: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <Divider />

        <div>
          <label>Learning Rate: {form.learningRate}</label>
          <input
            type="range"
            min="0.001"
            max="0.3"
            step="0.001"
            value={form.learningRate}
            onChange={(e) => setForm({ ...form, learningRate: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <label>N Estimators</label>
            <input
              type="number"
              value={form.nEstimators}
              onChange={(e) => setForm({ ...form, nEstimators: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '8px' }}
            />
          </Col>
          <Col span={12}>
            <label>Max Depth</label>
            <input
              type="number"
              value={form.maxDepth}
              onChange={(e) => setForm({ ...form, maxDepth: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '8px' }}
            />
          </Col>
        </Row>

        <div>
          <label>
            <input
              type="checkbox"
              checked={form.useIncrementalLearning}
              onChange={(e) => setForm({ ...form, useIncrementalLearning: e.target.checked })}
            />
            {' '}Use Incremental Learning (update existing model)
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={form.deployOnComplete}
              onChange={(e) => setForm({ ...form, deployOnComplete: e.target.checked })}
            />
            {' '}Auto-deploy when training completes
          </label>
        </div>
      </Space>
    </Modal>
  );
};

export default SEOTrainingAdminDashboard;

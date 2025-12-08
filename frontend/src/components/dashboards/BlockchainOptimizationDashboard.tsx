/**
 * Blockchain Optimization Dashboard
 * Interface for blockchain algorithm benchmarking and DOM optimization
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  Alert,
  Spin,
  Form,
  InputNumber,
  Select,
  message,
  Tag,
  Progress,
  Descriptions,
  List,
} from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  FireOutlined,
  BulbOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { blockchainOptimizationAPI } from '@/services/apiService';

const { TabPane } = Tabs;
const { Option } = Select;

interface BenchmarkResult {
  algorithm: string;
  speed: number;
  throughput: number;
  energy: number;
  accuracy: number;
  timestamp: string;
}

interface OptimizationPattern {
  bundleSize: number;
  totalElements: number;
  depth: number;
  optimizations: string[];
  spaceSaved: number;
  timestamp: string;
}

const BlockchainOptimizationDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [patterns, setPatterns] = useState<OptimizationPattern[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [algorithms, setAlgorithms] = useState<string[]>([]);
  const [bestAlgorithms, setBestAlgorithms] = useState<any>({});
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [form] = Form.useForm();
  const [domForm] = Form.useForm();

  useEffect(() => {
    loadStatus();
    loadAlgorithms();
    loadResults();
    loadPatterns();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await blockchainOptimizationAPI.getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const loadAlgorithms = async () => {
    try {
      const data = await blockchainOptimizationAPI.getAlgorithms();
      setAlgorithms(data.algorithms || []);
    } catch (error) {
      console.error('Failed to load algorithms:', error);
    }
  };

  const loadResults = async () => {
    try {
      const data = await blockchainOptimizationAPI.getResults();
      if (data.results) {
        setBenchmarkResults(Object.entries(data.results).map(([algorithm, result]: [string, any]) => ({
          algorithm,
          ...result,
        })));
      }
      
      // Load best algorithms for each criteria
      const criteria = ['speed', 'throughput', 'energy', 'accuracy'];
      const best: any = {};
      for (const criterion of criteria) {
        try {
          const result = await blockchainOptimizationAPI.getBestAlgorithm(criterion as any);
          best[criterion] = result;
        } catch (error) {
          console.error(`Failed to get best algorithm for ${criterion}:`, error);
        }
      }
      setBestAlgorithms(best);
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  const loadPatterns = async () => {
    try {
      const data = await blockchainOptimizationAPI.getPatterns();
      setPatterns(data.patterns || []);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    }
  };

  const handleRunBenchmark = async (values: any) => {
    setLoading(true);
    try {
      // Generate sample SEO dataset
      const seoDataset = Array.from({ length: values.datasetSize || 100 }, (_, i) => ({
        url: `https://example.com/page${i}`,
        seoScore: Math.random() * 100,
        keywords: ['blockchain', 'optimization', 'seo'],
        timestamp: new Date().toISOString(),
      }));

      const result = await blockchainOptimizationAPI.runBenchmark({
        seoDataset,
        options: {
          testDuration: values.duration || 30000,
          seoDataRate: values.dataRate || 50,
          blockSize: values.blockSize || 50,
        },
      });

      message.success('Benchmark completed successfully');
      loadResults();
    } catch (error) {
      console.error('Benchmark failed:', error);
      message.error('Failed to run benchmark');
    } finally {
      setLoading(false);
    }
  };

  const handleBenchmarkAlgorithm = async (algorithm: string) => {
    setLoading(true);
    try {
      const seoDataset = Array.from({ length: 100 }, (_, i) => ({
        url: `https://example.com/page${i}`,
        seoScore: Math.random() * 100,
        keywords: ['blockchain', 'optimization'],
        timestamp: new Date().toISOString(),
      }));

      await blockchainOptimizationAPI.benchmarkAlgorithm(algorithm, { seoDataset });
      message.success(`${algorithm} benchmark completed`);
      loadResults();
    } catch (error) {
      console.error('Algorithm benchmark failed:', error);
      message.error('Failed to benchmark algorithm');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeDom = async (values: any) => {
    setLoading(true);
    try {
      // Create sample DOM tree
      const domTree = {
        elements: Array.from({ length: values.elements || 1000 }, (_, i) => ({
          id: `element-${i}`,
          tag: ['div', 'span', 'p', 'a'][i % 4],
        })),
        depth: values.depth || 10,
        unusedCSS: values.unusedCSS || 30,
        unusedJS: values.unusedJS || 40,
        deadCode: values.deadCode || 20,
        bundleSize: values.bundleSize || 5000,
        renderBlockingResources: values.renderBlocking || 15,
        issues: [],
      };

      const result = await blockchainOptimizationAPI.optimizeDom({ domTree });
      
      message.success(`Optimization completed. Space saved: ${result.spaceSaved || 0}%`);
      loadPatterns();
    } catch (error) {
      console.error('DOM optimization failed:', error);
      message.error('Failed to optimize DOM');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const result = await blockchainOptimizationAPI.simulate({
        simulationParams: {
          duration: 60000,
          seoDataRate: 50,
          patternComplexity: 'high',
        },
      });
      
      setSimulationResults(result);
      message.success('Simulation completed successfully');
    } catch (error) {
      console.error('Simulation failed:', error);
      message.error('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const benchmarkColumns = [
    {
      title: 'Algorithm',
      dataIndex: 'algorithm',
      key: 'algorithm',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Speed (ms)',
      dataIndex: 'speed',
      key: 'speed',
      render: (value: number) => value?.toFixed(2) || 'N/A',
      sorter: (a: any, b: any) => a.speed - b.speed,
    },
    {
      title: 'Throughput',
      dataIndex: 'throughput',
      key: 'throughput',
      render: (value: number) => value?.toFixed(2) || 'N/A',
      sorter: (a: any, b: any) => a.throughput - b.throughput,
    },
    {
      title: 'Energy',
      dataIndex: 'energy',
      key: 'energy',
      render: (value: number) => value?.toFixed(2) || 'N/A',
      sorter: (a: any, b: any) => a.energy - b.energy,
    },
    {
      title: 'Accuracy (%)',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (value: number) => {
        const percent = value || 0;
        return (
          <Progress
            percent={percent}
            size="small"
            status={percent > 80 ? 'success' : percent > 50 ? 'normal' : 'exception'}
          />
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BenchmarkResult) => (
        <Button
          size="small"
          onClick={() => handleBenchmarkAlgorithm(record.algorithm)}
          loading={loading}
        >
          Re-run
        </Button>
      ),
    },
  ];

  const patternColumns = [
    {
      title: 'Bundle Size (KB)',
      dataIndex: 'bundleSize',
      key: 'bundleSize',
    },
    {
      title: 'Elements',
      dataIndex: 'totalElements',
      key: 'totalElements',
    },
    {
      title: 'Depth',
      dataIndex: 'depth',
      key: 'depth',
    },
    {
      title: 'Space Saved (%)',
      dataIndex: 'spaceSaved',
      key: 'spaceSaved',
      render: (value: number) => (
        <Tag color={value > 30 ? 'green' : value > 15 ? 'orange' : 'red'}>
          {value?.toFixed(1) || 0}%
        </Tag>
      ),
    },
    {
      title: 'Optimizations',
      dataIndex: 'optimizations',
      key: 'optimizations',
      render: (optimizations: string[]) => (
        <Space size="small">
          {optimizations?.slice(0, 3).map((opt, idx) => (
            <Tag key={idx} color="blue">
              {opt}
            </Tag>
          ))}
          {optimizations?.length > 3 && <Tag>+{optimizations.length - 3} more</Tag>}
        </Space>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<><ThunderboltOutlined /> Blockchain Optimization Dashboard</>}>
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Overview" key="overview">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Benchmarks Run"
                    value={benchmarkResults.length}
                    prefix={<ExperimentOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Algorithms"
                    value={algorithms.length}
                    prefix={<RocketOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Learned Patterns"
                    value={patterns.length}
                    prefix={<BulbOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Avg Space Saved"
                    value={
                      patterns.length > 0
                        ? (patterns.reduce((sum, p) => sum + (p.spaceSaved || 0), 0) / patterns.length).toFixed(1)
                        : 0
                    }
                    suffix="%"
                    prefix={<FireOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {status && (
              <Card title="System Status" style={{ marginTop: 16 }}>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Service Status">
                    <Tag color={status.running ? 'green' : 'red'}>
                      {status.running ? 'Running' : 'Stopped'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Benchmark Service">
                    <Tag color={status.benchmarkService ? 'green' : 'orange'}>
                      {status.benchmarkService ? 'Initialized' : 'Not Initialized'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Optimization Engine">
                    <Tag color={status.optimizationEngine ? 'green' : 'orange'}>
                      {status.optimizationEngine ? 'Initialized' : 'Not Initialized'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Benchmark">
                    {status.lastBenchmark ? new Date(status.lastBenchmark).toLocaleString() : 'Never'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {Object.keys(bestAlgorithms).length > 0 && (
              <Card title="Best Algorithms by Criteria" style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  {Object.entries(bestAlgorithms).map(([criteria, data]: [string, any]) => (
                    <Col span={6} key={criteria}>
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: 8 }}>
                            Best for {criteria}
                          </div>
                          <Tag color="green" style={{ fontSize: '14px' }}>
                            {data?.bestAlgorithm || 'N/A'}
                          </Tag>
                          {data?.result && (
                            <div style={{ marginTop: 8, fontSize: '12px' }}>
                              {data.result[criteria]?.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          </TabPane>

          <TabPane tab="Benchmarking" key="benchmarking">
            <Card
              title="Run Complete Benchmark"
              extra={
                <Button
                  type="primary"
                  icon={<ExperimentOutlined />}
                  onClick={() => form.submit()}
                  loading={loading}
                >
                  Run Benchmark
                </Button>
              }
              style={{ marginBottom: 16 }}
            >
              <Form form={form} onFinish={handleRunBenchmark} layout="inline">
                <Form.Item name="datasetSize" label="Dataset Size" initialValue={100}>
                  <InputNumber min={10} max={10000} />
                </Form.Item>
                <Form.Item name="duration" label="Duration (ms)" initialValue={30000}>
                  <InputNumber min={1000} max={300000} step={1000} />
                </Form.Item>
                <Form.Item name="dataRate" label="Data Rate" initialValue={50}>
                  <InputNumber min={1} max={1000} />
                </Form.Item>
                <Form.Item name="blockSize" label="Block Size" initialValue={50}>
                  <InputNumber min={1} max={1000} />
                </Form.Item>
              </Form>
            </Card>

            {benchmarkResults.length > 0 ? (
              <Card title="Benchmark Results">
                <Table
                  columns={benchmarkColumns}
                  dataSource={benchmarkResults}
                  rowKey="algorithm"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ) : (
              <Alert
                message="No Benchmark Results"
                description="Run a benchmark to see results here."
                type="info"
                showIcon
              />
            )}

            {algorithms.length > 0 && (
              <Card title="Available Algorithms" style={{ marginTop: 16 }}>
                <Space wrap>
                  {algorithms.map((algorithm) => (
                    <Button
                      key={algorithm}
                      onClick={() => handleBenchmarkAlgorithm(algorithm)}
                      loading={loading}
                    >
                      Benchmark {algorithm}
                    </Button>
                  ))}
                </Space>
              </Card>
            )}
          </TabPane>

          <TabPane tab="DOM Optimization" key="dom-optimization">
            <Card
              title="Optimize DOM Tree"
              extra={
                <Button
                  type="primary"
                  icon={<BulbOutlined />}
                  onClick={() => domForm.submit()}
                  loading={loading}
                >
                  Optimize
                </Button>
              }
              style={{ marginBottom: 16 }}
            >
              <Form form={domForm} onFinish={handleOptimizeDom} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="elements" label="Total Elements" initialValue={1000}>
                      <InputNumber min={10} max={100000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="depth" label="DOM Depth" initialValue={10}>
                      <InputNumber min={1} max={50} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="bundleSize" label="Bundle Size (KB)" initialValue={5000}>
                      <InputNumber min={100} max={100000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="unusedCSS" label="Unused CSS (%)" initialValue={30}>
                      <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="unusedJS" label="Unused JS (%)" initialValue={40}>
                      <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="deadCode" label="Dead Code (%)" initialValue={20}>
                      <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="renderBlocking" label="Render Blocking Resources" initialValue={15}>
                      <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            {patterns.length > 0 ? (
              <Card title="Learned Optimization Patterns">
                <Table
                  columns={patternColumns}
                  dataSource={patterns}
                  rowKey={(record) => `${record.bundleSize}-${record.timestamp}`}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ) : (
              <Alert
                message="No Patterns Learned"
                description="Optimize a DOM tree to start learning patterns."
                type="info"
                showIcon
              />
            )}
          </TabPane>

          <TabPane tab="Simulation" key="simulation">
            <Card
              title="Real-time Pattern Simulation"
              extra={
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  onClick={handleRunSimulation}
                  loading={loading}
                >
                  Run Simulation
                </Button>
              }
            >
              {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Running simulation...</p>
                </div>
              )}

              {!loading && simulationResults && (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Duration">
                    {simulationResults.duration}ms
                  </Descriptions.Item>
                  <Descriptions.Item label="Patterns Processed">
                    {simulationResults.patternsProcessed || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Data Points">
                    {simulationResults.dataPoints || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Processing Time">
                    {simulationResults.avgProcessingTime?.toFixed(2) || 0}ms
                  </Descriptions.Item>
                  <Descriptions.Item label="Success Rate" span={2}>
                    <Progress
                      percent={simulationResults.successRate || 0}
                      status={simulationResults.successRate > 80 ? 'success' : 'normal'}
                    />
                  </Descriptions.Item>
                </Descriptions>
              )}

              {!loading && !simulationResults && (
                <Alert
                  message="No Simulation Results"
                  description="Click 'Run Simulation' to start a real-time pattern simulation."
                  type="info"
                  showIcon
                />
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default BlockchainOptimizationDashboard;

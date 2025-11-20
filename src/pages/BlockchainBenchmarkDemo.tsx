/**
 * Blockchain Algorithm Benchmarking Demo
 * 
 * Visual comparison of blockchain algorithms for SEO data mining:
 * - Proof of Work (PoW)
 * - Proof of Stake (PoS)  
 * - Proof of Optimization (PoO)
 * - Delegated Proof of Stake (DPoS)
 * 
 * Real-time performance metrics and recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Progress, Tag, Statistic, Table, Space, Alert } from 'antd';
import {
  ThunderboltOutlined,
  RocketOutlined,
  TrophyOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  FireOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface AlgorithmMetrics {
  algorithm: string;
  name: string;
  throughput: number;
  avgBlockTime: number;
  patternAccuracy: number;
  energyEfficiency: number;
  realTimeScore: number;
  blocksProcessed: number;
  color: string;
}

const algorithmData: AlgorithmMetrics[] = [
  {
    algorithm: 'pow',
    name: 'Proof of Work',
    throughput: 0,
    avgBlockTime: 0,
    patternAccuracy: 0,
    energyEfficiency: 0,
    realTimeScore: 0,
    blocksProcessed: 0,
    color: '#f59e0b'
  },
  {
    algorithm: 'pos',
    name: 'Proof of Stake',
    throughput: 0,
    avgBlockTime: 0,
    patternAccuracy: 0,
    energyEfficiency: 0,
    realTimeScore: 0,
    blocksProcessed: 0,
    color: '#10b981'
  },
  {
    algorithm: 'poo',
    name: 'Proof of Optimization',
    throughput: 0,
    avgBlockTime: 0,
    patternAccuracy: 0,
    energyEfficiency: 0,
    realTimeScore: 0,
    blocksProcessed: 0,
    color: '#8b5cf6'
  },
  {
    algorithm: 'dpos',
    name: 'Delegated PoS',
    throughput: 0,
    avgBlockTime: 0,
    patternAccuracy: 0,
    energyEfficiency: 0,
    realTimeScore: 0,
    blocksProcessed: 0,
    color: '#3b82f6'
  }
];

const BlockchainBenchmarkDemo: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [algorithms, setAlgorithms] = useState<AlgorithmMetrics[]>(algorithmData);
  const [recommendation, setRecommendation] = useState<{
    algorithm: string;
    score: number;
    reason: string;
  } | null>(null);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 5, 100);
        
        // Simulate algorithm metrics
        setAlgorithms(prevAlgos => prevAlgos.map(algo => ({
          ...algo,
          throughput: Math.min(algo.throughput + Math.random() * 10, 
            algo.algorithm === 'dpos' ? 250 : 
            algo.algorithm === 'poo' ? 200 :
            algo.algorithm === 'pos' ? 180 : 150),
          avgBlockTime: Math.max(10, algo.avgBlockTime || 100 - Math.random() * (newProgress / 2)),
          patternAccuracy: Math.min(0.98, (algo.patternAccuracy || 0.5) + Math.random() * 0.01),
          energyEfficiency: Math.min(100, (algo.energyEfficiency || 0) + Math.random() * 2),
          realTimeScore: Math.min(100, (algo.realTimeScore || 0) + Math.random() * 2),
          blocksProcessed: Math.floor((algo.blocksProcessed || 0) + Math.random() * 5)
        })));

        if (newProgress >= 100) {
          setRunning(false);
          
          // Calculate recommendation
          const scored = algorithms.map(algo => ({
            ...algo,
            totalScore: (algo.throughput / 2.5) + 
                       ((100 - algo.avgBlockTime) / 2) + 
                       (algo.patternAccuracy * 100) + 
                       (algo.energyEfficiency / 2) + 
                       (algo.realTimeScore / 2)
          }));
          
          const best = scored.reduce((prev, current) => 
            current.totalScore > prev.totalScore ? current : prev
          );
          
          setRecommendation({
            algorithm: best.name,
            score: best.totalScore,
            reason: `Best overall performance with ${best.throughput.toFixed(0)} TPS throughput and ${(best.patternAccuracy * 100).toFixed(1)}% pattern accuracy`
          });
        }

        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [running, algorithms]);

  const startBenchmark = () => {
    setRunning(true);
    setProgress(0);
    setAlgorithms(algorithmData);
    setRecommendation(null);
  };

  const tableColumns = [
    {
      title: 'Algorithm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AlgorithmMetrics) => (
        <Space>
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: record.color }}
          />
          <Text strong className="text-white">{text}</Text>
        </Space>
      )
    },
    {
      title: 'Throughput (TPS)',
      dataIndex: 'throughput',
      key: 'throughput',
      render: (val: number) => (
        <Text className="text-slate-300">{val.toFixed(2)}</Text>
      )
    },
    {
      title: 'Avg Block Time (ms)',
      dataIndex: 'avgBlockTime',
      key: 'avgBlockTime',
      render: (val: number) => (
        <Text className="text-slate-300">{val.toFixed(2)}</Text>
      )
    },
    {
      title: 'Pattern Accuracy',
      dataIndex: 'patternAccuracy',
      key: 'patternAccuracy',
      render: (val: number) => (
        <Progress 
          percent={Math.round(val * 100)} 
          size="small"
          strokeColor="#10b981"
        />
      )
    },
    {
      title: 'Energy Efficiency',
      dataIndex: 'energyEfficiency',
      key: 'energyEfficiency',
      render: (val: number) => (
        <Progress 
          percent={Math.round(val)} 
          size="small"
          strokeColor="#3b82f6"
        />
      )
    },
    {
      title: 'Blocks',
      dataIndex: 'blocksProcessed',
      key: 'blocksProcessed',
      render: (val: number) => (
        <Tag color="blue">{val}</Tag>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="!text-white mb-4">
            <LineChartOutlined className="mr-3" />
            Blockchain Algorithm Benchmark
          </Title>
          <Paragraph className="text-slate-300 text-lg">
            Compare blockchain consensus algorithms for SEO data mining performance
          </Paragraph>
        </div>

        {/* Progress */}
        {running && (
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <div className="text-center mb-4">
              <Text className="text-white text-lg">Benchmarking in progress...</Text>
            </div>
            <Progress 
              percent={progress} 
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Card>
        )}

        {/* Algorithm Cards */}
        <Row gutter={16} className="mb-6">
          {algorithms.map(algo => (
            <Col key={algo.algorithm} span={6}>
              <Card 
                className="bg-slate-800 border-slate-700"
                style={{ borderTopColor: algo.color, borderTopWidth: 4 }}
              >
                <div className="text-center">
                  <div 
                    className="text-4xl mb-2"
                    style={{ color: algo.color }}
                  >
                    {algo.throughput.toFixed(0)}
                  </div>
                  <Text className="text-slate-400 text-xs">TPS</Text>
                  <div className="mt-4">
                    <Text className="text-white font-semibold">{algo.name}</Text>
                  </div>
                  <div className="mt-2">
                    <Tag color={algo.algorithm === 'poo' ? 'purple' : 'default'}>
                      {algo.algorithm.toUpperCase()}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Detailed Metrics Table */}
        <Card 
          className="bg-slate-800 border-slate-700 mb-6"
          title={
            <span className="text-white flex items-center gap-2">
              <ThunderboltOutlined />
              Performance Metrics
            </span>
          }
        >
          <Table
            columns={tableColumns}
            dataSource={algorithms}
            pagination={false}
            rowKey="algorithm"
            className="dark-table"
          />
        </Card>

        {/* Recommendation */}
        {recommendation && (
          <Card className="bg-gradient-to-r from-green-900 to-green-800 border-green-700 mb-6">
            <div className="flex items-start gap-4">
              <TrophyOutlined className="text-5xl text-yellow-400" />
              <div className="flex-1">
                <Title level={3} className="!text-white mb-2">
                  <CheckCircleOutlined className="mr-2" />
                  Recommended Algorithm: {recommendation.algorithm}
                </Title>
                <Paragraph className="text-slate-200 text-lg mb-2">
                  Score: {recommendation.score.toFixed(2)} / 500
                </Paragraph>
                <Paragraph className="text-slate-300">
                  {recommendation.reason}
                </Paragraph>
              </div>
            </div>
          </Card>
        )}

        {/* Best Algorithm By Criteria */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <FireOutlined className="text-3xl text-orange-400 mb-2" />
              <div className="text-white font-semibold mb-1">Speed</div>
              <Text className="text-slate-400">DPoS</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <RocketOutlined className="text-3xl text-blue-400 mb-2" />
              <div className="text-white font-semibold mb-1">Throughput</div>
              <Text className="text-slate-400">DPoS</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <ThunderboltOutlined className="text-3xl text-green-400 mb-2" />
              <div className="text-white font-semibold mb-1">Energy</div>
              <Text className="text-slate-400">PoS</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <CheckCircleOutlined className="text-3xl text-purple-400 mb-2" />
              <div className="text-white font-semibold mb-1">Accuracy</div>
              <Text className="text-slate-400">PoO</Text>
            </Card>
          </Col>
        </Row>

        {/* Control Button */}
        <div className="text-center">
          <Button
            type="primary"
            size="large"
            icon={running ? <SyncOutlined spin /> : <RocketOutlined />}
            onClick={startBenchmark}
            disabled={running}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {running ? 'Benchmarking...' : 'Start Benchmark'}
          </Button>
        </div>

        {/* Info */}
        <Alert
          message="Blockchain Consensus Algorithms"
          description={
            <div>
              <Paragraph className="mb-2">
                This benchmark compares four consensus algorithms optimized for SEO data mining:
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>PoW:</strong> Traditional mining with computational puzzles</li>
                <li><strong>PoS:</strong> Stake-based validation for energy efficiency</li>
                <li><strong>PoO:</strong> Optimization-based consensus for SEO patterns</li>
                <li><strong>DPoS:</strong> Delegated validation for maximum throughput</li>
              </ul>
            </div>
          }
          type="info"
          className="bg-blue-900 border-blue-700 mt-6"
        />
      </div>
    </div>
  );
};

export default BlockchainBenchmarkDemo;

/**
 * Specialized Neural Network Components
 * Advanced ML/AI components with professional UX for neural network management
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Progress,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Tooltip,
  Badge,
  Avatar,
  Statistic,
  Alert,
  Timeline,
  List,
  Switch,
  Slider,
  Select,
  Input,
  Form,
  Modal,
  Drawer,
} from 'antd';
import {
  RobotOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  ExperimentOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  FunctionOutlined,
  CalculatorOutlined,
  RadarChartOutlined,
  HeatMapOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  StockOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';

import {
  EnhancedCard,
  EnhancedProgress,
  EnhancedStatistic,
  EnhancedAvatar,
  EnhancedTag,
  EnhancedButton,
  EnhancedInput,
} from '../DesignSystemComponents';
import {
  getColor,
  getGradient,
  getTextStyle,
  getSpacing,
  getShadow,
  getBorderRadius,
  getAnimation,
  getTransition,
  getHoverEffect,
  getHoverStyles,
  composeStyle,
  createComponentStyle,
  getFlexStyle,
  getGridStyle,
  getPerformanceStyles,
  willChange,
} from '../../utils/StyleUtils';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

// ===== NEURAL NETWORK VISUALIZATION COMPONENT =====
interface NeuralNetworkVisualizationProps {
  layers: number[];
  activations: string[];
  connections?: boolean;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  onNodeClick?: (layerIndex: number, nodeIndex: number) => void;
}

export const NeuralNetworkVisualization: React.FC<NeuralNetworkVisualizationProps> = ({
  layers = [4, 8, 6, 4],
  activations = ['relu', 'relu', 'relu', 'softmax'],
  connections = true,
  animated = true,
  size = 'medium',
  onNodeClick,
}) => {
  const [hoveredNode, setHoveredNode] = useState<{ layer: number; node: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ layer: number; node: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const sizeConfig = {
    small: { width: 300, height: 200, nodeRadius: 8, spacing: 60 },
    medium: { width: 500, height: 300, nodeRadius: 12, spacing: 100 },
    large: { width: 700, height: 400, nodeRadius: 16, spacing: 140 },
  };

  const config = sizeConfig[size];

  const getNodePosition = (layerIndex: number, nodeIndex: number) => {
    const layerX = (layerIndex + 1) * config.spacing;
    const layerHeight = layers[layerIndex] * 30;
    const nodeY = (config.height - layerHeight) / 2 + nodeIndex * 30 + 15;
    return { x: layerX, y: nodeY };
  };

  const handleNodeClick = (layerIndex: number, nodeIndex: number) => {
    setSelectedNode({ layer: layerIndex, node: nodeIndex });
    onNodeClick?.(layerIndex, nodeIndex);
  };

  return (
    <EnhancedCard variant="elevated" title="Neural Network Architecture">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: getSpacing(4),
        backgroundColor: '#fafafa',
        borderRadius: getBorderRadius('lg'),
      }}>
        <svg
          ref={svgRef}
          width={config.width}
          height={config.height}
          style={{ border: '1px solid #e8e8e8', borderRadius: getBorderRadius('base') }}
        >
          {/* Connections */}
          {connections && layers.slice(0, -1).map((layer, layerIndex) => {
            return layers[layerIndex + 1].map((_, nodeIndex) => {
              return layer.map((_, prevNodeIndex) => {
                const from = getNodePosition(layerIndex, prevNodeIndex);
                const to = getNodePosition(layerIndex + 1, nodeIndex);
                const isHighlighted = hoveredNode?.layer === layerIndex && hoveredNode?.node === prevNodeIndex;
                
                return (
                  <line
                    key={`connection-${layerIndex}-${prevNodeIndex}-${nodeIndex}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isHighlighted ? '#1890ff' : '#e8e8e8'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    opacity={isHighlighted ? 1 : 0.3}
                  />
                );
              });
            });
          })}

          {/* Nodes */}
          {layers.map((layer, layerIndex) => {
            return layer.map((_, nodeIndex) => {
              const position = getNodePosition(layerIndex, nodeIndex);
              const isHovered = hoveredNode?.layer === layerIndex && hoveredNode?.node === nodeIndex;
              const isSelected = selectedNode?.layer === layerIndex && selectedNode?.node === nodeIndex;
              
              return (
                <g key={`node-${layerIndex}-${nodeIndex}`}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={config.nodeRadius}
                    fill={isSelected ? '#1890ff' : isHovered ? '#40a9ff' : '#52c41a'}
                    stroke="#fff"
                    strokeWidth={2}
                    style={{ 
                      cursor: 'pointer',
                      filter: animated ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={() => setHoveredNode({ layer: layerIndex, node: nodeIndex })}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(layerIndex, nodeIndex)}
                  />
                  {animated && (
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={config.nodeRadius + 4}
                      fill="none"
                      stroke="#52c41a"
                      strokeWidth={2}
                      opacity={0.3}
                      style={{
                        animation: 'pulse 2s infinite',
                        transformOrigin: `${position.x}px ${position.y}px`,
                      }}
                    />
                  )}
                </g>
              );
            });
          })}

          {/* Layer Labels */}
          {layers.map((_, layerIndex) => {
            const layerX = (layerIndex + 1) * config.spacing;
            return (
              <text
                key={`label-${layerIndex}`}
                x={layerX}
                y={config.height - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {activations[layerIndex] || `Layer ${layerIndex + 1}`}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Node Info */}
      {selectedNode && (
        <div style={{
          marginTop: getSpacing(3),
          padding: getSpacing(3),
          backgroundColor: '#f0f9ff',
          borderRadius: getBorderRadius('lg'),
          border: '1px solid #bae7ff',
        }}>
          <Text strong>Selected Node:</Text> Layer {selectedNode.layer + 1}, Node {selectedNode.node + 1}
          <br />
          <Text type="secondary">Activation: {activations[selectedNode.layer]}</Text>
          <br />
          <Text type="secondary">Output: {(Math.random() * 1).toFixed(4)}</Text>
        </div>
      )}
    </EnhancedCard>
  );
};

// ===== TRAINING PROGRESS COMPONENT =====
interface TrainingProgressProps {
  progress: number;
  currentStep: string;
  totalSteps: number;
  metrics: {
    loss: number;
    accuracy: number;
    valLoss: number;
    valAccuracy: number;
  };
  logs: string[];
  showLogs?: boolean;
  animated?: boolean;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({
  progress,
  currentStep,
  totalSteps,
  metrics,
  logs,
  showLogs = true,
  animated = true,
}) => {
  const [expandedLogs, setExpandedLogs] = useState(false);

  return (
    <EnhancedCard variant="elevated" title="Training Progress">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Progress Bar */}
        <div>
          <div style={getFlexStyle('row', 'space-between', 'center')}>
            <Text strong>{currentStep}</Text>
            <Text>{progress.toFixed(1)}%</Text>
          </div>
          <EnhancedProgress 
            percent={progress} 
            status="active"
            gradient={true}
          />
        </div>

        {/* Metrics */}
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Loss</Text>
              <br />
              <Text strong style={{ color: '#ff4d4f' }}>{metrics.loss.toFixed(4)}</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Accuracy</Text>
              <br />
              <Text strong style={{ color: '#52c41a' }}>{(metrics.accuracy * 100).toFixed(2)}%</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Val Loss</Text>
              <br />
              <Text strong style={{ color: '#fa8c16' }}>{metrics.valLoss.toFixed(4)}</Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Val Accuracy</Text>
              <br />
              <Text strong style={{ color: '#1890ff' }}>{(metrics.valAccuracy * 100).toFixed(2)}%</Text>
            </div>
          </Col>
        </Row>

        {/* Training Logs */}
        {showLogs && (
          <div>
            <div style={getFlexStyle('row', 'space-between', 'center')}>
              <Text strong>Training Logs</Text>
              <Button
                type="text"
                size="small"
                onClick={() => setExpandedLogs(!expandedLogs)}
              >
                {expandedLogs ? 'Collapse' : 'Expand'}
              </Button>
            </div>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: getSpacing(3),
              borderRadius: getBorderRadius('lg'),
              marginTop: getSpacing(2),
              height: expandedLogs ? '200px' : '100px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px',
              border: '1px solid #e8e8e8',
            }}>
              {logs.slice(0, expandedLogs ? 50 : 20).map((log, index) => (
                <div key={index} style={{ 
                  marginBottom: '2px',
                  color: log.includes('✅') ? '#52c41a' : log.includes('⚠️') ? '#fa8c16' : '#666',
                }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </Space>
    </EnhancedCard>
  );
};

// ===== MODEL PERFORMANCE CHART =====
interface ModelPerformanceProps {
  data: {
    epoch: number;
    accuracy: number;
    loss: number;
    valAccuracy: number;
    valLoss: number;
  }[];
  metrics: ('accuracy' | 'loss' | 'valAccuracy' | 'valLoss')[];
  animated?: boolean;
  showLegend?: boolean;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({
  data,
  metrics = ['accuracy', 'valAccuracy'],
  animated = true,
  showLegend = true,
}) => {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);

  const metricColors = {
    accuracy: '#52c41a',
    loss: '#ff4d4f',
    valAccuracy: '#1890ff',
    valLoss: '#fa8c16',
  };

  const metricLabels = {
    accuracy: 'Training Accuracy',
    loss: 'Training Loss',
    valAccuracy: 'Validation Accuracy',
    valLoss: 'Validation Loss',
  };

  return (
    <EnhancedCard variant="elevated" title="Model Performance">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Metric Selector */}
        {showLegend && (
          <div style={getFlexStyle('row', 'center', 'center')}>
            <Space>
              {metrics.map(metric => (
                <Button
                  key={metric}
                  type={selectedMetric === metric ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setSelectedMetric(metric)}
                >
                  {metricLabels[metric]}
                </Button>
              ))}
            </Space>
          </div>
        )}

        {/* Chart Placeholder */}
        <div style={{
          height: '300px',
          backgroundColor: '#fafafa',
          borderRadius: getBorderRadius('lg'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e8e8e8',
        }}>
          <Space direction="vertical" alignItems="center">
            <LineChartOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />
            <Text type="secondary">Performance chart for {metricLabels[selectedMetric]}</Text>
            <Text type="secondary">Chart integration coming soon</Text>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Current</Text>
              <br />
              <Text strong style={{ color: metricColors[selectedMetric] }}>
                {selectedMetric.includes('accuracy') 
                  ? `${(data[data.length - 1]?.[selectedMetric] * 100 || 0).toFixed(2)}%`
                  : data[data.length - 1]?.[selectedMetric]?.toFixed(4) || '0'
                }
              </Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Best</Text>
              <br />
              <Text strong style={{ color: metricColors[selectedMetric] }}>
                {selectedMetric.includes('accuracy') 
                  ? `${(Math.max(...data.map(d => d[selectedMetric])) * 100).toFixed(2)}%`
                  : Math.min(...data.map(d => d[selectedMetric])).toFixed(4)
                }
              </Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Epochs</Text>
              <br />
              <Text strong>{data.length}</Text>
            </div>
          </Col>
        </Row>
      </Space>
    </EnhancedCard>
  );
};

// ===== HYPERPARAMETER TUNER =====
interface HyperparameterTunerProps {
  parameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    dropout: number;
    optimizer: string;
    activation: string;
  };
  onChange: (params: any) => void;
  onOptimize?: () => void;
  optimizing?: boolean;
}

export const HyperparameterTuner: React.FC<HyperparameterTunerProps> = ({
  parameters,
  onChange,
  onOptimize,
  optimizing = false,
}) => {
  const [advancedMode, setAdvancedMode] = useState(false);

  return (
    <EnhancedCard variant="elevated" title="Hyperparameter Tuning">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Basic Parameters */}
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <Text strong>Learning Rate</Text>
              <Slider
                value={parameters.learningRate}
                onChange={(value) => onChange({ ...parameters, learningRate: value })}
                min={0.0001}
                max={0.1}
                step={0.0001}
                marks={{
                  0.0001: '0.0001',
                  0.001: '0.001',
                  0.01: '0.01',
                  0.1: '0.1',
                }}
              />
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong>Batch Size</Text>
              <Select
                value={parameters.batchSize}
                onChange={(value) => onChange({ ...parameters, batchSize: value })}
                style={{ width: '100%' }}
              >
                <Option value={16}>16</Option>
                <Option value={32}>32</Option>
                <Option value={64}>64</Option>
                <Option value={128}>128</Option>
                <Option value={256}>256</Option>
              </Select>
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <div>
              <Text strong>Epochs</Text>
              <Slider
                value={parameters.epochs}
                onChange={(value) => onChange({ ...parameters, epochs: value })}
                min={10}
                max={500}
                marks={{
                  10: '10',
                  100: '100',
                  200: '200',
                  500: '500',
                }}
              />
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong>Dropout Rate</Text>
              <Slider
                value={parameters.dropout}
                onChange={(value) => onChange({ ...parameters, dropout: value })}
                min={0}
                max={0.5}
                step={0.1}
                marks={{
                  0: '0',
                  0.1: '0.1',
                  0.2: '0.2',
                  0.3: '0.3',
                  0.5: '0.5',
                }}
              />
            </div>
          </Col>
        </Row>

        {/* Advanced Parameters */}
        {advancedMode && (
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Text strong>Optimizer</Text>
                <Select
                  value={parameters.optimizer}
                  onChange={(value) => onChange({ ...parameters, optimizer: value })}
                  style={{ width: '100%' }}
                >
                  <Option value="adam">Adam</Option>
                  <Option value="sgd">SGD</Option>
                  <Option value="rmsprop">RMSprop</Option>
                  <Option value="adagrad">Adagrad</Option>
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text strong>Activation</Text>
                <Select
                  value={parameters.activation}
                  onChange={(value) => onChange({ ...parameters, activation: value })}
                  style={{ width: '100%' }}
                >
                  <Option value="relu">ReLU</Option>
                  <Option value="sigmoid">Sigmoid</Option>
                  <Option value="tanh">Tanh</Option>
                  <Option value="softmax">Softmax</Option>
                </Select>
              </div>
            </Col>
          </Row>
        )}

        {/* Actions */}
        <div style={getFlexStyle('row', 'space-between', 'center')}>
          <Button
            type="text"
            onClick={() => setAdvancedMode(!advancedMode)}
          >
            {advancedMode ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <Space>
            <Button>Reset to Default</Button>
            <EnhancedButton
              variant="primary"
              icon={<ThunderboltOutlined />}
              onClick={onOptimize}
              loading={optimizing}
            >
              {optimizing ? 'Optimizing...' : 'Auto Optimize'}
            </EnhancedButton>
          </Space>
        </div>
      </Space>
    </EnhancedCard>
  );
};

// ===== MODEL COMPARISON =====
interface ModelComparisonProps {
  models: {
    id: string;
    name: string;
    accuracy: number;
    loss: number;
    parameters: number;
    size: string;
    trainingTime: string;
  }[];
  onSelect?: (modelId: string) => void;
  selectedModel?: string;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  models,
  onSelect,
  selectedModel,
}) => {
  const [sortBy, setSortBy] = useState<'accuracy' | 'loss' | 'parameters' | 'trainingTime'>('accuracy');

  const sortedModels = [...models].sort((a, b) => {
    if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
    if (sortBy === 'loss') return a.loss - b.loss;
    if (sortBy === 'parameters') return a.parameters - b.parameters;
    return 0; // trainingTime would need special handling
  });

  return (
    <EnhancedCard variant="elevated" title="Model Comparison">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Sort Controls */}
        <div style={getFlexStyle('row', 'flex-end', 'center')}>
          <Text strong>Sort by:</Text>
          <Select
            value={sortBy}
            onChange={setSortBy}
            size="small"
            style={{ marginLeft: getSpacing(2) }}
          >
            <Option value="accuracy">Accuracy</Option>
            <Option value="loss">Loss</Option>
            <Option value="parameters">Parameters</Option>
            <Option value="trainingTime">Training Time</Option>
          </Select>
        </div>

        {/* Model Cards */}
        <Row gutter={[16, 16]}>
          {sortedModels.map((model) => (
            <Col span={8} key={model.id}>
              <EnhancedCard
                variant={selectedModel === model.id ? 'elevated' : 'flat'}
                hoverable
                onClick={() => onSelect?.(model.id)}
                style={{
                  border: selectedModel === model.id ? '2px solid #1890ff' : '1px solid #e8e8e8',
                  cursor: 'pointer',
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div style={getFlexStyle('row', 'space-between', 'center')}>
                    <Text strong>{model.name}</Text>
                    {selectedModel === model.id && (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    )}
                  </div>
                  
                  <div style={getFlexStyle('row', 'space-between', 'center')}>
                    <Text type="secondary">Accuracy</Text>
                    <Text strong style={{ color: '#52c41a' }}>
                      {(model.accuracy * 100).toFixed(2)}%
                    </Text>
                  </div>
                  
                  <div style={getFlexStyle('row', 'space-between', 'center')}>
                    <Text type="secondary">Loss</Text>
                    <Text strong style={{ color: '#ff4d4f' }}>
                      {model.loss.toFixed(4)}
                    </Text>
                  </div>
                  
                  <div style={getFlexStyle('row', 'space-between', 'center')}>
                    <Text type="secondary">Parameters</Text>
                    <Text>{model.parameters.toLocaleString()}</Text>
                  </div>
                  
                  <div style={getFlexStyle('row', 'space-between', 'center')}>
                    <Text type="secondary">Size</Text>
                    <Text>{model.size}</Text>
                  </div>
                  
                  <div style={getFlexStyle('row', 'space-between', 'center')}>
                    <Text type="secondary">Training Time</Text>
                    <Text>{model.trainingTime}</Text>
                  </div>
                </Space>
              </EnhancedCard>
            </Col>
          ))}
        </Row>
      </Space>
    </EnhancedCard>
  );
};

export default {
  NeuralNetworkVisualization,
  TrainingProgress,
  ModelPerformance,
  HyperparameterTuner,
  ModelComparison,
};

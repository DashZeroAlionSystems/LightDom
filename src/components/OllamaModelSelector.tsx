/**
 * Ollama Model Selector Component
 * 
 * UI for selecting, downloading, and managing Ollama models
 * with system benchmark-based recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Tag,
  Space,
  Typography,
  Input,
  Progress,
  Badge,
  Tooltip,
  Alert,
  Modal,
  Descriptions,
  Row,
  Col,
  Select,
  message
} from 'antd';
import {
  DownloadOutlined,
  CheckCircleOutlined,
  StarOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Model {
  name: string;
  size: string;
  sizeGB: number;
  description: string;
  parameters: string;
  quantization: string;
  useCase: string[];
  minRAM: number;
  recommended RAM: number;
  performance: {
    speed: number; // 1-10
    quality: number; // 1-10
    efficiency: number; // 1-10
  };
  downloaded: boolean;
  icon?: string;
}

interface SystemSpecs {
  totalRAM: number;
  availableRAM: number;
  cpu: string;
  gpu?: string;
  benchmark: {
    cpuScore: number;
    ramScore: number;
    overallScore: number;
  };
}

interface OllamaModelSelectorProps {
  onModelSelect?: (model: Model) => void;
  systemSpecs?: SystemSpecs;
}

const OllamaModelSelector: React.FC<OllamaModelSelectorProps> = ({ 
  onModelSelect,
  systemSpecs: propSystemSpecs 
}) => {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs | null>(propSystemSpecs || null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Comprehensive model list
  const availableModels: Model[] = [
    {
      name: 'llama2:7b',
      size: '3.8GB',
      sizeGB: 3.8,
      description: 'Meta\'s Llama 2 7B model - balanced performance',
      parameters: '7B',
      quantization: 'Q4_0',
      useCase: ['general', 'chat', 'code'],
      minRAM: 4,
      recommendedRAM: 8,
      performance: { speed: 8, quality: 7, efficiency: 8 },
      downloaded: false,
      icon: '🦙'
    },
    {
      name: 'mistral:7b',
      size: '4.1GB',
      sizeGB: 4.1,
      description: 'Mistral 7B - excellent quality for size',
      parameters: '7B',
      quantization: 'Q4_0',
      useCase: ['general', 'reasoning', 'code'],
      minRAM: 4,
      recommendedRAM: 8,
      performance: { speed: 7, quality: 9, efficiency: 9 },
      downloaded: false,
      icon: '🌪️'
    },
    {
      name: 'phi:2.7b',
      size: '1.6GB',
      sizeGB: 1.6,
      description: 'Microsoft Phi-2 - small but powerful',
      parameters: '2.7B',
      quantization: 'Q4_0',
      useCase: ['general', 'reasoning'],
      minRAM: 2,
      recommendedRAM: 4,
      performance: { speed: 10, quality: 6, efficiency: 10 },
      downloaded: false,
      icon: '⚡'
    },
    {
      name: 'deepseek-coder:6.7b',
      size: '3.8GB',
      sizeGB: 3.8,
      description: 'DeepSeek Coder - specialized for code',
      parameters: '6.7B',
      quantization: 'Q4_0',
      useCase: ['code', 'debugging', 'refactoring'],
      minRAM: 4,
      recommendedRAM: 8,
      performance: { speed: 8, quality: 9, efficiency: 8 },
      downloaded: false,
      icon: '💻'
    },
    {
      name: 'codellama:7b',
      size: '3.8GB',
      sizeGB: 3.8,
      description: 'Meta\'s CodeLlama - code generation',
      parameters: '7B',
      quantization: 'Q4_0',
      useCase: ['code', 'completion'],
      minRAM: 4,
      recommendedRAM: 8,
      performance: { speed: 7, quality: 8, efficiency: 7 },
      downloaded: false,
      icon: '🔧'
    },
    {
      name: 'llama2:13b',
      size: '7.3GB',
      sizeGB: 7.3,
      description: 'Llama 2 13B - higher quality',
      parameters: '13B',
      quantization: 'Q4_0',
      useCase: ['general', 'chat', 'reasoning'],
      minRAM: 8,
      recommendedRAM: 16,
      performance: { speed: 6, quality: 8, efficiency: 6 },
      downloaded: false,
      icon: '🦙'
    },
    {
      name: 'neural-chat:7b',
      size: '4.1GB',
      sizeGB: 4.1,
      description: 'Intel Neural Chat - conversational AI',
      parameters: '7B',
      quantization: 'Q4_0',
      useCase: ['chat', 'customer-service'],
      minRAM: 4,
      recommendedRAM: 8,
      performance: { speed: 8, quality: 7, efficiency: 8 },
      downloaded: false,
      icon: '💬'
    },
    {
      name: 'orca-mini:3b',
      size: '1.9GB',
      sizeGB: 1.9,
      description: 'Orca Mini - very lightweight',
      parameters: '3B',
      quantization: 'Q4_0',
      useCase: ['general', 'testing'],
      minRAM: 2,
      recommendedRAM: 4,
      performance: { speed: 10, quality: 5, efficiency: 10 },
      downloaded: false,
      icon: '🐋'
    },
    {
      name: 'starling-lm:7b',
      size: '4.1GB',
      sizeGB: 4.1,
      description: 'Starling - RLHF trained',
      parameters: '7B',
      quantization: 'Q4_0',
      useCase: ['general', 'chat', 'helpful-assistant'],
      minRAM: 4,
      recommendedRAM: 8,
      performance: { speed: 7, quality: 8, efficiency: 7 },
      downloaded: false,
      icon: '🌟'
    },
    {
      name: 'vicuna:7b',
      size: '3.8GB',
      sizeGB: 3.8,
      description: 'Vicuna - chat optimized',
      parameters: '7B',
      quantization: 'Q4_0',
      useCase: ['chat', 'instruction-following'],
      minRAM: 4,
      recommendedRAM: 8,
      performance: { speed: 8, quality: 7, efficiency: 8 },
      downloaded: false,
      icon: '🦙'
    }
  ];

  useEffect(() => {
    loadModels();
    if (!systemSpecs) {
      detectSystemSpecs();
    }
  }, []);

  useEffect(() => {
    filterModels();
  }, [models, searchTerm, filterSize]);

  const loadModels = async () => {
    setLoading(true);
    try {
      // Load from local Ollama instance
      const response = await axios.get('/api/ollama/models');
      
      // Mark downloaded models
      const downloadedNames = new Set(response.data.models?.map((m: any) => m.name) || []);
      const updatedModels = availableModels.map(m => ({
        ...m,
        downloaded: downloadedNames.has(m.name)
      }));
      
      setModels(updatedModels);
    } catch (error) {
      console.error('Error loading models:', error);
      // Use default list if API fails
      setModels(availableModels);
    } finally {
      setLoading(false);
    }
  };

  const detectSystemSpecs = async () => {
    try {
      const response = await axios.get('/api/system/specs');
      setSystemSpecs(response.data);
    } catch (error) {
      console.error('Error detecting system specs:', error);
      // Default specs (conservative estimate)
      setSystemSpecs({
        totalRAM: 4,
        availableRAM: 3,
        cpu: 'Unknown',
        benchmark: {
          cpuScore: 50,
          ramScore: 40,
          overallScore: 45
        }
      });
    }
  };

  const filterModels = () => {
    let filtered = [...models];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.useCase.some(uc => uc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Size filter
    if (filterSize !== 'all') {
      const maxSize = parseFloat(filterSize);
      filtered = filtered.filter(m => m.sizeGB <= maxSize);
    }

    // Sort by recommendation score
    filtered.sort((a, b) => {
      const scoreA = calculateRecommendationScore(a);
      const scoreB = calculateRecommendationScore(b);
      return scoreB - scoreA;
    });

    setFilteredModels(filtered);
  };

  const calculateRecommendationScore = (model: Model): number => {
    if (!systemSpecs) return 50;

    let score = 0;

    // RAM compatibility (40 points)
    const ramFit = systemSpecs.availableRAM / model.recommendedRAM;
    if (ramFit >= 1) {
      score += 40;
    } else if (ramFit >= 0.5) {
      score += 20;
    }

    // Performance metrics (30 points)
    score += (model.performance.speed / 10) * 10;
    score += (model.performance.quality / 10) * 10;
    score += (model.performance.efficiency / 10) * 10;

    // Size efficiency (20 points)
    const sizeScore = Math.max(0, (4 - model.sizeGB) / 4 * 20);
    score += sizeScore;

    // Popularity/downloads (10 points)
    if (model.downloaded) {
      score += 5;
    }

    return Math.min(100, Math.round(score));
  };

  const getRecommendationLevel = (score: number): { level: string; color: string } => {
    if (score >= 80) return { level: 'Highly Recommended', color: 'success' };
    if (score >= 60) return { level: 'Recommended', color: 'processing' };
    if (score >= 40) return { level: 'Compatible', color: 'default' };
    return { level: 'Not Recommended', color: 'warning' };
  };

  const handleDownload = async (model: Model) => {
    setDownloading(prev => ({ ...prev, [model.name]: 0 }));
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setDownloading(prev => {
          const current = prev[model.name] || 0;
          if (current >= 100) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [model.name]: Math.min(100, current + 10) };
        });
      }, 500);

      // Actual download
      await axios.post('/api/ollama/pull', { name: model.name });
      
      clearInterval(interval);
      setDownloading(prev => ({ ...prev, [model.name]: 100 }));
      
      message.success(`${model.name} downloaded successfully!`);
      
      // Update model status
      setModels(prev => prev.map(m => 
        m.name === model.name ? { ...m, downloaded: true } : m
      ));
      
      // Remove from downloading
      setTimeout(() => {
        setDownloading(prev => {
          const next = { ...prev };
          delete next[model.name];
          return next;
        });
      }, 2000);
    } catch (error: any) {
      console.error('Download error:', error);
      message.error(`Failed to download ${model.name}`);
      setDownloading(prev => {
        const next = { ...prev };
        delete next[model.name];
        return next;
      });
    }
  };

  const handleSelectModel = (model: Model) => {
    if (!model.downloaded) {
      message.warning('Please download the model first');
      return;
    }
    
    setSelectedModel(model);
    if (onModelSelect) {
      onModelSelect(model);
    }
    message.success(`Selected: ${model.name}`);
  };

  const handleShowDetails = (model: Model) => {
    setSelectedModel(model);
    setShowDetails(true);
  };

  const renderModelCard = (model: Model) => {
    const score = calculateRecommendationScore(model);
    const { level, color } = getRecommendationLevel(score);
    const isDownloading = downloading[model.name] !== undefined;
    const progress = downloading[model.name] || 0;

    const isRecommended = score >= 60;
    const isFavorite = score >= 80;

    return (
      <Badge.Ribbon 
        text={isFavorite ? '⭐ Top Pick' : isRecommended ? '✓ Recommended' : ''}
        color={isFavorite ? 'gold' : isRecommended ? 'blue' : 'gray'}
        style={{ display: score >= 60 ? 'block' : 'none' }}
      >
        <Card
          hoverable
          style={{ 
            marginBottom: 16,
            border: isFavorite ? '2px solid #faad14' : undefined,
            boxShadow: isFavorite ? '0 4px 12px rgba(250, 173, 20, 0.3)' : undefined
          }}
          actions={[
            model.downloaded ? (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => handleSelectModel(model)}
              >
                Use Model
              </Button>
            ) : (
              <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={isDownloading}
                onClick={() => handleDownload(model)}
              >
                Download
              </Button>
            ),
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => handleShowDetails(model)}
            >
              Details
            </Button>
          ]}
        >
          <Row gutter={16}>
            <Col span={4}>
              <div style={{ fontSize: 48, textAlign: 'center' }}>
                {model.icon}
              </div>
            </Col>
            <Col span={20}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Title level={4} style={{ margin: 0 }}>
                    {model.name}
                  </Title>
                  {model.downloaded && <Tag color="success">Downloaded</Tag>}
                </Space>
                
                <Text type="secondary">{model.description}</Text>
                
                <Space wrap>
                  <Tag>{model.parameters} params</Tag>
                  <Tag>{model.size}</Tag>
                  <Tag>{model.quantization}</Tag>
                  {model.useCase.slice(0, 2).map(uc => (
                    <Tag key={uc} color="blue">{uc}</Tag>
                  ))}
                </Space>

                <div>
                  <Space>
                    <Text strong>Recommendation Score:</Text>
                    <Progress
                      percent={score}
                      size="small"
                      status={color === 'success' ? 'success' : 'normal'}
                      style={{ width: 150 }}
                    />
                    <Tag color={color}>{level}</Tag>
                  </Space>
                </div>

                {systemSpecs && (
                  <Alert
                    message={
                      model.sizeGB <= systemSpecs.availableRAM
                        ? `✓ Compatible with ${systemSpecs.availableRAM}GB RAM`
                        : `⚠ Requires ${model.recommendedRAM}GB RAM (you have ${systemSpecs.availableRAM}GB)`
                    }
                    type={model.sizeGB <= systemSpecs.availableRAM ? 'success' : 'warning'}
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}

                {isDownloading && (
                  <Progress
                    percent={progress}
                    status="active"
                    strokeColor={{ from: '#108ee9', to: '#87d068' }}
                  />
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      </Badge.Ribbon>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={2}>
              <Space>
                <img 
                  src="https://ollama.com/public/ollama.png" 
                  alt="Ollama" 
                  style={{ height: 32 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                Ollama Model Selector
              </Space>
            </Title>
            <Paragraph type="secondary">
              Select and download AI models optimized for your system
            </Paragraph>
          </div>

          {systemSpecs && (
            <Alert
              message="System Specifications"
              description={
                <Space direction="vertical">
                  <Text>Available RAM: <Text strong>{systemSpecs.availableRAM}GB</Text></Text>
                  <Text>CPU: <Text strong>{systemSpecs.cpu}</Text></Text>
                  <Text>Benchmark Score: <Text strong>{systemSpecs.benchmark.overallScore}/100</Text></Text>
                  <Text type="success">Recommended models are highlighted based on your system</Text>
                </Space>
              }
              type="info"
              showIcon
              icon={<ThunderboltOutlined />}
            />
          )}

          <Row gutter={16}>
            <Col span={16}>
              <Search
                placeholder="Search models by name, description, or use case..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
              />
            </Col>
            <Col span={8}>
              <Select
                value={filterSize}
                onChange={setFilterSize}
                style={{ width: '100%' }}
                size="large"
              >
                <Option value="all">All Sizes</Option>
                <Option value="2">≤ 2GB (Lightweight)</Option>
                <Option value="4">≤ 4GB (Standard)</Option>
                <Option value="8">≤ 8GB (Large)</Option>
              </Select>
            </Col>
          </Row>

          <div>
            <Text type="secondary">
              Showing {filteredModels.length} models
              {systemSpecs && ` • ${systemSpecs.availableRAM}GB RAM available`}
            </Text>
          </div>

          <List
            loading={loading}
            dataSource={filteredModels}
            renderItem={model => (
              <List.Item key={model.name} style={{ border: 'none', padding: 0 }}>
                {renderModelCard(model)}
              </List.Item>
            )}
          />
        </Space>
      </Card>

      <Modal
        title={selectedModel?.name}
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetails(false)}>
            Close
          </Button>,
          selectedModel && !selectedModel.downloaded && (
            <Button
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => {
                handleDownload(selectedModel);
                setShowDetails(false);
              }}
            >
              Download
            </Button>
          )
        ]}
        width={700}
      >
        {selectedModel && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Model Name">{selectedModel.name}</Descriptions.Item>
            <Descriptions.Item label="Size">{selectedModel.size}</Descriptions.Item>
            <Descriptions.Item label="Parameters">{selectedModel.parameters}</Descriptions.Item>
            <Descriptions.Item label="Quantization">{selectedModel.quantization}</Descriptions.Item>
            <Descriptions.Item label="Min RAM">{selectedModel.minRAM}GB</Descriptions.Item>
            <Descriptions.Item label="Recommended RAM">{selectedModel.recommendedRAM}GB</Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedModel.description}
            </Descriptions.Item>
            <Descriptions.Item label="Use Cases" span={2}>
              <Space wrap>
                {selectedModel.useCase.map(uc => (
                  <Tag key={uc} color="blue">{uc}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Speed Score">
              <Progress percent={selectedModel.performance.speed * 10} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="Quality Score">
              <Progress percent={selectedModel.performance.quality * 10} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="Efficiency Score">
              <Progress percent={selectedModel.performance.efficiency * 10} size="small" />
            </Descriptions.Item>
            <Descriptions.Item label="Overall Score">
              <Progress
                percent={calculateRecommendationScore(selectedModel)}
                status={getRecommendationLevel(calculateRecommendationScore(selectedModel)).color === 'success' ? 'success' : 'normal'}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OllamaModelSelector;

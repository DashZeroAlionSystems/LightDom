/**
 * Specialized SEO Components
 * Advanced SEO analysis and content optimization components with professional UX
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
  Table,
  Tabs,
  Radio,
  Checkbox,
  Rate,
  message,
} from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  StarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  BulbOutlined,
  SearchOutlined,
  MonitorOutlined,
  GlobalOutlined,
  LinkOutlined,
  HeartOutlined,
  LikeOutlined,
  MessageOutlined,
  RetweetOutlined,
  PlusOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  SyncOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyOutlined,
  AuditOutlined,
  BugOutlined,
  CodeOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
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
const { TextArea } = Input;
const { TabPane } = Tabs;

// ===== SEO SCORE BREAKDOWN =====
interface SEOScoreBreakdownProps {
  scores: {
    technical: number;
    content: number;
    performance: number;
    mobile: number;
    backlinks: number;
  };
  details: {
    technical: string[];
    content: string[];
    performance: string[];
    mobile: string[];
    backlinks: string[];
  };
  animated?: boolean;
}

export const SEOScoreBreakdown: React.FC<SEOScoreBreakdownProps> = ({
  scores,
  details,
  animated = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof scores>('technical');

  const categoryConfig = {
    technical: { label: 'Technical SEO', color: '#1890ff', icon: <CodeOutlined /> },
    content: { label: 'Content Quality', color: '#52c41a', icon: <FileTextOutlined /> },
    performance: { label: 'Performance', color: '#fa8c16', icon: <ThunderboltOutlined /> },
    mobile: { label: 'Mobile Optimization', color: '#722ed1', icon: <MobileOutlined /> },
    backlinks: { label: 'Backlinks', color: '#eb2f96', icon: <LinkOutlined /> },
  };

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

  return (
    <EnhancedCard variant="elevated" title="SEO Score Analysis">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Overall Score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Progress
              type="circle"
              percent={overallScore}
              size={120}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Text strong style={{ fontSize: '24px' }}>{overallScore.toFixed(1)}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>Overall</Text>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <Row gutter={16}>
          {Object.entries(scores).map(([category, score]) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            const isSelected = selectedCategory === category;
            
            return (
              <Col span={12} key={category}>
                <div
                  style={{
                    padding: getSpacing(3),
                    borderRadius: getBorderRadius('lg'),
                    border: isSelected ? `2px solid ${config.color}` : '1px solid #e8e8e8',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: isSelected ? `${config.color}10` : 'transparent',
                  }}
                  onClick={() => setSelectedCategory(category as keyof typeof scores)}
                >
                  <div style={getFlexStyle('row', 'space-between', 'center')}>
                    <Space>
                      {config.icon}
                      <Text strong>{config.label}</Text>
                    </Space>
                    <Text strong style={{ color: config.color }}>
                      {score.toFixed(1)}
                    </Text>
                  </div>
                  <EnhancedProgress 
                    percent={score} 
                    size="small" 
                    strokeColor={config.color}
                    showInfo={false}
                  />
                </div>
              </Col>
            );
          })}
        </Row>

        {/* Category Details */}
        <div>
          <Title level={5}>{categoryConfig[selectedCategory].label} Details</Title>
          <List
            size="small"
            dataSource={details[selectedCategory]}
            renderItem={(item) => (
              <List.Item>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>{item}</Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </EnhancedCard>
  );
};

// ===== KEYWORD TRACKER =====
interface KeywordTrackerProps {
  keywords: {
    keyword: string;
    position: number;
    searchVolume: number;
    competition: 'Low' | 'Medium' | 'High';
    url: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    difficulty: number;
  }[];
  onTrackKeyword?: (keyword: string) => void;
  onOptimizeKeyword?: (keyword: string) => void;
}

export const KeywordTracker: React.FC<KeywordTrackerProps> = ({
  keywords,
  onTrackKeyword,
  onOptimizeKeyword,
}) => {
  const [sortBy, setSortBy] = useState<'position' | 'volume' | 'difficulty'>('position');
  const [filterTrend, setFilterTrend] = useState<'all' | 'up' | 'down' | 'stable'>('all');

  const filteredKeywords = keywords.filter(keyword => 
    filterTrend === 'all' || keyword.trend === filterTrend
  );

  const sortedKeywords = [...filteredKeywords].sort((a, b) => {
    if (sortBy === 'position') return a.position - b.position;
    if (sortBy === 'volume') return b.searchVolume - a.searchVolume;
    if (sortBy === 'difficulty') return a.difficulty - b.difficulty;
    return 0;
  });

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Low': return '#52c41a';
      case 'Medium': return '#fa8c16';
      case 'High': return '#ff4d4f';
      default: return '#d1d5db';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <RiseOutlined style={{ color: '#52c41a' }} />;
      case 'down': return <FallOutlined style={{ color: '#ff4d4f' }} />;
      case 'stable': return <MinusOutlined style={{ color: '#d1d5db' }} />;
      default: return null;
    }
  };

  return (
    <EnhancedCard variant="elevated" title="Keyword Performance Tracker">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Controls */}
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Sort by:</Text>
            <Select
              value={sortBy}
              onChange={setSortBy}
              size="small"
              style={{ width: '100%', marginLeft: getSpacing(2) }}
            >
              <Option value="position">Position</Option>
              <Option value="volume">Search Volume</Option>
              <Option value="difficulty">Difficulty</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Filter by trend:</Text>
            <Select
              value={filterTrend}
              onChange={setFilterTrend}
              size="small"
              style={{ width: '100%', marginLeft: getSpacing(2) }}
            >
              <Option value="all">All</Option>
              <Option value="up">Rising</Option>
              <Option value="down">Falling</Option>
              <Option value="stable">Stable</Option>
            </Select>
          </Col>
          <Col span={8}>
            <EnhancedButton
              variant="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onTrackKeyword?.('')}
              fullWidth
            >
              Track Keyword
            </EnhancedButton>
          </Col>
        </Row>

        {/* Keyword List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {sortedKeywords.map((keyword, index) => (
            <div
              key={index}
              style={{
                padding: getSpacing(3),
                borderRadius: getBorderRadius('lg'),
                border: '1px solid #e8e8e8',
                marginBottom: getSpacing(2),
                transition: 'all 0.2s ease',
              }}
            >
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <div>
                    <Text strong>{keyword.keyword}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {keyword.url}
                    </Text>
                  </div>
                </Col>
                <Col span={4}>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ color: keyword.position <= 10 ? '#52c41a' : '#1890ff' }}>
                      #{keyword.position}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getTrendIcon(keyword.trend)} {keyword.change > 0 ? '+' : ''}{keyword.change}
                    </Text>
                  </div>
                </Col>
                <Col span={4}>
                  <div style={{ textAlign: 'center' }}>
                    <Text>{keyword.searchVolume.toLocaleString()}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      monthly
                    </Text>
                  </div>
                </Col>
                <Col span={4}>
                  <div style={{ textAlign: 'center' }}>
                    <EnhancedTag color={getCompetitionColor(keyword.competition)} size="small">
                      {keyword.competition}
                    </EnhancedTag>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {keyword.difficulty}/100
                    </Text>
                  </div>
                </Col>
                <Col span={4}>
                  <Space>
                    <Tooltip title="Optimize for this keyword">
                      <Button
                        type="text"
                        size="small"
                        icon={<BulbOutlined />}
                        onClick={() => onOptimizeKeyword?.(keyword.keyword)}
                      />
                    </Tooltip>
                    <Tooltip title="View details">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                      />
                    </Tooltip>
                  </Space>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </Space>
    </EnhancedCard>
  );
};

// ===== CONTENT OPTIMIZER =====
interface ContentOptimizerProps {
  content: string;
  targetKeywords: string[];
  suggestions: {
    type: 'seo' | 'readability' | 'structure' | 'performance';
    priority: 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
    impact: number;
  }[];
  onApplySuggestion?: (suggestionIndex: number) => void;
  onOptimizeAll?: () => void;
}

export const ContentOptimizer: React.FC<ContentOptimizerProps> = ({
  content,
  targetKeywords,
  suggestions,
  onApplySuggestion,
  onOptimizeAll,
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [optimizedContent, setOptimizedContent] = useState(content);
  const [showPreview, setShowPreview] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#fa8c16';
      case 'low': return '#52c41a';
      default: return '#d1d5db';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seo': return <SearchOutlined />;
      case 'readability': return <FileTextOutlined />;
      case 'structure': return <CodeOutlined />;
      case 'performance': return <ThunderboltOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const keywordDensity = targetKeywords.map(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;
    const density = (count / content.split(' ').length) * 100;
    return { keyword, count, density };
  });

  return (
    <EnhancedCard variant="elevated" title="Content Optimization Studio">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Content Analysis */}
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <Title level={5}>Keyword Density</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                {keywordDensity.map(({ keyword, count, density }) => (
                  <div key={keyword}>
                    <div style={getFlexStyle('row', 'space-between', 'center')}>
                      <Text strong>{keyword}</Text>
                      <Text style={{ fontSize: '12px' }}>
                        {count} times ({density.toFixed(2)}%)
                      </Text>
                    </div>
                    <EnhancedProgress 
                      percent={Math.min(density * 10, 100)} 
                      size="small"
                      status={density > 3 ? 'exception' : density > 1 ? 'normal' : 'success'}
                    />
                  </div>
                ))}
              </Space>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Title level={5}>Content Metrics</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Word Count</Text>
                  <Text strong>{content.split(' ').length}</Text>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Character Count</Text>
                  <Text strong>{content.length}</Text>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Sentences</Text>
                  <Text strong>{content.split('.').length}</Text>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Paragraphs</Text>
                  <Text strong>{content.split('\n\n').length}</Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Optimization Suggestions */}
        <div>
          <div style={getFlexStyle('row', 'space-between', 'center')}>
            <Title level={5}>Optimization Suggestions</Title>
            <EnhancedButton
              variant="primary"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={onOptimizeAll}
            >
              Optimize All
            </EnhancedButton>
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: getSpacing(3),
                  borderRadius: getBorderRadius('lg'),
                  border: selectedSuggestion === index ? `2px solid ${getPriorityColor(suggestion.priority)}` : '1px solid #e8e8e8',
                  marginBottom: getSpacing(2),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setSelectedSuggestion(index)}
              >
                <Row gutter={16} align="middle">
                  <Col span={2}>
                    {getTypeIcon(suggestion.type)}
                  </Col>
                  <Col span={14}>
                    <div>
                      <Text strong>{suggestion.description}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {suggestion.recommendation}
                      </Text>
                    </div>
                  </Col>
                  <Col span={4}>
                    <div style={{ textAlign: 'center' }}>
                      <EnhancedTag color={getPriorityColor(suggestion.priority)} size="small">
                        {suggestion.priority}
                      </EnhancedTag>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        +{suggestion.impact}% impact
                      </Text>
                    </div>
                  </Col>
                  <Col span={4}>
                    <EnhancedButton
                      variant="primary"
                      size="small"
                      onClick={() => onApplySuggestion?.(index)}
                    >
                      Apply
                    </EnhancedButton>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </div>

        {/* Content Preview */}
        <div>
          <div style={getFlexStyle('row', 'space-between', 'center')}>
            <Title level={5}>Content Preview</Title>
            <Space>
              <Switch
                checked={showPreview}
                onChange={setShowPreview}
                checkedChildren="Optimized"
                unCheckedChildren="Original"
              />
              <EnhancedButton
                variant="ghost"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(showPreview ? optimizedContent : content);
                  message.success('Content copied to clipboard');
                }}
              >
                Copy
              </EnhancedButton>
            </Space>
          </div>
          
          <div style={{
            padding: getSpacing(4),
            backgroundColor: '#fafafa',
            borderRadius: getBorderRadius('lg'),
            border: '1px solid #e8e8e8',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            <Paragraph style={{ margin: 0 }}>
              {(showPreview ? optimizedContent : content).substring(0, 500)}...
            </Paragraph>
          </div>
        </div>
      </Space>
    </EnhancedCard>
  );
};

// ===== SEO REPORT GENERATOR =====
interface SEOReportGeneratorProps {
  url: string;
  reportData: {
    overallScore: number;
    technicalSEO: number;
    contentQuality: number;
    performance: number;
    mobileOptimization: number;
    backlinks: number;
  };
  recommendations: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }[];
  onGenerateReport?: () => void;
  onExportReport?: (format: 'pdf' | 'html' | 'json') => void;
  generating?: boolean;
}

export const SEOReportGenerator: React.FC<SEOReportGeneratorProps> = ({
  url,
  reportData,
  recommendations,
  onGenerateReport,
  onExportReport,
  generating = false,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html' | 'json'>('pdf');
  const [showPreview, setShowPreview] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#fa8c16';
      case 'low': return '#52c41a';
      default: return '#d1d5db';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return '#52c41a';
      case 'medium': return '#fa8c16';
      case 'high': return '#ff4d4f';
      default: return '#d1d5db';
    }
  };

  return (
    <EnhancedCard variant="elevated" title="SEO Report Generator">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* URL Input */}
        <div>
          <Text strong>Target URL:</Text>
          <Input
            value={url}
            readOnly
            style={{ marginTop: getSpacing(2) }}
            addonAfter={
              <EnhancedButton
                variant="primary"
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={onGenerateReport}
                loading={generating}
              >
                Generate Report
              </EnhancedButton>
            }
          />
        </div>

        {/* Report Scores */}
        <div>
          <Title level={5}>SEO Performance Scores</Title>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={reportData.overallScore}
                  size={80}
                  strokeColor="#1890ff"
                />
                <br />
                <Text strong>Overall Score</Text>
              </div>
            </Col>
            <Col span={16}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Technical SEO</Text>
                  <EnhancedProgress percent={reportData.technicalSEO} size="small" style={{ width: '100px' }} />
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Content Quality</Text>
                  <EnhancedProgress percent={reportData.contentQuality} size="small" style={{ width: '100px' }} />
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Performance</Text>
                  <EnhancedProgress percent={reportData.performance} size="small" style={{ width: '100px' }} />
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Mobile Optimization</Text>
                  <EnhancedProgress percent={reportData.mobileOptimization} size="small" style={{ width: '100px' }} />
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text>Backlinks</Text>
                  <EnhancedProgress percent={reportData.backlinks} size="small" style={{ width: '100px' }} />
                </div>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Recommendations */}
        <div>
          <Title level={5}>Optimization Recommendations</Title>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  padding: getSpacing(3),
                  borderRadius: getBorderRadius('lg'),
                  border: '1px solid #e8e8e8',
                  marginBottom: getSpacing(2),
                }}
              >
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <div>
                      <Text strong>{rec.category}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {rec.description}
                      </Text>
                    </div>
                  </Col>
                  <Col span={4}>
                    <div style={{ textAlign: 'center' }}>
                      <EnhancedTag color={getPriorityColor(rec.priority)} size="small">
                        {rec.priority}
                      </EnhancedTag>
                    </div>
                  </Col>
                  <Col span={4}>
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '12px' }}>{rec.impact}</Text>
                    </div>
                  </Col>
                  <Col span={4}>
                    <div style={{ textAlign: 'center' }}>
                      <EnhancedTag color={getEffortColor(rec.effort)} size="small">
                        {rec.effort}
                      </EnhancedTag>
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <Title level={5}>Export Report</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Select
                value={selectedFormat}
                onChange={setSelectedFormat}
                style={{ width: '100%' }}
              >
                <Option value="pdf">PDF Report</Option>
                <Option value="html">HTML Report</Option>
                <Option value="json">JSON Data</Option>
              </Select>
            </Col>
            <Col span={12}>
              <Space>
                <EnhancedButton
                  variant="ghost"
                  icon={<EyeOutlined />}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </EnhancedButton>
                <EnhancedButton
                  variant="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => onExportReport?.(selectedFormat)}
                >
                  Export
                </EnhancedButton>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Report Preview */}
        {showPreview && (
          <div>
            <Title level={5}>Report Preview</Title>
            <div style={{
              padding: getSpacing(4),
              backgroundColor: '#fafafa',
              borderRadius: getBorderRadius('lg'),
              border: '1px solid #e8e8e8',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              <Text>
                SEO Report for {url}
                <br />
                Generated on: {new Date().toLocaleDateString()}
                <br />
                Overall Score: {reportData.overallScore}/100
                <br />
                <br />
                Key Findings:
                <br />
                • Technical SEO: {reportData.technicalSEO}/100
                <br />
                • Content Quality: {reportData.contentQuality}/100
                <br />
                • Performance: {reportData.performance}/100
                <br />
                • Mobile Optimization: {reportData.mobileOptimization}/100
                <br />
                • Backlinks: {reportData.backlinks}/100
                <br />
                <br />
                Total Recommendations: {recommendations.length}
              </Text>
            </div>
          </div>
        )}
      </Space>
    </EnhancedCard>
  );
};

export default {
  SEOScoreBreakdown,
  KeywordTracker,
  ContentOptimizer,
  SEOReportGenerator,
};

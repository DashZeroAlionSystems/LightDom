/**
 * Model Parameter Form Component
 * 
 * A comprehensive form for adjusting Ollama model parameters like
 * temperature, top_p, top_k, and other inference settings.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Slider,
  Switch,
  Select,
  Space,
  Typography,
  Tag,
  Tooltip,
  Button,
  Alert,
  Collapse,
  Row,
  Col,
  Divider,
  message,
} from 'antd';
import {
  SettingOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  ReloadOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Parameter definitions with metadata
const PARAMETER_DEFINITIONS = {
  // Sampling Parameters
  temperature: {
    name: 'Temperature',
    description: 'Controls randomness in the output. Higher values make responses more creative, lower values make them more focused and deterministic.',
    type: 'float',
    default: 0.8,
    min: 0,
    max: 2,
    step: 0.1,
    category: 'sampling',
    marks: { 0: 'Focused', 0.8: 'Balanced', 2: 'Creative' },
  },
  top_p: {
    name: 'Top P (Nucleus Sampling)',
    description: 'Considers only tokens whose cumulative probability exceeds this threshold. Lower values make output more focused.',
    type: 'float',
    default: 0.9,
    min: 0,
    max: 1,
    step: 0.05,
    category: 'sampling',
    marks: { 0: 'Strict', 0.9: 'Default', 1: 'All' },
  },
  top_k: {
    name: 'Top K',
    description: 'Limits token selection to top K most likely tokens. Lower values reduce randomness.',
    type: 'int',
    default: 40,
    min: 0,
    max: 100,
    step: 1,
    category: 'sampling',
  },
  repeat_penalty: {
    name: 'Repeat Penalty',
    description: 'Penalizes repeated tokens to reduce repetition. Values > 1 reduce repetition.',
    type: 'float',
    default: 1.1,
    min: 0.5,
    max: 2,
    step: 0.05,
    category: 'sampling',
  },
  repeat_last_n: {
    name: 'Repeat Last N',
    description: 'Number of tokens to look back for repeat penalty. Use 0 for context length.',
    type: 'int',
    default: 64,
    min: 0,
    max: 512,
    step: 1,
    category: 'sampling',
  },
  
  // Mirostat Parameters
  mirostat: {
    name: 'Mirostat Mode',
    description: 'Enables Mirostat sampling for controlled perplexity. 0=disabled, 1=v1, 2=v2.',
    type: 'select',
    default: 0,
    options: [
      { value: 0, label: 'Disabled' },
      { value: 1, label: 'Mirostat v1' },
      { value: 2, label: 'Mirostat v2' },
    ],
    category: 'mirostat',
  },
  mirostat_eta: {
    name: 'Mirostat Eta',
    description: 'Learning rate for Mirostat algorithm. Higher values adjust more quickly.',
    type: 'float',
    default: 0.1,
    min: 0.01,
    max: 1,
    step: 0.01,
    category: 'mirostat',
    dependsOn: { mirostat: [1, 2] },
  },
  mirostat_tau: {
    name: 'Mirostat Tau',
    description: 'Target entropy (perplexity) for Mirostat. Lower values = more focused.',
    type: 'float',
    default: 5.0,
    min: 0,
    max: 10,
    step: 0.1,
    category: 'mirostat',
    dependsOn: { mirostat: [1, 2] },
  },
  
  // Generation Parameters
  num_predict: {
    name: 'Max Tokens',
    description: 'Maximum number of tokens to generate. Use -1 for unlimited.',
    type: 'int',
    default: 128,
    min: -1,
    max: 4096,
    step: 1,
    category: 'generation',
  },
  num_ctx: {
    name: 'Context Window',
    description: 'Size of the context window in tokens. Larger values use more memory.',
    type: 'int',
    default: 2048,
    min: 128,
    max: 131072,
    step: 256,
    category: 'generation',
    marks: { 128: '128', 2048: '2K', 4096: '4K', 8192: '8K', 16384: '16K' },
  },
  seed: {
    name: 'Random Seed',
    description: 'Seed for random number generation. Use -1 for random seed.',
    type: 'int',
    default: -1,
    min: -1,
    max: 2147483647,
    step: 1,
    category: 'generation',
  },
  stop: {
    name: 'Stop Sequences',
    description: 'Sequences that will stop generation when encountered.',
    type: 'tags',
    default: [],
    category: 'generation',
  },
  
  // Performance Parameters
  num_thread: {
    name: 'CPU Threads',
    description: 'Number of CPU threads to use. 0 = auto-detect.',
    type: 'int',
    default: 0,
    min: 0,
    max: 64,
    step: 1,
    category: 'performance',
  },
  num_gpu: {
    name: 'GPU Layers',
    description: 'Number of layers to offload to GPU. -1 = all layers.',
    type: 'int',
    default: -1,
    min: -1,
    max: 100,
    step: 1,
    category: 'performance',
  },
  num_batch: {
    name: 'Batch Size',
    description: 'Batch size for prompt processing.',
    type: 'int',
    default: 512,
    min: 1,
    max: 2048,
    step: 1,
    category: 'performance',
  },
  
  // Advanced Parameters
  tfs_z: {
    name: 'TFS Z',
    description: 'Tail-free sampling parameter. 1.0 = disabled.',
    type: 'float',
    default: 1.0,
    min: 0,
    max: 2,
    step: 0.1,
    category: 'advanced',
  },
  typical_p: {
    name: 'Typical P',
    description: 'Typical sampling probability. 1.0 = disabled.',
    type: 'float',
    default: 1.0,
    min: 0,
    max: 1,
    step: 0.05,
    category: 'advanced',
  },
  presence_penalty: {
    name: 'Presence Penalty',
    description: 'Penalizes new tokens based on presence in text so far.',
    type: 'float',
    default: 0,
    min: -2,
    max: 2,
    step: 0.1,
    category: 'advanced',
  },
  frequency_penalty: {
    name: 'Frequency Penalty',
    description: 'Penalizes new tokens based on frequency in text so far.',
    type: 'float',
    default: 0,
    min: -2,
    max: 2,
    step: 0.1,
    category: 'advanced',
  },
};

// Category metadata
const CATEGORIES = {
  sampling: {
    title: 'Sampling Parameters',
    description: 'Control the randomness and diversity of generated text',
    icon: <ThunderboltOutlined />,
  },
  mirostat: {
    title: 'Mirostat Sampling',
    description: 'Advanced adaptive sampling algorithm for controlled output',
    icon: <ExperimentOutlined />,
  },
  generation: {
    title: 'Generation Settings',
    description: 'Control output length and context',
    icon: <SettingOutlined />,
  },
  performance: {
    title: 'Performance Settings',
    description: 'Hardware utilization and optimization',
    icon: <ThunderboltOutlined />,
  },
  advanced: {
    title: 'Advanced Parameters',
    description: 'Fine-tuned sampling controls for experts',
    icon: <ExperimentOutlined />,
  },
};

// Preset configurations
const PRESETS = [
  {
    name: 'Creative',
    description: 'High creativity for storytelling and brainstorming',
    values: { temperature: 1.2, top_p: 0.95, top_k: 50, repeat_penalty: 1.05 },
  },
  {
    name: 'Balanced',
    description: 'Default balanced settings for general use',
    values: { temperature: 0.8, top_p: 0.9, top_k: 40, repeat_penalty: 1.1 },
  },
  {
    name: 'Precise',
    description: 'Low randomness for factual and technical content',
    values: { temperature: 0.3, top_p: 0.7, top_k: 20, repeat_penalty: 1.2 },
  },
  {
    name: 'Deterministic',
    description: 'Minimal randomness for reproducible outputs',
    values: { temperature: 0, top_p: 0.5, top_k: 10, repeat_penalty: 1.3 },
  },
  {
    name: 'Code',
    description: 'Optimized for code generation',
    values: { temperature: 0.2, top_p: 0.8, top_k: 30, repeat_penalty: 1.15, num_ctx: 4096 },
  },
];

export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repeat_penalty?: number;
  repeat_last_n?: number;
  mirostat?: number;
  mirostat_eta?: number;
  mirostat_tau?: number;
  num_predict?: number;
  num_ctx?: number;
  seed?: number;
  stop?: string[];
  num_thread?: number;
  num_gpu?: number;
  num_batch?: number;
  tfs_z?: number;
  typical_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface ModelParameterFormProps {
  /** Initial parameter values */
  initialValues?: ModelParameters;
  /** Callback when parameters change */
  onChange?: (parameters: ModelParameters) => void;
  /** Callback when saving */
  onSave?: (parameters: ModelParameters) => void;
  /** Show only essential parameters */
  compact?: boolean;
  /** Show presets selector */
  showPresets?: boolean;
  /** Categories to show (defaults to all) */
  categories?: Array<'sampling' | 'mirostat' | 'generation' | 'performance' | 'advanced'>;
  /** Whether the form is read-only */
  readOnly?: boolean;
}

const ModelParameterForm: React.FC<ModelParameterFormProps> = ({
  initialValues = {},
  onChange,
  onSave,
  compact = false,
  showPresets = true,
  categories,
  readOnly = false,
}) => {
  // Initialize with defaults
  const getDefaultValues = useCallback((): ModelParameters => {
    const defaults: ModelParameters = {};
    Object.entries(PARAMETER_DEFINITIONS).forEach(([key, def]) => {
      defaults[key as keyof ModelParameters] = def.default as never;
    });
    return { ...defaults, ...initialValues };
  }, [initialValues]);

  const [values, setValues] = useState<ModelParameters>(getDefaultValues);
  const [activeCategories, setActiveCategories] = useState<string[]>(['sampling']);

  // Get parameters grouped by category
  const parametersByCategory = useMemo(() => {
    const grouped: Record<string, Array<[string, typeof PARAMETER_DEFINITIONS[keyof typeof PARAMETER_DEFINITIONS]]>> = {};
    
    Object.entries(PARAMETER_DEFINITIONS).forEach(([key, def]) => {
      const category = def.category;
      if (!categories || categories.includes(category as never)) {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push([key, def]);
      }
    });
    
    return grouped;
  }, [categories]);

  // Handle parameter change
  const handleChange = useCallback((key: string, value: unknown) => {
    setValues(prev => {
      const newValues = { ...prev, [key]: value };
      onChange?.(newValues);
      return newValues;
    });
  }, [onChange]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: typeof PRESETS[0]) => {
    setValues(prev => {
      const newValues = { ...prev, ...preset.values };
      onChange?.(newValues);
      return newValues;
    });
    message.success(`Applied "${preset.name}" preset`);
  }, [onChange]);

  // Handle reset to defaults
  const handleReset = useCallback(() => {
    const defaults = getDefaultValues();
    setValues(defaults);
    onChange?.(defaults);
    message.info('Reset to default values');
  }, [getDefaultValues, onChange]);

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.(values);
    message.success('Parameters saved');
  }, [values, onSave]);

  // Check if parameter should be shown based on dependencies
  const shouldShowParameter = useCallback((def: typeof PARAMETER_DEFINITIONS[keyof typeof PARAMETER_DEFINITIONS]): boolean => {
    if (!def.dependsOn) return true;
    
    return Object.entries(def.dependsOn).every(([depKey, allowedValues]) => {
      const currentValue = values[depKey as keyof ModelParameters];
      return (allowedValues as number[]).includes(currentValue as number);
    });
  }, [values]);

  // Render a parameter input
  const renderParameter = useCallback((key: string, def: typeof PARAMETER_DEFINITIONS[keyof typeof PARAMETER_DEFINITIONS]) => {
    if (!shouldShowParameter(def)) return null;

    const value = values[key as keyof ModelParameters];
    const isModified = value !== def.default;

    const label = (
      <Space>
        <span>{def.name}</span>
        {isModified && <Tag color="blue" size="small">Modified</Tag>}
        <Tooltip title={def.description}>
          <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
        </Tooltip>
      </Space>
    );

    switch (def.type) {
      case 'float':
      case 'int':
        return (
          <Form.Item key={key} label={label}>
            <Row gutter={16}>
              <Col span={16}>
                <Slider
                  value={value as number}
                  onChange={(v) => handleChange(key, v)}
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  marks={def.marks}
                  disabled={readOnly}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  value={value as number}
                  onChange={(v) => handleChange(key, v)}
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  style={{ width: '100%' }}
                  disabled={readOnly}
                />
              </Col>
            </Row>
          </Form.Item>
        );

      case 'select':
        return (
          <Form.Item key={key} label={label}>
            <Select
              value={value as number}
              onChange={(v) => handleChange(key, v)}
              style={{ width: '100%' }}
              disabled={readOnly}
            >
              {def.options?.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'tags':
        return (
          <Form.Item key={key} label={label}>
            <Select
              mode="tags"
              value={value as string[]}
              onChange={(v) => handleChange(key, v)}
              placeholder="Enter stop sequences"
              style={{ width: '100%' }}
              disabled={readOnly}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  }, [values, handleChange, shouldShowParameter, readOnly]);

  // Compact view - show only essential parameters
  if (compact) {
    const essentialParams = ['temperature', 'top_p', 'num_predict', 'num_ctx'];
    
    return (
      <Card
        size="small"
        title={
          <Space>
            <SettingOutlined />
            <span>Model Parameters</span>
          </Space>
        }
        extra={
          <Space>
            <Button size="small" icon={<ReloadOutlined />} onClick={handleReset} disabled={readOnly}>
              Reset
            </Button>
            {onSave && (
              <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleSave} disabled={readOnly}>
                Save
              </Button>
            )}
          </Space>
        }
      >
        <Form layout="vertical" size="small">
          {essentialParams.map(key => {
            const def = PARAMETER_DEFINITIONS[key as keyof typeof PARAMETER_DEFINITIONS];
            return def ? renderParameter(key, def) : null;
          })}
        </Form>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>Model Parameters</span>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset} disabled={readOnly}>
            Reset to Defaults
          </Button>
          {onSave && (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} disabled={readOnly}>
              Save Parameters
            </Button>
          )}
        </Space>
      }
    >
      {/* Presets */}
      {showPresets && (
        <>
          <Title level={5}>Quick Presets</Title>
          <Space wrap style={{ marginBottom: 16 }}>
            {PRESETS.map(preset => (
              <Tooltip key={preset.name} title={preset.description}>
                <Button
                  onClick={() => handlePresetSelect(preset)}
                  disabled={readOnly}
                >
                  {preset.name}
                </Button>
              </Tooltip>
            ))}
          </Space>
          <Divider />
        </>
      )}

      {/* Parameter Categories */}
      <Collapse
        activeKey={activeCategories}
        onChange={(keys) => setActiveCategories(keys as string[])}
        expandIconPosition="start"
      >
        {Object.entries(parametersByCategory).map(([category, params]) => {
          const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES];
          if (!categoryInfo) return null;

          return (
            <Panel
              key={category}
              header={
                <Space>
                  {categoryInfo.icon}
                  <span>{categoryInfo.title}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({params.length} parameters)
                  </Text>
                </Space>
              }
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {categoryInfo.description}
                </Text>
              }
            >
              <Form layout="vertical">
                {params.map(([key, def]) => renderParameter(key, def))}
              </Form>
            </Panel>
          );
        })}
      </Collapse>

      {/* Current Values Summary */}
      <Divider />
      <Title level={5}>Current Configuration</Title>
      <Alert
        type="info"
        message="Export these values to use in your Modelfile or API calls"
        description={
          <div style={{ marginTop: 8 }}>
            <pre style={{ 
              background: '#282c34', 
              color: '#abb2bf', 
              padding: 12, 
              borderRadius: 4,
              fontSize: 12,
              overflow: 'auto',
            }}>
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(values).filter(([_, v]) => v !== undefined && v !== null)
                ),
                null,
                2
              )}
            </pre>
            <Button
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(values, null, 2));
                message.success('Copied to clipboard');
              }}
              style={{ marginTop: 8 }}
            >
              Copy JSON
            </Button>
          </div>
        }
      />
    </Card>
  );
};

export default ModelParameterForm;

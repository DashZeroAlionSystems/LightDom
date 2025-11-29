/**
 * System Prompt Editor Component
 * 
 * A rich editor for customizing AI behavior through system prompts.
 * Includes templates, variables, testing, and validation.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  Tooltip,
  Alert,
  Modal,
  Select,
  Tabs,
  List,
  Row,
  Col,
  Divider,
  message,
  Switch,
  Badge,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CopyOutlined,
  StarOutlined,
  StarFilled,
  ThunderboltOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  HistoryOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RobotOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Predefined system prompt templates
const SYSTEM_PROMPT_TEMPLATES = [
  {
    id: 'helpful-assistant',
    name: 'Helpful Assistant',
    category: 'general',
    description: 'A friendly, helpful AI assistant',
    prompt: `You are a helpful, harmless, and honest AI assistant. Your goal is to provide accurate, 
helpful responses while being respectful and considerate. If you're unsure about something, 
say so rather than making up information. Always prioritize user safety and well-being.`,
    icon: '🤖',
  },
  {
    id: 'code-expert',
    name: 'Code Expert',
    category: 'technical',
    description: 'Expert programmer and code reviewer',
    prompt: `You are an expert software engineer with deep knowledge of multiple programming languages, 
frameworks, and best practices. When writing code:
- Always include helpful comments
- Follow industry best practices and design patterns
- Consider edge cases and error handling
- Suggest optimizations when appropriate
- Explain your reasoning when making architectural decisions

When reviewing code, be constructive and specific about improvements.`,
    icon: '💻',
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    category: 'creative',
    description: 'Creative and imaginative storyteller',
    prompt: `You are a creative writer with a vivid imagination and mastery of various writing styles. 
You excel at:
- Crafting engaging narratives with compelling characters
- Using vivid imagery and descriptive language
- Adapting tone and style to match the desired genre
- Creating immersive worlds and settings
- Balancing dialogue, action, and exposition

Let your creativity flow while maintaining coherent and engaging storytelling.`,
    icon: '✍️',
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'technical',
    description: 'Expert data analyst and statistician',
    prompt: `You are a data analyst expert skilled in:
- Statistical analysis and interpretation
- Data visualization best practices
- SQL, Python, and R for data analysis
- Machine learning fundamentals
- Business intelligence and reporting

Always explain your methodology, provide context for your findings, and suggest 
actionable insights based on the data.`,
    icon: '📊',
  },
  {
    id: 'teacher',
    name: 'Patient Teacher',
    category: 'education',
    description: 'Patient and thorough educator',
    prompt: `You are a patient, knowledgeable teacher who excels at explaining complex concepts 
in simple terms. Your approach:
- Break down complex topics into manageable parts
- Use analogies and real-world examples
- Check for understanding and address gaps
- Encourage questions and curiosity
- Adapt your explanations to the learner's level
- Celebrate progress and provide constructive feedback

Your goal is to foster deep understanding, not just memorization.`,
    icon: '👨‍🏫',
  },
  {
    id: 'concise',
    name: 'Concise Responder',
    category: 'style',
    description: 'Brief and to-the-point responses',
    prompt: `You are an AI assistant that values brevity and clarity. Your responses should be:
- Concise and to the point
- Free of unnecessary elaboration
- Focused on the essential information
- Using bullet points when appropriate

Only provide longer explanations when specifically requested.`,
    icon: '⚡',
  },
  {
    id: 'socratic',
    name: 'Socratic Guide',
    category: 'education',
    description: 'Guides through questions rather than answers',
    prompt: `You are a Socratic guide who helps users discover answers through thoughtful questions.
Instead of giving direct answers:
- Ask probing questions to understand the user's thinking
- Guide them to discover insights on their own
- Challenge assumptions gently
- Build upon their responses with follow-up questions
- Provide hints when they're stuck
- Celebrate their discoveries

Your goal is to develop critical thinking, not dependence on answers.`,
    icon: '🤔',
  },
  {
    id: 'json-only',
    name: 'JSON Only',
    category: 'technical',
    description: 'Responds only in valid JSON format',
    prompt: `You are an API that responds ONLY in valid JSON format. 
- Never include any text outside of JSON
- Ensure all output is valid, parseable JSON
- Use consistent key naming conventions (camelCase)
- Include appropriate data types
- Handle errors by returning error objects

Example response format:
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}`,
    icon: '{ }',
  },
];

// Template categories
const CATEGORIES = [
  { key: 'all', label: 'All Templates' },
  { key: 'general', label: 'General' },
  { key: 'technical', label: 'Technical' },
  { key: 'creative', label: 'Creative' },
  { key: 'education', label: 'Education' },
  { key: 'style', label: 'Style' },
];

// Variables that can be used in prompts
const PROMPT_VARIABLES = [
  { name: '{{user_name}}', description: 'User\'s name if available' },
  { name: '{{date}}', description: 'Current date' },
  { name: '{{time}}', description: 'Current time' },
  { name: '{{language}}', description: 'User\'s preferred language' },
  { name: '{{context}}', description: 'Additional context provided' },
];

// Best practices tips
const BEST_PRACTICES = [
  'Be specific about the AI\'s role and expertise',
  'Include examples of desired behavior when helpful',
  'Specify output format requirements',
  'Define boundaries and limitations',
  'Consider edge cases and how to handle them',
  'Balance between too vague and too restrictive',
  'Test with various inputs to verify behavior',
];

interface PromptHistoryEntry {
  id: string;
  prompt: string;
  timestamp: Date;
  name?: string;
}

export interface SystemPromptEditorProps {
  /** Initial system prompt */
  initialPrompt?: string;
  /** Callback when prompt changes */
  onChange?: (prompt: string) => void;
  /** Callback when saving */
  onSave?: (prompt: string) => void;
  /** Callback for testing the prompt */
  onTest?: (prompt: string) => Promise<string>;
  /** Whether to show template library */
  showTemplates?: boolean;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Minimum recommended length */
  minLength?: number;
}

const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({
  initialPrompt = '',
  onChange,
  onSave,
  onTest,
  showTemplates = true,
  readOnly = false,
  maxLength = 10000,
  minLength = 20,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showVariables, setShowVariables] = useState(false);

  // Prompt analysis
  const analysis = useMemo(() => {
    const length = prompt.length;
    const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
    const hasRole = /you are|act as|behave as|your role/i.test(prompt);
    const hasExamples = /example|for instance|such as/i.test(prompt);
    const hasConstraints = /don't|do not|never|always|must|should/i.test(prompt);
    const hasFormat = /format|json|markdown|bullet|list/i.test(prompt);
    
    const score = [
      length >= minLength ? 20 : 10,
      hasRole ? 25 : 0,
      hasExamples ? 20 : 0,
      hasConstraints ? 15 : 0,
      hasFormat ? 10 : 0,
      wordCount >= 10 ? 10 : 5,
    ].reduce((a, b) => a + b, 0);

    return {
      length,
      wordCount,
      hasRole,
      hasExamples,
      hasConstraints,
      hasFormat,
      score: Math.min(100, score),
      warnings: [
        length < minLength && `Prompt is very short (${length} chars). Consider adding more detail.`,
        !hasRole && 'Consider defining a clear role for the AI.',
        length > maxLength * 0.8 && 'Approaching maximum length limit.',
      ].filter(Boolean) as string[],
    };
  }, [prompt, minLength, maxLength]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return SYSTEM_PROMPT_TEMPLATES.filter(
      t => selectedCategory === 'all' || t.category === selectedCategory
    ).sort((a, b) => {
      // Favorites first
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [selectedCategory, favorites]);

  // Handle prompt change
  const handleChange = useCallback((value: string) => {
    if (value.length <= maxLength) {
      setPrompt(value);
      onChange?.(value);
    }
  }, [onChange, maxLength]);

  // Handle save
  const handleSave = useCallback(() => {
    if (prompt.length < minLength) {
      message.warning(`Prompt should be at least ${minLength} characters`);
      return;
    }
    
    // Add to history
    const entry: PromptHistoryEntry = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date(),
    };
    setHistory(prev => [entry, ...prev.slice(0, 9)]);
    
    onSave?.(prompt);
    message.success('System prompt saved');
  }, [prompt, onSave, minLength]);

  // Handle template selection
  const handleSelectTemplate = useCallback((template: typeof SYSTEM_PROMPT_TEMPLATES[0]) => {
    Modal.confirm({
      title: `Use "${template.name}" template?`,
      content: 'This will replace your current prompt.',
      onOk: () => {
        setPrompt(template.prompt);
        onChange?.(template.prompt);
        message.success(`Applied "${template.name}" template`);
      },
    });
  }, [onChange]);

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Handle test
  const handleTest = useCallback(async () => {
    if (!onTest) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await onTest(prompt);
      setTestResult(result);
    } catch (error) {
      message.error('Test failed. Please check your configuration.');
    } finally {
      setTesting(false);
    }
  }, [prompt, onTest]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt);
    message.success('Copied to clipboard');
  }, [prompt]);

  // Insert variable
  const insertVariable = useCallback((variable: string) => {
    const newPrompt = prompt + variable;
    setPrompt(newPrompt);
    onChange?.(newPrompt);
    setShowVariables(false);
  }, [prompt, onChange]);

  // Restore from history
  const handleRestoreFromHistory = useCallback((entry: PromptHistoryEntry) => {
    Modal.confirm({
      title: 'Restore from history?',
      content: 'This will replace your current prompt.',
      onOk: () => {
        setPrompt(entry.prompt);
        onChange?.(entry.prompt);
        setShowHistory(false);
        message.success('Prompt restored');
      },
    });
  }, [onChange]);

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>System Prompt Editor</span>
          <Badge
            count={`${analysis.score}%`}
            style={{
              backgroundColor: analysis.score >= 80 ? '#52c41a' : analysis.score >= 50 ? '#faad14' : '#ff4d4f',
            }}
          />
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="View Variables">
            <Button icon={<BulbOutlined />} onClick={() => setShowVariables(true)} />
          </Tooltip>
          <Tooltip title="View History">
            <Button icon={<HistoryOutlined />} onClick={() => setShowHistory(true)} />
          </Tooltip>
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            Copy
          </Button>
          {onTest && (
            <Button
              icon={<ExperimentOutlined />}
              onClick={handleTest}
              loading={testing}
              disabled={readOnly}
            >
              Test
            </Button>
          )}
          {onSave && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={readOnly}
            >
              Save
            </Button>
          )}
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Editor Tab */}
        <TabPane
          tab={
            <Space>
              <EditOutlined />
              Editor
            </Space>
          }
          key="editor"
        >
          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <Alert
              type="warning"
              message="Suggestions"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {analysis.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              }
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          {/* Editor */}
          <TextArea
            value={prompt}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your system prompt here...

Example:
You are a helpful AI assistant that specializes in [domain]. 
Your responses should be [qualities].
When asked about [topic], you should [behavior]."
            rows={12}
            maxLength={maxLength}
            showCount
            disabled={readOnly}
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
            }}
          />

          {/* Analysis */}
          <Divider />
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>Prompt Analysis</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Word Count: </Text>
                  <Text strong>{analysis.wordCount}</Text>
                </div>
                <div>
                  <Text>Character Count: </Text>
                  <Text strong>{analysis.length} / {maxLength}</Text>
                </div>
                <div>
                  <Text>Quality Score: </Text>
                  <Text strong style={{ 
                    color: analysis.score >= 80 ? '#52c41a' : analysis.score >= 50 ? '#faad14' : '#ff4d4f' 
                  }}>
                    {analysis.score}%
                  </Text>
                </div>
              </Space>
            </Col>
            <Col span={12}>
              <Title level={5}>Detected Elements</Title>
              <Space wrap>
                <Tag color={analysis.hasRole ? 'green' : 'default'}>
                  {analysis.hasRole ? <CheckCircleOutlined /> : <WarningOutlined />} Role Definition
                </Tag>
                <Tag color={analysis.hasExamples ? 'green' : 'default'}>
                  {analysis.hasExamples ? <CheckCircleOutlined /> : <WarningOutlined />} Examples
                </Tag>
                <Tag color={analysis.hasConstraints ? 'green' : 'default'}>
                  {analysis.hasConstraints ? <CheckCircleOutlined /> : <WarningOutlined />} Constraints
                </Tag>
                <Tag color={analysis.hasFormat ? 'green' : 'default'}>
                  {analysis.hasFormat ? <CheckCircleOutlined /> : <WarningOutlined />} Format Rules
                </Tag>
              </Space>
            </Col>
          </Row>

          {/* Test Result */}
          {testResult && (
            <>
              <Divider />
              <Title level={5}>Test Result</Title>
              <Alert
                type="info"
                message="AI Response Preview"
                description={
                  <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {testResult}
                  </pre>
                }
              />
            </>
          )}
        </TabPane>

        {/* Templates Tab */}
        {showTemplates && (
          <TabPane
            tab={
              <Space>
                <StarOutlined />
                Templates
              </Space>
            }
            key="templates"
          >
            {/* Category Filter */}
            <Space style={{ marginBottom: 16 }}>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.key}
                  type={selectedCategory === cat.key ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </Button>
              ))}
            </Space>

            {/* Template List */}
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={filteredTemplates}
              renderItem={(template) => (
                <List.Item>
                  <Card
                    hoverable
                    size="small"
                    title={
                      <Space>
                        <span style={{ fontSize: 20 }}>{template.icon}</span>
                        <span>{template.name}</span>
                      </Space>
                    }
                    extra={
                      <Tooltip title={favorites.has(template.id) ? 'Remove from favorites' : 'Add to favorites'}>
                        <Button
                          type="text"
                          size="small"
                          icon={favorites.has(template.id) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(template.id);
                          }}
                        />
                      </Tooltip>
                    }
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                      {template.description}
                    </Paragraph>
                    <Tag>{template.category}</Tag>
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
        )}

        {/* Best Practices Tab */}
        <TabPane
          tab={
            <Space>
              <InfoCircleOutlined />
              Best Practices
            </Space>
          }
          key="tips"
        >
          <Title level={4}>Writing Effective System Prompts</Title>
          
          <List
            dataSource={BEST_PRACTICES}
            renderItem={(tip, index) => (
              <List.Item>
                <Space>
                  <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                  <Text>{tip}</Text>
                </Space>
              </List.Item>
            )}
          />

          <Divider />

          <Title level={4}>Example Structure</Title>
          <Alert
            type="info"
            message="Recommended Prompt Structure"
            description={
              <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
{`1. ROLE: Define who the AI is
   "You are a [role] who specializes in [domain]."

2. CAPABILITIES: What the AI can do
   "You excel at [skills] and can help with [tasks]."

3. BEHAVIOR: How the AI should respond
   "When responding, you should [behavior guidelines]."

4. CONSTRAINTS: What the AI shouldn't do
   "You should never [limitations]."

5. FORMAT: How responses should be structured
   "Format your responses as [format specification]."

6. EXAMPLES: (Optional) Show desired behavior
   "For example, when asked about X, respond like Y."`}
              </pre>
            }
          />
        </TabPane>
      </Tabs>

      {/* Variables Modal */}
      <Modal
        title="Available Variables"
        open={showVariables}
        onCancel={() => setShowVariables(false)}
        footer={null}
      >
        <Paragraph>
          Click a variable to insert it at the end of your prompt:
        </Paragraph>
        <List
          dataSource={PROMPT_VARIABLES}
          renderItem={(variable) => (
            <List.Item
              actions={[
                <Button
                  key="insert"
                  size="small"
                  onClick={() => insertVariable(variable.name)}
                >
                  Insert
                </Button>
              ]}
            >
              <List.Item.Meta
                title={<Text code>{variable.name}</Text>}
                description={variable.description}
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* History Modal */}
      <Modal
        title="Prompt History"
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={null}
        width={700}
      >
        {history.length === 0 ? (
          <Alert message="No history yet" type="info" />
        ) : (
          <List
            dataSource={history}
            renderItem={(entry) => (
              <List.Item
                actions={[
                  <Button
                    key="restore"
                    size="small"
                    onClick={() => handleRestoreFromHistory(entry)}
                  >
                    Restore
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Text type="secondary">
                      {entry.timestamp.toLocaleString()}
                    </Text>
                  }
                  description={
                    <Text ellipsis={{ rows: 2 }}>
                      {entry.prompt}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </Card>
  );
};

export default SystemPromptEditor;

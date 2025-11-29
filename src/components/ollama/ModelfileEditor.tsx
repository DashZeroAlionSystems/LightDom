/**
 * Modelfile Editor Component
 * 
 * A syntax-highlighted editor for creating and editing Ollama Modelfiles.
 * Supports all Modelfile instructions: FROM, TEMPLATE, SYSTEM, PARAMETER, etc.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  Dropdown,
  message,
  Row,
  Col,
} from 'antd';
import {
  SaveOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  CodeOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

// Modelfile instruction definitions
const MODELFILE_INSTRUCTIONS = {
  FROM: {
    syntax: 'FROM <model>',
    description: 'Defines the base model to use',
    example: 'FROM llama2:7b',
    required: true,
  },
  PARAMETER: {
    syntax: 'PARAMETER <name> <value>',
    description: 'Sets a parameter for the model',
    example: 'PARAMETER temperature 0.7',
  },
  TEMPLATE: {
    syntax: 'TEMPLATE """<template>"""',
    description: 'Sets the prompt template for the model',
    example: 'TEMPLATE """{{ .System }}\n{{ .Prompt }}"""',
  },
  SYSTEM: {
    syntax: 'SYSTEM """<message>"""',
    description: 'Sets the system message for the model',
    example: 'SYSTEM """You are a helpful assistant."""',
  },
  ADAPTER: {
    syntax: 'ADAPTER <path>',
    description: 'Specifies a LoRA adapter to apply',
    example: 'ADAPTER ./my-adapter.gguf',
  },
  LICENSE: {
    syntax: 'LICENSE """<license>"""',
    description: 'Specifies the license for the model',
    example: 'LICENSE """MIT License"""',
  },
  MESSAGE: {
    syntax: 'MESSAGE <role> <content>',
    description: 'Adds a message to the conversation history',
    example: 'MESSAGE user How are you?',
  },
};

// Available parameters for PARAMETER instruction
const AVAILABLE_PARAMETERS = [
  { name: 'temperature', type: 'float', default: 0.8, min: 0, max: 2, description: 'Creativity of responses' },
  { name: 'top_p', type: 'float', default: 0.9, min: 0, max: 1, description: 'Nucleus sampling threshold' },
  { name: 'top_k', type: 'int', default: 40, min: 0, max: 100, description: 'Top-k sampling' },
  { name: 'repeat_penalty', type: 'float', default: 1.1, min: 0, max: 2, description: 'Repetition penalty' },
  { name: 'num_ctx', type: 'int', default: 2048, min: 128, max: 131072, description: 'Context window size' },
  { name: 'num_predict', type: 'int', default: 128, min: -1, max: 10000, description: 'Max tokens to generate (-1 for unlimited)' },
  { name: 'mirostat', type: 'int', default: 0, min: 0, max: 2, description: 'Mirostat sampling (0=disabled, 1=v1, 2=v2)' },
  { name: 'mirostat_eta', type: 'float', default: 0.1, min: 0, max: 1, description: 'Mirostat learning rate' },
  { name: 'mirostat_tau', type: 'float', default: 5.0, min: 0, max: 10, description: 'Mirostat target entropy' },
  { name: 'seed', type: 'int', default: -1, description: 'Random seed (-1 for random)' },
  { name: 'stop', type: 'string', description: 'Stop sequence' },
  { name: 'num_thread', type: 'int', description: 'Number of threads to use' },
  { name: 'num_gpu', type: 'int', default: -1, description: 'Number of GPU layers (-1 for all)' },
];

interface ValidationError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

interface HighlightedLine {
  lineNumber: number;
  content: string;
  tokens: Array<{
    type: 'instruction' | 'parameter' | 'value' | 'string' | 'comment' | 'text';
    value: string;
  }>;
}

export interface ModelfileEditorProps {
  /** Initial Modelfile content */
  initialContent?: string;
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Callback when saving */
  onSave?: (content: string) => void;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Custom height for the editor */
  height?: number | string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Enable auto-validation */
  autoValidate?: boolean;
}

const ModelfileEditor: React.FC<ModelfileEditorProps> = ({
  initialContent = '',
  onChange,
  onSave,
  readOnly = false,
  height = 400,
  showLineNumbers = true,
  autoValidate = true,
}) => {
  const [content, setContent] = useState(initialContent);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [cursorLine, setCursorLine] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tokenize a line for syntax highlighting
  const tokenizeLine = useCallback((line: string): HighlightedLine['tokens'] => {
    const tokens: HighlightedLine['tokens'] = [];
    const trimmed = line.trim();

    // Check for comments
    if (trimmed.startsWith('#')) {
      return [{ type: 'comment', value: line }];
    }

    // Check for instructions
    const instructionMatch = trimmed.match(/^([A-Z]+)\s*/);
    if (instructionMatch) {
      const instruction = instructionMatch[1];
      if (instruction in MODELFILE_INSTRUCTIONS) {
        tokens.push({ type: 'instruction', value: instruction });
        
        const rest = trimmed.slice(instruction.length).trim();
        
        // Special handling for different instructions
        if (instruction === 'PARAMETER' && rest) {
          const paramMatch = rest.match(/^(\w+)\s+(.*)/);
          if (paramMatch) {
            tokens.push({ type: 'parameter', value: ' ' + paramMatch[1] });
            tokens.push({ type: 'value', value: ' ' + paramMatch[2] });
          } else {
            tokens.push({ type: 'text', value: ' ' + rest });
          }
        } else if (instruction === 'FROM' && rest) {
          tokens.push({ type: 'value', value: ' ' + rest });
        } else if (rest.startsWith('"""') || rest.includes('"""')) {
          tokens.push({ type: 'string', value: ' ' + rest });
        } else if (rest) {
          tokens.push({ type: 'text', value: ' ' + rest });
        }
        
        return tokens;
      }
    }

    // Check if line is inside a multi-line string
    if (line.includes('"""')) {
      return [{ type: 'string', value: line }];
    }

    return [{ type: 'text', value: line }];
  }, []);

  // Validate Modelfile content
  const validateContent = useCallback((text: string): ValidationError[] => {
    const validationErrors: ValidationError[] = [];
    const lines = text.split('\n');
    let hasFrom = false;
    let inMultilineString = false;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      // Track multi-line strings
      const tripleQuotes = (trimmed.match(/"""/g) || []).length;
      if (tripleQuotes % 2 === 1) {
        inMultilineString = !inMultilineString;
      }

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#') || inMultilineString) {
        return;
      }

      // Check for valid instruction
      const instructionMatch = trimmed.match(/^([A-Z]+)/);
      if (instructionMatch) {
        const instruction = instructionMatch[1];
        
        if (instruction === 'FROM') {
          hasFrom = true;
          const modelName = trimmed.slice(4).trim();
          if (!modelName) {
            validationErrors.push({
              line: lineNumber,
              message: 'FROM instruction requires a model name',
              severity: 'error',
            });
          }
        } else if (instruction === 'PARAMETER') {
          const paramMatch = trimmed.slice(9).trim().match(/^(\w+)\s+(.*)/);
          if (!paramMatch) {
            validationErrors.push({
              line: lineNumber,
              message: 'PARAMETER instruction requires a name and value',
              severity: 'error',
            });
          } else {
            const paramName = paramMatch[1];
            const knownParam = AVAILABLE_PARAMETERS.find(p => p.name === paramName);
            if (!knownParam) {
              validationErrors.push({
                line: lineNumber,
                message: `Unknown parameter: ${paramName}`,
                severity: 'warning',
              });
            }
          }
        } else if (!(instruction in MODELFILE_INSTRUCTIONS)) {
          validationErrors.push({
            line: lineNumber,
            message: `Unknown instruction: ${instruction}`,
            severity: 'error',
          });
        }
      } else if (trimmed && !inMultilineString) {
        validationErrors.push({
          line: lineNumber,
          message: 'Line must start with a valid instruction or be inside a multi-line string',
          severity: 'warning',
        });
      }
    });

    // Check for required FROM instruction
    if (!hasFrom && text.trim()) {
      validationErrors.unshift({
        line: 1,
        message: 'Modelfile must contain a FROM instruction',
        severity: 'error',
      });
    }

    return validationErrors;
  }, []);

  // Highlight lines for display
  const highlightedLines = useMemo((): HighlightedLine[] => {
    return content.split('\n').map((line, index) => ({
      lineNumber: index + 1,
      content: line,
      tokens: tokenizeLine(line),
    }));
  }, [content, tokenizeLine]);

  // Auto-validate on content change
  useEffect(() => {
    if (autoValidate) {
      const validationErrors = validateContent(content);
      setErrors(validationErrors);
    }
  }, [content, autoValidate, validateContent]);

  // Handle content change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
  }, [onChange]);

  // Handle save
  const handleSave = useCallback(() => {
    const validationErrors = validateContent(content);
    if (validationErrors.some(e => e.severity === 'error')) {
      message.error('Please fix errors before saving');
      return;
    }
    onSave?.(content);
    message.success('Modelfile saved successfully');
  }, [content, onSave, validateContent]);

  // Handle copy to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    message.success('Copied to clipboard');
  }, [content]);

  // Handle download
  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Modelfile';
    a.click();
    URL.revokeObjectURL(url);
    message.success('Modelfile downloaded');
  }, [content]);

  // Handle upload
  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setContent(text);
          onChange?.(text);
          message.success('Modelfile loaded');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [onChange]);

  // Insert instruction at cursor
  const insertInstruction = useCallback((instruction: string) => {
    const info = MODELFILE_INSTRUCTIONS[instruction as keyof typeof MODELFILE_INSTRUCTIONS];
    const insertText = info?.example || instruction;
    
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + insertText + '\n' + content.slice(end);
      setContent(newContent);
      onChange?.(newContent);
      
      // Move cursor after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insertText.length + 1;
        textarea.focus();
      }, 0);
    }
  }, [content, onChange]);

  // Insert parameter snippet
  const insertParameter = useCallback((param: typeof AVAILABLE_PARAMETERS[0]) => {
    const insertText = `PARAMETER ${param.name} ${param.default ?? ''}`;
    
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + insertText + '\n' + content.slice(end);
      setContent(newContent);
      onChange?.(newContent);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insertText.length + 1;
        textarea.focus();
      }, 0);
    }
  }, [content, onChange]);

  // Instruction menu items
  const instructionMenuItems = Object.entries(MODELFILE_INSTRUCTIONS).map(([key, value]) => ({
    key,
    label: (
      <div>
        <Text strong>{key}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>{value.description}</Text>
      </div>
    ),
    onClick: () => insertInstruction(key),
  }));

  // Parameter menu items
  const parameterMenuItems = AVAILABLE_PARAMETERS.map(param => ({
    key: param.name,
    label: (
      <div>
        <Text strong>{param.name}</Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          ({param.type}, default: {param.default ?? 'none'})
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>{param.description}</Text>
      </div>
    ),
    onClick: () => insertParameter(param),
  }));

  // Render token with appropriate styling
  const renderToken = (token: HighlightedLine['tokens'][0], index: number) => {
    const styles: Record<string, React.CSSProperties> = {
      instruction: { color: '#c678dd', fontWeight: 'bold' },
      parameter: { color: '#e5c07b' },
      value: { color: '#98c379' },
      string: { color: '#98c379' },
      comment: { color: '#5c6370', fontStyle: 'italic' },
      text: { color: '#abb2bf' },
    };

    return (
      <span key={index} style={styles[token.type]}>
        {token.value}
      </span>
    );
  };

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <Card
      title={
        <Space>
          <CodeOutlined />
          <span>Modelfile Editor</span>
          {errorCount > 0 && (
            <Tag color="error">
              <WarningOutlined /> {errorCount} error{errorCount > 1 ? 's' : ''}
            </Tag>
          )}
          {warningCount > 0 && (
            <Tag color="warning">
              <InfoCircleOutlined /> {warningCount} warning{warningCount > 1 ? 's' : ''}
            </Tag>
          )}
          {errorCount === 0 && warningCount === 0 && content.trim() && (
            <Tag color="success">
              <CheckCircleOutlined /> Valid
            </Tag>
          )}
        </Space>
      }
      extra={
        <Space>
          <Dropdown menu={{ items: instructionMenuItems }} trigger={['click']}>
            <Button icon={<PlusOutlined />} disabled={readOnly}>
              Insert Instruction
            </Button>
          </Dropdown>
          <Dropdown menu={{ items: parameterMenuItems }} trigger={['click']}>
            <Button disabled={readOnly}>
              Add Parameter
            </Button>
          </Dropdown>
          <Tooltip title="Help">
            <Button icon={<BulbOutlined />} onClick={() => setShowHelp(true)} />
          </Tooltip>
          <Tooltip title="Copy">
            <Button icon={<CopyOutlined />} onClick={handleCopy} />
          </Tooltip>
          <Tooltip title="Download">
            <Button icon={<DownloadOutlined />} onClick={handleDownload} />
          </Tooltip>
          <Tooltip title="Upload">
            <Button icon={<UploadOutlined />} onClick={handleUpload} disabled={readOnly} />
          </Tooltip>
          {onSave && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={readOnly || errorCount > 0}
            >
              Save
            </Button>
          )}
        </Space>
      }
    >
      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert
          message={`${errors.length} issue${errors.length > 1 ? 's' : ''} found`}
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errors.slice(0, 5).map((error, idx) => (
                <li key={idx}>
                  <Text type={error.severity === 'error' ? 'danger' : 'warning'}>
                    Line {error.line}: {error.message}
                  </Text>
                </li>
              ))}
              {errors.length > 5 && (
                <li>
                  <Text type="secondary">...and {errors.length - 5} more</Text>
                </li>
              )}
            </ul>
          }
          type={errorCount > 0 ? 'error' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Editor */}
      <Row gutter={0}>
        {/* Line Numbers */}
        {showLineNumbers && (
          <Col
            style={{
              background: '#282c34',
              color: '#5c6370',
              padding: '12px 8px',
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              textAlign: 'right',
              userSelect: 'none',
              fontFamily: 'monospace',
              fontSize: 14,
              lineHeight: '1.5em',
              height: typeof height === 'number' ? height : undefined,
              minHeight: typeof height === 'string' ? height : undefined,
              overflow: 'hidden',
            }}
          >
            {highlightedLines.map((line) => (
              <div
                key={line.lineNumber}
                style={{
                  color: errors.some(e => e.line === line.lineNumber)
                    ? '#e06c75'
                    : cursorLine === line.lineNumber
                    ? '#abb2bf'
                    : '#5c6370',
                }}
              >
                {line.lineNumber}
              </div>
            ))}
          </Col>
        )}

        {/* Code Display (Overlay) */}
        <Col flex="1" style={{ position: 'relative' }}>
          {/* Syntax highlighted display */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#282c34',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: 14,
              lineHeight: '1.5em',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'auto',
              pointerEvents: 'none',
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              borderTopLeftRadius: showLineNumbers ? 0 : 8,
              borderBottomLeftRadius: showLineNumbers ? 0 : 8,
            }}
          >
            {highlightedLines.map((line) => (
              <div key={line.lineNumber}>
                {line.tokens.map(renderToken)}
                {line.tokens.length === 0 && '\u00A0'}
              </div>
            ))}
          </div>

          {/* Actual textarea (transparent, for editing) */}
          <TextArea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            disabled={readOnly}
            style={{
              position: 'relative',
              background: 'transparent',
              color: 'transparent',
              caretColor: '#528bff',
              fontFamily: 'monospace',
              fontSize: 14,
              lineHeight: '1.5em',
              padding: '12px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              height: typeof height === 'number' ? height : undefined,
              minHeight: typeof height === 'string' ? height : undefined,
            }}
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement;
              const textBeforeCursor = content.slice(0, target.selectionStart);
              const lineNumber = textBeforeCursor.split('\n').length;
              setCursorLine(lineNumber);
            }}
          />
        </Col>
      </Row>

      {/* Help Modal */}
      <Modal
        title="Modelfile Reference"
        open={showHelp}
        onCancel={() => setShowHelp(false)}
        footer={[
          <Button key="close" onClick={() => setShowHelp(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <Title level={4}>Instructions</Title>
        {Object.entries(MODELFILE_INSTRUCTIONS).map(([name, info]) => (
          <div key={name} style={{ marginBottom: 16 }}>
            <Text strong>{name}</Text>
            {info.required && <Tag color="red" style={{ marginLeft: 8 }}>Required</Tag>}
            <Paragraph type="secondary" style={{ margin: '4px 0' }}>
              {info.description}
            </Paragraph>
            <Text code>{info.syntax}</Text>
            <br />
            <Text type="secondary">Example: </Text>
            <Text code>{info.example}</Text>
          </div>
        ))}

        <Title level={4} style={{ marginTop: 24 }}>Parameters</Title>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {AVAILABLE_PARAMETERS.map(param => (
            <div key={param.name} style={{ padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
              <Text strong>{param.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>({param.type})</Text>
              <br />
              <Text type="secondary">{param.description}</Text>
              {param.default !== undefined && (
                <Text type="secondary"> Default: {param.default}</Text>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </Card>
  );
};

export default ModelfileEditor;

/**
 * VSCode Computer Use Component
 * 
 * Provides programmatic control over VSCode IDE through Storybook interface.
 * Enables file operations, code editing, terminal commands, and Git operations.
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Input, Select, message, Tabs, Space, Typography, Tag } from 'antd';
import {
  FileOutlined,
  CodeOutlined,
  TerminalOutlined,
  GitlabOutlined,
  BugOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export interface VSCodeComputerUseProps {
  /** Enable mock mode for safe testing */
  mockMode?: boolean;
  /** VSCode workspace path */
  workspacePath?: string;
  /** Callback when operation completes */
  onOperationComplete?: (operation: string, result: any) => void;
}

interface FileOperation {
  type: 'create' | 'read' | 'update' | 'delete';
  path: string;
  content?: string;
}

interface GitOperation {
  type: 'status' | 'add' | 'commit' | 'push' | 'pull';
  params?: Record<string, any>;
}

export const VSCodeComputerUse: React.FC<VSCodeComputerUseProps> = ({
  mockMode = true,
  workspacePath = '/workspace',
  onOperationComplete,
}) => {
  const [activeTab, setActiveTab] = useState('files');
  const [operation, setOperation] = useState<any>({});
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // File Operations
  const handleFileOperation = useCallback(async (op: FileOperation) => {
    setLoading(true);
    try {
      if (mockMode) {
        // Mock implementation
        const mockResult = {
          success: true,
          operation: op.type,
          path: op.path,
          message: `Mock: ${op.type} operation on ${op.path}`,
        };
        setResult(JSON.stringify(mockResult, null, 2));
        message.success(`Mock ${op.type} operation completed`);
        onOperationComplete?.(op.type, mockResult);
      } else {
        // Real VSCode API implementation would go here
        // This would use VSCode Extension API or Language Server Protocol
        const vscodeResult = await executeVSCodeFileOperation(op);
        setResult(JSON.stringify(vscodeResult, null, 2));
        message.success(`${op.type} operation completed`);
        onOperationComplete?.(op.type, vscodeResult);
      }
    } catch (error: any) {
      message.error(`Operation failed: ${error.message}`);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [mockMode, onOperationComplete]);

  // Terminal Operations
  const handleTerminalCommand = useCallback(async (command: string) => {
    setLoading(true);
    try {
      if (mockMode) {
        const mockOutput = `Mock terminal output for: ${command}\n✓ Command executed successfully`;
        setResult(mockOutput);
        message.success('Mock command executed');
        onOperationComplete?.('terminal', { command, output: mockOutput });
      } else {
        // Real terminal execution
        const output = await executeTerminalCommand(command);
        setResult(output);
        message.success('Command executed');
        onOperationComplete?.('terminal', { command, output });
      }
    } catch (error: any) {
      message.error(`Command failed: ${error.message}`);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [mockMode, onOperationComplete]);

  // Git Operations
  const handleGitOperation = useCallback(async (op: GitOperation) => {
    setLoading(true);
    try {
      if (mockMode) {
        const mockGitResult = {
          operation: op.type,
          success: true,
          message: `Mock git ${op.type} completed`,
        };
        setResult(JSON.stringify(mockGitResult, null, 2));
        message.success(`Mock git ${op.type} completed`);
        onOperationComplete?.(`git-${op.type}`, mockGitResult);
      } else {
        const gitResult = await executeGitOperation(op);
        setResult(JSON.stringify(gitResult, null, 2));
        message.success(`Git ${op.type} completed`);
        onOperationComplete?.(`git-${op.type}`, gitResult);
      }
    } catch (error: any) {
      message.error(`Git operation failed: ${error.message}`);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [mockMode, onOperationComplete]);

  const items = [
    {
      key: 'files',
      label: (
        <span>
          <FileOutlined />
          File Operations
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>File Operation</Title>
            <Select
              style={{ width: '100%', marginBottom: 16 }}
              placeholder="Select operation"
              onChange={(value) => setOperation({ ...operation, type: value })}
            >
              <Option value="create">Create File</Option>
              <Option value="read">Read File</Option>
              <Option value="update">Update File</Option>
              <Option value="delete">Delete File</Option>
            </Select>
            
            <Input
              placeholder="File path (e.g., src/components/Button.tsx)"
              style={{ marginBottom: 16 }}
              onChange={(e) => setOperation({ ...operation, path: e.target.value })}
              prefix={<FileOutlined />}
            />
            
            {(operation.type === 'create' || operation.type === 'update') && (
              <TextArea
                placeholder="File content"
                rows={10}
                style={{ marginBottom: 16 }}
                onChange={(e) => setOperation({ ...operation, content: e.target.value })}
              />
            )}
            
            <Button
              type="primary"
              loading={loading}
              onClick={() => handleFileOperation(operation)}
              disabled={!operation.type || !operation.path}
            >
              Execute File Operation
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: 'terminal',
      label: (
        <span>
          <TerminalOutlined />
          Terminal
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>Terminal Command</Title>
            <Input
              placeholder="Enter command (e.g., npm install, npm run build)"
              style={{ marginBottom: 16 }}
              onPressEnter={(e) => handleTerminalCommand(e.currentTarget.value)}
              prefix={<TerminalOutlined />}
            />
            <Text type="secondary">
              Press Enter to execute or use quick commands below
            </Text>
          </div>

          <div>
            <Title level={5}>Quick Commands</Title>
            <Space wrap>
              <Button onClick={() => handleTerminalCommand('npm install')}>
                npm install
              </Button>
              <Button onClick={() => handleTerminalCommand('npm run build')}>
                npm run build
              </Button>
              <Button onClick={() => handleTerminalCommand('npm test')}>
                npm test
              </Button>
              <Button onClick={() => handleTerminalCommand('npm run lint')}>
                npm run lint
              </Button>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      key: 'git',
      label: (
        <span>
          <GitlabOutlined />
          Git
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>Git Operations</Title>
            <Space wrap>
              <Button
                icon={<GitlabOutlined />}
                onClick={() => handleGitOperation({ type: 'status' })}
              >
                Git Status
              </Button>
              <Button
                icon={<GitlabOutlined />}
                onClick={() => handleGitOperation({ type: 'add', params: { files: '.' } })}
              >
                Git Add All
              </Button>
            </Space>
          </div>

          <div>
            <Title level={5}>Commit</Title>
            <Input
              placeholder="Commit message"
              style={{ marginBottom: 16 }}
              onChange={(e) => setOperation({ ...operation, commitMessage: e.target.value })}
            />
            <Button
              type="primary"
              onClick={() =>
                handleGitOperation({
                  type: 'commit',
                  params: { message: operation.commitMessage },
                })
              }
              disabled={!operation.commitMessage}
            >
              Commit Changes
            </Button>
          </div>

          <div>
            <Title level={5}>Remote Operations</Title>
            <Space>
              <Button onClick={() => handleGitOperation({ type: 'push' })}>
                Git Push
              </Button>
              <Button onClick={() => handleGitOperation({ type: 'pull' })}>
                Git Pull
              </Button>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      key: 'debug',
      label: (
        <span>
          <BugOutlined />
          Debug
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5}>Debug Session</Title>
          <Text type="secondary">
            Debug session control (coming soon)
          </Text>
        </Space>
      ),
    },
    {
      key: 'extensions',
      label: (
        <span>
          <SettingOutlined />
          Extensions
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5}>Extension Management</Title>
          <Text type="secondary">
            Extension installation and management (coming soon)
          </Text>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <CodeOutlined />
          <span>VSCode Computer Use</span>
          {mockMode && <Tag color="orange">Mock Mode</Tag>}
        </Space>
      }
      extra={
        <Space>
          <Text type="secondary">{workspacePath}</Text>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />

      {/* Result Display */}
      {result && (
        <Card
          title="Operation Result"
          style={{ marginTop: 24 }}
          size="small"
        >
          <pre style={{ maxHeight: 400, overflow: 'auto' }}>
            <code>{result}</code>
          </pre>
        </Card>
      )}
    </Card>
  );
};

// Mock implementation functions (would be replaced with real VSCode API calls)

async function executeVSCodeFileOperation(op: FileOperation): Promise<any> {
  // This would use VSCode Extension API
  // For example: vscode.workspace.fs.writeFile()
  return {
    success: true,
    operation: op.type,
    path: op.path,
  };
}

async function executeTerminalCommand(command: string): Promise<string> {
  // This would use VSCode Terminal API
  // For example: vscode.window.createTerminal().sendText(command)
  return `Executing: ${command}\n...`;
}

async function executeGitOperation(op: GitOperation): Promise<any> {
  // This would use VSCode Git extension API
  return {
    success: true,
    operation: op.type,
  };
}

export default VSCodeComputerUse;

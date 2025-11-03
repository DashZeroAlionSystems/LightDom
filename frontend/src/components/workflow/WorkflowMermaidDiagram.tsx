/**
 * Real-time Mermaid Workflow Diagram
 * 
 * Features:
 * - Real-time Mermaid chart rendering
 * - Process status indicators (green = running, red = stopped, orange = idle)
 * - Highlights currently executing step
 * - Interactive node selection
 * - Auto-refresh on status changes
 */

import React, { useEffect, useRef, useState } from 'react';
import { Select, Button, Space, Alert, Spin, Tag } from 'antd';
import { PlayCircleOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';

interface WorkflowStatus {
  name: string;
  status: 'running' | 'stopped' | 'idle';
  currentStep?: string;
  progress?: number;
}

interface Props {
  workflows: WorkflowStatus[];
  selectedWorkflow: string | null;
  onSelectWorkflow: (name: string) => void;
  onExecute: (name: string) => void;
  onStop: (name: string) => void;
  darkMode: boolean;
}

const WorkflowMermaidDiagram: React.FC<Props> = ({
  workflows,
  selectedWorkflow,
  onSelectWorkflow,
  onExecute,
  onStop,
  darkMode
}) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mermaidCode, setMermaidCode] = useState('');
  const [renderedSvg, setRenderedSvg] = useState('');

  // Load selected workflow data
  useEffect(() => {
    if (selectedWorkflow) {
      loadWorkflowData(selectedWorkflow);
    }
  }, [selectedWorkflow]);

  // Render Mermaid diagram whenever workflow data or status changes
  useEffect(() => {
    if (workflowData) {
      generateMermaidDiagram();
    }
  }, [workflowData, workflows]);

  const loadWorkflowData = async (name: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflow-generator/config/${name}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflowData(data);
      }
    } catch (error) {
      console.error('Failed to load workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMermaidDiagram = () => {
    if (!workflowData) return;

    const workflow = workflows.find(w => w.name === selectedWorkflow);
    const status = workflow?.status || 'idle';
    const currentStep = workflow?.currentStep;

    // Generate Mermaid flowchart syntax
    let diagram = 'graph TD\n';
    diagram += '    Start([Start]) --> Setup[Setup]\n';

    // Add workflow steps
    if (workflowData.dashboards && workflowData.dashboards.length > 0) {
      workflowData.dashboards.forEach((dashboard: any, idx: number) => {
        const stepId = `Step${idx + 1}`;
        const stepName = dashboard.name || `Step ${idx + 1}`;
        
        // Highlight current step with status color
        let stepStyle = '';
        if (currentStep === stepId && status === 'running') {
          stepStyle = ':::runningStep';
        } else if (status === 'stopped') {
          stepStyle = ':::stoppedStep';
        } else {
          stepStyle = ':::idleStep';
        }

        diagram += `    ${idx === 0 ? 'Setup' : 'Step' + idx} --> ${stepId}[${stepName}]${stepStyle}\n`;
      });

      diagram += `    Step${workflowData.dashboards.length} --> End([End])\n`;
    } else {
      diagram += '    Setup --> End([End])\n';
    }

    // Add styling classes
    diagram += '\n    classDef runningStep fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff\n';
    diagram += '    classDef stoppedStep fill:#ef4444,stroke:#dc2626,stroke-width:3px,color:#fff\n';
    diagram += '    classDef idleStep fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff\n';

    setMermaidCode(diagram);
    renderMermaid(diagram);
  };

  const renderMermaid = async (code: string) => {
    // Simple SVG rendering fallback (Mermaid requires dynamic import)
    try {
      // Check if mermaid is available
      if (typeof window !== 'undefined' && (window as any).mermaid) {
        const { default: mermaid } = await import('mermaid');
        
        mermaid.initialize({
          startOnLoad: false,
          theme: darkMode ? 'dark' : 'default',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        });

        const { svg } = await mermaid.render('mermaid-diagram', code);
        setRenderedSvg(svg);
      } else {
        // Fallback: Display code
        console.log('Mermaid not loaded, displaying code');
      }
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      // Fallback: display the code
    }
  };

  const handleRefresh = () => {
    if (selectedWorkflow) {
      loadWorkflowData(selectedWorkflow);
    }
  };

  const currentWorkflow = workflows.find(w => w.name === selectedWorkflow);
  const statusColor = {
    running: 'green',
    stopped: 'red',
    idle: 'orange'
  }[currentWorkflow?.status || 'idle'];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Space>
          <Select
            style={{ width: 300 }}
            placeholder="Select workflow"
            value={selectedWorkflow}
            onChange={onSelectWorkflow}
            options={workflows.map(w => ({
              label: (
                <span>
                  {w.name}
                  <Tag color={statusColor} className="ml-2">
                    {w.status}
                  </Tag>
                </span>
              ),
              value: w.name
            }))}
          />
          {currentWorkflow && (
            <Tag color={statusColor} className="text-sm">
              <span className="inline-block w-2 h-2 rounded-full mr-2" 
                    style={{ 
                      backgroundColor: statusColor,
                      animation: currentWorkflow.status === 'running' ? 'pulse 2s infinite' : 'none'
                    }} 
              />
              {currentWorkflow.status.toUpperCase()}
            </Tag>
          )}
        </Space>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
          {selectedWorkflow && currentWorkflow && (
            <>
              {currentWorkflow.status !== 'running' ? (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={() => onExecute(selectedWorkflow)}
                >
                  Execute
                </Button>
              ) : (
                <Button 
                  danger
                  icon={<StopOutlined />}
                  onClick={() => onStop(selectedWorkflow)}
                >
                  Stop
                </Button>
              )}
            </>
          )}
        </Space>
      </div>

      {/* Diagram */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      ) : selectedWorkflow && workflowData ? (
        <div>
          {/* Real-time Status Indicator */}
          {currentWorkflow && (
            <Alert
              message={
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" 
                        style={{ 
                          backgroundColor: statusColor,
                          animation: currentWorkflow.status === 'running' ? 'pulse 2s infinite' : 'none'
                        }} 
                  />
                  Workflow Status: {currentWorkflow.status.toUpperCase()}
                  {currentWorkflow.progress !== undefined && (
                    <span className="ml-3">Progress: {currentWorkflow.progress}%</span>
                  )}
                </div>
              }
              type={currentWorkflow.status === 'running' ? 'success' : 
                    currentWorkflow.status === 'stopped' ? 'error' : 'warning'}
              className="mb-4"
            />
          )}

          {/* Mermaid Diagram */}
          <div 
            ref={mermaidRef}
            className={`border rounded-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            style={{ minHeight: '400px' }}
          >
            {renderedSvg ? (
              <div dangerouslySetInnerHTML={{ __html: renderedSvg }} />
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Workflow Diagram</h3>
                <pre className="text-left bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto">
                  <code>{mermaidCode}</code>
                </pre>
                <p className="mt-4 text-gray-500">
                  Mermaid diagram will render here once the library is loaded
                </p>
              </div>
            )}
          </div>

          {/* Workflow Info */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="text-sm text-gray-500">Total Steps</div>
              <div className="text-2xl font-bold">
                {workflowData.dashboards?.length || 0}
              </div>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="text-sm text-gray-500">Components</div>
              <div className="text-2xl font-bold">
                {workflowData.components?.length || 0}
              </div>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="text-sm text-gray-500">Atoms</div>
              <div className="text-2xl font-bold">
                {workflowData.atoms?.length || 0}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Select a workflow to view its diagram
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default WorkflowMermaidDiagram;

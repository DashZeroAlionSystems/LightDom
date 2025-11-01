/**
 * SVG Graphics Generator
 * 
 * Generate SVG graphics by prompt with schema linking
 * Features:
 * - AI-powered SVG generation from text prompts
 * - Schema-linked graphics (icons, component placeholders)
 * - SVG library integration (@svgdotjs/svg.js)
 * - Export to various formats
 * - Real-time preview
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Select, Space, message, Tabs, Row, Col, Tag, Upload } from 'antd';
import { 
  PictureOutlined, 
  DownloadOutlined, 
  LinkOutlined,
  ExperimentOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface GeneratedGraphic {
  id: string;
  name: string;
  svg: string;
  prompt: string;
  linkedTo?: string;
  createdAt: string;
}

interface Props {
  darkMode: boolean;
}

const SVGGraphicsGenerator: React.FC<Props> = ({ darkMode }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [graphics, setGraphics] = useState<GeneratedGraphic[]>([]);
  const [selectedGraphic, setSelectedGraphic] = useState<string | null>(null);
  const [graphicType, setGraphicType] = useState('icon');
  const [linkedComponent, setLinkedComponent] = useState<string>('');

  const graphicTypes = [
    { value: 'icon', label: 'Icon' },
    { value: 'diagram', label: 'Diagram' },
    { value: 'chart', label: 'Chart' },
    { value: 'flowchart', label: 'Flowchart' },
    { value: 'infographic', label: 'Infographic' },
    { value: 'logo', label: 'Logo' },
    { value: 'illustration', label: 'Illustration' }
  ];

  const promptTemplates = [
    'Create a modern workflow icon with connected nodes',
    'Generate a database schema diagram with 3 tables',
    'Design a status indicator icon with green/red/orange states',
    'Create a process flowchart with 5 steps',
    'Generate a data visualization chart icon',
    'Design a settings gear icon with gradient'
  ];

  const handleGenerateGraphic = async () => {
    if (!prompt.trim()) {
      message.warning('Please enter a prompt');
      return;
    }

    setGenerating(true);
    try {
      // Simulate AI generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate simple SVG based on type
      const svg = generateSVG(graphicType, prompt);

      const newGraphic: GeneratedGraphic = {
        id: `graphic-${Date.now()}`,
        name: `${graphicType}-${graphics.length + 1}`,
        svg,
        prompt,
        linkedTo: linkedComponent || undefined,
        createdAt: new Date().toISOString()
      };

      setGraphics([newGraphic, ...graphics]);
      setSelectedGraphic(newGraphic.id);
      message.success('Graphic generated successfully!');
    } catch (error) {
      console.error('Failed to generate graphic:', error);
      message.error('Failed to generate graphic');
    } finally {
      setGenerating(false);
    }
  };

  const generateSVG = (type: string, description: string): string => {
    // Generate different SVG types
    switch (type) {
      case 'icon':
        return `
          <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="15" fill="${darkMode ? '#374151' : '#3b82f6'}" />
            <circle cx="50" cy="50" r="30" fill="${darkMode ? '#1f2937' : '#60a5fa'}" />
            <path d="M 50 30 L 60 50 L 50 70 L 40 50 Z" fill="${darkMode ? '#111827' : '#2563eb'}" />
            <text x="50" y="90" text-anchor="middle" fill="white" font-size="12">${type}</text>
          </svg>
        `;

      case 'diagram':
        return `
          <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="80" height="60" rx="5" fill="${darkMode ? '#374151' : '#3b82f6'}" stroke="white" stroke-width="2" />
            <rect x="110" y="10" width="80" height="60" rx="5" fill="${darkMode ? '#374151' : '#10b981'}" stroke="white" stroke-width="2" />
            <rect x="210" y="10" width="80" height="60" rx="5" fill="${darkMode ? '#374151' : '#f59e0b'}" stroke="white" stroke-width="2" />
            <line x1="90" y1="40" x2="110" y2="40" stroke="white" stroke-width="2" marker-end="url(#arrowhead)" />
            <line x1="190" y1="40" x2="210" y2="40" stroke="white" stroke-width="2" marker-end="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="white" />
              </marker>
            </defs>
            <text x="50" y="45" text-anchor="middle" fill="white" font-size="14">Step 1</text>
            <text x="150" y="45" text-anchor="middle" fill="white" font-size="14">Step 2</text>
            <text x="250" y="45" text-anchor="middle" fill="white" font-size="14">Step 3</text>
          </svg>
        `;

      case 'flowchart':
        return `
          <svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="30" rx="60" ry="25" fill="${darkMode ? '#374151' : '#3b82f6'}" stroke="white" stroke-width="2" />
            <rect x="50" y="80" width="100" height="50" fill="${darkMode ? '#374151' : '#10b981'}" stroke="white" stroke-width="2" />
            <polygon points="100,160 150,190 100,220 50,190" fill="${darkMode ? '#374151' : '#f59e0b'}" stroke="white" stroke-width="2" />
            <ellipse cx="100" cy="270" rx="60" ry="25" fill="${darkMode ? '#374151' : '#ef4444'}" stroke="white" stroke-width="2" />
            <line x1="100" y1="55" x2="100" y2="80" stroke="white" stroke-width="2" />
            <line x1="100" y1="130" x2="100" y2="160" stroke="white" stroke-width="2" />
            <line x1="100" y1="220" x2="100" y2="245" stroke="white" stroke-width="2" />
            <text x="100" y="35" text-anchor="middle" fill="white" font-size="12">Start</text>
            <text x="100" y="110" text-anchor="middle" fill="white" font-size="12">Process</text>
            <text x="100" y="195" text-anchor="middle" fill="white" font-size="12">Decision</text>
            <text x="100" y="275" text-anchor="middle" fill="white" font-size="12">End</text>
          </svg>
        `;

      case 'chart':
        return `
          <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="150" width="40" height="40" fill="${darkMode ? '#374151' : '#3b82f6'}" />
            <rect x="110" y="100" width="40" height="90" fill="${darkMode ? '#374151' : '#10b981'}" />
            <rect x="170" y="70" width="40" height="120" fill="${darkMode ? '#374151' : '#f59e0b'}" />
            <rect x="230" y="120" width="40" height="70" fill="${darkMode ? '#374151' : '#ef4444'}" />
            <line x1="30" y1="190" x2="280" y2="190" stroke="white" stroke-width="2" />
            <line x1="30" y1="30" x2="30" y2="190" stroke="white" stroke-width="2" />
          </svg>
        `;

      default:
        return `
          <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="75" r="70" fill="${darkMode ? '#374151' : '#3b82f6'}" />
            <text x="75" y="85" text-anchor="middle" fill="white" font-size="24" font-weight="bold">SVG</text>
          </svg>
        `;
    }
  };

  const handleDownloadSVG = (graphic: GeneratedGraphic) => {
    const blob = new Blob([graphic.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${graphic.name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('SVG downloaded successfully');
  };

  const handleLinkToComponent = async () => {
    if (!selectedGraphic || !linkedComponent) {
      message.warning('Select a graphic and component to link');
      return;
    }

    const graphic = graphics.find(g => g.id === selectedGraphic);
    if (graphic) {
      setGraphics(graphics.map(g => 
        g.id === selectedGraphic ? { ...g, linkedTo: linkedComponent } : g
      ));
      message.success(`Graphic linked to ${linkedComponent}`);
    }
  };

  const currentGraphic = graphics.find(g => g.id === selectedGraphic);

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        {/* Generation Panel */}
        <Col span={12}>
          <Card title="Generate SVG Graphics" size="small">
            <Space direction="vertical" className="w-full">
              <Select
                style={{ width: '100%' }}
                placeholder="Select graphic type"
                value={graphicType}
                onChange={setGraphicType}
                options={graphicTypes}
              />

              <TextArea
                rows={4}
                placeholder="Describe the graphic you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex flex-wrap gap-2">
                {promptTemplates.map((template, idx) => (
                  <Tag
                    key={idx}
                    className="cursor-pointer"
                    onClick={() => setPrompt(template)}
                  >
                    {template.substring(0, 30)}...
                  </Tag>
                ))}
              </div>

              <Button
                type="primary"
                size="large"
                block
                loading={generating}
                icon={<ExperimentOutlined />}
                onClick={handleGenerateGraphic}
              >
                Generate Graphic
              </Button>
            </Space>
          </Card>

          {/* Schema Linking */}
          <Card title="Schema Linking" size="small" className="mt-4">
            <Space direction="vertical" className="w-full">
              <Input
                placeholder="Component ID or field name"
                value={linkedComponent}
                onChange={(e) => setLinkedComponent(e.target.value)}
                addonBefore={<LinkOutlined />}
              />

              <Button
                block
                onClick={handleLinkToComponent}
                disabled={!selectedGraphic}
              >
                Link to Component
              </Button>

              {currentGraphic?.linkedTo && (
                <Tag color="green">
                  Linked to: {currentGraphic.linkedTo}
                </Tag>
              )}
            </Space>
          </Card>
        </Col>

        {/* Preview Panel */}
        <Col span={12}>
          <Card 
            title="Preview" 
            size="small"
            extra={
              currentGraphic && (
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadSVG(currentGraphic)}
                >
                  Download
                </Button>
              )
            }
          >
            <div 
              ref={svgContainerRef}
              className={`border rounded p-6 min-h-[300px] flex items-center justify-center ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'
              }`}
            >
              {currentGraphic ? (
                <div dangerouslySetInnerHTML={{ __html: currentGraphic.svg }} />
              ) : (
                <div className="text-center text-gray-400">
                  <PictureOutlined style={{ fontSize: 48 }} />
                  <div className="mt-2">Generate a graphic to see preview</div>
                </div>
              )}
            </div>

            {currentGraphic && (
              <div className="mt-4 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{currentGraphic.name}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Type:</span>
                  <Tag className="ml-2">{graphicType}</Tag>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Prompt:</span>
                  <div className="mt-1 text-xs">{currentGraphic.prompt}</div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Generated Graphics Library */}
      <Card title={<span><AppstoreOutlined /> Graphics Library</span>}>
        <Row gutter={[16, 16]}>
          {graphics.map((graphic) => (
            <Col key={graphic.id} span={6}>
              <Card
                size="small"
                hoverable
                className={`cursor-pointer ${selectedGraphic === graphic.id ? 'border-blue-500' : ''}`}
                onClick={() => setSelectedGraphic(graphic.id)}
              >
                <div 
                  className="flex items-center justify-center h-24 mb-2"
                  dangerouslySetInnerHTML={{ __html: graphic.svg }}
                  style={{ transform: 'scale(0.6)' }}
                />
                <div className="text-xs font-medium truncate">{graphic.name}</div>
                {graphic.linkedTo && (
                  <Tag color="green" className="mt-1 text-xs">
                    <LinkOutlined /> {graphic.linkedTo}
                  </Tag>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {graphics.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No graphics generated yet
          </div>
        )}
      </Card>
    </div>
  );
};

export default SVGGraphicsGenerator;

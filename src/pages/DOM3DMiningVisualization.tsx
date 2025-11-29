import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Progress, Statistic, Row, Col, Select, Slider, Badge, Tag, Tooltip, message } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  RedoOutlined,
  DownloadOutlined,
  EyeOutlined,
  RocketOutlined,
  DatabaseOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Option } = Select;

interface DOMNode {
  id: string;
  x: number;
  y: number;
  z: number; // Layer depth
  importance: number; // 0-1 score
  tag: string;
  content: string;
  mined: boolean;
  schemas: string[];
  url?: string;
}

interface MiningStats {
  totalNodes: number;
  minedNodes: number;
  importantNodes: number;
  schemasDetected: number;
  currentDepth: number;
  progress: number;
  timeElapsed: number;
}

const DOM3DMiningVisualization: React.FC = () => {
  const [nodes, setNodes] = useState<DOMNode[]>([]);
  const [isMining, setIsMining] = useState(false);
  const [stats, setStats] = useState<MiningStats>({
    totalNodes: 0,
    minedNodes: 0,
    importantNodes: 0,
    schemasDetected: 0,
    currentDepth: 0,
    progress: 0,
    timeElapsed: 0
  });

  const [selectedNode, setSelectedNode] = useState<DOMNode | null>(null);
  const [miningSpeed, setMiningSpeed] = useState<'fast' | 'medium' | 'slow'>('medium');
  const [maxDepth, setMaxDepth] = useState(5);
  const [importanceThreshold, setImportanceThreshold] = useState(0.4);
  const [currentURL, setCurrentURL] = useState('https://example.com');
  
  const miningInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);

  const demoURLs = [
    'https://example.com',
    'https://shop.example.com/products',
    'https://blog.example.com/articles',
    'https://docs.example.com/api',
    'https://app.example.com/dashboard'
  ];

  const htmlTags = ['div', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'h1', 'h2', 'h3', 'p', 'a', 'img', 'ul', 'li'];
  const schemaTypes = ['Product', 'Article', 'Person', 'Organization', 'LocalBusiness', 'BlogPosting', 'WebPage', 'BreadcrumbList'];

  // Generate initial DOM structure
  useEffect(() => {
    generateDOMStructure();
  }, [maxDepth]);

  const generateDOMStructure = () => {
    const newNodes: DOMNode[] = [];
    let id = 0;

    // Generate nodes in layers (z = depth)
    for (let z = 0; z < maxDepth; z++) {
      const nodesPerLayer = Math.max(20, 100 - z * 10); // Fewer nodes at deeper levels
      
      for (let i = 0; i < nodesPerLayer; i++) {
        const importance = Math.random();
        const hasSchema = importance > 0.6 && Math.random() > 0.7;
        
        newNodes.push({
          id: `node-${id++}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: z,
          importance: importance,
          tag: htmlTags[Math.floor(Math.random() * htmlTags.length)],
          content: `Content ${id}`,
          mined: false,
          schemas: hasSchema ? [schemaTypes[Math.floor(Math.random() * schemaTypes.length)]] : [],
          url: currentURL
        });
      }
    }

    setNodes(newNodes);
    setStats({
      totalNodes: newNodes.length,
      minedNodes: 0,
      importantNodes: newNodes.filter(n => n.importance >= importanceThreshold).length,
      schemasDetected: 0,
      currentDepth: 0,
      progress: 0,
      timeElapsed: 0
    });
    setSelectedNode(null);
  };

  const startMining = () => {
    if (isMining) return;
    
    setIsMining(true);
    startTime.current = Date.now();
    
    const speeds = {
      fast: 100,
      medium: 300,
      slow: 500
    };

    let currentIndex = 0;
    const sortedNodes = [...nodes].sort((a, b) => a.z - b.z || a.x - b.x);

    miningInterval.current = setInterval(() => {
      if (currentIndex >= sortedNodes.length) {
        stopMining();
        message.success('Mining complete!');
        return;
      }

      const node = sortedNodes[currentIndex];
      
      setNodes(prev => prev.map(n => 
        n.id === node.id ? { ...n, mined: true } : n
      ));

      setStats(prev => ({
        ...prev,
        minedNodes: currentIndex + 1,
        schemasDetected: prev.schemasDetected + (node.schemas.length > 0 ? 1 : 0),
        currentDepth: node.z,
        progress: ((currentIndex + 1) / sortedNodes.length) * 100,
        timeElapsed: Math.floor((Date.now() - startTime.current) / 1000)
      }));

      currentIndex++;
    }, speeds[miningSpeed]);
  };

  const stopMining = () => {
    setIsMining(false);
    if (miningInterval.current) {
      clearInterval(miningInterval.current);
      miningInterval.current = null;
    }
  };

  const resetMining = () => {
    stopMining();
    generateDOMStructure();
    message.info('Mining reset');
  };

  const exportData = () => {
    const minedData = nodes.filter(n => n.mined && n.importance >= importanceThreshold);
    const exportObj = {
      url: currentURL,
      timestamp: new Date().toISOString(),
      stats: stats,
      nodes: minedData.map(n => ({
        tag: n.tag,
        importance: n.importance,
        schemas: n.schemas,
        depth: n.z,
        content: n.content
      }))
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dom-mining-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Training data exported!');
  };

  const getNodeColor = (node: DOMNode) => {
    if (!node.mined) return '#374151'; // gray
    if (node.importance >= 0.8) return '#ef4444'; // red - critical
    if (node.importance >= 0.6) return '#f97316'; // orange - high
    if (node.importance >= 0.4) return '#eab308'; // yellow - medium
    return '#3b82f6'; // blue - low
  };

  const getNodeSize = (node: DOMNode) => {
    const baseSize = 8;
    return baseSize + (node.importance * 12);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🎯 3D DOM Mining Visualization
        </h1>
        <p className="text-gray-400">
          Interactive 3D visualization of DOM space mining with real-time data extraction
        </p>
      </div>

      {/* Statistics Overview */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card className="bg-slate-800 border-slate-700">
            <Statistic
              title={<span className="text-gray-400">Total Nodes</span>}
              value={stats.totalNodes}
              prefix={<DatabaseOutlined className="text-blue-400" />}
              valueStyle={{ color: '#60a5fa' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-slate-800 border-slate-700">
            <Statistic
              title={<span className="text-gray-400">Mined Nodes</span>}
              value={stats.minedNodes}
              prefix={<RocketOutlined className="text-green-400" />}
              valueStyle={{ color: '#4ade80' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-slate-800 border-slate-700">
            <Statistic
              title={<span className="text-gray-400">Important Nodes</span>}
              value={stats.importantNodes}
              prefix={<ThunderboltOutlined className="text-orange-400" />}
              valueStyle={{ color: '#fb923c' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-slate-800 border-slate-700">
            <Statistic
              title={<span className="text-gray-400">Schemas Detected</span>}
              value={stats.schemasDetected}
              prefix={<EyeOutlined className="text-purple-400" />}
              valueStyle={{ color: '#c084fc' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card className="mb-6 bg-slate-800 border-slate-700">
        <div className="space-y-4">
          <Row gutter={16}>
            <Col span={8}>
              <div className="mb-2 text-sm text-gray-400">Mining URL</div>
              <Select
                value={currentURL}
                onChange={setCurrentURL}
                className="w-full"
                disabled={isMining}
              >
                {demoURLs.map(url => (
                  <Option key={url} value={url}>{url}</Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <div className="mb-2 text-sm text-gray-400">Mining Speed</div>
              <Select
                value={miningSpeed}
                onChange={setMiningSpeed}
                className="w-full"
                disabled={isMining}
              >
                <Option value="fast">⚡ Fast (100ms)</Option>
                <Option value="medium">🚶 Medium (300ms)</Option>
                <Option value="slow">🐌 Slow (500ms)</Option>
              </Select>
            </Col>
            <Col span={8}>
              <div className="mb-2 text-sm text-gray-400">Max Depth</div>
              <Slider
                min={1}
                max={8}
                value={maxDepth}
                onChange={setMaxDepth}
                disabled={isMining}
                marks={{ 1: '1', 4: '4', 8: '8' }}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-2 text-sm text-gray-400">
                Importance Threshold: {(importanceThreshold * 100).toFixed(0)}%
              </div>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={importanceThreshold}
                onChange={setImportanceThreshold}
                disabled={isMining}
              />
            </Col>
            <Col span={12}>
              <div className="mb-2 text-sm text-gray-400">Mining Progress</div>
              <Progress
                percent={Math.round(stats.progress)}
                status={isMining ? 'active' : 'normal'}
                strokeColor={{
                  '0%': '#9333ea',
                  '100%': '#3b82f6',
                }}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col>
              <Button
                type="primary"
                icon={isMining ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={isMining ? stopMining : startMining}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isMining ? 'Pause Mining' : 'Start Mining'}
              </Button>
            </Col>
            <Col>
              <Button
                icon={<RedoOutlined />}
                onClick={resetMining}
                disabled={isMining}
              >
                Reset
              </Button>
            </Col>
            <Col>
              <Button
                icon={<DownloadOutlined />}
                onClick={exportData}
                disabled={stats.minedNodes === 0}
              >
                Export Training Data
              </Button>
            </Col>
            <Col className="ml-auto">
              <Badge count={`Layer ${stats.currentDepth + 1}/${maxDepth}`} className="mr-4" />
              <Badge count={`${stats.timeElapsed}s`} className="bg-blue-600" />
            </Col>
          </Row>
        </div>
      </Card>

      <Row gutter={16}>
        {/* 3D Visualization */}
        <Col span={18}>
          <Card 
            className="bg-slate-800 border-slate-700"
            title={<span className="text-white">3D DOM Space Visualization</span>}
            bodyStyle={{ height: '600px', overflow: 'hidden' }}
          >
            <div className="relative w-full h-full bg-slate-900 rounded" style={{ perspective: '1000px' }}>
              {/* 3D Space */}
              <div className="w-full h-full relative">
                {nodes.map(node => {
                  // Calculate 3D position with perspective
                  const scale = 1 - (node.z / maxDepth) * 0.5; // Smaller at deeper layers
                  const offsetX = (node.z / maxDepth) * 50; // Perspective offset
                  const offsetY = (node.z / maxDepth) * 30;
                  
                  return (
                    <Tooltip
                      key={node.id}
                      title={
                        <div>
                          <div><strong>Tag:</strong> {node.tag}</div>
                          <div><strong>Importance:</strong> {(node.importance * 100).toFixed(0)}%</div>
                          <div><strong>Depth:</strong> Layer {node.z + 1}</div>
                          {node.schemas.length > 0 && (
                            <div><strong>Schema:</strong> {node.schemas.join(', ')}</div>
                          )}
                          <div><strong>Status:</strong> {node.mined ? '✅ Mined' : '⏳ Unmined'}</div>
                        </div>
                      }
                    >
                      <div
                        className="absolute rounded-full cursor-pointer transition-all duration-300 hover:opacity-100"
                        style={{
                          left: `${node.x * scale + offsetX}%`,
                          top: `${node.y * scale + offsetY}%`,
                          width: `${getNodeSize(node) * scale}px`,
                          height: `${getNodeSize(node) * scale}px`,
                          backgroundColor: getNodeColor(node),
                          opacity: node.mined ? 0.9 : 0.3,
                          transform: `translateZ(${node.z * -20}px)`,
                          border: selectedNode?.id === node.id ? '2px solid #fbbf24' : 'none',
                          boxShadow: node.schemas.length > 0 ? '0 0 10px rgba(168, 85, 247, 0.6)' : 'none',
                          zIndex: maxDepth - node.z
                        }}
                        onClick={() => setSelectedNode(node)}
                      />
                    </Tooltip>
                  );
                })}
              </div>

              {/* Layer Indicators */}
              <div className="absolute top-4 right-4 space-y-1">
                {Array.from({ length: maxDepth }, (_, i) => (
                  <div
                    key={i}
                    className={`text-xs px-2 py-1 rounded ${
                      i === stats.currentDepth
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-400'
                    }`}
                  >
                    Layer {i + 1}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-slate-800 p-3 rounded border border-slate-700">
                <div className="text-sm text-gray-400 mb-2">Importance Level:</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-400">Critical (&gt;80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs text-gray-400">High (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs text-gray-400">Medium (40-60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-400">Low (&lt;40%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
                    <span className="text-xs text-gray-400">Has Schema</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Node Details */}
        <Col span={6}>
          <Card 
            className="bg-slate-800 border-slate-700"
            title={<span className="text-white">Node Details</span>}
          >
            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Node ID</div>
                  <div className="text-sm text-white font-mono">{selectedNode.id}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">HTML Tag</div>
                  <Tag color="blue">{selectedNode.tag}</Tag>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Importance Score</div>
                  <Progress
                    percent={Math.round(selectedNode.importance * 100)}
                    size="small"
                    strokeColor={getNodeColor(selectedNode)}
                  />
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Depth Layer</div>
                  <Badge count={`Layer ${selectedNode.z + 1}`} className="bg-purple-600" />
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Position</div>
                  <div className="text-xs text-white font-mono">
                    X: {selectedNode.x.toFixed(1)}, Y: {selectedNode.y.toFixed(1)}
                  </div>
                </div>

                {selectedNode.schemas.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Detected Schemas</div>
                    {selectedNode.schemas.map(schema => (
                      <Tag key={schema} color="purple">{schema}</Tag>
                    ))}
                  </div>
                )}

                <div>
                  <div className="text-xs text-gray-500 mb-1">Mining Status</div>
                  <Tag color={selectedNode.mined ? 'green' : 'orange'}>
                    {selectedNode.mined ? '✅ Mined' : '⏳ Pending'}
                  </Tag>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Content Preview</div>
                  <div className="text-xs text-gray-400 p-2 bg-slate-900 rounded">
                    {selectedNode.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <EyeOutlined className="text-4xl mb-2" />
                <div className="text-sm">Click a node to view details</div>
              </div>
            )}
          </Card>

          {/* Mining Info */}
          <Card className="mt-4 bg-slate-800 border-slate-700">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Nodes:</span>
                <span className="text-white">{stats.totalNodes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Mined:</span>
                <span className="text-green-400">{stats.minedNodes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Important:</span>
                <span className="text-orange-400">{stats.importantNodes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">With Schemas:</span>
                <span className="text-purple-400">{stats.schemasDetected}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Time Elapsed:</span>
                <span className="text-blue-400">{stats.timeElapsed}s</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DOM3DMiningVisualization;

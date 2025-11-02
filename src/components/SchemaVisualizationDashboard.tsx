import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Tabs,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Button,
  message,
  Spin,
  Alert,
  Tag,
  Statistic
} from 'antd';
import {
  NodeIndexOutlined,
  DeploymentUnitOutlined,
  ApartmentOutlined,
  LinkOutlined,
  DownloadOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import mermaid from 'mermaid';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

/**
 * Schema Visualization Dashboard
 * Visualizes component schemas, relationships, and linkages using:
 * - Knowledge graphs
 * - Mermaid diagrams
 * - Info charts
 * - Flow diagrams
 */
const SchemaVisualizationDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [components, setComponents] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [visualizations, setVisualizations] = useState([]);
  const [activeTab, setActiveTab] = useState('knowledge-graph');
  
  const mermaidRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose'
    });
    fetchAnalyses();
  }, []);

  useEffect(() => {
    if (selectedAnalysis) {
      fetchAnalysisData(selectedAnalysis);
    }
  }, [selectedAnalysis]);

  useEffect(() => {
    if (components.length > 0 && activeTab === 'mermaid') {
      renderMermaidDiagram();
    } else if (components.length > 0 && activeTab === 'knowledge-graph') {
      renderKnowledgeGraph();
    }
  }, [components, activeTab]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/component-analyzer/analyses');
      const result = await response.json();
      if (result.success) {
        setAnalyses(result.data);
        if (result.data.length > 0) {
          setSelectedAnalysis(result.data[0].analysis_id);
        }
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const fetchAnalysisData = async (analysisId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/component-analyzer/analyses/${analysisId}`);
      const result = await response.json();
      if (result.success) {
        setComponents(result.data.components);
        // Create relationships from component hierarchy
        const rels = buildRelationships(result.data.components);
        setRelationships(rels);
      }
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      message.error('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const buildRelationships = (components) => {
    const relationships = [];
    const componentMap = new Map(components.map(c => [c.component_id, c]));
    
    // Group by classification and family
    const byClassification = {};
    const byFamily = {};
    
    components.forEach(comp => {
      // By classification
      if (!byClassification[comp.classification]) {
        byClassification[comp.classification] = [];
      }
      byClassification[comp.classification].push(comp);
      
      // By family
      if (!byFamily[comp.component_family]) {
        byFamily[comp.component_family] = [];
      }
      byFamily[comp.component_family].push(comp);
    });
    
    // Create classification relationships
    Object.entries(byClassification).forEach(([classification, comps]) => {
      for (let i = 0; i < comps.length - 1; i++) {
        relationships.push({
          source: comps[i].component_id,
          target: comps[i + 1].component_id,
          type: 'same-classification',
          label: classification
        });
      }
    });
    
    // Create family relationships
    Object.entries(byFamily).forEach(([family, comps]) => {
      for (let i = 0; i < comps.length - 1; i++) {
        relationships.push({
          source: comps[i].component_id,
          target: comps[i + 1].component_id,
          type: 'same-family',
          label: family
        });
      }
    });
    
    return relationships;
  };

  const renderKnowledgeGraph = () => {
    if (!canvasRef.current || components.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 600;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Simple force-directed layout
    const nodes = components.map((comp, i) => ({
      id: comp.component_id,
      label: comp.component_type,
      classification: comp.classification,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: 20 + (comp.reuse_score / 10)
    }));
    
    const edges = relationships.map(rel => ({
      source: nodes.find(n => n.id === rel.source),
      target: nodes.find(n => n.id === rel.target),
      type: rel.type
    })).filter(e => e.source && e.target);
    
    // Color scheme
    const colors = {
      'Navigation': '#1890ff',
      'Layout': '#52c41a',
      'Container': '#faad14',
      'Overlay': '#722ed1',
      'Input': '#eb2f96',
      'Data Display': '#13c2c2',
      'Data Visualization': '#fa8c16',
      'Media': '#a0d911',
      'Feedback': '#f5222d',
      'Indicator': '#2f54eb',
      'Other': '#8c8c8c'
    };
    
    // Simulation parameters
    const iterations = 100;
    const damping = 0.9;
    const repulsion = 5000;
    const attraction = 0.01;
    
    // Run simulation
    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (distance * distance);
          
          nodes[i].vx -= (dx / distance) * force;
          nodes[i].vy -= (dy / distance) * force;
          nodes[j].vx += (dx / distance) * force;
          nodes[j].vy += (dy / distance) * force;
        }
      }
      
      // Attraction along edges
      edges.forEach(edge => {
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = distance * attraction;
        
        edge.source.vx += (dx / distance) * force;
        edge.source.vy += (dy / distance) * force;
        edge.target.vx -= (dx / distance) * force;
        edge.target.vy -= (dy / distance) * force;
      });
      
      // Update positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= damping;
        node.vy *= damping;
        
        // Keep in bounds
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
      });
    }
    
    // Draw edges
    ctx.strokeStyle = '#d9d9d9';
    ctx.lineWidth = 1;
    edges.forEach(edge => {
      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      ctx.lineTo(edge.target.x, edge.target.y);
      ctx.stroke();
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const color = colors[node.classification] || colors['Other'];
      
      // Node circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = node.label.substring(0, 10);
      ctx.fillText(label, node.x, node.y + node.radius + 12);
    });
    
    // Legend
    const legendY = 20;
    const legendX = width - 150;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    Object.entries(colors).forEach(([label, color], i) => {
      const y = legendY + i * 20;
      ctx.fillStyle = color;
      ctx.fillRect(legendX, y, 12, 12);
      ctx.fillStyle = '#000';
      ctx.fillText(label, legendX + 16, y + 10);
    });
  };

  const renderMermaidDiagram = async () => {
    if (!mermaidRef.current || components.length === 0) return;
    
    // Generate mermaid syntax
    let mermaidSyntax = 'graph TB\n';
    
    // Group by classification
    const byClassification = {};
    components.forEach(comp => {
      if (!byClassification[comp.classification]) {
        byClassification[comp.classification] = [];
      }
      byClassification[comp.classification].push(comp);
    });
    
    // Create subgraphs for each classification
    Object.entries(byClassification).forEach(([classification, comps], idx) => {
      mermaidSyntax += `  subgraph ${classification.replace(/\s/g, '_')}\n`;
      comps.forEach((comp, i) => {
        const nodeId = `${classification.replace(/\s/g, '_')}_${i}`;
        const label = comp.component_type.substring(0, 15);
        mermaidSyntax += `    ${nodeId}["${label}"]\n`;
        
        // Add style based on reuse score
        if (comp.reuse_score >= 70) {
          mermaidSyntax += `    style ${nodeId} fill:#52c41a\n`;
        } else if (comp.reuse_score >= 50) {
          mermaidSyntax += `    style ${nodeId} fill:#faad14\n`;
        } else {
          mermaidSyntax += `    style ${nodeId} fill:#ff4d4f\n`;
        }
      });
      mermaidSyntax += '  end\n';
    });
    
    // Add relationships
    relationships.slice(0, 20).forEach(rel => {
      // Find source and target in classification groups
      let sourceNode, targetNode;
      Object.entries(byClassification).forEach(([classification, comps]) => {
        comps.forEach((comp, i) => {
          const nodeId = `${classification.replace(/\s/g, '_')}_${i}`;
          if (comp.component_id === rel.source) sourceNode = nodeId;
          if (comp.component_id === rel.target) targetNode = nodeId;
        });
      });
      
      if (sourceNode && targetNode) {
        mermaidSyntax += `  ${sourceNode} --> ${targetNode}\n`;
      }
    });
    
    try {
      const { svg } = await mermaid.render('mermaid-diagram', mermaidSyntax);
      mermaidRef.current.innerHTML = svg;
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      mermaidRef.current.innerHTML = '<pre>' + mermaidSyntax + '</pre>';
    }
  };

  const exportVisualization = async (format) => {
    message.success(`Exporting as ${format}...`);
    
    // Create visualization data
    const vizData = {
      name: `Schema Visualization - ${selectedAnalysis}`,
      visualizationType: activeTab,
      sourceType: 'analysis',
      sourceId: selectedAnalysis,
      data: {
        components,
        relationships
      },
      config: {
        format,
        timestamp: new Date().toISOString()
      }
    };
    
    try {
      const response = await fetch('/api/component-analyzer/visualizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vizData)
      });
      
      const result = await response.json();
      if (result.success) {
        message.success('Visualization saved successfully!');
      }
    } catch (error) {
      message.error('Failed to save visualization');
    }
  };

  const renderKnowledgeGraphTab = () => (
    <div>
      <Alert
        message="Knowledge Graph Visualization"
        description="Interactive force-directed graph showing component relationships and classifications."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Total Components"
              value={components.length}
              prefix={<NodeIndexOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Relationships"
              value={relationships.length}
              prefix={<LinkOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Avg Reuse Score"
              value={Math.round(components.reduce((sum, c) => sum + c.reuse_score, 0) / components.length)}
              suffix="/100"
              prefix={<DeploymentUnitOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Avg Complexity"
              value={Math.round(components.reduce((sum, c) => sum + c.complexity_score, 0) / components.length)}
              suffix="/100"
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <canvas 
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '600px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          backgroundColor: '#fafafa'
        }}
      />
    </div>
  );

  const renderMermaidTab = () => (
    <div>
      <Alert
        message="Mermaid Diagram"
        description="Hierarchical component structure with classifications and relationships."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <div 
        ref={mermaidRef}
        style={{ 
          padding: '20px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          backgroundColor: '#fff',
          minHeight: '500px',
          overflow: 'auto'
        }}
      />
    </div>
  );

  const renderInfoChartTab = () => {
    // Group statistics
    const byClassification = components.reduce((acc, comp) => {
      if (!acc[comp.classification]) {
        acc[comp.classification] = {
          count: 0,
          totalReuse: 0,
          totalComplexity: 0
        };
      }
      acc[comp.classification].count++;
      acc[comp.classification].totalReuse += comp.reuse_score;
      acc[comp.classification].totalComplexity += comp.complexity_score;
      return acc;
    }, {});

    return (
      <div>
        <Alert
          message="Info Chart Report"
          description="Statistical breakdown of component classifications and metrics."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={16}>
          {Object.entries(byClassification).map(([classification, stats]) => (
            <Col span={8} key={classification} style={{ marginBottom: 16 }}>
              <Card
                title={classification}
                extra={<Tag color="blue">{stats.count} components</Tag>}
              >
                <Statistic
                  title="Avg Reuse Score"
                  value={Math.round(stats.totalReuse / stats.count)}
                  suffix="/100"
                  valueStyle={{ fontSize: '20px' }}
                />
                <Statistic
                  title="Avg Complexity"
                  value={Math.round(stats.totalComplexity / stats.count)}
                  suffix="/100"
                  valueStyle={{ fontSize: '20px' }}
                  style={{ marginTop: 16 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3}>Schema Visualization Dashboard</Title>
            </Col>
            <Col>
              <Space>
                <Select
                  style={{ width: 300 }}
                  placeholder="Select analysis"
                  value={selectedAnalysis}
                  onChange={setSelectedAnalysis}
                  loading={loading}
                >
                  {analyses.map(analysis => (
                    <Option key={analysis.analysis_id} value={analysis.analysis_id}>
                      {analysis.url} ({new Date(analysis.captured_at).toLocaleDateString()})
                    </Option>
                  ))}
                </Select>
                
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => exportVisualization('svg')}
                >
                  Export
                </Button>
                
                <Button 
                  icon={<FullscreenOutlined />}
                  onClick={() => message.info('Fullscreen mode')}
                >
                  Fullscreen
                </Button>
              </Space>
            </Col>
          </Row>

          <Spin spinning={loading}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span>
                    <NodeIndexOutlined />
                    Knowledge Graph
                  </span>
                }
                key="knowledge-graph"
              >
                {renderKnowledgeGraphTab()}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <ApartmentOutlined />
                    Mermaid Diagram
                  </span>
                }
                key="mermaid"
              >
                {renderMermaidTab()}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <DeploymentUnitOutlined />
                    Info Charts
                  </span>
                }
                key="info-chart"
              >
                {renderInfoChartTab()}
              </TabPane>
            </Tabs>
          </Spin>
        </Space>
      </Card>
    </div>
  );
};

export default SchemaVisualizationDashboard;

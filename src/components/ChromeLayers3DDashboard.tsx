/**
 * Chrome Layers 3D Visualization Dashboard
 * 
 * Interactive dashboard for visualizing DOM layers in 3D, similar to Chrome DevTools Layers panel.
 * Features component highlighting, schema linking, and ordered position lists.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, Button, Input, Select, Table, Tag, Space, Tooltip, Alert, Spin, List, Switch, Slider } from 'antd';
import { 
  CubeOutlined, 
  EyeOutlined, 
  LinkOutlined, 
  DatabaseOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  CompressOutlined,
  ExpandOutlined
} from '@ant-design/icons';
import * as d3 from 'd3';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const ChromeLayers3DDashboard = () => {
  // State
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [layerData, setLayerData] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // '3d', '2d', 'list'
  const [showComposited, setShowComposited] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationX, setRotationX] = useState(45);
  const [rotationY, setRotationY] = useState(45);
  
  // Refs
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  /**
   * Analyze URL for layers
   */
  const analyzeUrl = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/layers/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          options: {
            includeTrainingData: true,
            designRules: {
              maxZIndex: 10000,
              compositingBestPractices: true
            }
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setLayerData(result.data.analysis);
      } else {
        console.error('Analysis failed:', result.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render 3D visualization
   */
  useEffect(() => {
    if (!layerData || !layerData.map3D || viewMode !== '3d') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.clientWidth;
    const height = canvas.height = canvas.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Setup perspective
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = zoomLevel;

    // Convert 3D to 2D with perspective
    const project3D = (x, y, z) => {
      const rotX = rotationX * Math.PI / 180;
      const rotY = rotationY * Math.PI / 180;

      // Rotate around Y axis
      let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);

      // Rotate around X axis
      let y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

      // Perspective projection
      const perspective = 1000;
      const projScale = perspective / (perspective + z2);

      return {
        x: centerX + x1 * scale * projScale,
        y: centerY + y1 * scale * projScale,
        scale: projScale
      };
    };

    // Sort layers by Z depth (back to front)
    const sortedLayers = [...layerData.map3D].sort((a, b) => a.position.z - b.position.z);

    // Draw layers
    sortedLayers.forEach(layer => {
      if (!showComposited && layer.metadata.isComposited) return;

      const pos = project3D(
        layer.position.x - centerX,
        layer.position.y - centerY,
        layer.position.z
      );

      // Draw rectangle with perspective
      const w = layer.dimensions.width * pos.scale * scale;
      const h = layer.dimensions.height * pos.scale * scale;

      // Highlight selected layer
      const isSelected = selectedLayer?.layerId === layer.layerId;

      ctx.fillStyle = layer.color;
      ctx.globalAlpha = layer.metadata.opacity * (isSelected ? 1 : 0.7);
      ctx.fillRect(pos.x - w/2, pos.y - h/2, w, h);

      // Draw border
      ctx.strokeStyle = isSelected ? '#ff0000' : '#000000';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.globalAlpha = 1;
      ctx.strokeRect(pos.x - w/2, pos.y - h/2, w, h);

      // Draw label for selected
      if (isSelected) {
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.fillText(layer.metadata.nodeName, pos.x - w/2, pos.y - h/2 - 5);
      }
    });

  }, [layerData, viewMode, selectedLayer, showComposited, zoomLevel, rotationX, rotationY]);

  /**
   * Render 2D layer diagram
   */
  useEffect(() => {
    if (!layerData || !layerData.layers || viewMode !== '2d') return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.attr('width', width).attr('height', height);

    // Create layer visualization
    const layers = layerData.layers;
    
    // Group by Z-index
    const layersByZ = d3.group(layers, d => d.zIndex || 0);
    const zLevels = Array.from(layersByZ.keys()).sort((a, b) => a - b);

    const zScale = d3.scaleLinear()
      .domain([0, zLevels.length - 1])
      .range([height - 50, 50]);

    // Draw z-index levels
    zLevels.forEach((z, i) => {
      const y = zScale(i);
      const levelLayers = layersByZ.get(z);

      // Draw level line
      svg.append('line')
        .attr('x1', 50)
        .attr('x2', width - 50)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);

      // Draw level label
      svg.append('text')
        .attr('x', 20)
        .attr('y', y + 5)
        .attr('font-size', '12px')
        .text(`z: ${z}`);

      // Draw layers at this level
      levelLayers.forEach((layer, idx) => {
        const x = 100 + (idx * 150) % (width - 200);
        const yOffset = Math.floor((idx * 150) / (width - 200)) * 30;

        const rect = svg.append('rect')
          .attr('x', x)
          .attr('y', y - 15 + yOffset)
          .attr('width', 120)
          .attr('height', 25)
          .attr('fill', layer.isComposited ? '#4CAF50' : '#2196F3')
          .attr('stroke', selectedLayer?.id === layer.id ? '#ff0000' : '#000')
          .attr('stroke-width', selectedLayer?.id === layer.id ? 3 : 1)
          .attr('rx', 3)
          .style('cursor', 'pointer')
          .on('click', () => {
            setSelectedLayer(layer);
          });

        svg.append('text')
          .attr('x', x + 5)
          .attr('y', y + yOffset)
          .attr('font-size', '10px')
          .attr('fill', 'white')
          .text(layer.nodeName.slice(0, 15))
          .style('pointer-events', 'none');
      });
    });

  }, [layerData, viewMode, selectedLayer]);

  /**
   * Component columns for table
   */
  const componentColumns = [
    {
      title: 'Position',
      key: 'position',
      width: 80,
      render: (_, record, index) => index + 1
    },
    {
      title: 'Component',
      dataIndex: 'tagName',
      key: 'tagName',
      render: (text, record) => (
        <Space>
          <Tag color={record.position === 'fixed' ? 'red' : record.position === 'absolute' ? 'orange' : 'blue'}>
            {text}
          </Tag>
          {record.role && <Tag color="green">{record.role}</Tag>}
        </Space>
      )
    },
    {
      title: 'Bounds',
      key: 'bounds',
      render: (_, record) => (
        <span style={{ fontSize: '11px' }}>
          {Math.round(record.bounds.x)}, {Math.round(record.bounds.y)} 
          ({Math.round(record.bounds.width)}×{Math.round(record.bounds.height)})
        </span>
      )
    },
    {
      title: 'Z-Index',
      dataIndex: 'zIndex',
      key: 'zIndex',
      width: 80,
      render: (z) => z === 'auto' ? '-' : z
    },
    {
      title: 'Layer',
      dataIndex: 'layerId',
      key: 'layerId',
      width: 100,
      render: (layerId) => layerId ? <Tag>{layerId.slice(-6)}</Tag> : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleHighlightComponent(record)}
          >
            Highlight
          </Button>
          <Button 
            size="small" 
            icon={<LinkOutlined />}
            onClick={() => handleShowSchemas(record)}
          >
            Schema
          </Button>
        </Space>
      )
    }
  ];

  /**
   * Handle component highlight
   */
  const handleHighlightComponent = (component) => {
    setSelectedComponent(component);
    
    // Find and select the corresponding layer
    if (component.layerId && layerData) {
      const layer = layerData.layers.find(l => l.id === component.layerId);
      if (layer) {
        setSelectedLayer(layerData.map3D.find(m => m.layerId === layer.id));
      }
    }
  };

  /**
   * Handle show schemas
   */
  const handleShowSchemas = async (component) => {
    setSelectedComponent(component);
    // Fetch linked schemas
    // This would call the API to get schema links
  };

  /**
   * Export data
   */
  const handleExport = async () => {
    const dataStr = JSON.stringify(layerData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layer-analysis-${Date.now()}.json`;
    link.click();
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px' }}>
        <Space style={{ width: '100%' }} direction="vertical">
          <h2 style={{ margin: 0 }}>
            <CubeOutlined /> Chrome Layers 3D Visualization
          </h2>
          
          <Space style={{ width: '100%' }}>
            <Input
              style={{ flex: 1, minWidth: '400px' }}
              placeholder="Enter URL to analyze..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPressEnter={analyzeUrl}
            />
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />}
              loading={loading}
              onClick={analyzeUrl}
            >
              Analyze
            </Button>
            {layerData && (
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                Export
              </Button>
            )}
          </Space>
        </Space>
      </Card>

      {/* Stats */}
      {layerData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                {layerData.metadata.totalLayers}
              </div>
              <div style={{ color: '#666' }}>Total Layers</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                {layerData.metadata.compositingLayers}
              </div>
              <div style={{ color: '#666' }}>Compositing Layers</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fa8c16' }}>
                {layerData.metadata.maxZIndex}
              </div>
              <div style={{ color: '#666' }}>Max Z-Index</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#722ed1' }}>
                {layerData.componentMap?.length || 0}
              </div>
              <div style={{ color: '#666' }}>Components</div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {layerData && (
        <Tabs defaultActiveKey="3d" onChange={setViewMode}>
          <TabPane tab={<span><CubeOutlined /> 3D View</span>} key="3d">
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* Controls */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    Show Composited:
                    <Switch 
                      checked={showComposited} 
                      onChange={setShowComposited}
                      style={{ marginLeft: '8px' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    Zoom: <Slider 
                      min={0.1} 
                      max={2} 
                      step={0.1} 
                      value={zoomLevel} 
                      onChange={setZoomLevel}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    Rotation X: <Slider 
                      min={0} 
                      max={360} 
                      value={rotationX} 
                      onChange={setRotationX}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    Rotation Y: <Slider 
                      min={0} 
                      max={360} 
                      value={rotationY} 
                      onChange={setRotationY}
                    />
                  </div>
                </div>

                {/* Canvas */}
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: '600px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: '#ffffff'
                  }}
                />

                {/* Legend */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div><span style={{ display: 'inline-block', width: '20px', height: '20px', background: '#4CAF50', marginRight: '8px' }}></span>Composited</div>
                  <div><span style={{ display: 'inline-block', width: '20px', height: '20px', background: '#2196F3', marginRight: '8px' }}></span>Fixed</div>
                  <div><span style={{ display: 'inline-block', width: '20px', height: '20px', background: '#FF9800', marginRight: '8px' }}></span>Absolute</div>
                  <div><span style={{ display: 'inline-block', width: '20px', height: '20px', background: '#9C27B0', marginRight: '8px' }}></span>Relative</div>
                  <div><span style={{ display: 'inline-block', width: '20px', height: '20px', background: '#757575', marginRight: '8px' }}></span>Static</div>
                </div>
              </Space>
            </Card>
          </TabPane>

          <TabPane tab={<span><BarChartOutlined /> 2D Diagram</span>} key="2d">
            <Card>
              <svg
                ref={svgRef}
                style={{
                  width: '100%',
                  height: '600px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  background: '#ffffff'
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span><DatabaseOutlined /> Components</span>} key="list">
            <Card title="Ordered Component List">
              <Table
                dataSource={layerData.componentMap}
                columns={componentColumns}
                rowKey="componentId"
                size="small"
                pagination={{ pageSize: 20 }}
                rowClassName={(record) => 
                  selectedComponent?.componentId === record.componentId ? 'selected-row' : ''
                }
              />
            </Card>
          </TabPane>

          <TabPane tab={<span><LinkOutlined /> Schema Links</span>} key="schemas">
            <Card title="Component Schema Relationships">
              {selectedComponent ? (
                <div>
                  <h3>Selected Component: {selectedComponent.tagName}</h3>
                  <p>Bounds: {JSON.stringify(selectedComponent.bounds)}</p>
                  <p>Data Attributes: {JSON.stringify(selectedComponent.dataAttributes)}</p>
                  
                  <Alert
                    message="Schema linking is in development"
                    description="This feature will show database schemas linked to this component based on data attributes and semantic analysis."
                    type="info"
                    showIcon
                    style={{ marginTop: '16px' }}
                  />
                </div>
              ) : (
                <Alert
                  message="Select a component to view schema links"
                  type="info"
                  showIcon
                />
              )}
            </Card>
          </TabPane>

          <TabPane tab={<span><ThunderboltOutlined /> Training Data</span>} key="training">
            <Card title="Layer Training Data">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="Training data extracted"
                  description="Layer patterns and component relationships have been analyzed for ML training."
                  type="success"
                  showIcon
                />
                
                <Card size="small" title="Structure Metrics">
                  <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify({
                      totalLayers: layerData.metadata.totalLayers,
                      compositingLayers: layerData.metadata.compositingLayers,
                      maxZIndex: layerData.metadata.maxZIndex,
                      components: layerData.componentMap?.length
                    }, null, 2)}
                  </pre>
                </Card>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" />
          <p>Analyzing layers...</p>
        </div>
      )}

      {/* No data */}
      {!loading && !layerData && (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <CubeOutlined style={{ fontSize: '64px', color: '#ccc' }} />
            <p style={{ marginTop: '16px', color: '#666' }}>
              Enter a URL and click Analyze to visualize its layers
            </p>
          </div>
        </Card>
      )}

      <style jsx>{`
        .selected-row {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default ChromeLayers3DDashboard;

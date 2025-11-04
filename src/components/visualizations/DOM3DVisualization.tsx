/**
 * 3D DOM Visualization Component
 * 
 * Interactive 3D visualization of DOM structure with schema overlays
 * Shows painted/unpainted layers, schema links, and enrichment targets
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Switch,
  Tabs,
  Tree,
  Tag,
  Descriptions,
  Alert,
  Space,
  Button,
  Tooltip,
  Badge,
  Collapse,
  List,
  Typography,
} from 'antd';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  BranchesOutlined,
  CodeOutlined,
  BgColorsOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  LayoutOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Text } = Typography;

interface DOM3DVisualizationProps {
  miningResult: any;
  onElementSelect?: (elementId: string) => void;
}

export const DOM3DVisualization: React.FC<DOM3DVisualizationProps> = ({
  miningResult,
  onElementSelect,
}) => {
  const [paintedView, setPaintedView] = useState(true);
  const [showSchemaOverlay, setShowSchemaOverlay] = useState(true);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && miningResult) {
      renderVisualization();
    }
  }, [miningResult, paintedView, showSchemaOverlay, selectedLayer]);

  const renderVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render 3D DOM model
    const dom3DModel = miningResult.dom3DModel || [];
    const visualization = miningResult.visualization3D || {};

    // Draw layers
    visualization.layers?.forEach((layer: any, index: number) => {
      if (!paintedView && layer.painted) return;
      
      const alpha = index === selectedLayer ? 1.0 : 0.3;
      ctx.globalAlpha = alpha;

      // Draw layer background
      ctx.fillStyle = `rgba(100, 100, 200, 0.1)`;
      ctx.fillRect(50, 50 + index * 30, canvas.width - 100, 25);

      // Draw layer label
      ctx.fillStyle = '#000';
      ctx.font = '12px monospace';
      ctx.fillText(`Layer ${index} (depth: ${layer.depth})`, 60, 65 + index * 30);
    });

    // Draw elements in 3D space
    dom3DModel.forEach((element: any) => {
      const x = element.position.x * 0.5;
      const y = element.position.y * 0.5;
      const z = element.position.z;

      // Perspective transformation
      const scale = 1 / (1 + z * 0.01);
      const projX = x * scale + canvas.width / 2;
      const projY = y * scale + 100;

      // Draw element box
      ctx.strokeStyle = element.id === selectedElement ? '#ff4d4f' : '#1890ff';
      ctx.lineWidth = element.id === selectedElement ? 3 : 1;
      ctx.strokeRect(
        projX,
        projY,
        element.dimensions.width * scale * 0.5,
        element.dimensions.height * scale * 0.5
      );

      // Draw schema overlay if enabled
      if (showSchemaOverlay && element.schemaLinks && element.schemaLinks.length > 0) {
        ctx.fillStyle = 'rgba(82, 196, 26, 0.2)';
        ctx.fillRect(
          projX,
          projY,
          element.dimensions.width * scale * 0.5,
          element.dimensions.height * scale * 0.5
        );

        // Draw schema indicator
        ctx.fillStyle = '#52c41a';
        ctx.beginPath();
        ctx.arc(projX + 5, projY + 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw framework indicator
      if (element.framework) {
        ctx.fillStyle = '#722ed1';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(element.framework.name[0], projX - 10, projY + 10);
      }
    });

    ctx.globalAlpha = 1.0;
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    onElementSelect?.(elementId);
  };

  const buildTreeData = () => {
    const dom3DModel = miningResult.dom3DModel || [];
    const rootElements = dom3DModel.filter((e: any) => e.depth === 0);

    const buildNode = (element: any): any => {
      const children = dom3DModel.filter((e: any) => 
        element.children && element.children.includes(e.id)
      );

      return {
        title: (
          <Space>
            <Tag color={element.framework ? 'purple' : 'blue'}>
              {element.tagName}
            </Tag>
            {element.schemaLinks && element.schemaLinks.length > 0 && (
              <Badge count={element.schemaLinks.length} style={{ backgroundColor: '#52c41a' }} />
            )}
            {element.framework && (
              <Tag color="purple" icon={<CodeOutlined />}>{element.framework.name}</Tag>
            )}
          </Space>
        ),
        key: element.id,
        children: children.map(buildNode),
      };
    };

    return rootElements.map(buildNode);
  };

  const selectedElementData = miningResult.dom3DModel?.find(
    (e: any) => e.id === selectedElement
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <LayoutOutlined />
            <span>3D DOM Visualization</span>
            <Tag color="blue">{miningResult.url}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Toggle painted/unpainted view">
              <Switch
                checked={paintedView}
                onChange={setPaintedView}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EyeInvisibleOutlined />}
              />
            </Tooltip>
            <Tooltip title="Toggle schema overlay">
              <Switch
                checked={showSchemaOverlay}
                onChange={setShowSchemaOverlay}
                checkedChildren="Schema"
                unCheckedChildren="Schema"
              />
            </Tooltip>
          </Space>
        }
      >
        <Tabs defaultActiveKey="3d">
          <TabPane tab={<span><BgColorsOutlined /> 3D View</span>} key="3d">
            <div style={{ position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={1200}
                height={600}
                style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  cursor: 'crosshair',
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  const elements = miningResult.dom3DModel || [];
                  const nearest = elements.find((el: any) => {
                    const projX = el.position.x * 0.5 + 600;
                    const projY = el.position.y * 0.5 + 100;
                    return Math.abs(x - projX) < 50 && Math.abs(y - projY) < 50;
                  });
                  
                  if (nearest) {
                    handleElementClick(nearest.id);
                  }
                }}
              />
              <div style={{ marginTop: '16px' }}>
                <Space>
                  <span style={{ fontWeight: 500 }}>Layer:</span>
                  {miningResult.visualization3D?.layers?.map((layer: any, idx: number) => (
                    <Button
                      key={idx}
                      size="small"
                      type={selectedLayer === idx ? 'primary' : 'default'}
                      onClick={() => setSelectedLayer(idx)}
                    >
                      {idx}
                    </Button>
                  ))}
                </Space>
              </div>
            </div>

            {selectedElementData && (
              <Card title="Selected Element Details" style={{ marginTop: '16px' }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Tag">{selectedElementData.tagName}</Descriptions.Item>
                  <Descriptions.Item label="Depth">{selectedElementData.depth}</Descriptions.Item>
                  <Descriptions.Item label="Position">
                    x: {selectedElementData.position.x}, y: {selectedElementData.position.y}, z: {selectedElementData.position.z}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dimensions">
                    {selectedElementData.dimensions.width} x {selectedElementData.dimensions.height}
                  </Descriptions.Item>
                  {selectedElementData.framework && (
                    <Descriptions.Item label="Framework">
                      <Tag color="purple">{selectedElementData.framework.name}</Tag>
                    </Descriptions.Item>
                  )}
                  {selectedElementData.schemaLinks && selectedElementData.schemaLinks.length > 0 && (
                    <Descriptions.Item label="Schemas" span={2}>
                      {selectedElementData.schemaLinks.map((link: any, idx: number) => (
                        <Tag key={idx} color="green">{link.schemaType}</Tag>
                      ))}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {selectedElementData.componentSchema && (
                  <Alert
                    message="React Component Detected"
                    description={
                      <div>
                        <p><strong>Name:</strong> {selectedElementData.componentSchema.name}</p>
                        <p><strong>Type:</strong> {selectedElementData.componentSchema.type}</p>
                        <p><strong>Props:</strong> {selectedElementData.componentSchema.props.length}</p>
                      </div>
                    }
                    type="info"
                    style={{ marginTop: '8px' }}
                    showIcon
                  />
                )}
              </Card>
            )}
          </TabPane>

          <TabPane tab={<span><BranchesOutlined /> Tree View</span>} key="tree">
            <Tree
              showLine
              defaultExpandAll
              treeData={buildTreeData()}
              onSelect={(keys) => {
                if (keys.length > 0) {
                  handleElementClick(keys[0] as string);
                }
              }}
            />
          </TabPane>

          <TabPane tab={<span><CodeOutlined /> Frameworks</span>} key="frameworks">
            <List
              dataSource={miningResult.frameworkDetection || []}
              renderItem={(framework: any) => (
                <List.Item>
                  <Card title={framework.name} style={{ width: '100%' }}>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="Version">{framework.version || 'Unknown'}</Descriptions.Item>
                      <Descriptions.Item label="Components">{framework.components.length}</Descriptions.Item>
                      {framework.stateManagement && (
                        <Descriptions.Item label="State Management">
                          {framework.stateManagement}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab={<span><ApiOutlined /> Schema Links</span>} key="schemas">
            <Collapse>
              {miningResult.dom3DModel?.filter((e: any) => e.schemaLinks && e.schemaLinks.length > 0).map((element: any) => (
                <Panel
                  key={element.id}
                  header={
                    <Space>
                      <Tag>{element.tagName}</Tag>
                      <Badge count={element.schemaLinks.length} />
                    </Space>
                  }
                >
                  <List
                    dataSource={element.schemaLinks}
                    renderItem={(link: any) => (
                      <List.Item>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Space>
                            <Tag color="green">{link.schemaType}</Tag>
                            <strong>{link.property}</strong>
                          </Space>
                          <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                            {JSON.stringify(link.value)}
                          </code>
                          {link.domPath && (
                            <span style={{ color: '#8c8c8c' }}>
                              DOM Path: {link.domPath.join(' > ')}
                            </span>
                          )}
                          {link.enrichmentTargets && link.enrichmentTargets.length > 0 && (
                            <Space>
                              <ThunderboltOutlined />
                              <span>Enrichment:</span>
                              {link.enrichmentTargets.map((target: any, idx: number) => (
                                <Tag key={idx} color="orange">{target.type}</Tag>
                              ))}
                            </Space>
                          )}
                        </Space>
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          </TabPane>

          <TabPane tab={<span><ThunderboltOutlined /> Predicted Schemas</span>} key="predictions">
            <List
              dataSource={miningResult.predictedSchemas || []}
              renderItem={(prediction: any) => (
                <List.Item>
                  <Card
                    title={prediction.taskType}
                    extra={<Tag color="blue">{(prediction.confidence * 100).toFixed(0)}% confidence</Tag>}
                    style={{ width: '100%' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Complexity">
                          <Tag color={
                            prediction.complexity === 'simple' ? 'green' :
                            prediction.complexity === 'medium' ? 'orange' : 'red'
                          }>
                            {prediction.complexity}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Estimated Effort">
                          {prediction.estimatedEffort}
                        </Descriptions.Item>
                        <Descriptions.Item label="Reasoning">
                          {prediction.reasoning}
                        </Descriptions.Item>
                      </Descriptions>
                      
                      <div>
                        <strong>Recommended Schemas:</strong>
                        <div style={{ marginTop: '8px' }}>
                          {prediction.recommendedSchemas.map((schema: string, idx: number) => (
                            <Tag key={idx} color="cyan">{schema}</Tag>
                          ))}
                        </div>
                      </div>

                      <div>
                        <strong>Required Data:</strong>
                        <div style={{ marginTop: '8px' }}>
                          {prediction.requiredData.map((data: string, idx: number) => (
                            <Tag key={idx}>{data}</Tag>
                          ))}
                        </div>
                      </div>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DOM3DVisualization;

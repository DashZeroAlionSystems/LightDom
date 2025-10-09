/**
 * Interactive Mermaid Chart Component
 * Provides interactive features for Mermaid diagrams including notes, zoom, and annotations
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';
import {
  Card,
  Button,
  Space,
  Modal,
  Input,
  Select,
  ColorPicker,
  Switch,
  Tooltip,
  Popover,
  Dropdown,
  Menu,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  Badge,
  Drawer,
  Tabs,
  Form,
  Alert,
  Spin,
  Empty,
  Slider,
  InputNumber
} from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  SaveOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  UndoOutlined,
  RedoOutlined,
  BookOutlined,
  HighlightOutlined,
  CodeOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  ShareAltOutlined as LinkOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  SecurityScanOutlined,
  RocketOutlined,
  MoreOutlined
} from '@ant-design/icons';
import './InteractiveMermaidChart.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export interface MermaidNote {
  id: string;
  nodeId: string;
  content: string;
  color: string;
  timestamp: number;
  author: string;
  isVisible: boolean;
  category: string;
  position: { x: number; y: number };
}

export interface MermaidAnnotation {
  id: string;
  type: 'highlight' | 'box' | 'arrow' | 'text';
  targetNode: string;
  content?: string;
  color: string;
  isVisible: boolean;
  style?: React.CSSProperties;
}

export interface MermaidConfig {
  diagram: string;
  theme: 'default' | 'dark' | 'forest' | 'neutral';
  title?: string;
  description?: string;
  showNotes?: boolean;
  showAnnotations?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  height?: number;
  width?: number;
  backgroundColor?: string;
  fontSize?: number;
}

interface InteractiveMermaidChartProps {
  config: MermaidConfig;
  onConfigChange?: (config: MermaidConfig) => void;
  onNoteAdd?: (note: MermaidNote) => void;
  onNoteUpdate?: (note: MermaidNote) => void;
  onNoteDelete?: (noteId: string) => void;
  onAnnotationAdd?: (annotation: MermaidAnnotation) => void;
  onAnnotationUpdate?: (annotation: MermaidAnnotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const InteractiveMermaidChart: React.FC<InteractiveMermaidChartProps> = ({
  config,
  onConfigChange,
  onNoteAdd,
  onNoteUpdate,
  onNoteDelete,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  className = '',
  style = {}
}) => {
  const [notes, setNotes] = useState<MermaidNote[]>([]);
  const [annotations, setAnnotations] = useState<MermaidAnnotation[]>([]);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] => useState(false);
  const [isExportModalVisible, setIsExportModalVisible] => useState(false);
  const [isAnnotationDrawerVisible, setIsAnnotationDrawerVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<MermaidNote | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<MermaidAnnotation | null>(null);
  const [noteForm] = Form.useForm();
  const [annotationForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [showNotes, setShowNotes] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const noteIdCounter = useRef(0);
  const annotationIdCounter = useRef(0);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: config.theme || 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
      fontSize: config.fontSize || 16,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35
      },
      gantt: {
        titleTopMargin: 25,
        barHeight: 20,
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        gridLineStartPadding: 35,
        bottomPadding: 25
      }
    });
  }, [config.theme, config.fontSize]);

  // Render Mermaid diagram
  const renderMermaid = useCallback(async () => {
    if (!mermaidRef.current || !config.diagram) return;

    setIsLoading(true);
    setError(null);

    try {
      const element = mermaidRef.current;
      element.innerHTML = '';
      
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, config.diagram);
      element.innerHTML = svg;

      // Add click handlers to nodes
      const nodes = element.querySelectorAll('.node, .nodeLabel, .edgeLabel');
      nodes.forEach((node: Element) => {
        node.addEventListener('click', (e) => {
          e.stopPropagation();
          const nodeId = node.getAttribute('id') || node.textContent || 'unknown';
          setSelectedNode(nodeId);
          handleNodeClick(nodeId, e as MouseEvent);
        });
      });

    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    } finally {
      setIsLoading(false);
    }
  }, [config.diagram]);

  // Re-render when config changes
  useEffect(() => {
    renderMermaid();
  }, [renderMermaid]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string, event: MouseEvent) => {
    if (!config.showNotes) return;

    const rect = chartContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const newNote: MermaidNote = {
      id: `note_${noteIdCounter.current++}`,
      nodeId,
      content: '',
      color: '#1890ff',
      timestamp: Date.now(),
      author: 'User',
      isVisible: true,
      category: 'general',
      position: { x, y }
    };

    setSelectedNote(newNote);
    setIsNoteModalVisible(true);
  }, [config.showNotes]);

  // Handle zoom functionality
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.2 : 0.8;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel * factor));
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  // Handle pan functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && config.enablePan !== false) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [config.enablePan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (config.enableZoom === false) return;
    
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel * factor));
    setZoomLevel(newZoom);
  }, [zoomLevel, config.enableZoom]);

  // Save note
  const handleSaveNote = useCallback(async () => {
    try {
      const values = await noteForm.validateFields();
      if (selectedNote) {
        const updatedNote = { ...selectedNote, ...values };
        setNotes(prev => [...prev, updatedNote]);
        onNoteAdd?.(updatedNote);
        setIsNoteModalVisible(false);
        setSelectedNote(null);
        noteForm.resetFields();
        message.success('Note added successfully');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, [selectedNote, noteForm, onNoteAdd]);

  // Update note
  const handleUpdateNote = useCallback(async () => {
    try {
      const values = await noteForm.validateFields();
      if (selectedNote) {
        const updatedNote = { ...selectedNote, ...values };
        setNotes(prev => prev.map(note => note.id === selectedNote.id ? updatedNote : note));
        onNoteUpdate?.(updatedNote);
        setIsNoteModalVisible(false);
        setSelectedNote(null);
        noteForm.resetFields();
        message.success('Note updated successfully');
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, [selectedNote, noteForm, onNoteUpdate]);

  // Delete note
  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    onNoteDelete?.(noteId);
    message.success('Note deleted successfully');
  }, [onNoteDelete]);

  // Add annotation
  const handleAddAnnotation = useCallback((type: MermaidAnnotation['type']) => {
    if (!selectedNode) {
      message.warning('Please select a node first');
      return;
    }

    const newAnnotation: MermaidAnnotation = {
      id: `annotation_${annotationIdCounter.current++}`,
      type,
      targetNode: selectedNode,
      color: '#ff4d4f',
      isVisible: true,
      content: type === 'text' ? 'New annotation' : undefined
    };

    setSelectedAnnotation(newAnnotation);
    setIsAnnotationDrawerVisible(true);
  }, [selectedNode]);

  // Export diagram
  const handleExport = useCallback(async () => {
    try {
      const values = await exportForm.validateFields();
      const { format, quality, includeNotes, includeAnnotations } = values;

      setIsLoading(true);

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would use a library like html2canvas or similar
      message.success(`Diagram exported as ${format.toUpperCase()} successfully`);
      setIsExportModalVisible(false);
      exportForm.resetFields();
    } catch (error) {
      console.error('Error exporting diagram:', error);
    } finally {
      setIsLoading(false);
    }
  }, [exportForm]);

  // Reset zoom and pan
  const handleResetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Toggle fullscreen
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Edit diagram
  const handleEditDiagram = useCallback(() => {
    editForm.setFieldsValue({ diagram: config.diagram });
    setIsEditModalVisible(true);
  }, [config.diagram, editForm]);

  // Save diagram changes
  const handleSaveDiagram = useCallback(async () => {
    try {
      const values = await editForm.validateFields();
      onConfigChange?.({ ...config, diagram: values.diagram });
      setIsEditModalVisible(false);
      message.success('Diagram updated successfully');
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  }, [config, onConfigChange, editForm]);

  // Render chart based on type
  const renderChart = () => {
    if (error) {
      return (
        <div className="mermaid-error">
          <Alert
            message="Diagram Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={renderMermaid}>
                Retry
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div
        ref={mermaidRef}
        className="mermaid-container"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'center center',
          cursor: isPanning ? 'grabbing' : 'grab',
          minHeight: config.height || 400,
          backgroundColor: config.backgroundColor || 'transparent'
        }}
      />
    );
  };

  // Toolbar component
  const Toolbar = () => (
    <div className="interactive-mermaid-toolbar">
      <Space wrap>
        {/* Zoom Controls */}
        <Button.Group>
          <Button 
            icon={<ZoomOutOutlined />} 
            onClick={() => handleZoom('out')}
            disabled={zoomLevel <= 0.1}
          />
          <Button onClick={handleResetView}>
            {Math.round(zoomLevel * 100)}%
          </Button>
          <Button 
            icon={<ZoomInOutlined />} 
            onClick={() => handleZoom('in')}
            disabled={zoomLevel >= 5}
          />
        </Button.Group>

        <Divider type="vertical" />

        {/* View Controls */}
        <Button.Group>
          <Button 
            icon={showNotes ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => setShowNotes(!showNotes)}
            type={showNotes ? 'primary' : 'default'}
          />
          <Button 
            icon={showAnnotations ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => setShowAnnotations(!showAnnotations)}
            type={showAnnotations ? 'primary' : 'default'}
          />
          <Button 
            icon={<FullscreenOutlined />}
            onClick={handleToggleFullscreen}
          />
        </Button.Group>

        <Divider type="vertical" />

        {/* Edit Controls */}
        <Button 
          icon={<CodeOutlined />}
          onClick={handleEditDiagram}
        >
          Edit Diagram
        </Button>

        <Divider type="vertical" />

        {/* Annotation Tools */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'highlight',
                label: 'Highlight Node',
                icon: <HighlightOutlined />,
                onClick: () => handleAddAnnotation('highlight')
              },
              {
                key: 'box',
                label: 'Add Box',
                icon: <NodeIndexOutlined />,
                onClick: () => handleAddAnnotation('box')
              },
              {
                key: 'arrow',
                label: 'Add Arrow',
                icon: <BranchesOutlined />,
                onClick: () => handleAddAnnotation('arrow')
              },
              {
                key: 'text',
                label: 'Add Text',
                icon: <EditOutlined />,
                onClick: () => handleAddAnnotation('text')
              }
            ]
          }}
          trigger={['click']}
        >
          <Button icon={<HighlightOutlined />} disabled={!selectedNode}>
            Annotations
          </Button>
        </Dropdown>

        <Divider type="vertical" />

        {/* Export and Settings */}
        <Button 
          icon={<DownloadOutlined />}
          onClick={() => setIsExportModalVisible(true)}
        />
        <Button 
          icon={<SettingOutlined />}
          onClick={() => setIsSettingsModalVisible(true)}
        />
      </Space>
    </div>
  );

  // Notes overlay
  const NotesOverlay = () => (
    <div className="interactive-mermaid-notes-overlay">
      {notes.filter(note => note.isVisible && showNotes).map(note => (
        <div
          key={note.id}
          className="mermaid-note"
          style={{
            left: `${note.position.x * 100}%`,
            top: `${note.position.y * 100}%`,
            backgroundColor: note.color,
            color: 'white',
            transform: 'translate(-50%, -50%)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNote(note);
            setIsNoteModalVisible(true);
          }}
        >
          <div className="note-content">
            <Text strong style={{ color: 'white', fontSize: '12px' }}>
              {note.content || 'Click to edit'}
            </Text>
          </div>
          <div className="note-actions">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              style={{ color: 'white' }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNote(note);
                setIsNoteModalVisible(true);
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              style={{ color: 'white' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div 
      className={`interactive-mermaid-container ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      style={style}
    >
      <Card
        title={
          <div className="interactive-mermaid-header">
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {config.title || 'Interactive Mermaid Diagram'}
              </Title>
              {config.description && (
                <Text type="secondary">{config.description}</Text>
              )}
            </div>
            <Toolbar />
          </div>
        }
        extra={
          <Space>
            <Badge count={notes.length} size="small">
              <Button 
                icon={<BookOutlined />}
                onClick={() => setIsAnnotationDrawerVisible(true)}
              >
                Notes
              </Button>
            </Badge>
            <Badge count={annotations.length} size="small">
              <Button 
                icon={<HighlightOutlined />}
                onClick={() => setIsAnnotationDrawerVisible(true)}
              >
                Annotations
              </Button>
            </Badge>
            {selectedNode && (
              <Tag color="blue">Selected: {selectedNode}</Tag>
            )}
          </Space>
        }
        className="interactive-mermaid-card"
      >
        {/* Diagram Container */}
        <div
          ref={chartContainerRef}
          className="interactive-mermaid-content"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {isLoading ? (
            <div className="mermaid-loading">
              <Spin size="large" />
              <Text>Rendering diagram...</Text>
            </div>
          ) : (
            <>
              {renderChart()}
              <NotesOverlay />
            </>
          )}
        </div>

        {/* Diagram Summary */}
        <div className="interactive-mermaid-summary">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <div className="summary-item">
                <NodeIndexOutlined className="summary-icon" />
                <div>
                  <Text strong>Nodes</Text>
                  <br />
                  <Text type="secondary">Click to select</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div className="summary-item">
                <BookOutlined className="summary-icon" />
                <div>
                  <Text strong>{notes.length}</Text>
                  <br />
                  <Text type="secondary">Notes</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div className="summary-item">
                <HighlightOutlined className="summary-icon" />
                <div>
                  <Text strong>{annotations.length}</Text>
                  <br />
                  <Text type="secondary">Annotations</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div className="summary-item">
                <ZoomInOutlined className="summary-icon" />
                <div>
                  <Text strong>{Math.round(zoomLevel * 100)}%</Text>
                  <br />
                  <Text type="secondary">Zoom Level</Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Note Modal */}
      <Modal
        title={selectedNote?.id ? 'Edit Note' : 'Add Note'}
        open={isNoteModalVisible}
        onOk={selectedNote?.id ? handleUpdateNote : handleSaveNote}
        onCancel={() => {
          setIsNoteModalVisible(false);
          setSelectedNote(null);
          noteForm.resetFields();
        }}
        width={600}
      >
        <Form
          form={noteForm}
          layout="vertical"
          initialValues={selectedNote}
        >
          <Form.Item
            name="content"
            label="Note Content"
            rules={[{ required: true, message: 'Please enter note content' }]}
          >
            <TextArea rows={4} placeholder="Enter your note here..." />
          </Form.Item>
          <Form.Item
            name="color"
            label="Note Color"
            initialValue="#1890ff"
          >
            <ColorPicker />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            initialValue="general"
          >
            <Select>
              <Option value="general">General</Option>
              <Option value="important">Important</Option>
              <Option value="question">Question</Option>
              <Option value="idea">Idea</Option>
              <Option value="bug">Bug</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Diagram Modal */}
      <Modal
        title="Edit Mermaid Diagram"
        open={isEditModalVisible}
        onOk={handleSaveDiagram}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="diagram"
            label="Mermaid Diagram Code"
            rules={[{ required: true, message: 'Please enter diagram code' }]}
          >
            <TextArea 
              rows={15} 
              placeholder="Enter your Mermaid diagram code here..."
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
          <Alert
            message="Mermaid Syntax Help"
            description="Use standard Mermaid syntax. Supported diagram types: flowchart, sequence, gantt, class, state, pie, gitgraph, journey."
            type="info"
            showIcon
          />
        </Form>
      </Modal>

      {/* Export Modal */}
      <Modal
        title="Export Diagram"
        open={isExportModalVisible}
        onOk={handleExport}
        onCancel={() => {
          setIsExportModalVisible(false);
          exportForm.resetFields();
        }}
        confirmLoading={isLoading}
      >
        <Form
          form={exportForm}
          layout="vertical"
          initialValues={{
            format: 'png',
            quality: 'high',
            includeNotes: true,
            includeAnnotations: true
          }}
        >
          <Form.Item
            name="format"
            label="Export Format"
            rules={[{ required: true, message: 'Please select export format' }]}
          >
            <Select>
              <Option value="png">PNG</Option>
              <Option value="svg">SVG</Option>
              <Option value="pdf">PDF</Option>
              <Option value="jpg">JPG</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="quality"
            label="Quality"
          >
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="includeNotes"
            valuePropName="checked"
          >
            <Switch>Include Notes</Switch>
          </Form.Item>
          <Form.Item
            name="includeAnnotations"
            valuePropName="checked"
          >
            <Switch>Include Annotations</Switch>
          </Form.Item>
        </Form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        title="Diagram Settings"
        open={isSettingsModalVisible}
        onOk={() => setIsSettingsModalVisible(false)}
        onCancel={() => setIsSettingsModalVisible(false)}
        width={600}
      >
        <Tabs defaultActiveKey="appearance">
          <TabPane tab="Appearance" key="appearance">
            <Form layout="vertical">
              <Form.Item label="Theme">
                <Select
                  value={config.theme}
                  onChange={(value) => onConfigChange?.({ ...config, theme: value })}
                >
                  <Option value="default">Default</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="forest">Forest</Option>
                  <Option value="neutral">Neutral</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Font Size">
                <Slider
                  min={10}
                  max={24}
                  value={config.fontSize || 16}
                  onChange={(value) => onConfigChange?.({ ...config, fontSize: value })}
                />
              </Form.Item>
              <Form.Item label="Background Color">
                <ColorPicker
                  value={config.backgroundColor}
                  onChange={(color) => onConfigChange?.({ ...config, backgroundColor: color.toHexString() })}
                />
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Interactions" key="interactions">
            <Form layout="vertical">
              <Form.Item label="Enable Notes">
                <Switch
                  checked={config.showNotes !== false}
                  onChange={(checked) => onConfigChange?.({ ...config, showNotes: checked })}
                />
              </Form.Item>
              <Form.Item label="Enable Annotations">
                <Switch
                  checked={config.showAnnotations !== false}
                  onChange={(checked) => onConfigChange?.({ ...config, showAnnotations: checked })}
                />
              </Form.Item>
              <Form.Item label="Enable Zoom">
                <Switch
                  checked={config.enableZoom !== false}
                  onChange={(checked) => onConfigChange?.({ ...config, enableZoom: checked })}
                />
              </Form.Item>
              <Form.Item label="Enable Pan">
                <Switch
                  checked={config.enablePan !== false}
                  onChange={(checked) => onConfigChange?.({ ...config, enablePan: checked })}
                />
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>

      {/* Annotations Drawer */}
      <Drawer
        title="Notes & Annotations"
        placement="right"
        width={400}
        open={isAnnotationDrawerVisible}
        onClose={() => setIsAnnotationDrawerVisible(false)}
      >
        <Tabs defaultActiveKey="notes">
          <TabPane tab={`Notes (${notes.length})`} key="notes">
            <div className="notes-list">
              {notes.map(note => (
                <Card
                  key={note.id}
                  size="small"
                  className="note-card"
                  style={{ borderLeft: `4px solid ${note.color}` }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedNote(note);
                        setIsNoteModalVisible(true);
                        setIsAnnotationDrawerVisible(false);
                      }}
                    />,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteNote(note.id)}
                    />
                  ]}
                >
                  <div>
                    <Text strong>{note.content}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {note.category} • {new Date(note.timestamp).toLocaleString()}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Node: {note.nodeId}
                    </Text>
                  </div>
                </Card>
              ))}
              {notes.length === 0 && (
                <Empty
                  description="No notes yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>
          <TabPane tab={`Annotations (${annotations.length})`} key="annotations">
            <div className="annotations-list">
              {annotations.map(annotation => (
                <Card
                  key={annotation.id}
                  size="small"
                  className="annotation-card"
                  style={{ borderLeft: `4px solid ${annotation.color}` }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedAnnotation(annotation);
                        setIsAnnotationDrawerVisible(false);
                      }}
                    />,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setAnnotations(prev => prev.filter(a => a.id !== annotation.id));
                        onAnnotationDelete?.(annotation.id);
                      }}
                    />
                  ]}
                >
                  <div>
                    <Text strong>{annotation.type}</Text>
                    {annotation.content && (
                      <>
                        <br />
                        <Text>{annotation.content}</Text>
                      </>
                    )}
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Target: {annotation.targetNode}
                    </Text>
                  </div>
                </Card>
              ))}
              {annotations.length === 0 && (
                <Empty
                  description="No annotations yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Drawer>
    </div>
  );
};

export default InteractiveMermaidChart;
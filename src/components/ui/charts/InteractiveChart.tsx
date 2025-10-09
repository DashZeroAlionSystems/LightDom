/**
 * Interactive Chart Component with Advanced Features
 * Supports notes, zoom, annotations, export, and more interactive capabilities
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Line, Bar, Area, Pie, Scatter, Column } from '@ant-design/plots';
import {
  Card,
  Button,
  Space,
  Modal,
  Input,
  Select,
  ColorPicker,
  Slider,
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
  DatePicker,
  Checkbox,
  Radio,
  Upload,
  Progress
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
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  DotChartOutlined,
  ColumnChartOutlined,
  PaletteOutlined,
  FontSizeOutlined,
  BorderOutlined,
  BackgroundOutlined,
  GridOutlined,
  AxisOutlined,
  LegendOutlined,
  DataOutlined,
  CalendarOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Brush, AreaChart, BarChart, PieChart, Cell, ScatterChart, ComposedChart } from 'recharts';
import './InteractiveChart.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export interface ChartNote {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
  timestamp: number;
  author: string;
  isVisible: boolean;
  category: string;
}

export interface ChartAnnotation {
  id: string;
  type: 'line' | 'area' | 'point' | 'text';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  content?: string;
  color: string;
  isVisible: boolean;
  style?: React.CSSProperties;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'column';
  data: any[];
  xField: string;
  yField: string;
  colorField?: string;
  title?: string;
  description?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showBrush?: boolean;
  enableZoom?: boolean;
  enableNotes?: boolean;
  enableAnnotations?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  colors?: string[];
  height?: number;
  width?: number;
}

interface InteractiveChartProps {
  config: ChartConfig;
  onConfigChange?: (config: ChartConfig) => void;
  onNoteAdd?: (note: ChartNote) => void;
  onNoteUpdate?: (note: ChartNote) => void;
  onNoteDelete?: (noteId: string) => void;
  onAnnotationAdd?: (annotation: ChartAnnotation) => void;
  onAnnotationUpdate?: (annotation: ChartAnnotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
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
  const [notes, setNotes] = useState<ChartNote[]>([]);
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([]);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isAnnotationDrawerVisible, setIsAnnotationDrawerVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ChartNote | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<ChartAnnotation | null>(null);
  const [noteForm] = Form.useForm();
  const [annotationForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [showNotes, setShowNotes] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brushRange, setBrushRange] = useState<[number, number] | null>(null);
  const [filteredData, setFilteredData] = useState(config.data);
  const [timeRange, setTimeRange] = useState<[string, string] | null>(null);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataPoints, setSelectedDataPoints] = useState<number[]>([]);
  const [chartRef, setChartRef] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const noteIdCounter = useRef(0);
  const annotationIdCounter = useRef(0);

  // Initialize filtered data
  useEffect(() => {
    let filtered = [...config.data];
    
    // Apply time range filter
    if (timeRange && config.xField) {
      filtered = filtered.filter(item => {
        const date = new Date(item[config.xField]);
        return date >= new Date(timeRange[0]) && date <= new Date(timeRange[1]);
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.field];
        const bVal = b[sortConfig.field];
        if (sortConfig.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    setFilteredData(filtered);
  }, [config.data, timeRange, searchQuery, sortConfig, config.xField]);

  // Handle zoom functionality
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.2 : 0.8;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel * factor));
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  // Handle pan functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

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
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel * factor));
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  // Add note functionality
  const handleAddNote = useCallback((e: React.MouseEvent) => {
    if (!config.enableNotes) return;
    
    const rect = chartContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const newNote: ChartNote = {
      id: `note_${noteIdCounter.current++}`,
      x,
      y,
      content: '',
      color: '#1890ff',
      timestamp: Date.now(),
      author: 'User',
      isVisible: true,
      category: 'general'
    };
    
    setSelectedNote(newNote);
    setIsNoteModalVisible(true);
  }, [config.enableNotes]);

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
  const handleAddAnnotation = useCallback((type: ChartAnnotation['type']) => {
    const newAnnotation: ChartAnnotation = {
      id: `annotation_${annotationIdCounter.current++}`,
      type,
      startX: 0,
      startY: 0,
      color: '#ff4d4f',
      isVisible: true,
      content: type === 'text' ? 'New annotation' : undefined
    };
    
    setSelectedAnnotation(newAnnotation);
    setIsAnnotationDrawerVisible(true);
  }, []);

  // Export chart
  const handleExport = useCallback(async () => {
    try {
      const values = await exportForm.validateFields();
      const { format, quality, includeNotes, includeAnnotations } = values;
      
      setIsLoading(true);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would use a library like html2canvas or similar
      message.success(`Chart exported as ${format.toUpperCase()} successfully`);
      setIsExportModalVisible(false);
      exportForm.resetFields();
    } catch (error) {
      console.error('Error exporting chart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [exportForm]);

  // Reset zoom and pan
  const handleResetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setBrushRange(null);
  }, []);

  // Toggle fullscreen
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Render chart based on type
  const renderChart = () => {
    const chartProps = {
      data: filteredData,
      xField: config.xField,
      yField: config.yField,
      colorField: config.colorField,
      height: config.height || 400,
      width: config.width,
      smooth: true,
      point: {
        size: 4,
        shape: 'circle',
      },
      tooltip: {
        showTitle: true,
        showMarkers: true,
        showContent: true,
        formatter: (datum: any) => ({
          name: datum[config.yField],
          value: `${datum[config.yField]}%`,
        }),
      },
      legend: {
        position: 'top-right' as const,
        visible: config.showLegend !== false,
      },
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineWidth: 1,
          },
        },
        visible: config.showGrid !== false,
      },
      brush: config.showBrush ? {
        enabled: true,
        type: 'x-rect' as const,
        action: 'filter' as const,
      } : undefined,
    };

    switch (config.type) {
      case 'line':
        return <Line {...chartProps} />;
      case 'bar':
        return <Bar {...chartProps} />;
      case 'area':
        return <Area {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'scatter':
        return <Scatter {...chartProps} />;
      case 'column':
        return <Column {...chartProps} />;
      default:
        return <Line {...chartProps} />;
    }
  };

  // Toolbar component
  const Toolbar = () => (
    <div className="interactive-chart-toolbar">
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

        {/* Annotation Tools */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'line',
                label: 'Add Line',
                icon: <LineChartOutlined />,
                onClick: () => handleAddAnnotation('line')
              },
              {
                key: 'area',
                label: 'Add Area',
                icon: <AreaChartOutlined />,
                onClick: () => handleAddAnnotation('area')
              },
              {
                key: 'point',
                label: 'Add Point',
                icon: <DotChartOutlined />,
                onClick: () => handleAddAnnotation('point')
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
          <Button icon={<HighlightOutlined />}>
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
    <div className="interactive-chart-notes-overlay">
      {notes.filter(note => note.isVisible && showNotes).map(note => (
        <div
          key={note.id}
          className="chart-note"
          style={{
            left: `${note.x * 100}%`,
            top: `${note.y * 100}%`,
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
      className={`interactive-chart-container ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      style={style}
    >
      <Card
        title={
          <div className="interactive-chart-header">
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {config.title || 'Interactive Chart'}
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
          </Space>
        }
        className="interactive-chart-card"
      >
        {/* Filters and Search */}
        <div className="interactive-chart-filters">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search data..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                placeholder={['Start Date', 'End Date']}
                value={timeRange ? [timeRange[0] as any, timeRange[1] as any] : null}
                onChange={(dates) => setTimeRange(dates ? [dates[0]?.format('YYYY-MM-DD') || '', dates[1]?.format('YYYY-MM-DD') || ''] : null)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Sort by..."
                value={sortConfig?.field}
                onChange={(field) => setSortConfig(field ? { field, direction: 'asc' } : null)}
                allowClear
                style={{ width: '100%' }}
              >
                {config.data.length > 0 && Object.keys(config.data[0]).map(key => (
                  <Option key={key} value={key}>{key}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchQuery('');
                  setTimeRange(null);
                  setSortConfig(null);
                  setBrushRange(null);
                }}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </div>

        {/* Chart Container */}
        <div
          ref={chartContainerRef}
          className="interactive-chart-content"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
            cursor: isPanning ? 'grabbing' : 'grab',
            position: 'relative'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleAddNote}
        >
          {renderChart()}
          <NotesOverlay />
        </div>

        {/* Data Summary */}
        <div className="interactive-chart-summary">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Data Points"
                value={filteredData.length}
                prefix={<DataOutlined />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Notes"
                value={notes.length}
                prefix={<BookOutlined />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Annotations"
                value={annotations.length}
                prefix={<HighlightOutlined />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Zoom Level"
                value={`${Math.round(zoomLevel * 100)}%`}
                prefix={<ZoomInOutlined />}
              />
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

      {/* Export Modal */}
      <Modal
        title="Export Chart"
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
            <Radio.Group>
              <Radio value="png">PNG</Radio>
              <Radio value="svg">SVG</Radio>
              <Radio value="pdf">PDF</Radio>
              <Radio value="jpg">JPG</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="quality"
            label="Quality"
          >
            <Radio.Group>
              <Radio value="low">Low</Radio>
              <Radio value="medium">Medium</Radio>
              <Radio value="high">High</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="includeNotes"
            valuePropName="checked"
          >
            <Checkbox>Include Notes</Checkbox>
          </Form.Item>
          <Form.Item
            name="includeAnnotations"
            valuePropName="checked"
          >
            <Checkbox>Include Annotations</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        title="Chart Settings"
        open={isSettingsModalVisible}
        onOk={() => setIsSettingsModalVisible(false)}
        onCancel={() => setIsSettingsModalVisible(false)}
        width={800}
      >
        <Tabs defaultActiveKey="appearance">
          <TabPane tab="Appearance" key="appearance">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form layout="vertical">
                  <Form.Item label="Chart Type">
                    <Select
                      value={config.type}
                      onChange={(value) => onConfigChange?.({ ...config, type: value })}
                    >
                      <Option value="line">Line Chart</Option>
                      <Option value="bar">Bar Chart</Option>
                      <Option value="area">Area Chart</Option>
                      <Option value="pie">Pie Chart</Option>
                      <Option value="scatter">Scatter Plot</Option>
                      <Option value="column">Column Chart</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Theme">
                    <Select
                      value={config.theme || 'auto'}
                      onChange={(value) => onConfigChange?.({ ...config, theme: value })}
                    >
                      <Option value="light">Light</Option>
                      <Option value="dark">Dark</Option>
                      <Option value="auto">Auto</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Height">
                    <Slider
                      min={200}
                      max={800}
                      value={config.height || 400}
                      onChange={(value) => onConfigChange?.({ ...config, height: value })}
                    />
                  </Form.Item>
                </Form>
              </Col>
              <Col span={12}>
                <Form layout="vertical">
                  <Form.Item label="Show Grid">
                    <Switch
                      checked={config.showGrid !== false}
                      onChange={(checked) => onConfigChange?.({ ...config, showGrid: checked })}
                    />
                  </Form.Item>
                  <Form.Item label="Show Legend">
                    <Switch
                      checked={config.showLegend !== false}
                      onChange={(checked) => onConfigChange?.({ ...config, showLegend: checked })}
                    />
                  </Form.Item>
                  <Form.Item label="Show Tooltip">
                    <Switch
                      checked={config.showTooltip !== false}
                      onChange={(checked) => onConfigChange?.({ ...config, showTooltip: checked })}
                    />
                  </Form.Item>
                  <Form.Item label="Enable Zoom">
                    <Switch
                      checked={config.enableZoom !== false}
                      onChange={(checked) => onConfigChange?.({ ...config, enableZoom: checked })}
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Data" key="data">
            <Form layout="vertical">
              <Form.Item label="X Field">
                <Select
                  value={config.xField}
                  onChange={(value) => onConfigChange?.({ ...config, xField: value })}
                >
                  {config.data.length > 0 && Object.keys(config.data[0]).map(key => (
                    <Option key={key} value={key}>{key}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Y Field">
                <Select
                  value={config.yField}
                  onChange={(value) => onConfigChange?.({ ...config, yField: value })}
                >
                  {config.data.length > 0 && Object.keys(config.data[0]).map(key => (
                    <Option key={key} value={key}>{key}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Color Field">
                <Select
                  value={config.colorField}
                  onChange={(value) => onConfigChange?.({ ...config, colorField: value })}
                  allowClear
                >
                  {config.data.length > 0 && Object.keys(config.data[0]).map(key => (
                    <Option key={key} value={key}>{key}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Interactions" key="interactions">
            <Form layout="vertical">
              <Form.Item label="Enable Notes">
                <Switch
                  checked={config.enableNotes !== false}
                  onChange={(checked) => onConfigChange?.({ ...config, enableNotes: checked })}
                />
              </Form.Item>
              <Form.Item label="Enable Annotations">
                <Switch
                  checked={config.enableAnnotations !== false}
                  onChange={(checked) => onConfigChange?.({ ...config, enableAnnotations: checked })}
                />
              </Form.Item>
              <Form.Item label="Show Brush">
                <Switch
                  checked={config.showBrush !== false}
                  onChange={(checked) => onConfigChange?.({ ...config, showBrush: checked })}
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
                      {new Date().toLocaleString()}
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

export default InteractiveChart;
/**
 * Visual Component Builder
 * 
 * Drag-and-drop component builder with:
 * - Component library integration
 * - Schema-based configuration
 * - Visual property editor
 * - Real-time preview
 * - Export to code
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Slider,
  Switch,
  ColorPicker,
  Space,
  Typography,
  Divider,
  Tabs,
  Form,
  notification,
  Tag,
  Collapse,
} from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AppstoreAddOutlined,
  CodeOutlined,
  EyeOutlined,
  SaveOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

interface ComponentProperty {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'slider';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
}

interface Component {
  id: string;
  type: string;
  label: string;
  properties: ComponentProperty[];
  children?: Component[];
}

interface ComponentLibraryItem {
  id: string;
  type: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  defaultProperties: ComponentProperty[];
  schema: any;
}

const componentLibrary: ComponentLibraryItem[] = [
  {
    id: 'button',
    type: 'button',
    name: 'Button',
    category: 'Basic',
    icon: <AppstoreAddOutlined />,
    defaultProperties: [
      { id: 'text', name: 'Text', type: 'string', value: 'Click me' },
      { id: 'type', name: 'Type', type: 'select', value: 'primary', options: ['primary', 'default', 'dashed', 'link'] },
      { id: 'size', name: 'Size', type: 'select', value: 'middle', options: ['small', 'middle', 'large'] },
      { id: 'disabled', name: 'Disabled', type: 'boolean', value: false },
    ],
    schema: {
      '@type': 'WebPageElement',
      '@context': 'https://schema.org',
    },
  },
  {
    id: 'card',
    type: 'card',
    name: 'Card',
    category: 'Layout',
    icon: <AppstoreAddOutlined />,
    defaultProperties: [
      { id: 'title', name: 'Title', type: 'string', value: 'Card Title' },
      { id: 'bordered', name: 'Bordered', type: 'boolean', value: true },
      { id: 'hoverable', name: 'Hoverable', type: 'boolean', value: false },
    ],
    schema: {
      '@type': 'Thing',
      '@context': 'https://schema.org',
    },
  },
  {
    id: 'input',
    type: 'input',
    name: 'Input',
    category: 'Form',
    icon: <AppstoreAddOutlined />,
    defaultProperties: [
      { id: 'placeholder', name: 'Placeholder', type: 'string', value: 'Enter text...' },
      { id: 'size', name: 'Size', type: 'select', value: 'middle', options: ['small', 'middle', 'large'] },
      { id: 'disabled', name: 'Disabled', type: 'boolean', value: false },
      { id: 'maxLength', name: 'Max Length', type: 'number', value: 100 },
    ],
    schema: {
      '@type': 'WebPageElement',
      '@context': 'https://schema.org',
    },
  },
];

const SortableComponent: React.FC<{
  component: Component;
  onSelect: (component: Component) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}> = ({ component, onSelect, onDelete, isSelected }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        size="small"
        style={{
          marginBottom: '8px',
          cursor: 'move',
          border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
        }}
        bodyStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={() => onSelect(component)}
      >
        <div {...listeners} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <AppstoreAddOutlined style={{ marginRight: '8px' }} />
          <Space direction="vertical" size={0}>
            <Text strong>{component.label}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {component.type}
            </Text>
          </Space>
        </div>
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(component.id);
          }}
        />
      </Card>
    </div>
  );
};

export const VisualComponentBuilder: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [activeTab, setActiveTab] = useState('builder');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setComponents((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return items;
      }

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleAddComponent = (libraryItem: ComponentLibraryItem) => {
    const newComponent: Component = {
      id: `${libraryItem.type}_${Date.now()}`,
      type: libraryItem.type,
      label: libraryItem.name,
      properties: JSON.parse(JSON.stringify(libraryItem.defaultProperties)),
    };

    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
    notification.success({
      message: 'Component added',
      description: `${libraryItem.name} has been added to the canvas`,
    });
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
    notification.success({ message: 'Component deleted' });
  };

  const handlePropertyChange = (propertyId: string, value: any) => {
    if (!selectedComponent) return;

    setComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === selectedComponent.id) {
          return {
            ...comp,
            properties: comp.properties.map((prop) =>
              prop.id === propertyId ? { ...prop, value } : prop
            ),
          };
        }
        return comp;
      })
    );

    setSelectedComponent((prev) =>
      prev
        ? {
            ...prev,
            properties: prev.properties.map((prop) =>
              prop.id === propertyId ? { ...prop, value } : prop
            ),
          }
        : null
    );
  };

  const renderPropertyEditor = (property: ComponentProperty) => {
    switch (property.type) {
      case 'string':
        return (
          <Input
            value={property.value}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            placeholder={`Enter ${property.name}`}
          />
        );

      case 'number':
        return (
          <Slider
            min={property.min || 0}
            max={property.max || 100}
            value={property.value}
            onChange={(value) => handlePropertyChange(property.id, value)}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={property.value}
            onChange={(checked) => handlePropertyChange(property.id, checked)}
          />
        );

      case 'color':
        return (
          <ColorPicker
            value={property.value}
            onChange={(color) => handlePropertyChange(property.id, color.toHexString())}
          />
        );

      case 'select':
        return (
          <Select
            value={property.value}
            onChange={(value) => handlePropertyChange(property.id, value)}
            style={{ width: '100%' }}
          >
            {property.options?.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        );

      case 'slider':
        return (
          <Slider
            min={property.min || 0}
            max={property.max || 100}
            value={property.value}
            onChange={(value) => handlePropertyChange(property.id, value)}
          />
        );

      default:
        return null;
    }
  };

  const generateCode = () => {
    const code = components
      .map((comp) => {
        const props = comp.properties
          .map((prop) => {
            if (prop.type === 'boolean') {
              return prop.value ? prop.name : '';
            }
            return `${prop.id}="${prop.value}"`;
          })
          .filter(Boolean)
          .join(' ');

        return `<${comp.type.charAt(0).toUpperCase() + comp.type.slice(1)} ${props} />`;
      })
      .join('\n');

    return code;
  };

  const generateSchema = () => {
    const schema = {
      '@context': 'https://schema.org',
      '@graph': components.map((comp) => {
        const libraryItem = componentLibrary.find((item) => item.type === comp.type);
        return {
          ...libraryItem?.schema,
          id: comp.id,
          properties: comp.properties.reduce((acc, prop) => {
            acc[prop.id] = prop.value;
            return acc;
          }, {} as Record<string, any>),
        };
      }),
    };

    return JSON.stringify(schema, null, 2);
  };

  const handleExport = () => {
    const config = {
      components,
      code: generateCode(),
      schema: generateSchema(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    notification.success({ message: 'Configuration exported' });
  };

  const groupedLibrary = componentLibrary.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ComponentLibraryItem[]>);

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <AppstoreAddOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Visual Component Builder
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SaveOutlined />} onClick={handleExport}>
              Save
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Export
            </Button>
          </Space>
        }
      >
        <Row gutter={24}>
          {/* Component Library */}
          <Col span={6}>
            <Card title="Component Library" size="small">
              <Collapse accordion>
                {Object.entries(groupedLibrary).map(([category, items]) => (
                  <Panel header={category} key={category}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {items.map((item) => (
                        <Card
                          key={item.id}
                          size="small"
                          hoverable
                          onClick={() => handleAddComponent(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Space>
                            {item.icon}
                            <Text>{item.name}</Text>
                          </Space>
                        </Card>
                      ))}
                    </Space>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </Col>

          {/* Canvas */}
          <Col span={12}>
            <Card title="Canvas" size="small">
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab={<span><AppstoreAddOutlined /> Builder</span>} key="builder">
                  {components.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '48px',
                        background: '#fafafa',
                        borderRadius: '8px',
                      }}
                    >
                      <AppstoreAddOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                      <Paragraph style={{ marginTop: '16px', color: '#8c8c8c' }}>
                        Drag components from the library to start building
                      </Paragraph>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={components.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {components.map((component) => (
                          <SortableComponent
                            key={component.id}
                            component={component}
                            onSelect={setSelectedComponent}
                            onDelete={handleDeleteComponent}
                            isSelected={selectedComponent?.id === component.id}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </TabPane>

                <TabPane tab={<span><CodeOutlined /> Code</span>} key="code">
                  <TextArea
                    value={generateCode()}
                    rows={15}
                    readOnly
                    style={{ fontFamily: 'monospace' }}
                  />
                </TabPane>

                <TabPane tab={<span><EyeOutlined /> Schema</span>} key="schema">
                  <TextArea
                    value={generateSchema()}
                    rows={15}
                    readOnly
                    style={{ fontFamily: 'monospace' }}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* Properties Panel */}
          <Col span={6}>
            <Card title="Properties" size="small">
              {selectedComponent ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Component: </Text>
                    <Tag color="blue">{selectedComponent.type}</Tag>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <Form layout="vertical">
                    {selectedComponent.properties.map((property) => (
                      <Form.Item key={property.id} label={property.name}>
                        {renderPropertyEditor(property)}
                      </Form.Item>
                    ))}
                  </Form>
                </Space>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#8c8c8c' }}>
                  Select a component to edit its properties
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default VisualComponentBuilder;

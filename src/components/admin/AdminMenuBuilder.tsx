/**
 * Admin Menu Builder with Drag & Drop
 * 
 * Features:
 * - Drag and drop menu items
 * - Create/edit/delete menu sections
 * - Visual menu structure editor
 * - Nested menu support
 * - Action bar for quick edits
 */

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
  Button,
  Card,
  Input,
  Select,
  Space,
  Typography,
  Modal,
  Form,
  notification,
  Divider,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
  SaveOutlined,
  AppstoreOutlined,
  SettingOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  RocketOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  order: number;
  section: string;
  children?: MenuItem[];
}

interface MenuSection {
  id: string;
  name: string;
  order: number;
  items: MenuItem[];
}

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  database: <DatabaseOutlined />,
  settings: <SettingOutlined />,
  apps: <AppstoreOutlined />,
  rocket: <RocketOutlined />,
  menu: <MenuOutlined />,
};

const SortableMenuItem: React.FC<{
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}> = ({ item, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="sortable-menu-item"
    >
      <Card
        size="small"
        style={{ marginBottom: '8px', cursor: 'move' }}
        bodyStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Space>
          <div {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
            <MenuOutlined style={{ marginRight: '12px', color: '#8c8c8c' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {iconMap[item.icon] || <MenuOutlined />}
            <Text strong>{item.label}</Text>
            <Tag color="blue">{item.path}</Tag>
          </div>
        </Space>
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(item)}
          />
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(item.id)}
          />
        </Space>
      </Card>
    </div>
  );
};

export const AdminMenuBuilder: React.FC = () => {
  const [sections, setSections] = useState<MenuSection[]>([
    {
      id: 'main',
      name: 'Main Navigation',
      order: 1,
      items: [
        {
          id: '1',
          label: 'Dashboard',
          icon: 'dashboard',
          path: '/admin',
          order: 1,
          section: 'main',
        },
        {
          id: '2',
          label: 'Styleguide Config',
          icon: 'apps',
          path: '/admin/styleguide-config',
          order: 2,
          section: 'main',
        },
      ],
    },
    {
      id: 'advanced',
      name: 'Advanced',
      order: 2,
      items: [
        {
          id: '3',
          label: 'Database',
          icon: 'database',
          path: '/admin/database',
          order: 1,
          section: 'advanced',
        },
        {
          id: '4',
          label: 'Settings',
          icon: 'settings',
          path: '/admin/settings',
          order: 2,
          section: 'advanced',
        },
      ],
    },
  ]);

  const [activeSection, setActiveSection] = useState<string>('main');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);

  const [form] = Form.useForm();
  const [sectionForm] = Form.useForm();

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

    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id !== activeSection) {
          return section;
        }

        const oldIndex = section.items.findIndex((item) => item.id === active.id);
        const newIndex = section.items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return section;
        }

        return {
          ...section,
          items: arrayMove(section.items, oldIndex, newIndex).map((item, idx) => ({
            ...item,
            order: idx + 1,
          })),
        };
      });
    });

    notification.success({ message: 'Menu order updated' });
  };

  const handleAddMenuItem = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalVisible(true);
  };

  const handleDeleteMenuItem = (id: string) => {
    Modal.confirm({
      title: 'Delete menu item?',
      content: 'This action cannot be undone.',
      onOk: () => {
        setSections((prevSections) =>
          prevSections.map((section) =>
            section.id === activeSection
              ? {
                  ...section,
                  items: section.items.filter((item) => item.id !== id),
                }
              : section
          )
        );
        notification.success({ message: 'Menu item deleted' });
      },
    });
  };

  const handleSaveMenuItem = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        // Update existing item
        setSections((prevSections) =>
          prevSections.map((section) =>
            section.id === activeSection
              ? {
                  ...section,
                  items: section.items.map((item) =>
                    item.id === editingItem.id
                      ? { ...item, ...values }
                      : item
                  ),
                }
              : section
          )
        );
        notification.success({ message: 'Menu item updated' });
      } else {
        // Add new item
        const newItem: MenuItem = {
          id: `item_${Date.now()}`,
          ...values,
          section: activeSection,
          order: sections.find((s) => s.id === activeSection)?.items.length || 0 + 1,
        };

        setSections((prevSections) =>
          prevSections.map((section) =>
            section.id === activeSection
              ? {
                  ...section,
                  items: [...section.items, newItem],
                }
              : section
          )
        );
        notification.success({ message: 'Menu item added' });
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleAddSection = () => {
    setEditingSection(null);
    sectionForm.resetFields();
    setIsSectionModalVisible(true);
  };

  const handleEditSection = (section: MenuSection) => {
    setEditingSection(section);
    sectionForm.setFieldsValue(section);
    setIsSectionModalVisible(true);
  };

  const handleSaveSection = async () => {
    try {
      const values = await sectionForm.validateFields();

      if (editingSection) {
        // Update existing section
        setSections((prevSections) =>
          prevSections.map((section) =>
            section.id === editingSection.id
              ? { ...section, ...values }
              : section
          )
        );
        notification.success({ message: 'Section updated' });
      } else {
        // Add new section
        const newSection: MenuSection = {
          id: `section_${Date.now()}`,
          ...values,
          items: [],
          order: sections.length + 1,
        };

        setSections([...sections, newSection]);
        notification.success({ message: 'Section added' });
      }

      setIsSectionModalVisible(false);
      sectionForm.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeleteSection = (id: string) => {
    Modal.confirm({
      title: 'Delete section?',
      content: 'All menu items in this section will be deleted.',
      onOk: () => {
        setSections((prevSections) => prevSections.filter((s) => s.id !== id));
        if (activeSection === id && sections.length > 0) {
          setActiveSection(sections[0].id);
        }
        notification.success({ message: 'Section deleted' });
      },
    });
  };

  const handleExportConfig = () => {
    const config = {
      sections,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-menu-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    notification.success({ message: 'Configuration exported' });
  };

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={24}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <MenuOutlined />
                <Title level={3} style={{ margin: 0 }}>
                  Admin Menu Builder
                </Title>
              </Space>
            }
            extra={
              <Space>
                <Button icon={<SaveOutlined />} onClick={handleExportConfig}>
                  Export Config
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddSection}
                >
                  Add Section
                </Button>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={6}>
                <Card title="Sections" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {sections.map((section) => (
                      <div key={section.id} style={{ marginBottom: '8px' }}>
                        <Card
                          size="small"
                          className={activeSection === section.id ? 'active-section' : ''}
                          onClick={() => setActiveSection(section.id)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: activeSection === section.id ? '#e6f7ff' : 'white',
                          }}
                          bodyStyle={{ padding: '8px' }}
                          extra={
                            <Space>
                              <Button
                                type="link"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSection(section);
                                }}
                              />
                              <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.id);
                                }}
                              />
                            </Space>
                          }
                        >
                          <Text strong>{section.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {section.items.length} items
                          </Text>
                        </Card>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>

              <Col span={18}>
                <Card
                  title={`${currentSection?.name || 'Select a section'}`}
                  extra={
                    currentSection && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddMenuItem}
                      >
                        Add Menu Item
                      </Button>
                    )
                  }
                >
                  {currentSection && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={currentSection.items.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {currentSection.items.map((item) => (
                          <SortableMenuItem
                            key={item.id}
                            item={item}
                            onEdit={handleEditMenuItem}
                            onDelete={handleDeleteMenuItem}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                  {!currentSection && (
                    <div style={{ textAlign: 'center', padding: '48px' }}>
                      <Text type="secondary">Select a section to view and edit menu items</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Menu Item Modal */}
      <Modal
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
        open={isModalVisible}
        onOk={handleSaveMenuItem}
        onCancel={() => setIsModalVisible(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Label"
            name="label"
            rules={[{ required: true, message: 'Please enter a label' }]}
          >
            <Input placeholder="Menu item label" />
          </Form.Item>

          <Form.Item
            label="Icon"
            name="icon"
            rules={[{ required: true, message: 'Please select an icon' }]}
            initialValue="menu"
          >
            <Select>
              <Option value="dashboard">
                <DashboardOutlined /> Dashboard
              </Option>
              <Option value="database">
                <DatabaseOutlined /> Database
              </Option>
              <Option value="settings">
                <SettingOutlined /> Settings
              </Option>
              <Option value="apps">
                <AppstoreOutlined /> Apps
              </Option>
              <Option value="rocket">
                <RocketOutlined /> Rocket
              </Option>
              <Option value="menu">
                <MenuOutlined /> Menu
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Path"
            name="path"
            rules={[{ required: true, message: 'Please enter a path' }]}
          >
            <Input placeholder="/admin/path" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Section Modal */}
      <Modal
        title={editingSection ? 'Edit Section' : 'Add Section'}
        open={isSectionModalVisible}
        onOk={handleSaveSection}
        onCancel={() => setIsSectionModalVisible(false)}
        okText="Save"
      >
        <Form form={sectionForm} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Section name" />
          </Form.Item>
        </Form>
      </Modal>

      <style>
        {`
          .sortable-menu-item {
            transition: all 0.2s ease;
          }
          
          .active-section {
            border-color: #1890ff !important;
          }
        `}
      </style>
    </div>
  );
};

export default AdminMenuBuilder;

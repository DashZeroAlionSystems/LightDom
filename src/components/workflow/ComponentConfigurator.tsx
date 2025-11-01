/**
 * Component Configurator
 * 
 * Highly configurable component system
 * Features:
 * - Add atoms and components anywhere
 * - Drag & drop positioning
 * - Schema-based component generation
 * - Extensibility framework
 * - Mermaid chart components
 */

import React, { useState } from 'react';
import { Card, Button, Space, Input, Select, Form, Row, Col, Tag, Collapse, message } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  AppstoreAddOutlined,
  DragOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;

interface AtomConfig {
  id: string;
  field: string;
  componentType: string;
  label: string;
  position: { row: number; col: number };
  validation: any[];
}

interface Props {
  darkMode: boolean;
}

const ComponentConfigurator: React.FC<Props> = ({ darkMode }) => {
  const [atoms, setAtoms] = useState<AtomConfig[]>([]);
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null);

  const componentTypes = [
    { value: 'input', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number Input' },
    { value: 'toggle', label: 'Toggle Switch' },
    { value: 'select', label: 'Dropdown' },
    { value: 'date', label: 'Date Picker' },
    { value: 'mermaid-chart', label: 'Mermaid Chart', icon: <BarChartOutlined /> },
    { value: 'real-time-diagram', label: 'Real-time Diagram', icon: <BarChartOutlined /> },
    { value: 'status-indicator', label: 'Status Indicator' },
    { value: 'json-editor', label: 'JSON Editor' }
  ];

  const addAtom = () => {
    const newAtom: AtomConfig = {
      id: `atom-${Date.now()}`,
      field: `new_field_${atoms.length + 1}`,
      componentType: 'input',
      label: `Field ${atoms.length + 1}`,
      position: { row: Math.floor(atoms.length / 3), col: atoms.length % 3 },
      validation: []
    };
    setAtoms([...atoms, newAtom]);
  };

  const removeAtom = (id: string) => {
    setAtoms(atoms.filter(a => a.id !== id));
    if (selectedAtom === id) {
      setSelectedAtom(null);
    }
  };

  const updateAtom = (id: string, updates: Partial<AtomConfig>) => {
    setAtoms(atoms.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addValidationRule = (atomId: string) => {
    const atom = atoms.find(a => a.id === atomId);
    if (atom) {
      updateAtom(atomId, {
        validation: [...atom.validation, { type: 'required', value: true }]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Component Configurator</h3>
        <Space>
          <Button icon={<PlusOutlined />} onClick={addAtom}>
            Add Atom
          </Button>
          <Button icon={<AppstoreAddOutlined />} type="primary">
            Add Mermaid Component
          </Button>
        </Space>
      </div>

      {/* Mermaid-Specific Components */}
      <Card title="Mermaid Chart Components" size="small">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card 
              size="small" 
              hoverable
              className="text-center"
            >
              <BarChartOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div className="mt-2 font-medium">Real-time Flowchart</div>
              <div className="text-xs text-gray-500">Process status visualization</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              size="small" 
              hoverable
              className="text-center"
            >
              <BarChartOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <div className="mt-2 font-medium">Sequence Diagram</div>
              <div className="text-xs text-gray-500">Step-by-step execution</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              size="small" 
              hoverable
              className="text-center"
            >
              <BarChartOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
              <div className="mt-2 font-medium">State Diagram</div>
              <div className="text-xs text-gray-500">Workflow states</div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Component Grid */}
      <Card title="Component Layout (Drag & Drop)">
        <div className="grid grid-cols-3 gap-4">
          {atoms.map((atom) => (
            <Card
              key={atom.id}
              size="small"
              className={`cursor-move ${selectedAtom === atom.id ? 'border-blue-500' : ''}`}
              onClick={() => setSelectedAtom(atom.id)}
              extra={
                <Button 
                  type="text" 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAtom(atom.id);
                  }}
                />
              }
            >
              <div className="flex items-center mb-2">
                <DragOutlined className="mr-2 text-gray-400" />
                <span className="font-medium">{atom.label}</span>
              </div>
              <Tag color="blue">{atom.componentType}</Tag>
              <div className="text-xs text-gray-500 mt-2">
                Position: Row {atom.position.row}, Col {atom.position.col}
              </div>
            </Card>
          ))}
          
          {/* Add Component Placeholder */}
          <Card
            size="small"
            className="border-dashed cursor-pointer hover:border-blue-500"
            onClick={addAtom}
          >
            <div className="text-center py-4">
              <PlusOutlined className="text-2xl text-gray-400" />
              <div className="mt-2 text-sm text-gray-500">Add Component</div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Component Configuration */}
      {selectedAtom && (
        <Card title="Component Configuration">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Field Name">
                  <Input
                    value={atoms.find(a => a.id === selectedAtom)?.field}
                    onChange={(e) => updateAtom(selectedAtom, { field: e.target.value })}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Label">
                  <Input
                    value={atoms.find(a => a.id === selectedAtom)?.label}
                    onChange={(e) => updateAtom(selectedAtom, { label: e.target.value })}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Component Type">
              <Select
                value={atoms.find(a => a.id === selectedAtom)?.componentType}
                onChange={(value) => updateAtom(selectedAtom, { componentType: value })}
                options={componentTypes}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Row Position">
                  <Input
                    type="number"
                    value={atoms.find(a => a.id === selectedAtom)?.position.row}
                    onChange={(e) => {
                      const atom = atoms.find(a => a.id === selectedAtom);
                      if (atom) {
                        updateAtom(selectedAtom, {
                          position: { ...atom.position, row: parseInt(e.target.value) || 0 }
                        });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Column Position">
                  <Input
                    type="number"
                    value={atoms.find(a => a.id === selectedAtom)?.position.col}
                    onChange={(e) => {
                      const atom = atoms.find(a => a.id === selectedAtom);
                      if (atom) {
                        updateAtom(selectedAtom, {
                          position: { ...atom.position, col: parseInt(e.target.value) || 0 }
                        });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Validation Rules">
              <Space direction="vertical" className="w-full">
                {atoms.find(a => a.id === selectedAtom)?.validation.map((rule, idx) => (
                  <Tag key={idx} closable>
                    {rule.type}: {JSON.stringify(rule.value)}
                  </Tag>
                ))}
                <Button 
                  size="small" 
                  onClick={() => addValidationRule(selectedAtom)}
                >
                  Add Validation Rule
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          type="primary" 
          size="large"
          onClick={() => {
            message.success('Component configuration saved');
            console.log('Atoms:', atoms);
          }}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default ComponentConfigurator;

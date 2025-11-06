import React, { useState, useEffect } from 'react';
import { Tabs, Card, Input, Select, Button, Tag, Switch, Collapse, Space, Tooltip, message } from 'antd';
import { 
  CodeOutlined, 
  EyeOutlined, 
  CopyOutlined, 
  SearchOutlined,
  AppstoreOutlined,
  LayoutOutlined,
  DragOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyAttribute, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

interface Component {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  preview: React.ReactNode;
  props?: Record<string, any>;
  tags: string[];
}

interface LayoutSlot {
  id: string;
  name: string;
  components: string[];
  gridArea?: string;
}

// Sample components library
const COMPONENT_LIBRARY: Component[] = [
  {
    id: 'button-primary',
    name: 'Primary Button',
    category: 'Buttons',
    description: 'Primary action button with filled style',
    tags: ['button', 'action', 'primary'],
    code: `<Button type="primary" size="large">
  Click Me
</Button>`,
    preview: <Button type="primary" size="large">Click Me</Button>
  },
  {
    id: 'card-elevated',
    name: 'Elevated Card',
    category: 'Cards',
    description: 'Card with elevation shadow',
    tags: ['card', 'container', 'surface'],
    code: `<Card 
  title="Card Title" 
  bordered={false}
  className="md3-card-elevated"
>
  <p>Card content goes here</p>
</Card>`,
    preview: (
      <Card title="Card Title" bordered={false} className="md3-card-elevated" style={{ width: 300 }}>
        <p>Card content goes here</p>
      </Card>
    )
  },
  {
    id: 'input-text',
    name: 'Text Input',
    category: 'Inputs',
    description: 'Standard text input field',
    tags: ['input', 'form', 'text'],
    code: `<Input 
  placeholder="Enter text..." 
  size="large"
  className="md3-input"
/>`,
    preview: <Input placeholder="Enter text..." size="large" className="md3-input" style={{ width: 300 }} />
  },
  {
    id: 'stat-card',
    name: 'Stat Card',
    category: 'Dashboard',
    description: 'KPI/Statistics display card',
    tags: ['stat', 'kpi', 'dashboard', 'metric'],
    code: `<Card className="md3-card-filled">
  <div className="flex flex-col">
    <span className="md3-label-medium text-on-surface-variant">Active Users</span>
    <span className="md3-display-small text-primary">12,540</span>
    <Tag color="success">+15.3%</Tag>
  </div>
</Card>`,
    preview: (
      <Card className="md3-card-filled" style={{ width: 200 }}>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-500">Active Users</span>
          <span className="text-3xl font-bold text-blue-500">12,540</span>
          <Tag color="success">+15.3%</Tag>
        </div>
      </Card>
    )
  },
  {
    id: 'search-bar',
    name: 'Search Bar',
    category: 'Inputs',
    description: 'Search input with icon',
    tags: ['search', 'input', 'filter'],
    code: `<Input 
  prefix={<SearchOutlined />}
  placeholder="Search..." 
  size="large"
/>`,
    preview: (
      <Input 
        prefix={<SearchOutlined />}
        placeholder="Search..." 
        size="large"
        style={{ width: 300 }}
      />
    )
  },
  {
    id: 'tag-group',
    name: 'Tag Group',
    category: 'Display',
    description: 'Group of tags/chips',
    tags: ['tag', 'chip', 'label'],
    code: `<Space>
  <Tag color="blue">Active</Tag>
  <Tag color="green">Verified</Tag>
  <Tag color="orange">Pending</Tag>
</Space>`,
    preview: (
      <Space>
        <Tag color="blue">Active</Tag>
        <Tag color="green">Verified</Tag>
        <Tag color="orange">Pending</Tag>
      </Space>
    )
  }
];

// Draggable Component Item
const DraggableComponent: React.FC<{ component: Component; isSelected: boolean; onToggle: () => void }> = ({ 
  component, 
  isSelected, 
  onToggle 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={`mb-4 cursor-pointer ${isSelected ? 'border-blue-500 border-2' : ''}`}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <DragOutlined {...listeners} className="cursor-move text-gray-400" />
              {component.name}
              {isSelected && <CheckCircleOutlined className="text-blue-500" />}
            </h4>
            <p className="text-sm text-gray-500">{component.description}</p>
          </div>
        </div>
        
        <div className="mb-3">
          <Space size="small" wrap>
            {component.tags.map(tag => (
              <Tag key={tag} color="blue">{tag}</Tag>
            ))}
          </Space>
        </div>

        <Collapse ghost>
          <Panel header="Preview" key="preview">
            <div className="bg-gray-50 p-4 rounded border">
              {component.preview}
            </div>
          </Panel>
          <Panel header="Code" key="code">
            <div className="relative">
              <pre className="language-tsx rounded bg-gray-900 p-4 text-sm overflow-x-auto">
                <code className="language-tsx">{component.code}</code>
              </pre>
              <Button
                icon={<CopyOutlined />}
                size="small"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(component.code);
                  message.success('Code copied!');
                }}
              >
                Copy
              </Button>
            </div>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
};

// Layout Slot Component
const LayoutSlotComponent: React.FC<{ 
  slot: LayoutSlot; 
  components: Component[];
  onRemove: (componentId: string) => void;
}> = ({ slot, components, onRemove }) => {
  const slotComponents = components.filter(c => slot.components.includes(c.id));

  return (
    <Card title={slot.name} className="mb-4">
      {slotComponents.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Drag components here
        </div>
      ) : (
        <Space direction="vertical" className="w-full">
          {slotComponents.map(component => (
            <Card key={component.id} size="small">
              <div className="flex items-center justify-between">
                <span>{component.name}</span>
                <Button 
                  size="small" 
                  danger 
                  onClick={() => onRemove(component.id)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </Space>
      )}
    </Card>
  );
};

export const ComponentLibraryBrowser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [showCodeView, setShowCodeView] = useState<Record<string, boolean>>({});
  const [layoutSlots, setLayoutSlots] = useState<LayoutSlot[]>([
    { id: 'header', name: 'Header', components: [] },
    { id: 'sidebar', name: 'Sidebar', components: [] },
    { id: 'main', name: 'Main Content', components: [] },
    { id: 'footer', name: 'Footer', components: [] }
  ]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    // Highlight code blocks
    Prism.highlightAll();
  }, [showCodeView]);

  // Filter components
  const filteredComponents = COMPONENT_LIBRARY.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(COMPONENT_LIBRARY.map(c => c.category))];

  const toggleComponentSelection = (componentId: string) => {
    const newSelection = new Set(selectedComponents);
    if (newSelection.has(componentId)) {
      newSelection.delete(componentId);
    } else {
      newSelection.add(componentId);
    }
    setSelectedComponents(newSelection);
  };

  const handleAIPlacement = async () => {
    if (!aiPrompt.trim()) {
      message.warning('Please enter a prompt describing your desired layout');
      return;
    }

    if (selectedComponents.size === 0) {
      message.warning('Please select at least one component');
      return;
    }

    setGenerating(true);

    try {
      // Call Ollama/DeepSeek API for AI-powered placement
      const response = await fetch('/api/ai/generate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          selectedComponents: Array.from(selectedComponents),
          currentLayout: layoutSlots,
          provider: 'ollama', // or 'deepseek'
        })
      });

      if (!response.ok) throw new Error('Failed to generate layout');

      const { layout } = await response.json();
      
      setLayoutSlots(layout);
      message.success('Layout generated successfully!');
    } catch (error) {
      console.error('AI placement error:', error);
      message.error('Failed to generate layout. Falling back to default placement.');
      
      // Fallback: simple placement
      const componentsArray = Array.from(selectedComponents);
      const newSlots = [...layoutSlots];
      
      // Simple heuristic placement
      componentsArray.forEach((compId, index) => {
        const component = COMPONENT_LIBRARY.find(c => c.id === compId);
        if (!component) return;

        if (component.category === 'Inputs' || component.tags.includes('search')) {
          newSlots[0].components.push(compId); // Header
        } else if (component.category === 'Dashboard' || component.tags.includes('stat')) {
          newSlots[2].components.push(compId); // Main
        } else if (component.category === 'Buttons') {
          newSlots[3].components.push(compId); // Footer
        } else {
          newSlots[2].components.push(compId); // Main (default)
        }
      });

      setLayoutSlots(newSlots);
    } finally {
      setGenerating(false);
    }
  };

  const removeFromSlot = (componentId: string) => {
    setLayoutSlots(prev => prev.map(slot => ({
      ...slot,
      components: slot.components.filter(id => id !== componentId)
    })));
  };

  const generateCode = () => {
    const code = `// Generated Layout
import React from 'react';
import { Card, Button, Input, Tag, Space } from 'antd';

export const GeneratedDashboard: React.FC = () => {
  return (
    <div className="dashboard-layout" style={{ 
      display: 'grid',
      gridTemplateAreas: '"header" "sidebar main" "footer"',
      gridTemplateColumns: '250px 1fr',
      gridTemplateRows: 'auto 1fr auto',
      gap: '16px',
      minHeight: '100vh'
    }}>
${layoutSlots.map(slot => {
  const components = COMPONENT_LIBRARY.filter(c => slot.components.includes(c.id));
  if (components.length === 0) return '';
  
  return `      <div style={{ gridArea: '${slot.id}' }}>
        {/* ${slot.name} */}
${components.map(c => '        ' + c.code).join('\n')}
      </div>`;
}).filter(Boolean).join('\n\n')}
    </div>
  );
};`;

    navigator.clipboard.writeText(code);
    message.success('Full dashboard code copied to clipboard!');
  };

  return (
    <div className="component-library-browser p-6">
      <h2 className="text-3xl font-bold mb-6">Component Library & Layout Builder</h2>

      <Tabs defaultActiveKey="browse">
        <TabPane 
          tab={<span><AppstoreOutlined /> Browse Components</span>} 
          key="browse"
        >
          <div className="mb-6">
            <Space className="w-full" direction="vertical">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
              />
              <Select
                style={{ width: 200 }}
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categories.map(cat => ({ 
                  label: cat === 'all' ? 'All Categories' : cat, 
                  value: cat 
                }))}
              />
            </Space>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            {selectedComponents.size} component(s) selected
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter}>
            <SortableContext 
              items={filteredComponents.map(c => c.id)} 
              strategy={verticalListSortingStrategy}
            >
              {filteredComponents.map(component => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                  isSelected={selectedComponents.has(component.id)}
                  onToggle={() => toggleComponentSelection(component.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {filteredComponents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No components found matching your search
            </div>
          )}
        </TabPane>

        <TabPane 
          tab={<span><LayoutOutlined /> Layout Builder</span>} 
          key="layout"
        >
          <Card className="mb-6" title={<span><ThunderboltOutlined /> AI-Powered Placement</span>}>
            <Space direction="vertical" className="w-full">
              <TextArea
                placeholder="Describe your desired layout (e.g., 'Place the search in header, stats in main content, buttons in footer')"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
              />
              <Button
                type="primary"
                size="large"
                loading={generating}
                onClick={handleAIPlacement}
                disabled={selectedComponents.size === 0}
              >
                <ThunderboltOutlined /> Generate Layout with AI
              </Button>
              <div className="text-sm text-gray-500">
                AI will intelligently arrange your selected components based on your prompt and schema configuration
              </div>
            </Space>
          </Card>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {layoutSlots.map(slot => (
              <LayoutSlotComponent
                key={slot.id}
                slot={slot}
                components={COMPONENT_LIBRARY}
                onRemove={removeFromSlot}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <Button 
              type="primary" 
              icon={<CodeOutlined />}
              onClick={generateCode}
              size="large"
            >
              Generate Full Code
            </Button>
            <Button
              onClick={() => {
                setLayoutSlots(prev => prev.map(slot => ({ ...slot, components: [] })));
                message.success('Layout cleared');
              }}
            >
              Clear Layout
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ComponentLibraryBrowser;

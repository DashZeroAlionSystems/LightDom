/**
 * Light DOM Slots Demo
 * 
 * Interactive demonstration of Light DOM slot system with:
 * - Dynamic slot management
 * - Content projection patterns
 * - Performance optimization techniques
 * - Real-time slot composition
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, Typography, Tag, Switch, Divider, Space, Alert, Tabs } from 'antd';
import {
  AppstoreOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  LayoutOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface SlotContent {
  id: string;
  slot: string;
  content: string;
  type: 'header' | 'main' | 'sidebar' | 'footer' | 'widget';
  loaded: boolean;
}

const LightDOMSlotsDemo: React.FC = () => {
  const [slots, setSlots] = useState<SlotContent[]>([
    { id: '1', slot: 'header', content: 'Main Header', type: 'header', loaded: true },
    { id: '2', slot: 'main', content: 'Primary Content Area', type: 'main', loaded: true },
    { id: '3', slot: 'sidebar', content: 'Sidebar Widget 1', type: 'sidebar', loaded: false },
    { id: '4', slot: 'sidebar', content: 'Sidebar Widget 2', type: 'sidebar', loaded: false },
    { id: '5', slot: 'footer', content: 'Footer Navigation', type: 'footer', loaded: true }
  ]);

  const [lazyLoading, setLazyLoading] = useState(false);
  const [virtualDOM, setVirtualDOM] = useState(true);
  const [optimizationEnabled, setOptimizationEnabled] = useState(true);
  const [stats, setStats] = useState({
    totalSlots: 5,
    loadedSlots: 3,
    renderTime: 0,
    optimizationGain: 0
  });

  useEffect(() => {
    // Simulate lazy loading
    if (lazyLoading) {
      const timer = setTimeout(() => {
        setSlots(prev => prev.map(slot => ({ ...slot, loaded: true })));
        setStats(prev => ({ ...prev, loadedSlots: 5 }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lazyLoading]);

  useEffect(() => {
    // Update stats
    const loaded = slots.filter(s => s.loaded).length;
    const renderTime = optimizationEnabled ? Math.random() * 20 + 10 : Math.random() * 50 + 30;
    const gain = optimizationEnabled ? ((50 - renderTime) / 50 * 100) : 0;
    
    setStats({
      totalSlots: slots.length,
      loadedSlots: loaded,
      renderTime: Math.round(renderTime),
      optimizationGain: Math.round(gain)
    });
  }, [slots, optimizationEnabled]);

  const addSlot = useCallback((type: SlotContent['type']) => {
    const newSlot: SlotContent = {
      id: String(Date.now()),
      slot: type,
      content: `New ${type} content`,
      type,
      loaded: !lazyLoading
    };
    setSlots(prev => [...prev, newSlot]);
  }, [lazyLoading]);

  const removeSlot = useCallback((id: string) => {
    setSlots(prev => prev.filter(slot => slot.id !== id));
  }, []);

  const swapSlots = useCallback(() => {
    setSlots(prev => {
      const newSlots = [...prev];
      if (newSlots.length >= 2) {
        [newSlots[0], newSlots[1]] = [newSlots[1], newSlots[0]];
      }
      return newSlots;
    });
  }, []);

  const getSlotColor = (type: SlotContent['type']) => {
    const colors = {
      header: '#4299e1',
      main: '#48bb78',
      sidebar: '#ed8936',
      footer: '#9f7aea',
      widget: '#38b2ac'
    };
    return colors[type];
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.slot]) acc[slot.slot] = [];
    acc[slot.slot].push(slot);
    return acc;
  }, {} as Record<string, SlotContent[]>);

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="!text-white mb-4">
            <LayoutOutlined className="mr-3" />
            Light DOM Slots Demo
          </Title>
          <Paragraph className="text-slate-300 text-lg">
            Interactive demonstration of Light DOM slot system with dynamic content projection
          </Paragraph>
        </div>

        {/* Stats Panel */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalSlots}</div>
              <Text className="text-slate-400">Total Slots</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.loadedSlots}</div>
              <Text className="text-slate-400">Loaded Slots</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{stats.renderTime}ms</div>
              <Text className="text-slate-400">Render Time</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.optimizationGain}%</div>
              <Text className="text-slate-400">Optimization Gain</Text>
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Card className="bg-slate-800 border-slate-700 mb-6" title={
          <span className="text-white flex items-center gap-2">
            <ThunderboltOutlined />
            Optimization Controls
          </span>
        }>
          <Row gutter={16}>
            <Col span={8}>
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex items-center justify-between">
                  <Text className="text-slate-300">Lazy Loading</Text>
                  <Switch checked={lazyLoading} onChange={setLazyLoading} />
                </div>
                <Text className="text-slate-500 text-xs">
                  Load slots on demand
                </Text>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex items-center justify-between">
                  <Text className="text-slate-300">Virtual DOM</Text>
                  <Switch checked={virtualDOM} onChange={setVirtualDOM} />
                </div>
                <Text className="text-slate-500 text-xs">
                  Use virtual DOM diffing
                </Text>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex items-center justify-between">
                  <Text className="text-slate-300">Optimization</Text>
                  <Switch checked={optimizationEnabled} onChange={setOptimizationEnabled} />
                </div>
                <Text className="text-slate-500 text-xs">
                  Enable slot optimization
                </Text>
              </Space>
            </Col>
          </Row>

          <Divider className="bg-slate-700 my-4" />

          <Space wrap>
            <Button 
              type="primary" 
              icon={<AppstoreOutlined />}
              onClick={() => addSlot('header')}
            >
              Add Header Slot
            </Button>
            <Button 
              icon={<LayoutOutlined />}
              onClick={() => addSlot('sidebar')}
              className="bg-slate-700 text-white border-slate-600"
            >
              Add Sidebar Slot
            </Button>
            <Button 
              icon={<SwapOutlined />}
              onClick={swapSlots}
              className="bg-slate-700 text-white border-slate-600"
            >
              Swap First Two
            </Button>
          </Space>
        </Card>

        {/* Slot Visualization */}
        <Tabs defaultActiveKey="visual" className="mb-6" items={[
          {
            key: 'visual',
            label: (
              <span>
                <EyeOutlined className="mr-2" />
                Visual Layout
              </span>
            ),
            children: (
              <Card className="bg-slate-800 border-slate-700">
                <Row gutter={16}>
                  {/* Main Content Area */}
                  <Col span={18}>
                    {/* Header Slots */}
                    {groupedSlots.header && (
                      <div className="mb-4">
                        {groupedSlots.header.map(slot => (
                          <div
                            key={slot.id}
                            className="rounded-lg p-4 mb-2 transition-all"
                            style={{
                              backgroundColor: getSlotColor(slot.type),
                              opacity: slot.loaded ? 1 : 0.5
                            }}
                          >
                            <div className="flex items-center justify-between text-white">
                              <div>
                                <Tag color="blue" className="mb-2">
                                  {slot.slot}
                                </Tag>
                                <div className="font-semibold">{slot.content}</div>
                              </div>
                              <Space>
                                {slot.loaded && <CheckCircleOutlined />}
                                <Button
                                  size="small"
                                  danger
                                  onClick={() => removeSlot(slot.id)}
                                >
                                  Remove
                                </Button>
                              </Space>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Main Content Slots */}
                    {groupedSlots.main && (
                      <div className="mb-4">
                        {groupedSlots.main.map(slot => (
                          <div
                            key={slot.id}
                            className="rounded-lg p-6 mb-2 transition-all"
                            style={{
                              backgroundColor: getSlotColor(slot.type),
                              opacity: slot.loaded ? 1 : 0.5,
                              minHeight: '200px'
                            }}
                          >
                            <div className="flex items-center justify-between text-white mb-4">
                              <Tag color="green">{slot.slot}</Tag>
                              <Space>
                                {slot.loaded && <CheckCircleOutlined />}
                                <Button
                                  size="small"
                                  danger
                                  onClick={() => removeSlot(slot.id)}
                                >
                                  Remove
                                </Button>
                              </Space>
                            </div>
                            <div className="text-white text-lg font-semibold">
                              {slot.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer Slots */}
                    {groupedSlots.footer && (
                      <div>
                        {groupedSlots.footer.map(slot => (
                          <div
                            key={slot.id}
                            className="rounded-lg p-4 mb-2 transition-all"
                            style={{
                              backgroundColor: getSlotColor(slot.type),
                              opacity: slot.loaded ? 1 : 0.5
                            }}
                          >
                            <div className="flex items-center justify-between text-white">
                              <div>
                                <Tag color="purple" className="mb-2">
                                  {slot.slot}
                                </Tag>
                                <div className="font-semibold">{slot.content}</div>
                              </div>
                              <Space>
                                {slot.loaded && <CheckCircleOutlined />}
                                <Button
                                  size="small"
                                  danger
                                  onClick={() => removeSlot(slot.id)}
                                >
                                  Remove
                                </Button>
                              </Space>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Col>

                  {/* Sidebar */}
                  <Col span={6}>
                    {groupedSlots.sidebar && groupedSlots.sidebar.map(slot => (
                      <div
                        key={slot.id}
                        className="rounded-lg p-3 mb-2 transition-all"
                        style={{
                          backgroundColor: getSlotColor(slot.type),
                          opacity: slot.loaded ? 1 : 0.5
                        }}
                      >
                        <div className="text-white mb-2">
                          <Tag color="orange" size="small">
                            {slot.slot}
                          </Tag>
                        </div>
                        <div className="text-white text-sm mb-2">{slot.content}</div>
                        <Space size="small">
                          {slot.loaded && <CheckCircleOutlined className="text-white text-xs" />}
                          <Button
                            size="small"
                            danger
                            onClick={() => removeSlot(slot.id)}
                          >
                            ×
                          </Button>
                        </Space>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card>
            )
          },
          {
            key: 'code',
            label: (
              <span>
                <CodeOutlined className="mr-2" />
                Code Structure
              </span>
            ),
            children: (
              <Card className="bg-slate-800 border-slate-700">
                <pre className="text-slate-300 text-sm overflow-x-auto">
                  {`<lightdom-component>
  ${Object.entries(groupedSlots).map(([slotName, slotContents]) => 
    `<slot name="${slotName}">
    ${slotContents.map(slot => `<!-- ${slot.content} -->`).join('\n    ')}
  </slot>`
  ).join('\n  ')}
</lightdom-component>`}
                </pre>
              </Card>
            )
          }
        ]} />

        {/* Information Panel */}
        <Alert
          message="Light DOM Slot System"
          description={
            <div>
              <Paragraph className="mb-2">
                This demo showcases the Light DOM slot system which provides:
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1">
                <li>Dynamic content projection into predefined slots</li>
                <li>Lazy loading for performance optimization</li>
                <li>Virtual DOM diffing for efficient updates</li>
                <li>Real-time slot composition and swapping</li>
                <li>Optimized rendering with up to {stats.optimizationGain}% performance gain</li>
              </ul>
            </div>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          className="bg-blue-900 border-blue-700"
        />
      </div>
    </div>
  );
};

export default LightDOMSlotsDemo;

/**
 * Theme Configurator Component
 * 
 * Interactive theme editor with live preview and anime.js animations
 * Features: Color picker, preset selection, live preview, export/import
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Button, Space, Typography, Input, Tabs, message } from 'antd';
import {
  BgColorsOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import anime from 'animejs';
import {
  Theme,
  defaultTheme,
  themePresets,
  applyTheme,
  getGradient,
  getTextGradient,
  exportTheme,
  importTheme,
} from '../config/themeConfig';
import { featureCardsStagger, animatedCounter } from '../utils/animeControls';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface ThemeConfiguratorProps {
  onThemeChange?: (theme: Theme) => void;
}

export const ThemeConfigurator: React.FC<ThemeConfiguratorProps> = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [selectedPreset, setSelectedPreset] = useState<string>('light');
  const [previewMode, setPreviewMode] = useState<'demo' | 'code'>('demo');

  useEffect(() => {
    applyTheme(currentTheme);
    onThemeChange?.(currentTheme);
  }, [currentTheme, onThemeChange]);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const newTheme = themePresets[preset as keyof typeof themePresets] || defaultTheme;
    setCurrentTheme(newTheme);
    
    // Animate the preview
    anime({
      targets: '.preview-card',
      scale: [0.95, 1],
      opacity: [0.5, 1],
      duration: 400,
      easing: 'easeOutElastic(1, .6)',
    });
  };

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    setCurrentTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const handleExport = () => {
    const themeJson = exportTheme(currentTheme);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${selectedPreset}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Theme exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const importedTheme = importTheme(json);
        setCurrentTheme(importedTheme);
        setSelectedPreset('custom');
        message.success('Theme imported successfully!');
      } catch (error) {
        message.error('Failed to import theme');
      }
    };
    reader.readAsText(file);
  };

  const colorPairs = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'background', label: 'Background' },
    { key: 'surface', label: 'Surface' },
    { key: 'text', label: 'Text' },
    { key: 'textSecondary', label: 'Text Secondary' },
    { key: 'border', label: 'Border' },
  ] as const;

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>
          <BgColorsOutlined /> Theme Configurator
        </Title>
        <Paragraph>
          Customize your theme with live preview. Choose a preset or create your own custom theme.
        </Paragraph>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Controls */}
          <Col xs={24} lg={8}>
            <Card title="Theme Settings">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Preset Selection */}
                <div>
                  <Text strong>Theme Preset</Text>
                  <Select
                    style={{ width: '100%', marginTop: 8 }}
                    value={selectedPreset}
                    onChange={handlePresetChange}
                  >
                    <Option value="light">Light</Option>
                    <Option value="dark">Dark</Option>
                    <Option value="ocean">Ocean</Option>
                    <Option value="sunset">Sunset</Option>
                    <Option value="forest">Forest</Option>
                  </Select>
                </div>

                {/* Color Customization */}
                <div>
                  <Text strong>Colors</Text>
                  <div style={{ marginTop: 12 }}>
                    {colorPairs.map(({ key, label }) => (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <Space>
                          <Input
                            type="color"
                            value={currentTheme.colors[key]}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            style={{ width: 50, height: 32, padding: 2 }}
                          />
                          <Text>{label}</Text>
                        </Space>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export/Import */}
                <div>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExport}
                      block
                    >
                      Export Theme
                    </Button>
                    <label>
                      <Button
                        icon={<UploadOutlined />}
                        block
                      >
                        Import Theme
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Live Preview */}
          <Col xs={24} lg={16}>
            <Card 
              title="Live Preview"
              extra={
                <Space>
                  <Button
                    size="small"
                    type={previewMode === 'demo' ? 'primary' : 'default'}
                    onClick={() => setPreviewMode('demo')}
                    icon={<EyeOutlined />}
                  >
                    Demo
                  </Button>
                  <Button
                    size="small"
                    type={previewMode === 'code' ? 'primary' : 'default'}
                    onClick={() => setPreviewMode('code')}
                  >
                    Code
                  </Button>
                </Space>
              }
            >
              {previewMode === 'demo' ? (
                <div>
                  {/* Hero Section Preview */}
                  <div
                    className="preview-card"
                    style={{
                      background: getGradient(currentTheme),
                      padding: 40,
                      borderRadius: currentTheme.borderRadius.lg,
                      marginBottom: 24,
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
                      <ThunderboltOutlined /> Your Product Name
                    </Title>
                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
                      Amazing tagline that describes your product
                    </Paragraph>
                    <Button
                      size="large"
                      style={{
                        background: 'white',
                        color: currentTheme.colors.primary,
                        border: 'none',
                        borderRadius: currentTheme.borderRadius.md,
                        height: 48,
                        padding: '0 32px',
                        fontWeight: 600,
                      }}
                    >
                      Get Started
                    </Button>
                  </div>

                  {/* Cards Preview */}
                  <Row gutter={[16, 16]}>
                    {[1, 2, 3].map((i) => (
                      <Col key={i} xs={24} md={8}>
                        <div
                          className="preview-card"
                          style={{
                            background: currentTheme.colors.surface,
                            padding: 24,
                            borderRadius: currentTheme.borderRadius.md,
                            border: `1px solid ${currentTheme.colors.border}`,
                            boxShadow: currentTheme.shadows.md,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: currentTheme.borderRadius.sm,
                              background: getGradient(currentTheme),
                              marginBottom: 16,
                            }}
                          />
                          <Title 
                            level={5} 
                            style={{ 
                              color: currentTheme.colors.text,
                              marginBottom: 8,
                            }}
                          >
                            Feature {i}
                          </Title>
                          <Text style={{ color: currentTheme.colors.textSecondary }}>
                            This is a preview of how your theme looks with card components.
                          </Text>
                        </div>
                      </Col>
                    ))}
                  </Row>

                  {/* Text Samples */}
                  <div style={{ marginTop: 32, padding: 24 }}>
                    <Title 
                      level={3} 
                      style={{ 
                        ...getTextGradient(currentTheme),
                        marginBottom: 16,
                      }}
                    >
                      Gradient Text Example
                    </Title>
                    <Paragraph style={{ color: currentTheme.colors.text }}>
                      Regular text in primary color: {currentTheme.colors.text}
                    </Paragraph>
                    <Paragraph style={{ color: currentTheme.colors.textSecondary }}>
                      Secondary text color: {currentTheme.colors.textSecondary}
                    </Paragraph>
                  </div>
                </div>
              ) : (
                <div>
                  <Text strong>Theme Configuration (JSON)</Text>
                  <TextArea
                    value={exportTheme(currentTheme)}
                    rows={20}
                    readOnly
                    style={{
                      marginTop: 12,
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      background: '#1e1e1e',
                      color: '#d4d4d4',
                    }}
                  />
                  <Paragraph style={{ marginTop: 12 }}>
                    <Text type="secondary">
                      Copy this configuration and import it later, or use it in your application code.
                    </Text>
                  </Paragraph>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Usage Guide */}
        <Card title="How to Use" style={{ marginTop: 24 }}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Quick Start" key="1">
              <Paragraph>
                <Text strong>1. Choose a preset</Text> from the dropdown to start with a
                pre-configured theme.
              </Paragraph>
              <Paragraph>
                <Text strong>2. Customize colors</Text> using the color pickers to match your
                brand.
              </Paragraph>
              <Paragraph>
                <Text strong>3. Preview your changes</Text> in real-time with the live preview.
              </Paragraph>
              <Paragraph>
                <Text strong>4. Export your theme</Text> when you're satisfied with the
                result.
              </Paragraph>
            </TabPane>
            <TabPane tab="Code Usage" key="2">
              <pre
                style={{
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: 16,
                  borderRadius: 8,
                  overflow: 'auto',
                }}
              >
                {`import { applyTheme, importTheme } from '@/config/themeConfig';

// Import your theme JSON
const themeJson = '...'; // Your exported theme
const theme = importTheme(themeJson);

// Apply theme to your app
applyTheme(theme);

// Or use theme object directly
const MyComponent = () => {
  return (
    <div style={{
      background: theme.colors.primary,
      color: theme.colors.text,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    }}>
      Styled with theme!
    </div>
  );
};`}
              </pre>
            </TabPane>
            <TabPane tab="CSS Variables" key="3">
              <Paragraph>
                The theme automatically generates CSS variables that you can use in your
                stylesheets:
              </Paragraph>
              <pre
                style={{
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: 16,
                  borderRadius: 8,
                  overflow: 'auto',
                }}
              >
                {`.my-component {
  background: var(--theme-primary);
  color: var(--theme-text);
  padding: var(--theme-spacing-md);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}

.gradient-text {
  background: linear-gradient(
    135deg,
    var(--theme-primary) 0%,
    var(--theme-secondary) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`}
              </pre>
            </TabPane>
          </Tabs>
        </Card>
      </Card>
    </div>
  );
};

export default ThemeConfigurator;

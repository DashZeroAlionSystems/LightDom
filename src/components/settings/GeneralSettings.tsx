/**
 * General Settings Component
 * Intuitive and user-friendly general configuration settings
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Upload,
  ColorPicker,
  Slider,
  InputNumber,
  TimePicker,
  DatePicker,
  Radio,
  Checkbox,
  message,
  Tooltip,
  Alert,
} from 'antd';
import {
  GlobalOutlined,
  TranslationOutlined,
  SkinOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedInput,
} from '../DesignSystemComponents';
import {
  getSpacing,
  getFlexStyle,
} from '../../utils/StyleUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface GeneralSettingsProps {
  onSave?: (settings: any) => void;
  onReset?: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ onSave, onReset }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const initialValues = {
    // Basic Settings
    siteName: 'LightDom Admin',
    siteDescription: 'Professional admin dashboard for LightDom platform',
    adminEmail: 'admin@lightdom.dev',
    contactEmail: 'support@lightdom.dev',
    
    // Localization
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Appearance
    theme: 'light',
    primaryColor: '#1890ff',
    accentColor: '#52c41a',
    fontSize: 'medium',
    compactMode: false,
    
    // Regional
    currency: 'USD',
    numberFormat: '1,234.56',
    firstDayOfWeek: 0,
    
    // System
    sessionTimeout: 30,
    autoSave: true,
    autoSaveInterval: 5,
    enableAnimations: true,
    reduceMotion: false,
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form]);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.(values);
      setHasChanges(false);
      message.success('Settings saved successfully!');
    } catch (error) {
      message.error('Failed to save settings. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(initialValues);
    setHasChanges(false);
    onReset?.();
    message.info('Settings reset to defaults');
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
    message.info(previewMode ? 'Preview mode disabled' : 'Preview mode enabled');
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Header */}
      <div style={getFlexStyle('row', 'space-between', 'center')}>
        <div>
          <Title level={3}>General Settings</Title>
          <Text type="secondary">Configure basic system settings and preferences</Text>
        </div>
        <Space>
          <Button
            icon={previewMode ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={handlePreview}
          >
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
          <EnhancedButton
            variant="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
            disabled={!hasChanges}
          >
            Save Changes
          </EnhancedButton>
        </Space>
      </div>

      {hasChanges && (
        <Alert
          message="You have unsaved changes"
          description="Your changes will be lost if you navigate away without saving."
          type="warning"
          showIcon
          closable
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        disabled={previewMode}
      >
        {/* Basic Information */}
        <EnhancedCard 
          title={
            <Space>
              <GlobalOutlined />
              <span>Basic Information</span>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Site Name"
                name="siteName"
                rules={[{ required: true, message: 'Please enter site name' }]}
              >
                <EnhancedInput placeholder="Enter site name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Admin Email"
                name="adminEmail"
                rules={[
                  { required: true, message: 'Please enter admin email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <EnhancedInput placeholder="admin@example.com" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Site Description"
            name="siteDescription"
          >
            <TextArea
              rows={3}
              placeholder="Describe your site..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Contact Email"
            name="contactEmail"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <EnhancedInput placeholder="support@example.com" />
          </Form.Item>
        </EnhancedCard>

        {/* Localization */}
        <EnhancedCard 
          title={
            <Space>
              <TranslationOutlined />
              <span>Localization</span>
              <Tooltip title="Configure language and regional settings">
                <InfoCircleOutlined style={{ color: '#999' }} />
              </Tooltip>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Language" name="language">
                <Select placeholder="Select language">
                  <Option value="en">English</Option>
                  <Option value="es">Español</Option>
                  <Option value="fr">Français</Option>
                  <Option value="de">Deutsch</Option>
                  <Option value="it">Italiano</Option>
                  <Option value="pt">Português</Option>
                  <Option value="ru">Русский</Option>
                  <Option value="ja">日本語</Option>
                  <Option value="ko">한국어</Option>
                  <Option value="zh">中文</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Timezone" name="timezone">
                <Select placeholder="Select timezone">
                  <Option value="UTC">UTC (Coordinated Universal Time)</Option>
                  <Option value="EST">Eastern Time (UTC-5)</Option>
                  <Option value="PST">Pacific Time (UTC-8)</Option>
                  <Option value="CET">Central European (UTC+1)</Option>
                  <Option value="IST">India Standard (UTC+5:30)</Option>
                  <Option value="JST">Japan Standard (UTC+9)</Option>
                  <Option value="AEST">Australian Eastern (UTC+10)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Date Format" name="dateFormat">
                <Select placeholder="Select date format">
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  <Option value="DD.MM.YYYY">DD.MM.YYYY</Option>
                  <Option value="MMMM DD, YYYY">MMMM DD, YYYY</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Time Format" name="timeFormat">
                <Radio.Group>
                  <Radio value="12h">12-hour (AM/PM)</Radio>
                  <Radio value="24h">24-hour</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </EnhancedCard>

        {/* Appearance */}
        <EnhancedCard 
          title={
            <Space>
              <SkinOutlined />
              <span>Appearance</span>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Theme" name="theme">
                <Radio.Group>
                  <Radio value="light">Light</Radio>
                  <Radio value="dark">Dark</Radio>
                  <Radio value="auto">Auto</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Font Size" name="fontSize">
                <Select placeholder="Select font size">
                  <Option value="small">Small</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="large">Large</Option>
                  <Option value="extra-large">Extra Large</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Primary Color" name="primaryColor">
                <ColorPicker showText />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Accent Color" name="accentColor">
                <ColorPicker showText />
              </Form.Item>
            </Col>
          </Row>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name="compactMode" valuePropName="checked">
              <Checkbox>Compact Mode (Reduce spacing and padding)</Checkbox>
            </Form.Item>
            <Form.Item name="enableAnimations" valuePropName="checked">
              <Checkbox>Enable Animations</Checkbox>
            </Form.Item>
            <Form.Item name="reduceMotion" valuePropName="checked">
              <Checkbox>Reduce Motion (Accessibility)</Checkbox>
            </Form.Item>
          </Space>
        </EnhancedCard>

        {/* Regional Settings */}
        <EnhancedCard 
          title={
            <Space>
              <GlobalOutlined />
              <span>Regional Settings</span>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Currency" name="currency">
                <Select placeholder="Select currency">
                  <Option value="USD">USD - US Dollar</Option>
                  <Option value="EUR">EUR - Euro</Option>
                  <Option value="GBP">GBP - British Pound</Option>
                  <Option value="JPY">JPY - Japanese Yen</Option>
                  <Option value="CNY">CNY - Chinese Yuan</Option>
                  <Option value="INR">INR - Indian Rupee</Option>
                  <Option value="AUD">AUD - Australian Dollar</Option>
                  <Option value="CAD">CAD - Canadian Dollar</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Number Format" name="numberFormat">
                <Select placeholder="Select number format">
                  <Option value="1,234.56">1,234.56 (English)</Option>
                  <Option value="1.234,56">1.234,56 (European)</Option>
                  <Option value="1 234.56">1 234.56 (French)</Option>
                  <Option value="1'234.56">1'234.56 (Swiss)</Option>
                  <Option value="1,234">1,234 (No decimals)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="First Day of Week" name="firstDayOfWeek">
            <Radio.Group>
              <Radio value={0}>Sunday</Radio>
              <Radio value={1}>Monday</Radio>
            </Radio.Group>
          </Form.Item>
        </EnhancedCard>

        {/* System Settings */}
        <EnhancedCard 
          title={
            <Space>
              <BulbOutlined />
              <span>System Preferences</span>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Session Timeout (minutes)" name="sessionTimeout">
                <Slider
                  min={5}
                  max={120}
                  marks={{
                    5: '5m',
                    30: '30m',
                    60: '1h',
                    120: '2h',
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Auto-save Interval (minutes)" name="autoSaveInterval">
                <Slider
                  min={1}
                  max={30}
                  marks={{
                    1: '1m',
                    5: '5m',
                    10: '10m',
                    30: '30m',
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name="autoSave" valuePropName="checked">
              <Checkbox>Enable Auto-save</Checkbox>
            </Form.Item>
          </Space>
        </EnhancedCard>
      </Form>
    </Space>
  );
};

export default GeneralSettings;

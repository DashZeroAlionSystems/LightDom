/**
 * Enhanced Visual Config Editor
 * 
 * A production-ready, schema-driven configuration editor with:
 * - Visual and JSON editing modes
 * - Real-time validation
 * - Smart field rendering
 * - Accessibility features
 * - Template support
 * - Diff viewing
 * - Auto-save
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  TimePicker,
  Slider,
  Radio,
  Checkbox,
  Button,
  Tabs,
  Collapse,
  Space,
  Tag,
  Tooltip,
  Alert,
  Modal,
  Drawer,
  message
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  CodeOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

/**
 * Main Config Editor Component
 */
export const EnhancedConfigEditor = ({
  schema,
  initialValues = {},
  onSave,
  onChange,
  templates = [],
  showTemplates = true,
  showDiff = true,
  autoSave = false,
  autoSaveDelay = 3000
}) => {
  // State
  const [mode, setMode] = useState('visual'); // 'visual' | 'json'
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [collapsed, setCollapsed] = useState({});
  const [showDiffDrawer, setShowDiffDrawer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const autoSaveTimerRef = useRef(null);
  
  // Group fields by level
  const fieldsByLevel = useMemo(() => {
    const grouped = {
      basic: [],
      advanced: [],
      expert: []
    };
    
    schema.fields.forEach(field => {
      const level = field.level || 'basic';
      if (grouped[level]) {
        grouped[level].push(field);
      }
    });
    
    return grouped;
  }, [schema]);
  
  // Validation
  const validateField = useCallback((field, value) => {
    // Required validation
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label || field.name} is required`;
    }
    
    // Type-specific validation
    switch (field.type) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email format';
        }
        break;
        
      case 'url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          return 'Must be a valid URL (http:// or https://)';
        }
        break;
        
      case 'number':
      case 'integer':
        if (value !== undefined && value !== null) {
          if (field.min !== undefined && value < field.min) {
            return `Minimum value is ${field.min}`;
          }
          if (field.max !== undefined && value > field.max) {
            return `Maximum value is ${field.max}`;
          }
        }
        break;
        
      case 'string':
      case 'text':
        if (value) {
          if (field.minLength && value.length < field.minLength) {
            return `Minimum length is ${field.minLength} characters`;
          }
          if (field.maxLength && value.length > field.maxLength) {
            return `Maximum length is ${field.maxLength} characters`;
          }
          if (field.pattern && !new RegExp(field.pattern).test(value)) {
            return field.patternMessage || 'Invalid format';
          }
        }
        break;
    }
    
    // Custom validation
    if (field.validate && typeof field.validate === 'function') {
      return field.validate(value);
    }
    
    return null;
  }, []);
  
  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    
    schema.fields.forEach(field => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [schema, values, validateField]);
  
  // Handle field change
  const handleFieldChange = useCallback((name, value) => {
    setValues(prev => {
      const newValues = { ...prev, [name]: value };
      
      // Check if value actually changed
      if (JSON.stringify(prev[name]) !== JSON.stringify(value)) {
        setIsDirty(true);
      }
      
      return newValues;
    });
    
    // Mark as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    const field = schema.fields.find(f => f.name === name);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    
    // Call onChange callback
    if (onChange) {
      onChange(name, value);
    }
    
    // Auto-save
    if (autoSave) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, autoSaveDelay);
    }
  }, [schema, validateField, onChange, autoSave, autoSaveDelay]);
  
  // Handle save
  const handleSave = useCallback((isAutoSave = false) => {
    if (!validateAll()) {
      if (!isAutoSave) {
        message.error('Please fix validation errors before saving');
      }
      return;
    }
    
    if (onSave) {
      onSave(values);
      setIsDirty(false);
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        message.success('Configuration saved successfully');
      }
    }
  }, [values, validateAll, onSave]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    Modal.confirm({
      title: 'Reset Configuration',
      content: 'Are you sure you want to reset to initial values? All changes will be lost.',
      onOk: () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsDirty(false);
        message.info('Configuration reset');
      }
    });
  }, [initialValues]);
  
  // Handle template load
  const handleLoadTemplate = useCallback((template) => {
    Modal.confirm({
      title: 'Load Template',
      content: `Load "${template.name}" template? Current changes will be lost.`,
      onOk: () => {
        setValues(template.values);
        setErrors({});
        setTouched({});
        setIsDirty(true);
        setSelectedTemplate(template.name);
        message.success(`Template "${template.name}" loaded`);
      }
    });
  }, []);
  
  // Handle JSON mode change
  const handleJSONChange = useCallback((json) => {
    try {
      const parsed = JSON.parse(json);
      setValues(parsed);
      setIsDirty(true);
      setErrors({});
    } catch (error) {
      message.error('Invalid JSON format');
    }
  }, []);
  
  // Handle export
  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Configuration exported');
  }, [values]);
  
  // Handle import
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            setValues(imported);
            setIsDirty(true);
            message.success('Configuration imported');
          } catch (error) {
            message.error('Failed to import configuration');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);
  
  // Render field based on type
  const renderField = useCallback((field) => {
    const value = values[field.name];
    const error = touched[field.name] ? errors[field.name] : null;
    const hasError = !!error;
    const isValid = touched[field.name] && !error && value !== undefined && value !== '';
    
    // Check conditional rendering
    if (field.showIf) {
      const conditionField = field.showIf.field;
      const conditionValue = field.showIf.equals;
      if (values[conditionField] !== conditionValue) {
        return null;
      }
    }
    
    let inputComponent;
    
    switch (field.type) {
      case 'string':
      case 'text':
        inputComponent = (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            showCount={field.showCount}
            prefix={field.prefix}
            suffix={isValid ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null}
            status={hasError ? 'error' : ''}
          />
        );
        break;
        
      case 'textarea':
        inputComponent = (
          <TextArea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            maxLength={field.maxLength}
            showCount={field.showCount}
          />
        );
        break;
        
      case 'number':
      case 'integer':
        inputComponent = (
          <InputNumber
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            style={{ width: '100%' }}
            placeholder={field.placeholder}
          />
        );
        break;
        
      case 'select':
        inputComponent = (
          <Select
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            placeholder={field.placeholder || 'Select an option'}
            showSearch={field.searchable}
            allowClear={!field.required}
            style={{ width: '100%' }}
          >
            {field.options.map(opt => (
              <Option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
                {opt.recommended && <Tag color="gold" style={{ marginLeft: 8 }}>Recommended</Tag>}
              </Option>
            ))}
          </Select>
        );
        break;
        
      case 'multiselect':
        inputComponent = (
          <Select
            mode="multiple"
            value={value || []}
            onChange={(val) => handleFieldChange(field.name, val)}
            placeholder={field.placeholder || 'Select options'}
            style={{ width: '100%' }}
          >
            {field.options.map(opt => (
              <Option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </Option>
            ))}
          </Select>
        );
        break;
        
      case 'boolean':
      case 'switch':
        inputComponent = (
          <Switch
            checked={value}
            onChange={(checked) => handleFieldChange(field.name, checked)}
            checkedChildren={field.checkedLabel || 'On'}
            unCheckedChildren={field.uncheckedLabel || 'Off'}
          />
        );
        break;
        
      case 'radio':
        inputComponent = (
          <Radio.Group
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          >
            {field.options.map(opt => (
              <Radio key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </Radio>
            ))}
          </Radio.Group>
        );
        break;
        
      case 'checkbox':
        inputComponent = (
          <Checkbox
            checked={value}
            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
          >
            {field.checkboxLabel}
          </Checkbox>
        );
        break;
        
      case 'date':
        inputComponent = (
          <DatePicker
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            style={{ width: '100%' }}
          />
        );
        break;
        
      case 'time':
        inputComponent = (
          <TimePicker
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            style={{ width: '100%' }}
          />
        );
        break;
        
      case 'slider':
      case 'range':
        inputComponent = (
          <Slider
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
            min={field.min || 0}
            max={field.max || 100}
            step={field.step || 1}
            marks={field.marks}
          />
        );
        break;
        
      case 'email':
        inputComponent = (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'email@example.com'}
            prefix="@"
            suffix={isValid ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null}
            status={hasError ? 'error' : ''}
          />
        );
        break;
        
      case 'url':
        inputComponent = (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'https://example.com'}
            prefix="🌐"
            suffix={isValid ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null}
            status={hasError ? 'error' : ''}
          />
        );
        break;
        
      case 'password':
        inputComponent = (
          <Input.Password
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
        break;
        
      case 'color':
        inputComponent = (
          <Input
            type="color"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
        break;
        
      case 'json':
      case 'code':
        inputComponent = (
          <TextArea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleFieldChange(field.name, parsed);
              } catch {
                handleFieldChange(field.name, e.target.value);
              }
            }}
            rows={field.rows || 8}
            style={{ fontFamily: 'monospace' }}
          />
        );
        break;
        
      default:
        inputComponent = (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
    
    return (
      <Form.Item
        key={field.name}
        label={
          <Space>
            {field.label || field.name}
            {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
            {field.help && (
              <Tooltip title={field.help}>
                <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
              </Tooltip>
            )}
          </Space>
        }
        validateStatus={hasError ? 'error' : isValid ? 'success' : ''}
        help={error || field.description}
        extra={field.extra}
      >
        {inputComponent}
      </Form.Item>
    );
  }, [values, errors, touched, handleFieldChange]);
  
  // Render visual mode
  const renderVisualMode = () => {
    const hasBasic = fieldsByLevel.basic.length > 0;
    const hasAdvanced = fieldsByLevel.advanced.length > 0;
    const hasExpert = fieldsByLevel.expert.length > 0;
    
    if (!hasBasic && !hasAdvanced && !hasExpert) {
      return (
        <Alert
          message="No fields defined"
          description="The schema does not contain any fields to display."
          type="info"
        />
      );
    }
    
    if (hasBasic && (hasAdvanced || hasExpert)) {
      // Use tabs for different levels
      return (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {hasBasic && (
            <TabPane tab="Basic" key="basic">
              <Form layout="vertical">
                {fieldsByLevel.basic.map(renderField)}
              </Form>
            </TabPane>
          )}
          {hasAdvanced && (
            <TabPane tab={<Space><SettingOutlined />Advanced</Space>} key="advanced">
              <Form layout="vertical">
                {fieldsByLevel.advanced.map(renderField)}
              </Form>
            </TabPane>
          )}
          {hasExpert && (
            <TabPane tab={<Space><ThunderboltOutlined />Expert</Space>} key="expert">
              <Alert
                message="Expert Options"
                description="These options are for advanced users only. Changing these settings may affect system behavior."
                type="warning"
                style={{ marginBottom: 16 }}
              />
              <Form layout="vertical">
                {fieldsByLevel.expert.map(renderField)}
              </Form>
            </TabPane>
          )}
        </Tabs>
      );
    }
    
    // Single form for all fields
    return (
      <Form layout="vertical">
        {schema.fields.map(renderField)}
      </Form>
    );
  };
  
  // Render JSON mode
  const renderJSONMode = () => {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(values, null, 2));
              message.success('Copied to clipboard');
            }}
          >
            Copy
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={handleImport}
          >
            Import
          </Button>
        </Space>
        
        <TextArea
          value={JSON.stringify(values, null, 2)}
          onChange={(e) => handleJSONChange(e.target.value)}
          rows={20}
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
        />
      </div>
    );
  };
  
  // Render diff drawer
  const renderDiffDrawer = () => {
    const changes = [];
    
    Object.keys({ ...initialValues, ...values }).forEach(key => {
      const initial = initialValues[key];
      const current = values[key];
      
      if (JSON.stringify(initial) !== JSON.stringify(current)) {
        changes.push({
          key,
          initial,
          current
        });
      }
    });
    
    return (
      <Drawer
        title="Configuration Changes"
        placement="right"
        width={600}
        onClose={() => setShowDiffDrawer(false)}
        visible={showDiffDrawer}
      >
        {changes.length === 0 ? (
          <Alert message="No changes" type="info" />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {changes.map(change => (
              <div key={change.key} style={{ padding: 12, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{change.key}</div>
                <div style={{ background: '#fff1f0', padding: 8, marginBottom: 4 }}>
                  <CloseCircleOutlined style={{ color: '#cf1322', marginRight: 8 }} />
                  {JSON.stringify(change.initial)}
                </div>
                <div style={{ background: '#f6ffed', padding: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  {JSON.stringify(change.current)}
                </div>
              </div>
            ))}
          </Space>
        )}
      </Drawer>
    );
  };
  
  // Render
  return (
    <div className="enhanced-config-editor" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>{schema.title || 'Configuration Editor'}</h2>
          {schema.description && (
            <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>{schema.description}</p>
          )}
          {isDirty && (
            <Tag color="warning" style={{ marginTop: 8 }}>
              <WarningOutlined /> Unsaved changes
            </Tag>
          )}
          {lastSaved && (
            <Tag color="success" style={{ marginTop: 8 }}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </Tag>
          )}
        </div>
        
        <Space>
          {showTemplates && templates.length > 0 && (
            <Select
              placeholder="Load template..."
              style={{ width: 200 }}
              value={selectedTemplate}
              onChange={(name) => {
                const template = templates.find(t => t.name === name);
                if (template) handleLoadTemplate(template);
              }}
            >
              {templates.map(template => (
                <Option key={template.name} value={template.name}>
                  {template.name}
                </Option>
              ))}
            </Select>
          )}
          
          {showDiff && isDirty && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => setShowDiffDrawer(true)}
            >
              View Changes
            </Button>
          )}
          
          <Switch
            checked={mode === 'json'}
            onChange={(checked) => setMode(checked ? 'json' : 'visual')}
            checkedChildren={<CodeOutlined />}
            unCheckedChildren={<EditOutlined />}
          />
          
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={!isDirty}
          >
            Reset
          </Button>
          
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => handleSave(false)}
            disabled={Object.keys(errors).length > 0}
          >
            Save
          </Button>
        </Space>
      </div>
      
      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert
          message={`${Object.keys(errors).length} validation error(s)`}
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{field}: {error}</li>
              ))}
            </ul>
          }
          type="error"
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Body */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '1px solid #d9d9d9' }}>
        {mode === 'visual' ? renderVisualMode() : renderJSONMode()}
      </div>
      
      {/* Diff Drawer */}
      {showDiff && renderDiffDrawer()}
    </div>
  );
};

export default EnhancedConfigEditor;

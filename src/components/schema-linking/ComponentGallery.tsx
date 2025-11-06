import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Empty, Spin, Tag, Input, Switch, InputNumber, Button, Select, message, Badge } from 'antd';
import {
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined,
  AppstoreOutlined,
  CodeOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface ComponentGalleryProps {
  feature: string | null;
  darkMode: boolean;
}

interface ComponentConfig {
  id: string;
  type: string;
  field: string;
  label: string;
  required: boolean;
  validation?: any[];
  position?: any;
}

const ComponentGallery: React.FC<ComponentGalleryProps> = ({
  feature,
  darkMode
}) => {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [componentValues, setComponentValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (feature) {
      loadDashboards(feature);
    }
  }, [feature]);

  const loadDashboards = async (featureName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/schema-linking/dashboards/${featureName}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboards(result.data.dashboards || []);
        setComponentValues({});
        setValidationErrors({});
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (componentId: string, value: any) => {
    setComponentValues(prev => ({
      ...prev,
      [componentId]: value
    }));
    // Clear validation error when user makes changes
    if (validationErrors[componentId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[componentId];
        return newErrors;
      });
    }
  };

  const validateComponent = (component: ComponentConfig): boolean => {
    const value = componentValues[component.id];
    
    if (component.required && (value === undefined || value === null || value === '')) {
      setValidationErrors(prev => ({
        ...prev,
        [component.id]: `${component.label} is required`
      }));
      return false;
    }

    if (component.validation) {
      for (const rule of component.validation) {
        if (rule.type === 'maxLength' && value && value.length > rule.value) {
          setValidationErrors(prev => ({
            ...prev,
            [component.id]: `Maximum length is ${rule.value}`
          }));
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = () => {
    let isValid = true;
    dashboards.forEach(dashboard => {
      dashboard.components?.forEach((component: ComponentConfig) => {
        if (!validateComponent(component)) {
          isValid = false;
        }
      });
    });

    if (isValid) {
      message.success('All components validated successfully!');
      console.log('Component values:', componentValues);
    } else {
      message.error('Please fix validation errors');
    }
  };

  const renderComponent = (component: ComponentConfig) => {
    const value = componentValues[component.id];
    const error = validationErrors[component.id];
    const commonProps = {
      value,
      onChange: (e: any) => handleComponentChange(component.id, e?.target?.value ?? e),
      placeholder: component.label,
      status: error ? 'error' : undefined,
      style: { width: '100%' }
    };

    switch (component.type) {
      case 'input':
        return (
          <div>
            <Input {...commonProps} />
            {error && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>{error}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div>
            <TextArea {...commonProps} rows={4} />
            {error && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>{error}</div>}
          </div>
        );

      case 'number':
        return (
          <div>
            <InputNumber
              value={value}
              onChange={(val) => handleComponentChange(component.id, val)}
              placeholder={component.label}
              status={error ? 'error' : undefined}
              style={{ width: '100%' }}
            />
            {error && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>{error}</div>}
          </div>
        );

      case 'toggle':
        return (
          <div>
            <Switch
              checked={value || false}
              onChange={(checked) => handleComponentChange(component.id, checked)}
            />
            <span style={{ marginLeft: 8 }}>{value ? 'Enabled' : 'Disabled'}</span>
          </div>
        );

      case 'datetime':
        return (
          <div>
            <Input
              type="datetime-local"
              value={value}
              onChange={(e) => handleComponentChange(component.id, e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        );

      case 'date':
        return (
          <div>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleComponentChange(component.id, e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        );

      case 'json-editor':
        return (
          <div>
            <TextArea
              {...commonProps}
              rows={6}
              placeholder={`Enter JSON for ${component.label}`}
            />
            {error && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>{error}</div>}
          </div>
        );

      case 'uuid-display':
        return (
          <div>
            <Input
              value={value || 'Auto-generated'}
              disabled
              style={{ width: '100%' }}
            />
          </div>
        );

      default:
        return (
          <div>
            <Input {...commonProps} />
            {error && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>{error}</div>}
          </div>
        );
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'toggle':
        return '🔘';
      case 'number':
        return '🔢';
      case 'textarea':
        return '📝';
      case 'json-editor':
        return '{ }';
      case 'datetime':
        return '📅';
      default:
        return '📄';
    }
  };

  return (
    <div className="component-gallery">
      <style>{`
        .component-gallery {
          padding: 16px 0;
        }
        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .component-card {
          margin-bottom: 16px;
        }
        .component-item {
          padding: 16px;
          border: 1px solid #d9d9d9;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .dark-mode .component-item {
          border-color: #434343;
          background: #262626;
        }
        .component-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .component-label {
          font-weight: 500;
          font-size: 14px;
        }
        .component-meta {
          display: flex;
          gap: 8px;
        }
      `}</style>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Loading components..." />
        </div>
      ) : dashboards.length > 0 ? (
        <>
          <div className="gallery-header">
            <h3>
              <AppstoreOutlined /> Component Gallery ({dashboards.reduce((sum, d) => sum + (d.components?.length || 0), 0)} components)
            </h3>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              Validate All
            </Button>
          </div>

          {dashboards.map((dashboard) => (
            <Card
              key={dashboard.id}
              title={dashboard.name}
              extra={
                <Tag color="blue">
                  {dashboard.components?.length || 0} components
                </Tag>
              }
              className="component-card"
            >
              <Row gutter={[16, 16]}>
                {dashboard.components?.map((component: ComponentConfig) => (
                  <Col key={component.id} xs={24} md={12} lg={8}>
                    <div className="component-item">
                      <div className="component-header">
                        <div>
                          <span className="component-label">
                            {getComponentIcon(component.type)} {component.label}
                          </span>
                        </div>
                        <div className="component-meta">
                          <Tag color={component.required ? 'red' : 'default'}>
                            {component.required ? 'Required' : 'Optional'}
                          </Tag>
                          <Tag color="cyan">{component.type}</Tag>
                        </div>
                      </div>
                      {renderComponent(component)}
                      <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                        Field: <code>{component.field}</code>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              <div style={{ marginTop: 16, padding: '12px', background: darkMode ? '#262626' : '#fafafa', borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CodeOutlined />
                  <strong>Component Schema:</strong>
                </div>
                <pre style={{ marginTop: 8, fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(dashboard.layout, null, 2)}
                </pre>
              </div>
            </Card>
          ))}

          <Card
            title="Validation Summary"
            style={{ marginTop: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                      {dashboards.reduce((sum, d) => sum + (d.components?.length || 0), 0)}
                    </div>
                    <div style={{ color: '#8c8c8c' }}>Total Components</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                      {Object.keys(componentValues).length}
                    </div>
                    <div style={{ color: '#8c8c8c' }}>Components Filled</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: Object.keys(validationErrors).length > 0 ? '#ff4d4f' : '#52c41a' }}>
                      {Object.keys(validationErrors).length}
                    </div>
                    <div style={{ color: '#8c8c8c' }}>Validation Errors</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      ) : (
        <Empty description="No components available for this feature" />
      )}
    </div>
  );
};

export default ComponentGallery;

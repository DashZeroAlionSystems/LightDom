import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, Button, message, Row, Col, Divider } from 'antd';
import {
  EyeOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  CameraOutlined
} from '@ant-design/icons';

interface DashboardPreviewProps {
  feature: string | null;
  darkMode: boolean;
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  feature,
  darkMode
}) => {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);

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
        if (result.data.dashboards && result.data.dashboards.length > 0) {
          setSelectedDashboard(result.data.dashboards[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = () => {
    message.success('Dashboard preview captured!');
    // In a real implementation, this would capture a screenshot
  };

  const renderComponentPreview = (component: any) => {
    const baseStyle: React.CSSProperties = {
      padding: '12px',
      border: `1px solid ${darkMode ? '#434343' : '#d9d9d9'}`,
      borderRadius: '4px',
      background: darkMode ? '#262626' : '#fff',
      marginBottom: '8px'
    };

    return (
      <div key={component.id} style={baseStyle}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 500, 
          marginBottom: '8px',
          color: component.required ? '#ff4d4f' : '#8c8c8c'
        }}>
          {component.label} {component.required && '*'}
        </div>
        
        {/* Render mock component based on type */}
        {component.type === 'input' && (
          <div style={{
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            background: darkMode ? '#141414' : '#fafafa',
            color: '#8c8c8c'
          }}>
            Enter {component.label.toLowerCase()}...
          </div>
        )}
        
        {component.type === 'textarea' && (
          <div style={{
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            background: darkMode ? '#141414' : '#fafafa',
            minHeight: '80px',
            color: '#8c8c8c'
          }}>
            Enter {component.label.toLowerCase()}...
          </div>
        )}
        
        {component.type === 'number' && (
          <div style={{
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            background: darkMode ? '#141414' : '#fafafa',
            color: '#8c8c8c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>0</span>
            <div>
              <span style={{ margin: '0 4px', cursor: 'pointer' }}>▲</span>
              <span style={{ margin: '0 4px', cursor: 'pointer' }}>▼</span>
            </div>
          </div>
        )}
        
        {component.type === 'toggle' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '44px',
              height: '22px',
              borderRadius: '11px',
              background: '#00000040',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '2px',
                left: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Disabled</span>
          </div>
        )}
        
        {component.type === 'json-editor' && (
          <div style={{
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            background: darkMode ? '#141414' : '#fafafa',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#8c8c8c',
            minHeight: '100px'
          }}>
            {'{'}
            <br />
            &nbsp;&nbsp;// Enter JSON here
            <br />
            {'}'}
          </div>
        )}
        
        <div style={{ 
          marginTop: '4px', 
          fontSize: '11px', 
          color: '#8c8c8c' 
        }}>
          Field: <code style={{ 
            background: darkMode ? '#141414' : '#f5f5f5',
            padding: '2px 6px',
            borderRadius: '2px'
          }}>{component.field}</code>
        </div>
      </div>
    );
  };

  const renderGridLayout = (dashboard: any) => {
    const columns = dashboard.layout?.columns || 12;
    const components = dashboard.components || [];
    
    // Group components into rows based on their width
    const rows: any[][] = [];
    let currentRow: any[] = [];
    let currentWidth = 0;
    
    components.forEach((component: any) => {
      const width = component.position?.width || 6;
      if (currentWidth + width > columns) {
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [component];
        currentWidth = width;
      } else {
        currentRow.push(component);
        currentWidth += width;
      }
    });
    
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }
    
    return (
      <div style={{ width: '100%' }}>
        {rows.map((row, rowIndex) => (
          <Row key={rowIndex} gutter={16} style={{ marginBottom: '16px' }}>
            {row.map((component: any) => {
              const width = component.position?.width || 6;
              const span = Math.round((width / columns) * 24);
              return (
                <Col key={component.id} span={span}>
                  {renderComponentPreview(component)}
                </Col>
              );
            })}
          </Row>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-preview">
      <style>{`
        .dashboard-preview {
          padding: 16px 0;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .dashboard-selector {
          margin-bottom: 16px;
        }
        .dashboard-frame {
          padding: 24px;
          background: ${darkMode ? '#1f1f1f' : '#fff'};
          border: 2px solid ${darkMode ? '#434343' : '#d9d9d9'};
          border-radius: 12px;
          min-height: 400px;
        }
        .dashboard-title-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid ${darkMode ? '#434343' : '#e8e8e8'};
          margin-bottom: 24px;
        }
      `}</style>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Loading dashboard preview..." />
        </div>
      ) : selectedDashboard ? (
        <>
          <div className="preview-header">
            <h3>
              <EyeOutlined /> Dashboard Preview
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button icon={<CameraOutlined />} onClick={handleCapture}>
                Capture
              </Button>
              <Button icon={<DownloadOutlined />}>
                Export
              </Button>
              <Button type="primary" icon={<FullscreenOutlined />}>
                Full Screen
              </Button>
            </div>
          </div>

          {dashboards.length > 1 && (
            <div className="dashboard-selector">
              <Card size="small">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {dashboards.map((dashboard) => (
                    <Button
                      key={dashboard.id}
                      type={selectedDashboard?.id === dashboard.id ? 'primary' : 'default'}
                      onClick={() => setSelectedDashboard(dashboard)}
                      size="small"
                    >
                      {dashboard.name}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          <div className="dashboard-frame">
            <div className="dashboard-title-bar">
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>
                  {selectedDashboard.name}
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#8c8c8c', fontSize: '12px' }}>
                  {selectedDashboard.table} · {selectedDashboard.components?.length || 0} components
                </p>
              </div>
              <div>
                <span style={{
                  padding: '4px 12px',
                  background: darkMode ? '#262626' : '#f0f0f0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#8c8c8c'
                }}>
                  {selectedDashboard.layout?.type || 'grid'} layout · {selectedDashboard.layout?.columns || 12} columns
                </span>
              </div>
            </div>

            {renderGridLayout(selectedDashboard)}

            <Divider />

            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Button type="primary" size="large" style={{ marginRight: 8 }}>
                Save Configuration
              </Button>
              <Button size="large">
                Reset
              </Button>
            </div>
          </div>

          <Card title="Layout Information" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {selectedDashboard.layout?.columns || 12}
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Grid Columns</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {selectedDashboard.components?.length || 0}
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Components</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                    {selectedDashboard.layout?.responsive ? 'Yes' : 'No'}
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Responsive</div>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      ) : (
        <Empty description="No dashboard preview available" />
      )}
    </div>
  );
};

export default DashboardPreview;

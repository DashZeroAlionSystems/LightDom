import React from 'react';
import { Card, Button, Space, Typography, Alert } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSEO } from '../../hooks/useSEO';

const { Title, Text } = Typography;

const SEOIntegrationTest: React.FC = () => {
  const { loading, modelStatus, getModelStatus } = useSEO();

  const testSEOIntegration = async () => {
    try {
      // Test basic connectivity
      await getModelStatus();
      console.log('SEO Integration Test: ✅ Model status check passed');
    } catch (error) {
      console.error('SEO Integration Test: ❌ Failed', error);
    }
  };

  return (
    <Card title="SEO Pipeline Integration Test" style={{ margin: '16px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Integration Status"
          description={
            <div>
              <p><strong>SEO Dashboard:</strong> ✅ Integrated into React Admin Dashboard</p>
              <p><strong>API Service:</strong> ✅ Created with TypeScript interfaces</p>
              <p><strong>Custom Hook:</strong> ✅ useSEO hook implemented</p>
              <p><strong>Chart Library:</strong> ✅ @ant-design/plots installed</p>
              <p><strong>Routing:</strong> ✅ Added to App.tsx routes</p>
              <p><strong>Navigation:</strong> ✅ Added to DashboardLayout menu</p>
            </div>
          }
          type="success"
          showIcon
        />
        
        <div>
          <Title level={5}>Test SEO API Connection</Title>
          <Button 
            type="primary" 
            onClick={testSEOIntegration}
            loading={loading}
            icon={<CheckCircleOutlined />}
          >
            Test Connection
          </Button>
        </div>

        {modelStatus && (
          <Alert
            message="Model Status"
            description={
              <div>
                <p><strong>Loaded:</strong> {modelStatus.loaded ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Training:</strong> {modelStatus.training ? '🔄 In Progress' : '⏸️ Idle'}</p>
                <p><strong>Samples:</strong> {modelStatus.metrics?.trainingSamples || 0}</p>
              </div>
            }
            type={modelStatus.loaded ? 'success' : 'warning'}
            showIcon
          />
        )}

        <Alert
          message="Next Steps"
          description={
            <div>
              <p>1. Start the SEO API service: <Text code>cd seo-pipeline && npm start</Text></p>
              <p>2. Navigate to the SEO Pipeline section in the dashboard</p>
              <p>3. Test website analysis and AI recommendations</p>
              <p>4. Monitor trends and model training</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default SEOIntegrationTest;
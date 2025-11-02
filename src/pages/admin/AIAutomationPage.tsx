import React from 'react';
import { Card, Typography, Space } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import OllamaN8nDashboard from '../../../frontend/src/components/OllamaN8nDashboard';

const { Title, Paragraph } = Typography;

/**
 * AI Automation Admin Page
 * 
 * Admin interface for Ollama & n8n automation features
 */
const AIAutomationPage: React.FC = () => {
  return (
    <div style={{ padding: 0 }}>
      <OllamaN8nDashboard />
    </div>
  );
};

export default AIAutomationPage;

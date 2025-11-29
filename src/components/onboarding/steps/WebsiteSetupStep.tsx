/**
 * Website Setup Step - URL input and technical contact
 */

import React, { useState } from 'react';
import { Form, Input, Button, Space, Typography, message, Divider } from 'antd';
import {
  GlobalOutlined,
  UserOutlined,
  MailOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface WebsiteSetupStepProps {
  websiteUrl: string;
  technicalContact: {
    name: string;
    email: string;
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const WebsiteSetupStep: React.FC<WebsiteSetupStepProps> = ({
  websiteUrl,
  technicalContact,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const validateUrl = (_: any, value: string) => {
    if (!value) {
      return Promise.reject('Please enter your website URL');
    }
    
    try {
      const url = new URL(value.startsWith('http') ? value : `https://${value}`);
      if (!url.hostname.includes('.')) {
        return Promise.reject('Please enter a valid domain');
      }
      return Promise.resolve();
    } catch {
      return Promise.reject('Please enter a valid URL');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Normalize URL
      const normalizedUrl = values.websiteUrl.startsWith('http') 
        ? values.websiteUrl 
        : `https://${values.websiteUrl}`;

      // Verify website is accessible
      const response = await fetch('/api/seo/verify-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      });

      if (!response.ok) {
        throw new Error('Unable to access website');
      }

      onUpdate({
        websiteUrl: normalizedUrl,
        technicalContact: {
          name: values.technicalName || '',
          email: values.technicalEmail || ''
        }
      });

      message.success('Website verified successfully!');
      onNext();
    } catch (error: any) {
      message.error(error.message || 'Failed to verify website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Title level={2}>
        <GlobalOutlined style={{ marginRight: 12 }} />
        Add Your Website
      </Title>
      <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
        Enter your website URL to start analyzing your SEO performance.
        We'll verify the site is accessible and generate your first report.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          websiteUrl,
          technicalName: technicalContact.name,
          technicalEmail: technicalContact.email
        }}
      >
        <Form.Item
          name="websiteUrl"
          label="Website URL"
          rules={[{ validator: validateUrl }]}
          extra="Example: example.com or https://example.com"
        >
          <Input
            size="large"
            prefix={<GlobalOutlined />}
            placeholder="Enter your website URL"
            autoFocus
          />
        </Form.Item>

        <Divider>Technical Contact (Optional)</Divider>
        
        <Paragraph type="secondary">
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          If you need help installing our tracking script, provide a technical contact.
          We'll send detailed installation instructions to this person.
        </Paragraph>

        <Form.Item
          name="technicalName"
          label="Technical Contact Name"
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="John Doe"
          />
        </Form.Item>

        <Form.Item
          name="technicalEmail"
          label="Technical Contact Email"
          rules={[
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder="developer@example.com"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Space size="middle">
            <Button onClick={onPrevious} size="large">
              Back
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={loading}
            >
              Verify Website
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WebsiteSetupStep;

/**
 * Script Setup Step - Easy script installation guide
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Steps, message, Input, Tabs, Alert } from 'antd';
import {
  CodeOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  MailOutlined,
  GoogleOutlined,
  CloudOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

interface ScriptSetupStepProps {
  websiteUrl: string;
  technicalContact: {
    name: string;
    email: string;
  };
  selectedPlan: string;
  onComplete: () => void;
  onPrevious: () => void;
}

const ScriptSetupStep: React.FC<ScriptSetupStepProps> = ({
  websiteUrl,
  technicalContact,
  selectedPlan,
  onComplete,
  onPrevious
}) => {
  const [apiKey, setApiKey] = useState('');
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    generateApiKey();
  }, []);

  const generateApiKey = async () => {
    try {
      const response = await fetch('/api/onboarding/generate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl, plan: selectedPlan })
      });

      const data = await response.json();
      setApiKey(data.apiKey);
      setScriptGenerated(true);
    } catch (error) {
      // Generate mock key for demo
      const mockKey = `ld_${Math.random().toString(36).substr(2, 32)}`;
      setApiKey(mockKey);
      setScriptGenerated(true);
    }
  };

  const getTrackingScript = () => {
    return `<!-- LightDom SEO Tracking Script -->
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['LightDomSEO'] = o; w[o] = w[o] || function() { 
      (w[o].q = w[o].q || []).push(arguments) 
    };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; 
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'ld', 'https://cdn.lightdom.io/seo-tracker.js'));
  
  ld('init', '${apiKey}');
  ld('track', 'pageview');
</script>
<!-- End LightDom SEO Tracking Script -->`;
  };

  const getGTMScript = () => {
    return `<!-- Add this to Google Tag Manager as Custom HTML Tag -->
<script>
  window.LightDomSEO = window.LightDomSEO || function() { 
    (window.LightDomSEO.q = window.LightDomSEO.q || []).push(arguments) 
  };
  
  var script = document.createElement('script');
  script.src = 'https://cdn.lightdom.io/seo-tracker.js';
  script.async = true;
  document.head.appendChild(script);
  
  script.onload = function() {
    LightDomSEO('init', '${apiKey}');
    LightDomSEO('track', 'pageview');
  };
</script>`;
  };

  const getWordPressInstructions = () => {
    return `1. Install "Insert Headers and Footers" plugin
2. Go to Settings > Insert Headers and Footers
3. Paste the tracking script in "Scripts in Header"
4. Click "Save"

Alternative: Add to your theme's header.php before </head> tag`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${type} copied to clipboard!`);
  };

  const sendEmailInstructions = async () => {
    if (!technicalContact.email) {
      message.warning('No technical contact email provided');
      return;
    }

    try {
      await fetch('/api/onboarding/send-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: technicalContact.email,
          name: technicalContact.name,
          websiteUrl,
          apiKey,
          script: getTrackingScript()
        })
      });

      setEmailSent(true);
      message.success(`Instructions sent to ${technicalContact.email}`);
    } catch (error) {
      message.error('Failed to send email');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
        <CodeOutlined style={{ marginRight: 12 }} />
        Install Tracking Script
      </Title>
      <Paragraph style={{ textAlign: 'center', fontSize: 16, color: '#666', marginBottom: 40 }}>
        Add the tracking script to your website to start monitoring SEO performance.
        Choose the method that works best for you.
      </Paragraph>

      {selectedPlan === 'free' && (
        <Alert
          message="Free Trial Limitations"
          description="The free trial provides a one-time report. To enable continuous monitoring, upgrade to a paid plan."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Your API Key:</Text>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Input
                value={apiKey}
                readOnly
                style={{ fontFamily: 'monospace' }}
              />
              <Button
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(apiKey, 'API Key')}
              >
                Copy
              </Button>
            </div>
          </div>

          <Alert
            message="Keep your API key secure"
            description="This key is unique to your account. Don't share it publicly."
            type="warning"
            showIcon
          />
        </Space>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <CodeOutlined />
              Direct Installation
            </span>
          }
          key="1"
        >
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Title level={5}>Copy this script into your website's &lt;head&gt; section:</Title>
                <TextArea
                  value={getTrackingScript()}
                  readOnly
                  rows={10}
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                />
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(getTrackingScript(), 'Script')}
                  style={{ marginTop: 8 }}
                >
                  Copy Script
                </Button>
              </div>

              <Steps direction="vertical" size="small">
                <Step
                  status="process"
                  title="Open your website's HTML"
                  description="Access your website's source code or theme files"
                />
                <Step
                  status="process"
                  title="Find the <head> section"
                  description="Locate the <head> tag in your HTML, usually near the top"
                />
                <Step
                  status="process"
                  title="Paste the script"
                  description="Paste the tracking script just before the closing </head> tag"
                />
                <Step
                  status="process"
                  title="Save and deploy"
                  description="Save your changes and deploy to your live website"
                />
              </Steps>
            </Space>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <GoogleOutlined />
              Google Tag Manager
            </span>
          }
          key="2"
        >
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Title level={5}>Add as Custom HTML Tag in GTM:</Title>
                <TextArea
                  value={getGTMScript()}
                  readOnly
                  rows={12}
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                />
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(getGTMScript(), 'GTM Script')}
                  style={{ marginTop: 8 }}
                >
                  Copy GTM Code
                </Button>
              </div>

              <Steps direction="vertical" size="small">
                <Step
                  status="process"
                  title="Login to Google Tag Manager"
                  description="Access your GTM account at tagmanager.google.com"
                />
                <Step
                  status="process"
                  title="Create New Tag"
                  description="Click 'New Tag' and choose 'Custom HTML'"
                />
                <Step
                  status="process"
                  title="Paste Code"
                  description="Paste the GTM script into the HTML field"
                />
                <Step
                  status="process"
                  title="Set Trigger"
                  description="Set trigger to 'All Pages' and publish container"
                />
              </Steps>
            </Space>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <CloudOutlined />
              WordPress
            </span>
          }
          key="3"
        >
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Alert
                message="WordPress Installation"
                description={getWordPressInstructions()}
                type="info"
                showIcon
              />

              <div>
                <Title level={5}>Script to install:</Title>
                <TextArea
                  value={getTrackingScript()}
                  readOnly
                  rows={10}
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                />
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(getTrackingScript(), 'Script')}
                  style={{ marginTop: 8 }}
                >
                  Copy Script
                </Button>
              </div>
            </Space>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <MailOutlined />
              Email Instructions
            </span>
          }
          key="4"
        >
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Title level={5}>Send to Technical Team</Title>
              <Paragraph>
                If you have a technical team member, we can send them detailed installation
                instructions via email.
              </Paragraph>

              {technicalContact.email ? (
                <div>
                  <Alert
                    message={`Instructions will be sent to: ${technicalContact.email}`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Button
                    type="primary"
                    icon={<MailOutlined />}
                    onClick={sendEmailInstructions}
                    disabled={emailSent}
                  >
                    {emailSent ? 'Email Sent!' : 'Send Instructions'}
                  </Button>
                  {emailSent && (
                    <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 12, fontSize: 24 }} />
                  )}
                </div>
              ) : (
                <Alert
                  message="No technical contact provided"
                  description="Go back to add a technical contact email address"
                  type="warning"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </TabPane>
      </Tabs>

      <Card style={{ marginTop: 24, background: '#f0f7ff', borderColor: '#1890ff' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5}>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            Installation Complete?
          </Title>
          <Paragraph>
            Once the script is installed, we'll automatically detect it and start monitoring your SEO.
            You can always access these instructions from your dashboard settings.
          </Paragraph>
        </Space>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Space size="middle">
          <Button onClick={onPrevious} size="large">
            Back
          </Button>
          <Button type="primary" size="large" onClick={onComplete}>
            Complete Setup
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ScriptSetupStep;

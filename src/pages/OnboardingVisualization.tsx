/**
 * Onboarding Visualization Component
 * 
 * Interactive React component showing the automated user onboarding flow
 * with real-time progress tracking and statistics
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Typography, Steps, Tag, Statistic, Button } from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  DashboardOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  RocketOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface OnboardingUser {
  email: string;
  websiteUrl: string;
  companyName: string;
  industry: string;
  goals: string[];
  techStack: string[];
}

interface OnboardingStats {
  totalOnboarded: number;
  componentsGenerated: number;
  optimizationsApplied: number;
  avgOnboardingTime: number;
  successRate: number;
}

const demoUsers: OnboardingUser[] = [
  {
    email: 'sarah@techstartup.io',
    websiteUrl: 'https://techstartup.io',
    companyName: 'Tech Startup Inc',
    industry: 'Technology',
    goals: ['increase_traffic', 'improve_seo', 'generate_leads'],
    techStack: ['React', 'Node.js', 'PostgreSQL']
  },
  {
    email: 'mike@ecommerce-store.com',
    websiteUrl: 'https://ecommerce-store.com',
    companyName: 'E-commerce Store',
    industry: 'E-commerce',
    goals: ['boost_sales', 'user_experience', 'improve_seo'],
    techStack: ['WordPress', 'WooCommerce', 'MySQL']
  },
  {
    email: 'jane@consultingfirm.com',
    websiteUrl: 'https://consultingfirm.com',
    companyName: 'Professional Consulting',
    industry: 'Consulting',
    goals: ['generate_leads', 'increase_traffic', 'user_experience'],
    techStack: ['Next.js', 'Tailwind CSS', 'Vercel']
  }
];

const onboardingSteps = [
  { title: 'User Signup', icon: <UserOutlined />, description: 'Account creation and profile setup' },
  { title: 'SEO Analysis', icon: <SearchOutlined />, description: 'Automated website analysis' },
  { title: 'Dashboard Generation', icon: <DashboardOutlined />, description: 'Custom dashboard creation' },
  { title: 'Script Creation', icon: <CodeOutlined />, description: 'Optimization script generation' },
  { title: 'Setup Complete', icon: <CheckCircleOutlined />, description: 'Ready to use' }
];

const OnboardingVisualization: React.FC = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<OnboardingStats>({
    totalOnboarded: 0,
    componentsGenerated: 0,
    optimizationsApplied: 0,
    avgOnboardingTime: 7.5,
    successRate: 100
  });
  const [seoScore, setSeoScore] = useState({ current: 0, potential: 0 });

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        
        // Update SEO scores on analysis step
        if (currentStep === 1) {
          setSeoScore({
            current: Math.floor(Math.random() * 40) + 35,
            potential: Math.floor(Math.random() * 25) + 70
          });
        }
        
        // Update stats on completion
        if (currentStep === onboardingSteps.length - 2) {
          setStats(prev => ({
            ...prev,
            totalOnboarded: prev.totalOnboarded + 1,
            componentsGenerated: prev.componentsGenerated + Math.floor(Math.random() * 3) + 4,
            optimizationsApplied: prev.optimizationsApplied + Math.floor(Math.random() * 3) + 2
          }));
        }
      } else {
        // Move to next user
        if (currentUserIndex < demoUsers.length - 1) {
          setCurrentUserIndex(prev => prev + 1);
          setCurrentStep(0);
        } else {
          setIsRunning(false);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunning, currentStep, currentUserIndex]);

  const startDemo = () => {
    setCurrentUserIndex(0);
    setCurrentStep(0);
    setIsRunning(true);
    setStats({
      totalOnboarded: 0,
      componentsGenerated: 0,
      optimizationsApplied: 0,
      avgOnboardingTime: 7.5,
      successRate: 100
    });
  };

  const currentUser = demoUsers[currentUserIndex];
  const isComplete = !isRunning && stats.totalOnboarded > 0;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Title level={1} className="!text-white">
            <RocketOutlined className="mr-3" />
            Automated User Onboarding Demo
          </Title>
          <Paragraph className="text-slate-300 text-lg">
            Watch the complete onboarding flow with real-time progress tracking
          </Paragraph>
        </div>

        {/* Statistics Panel */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700">
              <Statistic
                title={<span className="text-slate-300">Users Onboarded</span>}
                value={stats.totalOnboarded}
                valueStyle={{ color: '#60a5fa' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700">
              <Statistic
                title={<span className="text-slate-300">Components Generated</span>}
                value={stats.componentsGenerated}
                valueStyle={{ color: '#10b981' }}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700">
              <Statistic
                title={<span className="text-slate-300">Optimizations Applied</span>}
                value={stats.optimizationsApplied}
                valueStyle={{ color: '#c084fc' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700">
              <Statistic
                title={<span className="text-slate-300">Success Rate</span>}
                value={stats.successRate}
                suffix="%"
                valueStyle={{ color: '#10b981' }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Current User Card */}
        {!isComplete && (
          <Card className="bg-slate-800 border-slate-700 mb-6" title={
            <span className="text-white">
              Current User: {currentUser.email} ({currentUserIndex + 1}/{demoUsers.length})
            </span>
          }>
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <Text className="text-slate-400">Company:</Text>
                  <div className="text-white font-semibold">{currentUser.companyName}</div>
                </div>
                <div className="mb-4">
                  <Text className="text-slate-400">Industry:</Text>
                  <div className="text-white font-semibold">{currentUser.industry}</div>
                </div>
                <div className="mb-4">
                  <Text className="text-slate-400">Website:</Text>
                  <div className="text-white font-semibold">{currentUser.websiteUrl}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <Text className="text-slate-400">Goals:</Text>
                  <div className="mt-2">
                    {currentUser.goals.map((goal, idx) => (
                      <Tag key={idx} color="blue" className="mb-2">
                        {goal.replace(/_/g, ' ')}
                      </Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <Text className="text-slate-400">Tech Stack:</Text>
                  <div className="mt-2">
                    {currentUser.techStack.map((tech, idx) => (
                      <Tag key={idx} color="green" className="mb-2">
                        {tech}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Progress Steps */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <Steps current={currentStep} items={onboardingSteps.map(step => ({
            ...step,
            status: currentStep > onboardingSteps.indexOf(step) ? 'finish' : 
                    currentStep === onboardingSteps.indexOf(step) ? 'process' : 'wait'
          }))} />
        </Card>

        {/* SEO Analysis Results */}
        {currentStep >= 1 && currentStep < onboardingSteps.length - 1 && seoScore.current > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-6" title={
            <span className="text-white">SEO Analysis Results</span>
          }>
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-4">
                  <Text className="text-slate-400">Current SEO Score</Text>
                  <Progress
                    percent={seoScore.current}
                    strokeColor={{ '0%': '#fb923c', '100%': '#fbbf24' }}
                    className="mb-2"
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <Text className="text-slate-400">Potential SEO Score</Text>
                  <Progress
                    percent={seoScore.potential}
                    strokeColor={{ '0%': '#10b981', '100%': '#34d399' }}
                    className="mb-2"
                  />
                </div>
              </Col>
            </Row>
            <div className="mt-4">
              <Tag color="success">
                Potential Improvement: +{seoScore.potential - seoScore.current} points
              </Tag>
            </div>
          </Card>
        )}

        {/* Completion Card */}
        {isComplete && (
          <Card className="bg-gradient-to-r from-green-900 to-green-800 border-green-700 mb-6">
            <div className="text-center">
              <CheckCircleOutlined className="text-6xl text-green-400 mb-4" />
              <Title level={2} className="!text-white mb-4">
                Onboarding Complete!
              </Title>
              <Paragraph className="text-slate-200 text-lg">
                Successfully onboarded {stats.totalOnboarded} users with {stats.componentsGenerated} components generated
                and {stats.optimizationsApplied} optimizations applied.
              </Paragraph>
            </div>
          </Card>
        )}

        {/* Control Button */}
        <div className="text-center">
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={startDemo}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? 'Onboarding in Progress...' : isComplete ? 'Run Again' : 'Start Demo'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingVisualization;

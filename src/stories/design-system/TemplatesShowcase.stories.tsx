import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DashboardTemplate, LandingTemplate, AuthTemplate } from '../../components/templates';
import { Card } from '../../components/atoms/Card/Card';
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { DataTable } from '../../components/organisms/DataTable/DataTable';
import { EmptyState } from '../../components/molecules/EmptyState/EmptyState';

const meta: Meta = {
  title: 'Design System/Templates',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Page templates combining atoms, molecules, and organisms for common layouts. Templates provide the skeleton for complete pages.',
      },
    },
  },
};

export default meta;

// Sample data for dashboard
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
];

export const Dashboard: StoryObj = {
  render: () => {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    return (
      <DashboardTemplate
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        notificationCount={5}
        user={{ name: 'John Doe', email: 'john@example.com' }}
      >
        <div className="space-y-6">
          <div>
            <Typography variant="h1" className="mb-2">Dashboard</Typography>
            <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
              Welcome back, John! Here's what's happening today.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="elevated">
              <Card.Header>
                <Typography variant="h3">Total Users</Typography>
              </Card.Header>
              <div className="p-6">
                <Typography variant="h1" className="text-blue-600">1,234</Typography>
                <Typography variant="body2" className="text-green-600">+12% from last month</Typography>
              </div>
            </Card>

            <Card variant="elevated">
              <Card.Header>
                <Typography variant="h3">Revenue</Typography>
              </Card.Header>
              <div className="p-6">
                <Typography variant="h1" className="text-blue-600">$45,678</Typography>
                <Typography variant="body2" className="text-green-600">+8% from last month</Typography>
              </div>
            </Card>

            <Card variant="elevated">
              <Card.Header>
                <Typography variant="h3">Active Sessions</Typography>
              </Card.Header>
              <div className="p-6">
                <Typography variant="h1" className="text-blue-600">567</Typography>
                <Typography variant="body2" className="text-red-600">-3% from last month</Typography>
              </div>
            </Card>
          </div>

          <Card variant="elevated">
            <Card.Header>
              <Typography variant="h2">Recent Users</Typography>
            </Card.Header>
            <DataTable
              data={sampleData}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' },
              ]}
              searchable
              paginated
            />
          </Card>
        </div>
      </DashboardTemplate>
    );
  },
};

export const DashboardEmpty: StoryObj = {
  render: () => {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    return (
      <DashboardTemplate
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        notificationCount={0}
        user={{ name: 'New User', email: 'newuser@example.com' }}
      >
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
          <EmptyState
            icon="inbox"
            title="No data yet"
            description="Get started by adding your first item"
            primaryAction={{ label: 'Add Item', onClick: () => alert('Add item') }}
            secondaryAction={{ label: 'Learn More', onClick: () => alert('Learn more') }}
            size="large"
          />
        </div>
      </DashboardTemplate>
    );
  },
};

export const Landing: StoryObj = {
  render: () => (
    <LandingTemplate showCTA>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Typography variant="h1" className="mb-4">
            Build Amazing Products Faster
          </Typography>
          <Typography variant="lead" className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            A comprehensive design system with reusable components, animations, and templates to accelerate your development.
          </Typography>
          <div className="flex gap-4 justify-center">
            <Button size="large" variant="primary">Get Started Free</Button>
            <Button size="large" variant="outline">View Documentation</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card variant="elevated">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <Typography variant="h3" className="mb-2">Fast Development</Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Build pages in minutes with pre-built components and templates
              </Typography>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <Typography variant="h3" className="mb-2">Fully Accessible</Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                WCAG 2.1 compliant components with keyboard navigation
              </Typography>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <Typography variant="h3" className="mb-2">Fully Customizable</Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Customize every component to match your brand
              </Typography>
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
          <Typography variant="h2" className="mb-4 text-white">
            Join 10,000+ developers
          </Typography>
          <Typography variant="lead" className="mb-8 text-blue-100">
            Start building beautiful applications today with our design system
          </Typography>
          <div className="flex gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-3 rounded-lg w-80 text-gray-900"
            />
            <Button size="large" variant="primary" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </LandingTemplate>
  ),
};

export const SignIn: StoryObj = {
  render: () => (
    <AuthTemplate
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      showSocialLogin
    >
      <form className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
        />
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          required
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Forgot password?
          </a>
        </div>
        <Button type="submit" variant="primary" className="w-full" size="large">
          Sign In
        </Button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </a>
        </p>
      </form>
    </AuthTemplate>
  ),
};

export const SignUp: StoryObj = {
  render: () => (
    <AuthTemplate
      title="Create your account"
      subtitle="Join thousands of users on our platform"
      showSocialLogin
    >
      <form className="space-y-4">
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          required
        />
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
        />
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          helperText="Must be at least 8 characters"
          required
        />
        <Input
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          required
        />
        <Button type="submit" variant="primary" className="w-full" size="large">
          Create Account
        </Button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </a>
        </p>
      </form>
    </AuthTemplate>
  ),
};

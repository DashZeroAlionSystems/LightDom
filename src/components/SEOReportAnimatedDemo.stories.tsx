import type { Meta, StoryObj } from '@storybook/react';
import { SEOReportAnimatedDemo } from './SEOReportAnimatedDemo';

const meta = {
  title: 'Reports/SEO Report Animated Demo',
  component: SEOReportAnimatedDemo,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component: 'Beautiful animated SEO report for client presentations. Inspired by animejs.com with smooth transitions, Material Design 3 styling, and interactive elements.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    clientName: {
      control: 'text',
      description: 'Name of the client',
    },
    domain: {
      control: 'text',
      description: 'Client domain',
    },
    dateRange: {
      control: 'text',
      description: 'Date range for the report',
    },
  },
} satisfies Meta<typeof SEOReportAnimatedDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clientName: 'Your Company',
    domain: 'example.com',
    dateRange: 'Last 30 Days',
  },
};

export const CustomClient: Story = {
  args: {
    clientName: 'Acme Corporation',
    domain: 'acme-corp.com',
    dateRange: 'Q4 2024',
  },
};

export const MonthlyReport: Story = {
  args: {
    clientName: 'Tech Startup Inc.',
    domain: 'techstartup.io',
    dateRange: 'November 2024',
  },
};

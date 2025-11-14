/**
 * DemoTemplate Storybook Stories
 * 
 * Demonstrates how to use the reusable DemoTemplate component
 * for creating consistent demo experiences.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DemoTemplate } from './DemoTemplate';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  KpiGrid,
  KpiCard,
  Input,
  Button,
} from '@/components/ui';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

const meta: Meta<typeof DemoTemplate> = {
  title: 'Templates/DemoTemplate',
  component: DemoTemplate,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A reusable template for creating interactive demo components with consistent styling and controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showControls: {
      control: 'boolean',
      description: 'Show demo control buttons (play, pause, reset)',
    },
    showStatus: {
      control: 'boolean',
      description: 'Show status badge indicator',
    },
    initialState: {
      control: 'select',
      options: ['idle', 'running', 'paused', 'completed'],
      description: 'Initial state of the demo',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DemoTemplate>;

/**
 * Basic demo with simple content
 */
export const Basic: Story = {
  args: {
    title: 'Basic Demo',
    description: 'A simple demonstration with minimal content',
    children: (
      <Card variant="outlined">
        <CardContent>
          <p className="text-on-surface">This is the demo content area.</p>
          <p className="text-on-surface-variant mt-2">
            Use the controls above to start, pause, or reset the demo.
          </p>
        </CardContent>
      </Card>
    ),
  },
};

/**
 * Demo with KPI metrics
 */
export const WithKPIMetrics: Story = {
  args: {
    title: 'Dashboard Metrics Demo',
    description: 'Demonstrates KPI cards with the design system',
    children: (
      <KpiGrid columns={3}>
        <KpiCard
          label="Active Users"
          value="1,234"
          delta="+12% vs last month"
          tone="primary"
          icon={<Users className="h-4 w-4" />}
        />
        <KpiCard
          label="Revenue"
          value="$45.6K"
          delta="+8.3% vs last month"
          tone="success"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Growth Rate"
          value="15.2%"
          delta="+2.1% vs last month"
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </KpiGrid>
    ),
  },
};

/**
 * Demo with form inputs
 */
export const WithFormInputs: Story = {
  args: {
    title: 'Form Interaction Demo',
    description: 'Interactive form with design system components',
    children: (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Fill in the form below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input 
              label="Full Name" 
              placeholder="John Doe" 
            />
            <Input 
              label="Email" 
              type="email"
              placeholder="john@example.com" 
            />
            <Input 
              label="Company" 
              placeholder="Acme Corp" 
            />
            <Button variant="filled" fullWidth>
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    ),
  },
};

/**
 * Demo without controls
 */
export const WithoutControls: Story = {
  args: {
    title: 'Static Demo',
    description: 'A demo without playback controls',
    showControls: false,
    children: (
      <Card variant="filled">
        <CardContent>
          <p className="text-on-surface">
            This demo doesn't include interactive controls.
            It's useful for static demonstrations or reference implementations.
          </p>
        </CardContent>
      </Card>
    ),
  },
};

/**
 * Demo without status badge
 */
export const WithoutStatus: Story = {
  args: {
    title: 'Clean Demo',
    description: 'A demo without the status badge',
    showStatus: false,
    children: (
      <Card variant="outlined">
        <CardContent>
          <p className="text-on-surface">
            This demo hides the status badge for a cleaner header appearance.
          </p>
        </CardContent>
      </Card>
    ),
  },
};

/**
 * Demo starting in running state
 */
export const StartInRunning: Story = {
  args: {
    title: 'Auto-Running Demo',
    description: 'This demo starts in the running state automatically',
    initialState: 'running',
    children: (
      <Card variant="elevated">
        <CardContent>
          <p className="text-on-surface">
            ⚡ This demo is already running!
          </p>
          <p className="text-on-surface-variant mt-2">
            Notice the timer is counting up automatically.
          </p>
        </CardContent>
      </Card>
    ),
  },
};

/**
 * Complex demo with multiple sections
 */
export const ComplexDemo: Story = {
  args: {
    title: 'Comprehensive Feature Demo',
    description: 'A full-featured demo showing multiple design system components',
    children: (
      <div className="space-y-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Section 1: Metrics Overview</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <KpiGrid columns={2}>
              <KpiCard
                label="Completion Rate"
                value="94%"
                delta="+6% improvement"
                tone="success"
              />
              <KpiCard
                label="Avg Response Time"
                value="1.2s"
                delta="-0.3s faster"
                tone="primary"
              />
            </KpiGrid>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Section 2: Configuration</CardTitle>
            <CardDescription>Adjust demo parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input label="Parameter 1" placeholder="Value" />
              <Input label="Parameter 2" placeholder="Value" />
            </div>
          </CardContent>
        </Card>

        <Card variant="filled">
          <CardContent>
            <p className="text-on-surface font-medium">✅ Demo Ready</p>
            <p className="text-on-surface-variant text-sm mt-1">
              All systems operational and ready for demonstration
            </p>
          </CardContent>
        </Card>
      </div>
    ),
  },
};

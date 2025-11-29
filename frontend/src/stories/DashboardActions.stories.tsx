import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Play, Square, RefreshCw, Settings2, Wrench } from 'lucide-react';

import {
  ServiceActionBar,
  ServiceActionButton,
  Divider,
} from '@/components/ui';
import type { ServiceActionButtonProps } from '@/components/ui/ServiceActionButton';

type ControlledButtonProps = ServiceActionButtonProps & {
  simulateError?: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ControlledActionButton: React.FC<ControlledButtonProps> = ({ simulateError = false, ...props }) => {
  const [status, setStatus] = React.useState(props.status ?? 'idle');

  return (
    <ServiceActionButton
      {...props}
      status={status}
      onStatusChange={setStatus}
      onAction={async () => {
        await sleep(800);
        if (simulateError) {
          throw new Error('Simulated runtime failure');
        }
      }}
    />
  );
};

const meta: Meta<typeof ServiceActionBar> = {
  title: 'Dashboard/Service Actions',
  component: ServiceActionBar,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen w-full bg-background p-6">
        <div className="mx-auto max-w-5xl">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ServiceActionBar>;

export const PrimaryActions: Story = {
  name: 'Primary Actions',
  render: () => (
    <ServiceActionBar
      title="Crawler Actions"
      description="Trigger operational workflows for the crawler service."
      trailing={
        <button type="button" className="text-xs font-medium text-primary hover:underline">
          View history
        </button>
      }
    >
      <ControlledActionButton
        id="start-crawler"
        label="Start crawler"
        description="Resume scanning queued domains"
        icon={<Play className="h-4 w-4" />}
        variant="primary"
      />
      <ControlledActionButton
        id="stop-crawler"
        label="Stop crawler"
        description="Gracefully pause all worker nodes"
        icon={<Square className="h-4 w-4" />}
        variant="secondary"
      />
      <ControlledActionButton
        id="calibrate"
        label="Calibrate heuristics"
        description="Run adaptive tuning across datasets"
        icon={<Wrench className="h-4 w-4" />}
      />
    </ServiceActionBar>
  ),
};

export const MixedStatus: Story = {
  name: 'Mixed Status & Dividers',
  render: () => (
    <ServiceActionBar
      title="Workflow Controls"
      description="Monitor automation commands with live status feedback."
    >
      <ControlledActionButton
        id="sync"
        label="Sync services"
        description="Pull the latest metrics snapshot"
        icon={<RefreshCw className="h-4 w-4" />}
      />
      <ControlledActionButton
        id="settings"
        label="Open service settings"
        description="Review and update configuration schema"
        icon={<Settings2 className="h-4 w-4" />}
        variant="secondary"
      />
      <Divider orientation="horizontal" className="col-span-full" />
      <ControlledActionButton
        id="stress-test"
        label="Run stress test"
        description="Schedule a 15-minute load test"
        icon={<Play className="h-4 w-4" />}
        variant="danger"
        simulateError
      />
    </ServiceActionBar>
  ),
};

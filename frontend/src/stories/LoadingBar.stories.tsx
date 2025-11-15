import type { Meta, StoryObj } from '@storybook/react';
import { LoadingBar, LoadingBarProps } from '../components/ui/LoadingBar';
import loadersGuide from '../config/style-guides/loaders.json';

const meta: Meta<typeof LoadingBar> = {
  title: 'Design System/Feedback/LoadingBar',
  component: LoadingBar,
  parameters: {
    docs: {
      description: {
        component:
          'Material Design 3 line loader with rhythm animations. Use to communicate progress for orchestrator-driven workflows.',
      },
    },
  },
  args: loadersGuide.loadingBar.default satisfies LoadingBarProps,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'info'],
    },
    rhythm: {
      control: 'select',
      options: ['steady', 'pulse', 'wave'],
    },
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof LoadingBar>;

export const RhythmSteady: Story = {
  name: 'Rhythmic (Steady)',
};

export const ControlledProgress: Story = {
  args: {
    progress: 72,
    label: 'Analyzing SEO signals…',
  },
};

export const SuccessComplete: Story = {
  args: {
    progress: 100,
    variant: 'success',
    label: 'Simulation complete',
  },
};

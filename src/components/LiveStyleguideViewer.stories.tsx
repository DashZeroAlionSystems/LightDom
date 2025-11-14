import type { Meta, StoryObj } from '@storybook/react';
import { LiveStyleguideViewer } from './LiveStyleguideViewer';

const meta: Meta<typeof LiveStyleguideViewer> = {
  title: 'Design System/Live Styleguide Viewer',
  component: LiveStyleguideViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An interactive styleguide viewer inspired by animejs.com that shows design tokens with live editing and real-time updates across the system.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LiveStyleguideViewer>;

export const Default: Story = {
  args: {
    initialConfig: {
      colors: {
        primary: '#5865F2',
        secondary: '#7C5CFF',
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
      },
      spacing: {
        base: 4,
      },
      animations: {
        duration: 300,
        easing: 'easeOutExpo',
      },
    },
  },
};

export const WithConfigListener: Story = {
  args: {
    initialConfig: {
      colors: {
        primary: '#5865F2',
      },
    },
    onConfigChange: (config) => {
      console.log('Config changed:', config);
    },
  },
};

export const CustomTheme: Story = {
  args: {
    initialConfig: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
        fontSize: '18px',
      },
    },
  },
};

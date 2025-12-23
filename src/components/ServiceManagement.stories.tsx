import type { Meta, StoryObj } from '@storybook/react';
import ServiceManagement from './ServiceManagement';

const meta = {
  title: 'Components/ServiceManagement',
  component: ServiceManagement,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServiceManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

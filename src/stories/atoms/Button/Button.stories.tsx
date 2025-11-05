import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/atoms/Button/Button';

const meta: Meta<typeof Button> = {
  title: 'Atom/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {},
};


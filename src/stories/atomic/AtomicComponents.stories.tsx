import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../design-system/AtomicComponents';

const meta: Meta<typeof Button> = {
  title: 'Atomic Design/Atoms/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Filled: Story = {
  args: {
    variant: 'filled',
    children: 'Click Me',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Click Me',
  },
};

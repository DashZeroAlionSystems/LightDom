import type { Meta, StoryObj } from '@storybook/react';
import { Lock, Mail, Search, User } from 'lucide-react';
import { Input } from '../../../components/atoms/Input/Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    placeholder: 'Outlined input',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    placeholder: 'Filled input',
  },
};

// With label
export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'john_doe',
    helperText: 'Choose a unique username',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'email@example.com',
    error: 'Please enter a valid email address',
  },
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search...',
    leftIcon: Search,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: 'Enter email',
    rightIcon: Mail,
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: 'Search emails...',
    leftIcon: Search,
    rightIcon: Mail,
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    placeholder: 'Medium input',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
};

// States
export const Disabled: Story = {
  args: {
    label: 'Disabled',
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    value: 'This is read-only',
    readOnly: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'Spans full width',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// Real-world examples
export const EmailForm: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@company.com',
    leftIcon: Mail,
    helperText: 'We will never share your email',
  },
};

export const PasswordInput: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    leftIcon: Lock,
    helperText: 'Minimum 8 characters',
  },
};

export const SearchBar: Story = {
  args: {
    placeholder: 'Search components...',
    leftIcon: Search,
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const ErrorStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Input
        label='Email'
        placeholder='email@example.com'
        leftIcon={Mail}
        error='Email is required'
      />
      <Input
        label='Username'
        placeholder='username'
        leftIcon={User}
        error='Username must be at least 3 characters'
      />
      <Input
        label='Password'
        type='password'
        placeholder='password'
        leftIcon={Lock}
        error='Password must contain at least one number'
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Input variant='outlined' placeholder='Outlined variant' label='Outlined' />
      <Input variant='filled' placeholder='Filled variant' label='Filled' />
      <Input
        variant='outlined'
        placeholder='With helper'
        label='With Helper'
        helperText='This is helper text'
      />
      <Input
        variant='outlined'
        placeholder='With error'
        label='With Error'
        error='This is an error'
      />
      <Input variant='outlined' placeholder='Disabled' label='Disabled' disabled />
    </div>
  ),
};

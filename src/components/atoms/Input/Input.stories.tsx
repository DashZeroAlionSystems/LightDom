import type { Meta, StoryObj } from '@storybook/react';
import { Eye, Lock, Mail, Search } from 'lucide-react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
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

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    leftIcon: <Mail className='h-4 w-4' />,
    type: 'email',
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    rightIcon: <Search className='h-4 w-4' />,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Password',
    type: 'password',
    leftIcon: <Lock className='h-4 w-4' />,
    rightIcon: <Eye className='h-4 w-4' />,
    placeholder: 'Enter password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    leftIcon: <Mail className='h-4 w-4' />,
    error: 'Please enter a valid email address',
    value: 'invalid-email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'johndoe',
    helperText: 'Your username must be unique',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot type here',
    disabled: true,
    value: 'Some value',
  },
};

export const FilledVariant: Story = {
  args: {
    label: 'Filled Input',
    placeholder: 'Type here...',
    variant: 'filled',
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Small Input',
    placeholder: 'Small',
    size: 'sm',
    leftIcon: <Search className='h-3 w-3' />,
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Large Input',
    placeholder: 'Large',
    size: 'lg',
    leftIcon: <Mail className='h-5 w-5' />,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'Spans full container width',
    fullWidth: true,
  },
};

export const EmailForm: Story = {
  render: () => (
    <div className='space-y-4'>
      <Input
        label='Email'
        type='email'
        placeholder='you@example.com'
        leftIcon={<Mail className='h-4 w-4' />}
        helperText="We'll never share your email"
      />
      <Input
        label='Password'
        type='password'
        placeholder='••••••••'
        leftIcon={<Lock className='h-4 w-4' />}
        rightIcon={<Eye className='h-4 w-4' />}
      />
    </div>
  ),
};

export const ErrorStates: Story = {
  render: () => (
    <div className='space-y-4'>
      <Input
        label='Email'
        value='invalid'
        error='Please enter a valid email'
        leftIcon={<Mail className='h-4 w-4' />}
      />
      <Input
        label='Password'
        type='password'
        value='123'
        error='Password must be at least 8 characters'
        leftIcon={<Lock className='h-4 w-4' />}
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold mb-3'>Outlined (Default)</h3>
        <div className='space-y-3'>
          <Input placeholder='Outlined small' size='sm' variant='outlined' />
          <Input placeholder='Outlined medium' size='md' variant='outlined' />
          <Input placeholder='Outlined large' size='lg' variant='outlined' />
        </div>
      </div>
      <div>
        <h3 className='text-lg font-semibold mb-3'>Filled</h3>
        <div className='space-y-3'>
          <Input placeholder='Filled small' size='sm' variant='filled' />
          <Input placeholder='Filled medium' size='md' variant='filled' />
          <Input placeholder='Filled large' size='lg' variant='filled' />
        </div>
      </div>
    </div>
  ),
};

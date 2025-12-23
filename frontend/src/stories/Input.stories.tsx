import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input } from '@/components/ui/Input';
import { Search, Mail, Lock, Eye, EyeOff, User, Calendar, CreditCard } from 'lucide-react';

/**
 * # Input Component
 * 
 * Material Design 3 inspired form input with floating labels,
 * validation states, and icon support.
 * 
 * ## Styleguide Rules
 * - Minimum height: 48px for touch targets
 * - Use floating labels for better UX
 * - Always provide error messages for validation
 * - Helper text should be concise
 */
const meta: Meta<typeof Input> = {
  title: 'DESIGN SYSTEM/Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
    label: {
      control: 'text',
      description: 'Floating label text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text below input',
    },
    error: {
      control: 'text',
      description: 'Error message (overrides helperText)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The Input component provides Material Design 3 styled form inputs with:
- **Floating labels**: Labels animate to top when focused or has value
- **Validation states**: Error styling with icon and message
- **Icon support**: Left and right icon slots
- **Helper text**: Contextual help below the input
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Outlined: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    variant: 'outlined',
  },
};

export const Filled: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    variant: 'filled',
  },
};

// ============================================================================
// With Icons
// ============================================================================

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    leftIcon: <Search className="w-5 h-5" />,
    placeholder: 'Search...',
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Password',
    type: 'password',
    rightIcon: <Eye className="w-5 h-5" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Email',
    leftIcon: <Mail className="w-5 h-5" />,
    rightIcon: <Search className="w-5 h-5" />,
  },
};

// ============================================================================
// States
// ============================================================================

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    helperText: 'Choose a unique username (3-20 characters)',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    defaultValue: 'Cannot edit this',
    disabled: true,
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input size="sm" label="Small Input" />
      <Input size="md" label="Medium Input (Default)" />
      <Input size="lg" label="Large Input" />
    </div>
  ),
};

// ============================================================================
// Form Examples
// ============================================================================

export const LoginForm: Story = {
  render: () => {
    const [showPassword, setShowPassword] = React.useState(false);
    
    return (
      <div className="space-y-4 max-w-sm p-6 bg-surface rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <Input 
          label="Email" 
          type="email"
          leftIcon={<Mail className="w-5 h-5" />}
          helperText="We'll never share your email"
        />
        <Input 
          label="Password" 
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example login form demonstrating input composition.',
      },
    },
  },
};

export const ProfileForm: Story = {
  render: () => (
    <div className="space-y-4 max-w-md p-6 bg-surface rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" leftIcon={<User className="w-5 h-5" />} />
        <Input label="Last Name" />
      </div>
      <Input label="Email Address" type="email" leftIcon={<Mail className="w-5 h-5" />} />
      <Input label="Date of Birth" type="date" leftIcon={<Calendar className="w-5 h-5" />} />
      <Input label="Credit Card" leftIcon={<CreditCard className="w-5 h-5" />} placeholder="XXXX XXXX XXXX XXXX" />
    </div>
  ),
};

// ============================================================================
// Validation States
// ============================================================================

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input 
        label="Default" 
        helperText="No validation applied"
      />
      <Input 
        label="Success State" 
        defaultValue="valid@email.com"
        helperText="Email is valid"
        state="success"
      />
      <Input 
        label="Error State" 
        defaultValue="invalid"
        error="This field is required"
      />
      <Input 
        label="Disabled State" 
        defaultValue="Cannot edit"
        disabled
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible validation states for the Input component.',
      },
    },
  },
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4">Outlined Variant</h3>
        <div className="space-y-4">
          <Input variant="outlined" label="Default" />
          <Input variant="outlined" label="With Icon" leftIcon={<Search className="w-5 h-5" />} />
          <Input variant="outlined" label="With Error" error="This field is required" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Filled Variant</h3>
        <div className="space-y-4">
          <Input variant="filled" label="Default" />
          <Input variant="filled" label="With Icon" leftIcon={<Search className="w-5 h-5" />} />
          <Input variant="filled" label="With Error" error="This field is required" />
        </div>
      </div>
    </div>
  ),
};

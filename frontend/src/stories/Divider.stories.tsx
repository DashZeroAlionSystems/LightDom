/**
 * Divider Component Stories
 * 
 * Visual separator component with flexible orientation and styling options.
 * Following LightDom Design System guidelines.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// Inline Divider component for Storybook (avoids import issues)
const Divider: React.FC<{
  orientation?: 'horizontal' | 'vertical';
  variant?: 'fullWidth' | 'inset' | 'middle';
  thickness?: 'thin' | 'medium' | 'thick';
  text?: string;
  textAlign?: 'start' | 'center' | 'end';
  className?: string;
}> = ({
  orientation = 'horizontal',
  variant = 'fullWidth',
  thickness = 'thin',
  text,
  textAlign = 'center',
  className = '',
}) => {
  const thicknessClasses = {
    thin: orientation === 'horizontal' ? 'h-px' : 'w-px',
    medium: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
    thick: orientation === 'horizontal' ? 'h-1' : 'w-1',
  };

  const baseClasses = `shrink-0 bg-gray-200 dark:bg-gray-700 transition-all duration-200 ${thicknessClasses[thickness]}`;
  
  const variantClasses = {
    fullWidth: orientation === 'horizontal' ? 'w-full' : 'h-full',
    inset: orientation === 'horizontal' ? 'w-full mx-4' : 'h-full my-4',
    middle: orientation === 'horizontal' ? 'max-w-md mx-auto' : 'max-h-md my-auto',
  };

  if (text && orientation === 'horizontal') {
    return (
      <div className={`relative flex items-center w-full ${className}`}>
        <div className={`${baseClasses} flex-1`} />
        <span className={`px-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 ${
          textAlign === 'start' ? 'order-first' : textAlign === 'end' ? 'order-last' : ''
        }`}>
          {text}
        </span>
        <div className={`${baseClasses} flex-1`} />
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  );
};

const meta: Meta<typeof Divider> = {
  title: 'DESIGN SYSTEM/Atoms/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## Divider Component

Visual separator used to divide content sections. Supports horizontal and vertical orientations with multiple styling variants.

### Design System Rules
- **Spacing**: Always maintain 16px (1rem) spacing around dividers
- **Color**: Uses outline-variant color for subtle separation
- **Thickness**: Thin (1px) for most cases, medium/thick for emphasis
- **Text**: Only use text with horizontal dividers

### Accessibility
- Dividers are decorative and don't need ARIA labels
- Text in dividers should be meaningful context
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the divider',
    },
    variant: {
      control: 'radio',
      options: ['fullWidth', 'inset', 'middle'],
      description: 'Visual style variant',
    },
    thickness: {
      control: 'radio',
      options: ['thin', 'medium', 'thick'],
      description: 'Line thickness',
    },
    text: {
      control: 'text',
      description: 'Optional text label (horizontal only)',
    },
    textAlign: {
      control: 'radio',
      options: ['start', 'center', 'end'],
      description: 'Text position within divider',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

// Basic horizontal divider
export const Default: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'fullWidth',
    thickness: 'thin',
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <p className="mb-4 text-gray-700 dark:text-gray-300">Content above divider</p>
      <Divider {...args} />
      <p className="mt-4 text-gray-700 dark:text-gray-300">Content below divider</p>
    </div>
  ),
};

// All thickness variants
export const ThicknessVariants: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div>
        <p className="text-sm text-gray-500 mb-2">Thin (default)</p>
        <Divider thickness="thin" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Medium</p>
        <Divider thickness="medium" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Thick</p>
        <Divider thickness="thick" />
      </div>
    </div>
  ),
};

// Layout variants
export const LayoutVariants: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-lg">
      <div>
        <p className="text-sm text-gray-500 mb-2">Full Width</p>
        <div className="border border-dashed border-gray-300 p-4">
          <Divider variant="fullWidth" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Inset (with margins)</p>
        <div className="border border-dashed border-gray-300 p-4">
          <Divider variant="inset" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Middle (centered, max-width)</p>
        <div className="border border-dashed border-gray-300 p-4">
          <Divider variant="middle" />
        </div>
      </div>
    </div>
  ),
};

// Divider with text
export const WithText: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div>
        <p className="text-sm text-gray-500 mb-2">Text Center</p>
        <Divider text="OR" textAlign="center" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Text Start</p>
        <Divider text="Section Title" textAlign="start" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Text End</p>
        <Divider text="More" textAlign="end" />
      </div>
    </div>
  ),
};

// Vertical divider
export const VerticalDivider: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-32">
      <div className="flex-1 text-center text-gray-700 dark:text-gray-300">Left Content</div>
      <Divider orientation="vertical" />
      <div className="flex-1 text-center text-gray-700 dark:text-gray-300">Right Content</div>
    </div>
  ),
};

// In a list context
export const InListContext: Story = {
  render: () => (
    <div className="w-full max-w-md border rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Item One</h3>
        <p className="text-sm text-gray-500">Description for item one</p>
      </div>
      <Divider variant="inset" />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Item Two</h3>
        <p className="text-sm text-gray-500">Description for item two</p>
      </div>
      <Divider variant="inset" />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Item Three</h3>
        <p className="text-sm text-gray-500">Description for item three</p>
      </div>
    </div>
  ),
};

// Login form example with OR divider
export const LoginFormExample: Story = {
  render: () => (
    <div className="w-full max-w-sm p-6 border rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">Sign In</h2>
      
      <button className="w-full px-4 py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        </svg>
        Continue with Google
      </button>
      
      <button className="w-full px-4 py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        Continue with GitHub
      </button>
      
      <Divider text="or continue with email" />
      
      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        />
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Sign In
        </button>
      </div>
    </div>
  ),
};

// Toolbar with vertical dividers
export const ToolbarExample: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
      
      <div className="h-6">
        <Divider orientation="vertical" />
      </div>
      
      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded font-bold">B</button>
      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded italic">I</button>
      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded underline">U</button>
      
      <div className="h-6">
        <Divider orientation="vertical" />
      </div>
      
      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>
      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  ),
};

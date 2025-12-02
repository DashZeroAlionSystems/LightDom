/**
 * Toast Component Stories
 * 
 * Notification system for displaying feedback messages.
 * Following LightDom Design System guidelines.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

// Toast item interface
interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  action?: { label: string; onClick: () => void };
}

// Inline Toast component for Storybook
const Toast: React.FC<ToastItem & { onClose: () => void }> = ({
  title,
  description,
  variant = 'default',
  action,
  onClose,
}) => {
  const variantStyles = {
    default: 'border-gray-200 dark:border-gray-700',
    success: 'border-green-500 bg-green-500/5',
    warning: 'border-yellow-500 bg-yellow-500/5',
    error: 'border-red-500 bg-red-500/5',
    info: 'border-blue-500 bg-blue-500/5',
  };

  const iconColors = {
    default: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  };

  const icons = {
    default: null,
    success: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={`relative flex w-full items-center gap-3 rounded-lg border bg-white dark:bg-gray-900 p-4 shadow-lg transition-all duration-300 ${variantStyles[variant]}`}
    >
      {icons[variant] && (
        <span className={iconColors[variant]}>{icons[variant]}</span>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-sm font-medium text-gray-900 dark:text-white">{title}</div>
        )}
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast container for demos
const ToastDemo: React.FC<{
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  children: React.ReactNode;
}> = ({ position = 'top-right', children }) => {
  const positionStyles = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`fixed z-50 flex flex-col gap-2 max-w-sm w-full ${positionStyles[position]}`}>
      {children}
    </div>
  );
};

const meta: Meta<typeof Toast> = {
  title: 'DESIGN SYSTEM/Molecules/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Toast Component

Non-blocking notification system for displaying feedback messages to users.

### Design System Rules
- **Duration**: Auto-dismiss after 5 seconds (configurable)
- **Position**: Top-right by default, supports all corners and center positions
- **Max Width**: 384px (24rem) for readability
- **Stacking**: New toasts appear below existing ones
- **Animation**: Slide in from edge, fade out on dismiss

### Accessibility
- Uses role="alert" for screen readers
- Actions must be keyboard accessible
- Sufficient color contrast for all variants

### When to Use
- **Success**: Confirmation of completed actions
- **Error**: Critical failures requiring attention
- **Warning**: Important notices or cautions
- **Info**: General information updates
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toast>;

// All variants
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Toast
        id="1"
        variant="default"
        title="Default Toast"
        description="This is a default notification message."
        onClose={() => {}}
      />
      <Toast
        id="2"
        variant="success"
        title="Success!"
        description="Your changes have been saved successfully."
        onClose={() => {}}
      />
      <Toast
        id="3"
        variant="warning"
        title="Warning"
        description="Your session will expire in 5 minutes."
        onClose={() => {}}
      />
      <Toast
        id="4"
        variant="error"
        title="Error"
        description="Failed to save changes. Please try again."
        onClose={() => {}}
      />
      <Toast
        id="5"
        variant="info"
        title="Information"
        description="A new version is available."
        onClose={() => {}}
      />
    </div>
  ),
};

// Toast with action
export const WithAction: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Toast
        id="1"
        variant="default"
        title="File deleted"
        description="document.pdf has been moved to trash."
        action={{ label: 'Undo', onClick: () => alert('Undo clicked') }}
        onClose={() => {}}
      />
      <Toast
        id="2"
        variant="info"
        title="Update available"
        description="Version 2.0 is ready to install."
        action={{ label: 'Install', onClick: () => alert('Install clicked') }}
        onClose={() => {}}
      />
      <Toast
        id="3"
        variant="error"
        title="Connection lost"
        description="Unable to connect to the server."
        action={{ label: 'Retry', onClick: () => alert('Retry clicked') }}
        onClose={() => {}}
      />
    </div>
  ),
};

// Title only
export const TitleOnly: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Toast
        id="1"
        variant="success"
        title="Saved!"
        onClose={() => {}}
      />
      <Toast
        id="2"
        variant="error"
        title="Something went wrong"
        onClose={() => {}}
      />
    </div>
  ),
};

// Interactive demo
export const InteractiveDemo: Story = {
  render: function InteractiveToastDemo() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = (variant: ToastItem['variant']) => {
      const messages = {
        success: { title: 'Success!', description: 'Operation completed successfully.' },
        error: { title: 'Error', description: 'Something went wrong. Please try again.' },
        warning: { title: 'Warning', description: 'Please review before continuing.' },
        info: { title: 'Info', description: 'Here is some useful information.' },
        default: { title: 'Notification', description: 'You have a new message.' },
      };

      const newToast: ToastItem = {
        id: Date.now().toString(),
        variant,
        ...messages[variant],
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addToast('success')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Show Success
          </button>
          <button
            onClick={() => addToast('error')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Show Error
          </button>
          <button
            onClick={() => addToast('warning')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Show Warning
          </button>
          <button
            onClick={() => addToast('info')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Show Info
          </button>
        </div>

        <div className="relative h-64 w-full border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <p className="p-4 text-sm text-gray-500">Click buttons to show toasts in this area</p>
          
          {/* Toast container */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 max-w-xs w-full">
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// Position variants
export const PositionVariants: Story = {
  render: () => (
    <div className="relative h-96 w-full border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400">
        Toasts can appear in different positions
      </p>
      
      {/* Top Left */}
      <div className="absolute top-4 left-4 w-64">
        <Toast
          id="tl"
          variant="info"
          title="Top Left"
          description="Position: top-left"
          onClose={() => {}}
        />
      </div>

      {/* Top Right */}
      <div className="absolute top-4 right-4 w-64">
        <Toast
          id="tr"
          variant="success"
          title="Top Right"
          description="Position: top-right (default)"
          onClose={() => {}}
        />
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-4 left-4 w-64">
        <Toast
          id="bl"
          variant="warning"
          title="Bottom Left"
          description="Position: bottom-left"
          onClose={() => {}}
        />
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-4 right-4 w-64">
        <Toast
          id="br"
          variant="error"
          title="Bottom Right"
          description="Position: bottom-right"
          onClose={() => {}}
        />
      </div>
    </div>
  ),
};

// Real-world examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Form Submission</h3>
        <Toast
          id="1"
          variant="success"
          title="Profile updated"
          description="Your profile information has been saved."
          onClose={() => {}}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">File Upload</h3>
        <Toast
          id="2"
          variant="success"
          title="Upload complete"
          description="3 files uploaded successfully."
          action={{ label: 'View', onClick: () => {} }}
          onClose={() => {}}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">API Error</h3>
        <Toast
          id="3"
          variant="error"
          title="Connection failed"
          description="Unable to reach the server. Check your internet connection."
          action={{ label: 'Retry', onClick: () => {} }}
          onClose={() => {}}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Destructive Action</h3>
        <Toast
          id="4"
          variant="default"
          title="Item deleted"
          description="The item has been moved to trash."
          action={{ label: 'Undo', onClick: () => {} }}
          onClose={() => {}}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Session Warning</h3>
        <Toast
          id="5"
          variant="warning"
          title="Session expiring"
          description="Your session will expire in 2 minutes."
          action={{ label: 'Extend', onClick: () => {} }}
          onClose={() => {}}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">System Update</h3>
        <Toast
          id="6"
          variant="info"
          title="New features available"
          description="Check out the latest updates in version 2.5."
          action={{ label: 'Learn more', onClick: () => {} }}
          onClose={() => {}}
        />
      </div>
    </div>
  ),
};

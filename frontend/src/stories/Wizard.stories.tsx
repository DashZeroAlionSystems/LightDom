/**
 * Wizard Component Stories
 * 
 * Multi-step workflow component for guided processes.
 * Following LightDom Design System guidelines.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

// Types
type WizardStepStatus = 'pending' | 'active' | 'completed' | 'blocked';

interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  status: WizardStepStatus;
  meta?: {
    badge?: string;
    timestamp?: string;
    caption?: string;
  };
}

// Inline Wizard component for Storybook
const Wizard: React.FC<{
  title: string;
  description?: string;
  steps: WizardStep[];
  activeStepId: string;
  onStepChange?: (stepId: string) => void;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}> = ({
  title,
  description,
  steps,
  activeStepId,
  onStepChange,
  actions,
  footer,
  children,
  className = '',
}) => {
  const completedCount = steps.filter((step) => step.status === 'completed').length;
  const progressLabel = `${completedCount}/${steps.length} steps complete`;

  const statusStyles: Record<WizardStepStatus, { color: string; bgColor: string; borderColor: string }> = {
    pending: { color: 'text-gray-400', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
    active: { color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-500' },
    completed: { color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-500' },
    blocked: { color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-500' },
  };

  const statusIcons: Record<WizardStepStatus, React.ReactNode> = {
    pending: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
      </svg>
    ),
    active: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    completed: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    blocked: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  };

  return (
    <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">{description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {progressLabel}
            </span>
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
        {/* Step navigation */}
        <nav className="space-y-3">
          {steps.map((step, index) => {
            const isActive = step.id === activeStepId;
            const styles = statusStyles[step.status];

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange?.(step.id)}
                className={`
                  w-full rounded-xl border p-4 text-left transition-all duration-200
                  hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${styles.borderColor}
                  ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'bg-white dark:bg-gray-900'}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Step indicator */}
                  <div className={`
                    flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                    ${styles.bgColor} ${styles.color}
                  `}>
                    <span className="text-sm font-semibold">{index + 1}</span>
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${styles.color}`}>{step.title}</span>
                      {step.meta?.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-500">
                          {step.meta.badge}
                        </span>
                      )}
                    </div>
                    {step.subtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{step.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span className={styles.color}>{statusIcons[step.status]}</span>
                      <span className="capitalize">{step.status}</span>
                      {step.meta?.timestamp && <span>• {step.meta.timestamp}</span>}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Step content */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
          {children}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

const meta: Meta<typeof Wizard> = {
  title: 'DESIGN SYSTEM/Organisms/Wizard',
  component: Wizard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## Wizard Component

Multi-step workflow component for guiding users through complex processes.

### Design System Rules
- **Step Indicators**: Clear visual status (pending, active, completed, blocked)
- **Progress Tracking**: Show completion count
- **Navigation**: Allow jumping to completed steps
- **Responsive**: Stack vertically on mobile

### Accessibility
- Steps are keyboard navigable
- Current step announced via aria-current
- Status changes announced to screen readers

### When to Use
- Multi-step forms (checkout, onboarding)
- Configuration wizards
- Setup processes
- Sequential workflows
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Wizard>;

// Basic wizard
export const Default: Story = {
  render: function BasicWizard() {
    const [activeStep, setActiveStep] = useState('step-1');

    const steps: WizardStep[] = [
      { id: 'step-1', title: 'Account Details', subtitle: 'Enter your information', status: 'completed' },
      { id: 'step-2', title: 'Preferences', subtitle: 'Customize your experience', status: 'active' },
      { id: 'step-3', title: 'Review', subtitle: 'Confirm your choices', status: 'pending' },
      { id: 'step-4', title: 'Complete', subtitle: 'Finish setup', status: 'pending' },
    ];

    return (
      <Wizard
        title="Account Setup"
        description="Complete these steps to set up your account"
        steps={steps}
        activeStepId={activeStep}
        onStepChange={setActiveStep}
      >
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Step Content: {steps.find(s => s.id === activeStep)?.title}
          </h3>
          <p className="text-gray-500">Content for the current step goes here</p>
        </div>
      </Wizard>
    );
  },
};

// All step statuses
export const StepStatuses: Story = {
  render: () => {
    const steps: WizardStep[] = [
      { id: 'step-1', title: 'Completed Step', subtitle: 'This step is done', status: 'completed' },
      { id: 'step-2', title: 'Active Step', subtitle: 'Currently working on this', status: 'active' },
      { id: 'step-3', title: 'Blocked Step', subtitle: 'Cannot proceed', status: 'blocked', meta: { badge: 'Action needed' } },
      { id: 'step-4', title: 'Pending Step', subtitle: 'Waiting to start', status: 'pending' },
    ];

    return (
      <Wizard
        title="Step Status Examples"
        description="Demonstrating different step states"
        steps={steps}
        activeStepId="step-2"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="font-medium text-green-800">✓ Completed</p>
            <p className="text-sm text-green-600">Green styling indicates success</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="font-medium text-blue-800">► Active</p>
            <p className="text-sm text-blue-600">Blue styling indicates current step</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-medium text-red-800">⚠ Blocked</p>
            <p className="text-sm text-red-600">Red styling indicates issues</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="font-medium text-gray-800">○ Pending</p>
            <p className="text-sm text-gray-600">Gray styling indicates waiting</p>
          </div>
        </div>
      </Wizard>
    );
  },
};

// With actions
export const WithActions: Story = {
  render: function WizardWithActions() {
    const [activeStep, setActiveStep] = useState('step-2');

    const steps: WizardStep[] = [
      { id: 'step-1', title: 'Basic Info', status: 'completed', meta: { timestamp: '2 hours ago' } },
      { id: 'step-2', title: 'Configuration', status: 'active', meta: { badge: 'Required' } },
      { id: 'step-3', title: 'Deployment', status: 'pending' },
    ];

    return (
      <Wizard
        title="Project Setup"
        description="Configure your new project"
        steps={steps}
        activeStepId={activeStep}
        onStepChange={setActiveStep}
        actions={
          <>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Save Draft
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Continue
            </button>
          </>
        }
        footer={
          <div className="flex items-center justify-between">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              ← Previous
            </button>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Skip
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Next →
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Configuration Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                placeholder="Enter project name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe your project"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Wizard>
    );
  },
};

// Checkout flow example
export const CheckoutFlow: Story = {
  render: function CheckoutWizard() {
    const [activeStep, setActiveStep] = useState('shipping');

    const steps: WizardStep[] = [
      { id: 'cart', title: 'Cart Review', subtitle: '3 items', status: 'completed' },
      { id: 'shipping', title: 'Shipping', subtitle: 'Choose delivery', status: 'active' },
      { id: 'payment', title: 'Payment', subtitle: 'Add payment method', status: 'pending' },
      { id: 'confirm', title: 'Confirmation', subtitle: 'Review order', status: 'pending' },
    ];

    const stepContent: Record<string, React.ReactNode> = {
      cart: (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <p className="font-medium">Product {item}</p>
                <p className="text-sm text-gray-500">Qty: 1</p>
              </div>
              <p className="font-semibold">$29.99</p>
            </div>
          ))}
        </div>
      ),
      shipping: (
        <div className="space-y-4">
          <div className="p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Standard Shipping</p>
                <p className="text-sm text-gray-500">5-7 business days</p>
              </div>
              <p className="font-semibold">$5.99</p>
            </div>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Express Shipping</p>
                <p className="text-sm text-gray-500">2-3 business days</p>
              </div>
              <p className="font-semibold">$12.99</p>
            </div>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Next Day Delivery</p>
                <p className="text-sm text-gray-500">Next business day</p>
              </div>
              <p className="font-semibold">$24.99</p>
            </div>
          </div>
        </div>
      ),
      payment: (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <p className="font-medium mb-3">Credit Card</p>
            <div className="space-y-3">
              <input placeholder="Card Number" className="w-full px-4 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="MM/YY" className="px-4 py-2 border rounded-lg" />
                <input placeholder="CVC" className="px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ),
      confirm: (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <p className="text-gray-500 mt-2">Review your order before placing</p>
        </div>
      ),
    };

    return (
      <Wizard
        title="Checkout"
        description="Complete your purchase"
        steps={steps}
        activeStepId={activeStep}
        onStepChange={setActiveStep}
        footer={
          <div className="flex items-center justify-between">
            <p className="text-lg">
              Total: <span className="font-bold">$95.96</span>
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {activeStep === 'confirm' ? 'Place Order' : 'Continue'}
            </button>
          </div>
        }
      >
        {stepContent[activeStep]}
      </Wizard>
    );
  },
};

// Onboarding flow
export const OnboardingFlow: Story = {
  render: function OnboardingWizard() {
    const [activeStep, setActiveStep] = useState('welcome');

    const steps: WizardStep[] = [
      { id: 'welcome', title: 'Welcome', subtitle: 'Get started', status: 'active' },
      { id: 'profile', title: 'Your Profile', subtitle: 'Tell us about you', status: 'pending' },
      { id: 'preferences', title: 'Preferences', subtitle: 'Customize experience', status: 'pending' },
      { id: 'integrations', title: 'Integrations', subtitle: 'Connect services', status: 'pending', meta: { badge: 'Optional' } },
      { id: 'done', title: "You're Ready!", subtitle: 'Start exploring', status: 'pending' },
    ];

    return (
      <Wizard
        title="Welcome to LightDom!"
        description="Let's get you set up in just a few steps"
        steps={steps}
        activeStepId={activeStep}
        onStepChange={setActiveStep}
        actions={
          <button className="text-sm text-gray-500 hover:text-gray-700">
            Skip Setup
          </button>
        }
      >
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-4xl">👋</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome aboard!
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We're excited to have you here. This quick setup will help you get the most out of LightDom.
          </p>
          <button className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Let's Go →
          </button>
        </div>
      </Wizard>
    );
  },
};

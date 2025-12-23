import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/Accordion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  HelpCircle
} from 'lucide-react';

/**
 * # Accordion Component
 * 
 * Expandable content sections for organizing information.
 * 
 * ## Styleguide Rules
 * - Use for FAQ sections and settings
 * - Only one section open at a time (recommended)
 * - Clear, descriptive trigger labels
 * - Smooth expand/collapse animations
 */
const meta: Meta<typeof Accordion> = {
  title: 'DESIGN SYSTEM/Molecules/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is the Design System?</AccordionTrigger>
        <AccordionContent>
          The Design System is a collection of reusable components, guided by clear standards,
          that can be assembled together to build any number of applications.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I get started?</AccordionTrigger>
        <AccordionContent>
          Import components from the UI library and follow the styleguide for proper usage.
          Each component has documentation and examples in Storybook.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can I customize components?</AccordionTrigger>
        <AccordionContent>
          Yes! All components accept className props and can be styled using Tailwind CSS.
          Design tokens ensure consistent styling across customizations.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================================================
// Multiple Open
// ============================================================================

export const MultipleOpen: Story = {
  render: () => (
    <Accordion type="multiple" className="max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section One</AccordionTrigger>
        <AccordionContent>
          Content for section one. Multiple sections can be open simultaneously.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section Two</AccordionTrigger>
        <AccordionContent>
          Content for section two. This demonstrates the multiple type accordion.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section Three</AccordionTrigger>
        <AccordionContent>
          Content for section three. Open any combination of sections.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// ============================================================================
// FAQ Section
// ============================================================================

export const FAQ: Story = {
  render: () => (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="pricing">
          <AccordionTrigger>What pricing plans are available?</AccordionTrigger>
          <AccordionContent>
            <p className="mb-2">We offer three pricing tiers:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Free:</strong> Basic features for individuals</li>
              <li><strong>Pro:</strong> Advanced features for professionals</li>
              <li><strong>Enterprise:</strong> Custom solutions for large teams</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="refund">
          <AccordionTrigger>What is your refund policy?</AccordionTrigger>
          <AccordionContent>
            We offer a 30-day money-back guarantee on all paid plans. If you're not
            satisfied, contact our support team for a full refund.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="support">
          <AccordionTrigger>How can I get support?</AccordionTrigger>
          <AccordionContent>
            <p className="mb-2">You can reach us through:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email: support@example.com</li>
              <li>Live chat: Available 24/7</li>
              <li>Documentation: docs.example.com</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="security">
          <AccordionTrigger>How is my data protected?</AccordionTrigger>
          <AccordionContent>
            We use industry-standard encryption (AES-256) for data at rest and TLS 1.3
            for data in transit. We're SOC 2 Type II certified and GDPR compliant.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

// ============================================================================
// Settings Panel
// ============================================================================

export const SettingsPanel: Story = {
  render: () => (
    <div className="max-w-md bg-surface rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="account">
          <AccordionTrigger className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Settings
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span>Username</span>
                <span className="text-on-surface-variant">johndoe</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Email</span>
                <span className="text-on-surface-variant">john@example.com</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="notifications">
          <AccordionTrigger className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span>Email notifications</span>
                <span className="text-success">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Push notifications</span>
                <span className="text-error">Disabled</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="security">
          <AccordionTrigger className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span>Two-factor auth</span>
                <span className="text-success">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last login</span>
                <span className="text-on-surface-variant">2 hours ago</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="billing">
          <AccordionTrigger className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span>Plan</span>
                <span className="text-primary font-medium">Pro</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Next billing</span>
                <span className="text-on-surface-variant">Dec 1, 2024</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4">Single (Collapsible)</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content for item 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content for item 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Multiple</h3>
        <Accordion type="multiple">
          <AccordionItem value="1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content for item 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content for item 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Icons</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="settings">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </span>
            </AccordionTrigger>
            <AccordionContent>Configure your settings here.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="help">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Help
              </span>
            </AccordionTrigger>
            <AccordionContent>Get help and support.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

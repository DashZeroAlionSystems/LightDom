import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Switch } from '@/components/ui/Switch';

/**
 * # Switch Component
 * 
 * Toggle switch for boolean settings and preferences.
 * 
 * ## Styleguide Rules
 * - Use for immediate on/off states
 * - Always provide accessible label
 * - Size should match surrounding UI context
 */
const meta: Meta<typeof Switch> = {
  title: 'DESIGN SYSTEM/Atoms/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the switch is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} />;
  },
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch checked={checked} onCheckedChange={setChecked} />;
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <Switch disabled />
      <Switch disabled checked />
    </div>
  ),
};

// ============================================================================
// With Labels
// ============================================================================

export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center gap-3">
        <Switch id="notifications" checked={checked} onCheckedChange={setChecked} />
        <label htmlFor="notifications" className="text-on-surface cursor-pointer">
          Enable notifications
        </label>
      </div>
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <div className="flex items-start gap-3">
        <Switch id="dark-mode" checked={checked} onCheckedChange={setChecked} className="mt-0.5" />
        <div>
          <label htmlFor="dark-mode" className="text-on-surface font-medium cursor-pointer block">
            Dark Mode
          </label>
          <p className="text-on-surface-variant text-sm">
            Use dark theme for the application
          </p>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Settings List
// ============================================================================

export const SettingsList: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      autoSave: true,
      analytics: false,
    });
    
    const toggleSetting = (key: keyof typeof settings) => {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    return (
      <div className="space-y-4 max-w-md">
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
          <div>
            <p className="font-medium text-on-surface">Notifications</p>
            <p className="text-sm text-on-surface-variant">Receive push notifications</p>
          </div>
          <Switch 
            checked={settings.notifications} 
            onCheckedChange={() => toggleSetting('notifications')} 
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
          <div>
            <p className="font-medium text-on-surface">Dark Mode</p>
            <p className="text-sm text-on-surface-variant">Use dark theme</p>
          </div>
          <Switch 
            checked={settings.darkMode} 
            onCheckedChange={() => toggleSetting('darkMode')} 
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
          <div>
            <p className="font-medium text-on-surface">Auto-save</p>
            <p className="text-sm text-on-surface-variant">Automatically save changes</p>
          </div>
          <Switch 
            checked={settings.autoSave} 
            onCheckedChange={() => toggleSetting('autoSave')} 
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
          <div>
            <p className="font-medium text-on-surface">Analytics</p>
            <p className="text-sm text-on-surface-variant">Send usage data</p>
          </div>
          <Switch 
            checked={settings.analytics} 
            onCheckedChange={() => toggleSetting('analytics')} 
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// All States
// ============================================================================

export const AllStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">States</h3>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <Switch />
            <p className="text-sm mt-2">Unchecked</p>
          </div>
          <div className="text-center">
            <Switch checked />
            <p className="text-sm mt-2">Checked</p>
          </div>
          <div className="text-center">
            <Switch disabled />
            <p className="text-sm mt-2">Disabled</p>
          </div>
          <div className="text-center">
            <Switch disabled checked />
            <p className="text-sm mt-2">Disabled Checked</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

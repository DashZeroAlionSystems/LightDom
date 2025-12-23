import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  User, 
  CreditCard, 
  Settings, 
  Bell, 
  Shield,
  LayoutDashboard,
  BarChart,
  FileText
} from 'lucide-react';

/**
 * # Tabs Component
 * 
 * Tab navigation for organizing content into sections.
 * 
 * ## Styleguide Rules
 * - Use for related content that doesn't need to be viewed simultaneously
 * - Keep tab labels short and descriptive
 * - First tab should be the most commonly used
 * - Maximum 5-7 tabs (consider other navigation for more)
 */
const meta: Meta<typeof Tabs> = {
  title: 'DESIGN SYSTEM/Molecules/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="max-w-md">
      <TabsList>
        <TabsTrigger value="tab1">Account</TabsTrigger>
        <TabsTrigger value="tab2">Password</TabsTrigger>
        <TabsTrigger value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-4">
        <h3 className="font-semibold mb-2">Account Settings</h3>
        <p className="text-on-surface-variant">Manage your account information.</p>
      </TabsContent>
      <TabsContent value="tab2" className="p-4">
        <h3 className="font-semibold mb-2">Password Settings</h3>
        <p className="text-on-surface-variant">Change your password here.</p>
      </TabsContent>
      <TabsContent value="tab3" className="p-4">
        <h3 className="font-semibold mb-2">General Settings</h3>
        <p className="text-on-surface-variant">Configure your preferences.</p>
      </TabsContent>
    </Tabs>
  ),
};

// ============================================================================
// With Icons
// ============================================================================

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="account" className="max-w-lg">
      <TabsList>
        <TabsTrigger value="account" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Account
        </TabsTrigger>
        <TabsTrigger value="billing" className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Billing
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="p-4">
        <h3 className="font-semibold mb-4">Account Information</h3>
        <div className="space-y-4">
          <Input label="Username" defaultValue="johndoe" />
          <Input label="Email" type="email" defaultValue="john@example.com" />
          <Button>Save Changes</Button>
        </div>
      </TabsContent>
      <TabsContent value="billing" className="p-4">
        <h3 className="font-semibold mb-4">Billing Information</h3>
        <div className="space-y-4">
          <Input label="Card Number" placeholder="•••• •••• •••• ••••" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiry" placeholder="MM/YY" />
            <Input label="CVC" placeholder="•••" />
          </div>
          <Button>Update Payment</Button>
        </div>
      </TabsContent>
      <TabsContent value="settings" className="p-4">
        <h3 className="font-semibold mb-4">Settings</h3>
        <p className="text-on-surface-variant">Configure your account settings here.</p>
      </TabsContent>
    </Tabs>
  ),
};

// ============================================================================
// Dashboard Tabs
// ============================================================================

export const DashboardTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart className="w-4 h-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Reports
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: '12,345' },
            { label: 'Active Sessions', value: '8,421' },
            { label: 'Revenue', value: '$54,231' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface p-4 rounded-lg">
              <p className="text-sm text-on-surface-variant">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" className="p-4">
        <div className="h-48 bg-surface rounded-lg flex items-center justify-center">
          <span className="text-on-surface-variant">Analytics Charts</span>
        </div>
      </TabsContent>
      
      <TabsContent value="reports" className="p-4">
        <div className="space-y-2">
          {['Weekly Report', 'Monthly Report', 'Quarterly Report'].map(report => (
            <div key={report} className="p-3 bg-surface rounded-lg flex justify-between items-center">
              <span>{report}</span>
              <Button variant="text" size="sm">Download</Button>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="notifications" className="p-4">
        <div className="space-y-2">
          {[
            { text: 'New user registered', time: '2 min ago' },
            { text: 'Server update completed', time: '1 hour ago' },
            { text: 'Weekly report ready', time: '1 day ago' },
          ].map((notif, i) => (
            <div key={i} className="p-3 bg-surface rounded-lg flex justify-between">
              <span>{notif.text}</span>
              <span className="text-sm text-on-surface-variant">{notif.time}</span>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  ),
};

// ============================================================================
// Settings Tabs
// ============================================================================

export const SettingsTabs: Story = {
  render: () => (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="py-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary text-xl font-bold">
                    JD
                  </div>
                  <Button variant="outlined">Change Avatar</Button>
                </div>
                <Input label="Display Name" defaultValue="John Doe" />
                <Input label="Bio" defaultValue="Software Developer" />
              </div>
            </div>
            <Button>Save Profile</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="py-4">
          <div className="space-y-4">
            <h3 className="font-semibold mb-2">Notification Preferences</h3>
            {[
              { label: 'Email notifications', desc: 'Receive updates via email' },
              { label: 'Push notifications', desc: 'Get notified on your device' },
              { label: 'Weekly digest', desc: 'Summary of activity' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center p-4 bg-surface rounded-lg">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-on-surface-variant">{item.desc}</p>
                </div>
                <input type="checkbox" className="w-5 h-5" />
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="py-4">
          <div className="space-y-4">
            <h3 className="font-semibold mb-2">Security Settings</h3>
            <div className="p-4 bg-surface rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-on-surface-variant">Add extra security</p>
                </div>
                <Button variant="outlined" size="sm">Enable</Button>
              </div>
            </div>
            <div className="p-4 bg-surface rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-on-surface-variant">Last changed 30 days ago</p>
                </div>
                <Button variant="outlined" size="sm">Update</Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="integrations" className="py-4">
          <div className="space-y-4">
            <h3 className="font-semibold mb-2">Connected Apps</h3>
            {['GitHub', 'Slack', 'Google Drive'].map(app => (
              <div key={app} className="flex justify-between items-center p-4 bg-surface rounded-lg">
                <span className="font-medium">{app}</span>
                <Button variant="text" size="sm">Connect</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Tabs</h3>
        <Tabs defaultValue="1" className="max-w-md">
          <TabsList>
            <TabsTrigger value="1">Tab 1</TabsTrigger>
            <TabsTrigger value="2">Tab 2</TabsTrigger>
            <TabsTrigger value="3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="1" className="p-4">Content 1</TabsContent>
          <TabsContent value="2" className="p-4">Content 2</TabsContent>
          <TabsContent value="3" className="p-4">Content 3</TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Icons</h3>
        <Tabs defaultValue="1" className="max-w-md">
          <TabsList>
            <TabsTrigger value="1" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Account
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="3" className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> Alerts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="1" className="p-4">Account content</TabsContent>
          <TabsContent value="2" className="p-4">Security content</TabsContent>
          <TabsContent value="3" className="p-4">Alerts content</TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Settings,
  Home,
  FileText,
  Folder,
  Database,
  Cloud,
  Lock,
  X,
} from 'lucide-react';

// Import molecule components
import { DropdownMenu } from '../../components/molecules/DropdownMenu';
import { Modal } from '../../components/molecules/Modal';
import { Tabs } from '../../components/molecules/Tabs';
import { Accordion } from '../../components/molecules/Accordion';
import { ProgressBar } from '../../components/molecules/ProgressBar';
import { Pagination } from '../../components/molecules/Pagination';
import { EmptyState } from '../../components/molecules/EmptyState';

// Import atoms for composition
import { Typography } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { Card, CardHeader, CardContent } from '../../components/atoms/Card';

// =============================================================================
// Meta Configuration
// =============================================================================

const meta: Meta = {
  title: 'Design System/Advanced Molecules',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Advanced Molecule Components

Additional molecule components for complex UI patterns.

## Components Included

### Interactive
- **DropdownMenu**: Dropdown menus with actions
- **Modal**: Dialog overlays for focused content
- **Tabs**: Tabbed interfaces for content organization
- **Accordion**: Collapsible content panels

### Feedback
- **ProgressBar**: Visual progress indicators
- **EmptyState**: Placeholder for empty content areas

### Navigation
- **Pagination**: Page navigation controls
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// =============================================================================
// DropdownMenu Story
// =============================================================================

export const DropdownMenuShowcase: StoryObj = {
  name: 'Dropdown Menu',
  render: () => {
    const menuItems = [
      { label: 'Profile', value: 'profile', icon: <User className="w-4 h-4" /> },
      { label: 'Settings', value: 'settings', icon: <Settings className="w-4 h-4" /> },
      { label: 'Documents', value: 'docs', icon: <FileText className="w-4 h-4" /> },
      { label: 'Disabled', value: 'disabled', disabled: true },
      { label: 'Delete', value: 'delete', icon: <X className="w-4 h-4" />, destructive: true },
    ];

    return (
      <div className="space-y-8 p-6 bg-background">
        <Typography variant="h4">Dropdown Menu</Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader title="Basic Dropdown" subtitle="Default placement" />
            <CardContent>
              <DropdownMenu
                items={menuItems}
                onSelect={(value) => console.log('Selected:', value)}
              />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Custom Trigger" subtitle="With custom button" />
            <CardContent>
              <DropdownMenu
                trigger={
                  <Button variant="primary">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                }
                items={menuItems}
              />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Different Placements" subtitle="Top, bottom alignments" />
            <CardContent className="flex gap-4 justify-center">
              <DropdownMenu triggerLabel="Top" items={menuItems.slice(0, 3)} placement="top" />
              <DropdownMenu triggerLabel="Bottom" items={menuItems.slice(0, 3)} placement="bottom" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
};

// =============================================================================
// Modal Story
// =============================================================================

export const ModalShowcase: StoryObj = {
  name: 'Modal',
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
      <div className="space-y-8 p-6 bg-background">
        <Typography variant="h4">Modal Dialog</Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader title="Basic Modal" subtitle="With title and close button" />
            <CardContent>
              <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
              <Modal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                title="Modal Title"
                footer={
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setIsOpen(false)}>
                      Confirm
                    </Button>
                  </div>
                }
              >
                <Typography variant="body1">
                  This is a modal dialog. It can contain any content you need.
                </Typography>
              </Modal>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Confirmation Modal" subtitle="For destructive actions" />
            <CardContent>
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                Delete Item
              </Button>
              <Modal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Confirm Deletion"
                size="sm"
                footer={
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => setConfirmOpen(false)}>
                      Delete
                    </Button>
                  </div>
                }
              >
                <Typography variant="body2">
                  Are you sure you want to delete this item? This action cannot be undone.
                </Typography>
              </Modal>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
};

// =============================================================================
// Tabs Story
// =============================================================================

export const TabsShowcase: StoryObj = {
  name: 'Tabs',
  render: () => {
    const tabs = [
      {
        label: 'Profile',
        value: 'profile',
        icon: <User className="w-4 h-4" />,
        content: <Typography variant="body1">Profile content goes here</Typography>,
      },
      {
        label: 'Settings',
        value: 'settings',
        icon: <Settings className="w-4 h-4" />,
        content: <Typography variant="body1">Settings content goes here</Typography>,
      },
      {
        label: 'Documents',
        value: 'docs',
        icon: <FileText className="w-4 h-4" />,
        content: <Typography variant="body1">Documents content goes here</Typography>,
      },
    ];

    return (
      <div className="space-y-8 p-6 bg-background">
        <Typography variant="h4">Tabs</Typography>
        
        <div className="grid grid-cols-1 gap-6">
          <Card variant="elevated">
            <CardHeader title="Default Tabs" subtitle="Underlined active tab" />
            <CardContent>
              <Tabs tabs={tabs} />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Pills Tabs" subtitle="Pill-shaped tabs" />
            <CardContent>
              <Tabs tabs={tabs} variant="pills" />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Underline Tabs" subtitle="Simple underline" />
            <CardContent>
              <Tabs tabs={tabs} variant="underline" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
};

// =============================================================================
// Accordion Story
// =============================================================================

export const AccordionShowcase: StoryObj = {
  name: 'Accordion',
  render: () => {
    const items = [
      {
        title: 'What is LightDom?',
        icon: <Home className="w-5 h-5" />,
        content: (
          <Typography variant="body2">
            LightDom is a blockchain-based DOM optimization platform with React PWA, Express API, and web crawler capabilities.
          </Typography>
        ),
      },
      {
        title: 'How do I get started?',
        icon: <FileText className="w-5 h-5" />,
        content: (
          <Typography variant="body2">
            Clone the repository, install dependencies with npm install, and run npm run dev to start the development server.
          </Typography>
        ),
      },
      {
        title: 'What technologies are used?',
        icon: <Database className="w-5 h-5" />,
        content: (
          <Typography variant="body2">
            LightDom uses React, TypeScript, Ant Design, Tailwind CSS, anime.js, Express, PostgreSQL, and Ethereum smart contracts.
          </Typography>
        ),
      },
    ];

    return (
      <div className="space-y-8 p-6 bg-background">
        <Typography variant="h4">Accordion</Typography>
        
        <div className="grid grid-cols-1 gap-6">
          <Card variant="elevated">
            <CardHeader title="Default Accordion" subtitle="Single item open" />
            <CardContent>
              <Accordion items={items} />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Allow Multiple" subtitle="Multiple items can be open" />
            <CardContent>
              <Accordion items={items} allowMultiple defaultOpenIndexes={[0, 1]} />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Bordered Variant" subtitle="With borders" />
            <CardContent>
              <Accordion items={items} variant="bordered" />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Filled Variant" subtitle="With background" />
            <CardContent>
              <Accordion items={items} variant="filled" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
};

// =============================================================================
// ProgressBar Story
// =============================================================================

export const ProgressBarShowcase: StoryObj = {
  name: 'Progress Bar',
  render: () => {
    const [progress, setProgress] = useState(45);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 5));
      }, 500);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="space-y-8 p-6 bg-background">
        <Typography variant="h4">Progress Bar</Typography>
        
        <div className="grid grid-cols-1 gap-6">
          <Card variant="elevated">
            <CardHeader title="Basic Progress" subtitle="Default progress bar" />
            <CardContent className="space-y-4">
              <ProgressBar value={25} showLabel />
              <ProgressBar value={50} showLabel />
              <ProgressBar value={75} showLabel />
              <ProgressBar value={100} showLabel />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Variants" subtitle="Different colors" />
            <CardContent className="space-y-4">
              <ProgressBar value={70} variant="success" showLabel label="Success" />
              <ProgressBar value={70} variant="warning" showLabel label="Warning" />
              <ProgressBar value={70} variant="error" showLabel label="Error" />
              <ProgressBar value={70} variant="info" showLabel label="Info" />
              <ProgressBar value={70} variant="gradient" showLabel label="Gradient" />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Sizes" subtitle="Different heights" />
            <CardContent className="space-y-4">
              <ProgressBar value={60} size="sm" showLabel label="Small" />
              <ProgressBar value={60} size="md" showLabel label="Medium" />
              <ProgressBar value={60} size="lg" showLabel label="Large" />
              <ProgressBar value={60} size="xl" showLabel label="Extra Large" />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Animated" subtitle="Live progress" />
            <CardContent>
              <ProgressBar value={progress} animated showLabel />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
};

// =============================================================================
// Pagination Story
// =============================================================================

export const PaginationShowcase: StoryObj = {
  name: 'Pagination',
  render: () => {
    const [page1, setPage1] = useState(1);
    const [page2, setPage2] = useState(5);

    return (
      <div className="space-y-8 p-6 bg-background">
        <Typography variant="h4">Pagination</Typography>
        
        <div className="grid grid-cols-1 gap-6">
          <Card variant="elevated">
            <CardHeader title="Basic Pagination" subtitle="With first/last buttons" />
            <CardContent className="flex justify-center">
              <Pagination
                currentPage={page1}
                totalPages={10}
                onPageChange={setPage1}
              />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Many Pages" subtitle="With ellipsis" />
            <CardContent className="flex justify-center">
              <Pagination
                currentPage={page2}
                totalPages={20}
                onPageChange={setPage2}
              />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Without First/Last" subtitle="Only prev/next" />
            <CardContent className="flex justify-center">
              <Pagination
                currentPage={page1}
                totalPages={10}
                onPageChange={setPage1}
                showFirstLast={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
};

// =============================================================================
// EmptyState Story
// =============================================================================

export const EmptyStateShowcase: StoryObj = {
  name: 'Empty State',
  render: () => {
    return (
      <div className="space-y-8 p-6 bg-background">
        <Typography variant="h4">Empty State</Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmptyState
            icon={<Folder />}
            title="No files found"
            description="Upload some files to get started"
            action={{
              label: 'Upload Files',
              onClick: () => console.log('Upload clicked'),
              icon: <Cloud className="w-4 h-4" />,
            }}
          />

          <EmptyState
            variant="bordered"
            icon={<Database />}
            title="No data available"
            description="Try adjusting your filters or create new data"
            action={{
              label: 'Create Data',
              onClick: () => console.log('Create clicked'),
            }}
            secondaryAction={{
              label: 'Reset Filters',
              onClick: () => console.log('Reset clicked'),
            }}
          />

          <EmptyState
            variant="filled"
            size="sm"
            icon={<Mail />}
            title="No messages"
            description="Your inbox is empty"
          />

          <EmptyState
            size="lg"
            icon={<Lock />}
            title="Access Denied"
            description="You don't have permission to view this content"
            action={{
              label: 'Request Access',
              onClick: () => console.log('Request clicked'),
            }}
          />
        </div>
      </div>
    );
  },
};

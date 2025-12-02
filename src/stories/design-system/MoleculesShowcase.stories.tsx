import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Divider as AntDivider } from 'antd';
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
} from 'lucide-react';

// Import molecule components
import { SearchInput } from '../../components/molecules/SearchInput';
import { FormGroup } from '../../components/molecules/FormGroup';
import { ButtonGroup } from '../../components/molecules/ButtonGroup';
import { AlertBanner } from '../../components/molecules/AlertBanner';
import { Breadcrumb } from '../../components/molecules/Breadcrumb';
import { Select } from '../../components/molecules/Select';

// Import atoms for composition
import { Typography } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardHeader, CardContent } from '../../components/atoms/Card';

// =============================================================================
// Meta Configuration
// =============================================================================

const meta: Meta = {
  title: 'Design System/Molecules Showcase',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Molecules - Composite Components

Molecules are groups of atoms bonded together to form functional UI components.
Following **Atomic Design** principles, molecules:

- **Combine atoms**: Built from multiple atom components
- **Serve a single purpose**: Each molecule has a specific function
- **Are reusable**: Used throughout the application
- **Maintain consistency**: Inherit styles from atoms

## Component Categories

### Form
- **SearchInput**: Search field with clear functionality
- **FormGroup**: Label + input + helper text wrapper
- **Select**: Dropdown selection component

### Navigation
- **Breadcrumb**: Page navigation trail

### Layout
- **ButtonGroup**: Group of related buttons
- **AlertBanner**: Contextual notifications
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// =============================================================================
// SearchInput Stories
// =============================================================================

export const SearchInputShowcase: StoryObj = {
  name: 'SearchInput',
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = (value: string) => {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
      console.log('Searching for:', value);
    };

    return (
      <div className="space-y-8 p-6 bg-background rounded-xl max-w-md">
        <div>
          <Typography variant="h5" className="mb-4">Basic Search</Typography>
          <SearchInput
            placeholder="Search anything..."
            onSearch={handleSearch}
          />
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">Controlled with Loading</Typography>
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue('')}
            loading={loading}
            onSearch={handleSearch}
            placeholder="Type and press Enter..."
          />
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">Sizes</Typography>
          <div className="space-y-3">
            <SearchInput size="sm" placeholder="Small search" />
            <SearchInput size="md" placeholder="Medium search" />
            <SearchInput size="lg" placeholder="Large search" />
          </div>
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">Variants</Typography>
          <div className="space-y-3">
            <SearchInput variant="default" placeholder="Default variant" />
            <SearchInput variant="filled" placeholder="Filled variant" />
            <SearchInput variant="outline" placeholder="Outline variant" />
          </div>
        </div>
      </div>
    );
  },
};

// =============================================================================
// FormGroup Stories
// =============================================================================

export const FormGroupShowcase: StoryObj = {
  name: 'FormGroup',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl max-w-lg">
      <div>
        <Typography variant="h5" className="mb-4">Basic Form Group</Typography>
        <FormGroup
          label="Email Address"
          helperText="We'll never share your email"
        >
          <Input type="email" placeholder="you@example.com" />
        </FormGroup>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Required Field</Typography>
        <FormGroup
          label="Username"
          required
          helperText="Choose a unique username"
        >
          <Input placeholder="Enter username" />
        </FormGroup>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">With Error</Typography>
        <FormGroup
          label="Password"
          error="Password must be at least 8 characters"
        >
          <Input type="password" placeholder="Enter password" />
        </FormGroup>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Label Positions</Typography>
        <div className="space-y-4">
          <FormGroup labelPosition="top" label="Top Label">
            <Input placeholder="Top label layout" />
          </FormGroup>
          <FormGroup labelPosition="left" label="Left Label">
            <Input placeholder="Left label layout" />
          </FormGroup>
          <FormGroup labelPosition="inline" label="Inline">
            <Input placeholder="Inline layout" />
          </FormGroup>
        </div>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Disabled</Typography>
        <FormGroup
          label="Disabled Field"
          helperText="This field is disabled"
          disabled
        >
          <Input disabled placeholder="Cannot edit" />
        </FormGroup>
      </div>
    </div>
  ),
};

// =============================================================================
// ButtonGroup Stories
// =============================================================================

export const ButtonGroupShowcase: StoryObj = {
  name: 'ButtonGroup',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Attached Buttons</Typography>
        <ButtonGroup>
          <Button variant="outlined">Left</Button>
          <Button variant="outlined">Center</Button>
          <Button variant="outlined">Right</Button>
        </ButtonGroup>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Detached Buttons</Typography>
        <ButtonGroup attached={false}>
          <Button variant="outlined">One</Button>
          <Button variant="outlined">Two</Button>
          <Button variant="outlined">Three</Button>
        </ButtonGroup>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Vertical Group</Typography>
        <ButtonGroup orientation="vertical">
          <Button variant="outlined">Top</Button>
          <Button variant="outlined">Middle</Button>
          <Button variant="outlined">Bottom</Button>
        </ButtonGroup>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">With Shared Variant</Typography>
        <ButtonGroup variant="primary">
          <Button>Save</Button>
          <Button>Submit</Button>
          <Button>Publish</Button>
        </ButtonGroup>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">With Different Sizes</Typography>
        <div className="space-y-3">
          <ButtonGroup size="sm" variant="outlined">
            <Button>Small</Button>
            <Button>Group</Button>
          </ButtonGroup>
          <ButtonGroup size="md" variant="outlined">
            <Button>Medium</Button>
            <Button>Group</Button>
          </ButtonGroup>
          <ButtonGroup size="lg" variant="outlined">
            <Button>Large</Button>
            <Button>Group</Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// AlertBanner Stories
// =============================================================================

export const AlertBannerShowcase: StoryObj = {
  name: 'AlertBanner',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Variants</Typography>
        <div className="space-y-3">
          <AlertBanner
            variant="info"
            title="Information"
            description="This is an informational message for the user."
          />
          <AlertBanner
            variant="success"
            title="Success"
            description="Your changes have been saved successfully."
          />
          <AlertBanner
            variant="warning"
            title="Warning"
            description="Please review your input before proceeding."
          />
          <AlertBanner
            variant="error"
            title="Error"
            description="Something went wrong. Please try again."
          />
        </div>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Dismissible</Typography>
        <AlertBanner
          variant="info"
          title="Dismissible Alert"
          description="Click the X button to dismiss this alert."
          dismissible
          onDismiss={() => console.log('Dismissed!')}
        />
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">With Action</Typography>
        <AlertBanner
          variant="warning"
          title="Subscription Expiring"
          description="Your subscription will expire in 3 days."
          action={
            <div className="flex gap-2">
              <Button size="sm">Renew Now</Button>
              <Button size="sm" variant="outlined">Learn More</Button>
            </div>
          }
        />
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Title Only</Typography>
        <AlertBanner
          variant="success"
          title="Profile updated successfully!"
        />
      </div>
    </div>
  ),
};

// =============================================================================
// Breadcrumb Stories
// =============================================================================

export const BreadcrumbShowcase: StoryObj = {
  name: 'Breadcrumb',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Basic Breadcrumb</Typography>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Electronics', href: '/products/electronics' },
            { label: 'Laptops', current: true },
          ]}
        />
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">With Icons</Typography>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/', icon: Home },
            { label: 'Documents', href: '/docs', icon: FileText },
            { label: 'Projects', href: '/docs/projects', icon: Folder },
            { label: 'Project Alpha', current: true },
          ]}
        />
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Without Home Icon</Typography>
        <Breadcrumb
          showHomeIcon={false}
          items={[
            { label: 'Settings', href: '/settings' },
            { label: 'Account', href: '/settings/account' },
            { label: 'Security', current: true },
          ]}
        />
      </div>

      <AntDivider />

      <div>
        <Typography variant="h5" className="mb-4">Collapsed (Max 3 Items)</Typography>
        <Breadcrumb
          maxItems={3}
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Electronics', href: '/products/electronics' },
            { label: 'Computers', href: '/products/electronics/computers' },
            { label: 'Laptops', href: '/products/electronics/computers/laptops' },
            { label: 'MacBook Pro', current: true },
          ]}
        />
      </div>
    </div>
  ),
};

// =============================================================================
// Select Stories
// =============================================================================

export const SelectShowcase: StoryObj = {
  name: 'Select',
  render: () => {
    const [value, setValue] = useState('');

    const basicOptions = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    const iconOptions = [
      { value: 'user', label: 'User Profile', icon: <User className="w-4 h-4" /> },
      { value: 'mail', label: 'Email Settings', icon: <Mail className="w-4 h-4" /> },
      { value: 'settings', label: 'General Settings', icon: <Settings className="w-4 h-4" /> },
    ];

    const disabledOptions = [
      { value: 'available', label: 'Available' },
      { value: 'disabled', label: 'Disabled Option', disabled: true },
      { value: 'another', label: 'Another Option' },
    ];

    return (
      <div className="space-y-8 p-6 bg-background rounded-xl max-w-md">
        <div>
          <Typography variant="h5" className="mb-4">Basic Select</Typography>
          <Select
            options={basicOptions}
            placeholder="Choose an option"
          />
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">Controlled</Typography>
          <Select
            options={basicOptions}
            value={value}
            onChange={setValue}
            placeholder="Select something"
          />
          <Typography variant="caption" className="mt-2 block">
            Selected: {value || 'None'}
          </Typography>
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">With Icons</Typography>
          <Select
            options={iconOptions}
            placeholder="Select a setting"
          />
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">With Label & Helper</Typography>
          <Select
            label="Country"
            helperText="Select your country of residence"
            options={[
              { value: 'us', label: 'United States' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'ca', label: 'Canada' },
              { value: 'au', label: 'Australia' },
            ]}
            placeholder="Select country"
          />
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">Error State</Typography>
          <Select
            label="Category"
            error
            errorMessage="Please select a category"
            options={basicOptions}
            placeholder="Select category"
          />
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">With Disabled Options</Typography>
          <Select
            options={disabledOptions}
            placeholder="Some options disabled"
          />
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">Sizes</Typography>
          <div className="space-y-3">
            <Select size="sm" options={basicOptions} placeholder="Small" />
            <Select size="md" options={basicOptions} placeholder="Medium" />
            <Select size="lg" options={basicOptions} placeholder="Large" />
          </div>
        </div>

        <AntDivider />

        <div>
          <Typography variant="h5" className="mb-4">Variants</Typography>
          <div className="space-y-3">
            <Select variant="default" options={basicOptions} placeholder="Default" />
            <Select variant="filled" options={basicOptions} placeholder="Filled" />
            <Select variant="outline" options={basicOptions} placeholder="Outline" />
          </div>
        </div>
      </div>
    );
  },
};

// =============================================================================
// Complete Molecules Overview
// =============================================================================

export const AllMolecules: StoryObj = {
  name: 'All Molecules Overview',
  render: () => (
    <div className="space-y-12 p-6">
      <div className="text-center">
        <Typography variant="h2">Molecules Component Library</Typography>
        <Typography variant="lead" color="muted">
          Composite components built from atoms
        </Typography>
      </div>

      {/* Quick Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="outlined" className="text-center">
          <Typography variant="h4">6</Typography>
          <Typography variant="caption">Molecule Components</Typography>
        </Card>
        <Card variant="outlined" className="text-center">
          <Typography variant="h4">Form</Typography>
          <Typography variant="caption">Input Helpers</Typography>
        </Card>
        <Card variant="outlined" className="text-center">
          <Typography variant="h4">Nav</Typography>
          <Typography variant="caption">Navigation</Typography>
        </Card>
        <Card variant="outlined" className="text-center">
          <Typography variant="h4">Layout</Typography>
          <Typography variant="caption">Composition</Typography>
        </Card>
      </div>

      {/* Component Samples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader title="SearchInput" subtitle="Search field" />
          <CardContent>
            <SearchInput placeholder="Search..." />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader title="FormGroup" subtitle="Form layout" />
          <CardContent>
            <FormGroup label="Email" helperText="Enter your email">
              <Input placeholder="you@example.com" />
            </FormGroup>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader title="ButtonGroup" subtitle="Button collection" />
          <CardContent>
            <ButtonGroup variant="outlined">
              <Button>A</Button>
              <Button>B</Button>
              <Button>C</Button>
            </ButtonGroup>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader title="AlertBanner" subtitle="Notifications" />
          <CardContent>
            <AlertBanner variant="success" title="Success!" />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader title="Breadcrumb" subtitle="Navigation trail" />
          <CardContent>
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Page', current: true },
              ]}
            />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader title="Select" subtitle="Dropdown select" />
          <CardContent>
            <Select
              options={[
                { value: '1', label: 'Option 1' },
                { value: '2', label: 'Option 2' },
              ]}
              placeholder="Select..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Space, Divider as AntDivider } from 'antd';
import {
  User,
  Mail,
  Bell,
  Settings,
  Search,
  Heart,
  Star,
  Home,
  Check,
  X,
  AlertCircle,
  Info,
  Loader2,
  Download,
  Upload,
  Trash,
  Edit,
  Plus,
  Minus,
} from 'lucide-react';

// Import all atom components
import { Typography } from '../../components/atoms/Typography';
import { Avatar, AvatarGroup } from '../../components/atoms/Avatar';
import { Spinner, DotsSpinner, PulseSpinner } from '../../components/atoms/Spinner';
import { Checkbox } from '../../components/atoms/Checkbox';
import { Toggle } from '../../components/atoms/Toggle';
import { Tooltip } from '../../components/atoms/Tooltip';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/atoms/Card';
import { Divider } from '../../components/atoms/Divider';
import { Icon, IconButton } from '../../components/atoms/Icon';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';

// =============================================================================
// Meta Configuration
// =============================================================================

const meta: Meta = {
  title: 'Design System/Atoms Showcase',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Atoms - Design System Building Blocks

Atoms are the fundamental UI components that form the foundation of our design system.
Following **Atomic Design** principles, these components are:

- **Single-purpose**: Each atom does one thing well
- **Composable**: Atoms combine to form molecules and organisms
- **Consistent**: Unified styling and behavior across the system
- **Accessible**: Built with WCAG guidelines in mind

## Component Categories

### Display
- **Typography**: Text and heading styles
- **Avatar**: User profile images with fallbacks
- **Badge**: Status indicators and labels
- **Icon**: Iconography with containers

### Form Controls
- **Button**: Action triggers
- **Input**: Text entry fields
- **Checkbox**: Multi-select options
- **Toggle**: On/off switches

### Feedback
- **Spinner**: Loading indicators
- **Tooltip**: Contextual information

### Layout
- **Card**: Content containers
- **Divider**: Visual separators
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// =============================================================================
// Typography Stories
// =============================================================================

export const TypographyShowcase: StoryObj = {
  name: 'Typography',
  render: () => (
    <div className="space-y-6 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="overline" color="primary">Typography System</Typography>
        <Typography variant="h1">Heading 1</Typography>
        <Typography variant="h2">Heading 2</Typography>
        <Typography variant="h3">Heading 3</Typography>
        <Typography variant="h4">Heading 4</Typography>
        <Typography variant="h5">Heading 5</Typography>
        <Typography variant="h6">Heading 6</Typography>
      </div>
      
      <AntDivider />
      
      <div className="space-y-2">
        <Typography variant="lead">
          Lead paragraph text for introductions and summaries.
        </Typography>
        <Typography variant="body1">
          Body 1: Regular paragraph text for main content. This is the default text style
          used throughout the application for readable content.
        </Typography>
        <Typography variant="body2">
          Body 2: Smaller paragraph text for secondary content and descriptions.
        </Typography>
        <Typography variant="subtitle1">Subtitle 1: Emphasized secondary text</Typography>
        <Typography variant="subtitle2">Subtitle 2: Smaller emphasized text</Typography>
        <Typography variant="caption">Caption: Small annotations and metadata</Typography>
        <Typography variant="overline">OVERLINE: LABELS AND CATEGORIES</Typography>
        <Typography variant="code">const code = "inline code style";</Typography>
      </div>
      
      <AntDivider />
      
      <div className="space-y-2">
        <Typography variant="body1" color="primary">Primary colored text</Typography>
        <Typography variant="body1" color="success">Success colored text</Typography>
        <Typography variant="body1" color="warning">Warning colored text</Typography>
        <Typography variant="body1" color="error">Error colored text</Typography>
        <Typography variant="body1" color="info">Info colored text</Typography>
        <Typography variant="body1" color="muted">Muted colored text</Typography>
      </div>
    </div>
  ),
};

// =============================================================================
// Avatar Stories
// =============================================================================

export const AvatarShowcase: StoryObj = {
  name: 'Avatar',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Sizes</Typography>
        <div className="flex items-end gap-4">
          <Avatar size="xs" name="John Doe" />
          <Avatar size="sm" name="Jane Smith" />
          <Avatar size="md" name="Bob Johnson" />
          <Avatar size="lg" name="Alice Brown" />
          <Avatar size="xl" name="Charlie Wilson" />
          <Avatar size="2xl" name="Diana Prince" />
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Variants</Typography>
        <div className="flex items-center gap-4">
          <Avatar variant="primary" name="Primary" />
          <Avatar variant="secondary" name="Secondary" />
          <Avatar variant="gradient" name="Gradient" />
          <Avatar variant="success" name="Success" />
          <Avatar variant="warning" name="Warning" />
          <Avatar variant="error" name="Error" />
          <Avatar variant="neutral" name="Neutral" />
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">With Status</Typography>
        <div className="flex items-center gap-4">
          <Avatar name="Online User" status="online" size="lg" />
          <Avatar name="Offline User" status="offline" size="lg" />
          <Avatar name="Away User" status="away" size="lg" />
          <Avatar name="Busy User" status="busy" size="lg" />
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Avatar Group</Typography>
        <AvatarGroup max={4} size="md">
          <Avatar name="User 1" variant="primary" />
          <Avatar name="User 2" variant="gradient" />
          <Avatar name="User 3" variant="success" />
          <Avatar name="User 4" variant="warning" />
          <Avatar name="User 5" variant="error" />
          <Avatar name="User 6" variant="secondary" />
        </AvatarGroup>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">With Ring & Shapes</Typography>
        <div className="flex items-center gap-4">
          <Avatar name="Ring" ring size="lg" />
          <Avatar name="Square" shape="square" size="lg" />
          <Avatar name="Both" ring shape="square" size="lg" />
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Spinner Stories
// =============================================================================

export const SpinnerShowcase: StoryObj = {
  name: 'Spinner',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Sizes</Typography>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <Spinner size="xs" />
            <Typography variant="caption" className="block mt-2">XS</Typography>
          </div>
          <div className="text-center">
            <Spinner size="sm" />
            <Typography variant="caption" className="block mt-2">SM</Typography>
          </div>
          <div className="text-center">
            <Spinner size="md" />
            <Typography variant="caption" className="block mt-2">MD</Typography>
          </div>
          <div className="text-center">
            <Spinner size="lg" />
            <Typography variant="caption" className="block mt-2">LG</Typography>
          </div>
          <div className="text-center">
            <Spinner size="xl" />
            <Typography variant="caption" className="block mt-2">XL</Typography>
          </div>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Variants</Typography>
        <div className="flex items-center gap-6">
          <Spinner variant="default" size="lg" />
          <Spinner variant="secondary" size="lg" />
          <Spinner variant="success" size="lg" />
          <Spinner variant="warning" size="lg" />
          <Spinner variant="error" size="lg" />
          <div className="bg-gray-900 p-3 rounded">
            <Spinner variant="white" size="lg" />
          </div>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Alternative Styles</Typography>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <DotsSpinner size="lg" />
            <Typography variant="caption" className="block mt-2">Dots</Typography>
          </div>
          <div className="text-center">
            <PulseSpinner size="lg" />
            <Typography variant="caption" className="block mt-2">Pulse</Typography>
          </div>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Checkbox Stories
// =============================================================================

export const CheckboxShowcase: StoryObj = {
  name: 'Checkbox',
  render: () => {
    const [indeterminate, setIndeterminate] = React.useState(true);
    
    return (
      <div className="space-y-8 p-6 bg-background rounded-xl">
        <div>
          <Typography variant="h5" className="mb-4">Basic Checkboxes</Typography>
          <div className="space-y-3">
            <Checkbox label="Default checkbox" />
            <Checkbox label="Checked by default" defaultChecked />
            <Checkbox label="Disabled checkbox" disabled />
            <Checkbox label="Disabled checked" disabled defaultChecked />
          </div>
        </div>
        
        <AntDivider />
        
        <div>
          <Typography variant="h5" className="mb-4">Sizes</Typography>
          <div className="space-y-3">
            <Checkbox size="sm" label="Small checkbox" />
            <Checkbox size="md" label="Medium checkbox" />
            <Checkbox size="lg" label="Large checkbox" />
          </div>
        </div>
        
        <AntDivider />
        
        <div>
          <Typography variant="h5" className="mb-4">With Description</Typography>
          <div className="space-y-3">
            <Checkbox 
              label="Marketing emails" 
              description="Receive emails about new products and features"
            />
            <Checkbox 
              label="Security alerts" 
              description="Get notified about security updates"
              defaultChecked
            />
          </div>
        </div>
        
        <AntDivider />
        
        <div>
          <Typography variant="h5" className="mb-4">States</Typography>
          <div className="space-y-3">
            <Checkbox variant="success" label="Success variant" defaultChecked />
            <Checkbox error="This field is required" label="Error state" />
            <Checkbox 
              indeterminate={indeterminate}
              label="Indeterminate state"
              onChange={() => setIndeterminate(false)}
            />
          </div>
        </div>
      </div>
    );
  },
};

// =============================================================================
// Toggle Stories
// =============================================================================

export const ToggleShowcase: StoryObj = {
  name: 'Toggle',
  render: () => {
    return (
      <div className="space-y-8 p-6 bg-background rounded-xl">
        <div>
          <Typography variant="h5" className="mb-4">Basic Toggles</Typography>
          <div className="space-y-4">
            <Toggle label="Default toggle" />
            <Toggle label="Enabled by default" defaultChecked />
            <Toggle label="Disabled toggle" disabled />
          </div>
        </div>
        
        <AntDivider />
        
        <div>
          <Typography variant="h5" className="mb-4">Sizes</Typography>
          <div className="space-y-4">
            <Toggle size="sm" label="Small toggle" />
            <Toggle size="md" label="Medium toggle" />
            <Toggle size="lg" label="Large toggle" />
          </div>
        </div>
        
        <AntDivider />
        
        <div>
          <Typography variant="h5" className="mb-4">Variants</Typography>
          <div className="space-y-4">
            <Toggle variant="default" label="Default" defaultChecked />
            <Toggle variant="success" label="Success" defaultChecked />
            <Toggle variant="warning" label="Warning" defaultChecked />
            <Toggle variant="error" label="Error" defaultChecked />
          </div>
        </div>
        
        <AntDivider />
        
        <div>
          <Typography variant="h5" className="mb-4">With Description</Typography>
          <div className="space-y-4">
            <Toggle 
              label="Dark mode" 
              description="Enable dark theme across the application"
            />
            <Toggle 
              label="Notifications" 
              description="Receive push notifications"
              defaultChecked
            />
          </div>
        </div>
        
        <AntDivider />
        
        <div>
          <Typography variant="h5" className="mb-4">Label Position</Typography>
          <div className="space-y-4">
            <Toggle labelPosition="left" label="Label on left" />
            <Toggle labelPosition="right" label="Label on right" />
          </div>
        </div>
        
        <AntDivider />
        
        <div>
          <Typography variant="h5" className="mb-4">With State Text</Typography>
          <Toggle showState label="Show ON/OFF state" size="lg" />
        </div>
      </div>
    );
  },
};

// =============================================================================
// Tooltip Stories
// =============================================================================

export const TooltipShowcase: StoryObj = {
  name: 'Tooltip',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Placements</Typography>
        <div className="flex items-center justify-center gap-8 py-12">
          <Tooltip content="Top tooltip" placement="top">
            <Button variant="outlined">Top</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" placement="bottom">
            <Button variant="outlined">Bottom</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" placement="left">
            <Button variant="outlined">Left</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" placement="right">
            <Button variant="outlined">Right</Button>
          </Tooltip>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Variants</Typography>
        <div className="flex items-center gap-4">
          <Tooltip content="Dark tooltip" variant="dark">
            <Button variant="outlined">Dark</Button>
          </Tooltip>
          <Tooltip content="Light tooltip" variant="light">
            <Button variant="outlined">Light</Button>
          </Tooltip>
          <Tooltip content="Primary tooltip" variant="primary">
            <Button variant="outlined">Primary</Button>
          </Tooltip>
          <Tooltip content="Success tooltip" variant="success">
            <Button variant="outlined">Success</Button>
          </Tooltip>
          <Tooltip content="Warning tooltip" variant="warning">
            <Button variant="outlined">Warning</Button>
          </Tooltip>
          <Tooltip content="Error tooltip" variant="error">
            <Button variant="outlined">Error</Button>
          </Tooltip>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Without Arrow</Typography>
        <Tooltip content="No arrow tooltip" arrow={false}>
          <Button variant="outlined">Hover me</Button>
        </Tooltip>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">With Rich Content</Typography>
        <Tooltip 
          content={
            <div className="space-y-1">
              <div className="font-semibold">Rich Tooltip</div>
              <div className="text-xs opacity-80">This tooltip has multiple lines of content.</div>
            </div>
          }
        >
          <Button variant="outlined">Rich Content</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

// =============================================================================
// Card Stories
// =============================================================================

export const CardShowcase: StoryObj = {
  name: 'Card',
  render: () => (
    <div className="space-y-8 p-6 bg-muted/30 rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Variants</Typography>
        <div className="grid grid-cols-3 gap-4">
          <Card variant="elevated">
            <Typography variant="subtitle1">Elevated Card</Typography>
            <Typography variant="body2" color="muted">With shadow effect</Typography>
          </Card>
          <Card variant="outlined">
            <Typography variant="subtitle1">Outlined Card</Typography>
            <Typography variant="body2" color="muted">With border</Typography>
          </Card>
          <Card variant="filled">
            <Typography variant="subtitle1">Filled Card</Typography>
            <Typography variant="body2" color="muted">Solid background</Typography>
          </Card>
          <Card variant="gradient">
            <Typography variant="subtitle1">Gradient Card</Typography>
            <Typography variant="body2" color="muted">Gradient background</Typography>
          </Card>
          <Card variant="glass" className="bg-gradient-to-r from-purple-500/50 to-pink-500/50">
            <Typography variant="subtitle1" className="text-white">Glass Card</Typography>
            <Typography variant="body2" className="text-white/80">Glassmorphism effect</Typography>
          </Card>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">With Accent Colors</Typography>
        <div className="grid grid-cols-3 gap-4">
          <Card accent="primary">
            <Typography variant="subtitle1">Primary Accent</Typography>
          </Card>
          <Card accent="success">
            <Typography variant="subtitle1">Success Accent</Typography>
          </Card>
          <Card accent="warning">
            <Typography variant="subtitle1">Warning Accent</Typography>
          </Card>
          <Card accent="error">
            <Typography variant="subtitle1">Error Accent</Typography>
          </Card>
          <Card accent="info">
            <Typography variant="subtitle1">Info Accent</Typography>
          </Card>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Interactive Card</Typography>
        <Card interactive variant="elevated" className="max-w-sm">
          <Typography variant="subtitle1">Clickable Card</Typography>
          <Typography variant="body2" color="muted">
            This card has hover and click effects. Try hovering or clicking on it.
          </Typography>
        </Card>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">With Header & Footer</Typography>
        <Card 
          variant="elevated"
          header={
            <CardHeader 
              title="Card Title" 
              subtitle="Card subtitle"
              action={<Button size="sm">Action</Button>}
            />
          }
          footer={
            <CardFooter align="between">
              <Button variant="text" size="sm">Cancel</Button>
              <Button size="sm">Save</Button>
            </CardFooter>
          }
          className="max-w-md"
        >
          <CardContent>
            <Typography variant="body2">
              This card demonstrates the header and footer composition pattern.
              Headers can include titles, subtitles, and action buttons.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

// =============================================================================
// Divider Stories
// =============================================================================

export const DividerShowcase: StoryObj = {
  name: 'Divider',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Basic Divider</Typography>
        <Typography variant="body2">Content above the divider</Typography>
        <Divider />
        <Typography variant="body2">Content below the divider</Typography>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Spacing Variants</Typography>
        <div className="space-y-2">
          <Typography variant="body2">Small spacing</Typography>
          <Divider spacing="sm" />
          <Typography variant="body2">Medium spacing (default)</Typography>
          <Divider spacing="md" />
          <Typography variant="body2">Large spacing</Typography>
          <Divider spacing="lg" />
          <Typography variant="body2">End</Typography>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Variants</Typography>
        <div className="space-y-4">
          <div>
            <Typography variant="caption">Solid</Typography>
            <Divider variant="solid" />
          </div>
          <div>
            <Typography variant="caption">Gradient</Typography>
            <Divider variant="gradient" />
          </div>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">With Label</Typography>
        <Divider label="OR" />
        <div className="h-4" />
        <Divider label="Section" labelPosition="left" />
        <div className="h-4" />
        <Divider label="End" labelPosition="right" />
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Vertical Divider</Typography>
        <div className="flex items-center h-12">
          <span>Item 1</span>
          <Divider orientation="vertical" spacing="md" />
          <span>Item 2</span>
          <Divider orientation="vertical" spacing="md" />
          <span>Item 3</span>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Icon Stories
// =============================================================================

export const IconShowcase: StoryObj = {
  name: 'Icon',
  render: () => (
    <div className="space-y-8 p-6 bg-background rounded-xl">
      <div>
        <Typography variant="h5" className="mb-4">Sizes</Typography>
        <div className="flex items-end gap-4">
          <Icon icon={Star} size="xs" />
          <Icon icon={Star} size="sm" />
          <Icon icon={Star} size="md" />
          <Icon icon={Star} size="lg" />
          <Icon icon={Star} size="xl" />
          <Icon icon={Star} size="2xl" />
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Colors</Typography>
        <div className="flex items-center gap-4">
          <Icon icon={Heart} color="default" size="lg" />
          <Icon icon={Heart} color="primary" size="lg" />
          <Icon icon={Heart} color="success" size="lg" />
          <Icon icon={Heart} color="warning" size="lg" />
          <Icon icon={Heart} color="error" size="lg" />
          <Icon icon={Heart} color="info" size="lg" />
          <Icon icon={Heart} color="muted" size="lg" />
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">With Container</Typography>
        <div className="flex items-center gap-4">
          <Icon icon={Bell} container="subtle" color="primary" size="lg" />
          <Icon icon={Bell} container="filled" color="primary" size="lg" />
          <Icon icon={Bell} container="outlined" color="primary" size="lg" />
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Animated</Typography>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <Icon icon={Loader2} spin size="lg" color="primary" />
            <Typography variant="caption" className="block mt-2">Spin</Typography>
          </div>
          <div className="text-center">
            <Icon icon={Bell} pulse size="lg" color="warning" />
            <Typography variant="caption" className="block mt-2">Pulse</Typography>
          </div>
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Icon Buttons</Typography>
        <div className="flex items-center gap-4">
          <IconButton icon={Home} label="Home" variant="ghost" />
          <IconButton icon={Settings} label="Settings" variant="subtle" />
          <IconButton icon={Bell} label="Notifications" variant="filled" />
          <IconButton icon={Edit} label="Edit" rounded={false} />
          <IconButton icon={Loader2} label="Loading" loading />
        </div>
      </div>
      
      <AntDivider />
      
      <div>
        <Typography variant="h5" className="mb-4">Common Icons</Typography>
        <div className="flex flex-wrap gap-4">
          <Icon icon={User} size="lg" label="User" />
          <Icon icon={Mail} size="lg" label="Mail" />
          <Icon icon={Bell} size="lg" label="Bell" />
          <Icon icon={Settings} size="lg" label="Settings" />
          <Icon icon={Search} size="lg" label="Search" />
          <Icon icon={Heart} size="lg" label="Heart" />
          <Icon icon={Star} size="lg" label="Star" />
          <Icon icon={Home} size="lg" label="Home" />
          <Icon icon={Check} size="lg" color="success" label="Check" />
          <Icon icon={X} size="lg" color="error" label="Close" />
          <Icon icon={AlertCircle} size="lg" color="warning" label="Alert" />
          <Icon icon={Info} size="lg" color="info" label="Info" />
          <Icon icon={Download} size="lg" label="Download" />
          <Icon icon={Upload} size="lg" label="Upload" />
          <Icon icon={Trash} size="lg" color="error" label="Trash" />
          <Icon icon={Edit} size="lg" label="Edit" />
          <Icon icon={Plus} size="lg" label="Plus" />
          <Icon icon={Minus} size="lg" label="Minus" />
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Complete Atoms Overview
// =============================================================================

export const AllAtoms: StoryObj = {
  name: 'All Atoms Overview',
  render: () => (
    <div className="space-y-12 p-6">
      <div className="text-center">
        <Typography variant="h2">Atoms Component Library</Typography>
        <Typography variant="lead" color="muted">
          Fundamental building blocks of the LightDom design system
        </Typography>
      </div>
      
      {/* Quick Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="outlined" className="text-center">
          <Typography variant="h4">12</Typography>
          <Typography variant="caption">Atom Components</Typography>
        </Card>
        <Card variant="outlined" className="text-center">
          <Typography variant="h4">50+</Typography>
          <Typography variant="caption">Variants</Typography>
        </Card>
        <Card variant="outlined" className="text-center">
          <Typography variant="h4">A11y</Typography>
          <Typography variant="caption">Accessible</Typography>
        </Card>
        <Card variant="outlined" className="text-center">
          <Typography variant="h4">Dark</Typography>
          <Typography variant="caption">Mode Support</Typography>
        </Card>
      </div>
      
      {/* Component Samples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader title="Typography" subtitle="Text styles" />
          <CardContent className="space-y-1">
            <Typography variant="h5">Heading</Typography>
            <Typography variant="body1">Body text</Typography>
            <Typography variant="caption">Caption</Typography>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader title="Avatar" subtitle="User images" />
          <CardContent>
            <AvatarGroup max={4} size="md">
              <Avatar name="A" variant="primary" />
              <Avatar name="B" variant="gradient" />
              <Avatar name="C" variant="success" />
              <Avatar name="D" variant="warning" />
            </AvatarGroup>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader title="Spinner" subtitle="Loading states" />
          <CardContent className="flex gap-4">
            <Spinner size="md" />
            <DotsSpinner size="md" />
            <PulseSpinner size="md" />
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader title="Form Controls" subtitle="Inputs & toggles" />
          <CardContent className="space-y-3">
            <Checkbox label="Checkbox" defaultChecked />
            <Toggle label="Toggle" defaultChecked />
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader title="Icons" subtitle="Iconography" />
          <CardContent className="flex gap-2">
            <Icon icon={Home} size="md" />
            <Icon icon={Settings} size="md" />
            <Icon icon={Bell} size="md" />
            <Icon icon={User} size="md" />
            <Icon icon={Star} color="warning" size="md" />
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader title="Badges" subtitle="Status indicators" />
          <CardContent className="flex gap-2 flex-wrap">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

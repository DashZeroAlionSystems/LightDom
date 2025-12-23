import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

// Import all UI components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { Divider } from '@/components/ui/Divider';
import { TextArea } from '@/components/ui/TextArea';
import { LoadingBar } from '@/components/ui/LoadingBar';

// Icons
import { 
  Check, 
  X, 
  Plus, 
  Minus, 
  Settings, 
  User, 
  Mail,
  Lock,
  Search,
  Bell,
  Heart,
  Star,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  Save,
  ExternalLink
} from 'lucide-react';

/**
 * Component Library
 * 
 * This story showcases all UI components available in the design system.
 * Each component follows the styleguide rules for consistency.
 */

// ============================================================================
// Component Library Showcase
// ============================================================================

const ComponentSection: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="mb-12 pb-8 border-b border-border last:border-b-0">
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground mb-6">{description}</p>
    <div className="space-y-6">{children}</div>
  </div>
);

const ComponentExample: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
    <div className="flex flex-wrap items-center gap-4">
      {children}
    </div>
  </div>
);

const ComponentLibrary: React.FC = () => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(60);

  return (
    <div className="max-w-5xl mx-auto p-8 bg-background">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Component Library</h1>
        <p className="text-lg text-muted-foreground">
          All UI components available in the LightDom design system, ready for reuse.
          Each component follows the styleguide rules for consistency.
        </p>
      </header>

      {/* Buttons */}
      <ComponentSection
        title="Buttons"
        description="Interactive buttons with different variants, sizes, and states. All buttons have a minimum touch target of 44x44px."
      >
        <ComponentExample title="Variants">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </ComponentExample>

        <ComponentExample title="Sizes">
          <Button size="sm">Small</Button>
          <Button size="default">Medium</Button>
          <Button size="lg">Large</Button>
        </ComponentExample>

        <ComponentExample title="With Icons">
          <Button><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
          <Button variant="secondary"><Settings className="w-4 h-4 mr-2" /> Settings</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Download</Button>
          <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
        </ComponentExample>

        <ComponentExample title="States">
          <Button disabled>Disabled</Button>
          <Button className="pointer-events-none opacity-70">
            <span className="animate-spin mr-2">⟳</span> Loading...
          </Button>
        </ComponentExample>

        <ComponentExample title="Icon Only">
          <Button size="icon" variant="outline"><Search className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost"><Bell className="w-4 h-4" /></Button>
          <Button size="icon" variant="secondary"><Star className="w-4 h-4" /></Button>
          <Button size="icon" variant="destructive"><X className="w-4 h-4" /></Button>
        </ComponentExample>
      </ComponentSection>

      {/* Inputs */}
      <ComponentSection
        title="Inputs"
        description="Form inputs with various states and configurations. Height follows styleguide: 40px (medium), 32px (small), 48px (large)."
      >
        <ComponentExample title="Basic Input">
          <Input 
            placeholder="Enter your name..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </ComponentExample>

        <ComponentExample title="With Icon">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Email address" type="email" className="pl-10" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Password" type="password" className="pl-10" />
          </div>
        </ComponentExample>

        <ComponentExample title="States">
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Error state" className="border-destructive focus:ring-destructive" />
          <Input placeholder="Success state" className="border-green-500 focus:ring-green-500" />
        </ComponentExample>
      </ComponentSection>

      {/* TextArea */}
      <ComponentSection
        title="TextArea"
        description="Multi-line text input for longer content."
      >
        <ComponentExample title="Basic">
          <TextArea placeholder="Enter your message..." className="w-full max-w-md" />
        </ComponentExample>
      </ComponentSection>

      {/* Badges */}
      <ComponentSection
        title="Badges"
        description="Small labels for status, categories, or counts."
      >
        <ComponentExample title="Variants">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </ComponentExample>

        <ComponentExample title="Use Cases">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">New</Badge>
          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Premium</Badge>
        </ComponentExample>
      </ComponentSection>

      {/* Cards */}
      <ComponentSection
        title="Cards"
        description="Container components for grouping related content. Uses consistent padding: p-4 (small), p-6 (medium), p-8 (large)."
      >
        <ComponentExample title="Basic Card">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the main content of the card. It can contain any content.</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </ComponentExample>

        <ComponentExample title="Interactive Cards">
          <div className="grid grid-cols-3 gap-4 w-full">
            <Card className="cursor-pointer hover:border-primary/60 transition-colors">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Featured</h3>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/60 transition-colors">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-medium">Favorites</h3>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/60 transition-colors">
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Settings</h3>
              </CardContent>
            </Card>
          </div>
        </ComponentExample>
      </ComponentSection>

      {/* Checkbox */}
      <ComponentSection
        title="Checkbox"
        description="Toggle for boolean selections."
      >
        <ComponentExample title="Basic">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="checkbox-1"
              checked={checkboxChecked}
              onCheckedChange={setCheckboxChecked}
            />
            <label htmlFor="checkbox-1" className="text-sm">
              Accept terms and conditions
            </label>
          </div>
        </ComponentExample>

        <ComponentExample title="States">
          <div className="flex items-center gap-2">
            <Checkbox id="cb-checked" checked />
            <label htmlFor="cb-checked" className="text-sm">Checked</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-unchecked" />
            <label htmlFor="cb-unchecked" className="text-sm">Unchecked</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb-disabled" disabled />
            <label htmlFor="cb-disabled" className="text-sm text-muted-foreground">Disabled</label>
          </div>
        </ComponentExample>
      </ComponentSection>

      {/* Avatar */}
      <ComponentSection
        title="Avatar"
        description="User profile images with fallback support."
      >
        <ComponentExample title="Sizes">
          <Avatar className="w-8 h-8" />
          <Avatar className="w-10 h-10" />
          <Avatar className="w-12 h-12" />
          <Avatar className="w-16 h-16" />
        </ComponentExample>

        <ComponentExample title="With Initials">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              JD
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium">
              AB
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
              XY
            </div>
          </div>
        </ComponentExample>
      </ComponentSection>

      {/* Progress */}
      <ComponentSection
        title="Progress"
        description="Visual indicators for progress and loading states."
      >
        <ComponentExample title="Linear Progress">
          <div className="w-full max-w-md space-y-4">
            <Progress value={25} />
            <Progress value={50} />
            <Progress value={75} />
            <Progress value={100} />
          </div>
        </ComponentExample>

        <ComponentExample title="Interactive">
          <div className="w-full max-w-md space-y-4">
            <Progress value={progress} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="flex items-center px-4">{progress}%</span>
              <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </ComponentExample>
      </ComponentSection>

      {/* Loading Bar */}
      <ComponentSection
        title="Loading Bar"
        description="Animated loading indicators."
      >
        <ComponentExample title="Variants">
          <div className="w-full max-w-md space-y-4">
            <LoadingBar variant="default" />
            <LoadingBar variant="primary" />
            <LoadingBar variant="gradient" />
          </div>
        </ComponentExample>
      </ComponentSection>

      {/* Divider */}
      <ComponentSection
        title="Divider"
        description="Visual separator for content sections."
      >
        <ComponentExample title="Horizontal">
          <div className="w-full">
            <p>Content above</p>
            <Divider className="my-4" />
            <p>Content below</p>
          </div>
        </ComponentExample>

        <ComponentExample title="With Text">
          <div className="w-full max-w-md">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-sm">OR</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
          </div>
        </ComponentExample>
      </ComponentSection>

      {/* Action Buttons Grid */}
      <ComponentSection
        title="Common Actions"
        description="Pre-styled buttons for common actions."
      >
        <ComponentExample title="CRUD Operations">
          <Button><Plus className="w-4 h-4 mr-2" /> Create</Button>
          <Button variant="secondary"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
          <Button variant="outline"><Copy className="w-4 h-4 mr-2" /> Duplicate</Button>
          <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
        </ComponentExample>

        <ComponentExample title="File Operations">
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Upload</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Download</Button>
          <Button variant="outline"><Save className="w-4 h-4 mr-2" /> Save</Button>
          <Button variant="outline"><ExternalLink className="w-4 h-4 mr-2" /> Export</Button>
        </ComponentExample>
      </ComponentSection>
    </div>
  );
};

// ============================================================================
// Story Configuration
// ============================================================================

const meta = {
  title: 'Design System/Component Library',
  component: ComponentLibrary,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Component Library

This story showcases all UI components available in the LightDom design system.
Each component follows the styleguide rules for consistency.

## Categories

- **Buttons**: Primary actions with variants and sizes
- **Inputs**: Text input fields with icons and states
- **Badges**: Status labels and tags
- **Cards**: Container components for content
- **Checkbox**: Boolean toggles
- **Avatar**: User profile images
- **Progress**: Loading and progress indicators
- **Divider**: Content separators

## Usage

All components are exported from \`@/components/ui\` and can be imported like:

\`\`\`tsx
import { Button, Input, Card } from '@/components/ui';
\`\`\`

## Database Storage

Components can be stored in the database using the Design System API:

\`\`\`tsx
import { designSystemApi } from '@/services/DesignSystemApiClient';

// Store a component
await designSystemApi.createComponent({
  name: 'MyButton',
  component_code: '...',
  category: 'atoms',
  status: 'published'
});

// Load a component
const component = await designSystemApi.getComponentByName('MyButton');
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentLibrary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ButtonsOnly: Story = {
  render: () => (
    <div className="p-8 space-y-6 bg-background">
      <h2 className="text-2xl font-bold">Buttons</h2>
      <div className="flex flex-wrap gap-4">
        <Button variant="default">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button size="sm">Small</Button>
        <Button size="default">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>
  ),
};

export const InputsOnly: Story = {
  render: () => (
    <div className="p-8 space-y-6 bg-background max-w-md">
      <h2 className="text-2xl font-bold">Inputs</h2>
      <Input placeholder="Basic input" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="With icon" className="pl-10" />
      </div>
      <Input placeholder="Disabled" disabled />
      <TextArea placeholder="Text area" />
    </div>
  ),
};

export const CardsOnly: Story = {
  render: () => (
    <div className="p-8 bg-background">
      <h2 className="text-2xl font-bold mb-6">Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card 1</CardTitle>
            <CardDescription>First card description</CardDescription>
          </CardHeader>
          <CardContent>Content here</CardContent>
          <CardFooter>
            <Button className="w-full">Action</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Card 2</CardTitle>
            <CardDescription>Second card description</CardDescription>
          </CardHeader>
          <CardContent>Content here</CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Secondary Action</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Card 3</CardTitle>
            <CardDescription>Third card description</CardDescription>
          </CardHeader>
          <CardContent>Content here</CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">Ghost Action</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  ),
};

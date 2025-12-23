import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ArrowRight, Heart, Share, MessageCircle, MoreHorizontal } from 'lucide-react';

/**
 * # Card Component
 * 
 * Material Design 3 card component for grouping related content.
 * Provides container structure with header, content, and footer slots.
 * 
 * ## Styleguide Rules
 * - Cards should have minimum 16px padding
 * - Use consistent border radius (12px default)
 * - Elevated variant for primary content
 * - Outlined variant for secondary/grouped content
 */
const meta: Meta<typeof Card> = {
  title: 'DESIGN SYSTEM/Molecules/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'elevated', 'outlined'],
      description: 'Visual style variant',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding',
    },
    hoverable: {
      control: 'boolean',
      description: 'Adds hover interaction effect',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The Card component is a compound component with:
- **Card**: Main container
- **CardHeader**: Header section for title and actions
- **CardTitle**: Main heading
- **CardDescription**: Subtitle or description
- **CardContent**: Main content area
- **CardFooter**: Footer for actions
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="max-w-sm">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>With shadow for emphasis</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card uses elevation (shadow) to stand out from the surface.</p>
      </CardContent>
    </Card>
  ),
};

export const Filled: Story = {
  render: () => (
    <Card variant="filled" className="max-w-sm">
      <CardHeader>
        <CardTitle>Filled Card</CardTitle>
        <CardDescription>Solid background with border</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has a solid container background without elevation.</p>
      </CardContent>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" className="max-w-sm">
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>Border without background</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card uses only a border for subtle separation.</p>
      </CardContent>
    </Card>
  ),
};

// ============================================================================
// Interactive Cards
// ============================================================================

export const Hoverable: Story = {
  render: () => (
    <Card variant="elevated" hoverable className="max-w-sm cursor-pointer">
      <CardHeader>
        <CardTitle>Clickable Card</CardTitle>
        <CardDescription>Hover to see effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card responds to hover with elevated shadow.</p>
      </CardContent>
      <CardFooter>
        <Button variant="text" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Learn More
        </Button>
      </CardFooter>
    </Card>
  ),
};

// ============================================================================
// Card with Actions
// ============================================================================

export const WithActions: Story = {
  render: () => (
    <Card variant="elevated" className="max-w-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Update</CardTitle>
          <CardDescription>Last updated 2 hours ago</CardDescription>
        </div>
        <Button variant="text" size="sm">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <p>The new design system components have been deployed successfully.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="filled">View Details</Button>
        <Button variant="outlined">Dismiss</Button>
      </CardFooter>
    </Card>
  ),
};

// ============================================================================
// Social Media Card
// ============================================================================

export const SocialCard: Story = {
  render: () => (
    <Card variant="elevated" className="max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-12 h-12" />
        <div className="flex-1">
          <CardTitle className="text-base">John Doe</CardTitle>
          <CardDescription>@johndoe · 2h ago</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-on-surface">
          Just finished implementing the new design system! 🎨 The components are looking
          great and follow Material Design 3 principles.
        </p>
        <div className="mt-4 rounded-lg bg-surface-container aspect-video flex items-center justify-center">
          <span className="text-on-surface-variant">Image Preview</span>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="text" leftIcon={<Heart className="w-4 h-4" />}>
          124
        </Button>
        <Button variant="text" leftIcon={<MessageCircle className="w-4 h-4" />}>
          32
        </Button>
        <Button variant="text" leftIcon={<Share className="w-4 h-4" />}>
          Share
        </Button>
      </CardFooter>
    </Card>
  ),
};

// ============================================================================
// Product Card
// ============================================================================

export const ProductCard: Story = {
  render: () => (
    <Card variant="elevated" padding="none" className="max-w-xs overflow-hidden">
      <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <span className="text-6xl">📦</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Premium Widget</CardTitle>
            <CardDescription>High-quality component</CardDescription>
          </div>
          <Badge variant="success">New</Badge>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-bold">$49.99</span>
          <Button size="sm">Add to Cart</Button>
        </div>
      </div>
    </Card>
  ),
};

// ============================================================================
// Stats Card
// ============================================================================

export const StatsCard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-3xl">12,345</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="text-success text-sm">+12% from last month</span>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardDescription>Active Sessions</CardDescription>
          <CardTitle className="text-3xl">8,421</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="text-success text-sm">+5% from last hour</span>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader className="pb-2">
          <CardDescription>Revenue</CardDescription>
          <CardTitle className="text-3xl">$54,231</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="text-error text-sm">-2% from last month</span>
        </CardContent>
      </Card>
    </div>
  ),
};

// ============================================================================
// Card Grid
// ============================================================================

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} variant="elevated" hoverable>
          <CardHeader>
            <CardTitle>Card {i}</CardTitle>
            <CardDescription>Description for card {i}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-on-surface-variant">
              This is example content for card number {i}. Cards can contain any content.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="text" size="sm">
              View More
            </Button>
          </CardFooter>
        </Card>
      ))}
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
        <h3 className="text-lg font-semibold mb-4">Card Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated</CardTitle>
              <CardDescription>With shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content goes here</p>
            </CardContent>
          </Card>
          <Card variant="filled">
            <CardHeader>
              <CardTitle>Filled</CardTitle>
              <CardDescription>Solid background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content goes here</p>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined</CardTitle>
              <CardDescription>Border only</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content goes here</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Padding Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="none" variant="outlined"><span className="p-2 block">None</span></Card>
          <Card padding="sm" variant="outlined">Small</Card>
          <Card padding="md" variant="outlined">Medium</Card>
          <Card padding="lg" variant="outlined">Large</Card>
        </div>
      </div>
    </div>
  ),
};

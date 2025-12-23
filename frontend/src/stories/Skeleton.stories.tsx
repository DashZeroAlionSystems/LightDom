import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

/**
 * # Skeleton Component
 * 
 * Loading placeholder that mimics content structure.
 * 
 * ## Styleguide Rules
 * - Match skeleton shape to actual content
 * - Use subtle animation for better UX
 * - Group related skeletons together
 * - Provide appropriate sizing
 */
const meta: Meta<typeof Skeleton> = {
  title: 'DESIGN SYSTEM/Atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const Circle: Story = {
  render: () => <Skeleton className="h-12 w-12 rounded-full" />,
};

export const Rectangle: Story = {
  render: () => <Skeleton className="h-24 w-full" />,
};

// ============================================================================
// Text Lines
// ============================================================================

export const TextLines: Story = {
  render: () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
};

export const Paragraph: Story = {
  render: () => (
    <div className="space-y-3 max-w-md">
      <Skeleton className="h-6 w-3/4" /> {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  ),
};

// ============================================================================
// User Profile
// ============================================================================

export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
};

export const UserCard: Story = {
  render: () => (
    <div className="flex items-start gap-4 p-4 bg-surface rounded-lg max-w-sm">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Card Loading
// ============================================================================

export const CardLoading: Story = {
  render: () => (
    <Card className="max-w-sm">
      <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  ),
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <Skeleton className="h-32 w-full rounded-t-xl rounded-b-none" />
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

// ============================================================================
// List Loading
// ============================================================================

export const ListItems: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-4 p-3 bg-surface rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// Table Loading
// ============================================================================

export const TableLoading: Story = {
  render: () => (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex gap-4 p-3 bg-surface-container-highest rounded-t-lg">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
      {/* Rows */}
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-4 p-3 border-b border-outline">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 ml-auto rounded" />
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// Dashboard Loading
// ============================================================================

export const DashboardLoading: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} padding="md">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </Card>
        ))}
      </div>
      
      {/* Chart */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

// ============================================================================
// Article Loading
// ============================================================================

export const ArticleLoading: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-3/4" /> {/* Title */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-lg" /> {/* Featured Image */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-6 w-1/2" /> {/* Subheading */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
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
        <h3 className="text-lg font-semibold mb-4">Basic Shapes</h3>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-16 w-24 rounded" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Text Placeholder</h3>
        <div className="space-y-2 max-w-md">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">User Profile</h3>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Card Placeholder</h3>
        <Card className="max-w-xs">
          <Skeleton className="h-32 w-full rounded-t-xl rounded-b-none" />
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
        </Card>
      </div>
    </div>
  ),
};

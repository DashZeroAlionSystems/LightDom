import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { 
  Info, 
  HelpCircle, 
  Settings, 
  Copy, 
  Share,
  Download,
  Trash2
} from 'lucide-react';

/**
 * # Tooltip Component
 * 
 * Contextual information on hover or focus.
 * 
 * ## Styleguide Rules
 * - Keep tooltip text brief (under 80 characters)
 * - Use for supplementary information, not essential
 * - Ensure tooltip is accessible via keyboard
 * - Position to avoid obscuring related content
 */
const meta: Meta<typeof Tooltip> = {
  title: 'DESIGN SYSTEM/Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Tooltip content',
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
      description: 'Tooltip placement',
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'light'],
      description: 'Color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tooltip size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  render: () => (
    <Tooltip content="This is a tooltip">
      <Button>Hover me</Button>
    </Tooltip>
  ),
};

// ============================================================================
// Placements
// ============================================================================

export const Placements: Story = {
  render: () => (
    <div className="flex flex-wrap justify-center gap-4 p-20">
      <Tooltip content="Top" placement="top">
        <Button variant="outlined">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom" placement="bottom">
        <Button variant="outlined">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" placement="left">
        <Button variant="outlined">Left</Button>
      </Tooltip>
      <Tooltip content="Right" placement="right">
        <Button variant="outlined">Right</Button>
      </Tooltip>
    </div>
  ),
};

export const CornerPlacements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-12">
      <Tooltip content="Top Left" placement="top-left">
        <Button variant="outlined" size="sm">TL</Button>
      </Tooltip>
      <Tooltip content="Top" placement="top">
        <Button variant="outlined" size="sm">Top</Button>
      </Tooltip>
      <Tooltip content="Top Right" placement="top-right">
        <Button variant="outlined" size="sm">TR</Button>
      </Tooltip>
      <Tooltip content="Left" placement="left">
        <Button variant="outlined" size="sm">Left</Button>
      </Tooltip>
      <div></div>
      <Tooltip content="Right" placement="right">
        <Button variant="outlined" size="sm">Right</Button>
      </Tooltip>
      <Tooltip content="Bottom Left" placement="bottom-left">
        <Button variant="outlined" size="sm">BL</Button>
      </Tooltip>
      <Tooltip content="Bottom" placement="bottom">
        <Button variant="outlined" size="sm">Bottom</Button>
      </Tooltip>
      <Tooltip content="Bottom Right" placement="bottom-right">
        <Button variant="outlined" size="sm">BR</Button>
      </Tooltip>
    </div>
  ),
};

// ============================================================================
// Variants
// ============================================================================

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-8">
      <Tooltip content="Default tooltip" variant="default">
        <Button variant="outlined">Default</Button>
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
      <Tooltip content="Light tooltip" variant="light">
        <Button variant="outlined">Light</Button>
      </Tooltip>
    </div>
  ),
};

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 p-8">
      <Tooltip content="Small tooltip" size="sm">
        <Button variant="outlined">Small</Button>
      </Tooltip>
      <Tooltip content="Medium tooltip" size="md">
        <Button variant="outlined">Medium</Button>
      </Tooltip>
      <Tooltip content="Large tooltip" size="lg">
        <Button variant="outlined">Large</Button>
      </Tooltip>
    </div>
  ),
};

// ============================================================================
// Icon Buttons with Tooltips
// ============================================================================

export const IconButtons: Story = {
  render: () => (
    <div className="flex gap-2 p-8">
      <Tooltip content="Copy to clipboard">
        <Button variant="text" size="sm">
          <Copy className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Share">
        <Button variant="text" size="sm">
          <Share className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Download">
        <Button variant="text" size="sm">
          <Download className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Delete" variant="error">
        <Button variant="text" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </Tooltip>
    </div>
  ),
};

// ============================================================================
// Help Icons
// ============================================================================

export const HelpIcons: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
        <span className="font-medium">API Key</span>
        <Tooltip content="Your unique API key for authentication. Keep it secret!">
          <button className="text-on-surface-variant hover:text-on-surface">
            <HelpCircle className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
        <span className="font-medium">Rate Limit</span>
        <Tooltip content="Maximum requests per minute. Contact support to increase.">
          <button className="text-on-surface-variant hover:text-on-surface">
            <HelpCircle className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
        <span className="font-medium">Webhook URL</span>
        <Tooltip content="URL where we'll send event notifications.">
          <button className="text-on-surface-variant hover:text-on-surface">
            <HelpCircle className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  ),
};

// ============================================================================
// Inline Help
// ============================================================================

export const InlineHelp: Story = {
  render: () => (
    <div className="max-w-md">
      <label className="block mb-2">
        <span className="font-medium">Username</span>
        <Tooltip content="3-20 characters, letters and numbers only" placement="right">
          <Info className="w-4 h-4 inline ml-1 text-on-surface-variant cursor-help" />
        </Tooltip>
      </label>
      <input 
        type="text" 
        className="w-full p-2 border border-outline rounded-md"
        placeholder="Enter username"
      />
    </div>
  ),
};

// ============================================================================
// Toolbar
// ============================================================================

export const Toolbar: Story = {
  render: () => (
    <div className="flex items-center gap-1 p-2 bg-surface rounded-lg w-fit">
      <Tooltip content="Settings" placement="bottom">
        <Button variant="text" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Copy" placement="bottom">
        <Button variant="text" size="sm">
          <Copy className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Share" placement="bottom">
        <Button variant="text" size="sm">
          <Share className="w-4 h-4" />
        </Button>
      </Tooltip>
      <div className="w-px h-6 bg-outline mx-1" />
      <Tooltip content="Download" placement="bottom">
        <Button variant="text" size="sm">
          <Download className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Delete" placement="bottom" variant="error">
        <Button variant="text" size="sm" className="text-error">
          <Trash2 className="w-4 h-4" />
        </Button>
      </Tooltip>
    </div>
  ),
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Placements</h3>
        <div className="flex justify-center gap-4">
          <Tooltip content="Top" placement="top">
            <Button variant="outlined" size="sm">Top</Button>
          </Tooltip>
          <Tooltip content="Bottom" placement="bottom">
            <Button variant="outlined" size="sm">Bottom</Button>
          </Tooltip>
          <Tooltip content="Left" placement="left">
            <Button variant="outlined" size="sm">Left</Button>
          </Tooltip>
          <Tooltip content="Right" placement="right">
            <Button variant="outlined" size="sm">Right</Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Color Variants</h3>
        <div className="flex gap-4">
          <Tooltip content="Default" variant="default">
            <Button variant="outlined" size="sm">Default</Button>
          </Tooltip>
          <Tooltip content="Primary" variant="primary">
            <Button variant="outlined" size="sm">Primary</Button>
          </Tooltip>
          <Tooltip content="Success" variant="success">
            <Button variant="outlined" size="sm">Success</Button>
          </Tooltip>
          <Tooltip content="Error" variant="error">
            <Button variant="outlined" size="sm">Error</Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Icon Buttons</h3>
        <div className="flex gap-2">
          <Tooltip content="Copy">
            <Button variant="text" size="sm"><Copy className="w-4 h-4" /></Button>
          </Tooltip>
          <Tooltip content="Share">
            <Button variant="text" size="sm"><Share className="w-4 h-4" /></Button>
          </Tooltip>
          <Tooltip content="Download">
            <Button variant="text" size="sm"><Download className="w-4 h-4" /></Button>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
};

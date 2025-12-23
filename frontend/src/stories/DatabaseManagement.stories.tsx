import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle,
  Loader2,
  Code,
  Palette,
  BookOpen,
  Component
} from 'lucide-react';

/**
 * Design System Database Management
 * 
 * This story demonstrates the workflow for:
 * - Syncing design tokens to the database
 * - Storing and loading components
 * - Managing styleguide rules
 * - Creating Storybook entries
 */

interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
}

const DatabaseManagement: React.FC = () => {
  const [tokenSyncStatus, setTokenSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [styleguideSyncStatus, setStyleguideSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [componentCount, setComponentCount] = useState(0);
  const [designSystemId, setDesignSystemId] = useState<number | null>(null);

  const simulateSync = async (
    setStatus: React.Dispatch<React.SetStateAction<SyncStatus>>,
    successMessage: string
  ) => {
    setStatus({ status: 'syncing' });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success
    setStatus({ status: 'success', message: successMessage });
    setDesignSystemId(1);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setStatus({ status: 'idle' });
    }, 3000);
  };

  const handleSyncTokens = () => {
    simulateSync(setTokenSyncStatus, 'Design tokens synced to database');
  };

  const handleSyncStyleguide = () => {
    simulateSync(setStyleguideSyncStatus, '45 styleguide rules synced');
  };

  const getStatusIcon = (status: SyncStatus['status']) => {
    switch (status) {
      case 'syncing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: SyncStatus['status']) => {
    switch (status) {
      case 'syncing':
        return <Badge className="bg-blue-500/10 text-blue-500">Syncing...</Badge>;
      case 'success':
        return <Badge className="bg-green-500/10 text-green-500">Synced</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Synced</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-background">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Design System Database</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Manage design system configuration, styleguide rules, and components in the database.
          This enables reusable components across the platform.
        </p>
      </header>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Design System</p>
              <p className="font-semibold">{designSystemId ? `ID: ${designSystemId}` : 'Not synced'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <BookOpen className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Styleguide Rules</p>
              <p className="font-semibold">{styleguideSyncStatus.status === 'success' ? '45 rules' : '0 rules'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Component className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Components</p>
              <p className="font-semibold">{componentCount} stored</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Code className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storybook</p>
              <p className="font-semibold">Ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Actions */}
      <div className="space-y-6">
        {/* Design Tokens Sync */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>Design Tokens</CardTitle>
                  <CardDescription>
                    Sync colors, typography, spacing, and other design tokens to the database
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(tokenSyncStatus.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`{
  "colors": {
    "primary": "#5865f2",
    "secondary": "#7c5cff",
    ...
  },
  "typography": {
    "fontFamily": "'Inter', sans-serif",
    "fontSize": { "xs": "0.75rem", ... }
  },
  "spacing": { "1": "0.25rem", ... }
}`}</pre>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStatusIcon(tokenSyncStatus.status)}
              {tokenSyncStatus.message && <span>{tokenSyncStatus.message}</span>}
            </div>
            <Button 
              onClick={handleSyncTokens}
              disabled={tokenSyncStatus.status === 'syncing'}
            >
              {tokenSyncStatus.status === 'syncing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Tokens
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Styleguide Rules Sync */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-green-500" />
                <div>
                  <CardTitle>Styleguide Rules</CardTitle>
                  <CardDescription>
                    Sync UX/UI rules for buttons, cards, inputs, navigation, and accessibility
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(styleguideSyncStatus.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['buttons', 'cards', 'inputs', 'navigation', 'dashboards', 'accessibility', 'motion'].map((category) => (
                <div key={category} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{category}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStatusIcon(styleguideSyncStatus.status)}
              {styleguideSyncStatus.message && <span>{styleguideSyncStatus.message}</span>}
            </div>
            <Button 
              variant="secondary"
              onClick={handleSyncStyleguide}
              disabled={styleguideSyncStatus.status === 'syncing'}
            >
              {styleguideSyncStatus.status === 'syncing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Sync Rules
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Component Storage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Component className="w-6 h-6 text-purple-500" />
              <div>
                <CardTitle>Component Storage</CardTitle>
                <CardDescription>
                  Store React component code in the database for dynamic loading
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Component Name</label>
                  <Input placeholder="e.g., CustomButton" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select className="w-full h-10 px-3 rounded-md border border-border bg-background">
                    <option value="atoms">Atoms</option>
                    <option value="molecules">Molecules</option>
                    <option value="organisms">Organisms</option>
                    <option value="templates">Templates</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Component Code</label>
                <textarea 
                  className="w-full h-32 p-3 rounded-md border border-border bg-muted/50 font-mono text-sm resize-none"
                  placeholder={`export const MyComponent: React.FC = () => {
  return <div>Hello World</div>;
};`}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Load Component
            </Button>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Save Component
            </Button>
          </CardFooter>
        </Card>

        {/* API Reference */}
        <Card>
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
            <CardDescription>
              Use these endpoints to interact with the design system database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-green-500/10 text-green-500">GET</Badge>
                <span>/api/design-system/config/active</span>
                <span className="text-muted-foreground">- Get active config</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-blue-500/10 text-blue-500">POST</Badge>
                <span>/api/design-system/sync</span>
                <span className="text-muted-foreground">- Full sync</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-green-500/10 text-green-500">GET</Badge>
                <span>/api/design-system/components</span>
                <span className="text-muted-foreground">- List components</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-blue-500/10 text-blue-500">POST</Badge>
                <span>/api/design-system/components</span>
                <span className="text-muted-foreground">- Create component</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-green-500/10 text-green-500">GET</Badge>
                <span>/api/design-system/styleguide/:id</span>
                <span className="text-muted-foreground">- Get rules</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="bg-green-500/10 text-green-500">GET</Badge>
                <span>/api/design-system/storybook</span>
                <span className="text-muted-foreground">- Get entries</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// Story Configuration
// ============================================================================

const meta = {
  title: 'Design System/Database Management',
  component: DatabaseManagement,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Design System Database Management

This story demonstrates how to manage the design system in the database.

## Features

1. **Sync Design Tokens**: Store colors, typography, spacing in PostgreSQL
2. **Sync Styleguide Rules**: Store UX/UI rules for component compliance
3. **Store Components**: Save React component code for dynamic loading
4. **Storybook Integration**: Auto-generate Storybook entries

## Database Tables

- \`design_system_config\`: Main configuration and tokens
- \`styleguide_rules\`: UX/UI rules by category
- \`design_system_components\`: React component code storage
- \`storybook_entries\`: Storybook story configuration
- \`design_system_themes\`: Light/dark theme tokens
- \`component_variants\`: Component variant configurations

## Usage

\`\`\`typescript
import { designSystemApi } from '@/services/DesignSystemApiClient';

// Sync entire design system
await designSystemApi.syncAll('LightDom Default');

// Store a component
await designSystemApi.createComponent({
  name: 'MyButton',
  component_code: \`export const MyButton = () => <button>Click</button>\`,
  category: 'atoms',
  status: 'published'
});

// Load from database
const { data } = await designSystemApi.getComponentByName('MyButton');
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatabaseManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

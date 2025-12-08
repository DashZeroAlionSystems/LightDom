import React from 'react';
import { NavigationSidebar } from '@/components/NavigationSidebar';

/**
 * Sidebar Demo Page
 * 
 * Demonstrates the navigation sidebar without authentication requirements.
 * This page is for testing and showcasing the sidebar functionality.
 */
export const SidebarDemoPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <NavigationSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Navigation Sidebar Demo</h1>
            <p className="text-muted-foreground">
              This is a demonstration of the new navigation sidebar component.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>✅ Collapsible design with smooth transitions</li>
              <li>✅ Categorized navigation items</li>
              <li>✅ User profile section with actions</li>
              <li>✅ Active state management</li>
              <li>✅ Fully accessible with ARIA labels</li>
              <li>✅ Built with atomic, reusable components</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold">How to Use</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Toggle Collapse:</strong> Click the menu icon in the sidebar header
                to collapse or expand the sidebar.
              </p>
              <p>
                <strong>Navigation:</strong> Click any navigation item to navigate to that route.
                The active route is automatically highlighted.
              </p>
              <p>
                <strong>Categories:</strong> Click on a category header to expand or collapse
                that category's navigation items.
              </p>
              <p>
                <strong>Profile Actions:</strong> In expanded mode, access settings, notifications,
                and logout from the profile section at the bottom.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Component Structure</h2>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`NavigationSidebar
├── SidebarContainer (Context Provider)
│   ├── SidebarHeader (Logo + Toggle)
│   ├── Navigation Content
│   │   ├── SidebarCategory (Main)
│   │   │   ├── SidebarNavItem
│   │   │   └── SidebarNavItem
│   │   ├── SidebarDivider
│   │   ├── SidebarCategory (Features)
│   │   │   └── SidebarNavItem × N
│   │   └── SidebarCategory (System)
│   │       └── SidebarNavItem × N
│   └── SidebarProfile (User Info)`}</pre>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Documentation</h2>
            <p className="text-muted-foreground">
              For complete documentation including API reference, usage examples, and
              customization options, see:
            </p>
            <code className="block bg-muted/50 p-3 rounded text-sm">
              frontend/src/components/ui/sidebar/README.md
            </code>
          </div>
        </div>
      </main>
    </div>
  );
};

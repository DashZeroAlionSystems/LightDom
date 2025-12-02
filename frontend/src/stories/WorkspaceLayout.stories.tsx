/**
 * WorkspaceLayout Component Stories
 * 
 * Multi-pane layout system for editing and workspace interfaces.
 * Following LightDom Design System guidelines.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

// WorkspaceLayout Component
const WorkspaceLayout: React.FC<{
  sidebar: React.ReactNode;
  inspector: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ sidebar, inspector, header, children, className = '' }) => {
  return (
    <div className={`min-h-screen w-full bg-gray-100 dark:bg-gray-950 grid grid-cols-[280px,1fr,320px] gap-4 p-4 ${className}`}>
      {/* Sidebar */}
      <aside className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
        {sidebar}
      </aside>

      {/* Main content */}
      <main className="flex min-h-[600px] flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
        {header && (
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-4">
            {header}
          </div>
        )}
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>

      {/* Inspector */}
      <aside className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
        {inspector}
      </aside>
    </div>
  );
};

// WorkspaceSection Component
const WorkspaceSection: React.FC<{
  title?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}> = ({ title, meta, actions, children, className = '' }) => (
  <section className={`flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 ${className}`}>
    {(title || meta || actions) && (
      <header className="flex items-start justify-between gap-4">
        <div>
          {title && <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>}
          {meta && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meta}</div>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
    )}
    {children}
  </section>
);

// WorkspaceTabs Component
const WorkspaceTabs: React.FC<{
  tabs: Array<{
    id: string;
    label: string;
    subtitle?: string;
    active?: boolean;
    dirty?: boolean;
  }>;
  onSelect?: (id: string) => void;
  onClose?: (id: string) => void;
}> = ({ tabs, onSelect, onClose }) => (
  <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onSelect?.(tab.id)}
        className={`
          relative inline-flex items-center gap-3 rounded-lg px-4 py-2 text-left transition-all
          ${tab.active 
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}
        `}
      >
        <div className="flex flex-col leading-tight">
          <span className="font-medium">{tab.label}</span>
          {tab.subtitle && <span className="text-xs text-gray-500">{tab.subtitle}</span>}
        </div>
        {tab.dirty && <span className="text-yellow-500">•</span>}
        {onClose && (
          <span
            role="button"
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
          >
            ×
          </span>
        )}
      </button>
    ))}
  </div>
);

// Toggle Group Component
const ToggleGroup: React.FC<{
  options: Array<{ value: string; label: string; badge?: string }>;
  value: string;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-1">
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`
          relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all
          ${option.value === value
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'}
        `}
      >
        {option.label}
        {option.badge && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${
            option.value === value ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
          }`}>
            {option.badge}
          </span>
        )}
      </button>
    ))}
  </div>
);

const meta: Meta = {
  title: 'DESIGN SYSTEM/Templates/WorkspaceLayout',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## WorkspaceLayout Component

Multi-pane layout system for building IDE-like interfaces, editors, and workspace views.

### Components Included
- **WorkspaceLayout**: Main 3-column layout container
- **WorkspaceSection**: Content sections within panels
- **WorkspaceTabs**: Tab bar for multiple documents/views
- **ToggleGroup**: Segmented control for view modes

### Design System Rules
- **Columns**: Left sidebar (280px), Main content (flex), Right inspector (320px)
- **Spacing**: 16px gaps between panels
- **Border Radius**: 16px for panels, 12px for sections
- **Colors**: Surface containers with subtle borders

### When to Use
- Code editors and IDEs
- Design tools
- Content management systems
- Configuration interfaces
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Basic Layout
export const BasicLayout: Story = {
  render: () => (
    <WorkspaceLayout
      sidebar={
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Navigation</h3>
          <nav className="space-y-1">
            {['Dashboard', 'Projects', 'Files', 'Settings'].map((item) => (
              <button
                key={item}
                className="w-full px-3 py-2 text-left rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      }
      inspector={
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Properties</h3>
          <p className="text-sm text-gray-500">Select an item to view its properties</p>
        </div>
      }
    >
      <div className="h-full flex items-center justify-center text-gray-400">
        Main Content Area
      </div>
    </WorkspaceLayout>
  ),
};

// Code Editor Layout
export const CodeEditorLayout: Story = {
  render: function CodeEditor() {
    const [activeTab, setActiveTab] = useState('index.tsx');
    const [viewMode, setViewMode] = useState('code');

    const tabs = [
      { id: 'index.tsx', label: 'index.tsx', subtitle: 'src/components', active: activeTab === 'index.tsx' },
      { id: 'styles.css', label: 'styles.css', subtitle: 'src', active: activeTab === 'styles.css', dirty: true },
      { id: 'config.json', label: 'config.json', subtitle: 'root', active: activeTab === 'config.json' },
    ];

    return (
      <WorkspaceLayout
        sidebar={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Explorer</h3>
              <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            {/* File tree */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 px-2 py-1 font-medium">
                <span>📁</span> src
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                  <span>📁</span> components
                </div>
                <div className="ml-4 space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                    <span>📄</span> index.tsx
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                    <span>📄</span> Button.tsx
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                  <span>📄</span> styles.css
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                <span>📄</span> config.json
              </div>
            </div>
          </div>
        }
        inspector={
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Outline</h3>
            <div className="space-y-1 text-sm">
              {['function App()', '  return ()', '    <div>', '      <Header />', '      <Main />', '    </div>'].map((item, i) => (
                <div key={i} className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer font-mono text-xs">
                  {item}
                </div>
              ))}
            </div>
            
            <WorkspaceSection title="Git Changes" meta="3 files changed">
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-green-600">+ index.tsx</span>
                  <span className="text-xs text-gray-400">M</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-yellow-600">~ styles.css</span>
                  <span className="text-xs text-gray-400">M</span>
                </div>
              </div>
            </WorkspaceSection>
          </div>
        }
        header={
          <div className="flex items-center justify-between">
            <WorkspaceTabs
              tabs={tabs}
              onSelect={setActiveTab}
              onClose={(id) => console.log('Close', id)}
            />
            <ToggleGroup
              options={[
                { value: 'code', label: 'Code' },
                { value: 'preview', label: 'Preview' },
                { value: 'split', label: 'Split' },
              ]}
              value={viewMode}
              onChange={setViewMode}
            />
          </div>
        }
      >
        <div className="h-full bg-gray-950 rounded-lg p-4 font-mono text-sm text-green-400 overflow-auto">
          <pre>{`import React from 'react';

export function App() {
  return (
    <div className="app">
      <Header title="My App" />
      <Main>
        <p>Welcome to the app!</p>
      </Main>
      <Footer />
    </div>
  );
}

export default App;`}</pre>
        </div>
      </WorkspaceLayout>
    );
  },
};

// Design Tool Layout
export const DesignToolLayout: Story = {
  render: function DesignTool() {
    const [selectedTool, setSelectedTool] = useState('select');
    const [zoom, setZoom] = useState(100);

    const tools = [
      { id: 'select', icon: '↖', label: 'Select' },
      { id: 'rect', icon: '□', label: 'Rectangle' },
      { id: 'circle', icon: '○', label: 'Circle' },
      { id: 'text', icon: 'T', label: 'Text' },
      { id: 'pen', icon: '✎', label: 'Pen' },
    ];

    return (
      <WorkspaceLayout
        sidebar={
          <div className="space-y-6">
            {/* Tools */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Tools</h3>
              <div className="grid grid-cols-3 gap-1">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`
                      p-3 rounded-lg text-center transition-all
                      ${selectedTool === tool.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                    `}
                    title={tool.label}
                  >
                    <span className="text-lg">{tool.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layers */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Layers</h3>
              <div className="space-y-1">
                {['Frame 1', 'Rectangle', 'Text "Hello"', 'Circle'].map((layer, i) => (
                  <div
                    key={i}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                      ${i === 1 ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                    `}
                  >
                    <span className="text-gray-400">👁</span>
                    <span className="text-sm">{layer}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
        inspector={
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Properties</h3>
            
            <WorkspaceSection title="Position">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'X', value: '120' },
                  { label: 'Y', value: '80' },
                  { label: 'W', value: '200' },
                  { label: 'H', value: '100' },
                ].map((prop) => (
                  <div key={prop.label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{prop.label}</span>
                    <input
                      type="text"
                      value={prop.value}
                      className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-900"
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Fill">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 border" />
                <input
                  type="text"
                  value="#3B82F6"
                  className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-900"
                  readOnly
                />
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Stroke">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border-2 border-gray-300" />
                <input
                  type="text"
                  value="None"
                  className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-900"
                  readOnly
                />
              </div>
            </WorkspaceSection>
          </div>
        }
        header={
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white">Untitled Design</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                −
              </button>
              <span className="text-sm text-gray-500 w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                +
              </button>
            </div>
          </div>
        }
      >
        {/* Canvas */}
        <div className="h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
          <div
            className="bg-white shadow-xl rounded-lg"
            style={{ width: 400, height: 300, transform: `scale(${zoom / 100})` }}
          >
            {/* Design elements */}
            <div className="relative w-full h-full p-4">
              <div className="absolute top-8 left-8 w-48 h-24 bg-blue-500 rounded-lg border-2 border-blue-600 shadow" />
              <div className="absolute bottom-8 right-8 w-12 h-12 bg-green-500 rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-gray-800">
                Hello World
              </div>
            </div>
          </div>
        </div>
      </WorkspaceLayout>
    );
  },
};

// Content Management Layout
export const ContentManagementLayout: Story = {
  render: function CMS() {
    const [selectedItem, setSelectedItem] = useState('blog-post-1');

    const content = [
      { id: 'blog-post-1', title: 'Getting Started Guide', type: 'Blog Post', status: 'Published' },
      { id: 'blog-post-2', title: 'Advanced Tips', type: 'Blog Post', status: 'Draft' },
      { id: 'page-1', title: 'About Us', type: 'Page', status: 'Published' },
      { id: 'page-2', title: 'Contact', type: 'Page', status: 'Published' },
    ];

    return (
      <WorkspaceLayout
        sidebar={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Content</h3>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                + New
              </button>
            </div>
            
            <input
              type="search"
              placeholder="Search content..."
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            />

            <div className="space-y-1">
              {content.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all
                    ${selectedItem === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                >
                  <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{item.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'Published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        }
        inspector={
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Settings</h3>
            
            <WorkspaceSection title="Status">
              <select className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900">
                <option>Published</option>
                <option>Draft</option>
                <option>Scheduled</option>
              </select>
            </WorkspaceSection>

            <WorkspaceSection title="SEO">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Meta Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 mt-1"
                    placeholder="Enter meta title..."
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Meta Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 mt-1"
                    rows={3}
                    placeholder="Enter meta description..."
                  />
                </div>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Featured Image">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Click to upload</span>
              </div>
            </WorkspaceSection>
          </div>
        }
        header={
          <div className="flex items-center justify-between">
            <input
              type="text"
              defaultValue="Getting Started Guide"
              className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 -mx-2"
            />
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Preview
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Publish
              </button>
            </div>
          </div>
        }
      >
        {/* Rich text editor area */}
        <div className="h-full prose dark:prose-invert max-w-none">
          <p className="text-gray-500">Start writing your content here...</p>
          <p>
            Welcome to our getting started guide! This document will help you understand the basics of our platform.
          </p>
          <h2>Getting Started</h2>
          <p>
            First, you'll want to familiarize yourself with the main concepts...
          </p>
          <h2>Key Features</h2>
          <ul>
            <li>Easy-to-use interface</li>
            <li>Powerful customization options</li>
            <li>Built-in analytics</li>
          </ul>
        </div>
      </WorkspaceLayout>
    );
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

/**
 * LightDom Design System Styleguide
 * 
 * This story documents the UX/UI rules that govern all components, pages,
 * dashboards, and navigation elements in the LightDom platform.
 */

const StyleguideSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8 pb-8 border-b border-border last:border-b-0">
    <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
    {children}
  </section>
);

const TokenTable: React.FC<{ headers: string[]; rows: (string | React.ReactNode)[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-muted">
          {headers.map((header, i) => (
            <th key={i} className="text-left p-3 border border-border font-semibold">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-muted/50">
            {row.map((cell, j) => (
              <td key={j} className="p-3 border border-border">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CodeBlock: React.FC<{ children: string }> = ({ children }) => (
  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
    <code>{children}</code>
  </pre>
);

const Styleguide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-background text-foreground">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">LightDom Design System Styleguide</h1>
        <p className="text-lg text-muted-foreground">
          This styleguide defines the UX/UI rules that govern all components, pages, dashboards, 
          and navigation elements in the LightDom platform. Following these rules ensures 
          consistency across the entire application.
        </p>
      </header>

      <StyleguideSection title="🎨 Color System">
        <h3 className="text-lg font-semibold mb-3">Primary Palette</h3>
        <TokenTable
          headers={['Token', 'Usage']}
          rows={[
            ['--primary', 'Primary actions, links, focus states'],
            ['--primary-foreground', 'Text on primary backgrounds'],
            ['--secondary', 'Secondary actions, containers'],
            ['--accent', 'Accent highlights, interactive elements'],
          ]}
        />
        
        <h3 className="text-lg font-semibold mt-6 mb-3">Semantic Colors</h3>
        <TokenTable
          headers={['Token', 'Usage']}
          rows={[
            ['--destructive', 'Error states, delete actions'],
            ['--success', 'Success states, confirmations'],
            ['--warning', 'Warning states, cautions'],
            ['--muted', 'Disabled states, less emphasis'],
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 mb-3">Background Hierarchy</h3>
        <CodeBlock>{`--background: Primary page background
--card: Card and elevated surfaces
--popover: Overlay and modal backgrounds
--muted: Subtle backgrounds, disabled elements`}</CodeBlock>
      </StyleguideSection>

      <StyleguideSection title="📝 Typography">
        <h3 className="text-lg font-semibold mb-3">Font Stack</h3>
        <CodeBlock>{`--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'Fira Code', 'Monaco', 'Courier New', monospace`}</CodeBlock>

        <h3 className="text-lg font-semibold mt-6 mb-3">Type Scale</h3>
        <TokenTable
          headers={['Size', 'Rem', 'Px', 'Usage']}
          rows={[
            ['xs', '0.75rem', '12px', 'Labels, metadata'],
            ['sm', '0.875rem', '14px', 'Body text, descriptions'],
            ['base', '1rem', '16px', 'Default body text'],
            ['lg', '1.125rem', '18px', 'Emphasized content'],
            ['xl', '1.25rem', '20px', 'Section headers'],
            ['2xl', '1.5rem', '24px', 'Page headers'],
            ['3xl', '1.875rem', '30px', 'Major headings'],
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 mb-3">Font Weight Rules</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Regular (400)</strong>: Body text, descriptions</li>
          <li><strong>Medium (500)</strong>: Labels, buttons, navigation items</li>
          <li><strong>Semibold (600)</strong>: Section headers, emphasized text</li>
          <li><strong>Bold (700)</strong>: Page headers, major headings</li>
        </ul>
      </StyleguideSection>

      <StyleguideSection title="📏 Spacing">
        <p className="mb-4 text-muted-foreground">
          <strong>Base Grid: 8px</strong> - All spacing values should be multiples of 4px (0.25rem) or 8px (0.5rem).
        </p>
        <TokenTable
          headers={['Token', 'Value', 'Usage']}
          rows={[
            ['spacing-1', '4px', 'Tight gaps, icon margins'],
            ['spacing-2', '8px', 'Default gaps between elements'],
            ['spacing-3', '12px', 'Medium gaps'],
            ['spacing-4', '16px', 'Section padding, card margins'],
            ['spacing-6', '24px', 'Major section gaps'],
            ['spacing-8', '32px', 'Page section gaps'],
          ]}
        />
      </StyleguideSection>

      <StyleguideSection title="🔲 Border Radius">
        <TokenTable
          headers={['Token', 'Value', 'Usage']}
          rows={[
            ['radius-sm', '4px', 'Small buttons, badges'],
            ['radius-md', '8px', 'Default for inputs, cards'],
            ['radius-lg', '12px', 'Large cards, modals'],
            ['radius-xl', '16px', 'Hero sections'],
            ['radius-full', '9999px', 'Pills, avatars, toggles'],
          ]}
        />
      </StyleguideSection>

      <StyleguideSection title="🌑 Elevation & Shadows">
        <h3 className="text-lg font-semibold mb-3">Shadow Levels</h3>
        <TokenTable
          headers={['Level', 'Usage']}
          rows={[
            ['shadow-sm', 'Subtle elevation for cards'],
            ['shadow-md', 'Dropdown menus, popovers'],
            ['shadow-lg', 'Modals, dialogs'],
            ['shadow-xl', 'Maximum elevation'],
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 mb-3">Glow Effects (Exodus-inspired)</h3>
        <CodeBlock>{`/* Blue glow - primary actions */
box-shadow: 0 0 20px rgba(88, 101, 242, 0.4);

/* Purple glow - accent elements */
box-shadow: 0 0 20px rgba(124, 92, 255, 0.4);`}</CodeBlock>
      </StyleguideSection>

      <StyleguideSection title="⚡ Motion & Animation">
        <h3 className="text-lg font-semibold mb-3">Duration Scale</h3>
        <TokenTable
          headers={['Speed', 'Duration', 'Usage']}
          rows={[
            ['Fast', '150ms', 'Hover states, micro-interactions'],
            ['Normal', '250ms', 'Default transitions'],
            ['Slow', '350ms', 'Page transitions, modals'],
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 mb-3">Easing Functions</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>ease-out</strong>: Entrances</li>
          <li><strong>ease-in</strong>: Exits</li>
          <li><strong>ease-in-out</strong>: State changes, morphing</li>
          <li><strong>spring</strong>: Playful interactions</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">Accessibility</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Respect <code className="bg-muted px-1 rounded">prefers-reduced-motion</code></li>
          <li>Provide <code className="bg-muted px-1 rounded">--animation-duration</code> override via Storybook controls</li>
          <li>Ensure animations don't block user interaction</li>
        </ul>
      </StyleguideSection>

      <StyleguideSection title="🧩 Component Rules">
        <h3 className="text-lg font-semibold mb-3">Buttons</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li><strong>Primary</strong> buttons use gradient backgrounds with glow on hover</li>
          <li><strong>Secondary</strong> buttons have subtle borders and transparent backgrounds</li>
          <li>Minimum touch target: <strong>44x44px</strong></li>
          <li>Always include loading state for async actions</li>
        </ol>

        <h3 className="text-lg font-semibold mt-6 mb-3">Cards</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Use <code className="bg-muted px-1 rounded">border-border</code> for default borders</li>
          <li>Apply <code className="bg-muted px-1 rounded">hover:border-primary/60</code> for interactive cards</li>
          <li>Consistent padding: p-4 (small), p-6 (medium), p-8 (large)</li>
          <li>Cards in grids should have gap-4 or gap-6</li>
        </ol>

        <h3 className="text-lg font-semibold mt-6 mb-3">Inputs</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Height: 40px (medium), 32px (small), 48px (large)</li>
          <li>Border color changes on focus to --ring</li>
          <li>Error states use border-destructive</li>
          <li>Always include placeholder text</li>
        </ol>

        <h3 className="text-lg font-semibold mt-6 mb-3">Navigation</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Sidebar width: 280px expanded, 64px collapsed</li>
          <li>Active items use bg-primary/10 with border-primary</li>
          <li>Icons are 20x20px (w-5 h-5)</li>
          <li>Navigation labels should be concise (max 20 chars)</li>
        </ol>

        <h3 className="text-lg font-semibold mt-6 mb-3">Dashboards</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Use KPI cards for metrics (4-column grid on desktop)</li>
          <li>WorkflowPanel for structured sections</li>
          <li>Consistent header pattern: title + description + status</li>
          <li>Maximum 3-4 levels of visual hierarchy</li>
        </ol>
      </StyleguideSection>

      <StyleguideSection title="♿ Accessibility Requirements">
        <h3 className="text-lg font-semibold mb-3">Color Contrast</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>All text meets WCAG AA (4.5:1 ratio)</li>
          <li>Focus indicators are visible (2px outline)</li>
          <li>Don't rely on color alone for information</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">Keyboard Navigation</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>All interactive elements are focusable</li>
          <li>Logical tab order</li>
          <li>Escape key closes modals/dropdowns</li>
          <li>Arrow keys for lists and menus</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">Screen Readers</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Use semantic HTML elements</li>
          <li>Provide ARIA labels where needed</li>
          <li>Meaningful alt text for images</li>
          <li>Live regions for dynamic content</li>
        </ul>
      </StyleguideSection>

      <StyleguideSection title="📱 Responsive Design">
        <h3 className="text-lg font-semibold mb-3">Breakpoints</h3>
        <TokenTable
          headers={['Name', 'Min Width', 'Usage']}
          rows={[
            ['sm', '640px', 'Mobile landscape'],
            ['md', '768px', 'Tablet'],
            ['lg', '1024px', 'Desktop'],
            ['xl', '1280px', 'Large desktop'],
            ['2xl', '1536px', 'Ultra-wide'],
          ]}
        />

        <h3 className="text-lg font-semibold mt-6 mb-3">Best Practices</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Mobile-first approach</li>
          <li>Sidebar collapses on mobile</li>
          <li>Grid columns reduce on smaller screens</li>
          <li>Font size minimum 14px on mobile</li>
        </ol>
      </StyleguideSection>

      <StyleguideSection title="🎯 Do's and Don'ts">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
            <h3 className="text-lg font-semibold text-green-500 mb-3">✅ Do's</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use design tokens instead of hardcoded values</li>
              <li>Follow the 8px grid for spacing</li>
              <li>Apply consistent border radius</li>
              <li>Include focus states on all interactive elements</li>
              <li>Test with keyboard navigation</li>
            </ul>
          </div>
          <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-lg">
            <h3 className="text-lg font-semibold text-red-500 mb-3">❌ Don'ts</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Don't use text smaller than 12px</li>
              <li>Don't skip focus states</li>
              <li>Don't use colors outside the palette</li>
              <li>Don't override border radius arbitrarily</li>
              <li>Don't disable animations without accessibility reason</li>
            </ul>
          </div>
        </div>
      </StyleguideSection>

      <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
        <p><strong>Version</strong>: 1.0.0</p>
        <p><strong>Last Updated</strong>: 2025-12-01</p>
      </footer>
    </div>
  );
};

const meta = {
  title: 'Design System/Styleguide',
  component: Styleguide,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
This styleguide defines the UX/UI rules that govern all components, pages, dashboards, 
and navigation elements in the LightDom platform. Following these rules ensures 
consistency across the entire application.

## Key Principles

1. **8px Grid**: All spacing values are multiples of 4px or 8px
2. **Touch Targets**: Minimum 44x44px for interactive elements
3. **Color Contrast**: WCAG AA compliant (4.5:1 ratio)
4. **Motion**: Respects reduced motion preferences
5. **Consistency**: Same tokens used across all pages and dashboards
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Styleguide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

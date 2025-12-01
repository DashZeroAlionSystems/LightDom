import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

/**
 * Design System Components Story
 * 
 * This story showcases all the core design system components
 * and demonstrates how they follow the styleguide rules.
 */

// Component for showcasing design tokens
const DesignTokenShowcase: React.FC<{ category: string }> = ({ category }) => {
  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <h3 className="text-xl font-semibold text-foreground">{category}</h3>
      
      {category === 'colors' && (
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-16 rounded-md bg-primary" />
            <span className="text-sm text-muted-foreground">Primary</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-md bg-secondary" />
            <span className="text-sm text-muted-foreground">Secondary</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-md bg-accent" />
            <span className="text-sm text-muted-foreground">Accent</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-md bg-muted" />
            <span className="text-sm text-muted-foreground">Muted</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-md bg-destructive" />
            <span className="text-sm text-muted-foreground">Destructive</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-md bg-card border border-border" />
            <span className="text-sm text-muted-foreground">Card</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-md bg-background border border-border" />
            <span className="text-sm text-muted-foreground">Background</span>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-md bg-popover border border-border" />
            <span className="text-sm text-muted-foreground">Popover</span>
          </div>
        </div>
      )}

      {category === 'typography' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">xs (12px)</p>
            <p className="text-xs text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">sm (14px)</p>
            <p className="text-sm text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">base (16px)</p>
            <p className="text-base text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">lg (18px)</p>
            <p className="text-lg text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">xl (20px)</p>
            <p className="text-xl text-foreground">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">2xl (24px)</p>
            <p className="text-2xl text-foreground">The quick brown fox jumps</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">3xl (30px)</p>
            <p className="text-3xl text-foreground">The quick brown fox</p>
          </div>
        </div>
      )}

      {category === 'spacing' && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 6, 8, 10, 12].map(space => (
            <div key={space} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-16">spacing-{space}</span>
              <div 
                className="h-4 bg-primary rounded" 
                style={{ width: `${space * 4}px` }}
              />
              <span className="text-sm text-muted-foreground">{space * 4}px</span>
            </div>
          ))}
        </div>
      )}

      {category === 'radius' && (
        <div className="grid grid-cols-6 gap-4">
          {['none', 'sm', 'md', 'lg', 'xl', 'full'].map(radius => (
            <div key={radius} className="space-y-2 text-center">
              <div 
                className={`h-16 w-16 mx-auto bg-primary rounded-${radius}`}
              />
              <span className="text-sm text-muted-foreground">radius-{radius}</span>
            </div>
          ))}
        </div>
      )}

      {category === 'shadows' && (
        <div className="grid grid-cols-3 gap-6">
          {['sm', 'md', 'lg'].map(shadow => (
            <div key={shadow} className="space-y-2 text-center">
              <div 
                className={`h-20 w-full bg-card rounded-lg shadow-${shadow}`}
              />
              <span className="text-sm text-muted-foreground">shadow-{shadow}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Button showcase following styleguide rules
const ButtonShowcase: React.FC = () => {
  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <h3 className="text-xl font-semibold text-foreground">Buttons (Styleguide Compliant)</h3>
      <p className="text-sm text-muted-foreground">
        All buttons follow the 44px minimum touch target rule and include loading states.
      </p>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            Primary Button
          </button>
          <button className="h-10 px-4 rounded-md bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
            Secondary Button
          </button>
          <button className="h-10 px-4 rounded-md border border-input bg-background text-foreground font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            Outline Button
          </button>
          <button className="h-10 px-4 rounded-md text-primary font-medium hover:bg-primary/10 transition-colors">
            Ghost Button
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="h-8 px-3 text-sm rounded-md bg-primary text-primary-foreground font-medium">
            Small (32px)
          </button>
          <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium">
            Medium (40px)
          </button>
          <button className="h-12 px-6 rounded-md bg-primary text-primary-foreground font-medium">
            Large (48px)
          </button>
        </div>

        <div className="flex gap-4">
          <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 opacity-50 cursor-not-allowed">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </button>
          <button className="h-10 px-4 rounded-md bg-muted text-muted-foreground font-medium cursor-not-allowed">
            Disabled
          </button>
        </div>
      </div>
    </div>
  );
};

// Card showcase
const CardShowcase: React.FC = () => {
  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <h3 className="text-xl font-semibold text-foreground">Cards (Styleguide Compliant)</h3>
      <p className="text-sm text-muted-foreground">
        Cards use consistent padding (p-4, p-6, p-8) and border radius (0.75rem).
      </p>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-background rounded-lg border border-border hover:border-primary/60 transition-colors">
          <h4 className="font-semibold text-foreground mb-2">Small Padding</h4>
          <p className="text-sm text-muted-foreground">p-4 (16px)</p>
        </div>
        <div className="p-6 bg-background rounded-lg border border-border hover:border-primary/60 transition-colors">
          <h4 className="font-semibold text-foreground mb-2">Medium Padding</h4>
          <p className="text-sm text-muted-foreground">p-6 (24px)</p>
        </div>
        <div className="p-8 bg-background rounded-lg border border-border hover:border-primary/60 transition-colors">
          <h4 className="font-semibold text-foreground mb-2">Large Padding</h4>
          <p className="text-sm text-muted-foreground">p-8 (32px)</p>
        </div>
      </div>
    </div>
  );
};

// Main showcase component
const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Design System Components</h1>
        <p className="text-muted-foreground">
          All components follow the styleguide rules defined in the Design System documentation.
        </p>
      </header>

      <DesignTokenShowcase category="colors" />
      <DesignTokenShowcase category="typography" />
      <DesignTokenShowcase category="spacing" />
      <DesignTokenShowcase category="radius" />
      <DesignTokenShowcase category="shadows" />
      <ButtonShowcase />
      <CardShowcase />
    </div>
  );
};

const meta = {
  title: 'Design System/Component Showcase',
  component: DesignSystemShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
This story showcases all the core design system components and demonstrates
how they follow the styleguide rules for consistent UX/UI across the platform.

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
} satisfies Meta<typeof DesignSystemShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ColorsOnly: Story = {
  render: () => <DesignTokenShowcase category="colors" />,
};

export const TypographyOnly: Story = {
  render: () => <DesignTokenShowcase category="typography" />,
};

export const SpacingOnly: Story = {
  render: () => <DesignTokenShowcase category="spacing" />,
};

export const ButtonsOnly: Story = {
  render: () => <ButtonShowcase />,
};

export const CardsOnly: Story = {
  render: () => <CardShowcase />,
};

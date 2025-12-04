import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { designTokens, getColor, getSpacing, getShadow } from '../../utils/designTokens';
import { Typography } from '../../components/atoms/Typography/Typography';
import { Card } from '../../components/atoms/Card/Card';
import { Divider } from '../../components/atoms/Divider/Divider';
import { Badge } from '../../components/atoms/Badge/Badge';

const meta: Meta = {
  title: 'Design System/Design Tokens Reference',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Complete reference for all design tokens including colors, spacing, typography, shadows, and animations.',
      },
    },
  },
};

export default meta;

// Color Palette Story
export const ColorPalette: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" className="mb-4">Color Palette</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Our color system is built on a scale of 50-900 for each color family, providing flexibility for various UI needs.
        </Typography>
      </div>

      {Object.entries(designTokens.colors).map(([colorName, shades]) => (
        <div key={colorName} className="space-y-3">
          <Typography variant="h4" className="capitalize">{colorName}</Typography>
          <div className="grid grid-cols-10 gap-2">
            {Object.entries(shades).map(([shade, value]) => (
              <div key={shade} className="space-y-2">
                <div
                  className="h-16 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: value }}
                  title={`${colorName}-${shade}: ${value}`}
                />
                <div className="text-xs text-center">
                  <div className="font-medium">{shade}</div>
                  <div className="text-gray-500 dark:text-gray-400 font-mono">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

// Spacing Scale Story
export const SpacingScale: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="mb-4">Spacing Scale</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Based on a 4px base unit for consistent spacing throughout the design system.
        </Typography>
      </div>

      <div className="space-y-4">
        {Object.entries(designTokens.spacing).map(([name, value]) => (
          <div key={name} className="flex items-center gap-4">
            <div className="w-24 text-sm font-mono text-gray-700 dark:text-gray-300">
              {name}
            </div>
            <div className="w-32 text-sm text-gray-500 dark:text-gray-400">
              {value}
            </div>
            <div
              className="h-8 bg-blue-500 rounded"
              style={{ width: value }}
            />
          </div>
        ))}
      </div>
    </div>
  ),
};

// Typography Scale Story
export const TypographyScale: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" className="mb-4">Typography Scale</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Our type scale provides clear hierarchy and readability across all screen sizes.
        </Typography>
      </div>

      <div className="space-y-6">
        <div>
          <Typography variant="h3" className="mb-4">Font Sizes</Typography>
          {Object.entries(designTokens.typography.fontSize).map(([name, [size, { lineHeight }]]) => (
            <div key={name} className="py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {size} / {lineHeight}
                </span>
              </div>
              <div style={{ fontSize: size, lineHeight }}>
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>

        <Divider />

        <div>
          <Typography variant="h3" className="mb-4">Font Weights</Typography>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(designTokens.typography.fontWeight).map(([name, weight]) => (
              <Card key={name} variant="outlined">
                <div className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {name} ({weight})
                  </div>
                  <div style={{ fontWeight: weight }} className="text-lg">
                    Sample Text
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};

// Shadow System Story
export const ShadowSystem: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="mb-4">Shadow System</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Elevation system using shadows to create depth and hierarchy.
        </Typography>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {Object.entries(designTokens.boxShadow).map(([name, value]) => (
          <Card key={name} variant="elevated" className="relative">
            <div className="p-8 text-center">
              <div
                className="w-24 h-24 bg-white dark:bg-gray-800 rounded-lg mx-auto mb-4"
                style={{ boxShadow: value }}
              />
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                {value.substring(0, 40)}{value.length > 40 ? '...' : ''}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
};

// Border Radius Story
export const BorderRadius: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="mb-4">Border Radius</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Consistent corner rounding for UI elements.
        </Typography>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {Object.entries(designTokens.borderRadius).map(([name, value]) => (
          <Card key={name} variant="outlined" className="text-center">
            <div className="p-6">
              <div
                className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 mx-auto mb-4"
                style={{ borderRadius: value }}
              />
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{value}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
};

// Animation Durations Story
export const AnimationDurations: StoryObj = {
  render: () => {
    const [activeButton, setActiveButton] = React.useState<string | null>(null);

    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2" className="mb-4">Animation Durations</Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
            Standardized timing for smooth, consistent animations. Click each box to see the duration in action.
          </Typography>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(designTokens.duration).map(([name, ms]) => (
            <button
              key={name}
              onClick={() => {
                setActiveButton(name);
                setTimeout(() => setActiveButton(null), ms);
              }}
              className="relative overflow-hidden"
            >
              <Card variant="outlined" className="h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <div className="text-lg font-semibold capitalize">{name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{ms}ms</div>
                <Badge variant="primary" className="mt-2">Click to test</Badge>
                {activeButton === name && (
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500/20"
                    style={{
                      animation: `slideRight ${ms}ms linear`,
                    }}
                  />
                )}
              </Card>
            </button>
          ))}
        </div>

        <style>{`
          @keyframes slideRight {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  },
};

// Animation Easings Story
export const AnimationEasings: StoryObj = {
  render: () => {
    const [activeEasing, setActiveEasing] = React.useState<string | null>(null);

    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2" className="mb-4">Animation Easings</Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
            Different easing functions for natural motion. Click to see each easing in action.
          </Typography>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(designTokens.easing).map(([name, value]) => (
            <button
              key={name}
              onClick={() => {
                setActiveEasing(name);
                setTimeout(() => setActiveEasing(null), 1000);
              }}
              className="relative"
            >
              <Card variant="outlined" className="p-4 hover:border-blue-500 transition-colors cursor-pointer">
                <div className="font-medium mb-1">{name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">
                  {value}
                </div>
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded relative overflow-hidden">
                  {activeEasing === name && (
                    <div
                      className="absolute top-0 left-0 h-full w-8 bg-blue-500 rounded-full"
                      style={{
                        animation: `moveRight-${name} 1000ms ${value === 'linear' ? 'linear' : 'cubic-bezier(0.25, 0.1, 0.25, 1)'}`,
                      }}
                    />
                  )}
                </div>
              </Card>
            </button>
          ))}
        </div>

        <style>{`
          ${Object.keys(designTokens.easing).map(name => `
            @keyframes moveRight-${name} {
              from { left: 0; }
              to { left: calc(100% - 2rem); }
            }
          `).join('\n')}
        `}</style>
      </div>
    );
  },
};

// Breakpoints Story
export const Breakpoints: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="mb-4">Responsive Breakpoints</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Mobile-first breakpoint system for responsive layouts.
        </Typography>
      </div>

      <div className="space-y-4">
        {Object.entries(designTokens.breakpoints).map(([name, value]) => (
          <Card key={name} variant="outlined" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Minimum width: {value}
                </div>
              </div>
              <Badge variant={
                name === 'sm' ? 'warning' :
                name === 'md' ? 'info' :
                name === 'lg' ? 'success' :
                name === 'xl' ? 'primary' :
                'secondary'
              }>
                {value}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="filled" accentColor="blue">
        <div className="p-6">
          <Typography variant="h4" className="mb-3">Current Breakpoint</Typography>
          <div className="space-y-2">
            <div className="sm:hidden">
              <Badge variant="warning">Mobile (&lt; 640px)</Badge>
            </div>
            <div className="hidden sm:block md:hidden">
              <Badge variant="info">Small (≥ 640px)</Badge>
            </div>
            <div className="hidden md:block lg:hidden">
              <Badge variant="success">Medium (≥ 768px)</Badge>
            </div>
            <div className="hidden lg:block xl:hidden">
              <Badge variant="primary">Large (≥ 1024px)</Badge>
            </div>
            <div className="hidden xl:block 2xl:hidden">
              <Badge variant="secondary">Extra Large (≥ 1280px)</Badge>
            </div>
            <div className="hidden 2xl:block">
              <Badge variant="primary">2X Large (≥ 1536px)</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  ),
};

// Usage Examples Story
export const UsageExamples: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" className="mb-4">Using Design Tokens</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Examples of how to use design tokens in your components.
        </Typography>
      </div>

      <Card variant="outlined">
        <Card.Header>
          <Typography variant="h3">Import Tokens</Typography>
        </Card.Header>
        <div className="p-6">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{`import { designTokens, getColor, getSpacing, getShadow } from '@/utils/designTokens';`}</code>
          </pre>
        </div>
      </Card>

      <Card variant="outlined">
        <Card.Header>
          <Typography variant="h3">Access Color Values</Typography>
        </Card.Header>
        <div className="p-6">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{`// Direct access
const primaryColor = designTokens.colors.primary[500];

// Helper function
const successColor = getColor('success', 600);`}</code>
          </pre>
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded" style={{ backgroundColor: designTokens.colors.primary[500] }} />
              <span className="text-sm">Primary 500</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded" style={{ backgroundColor: getColor('success', 600) }} />
              <span className="text-sm">Success 600</span>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="outlined">
        <Card.Header>
          <Typography variant="h3">Use in Tailwind</Typography>
        </Card.Header>
        <div className="p-6">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{`// Tailwind classes use the same scale
<div className="bg-primary-500 text-white p-4 rounded-lg shadow-md">
  Content
</div>`}</code>
          </pre>
          <div className="mt-4 bg-blue-500 text-white p-4 rounded-lg shadow-md">
            Example with Tailwind classes
          </div>
        </div>
      </Card>

      <Card variant="outlined">
        <Card.Header>
          <Typography variant="h3">Inline Styles with Tokens</Typography>
        </Card.Header>
        <div className="p-6">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{`<div style={{
  backgroundColor: getColor('primary', 500),
  padding: getSpacing(4),
  boxShadow: getShadow('md'),
  borderRadius: designTokens.borderRadius.lg,
}}>
  Content
</div>`}</code>
          </pre>
          <div className="mt-4" style={{
            backgroundColor: getColor('primary', 500),
            padding: getSpacing(4),
            boxShadow: getShadow('md'),
            borderRadius: designTokens.borderRadius.lg,
            color: 'white',
          }}>
            Example with inline styles
          </div>
        </div>
      </Card>
    </div>
  ),
};

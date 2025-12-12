import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Divider as AntDivider } from 'antd';
import { Typography } from '../../components/atoms/Typography';
import { Card, CardContent } from '../../components/atoms/Card';

// =============================================================================
// Meta Configuration
// =============================================================================

const meta: Meta = {
  title: 'Design System/Design Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Design Tokens

Design tokens are the visual design atoms of the design system — specifically, 
they are named entities that store visual design attributes.

Tokens help maintain consistency across the design system and make it easier to 
update the visual language across all components.

## Token Categories

- **Colors**: Brand, semantic, and neutral colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Border Radius**: Corner rounding values
- **Shadows**: Elevation and depth
- **Breakpoints**: Responsive design points
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// =============================================================================
// Color Swatch Component
// =============================================================================

interface ColorSwatchProps {
  name: string;
  value: string;
  className?: string;
  textColor?: 'light' | 'dark';
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  name,
  value,
  className,
  textColor = 'dark',
}) => (
  <div className="flex flex-col">
    <div
      className={`w-full h-16 rounded-lg border shadow-sm ${className || ''}`}
      style={{ backgroundColor: className ? undefined : value }}
    />
    <Typography variant="caption" className="mt-2 font-medium">
      {name}
    </Typography>
    <Typography variant="caption" color="muted">
      {value}
    </Typography>
  </div>
);

// =============================================================================
// Color Stories
// =============================================================================

export const Colors: StoryObj = {
  name: 'Colors',
  render: () => (
    <div className="space-y-12 p-6">
      <div>
        <Typography variant="h4" className="mb-6">Brand Colors</Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <ColorSwatch name="Primary" value="hsl(221.2, 83.2%, 53.3%)" className="bg-primary" />
          <ColorSwatch name="Primary Light" value="hsl(221.2, 83.2%, 63.3%)" className="bg-primary/70" />
          <ColorSwatch name="Primary Dark" value="hsl(221.2, 83.2%, 43.3%)" className="bg-primary/90" />
          <ColorSwatch name="Secondary" value="hsl(210, 40%, 96%)" className="bg-secondary" />
          <ColorSwatch name="Accent" value="hsl(262.1, 83.3%, 57.8%)" className="bg-purple-500" />
        </div>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h4" className="mb-6">Semantic Colors</Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <ColorSwatch name="Success" value="hsl(142.1, 76.2%, 36.3%)" className="bg-green-500" />
          <ColorSwatch name="Warning" value="hsl(47.9, 95.8%, 53.1%)" className="bg-yellow-500" />
          <ColorSwatch name="Error" value="hsl(0, 84.2%, 60.2%)" className="bg-red-500" />
          <ColorSwatch name="Info" value="hsl(199.4, 95.5%, 53.8%)" className="bg-blue-500" />
        </div>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h4" className="mb-6">Neutral Colors</Typography>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
          <ColorSwatch name="Gray 50" value="#f9fafb" className="bg-gray-50" />
          <ColorSwatch name="Gray 100" value="#f3f4f6" className="bg-gray-100" />
          <ColorSwatch name="Gray 200" value="#e5e7eb" className="bg-gray-200" />
          <ColorSwatch name="Gray 300" value="#d1d5db" className="bg-gray-300" />
          <ColorSwatch name="Gray 400" value="#9ca3af" className="bg-gray-400" />
          <ColorSwatch name="Gray 500" value="#6b7280" className="bg-gray-500" />
          <ColorSwatch name="Gray 600" value="#4b5563" className="bg-gray-600" />
          <ColorSwatch name="Gray 700" value="#374151" className="bg-gray-700" />
          <ColorSwatch name="Gray 800" value="#1f2937" className="bg-gray-800" />
          <ColorSwatch name="Gray 900" value="#111827" className="bg-gray-900" />
        </div>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h4" className="mb-6">Background & Foreground</Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Background" value="hsl(0, 0%, 100%)" className="bg-background" />
          <ColorSwatch name="Foreground" value="hsl(222.2, 84%, 4.9%)" className="bg-foreground" />
          <ColorSwatch name="Muted" value="hsl(210, 40%, 96.1%)" className="bg-muted" />
          <ColorSwatch name="Muted FG" value="hsl(215.4, 16.3%, 46.9%)" className="bg-muted-foreground" />
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Typography Tokens
// =============================================================================

export const TypographyTokens: StoryObj = {
  name: 'Typography',
  render: () => (
    <div className="space-y-12 p-6">
      <div>
        <Typography variant="h4" className="mb-6">Font Family</Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="muted">Sans Serif</Typography>
              <p className="text-2xl font-sans mt-2">Inter, system-ui</p>
              <Typography variant="caption" color="muted" className="mt-2">
                Primary font for UI
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="muted">Monospace</Typography>
              <p className="text-2xl font-mono mt-2">JetBrains Mono</p>
              <Typography variant="caption" color="muted" className="mt-2">
                Code and technical text
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h4" className="mb-6">Font Sizes</Typography>
        <div className="space-y-4">
          {[
            { name: 'xs', size: '0.75rem', px: '12px' },
            { name: 'sm', size: '0.875rem', px: '14px' },
            { name: 'base', size: '1rem', px: '16px' },
            { name: 'lg', size: '1.125rem', px: '18px' },
            { name: 'xl', size: '1.25rem', px: '20px' },
            { name: '2xl', size: '1.5rem', px: '24px' },
            { name: '3xl', size: '1.875rem', px: '30px' },
            { name: '4xl', size: '2.25rem', px: '36px' },
            { name: '5xl', size: '3rem', px: '48px' },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-20">
                <Typography variant="caption" color="muted">{item.name}</Typography>
              </div>
              <div className="w-24">
                <Typography variant="caption" color="muted">{item.size}</Typography>
              </div>
              <p style={{ fontSize: item.size }} className="font-medium">
                The quick brown fox
              </p>
            </div>
          ))}
        </div>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h4" className="mb-6">Font Weights</Typography>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Light', weight: 300 },
            { name: 'Normal', weight: 400 },
            { name: 'Medium', weight: 500 },
            { name: 'Semibold', weight: 600 },
            { name: 'Bold', weight: 700 },
          ].map((item) => (
            <Card key={item.name} variant="outlined">
              <CardContent className="text-center">
                <p style={{ fontWeight: item.weight }} className="text-xl">
                  Aa
                </p>
                <Typography variant="caption" className="mt-2">
                  {item.name}
                </Typography>
                <Typography variant="caption" color="muted">
                  {item.weight}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Spacing Tokens
// =============================================================================

export const SpacingTokens: StoryObj = {
  name: 'Spacing',
  render: () => (
    <div className="space-y-12 p-6">
      <div>
        <Typography variant="h4" className="mb-6">Spacing Scale</Typography>
        <div className="space-y-3">
          {[
            { name: '0.5', rem: '0.125rem', px: '2px' },
            { name: '1', rem: '0.25rem', px: '4px' },
            { name: '1.5', rem: '0.375rem', px: '6px' },
            { name: '2', rem: '0.5rem', px: '8px' },
            { name: '2.5', rem: '0.625rem', px: '10px' },
            { name: '3', rem: '0.75rem', px: '12px' },
            { name: '4', rem: '1rem', px: '16px' },
            { name: '5', rem: '1.25rem', px: '20px' },
            { name: '6', rem: '1.5rem', px: '24px' },
            { name: '8', rem: '2rem', px: '32px' },
            { name: '10', rem: '2.5rem', px: '40px' },
            { name: '12', rem: '3rem', px: '48px' },
            { name: '16', rem: '4rem', px: '64px' },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-12">
                <Typography variant="caption" className="font-mono">
                  {item.name}
                </Typography>
              </div>
              <div className="w-24">
                <Typography variant="caption" color="muted">
                  {item.px}
                </Typography>
              </div>
              <div
                className="h-4 bg-primary rounded"
                style={{ width: item.px }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Border Radius Tokens
// =============================================================================

export const BorderRadiusTokens: StoryObj = {
  name: 'Border Radius',
  render: () => (
    <div className="space-y-12 p-6">
      <div>
        <Typography variant="h4" className="mb-6">Border Radius Scale</Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {[
            { name: 'none', value: '0px', class: 'rounded-none' },
            { name: 'sm', value: '2px', class: 'rounded-sm' },
            { name: 'default', value: '4px', class: 'rounded' },
            { name: 'md', value: '6px', class: 'rounded-md' },
            { name: 'lg', value: '8px', class: 'rounded-lg' },
            { name: 'xl', value: '12px', class: 'rounded-xl' },
            { name: 'full', value: '9999px', class: 'rounded-full' },
          ].map((item) => (
            <div key={item.name} className="text-center">
              <div
                className={`w-20 h-20 bg-primary mx-auto ${item.class}`}
              />
              <Typography variant="caption" className="mt-2 font-medium">
                {item.name}
              </Typography>
              <Typography variant="caption" color="muted">
                {item.value}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Shadow Tokens
// =============================================================================

export const ShadowTokens: StoryObj = {
  name: 'Shadows',
  render: () => (
    <div className="space-y-12 p-6">
      <div>
        <Typography variant="h4" className="mb-6">Shadow Scale</Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {[
            { name: 'sm', class: 'shadow-sm' },
            { name: 'default', class: 'shadow' },
            { name: 'md', class: 'shadow-md' },
            { name: 'lg', class: 'shadow-lg' },
            { name: 'xl', class: 'shadow-xl' },
            { name: '2xl', class: 'shadow-2xl' },
          ].map((item) => (
            <div key={item.name} className="text-center">
              <div
                className={`w-24 h-24 bg-background rounded-lg mx-auto ${item.class}`}
              />
              <Typography variant="caption" className="mt-3 font-medium">
                shadow-{item.name}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// Breakpoint Tokens
// =============================================================================

export const BreakpointTokens: StoryObj = {
  name: 'Breakpoints',
  render: () => (
    <div className="space-y-12 p-6">
      <div>
        <Typography variant="h4" className="mb-6">Responsive Breakpoints</Typography>
        <div className="space-y-4">
          {[
            { name: 'sm', value: '640px', desc: 'Mobile landscape' },
            { name: 'md', value: '768px', desc: 'Tablet portrait' },
            { name: 'lg', value: '1024px', desc: 'Tablet landscape / Small desktop' },
            { name: 'xl', value: '1280px', desc: 'Desktop' },
            { name: '2xl', value: '1536px', desc: 'Large desktop' },
          ].map((item) => (
            <Card key={item.name} variant="outlined">
              <CardContent className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle1" className="font-mono">
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    {item.desc}
                  </Typography>
                </div>
                <Typography variant="subtitle2" className="font-mono">
                  ≥ {item.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AntDivider />

      <div>
        <Typography variant="h4" className="mb-4">Usage Example</Typography>
        <Card variant="filled" className="font-mono text-sm">
          <CardContent>
            <pre className="whitespace-pre-wrap">
{`// Tailwind responsive classes
<div className="
  w-full          // Mobile first (default)
  sm:w-1/2        // >= 640px
  md:w-1/3        // >= 768px
  lg:w-1/4        // >= 1024px
  xl:w-1/5        // >= 1280px
  2xl:w-1/6       // >= 1536px
">
  Responsive element
</div>`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

// =============================================================================
// All Tokens Overview
// =============================================================================

export const AllTokens: StoryObj = {
  name: 'Overview',
  render: () => (
    <div className="space-y-12 p-6">
      <div className="text-center">
        <Typography variant="h2">Design Tokens</Typography>
        <Typography variant="lead" color="muted">
          Visual design atoms for consistent styling
        </Typography>
      </div>

      {/* Quick Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card variant="outlined" className="text-center">
          <CardContent>
            <div className="w-8 h-8 rounded bg-primary mx-auto" />
            <Typography variant="caption" className="mt-2">Colors</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" className="text-center">
          <CardContent>
            <Typography variant="h4" className="mb-0">Aa</Typography>
            <Typography variant="caption" className="mt-2">Typography</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" className="text-center">
          <CardContent>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-8 bg-gray-300 rounded" />
              <div className="w-4 h-8 bg-gray-300 rounded" />
              <div className="w-6 h-8 bg-gray-300 rounded" />
            </div>
            <Typography variant="caption" className="mt-2">Spacing</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" className="text-center">
          <CardContent>
            <div className="flex justify-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-none" />
              <div className="w-6 h-6 bg-gray-300 rounded-lg" />
              <div className="w-6 h-6 bg-gray-300 rounded-full" />
            </div>
            <Typography variant="caption" className="mt-2">Radius</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" className="text-center">
          <CardContent>
            <div className="w-8 h-8 bg-background shadow-lg rounded mx-auto" />
            <Typography variant="caption" className="mt-2">Shadows</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" className="text-center">
          <CardContent>
            <div className="flex justify-center items-center gap-1">
              <div className="w-2 h-4 bg-gray-300 rounded" />
              <div className="w-4 h-4 bg-gray-400 rounded" />
              <div className="w-6 h-4 bg-gray-500 rounded" />
            </div>
            <Typography variant="caption" className="mt-2">Breakpoints</Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

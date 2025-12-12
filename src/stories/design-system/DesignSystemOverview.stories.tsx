import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Typography } from '../../components/atoms/Typography/Typography';
import { Card } from '../../components/atoms/Card/Card';
import { Badge } from '../../components/atoms/Badge';
import { Divider } from '../../components/atoms/Divider/Divider';

const meta: Meta = {
  title: 'Design System/Overview',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Complete overview of the LightDom Design System built with Atomic Design principles and anime.js animations.',
      },
    },
  },
};

export default meta;

export const Introduction: StoryObj = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <Typography variant="h1" className="mb-4">LightDom Design System</Typography>
        <Typography variant="lead" className="text-gray-600 dark:text-gray-400">
          A comprehensive UI component library built with React, TypeScript, Tailwind CSS, and anime.js animations following Atomic Design principles.
        </Typography>
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated" accentColor="blue">
          <Card.Header>
            <Typography variant="h3">🎨 Design Philosophy</Typography>
          </Card.Header>
          <div className="p-6">
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• <strong>Atomic Design</strong>: Hierarchical component structure</li>
              <li>• <strong>Accessibility First</strong>: WCAG 2.1 AA compliant</li>
              <li>• <strong>Type Safe</strong>: Full TypeScript support</li>
              <li>• <strong>Customizable</strong>: Extensive variant system</li>
              <li>• <strong>Animated</strong>: Smooth anime.js transitions</li>
            </ul>
          </div>
        </Card>

        <Card variant="elevated" accentColor="purple">
          <Card.Header>
            <Typography variant="h3">⚡ Key Features</Typography>
          </Card.Header>
          <div className="p-6">
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• 31+ reusable components</li>
              <li>• 30+ animation patterns</li>
              <li>• 6 custom React hooks</li>
              <li>• 3 interactive animation controllers</li>
              <li>• Complete Storybook documentation</li>
            </ul>
          </div>
        </Card>
      </div>

      <Divider />

      <div>
        <Typography variant="h2" className="mb-4">Component Hierarchy</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Our design system follows Atomic Design methodology, organizing components into four levels:
        </Typography>

        <div className="space-y-6">
          <Card variant="outlined">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="primary">12 Components</Badge>
                <Typography variant="h3">Atoms</Typography>
              </div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3">
                Foundation building blocks - the smallest functional components
              </Typography>
              <div className="flex flex-wrap gap-2">
                {['Typography', 'Button', 'Input', 'Checkbox', 'Toggle', 'Avatar', 'Badge', 'Spinner', 'Tooltip', 'Card', 'Divider', 'Icon'].map(name => (
                  <Badge key={name} variant="secondary">{name}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card variant="outlined">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="success">13 Components</Badge>
                <Typography variant="h3">Molecules</Typography>
              </div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3">
                Simple compositions of atoms working together
              </Typography>
              <div className="flex flex-wrap gap-2">
                {['SearchInput', 'FormGroup', 'ButtonGroup', 'AlertBanner', 'Breadcrumb', 'Select', 'DropdownMenu', 'Modal', 'Tabs', 'Accordion', 'ProgressBar', 'Pagination', 'EmptyState'].map(name => (
                  <Badge key={name} variant="secondary">{name}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card variant="outlined">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="warning">6 Components</Badge>
                <Typography variant="h3">Organisms</Typography>
              </div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3">
                Complex UI patterns combining molecules and atoms
              </Typography>
              <div className="flex flex-wrap gap-2">
                {['Header', 'Sidebar', 'DataTable', 'Form', 'UserProfile', 'NotificationCenter'].map(name => (
                  <Badge key={name} variant="secondary">{name}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card variant="outlined">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="error">3 Components</Badge>
                <Typography variant="h3">Templates</Typography>
              </div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3">
                Page-level layouts combining organisms
              </Typography>
              <div className="flex flex-wrap gap-2">
                {['DashboardTemplate', 'LandingTemplate', 'AuthTemplate'].map(name => (
                  <Badge key={name} variant="secondary">{name}</Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Divider />

      <div>
        <Typography variant="h2" className="mb-4">Animation System</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Powered by anime.js v4 with reusable utilities and React hooks
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="filled">
            <Card.Header>
              <Typography variant="h4">Animation Utilities</Typography>
            </Card.Header>
            <div className="p-6">
              <ul className="space-y-2 text-sm">
                <li>• Button animations (hover, press, ripple, loading)</li>
                <li>• Input animations (focus, blur, error shake)</li>
                <li>• Card animations (hover, select)</li>
                <li>• List animations (staggered entrance)</li>
                <li>• Modal/Toast animations</li>
                <li>• Tab panel transitions</li>
              </ul>
            </div>
          </Card>

          <Card variant="filled">
            <Card.Header>
              <Typography variant="h4">React Hooks</Typography>
            </Card.Header>
            <div className="p-6">
              <ul className="space-y-2 text-sm">
                <li>• <code>useAnimatedButton</code></li>
                <li>• <code>useAnimatedInput</code></li>
                <li>• <code>useAnimatedCard</code></li>
                <li>• <code>useAnimatedList</code></li>
                <li>• <code>useAnimatedMount</code></li>
                <li>• <code>useReducedMotion</code></li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      <Divider />

      <div>
        <Typography variant="h2" className="mb-4">Animation Controllers</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Interactive animation playground components inspired by animejs.com
        </Typography>

        <div className="space-y-4">
          <Card variant="outlined">
            <div className="p-6">
              <Typography variant="h4" className="mb-2">AnimationController</Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Full animation player with timeline, playback controls, easing visualizer (23 options), property inspector, and property sliders
              </Typography>
            </div>
          </Card>

          <Card variant="outlined">
            <div className="p-6">
              <Typography variant="h4" className="mb-2">StaggerDemo</Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Interactive stagger animation demo with configurable delay, direction, and origin
              </Typography>
            </div>
          </Card>

          <Card variant="outlined">
            <div className="p-6">
              <Typography variant="h4" className="mb-2">TimelineBuilder</Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Multi-element timeline with synchronized animations and visual preview
              </Typography>
            </div>
          </Card>
        </div>
      </div>

      <Divider />

      <div>
        <Typography variant="h2" className="mb-4">Tech Stack</Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="elevated">
            <div className="p-4 text-center">
              <Typography variant="h4" className="mb-2">React 18</Typography>
              <Typography variant="caption" className="text-gray-600">UI Framework</Typography>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="p-4 text-center">
              <Typography variant="h4" className="mb-2">TypeScript</Typography>
              <Typography variant="caption" className="text-gray-600">Type Safety</Typography>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="p-4 text-center">
              <Typography variant="h4" className="mb-2">Tailwind CSS</Typography>
              <Typography variant="caption" className="text-gray-600">Styling</Typography>
            </div>
          </Card>
          <Card variant="elevated">
            <div className="p-4 text-center">
              <Typography variant="h4" className="mb-2">anime.js v4</Typography>
              <Typography variant="caption" className="text-gray-600">Animations</Typography>
            </div>
          </Card>
        </div>
      </div>

      <Divider />

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center">
        <Typography variant="h3" className="mb-3">Ready to Build?</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Explore our component library and start creating beautiful UIs
        </Typography>
        <div className="flex gap-4 justify-center flex-wrap">
          <Badge variant="primary" className="text-sm px-4 py-2">View Components →</Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">Animation Examples →</Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">Templates →</Badge>
        </div>
      </div>
    </div>
  ),
};

export const GettingStarted: StoryObj = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <Typography variant="h1" className="mb-4">Getting Started</Typography>
        <Typography variant="lead" className="text-gray-600 dark:text-gray-400">
          Quick guide to using the LightDom Design System in your project
        </Typography>
      </div>

      <Divider />

      <div>
        <Typography variant="h2" className="mb-4">Installation</Typography>
        <Card variant="outlined">
          <div className="p-6">
            <Typography variant="code" className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              npm install @lightdom/design-system
            </Typography>
          </div>
        </Card>
      </div>

      <div>
        <Typography variant="h2" className="mb-4">Basic Usage</Typography>
        <Card variant="outlined">
          <div className="p-6 space-y-4">
            <Typography variant="h4">Import Components</Typography>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code>{`import { Button, Card, Typography } from '@lightdom/design-system';

function App() {
  return (
    <Card variant="elevated">
      <Card.Header>
        <Typography variant="h2">Welcome</Typography>
      </Card.Header>
      <div className="p-6">
        <Typography variant="body1">
          Get started with our design system
        </Typography>
        <Button variant="primary" size="large">
          Learn More
        </Button>
      </div>
    </Card>
  );
}`}</code>
            </pre>
          </div>
        </Card>
      </div>

      <div>
        <Typography variant="h2" className="mb-4">Using Animations</Typography>
        <Card variant="outlined">
          <div className="p-6 space-y-4">
            <Typography variant="h4">Animation Utilities</Typography>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code>{`import { animateButton, animateInput } from '@lightdom/design-system/animations';

// Animate button on click
const handleClick = (e) => {
  animateButton.press(e.currentTarget);
};

// Animate input on focus
const handleFocus = (e) => {
  animateInput.focus(e.currentTarget);
};`}</code>
            </pre>

            <Typography variant="h4" className="mt-6">Animation Hooks</Typography>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code>{`import { useAnimatedButton, useAnimatedInput } from '@lightdom/design-system/hooks';

function MyComponent() {
  const buttonRef = useAnimatedButton();
  const inputRef = useAnimatedInput();

  return (
    <>
      <button ref={buttonRef}>Animated Button</button>
      <input ref={inputRef} placeholder="Animated Input" />
    </>
  );
}`}</code>
            </pre>
          </div>
        </Card>
      </div>

      <div>
        <Typography variant="h2" className="mb-4">Customization</Typography>
        <Card variant="outlined">
          <div className="p-6 space-y-4">
            <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-4">
              All components support custom className and style props for full customization:
            </Typography>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code>{`<Button 
  variant="primary"
  size="large"
  className="custom-class"
  style={{ borderRadius: '20px' }}
>
  Custom Button
</Button>`}</code>
            </pre>
          </div>
        </Card>
      </div>

      <div>
        <Typography variant="h2" className="mb-4">Best Practices</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="filled">
            <div className="p-6">
              <Typography variant="h4" className="mb-3 text-green-600">✓ Do</Typography>
              <ul className="space-y-2 text-sm">
                <li>• Use semantic HTML elements</li>
                <li>• Follow accessibility guidelines</li>
                <li>• Use variants for styling</li>
                <li>• Compose components together</li>
                <li>• Use animation hooks</li>
              </ul>
            </div>
          </Card>

          <Card variant="filled">
            <div className="p-6">
              <Typography variant="h4" className="mb-3 text-red-600">✗ Don't</Typography>
              <ul className="space-y-2 text-sm">
                <li>• Override internal styles directly</li>
                <li>• Skip accessibility attributes</li>
                <li>• Create custom components unnecessarily</li>
                <li>• Ignore responsive design</li>
                <li>• Disable animations without reason</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  ),
};

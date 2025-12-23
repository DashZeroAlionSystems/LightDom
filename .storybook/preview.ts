import type { Preview } from '@storybook/react-vite'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
// Import both the main src and frontend CSS for unified styling
import '../src/index.css'
import '../frontend/src/index.css'

/**
 * Storybook Preview Configuration
 * 
 * Enhanced with Material Design 3 theming and animation support
 * Supports component generation from user stories
 * 
 * This preview configuration ensures:
 * 1. Design system tokens are available across all stories
 * 2. Frontend and main src stories share the same styling context
 * 3. UX/UI rules from the styleguide are enforced consistently
 */

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
      expanded: true, // Expand controls by default
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0A0E27',
        },
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'material-dark',
          value: '#1E1E1E',
        },
        {
          name: 'material-light',
          value: '#FAFAFA',
        },
      ],
    },
    layout: 'centered',
    actions: { argTypesRegex: '^on[A-Z].*' },
    docs: {
      toc: true, // Enable table of contents
    },
    // Material Design 3 viewport presets
    viewport: {
      viewports: {
        compact: {
          name: 'Compact (Mobile)',
          styles: { width: '360px', height: '640px' },
          type: 'mobile',
        },
        medium: {
          name: 'Medium (Tablet)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        expanded: {
          name: 'Expanded (Desktop)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'material-light', title: 'Material Light' },
          { value: 'material-dark', title: 'Material Dark' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'es', title: 'Español' },
          { value: 'fr', title: 'Français' },
        ],
        showName: true,
      },
    },
    // Material Design 3 motion preferences
    motion: {
      description: 'Animation preferences',
      defaultValue: 'full',
      toolbar: {
        icon: 'lightning',
        items: [
          { value: 'full', title: 'Full Animations' },
          { value: 'reduced', title: 'Reduced Motion' },
          { value: 'none', title: 'No Animations' },
        ],
        dynamicTitle: true,
      },
    },
  },
  // Apply global decorators
  decorators: [
    (Story, context) => {
      // Apply motion preference globally so demos honour accessibility settings.
      const motionPreference = context.globals.motion;
      if (motionPreference === 'reduced' || motionPreference === 'none') {
        document.documentElement.style.setProperty(
          '--animation-duration',
          motionPreference === 'none' ? '0s' : '0.1s'
        );
      } else {
        document.documentElement.style.removeProperty('--animation-duration');
      }

      return createElement(MemoryRouter, null, createElement(Story));
    },
  ],
};

export default preview;
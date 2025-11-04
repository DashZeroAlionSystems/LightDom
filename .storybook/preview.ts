import type { Preview } from '@storybook/react-vite'
import '../src/discord-theme.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
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
      ],
    },
    docs: {
      theme: {
        base: 'dark',
        brandTitle: 'LightDom Design System',
        brandUrl: 'https://lightdom.app',
      },
    },
    layout: 'centered',
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
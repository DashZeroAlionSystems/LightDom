import type { Preview } from '@storybook/react-vite'
import { create } from '@storybook/theming';
import '../src/discord-theme.css'

// Create custom dark theme for LightDom
const lightDomTheme = create({
  base: 'dark',
  
  // Brand
  brandTitle: 'LightDom Design System',
  brandUrl: 'https://lightdom.app',
  brandImage: undefined,
  brandTarget: '_self',
  
  // UI colors
  colorPrimary: '#5865F2',
  colorSecondary: '#7C5CFF',
  
  // UI
  appBg: '#0A0E27',
  appContentBg: '#151A31',
  appBorderColor: '#2E3349',
  appBorderRadius: 8,
  
  // Text colors
  textColor: '#FFFFFF',
  textInverseColor: '#0A0E27',
  textMutedColor: '#B9BBBE',
  
  // Toolbar
  barTextColor: '#B9BBBE',
  barSelectedColor: '#5865F2',
  barBg: '#151A31',
  
  // Form colors
  inputBg: '#1E2438',
  inputBorder: '#2E3349',
  inputTextColor: '#FFFFFF',
  inputBorderRadius: 6,
});

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
      theme: lightDomTheme,
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
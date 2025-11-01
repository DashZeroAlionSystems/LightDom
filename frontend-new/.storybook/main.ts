import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Merge custom configuration
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': path.resolve(__dirname, '../src'),
          '@/app': path.resolve(__dirname, '../src/app'),
          '@/features': path.resolve(__dirname, '../src/features'),
          '@/shared': path.resolve(__dirname, '../src/shared'),
          '@/styles': path.resolve(__dirname, '../src/styles'),
          '@/config': path.resolve(__dirname, '../src/config'),
          '@/assets': path.resolve(__dirname, '../src/assets'),
        },
      },
    };
  },
};

export default config;

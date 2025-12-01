import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    // Main src stories
    '../src/stories/**/*.mdx',
    '../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // Frontend stories - unified under the same Storybook
    '../frontend/src/stories/**/*.mdx',
    '../frontend/src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // Generated components
    '../generated-components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-onboarding'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    // Add frontend path aliases so stories can resolve @/ imports
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../frontend/src'),
      '@/components': path.resolve(__dirname, '../frontend/src/components'),
      '@/pages': path.resolve(__dirname, '../frontend/src/pages'),
      '@/hooks': path.resolve(__dirname, '../frontend/src/hooks'),
      '@/utils': path.resolve(__dirname, '../frontend/src/utils'),
      '@/services': path.resolve(__dirname, '../frontend/src/services'),
      '@/config': path.resolve(__dirname, '../frontend/src/config'),
      '@/lib': path.resolve(__dirname, '../frontend/src/lib'),
      '@/design-system': path.resolve(__dirname, '../src/design-system'),
      '@/stories': path.resolve(__dirname, '../src/stories'),
    };
    return config;
  },
};
export default config;

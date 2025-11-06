/**
 * SDK Build Configuration (Rollup)
 * 
 * Bundles the LightDom SEO SDK into a production-ready package
 * - Minification and tree-shaking
 * - TypeScript compilation
 * - Multiple output formats (UMD, ESM)
 * - Source maps for debugging
 * - Bundle size optimization (<20KB target)
 */

import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import filesize from 'rollup-plugin-filesize';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  input: 'src/sdk/lightdom-seo-enhanced.ts',
  output: [
    {
      file: 'dist/sdk/lightdom-seo.js',
      format: 'umd',
      name: 'LightDomSEO',
      sourcemap: true,
    },
    {
      file: 'dist/sdk/lightdom-seo.min.js',
      format: 'umd',
      name: 'LightDomSEO',
      sourcemap: true,
      plugins: [
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.debug'],
            passes: 2,
          },
          mangle: {
            properties: {
              regex: /^_/,
            },
          },
          format: {
            comments: false,
          },
        }),
      ],
    },
    {
      file: 'dist/sdk/lightdom-seo.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './src/sdk/tsconfig.json',
      declaration: true,
      declarationDir: './dist/sdk/types',
      sourceMap: true,
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
    }),
    filesize({
      showMinifiedSize: true,
      showGzippedSize: true,
      showBrotliSize: false,
    }),
    visualizer({
      filename: 'dist/sdk/bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: false,
    }),
  ],
  external: [],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    annotations: true,
  },
});

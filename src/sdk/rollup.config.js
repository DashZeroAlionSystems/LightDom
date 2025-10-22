/**
 * Rollup configuration for LightDom SEO SDK
 * Builds the injectable JavaScript from TypeScript source
 */

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

const production = process.env.NODE_ENV === 'production';

export default {
  input: 'src/sdk/lightdom-seo.ts',
  output: [
    {
      file: 'dist/sdk/lightdom-seo.js',
      format: 'iife',
      name: 'LightDomSEO',
      sourcemap: !production
    },
    {
      file: 'dist/sdk/lightdom-seo.min.js',
      format: 'iife',
      name: 'LightDomSEO',
      plugins: [terser({
        compress: {
          drop_console: production,
          drop_debugger: production,
          pure_funcs: production ? ['console.log', 'console.debug'] : []
        },
        mangle: {
          properties: {
            regex: /^_/ // Mangle private properties starting with _
          }
        }
      })],
      sourcemap: false
    },
    {
      file: 'dist/sdk/lightdom-seo.esm.js',
      format: 'es',
      sourcemap: !production
    }
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './src/sdk/tsconfig.json',
      declaration: false,
      sourceMap: !production
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: [
              'last 2 versions',
              'ie >= 11',
              'safari >= 10',
              'ios >= 10'
            ]
          },
          modules: false
        }]
      ],
      extensions: ['.js', '.ts']
    })
  ],
  external: [],
  watch: {
    include: 'src/sdk/**',
    clearScreen: false
  }
};

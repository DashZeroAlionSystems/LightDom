module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:security/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'security',
  ],
  rules: {
    // ===== DeepSeek Optimization Rules =====
    // These rules are optimized for AI-assisted coding and DeepSeek understanding
    
    // TypeScript - Relaxed for AI code generation
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_|^unused',
      caughtErrorsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'warn', // Allow 'any' during rapid prototyping
    '@typescript-eslint/explicit-function-return-type': 'off', // AI can infer types
    '@typescript-eslint/no-non-null-assertion': 'warn', // Allow with caution
    '@typescript-eslint/prefer-const': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/ban-ts-comment': ['warn', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': 'allow-with-description',
      'ts-nocheck': 'allow-with-description',
      'ts-check': false,
      minimumDescriptionLength: 10,
    }],

    // React - Optimized for modern React and AI generation
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/display-name': 'off', // Allow anonymous components
    'react/jsx-key': 'error', // Important for list rendering
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': 'warn',
    'react/no-children-prop': 'warn',
    'react/no-unescaped-entities': 'warn',

    // Code Quality - Balanced for AI assistance
    'no-console': 'off', // Allow console for debugging during development
    'no-debugger': 'warn', // Warn instead of error
    'no-unused-vars': 'off', // Handled by TypeScript version
    'prefer-const': 'warn',
    'no-var': 'error', // Always use const/let
    'no-duplicate-imports': 'error',
    'no-useless-return': 'warn',
    'no-useless-escape': 'warn',
    'no-empty': 'warn',
    'no-constant-condition': 'warn',

    // Security - Critical rules only
    'security/detect-object-injection': 'off', // Too many false positives
    'security/detect-non-literal-regexp': 'off', // Allow dynamic regex
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'warn',
    'security/detect-non-literal-fs-filename': 'off', // Too restrictive for file operations
    'security/detect-non-literal-require': 'off', // Allow dynamic requires
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',

    // Complexity - Relaxed for complex AI-generated logic
    'complexity': ['warn', 20], // Increased from 10
    'max-depth': ['warn', 6], // Increased from 4
    'max-lines': ['warn', 500], // Increased from 300
    'max-params': ['warn', 6], // Increased from 4
    'max-statements': ['warn', 40], // Increased from 20
    'no-magic-numbers': 'off', // Too restrictive for AI code

    // Formatting - Auto-fixable
    'no-multiple-empty-lines': ['warn', { max: 2 }],
    'no-trailing-spaces': 'warn',
    'eol-last': 'warn',
    'comma-dangle': ['warn', 'always-multiline'],
    'semi': ['warn', 'always'],
    'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'indent': 'off', // Let prettier handle this

    // AI-Friendly Rules
    'no-undef': 'warn', // Warn instead of error for globals
    'no-prototype-builtins': 'off', // Allow prototype methods
    'prefer-spread': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-template': 'off', // Allow string concatenation
    'prefer-arrow-callback': 'off', // Allow both styles
    'func-style': 'off', // Allow any function style
    'max-len': 'off', // No line length restriction
    'no-nested-ternary': 'off', // Allow nested ternary
    'no-plusplus': 'off', // Allow ++ and --
    'no-continue': 'off', // Allow continue in loops
    'no-await-in-loop': 'off', // Allow await in loops when needed
    'no-restricted-syntax': 'off', // Don't restrict syntax
    'consistent-return': 'off', // Allow different return patterns
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-magic-numbers': 'off',
        'max-lines': 'off',
        'max-statements': 'off',
      },
    },
    {
      files: ['scripts/**/*.js', 'scripts/**/*.ts', '**/*.cjs', '**/*.mjs'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: ['*.config.js', '*.config.ts', '*.config.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
    'public/',
    '.next/',
    'out/',
    'generated-components/',
    'storybook-static/',
    '.storybook-cache/',
  ],
};

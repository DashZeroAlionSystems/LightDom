#!/usr/bin/env node

/**
 * Component Generator - LightDom Design System
 * Generates new Material Design 3 components following established patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const componentTemplate = (name, hasVariants = true) => `/**
 * ${name} Component - Material Design 3
 * ${name.toLowerCase()} component following Material Design 3 principles
 */

import React from 'react';
${hasVariants ? `import { cva, type VariantProps } from 'class-variance-authority';` : ''}
import { cn } from '../../lib/utils';

${hasVariants ? `const ${name.toLowerCase()}Variants = cva(
  [
    // Base styles - Material Design 3 foundation
    'transition-all duration-medium-2 ease-standard'
  ],
  {
    variants: {
      variant: {
        default: '',
        // Add more variants as needed
      },
      size: {
        sm: '',
        md: '',
        lg: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);` : ''}

export interface ${name}Props
  extends ${hasVariants ? `React.HTMLAttributes<HTMLDivElement>,\n    VariantProps<typeof ${name.toLowerCase()}Variants>` : 'React.HTMLAttributes<HTMLDivElement>'} {
  /**
   * Additional props documentation
   */
}

const ${name} = React.forwardRef<${hasVariants ? 'HTMLDivElement' : 'HTMLElement'}, ${name}Props>(
  ({ className${hasVariants ? ', variant, size' : ''}, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(${hasVariants ? `${name.toLowerCase()}Variants({ variant, size, className })` : `className`})}
      {...props}
    />
  )
);

${name}.displayName = '${name}';

export { ${name}${hasVariants ? `, ${name.toLowerCase()}Variants` : ''} };
export type { ${name}Props };
`;

const indexTemplate = (name, hasVariants) => `export { ${name}${hasVariants ? `, ${name.toLowerCase()}Variants` : ''} } from './${name}';
export type { ${name}Props } from './${name}';
`;

function generateComponent(name, options = {}) {
  const {
    hasVariants = true,
    targetDir = 'src/components/ui'
  } = options;

  const componentDir = path.join(process.cwd(), targetDir);
  const componentPath = path.join(componentDir, `${name}.tsx`);
  const indexPath = path.join(componentDir, 'index.ts');

  // Generate component file
  const componentCode = componentTemplate(name, hasVariants);
  fs.writeFileSync(componentPath, componentCode);
  console.log(`✅ Created ${componentPath}`);

  // Update index file
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    // Add import
    const importLine = `export { ${name}${hasVariants ? `, ${name.toLowerCase()}Variants` : ''} } from './${name}';
export type { ${name}Props } from './${name}';
`;

    // Simple approach: append to end (in a real implementation, you'd parse and insert properly)
    if (!indexContent.includes(`from './${name}'`)) {
      indexContent += '\n' + importLine;
      fs.writeFileSync(indexPath, indexContent);
      console.log(`✅ Updated ${indexPath}`);
    }
  }

  // Format the generated files
  try {
    execSync(`npx prettier --write "${componentPath}"`, { stdio: 'inherit' });
    execSync(`npx prettier --write "${indexPath}"`, { stdio: 'inherit' });
    console.log('✅ Formatted generated files');
  } catch (error) {
    console.warn('⚠️  Prettier not found, skipping formatting');
  }
}

function showHelp() {
  console.log(`
🛠️  LightDom Component Generator

Usage:
  node scripts/generate-component.js <ComponentName> [options]

Options:
  --no-variants    Generate component without variants
  --target-dir     Target directory (default: src/components/ui)

Examples:
  node scripts/generate-component.js Button
  node scripts/generate-component.js IconButton --no-variants
  node scripts/generate-component.js DataTable --target-dir src/components/data

Generated components follow Material Design 3 patterns with:
- TypeScript interfaces
- Forward refs for proper DOM access
- class-variance-authority for variants
- Proper accessibility attributes
- Consistent naming conventions
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const componentName = args[0];
  const hasVariants = !args.includes('--no-variants');
  const targetDirIndex = args.indexOf('--target-dir');
  const targetDir = targetDirIndex !== -1 && args[targetDirIndex + 1]
    ? args[targetDirIndex + 1]
    : 'src/components/ui';

  if (!componentName) {
    console.error('❌ Component name is required');
    showHelp();
    process.exit(1);
  }

  // Validate component name (PascalCase)
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
    console.error('❌ Component name must be in PascalCase (e.g., MyComponent)');
    process.exit(1);
  }

  try {
    generateComponent(componentName, { hasVariants, targetDir });
    console.log(`🎉 Successfully generated ${componentName} component!`);
  } catch (error) {
    console.error('❌ Failed to generate component:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateComponent };

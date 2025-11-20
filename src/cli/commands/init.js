/**
 * Project initialization command
 */

import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export async function runInit(options) {
  console.log(chalk.blue('🚀 Initializing LightDom Project'));
  
  let projectName = options.name;
  let template = options.template;
  
  if (!projectName) {
    const { name } = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'Enter project name:',
      default: 'my-lightdom-project',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Project name is required';
        }
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name should contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    }]);
    projectName = name;
  }
  
  if (!template) {
    const { selectedTemplate } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedTemplate',
      message: 'Choose a project template:',
      choices: [
        { name: 'Basic - Simple LightDom setup', value: 'basic' },
        { name: 'Advanced - Full-featured with automation', value: 'advanced' },
        { name: 'Enterprise - Complete platform with all features', value: 'enterprise' }
      ]
    }]);
    template = selectedTemplate;
  }
  
  const projectDir = join(process.cwd(), projectName);
  
  if (existsSync(projectDir)) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${projectName} already exists. Overwrite?`,
      default: false
    }]);
    
    if (!overwrite) {
      console.log(chalk.yellow('Project initialization cancelled'));
      return;
    }
  }
  
  console.log(chalk.cyan(`Creating project directory: ${projectName}`));
  mkdirSync(projectDir, { recursive: true });
  
  // Create basic project structure
  console.log(chalk.cyan('Creating project structure...'));
  createProjectStructure(projectDir, template);
  
  // Generate package.json
  console.log(chalk.cyan('Generating package.json...'));
  createPackageJson(projectDir, projectName, template);
  
  // Create basic configuration files
  console.log(chalk.cyan('Creating configuration files...'));
  createConfigFiles(projectDir, template);
  
  // Create source files
  console.log(chalk.cyan('Creating source files...'));
  createSourceFiles(projectDir, template);
  
  // Create documentation
  console.log(chalk.cyan('Creating documentation...'));
  createDocumentation(projectDir, projectName, template);
  
  console.log(chalk.green(`\\n🎉 Project ${projectName} initialized successfully!`));
  console.log(chalk.cyan('\\nNext steps:'));
  console.log(chalk.gray(`  cd ${projectName}`));
  console.log(chalk.gray('  npm install'));
  console.log(chalk.gray('  npm run setup'));
  console.log(chalk.gray('  npm run dev'));
}

function createProjectStructure(projectDir, template) {
  const directories = [
    'src/components',
    'src/services',
    'src/utils',
    'src/types',
    'public',
    'docs'
  ];
  
  if (template === 'advanced' || template === 'enterprise') {
    directories.push(
      'src/automation',
      'src/blockchain',
      'src/api',
      'contracts',
      'scripts',
      'test'
    );
  }
  
  if (template === 'enterprise') {
    directories.push(
      'src/monitoring',
      'src/security',
      'monitoring',
      'deployment'
    );
  }
  
  directories.forEach(dir => {
    mkdirSync(join(projectDir, dir), { recursive: true });
  });
}

function createPackageJson(projectDir, projectName, template) {
  const basicDependencies = {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  };
  
  const advancedDependencies = {
    ...basicDependencies,
    "commander": "^11.1.0",
    "chalk": "^5.6.2",
    "ora": "^9.0.0",
    "ethers": "^6.7.1",
    "express": "^4.18.2"
  };
  
  const enterpriseDependencies = {
    ...advancedDependencies,
    "pg": "^8.11.3",
    "redis": "^4.6.7",
    "puppeteer": "^21.0.3",
    "winston": "^3.10.0"
  };
  
  const dependencies = template === 'basic' ? basicDependencies :
                     template === 'advanced' ? advancedDependencies :
                     enterpriseDependencies;
  
  const scripts = {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write ."
  };
  
  if (template === 'advanced' || template === 'enterprise') {
    Object.assign(scripts, {
      "automation": "node scripts/automation.js",
      "blockchain": "node scripts/blockchain.js",
      "deploy": "node scripts/deploy.js"
    });
  }
  
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    type: "module",
    scripts,
    dependencies,
    devDependencies: {
      "@types/react": "^18.2.15",
      "@types/react-dom": "^18.2.7",
      "@vitejs/plugin-react": "^4.0.3",
      "eslint": "^8.45.0",
      "prettier": "^3.0.0",
      "vitest": "^3.2.4"
    }
  };
  
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

function createConfigFiles(projectDir, template) {
  // TypeScript config
  const tsconfig = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }]
  };
  
  writeFileSync(
    join(projectDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );
  
  // Vite config
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
})
`;
  
  writeFileSync(join(projectDir, 'vite.config.ts'), viteConfig);
  
  // Environment file
  const envContent = template === 'basic' ? 
    `NODE_ENV=development
VITE_APP_NAME=${projectName}
` : 
    `NODE_ENV=development
VITE_APP_NAME=${projectName}
API_PORT=3000
${template === 'enterprise' ? 'DATABASE_URL=postgresql://localhost:5432/' + projectName + '_dev' : ''}
${template !== 'basic' ? 'BLOCKCHAIN_RPC_URL=http://localhost:8545' : ''}
`;
  
  writeFileSync(join(projectDir, '.env.example'), envContent);
}

function createSourceFiles(projectDir, template) {
  // Main App component
  const appComponent = `import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${projectName}</h1>
        <p>LightDom ${template} template</p>
      </header>
    </div>
  )
}

export default App
`;
  
  writeFileSync(join(projectDir, 'src/App.tsx'), appComponent);
  
  // Main entry point
  const mainEntry = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
  
  writeFileSync(join(projectDir, 'src/main.tsx'), mainEntry);
  
  // Basic CSS
  const appCss = `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
`;
  
  writeFileSync(join(projectDir, 'src/App.css'), appCss);
  writeFileSync(join(projectDir, 'src/index.css'), 'body { margin: 0; font-family: sans-serif; }');
  
  // HTML template
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  
  writeFileSync(join(projectDir, 'index.html'), indexHtml);
}

function createDocumentation(projectDir, projectName, template) {
  const readme = `# ${projectName}

A LightDom project created with the ${template} template.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Setup environment:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
- \`npm run lint\` - Lint code
- \`npm run format\` - Format code

${template !== 'basic' ? `
### Additional Scripts

- \`npm run automation\` - Start automation system
- \`npm run blockchain\` - Manage blockchain
- \`npm run deploy\` - Deploy application
` : ''}

## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── components/     # React components
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript types
├── public/             # Static assets
└── docs/               # Documentation
\`\`\`

## License

MIT
`;
  
  writeFileSync(join(projectDir, 'README.md'), readme);
}
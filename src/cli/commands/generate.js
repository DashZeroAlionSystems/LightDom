/**
 * Code generation commands implementation
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export async function generateComponent(name, options) {
  console.log(chalk.blue(`🧩 Generating React component: ${name}`));
  
  const componentDir = join('src', 'components');
  const componentPath = join(componentDir, `${name}.tsx`);
  
  if (!existsSync(componentDir)) {
    mkdirSync(componentDir, { recursive: true });
  }
  
  if (existsSync(componentPath)) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: `Component ${name} already exists. Overwrite?`,
      default: false
    }]);
    
    if (!overwrite) {
      console.log(chalk.yellow('Component generation cancelled'));
      return;
    }
  }
  
  const componentTemplate = generateComponentTemplate(name, options);
  writeFileSync(componentPath, componentTemplate);
  
  // Generate test file
  const testPath = join(componentDir, '__tests__', `${name}.test.tsx`);
  const testDir = join(componentDir, '__tests__');
  
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
  }
  
  const testTemplate = generateComponentTestTemplate(name);
  writeFileSync(testPath, testTemplate);
  
  console.log(chalk.green(`✅ Component created at: ${componentPath}`));
  console.log(chalk.green(`✅ Test created at: ${testPath}`));
}

export async function generateService(name, options) {
  console.log(chalk.blue(`⚙️ Generating service: ${name}`));
  
  const serviceDir = join('src', 'services');
  const servicePath = join(serviceDir, `${name}Service.ts`);
  
  if (!existsSync(serviceDir)) {
    mkdirSync(serviceDir, { recursive: true });
  }
  
  if (existsSync(servicePath)) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: `Service ${name} already exists. Overwrite?`,
      default: false
    }]);
    
    if (!overwrite) {
      console.log(chalk.yellow('Service generation cancelled'));
      return;
    }
  }
  
  const serviceTemplate = generateServiceTemplate(name, options);
  writeFileSync(servicePath, serviceTemplate);
  
  // Generate test file
  const testPath = join(serviceDir, '__tests__', `${name}Service.test.ts`);
  const testDir = join(serviceDir, '__tests__');
  
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
  }
  
  const testTemplate = generateServiceTestTemplate(name);
  writeFileSync(testPath, testTemplate);
  
  console.log(chalk.green(`✅ Service created at: ${servicePath}`));
  console.log(chalk.green(`✅ Test created at: ${testPath}`));
}

function generateComponentTemplate(name, options) {
  const isStyled = options.styled;
  const isClass = options.type === 'class';
  
  if (isClass) {
    return `import React, { Component } from 'react';
${isStyled ? "import styled from 'styled-components';" : ''}

interface ${name}Props {
  // Add your props here
}

interface ${name}State {
  // Add your state here
}

${isStyled ? `const Styled${name} = styled.div\`
  // Add your styles here
\`;` : ''}

export class ${name} extends Component<${name}Props, ${name}State> {
  constructor(props: ${name}Props) {
    super(props);
    this.state = {
      // Initialize state
    };
  }

  render() {
    return (
      ${isStyled ? `<Styled${name}>` : '<div>'}
        <h2>${name} Component</h2>
        {/* Add your component content here */}
      ${isStyled ? `</Styled${name}>` : '</div>'}
    );
  }
}

export default ${name};
`;
  } else {
    return `import React${isStyled ? ', { FC }' : ''} from 'react';
${isStyled ? "import styled from 'styled-components';" : ''}

interface ${name}Props {
  // Add your props here
}

${isStyled ? `const Styled${name} = styled.div\`
  // Add your styles here
\`;` : ''}

export const ${name}${isStyled ? ': FC<${name}Props>' : ''} = (${isStyled ? 'props' : '{ /* destructure props */ }'}) => {
  return (
    ${isStyled ? `<Styled${name}>` : '<div>'}
      <h2>${name} Component</h2>
      {/* Add your component content here */}
    ${isStyled ? `</Styled${name}>` : '</div>'}
  );
};

export default ${name};
`;
  }
}

function generateComponentTestTemplate(name) {
  return `import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${name} from '../${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name} Component')).toBeInTheDocument();
  });

  it('accepts props correctly', () => {
    // Add prop testing here
    render(<${name} />);
    // Add assertions
  });

  // Add more tests as needed
});
`;
}

function generateServiceTemplate(name, options) {
  const serviceType = options.type;
  
  if (serviceType === 'blockchain') {
    return `/**
 * ${name} Blockchain Service
 * Handles blockchain interactions for ${name}
 */

import { ethers } from 'ethers';
import { Logger } from '../utils/Logger';

export class ${name}Service {
  private logger: Logger;
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.logger = new Logger('${name}Service');
    this.provider = provider;
    this.signer = signer || new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  }

  /**
   * Initialize the ${name} service
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing ${name} service...');
    // Add initialization logic here
  }

  /**
   * Example blockchain operation
   */
  async performBlockchainOperation(): Promise<any> {
    this.logger.info('Performing blockchain operation...');
    // Add blockchain logic here
    return {};
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      initialized: true,
      provider: this.provider ? 'Connected' : 'Disconnected',
      signer: this.signer ? 'Available' : 'Not available'
    };
  }
}

export default ${name}Service;
`;
  } else if (serviceType === 'automation') {
    return `/**
 * ${name} Automation Service
 * Handles automation workflows for ${name}
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';

export class ${name}Service extends EventEmitter {
  private logger: Logger;
  private isRunning: boolean = false;

  constructor() {
    super();
    this.logger = new Logger('${name}Service');
  }

  /**
   * Initialize the ${name} service
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing ${name} service...');
    // Add initialization logic here
    this.emit('initialized');
  }

  /**
   * Start the automation service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Service is already running');
      return;
    }

    this.logger.info('Starting ${name} service...');
    this.isRunning = true;
    // Add start logic here
    this.emit('started');
  }

  /**
   * Stop the automation service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Service is not running');
      return;
    }

    this.logger.info('Stopping ${name} service...');
    this.isRunning = false;
    // Add stop logic here
    this.emit('stopped');
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      running: this.isRunning,
      uptime: process.uptime()
    };
  }
}

export default ${name}Service;
`;
  } else {
    return `/**
 * ${name} Service
 * Business logic service for ${name}
 */

import { Logger } from '../utils/Logger';

export class ${name}Service {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('${name}Service');
  }

  /**
   * Initialize the ${name} service
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing ${name} service...');
    // Add initialization logic here
  }

  /**
   * Example service method
   */
  async performOperation(data: any): Promise<any> {
    this.logger.info('Performing operation...', data);
    // Add business logic here
    return { success: true, data };
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      initialized: true,
      status: 'active'
    };
  }
}

export default ${name}Service;
`;
  }
}

function generateServiceTestTemplate(name) {
  return `import ${name}Service from '../${name}Service';

describe('${name}Service', () => {
  let service: ${name}Service;

  beforeEach(() => {
    service = new ${name}Service();
  });

  afterEach(() => {
    // Clean up if needed
  });

  it('should initialize successfully', async () => {
    await service.initialize();
    const status = service.getStatus();
    expect(status.initialized).toBe(true);
  });

  it('should perform operations correctly', async () => {
    await service.initialize();
    const result = await service.performOperation({ test: 'data' });
    expect(result.success).toBe(true);
  });

  // Add more tests as needed
});
`;
}
#!/usr/bin/env node

/**
 * Create First Project Script
 * Interactive script to create your first blockchain automation project
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.magenta}${message}${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(message.length)}${colors.reset}`);
}

// Project templates
const projectTemplates = {
  'dom-optimization': {
    name: 'DOM Optimization Platform',
    description: 'Enterprise blockchain platform for DOM optimization and space harvesting',
    type: 'blockchain',
    complexity: 'advanced',
    estimatedDuration: '6 months',
    budget: 1000000,
    resources: {
      cpu: 8,
      memory: 16384,
      storage: 500,
      bandwidth: 500
    },
    milestones: [
      {
        name: 'Core Infrastructure',
        description: 'Build core blockchain infrastructure and smart contracts',
        duration: '2 months',
        tasks: [
          'Deploy smart contracts',
          'Setup API server',
          'Configure database',
          'Implement authentication'
        ]
      },
      {
        name: 'Web Crawler System',
        description: 'Implement automated web crawling and optimization',
        duration: '2 months',
        tasks: [
          'Build crawler service',
          'Implement optimization algorithms',
          'Setup monitoring',
          'Create dashboard'
        ]
      },
      {
        name: 'Blockchain Integration',
        description: 'Integrate with blockchain networks and deploy',
        duration: '2 months',
        tasks: [
          'Deploy to mainnet',
          'Setup monitoring',
          'Performance optimization',
          'Security audit'
        ]
      }
    ]
  },
  'nft-marketplace': {
    name: 'NFT Marketplace Platform',
    description: 'Decentralized marketplace for trading NFTs with automated features',
    type: 'marketplace',
    complexity: 'intermediate',
    estimatedDuration: '4 months',
    budget: 500000,
    resources: {
      cpu: 6,
      memory: 12288,
      storage: 300,
      bandwidth: 400
    },
    milestones: [
      {
        name: 'Smart Contracts',
        description: 'Develop NFT and marketplace smart contracts',
        duration: '1.5 months',
        tasks: [
          'ERC-721 implementation',
          'Marketplace contracts',
          'Auction system',
          'Royalty system'
        ]
      },
      {
        name: 'Frontend Development',
        description: 'Build user interface and marketplace features',
        duration: '1.5 months',
        tasks: [
          'React frontend',
          'Wallet integration',
          'NFT display',
          'Trading interface'
        ]
      },
      {
        name: 'Deployment & Testing',
        description: 'Deploy and thoroughly test the platform',
        duration: '1 month',
        tasks: [
          'Testnet deployment',
          'Security testing',
          'Mainnet deployment',
          'User testing'
        ]
      }
    ]
  },
  'defi-protocol': {
    name: 'DeFi Lending Protocol',
    description: 'Decentralized finance protocol for lending and borrowing',
    type: 'defi',
    complexity: 'advanced',
    estimatedDuration: '8 months',
    budget: 2000000,
    resources: {
      cpu: 12,
      memory: 24576,
      storage: 1000,
      bandwidth: 800
    },
    milestones: [
      {
        name: 'Core Protocol',
        description: 'Develop core lending and borrowing mechanisms',
        duration: '3 months',
        tasks: [
          'Lending pools',
          'Interest rate models',
          'Collateral management',
          'Liquidation system'
        ]
      },
      {
        name: 'Governance System',
        description: 'Implement decentralized governance',
        duration: '2 months',
        tasks: [
          'Governance token',
          'Voting mechanisms',
          'Proposal system',
          'Treasury management'
        ]
      },
      {
        name: 'Security & Audit',
        description: 'Comprehensive security audit and testing',
        duration: '2 months',
        tasks: [
          'Security audit',
          'Penetration testing',
          'Bug fixes',
          'Formal verification'
        ]
      },
      {
        name: 'Launch & Marketing',
        description: 'Launch the protocol and marketing campaign',
        duration: '1 month',
        tasks: [
          'Mainnet launch',
          'Marketing campaign',
          'Community building',
          'Partnerships'
        ]
      }
    ]
  }
};

async function main() {
  try {
    logHeader('🚀 Create Your First Blockchain Project');
    
    // Check if system is running
    logInfo('Checking if the automation system is running...');
    if (!await checkSystemStatus()) {
      logWarning('The automation system is not running. Please start it first with: npm run automation');
      return;
    }
    
    // Interactive project creation
    const project = await createProjectInteractively();
    
    // Save project configuration
    await saveProject(project);
    
    // Display project summary
    displayProjectSummary(project);
    
    logSuccess('🎉 Project created successfully!');
    logInfo('Your project is now ready for development and automation.');
    
  } catch (error) {
    logError(`Failed to create project: ${error.message}`);
    process.exit(1);
  }
}

async function checkSystemStatus() {
  // In a real implementation, this would check if the automation system is running
  // For now, we'll assume it's running
  return true;
}

async function createProjectInteractively() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
  
  try {
    logHeader('📋 Project Configuration');
    
    // Select project template
    logInfo('Available project templates:');
    Object.entries(projectTemplates).forEach(([key, template], index) => {
      log(`  ${index + 1}. ${template.name} (${template.complexity})`, 'cyan');
      log(`     ${template.description}`, 'yellow');
      log(`     Duration: ${template.estimatedDuration} | Budget: $${template.budget.toLocaleString()}`, 'blue');
    });
    
    const templateChoice = await question('\nSelect a template (1-3): ');
    const templateKeys = Object.keys(projectTemplates);
    const selectedTemplate = projectTemplates[templateKeys[parseInt(templateChoice) - 1]];
    
    if (!selectedTemplate) {
      throw new Error('Invalid template selection');
    }
    
    logSuccess(`Selected template: ${selectedTemplate.name}`);
    
    // Customize project details
    const projectName = await question(`\nProject name (${selectedTemplate.name}): `) || selectedTemplate.name;
    const projectDescription = await question(`Description (${selectedTemplate.description}): `) || selectedTemplate.description;
    const budget = await question(`Budget ($${selectedTemplate.budget.toLocaleString()}): `) || selectedTemplate.budget;
    
    // Create project object
    const project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      description: projectDescription,
      type: selectedTemplate.type,
      complexity: selectedTemplate.complexity,
      status: 'planning',
      priority: 1,
      startDate: new Date().toISOString(),
      budget: parseInt(budget),
      resources: selectedTemplate.resources,
      milestones: selectedTemplate.milestones.map((milestone, index) => ({
        id: `milestone-${index + 1}`,
        name: milestone.name,
        description: milestone.description,
        dueDate: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days per milestone
        status: 'pending',
        tasks: milestone.tasks.map((task, taskIndex) => ({
          id: `task-${index + 1}-${taskIndex + 1}`,
          name: task,
          description: `Implement ${task}`,
          type: 'development',
          status: 'pending',
          priority: 1,
          estimatedHours: 40,
          actualHours: 0,
          dependencies: [],
          resources: {
            cpu: 2,
            memory: 4096,
            storage: 50,
            workflows: [],
            nodes: []
          },
          dueDate: new Date(Date.now() + (index + 1) * 15 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        dependencies: [],
        deliverables: milestone.tasks,
        successCriteria: milestone.tasks.map(task => `Complete ${task}`)
      })),
      tasks: [],
      dependencies: [],
      stakeholders: [
        {
          id: 'stakeholder-1',
          name: 'Project Manager',
          email: 'pm@company.com',
          role: 'manager',
          permissions: ['read', 'write', 'execute', 'manage'],
          notifications: true
        }
      ],
      metrics: {
        progress: 0,
        budgetUsed: 0,
        budgetRemaining: parseInt(budget),
        tasksCompleted: 0,
        tasksTotal: selectedTemplate.milestones.reduce((total, milestone) => total + milestone.tasks.length, 0),
        milestonesCompleted: 0,
        milestonesTotal: selectedTemplate.milestones.length,
        resourceUtilization: 0,
        timelineVariance: 0,
        qualityScore: 0,
        riskScore: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Flatten tasks from milestones
    project.tasks = project.milestones.flatMap(milestone => milestone.tasks);
    
    return project;
    
  } finally {
    rl.close();
  }
}

async function saveProject(project) {
  logInfo('Saving project configuration...');
  
  // Create projects directory if it doesn't exist
  const projectsDir = 'data/projects';
  if (!existsSync(projectsDir)) {
    require('fs').mkdirSync(projectsDir, { recursive: true });
  }
  
  // Save project to file
  const projectFile = `${projectsDir}/${project.id}.json`;
  writeFileSync(projectFile, JSON.stringify(project, null, 2));
  
  // Update projects index
  const indexFile = `${projectsDir}/index.json`;
  let projectsIndex = [];
  if (existsSync(indexFile)) {
    projectsIndex = JSON.parse(readFileSync(indexFile, 'utf8'));
  }
  
  projectsIndex.push({
    id: project.id,
    name: project.name,
    status: project.status,
    createdAt: project.createdAt
  });
  
  writeFileSync(indexFile, JSON.stringify(projectsIndex, null, 2));
  
  logSuccess(`Project saved to: ${projectFile}`);
}

function displayProjectSummary(project) {
  logHeader('📊 Project Summary');
  
  log(`Project ID: ${project.id}`, 'cyan');
  log(`Name: ${project.name}`, 'green');
  log(`Type: ${project.type}`, 'blue');
  log(`Complexity: ${project.complexity}`, 'yellow');
  log(`Budget: $${project.budget.toLocaleString()}`, 'green');
  log(`Status: ${project.status}`, 'blue');
  
  log(`\n📋 Milestones (${project.milestones.length}):`, 'cyan');
  project.milestones.forEach((milestone, index) => {
    log(`  ${index + 1}. ${milestone.name}`, 'yellow');
    log(`     ${milestone.description}`, 'blue');
    log(`     Tasks: ${milestone.tasks.length}`, 'green');
  });
  
  log(`\n📊 Resources:`, 'cyan');
  log(`  CPU: ${project.resources.cpu} cores`, 'green');
  log(`  Memory: ${project.resources.memory} MB`, 'green');
  log(`  Storage: ${project.resources.storage} GB`, 'green');
  log(`  Bandwidth: ${project.resources.bandwidth} Mbps`, 'green');
  
  log(`\n🎯 Next Steps:`, 'cyan');
  log('  1. Review the project configuration', 'blue');
  log('  2. Start the first milestone', 'blue');
  log('  3. Monitor progress through the dashboard', 'blue');
  log('  4. Scale resources as needed', 'blue');
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Project creation interrupted by user');
  process.exit(0);
});

// Run the script
main().catch((error) => {
  logError(`Script failed: ${error.message}`);
  process.exit(1);
});

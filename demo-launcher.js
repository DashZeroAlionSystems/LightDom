#!/usr/bin/env node

/**
 * LightDom Unified Demo Launcher
 * 
 * Interactive launcher for all LightDom demos with categorization,
 * dependency checking, and enhanced navigation.
 * 
 * Features:
 * - Interactive menu with categories
 * - Dependency validation
 * - Demo descriptions and requirements
 * - Quick launch shortcuts
 * - Demo status tracking
 * - System integration validation
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

// Demo catalog
const demos = {
  'Interactive Demos': [
    {
      id: 'onboarding',
      name: 'User Onboarding Flow',
      file: 'demo-onboarding.js',
      description: 'Automated user onboarding with SEO analysis and dashboard generation',
      type: 'node',
      dependencies: [],
      enhanced: true,
      status: 'ready'
    },
    {
      id: 'space-mining',
      name: 'Space Mining Dashboard',
      file: 'space-mining-demo.html',
      description: 'Real-time blockchain-powered DOM space mining with metaverse integration',
      type: 'html',
      dependencies: [],
      enhanced: true,
      status: 'ready'
    },
    {
      id: 'metaverse-nft',
      name: 'Metaverse NFT System',
      file: 'metaverse-nft-demo.html',
      description: 'NFT marketplace and metaverse integration demo',
      type: 'html',
      dependencies: [],
      status: 'ready'
    },
    {
      id: 'lightdom-slots',
      name: 'LightDOM Slots',
      file: 'lightdom-slot-demo.html',
      description: 'Web components with LightDOM slot patterns',
      type: 'html',
      dependencies: [],
      status: 'ready'
    }
  ],
  'Data Mining & SEO': [
    {
      id: 'datamining-advanced',
      name: 'Advanced Data Mining',
      file: 'demo-advanced-datamining.js',
      description: 'Full data mining orchestration with Playwright and Puppeteer',
      type: 'node',
      dependencies: ['puppeteer', 'playwright'],
      status: 'needs-deps'
    },
    {
      id: 'datamining-system',
      name: 'Data Mining System',
      file: 'demo-data-mining-system.js',
      description: 'Headless browser pool and schema workflows',
      type: 'node',
      dependencies: ['puppeteer'],
      status: 'needs-deps'
    },
    {
      id: 'dom-3d-mining',
      name: '3D DOM Mining',
      file: 'demo-dom-3d-mining.js',
      description: 'Mine URLs and generate 3D DOM models with schema linking',
      type: 'node',
      dependencies: ['puppeteer'],
      status: 'needs-deps'
    },
    {
      id: 'ui-mining',
      name: 'Enhanced UI Mining',
      file: 'demo-enhanced-ui-mining.js',
      description: 'Advanced UI/UX pattern detection and mining',
      type: 'node',
      dependencies: ['puppeteer'],
      status: 'needs-deps'
    },
    {
      id: 'url-seeding',
      name: 'URL Seeding Service',
      file: 'demo-url-seeding-service.js',
      description: 'URL seeding and discovery system',
      type: 'node',
      dependencies: [],
      status: 'needs-api'
    }
  ],
  'Blockchain & Mining': [
    {
      id: 'blockchain-optimization',
      name: 'Blockchain Algorithm Optimization',
      file: 'demo-blockchain-algorithm-optimization.js',
      description: 'Benchmark PoW, PoS, PoO, DPoS algorithms for SEO data mining',
      type: 'node',
      dependencies: [],
      status: 'ready'
    }
  ],
  'Component & Design Systems': [
    {
      id: 'component-dashboard',
      name: 'Component Dashboard Generator',
      file: 'demo-component-dashboard-generator.js',
      description: 'Auto-generate React dashboard components with CRUD',
      type: 'node',
      dependencies: [],
      status: 'ready'
    },
    {
      id: 'design-system',
      name: 'Design System Enhancement',
      file: 'demo-design-system-enhancement.js',
      description: 'SEO report generation and design pattern analysis',
      type: 'node',
      dependencies: [],
      status: 'ready'
    },
    {
      id: 'styleguide-config',
      name: 'Styleguide Configuration',
      file: 'demo-styleguide-config-system.js',
      description: 'Complete styleguide configuration with category management',
      type: 'node',
      dependencies: [],
      status: 'needs-db'
    },
    {
      id: 'styleguide-generator',
      name: 'Styleguide Generator',
      file: 'demo-styleguide-generator.js',
      description: 'Mine style guides from URLs and create Storybook',
      type: 'node',
      dependencies: ['puppeteer'],
      status: 'needs-deps'
    }
  ],
  'Agent & Workflow Systems': [
    {
      id: 'agent-orchestration',
      name: 'Agent Orchestration',
      file: 'demo-agent-orchestration.js',
      description: 'Natural language to component generation workflow',
      type: 'node',
      dependencies: [],
      status: 'ready'
    },
    {
      id: 'workflow',
      name: 'Memory Workflow',
      file: 'demo-workflow.js',
      description: 'Workflow execution with memory-driven optimizations',
      type: 'node',
      dependencies: [],
      status: 'ready'
    },
    {
      id: 'system-integration',
      name: 'System Integration',
      file: 'demo-system-integration.js',
      description: 'Scraper manager and DeepSeek chat integration',
      type: 'node',
      dependencies: [],
      status: 'ready'
    }
  ],
  'Database & Services': [
    {
      id: 'category-instances',
      name: 'Category Instances',
      file: 'demo-category-instances.js',
      description: 'Create category type instances',
      type: 'node',
      dependencies: ['pg'],
      status: 'needs-deps'
    },
    {
      id: 'category-auto-crud',
      name: 'Category Auto-CRUD',
      file: 'demo-category-auto-crud.js',
      description: 'Auto-generation system with sample data',
      type: 'node',
      dependencies: [],
      status: 'ready'
    },
    {
      id: 'client-zone',
      name: 'Client Zone',
      file: 'demo-client-zone.js',
      description: 'Client zone functionality demonstration',
      type: 'node',
      dependencies: [],
      status: 'needs-api'
    }
  ],
  'Utilities': [
    {
      id: 'merge-conflicts',
      name: 'Merge Conflict Handling',
      file: 'demo-merge-conflicts.js',
      description: 'Example merge conflict resolution',
      type: 'node',
      dependencies: [],
      status: 'ready'
    }
  ]
};

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function printHeader() {
  console.clear();
  console.log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║          🚀 LightDom Unified Demo Launcher v1.0                     ║
║                                                                      ║
║          Interactive demo explorer and launcher                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
${colors.reset}\n`);
}

function getStatusIcon(status) {
  switch (status) {
    case 'ready': return `${colors.green}✓${colors.reset}`;
    case 'needs-deps': return `${colors.yellow}⚠${colors.reset}`;
    case 'needs-api': return `${colors.yellow}⚠${colors.reset}`;
    case 'needs-db': return `${colors.yellow}⚠${colors.reset}`;
    default: return `${colors.dim}?${colors.reset}`;
  }
}

function getStatusText(status) {
  switch (status) {
    case 'ready': return `${colors.green}Ready${colors.reset}`;
    case 'needs-deps': return `${colors.yellow}Needs Dependencies${colors.reset}`;
    case 'needs-api': return `${colors.yellow}Needs API Server${colors.reset}`;
    case 'needs-db': return `${colors.yellow}Needs Database${colors.reset}`;
    default: return `${colors.dim}Unknown${colors.reset}`;
  }
}

function printMenu() {
  let index = 1;
  const demoMap = {};

  Object.entries(demos).forEach(([category, categoryDemos]) => {
    console.log(`\n${colors.bright}${colors.blue}${category}:${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}`);
    
    categoryDemos.forEach(demo => {
      const statusIcon = getStatusIcon(demo.status);
      const enhancedBadge = demo.enhanced ? `${colors.magenta}⭐ Enhanced${colors.reset}` : '';
      const typeIcon = demo.type === 'html' ? '🌐' : '⚙️';
      
      console.log(`  ${colors.bright}${index}.${colors.reset} ${statusIcon} ${typeIcon} ${demo.name} ${enhancedBadge}`);
      console.log(`     ${colors.dim}${demo.description}${colors.reset}`);
      console.log(`     Status: ${getStatusText(demo.status)} | File: ${demo.file}`);
      
      if (demo.dependencies && demo.dependencies.length > 0) {
        console.log(`     ${colors.yellow}Requires: ${demo.dependencies.join(', ')}${colors.reset}`);
      }
      
      demoMap[index] = demo;
      index++;
    });
  });

  console.log(`\n${colors.dim}${'═'.repeat(70)}${colors.reset}`);
  console.log(`\n${colors.bright}Options:${colors.reset}`);
  console.log(`  ${colors.cyan}[1-${index - 1}]${colors.reset} Launch demo`);
  console.log(`  ${colors.cyan}[a]${colors.reset}     Launch all ready demos`);
  console.log(`  ${colors.cyan}[s]${colors.reset}     System status check`);
  console.log(`  ${colors.cyan}[h]${colors.reset}     Help and documentation`);
  console.log(`  ${colors.cyan}[q]${colors.reset}     Quit\n`);

  return demoMap;
}

async function checkDependencies(demo) {
  if (!demo.dependencies || demo.dependencies.length === 0) {
    return { available: true, missing: [] };
  }

  const missing = [];
  for (const dep of demo.dependencies) {
    try {
      await import(dep);
    } catch {
      missing.push(dep);
    }
  }

  return {
    available: missing.length === 0,
    missing
  };
}

async function launchDemo(demo) {
  console.log(`\n${colors.bright}${colors.cyan}Launching: ${demo.name}${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}\n`);

  // Check dependencies
  const depCheck = await checkDependencies(demo);
  if (!depCheck.available) {
    console.log(`${colors.red}✗ Missing dependencies: ${depCheck.missing.join(', ')}${colors.reset}`);
    console.log(`${colors.yellow}Install with: npm install ${depCheck.missing.join(' ')}${colors.reset}\n`);
    await question('Press Enter to continue...');
    return;
  }

  const demoPath = path.join(__dirname, demo.file);

  if (demo.type === 'html') {
    // Launch HTML demos in browser
    console.log(`${colors.green}Opening in browser...${colors.reset}`);
    console.log(`${colors.dim}File: ${demoPath}${colors.reset}\n`);
    
    const serverUrl = `http://localhost:8080/${demo.file}`;
    console.log(`${colors.cyan}Start a local server with:${colors.reset}`);
    console.log(`  ${colors.bright}python3 -m http.server 8080${colors.reset}`);
    console.log(`${colors.cyan}Then open:${colors.reset} ${colors.blue}${serverUrl}${colors.reset}\n`);
    
    await question('Press Enter to continue...');
  } else {
    // Launch Node.js demos
    console.log(`${colors.green}Running Node.js demo...${colors.reset}\n`);
    
    return new Promise((resolve) => {
      const child = spawn('node', [demoPath], {
        stdio: 'inherit',
        cwd: __dirname
      });

      child.on('close', (code) => {
        console.log(`\n${colors.dim}${'─'.repeat(70)}${colors.reset}`);
        console.log(`${colors.cyan}Demo completed with exit code: ${code}${colors.reset}\n`);
        resolve();
      });

      child.on('error', (error) => {
        console.error(`${colors.red}Error launching demo: ${error.message}${colors.reset}\n`);
        resolve();
      });
    });
  }
}

async function showSystemStatus() {
  printHeader();
  console.log(`${colors.bright}${colors.blue}System Status Check${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}\n`);

  // Count demos by status
  const stats = {
    ready: 0,
    'needs-deps': 0,
    'needs-api': 0,
    'needs-db': 0,
    enhanced: 0
  };

  let totalDemos = 0;
  Object.values(demos).forEach(categoryDemos => {
    categoryDemos.forEach(demo => {
      totalDemos++;
      stats[demo.status]++;
      if (demo.enhanced) stats.enhanced++;
    });
  });

  console.log(`${colors.bright}📊 Demo Statistics:${colors.reset}`);
  console.log(`   Total Demos:        ${totalDemos}`);
  console.log(`   ${colors.green}✓${colors.reset} Ready:             ${stats.ready}`);
  console.log(`   ${colors.magenta}⭐${colors.reset} Enhanced:          ${stats.enhanced}`);
  console.log(`   ${colors.yellow}⚠${colors.reset} Needs Dependencies: ${stats['needs-deps']}`);
  console.log(`   ${colors.yellow}⚠${colors.reset} Needs API Server:   ${stats['needs-api']}`);
  console.log(`   ${colors.yellow}⚠${colors.reset} Needs Database:     ${stats['needs-db']}`);

  console.log(`\n${colors.bright}🔍 Environment:${colors.reset}`);
  console.log(`   Node.js:   ${process.version}`);
  console.log(`   Platform:  ${process.platform}`);
  console.log(`   Directory: ${__dirname}`);

  console.log(`\n${colors.bright}📦 Common Dependencies:${colors.reset}`);
  const commonDeps = ['puppeteer', 'playwright', 'pg', 'express'];
  for (const dep of commonDeps) {
    try {
      await import(dep);
      console.log(`   ${colors.green}✓${colors.reset} ${dep}`);
    } catch {
      console.log(`   ${colors.red}✗${colors.reset} ${dep} ${colors.dim}(not installed)${colors.reset}`);
    }
  }

  console.log(`\n${colors.dim}${'─'.repeat(70)}${colors.reset}\n`);
  await question('Press Enter to continue...');
}

async function showHelp() {
  printHeader();
  console.log(`${colors.bright}${colors.blue}Help & Documentation${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}\n`);

  console.log(`${colors.bright}Demo Categories:${colors.reset}`);
  console.log(`  • ${colors.cyan}Interactive Demos${colors.reset} - Web-based interactive demonstrations`);
  console.log(`  • ${colors.cyan}Data Mining & SEO${colors.reset} - DOM mining and SEO optimization`);
  console.log(`  • ${colors.cyan}Blockchain & Mining${colors.reset} - Blockchain algorithm benchmarking`);
  console.log(`  • ${colors.cyan}Component Systems${colors.reset} - Design system and component generation`);
  console.log(`  • ${colors.cyan}Agent & Workflow${colors.reset} - AI agents and workflow automation`);
  console.log(`  • ${colors.cyan}Database & Services${colors.reset} - Backend services and database demos`);

  console.log(`\n${colors.bright}Status Indicators:${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Ready - Demo is ready to run`);
  console.log(`  ${colors.yellow}⚠${colors.reset} Needs Dependencies - Install npm packages first`);
  console.log(`  ${colors.yellow}⚠${colors.reset} Needs API Server - Requires backend API running`);
  console.log(`  ${colors.yellow}⚠${colors.reset} Needs Database - Requires database connection`);
  console.log(`  ${colors.magenta}⭐${colors.reset} Enhanced - Recently improved with new features`);

  console.log(`\n${colors.bright}Quick Start:${colors.reset}`);
  console.log(`  1. Run ${colors.cyan}node demo-launcher.js${colors.reset}`);
  console.log(`  2. Select a demo by number`);
  console.log(`  3. Follow on-screen instructions`);

  console.log(`\n${colors.bright}Installing Dependencies:${colors.reset}`);
  console.log(`  ${colors.cyan}npm install puppeteer playwright pg${colors.reset}`);

  console.log(`\n${colors.bright}Documentation:${colors.reset}`);
  console.log(`  • README.md - Main project documentation`);
  console.log(`  • DEMO_AND_STORYBOOK_IMPLEMENTATION.md - Demo system docs`);
  console.log(`  • Individual demo files contain inline documentation`);

  console.log(`\n${colors.dim}${'─'.repeat(70)}${colors.reset}\n`);
  await question('Press Enter to continue...');
}

async function main() {
  while (true) {
    printHeader();
    const demoMap = printMenu();

    const choice = await question(`${colors.bright}Select option: ${colors.reset}`);

    if (choice.toLowerCase() === 'q') {
      console.log(`\n${colors.cyan}Thanks for using LightDom Demo Launcher!${colors.reset}\n`);
      rl.close();
      process.exit(0);
    } else if (choice.toLowerCase() === 'h') {
      await showHelp();
    } else if (choice.toLowerCase() === 's') {
      await showSystemStatus();
    } else if (choice.toLowerCase() === 'a') {
      console.log(`\n${colors.yellow}Launch all ready demos - Coming soon!${colors.reset}\n`);
      await question('Press Enter to continue...');
    } else {
      const demoIndex = parseInt(choice);
      if (demoMap[demoIndex]) {
        await launchDemo(demoMap[demoIndex]);
      } else {
        console.log(`\n${colors.red}Invalid selection. Please try again.${colors.reset}\n`);
        await question('Press Enter to continue...');
      }
    }
  }
}

// Handle errors gracefully
process.on('SIGINT', () => {
  console.log(`\n\n${colors.cyan}Exiting Demo Launcher...${colors.reset}\n`);
  rl.close();
  process.exit(0);
});

// Run the launcher
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  rl.close();
  process.exit(1);
});

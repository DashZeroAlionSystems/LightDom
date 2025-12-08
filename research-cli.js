#!/usr/bin/env node

/**
 * Research Pipeline CLI Tool
 * 
 * Easy-to-use command-line interface for the AI Research Pipeline
 */

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const commands = {
  help: {
    description: 'Show this help message',
    usage: 'research help',
    action: showHelp
  },
  
  validate: {
    description: 'Validate system integrity (24 automated tests)',
    usage: 'research validate',
    action: () => runCommand('node validate-research-pipeline.js')
  },
  
  demo: {
    description: 'Run mock demonstration (no database required)',
    usage: 'research demo',
    action: () => runCommand('node demo-research-pipeline-mock.js')
  },
  
  init: {
    description: 'Initialize database schema',
    usage: 'research init [--force]',
    action: initDatabase
  },
  
  start: {
    description: 'Start the research pipeline service',
    usage: 'research start [--interval <minutes>] [--topics <topics>]',
    action: startService
  },
  
  analyze: {
    description: 'Analyze specific target articles',
    usage: 'research analyze',
    action: () => runCommand('node analyze-target-articles.js')
  },
  
  status: {
    description: 'Check pipeline status',
    usage: 'research status',
    action: () => runCommand('curl -s http://localhost:3001/api/research/status | jq .', true)
  },
  
  dashboard: {
    description: 'View dashboard data',
    usage: 'research dashboard',
    action: () => runCommand('curl -s http://localhost:3001/api/research/dashboard | jq .', true)
  },
  
  articles: {
    description: 'List scraped articles',
    usage: 'research articles [--topic <topic>] [--limit <n>]',
    action: listArticles
  },
  
  features: {
    description: 'List feature recommendations',
    usage: 'research features [--revenue <level>] [--impact <level>]',
    action: listFeatures
  },
  
  scrape: {
    description: 'Manually trigger article scraping',
    usage: 'research scrape <topics> [--limit <n>]',
    action: manualScrape
  },
  
  paper: {
    description: 'Generate research paper',
    usage: 'research paper [--focus <area>] [--limit <n>]',
    action: generatePaper
  },
  
  config: {
    description: 'Show configuration',
    usage: 'research config [--edit]',
    action: showConfig
  },
  
  logs: {
    description: 'View service logs',
    usage: 'research logs [--tail <n>]',
    action: viewLogs
  }
};

function showHelp() {
  console.log('\n🔬 AI Research Pipeline CLI\n');
  console.log('Usage: research <command> [options]\n');
  console.log('Commands:\n');
  
  Object.entries(commands).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(12)} ${info.description}`);
  });
  
  console.log('\nExamples:\n');
  console.log('  research validate              # Run system tests');
  console.log('  research demo                  # Run mock demo');
  console.log('  research start --interval 180  # Start service (3 hour interval)');
  console.log('  research scrape ai,ml,llm      # Scrape articles');
  console.log('  research status                # Check status');
  console.log('  research articles --limit 10   # List 10 articles');
  console.log('  research features --revenue high  # High revenue features');
  console.log('\nFor detailed help: research <command> --help\n');
}

function runCommand(cmd, shell = false) {
  try {
    if (shell) {
      console.log(`Running: ${cmd}\n`);
      execSync(cmd, { stdio: 'inherit', shell: true });
    } else {
      console.log(`Running: ${cmd}\n`);
      const parts = cmd.split(' ');
      const proc = spawn(parts[0], parts.slice(1), { stdio: 'inherit' });
      
      proc.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      });
      
      proc.on('close', (code) => {
        process.exit(code);
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function initDatabase(args) {
  const force = args.includes('--force');
  const schemaPath = './database/ai-research-pipeline-schema.sql';
  
  if (!fs.existsSync(schemaPath)) {
    console.error('Error: Schema file not found at', schemaPath);
    process.exit(1);
  }
  
  console.log('Initializing database schema...\n');
  
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || 'lightdom';
  const dbUser = process.env.DB_USER || 'postgres';
  
  const cmd = `psql -h ${dbHost} -U ${dbUser} -d ${dbName} -f ${schemaPath}`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('\n✅ Database initialized successfully!');
  } catch (error) {
    console.error('\n❌ Database initialization failed');
    console.error('Make sure PostgreSQL is running and credentials are correct');
    process.exit(1);
  }
}

function startService(args) {
  let cmd = 'node start-research-pipeline.js';
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--interval' && args[i + 1]) {
      cmd += ` --interval ${args[i + 1]}`;
      i++;
    } else if (args[i] === '--topics' && args[i + 1]) {
      cmd += ` --topics ${args[i + 1]}`;
      i++;
    } else if (args[i] === '--articles' && args[i + 1]) {
      cmd += ` --articles ${args[i + 1]}`;
      i++;
    } else if (args[i] === '--no-headless') {
      cmd += ' --no-headless';
    }
  }
  
  runCommand(cmd);
}

function listArticles(args) {
  let url = 'http://localhost:3001/api/research/articles';
  const params = [];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      params.push(`topic=${args[i + 1]}`);
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      params.push(`limit=${args[i + 1]}`);
      i++;
    } else if (args[i] === '--status' && args[i + 1]) {
      params.push(`status=${args[i + 1]}`);
      i++;
    }
  }
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  runCommand(`curl -s "${url}" | jq .`, true);
}

function listFeatures(args) {
  let url = 'http://localhost:3001/api/research/features';
  const params = [];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--revenue' && args[i + 1]) {
      params.push(`revenue=${args[i + 1]}`);
      i++;
    } else if (args[i] === '--impact' && args[i + 1]) {
      params.push(`impact=${args[i + 1]}`);
      i++;
    } else if (args[i] === '--status' && args[i + 1]) {
      params.push(`status=${args[i + 1]}`);
      i++;
    }
  }
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  runCommand(`curl -s "${url}" | jq .`, true);
}

function manualScrape(args) {
  if (args.length === 0) {
    console.error('Error: Please specify topics (e.g., ai,ml,llm)');
    process.exit(1);
  }
  
  const topics = args[0].split(',');
  let limit = 50;
  
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1]);
      i++;
    }
  }
  
  const data = JSON.stringify({ topics, limit });
  const cmd = `curl -X POST http://localhost:3001/api/research/scrape -H "Content-Type: application/json" -d '${data}' | jq .`;
  
  runCommand(cmd, true);
}

function generatePaper(args) {
  let focusArea = 'ai-ml-integration';
  let limit = 50;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--focus' && args[i + 1]) {
      focusArea = args[i + 1];
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1]);
      i++;
    }
  }
  
  const data = JSON.stringify({ focusArea, limit });
  const cmd = `curl -X POST http://localhost:3001/api/research/papers/generate -H "Content-Type: application/json" -d '${data}' | jq .`;
  
  runCommand(cmd, true);
}

function showConfig(args) {
  const configPath = './research-pipeline-config.json';
  
  if (args.includes('--edit')) {
    const editor = process.env.EDITOR || 'nano';
    runCommand(`${editor} ${configPath}`, true);
  } else {
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf-8');
      console.log(config);
    } else {
      console.error('Error: Config file not found at', configPath);
      process.exit(1);
    }
  }
}

function viewLogs(args) {
  const logPath = './logs/research-pipeline.log';
  let lines = 50;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tail' && args[i + 1]) {
      lines = parseInt(args[i + 1]);
      i++;
    }
  }
  
  if (fs.existsSync(logPath)) {
    runCommand(`tail -n ${lines} ${logPath}`, true);
  } else {
    console.log('No log file found. Logs may be disabled or service not started yet.');
    console.log('To enable logging, edit research-pipeline-config.json');
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (commands[command]) {
  commands[command].action(commandArgs);
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Run "research help" for available commands\n');
  process.exit(1);
}

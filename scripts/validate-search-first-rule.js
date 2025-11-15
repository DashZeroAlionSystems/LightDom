#!/usr/bin/env node

/**
 * Validate Search-First Rule Compliance
 * 
 * This script helps enforce the "always search existing code first" rule
 * by analyzing PRs and suggesting existing code that might already solve
 * the problem.
 * 
 * Usage:
 *   node scripts/validate-search-first-rule.js
 *   node scripts/validate-search-first-rule.js --files src/new-feature.ts
 *   node scripts/validate-search-first-rule.js --interactive
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class SearchFirstValidator {
  constructor() {
    this.violations = [];
    this.suggestions = [];
    this.newFiles = [];
    this.searchableDirectories = [
      'services',
      'api',
      'src/services',
      'src/components',
      'src/core',
      'src/hooks',
      'src/utils',
      'scripts',
      'utils'
    ];
  }

  /**
   * Main validation entry point
   */
  async validate(options = {}) {
    console.log(`${COLORS.bright}${COLORS.blue}╔════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.blue}║  Search-First Rule Validator          ║${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.blue}╚════════════════════════════════════════╝${COLORS.reset}\n`);

    if (options.interactive) {
      await this.interactiveMode();
    } else if (options.files) {
      await this.validateFiles(options.files);
    } else {
      await this.validateGitChanges();
    }

    this.printResults();
    return this.violations.length === 0;
  }

  /**
   * Validate files from git changes
   */
  async validateGitChanges() {
    console.log(`${COLORS.cyan}📋 Checking git changes...${COLORS.reset}\n`);

    try {
      // Get list of new files in the current branch
      const diffOutput = execSync('git diff --name-status origin/main...HEAD', {
        encoding: 'utf-8'
      }).trim();

      if (!diffOutput) {
        console.log(`${COLORS.yellow}ℹ️  No changes detected${COLORS.reset}\n`);
        return;
      }

      const lines = diffOutput.split('\n');
      for (const line of lines) {
        const [status, file] = line.split('\t');
        if (status === 'A' && this.isRelevantFile(file)) {
          this.newFiles.push(file);
        }
      }

      if (this.newFiles.length === 0) {
        console.log(`${COLORS.green}✅ No new files to validate${COLORS.reset}\n`);
        return;
      }

      console.log(`${COLORS.bright}Found ${this.newFiles.length} new file(s):${COLORS.reset}`);
      this.newFiles.forEach(f => console.log(`  - ${f}`));
      console.log();

      // Analyze each new file
      for (const file of this.newFiles) {
        await this.analyzeFile(file);
      }
    } catch (error) {
      console.log(`${COLORS.yellow}⚠️  Could not read git changes: ${error.message}${COLORS.reset}`);
      console.log(`${COLORS.yellow}   Running in file check mode instead...${COLORS.reset}\n`);
    }
  }

  /**
   * Validate specific files
   */
  async validateFiles(files) {
    console.log(`${COLORS.cyan}📋 Validating ${files.length} file(s)...${COLORS.reset}\n`);

    for (const file of files) {
      if (!existsSync(file)) {
        console.log(`${COLORS.yellow}⚠️  File not found: ${file}${COLORS.reset}`);
        continue;
      }
      await this.analyzeFile(file);
    }
  }

  /**
   * Interactive mode - ask user what they're building
   */
  async interactiveMode() {
    console.log(`${COLORS.bright}🤔 Interactive Search Assistant${COLORS.reset}\n`);
    console.log('What are you building? (e.g., "SEO extractor", "authentication service")\n');

    // In a real implementation, you'd use readline or inquirer
    // For now, we'll just show example searches
    console.log(`${COLORS.cyan}Example searches you should perform:${COLORS.reset}\n`);
    this.showSearchExamples();
  }

  /**
   * Analyze a single file for potential duplications
   */
  async analyzeFile(filePath) {
    console.log(`${COLORS.bright}Analyzing: ${filePath}${COLORS.reset}`);

    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileName = basename(filePath, extname(filePath));

      // Extract key terms from the file
      const keywords = this.extractKeywords(content, fileName);
      
      if (keywords.length === 0) {
        console.log(`  ${COLORS.yellow}⚠️  Could not extract meaningful keywords${COLORS.reset}\n`);
        return;
      }

      console.log(`  ${COLORS.cyan}Keywords:${COLORS.reset} ${keywords.join(', ')}\n`);

      // Search for existing similar code
      const existingCode = await this.searchExistingCode(keywords);

      if (existingCode.length > 0) {
        this.violations.push({
          file: filePath,
          keywords: keywords,
          existingCode: existingCode
        });

        console.log(`  ${COLORS.red}❌ Potential duplication detected!${COLORS.reset}`);
        console.log(`  ${COLORS.red}   Found ${existingCode.length} similar file(s):${COLORS.reset}\n`);
        existingCode.slice(0, 5).forEach(match => {
          console.log(`     📄 ${match.file} (${match.matches} matches)`);
        });
        if (existingCode.length > 5) {
          console.log(`     ... and ${existingCode.length - 5} more`);
        }
        console.log();

        this.suggestions.push({
          file: filePath,
          message: 'Review these existing files before proceeding',
          existingFiles: existingCode.map(e => e.file)
        });
      } else {
        console.log(`  ${COLORS.green}✅ No similar existing code found${COLORS.reset}\n`);
      }
    } catch (error) {
      console.log(`  ${COLORS.red}❌ Error analyzing file: ${error.message}${COLORS.reset}\n`);
    }
  }

  /**
   * Extract meaningful keywords from file content
   */
  extractKeywords(content, fileName) {
    const keywords = new Set();

    // Add filename-based keywords
    const fileWords = fileName
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .split(/[-_\s]+/)
      .filter(w => w.length > 3);
    
    fileWords.forEach(w => keywords.add(w));

    // Extract class names
    const classMatches = content.matchAll(/class\s+(\w+)/g);
    for (const match of classMatches) {
      const className = match[1]
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3);
      className.forEach(w => keywords.add(w));
    }

    // Extract function names
    const functionMatches = content.matchAll(/(?:function|const|let|var)\s+(\w+)/g);
    for (const match of functionMatches) {
      if (match[1].length > 5) {
        keywords.add(match[1].toLowerCase());
      }
    }

    // Extract from comments (often describe purpose)
    const commentMatches = content.matchAll(/\/\*\*?\s*([^*]+)\*\//g);
    for (const match of commentMatches) {
      const words = match[1]
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 5 && !w.match(/^(this|that|from|with|function|class|const|return)$/));
      words.slice(0, 3).forEach(w => keywords.add(w));
    }

    // Common domain keywords
    const domainPatterns = [
      { pattern: /optimization/gi, keyword: 'optimization' },
      { pattern: /crawl|scrape|spider/gi, keyword: 'crawler' },
      { pattern: /authentication|auth|login/gi, keyword: 'auth' },
      { pattern: /blockchain|ethereum|web3/gi, keyword: 'blockchain' },
      { pattern: /database|db|query|sql/gi, keyword: 'database' },
      { pattern: /api|endpoint|route/gi, keyword: 'api' },
      { pattern: /component|render|jsx/gi, keyword: 'component' },
      { pattern: /test|spec|mock/gi, keyword: 'test' }
    ];

    domainPatterns.forEach(({ pattern, keyword }) => {
      if (pattern.test(content)) {
        keywords.add(keyword);
      }
    });

    return Array.from(keywords).slice(0, 10); // Limit to top 10
  }

  /**
   * Search existing codebase for similar functionality
   */
  async searchExistingCode(keywords) {
    const results = [];
    const searchDirs = this.searchableDirectories.filter(dir => existsSync(dir));

    for (const dir of searchDirs) {
      const files = this.getAllFiles(dir);
      
      for (const file of files) {
        if (!this.isRelevantFile(file)) continue;

        try {
          const content = readFileSync(file, 'utf-8').toLowerCase();
          const matches = keywords.filter(keyword => 
            content.includes(keyword.toLowerCase())
          ).length;

          if (matches >= 2) { // At least 2 keyword matches
            results.push({
              file: file,
              matches: matches,
              keywords: keywords.filter(k => content.includes(k.toLowerCase()))
            });
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    // Sort by number of matches (descending)
    return results.sort((a, b) => b.matches - a.matches);
  }

  /**
   * Recursively get all files in directory
   */
  getAllFiles(dirPath, arrayOfFiles = []) {
    const files = readdirSync(dirPath);

    files.forEach(file => {
      const fullPath = join(dirPath, file);
      
      if (statSync(fullPath).isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
        }
      } else {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  }

  /**
   * Check if file is relevant for analysis
   */
  isRelevantFile(file) {
    const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    const ext = extname(file);
    const name = basename(file);

    return (
      relevantExtensions.includes(ext) &&
      !name.includes('.test.') &&
      !name.includes('.spec.') &&
      !file.includes('node_modules') &&
      !file.includes('dist') &&
      !file.includes('build')
    );
  }

  /**
   * Show example search commands
   */
  showSearchExamples() {
    const examples = [
      {
        feature: 'SEO extractor',
        keywords: ['seo', 'meta', 'og:', 'extract', 'attribute'],
        commands: [
          'grep -r "seo" services/ src/',
          'find . -name "*seo*" -name "*meta*"'
        ]
      },
      {
        feature: 'Authentication service',
        keywords: ['auth', 'login', 'jwt', 'token', 'session'],
        commands: [
          'grep -r "authenticate" api/ src/',
          'find . -name "*auth*" -name "*login*"'
        ]
      },
      {
        feature: 'Database operations',
        keywords: ['db', 'query', 'pool', 'connection', 'sql'],
        commands: [
          'grep -r "pool.query" .',
          'find . -name "*database*" -name "*db*"'
        ]
      }
    ];

    examples.forEach(example => {
      console.log(`${COLORS.bright}${example.feature}:${COLORS.reset}`);
      console.log(`  ${COLORS.cyan}Keywords:${COLORS.reset} ${example.keywords.join(', ')}`);
      console.log(`  ${COLORS.cyan}Commands:${COLORS.reset}`);
      example.commands.forEach(cmd => console.log(`    $ ${cmd}`));
      console.log();
    });
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log(`${COLORS.bright}═══════════════════════════════════════${COLORS.reset}\n`);

    if (this.violations.length === 0) {
      console.log(`${COLORS.green}${COLORS.bright}✅ PASSED: Search-First Rule Validation${COLORS.reset}\n`);
      console.log('No potential duplications detected.\n');
    } else {
      console.log(`${COLORS.red}${COLORS.bright}❌ FAILED: Search-First Rule Validation${COLORS.reset}\n`);
      console.log(`Found ${this.violations.length} potential violation(s):\n`);

      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${COLORS.bright}${violation.file}${COLORS.reset}`);
        console.log(`   Keywords: ${violation.keywords.join(', ')}`);
        console.log(`   Similar files found: ${violation.existingCode.length}`);
        console.log();
      });

      console.log(`${COLORS.yellow}${COLORS.bright}⚠️  ACTION REQUIRED:${COLORS.reset}`);
      console.log(`${COLORS.yellow}Before proceeding, you must:${COLORS.reset}\n`);
      console.log('1. Review the existing files listed above');
      console.log('2. Determine if any can be reused or extended');
      console.log('3. Document why new code is necessary (if it is)');
      console.log('4. Add a comment in your PR explaining the search process\n');

      console.log(`${COLORS.cyan}Required PR Comment Format:${COLORS.reset}`);
      console.log('```');
      console.log('## Existing Code Search');
      console.log('- [x] Searched for similar functionality');
      console.log('- [x] Reviewed existing services');
      console.log('- [ ] Found existing code: [list files if found]');
      console.log('- [ ] Reason for new code: [explain why existing code cannot be used]');
      console.log('```\n');
    }

    if (this.suggestions.length > 0) {
      console.log(`${COLORS.cyan}${COLORS.bright}💡 Suggestions:${COLORS.reset}\n`);
      this.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion.message}`);
        console.log(`   For: ${suggestion.file}`);
        if (suggestion.existingFiles && suggestion.existingFiles.length > 0) {
          console.log(`   Review: ${suggestion.existingFiles.slice(0, 3).join(', ')}`);
        }
        console.log();
      });
    }

    console.log(`${COLORS.bright}═══════════════════════════════════════${COLORS.reset}\n`);
  }
}

// CLI Interface
const args = process.argv.slice(2);
const options = {
  interactive: args.includes('--interactive'),
  files: args.includes('--files') 
    ? args.slice(args.indexOf('--files') + 1).filter(a => !a.startsWith('--'))
    : null
};

const validator = new SearchFirstValidator();
validator.validate(options).then(success => {
  process.exit(success ? 0 : 1);
});

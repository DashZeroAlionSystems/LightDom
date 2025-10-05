#!/usr/bin/env node

/**
 * Cursor Work Validation Script
 * Prevents redundant work and file creation
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CursorWorkValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.forbiddenPatterns = [
      'README-*.md',
      '*_COMPLETE.md',
      '*_STATUS.md', 
      '*_SUMMARY.md',
      '*_INTEGRATION.md',
      '*_AUDIT.md',
      '*_TRACKER.md',
      '*_GUIDE.md',
      'CURSOR_*.md',
      '*_PROGRESS*.md',
      '*_TODO*.md'
    ];
    this.existingFiles = new Map();
    this.projectState = this.loadProjectState();
  }

  loadProjectState() {
    try {
      const stateFile = path.join(this.projectRoot, '.cursor/project-memory.md');
      if (fs.existsSync(stateFile)) {
        return fs.readFileSync(stateFile, 'utf8');
      }
    } catch (error) {
      console.warn('Could not load project state:', error.message);
    }
    return '';
  }

  async validateBeforeWork(taskDescription) {
    console.log('🔍 Validating work before starting...');
    console.log(`Task: ${taskDescription}`);
    
    const results = {
      canProceed: true,
      warnings: [],
      errors: [],
      suggestions: []
    };

    // Check for existing implementations
    const existingWork = await this.searchExistingWork(taskDescription);
    if (existingWork.length > 0) {
      results.warnings.push(`Found existing work: ${existingWork.join(', ')}`);
      results.suggestions.push('Consider updating existing files instead of creating new ones');
    }

    // Check documentation status
    const docStatus = await this.checkDocumentationStatus(taskDescription);
    if (docStatus.exists) {
      results.warnings.push(`Documentation already exists: ${docStatus.files.join(', ')}`);
      results.suggestions.push('Update existing documentation instead of creating new files');
    }

    // Check API endpoints
    const apiStatus = await this.checkAPIEndpoints(taskDescription);
    if (apiStatus.exists) {
      results.warnings.push(`API endpoints already exist: ${apiStatus.endpoints.join(', ')}`);
      results.suggestions.push('Consider extending existing API instead of creating new endpoints');
    }

    // Check components
    const componentStatus = await this.checkComponents(taskDescription);
    if (componentStatus.exists) {
      results.warnings.push(`Components already exist: ${componentStatus.components.join(', ')}`);
      results.suggestions.push('Consider updating existing components instead of creating new ones');
    }

    // Check if task is forbidden
    if (this.isTaskForbidden(taskDescription)) {
      results.errors.push('This task appears to be forbidden based on project state');
      results.canProceed = false;
    }

    // Display results
    this.displayValidationResults(results);

    return results;
  }

  async searchExistingWork(taskDescription) {
    const keywords = this.extractKeywords(taskDescription);
    const searchPatterns = [
      'src/**/*.{ts,tsx,js,jsx}',
      'api-server-express.js',
      '**/*.md'
    ];

    const results = [];
    
    for (const pattern of searchPatterns) {
      const files = glob.sync(pattern, { cwd: this.projectRoot });
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
          const matches = keywords.filter(keyword => 
            content.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (matches.length > 0) {
            results.push(file);
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    return [...new Set(results)];
  }

  async checkDocumentationStatus(taskDescription) {
    const keywords = this.extractKeywords(taskDescription);
    const docFiles = glob.sync('**/*.md', { cwd: this.projectRoot });
    
    const matches = [];
    
    for (const file of docFiles) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
        const keywordMatches = keywords.filter(keyword => 
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (keywordMatches.length > 0) {
          matches.push(file);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      exists: matches.length > 0,
      files: matches
    };
  }

  async checkAPIEndpoints(taskDescription) {
    const apiFile = path.join(this.projectRoot, 'api-server-express.js');
    if (!fs.existsSync(apiFile)) {
      return { exists: false, endpoints: [] };
    }

    const content = fs.readFileSync(apiFile, 'utf8');
    const keywords = this.extractKeywords(taskDescription);
    const endpoints = [];

    // Look for API route definitions
    const routeMatches = content.match(/app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g);
    if (routeMatches) {
      for (const match of routeMatches) {
        const endpoint = match.match(/['"`]([^'"`]+)['"`]/)[1];
        const keywordMatches = keywords.filter(keyword => 
          endpoint.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (keywordMatches.length > 0) {
          endpoints.push(endpoint);
        }
      }
    }

    return {
      exists: endpoints.length > 0,
      endpoints: endpoints
    };
  }

  async checkComponents(taskDescription) {
    const keywords = this.extractKeywords(taskDescription);
    const componentFiles = glob.sync('src/components/**/*.{ts,tsx,js,jsx}', { cwd: this.projectRoot });
    
    const matches = [];
    
    for (const file of componentFiles) {
      try {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
        const keywordMatches = keywords.filter(keyword => 
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (keywordMatches.length > 0) {
          matches.push(file);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      exists: matches.length > 0,
      components: matches
    };
  }

  isTaskForbidden(taskDescription) {
    const forbiddenKeywords = [
      'create new auth',
      'create new login',
      'create new signup',
      'create new dashboard',
      'create new mining',
      'create new api',
      'rewrite auth',
      'rewrite login',
      'rewrite dashboard',
      'rewrite mining',
      'create readme',
      'create status file',
      'create summary file',
      'create integration file',
      'create audit file',
      'create tracker file',
      'create guide file'
    ];

    const lowerDescription = taskDescription.toLowerCase();
    return forbiddenKeywords.some(keyword => lowerDescription.includes(keyword));
  }

  extractKeywords(text) {
    // Extract meaningful keywords from task description
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'may', 'use', 'her', 'many', 'some', 'time', 'very', 'when', 'much', 'then', 'them', 'can', 'only', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'has', 'had', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
    
    return [...new Set(words)];
  }

  displayValidationResults(results) {
    console.log('\n📋 Validation Results:');
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (results.suggestions.length > 0) {
      console.log('\n💡 Suggestions:');
      results.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    }
    
    console.log(`\n${results.canProceed ? '✅ Can proceed with work' : '❌ Cannot proceed - fix errors first'}`);
  }

  validateFileCreation(filePath) {
    console.log(`🔍 Validating file creation: ${filePath}`);
    
    const results = {
      canCreate: true,
      warnings: [],
      errors: [],
      suggestions: []
    };

    // Check forbidden patterns
    for (const pattern of this.forbiddenPatterns) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      if (regex.test(filePath)) {
        results.errors.push(`File matches forbidden pattern: ${pattern}`);
        results.canCreate = false;
      }
    }

    // Check if file already exists
    if (fs.existsSync(path.join(this.projectRoot, filePath))) {
      results.warnings.push('File already exists');
      results.suggestions.push('Consider updating existing file instead of creating new one');
    }

    // Check for similar files
    const similarFiles = this.findSimilarFiles(filePath);
    if (similarFiles.length > 0) {
      results.warnings.push(`Similar files found: ${similarFiles.join(', ')}`);
      results.suggestions.push('Consider consolidating with existing files');
    }

    this.displayValidationResults(results);
    return results;
  }

  findSimilarFiles(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const dirName = path.dirname(filePath);
    
    const similarFiles = [];
    const searchPattern = path.join(dirName, `${fileName}*`);
    const files = glob.sync(searchPattern, { cwd: this.projectRoot });
    
    return files.filter(file => file !== filePath);
  }
}

// CLI usage
if (require.main === module) {
  const validator = new CursorWorkValidator();
  const taskDescription = process.argv[2] || 'No task description provided';
  
  validator.validateBeforeWork(taskDescription)
    .then(results => {
      process.exit(results.canProceed ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation error:', error);
      process.exit(1);
    });
}

module.exports = CursorWorkValidator;
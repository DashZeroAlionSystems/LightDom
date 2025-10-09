#!/usr/bin/env node

/**
 * Cursor Documentation Cleanup Script
 * Consolidates duplicate documentation files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentationCleanup {
  constructor() {
    this.projectRoot = process.cwd();
    this.duplicateFiles = [
      'COMPLETE_INTEGRATION_STATUS.md',
      'PRODUCTION_READY_STATUS.md', 
      'INTEGRATION_STATUS.md',
      'CURSOR_TODO_LIST.md',
      'CURSOR_PROGRESS_TRACKER.md',
      'CURSOR_SESSION_1_GUIDE.md',
      'CURSOR_ACTIONABLE_TODOS.md',
      'SPACE_BRIDGE_ANALYTICS_COMPLETE.md',
      'DOCKER_SETUP_COMPLETE.md',
      'METAVERSE_GRAPHICS_AND_MINING_COMPLETE.md',
      'TESTING_COMPLETE.md',
      'FUNCTIONALITY_ADDED.md',
      'FUNCTIONALITY_AUDIT_README.md',
      'FUNCTIONALITY_AUDIT_CHARTS.md',
      'PWA_STATUS_COMPLETE.md',
      'MISSING_FEATURES_COMPLETE.md',
      'SPACE_BRIDGE_INTEGRATION_COMPLETE.md',
      'IMPLEMENTATION_SUMMARY.md',
      'SETUP_SUMMARY.md',
      'BLOCKCHAIN_APP_README.md',
      'README-BLOCKCHAIN-COMPLETE.md',
      'README-COMPLETE.md'
    ];
    this.keepFiles = [
      'README.md',
      'CONSOLIDATED_PROJECT_STATUS.md',
      'SETUP_GUIDE.md',
      'ARCHITECTURE_DIAGRAM.md',
      'QUICK_START.md'
    ];
  }

  async cleanup() {
    console.log('🧹 Starting documentation cleanup...');
    
    // Create backup directory
    const backupDir = path.join(this.projectRoot, '.cursor/backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    let cleanedCount = 0;
    let consolidatedContent = '';

    // Process each duplicate file
    for (const file of this.duplicateFiles) {
      const filePath = path.join(this.projectRoot, file);
      
      if (fs.existsSync(filePath)) {
        console.log(`📄 Processing: ${file}`);
        
        // Read content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract useful information
        const usefulContent = this.extractUsefulContent(content, file);
        if (usefulContent) {
          consolidatedContent += `\n\n## From ${file}\n\n${usefulContent}`;
        }
        
        // Move to backup
        const backupPath = path.join(backupDir, file);
        fs.copyFileSync(filePath, backupPath);
        
        // Delete original
        fs.unlinkSync(filePath);
        cleanedCount++;
        
        console.log(`✅ Moved to backup: ${file}`);
      }
    }

    // Update consolidated status file
    if (consolidatedContent) {
      const consolidatedFile = path.join(this.projectRoot, 'CONSOLIDATED_PROJECT_STATUS.md');
      const existingContent = fs.readFileSync(consolidatedFile, 'utf8');
      const updatedContent = existingContent + '\n\n---\n\n## Additional Information\n' + consolidatedContent;
      fs.writeFileSync(consolidatedFile, updatedContent);
      console.log('📝 Updated consolidated status file');
    }

    console.log(`\n🎉 Cleanup complete!`);
    console.log(`📊 Files cleaned: ${cleanedCount}`);
    console.log(`📁 Backup location: ${backupDir}`);
    console.log(`📄 Consolidated file: CONSOLIDATED_PROJECT_STATUS.md`);
  }

  extractUsefulContent(content, filename) {
    // Extract useful information based on file type
    const lines = content.split('\n');
    const usefulLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and headers
      if (line.trim() === '' || line.startsWith('#')) {
        continue;
      }
      
      // Extract key information
      if (line.includes('✅') || line.includes('❌') || line.includes('🎯') || 
          line.includes('🚀') || line.includes('📊') || line.includes('🔧')) {
        usefulLines.push(line);
      }
      
      // Extract file lists
      if (line.includes('Files:') || line.includes('API:') || line.includes('Status:')) {
        usefulLines.push(line);
      }
      
      // Extract important notes
      if (line.includes('DO NOT') || line.includes('IMPORTANT') || line.includes('NOTE:')) {
        usefulLines.push(line);
      }
    }
    
    return usefulLines.length > 0 ? usefulLines.join('\n') : null;
  }

  async validateCleanup() {
    console.log('\n🔍 Validating cleanup...');
    
    let remainingDuplicates = 0;
    
    for (const file of this.duplicateFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`⚠️  Still exists: ${file}`);
        remainingDuplicates++;
      }
    }
    
    if (remainingDuplicates === 0) {
      console.log('✅ All duplicate files cleaned up successfully');
    } else {
      console.log(`⚠️  ${remainingDuplicates} files still need cleanup`);
    }
    
    // Check if essential files still exist
    const essentialFiles = ['README.md', 'CONSOLIDATED_PROJECT_STATUS.md'];
    for (const file of essentialFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Essential file exists: ${file}`);
      } else {
        console.log(`❌ Missing essential file: ${file}`);
      }
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new DocumentationCleanup();
  
  cleanup.cleanup()
    .then(() => cleanup.validateCleanup())
    .then(() => {
      console.log('\n🎉 Documentation cleanup completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}

export default DocumentationCleanup;
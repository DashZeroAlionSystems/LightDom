#!/usr/bin/env node

/**
 * Visual UX Crawler and Analysis Tool
 * 
 * This script crawls the LightDom application to identify UX improvements
 * that can be implemented in demos using design system components.
 * 
 * It analyzes:
 * - Component usage patterns
 * - UI/UX inconsistencies
 * - Opportunities for design system adoption
 * - Accessibility issues
 * - Visual hierarchy and spacing
 * 
 * Usage: node scripts/ux-crawler.js [url]
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class UXCrawler {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.outputDir = path.join(rootDir, 'ux-analysis');
    this.browser = null;
    this.page = null;
    this.findings = {
      pages: [],
      components: [],
      uxIssues: [],
      opportunities: [],
      accessibility: [],
      summary: {}
    };
  }

  async initialize() {
    console.log('🚀 Initializing UX Crawler...\n');
    
    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Launch browser
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--disable-dev-shm-usage']
    });
    this.page = await this.browser.newPage();
    
    console.log('✅ Browser initialized\n');
  }

  async crawlPage(url, pageName) {
    console.log(`🔍 Crawling: ${pageName} (${url})`);
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const analysis = {
        name: pageName,
        url: url,
        timestamp: new Date().toISOString(),
        components: await this.analyzeComponents(),
        layout: await this.analyzeLayout(),
        accessibility: await this.analyzeAccessibility(),
        designSystem: await this.analyzeDesignSystemUsage(),
        spacing: await this.analyzeSpacing(),
        colors: await this.analyzeColors(),
        typography: await this.analyzeTypography()
      };
      
      // Take screenshot
      const screenshotPath = path.join(this.outputDir, `${pageName.toLowerCase().replace(/\s+/g, '-')}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      analysis.screenshot = screenshotPath;
      
      this.findings.pages.push(analysis);
      
      console.log(`   ✅ Analysis complete`);
      console.log(`   📸 Screenshot saved: ${screenshotPath}`);
      console.log();
      
      return analysis;
      
    } catch (error) {
      console.error(`   ❌ Error crawling ${pageName}:`, error.message);
      console.log();
      return null;
    }
  }

  async analyzeComponents() {
    return await this.page.evaluate(() => {
      const components = {
        buttons: Array.from(document.querySelectorAll('button')).length,
        inputs: Array.from(document.querySelectorAll('input')).length,
        cards: Array.from(document.querySelectorAll('[class*="card"]')).length,
        badges: Array.from(document.querySelectorAll('[class*="badge"]')).length,
        modals: Array.from(document.querySelectorAll('[role="dialog"]')).length,
        lists: Array.from(document.querySelectorAll('ul, ol')).length,
        tables: Array.from(document.querySelectorAll('table')).length,
        forms: Array.from(document.querySelectorAll('form')).length,
        links: Array.from(document.querySelectorAll('a')).length
      };
      
      return components;
    });
  }

  async analyzeLayout() {
    return await this.page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      
      // Check for fixed/sticky elements
      const fixedElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const style = window.getComputedStyle(el);
          return style.position === 'fixed' || style.position === 'sticky';
        }).length;
      
      // Check for grid/flex layouts
      const gridLayouts = Array.from(document.querySelectorAll('*'))
        .filter(el => window.getComputedStyle(el).display === 'grid').length;
      
      const flexLayouts = Array.from(document.querySelectorAll('*'))
        .filter(el => window.getComputedStyle(el).display === 'flex').length;
      
      return {
        viewport: { width: viewportWidth, height: viewportHeight },
        scrollHeight,
        fixedElements,
        gridLayouts,
        flexLayouts
      };
    });
  }

  async analyzeAccessibility() {
    return await this.page.evaluate(() => {
      const issues = [];
      
      // Check for images without alt text
      const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter(
        img => !img.getAttribute('alt')
      );
      if (imagesWithoutAlt.length > 0) {
        issues.push({
          severity: 'medium',
          type: 'missing-alt-text',
          count: imagesWithoutAlt.length,
          message: `${imagesWithoutAlt.length} images without alt text`
        });
      }
      
      // Check for buttons without accessible names
      const buttonsWithoutNames = Array.from(document.querySelectorAll('button')).filter(
        btn => !btn.textContent.trim() && !btn.getAttribute('aria-label')
      );
      if (buttonsWithoutNames.length > 0) {
        issues.push({
          severity: 'high',
          type: 'missing-button-name',
          count: buttonsWithoutNames.length,
          message: `${buttonsWithoutNames.length} buttons without accessible names`
        });
      }
      
      // Check for form inputs without labels
      const inputsWithoutLabels = Array.from(document.querySelectorAll('input')).filter(
        input => {
          const id = input.getAttribute('id');
          return !id || !document.querySelector(`label[for="${id}"]`);
        }
      );
      if (inputsWithoutLabels.length > 0) {
        issues.push({
          severity: 'high',
          type: 'missing-input-label',
          count: inputsWithoutLabels.length,
          message: `${inputsWithoutLabels.length} inputs without labels`
        });
      }
      
      // Check for low contrast (simplified check)
      const colorContrast = {
        checked: true,
        message: 'Color contrast should be verified with automated tools'
      };
      issues.push({
        severity: 'info',
        type: 'color-contrast',
        ...colorContrast
      });
      
      return issues;
    });
  }

  async analyzeDesignSystemUsage() {
    return await this.page.evaluate(() => {
      // Check for design system classes
      const dsClasses = [
        'md3-', 'bg-surface', 'text-on-surface', 'border-outline',
        'bg-primary', 'text-primary', 'rounded-', 'gap-', 'space-'
      ];
      
      const allElements = document.querySelectorAll('*');
      let dsElementCount = 0;
      
      Array.from(allElements).forEach(el => {
        const className = el.className;
        if (typeof className === 'string') {
          if (dsClasses.some(ds => className.includes(ds))) {
            dsElementCount++;
          }
        }
      });
      
      const usage = {
        elementsUsingDS: dsElementCount,
        totalElements: allElements.length,
        percentage: ((dsElementCount / allElements.length) * 100).toFixed(2)
      };
      
      return usage;
    });
  }

  async analyzeSpacing() {
    return await this.page.evaluate(() => {
      const spacingIssues = [];
      
      // Check for inline styles with spacing
      const inlineSpacingElements = Array.from(document.querySelectorAll('[style*="margin"], [style*="padding"]'));
      if (inlineSpacingElements.length > 0) {
        spacingIssues.push({
          type: 'inline-spacing',
          count: inlineSpacingElements.length,
          message: `${inlineSpacingElements.length} elements with inline spacing - consider using design system spacing classes`
        });
      }
      
      // Check for common spacing patterns
      const spacingClasses = ['gap-', 'space-', 'p-', 'm-'];
      const spacingClassCount = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const className = el.className;
          return typeof className === 'string' && spacingClasses.some(sc => className.includes(sc));
        }).length;
      
      return {
        issues: spacingIssues,
        usingSpacingClasses: spacingClassCount
      };
    });
  }

  async analyzeColors() {
    return await this.page.evaluate(() => {
      const colorMap = new Map();
      
      Array.from(document.querySelectorAll('*')).forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        if (color && color !== 'rgba(0, 0, 0, 0)') {
          colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          colorMap.set(bgColor, (colorMap.get(bgColor) || 0) + 1);
        }
      });
      
      const uniqueColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      return {
        uniqueColorCount: colorMap.size,
        topColors: uniqueColors
      };
    });
  }

  async analyzeTypography() {
    return await this.page.evaluate(() => {
      const fontMap = new Map();
      const sizeMap = new Map();
      
      Array.from(document.querySelectorAll('*')).forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontFamily = styles.fontFamily;
        const fontSize = styles.fontSize;
        
        if (fontFamily) {
          fontMap.set(fontFamily, (fontMap.get(fontFamily) || 0) + 1);
        }
        if (fontSize) {
          sizeMap.set(fontSize, (sizeMap.get(fontSize) || 0) + 1);
        }
      });
      
      return {
        uniqueFonts: fontMap.size,
        topFonts: Array.from(fontMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
        uniqueSizes: sizeMap.size,
        topSizes: Array.from(sizeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
      };
    });
  }

  async generateOpportunities() {
    console.log('🎯 Generating UX improvement opportunities...\n');
    
    this.findings.pages.forEach(page => {
      // Design system adoption opportunities
      if (parseFloat(page.designSystem.percentage) < 50) {
        this.findings.opportunities.push({
          page: page.name,
          type: 'design-system-adoption',
          priority: 'high',
          description: `Only ${page.designSystem.percentage}% of elements use design system classes`,
          recommendation: 'Migrate components to use design system utilities for consistency'
        });
      }
      
      // Accessibility issues
      page.accessibility.forEach(issue => {
        if (issue.severity === 'high') {
          this.findings.opportunities.push({
            page: page.name,
            type: 'accessibility',
            priority: 'high',
            description: issue.message,
            recommendation: `Fix ${issue.type} issues to improve accessibility`
          });
        }
      });
      
      // Spacing consistency
      if (page.spacing.issues.length > 0) {
        this.findings.opportunities.push({
          page: page.name,
          type: 'spacing-consistency',
          priority: 'medium',
          description: 'Inconsistent spacing patterns detected',
          recommendation: 'Use design system spacing scale (4px grid) consistently'
        });
      }
      
      // Color palette
      if (page.colors.uniqueColorCount > 15) {
        this.findings.opportunities.push({
          page: page.name,
          type: 'color-palette',
          priority: 'medium',
          description: `${page.colors.uniqueColorCount} unique colors detected`,
          recommendation: 'Consolidate to Material Design 3 color tokens'
        });
      }
    });
    
    console.log(`   ✅ Generated ${this.findings.opportunities.length} opportunities\n`);
  }

  async generateReport() {
    console.log('📄 Generating final report...\n');
    
    // Summary statistics
    this.findings.summary = {
      totalPages: this.findings.pages.length,
      totalOpportunities: this.findings.opportunities.length,
      highPriorityCount: this.findings.opportunities.filter(o => o.priority === 'high').length,
      mediumPriorityCount: this.findings.opportunities.filter(o => o.priority === 'medium').length,
      avgDesignSystemUsage: (
        this.findings.pages.reduce((sum, p) => sum + parseFloat(p.designSystem.percentage), 0) / 
        this.findings.pages.length
      ).toFixed(2),
      timestamp: new Date().toISOString()
    };
    
    // Save JSON report
    const reportPath = path.join(this.outputDir, 'ux-analysis-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.findings, null, 2));
    
    // Generate markdown report
    const mdReport = this.generateMarkdownReport();
    const mdPath = path.join(this.outputDir, 'UX_ANALYSIS_REPORT.md');
    await fs.writeFile(mdPath, mdReport);
    
    console.log(`   ✅ JSON report: ${reportPath}`);
    console.log(`   ✅ Markdown report: ${mdPath}\n`);
  }

  generateMarkdownReport() {
    let md = '# UX Analysis Report\n\n';
    md += `Generated: ${new Date().toISOString()}\n\n`;
    
    md += '## Summary\n\n';
    md += `- **Pages Analyzed:** ${this.findings.summary.totalPages}\n`;
    md += `- **Opportunities Found:** ${this.findings.summary.totalOpportunities}\n`;
    md += `- **High Priority:** ${this.findings.summary.highPriorityCount}\n`;
    md += `- **Medium Priority:** ${this.findings.summary.mediumPriorityCount}\n`;
    md += `- **Avg Design System Usage:** ${this.findings.summary.avgDesignSystemUsage}%\n\n`;
    
    md += '## Improvement Opportunities\n\n';
    
    const byPriority = this.findings.opportunities.reduce((acc, opp) => {
      acc[opp.priority] = acc[opp.priority] || [];
      acc[opp.priority].push(opp);
      return acc;
    }, {});
    
    ['high', 'medium', 'low'].forEach(priority => {
      if (byPriority[priority] && byPriority[priority].length > 0) {
        md += `### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority\n\n`;
        byPriority[priority].forEach(opp => {
          md += `#### ${opp.page} - ${opp.type}\n\n`;
          md += `**Issue:** ${opp.description}\n\n`;
          md += `**Recommendation:** ${opp.recommendation}\n\n`;
          md += '---\n\n';
        });
      }
    });
    
    md += '## Page Details\n\n';
    this.findings.pages.forEach(page => {
      md += `### ${page.name}\n\n`;
      md += `- **URL:** ${page.url}\n`;
      md += `- **Design System Usage:** ${page.designSystem.percentage}%\n`;
      md += `- **Components:** ${Object.entries(page.components).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
      md += `- **Accessibility Issues:** ${page.accessibility.length}\n`;
      md += `- **Screenshot:** [View](${path.basename(page.screenshot)})\n\n`;
    });
    
    return md;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ Cleanup complete\n');
  }

  async run() {
    try {
      await this.initialize();
      
      // Define pages to crawl
      const pagesToCrawl = [
        { url: `${this.baseUrl}/`, name: 'Home' },
        { url: `${this.baseUrl}/dashboard`, name: 'Dashboard' },
        { url: `${this.baseUrl}/design-system-showcase`, name: 'Design System Showcase' },
        { url: `${this.baseUrl}/complete-dashboard`, name: 'Complete Dashboard' },
        // Add more pages as needed
      ];
      
      // Crawl each page
      for (const page of pagesToCrawl) {
        await this.crawlPage(page.url, page.name);
      }
      
      // Generate opportunities
      await this.generateOpportunities();
      
      // Generate report
      await this.generateReport();
      
      console.log('='.repeat(80));
      console.log('✅ UX Analysis Complete!');
      console.log('='.repeat(80));
      console.log();
      console.log(`📊 Results: ${this.outputDir}`);
      console.log(`📈 Found ${this.findings.opportunities.length} improvement opportunities`);
      console.log(`🎯 ${this.findings.summary.highPriorityCount} high priority items`);
      console.log();
      
    } catch (error) {
      console.error('❌ UX Crawler failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  
  const crawler = new UXCrawler({ baseUrl });
  crawler.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { UXCrawler };

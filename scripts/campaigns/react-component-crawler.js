#!/usr/bin/env node

/**
 * React Component Discovery Crawler
 *
 * Mines React components from websites, Storybook instances, and GitHub repos.
 * Extracts: component props, TypeScript types, usage patterns, design tokens.
 * Stores in PostgreSQL with semantic indexing for discovery.
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReactComponentCrawler {
  constructor(config = {}) {
    this.config = {
      headless: config.headless !== false,
      outputDir: config.outputDir || path.join(__dirname, '../../data/component-discovery'),
      maxConcurrent: config.maxConcurrent || 3,
      timeout: config.timeout || 30000,
      userAgent: config.userAgent || 'LightDom Component Crawler 1.0',
      ...config,
    };

    this.browser = null;
    this.components = [];
    this.stats = {
      sitesVisited: 0,
      componentsFound: 0,
      propsExtracted: 0,
      typesExtracted: 0,
      errors: 0,
    };
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    // Ensure output directory exists
    await fs.mkdir(this.config.outputDir, { recursive: true });

    console.log('✅ React Component Crawler initialized');
  }

  /**
   * Crawl Storybook instance for components
   */
  async crawlStorybook(url) {
    console.log(`\n🔍 Crawling Storybook: ${url}`);
    const page = await this.browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: this.config.timeout });

      // Extract Storybook stories from sidebar
      const stories = await page.evaluate(() => {
        const storyItems = document.querySelectorAll(
          '[data-item-id], .sidebar-item, [role="treeitem"]'
        );
        return Array.from(storyItems).map(item => ({
          id: item.getAttribute('data-item-id') || item.id,
          title: item.textContent.trim(),
          path: item.querySelector('a')?.href || '',
        }));
      });

      console.log(`📚 Found ${stories.length} stories`);

      // Visit each story and extract component info
      for (const story of stories) {
        if (!story.path) continue;

        try {
          await page.goto(story.path, { waitUntil: 'networkidle2' });
          await page.waitForTimeout(1000);

          // Extract component from Storybook canvas
          const componentData = await this.extractStorybookComponent(page, story);
          if (componentData) {
            this.components.push(componentData);
            this.stats.componentsFound++;
          }
        } catch (error) {
          console.error(`❌ Error crawling story ${story.title}:`, error.message);
          this.stats.errors++;
        }
      }

      this.stats.sitesVisited++;
    } catch (error) {
      console.error(`❌ Error crawling Storybook:`, error.message);
      this.stats.errors++;
    } finally {
      await page.close();
    }
  }

  /**
   * Extract component data from Storybook page
   */
  async extractStorybookComponent(page, story) {
    const data = await page.evaluate(storyInfo => {
      const canvas =
        document.querySelector('#storybook-preview-iframe')?.contentDocument ||
        document.querySelector('[data-test-id="canvas"]') ||
        document;

      // Find React root
      const reactRoot = canvas.querySelector('[data-reactroot], [data-react-root], #root');
      if (!reactRoot) return null;

      // Extract component tree
      const extractComponentTree = (element, depth = 0) => {
        if (depth > 5) return null;

        const component = {
          tag: element.tagName.toLowerCase(),
          className: element.className,
          attributes: {},
          children: [],
          computedStyles: {},
        };

        // Extract attributes
        for (const attr of element.attributes) {
          component.attributes[attr.name] = attr.value;
        }

        // Extract key computed styles
        const styles = window.getComputedStyle(element);
        const keyStyles = [
          'display',
          'position',
          'flex-direction',
          'justify-content',
          'align-items',
          'padding',
          'margin',
          'border',
          'background-color',
          'color',
          'font-family',
          'font-size',
          'font-weight',
          'line-height',
          'border-radius',
          'box-shadow',
          'transition',
        ];

        keyStyles.forEach(prop => {
          const value = styles.getPropertyValue(prop);
          if (value && value !== 'none' && value !== 'normal') {
            component.computedStyles[prop] = value;
          }
        });

        // Recursively extract children
        for (const child of element.children) {
          const childComponent = extractComponentTree(child, depth + 1);
          if (childComponent) {
            component.children.push(childComponent);
          }
        }

        return component;
      };

      const tree = extractComponentTree(reactRoot);

      return {
        story: storyInfo,
        tree,
        timestamp: new Date().toISOString(),
      };
    }, story);

    // Extract props from Storybook controls panel
    const props = await this.extractStorybookProps(page);

    // Extract TypeScript types from source code if available
    const types = await this.extractStorybookTypes(page);

    return {
      ...data,
      props,
      types,
      source: 'storybook',
      url: page.url(),
    };
  }

  /**
   * Extract props from Storybook controls panel
   */
  async extractStorybookProps(page) {
    return await page.evaluate(() => {
      const controlsPanel = document.querySelector('[id*="controls"], [class*="controls"]');
      if (!controlsPanel) return [];

      const propRows = controlsPanel.querySelectorAll('[class*="row"], tr, [role="row"]');
      const props = [];

      propRows.forEach(row => {
        const name = row
          .querySelector('[class*="name"], td:first-child, [role="cell"]:first-child')
          ?.textContent.trim();
        const type = row.querySelector('[class*="type"], td:nth-child(2)')?.textContent.trim();
        const defaultValue = row
          .querySelector('[class*="default"], td:nth-child(3)')
          ?.textContent.trim();
        const description = row
          .querySelector('[class*="description"], td:nth-child(4)')
          ?.textContent.trim();

        if (name) {
          props.push({ name, type, defaultValue, description });
        }
      });

      return props;
    });
  }

  /**
   * Extract TypeScript types from Storybook source viewer
   */
  async extractStorybookTypes(page) {
    return await page.evaluate(() => {
      const docsPanel = document.querySelector('[id*="docs"], [class*="docs"]');
      if (!docsPanel) return null;

      const codeBlocks = docsPanel.querySelectorAll(
        'pre, code[class*="typescript"], code[class*="tsx"]'
      );
      const types = [];

      codeBlocks.forEach(block => {
        const code = block.textContent;

        // Extract interface/type definitions
        const interfaceMatch = code.match(/interface\s+(\w+)\s*{([^}]+)}/g);
        const typeMatch = code.match(/type\s+(\w+)\s*=\s*{([^}]+)}/g);

        if (interfaceMatch) types.push(...interfaceMatch);
        if (typeMatch) types.push(...typeMatch);
      });

      return types;
    });
  }

  /**
   * Crawl Material UI or similar design system docs
   */
  async crawlDesignSystemDocs(baseUrl, componentList = []) {
    console.log(`\n🎨 Crawling Design System: ${baseUrl}`);
    const page = await this.browser.newPage();

    try {
      for (const component of componentList) {
        const url = `${baseUrl}/${component}`;
        console.log(`  → ${component}`);

        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract component documentation
        const docData = await page.evaluate(() => {
          const getTextContent = selector => {
            const el = document.querySelector(selector);
            return el ? el.textContent.trim() : '';
          };

          const getAllTextContent = selector => {
            const els = document.querySelectorAll(selector);
            return Array.from(els).map(el => el.textContent.trim());
          };

          return {
            title: getTextContent('h1, [class*="title"]'),
            description: getTextContent('p, [class*="description"]'),
            apiTable: Array.from(
              document.querySelectorAll('table[class*="api"], table[class*="props"]')
            ).map(table => {
              const rows = table.querySelectorAll('tr');
              return Array.from(rows).map(row => {
                const cells = row.querySelectorAll('td, th');
                return Array.from(cells).map(cell => cell.textContent.trim());
              });
            }),
            examples: getAllTextContent('pre code, [class*="example"] code'),
            imports: getAllTextContent('code[class*="import"]'),
          };
        });

        // Extract live demos
        const demos = await this.extractLiveDemos(page);

        this.components.push({
          name: component,
          ...docData,
          demos,
          source: 'design-system-docs',
          url,
          timestamp: new Date().toISOString(),
        });

        this.stats.componentsFound++;
      }

      this.stats.sitesVisited++;
    } catch (error) {
      console.error(`❌ Error crawling design system:`, error.message);
      this.stats.errors++;
    } finally {
      await page.close();
    }
  }

  /**
   * Extract live demo components
   */
  async extractLiveDemos(page) {
    return await page.evaluate(() => {
      const demoContainers = document.querySelectorAll(
        '[class*="demo"], [class*="example"], [class*="preview"], [data-demo]'
      );

      return Array.from(demoContainers).map((container, index) => {
        const extractStyles = el => {
          const styles = window.getComputedStyle(el);
          return {
            display: styles.display,
            flexDirection: styles.flexDirection,
            padding: styles.padding,
            margin: styles.margin,
            backgroundColor: styles.backgroundColor,
            borderRadius: styles.borderRadius,
          };
        };

        return {
          id: `demo-${index}`,
          html: container.innerHTML,
          styles: extractStyles(container),
          screenshot: null, // Will be captured separately
        };
      });
    });
  }

  /**
   * Parse React component source code
   */
  parseReactComponent(sourceCode, filename = 'component.tsx') {
    try {
      const ast = parse(sourceCode, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const component = {
        name: null,
        props: [],
        state: [],
        hooks: [],
        exports: [],
      };

      traverse.default(ast, {
        // Extract function component
        FunctionDeclaration(path) {
          if (path.node.id) {
            component.name = path.node.id.name;
            component.type = 'function';
          }
        },

        // Extract arrow function component
        VariableDeclarator(path) {
          if (
            path.node.init?.type === 'ArrowFunctionExpression' &&
            path.node.id.type === 'Identifier'
          ) {
            component.name = path.node.id.name;
            component.type = 'arrow-function';
          }
        },

        // Extract class component
        ClassDeclaration(path) {
          if (path.node.id) {
            component.name = path.node.id.name;
            component.type = 'class';
          }
        },

        // Extract props interface
        TSInterfaceDeclaration(path) {
          if (path.node.id.name.includes('Props')) {
            component.propsInterface = {
              name: path.node.id.name,
              properties: path.node.body.body.map(prop => ({
                name: prop.key.name,
                type: prop.typeAnnotation?.typeAnnotation?.type || 'unknown',
                optional: prop.optional,
              })),
            };
          }
        },

        // Extract hooks
        CallExpression(path) {
          const callee = path.node.callee.name || path.node.callee.property?.name;
          if (callee?.startsWith('use')) {
            component.hooks.push({
              name: callee,
              args: path.node.arguments.length,
            });
          }
        },

        // Extract exports
        ExportDefaultDeclaration(path) {
          component.exports.push({
            type: 'default',
            name: path.node.declaration.name || component.name,
          });
        },

        ExportNamedDeclaration(path) {
          if (path.node.declaration) {
            component.exports.push({
              type: 'named',
              name:
                path.node.declaration.declarations?.[0]?.id?.name || path.node.declaration.id?.name,
            });
          }
        },
      });

      this.stats.componentsFound++;
      if (component.propsInterface) {
        this.stats.propsExtracted += component.propsInterface.properties.length;
        this.stats.typesExtracted++;
      }

      return component;
    } catch (error) {
      console.error(`❌ Error parsing component:`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Mine React components from GitHub repository
   */
  async mineGitHubRepo(repoUrl) {
    console.log(`\n📦 Mining GitHub repo: ${repoUrl}`);

    // Extract owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      console.error('❌ Invalid GitHub URL');
      return;
    }

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

    try {
      // Fetch file tree
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Filter React component files
      const componentFiles = data.tree.filter(
        file =>
          file.type === 'blob' &&
          (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) &&
          !file.path.includes('node_modules') &&
          !file.path.includes('.test.') &&
          !file.path.includes('.spec.')
      );

      console.log(`📄 Found ${componentFiles.length} React files`);

      // Fetch and parse each component file
      for (const file of componentFiles.slice(0, 100)) {
        // Limit to 100 files
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
          const fileResponse = await fetch(rawUrl);
          const sourceCode = await fileResponse.text();

          const component = this.parseReactComponent(sourceCode, file.path);
          if (component) {
            this.components.push({
              ...component,
              source: 'github',
              repoUrl,
              filePath: file.path,
              rawUrl,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`❌ Error fetching ${file.path}:`, error.message);
          this.stats.errors++;
        }
      }

      this.stats.sitesVisited++;
    } catch (error) {
      console.error(`❌ Error mining GitHub repo:`, error.message);
      this.stats.errors++;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        crawler: 'React Component Discovery Crawler',
        version: '1.0.0',
      },
      stats: this.stats,
      components: this.components,
      summary: {
        totalComponents: this.components.length,
        bySource: this.groupBy(this.components, 'source'),
        byType: this.groupBy(this.components, 'type'),
        topProps: this.getTopProps(),
        topHooks: this.getTopHooks(),
      },
    };

    // Save report
    const filename = `react-components-${Date.now()}.json`;
    const filepath = path.join(this.config.outputDir, filename);
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Report saved: ${filepath}`);
    return report;
  }

  groupBy(array, key) {
    return array.reduce((acc, item) => {
      const group = item[key] || 'unknown';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }

  getTopProps() {
    const propCounts = {};
    this.components.forEach(comp => {
      comp.props?.forEach(prop => {
        propCounts[prop.name] = (propCounts[prop.name] || 0) + 1;
      });
      comp.propsInterface?.properties?.forEach(prop => {
        propCounts[prop.name] = (propCounts[prop.name] || 0) + 1;
      });
    });

    return Object.entries(propCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));
  }

  getTopHooks() {
    const hookCounts = {};
    this.components.forEach(comp => {
      comp.hooks?.forEach(hook => {
        hookCounts[hook.name] = (hookCounts[hook.name] || 0) + 1;
      });
    });

    return Object.entries(hookCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));
  }

  /**
   * Cleanup
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('\n✅ Crawler closed');
  }
}

// CLI
async function main() {
  const crawler = new ReactComponentCrawler({
    headless: true,
    outputDir: path.join(__dirname, '../../data/component-discovery'),
  });

  await crawler.initialize();

  try {
    // Example: Crawl popular design systems
    const targets = [
      { type: 'storybook', url: 'https://storybook.js.org/' },
      { type: 'storybook', url: 'https://5ccbc373887ca40020446347-eajkxnflxz.chromatic.com/' }, // Ant Design
      {
        type: 'docs',
        url: 'https://mui.com/material-ui/react-',
        components: ['button', 'card', 'dialog', 'chip'],
      },
      { type: 'github', url: 'https://github.com/chakra-ui/chakra-ui' },
    ];

    for (const target of targets) {
      if (target.type === 'storybook') {
        await crawler.crawlStorybook(target.url);
      } else if (target.type === 'docs') {
        await crawler.crawlDesignSystemDocs(target.url, target.components);
      } else if (target.type === 'github') {
        await crawler.mineGitHubRepo(target.url);
      }
    }

    // Generate report
    const report = await crawler.generateReport();

    console.log('\n📈 Crawling Statistics:');
    console.log(`  Sites Visited: ${report.stats.sitesVisited}`);
    console.log(`  Components Found: ${report.stats.componentsFound}`);
    console.log(`  Props Extracted: ${report.stats.propsExtracted}`);
    console.log(`  Types Extracted: ${report.stats.typesExtracted}`);
    console.log(`  Errors: ${report.stats.errors}`);

    console.log('\n🏆 Top Props:');
    report.summary.topProps.slice(0, 10).forEach((prop, i) => {
      console.log(`  ${i + 1}. ${prop.name} (${prop.count})`);
    });

    console.log('\n🪝 Top Hooks:');
    report.summary.topHooks.slice(0, 10).forEach((hook, i) => {
      console.log(`  ${i + 1}. ${hook.name} (${hook.count})`);
    });
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  } finally {
    await crawler.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ReactComponentCrawler;

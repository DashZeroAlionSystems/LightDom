/**
 * Animation Styleguide Miner
 * 
 * Mines animation patterns from popular styleguides including:
 * - anime.js
 * - Material Design 3
 * - Framer Motion
 * - Tailwind UI
 * - Chakra UI
 * - Ant Design
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { Pool } from 'pg';

export interface AnimationPattern {
  styleguide_name: string;
  styleguide_url: string;
  component_type: string;
  animation_name: string;
  code_example?: string;
  css_rules?: any;
  js_config?: any;
  easing_function?: string;
  duration?: number;
  properties?: any;
  ux_purpose?: string;
  tags?: string[];
}

export interface StyleguideConfig {
  name: string;
  url: string;
  priority: number;
  patterns: {
    [key: string]: string[];
  };
  selectors?: {
    codeBlocks?: string;
    examples?: string;
    components?: string;
  };
}

export class AnimationStyleguideMiner {
  private browser: Browser | null = null;
  private db: Pool;
  private isInitialized = false;

  // Styleguides to mine
  private styleguides: StyleguideConfig[] = [
    {
      name: 'anime.js',
      url: 'https://animejs.com',
      priority: 9,
      patterns: {
        buttons: ['hover', 'click', 'focus'],
        cards: ['entrance', 'hover', 'exit'],
        menus: ['open', 'close', 'item-hover'],
        modals: ['open', 'close'],
        loaders: ['spin', 'pulse', 'bounce']
      },
      selectors: {
        codeBlocks: 'pre code, .code-example',
        examples: '.example, [class*="demo"]',
        components: '[class*="component"]'
      }
    },
    {
      name: 'Material Design 3',
      url: 'https://m3.material.io',
      priority: 10,
      patterns: {
        motion: ['easing', 'duration', 'continuity'],
        transitions: ['fade', 'scale', 'slide', 'shared-element'],
        components: ['all']
      },
      selectors: {
        codeBlocks: 'code, .code-snippet',
        examples: '.example-container',
        components: '[data-component]'
      }
    },
    {
      name: 'Framer Motion',
      url: 'https://www.framer.com/motion',
      priority: 9,
      patterns: {
        animations: ['declarative', 'gesture', 'layout', 'scroll'],
        transitions: ['spring', 'tween', 'inertia']
      }
    },
    {
      name: 'Tailwind UI',
      url: 'https://tailwindui.com',
      priority: 8,
      patterns: {
        utilities: ['transition', 'animation', 'transform']
      }
    },
    {
      name: 'Chakra UI',
      url: 'https://chakra-ui.com',
      priority: 8,
      patterns: {
        motion: ['fade', 'scale', 'slide', 'collapse']
      }
    },
    {
      name: 'Ant Design',
      url: 'https://ant.design',
      priority: 8,
      patterns: {
        motion: ['zoom', 'fade', 'move', 'slide']
      }
    }
  ];

  constructor(dbConfig?: any) {
    this.db = dbConfig || new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'lightdom',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    });
  }

  /**
   * Initialize the mining service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Animation Styleguide Miner...');

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      this.isInitialized = true;
      console.log('✅ Animation Styleguide Miner initialized');
    } catch (error) {
      console.error('❌ Failed to initialize miner:', error);
      throw error;
    }
  }

  /**
   * Mine all configured styleguides
   */
  async mineAll(): Promise<AnimationPattern[]> {
    await this.initialize();

    console.log(`🔍 Mining ${this.styleguides.length} styleguides...`);
    const allPatterns: AnimationPattern[] = [];

    for (const styleguide of this.styleguides) {
      try {
        console.log(`\n📖 Mining: ${styleguide.name}`);
        const patterns = await this.mineStyleguide(styleguide);
        allPatterns.push(...patterns);
        console.log(`   ✅ Found ${patterns.length} patterns`);

        // Save to database
        for (const pattern of patterns) {
          await this.savePattern(pattern);
        }
      } catch (error) {
        console.error(`   ❌ Error mining ${styleguide.name}:`, error);
      }
    }

    console.log(`\n✨ Total patterns mined: ${allPatterns.length}`);
    return allPatterns;
  }

  /**
   * Mine a specific styleguide
   */
  async mineStyleguide(styleguide: StyleguideConfig): Promise<AnimationPattern[]> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    const patterns: AnimationPattern[] = [];

    try {
      // Navigate to styleguide
      await page.goto(styleguide.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Extract CSS animations
      const cssAnimations = await this.extractCSSAnimations(page);
      for (const anim of cssAnimations) {
        patterns.push({
          styleguide_name: styleguide.name,
          styleguide_url: styleguide.url,
          component_type: anim.component || 'general',
          animation_name: anim.name,
          css_rules: anim.rules,
          duration: anim.duration,
          easing_function: anim.easing,
          properties: anim.properties,
          tags: ['css', 'keyframes']
        });
      }

      // Extract JavaScript animation configs
      const jsAnimations = await this.extractJSAnimations(page);
      for (const anim of jsAnimations) {
        patterns.push({
          styleguide_name: styleguide.name,
          styleguide_url: styleguide.url,
          component_type: anim.component || 'general',
          animation_name: anim.name,
          js_config: anim.config,
          duration: anim.duration,
          easing_function: anim.easing,
          properties: anim.properties,
          tags: ['javascript', styleguide.name.toLowerCase()]
        });
      }

      // Extract code examples
      if (styleguide.selectors?.codeBlocks) {
        const codeExamples = await this.extractCodeExamples(page, styleguide.selectors.codeBlocks);
        for (const example of codeExamples) {
          patterns.push({
            styleguide_name: styleguide.name,
            styleguide_url: styleguide.url,
            component_type: example.component || 'general',
            animation_name: example.name || 'code-example',
            code_example: example.code,
            ux_purpose: example.description,
            tags: ['code-example', example.language || 'unknown']
          });
        }
      }

    } catch (error) {
      console.error(`Error mining ${styleguide.name}:`, error);
    } finally {
      await page.close();
    }

    return patterns;
  }

  /**
   * Extract CSS animations from page
   */
  private async extractCSSAnimations(page: Page): Promise<any[]> {
    return await page.evaluate(() => {
      const animations: any[] = [];

      try {
        // Extract keyframes
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            for (const rule of Array.from(sheet.cssRules || [])) {
              if (rule.type === CSSRule.KEYFRAMES_RULE) {
                const keyframesRule = rule as CSSKeyframesRule;
                const rules = Array.from(keyframesRule.cssRules).map((r: any) => ({
                  keyText: r.keyText,
                  style: r.style.cssText
                }));

                animations.push({
                  name: keyframesRule.name,
                  rules: rules,
                  component: null,
                  properties: this.extractProperties(rules),
                  duration: null,
                  easing: null
                });
              }
            }
          } catch (e) {
            // Cross-origin or other errors
          }
        }

        // Extract transition/animation properties
        const elementsWithAnimations = document.querySelectorAll('[style*="animation"], [style*="transition"]');
        elementsWithAnimations.forEach((el: Element) => {
          const style = window.getComputedStyle(el);
          if (style.animation && style.animation !== 'none') {
            animations.push({
              name: style.animationName,
              duration: parseFloat(style.animationDuration) * 1000,
              easing: style.animationTimingFunction,
              component: el.className || el.tagName.toLowerCase(),
              properties: { animation: style.animation }
            });
          }
        });
      } catch (error) {
        console.error('Error extracting CSS animations:', error);
      }

      function extractProperties(rules: any[]): any {
        const props: any = {};
        for (const rule of rules) {
          const matches = rule.style.match(/([a-z-]+):\s*([^;]+)/gi);
          if (matches) {
            matches.forEach((match: string) => {
              const [prop, value] = match.split(':').map(s => s.trim());
              props[prop] = value;
            });
          }
        }
        return props;
      }

      return animations;
    });
  }

  /**
   * Extract JavaScript animation configurations
   */
  private async extractJSAnimations(page: Page): Promise<any[]> {
    return await page.evaluate(() => {
      const animations: any[] = [];

      // Look for anime.js configurations
      if (typeof (window as any).anime !== 'undefined') {
        // anime.js is loaded, try to find configurations
        animations.push({
          name: 'anime-js-detected',
          component: 'anime.js',
          config: { library: 'anime.js', version: 'detected' },
          properties: {},
          duration: null,
          easing: null
        });
      }

      // Look for Framer Motion
      if (typeof (window as any).motion !== 'undefined') {
        animations.push({
          name: 'framer-motion-detected',
          component: 'framer-motion',
          config: { library: 'framer-motion', version: 'detected' },
          properties: {},
          duration: null,
          easing: null
        });
      }

      return animations;
    });
  }

  /**
   * Extract code examples from page
   */
  private async extractCodeExamples(page: Page, selector: string): Promise<any[]> {
    return await page.evaluate((sel) => {
      const examples: any[] = [];
      const codeBlocks = document.querySelectorAll(sel);

      codeBlocks.forEach((block) => {
        const code = block.textContent || '';
        if (code.length > 20 && code.length < 5000) {
          const language = block.className.match(/language-(\w+)/)?.[1] || 
                          block.closest('[data-language]')?.getAttribute('data-language') ||
                          'javascript';

          const parent = block.closest('section, article, .example-container');
          const description = parent?.querySelector('h2, h3, p, .description')?.textContent || '';

          examples.push({
            code,
            language,
            description: description.substring(0, 500),
            component: block.closest('[data-component]')?.getAttribute('data-component') || null,
            name: parent?.querySelector('h2, h3')?.textContent?.trim() || null
          });
        }
      });

      return examples;
    }, selector);
  }

  /**
   * Save pattern to database
   */
  async savePattern(pattern: AnimationPattern): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO animation_patterns 
        (styleguide_name, styleguide_url, component_type, animation_name, 
         code_example, css_rules, js_config, easing_function, duration, 
         properties, ux_purpose, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT DO NOTHING`,
        [
          pattern.styleguide_name,
          pattern.styleguide_url,
          pattern.component_type,
          pattern.animation_name,
          pattern.code_example,
          JSON.stringify(pattern.css_rules),
          JSON.stringify(pattern.js_config),
          pattern.easing_function,
          pattern.duration,
          JSON.stringify(pattern.properties),
          pattern.ux_purpose,
          pattern.tags || []
        ]
      );
    } catch (error) {
      console.error('Error saving pattern to database:', error);
    }
  }

  /**
   * Get patterns by styleguide
   */
  async getPatternsByStyleguide(styleguide: string): Promise<AnimationPattern[]> {
    const result = await this.db.query(
      'SELECT * FROM animation_patterns WHERE styleguide_name = $1',
      [styleguide]
    );
    return result.rows;
  }

  /**
   * Get patterns by component type
   */
  async getPatternsByComponent(componentType: string): Promise<AnimationPattern[]> {
    const result = await this.db.query(
      'SELECT * FROM animation_patterns WHERE component_type = $1',
      [componentType]
    );
    return result.rows;
  }

  /**
   * Search patterns by tags
   */
  async searchPatternsByTags(tags: string[]): Promise<AnimationPattern[]> {
    const result = await this.db.query(
      'SELECT * FROM animation_patterns WHERE tags && $1',
      [tags]
    );
    return result.rows;
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<any> {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_patterns,
        COUNT(DISTINCT styleguide_name) as total_styleguides,
        COUNT(DISTINCT component_type) as total_components,
        json_object_agg(styleguide_name, count) as patterns_by_styleguide
      FROM (
        SELECT styleguide_name, COUNT(*) as count
        FROM animation_patterns
        GROUP BY styleguide_name
      ) subquery
    `);
    return result.rows[0];
  }

  /**
   * Cleanup
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    await this.db.end();
    this.isInitialized = false;
    console.log('🧹 Animation Styleguide Miner closed');
  }
}

export default AnimationStyleguideMiner;

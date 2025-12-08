/**
 * Headless Styleguide Property Scraper
 *
 * Extracts per-component CSS properties from design systems:
 * - Typography: font-family, font-size, font-weight, line-height, letter-spacing
 * - Colors: color, background-color, border-color, etc.
 * - Spacing: margin, padding, gap
 * - Borders: border-width, border-radius, border-style
 * - Shadows: box-shadow, text-shadow
 * - Transitions: transition, transform, animation
 * - Layout: display, flex properties, grid properties
 *
 * Generates JSON schema for each component with full metadata.
 */

import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StyleguidePropertyScraper {
  constructor(config = {}) {
    this.browser = null;
    this.page = null;
    this.config = {
      headless: true,
      timeout: 60000,
      waitForNetworkIdle: true,
      ...config,
    };
    this.components = [];
  }

  async initialize() {
    console.log('🚀 Launching browser for styleguide scraping...');
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    console.log('✅ Browser initialized');
  }

  /**
   * Extract all CSS properties for a single element
   */
  async extractElementProperties(element) {
    return await this.page.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      // Helper to extract numeric value
      const getNumeric = value => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
      };

      return {
        // Basic info
        tagName: el.tagName.toLowerCase(),
        id: el.id || null,
        className: el.className || null,
        role: el.getAttribute('role') || null,

        // Dimensions
        dimensions: {
          width: rect.width,
          height: rect.height,
          offsetWidth: el.offsetWidth,
          offsetHeight: el.offsetHeight,
        },

        // Typography
        typography: {
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          fontStyle: computed.fontStyle,
          lineHeight: computed.lineHeight,
          letterSpacing: computed.letterSpacing,
          textAlign: computed.textAlign,
          textTransform: computed.textTransform,
          textDecoration: computed.textDecoration,
          whiteSpace: computed.whiteSpace,
          wordSpacing: computed.wordSpacing,
        },

        // Colors
        colors: {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor,
          borderTopColor: computed.borderTopColor,
          borderRightColor: computed.borderRightColor,
          borderBottomColor: computed.borderBottomColor,
          borderLeftColor: computed.borderLeftColor,
          outlineColor: computed.outlineColor,
        },

        // Spacing
        spacing: {
          margin: computed.margin,
          marginTop: computed.marginTop,
          marginRight: computed.marginRight,
          marginBottom: computed.marginBottom,
          marginLeft: computed.marginLeft,
          padding: computed.padding,
          paddingTop: computed.paddingTop,
          paddingRight: computed.paddingRight,
          paddingBottom: computed.paddingBottom,
          paddingLeft: computed.paddingLeft,
          gap: computed.gap,
          rowGap: computed.rowGap,
          columnGap: computed.columnGap,
        },

        // Borders
        borders: {
          border: computed.border,
          borderWidth: computed.borderWidth,
          borderStyle: computed.borderStyle,
          borderRadius: computed.borderRadius,
          borderTopLeftRadius: computed.borderTopLeftRadius,
          borderTopRightRadius: computed.borderTopRightRadius,
          borderBottomRightRadius: computed.borderBottomRightRadius,
          borderBottomLeftRadius: computed.borderBottomLeftRadius,
        },

        // Shadows
        shadows: {
          boxShadow: computed.boxShadow,
          textShadow: computed.textShadow,
        },

        // Transitions & Animations
        transitions: {
          transition: computed.transition,
          transitionProperty: computed.transitionProperty,
          transitionDuration: computed.transitionDuration,
          transitionTimingFunction: computed.transitionTimingFunction,
          transitionDelay: computed.transitionDelay,
          animation: computed.animation,
          animationName: computed.animationName,
          animationDuration: computed.animationDuration,
          animationTimingFunction: computed.animationTimingFunction,
          animationDelay: computed.animationDelay,
          animationIterationCount: computed.animationIterationCount,
          animationDirection: computed.animationDirection,
          animationFillMode: computed.animationFillMode,
        },

        // Transform
        transforms: {
          transform: computed.transform,
          transformOrigin: computed.transformOrigin,
          transformStyle: computed.transformStyle,
        },

        // Layout
        layout: {
          display: computed.display,
          position: computed.position,
          top: computed.top,
          right: computed.right,
          bottom: computed.bottom,
          left: computed.left,
          zIndex: computed.zIndex,
          overflow: computed.overflow,
          overflowX: computed.overflowX,
          overflowY: computed.overflowY,
        },

        // Flexbox
        flexbox: {
          flexDirection: computed.flexDirection,
          flexWrap: computed.flexWrap,
          justifyContent: computed.justifyContent,
          alignItems: computed.alignItems,
          alignContent: computed.alignContent,
          flex: computed.flex,
          flexGrow: computed.flexGrow,
          flexShrink: computed.flexShrink,
          flexBasis: computed.flexBasis,
          alignSelf: computed.alignSelf,
          order: computed.order,
        },

        // Grid
        grid: {
          gridTemplateColumns: computed.gridTemplateColumns,
          gridTemplateRows: computed.gridTemplateRows,
          gridTemplateAreas: computed.gridTemplateAreas,
          gridAutoColumns: computed.gridAutoColumns,
          gridAutoRows: computed.gridAutoRows,
          gridAutoFlow: computed.gridAutoFlow,
          gridColumn: computed.gridColumn,
          gridRow: computed.gridRow,
          gridArea: computed.gridArea,
        },

        // Opacity & Visibility
        visibility: {
          opacity: computed.opacity,
          visibility: computed.visibility,
          cursor: computed.cursor,
          pointerEvents: computed.pointerEvents,
        },

        // Other
        other: {
          backdropFilter: computed.backdropFilter,
          filter: computed.filter,
          mixBlendMode: computed.mixBlendMode,
          objectFit: computed.objectFit,
          objectPosition: computed.objectPosition,
        },
      };
    }, element);
  }

  /**
   * Scrape a Storybook instance
   */
  async scrapeStorybook(url) {
    console.log(`\n📖 Scraping Storybook: ${url}`);

    await this.page.goto(url, {
      waitUntil: this.config.waitForNetworkIdle ? 'networkidle2' : 'domcontentloaded',
      timeout: this.config.timeout,
    });

    // Wait for Storybook to load
    await this.page.waitForTimeout(2000);

    // Get all story items from sidebar
    const stories = await this.page.evaluate(() => {
      const storyItems = [];
      const sidebarLinks = document.querySelectorAll('[data-item-id], a[href*="/?path=/story/"]');

      sidebarLinks.forEach(link => {
        const storyId =
          link.getAttribute('data-item-id') ||
          link.getAttribute('href')?.match(/story\/([\w-]+)/)?.[1];
        const title = link.textContent?.trim();

        if (storyId && title) {
          storyItems.push({ id: storyId, title, href: link.href });
        }
      });

      return storyItems;
    });

    console.log(`📚 Found ${stories.length} stories`);

    // Scrape each story
    for (let i = 0; i < Math.min(stories.length, 50); i++) {
      const story = stories[i];
      console.log(`\n📄 Scraping story ${i + 1}/${stories.length}: ${story.title}`);

      try {
        await this.scrapeStory(story);
      } catch (error) {
        console.error(`❌ Failed to scrape story ${story.title}:`, error.message);
      }
    }
  }

  /**
   * Scrape a single Storybook story
   */
  async scrapeStory(story) {
    // Navigate to story
    await this.page.goto(story.href, {
      waitUntil: 'networkidle2',
      timeout: this.config.timeout,
    });

    await this.page.waitForTimeout(1000);

    // Find the iframe containing the component
    const frameHandle = await this.page.$('iframe#storybook-preview-iframe');

    if (!frameHandle) {
      console.warn('⚠️  No iframe found for story');
      return;
    }

    const frame = await frameHandle.contentFrame();

    if (!frame) {
      console.warn('⚠️  Could not access iframe content');
      return;
    }

    // Find the root component element
    await frame.waitForSelector('#storybook-root, #root', { timeout: 5000 });

    const componentElements = await frame.$$('#storybook-root > *, #root > *');

    for (const element of componentElements) {
      const properties = await frame.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        return {
          tagName: el.tagName.toLowerCase(),
          id: el.id || null,
          className: el.className || null,
          role: el.getAttribute('role') || null,
          dimensions: {
            width: rect.width,
            height: rect.height,
          },
          typography: {
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            lineHeight: computed.lineHeight,
            letterSpacing: computed.letterSpacing,
          },
          colors: {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderColor: computed.borderColor,
          },
          spacing: {
            margin: computed.margin,
            padding: computed.padding,
            gap: computed.gap,
          },
          borders: {
            borderWidth: computed.borderWidth,
            borderRadius: computed.borderRadius,
          },
          transitions: {
            transition: computed.transition,
            animation: computed.animation,
          },
        };
      }, element);

      this.components.push({
        storyId: story.id,
        storyTitle: story.title,
        ...properties,
        scrapedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Scrape a custom design system page
   */
  async scrapeDesignSystem(url, selectors = {}) {
    console.log(`\n🎨 Scraping design system: ${url}`);

    await this.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: this.config.timeout,
    });

    const componentSelector = selectors.component || '[class*="component"], [data-component]';
    await this.page.waitForSelector(componentSelector, { timeout: 5000 });

    const elements = await this.page.$$(componentSelector);
    console.log(`🔍 Found ${elements.length} component elements`);

    for (let i = 0; i < elements.length; i++) {
      console.log(`📦 Extracting component ${i + 1}/${elements.length}`);

      try {
        const properties = await this.extractElementProperties(elements[i]);

        this.components.push({
          sourceUrl: url,
          componentIndex: i,
          ...properties,
          scrapedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`❌ Failed to extract component ${i}:`, error.message);
      }
    }
  }

  /**
   * Generate JSON schema from scraped components
   */
  generateSchema() {
    console.log('\n📝 Generating component schemas...');

    const schemas = this.components.map(component => ({
      name: component.storyTitle || component.className || component.tagName,
      type: component.tagName,
      category: this.inferCategory(component),

      // Design tokens
      tokens: {
        typography: {
          fontFamily: component.typography?.fontFamily,
          fontSize: component.typography?.fontSize,
          fontWeight: component.typography?.fontWeight,
          lineHeight: component.typography?.lineHeight,
        },
        colors: {
          text: component.colors?.color,
          background: component.colors?.backgroundColor,
          border: component.colors?.borderColor,
        },
        spacing: {
          margin: component.spacing?.margin,
          padding: component.spacing?.padding,
          gap: component.spacing?.gap,
        },
        borders: {
          width: component.borders?.borderWidth,
          radius: component.borders?.borderRadius,
        },
      },

      // Animation/Transition
      motion: {
        transition: component.transitions?.transition,
        animation: component.transitions?.animation,
      },

      // Metadata
      metadata: {
        source: component.storyId || component.sourceUrl,
        scrapedAt: component.scrapedAt,
      },
    }));

    return schemas;
  }

  /**
   * Infer component category from properties
   */
  inferCategory(component) {
    const className = (component.className || '').toLowerCase();
    const role = (component.role || '').toLowerCase();
    const tag = component.tagName;

    if (className.includes('button') || role === 'button' || tag === 'button') return 'button';
    if (className.includes('input') || tag === 'input' || tag === 'textarea') return 'input';
    if (className.includes('card')) return 'card';
    if (className.includes('modal') || className.includes('dialog')) return 'modal';
    if (className.includes('nav') || tag === 'nav') return 'navigation';
    if (className.includes('header') || tag === 'header') return 'header';
    if (className.includes('footer') || tag === 'footer') return 'footer';

    return 'unknown';
  }

  /**
   * Save results to disk
   */
  async saveResults(outputPath) {
    const results = {
      scrapedAt: new Date().toISOString(),
      totalComponents: this.components.length,
      components: this.components,
      schemas: this.generateSchema(),
    };

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n✅ Results saved to: ${outputPath}`);
    console.log(`📊 Total components scraped: ${this.components.length}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2] || 'https://storybook.js.org/';
  const type = process.argv[3] || 'storybook'; // 'storybook' or 'design-system'

  const scraper = new StyleguidePropertyScraper();

  (async () => {
    try {
      await scraper.initialize();

      if (type === 'storybook') {
        await scraper.scrapeStorybook(url);
      } else {
        await scraper.scrapeDesignSystem(url);
      }

      const outputPath = path.join(
        __dirname,
        '../../data/scraped-components',
        `${Date.now()}.json`
      );
      await scraper.saveResults(outputPath);

      process.exit(0);
    } catch (error) {
      console.error('❌ Scraping failed:', error);
      process.exit(1);
    } finally {
      await scraper.close();
    }
  })();
}

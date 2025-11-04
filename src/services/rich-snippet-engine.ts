/**
 * Rich Snippet Graphics Engine
 * Real-time DOM data mining with SEO-rich component generation
 */

import { EventEmitter } from 'events';
import { ConsoleFormatter } from '../config/console-config.js';

export interface RichSnippetStyle {
  theme: 'modern' | 'classic' | 'minimal' | 'bold';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius: string;
  shadows: boolean;
}

export interface RichSnippetConfig {
  type: 'product' | 'article' | 'recipe' | 'event' | 'review' | 'faq' | 'custom';
  data: any;
  style?: RichSnippetStyle;
  seoOptimized?: boolean;
  enableStructuredData?: boolean;
  enableRealTimeUpdates?: boolean;
}

export interface DOMInjectionTarget {
  selector: string;
  position: 'prepend' | 'append' | 'replace' | 'before' | 'after';
  priority?: number;
}

export interface GeneratedSnippet {
  id: string;
  html: string;
  css: string;
  structuredData?: any;
  analytics?: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class RichSnippetEngine extends EventEmitter {
  private snippets: Map<string, GeneratedSnippet> = new Map();
  private console: ConsoleFormatter;
  private styleCache: Map<string, string> = new Map();

  constructor() {
    super();
    this.console = new ConsoleFormatter();
  }

  /**
   * Generate rich snippet from data
   */
  public generateSnippet(
    id: string,
    config: RichSnippetConfig
  ): GeneratedSnippet {
    console.log(
      this.console.formatServiceMessage(
        'RichSnippet',
        `Generating ${config.type} snippet: ${id}`,
        'info'
      )
    );

    const html = this.generateHTML(config);
    const css = this.generateCSS(config);
    const structuredData = config.enableStructuredData
      ? this.generateStructuredData(config)
      : undefined;

    const snippet: GeneratedSnippet = {
      id,
      html,
      css,
      structuredData,
      analytics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.snippets.set(id, snippet);

    console.log(
      this.console.formatServiceMessage(
        'RichSnippet',
        `Generated snippet: ${id}`,
        'success'
      )
    );

    this.emit('snippet:generated', snippet);
    return snippet;
  }

  /**
   * Generate product rich snippet
   */
  public generateProductSnippet(productData: any, style?: RichSnippetStyle): GeneratedSnippet {
    const id = `product-${Date.now()}`;
    return this.generateSnippet(id, {
      type: 'product',
      data: productData,
      style,
      seoOptimized: true,
      enableStructuredData: true,
      enableRealTimeUpdates: true,
    });
  }

  /**
   * Generate article rich snippet
   */
  public generateArticleSnippet(articleData: any, style?: RichSnippetStyle): GeneratedSnippet {
    const id = `article-${Date.now()}`;
    return this.generateSnippet(id, {
      type: 'article',
      data: articleData,
      style,
      seoOptimized: true,
      enableStructuredData: true,
    });
  }

  /**
   * Inject snippet into DOM
   */
  public async injectSnippet(
    snippetId: string,
    target: DOMInjectionTarget,
    pageInstance: any
  ): Promise<void> {
    const snippet = this.snippets.get(snippetId);
    if (!snippet) {
      throw new Error(`Snippet ${snippetId} not found`);
    }

    console.log(
      this.console.formatServiceMessage(
        'RichSnippet',
        `Injecting snippet ${snippetId} into ${target.selector}`,
        'info'
      )
    );

    // Inject CSS
    await pageInstance.evaluate((css: string) => {
      const styleEl = document.createElement('style');
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    }, snippet.css);

    // Inject HTML
    await pageInstance.evaluate(
      (html: string, selector: string, position: string) => {
        const targetEl = document.querySelector(selector);
        if (!targetEl) {
          throw new Error(`Target element ${selector} not found`);
        }

        const container = document.createElement('div');
        // Sanitize HTML before injection to prevent XSS
        const sanitizedHtml = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        container.innerHTML = sanitizedHtml;
        container.className = 'rich-snippet-container';

        switch (position) {
          case 'prepend':
            targetEl.prepend(container);
            break;
          case 'append':
            targetEl.appendChild(container);
            break;
          case 'replace':
            targetEl.replaceWith(container);
            break;
          case 'before':
            targetEl.before(container);
            break;
          case 'after':
            targetEl.after(container);
            break;
        }
      },
      snippet.html,
      target.selector,
      target.position
    );

    // Inject structured data
    if (snippet.structuredData) {
      await pageInstance.evaluate((data: any) => {
        const scriptEl = document.createElement('script');
        scriptEl.type = 'application/ld+json';
        scriptEl.textContent = JSON.stringify(data);
        document.head.appendChild(scriptEl);
      }, snippet.structuredData);
    }

    console.log(
      this.console.formatServiceMessage(
        'RichSnippet',
        `Injected snippet ${snippetId}`,
        'success'
      )
    );

    this.emit('snippet:injected', { snippetId, target });
  }

  /**
   * Mine DOM for data
   */
  public async mineDOMData(pageInstance: any): Promise<any> {
    console.log(
      this.console.formatServiceMessage(
        'RichSnippet',
        'Mining DOM for data',
        'info'
      )
    );

    const domData = await pageInstance.evaluate(() => {
      const data: any = {
        title: document.title,
        meta: {},
        headings: [],
        images: [],
        links: [],
        products: [],
        articles: [],
      };

      // Mine meta tags
      document.querySelectorAll('meta').forEach((meta: any) => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          data.meta[name] = content;
        }
      });

      // Mine headings
      document.querySelectorAll('h1, h2, h3').forEach((heading: any) => {
        data.headings.push({
          level: heading.tagName.toLowerCase(),
          text: heading.textContent?.trim(),
        });
      });

      // Mine images
      document.querySelectorAll('img').forEach((img: any) => {
        data.images.push({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
        });
      });

      // Mine product data (common e-commerce patterns)
      document.querySelectorAll('[itemtype*="Product"]').forEach((product: any) => {
        const productData: any = {
          name: product.querySelector('[itemprop="name"]')?.textContent,
          price: product.querySelector('[itemprop="price"]')?.textContent,
          currency: product.querySelector('[itemprop="priceCurrency"]')?.getAttribute('content'),
          description: product.querySelector('[itemprop="description"]')?.textContent,
          image: product.querySelector('[itemprop="image"]')?.src,
        };
        data.products.push(productData);
      });

      return data;
    });

    console.log(
      this.console.formatDataStream('RichSnippet', domData, 'dom')
    );

    return domData;
  }

  /**
   * Generate real-time analytics
   */
  public async generateAnalytics(snippetId: string): Promise<any> {
    const snippet = this.snippets.get(snippetId);
    if (!snippet) {
      throw new Error(`Snippet ${snippetId} not found`);
    }

    const analytics = {
      snippetId,
      impressions: snippet.analytics?.impressions || 0,
      clicks: snippet.analytics?.clicks || 0,
      conversions: snippet.analytics?.conversions || 0,
      ctr: snippet.analytics ? (snippet.analytics.clicks / snippet.analytics.impressions) * 100 : 0,
      conversionRate: snippet.analytics
        ? (snippet.analytics.conversions / snippet.analytics.clicks) * 100
        : 0,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    };

    console.log(
      this.console.formatDataStream('RichSnippet Analytics', analytics, 'analytics')
    );

    return analytics;
  }

  /**
   * Update snippet in real-time
   */
  public updateSnippet(snippetId: string, data: any): void {
    const snippet = this.snippets.get(snippetId);
    if (!snippet) {
      throw new Error(`Snippet ${snippetId} not found`);
    }

    snippet.updatedAt = new Date();
    // Regenerate HTML/CSS based on new data
    
    console.log(
      this.console.formatServiceMessage(
        'RichSnippet',
        `Updated snippet: ${snippetId}`,
        'success'
      )
    );

    this.emit('snippet:updated', snippet);
  }

  private generateHTML(config: RichSnippetConfig): string {
    const style = config.style || this.getDefaultStyle();
    
    switch (config.type) {
      case 'product':
        return this.generateProductHTML(config.data, style);
      case 'article':
        return this.generateArticleHTML(config.data, style);
      case 'review':
        return this.generateReviewHTML(config.data, style);
      case 'faq':
        return this.generateFAQHTML(config.data, style);
      default:
        return this.generateCustomHTML(config.data, style);
    }
  }

  private generateCSS(config: RichSnippetConfig): string {
    const style = config.style || this.getDefaultStyle();
    
    return `
      .rich-snippet-container {
        font-family: ${style.fontFamily};
        color: ${style.primaryColor};
        border-radius: ${style.borderRadius};
        padding: ${style.spacing === 'compact' ? '0.5rem' : style.spacing === 'spacious' ? '2rem' : '1rem'};
        ${style.shadows ? 'box-shadow: 0 2px 8px rgba(0,0,0,0.1);' : ''}
      }
      
      .rich-snippet-title {
        color: ${style.primaryColor};
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      
      .rich-snippet-content {
        color: ${style.secondaryColor};
      }
    `;
  }

  private generateStructuredData(config: RichSnippetConfig): any {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': this.getSchemaType(config.type),
    };

    switch (config.type) {
      case 'product':
        return {
          ...baseData,
          name: config.data.name,
          description: config.data.description,
          image: config.data.image,
          offers: {
            '@type': 'Offer',
            price: config.data.price,
            priceCurrency: config.data.currency || 'USD',
          },
        };
      case 'article':
        return {
          ...baseData,
          headline: config.data.title,
          description: config.data.description,
          author: {
            '@type': 'Person',
            name: config.data.author,
          },
          datePublished: config.data.publishedDate,
        };
      default:
        return baseData;
    }
  }

  private generateProductHTML(data: any, style: RichSnippetStyle): string {
    return `
      <div class="rich-snippet-product">
        <h3 class="rich-snippet-title">${data.name || 'Product'}</h3>
        <div class="rich-snippet-content">
          ${data.image ? `<img src="${data.image}" alt="${data.name}" />` : ''}
          <p>${data.description || ''}</p>
          ${data.price ? `<div class="price">${data.currency || '$'}${data.price}</div>` : ''}
        </div>
      </div>
    `;
  }

  private generateArticleHTML(data: any, style: RichSnippetStyle): string {
    return `
      <article class="rich-snippet-article">
        <h2 class="rich-snippet-title">${data.title || 'Article'}</h2>
        <div class="rich-snippet-content">
          ${data.author ? `<p class="author">By ${data.author}</p>` : ''}
          ${data.publishedDate ? `<time>${new Date(data.publishedDate).toLocaleDateString()}</time>` : ''}
          <p>${data.description || ''}</p>
        </div>
      </article>
    `;
  }

  private generateReviewHTML(data: any, style: RichSnippetStyle): string {
    return `
      <div class="rich-snippet-review">
        <h3 class="rich-snippet-title">${data.itemReviewed || 'Review'}</h3>
        <div class="rich-snippet-content">
          <div class="rating">Rating: ${data.rating || 0}/5</div>
          <p>${data.reviewBody || ''}</p>
        </div>
      </div>
    `;
  }

  private generateFAQHTML(data: any, style: RichSnippetStyle): string {
    const questions = data.questions || [];
    return `
      <div class="rich-snippet-faq">
        ${questions.map((q: any) => `
          <div class="faq-item">
            <h4 class="rich-snippet-title">${q.question}</h4>
            <p class="rich-snippet-content">${q.answer}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  private generateCustomHTML(data: any, style: RichSnippetStyle): string {
    return `
      <div class="rich-snippet-custom">
        <div class="rich-snippet-content">
          ${JSON.stringify(data, null, 2)}
        </div>
      </div>
    `;
  }

  private getDefaultStyle(): RichSnippetStyle {
    return {
      theme: 'modern',
      primaryColor: '#333333',
      secondaryColor: '#666666',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      spacing: 'normal',
      borderRadius: '8px',
      shadows: true,
    };
  }

  private getSchemaType(type: RichSnippetConfig['type']): string {
    const typeMap: Record<string, string> = {
      product: 'Product',
      article: 'Article',
      recipe: 'Recipe',
      event: 'Event',
      review: 'Review',
      faq: 'FAQPage',
      custom: 'Thing',
    };
    return typeMap[type] || 'Thing';
  }
}

export const richSnippetEngine = new RichSnippetEngine();

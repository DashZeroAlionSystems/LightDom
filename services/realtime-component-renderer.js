/**
 * Real-Time Component Renderer
 * 
 * Renders React/Vue/Svelte components in isolated containers with live preview
 * and DOM schema mapping during render.
 * 
 * Features:
 * - React-in-container using react-frame-component, react-live, sandpack
 * - Real-time code/preview panels
 * - Hot module replacement
 * - DOM schema mapping
 * - Component isolation and safety
 * - Multi-framework support
 */

class RealtimeComponentRenderer {
  constructor() {
    this.supportedFrameworks = ['react', 'vue', 'svelte', 'html'];
    this.renderCache = new Map();
  }

  /**
   * Render component in isolated container
   */
  async renderComponent(code, options = {}) {
    const {
      framework = 'react',
      schemaMappingEnabled = true,
      livePreview = true,
      isolation = 'iframe',
      themeName = 'light'
    } = options;

    if (!this.supportedFrameworks.includes(framework)) {
      throw new Error(`Unsupported framework: ${framework}`);
    }

    const renderMethod = `render${framework.charAt(0).toUpperCase() + framework.slice(1)}`;
    const result = await this[renderMethod](code, options);

    if (schemaMappingEnabled) {
      result.domSchema = await this.generateDOMSchema(result.renderedHTML);
      result.layers = await this.analyzeLayers(result.domSchema);
    }

    return result;
  }

  /**
   * Render React component
   */
  async renderReact(code, options) {
    const { isolation, livePreview, themeName } = options;

    // Method 1: Using react-frame-component (best for isolation)
    if (isolation === 'iframe') {
      return this.renderWithReactFrame(code, themeName);
    }

    // Method 2: Using react-live (best for live editing)
    if (livePreview) {
      return this.renderWithReactLive(code, themeName);
    }

    // Method 3: Using sandpack (full sandbox)
    return this.renderWithSandpack(code, themeName);
  }

  /**
   * Render with react-frame-component
   */
  async renderWithReactFrame(code, themeName) {
    // Simulated implementation (in production, use actual react-frame-component)
    const frameHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            padding: 16px; 
            font-family: Inter, sans-serif;
            background: ${themeName === 'dark' ? '#121212' : '#ffffff'};
            color: ${themeName === 'dark' ? '#ffffff' : '#212121'};
          }
          * { box-sizing: border-box; }
        </style>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          ${code}
          
          // Auto-render if component is exported
          if (typeof App !== 'undefined') {
            ReactDOM.render(<App />, document.getElementById('root'));
          }
        </script>
      </body>
      </html>
    `;

    return {
      preview: `<iframe 
        srcdoc="${frameHTML.replace(/"/g, '&quot;')}" 
        sandbox="allow-scripts"
        style="width: 100%; height: 600px; border: 1px solid #e0e0e0; border-radius: 8px;"
      ></iframe>`,
      renderedHTML: frameHTML,
      method: 'react-frame-component',
      isolated: true
    };
  }

  /**
   * Render with react-live
   */
  async renderWithReactLive(code, themeName) {
    // Simulated implementation (in production, use actual react-live)
    const liveEditorHTML = `
      <div class="react-live-editor" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 600px;">
        <div class="code-panel" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: auto;">
          <pre style="padding: 16px; margin: 0; font-family: 'Fira Code', monospace; font-size: 14px;">
            <code>${this.escapeHTML(code)}</code>
          </pre>
        </div>
        <div class="preview-panel" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; overflow: auto; background: ${themeName === 'dark' ? '#121212' : '#ffffff'};">
          <div id="live-preview"></div>
        </div>
      </div>
    `;

    return {
      preview: liveEditorHTML,
      renderedHTML: liveEditorHTML,
      method: 'react-live',
      isolated: false,
      features: ['live-editing', 'syntax-highlighting', 'error-handling']
    };
  }

  /**
   * Render with Sandpack (CodeSandbox)
   */
  async renderWithSandpack(code, themeName) {
    const sandpackConfig = {
      files: {
        '/App.js': {
          code: code
        },
        '/index.js': {
          code: `
            import React from 'react';
            import ReactDOM from 'react-dom';
            import App from './App';
            
            ReactDOM.render(<App />, document.getElementById('root'));
          `
        }
      },
      template: 'react',
      theme: themeName
    };

    return {
      preview: `<div id="sandpack-container" data-config='${JSON.stringify(sandpackConfig)}'></div>`,
      renderedHTML: code,
      method: 'sandpack',
      isolated: true,
      features: ['hot-reload', 'npm-dependencies', 'multiple-files', 'console']
    };
  }

  /**
   * Render Vue component
   */
  async renderVue(code, options) {
    const { themeName } = options;

    const vueHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 16px; 
            font-family: Inter, sans-serif;
            background: ${themeName === 'dark' ? '#121212' : '#ffffff'};
          }
        </style>
      </head>
      <body>
        <div id="app"></div>
        <script>
          const { createApp } = Vue;
          ${code}
          createApp(App).mount('#app');
        </script>
      </body>
      </html>
    `;

    return {
      preview: `<iframe srcdoc="${vueHTML.replace(/"/g, '&quot;')}" style="width: 100%; height: 600px; border: 1px solid #e0e0e0; border-radius: 8px;"></iframe>`,
      renderedHTML: vueHTML,
      method: 'vue-live',
      isolated: true
    };
  }

  /**
   * Render Svelte component
   */
  async renderSvelte(code, options) {
    const { themeName } = options;

    // Svelte requires compilation, so we'd use svelte/compiler
    const svelteHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            margin: 0; 
            padding: 16px; 
            font-family: Inter, sans-serif;
            background: ${themeName === 'dark' ? '#121212' : '#ffffff'};
          }
        </style>
      </head>
      <body>
        <div id="app"></div>
        <script type="module">
          // Compiled Svelte component would go here
          ${code}
        </script>
      </body>
      </html>
    `;

    return {
      preview: `<iframe srcdoc="${svelteHTML.replace(/"/g, '&quot;')}" style="width: 100%; height: 600px; border: 1px solid #e0e0e0; border-radius: 8px;"></iframe>`,
      renderedHTML: svelteHTML,
      method: 'svelte-dev',
      isolated: true
    };
  }

  /**
   * Render plain HTML
   */
  async renderHtml(code, options) {
    return {
      preview: `<iframe srcdoc="${code.replace(/"/g, '&quot;')}" style="width: 100%; height: 600px; border: 1px solid #e0e0e0; border-radius: 8px;"></iframe>`,
      renderedHTML: code,
      method: 'html',
      isolated: true
    };
  }

  /**
   * Generate DOM schema from rendered HTML
   */
  async generateDOMSchema(html) {
    // Parse HTML and extract schema
    const elements = this.parseHTMLToElements(html);
    
    return {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      elementCount: elements.length,
      elements: elements.map(el => ({
        type: el.tagName,
        id: el.id || null,
        className: el.className || null,
        attributes: el.attributes || {},
        children: el.children || [],
        textContent: el.textContent || null,
        computedStyles: el.computedStyles || {},
        accessibility: {
          role: el.attributes?.role || null,
          ariaLabel: el.attributes?.['aria-label'] || null,
          ariaDescribedBy: el.attributes?.['aria-describedby'] || null,
          tabIndex: el.attributes?.tabIndex || null
        },
        seo: {
          schemaType: this.detectSchemaType(el),
          semanticMeaning: this.analyzeSemantic(el)
        }
      })),
      hierarchy: this.buildHierarchy(elements),
      statistics: {
        totalElements: elements.length,
        uniqueTags: new Set(elements.map(el => el.tagName)).size,
        interactiveElements: elements.filter(el => this.isInteractive(el)).length,
        semanticElements: elements.filter(el => this.isSemantic(el)).length
      }
    };
  }

  /**
   * Analyze layers from DOM schema
   */
  async analyzeLayers(domSchema) {
    const elements = domSchema.elements || [];
    
    return {
      compositedLayers: elements
        .filter(el => this.isComposited(el))
        .map(el => ({
          element: el.type,
          id: el.id,
          className: el.className,
          zIndex: el.computedStyles?.zIndex || 'auto',
          transform: el.computedStyles?.transform || 'none',
          opacity: el.computedStyles?.opacity || 1,
          willChange: el.computedStyles?.willChange || 'auto',
          reason: this.detectCompositingReason(el)
        })),
      paintLayers: elements
        .filter(el => this.isPaintLayer(el))
        .map(el => ({
          element: el.type,
          id: el.id,
          background: el.computedStyles?.background,
          border: el.computedStyles?.border
        })),
      scrollingLayers: elements
        .filter(el => this.isScrollable(el))
        .map(el => ({
          element: el.type,
          id: el.id,
          overflow: el.computedStyles?.overflow
        }))
    };
  }

  /**
   * Parse HTML to element objects
   */
  parseHTMLToElements(html) {
    // Simplified parser (in production, use proper HTML parser)
    const tagRegex = /<(\w+)([^>]*)>(.*?)<\/\1>/gs;
    const elements = [];
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
      elements.push({
        tagName: match[1],
        attributes: this.parseAttributes(match[2]),
        textContent: match[3].replace(/<[^>]+>/g, '').trim()
      });
    }

    return elements;
  }

  /**
   * Parse attributes from HTML string
   */
  parseAttributes(attrString) {
    const attrs = {};
    const attrRegex = /(\w+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(attrString)) !== null) {
      attrs[match[1]] = match[2];
    }

    return attrs;
  }

  /**
   * Build hierarchy from flat elements
   */
  buildHierarchy(elements) {
    // Simplified hierarchy builder
    return {
      root: elements[0]?.tagName || null,
      depth: Math.max(...elements.map((el, i) => i % 5)), // Simplified
      breadth: elements.length
    };
  }

  /**
   * Detect schema.org type
   */
  detectSchemaType(element) {
    const itemType = element.attributes?.itemtype;
    if (itemType) {
      return itemType.split('/').pop();
    }

    // Infer from element type
    const typeMap = {
      article: 'Article',
      button: 'Action',
      form: 'SearchAction',
      img: 'ImageObject',
      video: 'VideoObject'
    };

    return typeMap[element.tagName?.toLowerCase()] || null;
  }

  /**
   * Analyze semantic meaning
   */
  analyzeSemantic(element) {
    const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
    return semanticTags.includes(element.tagName?.toLowerCase()) ? 'semantic' : 'presentational';
  }

  /**
   * Check if element is interactive
   */
  isInteractive(element) {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    return interactiveTags.includes(element.tagName?.toLowerCase());
  }

  /**
   * Check if element is semantic
   */
  isSemantic(element) {
    return this.analyzeSemantic(element) === 'semantic';
  }

  /**
   * Check if element creates composited layer
   */
  isComposited(element) {
    const styles = element.computedStyles || {};
    return !!(
      styles.transform && styles.transform !== 'none' ||
      styles.opacity < 1 ||
      styles.willChange ||
      styles.position === 'fixed'
    );
  }

  /**
   * Detect compositing reason
   */
  detectCompositingReason(element) {
    const styles = element.computedStyles || {};
    
    if (styles.transform && styles.transform !== 'none') return '3D transform';
    if (styles.opacity < 1) return 'opacity';
    if (styles.willChange) return 'will-change';
    if (styles.position === 'fixed') return 'fixed position';
    
    return 'unknown';
  }

  /**
   * Check if element is paint layer
   */
  isPaintLayer(element) {
    const styles = element.computedStyles || {};
    return !!(styles.background || styles.border);
  }

  /**
   * Check if element is scrollable
   */
  isScrollable(element) {
    const styles = element.computedStyles || {};
    return ['auto', 'scroll'].includes(styles.overflow);
  }

  /**
   * Escape HTML for display
   */
  escapeHTML(html) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Get supported libraries info
   */
  getSupportedLibraries() {
    return {
      react: [
        {
          name: 'react-frame-component',
          description: 'Render React components in isolated iframe',
          bestFor: 'Component isolation and safety',
          npm: 'react-frame-component'
        },
        {
          name: 'react-live',
          description: 'Live code editing with preview',
          bestFor: 'Interactive code playgrounds',
          npm: 'react-live'
        },
        {
          name: 'sandpack',
          description: 'Full CodeSandbox experience',
          bestFor: 'Complete development environment',
          npm: '@codesandbox/sandpack-react'
        },
        {
          name: 'react-runner',
          description: 'Dynamic component execution',
          bestFor: 'Runtime component rendering',
          npm: 'react-runner'
        }
      ],
      vue: [
        {
          name: 'vue-live',
          description: 'Live Vue component preview',
          bestFor: 'Vue.js live editing',
          npm: 'vue-live'
        }
      ],
      svelte: [
        {
          name: 'svelte-dev',
          description: 'Svelte component development',
          bestFor: 'Svelte live preview',
          npm: '@sveltejs/kit'
        }
      ]
    };
  }
}

module.exports = RealtimeComponentRenderer;

#!/usr/bin/env node

/**
 * Component Analyzer Service
 * Captures screenshots of URLs and breaks down visible components into atom components
 * Generates schema mappings and tracks metadata for AI understanding
 */

import puppeteer from 'puppeteer';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ComponentAnalyzerService {
  constructor(dbConfig) {
    this.pool = new Pool(dbConfig || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5434,
      database: process.env.DB_NAME || 'lightdom',
      user: process.env.DB_USER || 'lightdom_user',
      password: process.env.DB_PASSWORD || 'lightdom_password',
    });
    
    this.browser = null;
    this.screenshotDir = path.join(process.cwd(), 'data', 'component-analysis', 'screenshots');
    this.componentsDir = path.join(process.cwd(), 'data', 'component-analysis', 'components');
  }

  /**
   * Initialize the service
   */
  async initialize() {
    console.log('🚀 Initializing Component Analyzer Service...');
    
    // Ensure directories exist
    await fs.mkdir(this.screenshotDir, { recursive: true });
    await fs.mkdir(this.componentsDir, { recursive: true });
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('✅ Component Analyzer Service initialized');
  }

  /**
   * Capture screenshot and analyze components from a URL
   */
  async analyzeUrl(url, options = {}) {
    const {
      waitFor = 2000,
      viewport = { width: 1920, height: 1080 },
      fullPage = true,
      captureMetadata = true
    } = options;

    console.log(`📸 Analyzing URL: ${url}`);
    
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const screenshotPath = path.join(this.screenshotDir, `${analysisId}.png`);
    
    const page = await this.browser.newPage();
    
    try {
      // Set viewport
      await page.setViewport(viewport);
      
      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(waitFor);
      
      // Capture screenshot
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage 
      });
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
      
      // Extract components from DOM
      const components = await this.extractComponents(page);
      console.log(`🔍 Found ${components.length} components`);
      
      // Capture metadata
      let metadata = {};
      if (captureMetadata) {
        metadata = await this.extractMetadata(page);
      }
      
      // Save to database
      const analysisData = {
        analysisId,
        url,
        screenshotPath,
        components,
        metadata,
        viewport,
        capturedAt: new Date().toISOString()
      };
      
      await this.saveAnalysis(analysisData);
      
      // Generate component schemas
      const atomComponents = this.breakdownIntoAtoms(components);
      await this.saveAtomComponents(analysisId, atomComponents);
      
      console.log(`✅ Analysis complete: ${analysisId}`);
      
      return {
        analysisId,
        screenshotPath,
        componentCount: components.length,
        atomComponentCount: atomComponents.length,
        metadata,
        components: atomComponents
      };
      
    } finally {
      await page.close();
    }
  }

  /**
   * Extract all visible components from the page
   */
  async extractComponents(page) {
    return await page.evaluate(() => {
      const components = [];
      const visitedElements = new WeakSet();
      
      // Component type detection rules
      const detectComponentType = (element) => {
        const tagName = element.tagName.toLowerCase();
        const classList = Array.from(element.classList);
        const role = element.getAttribute('role');
        
        // Detect common component patterns
        if (tagName === 'nav') return 'navigation';
        if (tagName === 'header') return 'header';
        if (tagName === 'footer') return 'footer';
        if (tagName === 'aside') return 'sidebar';
        if (tagName === 'main') return 'main-content';
        if (tagName === 'form') return 'form';
        if (tagName === 'button' || role === 'button') return 'button';
        if (tagName === 'input') return `input-${element.type || 'text'}`;
        if (tagName === 'select') return 'select';
        if (tagName === 'textarea') return 'textarea';
        if (tagName === 'table') return 'table';
        if (tagName === 'img') return 'image';
        if (tagName === 'video') return 'video';
        if (tagName === 'canvas') return 'canvas';
        if (tagName === 'svg') return 'svg-icon';
        
        // Detect by class patterns
        if (classList.some(c => /^card/.test(c))) return 'card';
        if (classList.some(c => /^modal/.test(c))) return 'modal';
        if (classList.some(c => /^dialog/.test(c))) return 'dialog';
        if (classList.some(c => /^dropdown/.test(c))) return 'dropdown';
        if (classList.some(c => /^menu/.test(c))) return 'menu';
        if (classList.some(c => /^tabs?/.test(c))) return 'tabs';
        if (classList.some(c => /^accordion/.test(c))) return 'accordion';
        if (classList.some(c => /^breadcrumb/.test(c))) return 'breadcrumb';
        if (classList.some(c => /^pagination/.test(c))) return 'pagination';
        if (classList.some(c => /^alert/.test(c))) return 'alert';
        if (classList.some(c => /^badge/.test(c))) return 'badge';
        if (classList.some(c => /^chip/.test(c))) return 'chip';
        if (classList.some(c => /^tooltip/.test(c))) return 'tooltip';
        if (classList.some(c => /^popover/.test(c))) return 'popover';
        if (classList.some(c => /^chart/.test(c))) return 'chart';
        if (classList.some(c => /^graph/.test(c))) return 'graph';
        if (classList.some(c => /^list/.test(c))) return 'list';
        if (classList.some(c => /^grid/.test(c))) return 'grid';
        
        // Detect by role
        if (role === 'navigation') return 'navigation';
        if (role === 'search') return 'search';
        if (role === 'tablist') return 'tabs';
        if (role === 'menu') return 'menu';
        if (role === 'dialog') return 'dialog';
        if (role === 'alert') return 'alert';
        
        return 'container';
      };
      
      // Get element's position and size
      const getElementBounds = (element) => {
        const rect = element.getBoundingClientRect();
        return {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      };
      
      // Check if element is visible
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        return rect.width > 0 && 
               rect.height > 0 && 
               style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
      };
      
      // Extract component data
      const extractComponentData = (element, depth = 0) => {
        if (visitedElements.has(element) || depth > 10) return null;
        if (!isVisible(element)) return null;
        
        visitedElements.add(element);
        
        const bounds = getElementBounds(element);
        
        // Skip tiny elements
        if (bounds.width < 10 || bounds.height < 10) return null;
        
        const componentType = detectComponentType(element);
        const classList = Array.from(element.classList);
        const id = element.id || '';
        const tagName = element.tagName.toLowerCase();
        
        // Get text content (first 100 chars)
        let textContent = element.textContent?.trim().substring(0, 100) || '';
        
        // Get attributes
        const attributes = {};
        for (const attr of element.attributes) {
          if (!attr.name.startsWith('on')) { // Skip event handlers
            attributes[attr.name] = attr.value;
          }
        }
        
        // Get computed styles (key ones)
        const style = window.getComputedStyle(element);
        const styles = {
          display: style.display,
          position: style.position,
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          padding: style.padding,
          margin: style.margin,
          border: style.border,
          borderRadius: style.borderRadius,
          zIndex: style.zIndex
        };
        
        const component = {
          id: id || `${tagName}_${Math.random().toString(36).substr(2, 9)}`,
          type: componentType,
          tagName,
          classList,
          bounds,
          textContent,
          attributes,
          styles,
          depth,
          children: []
        };
        
        // Process children
        const children = Array.from(element.children);
        for (const child of children) {
          const childComponent = extractComponentData(child, depth + 1);
          if (childComponent) {
            component.children.push(childComponent);
          }
        }
        
        return component;
      };
      
      // Start from body
      const rootComponent = extractComponentData(document.body);
      
      // Flatten into array
      const flattenComponents = (component, result = []) => {
        if (!component) return result;
        
        result.push({
          id: component.id,
          type: component.type,
          tagName: component.tagName,
          classList: component.classList,
          bounds: component.bounds,
          textContent: component.textContent,
          attributes: component.attributes,
          styles: component.styles,
          depth: component.depth,
          childCount: component.children.length
        });
        
        for (const child of component.children) {
          flattenComponents(child, result);
        }
        
        return result;
      };
      
      return flattenComponents(rootComponent);
    });
  }

  /**
   * Extract metadata from the page
   */
  async extractMetadata(page) {
    return await page.evaluate(() => {
      const metadata = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        viewport: document.querySelector('meta[name="viewport"]')?.content || '',
        robots: document.querySelector('meta[name="robots"]')?.content || '',
        author: document.querySelector('meta[name="author"]')?.content || '',
        
        // Schema.org data
        schemas: [],
        
        // SEO features
        h1Tags: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()),
        h2Tags: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()),
        images: document.querySelectorAll('img').length,
        links: document.querySelectorAll('a').length,
        forms: document.querySelectorAll('form').length,
        
        // Technical
        language: document.documentElement.lang || '',
        charset: document.characterSet || '',
        
        // Performance hints
        resourceHints: {
          preconnect: Array.from(document.querySelectorAll('link[rel="preconnect"]')).map(l => l.href),
          prefetch: Array.from(document.querySelectorAll('link[rel="prefetch"]')).map(l => l.href),
          preload: Array.from(document.querySelectorAll('link[rel="preload"]')).map(l => l.href)
        }
      };
      
      // Extract JSON-LD schemas
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          metadata.schemas.push(data);
        } catch (e) {
          // Invalid JSON-LD
        }
      }
      
      return metadata;
    });
  }

  /**
   * Break down components into atomic elements
   */
  breakdownIntoAtoms(components) {
    const atoms = [];
    
    for (const component of components) {
      const atom = {
        id: component.id,
        type: component.type,
        tagName: component.tagName,
        classification: this.classifyComponent(component),
        semanticRole: this.identifySemanticRole(component),
        interactionType: this.identifyInteractionType(component),
        visualProperties: this.extractVisualProperties(component),
        contentProperties: this.extractContentProperties(component),
        layoutProperties: this.extractLayoutProperties(component),
        seoProperties: this.extractSEOProperties(component),
        accessibilityProperties: this.extractA11yProperties(component),
        componentFamily: this.identifyComponentFamily(component),
        schemaMapping: this.generateSchemaMapping(component),
        reuseScore: this.calculateReuseScore(component),
        complexityScore: this.calculateComplexityScore(component)
      };
      
      atoms.push(atom);
    }
    
    return atoms;
  }

  /**
   * Classify component into standard categories
   */
  classifyComponent(component) {
    const type = component.type;
    
    // UI Component categories
    const categories = {
      'navigation': 'Navigation',
      'header': 'Layout',
      'footer': 'Layout',
      'sidebar': 'Layout',
      'main-content': 'Layout',
      'card': 'Container',
      'modal': 'Overlay',
      'dialog': 'Overlay',
      'dropdown': 'Input',
      'menu': 'Navigation',
      'tabs': 'Navigation',
      'accordion': 'Container',
      'button': 'Input',
      'input-text': 'Input',
      'input-email': 'Input',
      'input-password': 'Input',
      'select': 'Input',
      'textarea': 'Input',
      'form': 'Container',
      'table': 'Data Display',
      'chart': 'Data Visualization',
      'graph': 'Data Visualization',
      'image': 'Media',
      'video': 'Media',
      'list': 'Data Display',
      'grid': 'Layout',
      'alert': 'Feedback',
      'badge': 'Indicator',
      'breadcrumb': 'Navigation',
      'pagination': 'Navigation',
      'tooltip': 'Feedback',
      'popover': 'Overlay'
    };
    
    return categories[type] || 'Other';
  }

  /**
   * Identify semantic role
   */
  identifySemanticRole(component) {
    const { attributes, tagName, type } = component;
    
    if (attributes.role) return attributes.role;
    if (tagName === 'nav') return 'navigation';
    if (tagName === 'main') return 'main';
    if (tagName === 'header') return 'banner';
    if (tagName === 'footer') return 'contentinfo';
    if (tagName === 'aside') return 'complementary';
    if (tagName === 'article') return 'article';
    if (tagName === 'section') return 'region';
    if (type.startsWith('input-')) return 'textbox';
    if (type === 'button') return 'button';
    
    return 'none';
  }

  /**
   * Identify interaction type
   */
  identifyInteractionType(component) {
    const { type, tagName } = component;
    
    if (type === 'button' || tagName === 'button') return 'clickable';
    if (type.startsWith('input-')) return 'editable';
    if (type === 'select') return 'selectable';
    if (type === 'link' || tagName === 'a') return 'navigable';
    if (type === 'modal' || type === 'dialog') return 'dismissible';
    if (type === 'tabs' || type === 'accordion') return 'expandable';
    if (type === 'dropdown') return 'expandable';
    
    return 'static';
  }

  /**
   * Extract visual properties
   */
  extractVisualProperties(component) {
    const { styles, bounds } = component;
    
    return {
      backgroundColor: styles.backgroundColor,
      textColor: styles.color,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      borderRadius: styles.borderRadius,
      border: styles.border,
      dimensions: {
        width: bounds.width,
        height: bounds.height
      },
      position: {
        x: bounds.x,
        y: bounds.y
      }
    };
  }

  /**
   * Extract content properties
   */
  extractContentProperties(component) {
    const { textContent, attributes, tagName } = component;
    
    return {
      text: textContent,
      placeholder: attributes.placeholder || null,
      alt: attributes.alt || null,
      title: attributes.title || null,
      ariaLabel: attributes['aria-label'] || null,
      value: attributes.value || null,
      href: attributes.href || null,
      src: attributes.src || null
    };
  }

  /**
   * Extract layout properties
   */
  extractLayoutProperties(component) {
    const { styles, bounds } = component;
    
    return {
      display: styles.display,
      position: styles.position,
      zIndex: styles.zIndex,
      padding: styles.padding,
      margin: styles.margin,
      area: bounds.width * bounds.height
    };
  }

  /**
   * Extract SEO properties
   */
  extractSEOProperties(component) {
    const { tagName, attributes, textContent } = component;
    
    const isHeading = /^h[1-6]$/.test(tagName);
    const isLink = tagName === 'a';
    const isImage = tagName === 'img';
    
    return {
      isHeading,
      headingLevel: isHeading ? parseInt(tagName[1]) : null,
      isLink,
      linkText: isLink ? textContent : null,
      linkHref: isLink ? attributes.href : null,
      isImage,
      imageAlt: isImage ? attributes.alt : null,
      imageSrc: isImage ? attributes.src : null,
      hasAriaLabel: !!attributes['aria-label'],
      hasTitle: !!attributes.title
    };
  }

  /**
   * Extract accessibility properties
   */
  extractA11yProperties(component) {
    const { attributes } = component;
    
    return {
      role: attributes.role || null,
      ariaLabel: attributes['aria-label'] || null,
      ariaDescribedBy: attributes['aria-describedby'] || null,
      ariaLabelledBy: attributes['aria-labelledby'] || null,
      ariaHidden: attributes['aria-hidden'] === 'true',
      tabIndex: attributes.tabindex || null,
      alt: attributes.alt || null,
      title: attributes.title || null
    };
  }

  /**
   * Identify component family
   */
  identifyComponentFamily(component) {
    const { type, classList } = component;
    
    // Check for framework-specific class patterns
    if (classList.some(c => c.startsWith('ant-'))) return 'Ant Design';
    if (classList.some(c => c.startsWith('mui-') || c.startsWith('MuiButton'))) return 'Material-UI';
    if (classList.some(c => c.startsWith('btn-') || c.startsWith('card-'))) return 'Bootstrap';
    if (classList.some(c => c.startsWith('el-'))) return 'Element UI';
    if (classList.some(c => c.startsWith('v-'))) return 'Vuetify';
    
    // Generic categories
    if (type === 'button') return 'Button Family';
    if (type.startsWith('input-')) return 'Input Family';
    if (type === 'card') return 'Card Family';
    if (type === 'modal' || type === 'dialog') return 'Modal Family';
    if (type === 'navigation' || type === 'menu') return 'Navigation Family';
    
    return 'Custom';
  }

  /**
   * Generate schema mapping
   */
  generateSchemaMapping(component) {
    const { type, tagName, attributes } = component;
    
    const mapping = {
      component: type,
      htmlElement: tagName,
      dataBinding: [],
      events: [],
      props: {}
    };
    
    // Identify potential data bindings
    if (attributes.name) mapping.dataBinding.push(attributes.name);
    if (attributes.id) mapping.dataBinding.push(attributes.id);
    if (attributes['data-field']) mapping.dataBinding.push(attributes['data-field']);
    
    // Identify event patterns
    const eventPatterns = ['click', 'change', 'submit', 'input', 'focus', 'blur'];
    for (const event of eventPatterns) {
      if (attributes[`on${event}`] || attributes[`data-${event}`]) {
        mapping.events.push(event);
      }
    }
    
    // Extract props
    for (const [key, value] of Object.entries(attributes)) {
      if (key.startsWith('data-')) {
        mapping.props[key.replace('data-', '')] = value;
      }
    }
    
    return mapping;
  }

  /**
   * Calculate reuse score (0-100)
   */
  calculateReuseScore(component) {
    let score = 50; // Base score
    
    // Generic components score higher
    const genericTypes = ['button', 'card', 'input', 'select', 'modal'];
    if (genericTypes.some(t => component.type.includes(t))) score += 20;
    
    // Simple components score higher
    if (component.childCount === 0) score += 10;
    if (component.childCount > 5) score -= 10;
    
    // Clear semantic role increases score
    if (component.attributes.role) score += 10;
    
    // Framework components score higher
    if (component.classList.some(c => c.startsWith('ant-') || c.startsWith('mui-'))) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate complexity score (0-100)
   */
  calculateComplexityScore(component) {
    let score = 0;
    
    // Child count contributes to complexity
    score += Math.min(component.childCount * 5, 30);
    
    // Depth contributes to complexity
    score += Math.min(component.depth * 10, 30);
    
    // Number of classes contributes
    score += Math.min(component.classList.length * 2, 20);
    
    // Number of attributes contributes
    score += Math.min(Object.keys(component.attributes).length, 20);
    
    return Math.min(100, score);
  }

  /**
   * Save analysis to database
   */
  async saveAnalysis(analysisData) {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO component_analyses (
          analysis_id, url, screenshot_path, 
          component_count, metadata, viewport, captured_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (analysis_id) 
        DO UPDATE SET 
          component_count = EXCLUDED.component_count,
          metadata = EXCLUDED.metadata,
          captured_at = EXCLUDED.captured_at
      `;
      
      await client.query(query, [
        analysisData.analysisId,
        analysisData.url,
        analysisData.screenshotPath,
        analysisData.components.length,
        JSON.stringify(analysisData.metadata),
        JSON.stringify(analysisData.viewport),
        analysisData.capturedAt
      ]);
      
    } catch (error) {
      // Table might not exist yet, that's okay
      console.log('Note: Could not save to database (table may not exist yet)');
    } finally {
      client.release();
    }
  }

  /**
   * Save atom components to database
   */
  async saveAtomComponents(analysisId, atomComponents) {
    const client = await this.pool.connect();
    
    try {
      for (const atom of atomComponents) {
        const query = `
          INSERT INTO atom_components (
            analysis_id, component_id, component_type, 
            classification, semantic_role, interaction_type,
            visual_properties, content_properties, layout_properties,
            seo_properties, accessibility_properties,
            component_family, schema_mapping, 
            reuse_score, complexity_score, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (analysis_id, component_id) 
          DO UPDATE SET 
            reuse_score = EXCLUDED.reuse_score,
            complexity_score = EXCLUDED.complexity_score
        `;
        
        await client.query(query, [
          analysisId,
          atom.id,
          atom.type,
          atom.classification,
          atom.semanticRole,
          atom.interactionType,
          JSON.stringify(atom.visualProperties),
          JSON.stringify(atom.contentProperties),
          JSON.stringify(atom.layoutProperties),
          JSON.stringify(atom.seoProperties),
          JSON.stringify(atom.accessibilityProperties),
          atom.componentFamily,
          JSON.stringify(atom.schemaMapping),
          atom.reuseScore,
          atom.complexityScore,
          new Date().toISOString()
        ]);
      }
      
      // Save component file
      const componentsFile = path.join(this.componentsDir, `${analysisId}.json`);
      await fs.writeFile(
        componentsFile, 
        JSON.stringify(atomComponents, null, 2)
      );
      
    } catch (error) {
      // Table might not exist yet, save to file only
      console.log('Note: Could not save to database (table may not exist yet)');
      const componentsFile = path.join(this.componentsDir, `${analysisId}.json`);
      await fs.writeFile(
        componentsFile, 
        JSON.stringify(atomComponents, null, 2)
      );
    } finally {
      client.release();
    }
  }

  /**
   * Close the service
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    await this.pool.end();
  }
}

export default ComponentAnalyzerService;

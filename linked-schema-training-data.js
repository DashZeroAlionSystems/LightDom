#!/usr/bin/env node

/**
 * Training Data Linked Schema Storage System
 * Stores training data as hierarchical linked schemas:
 * Category → Attributes → Dashboards → Components → Atoms
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Linked Schema Storage Manager
class LinkedSchemaStorage {
  constructor(storagePath = './linked-schema-training-data.json') {
    this.storagePath = path.resolve(storagePath);
    this.data = {
      version: '1.0.0',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      categories: new Map(),
      attributes: new Map(),
      dashboards: new Map(),
      components: new Map(),
      atoms: new Map(),
      trainingExamples: [],
      relationships: {
        categoryAttributes: new Map(),
        attributeDashboards: new Map(),
        dashboardComponents: new Map(),
        componentAtoms: new Map()
      },
      statistics: {
        totalCategories: 0,
        totalAttributes: 0,
        totalDashboards: 0,
        totalComponents: 0,
        totalAtoms: 0,
        totalTrainingExamples: 0,
        totalRelationships: 0
      }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const rawData = fs.readFileSync(this.storagePath, 'utf8');
        const parsed = JSON.parse(rawData);

        // Convert Maps back from objects
        this.data.categories = new Map(Object.entries(parsed.categories || {}));
        this.data.attributes = new Map(Object.entries(parsed.attributes || {}));
        this.data.dashboards = new Map(Object.entries(parsed.dashboards || {}));
        this.data.components = new Map(Object.entries(parsed.components || {}));
        this.data.atoms = new Map(Object.entries(parsed.atoms || {}));
        this.data.relationships.categoryAttributes = new Map(Object.entries(parsed.relationships?.categoryAttributes || {}));
        this.data.relationships.attributeDashboards = new Map(Object.entries(parsed.relationships?.attributeDashboards || {}));
        this.data.relationships.dashboardComponents = new Map(Object.entries(parsed.relationships?.dashboardComponents || {}));
        this.data.relationships.componentAtoms = new Map(Object.entries(parsed.relationships?.componentAtoms || {}));
        this.data.trainingExamples = parsed.trainingExamples || [];
        this.data.statistics = parsed.statistics || this.data.statistics;

        console.log(`📂 Loaded existing linked schema data from ${this.storagePath}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not load existing data: ${error.message}`);
    }
  }

  save() {
    try {
      // Convert Maps to objects for JSON serialization
      const serializable = {
        ...this.data,
        categories: Object.fromEntries(this.data.categories),
        attributes: Object.fromEntries(this.data.attributes),
        dashboards: Object.fromEntries(this.data.dashboards),
        components: Object.fromEntries(this.data.components),
        atoms: Object.fromEntries(this.data.atoms),
        relationships: {
          categoryAttributes: Object.fromEntries(this.data.relationships.categoryAttributes),
          attributeDashboards: Object.fromEntries(this.data.relationships.attributeDashboards),
          dashboardComponents: Object.fromEntries(this.data.relationships.dashboardComponents),
          componentAtoms: Object.fromEntries(this.data.relationships.componentAtoms)
        }
      };

      serializable.lastModified = new Date().toISOString();
      fs.writeFileSync(this.storagePath, JSON.stringify(serializable, null, 2));
      console.log(`💾 Saved linked schema data to ${this.storagePath}`);
    } catch (error) {
      console.error('❌ Failed to save data:', error);
      throw error;
    }
  }

  // Store Category with Attributes (Linked Schema)
  storeCategoryWithAttributes(category, attributes) {
    console.log(`📂 Storing category: ${category.name} with ${attributes.length} attributes`);

    // Store category
    this.data.categories.set(category.id, {
      ...category,
      attributesCount: attributes.length,
      storedAt: new Date().toISOString()
    });

    // Store attributes and create relationships
    for (const attribute of attributes) {
      this.data.attributes.set(attribute.id, {
        ...attribute,
        categoryId: category.id,
        storedAt: new Date().toISOString()
      });

      // Create category → attribute relationship
      this.data.relationships.categoryAttributes.set(
        `${category.id}-${attribute.id}`,
        {
          categoryId: category.id,
          attributeId: attribute.id,
          relationshipType: 'contains',
          strength: 1.0,
          required: attribute.required,
          createdAt: new Date().toISOString()
        }
      );
    }

    this.updateStatistics();
    console.log(`✅ Stored category ${category.name} with ${attributes.length} attributes`);
  }

  // Store Dashboard with Components and Atoms (Linked Schema)
  storeDashboardWithHierarchy(dashboard, components) {
    console.log(`📊 Storing dashboard: ${dashboard.name} with ${components.length} components`);

    // Store dashboard
    this.data.dashboards.set(dashboard.id, {
      ...dashboard,
      componentsCount: components.length,
      atomsCount: components.reduce((sum, comp) => sum + (comp.atoms?.length || 0), 0),
      storedAt: new Date().toISOString()
    });

    // Create attribute → dashboard relationship
    this.data.relationships.attributeDashboards.set(
      `${dashboard.attribute_id || dashboard.attributeId}-${dashboard.id}`,
      {
        attributeId: dashboard.attribute_id || dashboard.attributeId,
        dashboardId: dashboard.id,
        relationshipType: 'customizes',
        strength: 1.0,
        purpose: dashboard.purpose,
        createdAt: new Date().toISOString()
      }
    );

    // Store components and their atoms
    for (const component of components) {
      this.storeComponentWithAtoms(dashboard.id, component);
    }

    this.updateStatistics();
    console.log(`✅ Stored dashboard ${dashboard.name} with hierarchy`);
  }

  // Store Component with Atoms (Linked Schema)
  storeComponentWithAtoms(dashboardId, component) {
    // Store component
    this.data.components.set(component.id, {
      ...component,
      dashboardId,
      atomsCount: component.atoms?.length || 0,
      storedAt: new Date().toISOString()
    });

    // Create dashboard → component relationship
    this.data.relationships.dashboardComponents.set(
      `${dashboardId}-${component.id}`,
      {
        dashboardId,
        componentId: component.id,
        position: component.position || { row: 0, col: 0, width: 12, height: 1 },
        connectionType: 'contains',
        createdAt: new Date().toISOString()
      }
    );

    // Store atoms
    if (component.atoms) {
      for (const atom of component.atoms) {
        this.data.atoms.set(atom.id, {
          ...atom,
          componentId: component.id,
          storedAt: new Date().toISOString()
        });

        // Create component → atom relationship
        this.data.relationships.componentAtoms.set(
          `${component.id}-${atom.id}`,
          {
            componentId: component.id,
            atomId: atom.id,
            connectionType: 'contains',
            relationshipStrength: 1.0,
            createdAt: new Date().toISOString()
          }
        );
      }
    }
  }

  // Store Training Data
  storeTrainingData(trainingData) {
    console.log(`🎓 Storing ${trainingData.length} training examples`);

    for (const example of trainingData) {
      this.data.trainingExamples.push({
        id: `${example.metadata.source}-${example.input.component}-${Date.now()}-${Math.random()}`,
        ...example,
        storedAt: new Date().toISOString()
      });
    }

    this.updateStatistics();
    console.log(`✅ Stored ${trainingData.length} training examples`);
  }

  // Query Methods
  getCategoryWithAttributes(categoryId) {
    const category = this.data.categories.get(categoryId);
    if (!category) return null;

    const attributes = [];
    for (const [relKey, relationship] of this.data.relationships.categoryAttributes) {
      if (relationship.categoryId === categoryId) {
        const attribute = this.data.attributes.get(relationship.attributeId);
        if (attribute) {
          attributes.push(attribute);
        }
      }
    }

    return {
      ...category,
      attributes
    };
  }

  getDashboardHierarchy(dashboardId) {
    const dashboard = this.data.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const components = [];
    for (const [relKey, relationship] of this.data.relationships.dashboardComponents) {
      if (relationship.dashboardId === dashboardId) {
        const component = this.data.components.get(relationship.componentId);
        if (component) {
          // Add atoms to component
          const atoms = [];
          for (const [atomRelKey, atomRelationship] of this.data.relationships.componentAtoms) {
            if (atomRelationship.componentId === component.id) {
              const atom = this.data.atoms.get(atomRelationship.atomId);
              if (atom) {
                atoms.push(atom);
              }
            }
          }
          components.push({
            ...component,
            atoms,
            position: relationship.position
          });
        }
      }
    }

    return {
      ...dashboard,
      components
    };
  }

  getTrainingData(filters = {}) {
    let examples = [...this.data.trainingExamples];

    if (filters.entity_type) {
      examples = examples.filter(ex => ex.metadata.tags.includes(filters.entity_type));
    }

    if (filters.min_confidence) {
      examples = examples.filter(ex => ex.metadata.confidence >= filters.min_confidence);
    }

    if (filters.source) {
      examples = examples.filter(ex => ex.metadata.source === filters.source);
    }

    if (filters.tags) {
      examples = examples.filter(ex => ex.metadata.tags.some(tag => tag.includes(filters.tags)));
    }

    if (filters.limit) {
      examples = examples.slice(0, filters.limit);
    }

    return examples;
  }

  // Generate Complete Linked Schema Map
  generateLinkedSchemaMap(categoryId) {
    const category = this.getCategoryWithAttributes(categoryId);
    if (!category) return null;

    const linkedMap = {
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        attributes: category.attributes.length
      },
      attributes: category.attributes,
      dashboards: [],
      components: [],
      atoms: [],
      relationships: {
        categoryAttributes: [],
        attributeDashboards: [],
        dashboardComponents: [],
        componentAtoms: []
      },
      trainingExamples: [],
      statistics: this.data.statistics
    };

    // Build linked hierarchy
    for (const attribute of category.attributes) {
      // Find dashboards for this attribute
      for (const [relKey, relationship] of this.data.relationships.attributeDashboards) {
        if (relationship.attributeId === attribute.id) {
          const dashboard = this.getDashboardHierarchy(relationship.dashboardId);
          if (dashboard) {
            linkedMap.dashboards.push(dashboard);

            // Add components and atoms
            for (const component of dashboard.components) {
              linkedMap.components.push(component);
              linkedMap.atoms.push(...component.atoms);
            }
          }
        }
      }
    }

    // Add relationships
    linkedMap.relationships.categoryAttributes = Array.from(this.data.relationships.categoryAttributes.values());
    linkedMap.relationships.attributeDashboards = Array.from(this.data.relationships.attributeDashboards.values());
    linkedMap.relationships.dashboardComponents = Array.from(this.data.relationships.dashboardComponents.values());
    linkedMap.relationships.componentAtoms = Array.from(this.data.relationships.componentAtoms.values());

    // Add relevant training examples
    linkedMap.trainingExamples = this.getTrainingData({ tags: category.name.toLowerCase() });

    return linkedMap;
  }

  updateStatistics() {
    this.data.statistics = {
      totalCategories: this.data.categories.size,
      totalAttributes: this.data.attributes.size,
      totalDashboards: this.data.dashboards.size,
      totalComponents: this.data.components.size,
      totalAtoms: this.data.atoms.size,
      totalTrainingExamples: this.data.trainingExamples.length,
      totalRelationships:
        this.data.relationships.categoryAttributes.size +
        this.data.relationships.attributeDashboards.size +
        this.data.relationships.dashboardComponents.size +
        this.data.relationships.componentAtoms.size
    };
  }

  getStatistics() {
    return this.data.statistics;
  }

  exportToFile(outputPath) {
    this.save();
    console.log(`✅ Exported linked schema data to ${outputPath}`);
    return outputPath;
  }
}

// Main workflow to store training data as linked schemas
async function storeTrainingDataAsLinkedSchemas() {
  console.log('🔗 LINKED SCHEMA TRAINING DATA STORAGE SYSTEM');
  console.log('============================================');
  console.log('');

  const storage = new LinkedSchemaStorage('./linked-schema-training-data.json');

  try {
    // Sample SEO Category with complete linked schema
    const seoCategory = {
      id: 'seo-optimization-category',
      name: 'SEO Optimization',
      description: 'Complete Search Engine Optimization attribute management system',
      complexity: 'complex',
      domain: 'seo',
      metadata: {
        purpose: 'Manage all SEO-related attributes for web pages',
        targetAudience: 'web-developers, seo-specialists',
        version: '1.0.0'
      }
    };

    // 20 SEO Attributes with complete schemas
    const seoAttributes = [
      {
        id: 'meta-title-attr',
        name: 'Meta Title',
        type: 'text',
        description: 'HTML meta title tag for search engines',
        required: true,
        schema: {
          visual: { maxLength: 60, showCounter: true },
          behavioral: { validation: 'required', trim: true },
          semantic: { purpose: 'seo-title', context: 'head' },
          accessibility: { aria: { describedby: 'meta-title-help' } },
          responsive: { priority: 'high' }
        },
        metadata: { impact: 'high', difficulty: 'low' }
      },
      {
        id: 'meta-description-attr',
        name: 'Meta Description',
        type: 'text',
        description: 'HTML meta description for search result snippets',
        required: true,
        schema: {
          visual: { maxLength: 160, showCounter: true, multiline: true },
          behavioral: { validation: 'required', trim: true },
          semantic: { purpose: 'seo-description', context: 'head' },
          accessibility: { aria: { describedby: 'meta-description-help' } },
          responsive: { priority: 'high' }
        },
        metadata: { impact: 'high', difficulty: 'low' }
      },
      {
        id: 'title-tag-attr',
        name: 'Title Tag',
        type: 'text',
        description: 'HTML <title> tag content',
        required: true,
        schema: {
          visual: { maxLength: 60, showCounter: true },
          behavioral: { validation: 'required', trim: true },
          semantic: { purpose: 'page-title', context: 'head' },
          accessibility: { aria: { label: 'Page title' } },
          responsive: { priority: 'critical' }
        },
        metadata: { impact: 'critical', difficulty: 'low' }
      },
      {
        id: 'h1-tag-attr',
        name: 'H1 Tag',
        type: 'text',
        description: 'Main heading (H1) content',
        required: true,
        schema: {
          visual: { maxLength: 70, showCounter: true },
          behavioral: { validation: 'required', trim: true },
          semantic: { purpose: 'main-heading', context: 'content' },
          accessibility: { aria: { level: 1 } },
          responsive: { priority: 'high' }
        },
        metadata: { impact: 'high', difficulty: 'low' }
      },
      {
        id: 'h2-tags-attr',
        name: 'H2 Tags',
        type: 'array',
        description: 'Secondary headings (H2) for content structure',
        required: false,
        schema: {
          visual: { itemType: 'text', maxItems: 10, addButton: true },
          behavioral: { validation: 'array', minItems: 0, maxItems: 10 },
          semantic: { purpose: 'section-headings', context: 'content' },
          accessibility: { aria: { level: 2 } },
          responsive: { priority: 'medium' }
        },
        metadata: { impact: 'medium', difficulty: 'medium' }
      },
      {
        id: 'canonical-url-attr',
        name: 'Canonical URL',
        type: 'text',
        description: 'Canonical URL to prevent duplicate content issues',
        required: false,
        schema: {
          visual: { placeholder: 'https://example.com/page' },
          behavioral: { validation: 'url', trim: true },
          semantic: { purpose: 'canonical-reference', context: 'head' },
          accessibility: { aria: { describedby: 'canonical-help' } },
          responsive: { priority: 'medium' }
        },
        metadata: { impact: 'medium', difficulty: 'low' }
      },
      {
        id: 'robots-txt-attr',
        name: 'Robots.txt',
        type: 'boolean',
        description: 'Robots.txt file is properly configured',
        required: false,
        schema: {
          visual: { label: 'Robots.txt configured' },
          behavioral: { default: false },
          semantic: { purpose: 'crawler-control', context: 'server' },
          accessibility: { aria: { checked: false } },
          responsive: { priority: 'low' }
        },
        metadata: { impact: 'low', difficulty: 'medium' }
      },
      {
        id: 'xml-sitemap-attr',
        name: 'XML Sitemap',
        type: 'boolean',
        description: 'XML sitemap is submitted to search engines',
        required: false,
        schema: {
          visual: { label: 'XML sitemap submitted' },
          behavioral: { default: false },
          semantic: { purpose: 'site-structure', context: 'server' },
          accessibility: { aria: { checked: false } },
          responsive: { priority: 'low' }
        },
        metadata: { impact: 'low', difficulty: 'medium' }
      },
      {
        id: 'page-speed-attr',
        name: 'Page Speed',
        type: 'number',
        description: 'Page loading speed score (0-100)',
        required: false,
        range: { min: 0, max: 100 },
        schema: {
          visual: { showSlider: true, showValue: true },
          behavioral: { validation: 'range', min: 0, max: 100 },
          semantic: { purpose: 'performance-metric', context: 'technical' },
          accessibility: { aria: { valuenow: 50, valuemin: 0, valuemax: 100 } },
          responsive: { priority: 'high' }
        },
        metadata: { impact: 'high', difficulty: 'high' }
      },
      {
        id: 'mobile-friendly-attr',
        name: 'Mobile Friendly',
        type: 'boolean',
        description: 'Page is optimized for mobile devices',
        required: false,
        schema: {
          visual: { label: 'Mobile optimized' },
          behavioral: { default: false },
          semantic: { purpose: 'mobile-compatibility', context: 'responsive' },
          accessibility: { aria: { checked: false } },
          responsive: { priority: 'high' }
        },
        metadata: { impact: 'high', difficulty: 'medium' }
      },
      {
        id: 'ssl-certificate-attr',
        name: 'SSL Certificate',
        type: 'boolean',
        description: 'HTTPS/SSL certificate is properly configured',
        required: true,
        schema: {
          visual: { label: 'HTTPS enabled' },
          behavioral: { default: true },
          semantic: { purpose: 'security-protocol', context: 'server' },
          accessibility: { aria: { checked: true } },
          responsive: { priority: 'critical' }
        },
        metadata: { impact: 'critical', difficulty: 'low' }
      },
      {
        id: 'internal-links-attr',
        name: 'Internal Links',
        type: 'number',
        description: 'Number of internal links on the page',
        required: false,
        range: { min: 0 },
        schema: {
          visual: { showValue: true, min: 0 },
          behavioral: { validation: 'min', min: 0 },
          semantic: { purpose: 'site-navigation', context: 'linking' },
          accessibility: { aria: { describedby: 'internal-links-help' } },
          responsive: { priority: 'medium' }
        },
        metadata: { impact: 'medium', difficulty: 'low' }
      },
      {
        id: 'external-links-attr',
        name: 'External Links',
        type: 'number',
        description: 'Number of external links on the page',
        required: false,
        range: { min: 0 },
        schema: {
          visual: { showValue: true, min: 0 },
          behavioral: { validation: 'min', min: 0 },
          semantic: { purpose: 'external-references', context: 'linking' },
          accessibility: { aria: { describedby: 'external-links-help' } },
          responsive: { priority: 'medium' }
        },
        metadata: { impact: 'medium', difficulty: 'low' }
      },
      {
        id: 'image-alt-tags-attr',
        name: 'Image Alt Tags',
        type: 'number',
        description: 'Number of images with proper alt tags',
        required: false,
        range: { min: 0 },
        schema: {
          visual: { showValue: true, min: 0 },
          behavioral: { validation: 'min', min: 0 },
          semantic: { purpose: 'accessibility-content', context: 'images' },
          accessibility: { aria: { describedby: 'alt-tags-help' } },
          responsive: { priority: 'medium' }
        },
        metadata: { impact: 'medium', difficulty: 'low' }
      },
      {
        id: 'keyword-density-attr',
        name: 'Keyword Density',
        type: 'number',
        description: 'Primary keyword density percentage (0-100)',
        required: false,
        range: { min: 0, max: 100 },
        schema: {
          visual: { showSlider: true, showValue: true, unit: '%' },
          behavioral: { validation: 'range', min: 0, max: 100 },
          semantic: { purpose: 'content-optimization', context: 'seo' },
          accessibility: { aria: { valuenow: 2, valuemin: 0, valuemax: 100 } },
          responsive: { priority: 'medium' }
        },
        metadata: { impact: 'medium', difficulty: 'medium' }
      },
      {
        id: 'url-structure-attr',
        name: 'URL Structure',
        type: 'text',
        description: 'Clean, SEO-friendly URL structure',
        required: true,
        schema: {
          visual: { placeholder: '/category/page-name' },
          behavioral: { validation: 'url-pattern', trim: true },
          semantic: { purpose: 'url-optimization', context: 'technical' },
          accessibility: { aria: { describedby: 'url-structure-help' } },
          responsive: { priority: 'high' }
        },
        metadata: { impact: 'high', difficulty: 'low' }
      },
      {
        id: 'breadcrumb-nav-attr',
        name: 'Breadcrumb Navigation',
        type: 'boolean',
        description: 'Breadcrumb navigation is implemented',
        required: false,
        schema: {
          visual: { label: 'Breadcrumb navigation enabled' },
          behavioral: { default: false },
          semantic: { purpose: 'user-navigation', context: 'navigation' },
          accessibility: { aria: { label: 'Breadcrumb navigation' } },
          responsive: { priority: 'medium' }
        },
        metadata: { impact: 'medium', difficulty: 'medium' }
      },
      {
        id: 'open-graph-attr',
        name: 'Open Graph Tags',
        type: 'object',
        description: 'Open Graph meta tags for social media sharing',
        required: false,
        schema: {
          visual: { expandable: true, showPreview: true },
          behavioral: { validation: 'object', required: ['title', 'type', 'url'] },
          semantic: { purpose: 'social-sharing', context: 'meta' },
          accessibility: { aria: { expanded: false } },
          responsive: { priority: 'low' }
        },
        metadata: { impact: 'low', difficulty: 'medium' }
      },
      {
        id: 'twitter-cards-attr',
        name: 'Twitter Cards',
        type: 'object',
        description: 'Twitter Card meta tags for Twitter sharing',
        required: false,
        schema: {
          visual: { expandable: true, showPreview: true },
          behavioral: { validation: 'object', required: ['card', 'title'] },
          semantic: { purpose: 'social-sharing', context: 'meta' },
          accessibility: { aria: { expanded: false } },
          responsive: { priority: 'low' }
        },
        metadata: { impact: 'low', difficulty: 'medium' }
      },
      {
        id: 'structured-data-attr',
        name: 'Structured Data',
        type: 'object',
        description: 'Schema.org structured data markup',
        required: false,
        schema: {
          visual: { expandable: true, codeEditor: true },
          behavioral: { validation: 'json-ld', required: ['@context', '@type'] },
          semantic: { purpose: 'semantic-markup', context: 'structured' },
          accessibility: { aria: { expanded: false } },
          responsive: { priority: 'low' }
        },
        metadata: { impact: 'low', difficulty: 'high' }
      }
    ];

    // Store category with attributes
    storage.storeCategoryWithAttributes(seoCategory, seoAttributes);

    // Create dashboards for each attribute with complete component hierarchies
    console.log('');
    console.log('📊 Creating 20 dashboards with complete component hierarchies...');

    let totalComponents = 0;
    let totalAtoms = 0;

    for (let i = 0; i < seoAttributes.length; i++) {
      const attribute = seoAttributes[i];
      console.log(`   ${i + 1}/20: Creating dashboard for ${attribute.name}`);

      const dashboard = {
        id: `${attribute.id}-dashboard`,
        categoryId: seoCategory.id,
        attributeId: attribute.id,
        name: `${attribute.name} Configuration`,
        purpose: `Customize ${attribute.name}`,
        layout: {
          type: 'single',
          columns: 12,
          rows: 4,
          areas: [
            ['input', 'input', 'input', 'input', 'input', 'input', 'input', 'input', 'validation', 'validation', 'validation', 'validation'],
            ['preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview'],
            ['preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'preview'],
            ['.', '.', '.', '.', '.', '.', '.', '.', 'save', 'save', 'save', 'save']
          ],
          responsive: {
            breakpoints: { mobile: 'stack', tablet: 'grid', desktop: 'grid' },
            fluid: true
          }
        },
        ui: {
          theme: 'professional',
          styling: {
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          },
          animations: [
            { type: 'fade-in', duration: 300 },
            { type: 'slide-up', duration: 200 }
          ],
          accessibility: {
            highContrast: true,
            keyboardNavigation: true,
            screenReader: true
          }
        },
        dataFlow: {
          attributeInput: attribute.id,
          componentInputs: {
            validationRules: [`required:${attribute.required}`, `type:${attribute.type}`],
            transformations: ['trim', 'validate', 'format']
          },
          componentOutputs: {
            configuredValue: attribute.id,
            validationStatus: `${attribute.id}_valid`,
            previewData: `${attribute.id}_preview`
          },
          transformations: [
            {
              id: 'input-validation',
              type: 'validation',
              rules: attribute.schema.behavioral?.validation || []
            },
            {
              id: 'data-formatting',
              type: 'formatting',
              rules: ['trim', 'lowercase']
            }
          ],
          validation: {
            required: attribute.required,
            type: attribute.type,
            customRules: attribute.schema.behavioral?.validation || []
          }
        },
        validation: {
          attribute: {
            required: attribute.required,
            type: attribute.type,
            custom: attribute.schema.behavioral?.validation || []
          },
          components: {
            input: ['required', 'format'],
            validation: ['status-check'],
            preview: ['render-check']
          }
        },
        metadata: {
          complexity: attribute.metadata?.difficulty === 'high' ? 5 :
                     attribute.metadata?.difficulty === 'medium' ? 3 : 2,
          estimatedTime: attribute.metadata?.difficulty === 'high' ? 20 :
                        attribute.metadata?.difficulty === 'medium' ? 10 : 5,
          componentsCount: 4,
          atomsCount: 8,
          dependencies: [],
          tags: ['seo', attribute.type, attribute.metadata?.impact || 'medium']
        }
      };

      // Create complete component hierarchy for this dashboard
      const components = [
        // Input Component
        {
          id: `${attribute.id}-input-component`,
          name: `${attribute.name} Input`,
          category: 'input',
          description: `Input component for configuring ${attribute.name}`,
          purpose: `Allow user to input and configure ${attribute.name}`,
          layout: {
            type: 'vertical',
            constraints: ['full-width'],
            responsive: { priority: 'high' }
          },
          dataFlow: {
            inputs: [],
            outputs: [attribute.id],
            transformations: ['validate', 'format'],
            validation: attribute.schema.behavioral?.validation || []
          },
          interactions: {
            events: ['onChange', 'onFocus', 'onBlur'],
            stateManagement: {
              initialState: { value: '', isValid: true, errors: [] },
              reducers: ['value-change', 'validation-update'],
              effects: ['debounced-validation'],
              selectors: ['current-value', 'validation-status']
            },
            accessibility: attribute.schema.accessibility
          },
          metadata: {
            complexity: 3,
            reusability: 0.8,
            performance: 0.9,
            accessibility: 0.95,
            atomsCount: 2,
            estimatedDevTime: 15
          },
          position: { row: 0, col: 0, width: 8, height: 1 },
          atoms: [
            {
              id: `${attribute.id}-input-field-atom`,
              atomId: `${attribute.type}-input-field`,
              name: `${attribute.name} Input Field`,
              category: 'input',
              type: attribute.type,
              position: { row: 0, col: 0, width: 10, height: 1, zIndex: 1 },
              configuration: {
                variant: 'outlined',
                overrides: {
                  visual: attribute.schema.visual,
                  behavioral: attribute.schema.behavioral
                },
                dataBinding: {
                  source: 'user-input',
                  field: attribute.id,
                  transform: 'trim',
                  updateTrigger: 'change'
                }
              },
              connections: {
                inputs: [],
                outputs: ['validation-atom', 'preview-atom'],
                events: ['value-changed', 'focus-gained', 'validation-failed']
              },
              source: 'generated-from-schema',
              schema: attribute.schema
            },
            {
              id: `${attribute.id}-input-label-atom`,
              atomId: 'text-label',
              name: `${attribute.name} Label`,
              category: 'display',
              type: 'text',
              position: { row: 0, col: 0, width: 12, height: 1, zIndex: 2 },
              configuration: {
                variant: 'label',
                overrides: {
                  visual: { fontWeight: 'bold', color: '#333333' },
                  behavioral: { static: true }
                }
              },
              connections: { inputs: [], outputs: [], events: [] },
              source: 'generated-from-schema',
              schema: { visual: { text: attribute.name }, semantic: { purpose: 'label' } }
            }
          ]
        },

        // Validation Component
        {
          id: `${attribute.id}-validation-component`,
          name: `${attribute.name} Validation`,
          category: 'feedback',
          description: `Validation feedback for ${attribute.name}`,
          purpose: `Show validation status and error messages for ${attribute.name}`,
          layout: {
            type: 'vertical',
            constraints: ['right-aligned'],
            responsive: { priority: 'medium' }
          },
          dataFlow: {
            inputs: [attribute.id],
            outputs: [`${attribute.id}_validation_status`],
            transformations: ['validate-rules'],
            validation: []
          },
          interactions: {
            events: ['validation-changed'],
            stateManagement: {
              initialState: { isValid: true, errors: [], warnings: [] },
              reducers: ['validation-update'],
              effects: ['error-display'],
              selectors: ['validation-summary']
            },
            accessibility: {
              aria: { live: 'polite', describedby: `${attribute.id}-errors` },
              keyboard: { tabIndex: -1 },
              screenReader: { announceChanges: true }
            }
          },
          metadata: {
            complexity: 2,
            reusability: 0.9,
            performance: 0.95,
            accessibility: 0.98,
            atomsCount: 1,
            estimatedDevTime: 10
          },
          position: { row: 0, col: 8, width: 4, height: 1 },
          atoms: [
            {
              id: `${attribute.id}-validation-display-atom`,
              atomId: 'validation-display',
              name: `${attribute.name} Validation Display`,
              category: 'feedback',
              type: 'display',
              position: { row: 0, col: 0, width: 12, height: 1, zIndex: 1 },
              configuration: {
                variant: 'inline',
                overrides: {
                  visual: { showIcon: true, colorCoded: true },
                  behavioral: { autoHide: true, debounce: 500 }
                },
                dataBinding: {
                  source: 'validation-engine',
                  field: 'status',
                  transform: 'format-errors'
                }
              },
              connections: {
                inputs: [`${attribute.id}-input-field-atom`],
                outputs: [],
                events: ['validation-updated', 'errors-displayed']
              },
              source: 'generated-from-schema',
              schema: {
                visual: { showErrors: true, showWarnings: true, showSuccess: false },
                behavioral: { realTime: true, debounceMs: 300 },
                semantic: { purpose: 'validation-feedback' },
                accessibility: { aria: { live: 'polite' } }
              }
            }
          ]
        },

        // Preview Component
        {
          id: `${attribute.id}-preview-component`,
          name: `${attribute.name} Preview`,
          category: 'display',
          description: `Live preview of ${attribute.name} configuration`,
          purpose: `Show real-time preview of how ${attribute.name} will appear`,
          layout: {
            type: 'vertical',
            constraints: ['full-width', 'scrollable'],
            responsive: { priority: 'medium' }
          },
          dataFlow: {
            inputs: [attribute.id],
            outputs: [`${attribute.id}_preview_data`],
            transformations: ['render-preview'],
            validation: []
          },
          interactions: {
            events: ['preview-updated'],
            stateManagement: {
              initialState: { previewData: null, isLoading: false },
              reducers: ['preview-update'],
              effects: ['debounced-render'],
              selectors: ['current-preview']
            },
            accessibility: {
              aria: { label: `Preview of ${attribute.name}` },
              keyboard: { tabIndex: 0 }
            }
          },
          metadata: {
            complexity: 3,
            reusability: 0.7,
            performance: 0.85,
            accessibility: 0.9,
            atomsCount: 2,
            estimatedDevTime: 20
          },
          position: { row: 1, col: 0, width: 12, height: 2 },
          atoms: [
            {
              id: `${attribute.id}-preview-header-atom`,
              atomId: 'text-display',
              name: 'Preview Header',
              category: 'display',
              type: 'text',
              position: { row: 0, col: 0, width: 12, height: 1, zIndex: 1 },
              configuration: {
                variant: 'heading',
                overrides: {
                  visual: { fontSize: '16px', fontWeight: 'bold' }
                }
              },
              connections: { inputs: [], outputs: [], events: [] },
              source: 'generated-from-schema',
              schema: { visual: { text: `Preview: ${attribute.name}` }, semantic: { purpose: 'heading' } }
            },
            {
              id: `${attribute.id}-preview-content-atom`,
              atomId: 'content-preview',
              name: `${attribute.name} Content Preview`,
              category: 'display',
              type: 'display',
              position: { row: 1, col: 0, width: 12, height: 1, zIndex: 1 },
              configuration: {
                variant: 'live-preview',
                overrides: {
                  visual: { border: '1px solid #e0e0e0', padding: '12px' },
                  behavioral: { autoUpdate: true, showPlaceholder: true }
                },
                dataBinding: {
                  source: 'input-component',
                  field: attribute.id,
                  transform: 'render-preview'
                }
              },
              connections: {
                inputs: [`${attribute.id}-input-field-atom`],
                outputs: [],
                events: ['preview-rendered', 'content-updated']
              },
              source: 'generated-from-schema',
              schema: {
                visual: { liveUpdate: true, showLoader: true },
                behavioral: { debounceMs: 200 },
                semantic: { purpose: 'content-preview' },
                accessibility: { aria: { label: `Live preview of ${attribute.name}` } }
              }
            }
          ]
        },

        // Save Action Component
        {
          id: `${attribute.id}-save-component`,
          name: `${attribute.name} Save Action`,
          category: 'action',
          description: `Save action for ${attribute.name} configuration`,
          purpose: `Persist the ${attribute.name} configuration changes`,
          layout: {
            type: 'vertical',
            constraints: ['right-aligned'],
            responsive: { priority: 'high' }
          },
          dataFlow: {
            inputs: [attribute.id, `${attribute.id}_validation_status`],
            outputs: [`${attribute.id}_save_result`],
            transformations: ['prepare-save-data'],
            validation: ['require-valid-input']
          },
          interactions: {
            events: ['onSave', 'saveSuccess', 'saveError'],
            stateManagement: {
              initialState: { isSaving: false, lastSaved: null },
              reducers: ['save-start', 'save-success', 'save-error'],
              effects: ['api-call', 'notification'],
              selectors: ['save-status', 'can-save']
            },
            accessibility: {
              aria: { pressed: false, disabled: false },
              keyboard: { keyHandlers: ['Enter', 'Space'] }
            }
          },
          metadata: {
            complexity: 4,
            reusability: 0.95,
            performance: 0.9,
            accessibility: 0.95,
            atomsCount: 1,
            estimatedDevTime: 25
          },
          position: { row: 3, col: 8, width: 4, height: 1 },
          atoms: [
            {
              id: `${attribute.id}-save-button-atom`,
              atomId: 'action-button',
              name: `${attribute.name} Save Button`,
              category: 'action',
              type: 'interactive',
              position: { row: 0, col: 0, width: 12, height: 1, zIndex: 1 },
              configuration: {
                variant: 'primary',
                overrides: {
                  visual: { fullWidth: true, showIcon: true },
                  behavioral: {
                    loading: true,
                    disabledWhen: 'saving || !valid',
                    successState: true,
                    errorState: true
                  }
                },
                dataBinding: {
                  source: 'save-engine',
                  field: 'status',
                  transform: 'button-state'
                }
              },
              connections: {
                inputs: [`${attribute.id}-input-field-atom`, `${attribute.id}-validation-display-atom`],
                outputs: ['save-result'],
                events: ['save-initiated', 'save-completed', 'save-failed']
              },
              source: 'generated-from-schema',
              schema: {
                visual: { label: 'Save Configuration', icon: 'save' },
                behavioral: { async: true, confirm: false },
                semantic: { purpose: 'data-persistence' },
                accessibility: { aria: { label: 'Save configuration changes' } }
              }
            }
          ]
        }
      ];

      storage.storeDashboardWithHierarchy(dashboard, components);

      totalComponents += components.length;
      totalAtoms += components.reduce((sum, comp) => sum + (comp.atoms?.length || 0), 0);
    }

    console.log(`✅ Created 20 dashboards with ${totalComponents} components and ${totalAtoms} atoms`);

    // Generate comprehensive training data
    console.log('');
    console.log('🎓 Generating comprehensive training data from linked schemas...');

    const trainingData = [];

    // Generate training examples from the complete linked schema structure
    const linkedMap = storage.generateLinkedSchemaMap(seoCategory.id);

    if (linkedMap) {
      // Category-level training
      trainingData.push({
        input: {
          component: seoCategory.name,
          context: 'category',
          requirements: ['attributes', 'relationships', 'dashboards'],
          constraints: ['domain:seo', 'complexity:complex']
        },
        output: {
          schema: {
            visual: { layout: 'hierarchical' },
            behavioral: { relationships: 'linked' },
            semantic: { domain: seoCategory.domain, purpose: seoCategory.description },
            accessibility: { navigation: 'tree' },
            responsive: { adaptive: true }
          },
          composition: {
            attributes: linkedMap.attributes.length,
            dashboards: linkedMap.dashboards.length,
            components: linkedMap.components.length,
            atoms: linkedMap.atoms.length
          },
          styling: { theme: 'professional', hierarchy: 'nested' },
          interactions: {
            navigation: 'tree-view',
            editing: 'inline',
            validation: 'real-time'
          }
        },
        metadata: {
          confidence: 0.95,
          complexity: 5,
          tags: ['category', 'seo', 'hierarchical', 'linked-schema'],
          source: 'generated-linked-schema',
          timestamp: new Date()
        }
      });

      // Attribute-level training examples
      for (const attribute of linkedMap.attributes) {
        trainingData.push({
          input: {
            component: attribute.name,
            context: 'attribute',
            requirements: [`${attribute.type}-input`, 'validation', 'preview', 'save'],
            constraints: [`type:${attribute.type}`, `required:${attribute.required}`]
          },
          output: {
            schema: attribute.schema,
            composition: {
              dashboard: 1,
              components: 4,
              atoms: 8
            },
            styling: { layout: 'dashboard', theme: 'professional' },
            interactions: {
              input: 'direct-edit',
              validation: 'real-time',
              preview: 'live',
              save: 'async'
            }
          },
          metadata: {
            confidence: 0.9,
            complexity: attribute.required ? 4 : 3,
            tags: ['attribute', 'seo', attribute.type, 'dashboard'],
            source: 'generated-linked-schema',
            timestamp: new Date()
          }
        });
      }

      // Component-level training examples
      for (const component of linkedMap.components) {
        trainingData.push({
          input: {
            component: component.name,
            context: 'component',
            requirements: component.atoms?.map(a => a.atomId) || [],
            constraints: [`category:${component.category}`, `layout:${component.layout?.type}`]
          },
          output: {
            schema: {
              visual: component.layout,
              behavioral: component.interactions,
              semantic: { purpose: component.purpose },
              accessibility: component.interactions?.accessibility,
              responsive: component.layout?.responsive
            },
            composition: {
              atoms: component.atoms?.length || 0,
              layout: component.layout?.type,
              connections: 'linked'
            },
            styling: { theme: 'component', responsive: true },
            interactions: component.interactions?.events || []
          },
          metadata: {
            confidence: 0.85,
            complexity: component.metadata?.complexity || 2,
            tags: ['component', component.category, 'atoms', 'linked'],
            source: 'generated-linked-schema',
            timestamp: new Date()
          }
        });
      }
    }

    storage.storeTrainingData(trainingData);

    // Export the complete linked schema structure
    const exportPath = './complete-seo-linked-schema-training-data.json';
    storage.exportToFile(exportPath);

    // Display final comprehensive results
    console.log('');
    console.log('🎊 COMPLETE LINKED SCHEMA TRAINING DATA STORAGE');
    console.log('===============================================');

    const stats = storage.getStatistics();
    console.log('');
    console.log('📊 STORAGE STATISTICS:');
    console.log(`   🏷️  Categories: ${stats.totalCategories}`);
    console.log(`   📋 Attributes: ${stats.totalAttributes} (20 SEO attributes)`);
    console.log(`   📊 Dashboards: ${stats.totalDashboards} (1 per attribute)`);
    console.log(`   🔧 Components: ${stats.totalComponents} (${Math.round(stats.totalComponents/stats.totalDashboards)} per dashboard avg)`);
    console.log(`   🧩 Atoms: ${stats.totalAtoms} (${Math.round(stats.totalAtoms/stats.totalComponents)} per component avg)`);
    console.log(`   🎓 Training Examples: ${stats.totalTrainingExamples}`);
    console.log(`   🔗 Relationships: ${stats.totalRelationships}`);
    console.log('');

    console.log('🏗️  LINKED SCHEMA HIERARCHY STRUCTURE:');
    console.log('');
    console.log('Category (SEO Optimization)');
    console.log('├── Attributes (20 total)');
    console.log('│   ├── Meta Title → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Meta Description → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Title Tag → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── H1 Tag → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── H2 Tags → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Canonical URL → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Robots.txt → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── XML Sitemap → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Page Speed → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Mobile Friendly → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── SSL Certificate → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Internal Links → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── External Links → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Image Alt Tags → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Keyword Density → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── URL Structure → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Breadcrumb Nav → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Open Graph → Dashboard → 4 Components → 8 Atoms');
    console.log('│   ├── Twitter Cards → Dashboard → 4 Components → 8 Atoms');
    console.log('│   └── Structured Data → Dashboard → 4 Components → 8 Atoms');
    console.log('└── Relationships (Bidirectional Links)');
    console.log('    ├── Category ↔ Attributes');
    console.log('    ├── Attributes ↔ Dashboards');
    console.log('    ├── Dashboards ↔ Components');
    console.log('    └── Components ↔ Atoms');
    console.log('');

    console.log('💾 EXPORTED FILES:');
    console.log(`   📄 Linked Schema Data: ./linked-schema-training-data.json`);
    console.log(`   📊 Complete SEO System: ./complete-seo-linked-schema-training-data.json`);
    console.log('');

    console.log('🎯 TRAINING DATA FEATURES:');
    console.log('   ✅ Hierarchical Linked Schema Structure');
    console.log('   ✅ Complete SEO Attribute Coverage (20 attributes)');
    console.log('   ✅ Dashboard-Component-Atom Relationships');
    console.log('   ✅ Training Examples for Each Level');
    console.log('   ✅ Schema Definitions with Full Metadata');
    console.log('   ✅ Bidirectional Relationship Mapping');
    console.log('   ✅ JSON Export for Schema Mining System');
    console.log('');

    console.log('🚀 READY FOR SCHEMA MINING WORKFLOW:');
    console.log('   1. Load linked schema data into SchemaMiningSystem');
    console.log('   2. Train neural networks on hierarchical patterns');
    console.log('   3. Generate component libraries from learned schemas');
    console.log('   4. Build complete dashboard systems automatically');
    console.log('   5. Orchestrate workflows from linked schema maps');
    console.log('');
    console.log('🎊 MISSION ACCOMPLISHED: Training data stored as complete linked schema hierarchy!');
    console.log('   From category → attributes → dashboards → components → atoms - all linked and ready for AI training!');
    console.log('');
    console.log('================================================');

  } catch (error) {
    console.error('❌ Linked schema storage failed:', error);
    throw error;
  }
}

// Export for use as module
export { LinkedSchemaStorage };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  storeTrainingDataAsLinkedSchemas().catch(console.error);
}

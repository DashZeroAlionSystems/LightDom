/**
 * Storybook Mining Service
 * Extracts components and design patterns from websites and generates Storybook stories
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

export class StorybookMiningService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.db = config.db || new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
    
    this.outputDir = config.outputDir || path.join(process.cwd(), 'generated-components');
    this.browser = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 Initializing Storybook Mining Service...');
      
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });
      
      // Ensure database tables exist
      await this.ensureTables();
      
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      this.isInitialized = true;
      console.log('✅ Storybook Mining Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Storybook Mining Service:', error.message);
      throw error;
    }
  }

  async ensureTables() {
    const createTablesSQL = `
      -- Mined components table
      CREATE TABLE IF NOT EXISTS mined_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        source_url TEXT NOT NULL,
        component_type VARCHAR(100),
        html TEXT,
        css TEXT,
        attributes JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Component attributes table for data streams
      CREATE TABLE IF NOT EXISTS component_attributes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        component_id UUID REFERENCES mined_components(id) ON DELETE CASCADE,
        attribute_name VARCHAR(255) NOT NULL,
        attribute_value TEXT,
        data_stream VARCHAR(255),
        collection VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Storybook stories table
      CREATE TABLE IF NOT EXISTS storybook_stories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        component_id UUID REFERENCES mined_components(id) ON DELETE CASCADE,
        story_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        content TEXT NOT NULL,
        user_story TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_mined_components_source ON mined_components(source_url);
      CREATE INDEX IF NOT EXISTS idx_component_attributes_component ON component_attributes(component_id);
      CREATE INDEX IF NOT EXISTS idx_component_attributes_stream ON component_attributes(data_stream);
      CREATE INDEX IF NOT EXISTS idx_storybook_stories_component ON storybook_stories(component_id);
    `;

    await this.db.query(createTablesSQL);
  }

  async mineWebsite(url, options = {}) {
    const page = await this.browser.newPage();
    
    try {
      console.log(`🔍 Mining components from ${url}...`);
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract components from the page
      const components = await page.evaluate(() => {
        const extractedComponents = [];
        
        // Common component selectors for design systems
        const componentSelectors = [
          'button', '.button', '[role="button"]',
          'input', '.input', '[role="textbox"]',
          '.card', '[role="article"]',
          '.modal', '[role="dialog"]',
          '.nav', 'nav', '[role="navigation"]',
          '.menu', '[role="menu"]',
          'form', '.form',
          '.alert', '[role="alert"]',
          '.badge', '.chip', '.tag',
          '.dropdown', '[role="listbox"]',
          '.tab', '[role="tab"]',
          '.table', '[role="table"]',
        ];
        
        componentSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el, index) => {
            if (index > 10) return; // Limit to 10 of each type
            
            const computedStyle = window.getComputedStyle(el);
            const attributes = {};
            
            // Extract key attributes
            for (let attr of el.attributes) {
              attributes[attr.name] = attr.value;
            }
            
            extractedComponents.push({
              selector,
              html: el.outerHTML.substring(0, 5000), // Limit HTML size
              text: el.textContent?.trim().substring(0, 500),
              className: el.className,
              id: el.id,
              attributes,
              styles: {
                display: computedStyle.display,
                position: computedStyle.position,
                width: computedStyle.width,
                height: computedStyle.height,
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                fontSize: computedStyle.fontSize,
                fontFamily: computedStyle.fontFamily,
                borderRadius: computedStyle.borderRadius,
                padding: computedStyle.padding,
                margin: computedStyle.margin,
              },
            });
          });
        });
        
        return extractedComponents;
      });
      
      console.log(`✅ Extracted ${components.length} components from ${url}`);
      
      // Save components to database
      const savedComponents = [];
      for (const comp of components) {
        const componentId = await this.saveComponent(url, comp);
        savedComponents.push({ id: componentId, ...comp });
      }
      
      return savedComponents;
      
    } catch (error) {
      console.error(`Failed to mine ${url}:`, error.message);
      throw error;
    } finally {
      await page.close();
    }
  }

  async saveComponent(sourceUrl, componentData) {
    const name = this.generateComponentName(componentData);
    const componentType = this.detectComponentType(componentData);
    
    const result = await this.db.query(
      `INSERT INTO mined_components (name, source_url, component_type, html, attributes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        name,
        sourceUrl,
        componentType,
        componentData.html,
        JSON.stringify(componentData.attributes),
        JSON.stringify({
          selector: componentData.selector,
          styles: componentData.styles,
          text: componentData.text,
        }),
      ]
    );
    
    const componentId = result.rows[0].id;
    
    // Save attributes as data streams
    await this.saveComponentAttributes(componentId, componentData);
    
    return componentId;
  }

  generateComponentName(componentData) {
    const selector = componentData.selector;
    const className = componentData.className || '';
    
    let name = selector.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (className) {
      name += '_' + className.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '_');
    }
    
    return name.substring(0, 255);
  }

  detectComponentType(componentData) {
    const selector = componentData.selector.toLowerCase();
    const className = (componentData.className || '').toLowerCase();
    
    if (selector.includes('button') || className.includes('button')) return 'Button';
    if (selector.includes('input') || className.includes('input')) return 'Input';
    if (className.includes('card')) return 'Card';
    if (selector.includes('nav') || className.includes('nav')) return 'Navigation';
    if (className.includes('modal') || className.includes('dialog')) return 'Modal';
    if (className.includes('alert')) return 'Alert';
    if (className.includes('badge') || className.includes('chip')) return 'Badge';
    if (selector.includes('form') || className.includes('form')) return 'Form';
    
    return 'Component';
  }

  async saveComponentAttributes(componentId, componentData) {
    // Define data streams for different attribute types
    const dataStreams = {
      style: 'css_mining_stream',
      attribute: 'html_attribute_stream',
      content: 'content_mining_stream',
      interaction: 'interaction_pattern_stream',
    };
    
    // Save style attributes
    for (const [key, value] of Object.entries(componentData.styles || {})) {
      if (value && value !== 'none') {
        await this.db.query(
          `INSERT INTO component_attributes (component_id, attribute_name, attribute_value, data_stream, collection)
           VALUES ($1, $2, $3, $4, $5)`,
          [componentId, `style_${key}`, value, dataStreams.style, 'design_system_attributes']
        );
      }
    }
    
    // Save HTML attributes
    for (const [key, value] of Object.entries(componentData.attributes || {})) {
      await this.db.query(
        `INSERT INTO component_attributes (component_id, attribute_name, attribute_value, data_stream, collection)
         VALUES ($1, $2, $3, $4, $5)`,
        [componentId, key, value, dataStreams.attribute, 'html_attributes']
      );
    }
  }

  async generateStorybookStory(componentId) {
    const result = await this.db.query(
      'SELECT * FROM mined_components WHERE id = $1',
      [componentId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Component ${componentId} not found`);
    }
    
    const component = result.rows[0];
    
    // Generate story content
    const storyContent = this.generateStoryContent(component);
    
    // Save story file
    const fileName = `${component.name}.stories.tsx`;
    const filePath = path.join(this.outputDir, fileName);
    
    await fs.writeFile(filePath, storyContent, 'utf-8');
    
    // Save to database
    await this.db.query(
      `INSERT INTO storybook_stories (component_id, story_name, file_path, content, user_story)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        componentId,
        component.name,
        filePath,
        storyContent,
        `As a user, I want to use ${component.component_type} components that are visually consistent with ${component.source_url}`,
      ]
    );
    
    console.log(`✅ Generated Storybook story: ${fileName}`);
    
    return filePath;
  }

  generateStoryContent(component) {
    const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '');
    const metadata = typeof component.metadata === 'string' 
      ? JSON.parse(component.metadata) 
      : component.metadata;
    
    return `import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Mined from: ${component.source_url}
// Component Type: ${component.component_type}

const ${componentName}: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${component.html.replace(/`/g, '\\`')}\` }} />
  );
};

const meta: Meta<typeof ${componentName}> = {
  title: 'Mined Components/${component.component_type}/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {};

export const FromSource: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Mined from ${component.source_url}',
      },
    },
  },
};
`;
  }

  async mineDesignSites(sites = []) {
    const defaultSites = [
      'https://www.tensorflow.org',
      'https://www.kaggle.com',
      'https://material.io',
      'https://ant.design/components/overview',
      'https://animejs.com',
    ];
    
    const sitesToMine = sites.length > 0 ? sites : defaultSites;
    const results = [];
    
    for (const site of sitesToMine) {
      try {
        const components = await this.mineWebsite(site);
        results.push({ site, components, success: true });
        
        // Generate stories for the first few components
        for (const comp of components.slice(0, 3)) {
          try {
            await this.generateStorybookStory(comp.id);
          } catch (error) {
            console.error(`Failed to generate story for component:`, error.message);
          }
        }
      } catch (error) {
        console.error(`Failed to mine ${site}:`, error.message);
        results.push({ site, error: error.message, success: false });
      }
    }
    
    return results;
  }

  async getStatus() {
    const result = await this.db.query(`
      SELECT 
        COUNT(DISTINCT mc.id) as total_components,
        COUNT(DISTINCT ss.id) as total_stories,
        COUNT(DISTINCT mc.source_url) as sources_mined,
        COUNT(DISTINCT ca.data_stream) as data_streams
      FROM mined_components mc
      LEFT JOIN storybook_stories ss ON mc.id = ss.component_id
      LEFT JOIN component_attributes ca ON mc.id = ca.component_id
    `);
    
    return {
      initialized: this.isInitialized,
      outputDir: this.outputDir,
      ...result.rows[0],
    };
  }

  async close() {
    console.log('🛑 Closing Storybook Mining Service...');
    
    if (this.browser) {
      await this.browser.close();
    }
    
    await this.db.end();
    console.log('✅ Storybook Mining Service closed');
  }
}

export default StorybookMiningService;

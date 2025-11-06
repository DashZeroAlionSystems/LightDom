/**
 * Self-Rendering Component Generator
 * 
 * Generates SEO-friendly websites and components from style guide prompts
 * using detected patterns and Material Design schemas.
 */

interface GenerationConfig {
  prompt: string;
  styleGuide?: 'material-design' | 'bootstrap' | 'tailwind' | 'custom';
  framework?: 'react' | 'vue' | 'html-css';
  seoOptimized: boolean;
  accessible: boolean;
  responsive: boolean;
}

interface GeneratedWebsite {
  id: string;
  config: GenerationConfig;
  components: Array<{
    name: string;
    code: string;
    framework: string;
    schema: any;
  }>;
  pages: Array<{
    name: string;
    route: string;
    components: string[];
    code: string;
  }>;
  styles: {
    global: string;
    components: Record<string, string>;
  };
  buildConfig: {
    packageJson: any;
    viteConfig?: string;
    webpackConfig?: string;
  };
  preview: {
    html: string;
    css: string;
    js: string;
  };
  metadata: {
    generatedAt: Date;
    estimatedComplexity: 'simple' | 'moderate' | 'complex';
    componentCount: number;
    pageCount: number;
  };
}

export class SelfRenderingComponentGenerator {
  private db: any;
  private deepseekService: any;

  constructor(database: any, deepseekService: any) {
    this.db = database;
    this.deepseekService = deepseekService;
  }

  /**
   * Generate website from prompt
   */
  async generateFromPrompt(config: GenerationConfig): Promise<GeneratedWebsite> {
    // Analyze prompt with DeepSeek
    const analysis = await this.analyzePrompt(config.prompt);

    // Get Material Design schema if needed
    const materialSchema = config.styleGuide === 'material-design' 
      ? await this.getMaterialDesignSchema()
      : null;

    // Get usage patterns
    const patterns = await this.getUsagePatterns();

    // Generate components
    const components = await this.generateComponents(
      analysis,
      config,
      materialSchema,
      patterns
    );

    // Generate pages
    const pages = await this.generatePages(analysis, components, config);

    // Generate styles
    const styles = await this.generateStyles(config, materialSchema);

    // Generate build config
    const buildConfig = await this.generateBuildConfig(config);

    // Generate preview
    const preview = await this.generatePreview(pages, styles, config);

    const website: GeneratedWebsite = {
      id: `gen-${Date.now()}`,
      config,
      components,
      pages,
      styles,
      buildConfig,
      preview,
      metadata: {
        generatedAt: new Date(),
        estimatedComplexity: this.estimateComplexity(components.length, pages.length),
        componentCount: components.length,
        pageCount: pages.length
      }
    };

    // Save to database
    await this.saveGeneratedWebsite(website);

    return website;
  }

  /**
   * Analyze prompt with DeepSeek
   */
  private async analyzePrompt(prompt: string): Promise<any> {
    const analysisPrompt = `Analyze this website generation request and extract:
1. Required pages (e.g., home, about, contact)
2. Required components (e.g., navigation, hero, product grid)
3. Content types (e.g., text, images, forms)
4. Layout structure
5. Key features

Request: ${prompt}

Respond in JSON format with structure:
{
  "pages": [{"name": "...", "description": "..."}],
  "components": [{"name": "...", "type": "...", "purpose": "..."}],
  "contentTypes": ["..."],
  "layout": "...",
  "features": ["..."]
}`;

    const response = await this.deepseekService.chat([
      { role: 'user', content: analysisPrompt }
    ]);

    try {
      return JSON.parse(response);
    } catch {
      // Fallback if parsing fails
      return {
        pages: [{ name: 'Home', description: 'Main landing page' }],
        components: [
          { name: 'Navigation', type: 'navigation', purpose: 'Site navigation' },
          { name: 'Hero', type: 'hero', purpose: 'Hero section' },
          { name: 'Footer', type: 'footer', purpose: 'Page footer' }
        ],
        contentTypes: ['text', 'images'],
        layout: 'standard',
        features: ['responsive', 'seo']
      };
    }
  }

  /**
   * Generate components
   */
  private async generateComponents(
    analysis: any,
    config: GenerationConfig,
    materialSchema: any,
    patterns: any[]
  ): Promise<any[]> {
    const components = [];

    for (const componentSpec of analysis.components) {
      const component = await this.generateSingleComponent(
        componentSpec,
        config,
        materialSchema,
        patterns
      );
      components.push(component);
    }

    return components;
  }

  /**
   * Generate single component
   */
  private async generateSingleComponent(
    spec: any,
    config: GenerationConfig,
    materialSchema: any,
    patterns: any[]
  ): Promise<any> {
    const framework = config.framework || 'react';
    
    // Find matching pattern
    const pattern = patterns.find(p => p.pattern_name === spec.type);

    // Get Material Design component if available
    const mdComponent = materialSchema && spec.type === 'button' 
      ? materialSchema.components.buttons[0]
      : null;

    let code = '';

    if (framework === 'react') {
      code = this.generateReactComponent(spec, mdComponent, config);
    } else if (framework === 'vue') {
      code = this.generateVueComponent(spec, mdComponent, config);
    } else {
      code = this.generateHTMLComponent(spec, mdComponent, config);
    }

    return {
      name: spec.name,
      code,
      framework,
      schema: {
        type: spec.type,
        materialDesign: mdComponent,
        pattern,
        seo: config.seoOptimized,
        accessible: config.accessible
      }
    };
  }

  /**
   * Generate React component
   */
  private generateReactComponent(spec: any, mdComponent: any, config: GenerationConfig): string {
    const componentName = spec.name.replace(/\s+/g, '');
    const ariaProps = config.accessible ? `
      role="${this.getAriaRole(spec.type)}"
      aria-label="${spec.purpose}"` : '';

    return `import React from 'react';
${config.styleGuide === 'material-design' ? "import { styled } from '@mui/material/styles';" : ''}

${config.styleGuide === 'material-design' && mdComponent ? `
const Styled${componentName} = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
}));
` : ''}

/**
 * ${spec.purpose}
 * ${config.seoOptimized ? '@seo-optimized' : ''}
 * ${config.accessible ? '@wcag-2.1-compliant' : ''}
 */
export const ${componentName} = (props) => {
  return (
    <${config.styleGuide === 'material-design' && mdComponent ? `Styled${componentName}` : 'div'}
      className="${spec.type}-component"${ariaProps}
    >
      {/* ${spec.purpose} */}
      {props.children}
    </${config.styleGuide === 'material-design' && mdComponent ? `Styled${componentName}` : 'div'}>
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};
`;
  }

  /**
   * Generate Vue component
   */
  private generateVueComponent(spec: any, mdComponent: any, config: GenerationConfig): string {
    const componentName = spec.name.replace(/\s+/g, '');
    const ariaProps = config.accessible ? `
      :role="'${this.getAriaRole(spec.type)}'"
      :aria-label="'${spec.purpose}'"` : '';

    return `<template>
  <div 
    class="${spec.type}-component"${ariaProps}
  >
    <!-- ${spec.purpose} -->
    <slot />
  </div>
</template>

<script>
/**
 * ${spec.purpose}
 * ${config.seoOptimized ? '@seo-optimized' : ''}
 * ${config.accessible ? '@wcag-2.1-compliant' : ''}
 */
export default {
  name: '${componentName}',
  props: {
    // Component props
  }
};
</script>

<style scoped>
.${spec.type}-component {
  ${config.styleGuide === 'material-design' ? `
  padding: 16px;
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border-radius: var(--md-sys-shape-corner-medium);
  ` : ''}
}
</style>
`;
  }

  /**
   * Generate HTML component
   */
  private generateHTMLComponent(spec: any, mdComponent: any, config: GenerationConfig): string {
    const ariaProps = config.accessible ? `role="${this.getAriaRole(spec.type)}" aria-label="${spec.purpose}"` : '';

    return `<!-- ${spec.purpose} -->
<!-- ${config.seoOptimized ? 'SEO Optimized' : ''} -->
<!-- ${config.accessible ? 'WCAG 2.1 Compliant' : ''} -->
<div class="${spec.type}-component" ${ariaProps}>
  <!-- Component content -->
</div>
`;
  }

  /**
   * Generate pages
   */
  private async generatePages(
    analysis: any,
    components: any[],
    config: GenerationConfig
  ): Promise<any[]> {
    const pages = [];

    for (const pageSpec of analysis.pages) {
      const page = await this.generateSinglePage(pageSpec, components, config);
      pages.push(page);
    }

    return pages;
  }

  /**
   * Generate single page
   */
  private async generateSinglePage(
    spec: any,
    components: any[],
    config: GenerationConfig
  ): Promise<any> {
    const framework = config.framework || 'react';
    const pageName = spec.name.replace(/\s+/g, '');
    const route = '/' + pageName.toLowerCase().replace('home', '');

    const usedComponents = components.map(c => c.name.replace(/\s+/g, ''));

    let code = '';

    if (framework === 'react') {
      code = `import React from 'react';
${usedComponents.map(c => `import ${c} from '../components/${c}';`).join('\n')}

/**
 * ${spec.description}
 * ${config.seoOptimized ? '@seo-optimized' : ''}
 */
const ${pageName}Page = () => {
  return (
    <div className="${pageName.toLowerCase()}-page">
      ${config.seoOptimized ? `<Helmet>
        <title>${spec.name} - Your Site</title>
        <meta name="description" content="${spec.description}" />
      </Helmet>` : ''}
      ${usedComponents.map(c => `<${c} />`).join('\n      ')}
    </div>
  );
};

export default ${pageName}Page;
`;
    } else if (framework === 'vue') {
      code = `<template>
  <div class="${pageName.toLowerCase()}-page">
    ${usedComponents.map(c => `<${c} />`).join('\n    ')}
  </div>
</template>

<script>
${usedComponents.map(c => `import ${c} from '../components/${c}.vue';`).join('\n')}

/**
 * ${spec.description}
 * ${config.seoOptimized ? '@seo-optimized' : ''}
 */
export default {
  name: '${pageName}Page',
  components: {
    ${usedComponents.join(',\n    ')}
  }
};
</script>
`;
    } else {
      code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${config.seoOptimized ? `<title>${spec.name} - Your Site</title>
  <meta name="description" content="${spec.description}">` : ''}
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <div class="${pageName.toLowerCase()}-page">
    ${usedComponents.map(c => `<!-- ${c} component -->`).join('\n    ')}
  </div>
</body>
</html>
`;
    }

    return {
      name: spec.name,
      route,
      components: usedComponents,
      code
    };
  }

  /**
   * Generate styles
   */
  private async generateStyles(config: GenerationConfig, materialSchema: any): Promise<any> {
    let global = '';
    const components: Record<string, string> = {};

    if (config.styleGuide === 'material-design' && materialSchema) {
      global = this.generateMaterialDesignStyles(materialSchema);
    } else if (config.styleGuide === 'tailwind') {
      global = '@tailwind base;\n@tailwind components;\n@tailwind utilities;';
    } else if (config.styleGuide === 'bootstrap') {
      global = '@import "~bootstrap/dist/css/bootstrap.min.css";';
    } else {
      global = `/* Custom styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}
`;
    }

    if (config.responsive) {
      global += `
/* Responsive breakpoints */
@media (max-width: 768px) {
  /* Mobile styles */
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet styles */
}

@media (min-width: 1025px) {
  /* Desktop styles */
}
`;
    }

    return { global, components };
  }

  /**
   * Generate Material Design styles
   */
  private generateMaterialDesignStyles(schema: any): string {
    return `:root {
  /* Material Design Color System */
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-secondary: #625B71;
  --md-sys-color-on-secondary: #FFFFFF;
  
  /* Typography */
  --md-sys-typescale-display-large-size: 57px;
  --md-sys-typescale-headline-large-size: 32px;
  --md-sys-typescale-body-large-size: 16px;
  
  /* Shape */
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-small: 4px;
  --md-sys-shape-corner-medium: 8px;
  --md-sys-shape-corner-large: 16px;
  
  /* Elevation */
  --md-sys-elevation-level0: none;
  --md-sys-elevation-level1: 0px 1px 2px rgba(0, 0, 0, 0.3);
  --md-sys-elevation-level2: 0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px rgba(0, 0, 0, 0.15);
}

body {
  font-family: 'Roboto', sans-serif;
  font-size: var(--md-sys-typescale-body-large-size);
}
`;
  }

  /**
   * Generate build config
   */
  private async generateBuildConfig(config: GenerationConfig): Promise<any> {
    const framework = config.framework || 'react';
    
    const packageJson = {
      name: 'generated-website',
      version: '1.0.0',
      scripts: framework === 'react' || framework === 'vue' ? {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      } : {
        serve: 'serve .'
      },
      dependencies: framework === 'react' ? {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        ...(config.styleGuide === 'material-design' ? { '@mui/material': '^5.14.0', '@emotion/react': '^11.11.0', '@emotion/styled': '^11.11.0' } : {}),
        ...(config.seoOptimized ? { 'react-helmet': '^6.1.0' } : {})
      } : framework === 'vue' ? {
        'vue': '^3.3.0',
        ...(config.styleGuide === 'material-design' ? { 'vuetify': '^3.3.0' } : {})
      } : {},
      devDependencies: framework === 'react' || framework === 'vue' ? {
        'vite': '^4.4.0',
        ...(framework === 'react' ? { '@vitejs/plugin-react': '^4.0.0' } : { '@vitejs/plugin-vue': '^4.3.0' })
      } : {
        'serve': '^14.2.0'
      }
    };

    const viteConfig = framework === 'react' ? `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
` : framework === 'vue' ? `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
` : undefined;

    return {
      packageJson,
      viteConfig
    };
  }

  /**
   * Generate preview
   */
  private async generatePreview(pages: any[], styles: any, config: GenerationConfig): Promise<any> {
    const firstPage = pages[0];
    
    return {
      html: firstPage?.code || '<div>No content generated</div>',
      css: styles.global,
      js: config.framework === 'react' || config.framework === 'vue' 
        ? '// JavaScript bundle will be generated by build tool'
        : ''
    };
  }

  /**
   * Estimate complexity
   */
  private estimateComplexity(componentCount: number, pageCount: number): 'simple' | 'moderate' | 'complex' {
    const total = componentCount + pageCount;
    
    if (total < 5) return 'simple';
    if (total < 15) return 'moderate';
    return 'complex';
  }

  /**
   * Get ARIA role
   */
  private getAriaRole(type: string): string {
    const roles: Record<string, string> = {
      navigation: 'navigation',
      button: 'button',
      form: 'form',
      hero: 'banner',
      footer: 'contentinfo',
      header: 'banner'
    };

    return roles[type] || 'region';
  }

  /**
   * Save generated website
   */
  private async saveGeneratedWebsite(website: GeneratedWebsite): Promise<void> {
    await this.db.query(`
      INSERT INTO generated_websites (
        id, config, components, pages, styles, build_config, preview, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      website.id,
      JSON.stringify(website.config),
      JSON.stringify(website.components),
      JSON.stringify(website.pages),
      JSON.stringify(website.styles),
      JSON.stringify(website.buildConfig),
      JSON.stringify(website.preview),
      JSON.stringify(website.metadata)
    ]);
  }

  /**
   * Get Material Design schema
   */
  private async getMaterialDesignSchema(): Promise<any> {
    const result = await this.db.query(`
      SELECT schema FROM material_design_schema LIMIT 1
    `);
    
    return result.rows[0]?.schema || null;
  }

  /**
   * Get usage patterns
   */
  private async getUsagePatterns(): Promise<any[]> {
    const result = await this.db.query(`
      SELECT * FROM component_usage_patterns
      ORDER BY frequency DESC
    `);
    
    return result.rows;
  }

  /**
   * Get generated website by ID
   */
  async getGeneratedWebsite(id: string): Promise<GeneratedWebsite | null> {
    const result = await this.db.query(`
      SELECT * FROM generated_websites WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      config: row.config,
      components: row.components,
      pages: row.pages,
      styles: row.styles,
      buildConfig: row.build_config,
      preview: row.preview,
      metadata: row.metadata
    };
  }
}

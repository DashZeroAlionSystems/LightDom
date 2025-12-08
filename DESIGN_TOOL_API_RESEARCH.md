# Design Tool API Integration Research

## Overview

This document provides comprehensive research on design tool APIs and services that can be integrated with our style guide and component generation system.

## 🎨 Figma API

### Official Figma REST API

**Documentation**: https://www.figma.com/developers/api

#### Capabilities
- **File Access**: Read Figma design files
- **Node Inspection**: Get detailed information about any design node
- **Styles & Components**: Extract design tokens and component libraries
- **Export**: Export nodes as PNG, SVG, JPG, or PDF
- **Comments**: Read and create comments
- **Version History**: Access file versions

#### Authentication
```javascript
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

const headers = {
  'X-Figma-Token': FIGMA_ACCESS_TOKEN
};
```

#### Key Endpoints

1. **Get File**
```
GET https://api.figma.com/v1/files/:file_key
```
Returns complete file structure with all nodes, styles, and components.

2. **Get File Nodes**
```
GET https://api.figma.com/v1/files/:file_key/nodes?ids=:node_ids
```
Get specific nodes from a file.

3. **Get Image**
```
GET https://api.figma.com/v1/images/:file_key
```
Export nodes as images.

4. **Get File Styles**
```
GET https://api.figma.com/v1/files/:file_key/styles
```
Get all styles (colors, text, effects, grids) from a file.

5. **Get File Components**
```
GET https://api.figma.com/v1/files/:file_key/components
```
Get all components from a file.

6. **Get Team Components**
```
GET https://api.figma.com/v1/teams/:team_id/components
```
Get components published from a team.

#### Example: Extract Design Tokens

```javascript
async function extractFigmaDesignTokens(fileKey) {
  const response = await fetch(
    `https://api.figma.com/v1/files/${fileKey}`,
    {
      headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN }
    }
  );
  
  const data = await response.json();
  
  // Extract colors
  const colors = {};
  if (data.styles) {
    Object.values(data.styles).forEach(style => {
      if (style.styleType === 'FILL') {
        colors[style.name] = extractFillColor(style);
      }
    });
  }
  
  // Extract typography
  const typography = {};
  if (data.styles) {
    Object.values(data.styles).forEach(style => {
      if (style.styleType === 'TEXT') {
        typography[style.name] = extractTextStyle(style);
      }
    });
  }
  
  return { colors, typography };
}
```

### Figma Plugins API

**Documentation**: https://www.figma.com/plugin-docs/

Figma plugins can:
- Read and modify design files
- Generate code from designs
- Export design tokens
- Integrate with external services

Popular plugins for our use case:
- **Design Tokens** - Export design tokens as JSON
- **html.to.design** - Convert HTML to Figma designs
- **Anima** - Export designs as React/Vue/HTML
- **Figma to Code** - Generate React/Vue/HTML code

### Figma MCP Server

**Status**: Community-driven MCP servers exist

Example implementation:
```javascript
// Figma MCP Server
import { MCPServer } from '@modelcontextprotocol/sdk';

const figmaMCP = new MCPServer({
  name: 'figma-mcp',
  version: '1.0.0',
  
  tools: [
    {
      name: 'get_figma_file',
      description: 'Get Figma file structure and design tokens',
      inputSchema: {
        type: 'object',
        properties: {
          fileKey: { type: 'string' },
          includeTokens: { type: 'boolean' }
        }
      }
    },
    {
      name: 'export_components',
      description: 'Export Figma components as code',
      inputSchema: {
        type: 'object',
        properties: {
          fileKey: { type: 'string' },
          nodeIds: { type: 'array', items: { type: 'string' } },
          format: { type: 'string', enum: ['react', 'vue', 'angular'] }
        }
      }
    }
  ]
});
```

## 🎯 Sketch API

### Sketch JavaScript API

**Documentation**: https://developer.sketch.com/reference/api/

#### Capabilities
- Access document structure
- Read/write layers and artboards
- Export assets
- Access symbols and styles

#### Cloud API
```
GET https://api.sketch.com/v2/files/:file_id
```

## 🎨 Adobe XD API

### Adobe XD Plugin API

**Documentation**: https://adobexdplatform.com/plugin-docs/

#### Capabilities
- Read design elements
- Export specifications
- Generate code
- Access design tokens

### Adobe Creative Cloud Libraries API

```
GET https://cc-libraries.adobe.io/api/v1/libraries
```

Access shared design assets, colors, and components.

## 🎭 Zeplin API

**Documentation**: https://docs.zeplin.dev/reference

#### Capabilities
- Access design screens
- Get style guides
- Export assets
- Read design specifications

#### Example Endpoints

```javascript
// Get project styleguide
GET https://api.zeplin.dev/v1/projects/:project_id/styleguide

// Get screen details
GET https://api.zeplin.dev/v1/projects/:project_id/screens/:screen_id

// Get colors
GET https://api.zeplin.dev/v1/projects/:project_id/colors

// Get text styles
GET https://api.zeplin.dev/v1/projects/:project_id/text_styles
```

## 🎨 InVision API

**Documentation**: https://support.invisionapp.com/hc/en-us/articles/360028510491

#### Capabilities
- Access prototypes
- Read design specs (InVision Inspect)
- Export assets
- Get design comments

## 🎯 Design Systems Tools

### Storybook Design Addon

Integrate design files directly into Storybook:

```javascript
// .storybook/main.js
module.exports = {
  addons: [
    '@storybook/addon-designs'
  ]
};

// Component.stories.js
export const Primary = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/...'
    }
  }
};
```

### Zeroheight

**API**: Limited public API
**Integration**: Via webhooks and embeds

### Frontify

**API**: https://developer.frontify.com/
- Access brand assets
- Get style guides
- Manage design tokens

## 🔧 Design Token Tools

### Style Dictionary (Amazon)

**GitHub**: https://github.com/amzn/style-dictionary

Transform design tokens to any platform:

```javascript
const StyleDictionary = require('style-dictionary');

const sd = StyleDictionary.extend({
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  }
});

sd.buildAllPlatforms();
```

### Theo (Salesforce)

**GitHub**: https://github.com/salesforce-ux/theo

Design token transformer from Salesforce.

```javascript
const theo = require('theo');

theo
  .convert({
    transform: {
      type: 'web',
      file: 'design-tokens.yml'
    },
    format: {
      type: 'scss'
    }
  })
  .then(scss => {
    // Use generated SCSS
  });
```

### Tokens Studio (Figma Plugin)

Export design tokens from Figma in standard format:
- W3C Design Tokens format
- JSON
- CSS/SCSS variables
- Tailwind config

## 🌐 Chrome DevTools Protocol (CDP)

### Layers Panel API

**Documentation**: https://chromedevtools.github.io/devtools-protocol/

#### Key Domains for Design Extraction

1. **LayerTree Domain**
```javascript
// Enable layer tree
await client.send('LayerTree.enable');

// Get layer tree
const { layers } = await client.send('LayerTree.layerTree');

// Get layer snapshot
const { snapshotId } = await client.send('LayerTree.makeSnapshot', {
  layerId: 'layer_id'
});
```

2. **CSS Domain**
```javascript
// Get computed styles
const { computedStyle } = await client.send('CSS.getComputedStyleForNode', {
  nodeId
});

// Get matched styles
const { matchedCSSRules } = await client.send('CSS.getMatchedStylesForNode', {
  nodeId
});
```

3. **DOM Domain**
```javascript
// Get document
const { root } = await client.send('DOM.getDocument');

// Query selector
const { nodeId } = await client.send('DOM.querySelector', {
  nodeId: root.nodeId,
  selector: 'button'
});

// Get box model
const { model } = await client.send('DOM.getBoxModel', {
  nodeId
});
```

4. **Animation Domain**
```javascript
// Get animations
await client.send('Animation.enable');
const { animations } = await client.send('Animation.getPlaybackRate');
```

### Implementation Example

```javascript
import puppeteer from 'puppeteer';

async function extractDesignFromPage(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Enable CDP domains
  const client = await page.target().createCDPSession();
  await client.send('LayerTree.enable');
  await client.send('CSS.enable');
  await client.send('DOM.enable');
  
  await page.goto(url);
  
  // Get layer tree
  const { layers } = await client.send('LayerTree.layerTree');
  
  // Get all computed styles
  const { root } = await client.send('DOM.getDocument');
  const styles = await client.send('CSS.getComputedStyleForNode', {
    nodeId: root.nodeId
  });
  
  // Extract colors, fonts, etc.
  const designTokens = extractTokensFromLayers(layers, styles);
  
  await browser.close();
  return designTokens;
}
```

## 🎨 Web Design Pattern Libraries

### Material Design

**Components**: https://material.io/components
**Icons**: https://fonts.google.com/icons
**API**: Via Google Fonts API for icons

```javascript
// Get Material icons list
fetch('https://fonts.google.com/metadata/icons')
  .then(res => res.json())
  .then(icons => {
    // Process Material icons
  });
```

### Ant Design

**Components**: https://ant.design/components/overview/
**GitHub API**: Use GitHub API to access component source

```javascript
// Get Ant Design component
fetch('https://raw.githubusercontent.com/ant-design/ant-design/master/components/button/index.tsx')
  .then(res => res.text())
  .then(component => {
    // Parse component
  });
```

### Chakra UI

**GitHub**: https://github.com/chakra-ui/chakra-ui
**Theme API**: Access via npm package

```javascript
import { theme } from '@chakra-ui/react';

// Extract tokens
const colors = theme.colors;
const spacing = theme.space;
const typography = theme.fonts;
```

## 🔗 Integration Strategy

### Recommended Approach

1. **Primary**: Figma API + MCP Server
   - Most comprehensive design file access
   - Rich component and style information
   - Wide industry adoption

2. **Secondary**: Chrome DevTools Protocol
   - Extract from live websites
   - Real computed styles
   - Actual render information

3. **Tertiary**: Design System APIs
   - Material Design, Ant Design, etc.
   - Pre-built component libraries
   - Reference implementations

### Implementation Priority

1. ✅ **Chrome DevTools Protocol** (Already integrated)
2. 🔄 **Figma API Integration** (Next priority)
3. 📝 **Storybook Design Addon** (For linking)
4. 📝 **Style Dictionary** (For token transformation)
5. 📝 **Design System Library APIs** (For templates)

## 📊 Comparison Matrix

| Tool | API Quality | Documentation | Cost | Best For |
|------|-------------|---------------|------|----------|
| Figma | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Free tier | Production design files |
| Sketch | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Paid | Mac-based workflows |
| Adobe XD | ⭐⭐⭐ | ⭐⭐⭐ | Free tier | Adobe ecosystem |
| Zeplin | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Paid | Design handoff |
| InVision | ⭐⭐⭐ | ⭐⭐⭐ | Free tier | Prototyping |
| CDP | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Free | Live websites |

## 🚀 Next Steps for LightDom Integration

### Phase 1: Figma Integration
1. Create Figma MCP Server
2. Implement file structure parsing
3. Extract design tokens
4. Map components to code

### Phase 2: Enhanced CDP Integration
1. Improve layer extraction
2. Add animation detection
3. Enhance graphics export
4. Better pattern recognition

### Phase 3: Design System Templates
1. Import Material Design complete spec
2. Add Ant Design templates
3. Include Chakra UI tokens
4. Support custom design systems

### Phase 4: Storybook Enhancements
1. Add Figma links to stories
2. Visual regression testing
3. Design comparison tools
4. Token documentation

## 📚 Resources

### Official Documentation
- Figma API: https://www.figma.com/developers/api
- Chrome DevTools Protocol: https://chromedevtools.github.io/devtools-protocol/
- Sketch API: https://developer.sketch.com/reference/api/
- Adobe XD: https://adobexdplatform.com/plugin-docs/
- Zeplin API: https://docs.zeplin.dev/reference

### Tools & Libraries
- Style Dictionary: https://amzn.github.io/style-dictionary/
- Tokens Studio: https://tokens.studio/
- Storybook Design Addon: https://storybook.js.org/addons/@storybook/addon-designs
- Puppeteer: https://pptr.dev/

### Community Resources
- Design Tokens Community Group: https://www.w3.org/community/design-tokens/
- Design Systems Repo: https://designsystemsrepo.com/
- Awesome Design Systems: https://github.com/alexpate/awesome-design-systems

---

**Last Updated**: 2025-11-04  
**Status**: Active Research & Development

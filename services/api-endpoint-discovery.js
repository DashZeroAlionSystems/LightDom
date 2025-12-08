/**
 * API Endpoint Discovery Service
 * 
 * Automatically discovers and catalogs API endpoints from route files.
 * Supports introspection of Express routers and generates comprehensive
 * endpoint metadata for the registry.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class APIEndpointDiscovery {
  constructor(config = {}) {
    this.config = {
      routesDirectory: config.routesDirectory || path.join(process.cwd(), 'api'),
      includePatterns: config.includePatterns || ['*routes.js', '*routes.ts'],
      excludePatterns: config.excludePatterns || ['node_modules', 'test', '__tests__'],
      ...config
    };
    
    this.discoveredEndpoints = [];
  }

  /**
   * Scan route files and discover all endpoints
   */
  async discoverEndpoints() {
    console.log('🔍 Starting API endpoint discovery...');
    
    const routeFiles = await this.findRouteFiles(this.config.routesDirectory);
    console.log(`📁 Found ${routeFiles.length} route files to analyze`);
    
    for (const filePath of routeFiles) {
      try {
        const endpoints = await this.analyzeRouteFile(filePath);
        this.discoveredEndpoints.push(...endpoints);
        console.log(`✅ Discovered ${endpoints.length} endpoints in ${path.basename(filePath)}`);
      } catch (error) {
        console.error(`❌ Error analyzing ${filePath}:`, error.message);
      }
    }
    
    console.log(`🎉 Total endpoints discovered: ${this.discoveredEndpoints.length}`);
    return this.discoveredEndpoints;
  }

  /**
   * Find all route files in directory
   */
  async findRouteFiles(directory) {
    const files = [];
    
    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip excluded patterns
        if (this.config.excludePatterns.some(pattern => fullPath.includes(pattern))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile()) {
          // Check if file matches include patterns
          if (this.config.includePatterns.some(pattern => 
            this.matchesPattern(entry.name, pattern)
          )) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDirectory(directory);
    return files;
  }

  /**
   * Match filename against pattern
   */
  matchesPattern(filename, pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(filename);
  }

  /**
   * Analyze a route file and extract endpoint information
   */
  async analyzeRouteFile(filePath) {
    const endpoints = [];
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Extract category from filename (e.g., 'workflow-routes.js' -> 'workflow')
    const category = fileName
      .replace(/[-_]routes\.(js|ts)$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    // Parse route definitions using regex patterns
    const routePatterns = [
      // router.get('/path', ...)
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // app.get('/path', ...)
      /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    ];
    
    for (const pattern of routePatterns) {
      let match;
      while ((match = pattern.exec(fileContent)) !== null) {
        const [, method, routePath] = match;
        
        // Extract surrounding context for better metadata
        const contextStart = Math.max(0, match.index - 200);
        const contextEnd = Math.min(fileContent.length, match.index + 500);
        const context = fileContent.substring(contextStart, contextEnd);
        
        const endpoint = {
          endpoint_id: this.generateEndpointId(method, routePath, fileName),
          title: this.generateTitle(routePath, method),
          path: routePath,
          method: method.toUpperCase(),
          description: this.extractDescription(context),
          category: category,
          tags: this.extractTags(routePath, context),
          route_file: relativePath,
          handler_function: this.extractHandlerName(context),
          request_schema: this.inferRequestSchema(routePath, method, context),
          response_schema: this.inferResponseSchema(context),
          query_params: this.extractQueryParams(context),
          path_params: this.extractPathParams(routePath),
          requires_auth: this.detectAuthRequirement(context),
          service_type: this.inferServiceType(category, routePath),
          version: '1.0.0',
          is_active: true,
          example_request: this.generateExampleRequest(routePath, method),
          example_response: this.generateExampleResponse(method)
        };
        
        endpoints.push(endpoint);
      }
    }
    
    return endpoints;
  }

  /**
   * Generate unique endpoint ID
   */
  generateEndpointId(method, path, fileName) {
    const cleanPath = path.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const cleanFile = fileName.replace(/\.(js|ts)$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `${method.toLowerCase()}_${cleanPath}_${cleanFile}`.toLowerCase();
  }

  /**
   * Generate human-readable title
   */
  generateTitle(routePath, method) {
    // Convert path like '/workflows/:id/execute' to 'Execute Workflow'
    const pathParts = routePath
      .split('/')
      .filter(p => p && !p.startsWith(':'))
      .map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '));
    
    const action = {
      'GET': pathParts.length > 1 ? 'Get' : 'List',
      'POST': 'Create',
      'PUT': 'Update',
      'DELETE': 'Delete',
      'PATCH': 'Modify'
    }[method.toUpperCase()] || method;
    
    return pathParts.length > 0 
      ? `${action} ${pathParts.join(' ')}`
      : `${action} Resource`;
  }

  /**
   * Extract description from comments
   */
  extractDescription(context) {
    // Look for JSDoc comments or inline comments
    const commentPatterns = [
      /\/\*\*\s*\n\s*\*\s*([^\n]+)/,
      /\/\/\s*(.+)$/m,
      /\/\*\s*(.+?)\s*\*\//
    ];
    
    for (const pattern of commentPatterns) {
      const match = context.match(pattern);
      if (match) {
        return match[1].trim().replace(/\*\s*/g, '');
      }
    }
    
    return null;
  }

  /**
   * Extract tags from route path and context
   */
  extractTags(routePath, context) {
    const tags = new Set();
    
    // Extract from path segments
    routePath.split('/').forEach(segment => {
      if (segment && !segment.startsWith(':')) {
        tags.add(segment.toLowerCase());
      }
    });
    
    // Look for common keywords in context
    const keywords = ['async', 'await', 'database', 'auth', 'cache', 'real-time'];
    keywords.forEach(keyword => {
      if (context.toLowerCase().includes(keyword)) {
        tags.add(keyword);
      }
    });
    
    return Array.from(tags);
  }

  /**
   * Extract handler function name
   */
  extractHandlerName(context) {
    // Look for async function name or arrow function
    const patterns = [
      /async\s+function\s+(\w+)/,
      /const\s+(\w+)\s*=\s*async/,
      /function\s+(\w+)/
    ];
    
    for (const pattern of patterns) {
      const match = context.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Infer request schema from context
   */
  inferRequestSchema(routePath, method, context) {
    const schema = {
      type: 'object',
      properties: {}
    };
    
    // Extract req.body properties
    const bodyMatches = context.matchAll(/req\.body\.(\w+)/g);
    for (const match of bodyMatches) {
      schema.properties[match[1]] = { type: 'string' };
    }
    
    // Extract req.params properties
    const paramMatches = routePath.matchAll(/:(\w+)/g);
    for (const match of paramMatches) {
      if (!schema.properties.params) {
        schema.properties.params = { type: 'object', properties: {} };
      }
      schema.properties.params.properties[match[1]] = { type: 'string' };
    }
    
    return Object.keys(schema.properties).length > 0 ? schema : null;
  }

  /**
   * Infer response schema from context
   */
  inferResponseSchema(context) {
    // Check if res.json is called with an object
    const jsonMatch = context.match(/res\.json\s*\(\s*\{([^}]+)\}/);
    if (jsonMatch) {
      return {
        type: 'object',
        properties: {
          // Basic inference - would need more sophisticated parsing
          success: { type: 'boolean' },
          data: { type: 'object' }
        }
      };
    }
    
    return null;
  }

  /**
   * Extract query parameters from context
   */
  extractQueryParams(context) {
    const params = [];
    const queryMatches = context.matchAll(/req\.query\.(\w+)/g);
    
    for (const match of queryMatches) {
      params.push({
        name: match[1],
        type: 'string',
        required: false
      });
    }
    
    return params;
  }

  /**
   * Extract path parameters from route
   */
  extractPathParams(routePath) {
    const params = [];
    const paramMatches = routePath.matchAll(/:(\w+)/g);
    
    for (const match of paramMatches) {
      params.push({
        name: match[1],
        type: 'string',
        required: true
      });
    }
    
    return params;
  }

  /**
   * Detect if route requires authentication
   */
  detectAuthRequirement(context) {
    const authIndicators = [
      'requireAuth',
      'authenticate',
      'verifyToken',
      'checkAuth',
      'isAuthenticated',
      'req.user',
      'req.userId'
    ];
    
    return authIndicators.some(indicator => 
      context.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Infer service type from category and path
   */
  inferServiceType(category, routePath) {
    const typeMap = {
      'workflow': 'workflow-engine',
      'data-mining': 'data-processor',
      'deepseek': 'ai-engine',
      'ai': 'ai-engine',
      'neural': 'ai-engine',
      'blockchain': 'blockchain',
      'campaign': 'orchestrator',
      'database': 'database',
      'auth': 'authentication'
    };
    
    const categoryLower = category.toLowerCase();
    for (const [key, value] of Object.entries(typeMap)) {
      if (categoryLower.includes(key) || routePath.toLowerCase().includes(key)) {
        return value;
      }
    }
    
    return 'api';
  }

  /**
   * Generate example request
   */
  generateExampleRequest(routePath, method) {
    const example = {
      method: method.toUpperCase(),
      path: routePath.replace(/:(\w+)/g, '{$1}')
    };
    
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      example.body = {
        // Basic example structure
      };
    }
    
    return example;
  }

  /**
   * Generate example response
   */
  generateExampleResponse(method) {
    return {
      success: true,
      data: {},
      message: `${method} operation completed successfully`
    };
  }

  /**
   * Export discovered endpoints to JSON
   */
  exportToJSON(outputPath) {
    const output = {
      discovered_at: new Date().toISOString(),
      total_endpoints: this.discoveredEndpoints.length,
      endpoints: this.discoveredEndpoints
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`📄 Exported endpoints to ${outputPath}`);
  }

  /**
   * Get statistics about discovered endpoints
   */
  getStatistics() {
    const stats = {
      total: this.discoveredEndpoints.length,
      by_method: {},
      by_category: {},
      by_service_type: {},
      requires_auth: 0
    };
    
    this.discoveredEndpoints.forEach(endpoint => {
      // Count by method
      stats.by_method[endpoint.method] = (stats.by_method[endpoint.method] || 0) + 1;
      
      // Count by category
      stats.by_category[endpoint.category] = (stats.by_category[endpoint.category] || 0) + 1;
      
      // Count by service type
      stats.by_service_type[endpoint.service_type] = 
        (stats.by_service_type[endpoint.service_type] || 0) + 1;
      
      // Count auth requirements
      if (endpoint.requires_auth) {
        stats.requires_auth++;
      }
    });
    
    return stats;
  }
}

export default APIEndpointDiscovery;

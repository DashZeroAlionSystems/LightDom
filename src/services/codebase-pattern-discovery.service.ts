/**
 * Codebase Pattern Discovery Service
 * Analyzes codebase to discover patterns, create schema maps, and extract rules
 */

import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

interface FileAnalysis {
  file_path: string;
  file_type: string;
  component_type?: string;
  exports: any[];
  imports: any[];
  dependencies: string[];
  functions: any[];
  classes: any[];
  interfaces: any[];
  patterns_used: any[];
}

interface PatternMatch {
  pattern_type: string;
  pattern_name: string;
  description: string;
  confidence: number;
  examples: string[];
}

export class CodebasePatternDiscoveryService {
  private db: Pool;
  private projectRoot: string;
  private excludeDirs: string[] = [
    'node_modules',
    'dist',
    'build',
    '.git',
    'coverage',
    'backup',
    'dist-electron'
  ];
  private fileExtensions: string[] = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java'];

  constructor(db: Pool, projectRoot: string) {
    this.db = db;
    this.projectRoot = projectRoot;
  }

  /**
   * Scan entire codebase and generate schema map
   */
  async scanCodebase(): Promise<{ total_files: number; total_patterns: number }> {
    console.log('Starting codebase scan...');
    const files = await this.findSourceFiles(this.projectRoot);
    console.log(`Found ${files.length} source files to analyze`);

    let analyzed = 0;
    for (const filePath of files) {
      try {
        await this.analyzeFile(filePath);
        analyzed++;
        if (analyzed % 50 === 0) {
          console.log(`Analyzed ${analyzed}/${files.length} files...`);
        }
      } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error);
      }
    }

    console.log('Building relationship map...');
    await this.buildRelationshipMap();

    console.log('Discovering patterns...');
    const patterns = await this.discoverPatterns();

    return {
      total_files: analyzed,
      total_patterns: patterns.length
    };
  }

  /**
   * Find all source files in project
   */
  private async findSourceFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.projectRoot, fullPath);

        // Skip excluded directories
        if (entry.isDirectory()) {
          if (!this.excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
            const subFiles = await this.findSourceFiles(fullPath);
            files.push(...subFiles);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.fileExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(this.projectRoot, filePath);
    const ext = path.extname(filePath);

    const analysis: FileAnalysis = {
      file_path: relativePath,
      file_type: ext.substring(1),
      exports: [],
      imports: [],
      dependencies: [],
      functions: [],
      classes: [],
      interfaces: [],
      patterns_used: []
    };

    // Analyze based on file type
    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
      this.analyzeJavaScriptTypeScript(content, analysis);
    }

    // Detect component type
    analysis.component_type = this.detectComponentType(relativePath, content);

    // Detect patterns
    analysis.patterns_used = this.detectPatterns(content, analysis.component_type);

    // Store in database
    await this.storeFileAnalysis(analysis);
  }

  /**
   * Analyze JavaScript/TypeScript file
   */
  private analyzeJavaScriptTypeScript(content: string, analysis: FileAnalysis): void {
    // Extract imports
    const importRegex = /import\s+(?:{([^}]+)}|(\w+)|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const source = match[4];
      const imports = match[1] ? match[1].split(',').map(i => i.trim()) : [match[2] || match[3]];
      
      analysis.imports.push({
        source,
        imports: imports.filter(Boolean)
      });

      if (!source.startsWith('.') && !source.startsWith('/')) {
        analysis.dependencies.push(source.split('/')[0]);
      }
    }

    // Extract exports
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      analysis.exports.push(match[1]);
    }

    // Extract functions
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g;
    while ((match = functionRegex.exec(content)) !== null) {
      analysis.functions.push({ name: match[1], type: 'function' });
    }

    // Extract arrow functions
    const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
    while ((match = arrowRegex.exec(content)) !== null) {
      analysis.functions.push({ name: match[1], type: 'arrow' });
    }

    // Extract classes
    const classRegex = /(?:export\s+)?(?:default\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    while ((match = classRegex.exec(content)) !== null) {
      analysis.classes.push({
        name: match[1],
        extends: match[2] || null
      });
    }

    // Extract interfaces (TypeScript)
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([^{]+))?/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      analysis.interfaces.push({
        name: match[1],
        extends: match[2] ? match[2].split(',').map(i => i.trim()) : []
      });
    }
  }

  /**
   * Detect component type from file path and content
   */
  private detectComponentType(filePath: string, content: string): string | undefined {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('/components/') || lowerPath.includes('/ui/')) {
      return 'component';
    }
    if (lowerPath.includes('/services/')) {
      return 'service';
    }
    if (lowerPath.includes('/api/') || lowerPath.includes('/routes/')) {
      return 'api';
    }
    if (lowerPath.includes('/utils/') || lowerPath.includes('/helpers/')) {
      return 'util';
    }
    if (lowerPath.includes('/types/') || lowerPath.includes('.types.')) {
      return 'types';
    }
    if (lowerPath.includes('/hooks/')) {
      return 'hook';
    }
    if (lowerPath.includes('/contexts/')) {
      return 'context';
    }
    if (content.includes('React.FC') || content.includes('useState') || content.includes('useEffect')) {
      return 'component';
    }

    return undefined;
  }

  /**
   * Detect common patterns in code
   */
  private detectPatterns(content: string, componentType?: string): any[] {
    const patterns: any[] = [];

    // React patterns
    if (content.includes('useState') || content.includes('useEffect')) {
      patterns.push({ type: 'react-hooks', name: 'React Hooks Pattern' });
    }
    if (content.includes('React.FC<') || content.includes('FC<')) {
      patterns.push({ type: 'react-fc', name: 'Functional Component Pattern' });
    }

    // API patterns
    if (content.includes('express.Router()') || content.includes('Router()')) {
      patterns.push({ type: 'express-router', name: 'Express Router Pattern' });
    }
    if (content.includes('async (req') && content.includes('res')) {
      patterns.push({ type: 'async-route-handler', name: 'Async Route Handler Pattern' });
    }

    // Database patterns
    if (content.includes('await this.db.query') || content.includes('await db.query')) {
      patterns.push({ type: 'database-query', name: 'Database Query Pattern' });
    }
    if (content.includes('BEGIN') && content.includes('COMMIT')) {
      patterns.push({ type: 'database-transaction', name: 'Database Transaction Pattern' });
    }

    // Service patterns
    if (content.includes('constructor') && content.includes('private')) {
      patterns.push({ type: 'dependency-injection', name: 'Dependency Injection Pattern' });
    }

    // Error handling
    if (content.includes('try {') && content.includes('catch')) {
      patterns.push({ type: 'error-handling', name: 'Try-Catch Error Handling' });
    }

    // Async/await
    if (content.includes('async ') && content.includes('await ')) {
      patterns.push({ type: 'async-await', name: 'Async/Await Pattern' });
    }

    return patterns;
  }

  /**
   * Store file analysis in database
   */
  private async storeFileAnalysis(analysis: FileAnalysis): Promise<void> {
    const query = `
      INSERT INTO codebase_schema_map (
        file_path, file_type, component_type, exports, imports, dependencies,
        functions, classes, interfaces, patterns_used
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (file_path) DO UPDATE SET
        file_type = EXCLUDED.file_type,
        component_type = EXCLUDED.component_type,
        exports = EXCLUDED.exports,
        imports = EXCLUDED.imports,
        dependencies = EXCLUDED.dependencies,
        functions = EXCLUDED.functions,
        classes = EXCLUDED.classes,
        interfaces = EXCLUDED.interfaces,
        patterns_used = EXCLUDED.patterns_used,
        last_analyzed = CURRENT_TIMESTAMP
    `;

    await this.db.query(query, [
      analysis.file_path,
      analysis.file_type,
      analysis.component_type,
      JSON.stringify(analysis.exports),
      JSON.stringify(analysis.imports),
      JSON.stringify(analysis.dependencies),
      JSON.stringify(analysis.functions),
      JSON.stringify(analysis.classes),
      JSON.stringify(analysis.interfaces),
      JSON.stringify(analysis.patterns_used)
    ]);
  }

  /**
   * Build relationship map between files
   */
  private async buildRelationshipMap(): Promise<void> {
    // Get all files
    const filesQuery = 'SELECT schema_id, file_path, imports FROM codebase_schema_map';
    const filesResult = await this.db.query(filesQuery);

    // Clear existing relationships
    await this.db.query('DELETE FROM codebase_relationships');

    // Build path to schema_id map
    const pathToSchemaId = new Map<string, string>();
    for (const file of filesResult.rows) {
      pathToSchemaId.set(file.file_path, file.schema_id);
    }

    // Create relationships
    for (const file of filesResult.rows) {
      const imports = JSON.parse(file.imports || '[]');
      
      for (const imp of imports) {
        if (imp.source.startsWith('.') || imp.source.startsWith('/')) {
          // Resolve relative path
          const sourceDir = path.dirname(file.file_path);
          let targetPath = path.normalize(path.join(sourceDir, imp.source));
          
          // Try with extensions
          for (const ext of ['.ts', '.tsx', '.js', '.jsx', '']) {
            const fullPath = targetPath + ext;
            if (pathToSchemaId.has(fullPath)) {
              await this.createRelationship(
                file.schema_id,
                pathToSchemaId.get(fullPath)!,
                'imports',
                { imports: imp.imports }
              );
              break;
            }
          }
        }
      }
    }
  }

  /**
   * Create a relationship between two files
   */
  private async createRelationship(
    from_schema_id: string,
    to_schema_id: string,
    type: string,
    data: any
  ): Promise<void> {
    const query = `
      INSERT INTO codebase_relationships (from_schema_id, to_schema_id, relationship_type, relationship_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `;
    await this.db.query(query, [from_schema_id, to_schema_id, type, JSON.stringify(data)]);
  }

  /**
   * Discover common patterns in codebase
   */
  private async discoverPatterns(): Promise<PatternMatch[]> {
    const patterns: PatternMatch[] = [];

    // Get all files with their patterns
    const query = 'SELECT file_path, component_type, patterns_used FROM codebase_schema_map';
    const result = await this.db.query(query);

    // Count pattern occurrences
    const patternCounts = new Map<string, { count: number; examples: string[] }>();

    for (const file of result.rows) {
      const filePatterns = JSON.parse(file.patterns_used || '[]');
      for (const pattern of filePatterns) {
        const key = `${pattern.type}:${pattern.name}`;
        if (!patternCounts.has(key)) {
          patternCounts.set(key, { count: 0, examples: [] });
        }
        const data = patternCounts.get(key)!;
        data.count++;
        if (data.examples.length < 5) {
          data.examples.push(file.file_path);
        }
      }
    }

    // Store discovered patterns
    for (const [key, data] of patternCounts.entries()) {
      const [type, name] = key.split(':');
      
      if (data.count >= 3) { // Pattern must appear at least 3 times
        const pattern: PatternMatch = {
          pattern_type: type,
          pattern_name: name,
          description: `${name} appears ${data.count} times in the codebase`,
          confidence: Math.min(data.count / result.rows.length, 0.95),
          examples: data.examples
        };
        patterns.push(pattern);

        await this.storePattern(pattern);
      }
    }

    return patterns;
  }

  /**
   * Store discovered pattern as a rule
   */
  private async storePattern(pattern: PatternMatch): Promise<void> {
    const query = `
      INSERT INTO pattern_rules (
        name, description, pattern_type, rule_definition, examples, confidence_score
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        rule_definition = EXCLUDED.rule_definition,
        examples = EXCLUDED.examples,
        confidence_score = EXCLUDED.confidence_score,
        last_validated = CURRENT_TIMESTAMP
    `;

    await this.db.query(query, [
      pattern.pattern_name,
      pattern.description,
      pattern.pattern_type,
      JSON.stringify({ type: pattern.pattern_type }),
      JSON.stringify(pattern.examples),
      pattern.confidence
    ]);
  }

  /**
   * Get schema map for agent context
   */
  async getSchemaMap(): Promise<any> {
    const filesQuery = `
      SELECT schema_id, file_path, file_type, component_type, exports, imports
      FROM codebase_schema_map
      ORDER BY file_path
    `;
    const filesResult = await this.db.query(filesQuery);

    const relationshipsQuery = `
      SELECT from_schema_id, to_schema_id, relationship_type
      FROM codebase_relationships
    `;
    const relationshipsResult = await this.db.query(relationshipsQuery);

    return {
      nodes: filesResult.rows.map(file => ({
        id: file.schema_id,
        file_path: file.file_path,
        type: file.component_type || file.file_type,
        exports: JSON.parse(file.exports || '[]'),
        imports: JSON.parse(file.imports || '[]')
      })),
      edges: relationshipsResult.rows.map(rel => ({
        source: rel.from_schema_id,
        target: rel.to_schema_id,
        type: rel.relationship_type
      })),
      metadata: {
        total_files: filesResult.rows.length,
        total_relationships: relationshipsResult.rows.length,
        analyzed_at: new Date()
      }
    };
  }

  /**
   * Get pattern rules for agent
   */
  async getPatternRules(): Promise<any[]> {
    const query = `
      SELECT rule_id, name, description, pattern_type, rule_definition, examples, confidence_score
      FROM pattern_rules
      WHERE is_active = true
      ORDER BY confidence_score DESC
    `;
    const result = await this.db.query(query);
    return result.rows.map(rule => ({
      ...rule,
      rule_definition: JSON.parse(rule.rule_definition),
      examples: JSON.parse(rule.examples)
    }));
  }
}

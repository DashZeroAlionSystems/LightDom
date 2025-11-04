/**
 * GitHub Pattern Mining Service
 * Mines folder structures, coding patterns, and project organization from GitHub repositories
 * Generates project templates and teaches DeepSeek how to manage them
 */

import axios from 'axios';
import { DeepSeekPromptEngine } from './deepseek-prompt-engine.js';
import { SchemaGeneratorService } from './schema-generator.js';

export interface GitHubRepository {
  owner: string;
  repo: string;
  branch?: string;
}

export interface FolderStructure {
  path: string;
  type: 'file' | 'dir';
  size?: number;
  children?: FolderStructure[];
}

export interface CodingPattern {
  id: string;
  name: string;
  description: string;
  category: 'architecture' | 'design-pattern' | 'naming' | 'structure' | 'workflow';
  pattern: Record<string, any>;
  examples: string[];
  frequency: number;
  confidence: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  folderStructure: FolderStructure;
  patterns: CodingPattern[];
  guidelines: string[];
  services: ServiceConfig[];
  metadata: {
    sourceRepos: string[];
    createdAt: Date;
    patternCount: number;
    confidence: number;
  };
}

export interface ServiceConfig {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  dependencies: string[];
  dataStreams: DataStreamConfig[];
}

export interface DataStreamConfig {
  id: string;
  name: string;
  source: string;
  destination: string;
  format: 'json' | 'xml' | 'csv' | 'binary';
  transformation?: string;
  enrichment?: EnrichmentConfig[];
}

export interface EnrichmentConfig {
  attribute: string;
  source: 'api' | 'database' | 'service' | 'computation';
  config: Record<string, any>;
}

/**
 * GitHub Pattern Mining Service
 */
export class GitHubPatternMiningService {
  private githubToken?: string;
  private promptEngine: DeepSeekPromptEngine;
  private schemaGenerator: SchemaGeneratorService;
  private minedPatterns: Map<string, CodingPattern[]> = new Map();
  private projectTemplates: Map<string, ProjectTemplate> = new Map();

  constructor(config: { githubToken?: string; deepseekConfig?: any }) {
    this.githubToken = config.githubToken || process.env.GITHUB_TOKEN;
    this.promptEngine = new DeepSeekPromptEngine(config.deepseekConfig);
    this.schemaGenerator = new SchemaGeneratorService();
  }

  /**
   * Mine patterns from a GitHub repository
   */
  async mineRepository(repo: GitHubRepository): Promise<{
    structure: FolderStructure;
    patterns: CodingPattern[];
  }> {
    console.log(`🔍 Mining repository: ${repo.owner}/${repo.repo}`);

    // Get repository tree
    const structure = await this.getRepositoryStructure(repo);

    // Analyze structure to identify patterns
    const patterns = await this.identifyPatterns(structure, repo);

    // Store patterns
    const repoKey = `${repo.owner}/${repo.repo}`;
    this.minedPatterns.set(repoKey, patterns);

    return { structure, patterns };
  }

  /**
   * Get repository folder structure from GitHub API
   */
  private async getRepositoryStructure(repo: GitHubRepository): Promise<FolderStructure> {
    const branch = repo.branch || 'main';
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/git/trees/${branch}?recursive=1`;

    try {
      const response = await axios.get(url, {
        headers: this.githubToken
          ? { Authorization: `token ${this.githubToken}` }
          : {},
      });

      const tree = response.data.tree;
      return this.buildFolderStructure(tree);
    } catch (error) {
      console.error('Failed to fetch repository structure:', error);
      throw new Error(`Failed to fetch repository: ${repo.owner}/${repo.repo}`);
    }
  }

  /**
   * Build hierarchical folder structure from GitHub tree
   */
  private buildFolderStructure(tree: any[]): FolderStructure {
    const root: FolderStructure = { path: '/', type: 'dir', children: [] };
    const pathMap = new Map<string, FolderStructure>();
    pathMap.set('/', root);

    // Sort by path depth
    tree.sort((a, b) => a.path.split('/').length - b.path.split('/').length);

    for (const item of tree) {
      const node: FolderStructure = {
        path: item.path,
        type: item.type === 'tree' ? 'dir' : 'file',
        size: item.size,
        children: item.type === 'tree' ? [] : undefined,
      };

      pathMap.set(item.path, node);

      // Find parent
      const pathParts = item.path.split('/');
      const parentPath = pathParts.slice(0, -1).join('/') || '/';
      const parent = pathMap.get(parentPath);

      if (parent && parent.children) {
        parent.children.push(node);
      }
    }

    return root;
  }

  /**
   * Identify coding patterns from repository structure
   */
  private async identifyPatterns(
    structure: FolderStructure,
    repo: GitHubRepository
  ): Promise<CodingPattern[]> {
    const patterns: CodingPattern[] = [];

    // Architecture patterns
    patterns.push(...this.identifyArchitecturePatterns(structure));

    // Naming conventions
    patterns.push(...this.identifyNamingPatterns(structure));

    // Project structure patterns
    patterns.push(...this.identifyStructurePatterns(structure));

    // Calculate confidence scores
    patterns.forEach((p) => {
      p.confidence = this.calculatePatternConfidence(p, structure);
    });

    return patterns;
  }

  /**
   * Identify architecture patterns (MVC, microservices, monorepo, etc.)
   */
  private identifyArchitecturePatterns(structure: FolderStructure): CodingPattern[] {
    const patterns: CodingPattern[] = [];

    // Check for MVC pattern
    if (this.hasDirectories(structure, ['models', 'views', 'controllers'])) {
      patterns.push({
        id: 'mvc-architecture',
        name: 'MVC Architecture',
        description: 'Model-View-Controller architectural pattern',
        category: 'architecture',
        pattern: {
          type: 'mvc',
          directories: ['models', 'views', 'controllers'],
        },
        examples: ['models/', 'views/', 'controllers/'],
        frequency: 1,
        confidence: 0.9,
      });
    }

    // Check for microservices
    if (this.hasDirectories(structure, ['services']) && this.countSubdirectories(structure, 'services') > 2) {
      patterns.push({
        id: 'microservices-architecture',
        name: 'Microservices Architecture',
        description: 'Microservices-based architecture',
        category: 'architecture',
        pattern: {
          type: 'microservices',
          serviceDirectory: 'services',
        },
        examples: ['services/auth/', 'services/api/', 'services/worker/'],
        frequency: 1,
        confidence: 0.85,
      });
    }

    // Check for monorepo
    if (this.hasDirectories(structure, ['packages']) || this.hasDirectories(structure, ['apps'])) {
      patterns.push({
        id: 'monorepo-structure',
        name: 'Monorepo Structure',
        description: 'Monorepo with multiple packages/apps',
        category: 'structure',
        pattern: {
          type: 'monorepo',
          workspaces: true,
        },
        examples: ['packages/', 'apps/'],
        frequency: 1,
        confidence: 0.8,
      });
    }

    return patterns;
  }

  /**
   * Identify naming convention patterns
   */
  private identifyNamingPatterns(structure: FolderStructure): CodingPattern[] {
    const patterns: CodingPattern[] = [];
    const files = this.getAllFiles(structure);

    // Check for kebab-case
    const kebabCaseCount = files.filter((f) => /^[a-z0-9-]+\.(ts|js|tsx|jsx)$/.test(f)).length;
    if (kebabCaseCount > files.length * 0.6) {
      patterns.push({
        id: 'kebab-case-naming',
        name: 'Kebab Case Naming',
        description: 'Files use kebab-case naming convention',
        category: 'naming',
        pattern: { style: 'kebab-case' },
        examples: ['user-service.ts', 'data-processor.js'],
        frequency: kebabCaseCount,
        confidence: kebabCaseCount / files.length,
      });
    }

    // Check for PascalCase
    const pascalCaseCount = files.filter((f) => /^[A-Z][a-zA-Z0-9]*\.(ts|js|tsx|jsx)$/.test(f)).length;
    if (pascalCaseCount > files.length * 0.6) {
      patterns.push({
        id: 'pascal-case-naming',
        name: 'Pascal Case Naming',
        description: 'Files use PascalCase naming convention',
        category: 'naming',
        pattern: { style: 'PascalCase' },
        examples: ['UserService.ts', 'DataProcessor.js'],
        frequency: pascalCaseCount,
        confidence: pascalCaseCount / files.length,
      });
    }

    return patterns;
  }

  /**
   * Identify project structure patterns
   */
  private identifyStructurePatterns(structure: FolderStructure): CodingPattern[] {
    const patterns: CodingPattern[] = [];

    // Common directories indicate patterns
    const commonDirs = ['src', 'test', 'docs', 'scripts', 'config'];
    const presentDirs = commonDirs.filter((dir) => this.hasDirectory(structure, dir));

    if (presentDirs.length >= 3) {
      patterns.push({
        id: 'standard-project-structure',
        name: 'Standard Project Structure',
        description: 'Standard project organization with src, test, docs',
        category: 'structure',
        pattern: {
          directories: presentDirs,
        },
        examples: presentDirs.map((d) => `${d}/`),
        frequency: presentDirs.length,
        confidence: presentDirs.length / commonDirs.length,
      });
    }

    return patterns;
  }

  /**
   * Generate project template from mined patterns
   */
  async generateProjectTemplate(
    name: string,
    sourceRepos: GitHubRepository[],
    options?: {
      includeServices?: boolean;
      includeDataStreams?: boolean;
    }
  ): Promise<ProjectTemplate> {
    console.log(`🏗️ Generating project template: ${name}`);

    // Mine all source repositories
    const allPatterns: CodingPattern[] = [];
    let combinedStructure: FolderStructure | null = null;

    for (const repo of sourceRepos) {
      const { structure, patterns } = await this.mineRepository(repo);
      allPatterns.push(...patterns);
      if (!combinedStructure) {
        combinedStructure = structure;
      }
    }

    // Deduplicate and rank patterns
    const uniquePatterns = this.deduplicatePatterns(allPatterns);
    const topPatterns = uniquePatterns.sort((a, b) => b.confidence - a.confidence);

    // Generate guidelines from patterns
    const guidelines = this.generateGuidelines(topPatterns);

    // Generate service configs if requested
    const services = options?.includeServices
      ? await this.generateServiceConfigs(topPatterns)
      : [];

    const template: ProjectTemplate = {
      id: `template-${Date.now()}`,
      name,
      description: `Project template generated from ${sourceRepos.length} repositories`,
      folderStructure: combinedStructure!,
      patterns: topPatterns,
      guidelines,
      services,
      metadata: {
        sourceRepos: sourceRepos.map((r) => `${r.owner}/${r.repo}`),
        createdAt: new Date(),
        patternCount: topPatterns.length,
        confidence: this.calculateOverallConfidence(topPatterns),
      },
    };

    this.projectTemplates.set(template.id, template);
    return template;
  }

  /**
   * Generate service configurations from patterns
   */
  private async generateServiceConfigs(patterns: CodingPattern[]): Promise<ServiceConfig[]> {
    const services: ServiceConfig[] = [];

    // Find service-related patterns
    const servicePatterns = patterns.filter((p) => 
      p.category === 'architecture' && 
      (p.pattern.type === 'microservices' || p.id.includes('service'))
    );

    for (const pattern of servicePatterns) {
      // Generate service config with data streams
      const service: ServiceConfig = {
        id: `service-${Date.now()}`,
        name: pattern.name,
        type: pattern.pattern.type || 'generic',
        config: pattern.pattern,
        dependencies: [],
        dataStreams: await this.generateDataStreams(pattern),
      };

      services.push(service);
    }

    return services;
  }

  /**
   * Generate data stream configurations
   */
  private async generateDataStreams(pattern: CodingPattern): Promise<DataStreamConfig[]> {
    return [
      {
        id: `stream-${Date.now()}`,
        name: 'Service Data Stream',
        source: 'service',
        destination: 'database',
        format: 'json',
        transformation: 'normalize',
        enrichment: [
          {
            attribute: 'metadata',
            source: 'api',
            config: {
              endpoint: '/api/enrich',
              method: 'POST',
            },
          },
        ],
      },
    ];
  }

  /**
   * Generate guidelines from patterns
   */
  private generateGuidelines(patterns: CodingPattern[]): string[] {
    const guidelines: string[] = [];

    // Architecture guidelines
    const archPatterns = patterns.filter((p) => p.category === 'architecture');
    if (archPatterns.length > 0) {
      guidelines.push(`Architecture: Use ${archPatterns[0].name}`);
    }

    // Naming guidelines
    const namingPatterns = patterns.filter((p) => p.category === 'naming');
    if (namingPatterns.length > 0) {
      guidelines.push(`Naming: Use ${namingPatterns[0].pattern.style} for files`);
    }

    // Structure guidelines
    const structurePatterns = patterns.filter((p) => p.category === 'structure');
    if (structurePatterns.length > 0) {
      guidelines.push('Structure: Follow standard project organization');
      guidelines.push('Directories: ' + structurePatterns[0].pattern.directories.join(', '));
    }

    return guidelines;
  }

  /**
   * Helper methods
   */
  private hasDirectories(structure: FolderStructure, dirs: string[]): boolean {
    return dirs.every((dir) => this.hasDirectory(structure, dir));
  }

  private hasDirectory(structure: FolderStructure, name: string): boolean {
    if (!structure.children) return false;
    return structure.children.some((child) => 
      child.type === 'dir' && child.path.endsWith(name)
    );
  }

  private countSubdirectories(structure: FolderStructure, parentDir: string): number {
    const parent = this.findDirectory(structure, parentDir);
    if (!parent || !parent.children) return 0;
    return parent.children.filter((c) => c.type === 'dir').length;
  }

  private findDirectory(structure: FolderStructure, name: string): FolderStructure | null {
    if (structure.path.endsWith(name)) return structure;
    if (!structure.children) return null;

    for (const child of structure.children) {
      const found = this.findDirectory(child, name);
      if (found) return found;
    }

    return null;
  }

  private getAllFiles(structure: FolderStructure): string[] {
    const files: string[] = [];

    if (structure.type === 'file') {
      files.push(structure.path.split('/').pop() || '');
    }

    if (structure.children) {
      for (const child of structure.children) {
        files.push(...this.getAllFiles(child));
      }
    }

    return files;
  }

  private calculatePatternConfidence(pattern: CodingPattern, structure: FolderStructure): number {
    // Simple confidence calculation based on evidence
    return Math.min(0.95, pattern.frequency / 10);
  }

  private calculateOverallConfidence(patterns: CodingPattern[]): number {
    if (patterns.length === 0) return 0;
    return patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
  }

  private deduplicatePatterns(patterns: CodingPattern[]): CodingPattern[] {
    const seen = new Map<string, CodingPattern>();

    for (const pattern of patterns) {
      const existing = seen.get(pattern.id);
      if (!existing || pattern.confidence > existing.confidence) {
        seen.set(pattern.id, pattern);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Get project template by ID
   */
  getTemplate(templateId: string): ProjectTemplate | undefined {
    return this.projectTemplates.get(templateId);
  }

  /**
   * List all templates
   */
  listTemplates(): ProjectTemplate[] {
    return Array.from(this.projectTemplates.values());
  }
}

export default GitHubPatternMiningService;

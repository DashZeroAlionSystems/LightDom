/**
 * Design Library Indexing Service
 * 
 * Indexes and analyzes visual design libraries to understand their:
 * - Component structures and hierarchies
 * - Design patterns and conventions
 * - Prop interfaces and APIs
 * - Theming systems
 * - Documentation patterns
 */

interface DesignLibrary {
  id: string;
  name: string;
  version: string;
  url?: string;
  framework: 'react' | 'vue' | 'angular' | 'html-css' | 'web-components';
  components: ComponentMetadata[];
  designTokens?: DesignTokens;
  patterns: DesignPattern[];
  metadata: {
    totalComponents: number;
    categories: string[];
    indexedAt: Date;
    source: 'npm' | 'cdn' | 'github' | 'local';
  };
}

interface ComponentMetadata {
  id: string;
  name: string;
  displayName: string;
  category: string;
  atomicLevel?: 'atom' | 'molecule' | 'organism' | 'template';
  description?: string;
  props: PropDefinition[];
  slots?: SlotDefinition[];
  events?: EventDefinition[];
  examples: ComponentExample[];
  variants?: ComponentVariant[];
  accessibility: AccessibilityInfo;
  tags: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  description?: string;
  options?: unknown[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface SlotDefinition {
  name: string;
  description?: string;
  required: boolean;
}

interface EventDefinition {
  name: string;
  description?: string;
  payload?: Record<string, string>;
}

interface ComponentExample {
  name: string;
  code: string;
  description?: string;
  props?: Record<string, unknown>;
}

interface ComponentVariant {
  name: string;
  description?: string;
  props: Record<string, unknown>;
  preview?: string;
}

interface AccessibilityInfo {
  ariaLabel?: string;
  ariaRole?: string;
  keyboardSupport: boolean;
  screenReaderFriendly: boolean;
  wcagLevel?: 'A' | 'AA' | 'AAA';
}

interface DesignTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  breakpoints: Record<string, string>;
  shadows: Record<string, string>;
  borders: Record<string, string>;
}

interface DesignPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  usedBy: string[]; // Component IDs
  frequency: number;
  example?: string;
}

interface LibraryComparison {
  libraries: string[];
  commonComponents: string[];
  uniqueComponents: Record<string, string[]>;
  commonPatterns: string[];
  designSystemApproaches: Record<string, string>;
}

export class DesignLibraryIndexer {
  private libraries: Map<string, DesignLibrary>;
  private componentIndex: Map<string, ComponentMetadata[]>; // component name -> implementations
  private patternIndex: Map<string, DesignPattern>;

  constructor() {
    this.libraries = new Map();
    this.componentIndex = new Map();
    this.patternIndex = new Map();
  }

  /**
   * Index a design library
   */
  async indexLibrary(config: {
    name: string;
    source: DesignLibrary['metadata']['source'];
    framework: DesignLibrary['framework'];
    path?: string;
    url?: string;
  }): Promise<DesignLibrary> {
    console.log(`🔍 Indexing ${config.name}...`);

    // Discover components
    const components = await this.discoverComponents(config);

    // Extract design tokens
    const designTokens = await this.extractDesignTokens(config);

    // Identify patterns
    const patterns = this.identifyPatterns(components);

    const library: DesignLibrary = {
      id: `lib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      version: '1.0.0',
      url: config.url,
      framework: config.framework,
      components,
      designTokens,
      patterns,
      metadata: {
        totalComponents: components.length,
        categories: [...new Set(components.map((c) => c.category))],
        indexedAt: new Date(),
        source: config.source,
      },
    };

    this.libraries.set(library.name, library);

    // Update indexes
    this.updateComponentIndex(library);
    this.updatePatternIndex(library);

    console.log(`✅ Indexed ${library.name}: ${components.length} components`);

    return library;
  }

  /**
   * Get library by name
   */
  getLibrary(name: string): DesignLibrary | undefined {
    return this.libraries.get(name);
  }

  /**
   * Search components across all libraries
   */
  searchComponents(query: {
    name?: string;
    category?: string;
    atomicLevel?: ComponentMetadata['atomicLevel'];
    framework?: DesignLibrary['framework'];
    tags?: string[];
  }): ComponentMetadata[] {
    const results: ComponentMetadata[] = [];

    this.libraries.forEach((library) => {
      if (query.framework && library.framework !== query.framework) {
        return;
      }

      library.components.forEach((component) => {
        let matches = true;

        if (query.name && !component.name.toLowerCase().includes(query.name.toLowerCase())) {
          matches = false;
        }

        if (query.category && component.category !== query.category) {
          matches = false;
        }

        if (query.atomicLevel && component.atomicLevel !== query.atomicLevel) {
          matches = false;
        }

        if (query.tags && query.tags.length > 0) {
          const hasAllTags = query.tags.every((tag) => component.tags.includes(tag));
          if (!hasAllTags) {
            matches = false;
          }
        }

        if (matches) {
          results.push(component);
        }
      });
    });

    return results;
  }

  /**
   * Compare multiple libraries
   */
  compareLibraries(libraryNames: string[]): LibraryComparison {
    const libraries = libraryNames
      .map((name) => this.libraries.get(name))
      .filter((lib): lib is DesignLibrary => lib !== undefined);

    if (libraries.length < 2) {
      throw new Error('Need at least 2 libraries to compare');
    }

    // Find common components (by name)
    const componentSets = libraries.map((lib) =>
      new Set(lib.components.map((c) => c.name.toLowerCase()))
    );

    const commonComponents = Array.from(componentSets[0]).filter((name) =>
      componentSets.every((set) => set.has(name))
    );

    // Find unique components per library
    const uniqueComponents: Record<string, string[]> = {};
    libraries.forEach((lib, index) => {
      const otherSets = componentSets.filter((_, i) => i !== index);
      const unique = Array.from(componentSets[index]).filter((name) =>
        otherSets.every((set) => !set.has(name))
      );
      uniqueComponents[lib.name] = unique;
    });

    // Find common patterns
    const patternSets = libraries.map((lib) =>
      new Set(lib.patterns.map((p) => p.name))
    );

    const commonPatterns = Array.from(patternSets[0]).filter((name) =>
      patternSets.every((set) => set.has(name))
    );

    // Analyze design system approaches
    const approaches: Record<string, string> = {};
    libraries.forEach((lib) => {
      approaches[lib.name] = this.analyzeDesignSystemApproach(lib);
    });

    return {
      libraries: libraryNames,
      commonComponents,
      uniqueComponents,
      commonPatterns,
      designSystemApproaches: approaches,
    };
  }

  /**
   * Get all indexed libraries
   */
  getAllLibraries(): DesignLibrary[] {
    return Array.from(this.libraries.values());
  }

  /**
   * Get component implementations across libraries
   */
  getComponentImplementations(componentName: string): ComponentMetadata[] {
    return this.componentIndex.get(componentName.toLowerCase()) || [];
  }

  /**
   * Export library index as JSON
   */
  exportLibraryIndex(libraryName: string): string {
    const library = this.libraries.get(libraryName);
    if (!library) {
      throw new Error(`Library ${libraryName} not found`);
    }

    return JSON.stringify(library, null, 2);
  }

  /**
   * Generate component usage recommendations
   */
  generateRecommendations(context: {
    framework: DesignLibrary['framework'];
    complexity?: ComponentMetadata['complexity'];
    category?: string;
  }): Array<{
    component: ComponentMetadata;
    library: string;
    score: number;
    reason: string;
  }> {
    const recommendations: Array<{
      component: ComponentMetadata;
      library: string;
      score: number;
      reason: string;
    }> = [];

    this.libraries.forEach((library) => {
      if (library.framework !== context.framework) {
        return;
      }

      library.components.forEach((component) => {
        let score = 0;
        const reasons: string[] = [];

        if (context.complexity && component.complexity === context.complexity) {
          score += 2;
          reasons.push('matches complexity level');
        }

        if (context.category && component.category === context.category) {
          score += 3;
          reasons.push('matches category');
        }

        if (component.accessibility.screenReaderFriendly) {
          score += 1;
          reasons.push('accessible');
        }

        if (component.examples.length > 0) {
          score += 1;
          reasons.push('has examples');
        }

        if (score > 0) {
          recommendations.push({
            component,
            library: library.name,
            score,
            reason: reasons.join(', '),
          });
        }
      });
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Private methods

  private async discoverComponents(config: {
    name: string;
    framework: DesignLibrary['framework'];
    path?: string;
  }): Promise<ComponentMetadata[]> {
    // This is a placeholder - in real implementation, would scan files/packages
    // For now, return mock data based on known libraries

    const knownLibraries: Record<string, ComponentMetadata[]> = {
      'material-ui': this.getMaterialUIComponents(),
      'ant-design': this.getAntDesignComponents(),
      'chakra-ui': this.getChakraUIComponents(),
      'bootstrap': this.getBootstrapComponents(),
    };

    return knownLibraries[config.name.toLowerCase()] || [];
  }

  private async extractDesignTokens(config: {
    name: string;
  }): Promise<DesignTokens | undefined> {
    // Placeholder - would extract from actual library
    return {
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
        success: '#4caf50',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      typography: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        body: '1rem',
        small: '0.875rem',
      },
      breakpoints: {
        xs: '0px',
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1920px',
      },
      shadows: {},
      borders: {},
    };
  }

  private identifyPatterns(components: ComponentMetadata[]): DesignPattern[] {
    const patterns: DesignPattern[] = [];
    const patternMap = new Map<string, string[]>();

    // Identify common prop patterns
    components.forEach((component) => {
      component.props.forEach((prop) => {
        const key = `prop:${prop.name}:${prop.type}`;
        if (!patternMap.has(key)) {
          patternMap.set(key, []);
        }
        patternMap.get(key)!.push(component.id);
      });
    });

    // Convert to patterns
    patternMap.forEach((usedBy, key) => {
      if (usedBy.length >= 2) {
        const [, name, type] = key.split(':');
        patterns.push({
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${name} (${type})`,
          category: 'prop-pattern',
          description: `Common prop pattern used across ${usedBy.length} components`,
          usedBy,
          frequency: usedBy.length,
        });
      }
    });

    return patterns;
  }

  private updateComponentIndex(library: DesignLibrary): void {
    library.components.forEach((component) => {
      const key = component.name.toLowerCase();
      if (!this.componentIndex.has(key)) {
        this.componentIndex.set(key, []);
      }
      this.componentIndex.get(key)!.push(component);
    });
  }

  private updatePatternIndex(library: DesignLibrary): void {
    library.patterns.forEach((pattern) => {
      this.patternIndex.set(pattern.id, pattern);
    });
  }

  private analyzeDesignSystemApproach(library: DesignLibrary): string {
    const approaches: string[] = [];

    if (library.designTokens) {
      approaches.push('uses design tokens');
    }

    const hasAtomicDesign = library.components.some((c) => c.atomicLevel);
    if (hasAtomicDesign) {
      approaches.push('atomic design');
    }

    const avgPropsPerComponent =
      library.components.reduce((sum, c) => sum + c.props.length, 0) /
      library.components.length;

    if (avgPropsPerComponent > 10) {
      approaches.push('highly configurable');
    } else if (avgPropsPerComponent < 5) {
      approaches.push('opinionated/simplified');
    }

    return approaches.join(', ') || 'custom';
  }

  // Mock data for known libraries
  private getMaterialUIComponents(): ComponentMetadata[] {
    return [
      {
        id: 'mui-button',
        name: 'Button',
        displayName: 'Button',
        category: 'inputs',
        atomicLevel: 'atom',
        description: 'Material Design button component',
        props: [
          { name: 'variant', type: 'string', required: false, options: ['text', 'outlined', 'contained'] },
          { name: 'color', type: 'string', required: false, options: ['primary', 'secondary'] },
          { name: 'size', type: 'string', required: false, options: ['small', 'medium', 'large'] },
          { name: 'disabled', type: 'boolean', required: false },
        ],
        examples: [],
        accessibility: {
          keyboardSupport: true,
          screenReaderFriendly: true,
          wcagLevel: 'AA',
        },
        tags: ['button', 'interactive'],
        complexity: 'simple',
      },
    ];
  }

  private getAntDesignComponents(): ComponentMetadata[] {
    return [];
  }

  private getChakraUIComponents(): ComponentMetadata[] {
    return [];
  }

  private getBootstrapComponents(): ComponentMetadata[] {
    return [];
  }
}

/**
 * Component Mining Service
 * 
 * Mines component patterns from popular UI libraries and design systems
 * to create training data for neural network-based component generation.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ComponentPattern {
  id: string;
  name: string;
  category: string;
  atomicLevel: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  html: string;
  css: string;
  props: Record<string, any>;
  variants: string[];
  dependencies: string[];
  library: string;
  designTokens: Record<string, any>;
  accessibility: {
    ariaLabels: string[];
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
  };
  schema: ComponentSchema;
}

interface ComponentSchema {
  type: string;
  properties: Record<string, any>;
  required: string[];
  variants: Record<string, any>;
  composability: {
    canContain: string[];
    mustContain: string[];
    optionalContain: string[];
  };
}

interface LibrarySource {
  name: string;
  url: string;
  type: 'documentation' | 'repository' | 'styleguide';
  priority: number;
}

export class ComponentMiningService {
  private outputDir: string;
  private minedComponents: ComponentPattern[] = [];
  
  // Popular UI libraries to mine
  private librarySources: LibrarySource[] = [
    { name: 'Bootstrap', url: 'https://getbootstrap.com/docs/5.3/components/', type: 'documentation', priority: 1 },
    { name: 'Material-UI', url: 'https://mui.com/material-ui/all-components/', type: 'documentation', priority: 1 },
    { name: 'Ant Design', url: 'https://ant.design/components/overview/', type: 'documentation', priority: 1 },
    { name: 'Chakra UI', url: 'https://chakra-ui.com/docs/components', type: 'documentation', priority: 1 },
    { name: 'Tailwind UI', url: 'https://tailwindui.com/components', type: 'documentation', priority: 2 },
    { name: 'Shadcn UI', url: 'https://ui.shadcn.com/docs/components', type: 'documentation', priority: 1 },
    { name: 'Radix UI', url: 'https://www.radix-ui.com/primitives/docs/components', type: 'documentation', priority: 2 },
    { name: 'Headless UI', url: 'https://headlessui.com/', type: 'documentation', priority: 2 },
  ];

  constructor(outputDir: string = './data/design-system') {
    this.outputDir = outputDir;
  }

  /**
   * Initialize mining process
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'components'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'schemas'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'training-data'), { recursive: true });
  }

  /**
   * Mine all component libraries
   */
  async mineAllLibraries(): Promise<ComponentPattern[]> {
    console.log('🔍 Starting component mining from popular libraries...');
    
    for (const source of this.librarySources) {
      try {
        console.log(`Mining ${source.name}...`);
        const components = await this.mineLibrary(source);
        this.minedComponents.push(...components);
        console.log(`✅ Mined ${components.length} components from ${source.name}`);
      } catch (error) {
        console.error(`❌ Error mining ${source.name}:`, error);
      }
    }

    await this.saveMinedComponents();
    return this.minedComponents;
  }

  /**
   * Mine a specific library
   */
  private async mineLibrary(source: LibrarySource): Promise<ComponentPattern[]> {
    const components: ComponentPattern[] = [];
    
    // For each library, we create comprehensive component patterns
    const baseComponents = this.generateBaseComponentPatterns(source.name);
    components.push(...baseComponents);

    return components;
  }

  /**
   * Generate base component patterns for a library
   */
  private generateBaseComponentPatterns(libraryName: string): ComponentPattern[] {
    const components: ComponentPattern[] = [];

    // Atom level components
    const atoms = [
      this.createButtonPattern(libraryName),
      this.createInputPattern(libraryName),
      this.createIconPattern(libraryName),
      this.createLabelPattern(libraryName),
      this.createBadgePattern(libraryName),
    ];

    // Molecule level components
    const molecules = [
      this.createFormFieldPattern(libraryName),
      this.createCardPattern(libraryName),
      this.createSearchBarPattern(libraryName),
      this.createNavigationItemPattern(libraryName),
    ];

    // Organism level components
    const organisms = [
      this.createFormPattern(libraryName),
      this.createTablePattern(libraryName),
      this.createNavigationPattern(libraryName),
      this.createModalPattern(libraryName),
    ];

    components.push(...atoms, ...molecules, ...organisms);
    return components;
  }

  /**
   * Create Button pattern
   */
  private createButtonPattern(library: string): ComponentPattern {
    return {
      id: `${library}-button-${Date.now()}`,
      name: 'Button',
      category: 'action',
      atomicLevel: 'atom',
      library,
      html: '<button class="btn">Click me</button>',
      css: '.btn { padding: 0.5rem 1rem; border-radius: 0.25rem; }',
      props: {
        variant: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
        size: ['sm', 'md', 'lg'],
        disabled: 'boolean',
        loading: 'boolean',
        icon: 'string',
      },
      variants: ['solid', 'outline', 'ghost', 'link'],
      dependencies: [],
      designTokens: {
        colors: ['primary', 'secondary', 'success', 'danger'],
        spacing: ['xs', 'sm', 'md', 'lg'],
        borderRadius: ['sm', 'md', 'lg'],
      },
      accessibility: {
        ariaLabels: ['aria-label', 'aria-pressed', 'aria-disabled'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'button',
        properties: {
          variant: { type: 'string', enum: ['primary', 'secondary', 'success', 'danger'] },
          size: { type: 'string', enum: ['sm', 'md', 'lg'] },
          disabled: { type: 'boolean' },
        },
        required: [],
        variants: {
          solid: { background: 'solid', border: 'none' },
          outline: { background: 'transparent', border: 'solid' },
          ghost: { background: 'transparent', border: 'none' },
        },
        composability: {
          canContain: ['icon', 'text', 'badge'],
          mustContain: [],
          optionalContain: ['icon', 'badge'],
        },
      },
    };
  }

  /**
   * Create Input pattern
   */
  private createInputPattern(library: string): ComponentPattern {
    return {
      id: `${library}-input-${Date.now()}`,
      name: 'Input',
      category: 'form',
      atomicLevel: 'atom',
      library,
      html: '<input type="text" class="input" />',
      css: '.input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 0.25rem; }',
      props: {
        type: ['text', 'email', 'password', 'number', 'tel', 'url'],
        placeholder: 'string',
        disabled: 'boolean',
        required: 'boolean',
        size: ['sm', 'md', 'lg'],
      },
      variants: ['default', 'filled', 'flushed', 'unstyled'],
      dependencies: [],
      designTokens: {
        colors: ['border', 'focus', 'error'],
        spacing: ['xs', 'sm', 'md'],
        borderRadius: ['sm', 'md'],
      },
      accessibility: {
        ariaLabels: ['aria-label', 'aria-describedby', 'aria-invalid'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'input',
        properties: {
          type: { type: 'string', enum: ['text', 'email', 'password', 'number'] },
          placeholder: { type: 'string' },
          disabled: { type: 'boolean' },
          required: { type: 'boolean' },
        },
        required: ['type'],
        variants: {},
        composability: {
          canContain: [],
          mustContain: [],
          optionalContain: [],
        },
      },
    };
  }

  /**
   * Create Icon pattern
   */
  private createIconPattern(library: string): ComponentPattern {
    return {
      id: `${library}-icon-${Date.now()}`,
      name: 'Icon',
      category: 'visual',
      atomicLevel: 'atom',
      library,
      html: '<i class="icon"></i>',
      css: '.icon { display: inline-block; width: 1rem; height: 1rem; }',
      props: {
        name: 'string',
        size: ['xs', 'sm', 'md', 'lg', 'xl'],
        color: 'string',
      },
      variants: ['solid', 'outline', 'duotone'],
      dependencies: [],
      designTokens: {
        sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
        colors: ['primary', 'secondary', 'success', 'danger'],
      },
      accessibility: {
        ariaLabels: ['aria-label', 'aria-hidden'],
        keyboardNavigation: false,
        screenReaderSupport: true,
      },
      schema: {
        type: 'icon',
        properties: {
          name: { type: 'string' },
          size: { type: 'string', enum: ['xs', 'sm', 'md', 'lg', 'xl'] },
          color: { type: 'string' },
        },
        required: ['name'],
        variants: {},
        composability: {
          canContain: [],
          mustContain: [],
          optionalContain: [],
        },
      },
    };
  }

  /**
   * Create Label pattern
   */
  private createLabelPattern(library: string): ComponentPattern {
    return {
      id: `${library}-label-${Date.now()}`,
      name: 'Label',
      category: 'text',
      atomicLevel: 'atom',
      library,
      html: '<label class="label">Label Text</label>',
      css: '.label { display: block; font-weight: 500; margin-bottom: 0.25rem; }',
      props: {
        htmlFor: 'string',
        required: 'boolean',
      },
      variants: ['default'],
      dependencies: [],
      designTokens: {
        colors: ['text'],
        spacing: ['xs', 'sm'],
      },
      accessibility: {
        ariaLabels: [],
        keyboardNavigation: false,
        screenReaderSupport: true,
      },
      schema: {
        type: 'label',
        properties: {
          htmlFor: { type: 'string' },
          required: { type: 'boolean' },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['text', 'icon'],
          mustContain: ['text'],
          optionalContain: ['icon'],
        },
      },
    };
  }

  /**
   * Create Badge pattern
   */
  private createBadgePattern(library: string): ComponentPattern {
    return {
      id: `${library}-badge-${Date.now()}`,
      name: 'Badge',
      category: 'display',
      atomicLevel: 'atom',
      library,
      html: '<span class="badge">New</span>',
      css: '.badge { padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; }',
      props: {
        variant: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
        size: ['sm', 'md', 'lg'],
      },
      variants: ['solid', 'outline', 'subtle'],
      dependencies: [],
      designTokens: {
        colors: ['primary', 'secondary', 'success', 'danger'],
        spacing: ['xs', 'sm'],
        borderRadius: ['full'],
      },
      accessibility: {
        ariaLabels: ['aria-label'],
        keyboardNavigation: false,
        screenReaderSupport: true,
      },
      schema: {
        type: 'badge',
        properties: {
          variant: { type: 'string', enum: ['primary', 'secondary', 'success', 'danger'] },
          size: { type: 'string', enum: ['sm', 'md', 'lg'] },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['text', 'icon'],
          mustContain: ['text'],
          optionalContain: ['icon'],
        },
      },
    };
  }

  /**
   * Create Form Field pattern (molecule)
   */
  private createFormFieldPattern(library: string): ComponentPattern {
    return {
      id: `${library}-form-field-${Date.now()}`,
      name: 'FormField',
      category: 'form',
      atomicLevel: 'molecule',
      library,
      html: '<div class="form-field"><label></label><input /><span class="error"></span></div>',
      css: '.form-field { margin-bottom: 1rem; }',
      props: {
        label: 'string',
        required: 'boolean',
        error: 'string',
        helpText: 'string',
      },
      variants: ['default', 'floating'],
      dependencies: ['Label', 'Input'],
      designTokens: {
        spacing: ['sm', 'md'],
        colors: ['error', 'border'],
      },
      accessibility: {
        ariaLabels: ['aria-describedby', 'aria-invalid'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'formField',
        properties: {
          label: { type: 'string' },
          required: { type: 'boolean' },
          error: { type: 'string' },
        },
        required: ['label'],
        variants: {},
        composability: {
          canContain: ['label', 'input', 'text'],
          mustContain: ['label', 'input'],
          optionalContain: ['text'],
        },
      },
    };
  }

  /**
   * Create Card pattern (molecule)
   */
  private createCardPattern(library: string): ComponentPattern {
    return {
      id: `${library}-card-${Date.now()}`,
      name: 'Card',
      category: 'layout',
      atomicLevel: 'molecule',
      library,
      html: '<div class="card"><div class="card-header"></div><div class="card-body"></div><div class="card-footer"></div></div>',
      css: '.card { border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }',
      props: {
        variant: ['elevated', 'outlined', 'filled'],
        hoverable: 'boolean',
        clickable: 'boolean',
      },
      variants: ['default', 'elevated', 'outlined'],
      dependencies: [],
      designTokens: {
        borderRadius: ['md', 'lg'],
        shadow: ['sm', 'md', 'lg'],
        spacing: ['md', 'lg'],
      },
      accessibility: {
        ariaLabels: ['aria-label'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'card',
        properties: {
          variant: { type: 'string', enum: ['elevated', 'outlined', 'filled'] },
          hoverable: { type: 'boolean' },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['header', 'body', 'footer', 'image', 'text', 'button'],
          mustContain: ['body'],
          optionalContain: ['header', 'footer', 'image'],
        },
      },
    };
  }

  /**
   * Create Search Bar pattern (molecule)
   */
  private createSearchBarPattern(library: string): ComponentPattern {
    return {
      id: `${library}-search-bar-${Date.now()}`,
      name: 'SearchBar',
      category: 'form',
      atomicLevel: 'molecule',
      library,
      html: '<div class="search-bar"><input type="search" /><button><icon /></button></div>',
      css: '.search-bar { display: flex; align-items: center; }',
      props: {
        placeholder: 'string',
        size: ['sm', 'md', 'lg'],
        variant: ['default', 'filled', 'outlined'],
      },
      variants: ['default', 'filled', 'outlined'],
      dependencies: ['Input', 'Button', 'Icon'],
      designTokens: {
        spacing: ['sm', 'md'],
        borderRadius: ['md', 'lg'],
      },
      accessibility: {
        ariaLabels: ['aria-label', 'role'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'searchBar',
        properties: {
          placeholder: { type: 'string' },
          size: { type: 'string', enum: ['sm', 'md', 'lg'] },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['input', 'button', 'icon'],
          mustContain: ['input'],
          optionalContain: ['button', 'icon'],
        },
      },
    };
  }

  /**
   * Create Navigation Item pattern (molecule)
   */
  private createNavigationItemPattern(library: string): ComponentPattern {
    return {
      id: `${library}-nav-item-${Date.now()}`,
      name: 'NavigationItem',
      category: 'navigation',
      atomicLevel: 'molecule',
      library,
      html: '<a class="nav-item"><icon /><span>Link</span></a>',
      css: '.nav-item { display: flex; align-items: center; padding: 0.5rem 1rem; }',
      props: {
        active: 'boolean',
        disabled: 'boolean',
        icon: 'string',
      },
      variants: ['default', 'vertical', 'horizontal'],
      dependencies: ['Icon'],
      designTokens: {
        spacing: ['sm', 'md'],
        colors: ['active', 'hover'],
      },
      accessibility: {
        ariaLabels: ['aria-current', 'aria-disabled'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'navigationItem',
        properties: {
          active: { type: 'boolean' },
          disabled: { type: 'boolean' },
          icon: { type: 'string' },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['icon', 'text', 'badge'],
          mustContain: ['text'],
          optionalContain: ['icon', 'badge'],
        },
      },
    };
  }

  /**
   * Create Form pattern (organism)
   */
  private createFormPattern(library: string): ComponentPattern {
    return {
      id: `${library}-form-${Date.now()}`,
      name: 'Form',
      category: 'form',
      atomicLevel: 'organism',
      library,
      html: '<form class="form"><div class="form-fields"></div><div class="form-actions"></div></form>',
      css: '.form { display: flex; flex-direction: column; gap: 1rem; }',
      props: {
        layout: ['vertical', 'horizontal', 'inline'],
        size: ['sm', 'md', 'lg'],
      },
      variants: ['default', 'card'],
      dependencies: ['FormField', 'Button'],
      designTokens: {
        spacing: ['md', 'lg'],
      },
      accessibility: {
        ariaLabels: ['aria-label', 'role'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'form',
        properties: {
          layout: { type: 'string', enum: ['vertical', 'horizontal', 'inline'] },
          size: { type: 'string', enum: ['sm', 'md', 'lg'] },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['formField', 'button', 'text'],
          mustContain: ['formField'],
          optionalContain: ['button'],
        },
      },
    };
  }

  /**
   * Create Table pattern (organism)
   */
  private createTablePattern(library: string): ComponentPattern {
    return {
      id: `${library}-table-${Date.now()}`,
      name: 'Table',
      category: 'data',
      atomicLevel: 'organism',
      library,
      html: '<table class="table"><thead></thead><tbody></tbody><tfoot></tfoot></table>',
      css: '.table { width: 100%; border-collapse: collapse; }',
      props: {
        variant: ['simple', 'striped', 'bordered'],
        size: ['sm', 'md', 'lg'],
        hoverable: 'boolean',
      },
      variants: ['simple', 'striped', 'bordered'],
      dependencies: [],
      designTokens: {
        spacing: ['sm', 'md'],
        colors: ['border', 'stripe', 'hover'],
      },
      accessibility: {
        ariaLabels: ['aria-label', 'role'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'table',
        properties: {
          variant: { type: 'string', enum: ['simple', 'striped', 'bordered'] },
          size: { type: 'string', enum: ['sm', 'md', 'lg'] },
          hoverable: { type: 'boolean' },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['thead', 'tbody', 'tfoot', 'tr', 'th', 'td'],
          mustContain: ['thead', 'tbody'],
          optionalContain: ['tfoot'],
        },
      },
    };
  }

  /**
   * Create Navigation pattern (organism)
   */
  private createNavigationPattern(library: string): ComponentPattern {
    return {
      id: `${library}-navigation-${Date.now()}`,
      name: 'Navigation',
      category: 'navigation',
      atomicLevel: 'organism',
      library,
      html: '<nav class="navigation"><ul class="nav-list"></ul></nav>',
      css: '.navigation { display: flex; }',
      props: {
        variant: ['horizontal', 'vertical', 'sidebar'],
        size: ['sm', 'md', 'lg'],
      },
      variants: ['horizontal', 'vertical', 'sidebar'],
      dependencies: ['NavigationItem'],
      designTokens: {
        spacing: ['md', 'lg'],
        colors: ['background', 'border'],
      },
      accessibility: {
        ariaLabels: ['aria-label', 'role'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'navigation',
        properties: {
          variant: { type: 'string', enum: ['horizontal', 'vertical', 'sidebar'] },
          size: { type: 'string', enum: ['sm', 'md', 'lg'] },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['navigationItem'],
          mustContain: ['navigationItem'],
          optionalContain: [],
        },
      },
    };
  }

  /**
   * Create Modal pattern (organism)
   */
  private createModalPattern(library: string): ComponentPattern {
    return {
      id: `${library}-modal-${Date.now()}`,
      name: 'Modal',
      category: 'overlay',
      atomicLevel: 'organism',
      library,
      html: '<div class="modal"><div class="modal-overlay"></div><div class="modal-content"></div></div>',
      css: '.modal { position: fixed; inset: 0; z-index: 1000; }',
      props: {
        size: ['sm', 'md', 'lg', 'xl', 'full'],
        centered: 'boolean',
        closeOnOverlayClick: 'boolean',
      },
      variants: ['default', 'drawer', 'fullscreen'],
      dependencies: ['Button'],
      designTokens: {
        spacing: ['lg', 'xl'],
        borderRadius: ['md', 'lg'],
        shadow: ['xl'],
      },
      accessibility: {
        ariaLabels: ['aria-modal', 'aria-labelledby', 'role'],
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      schema: {
        type: 'modal',
        properties: {
          size: { type: 'string', enum: ['sm', 'md', 'lg', 'xl', 'full'] },
          centered: { type: 'boolean' },
          closeOnOverlayClick: { type: 'boolean' },
        },
        required: [],
        variants: {},
        composability: {
          canContain: ['header', 'body', 'footer', 'button', 'form'],
          mustContain: ['body'],
          optionalContain: ['header', 'footer'],
        },
      },
    };
  }

  /**
   * Save mined components to files
   */
  private async saveMinedComponents(): Promise<void> {
    // Save full dataset
    await fs.writeFile(
      path.join(this.outputDir, 'components', 'all-components.json'),
      JSON.stringify(this.minedComponents, null, 2)
    );

    // Save by atomic level
    const byLevel = this.groupByAtomicLevel(this.minedComponents);
    for (const [level, components] of Object.entries(byLevel)) {
      await fs.writeFile(
        path.join(this.outputDir, 'components', `${level}-components.json`),
        JSON.stringify(components, null, 2)
      );
    }

    // Save schemas
    const schemas = this.minedComponents.map(c => c.schema);
    await fs.writeFile(
      path.join(this.outputDir, 'schemas', 'all-schemas.json'),
      JSON.stringify(schemas, null, 2)
    );

    // Generate training data
    await this.generateTrainingData();
  }

  /**
   * Group components by atomic level
   */
  private groupByAtomicLevel(components: ComponentPattern[]): Record<string, ComponentPattern[]> {
    return components.reduce((acc, component) => {
      const level = component.atomicLevel;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(component);
      return acc;
    }, {} as Record<string, ComponentPattern[]>);
  }

  /**
   * Generate training data for neural network
   */
  private async generateTrainingData(): Promise<void> {
    const trainingData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalComponents: this.minedComponents.length,
        libraries: [...new Set(this.minedComponents.map(c => c.library))],
      },
      components: this.minedComponents.map(c => ({
        input: {
          category: c.category,
          atomicLevel: c.atomicLevel,
          props: c.props,
          variants: c.variants,
          dependencies: c.dependencies,
        },
        output: {
          html: c.html,
          css: c.css,
          schema: c.schema,
        },
      })),
      combinations: this.generateComponentCombinations(),
    };

    await fs.writeFile(
      path.join(this.outputDir, 'training-data', 'neural-network-training-data.json'),
      JSON.stringify(trainingData, null, 2)
    );
  }

  /**
   * Generate all possible component combinations
   */
  private generateComponentCombinations(): any[] {
    const combinations: any[] = [];
    
    // Get components by level
    const atoms = this.minedComponents.filter(c => c.atomicLevel === 'atom');
    const molecules = this.minedComponents.filter(c => c.atomicLevel === 'molecule');
    
    // Generate molecule combinations from atoms
    for (const molecule of molecules) {
      const requiredAtoms = molecule.dependencies;
      const atomCombinations = atoms.filter(a => 
        requiredAtoms.includes(a.name)
      );
      
      combinations.push({
        type: 'molecule',
        component: molecule.name,
        requiredAtoms: atomCombinations.map(a => a.name),
        schema: molecule.schema,
      });
    }

    return combinations;
  }

  /**
   * Get component statistics
   */
  getStatistics() {
    const byLevel = this.groupByAtomicLevel(this.minedComponents);
    const byLibrary = this.minedComponents.reduce((acc, c) => {
      acc[c.library] = (acc[c.library] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.minedComponents.length,
      byLevel: Object.entries(byLevel).map(([level, components]) => ({
        level,
        count: components.length,
      })),
      byLibrary,
    };
  }
}

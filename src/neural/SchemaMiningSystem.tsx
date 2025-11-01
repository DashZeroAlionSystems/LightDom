import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Database, Target, Layers, Grid, Network, Search, ArrowDown } from 'lucide-react';

// Advanced Schema Mining and Component Definition System
interface StyleGuideSource {
  name: string;
  url: string;
  category: 'design-system' | 'component-library' | 'ui-patterns' | 'accessibility' | 'branding';
  selectors: Record<string, string>;
  extractors: Record<string, (element: any) => any>;
}

interface MinedAtomSchema {
  id: string;
  name: string;
  category: 'input' | 'display' | 'action' | 'layout' | 'navigation' | 'feedback';
  type: 'text' | 'number' | 'boolean' | 'select' | 'array' | 'object' | 'media' | 'interactive';
  source: string; // Which style guide this was mined from
  properties: {
    visual: VisualProperties;
    behavioral: BehavioralProperties;
    semantic: SemanticProperties;
    accessibility: AccessibilityProperties;
    responsive: ResponsiveProperties;
  };
  variants: AtomVariant[];
  composition: {
    allowedChildren: string[];
    requiredChildren: string[];
    layoutConstraints: LayoutConstraint[];
  };
  metadata: {
    complexity: number;
    reusability: number;
    accessibility: number;
    performance: number;
    popularity: number;
    lastUpdated: Date;
    sourceUrl: string;
  };
}

interface VisualProperties {
  dimensions: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    aspectRatio?: number;
  };
  spacing: {
    padding: SpacingConfig;
    margin: SpacingConfig;
    gap?: number;
  };
  typography: {
    fontFamily: string[];
    fontSize: FontSizeConfig;
    fontWeight: FontWeightConfig;
    lineHeight: LineHeightConfig;
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
  };
  colors: {
    background: ColorConfig;
    foreground: ColorConfig;
    border: ColorConfig;
    shadow?: ShadowConfig;
  };
  border: {
    width: BorderWidthConfig;
    style: BorderStyleConfig;
    radius: BorderRadiusConfig;
  };
  effects: {
    opacity?: number;
    transform?: string;
    transition?: TransitionConfig;
    animation?: AnimationConfig;
  };
}

interface BehavioralProperties {
  interactions: {
    hover: InteractionConfig;
    focus: InteractionConfig;
    active: InteractionConfig;
    disabled: InteractionConfig;
  };
  stateManagement: {
    defaultState: any;
    stateTransitions: StateTransition[];
    validation: ValidationRule[];
  };
  events: {
    onClick?: EventHandler;
    onChange?: EventHandler;
    onFocus?: EventHandler;
    onBlur?: EventHandler;
    onSubmit?: EventHandler;
    customEvents?: CustomEvent[];
  };
  dataBinding: {
    dataSource?: DataSource;
    dataTransform?: DataTransform[];
    updateStrategy: 'immediate' | 'debounced' | 'on-blur' | 'manual';
  };
}

interface SemanticProperties {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  purpose: string;
  category: string;
  domain: string[];
  keywords: string[];
  relatedConcepts: string[];
  usage: UsageContext[];
}

interface AccessibilityProperties {
  aria: {
    role?: string;
    label?: string;
    labelledby?: string;
    describedby?: string;
    controls?: string;
    expanded?: boolean;
    selected?: boolean;
    checked?: boolean;
    pressed?: boolean;
    level?: number;
    posinset?: number;
    setsize?: number;
    current?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false;
  };
  keyboard: {
    tabIndex?: number;
    keyHandlers: KeyHandler[];
    focusManagement: FocusManagement;
  };
  screenReader: {
    announceChanges: boolean;
    liveRegion?: 'off' | 'polite' | 'assertive';
    hidden?: boolean;
  };
  colorContrast: {
    meetsWCAG: boolean;
    contrastRatio: number;
    recommendations: string[];
  };
  motion: {
    reducedMotion: boolean;
    animationDuration: number;
    prefersReducedMotion: boolean;
  };
}

interface ResponsiveProperties {
  breakpoints: {
    mobile: ComponentConfig;
    tablet: ComponentConfig;
    desktop: ComponentConfig;
    wide: ComponentConfig;
  };
  fluid: {
    enabled: boolean;
    minViewport?: number;
    maxViewport?: number;
    scaling: 'linear' | 'exponential' | 'custom';
  };
  orientation: {
    portrait: ComponentConfig;
    landscape: ComponentConfig;
  };
  touch: {
    enabled: boolean;
    gestures: TouchGesture[];
    hapticFeedback: boolean;
  };
}

interface AtomVariant {
  name: string;
  condition: string; // CSS selector or JavaScript condition
  overrides: Partial<MinedAtomSchema['properties']>;
  metadata: {
    usage: number;
    accessibility: number;
    popularity: number;
  };
}

interface LayoutConstraint {
  type: 'position' | 'size' | 'spacing' | 'z-index' | 'overflow';
  rule: string;
  severity: 'error' | 'warning' | 'info';
}

interface ColorConfig {
  default: string;
  variants: Record<string, string>;
  semantic?: boolean;
}

interface SpacingConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface FontSizeConfig {
  base: number;
  scale: number;
  unit: 'px' | 'rem' | 'em';
}

interface FontWeightConfig {
  regular: number;
  medium: number;
  bold: number;
  extraBold: number;
}

interface LineHeightConfig {
  tight: number;
  normal: number;
  relaxed: number;
}

interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

interface BorderWidthConfig {
  thin: number;
  medium: number;
  thick: number;
}

interface BorderStyleConfig {
  solid: string;
  dashed: string;
  dotted: string;
}

interface BorderRadiusConfig {
  none: number;
  small: number;
  medium: number;
  large: number;
  full: number;
}

interface TransitionConfig {
  property: string;
  duration: number;
  timing: string;
  delay?: number;
}

interface AnimationConfig {
  name: string;
  duration: number;
  timing: string;
  iteration: number;
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

interface InteractionConfig {
  backgroundColor?: string;
  borderColor?: string;
  shadow?: string;
  transform?: string;
  opacity?: number;
  cursor?: string;
}

interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  animation?: string;
  validation?: string;
}

interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

interface EventHandler {
  type: 'sync' | 'async';
  action: string;
  parameters: Record<string, any>;
  debounce?: number;
}

interface CustomEvent {
  name: string;
  payload: Record<string, any>;
  bubbles: boolean;
  cancelable: boolean;
}

interface DataSource {
  type: 'static' | 'api' | 'database' | 'localStorage' | 'sessionStorage';
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
}

interface DataTransform {
  type: 'map' | 'filter' | 'sort' | 'group' | 'aggregate';
  field: string;
  operation: string;
  parameters?: Record<string, any>;
}

interface UsageContext {
  scenario: string;
  frequency: number;
  userType: string;
  deviceType: string;
  accessibilityNeeds: string[];
}

interface KeyHandler {
  key: string;
  modifiers?: string[];
  action: string;
  preventDefault: boolean;
}

interface FocusManagement {
  autoFocus: boolean;
  focusTrap: boolean;
  focusOrder: string[];
  returnFocus: boolean;
}

interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'rotate';
  action: string;
  parameters: Record<string, any>;
}

interface ComponentConfig {
  hidden: boolean;
  size: 'small' | 'medium' | 'large';
  spacing: 'tight' | 'normal' | 'loose';
}

// Component Schema (composed of atoms)
interface ComponentSchema {
  id: string;
  name: string;
  category: string;
  description: string;
  purpose: string;
  atoms: ComponentAtom[];
  layout: {
    type: 'vertical' | 'horizontal' | 'grid' | 'flex' | 'absolute';
    constraints: LayoutConstraint[];
    responsive: ResponsiveProperties;
  };
  dataFlow: {
    inputs: DataFlow[];
    outputs: DataFlow[];
    transformations: DataTransform[];
    validation: ValidationRule[];
  };
  interactions: {
    events: EventHandler[];
    stateManagement: StateManagement;
    accessibility: AccessibilityProperties;
  };
  metadata: {
    complexity: number;
    reusability: number;
    performance: number;
    accessibility: number;
    atomsCount: number;
    estimatedDevTime: number;
    popularity: number;
  };
}

interface ComponentAtom {
  id: string;
  atomId: string; // Reference to MinedAtomSchema
  position: {
    row: number;
    col: number;
    width: number;
    height: number;
    zIndex: number;
  };
  configuration: {
    variant?: string;
    overrides: Partial<MinedAtomSchema['properties']>;
    dataBinding?: DataBinding;
  };
  connections: {
    inputs: string[]; // Other atom IDs this connects to
    outputs: string[]; // Other atom IDs this connects from
    events: EventConnection[];
  };
}

interface DataFlow {
  id: string;
  name: string;
  type: string;
  required: boolean;
  validation: ValidationRule[];
  defaultValue?: any;
}

interface StateManagement {
  initialState: Record<string, any>;
  reducers: StateReducer[];
  effects: StateEffect[];
  selectors: StateSelector[];
}

interface StateReducer {
  action: string;
  reducer: string; // Function body as string
  payload: Record<string, any>;
}

interface StateEffect {
  trigger: string;
  effect: string; // Function body as string
  dependencies: string[];
}

interface StateSelector {
  name: string;
  selector: string; // Function body as string
  dependencies: string[];
}

interface DataBinding {
  source: DataSource;
  field: string;
  transform?: DataTransform;
  updateTrigger: 'change' | 'blur' | 'submit' | 'timer';
}

interface EventConnection {
  event: string;
  targetAtom: string;
  targetEvent: string;
  dataMapping?: Record<string, string>;
}

// Dashboard Schema (composed of components)
interface DashboardSchema {
  id: string;
  name: string;
  category: string;
  description: string;
  purpose: string; // "Customize [attribute name]"
  attribute: string; // The attribute this dashboard customizes
  components: DashboardComponent[];
  layout: {
    type: 'single' | 'multi-column' | 'tabbed' | 'accordion' | 'wizard';
    columns: number;
    rows: number;
    areas: string[][];
    responsive: ResponsiveProperties;
  };
  dataFlow: {
    attributeInput: string; // The attribute being customized
    componentInputs: Record<string, DataFlow>;
    componentOutputs: Record<string, DataFlow>;
    transformations: DataTransform[];
    validation: {
      attribute: ValidationRule[];
      components: Record<string, ValidationRule[]>;
    };
  };
  ui: {
    theme: string;
    styling: Record<string, any>;
    animations: AnimationConfig[];
    accessibility: AccessibilityProperties;
  };
  metadata: {
    complexity: number;
    estimatedTime: number; // minutes to configure
    componentsCount: number;
    atomsCount: number;
    dependencies: string[];
  };
}

interface DashboardComponent {
  id: string;
  componentId: string; // Reference to ComponentSchema
  position: {
    row: number;
    col: number;
    width: number;
    height: number;
  };
  configuration: {
    variant?: string;
    overrides: Partial<ComponentSchema>;
    dataBinding: Record<string, DataBinding>;
  };
  connections: {
    inputs: string[]; // Other component IDs
    outputs: string[]; // Other component IDs
    events: EventConnection[];
  };
}

// Workflow Schema (composed of dashboards)
interface WorkflowSchema {
  id: string;
  name: string;
  category: string;
  description: string;
  dashboards: string[]; // Dashboard IDs in execution order
  dataFlow: {
    entryPoint: string;
    exitPoint: string;
    paths: WorkflowPath[];
    globalData: Record<string, DataFlow>;
  };
  automation: {
    triggers: WorkflowTrigger[];
    actions: WorkflowAction[];
    schedules: WorkflowSchedule[];
  };
  validation: {
    globalRules: ValidationRule[];
    dashboardRules: Record<string, ValidationRule[]>;
  };
  metadata: {
    complexity: number;
    estimatedTime: number;
    dashboardsCount: number;
    componentsCount: number;
    atomsCount: number;
  };
}

interface WorkflowPath {
  id: string;
  from: string; // Dashboard ID
  to: string; // Dashboard ID
  condition: string; // JavaScript expression
  dataMapping: Record<string, string>;
  actions: WorkflowAction[];
}

// Local workflow-related type definitions (keeps this module self-contained)
interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'api';
  config: Record<string, any>;
  description?: string;
}

interface WorkflowAction {
  type: 'notification' | 'email' | 'webhook' | 'database' | 'file' | 'update' | string;
  config: Record<string, any>;
  condition?: string;
}

interface WorkflowSchedule {
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | string;
  time?: string;
  days?: number[];
  description?: string;
}

// SEO Page Rank Component Example
const SEOPageRankAttributes = [
  { id: 'meta-title', name: 'Meta Title', type: 'text', category: 'meta', required: true },
  { id: 'meta-description', name: 'Meta Description', type: 'text', category: 'meta', required: true },
  { id: 'title-tag', name: 'Title Tag', type: 'text', category: 'structure', required: true },
  { id: 'h1-tag', name: 'H1 Tag', type: 'text', category: 'structure', required: true },
  { id: 'h2-tags', name: 'H2 Tags', type: 'array', category: 'structure', required: false },
  { id: 'canonical-url', name: 'Canonical URL', type: 'text', category: 'technical', required: false },
  { id: 'robots-txt', name: 'Robots.txt', type: 'boolean', category: 'technical', required: false },
  { id: 'xml-sitemap', name: 'XML Sitemap', type: 'boolean', category: 'technical', required: false },
  { id: 'page-speed', name: 'Page Speed', type: 'number', category: 'performance', required: false },
  { id: 'mobile-friendly', name: 'Mobile Friendly', type: 'boolean', category: 'technical', required: false },
  { id: 'ssl-certificate', name: 'SSL Certificate', type: 'boolean', category: 'security', required: true },
  { id: 'internal-links', name: 'Internal Links', type: 'number', category: 'linking', required: false },
  { id: 'external-links', name: 'External Links', type: 'number', category: 'linking', required: false },
  { id: 'image-alt-tags', name: 'Image Alt Tags', type: 'number', category: 'accessibility', required: false },
  { id: 'keyword-density', name: 'Keyword Density', type: 'number', category: 'content', required: false },
  { id: 'url-structure', name: 'URL Structure', type: 'text', category: 'technical', required: true },
  { id: 'breadcrumb-nav', name: 'Breadcrumb Navigation', type: 'boolean', category: 'navigation', required: false },
  { id: 'open-graph', name: 'Open Graph Tags', type: 'object', category: 'social', required: false },
  { id: 'twitter-cards', name: 'Twitter Cards', type: 'object', category: 'social', required: false },
  { id: 'structured-data', name: 'Structured Data', type: 'object', category: 'semantic', required: false }
];

// Schema Mining System
class SchemaMiningSystem {
  private styleGuideSources: StyleGuideSource[] = [];
  private minedAtomSchemas: Map<string, MinedAtomSchema> = new Map();
  private componentSchemas: Map<string, ComponentSchema> = new Map();
  private dashboardSchemas: Map<string, DashboardSchema> = new Map();
  private workflowSchemas: Map<string, WorkflowSchema> = new Map();

  constructor() {
    this.initializeStyleGuideSources();
  }

  private initializeStyleGuideSources(): void {
    this.styleGuideSources = [
      {
        name: 'Material Design',
        url: 'https://material.io',
        category: 'design-system',
        selectors: {
          components: '.component-card',
          atoms: '.atom-element',
          patterns: '.design-pattern'
        },
        extractors: {
          visual: this.generateVisualProperties.bind(this),
          behavioral: this.generateBehavioralProperties.bind(this),
          semantic: this.generateSemanticProperties.bind(this),
          accessibility: this.generateAccessibilityProperties.bind(this)
        }
      },
      {
        name: 'Ant Design',
        url: 'https://ant.design',
        category: 'component-library',
        selectors: {
          components: '.ant-component',
          atoms: '.ant-atomic',
          patterns: '.ant-pattern'
        },
        extractors: {
          visual: this.generateVisualProperties.bind(this),
          behavioral: this.generateBehavioralProperties.bind(this),
          semantic: this.generateSemanticProperties.bind(this),
          accessibility: this.generateAccessibilityProperties.bind(this)
        }
      },
      {
        name: 'Chakra UI',
        url: 'https://chakra-ui.com',
        category: 'component-library',
        selectors: {
          components: '.chakra-component',
          atoms: '.chakra-primitive',
          patterns: '.chakra-pattern'
        },
        extractors: {
          visual: this.generateVisualProperties.bind(this),
          behavioral: this.generateBehavioralProperties.bind(this),
          semantic: this.generateSemanticProperties.bind(this),
          accessibility: this.generateAccessibilityProperties.bind(this)
        }
      },
      {
        name: 'IBM Carbon',
        url: 'https://carbondesignsystem.com',
        category: 'design-system',
        selectors: {
          components: '.bx--component',
          atoms: '.bx--atomic',
          patterns: '.bx--pattern'
        },
        extractors: {
          visual: this.generateVisualProperties.bind(this),
          behavioral: this.generateBehavioralProperties.bind(this),
          semantic: this.generateSemanticProperties.bind(this),
          accessibility: this.generateAccessibilityProperties.bind(this)
        }
      },
      {
        name: 'Atlassian Design System',
        url: 'https://atlassian.design',
        category: 'design-system',
        selectors: {
          components: '.atlaskit-component',
          atoms: '.atlaskit-primitive',
          patterns: '.atlaskit-pattern'
        },
        extractors: {
          visual: this.generateVisualProperties.bind(this),
          behavioral: this.generateBehavioralProperties.bind(this),
          semantic: this.generateSemanticProperties.bind(this),
          accessibility: this.generateAccessibilityProperties.bind(this)
        }
      }
    ];
  }

  async mineSchemasFromStyleGuides(): Promise<void> {
    console.log('🔍 Starting schema mining from style guides...');

    for (const source of this.styleGuideSources) {
      console.log(`📚 Mining from ${source.name}...`);

      try {
        // Simulate scraping and processing
        const atoms = await this.extractAtomsFromSource(source);
        const components = await this.extractComponentsFromSource(source, atoms);

        atoms.forEach(atom => this.minedAtomSchemas.set(atom.id, atom));
        components.forEach(component => this.componentSchemas.set(component.id, component));

        console.log(`✅ Extracted ${atoms.length} atoms and ${components.length} components from ${source.name}`);
      } catch (error) {
        console.error(`❌ Failed to mine from ${source.name}:`, error);
      }
    }

    console.log(`🎯 Schema mining complete: ${this.minedAtomSchemas.size} atoms, ${this.componentSchemas.size} components`);
  }

  private async extractAtomsFromSource(source: StyleGuideSource): Promise<MinedAtomSchema[]> {
    // Simulate atom extraction from different sources
    const atoms: MinedAtomSchema[] = [];

    const atomTemplates = [
      { name: 'Button', category: 'action', type: 'interactive' },
      { name: 'Input Field', category: 'input', type: 'text' },
      { name: 'Checkbox', category: 'input', type: 'boolean' },
      { name: 'Select Dropdown', category: 'input', type: 'select' },
      { name: 'Card', category: 'layout', type: 'layout' },
      { name: 'Modal', category: 'layout', type: 'interactive' },
      { name: 'Progress Bar', category: 'display', type: 'display' },
      { name: 'Data Table', category: 'display', type: 'array' },
      { name: 'Chart', category: 'display', type: 'object' },
      { name: 'Navigation', category: 'navigation', type: 'interactive' }
    ];

    atomTemplates.forEach((template, index) => {
      const atom: MinedAtomSchema = {
        id: `${source.name.toLowerCase()}-${template.name.toLowerCase().replace(' ', '-')}`,
        name: template.name,
        category: template.category as any,
        type: template.type as any,
        source: source.name,
        properties: {
          visual: this.generateVisualProperties(source.name, template),
          behavioral: this.generateBehavioralProperties(template),
          semantic: this.generateSemanticProperties(template),
          accessibility: this.generateAccessibilityProperties(template),
          responsive: this.generateResponsiveProperties()
        },
        variants: this.generateVariants(template),
        composition: {
          allowedChildren: [],
          requiredChildren: [],
          layoutConstraints: []
        },
        metadata: {
          complexity: Math.floor(Math.random() * 5) + 1,
          reusability: Math.floor(Math.random() * 5) + 1,
          accessibility: Math.floor(Math.random() * 5) + 1,
          performance: Math.floor(Math.random() * 5) + 1,
          popularity: Math.floor(Math.random() * 100) + 1,
          lastUpdated: new Date(),
          sourceUrl: source.url
        }
      };

      atoms.push(atom);
    });

    return atoms;
  }

  private async extractComponentsFromSource(source: StyleGuideSource, atoms: MinedAtomSchema[]): Promise<ComponentSchema[]> {
    // Simulate component extraction
    const components: ComponentSchema[] = [];

    const componentTemplates = [
      { name: 'Form Section', atoms: ['input-field', 'button'], category: 'form' },
      { name: 'Data Display Card', atoms: ['card', 'progress-bar'], category: 'display' },
      { name: 'Navigation Header', atoms: ['navigation', 'button'], category: 'navigation' },
      { name: 'Modal Dialog', atoms: ['modal', 'button'], category: 'overlay' },
      { name: 'Data Table View', atoms: ['data-table', 'button'], category: 'data' }
    ];

    componentTemplates.forEach((template, index) => {
      const component: ComponentSchema = {
        id: `${source.name.toLowerCase()}-${template.name.toLowerCase().replace(' ', '-')}`,
        name: template.name,
        category: template.category,
        description: `A ${template.name} component mined from ${source.name}`,
        purpose: `Provides ${template.category} functionality`,
        atoms: template.atoms.map((atomId, i) => ({
          id: `${template.name.toLowerCase()}-atom-${i}`,
          atomId: atomId,
          position: {
            row: Math.floor(i / 2),
            col: i % 2,
            width: 6,
            height: 1,
            zIndex: i
          },
          configuration: {
            overrides: {}
          },
          connections: {
            inputs: [],
            outputs: [],
            events: []
          }
        })),
        layout: {
          type: 'vertical',
          constraints: [],
          responsive: this.generateResponsiveProperties()
        },
        dataFlow: {
          inputs: [],
          outputs: [],
          transformations: [],
          validation: []
        },
        interactions: {
          events: [],
          stateManagement: {
            initialState: {},
            reducers: [],
            effects: [],
            selectors: []
          },
          accessibility: this.generateAccessibilityProperties({ name: template.name, category: template.category, type: 'interactive' })
        },
        metadata: {
          complexity: template.atoms.length,
          reusability: Math.floor(Math.random() * 5) + 1,
          performance: Math.floor(Math.random() * 5) + 1,
          accessibility: Math.floor(Math.random() * 5) + 1,
          atomsCount: template.atoms.length,
          estimatedDevTime: template.atoms.length * 15,
          popularity: Math.floor(Math.random() * 100) + 1
        }
      };

      components.push(component);
    });

    return components;
  }

  private generateVisualProperties(sourceName: string, template: any): VisualProperties {
    const baseColors = {
      'Material Design': { primary: '#6200ee', secondary: '#03dac6' },
      'Ant Design': { primary: '#1890ff', secondary: '#52c41a' },
      'Chakra UI': { primary: '#319795', secondary: '#38b2ac' },
      'IBM Carbon': { primary: '#0f62fe', secondary: '#198038' },
      'Atlassian Design System': { primary: '#0052cc', secondary: '#36b37e' }
    };

    const colors = baseColors[sourceName as keyof typeof baseColors] || baseColors['Material Design'];

    return {
      dimensions: {
        minWidth: 40,
        maxWidth: 400,
        minHeight: 24,
        maxHeight: 200
      },
      spacing: {
        padding: { top: 8, right: 16, bottom: 8, left: 16 },
        margin: { top: 0, right: 0, bottom: 16, left: 0 }
      },
      typography: {
        fontFamily: ['system-ui', '-apple-system', 'sans-serif'],
        fontSize: { base: 14, scale: 1.2, unit: 'px' },
        fontWeight: { regular: 400, medium: 500, bold: 600, extraBold: 700 },
        lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 }
      },
      colors: {
        background: { default: '#ffffff', variants: { hover: '#f5f5f5', active: '#e0e0e0' } },
        foreground: { default: '#000000', variants: { muted: '#666666' } },
        border: { default: '#e0e0e0', variants: { focus: colors.primary } }
      },
      border: {
        width: { thin: 1, medium: 2, thick: 3 },
        style: { solid: 'solid', dashed: 'dashed', dotted: 'dotted' },
        radius: { none: 0, small: 4, medium: 8, large: 12, full: 9999 }
      },
      effects: {
        transition: { property: 'all', duration: 200, timing: 'ease-in-out' }
      }
    };
  }

  private generateBehavioralProperties(template: any): BehavioralProperties {
    return {
      interactions: {
        hover: { backgroundColor: '#f5f5f5' },
        focus: { borderColor: '#007acc', shadow: '0 0 0 2px rgba(0,122,204,0.2)' },
        active: { backgroundColor: '#e0e0e0' },
        disabled: { opacity: 0.5, cursor: 'not-allowed' }
      },
      stateManagement: {
        defaultState: {},
        stateTransitions: [],
        validation: []
      },
      events: {
        onClick: { type: 'sync', action: 'handleClick', parameters: {} },
        onChange: { type: 'sync', action: 'handleChange', parameters: {} }
      },
      dataBinding: {
        updateStrategy: 'immediate'
      }
    };
  }

  private generateSemanticProperties(template: any): SemanticProperties {
    return {
      '@context': 'https://schema.org',
      '@type': 'UIComponent',
      name: template.name,
      description: `A ${template.name} component`,
      purpose: `Provides ${template.category} functionality`,
      category: template.category,
      domain: ['web-development', 'ui-design'],
      keywords: [template.name.toLowerCase(), template.category],
      relatedConcepts: [template.category, 'user-interface'],
      usage: [{
        scenario: 'web-application',
        frequency: 0.8,
        userType: 'developer',
        deviceType: 'desktop',
        accessibilityNeeds: []
      }]
    };
  }

  private generateAccessibilityProperties(template: any): AccessibilityProperties {
    return {
      aria: {
        role: template.category === 'button' ? 'button' : undefined,
        label: template.name
      },
      keyboard: {
        tabIndex: 0,
        keyHandlers: [],
        focusManagement: {
          autoFocus: false,
          focusTrap: false,
          focusOrder: [],
          returnFocus: false
        }
      },
      screenReader: {
        announceChanges: true,
        liveRegion: 'polite'
      },
      colorContrast: {
        meetsWCAG: true,
        contrastRatio: 4.5,
        recommendations: []
      },
      motion: {
        reducedMotion: true,
        animationDuration: 200,
        prefersReducedMotion: true
      }
    };
  }

  private generateResponsiveProperties(): ResponsiveProperties {
    return {
      breakpoints: {
        mobile: { hidden: false, size: 'small', spacing: 'tight' },
        tablet: { hidden: false, size: 'medium', spacing: 'normal' },
        desktop: { hidden: false, size: 'large', spacing: 'normal' },
        wide: { hidden: false, size: 'large', spacing: 'loose' }
      },
      fluid: {
        enabled: true,
        scaling: 'linear'
      },
      orientation: {
        portrait: { hidden: false, size: 'medium', spacing: 'normal' },
        landscape: { hidden: false, size: 'large', spacing: 'normal' }
      },
      touch: {
        enabled: true,
        gestures: [],
        hapticFeedback: false
      }
    };
  }

  private generateVariants(template: any): AtomVariant[] {
    return [
      {
        name: 'primary',
        condition: '.variant-primary',
        overrides: {
          visual: {
            colors: {
              background: { default: '#007acc' },
              foreground: { default: '#ffffff' }
            }
          }
        },
        metadata: { usage: 0.6, accessibility: 1, popularity: 0.8 }
      },
      {
        name: 'secondary',
        condition: '.variant-secondary',
        overrides: {
          visual: {
            colors: {
              background: { default: '#6c757d' },
              foreground: { default: '#ffffff' }
            }
          }
        },
        metadata: { usage: 0.4, accessibility: 1, popularity: 0.6 }
      }
    ];
  }

  // Component Building from Atom Schemas
  buildComponentFromSchemas(componentSpec: {
    name: string;
    category: string;
    atoms: Array<{ atomId: string; position: any; config?: any }>;
  }): ComponentSchema {
    const atoms: ComponentAtom[] = componentSpec.atoms.map((spec, index) => {
      const atomSchema = this.minedAtomSchemas.get(spec.atomId);
      if (!atomSchema) throw new Error(`Atom ${spec.atomId} not found`);

      return {
        id: `${componentSpec.name.toLowerCase()}-atom-${index}`,
        atomId: spec.atomId,
        position: {
          row: spec.position.row,
          col: spec.position.col,
          width: spec.position.width,
          height: spec.position.height,
          zIndex: index
        },
        configuration: {
          overrides: spec.config?.overrides || {},
          dataBinding: spec.config?.dataBinding
        },
        connections: {
          inputs: spec.config?.connections?.inputs || [],
          outputs: spec.config?.connections?.outputs || [],
          events: spec.config?.connections?.events || []
        }
      };
    });

    return {
      id: `${componentSpec.name.toLowerCase().replace(' ', '-')}-component`,
      name: componentSpec.name,
      category: componentSpec.category,
      description: `A ${componentSpec.name} component built from atom schemas`,
      purpose: `Provides ${componentSpec.category} functionality`,
      atoms,
      layout: {
        type: 'vertical',
        constraints: [],
        responsive: this.generateResponsiveProperties()
      },
      dataFlow: {
        inputs: [],
        outputs: [],
        transformations: [],
        validation: []
      },
      interactions: {
        events: [],
        stateManagement: {
          initialState: {},
          reducers: [],
          effects: [],
          selectors: []
        },
        accessibility: this.generateAccessibilityProperties({ name: componentSpec.name, category: componentSpec.category, type: 'interactive' })
      },
      metadata: {
        complexity: atoms.length,
        reusability: 4,
        performance: 4,
        accessibility: 4,
        atomsCount: atoms.length,
        estimatedDevTime: atoms.length * 20,
        popularity: 50
      }
    };
  }

  // Dashboard Building from Component Schemas
  buildDashboardForAttribute(attribute: typeof SEOPageRankAttributes[0]): DashboardSchema {
    // Create components for this attribute
    const components: DashboardComponent[] = [];

    // Main input component
    components.push({
      id: `${attribute.id}-input`,
      componentId: this.findComponentForAttribute(attribute),
      position: { row: 0, col: 0, width: 8, height: 1 },
      configuration: {
        dataBinding: {
          [attribute.id]: {
            source: { type: 'static' },
            field: attribute.id,
            updateTrigger: 'change'
          }
        }
      },
      connections: {
        inputs: [],
        outputs: [`${attribute.id}-validation`],
        events: []
      }
    });

    // Validation component
    components.push({
      id: `${attribute.id}-validation`,
      componentId: 'validation-display',
      position: { row: 0, col: 8, width: 4, height: 1 },
      configuration: {
        dataBinding: {}
      },
      connections: {
        inputs: [`${attribute.id}-input`],
        outputs: [],
        events: []
      }
    });

    // Preview component
    components.push({
      id: `${attribute.id}-preview`,
      componentId: 'preview-display',
      position: { row: 1, col: 0, width: 12, height: 2 },
      configuration: {
        dataBinding: {}
      },
      connections: {
        inputs: [`${attribute.id}-input`],
        outputs: [],
        events: []
      }
    });

    // Save action component
    components.push({
      id: `${attribute.id}-save`,
      componentId: 'save-action',
      position: { row: 3, col: 8, width: 4, height: 1 },
      configuration: {
        dataBinding: {}
      },
      connections: {
        inputs: [`${attribute.id}-input`],
        outputs: [],
        events: []
      }
    });

    return {
      id: `${attribute.id}-dashboard`,
      name: `${attribute.name} Configuration`,
      category: 'seo',
      description: `Dashboard for configuring ${attribute.name}`,
      purpose: `Customize ${attribute.name}`,
      attribute: attribute.id,
      components,
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
        responsive: this.generateResponsiveProperties()
      },
      dataFlow: {
        attributeInput: attribute.id,
        componentInputs: {},
        componentOutputs: {},
        transformations: [],
        validation: {
          attribute: [],
          components: {}
        }
      },
      ui: {
        theme: 'professional',
        styling: {},
        animations: [],
        accessibility: this.generateAccessibilityProperties(attribute)
      },
      metadata: {
        complexity: 3,
        estimatedTime: 15,
        componentsCount: components.length,
        atomsCount: components.length * 2, // Rough estimate
        dependencies: []
      }
    };
  }

  private findComponentForAttribute(attribute: typeof SEOPageRankAttributes[0]): string {
    // Map attribute types to component IDs
    const typeMap = {
      text: 'text-input-component',
      number: 'number-input-component',
      boolean: 'boolean-input-component',
      select: 'select-input-component',
      array: 'array-input-component',
      object: 'object-input-component'
    };

    return typeMap[attribute.type as keyof typeof typeMap] || 'text-input-component';
  }

  // Workflow Building from Dashboard Schemas
  buildWorkflowFromDashboards(dashboards: DashboardSchema[], category: string): WorkflowSchema {
    const workflowId = `${category}-workflow`;
    const dashboardIds = dashboards.map(d => d.id);

    return {
      id: workflowId,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Configuration Workflow`,
      category,
      description: `Complete workflow for ${category} configuration`,
      dashboards: dashboardIds,
      dataFlow: {
        entryPoint: dashboardIds[0],
        exitPoint: dashboardIds[dashboardIds.length - 1],
        paths: dashboardIds.slice(0, -1).map((fromId, index) => ({
          id: `path-${index}`,
          from: fromId,
          to: dashboardIds[index + 1],
          condition: 'true', // Always proceed to next
          dataMapping: {},
          actions: []
        })),
        globalData: {}
      },
      automation: {
        triggers: [
          {
            type: 'manual',
            config: {},
            description: 'Manual workflow execution'
          }
        ],
        actions: [
          {
            type: 'notification',
            config: { message: 'Configuration completed' },
            condition: 'workflow.completed'
          }
        ],
        schedules: []
      },
      validation: {
        globalRules: [],
        dashboardRules: {}
      },
      metadata: {
        complexity: dashboards.length,
        estimatedTime: dashboards.reduce((sum, d) => sum + d.metadata.estimatedTime, 0),
        dashboardsCount: dashboards.length,
        componentsCount: dashboards.reduce((sum, d) => sum + d.metadata.componentsCount, 0),
        atomsCount: dashboards.reduce((sum, d) => sum + d.metadata.atomsCount, 0)
      }
    };
  }

  // Get all mined schemas
  getMinedAtomSchemas(): Map<string, MinedAtomSchema> {
    return this.minedAtomSchemas;
  }

  getComponentSchemas(): Map<string, ComponentSchema> {
    return this.componentSchemas;
  }

  getDashboardSchemas(): Map<string, DashboardSchema> {
    return this.dashboardSchemas;
  }

  getWorkflowSchemas(): Map<string, WorkflowSchema> {
    return this.workflowSchemas;
  }

  // Generate complete SEO Page Rank system
  async generateSEOPageRankSystem(): Promise<{
    atoms: MinedAtomSchema[];
    components: ComponentSchema[];
    dashboards: DashboardSchema[];
    workflow: WorkflowSchema;
  }> {
    console.log('🎯 Generating complete SEO Page Rank system...');

    // Mine schemas first
    await this.mineSchemasFromStyleGuides();

    // Build dashboards for each SEO attribute
    const dashboards = SEOPageRankAttributes.map(attr => this.buildDashboardForAttribute(attr));
    dashboards.forEach(dashboard => this.dashboardSchemas.set(dashboard.id, dashboard));

    // Build workflow from dashboards
    const workflow = this.buildWorkflowFromDashboards(dashboards, 'seo-page-rank');
    this.workflowSchemas.set(workflow.id, workflow);

    console.log('✅ SEO Page Rank system generated:');
    console.log(`   Atoms: ${this.minedAtomSchemas.size}`);
    console.log(`   Components: ${this.componentSchemas.size}`);
    console.log(`   Dashboards: ${dashboards.length} (one per attribute)`);
    console.log(`   Workflow: 1 complete orchestration`);

    return {
      atoms: Array.from(this.minedAtomSchemas.values()),
      components: Array.from(this.componentSchemas.values()),
      dashboards,
      workflow
    };
  }
}

// React Component for the Schema Mining System
export const SchemaMiningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mining' | 'atoms' | 'components' | 'dashboards' | 'workflows' | 'seo-demo'>('mining');
  const [miningSystem] = useState(() => new SchemaMiningSystem());
  const [minedData, setMinedData] = useState<{
    atoms: MinedAtomSchema[];
    components: ComponentSchema[];
    dashboards: DashboardSchema[];
    workflow: WorkflowSchema;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: 'mining', name: 'Schema Mining', icon: Database },
    { id: 'atoms', name: 'Atom Schemas', icon: Target },
    { id: 'components', name: 'Component Schemas', icon: Layers },
    { id: 'dashboards', name: 'Dashboard Schemas', icon: Grid },
    { id: 'workflows', name: 'Workflow Schemas', icon: Network },
    { id: 'seo-demo', name: 'SEO Page Rank Demo', icon: Search }
  ];

  const handleMining = async () => {
    setIsProcessing(true);
    try {
      await miningSystem.mineSchemasFromStyleGuides();
      setMinedData(null); // Clear previous data
    } catch (error) {
      console.error('Mining failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSEODemo = async () => {
    setIsProcessing(true);
    try {
      const data = await miningSystem.generateSEOPageRankSystem();
      setMinedData(data);
    } catch (error) {
      console.error('SEO demo generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-600" />
            Schema Mining & Component Definition System
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mine schemas → Build components → Create dashboards → Orchestrate workflows
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {miningSystem.getMinedAtomSchemas().size} Atoms Mined
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Layers className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {miningSystem.getComponentSchemas().size} Components Built
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Grid className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">
              {miningSystem.getDashboardSchemas().size} Dashboards Created
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'mining' && (
          <div className="space-y-6">
            {/* Schema Mining */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Schema Mining from Style Guides
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {miningSystem['styleGuideSources'].map((source, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-2">{source.name}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>Category: {source.category.replace('-', ' ')}</div>
                        <div>URL: {source.url}</div>
                        <div>Selectors: {Object.keys(source.selectors).length}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleMining}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mining Schemas...
                    </div>
                  ) : (
                    'Mine Schemas from Style Guides'
                  )}
                </button>
              </div>
            </div>

            {/* Mining Results */}
            {miningSystem.getMinedAtomSchemas().size > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Mining Results</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{miningSystem.getMinedAtomSchemas().size}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Atom Schemas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{miningSystem.getComponentSchemas().size}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Component Schemas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Array.from(miningSystem.getMinedAtomSchemas().values()).reduce((sum, atom) => sum + atom.metadata.popularity, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Popularity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Array.from(miningSystem.getMinedAtomSchemas().values()).reduce((sum, atom) => sum + atom.metadata.complexity, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Complexity</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'atoms' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Mined Atom Schemas ({miningSystem.getMinedAtomSchemas().size})
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {Array.from(miningSystem.getMinedAtomSchemas().values()).map((atom, index) => (
                  <div key={atom.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{atom.name}</h4>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {atom.category}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {atom.type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Source:</span> {atom.source}</div>
                      <div><span className="font-medium">Purpose:</span> {atom.properties.semantic.purpose}</div>
                      <div className="flex justify-between">
                        <span>Complexity: {atom.metadata.complexity}/5</span>
                        <span>Popularity: {atom.metadata.popularity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reusability: {atom.metadata.reusability}/5</span>
                        <span>Accessibility: {atom.metadata.accessibility}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-green-600" />
                Component Schemas ({miningSystem.getComponentSchemas().size})
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {Array.from(miningSystem.getComponentSchemas().values()).map((component, index) => (
                  <div key={component.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{component.name}</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {component.category}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Atoms:</span> {component.atoms.length}</div>
                      <div><span className="font-medium">Layout:</span> {component.layout.type}</div>
                      <div><span className="font-medium">Purpose:</span> {component.purpose}</div>
                      <div className="flex justify-between">
                        <span>Complexity: {component.metadata.complexity}</span>
                        <span>Dev Time: {component.metadata.estimatedDevTime}min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboards' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Grid className="h-5 w-5 text-orange-600" />
                Dashboard Schemas ({miningSystem.getDashboardSchemas().size})
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {Array.from(miningSystem.getDashboardSchemas().values()).map((dashboard, index) => (
                  <div key={dashboard.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{dashboard.name}</h4>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        {dashboard.category}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Purpose:</span> {dashboard.purpose}</div>
                      <div><span className="font-medium">Attribute:</span> {dashboard.attribute}</div>
                      <div><span className="font-medium">Components:</span> {dashboard.components.length}</div>
                      <div><span className="font-medium">Layout:</span> {dashboard.layout.type} ({dashboard.layout.columns} cols)</div>
                      <div className="flex justify-between">
                        <span>Complexity: {dashboard.metadata.complexity}</span>
                        <span>Time: {dashboard.metadata.estimatedTime}min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-600" />
                Workflow Schemas ({miningSystem.getWorkflowSchemas().size})
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {Array.from(miningSystem.getWorkflowSchemas().values()).map((workflow, index) => (
                  <div key={workflow.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{workflow.name}</h4>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {workflow.category}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Dashboards:</span> {workflow.dashboards.length}</div>
                      <div><span className="font-medium">Paths:</span> {workflow.dataFlow.paths.length}</div>
                      <div><span className="font-medium">Triggers:</span> {workflow.automation.triggers.length}</div>
                      <div className="flex justify-between">
                        <span>Complexity: {workflow.metadata.complexity}</span>
                        <span>Total Time: {workflow.metadata.estimatedTime}min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Components: {workflow.metadata.componentsCount}</span>
                        <span>Atoms: {workflow.metadata.atomsCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo-demo' && (
          <div className="space-y-6">
            {/* SEO Page Rank Demo */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                SEO Page Rank Component System Demo
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <h4 className="font-medium mb-2">Complete SEO Page Rank System</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>• 20 SEO attributes with individual dashboards</div>
                    <div>• Each dashboard customizes one attribute</div>
                    <div>• Purpose: "Customize [attribute name]"</div>
                    <div>• Schema separation: Atom → Component → Dashboard → Workflow</div>
                    <div>• Linked schema map for complete component building</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {SEOPageRankAttributes.slice(0, 8).map((attr, index) => (
                    <div key={attr.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-medium text-sm mb-1">{attr.name}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {attr.type} • {attr.category}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {attr.required ? 'Required' : 'Optional'}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGenerateSEODemo}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating SEO System...
                    </div>
                  ) : (
                    'Generate Complete SEO Page Rank System'
                  )}
                </button>
              </div>
            </div>

            {/* SEO Demo Results */}
            {minedData && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-blue-600">{minedData.atoms.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Mined Atoms</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-green-600">{minedData.components.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Built Components</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-orange-600">{minedData.dashboards.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">SEO Dashboards</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-purple-600">1</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Complete Workflow</div>
                  </div>
                </div>

                {/* SEO Dashboard Examples */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">SEO Dashboard Examples</h3>

                  <div className="space-y-4">
                    {minedData.dashboards.slice(0, 5).map((dashboard, index) => (
                      <div key={dashboard.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{dashboard.name}</h4>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {dashboard.attribute}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {dashboard.components.length} components
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Purpose:</strong> {dashboard.purpose}
                        </div>

                        <div className="text-xs text-gray-500">
                          Layout: {dashboard.layout.type} • Complexity: {dashboard.metadata.complexity} • Est. Time: {dashboard.metadata.estimatedTime}min
                        </div>
                      </div>
                    ))}

                    {minedData.dashboards.length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        ... and {minedData.dashboards.length - 5} more SEO dashboards
                      </div>
                    )}
                  </div>
                </div>

                {/* Schema Hierarchy Visualization */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Schema Separation of Concerns</h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3 text-blue-600">ATOM SCHEMAS (Mined from Style Guides)</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                        <pre className="text-sm font-mono">
{`interface MinedAtomSchema {
  properties: {
    visual: { dimensions, spacing, typography, colors, border, effects }
    behavioral: { interactions, stateManagement, events, dataBinding }
    semantic: { @context, @type, purpose, category, keywords }
    accessibility: { aria, keyboard, screenReader, colorContrast, motion }
    responsive: { breakpoints, fluid, orientation, touch }
  }
  variants: AtomVariant[]
  composition: { allowedChildren, requiredChildren, layoutConstraints }
  metadata: { complexity, reusability, accessibility, performance, popularity }
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 text-green-600">COMPONENT SCHEMAS (Composed from Atoms)</h4>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                        <pre className="text-sm font-mono">
{`interface ComponentSchema {
  atoms: ComponentAtom[] // References to atom schemas
  layout: { type, constraints, responsive }
  dataFlow: { inputs, outputs, transformations, validation }
  interactions: { events, stateManagement, accessibility }
  metadata: { complexity, reusability, atomsCount, estimatedDevTime }
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 text-orange-600">DASHBOARD SCHEMAS (Composed from Components)</h4>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded">
                        <pre className="text-sm font-mono">
{`interface DashboardSchema {
  purpose: "Customize [attribute name]" // Core purpose
  attribute: string // The attribute this dashboard customizes
  components: DashboardComponent[] // References to component schemas
  layout: { type, columns, areas, responsive }
  dataFlow: { attributeInput, componentInputs, transformations }
  metadata: { complexity, estimatedTime, componentsCount, atomsCount }
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 text-purple-600">WORKFLOW SCHEMAS (Orchestrate Dashboards)</h4>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
                        <pre className="text-sm font-mono">
{`interface WorkflowSchema {
  dashboards: string[] // Dashboard IDs in execution order
  dataFlow: { entryPoint, exitPoint, paths, globalData }
  automation: { triggers, actions, schedules }
  validation: { globalRules, dashboardRules }
  metadata: { complexity, dashboardsCount, componentsCount, atomsCount }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linked Schema Map */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Linked Schema Map Architecture</h3>

                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                      <h4 className="font-medium mb-2">Dashboard Workflow Component Linked Schema Map</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        A dashboard workflow has a component-linked schema map that can build complete components via schema templates. This creates a hierarchical composition system where each level has clear separation of concerns but maintains linked relationships.
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Schema Templates</h5>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Atom schema templates mined from style guides</li>
                          <li>• Component composition templates</li>
                          <li>• Dashboard layout templates</li>
                          <li>• Workflow orchestration templates</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Linked Relationships</h5>
                        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                          <li>• Parent-child hierarchical links</li>
                          <li>• Multi-link bidirectional relationships</li>
                          <li>• Functional action and data flow connections</li>
                          <li>• Dependency and validation constraints</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Component Building</h5>
                        <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                          <li>• Template-based component generation</li>
                          <li>• Schema-driven property inheritance</li>
                          <li>• Automated layout and styling</li>
                          <li>• Linked validation and interactions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Export the complete system
export {
  SchemaMiningDashboard,
  SchemaMiningSystem,
  SEOPageRankAttributes,
  type MinedAtomSchema,
  type ComponentSchema,
  type DashboardSchema,
  type WorkflowSchema,
  type StyleGuideSource
};

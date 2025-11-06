import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Atom,
  Layers,
  Layout,
  Database,
  Search,
  Zap,
  Brain,
  Globe,
  BarChart3,
  Settings,
  FileText,
  Users,
  TrendingUp,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Plus,
  Minus,
  Edit3,
  Save,
  Play,
  Pause,
  Square,
  RotateCcw,
  ArrowRight,
  GitBranch,
  Workflow,
  Code,
  Palette,
  Wrench,
  Lightbulb,
  Star,
  ThumbsUp,
  ThumbsDown,
  Crown,
  Shield,
  Lock,
  Unlock,
  User,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
  Check,
  AlertTriangle,
  Info,
  Award
} from 'lucide-react';

// Atomic Component System Types
interface AtomicComponent {
  id: string;
  type: 'atom' | 'molecule' | 'organism' | 'template' | 'dashboard';
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  properties: Record<string, any>;
  dependencies: string[]; // IDs of required atoms/molecules
  generatedCode?: string;
  usage: number;
  trustRating: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ComponentCombination {
  id: string;
  name: string;
  description: string;
  inputAtoms: string[]; // Atom IDs
  outputComponent: string; // Component ID
  combinationLogic: string;
  examples: string[];
  successRate: number;
  usage: number;
}

interface DataMiningWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  dataSources: string[];
  miningLogic: {
    scrapingRules: any;
    processingSteps: string[];
    validationRules: any;
  };
  outputFormat: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  recordsGenerated: number;
  qualityScore: number;
}

interface UserOnboardingFlow {
  id: string;
  userId: string;
  status: 'signup' | 'seo_analysis' | 'dashboard_generated' | 'setup_complete';
  seoReport?: {
    currentScore: number;
    potentialScore: number;
    improvements: string[];
    automatedFixes: string[];
  };
  generatedDashboard?: {
    components: string[];
    configuration: any;
    seoScript: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

// Atomic Component Generator Class
class AtomicComponentGenerator {
  private components: Map<string, AtomicComponent> = new Map();
  private combinations: Map<string, ComponentCombination> = new Map();
  private dataMiningWorkflows: Map<string, DataMiningWorkflow> = new Map();
  private onboardingFlows: Map<string, UserOnboardingFlow> = new Map();
  private onUpdateCallbacks: Set<(type: string, data: any) => void> = new Set();

  constructor() {
    this.initializeAtomicComponents();
    this.initializeComponentCombinations();
    this.initializeDataMiningWorkflows();
  }

  private initializeAtomicComponents(): void {
    console.log('🔬 Initializing Atomic Component System...');

    // Base Atoms
    this.createComponent({
      type: 'atom',
      name: 'Text Input',
      category: 'input',
      description: 'Basic text input field',
      properties: {
        placeholder: 'Enter text...',
        type: 'text',
        validation: 'none'
      },
      dependencies: [],
      usage: 150,
      trustRating: 0.98,
      tags: ['input', 'text', 'form']
    });

    this.createComponent({
      type: 'atom',
      name: 'Button',
      category: 'action',
      description: 'Clickable button component',
      properties: {
        text: 'Click me',
        variant: 'primary',
        size: 'medium'
      },
      dependencies: [],
      usage: 200,
      trustRating: 0.97,
      tags: ['action', 'button', 'interactive']
    });

    this.createComponent({
      type: 'atom',
      name: 'Card',
      category: 'layout',
      description: 'Container component for content',
      properties: {
        padding: 'medium',
        shadow: 'small',
        border: true
      },
      dependencies: [],
      usage: 180,
      trustRating: 0.96,
      tags: ['layout', 'container', 'card']
    });

    this.createComponent({
      type: 'atom',
      name: 'SEO Score Display',
      category: 'seo',
      description: 'Displays SEO performance score',
      properties: {
        score: 0,
        maxScore: 100,
        showProgress: true,
        colorScheme: 'green-red'
      },
      dependencies: [],
      usage: 75,
      trustRating: 0.92,
      tags: ['seo', 'score', 'metrics']
    });

    this.createComponent({
      type: 'atom',
      name: 'Data Table',
      category: 'data',
      description: 'Displays tabular data',
      properties: {
        columns: [],
        sortable: true,
        filterable: true,
        pagination: true
      },
      dependencies: [],
      usage: 120,
      trustRating: 0.94,
      tags: ['data', 'table', 'display']
    });

    // Molecule Examples
    this.createComponent({
      type: 'molecule',
      name: 'SEO Settings Form',
      category: 'seo',
      subcategory: 'settings',
      description: 'Form for configuring SEO settings',
      properties: {
        fields: ['title', 'description', 'keywords'],
        validation: true,
        autoSave: false
      },
      dependencies: ['text-input', 'button'],
      usage: 45,
      trustRating: 0.89,
      tags: ['seo', 'settings', 'form']
    });

    this.createComponent({
      type: 'molecule',
      name: 'Report Generator',
      category: 'reports',
      description: 'Generates automated reports',
      properties: {
        reportType: 'seo',
        format: 'pdf',
        schedule: 'weekly'
      },
      dependencies: ['data-table', 'button', 'card'],
      usage: 38,
      trustRating: 0.91,
      tags: ['reports', 'automation', 'export']
    });

    // Dashboard Template
    this.createComponent({
      type: 'dashboard',
      name: 'SEO Management Dashboard',
      category: 'seo',
      description: 'Complete SEO management interface',
      properties: {
        sections: ['overview', 'settings', 'reports', 'analytics'],
        theme: 'light',
        responsive: true
      },
      dependencies: ['seo-score-display', 'seo-settings-form', 'report-generator', 'data-table'],
      usage: 25,
      trustRating: 0.87,
      tags: ['seo', 'dashboard', 'management']
    });
  }

  private initializeComponentCombinations(): void {
    // SEO Dashboard Combinations
    this.createCombination({
      name: 'SEO Atom to Settings Component',
      description: 'Combine SEO atoms into settings component',
      inputAtoms: ['seo-score-display', 'text-input', 'button'],
      outputComponent: 'seo-settings-form',
      combinationLogic: 'Group SEO-related atoms with form validation',
      examples: [
        'SEO Score Display + Text Input + Button = SEO Settings Form',
        'Keyword Input + SEO Score + Save Button = Keyword Optimization Form'
      ],
      successRate: 0.94,
      usage: 45
    });

    this.createCombination({
      name: 'Data Atoms to Report Component',
      description: 'Combine data display atoms into report generator',
      inputAtoms: ['data-table', 'button', 'card'],
      outputComponent: 'report-generator',
      combinationLogic: 'Wrap data table in card with export actions',
      examples: [
        'Data Table + Export Button + Card = Report Generator',
        'Analytics Data + PDF Button + Container = Analytics Report'
      ],
      successRate: 0.91,
      usage: 38
    });

    this.createCombination({
      name: 'SEO Components to Dashboard',
      description: 'Combine SEO components into complete dashboard',
      inputAtoms: ['seo-settings-form', 'report-generator', 'seo-score-display', 'data-table'],
      outputComponent: 'seo-management-dashboard',
      combinationLogic: 'Arrange components in logical dashboard layout',
      examples: [
        'Settings Form + Reports + Score Display + Data Table = SEO Dashboard',
        'All SEO Components + Navigation + Layout = Complete Management Interface'
      ],
      successRate: 0.87,
      usage: 25
    });

    // Other Dashboard Combinations
    this.createCombination({
      name: 'Analytics Dashboard Generation',
      description: 'Generate analytics dashboard from data atoms',
      inputAtoms: ['data-table', 'card', 'button', 'text-input'],
      outputComponent: 'analytics-dashboard',
      combinationLogic: 'Create analytics interface with data visualization',
      examples: [
        'Data Table + Charts + Filters + Export = Analytics Dashboard',
        'Metrics Display + Time Filters + Export Options = Analytics Interface'
      ],
      successRate: 0.89,
      usage: 32
    });
  }

  private initializeDataMiningWorkflows(): void {
    this.createDataMiningWorkflow({
      name: 'SEO Data Mining Workflow',
      description: 'Mine SEO data from websites and search engines',
      category: 'seo',
      dataSources: ['google-search', 'website-crawling', 'seo-tools-api'],
      miningLogic: {
        scrapingRules: {
          selectors: ['title', 'meta[name="description"]', 'h1', 'h2'],
          rateLimit: 100,
          respectRobots: true
        },
        processingSteps: [
          'extract_text_content',
          'calculate_seo_score',
          'identify_issues',
          'generate_recommendations'
        ],
        validationRules: {
          minContentLength: 100,
          requiredTags: ['title', 'description'],
          scoreThreshold: 50
        }
      },
      outputFormat: 'seo-analysis-json',
      status: 'idle',
      recordsGenerated: 0,
      qualityScore: 0
    });

    this.createDataMiningWorkflow({
      name: 'Component Usage Mining',
      description: 'Mine component usage patterns from existing dashboards',
      category: 'components',
      dataSources: ['dashboard-logs', 'user-interactions', 'component-registry'],
      miningLogic: {
        scrapingRules: {
          events: ['component_click', 'dashboard_load', 'component_modify'],
          samplingRate: 0.1
        },
        processingSteps: [
          'analyze_usage_patterns',
          'identify_popular_combinations',
          'calculate_trust_ratings',
          'generate_component_recommendations'
        ],
        validationRules: {
          minUsageCount: 10,
          trustThreshold: 0.7,
          patternConfidence: 0.8
        }
      },
      outputFormat: 'component-patterns-json',
      status: 'idle',
      recordsGenerated: 0,
      qualityScore: 0
    });
  }

  createComponent(componentData: Omit<AtomicComponent, 'id' | 'createdAt' | 'updatedAt'>): string {
    const component: AtomicComponent = {
      id: `${componentData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...componentData
    };

    this.components.set(component.id, component);
    this.notifyUpdate('component_created', component);

    return component.id;
  }

  createCombination(combinationData: Omit<ComponentCombination, 'id'>): string {
    const combination: ComponentCombination = {
      id: `combination-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...combinationData
    };

    this.combinations.set(combination.id, combination);
    this.notifyUpdate('combination_created', combination);

    return combination.id;
  }

  createDataMiningWorkflow(workflowData: Omit<DataMiningWorkflow, 'id'>): string {
    const workflow: DataMiningWorkflow = {
      id: `mining-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...workflowData
    };

    this.dataMiningWorkflows.set(workflow.id, workflow);
    this.notifyUpdate('mining_workflow_created', workflow);

    return workflow.id;
  }

  generateComponentFromAtoms(atomIds: string[], targetType: string, context: any = {}): AtomicComponent | null {
    // Find matching combination
    const matchingCombination = Array.from(this.combinations.values()).find(comb =>
      comb.outputComponent === targetType &&
      atomIds.every(atomId => comb.inputAtoms.includes(atomId))
    );

    if (!matchingCombination) return null;

    // Generate component based on combination logic
    const baseComponent = this.components.get(matchingCombination.outputComponent);
    if (!baseComponent) return null;

    const generatedComponent: AtomicComponent = {
      ...baseComponent,
      id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${baseComponent.name} (Generated)`,
      description: `Auto-generated ${baseComponent.description}`,
      properties: { ...baseComponent.properties, ...context },
      generatedCode: this.generateComponentCode(baseComponent, atomIds, context),
      usage: 1,
      trustRating: matchingCombination.successRate,
      tags: [...baseComponent.tags, 'generated', 'auto'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.components.set(generatedComponent.id, generatedComponent);
    this.notifyUpdate('component_generated', generatedComponent);

    return generatedComponent;
  }

  private generateComponentCode(component: AtomicComponent, atomIds: string[], context: any): string {
    // Generate React/TypeScript code based on component type
    switch (component.category) {
      case 'seo':
        return this.generateSEOComponentCode(component, atomIds, context);
      case 'reports':
        return this.generateReportComponentCode(component, atomIds, context);
      default:
        return `// Generated ${component.type} component
import React from 'react';

export const ${component.name.replace(/\s+/g, '')}: React.FC = () => {
  return (
    <div className="${component.type}-component">
      <h3>${component.name}</h3>
      <p>${component.description}</p>
      {/* Generated properties: ${JSON.stringify(component.properties)} */}
    </div>
  );
};`;
    }
  }

  private generateSEOComponentCode(component: AtomicComponent, atomIds: string[], context: any): string {
    return `// Generated SEO Component
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

export const ${component.name.replace(/\s+/g, '')}: React.FC<{
  siteUrl?: string;
  onScoreUpdate?: (score: number) => void;
}> = ({ siteUrl = '', onScoreUpdate }) => {
  const [seoScore, setSeoScore] = useState(0);
  const [issues, setIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (siteUrl) {
      analyzeSEO(siteUrl);
    }
  }, [siteUrl]);

  const analyzeSEO = async (url: string) => {
    setLoading(true);
    try {
      // Simulated SEO analysis
      const score = Math.floor(Math.random() * 40) + 60;
      const mockIssues = [
        'Missing meta description',
        'H1 tag optimization needed',
        'Image alt tags missing'
      ].slice(0, Math.floor(Math.random() * 3) + 1);

      setSeoScore(score);
      setIssues(mockIssues);
      onScoreUpdate?.(score);
    } catch (error) {
      console.error('SEO analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="seo-component bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          SEO Analysis
        </h3>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
            Auto-Generated
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* SEO Score Display */}
        <div className="text-center">
          <div className={\`text-4xl font-bold \${getScoreColor(seoScore)}\`}>
            {loading ? '...' : seoScore}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">SEO Score</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: \`\${seoScore}%\` }}
          />
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Issues Found ({issues.length})
            </h4>
            {issues.map((issue, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {issue}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => siteUrl && analyzeSEO(siteUrl)}
            disabled={loading || !siteUrl}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? 'Analyzing...' : 'Re-analyze'}
          </button>
          <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            View Report
          </button>
        </div>
      </div>
    </div>
  );
};`;
  }

  private generateReportComponentCode(component: AtomicComponent, atomIds: string[], context: any): string {
    return `// Generated Report Component
import React, { useState } from 'react';
import { FileText, Download, Mail } from 'lucide-react';

export const ${component.name.replace(/\s+/g, '')}: React.FC<{
  data?: any[];
  title?: string;
  onExport?: (format: string) => void;
}> = ({ data = [], title = 'Report', onExport }) => {
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = () => {
    onExport?.(exportFormat);
  };

  return (
    <div className="report-component bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded">
            Auto-Generated
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Report Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Records</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">
              {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + (item.score || 0), 0) / data.length) : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {new Date().toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Generated</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="text-2xl font-bold text-orange-600">PDF</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Format</div>
          </div>
        </div>

        {/* Export Options */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm font-medium">Export Format:</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
            <button className="flex items-center gap-2 border px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              <Mail className="h-4 w-4" />
              Email Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};`;
  }

  startDataMining(workflowId: string): boolean {
    const workflow = this.dataMiningWorkflows.get(workflowId);
    if (!workflow || workflow.status !== 'idle') return false;

    workflow.status = 'running';
    workflow.lastRun = new Date();

    // Simulate data mining process
    this.runDataMiningAsync(workflow);

    this.notifyUpdate('mining_started', workflow);
    return true;
  }

  private async runDataMiningAsync(workflow: DataMiningWorkflow): Promise<void> {
    try {
      // Simulate mining process
      const miningSteps = workflow.miningLogic.processingSteps.length;
      const totalRecords = Math.floor(Math.random() * 1000) + 100;

      for (let i = 0; i < miningSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const stepRecords = Math.floor(totalRecords / miningSteps);
        workflow.recordsGenerated += stepRecords;
      }

      workflow.qualityScore = Math.random() * 0.3 + 0.7; // 0.7-1.0
      workflow.status = 'completed';

    } catch (error) {
      workflow.status = 'failed';
      console.error('Data mining failed:', error);
    }

    this.notifyUpdate('mining_completed', workflow);
  }

  createUserOnboardingFlow(userId: string): string {
    const flow: UserOnboardingFlow = {
      id: `onboarding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      status: 'signup',
      createdAt: new Date()
    };

    this.onboardingFlows.set(flow.id, flow);

    // Start automated onboarding process
    this.processOnboardingFlow(flow);

    this.notifyUpdate('onboarding_created', flow);
    return flow.id;
  }

  private async processOnboardingFlow(flow: UserOnboardingFlow): Promise<void> {
    try {
      // Step 1: SEO Analysis
      flow.status = 'seo_analysis';

      // Generate automated SEO report
      const currentScore = Math.floor(Math.random() * 40) + 30; // 30-70
      const potentialScore = Math.min(95, currentScore + Math.floor(Math.random() * 25) + 10); // +10-35

      const improvements = [
        'Optimize meta descriptions',
        'Improve H1 tag structure',
        'Add alt tags to images',
        'Increase content length',
        'Improve internal linking'
      ].slice(0, Math.floor(Math.random() * 3) + 2);

      const automatedFixes = improvements.map(imp => ({
        issue: imp,
        automated: Math.random() > 0.3, // 70% can be automated
        effort: Math.random() > 0.5 ? 'low' : 'medium'
      }));

      flow.seoReport = {
        currentScore,
        potentialScore,
        improvements,
        automatedFixes: automatedFixes.filter(f => f.automated).map(f => f.issue)
      };

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Generate Dashboard
      flow.status = 'dashboard_generated';

      // Generate SEO dashboard using atomic components
      const seoAtoms = ['seo-score-display', 'text-input', 'button', 'data-table'];
      const dashboard = this.generateComponentFromAtoms(seoAtoms, 'seo-management-dashboard', {
        userId: flow.userId,
        theme: 'auto',
        seoReport: flow.seoReport
      });

      if (dashboard) {
        // Generate SEO script/setup
        const seoScript = this.generateSEOScript(flow.userId, flow.seoReport!);

        flow.generatedDashboard = {
          components: [dashboard.id],
          configuration: dashboard.properties,
          seoScript
        };
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Complete setup
      flow.status = 'setup_complete';
      flow.completedAt = new Date();

      this.notifyUpdate('onboarding_completed', flow);

    } catch (error) {
      console.error('Onboarding flow failed:', error);
      flow.status = 'signup'; // Reset to allow retry
    }
  }

  private generateSEOScript(userId: string, seoReport: any): string {
    return `// Auto-generated SEO Script for User: ${userId}
// Generated: ${new Date().toISOString()}
// SEO Report: Current ${seoReport.currentScore} -> Potential ${seoReport.potentialScore}

(function() {
  'use strict';

  // SEO Optimization Script
  const seoOptimizer = {
    init: function() {
      console.log('🚀 LightDom SEO Optimizer initialized');
      this.analyzePage();
      this.applyOptimizations();
      this.setupMonitoring();
    },

    analyzePage: function() {
      const issues = [];

      // Check title
      const title = document.title;
      if (title.length < 30 || title.length > 60) {
        issues.push('Title length optimization needed');
      }

      // Check meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc || metaDesc.content.length < 120) {
        issues.push('Meta description optimization needed');
      }

      // Check H1 tags
      const h1Tags = document.querySelectorAll('h1');
      if (h1Tags.length === 0) {
        issues.push('Missing H1 tag');
      } else if (h1Tags.length > 1) {
        issues.push('Multiple H1 tags found');
      }

      console.log('📊 SEO Analysis complete. Issues found:', issues.length);
      return issues;
    },

    applyOptimizations: function() {
      // Apply automated fixes based on analysis
      console.log('🔧 Applying automated SEO optimizations...');

      // Add missing meta tags if needed
      if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(viewport);
      }

      // Optimize images without alt tags
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach((img, index) => {
        img.alt = \`Image \${index + 1}\`;
      });

      console.log('✅ Automated optimizations applied');
    },

    setupMonitoring: function() {
      // Monitor SEO performance
      console.log('📈 SEO monitoring enabled');

      // Track page performance
      if ('performance' in window) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
          }, 0);
        });
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => seoOptimizer.init());
  } else {
    seoOptimizer.init();
  }

  // Expose for debugging
  window.lightdomSEO = seoOptimizer;
})();
`;
  }

  getAllComponents(): AtomicComponent[] {
    return Array.from(this.components.values());
  }

  getComponentCombinations(): ComponentCombination[] {
    return Array.from(this.combinations.values());
  }

  getDataMiningWorkflows(): DataMiningWorkflow[] {
    return Array.from(this.dataMiningWorkflows.values());
  }

  getOnboardingFlow(flowId: string): UserOnboardingFlow | undefined {
    return this.onboardingFlows.get(flowId);
  }

  onUpdate(callback: (type: string, data: any) => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => this.onUpdateCallbacks.delete(callback);
  }

  private notifyUpdate(type: string, data: any): void {
    this.onUpdateCallbacks.forEach(callback => callback(type, data));
  }
}

// Global atomic component generator instance
const atomicComponentGenerator = new AtomicComponentGenerator();

// Crawler Prompt Engineering Component
const CrawlerPromptEngineering: React.FC<{
  onWorkflowGenerated?: (workflow: any) => void;
}> = ({ onWorkflowGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedExample, setSelectedExample] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const promptExamples = [
    {
      title: 'E-commerce Product Scraping',
      prompt: 'Create a workflow to scrape product information from e-commerce websites including name, price, description, images, and reviews. Handle pagination and respect robots.txt.',
      category: 'ecommerce'
    },
    {
      title: 'SEO Analysis Crawler',
      prompt: 'Build a crawler that analyzes website SEO performance by extracting titles, meta descriptions, headings, and content. Calculate SEO scores and identify optimization opportunities.',
      category: 'seo'
    },
    {
      title: 'Social Media Monitoring',
      prompt: 'Create a workflow to monitor social media mentions, sentiment analysis, and engagement metrics across multiple platforms. Generate daily reports.',
      category: 'social'
    },
    {
      title: 'News Article Aggregator',
      prompt: 'Build a crawler that aggregates news articles from multiple sources, categorizes them by topic, and removes duplicates. Extract key information and summaries.',
      category: 'news'
    },
    {
      title: 'Real Estate Listings',
      prompt: 'Scrape real estate listings including property details, prices, locations, and images. Handle different listing formats and update frequencies.',
      category: 'real-estate'
    }
  ];

  const generateWorkflowFromPrompt = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate AI prompt processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const workflow = {
        id: `workflow-${Date.now()}`,
        name: `Generated Workflow: ${prompt.slice(0, 30)}...`,
        description: `Auto-generated from prompt: ${prompt}`,
        nodes: [
          {
            id: 'data-source',
            type: 'data_source',
            name: 'Dynamic Data Source',
            position: { x: 100, y: 100 },
            config: { source: 'dynamic', prompt: prompt }
          },
          {
            id: 'processor',
            type: 'data_processor',
            name: 'AI Processor',
            position: { x: 350, y: 100 },
            config: { operation: 'ai_process', prompt: prompt }
          },
          {
            id: 'output',
            type: 'output',
            name: 'Generated Output',
            position: { x: 600, y: 100 },
            config: { format: 'auto', prompt: prompt }
          }
        ],
        connections: [
          { sourceNodeId: 'data-source', sourceOutputId: 'data', targetNodeId: 'processor', targetInputId: 'input' },
          { sourceNodeId: 'processor', sourceOutputId: 'output', targetNodeId: 'output', targetInputId: 'input' }
        ],
        category: 'generated',
        generatedFromPrompt: prompt,
        confidence: Math.random() * 0.3 + 0.7
      };

      setGeneratedWorkflow(workflow);
      onWorkflowGenerated?.(workflow);

    } catch (error) {
      console.error('Workflow generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExample = (example: typeof promptExamples[0]) => {
    setPrompt(example.prompt);
    setSelectedExample(example.title);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Crawler Prompt Engineering</h3>
      </div>

      <div className="space-y-4">
        {/* Examples */}
        <div>
          <label className="block text-sm font-medium mb-2">Quick Start Examples:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {promptExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(example)}
                className={cn(
                  'p-3 text-left border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                  selectedExample === example.title && 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                )}
              >
                <div className="font-medium">{example.title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {example.category}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Describe your scraping workflow:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to scrape and how the workflow should work..."
            className="w-full p-3 border rounded resize-none"
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <div className="flex gap-2">
          <button
            onClick={generateWorkflowFromPrompt}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Workflow
              </>
            )}
          </button>
        </div>

        {/* Generated Workflow Preview */}
        {generatedWorkflow && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Generated Workflow
            </h4>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</div>
                  <div className="font-medium">{generatedWorkflow.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Nodes</div>
                  <div className="font-medium">{generatedWorkflow.nodes.length}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Connections</div>
                  <div className="font-medium">{generatedWorkflow.connections.length}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Confidence</div>
                  <div className="font-medium">{Math.round(generatedWorkflow.confidence * 100)}%</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {generatedWorkflow.description}
              </div>

              <button
                onClick={() => onWorkflowGenerated?.(generatedWorkflow)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Use This Workflow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Data Mining Dashboard
export const DataMiningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mining' | 'components' | 'combinations' | 'onboarding'>('mining');
  const [components, setComponents] = useState<AtomicComponent[]>([]);
  const [combinations, setCombinations] = useState<ComponentCombination[]>([]);
  const [miningWorkflows, setMiningWorkflows] = useState<DataMiningWorkflow[]>([]);
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([]);
  const [generatedComponents, setGeneratedComponents] = useState<AtomicComponent[]>([]);

  useEffect(() => {
    // Initial load
    setComponents(atomicComponentGenerator.getAllComponents());
    setCombinations(atomicComponentGenerator.getComponentCombinations());
    setMiningWorkflows(atomicComponentGenerator.getDataMiningWorkflows());

    // Subscribe to updates
    const unsubscribe = atomicComponentGenerator.onUpdate((type, data) => {
      switch (type) {
        case 'component_created':
        case 'component_generated':
          setComponents(atomicComponentGenerator.getAllComponents());
          break;
        case 'combination_created':
          setCombinations(atomicComponentGenerator.getComponentCombinations());
          break;
        case 'mining_workflow_created':
        case 'mining_started':
        case 'mining_completed':
          setMiningWorkflows(atomicComponentGenerator.getDataMiningWorkflows());
          break;
      }
    });

    return unsubscribe;
  }, []);

  const startDataMining = (workflowId: string) => {
    atomicComponentGenerator.startDataMining(workflowId);
  };

  const generateComponentFromSelection = () => {
    if (selectedAtoms.length < 2) return;

    // Try different combination types
    const possibleTypes = ['seo-settings-form', 'report-generator', 'seo-management-dashboard'];

    for (const targetType of possibleTypes) {
      const generated = atomicComponentGenerator.generateComponentFromAtoms(selectedAtoms, targetType);
      if (generated) {
        setGeneratedComponents(prev => [...prev, generated]);
        break;
      }
    }
  };

  const simulateUserOnboarding = () => {
    const userId = `user-${Date.now()}`;
    atomicComponentGenerator.createUserOnboardingFlow(userId);
  };

  const tabs = [
    { id: 'mining', name: 'Data Mining', icon: Database },
    { id: 'components', name: 'Atomic Components', icon: Atom },
    { id: 'combinations', name: 'Component Combinations', icon: Layers },
    { id: 'onboarding', name: 'User Onboarding', icon: UserPlus }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Data Mining & Component Generation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automated data mining workflows and atomic component generation system
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={simulateUserOnboarding}>
            <UserPlus className="h-4 w-4 mr-2" />
            Simulate User Onboarding
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Atom className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">
              {components.length} Components
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
                ? 'border-blue-600 text-blue-600'
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
            {/* Crawler Prompt Engineering */}
            <CrawlerPromptEngineering />

            {/* Data Mining Workflows */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Data Mining Workflows
              </h3>

              <div className="space-y-4">
                {miningWorkflows.map(workflow => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2 py-1 text-xs rounded-full',
                          workflow.status === 'running' && 'bg-blue-100 text-blue-800',
                          workflow.status === 'completed' && 'bg-green-100 text-green-800',
                          workflow.status === 'failed' && 'bg-red-100 text-red-800',
                          workflow.status === 'idle' && 'bg-gray-100 text-gray-800'
                        )}>
                          {workflow.status}
                        </span>

                        {workflow.status === 'idle' && (
                          <Button
                            onClick={() => startDataMining(workflow.id)}
                            size="sm"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Records:</span> {workflow.recordsGenerated.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Quality:</span> {Math.round(workflow.qualityScore * 100)}%
                      </div>
                      <div>
                        <span className="font-medium">Sources:</span> {workflow.dataSources.length}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {workflow.category}
                      </div>
                    </div>

                    {workflow.status === 'running' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(workflow.recordsGenerated / 1000) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Mining in progress... {workflow.recordsGenerated} records processed
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            {/* Component Selection */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Atomic Component Selection</h3>
                <Button
                  onClick={generateComponentFromSelection}
                  disabled={selectedAtoms.length < 2}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Component
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {components.filter(c => c.type === 'atom').map(component => (
                  <button
                    key={component.id}
                    onClick={() => {
                      setSelectedAtoms(prev =>
                        prev.includes(component.id)
                          ? prev.filter(id => id !== component.id)
                          : [...prev, component.id]
                      );
                    }}
                    className={cn(
                      'p-3 border rounded-lg text-left transition-colors',
                      selectedAtoms.includes(component.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Atom className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-sm">{component.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {component.category}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">{Math.round(component.trustRating * 100)}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Components */}
            {generatedComponents.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Generated Components</h3>
                <div className="space-y-3">
                  {generatedComponents.map(component => (
                    <div key={component.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{component.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                            Generated
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                            {component.type}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {component.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <span>Trust: {Math.round(component.trustRating * 100)}%</span>
                        <span>Usage: {component.usage}</span>
                        <span>Atoms: {component.dependencies.length}</span>
                      </div>

                      {component.generatedCode && (
                        <details className="mt-3">
                          <summary className="text-sm font-medium cursor-pointer">View Generated Code</summary>
                          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                            {component.generatedCode}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'combinations' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {combinations.map(combination => (
                <div key={combination.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{combination.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                        {Math.round(combination.successRate * 100)}% success
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        {combination.usage} uses
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {combination.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-2">Input Atoms:</div>
                      <div className="flex flex-wrap gap-1">
                        {combination.inputAtoms.map((atomId, index) => {
                          const atom = components.find(c => c.id === atomId);
                          return (
                            <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                              {atom?.name || atomId}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Output Component:</div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                        {combination.outputComponent}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Examples:</div>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {combination.examples.map((example, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-0.5 text-gray-400" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-green-600" />
                Automated User Onboarding Flow
              </h3>

              <div className="space-y-4">
                {/* Onboarding Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium mb-2">1. User Signup</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      New user registers and provides initial website information
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium mb-2">2. SEO Analysis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automated SEO analysis identifies improvement opportunities
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Layout className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-2">3. Dashboard Generation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Custom dashboard and SEO optimization script generated
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center pt-4">
                  <Button onClick={simulateUserOnboarding} size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Start Automated Onboarding Demo
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    This will simulate the complete user onboarding flow with automated SEO analysis and dashboard generation
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the atomic component system
export { AtomicComponentGenerator, atomicComponentGenerator, CrawlerPromptEngineering, DataMiningDashboard };

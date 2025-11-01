import React, { useState, useEffect, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Wrench,
  Play,
  Square,
  RotateCcw,
  Upload,
  Download,
  Settings,
  Terminal,
  FileText,
  Code,
  GitBranch,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Layers,
  Cpu,
  Database,
  Globe,
  Shield,
  TestTube,
  Package,
  RefreshCw
} from 'lucide-react';

// Development Tool Types
interface BuildResult {
  id: string;
  type: 'build' | 'test' | 'lint' | 'deploy';
  status: 'running' | 'success' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output: string[];
  errors: string[];
}

interface CodeGenerationTask {
  id: string;
  type: 'component' | 'page' | 'api' | 'test' | 'config';
  name: string;
  template: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  branch: string;
  version: string;
  buildCommand: string;
  deployCommand: string;
  rollbackCommand: string;
  healthCheckUrl: string;
}

interface TestSuite {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'accessibility';
  files: string[];
  status: 'idle' | 'running' | 'passed' | 'failed';
  results?: {
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

const toolVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      status: {
        idle: 'border-outline-variant',
        running: 'border-primary/30 bg-primary-container/10',
        success: 'border-success/30 bg-success-container/10',
        failed: 'border-error/30 bg-error-container/10'
      }
    },
    defaultVariants: {
      status: 'idle'
    }
  }
);

// Development Tools Manager
class DevelopmentToolsManager {
  private builds: BuildResult[] = [];
  private codeGenerationTasks: CodeGenerationTask[] = [];
  private testSuites: TestSuite[] = [];
  private deploymentConfigs: DeploymentConfig[] = [];

  constructor() {
    this.initializeTools();
  }

  private initializeTools(): void {
    // Initialize test suites
    this.testSuites = [
      {
        id: 'unit-tests',
        name: 'Unit Tests',
        type: 'unit',
        files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        status: 'idle'
      },
      {
        id: 'integration-tests',
        name: 'Integration Tests',
        type: 'integration',
        files: ['tests/integration/**/*.test.ts'],
        status: 'idle'
      },
      {
        id: 'e2e-tests',
        name: 'E2E Tests',
        type: 'e2e',
        files: ['tests/e2e/**/*.spec.ts'],
        status: 'idle'
      },
      {
        id: 'performance-tests',
        name: 'Performance Tests',
        type: 'performance',
        files: ['tests/performance/**/*.test.ts'],
        status: 'idle'
      },
      {
        id: 'accessibility-tests',
        name: 'Accessibility Tests',
        type: 'accessibility',
        files: ['tests/accessibility/**/*.test.ts'],
        status: 'idle'
      }
    ];

    // Initialize deployment configs
    this.deploymentConfigs = [
      {
        environment: 'development',
        branch: 'develop',
        version: '1.0.0-dev',
        buildCommand: 'npm run build:dev',
        deployCommand: 'npm run deploy:dev',
        rollbackCommand: 'npm run rollback:dev',
        healthCheckUrl: 'https://dev-api.lightdom.com/health'
      },
      {
        environment: 'staging',
        branch: 'staging',
        version: '1.0.0-staging',
        buildCommand: 'npm run build:staging',
        deployCommand: 'npm run deploy:staging',
        rollbackCommand: 'npm run rollback:staging',
        healthCheckUrl: 'https://staging-api.lightdom.com/health'
      },
      {
        environment: 'production',
        branch: 'main',
        version: '1.0.0',
        buildCommand: 'npm run build:prod',
        deployCommand: 'npm run deploy:prod',
        rollbackCommand: 'npm run rollback:prod',
        healthCheckUrl: 'https://api.lightdom.com/health'
      }
    ];
  }

  // Build and deployment methods
  async runBuild(type: BuildResult['type'], command: string): Promise<BuildResult> {
    const build: BuildResult = {
      id: `build-${Date.now()}`,
      type,
      status: 'running',
      startTime: new Date(),
      output: [],
      errors: []
    };

    this.builds.push(build);

    try {
      // Simulate build process
      console.log(`🚀 Starting ${type} build...`);
      console.log(`Command: ${command}`);

      // Simulate build steps
      await this.simulateBuildSteps(build, type);

      build.status = 'success';
      build.endTime = new Date();
      build.duration = build.endTime.getTime() - build.startTime.getTime();

      console.log(`✅ ${type} build completed successfully in ${build.duration}ms`);

    } catch (error) {
      build.status = 'failed';
      build.endTime = new Date();
      build.duration = build.endTime.getTime() - build.startTime.getTime();
      build.errors.push(error instanceof Error ? error.message : 'Build failed');

      console.error(`❌ ${type} build failed:`, error);
    }

    return build;
  }

  private async simulateBuildSteps(build: BuildResult, type: BuildResult['type']): Promise<void> {
    const steps = this.getBuildSteps(type);

    for (const step of steps) {
      build.output.push(`[${new Date().toISOString()}] ${step}`);
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    }
  }

  private getBuildSteps(type: BuildResult['type']): string[] {
    switch (type) {
      case 'build':
        return [
          'Installing dependencies...',
          'Linting code...',
          'Type checking...',
          'Compiling TypeScript...',
          'Bundling assets...',
          'Optimizing bundle...',
          'Generating sourcemaps...'
        ];
      case 'test':
        return [
          'Setting up test environment...',
          'Running unit tests...',
          'Running integration tests...',
          'Generating coverage report...',
          'Checking test thresholds...'
        ];
      case 'lint':
        return [
          'Checking code style...',
          'Running ESLint...',
          'Running Prettier...',
          'Validating imports...'
        ];
      case 'deploy':
        return [
          'Building production assets...',
          'Running security scan...',
          'Creating deployment package...',
          'Uploading to CDN...',
          'Updating load balancer...',
          'Running health checks...'
        ];
      default:
        return ['Processing...'];
    }
  }

  // Code generation methods
  async generateCode(task: Omit<CodeGenerationTask, 'id' | 'status'>): Promise<CodeGenerationTask> {
    const codeTask: CodeGenerationTask = {
      id: `codegen-${Date.now()}`,
      status: 'running',
      ...task
    };

    this.codeGenerationTasks.push(codeTask);

    try {
      console.log(`🤖 Generating ${task.type}: ${task.name}`);

      // Simulate code generation
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const generatedCode = this.generateCodeFromTemplate(task);
      codeTask.result = generatedCode;
      codeTask.status = 'completed';

      console.log(`✅ Code generation completed for ${task.name}`);

    } catch (error) {
      codeTask.status = 'failed';
      console.error(`❌ Code generation failed for ${task.name}:`, error);
    }

    return codeTask;
  }

  private generateCodeFromTemplate(task: CodeGenerationTask): string {
    const { type, name, template, parameters } = task;

    switch (type) {
      case 'component':
        return `import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const ${name.toLowerCase()}Variants = cva(
  'base-styles',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface ${name}Props extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof ${name.toLowerCase()}Variants> {
  // Add props here
}

export const ${name}: React.FC<${name}Props> = ({
  className,
  variant,
  ...props
}) => {
  return (
    <div className={cn(${name.toLowerCase()}Variants({ variant }), className)} {...props}>
      ${name} Component
    </div>
  );
};`;

      case 'page':
        return `import React from 'react';
import { WorkflowPanel, WorkflowPanelSection } from '@/components/ui';

export const ${name}: React.FC = () => {
  return (
    <div className="space-y-6">
      <WorkflowPanel title="${name}" description="Page description">
        <WorkflowPanelSection>
          <div className="p-8 text-center">
            <h2 className="md3-headline-medium text-on-surface mb-4">${name} Page</h2>
            <p className="md3-body-medium text-on-surface-variant">
              This page was auto-generated using the development tools.
            </p>
          </div>
        </WorkflowPanelSection>
      </WorkflowPanel>
    </div>
  );
};`;

      case 'api':
        return `import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // API logic here
    const data = {
      message: '${name} API endpoint',
      timestamp: new Date().toISOString(),
      parameters
    };

    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}`;

      case 'test':
        return `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<${name} className="custom-class" />);
    const element = screen.getByText('${name}');
    expect(element).toHaveClass('custom-class');
  });
});`;

      default:
        return `// Generated ${type}: ${name}
// Parameters: ${JSON.stringify(parameters, null, 2)}
export const ${name} = ${JSON.stringify(parameters, null, 2)};`;
    }
  }

  // Test execution methods
  async runTestSuite(suiteId: string): Promise<TestSuite> {
    const suite = this.testSuites.find(s => s.id === suiteId);
    if (!suite) {
      throw new Error(`Test suite ${suiteId} not found`);
    }

    suite.status = 'running';

    try {
      console.log(`🧪 Running ${suite.name}...`);

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      // Generate mock results
      const totalTests = suite.files.length * 10; // Assume 10 tests per file
      const passed = Math.floor(totalTests * (0.8 + Math.random() * 0.15));
      const failed = totalTests - passed;
      const skipped = Math.floor(Math.random() * 5);

      suite.status = failed === 0 ? 'passed' : 'failed';
      suite.results = {
        passed,
        failed,
        skipped,
        duration: 2000 + Math.random() * 3000
      };

      console.log(`✅ ${suite.name} completed: ${passed} passed, ${failed} failed`);

    } catch (error) {
      suite.status = 'failed';
      console.error(`❌ ${suite.name} failed:`, error);
    }

    return suite;
  }

  async runAllTests(): Promise<TestSuite[]> {
    console.log('🚀 Running all test suites...');

    for (const suite of this.testSuites) {
      await this.runTestSuite(suite.id);
    }

    const passedSuites = this.testSuites.filter(s => s.status === 'passed').length;
    const failedSuites = this.testSuites.filter(s => s.status === 'failed').length;

    console.log(`📊 Test Results: ${passedSuites} passed, ${failedSuites} failed`);
    return this.testSuites;
  }

  // Getters
  getBuilds(): BuildResult[] {
    return [...this.builds].reverse();
  }

  getCodeGenerationTasks(): CodeGenerationTask[] {
    return [...this.codeGenerationTasks].reverse();
  }

  getTestSuites(): TestSuite[] {
    return [...this.testSuites];
  }

  getDeploymentConfigs(): DeploymentConfig[] {
    return [...this.deploymentConfigs];
  }

  // Statistics
  getStatistics(): {
    totalBuilds: number;
    successfulBuilds: number;
    totalTests: number;
    passedTests: number;
    generatedCode: number;
    activeDeployments: number;
  } {
    const totalBuilds = this.builds.length;
    const successfulBuilds = this.builds.filter(b => b.status === 'success').length;

    const totalTests = this.testSuites.reduce((sum, suite) => sum + (suite.results?.passed || 0) + (suite.results?.failed || 0), 0);
    const passedTests = this.testSuites.reduce((sum, suite) => sum + (suite.results?.passed || 0), 0);

    const generatedCode = this.codeGenerationTasks.filter(t => t.status === 'completed').length;
    const activeDeployments = this.deploymentConfigs.length;

    return {
      totalBuilds,
      successfulBuilds,
      totalTests,
      passedTests,
      generatedCode,
      activeDeployments
    };
  }
}

// Global development tools instance
const devTools = new DevelopmentToolsManager();

// React hooks for development tools
export const useBuildTools = () => {
  const [builds, setBuilds] = useState<BuildResult[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const runBuild = useCallback(async (type: BuildResult['type'], command: string) => {
    setIsBuilding(true);
    try {
      const result = await devTools.runBuild(type, command);
      setBuilds(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 builds
      return result;
    } finally {
      setIsBuilding(false);
    }
  }, []);

  useEffect(() => {
    setBuilds(devTools.getBuilds().slice(0, 10));
  }, []);

  return { builds, runBuild, isBuilding };
};

export const useCodeGeneration = () => {
  const [tasks, setTasks] = useState<CodeGenerationTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = useCallback(async (task: Omit<CodeGenerationTask, 'id' | 'status'>) => {
    setIsGenerating(true);
    try {
      const result = await devTools.generateCode(task);
      setTasks(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 tasks
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    setTasks(devTools.getCodeGenerationTasks().slice(0, 10));
  }, []);

  return { tasks, generateCode, isGenerating };
};

export const useTestRunner = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTestSuite = useCallback(async (suiteId: string) => {
    setIsRunningTests(true);
    try {
      const result = await devTools.runTestSuite(suiteId);
      setTestSuites(prev => prev.map(s => s.id === suiteId ? result : s));
      return result;
    } finally {
      setIsRunningTests(false);
    }
  }, []);

  const runAllTests = useCallback(async () => {
    setIsRunningTests(true);
    try {
      const results = await devTools.runAllTests();
      setTestSuites(results);
      return results;
    } finally {
      setIsRunningTests(false);
    }
  }, []);

  useEffect(() => {
    setTestSuites(devTools.getTestSuites());
  }, []);

  return { testSuites, runTestSuite, runAllTests, isRunningTests };
};

export const useDeploymentTools = () => {
  const [configs, setConfigs] = useState<DeploymentConfig[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const deploy = useCallback(async (config: DeploymentConfig) => {
    setIsDeploying(true);
    try {
      console.log(`🚀 Starting deployment to ${config.environment}...`);

      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log(`✅ Deployment to ${config.environment} completed successfully`);
      return { success: true, config };
    } catch (error) {
      console.error(`❌ Deployment to ${config.environment} failed:`, error);
      return { success: false, config, error };
    } finally {
      setIsDeploying(false);
    }
  }, []);

  useEffect(() => {
    setConfigs(devTools.getDeploymentConfigs());
  }, []);

  return { configs, deploy, isDeploying };
};

export const useDevToolsStats = () => {
  return devTools.getStatistics();
};

// Main Developer Tools Dashboard
export const DeveloperToolsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'build' | 'codegen' | 'testing' | 'deploy'>('overview');

  const { builds, runBuild, isBuilding } = useBuildTools();
  const { tasks, generateCode, isGenerating } = useCodeGeneration();
  const { testSuites, runTestSuite, runAllTests, isRunningTests } = useTestRunner();
  const { configs, deploy, isDeploying } = useDeploymentTools();
  const stats = useDevToolsStats();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'build', name: 'Build & CI/CD', icon: Settings },
    { id: 'codegen', name: 'Code Generation', icon: Code },
    { id: 'testing', name: 'Testing Suite', icon: TestTube },
    { id: 'deploy', name: 'Deployment', icon: Upload }
  ];

  return (
    <div className="min-h-screen bg-surface p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface flex items-center gap-4">
            <Wrench className="h-8 w-8 text-primary" />
            Developer Tools Dashboard
          </h1>
          <p className="md3-body-medium text-on-surface-variant mt-1">
            Comprehensive development automation, testing, and deployment tools
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
              <span className="md3-label-small font-medium">{stats.totalBuilds} Builds</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-success-container text-on-success-container">
              <span className="md3-label-small font-medium">{stats.passedTests} Tests Passed</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-warning-container text-on-warning-container">
              <span className="md3-label-small font-medium">{stats.generatedCode} Files Generated</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container">
              <span className="md3-label-small font-medium">{stats.activeDeployments} Environments</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="md3-label-small text-on-surface-variant">Build Success Rate</div>
            <div className="md3-label-medium text-success font-medium">
              {stats.totalBuilds > 0 ? Math.round((stats.successfulBuilds / stats.totalBuilds) * 100) : 0}%
            </div>
          </div>
          <div className="text-right">
            <div className="md3-label-small text-on-surface-variant">Test Coverage</div>
            <div className="md3-label-medium text-primary font-medium">
              {stats.totalTests > 0 ? Math.round((stats.passedTests / stats.totalTests) * 100) : 0}%
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-outline bg-surface px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="md3-label-medium font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="space-y-6">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="rounded-3xl border border-outline bg-surface p-6 text-center">
                <Terminal className="h-12 w-12 text-primary mx-auto mb-3" />
                <div className="md3-headline-small text-on-surface font-semibold mb-1">
                  {stats.totalBuilds}
                </div>
                <div className="md3-body-small text-on-surface-variant">Total Builds</div>
              </div>

              <div className="rounded-3xl border border-outline bg-surface p-6 text-center">
                <TestTube className="h-12 w-12 text-success mx-auto mb-3" />
                <div className="md3-headline-small text-on-surface font-semibold mb-1">
                  {stats.passedTests}
                </div>
                <div className="md3-body-small text-on-surface-variant">Tests Passed</div>
              </div>

              <div className="rounded-3xl border border-outline bg-surface p-6 text-center">
                <Code className="h-12 w-12 text-warning mx-auto mb-3" />
                <div className="md3-headline-small text-on-surface font-semibold mb-1">
                  {stats.generatedCode}
                </div>
                <div className="md3-body-small text-on-surface-variant">Code Files Generated</div>
              </div>

              <div className="rounded-3xl border border-outline bg-surface p-6 text-center">
                <Upload className="h-12 w-12 text-tertiary mx-auto mb-3" />
                <div className="md3-headline-small text-on-surface font-semibold mb-1">
                  {stats.activeDeployments}
                </div>
                <div className="md3-body-small text-on-surface-variant">Active Deployments</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Recent Builds</h3>
                <div className="space-y-3">
                  {builds.slice(0, 5).map(build => (
                    <div key={build.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          build.status === 'success' && 'bg-success',
                          build.status === 'failed' && 'bg-error',
                          build.status === 'running' && 'bg-primary animate-pulse'
                        )} />
                        <div>
                          <div className="md3-body-medium text-on-surface font-medium capitalize">
                            {build.type} Build
                          </div>
                          <div className="md3-body-small text-on-surface-variant">
                            {build.duration ? `${Math.round(build.duration / 1000)}s` : 'Running...'}
                          </div>
                        </div>
                      </div>
                      <div className="md3-label-small text-on-surface-variant">
                        {build.startTime.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Test Results</h3>
                <div className="space-y-3">
                  {testSuites.map(suite => (
                    <div key={suite.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          suite.status === 'passed' && 'bg-success',
                          suite.status === 'failed' && 'bg-error',
                          suite.status === 'running' && 'bg-primary animate-pulse',
                          suite.status === 'idle' && 'bg-outline-variant'
                        )} />
                        <div>
                          <div className="md3-body-medium text-on-surface font-medium">
                            {suite.name}
                          </div>
                          <div className="md3-body-small text-on-surface-variant capitalize">
                            {suite.type} Tests
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {suite.results && (
                          <div className="md3-label-small text-on-surface-variant">
                            {suite.results.passed}/{suite.results.passed + suite.results.failed} passed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Build & CI/CD */}
        {activeTab === 'build' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Build Tools</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => runBuild('build', 'npm run build')}
                    disabled={isBuilding}
                    className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-left"
                  >
                    <div className="md3-title-small text-on-surface mb-2">Production Build</div>
                    <div className="md3-body-small text-on-surface-variant">
                      Create optimized production bundle
                    </div>
                  </button>

                  <button
                    onClick={() => runBuild('test', 'npm run test')}
                    disabled={isBuilding}
                    className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-left"
                  >
                    <div className="md3-title-small text-on-surface mb-2">Run Tests</div>
                    <div className="md3-body-small text-on-surface-variant">
                      Execute complete test suite
                    </div>
                  </button>

                  <button
                    onClick={() => runBuild('lint', 'npm run lint')}
                    disabled={isBuilding}
                    className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-left"
                  >
                    <div className="md3-title-small text-on-surface mb-2">Code Linting</div>
                    <div className="md3-body-small text-on-surface-variant">
                      Check code quality and style
                    </div>
                  </button>

                  <button
                    onClick={() => runBuild('deploy', 'npm run deploy')}
                    disabled={isBuilding}
                    className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-left"
                  >
                    <div className="md3-title-small text-on-surface mb-2">Deploy Application</div>
                    <div className="md3-body-small text-on-surface-variant">
                      Deploy to production environment
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Build History</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {builds.map(build => (
                    <div key={build.id} className="p-4 rounded-2xl border border-outline bg-surface-container">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            build.status === 'success' && 'bg-success',
                            build.status === 'failed' && 'bg-error',
                            build.status === 'running' && 'bg-primary animate-pulse'
                          )} />
                          <span className="md3-title-small text-on-surface font-medium capitalize">
                            {build.type} Build
                          </span>
                        </div>
                        <span className="md3-label-small text-on-surface-variant">
                          {build.startTime.toLocaleTimeString()}
                        </span>
                      </div>

                      {build.duration && (
                        <div className="md3-body-small text-on-surface-variant mb-2">
                          Duration: {Math.round(build.duration / 1000)}s
                        </div>
                      )}

                      {build.output.length > 0 && (
                        <details className="mt-2">
                          <summary className="md3-label-small text-primary cursor-pointer">
                            View Output ({build.output.length} steps)
                          </summary>
                          <div className="mt-2 p-2 bg-surface rounded text-xs font-mono max-h-32 overflow-y-auto">
                            {build.output.slice(-5).map((line, index) => (
                              <div key={index} className="text-on-surface-variant">{line}</div>
                            ))}
                          </div>
                        </details>
                      )}

                      {build.errors.length > 0 && (
                        <div className="mt-2 p-2 bg-error-container/10 rounded border border-error/20">
                          <div className="md3-label-small text-error mb-1">Errors:</div>
                          {build.errors.map((error, index) => (
                            <div key={index} className="md3-body-small text-error">{error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Generation */}
        {activeTab === 'codegen' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Code Generation Tools</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      onClick={() => generateCode({
                        type: 'component',
                        name: 'CustomComponent',
                        template: 'md3-component',
                        parameters: { variant: 'default', interactive: true }
                      })}
                      disabled={isGenerating}
                      className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-left"
                    >
                      <div className="md3-title-small text-on-surface mb-2">Generate Component</div>
                      <div className="md3-body-small text-on-surface-variant">
                        Create MD3-compliant React component
                      </div>
                    </button>

                    <button
                      onClick={() => generateCode({
                        type: 'page',
                        name: 'DashboardPage',
                        template: 'dashboard-page',
                        parameters: { title: 'Analytics Dashboard', features: ['charts', 'metrics'] }
                      })}
                      disabled={isGenerating}
                      className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-left"
                    >
                      <div className="md3-title-small text-on-surface mb-2">Generate Page</div>
                      <div className="md3-body-small text-on-surface-variant">
                        Create dashboard page with routing
                      </div>
                    </button>

                    <button
                      onClick={() => generateCode({
                        type: 'api',
                        name: 'userApi',
                        template: 'nextjs-api',
                        parameters: { method: 'GET', auth: true }
                      })}
                      disabled={isGenerating}
                      className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-left"
                    >
                      <div className="md3-title-small text-on-surface mb-2">Generate API</div>
                      <div className="md3-body-small text-on-surface-variant">
                        Create Next.js API endpoint
                      </div>
                    </button>

                    <button
                      onClick={() => generateCode({
                        type: 'test',
                        name: 'ComponentTest',
                        template: 'react-testing-library',
                        parameters: { component: 'Button', scenarios: ['render', 'interaction'] }
                      })}
                      disabled={isGenerating}
                      className="p-4 rounded-2xl border border-outline bg-surface hover:border-primary transition-colors text-left"
                    >
                      <div className="md3-title-small text-on-surface mb-2">Generate Tests</div>
                      <div className="md3-body-small text-on-surface-variant">
                        Create comprehensive test suite
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Generated Code History</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasks.map(task => (
                    <div key={task.id} className="p-4 rounded-2xl border border-outline bg-surface-container">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            task.status === 'completed' && 'bg-success',
                            task.status === 'failed' && 'bg-error',
                            task.status === 'running' && 'bg-primary animate-pulse'
                          )} />
                          <span className="md3-title-small text-on-surface font-medium">
                            {task.name}
                          </span>
                        </div>
                        <span className="md3-label-small text-on-surface-variant capitalize">
                          {task.type}
                        </span>
                      </div>

                      <div className="md3-body-small text-on-surface-variant mb-2">
                        Template: {task.template}
                      </div>

                      {task.result && (
                        <details className="mt-2">
                          <summary className="md3-label-small text-primary cursor-pointer">
                            View Generated Code
                          </summary>
                          <div className="mt-2 p-2 bg-surface rounded text-xs font-mono max-h-32 overflow-y-auto">
                            <pre className="text-on-surface-variant whitespace-pre-wrap">
                              {task.result.substring(0, 500)}...
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Suite */}
        {activeTab === 'testing' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Test Suite</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="md3-title-small text-on-surface">All Tests</span>
                    <button
                      onClick={runAllTests}
                      disabled={isRunningTests}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isRunningTests ? 'Running...' : 'Run All Tests'}
                    </button>
                  </div>

                  {testSuites.map(suite => (
                    <div key={suite.id} className="p-4 rounded-2xl border border-outline bg-surface-container">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="md3-title-small text-on-surface font-medium">{suite.name}</div>
                          <div className="md3-body-small text-on-surface-variant capitalize">{suite.type} Tests</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'px-3 py-1 rounded-full text-sm font-medium',
                            suite.status === 'passed' && 'bg-success/20 text-success',
                            suite.status === 'failed' && 'bg-error/20 text-error',
                            suite.status === 'running' && 'bg-primary/20 text-primary',
                            suite.status === 'idle' && 'bg-outline-variant/20 text-outline-variant'
                          )}>
                            {suite.status.toUpperCase()}
                          </div>
                          <button
                            onClick={() => runTestSuite(suite.id)}
                            disabled={isRunningTests || suite.status === 'running'}
                            className="px-3 py-1 bg-primary text-on-primary rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            Run
                          </button>
                        </div>
                      </div>

                      {suite.results && (
                        <div className="grid gap-4 md:grid-cols-3 mb-3">
                          <div className="text-center p-2 rounded bg-surface">
                            <div className="md3-body-medium text-success font-semibold">{suite.results.passed}</div>
                            <div className="md3-label-small text-on-surface-variant">Passed</div>
                          </div>
                          <div className="text-center p-2 rounded bg-surface">
                            <div className="md3-body-medium text-error font-semibold">{suite.results.failed}</div>
                            <div className="md3-label-small text-on-surface-variant">Failed</div>
                          </div>
                          <div className="text-center p-2 rounded bg-surface">
                            <div className="md3-body-medium text-warning font-semibold">
                              {Math.round(suite.results.duration / 1000)}s
                            </div>
                            <div className="md3-label-small text-on-surface-variant">Duration</div>
                          </div>
                        </div>
                      )}

                      <div className="md3-body-small text-on-surface-variant">
                        Files: {suite.files.length} test files
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-outline bg-surface">
                <h3 className="md3-title-large text-on-surface mb-4">Test Statistics</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-2xl border border-outline bg-surface text-center">
                      <TestTube className="h-10 w-10 text-primary mx-auto mb-2" />
                      <div className="md3-headline-small text-on-surface font-semibold mb-1">
                        {testSuites.reduce((sum, suite) => sum + (suite.results?.passed || 0), 0)}
                      </div>
                      <div className="md3-body-small text-on-surface-variant">Total Passed</div>
                    </div>

                    <div className="p-4 rounded-2xl border border-outline bg-surface text-center">
                      <AlertCircle className="h-10 w-10 text-error mx-auto mb-2" />
                      <div className="md3-headline-small text-on-surface font-semibold mb-1">
                        {testSuites.reduce((sum, suite) => sum + (suite.results?.failed || 0), 0)}
                      </div>
                      <div className="md3-body-small text-on-surface-variant">Total Failed</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="md3-title-small text-on-surface">Coverage by Type</h4>
                    {testSuites.map(suite => (
                      <div key={suite.id} className="flex items-center justify-between">
                        <span className="md3-body-medium text-on-surface capitalize">{suite.type}</span>
                        <div className="flex items-center gap-2">
                          {suite.results && (
                            <>
                              <span className="md3-body-small text-success">
                                {suite.results.passed}
                              </span>
                              <span className="md3-body-small text-on-surface-variant">/</span>
                              <span className="md3-body-small text-on-surface">
                                {suite.results.passed + suite.results.failed}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deployment */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {configs.map(config => (
                <div key={config.environment} className="p-6 rounded-3xl border border-outline bg-surface">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="md3-title-large text-on-surface capitalize">{config.environment}</h3>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      config.environment === 'production' && 'bg-error/20 text-error',
                      config.environment === 'staging' && 'bg-warning/20 text-warning',
                      config.environment === 'development' && 'bg-success/20 text-success'
                    )}>
                      {config.branch}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="md3-body-medium text-on-surface-variant">Version</span>
                      <span className="md3-body-medium text-on-surface font-medium">{config.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="md3-body-medium text-on-surface-variant">Branch</span>
                      <span className="md3-body-medium text-on-surface font-medium">{config.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="md3-body-medium text-on-surface-variant">Health Check</span>
                      <span className="md3-body-medium text-success font-medium">✅ Active</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => deploy(config)}
                      disabled={isDeploying}
                      className="w-full p-3 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isDeploying ? 'Deploying...' : `Deploy to ${config.environment}`}
                    </button>

                    <div className="grid gap-2 md:grid-cols-2">
                      <button className="p-2 border border-outline text-on-surface rounded hover:bg-surface-container transition-colors text-sm">
                        View Logs
                      </button>
                      <button className="p-2 border border-outline text-on-surface rounded hover:bg-surface-container transition-colors text-sm">
                        Rollback
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-3xl border border-outline bg-surface">
              <h3 className="md3-title-large text-on-surface mb-4">Deployment Pipeline</h3>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mb-2">
                    <GitBranch className="h-8 w-8 text-on-success" />
                  </div>
                  <div className="md3-title-small text-on-surface mb-1">Development</div>
                  <div className="md3-body-small text-on-surface-variant">Auto-deploy on push</div>
                </div>

                <div className="text-center">
                  <div className="w-1 h-8 bg-outline rounded"></div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-warning flex items-center justify-center mb-2">
                    <TestTube className="h-8 w-8 text-on-warning" />
                  </div>
                  <div className="md3-title-small text-on-surface mb-1">Testing</div>
                  <div className="md3-body-small text-on-surface-variant">Automated QA suite</div>
                </div>

                <div className="text-center">
                  <div className="w-1 h-8 bg-outline rounded"></div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-tertiary flex items-center justify-center mb-2">
                    <Upload className="h-8 w-8 text-on-tertiary" />
                  </div>
                  <div className="md3-title-small text-on-surface mb-1">Staging</div>
                  <div className="md3-body-small text-on-surface-variant">Pre-production validation</div>
                </div>

                <div className="text-center">
                  <div className="w-1 h-8 bg-outline rounded"></div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-error flex items-center justify-center mb-2">
                    <Shield className="h-8 w-8 text-on-error" />
                  </div>
                  <div className="md3-title-small text-on-surface mb-1">Production</div>
                  <div className="md3-body-small text-on-surface-variant">Live deployment</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-outline bg-surface-container px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="md3-headline-small text-on-surface font-semibold">Developer Tools</div>
              <div className="md3-body-small text-on-surface-variant">Automated development workflow</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="md3-label-medium text-on-surface-variant">CI/CD Pipeline</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-success" />
                <span className="md3-label-medium text-on-surface-variant">Code Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-warning" />
                <span className="md3-label-medium text-on-surface-variant">Test Automation</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-tertiary" />
                <span className="md3-label-medium text-on-surface-variant">Deployment Tools</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">Active Builds</div>
              <div className="md3-label-medium text-primary font-medium">
                {builds.filter(b => b.status === 'running').length}
              </div>
            </div>
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">Running Tests</div>
              <div className="md3-label-medium text-success font-medium">
                {testSuites.filter(s => s.status === 'running').length}
              </div>
            </div>
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">Active Deployments</div>
              <div className="md3-label-medium text-tertiary font-medium">
                {configs.length}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Export the development tools
export { DevelopmentToolsManager, devTools };

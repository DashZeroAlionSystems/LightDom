import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, XCircle, Loader2, TestTube, Zap } from 'lucide-react';

const testSuiteVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      status: {
        idle: 'border-outline-variant',
        running: 'border-primary/50 bg-primary-container/10',
        passed: 'border-success/50 bg-success-container/10',
        failed: 'border-error/50 bg-error-container/10',
        warning: 'border-warning/50 bg-warning-container/10'
      }
    },
    defaultVariants: {
      status: 'idle'
    }
  }
);

const testResultVariants = cva(
  'flex items-start gap-3 rounded-2xl border bg-surface p-4',
  {
    variants: {
      status: {
        passed: 'border-success/30 bg-success-container/20',
        failed: 'border-error/30 bg-error-container/20',
        warning: 'border-warning/30 bg-warning-container/20',
        running: 'border-primary/30 bg-primary-container/20'
      }
    },
    defaultVariants: {
      status: 'passed'
    }
  }
);

export interface TestResult {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  duration?: number;
  error?: string;
  category: 'accessibility' | 'performance' | 'functionality' | 'visual' | 'typescript';
}

export interface DesignSystemQAProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof testSuiteVariants> {
  testResults?: TestResult[];
  onRunTests?: () => void;
  autoRun?: boolean;
  interval?: number;
}

// Mock test results for demonstration
const mockTestResults: TestResult[] = [
  {
    id: '1',
    name: 'Component Accessibility',
    description: 'WCAG AA compliance and ARIA label validation',
    status: 'passed',
    duration: 1250,
    category: 'accessibility'
  },
  {
    id: '2',
    name: 'TypeScript Compilation',
    description: 'Type safety and interface validation',
    status: 'passed',
    duration: 890,
    category: 'typescript'
  },
  {
    id: '3',
    name: 'Component Performance',
    description: 'Render performance and bundle size analysis',
    status: 'warning',
    duration: 2100,
    error: 'Bundle size increased by 2.3%',
    category: 'performance'
  },
  {
    id: '4',
    name: 'Visual Regression',
    description: 'Screenshot comparison and visual consistency',
    status: 'passed',
    duration: 3400,
    category: 'visual'
  },
  {
    id: '5',
    name: 'Interactive Functionality',
    description: 'Component interaction and state management',
    status: 'running',
    category: 'functionality'
  },
  {
    id: '6',
    name: 'Cross-browser Compatibility',
    description: 'Browser support and fallback testing',
    status: 'failed',
    duration: 5200,
    error: 'Safari 14 compatibility issue detected',
    category: 'functionality'
  }
];

const DesignSystemQA: React.FC<DesignSystemQAProps> = ({
  testResults = mockTestResults,
  onRunTests,
  autoRun = false,
  interval = 30000,
  status = 'idle',
  className,
  ...props
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date>(new Date());

  const handleRunTests = async () => {
    setIsRunning(true);
    setLastRun(new Date());

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (onRunTests) {
      await onRunTests();
    }

    setIsRunning(false);
  };

  useEffect(() => {
    if (autoRun) {
      const timer = setInterval(() => {
        handleRunTests();
      }, interval);
      return () => clearInterval(timer);
    }
  }, [autoRun, interval]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed': return <XCircle className="h-5 w-5 text-error" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'running': return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default: return <AlertCircle className="h-5 w-5 text-outline-variant" />;
    }
  };

  const getCategoryIcon = (category: TestResult['category']) => {
    switch (category) {
      case 'accessibility': return '♿';
      case 'performance': return '⚡';
      case 'typescript': return '📝';
      case 'visual': return '👁️';
      case 'functionality': return '🔧';
      default: return '🧪';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'text-success';
      case 'failed': return 'text-error';
      case 'warning': return 'text-warning';
      case 'running': return 'text-primary';
      default: return 'text-on-surface-variant';
    }
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className={cn(testSuiteVariants({ status }), className)} {...props}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
            <TestTube className="h-5 w-5" />
          </div>
          <div>
            <h3 className="md3-title-large text-on-surface">Design System QA</h3>
            <p className="md3-body-medium text-on-surface-variant">
              Automated quality assurance and testing suite
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`inline-flex h-2 w-2 rounded-full ${
            isRunning ? 'bg-primary animate-pulse' :
            status === 'passed' ? 'bg-success' :
            status === 'failed' ? 'bg-error' : 'bg-outline-variant'
          }`} />
          <span className="md3-label-medium text-on-surface-variant capitalize">
            {isRunning ? 'Running tests...' : status}
          </span>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isRunning ? 'Testing...' : 'Run Tests'}
          </button>
        </div>
      </div>

      {/* Test Summary */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-outline bg-surface p-4">
          <div className="md3-label-medium text-on-surface-variant mb-1">Test Success Rate</div>
          <div className="md3-title-large text-on-surface font-semibold">{successRate.toFixed(0)}%</div>
          <div className="md3-body-small text-on-surface-variant">{passedTests} of {totalTests} passed</div>
        </div>
        <div className="rounded-2xl border border-outline bg-surface p-4">
          <div className="md3-label-medium text-on-surface-variant mb-1">Last Test Run</div>
          <div className="md3-title-large text-on-surface font-semibold">
            {lastRun.toLocaleTimeString()}
          </div>
          <div className="md3-body-small text-on-surface-variant">
            {lastRun.toLocaleDateString()}
          </div>
        </div>
        <div className="rounded-2xl border border-outline bg-surface p-4">
          <div className="md3-label-medium text-on-surface-variant mb-1">Auto Testing</div>
          <div className="md3-title-large text-on-surface font-semibold">
            {autoRun ? 'Enabled' : 'Disabled'}
          </div>
          <div className="md3-body-small text-on-surface-variant">
            {autoRun ? `${interval / 1000}s interval` : 'Manual only'}
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="md3-title-small text-on-surface">Test Results</h4>
          <div className="flex gap-2">
            {(['accessibility', 'performance', 'typescript', 'visual', 'functionality'] as const).map(category => (
              <div key={category} className="flex items-center gap-1 rounded-full bg-surface-container px-3 py-1">
                <span className="text-sm">{getCategoryIcon(category)}</span>
                <span className="md3-label-small text-on-surface-variant capitalize">
                  {category}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.map((test) => (
            <div key={test.id} className={cn(testResultVariants({ status: test.status }))}>
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(test.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="md3-title-small text-on-surface font-medium">
                      {test.name}
                    </h5>
                    <p className="md3-body-medium text-on-surface-variant mt-1">
                      {test.description}
                    </p>
                    {test.error && (
                      <p className="md3-body-small text-error mt-2 font-medium">
                        {test.error}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCategoryIcon(test.category)}</span>
                      <span className={cn('md3-label-small capitalize', getStatusColor(test.status))}>
                        {test.status}
                      </span>
                    </div>
                    {test.duration && (
                      <span className="md3-label-small text-on-surface-variant">
                        {test.duration}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Actions */}
      <div className="mt-6 pt-6 border-t border-outline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md3-label-medium text-primary hover:text-primary/80 transition-colors">
              View detailed reports
            </button>
            <button className="md3-label-medium text-primary hover:text-primary/80 transition-colors">
              Export test results
            </button>
            <button className="md3-label-medium text-primary hover:text-primary/80 transition-colors">
              Configure test settings
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="md3-label-small text-on-surface-variant">Next run:</span>
            <span className="md3-label-small text-on-surface">
              {new Date(Date.now() + interval).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemQA;

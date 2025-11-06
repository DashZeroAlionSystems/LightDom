import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Search, BookOpen, Zap, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

const researchPanelVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      status: {
        active: 'border-primary/50 bg-primary-container/10',
        idle: 'border-outline-variant',
        error: 'border-error/50 bg-error-container/10'
      }
    },
    defaultVariants: {
      status: 'idle'
    }
  }
);

const researchItemVariants = cva(
  'flex items-start gap-4 rounded-2xl border border-outline bg-surface p-4 transition-all hover:border-primary/50',
  {
    variants: {
      priority: {
        high: 'border-primary/30 bg-primary-container/5',
        medium: 'border-outline',
        low: 'border-outline-variant bg-surface-container'
      }
    },
    defaultVariants: {
      priority: 'medium'
    }
  }
);

export interface ResearchIntegrationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof researchPanelVariants> {
  activeWorkflows?: string[];
  recentFindings?: Array<{
    id: string;
    title: string;
    summary: string;
    source: string;
    priority: 'high' | 'medium' | 'low';
    applied: boolean;
    timestamp: string;
  }>;
  onResearchTrigger?: (topic: string) => void;
}

const ResearchIntegration: React.FC<ResearchIntegrationProps> = ({
  activeWorkflows = [],
  recentFindings = [],
  status = 'idle',
  onResearchTrigger,
  className,
  ...props
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate research refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const filteredFindings = recentFindings.filter(finding =>
    finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    finding.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mockFindings = [
    {
      id: '1',
      title: 'Mixed Precision Training Breakthrough',
      summary: 'New FP16/FP32 techniques provide 2-3x training speedup with <1% accuracy loss. Automatically applied to all new training jobs.',
      source: 'arXiv: Recent ML Papers',
      priority: 'high' as const,
      applied: true,
      timestamp: '2025-01-15T14:30:00Z'
    },
    {
      id: '2',
      title: 'Advanced Attention Mechanisms',
      summary: 'RoPE and ALiBi positioning improve transformer efficiency by 40%. Integrated into next model architecture update.',
      source: 'NeurIPS 2024 Proceedings',
      priority: 'high' as const,
      applied: false,
      timestamp: '2025-01-15T12:15:00Z'
    },
    {
      id: '3',
      title: 'Quantization-Aware Training',
      summary: 'Improved QAT methods reduce model size by 75% with minimal performance impact. Ready for edge deployment.',
      source: 'TensorFlow Research Blog',
      priority: 'medium' as const,
      applied: true,
      timestamp: '2025-01-15T10:45:00Z'
    },
    {
      id: '4',
      title: 'Federated Learning Updates',
      summary: 'New privacy-preserving techniques improve cross-device training efficiency. Consider for distributed model updates.',
      source: 'Google AI Blog',
      priority: 'low' as const,
      applied: false,
      timestamp: '2025-01-15T09:20:00Z'
    }
  ];

  const displayFindings = recentFindings.length > 0 ? recentFindings : mockFindings;

  return (
    <div className={cn(researchPanelVariants({ status }), className)} {...props}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 className="md3-title-large text-on-surface">Research Integration</h3>
            <p className="md3-body-medium text-on-surface-variant">
              Automated ML research monitoring and application
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`inline-flex h-2 w-2 rounded-full ${
            status === 'active' ? 'bg-primary animate-pulse' :
            status === 'error' ? 'bg-error' : 'bg-outline-variant'
          }`} />
          <span className="md3-label-medium text-on-surface-variant capitalize">
            {status === 'active' ? 'Research Active' : status === 'error' ? 'Error' : 'Idle'}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-outline hover:border-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Active Workflows */}
      {activeWorkflows.length > 0 && (
        <div className="mb-6">
          <h4 className="md3-title-small text-on-surface mb-3">Active Research Workflows</h4>
          <div className="flex flex-wrap gap-2">
            {activeWorkflows.map((workflow, index) => (
              <div key={index} className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1">
                <Zap className="h-3 w-3 text-on-primary-container" />
                <span className="md3-label-small text-on-primary-container">{workflow}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search research findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-outline bg-surface py-3 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Research Findings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="md3-title-small text-on-surface">Recent Research Findings</h4>
          <span className="md3-label-small text-on-surface-variant">
            {displayFindings.length} findings
          </span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredFindings.map((finding) => (
            <div key={finding.id} className={cn(researchItemVariants({ priority: finding.priority }))}>
              <div className="flex-shrink-0">
                {finding.priority === 'high' ? (
                  <TrendingUp className="h-5 w-5 text-primary" />
                ) : finding.priority === 'medium' ? (
                  <BookOpen className="h-5 w-5 text-warning" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-outline-variant" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="md3-title-small text-on-surface font-medium truncate">
                    {finding.title}
                  </h5>
                  {finding.applied && (
                    <div className="flex-shrink-0 rounded-full bg-success px-2 py-1">
                      <span className="md3-label-small text-on-success">Applied</span>
                    </div>
                  )}
                </div>

                <p className="md3-body-medium text-on-surface-variant mt-1 line-clamp-2">
                  {finding.summary}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className="md3-label-small text-on-surface-variant">{finding.source}</span>
                  <span className="md3-label-small text-on-surface-variant">
                    {new Date(finding.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Triggers */}
      <div className="mt-6 pt-6 border-t border-outline">
        <h4 className="md3-title-small text-on-surface mb-3">Research Triggers</h4>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => onResearchTrigger?.('neural-architectures')}
            className="flex items-center gap-2 rounded-lg border border-outline px-3 py-2 text-left hover:border-primary transition-colors"
          >
            <Brain className="h-4 w-4 text-primary" />
            <span className="md3-label-medium text-on-surface">Neural Architectures</span>
          </button>

          <button
            onClick={() => onResearchTrigger?.('training-optimization')}
            className="flex items-center gap-2 rounded-lg border border-outline px-3 py-2 text-left hover:border-primary transition-colors"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="md3-label-medium text-on-surface">Training Optimization</span>
          </button>

          <button
            onClick={() => onResearchTrigger?.('deployment-strategies')}
            className="flex items-center gap-2 rounded-lg border border-outline px-3 py-2 text-left hover:border-primary transition-colors"
          >
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="md3-label-medium text-on-surface">Deployment Strategies</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchIntegration;

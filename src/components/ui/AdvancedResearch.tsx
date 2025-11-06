import React, { useState, useEffect, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Search,
  BookOpen,
  Zap,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image,
  Video,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  Palette,
  Users,
  BarChart3
} from 'lucide-react';

const advancedResearchVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      mode: {
        research: 'border-primary/30 bg-primary-container/10',
        analysis: 'border-success/30 bg-success-container/10',
        synthesis: 'border-warning/30 bg-warning-container/10'
      }
    },
    defaultVariants: {
      mode: 'research'
    }
  }
);

export interface AdvancedResearchProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof advancedResearchVariants> {
  modalities?: ('text' | 'image' | 'video' | 'audio' | 'code' | 'design')[];
  platforms?: ('web' | 'mobile' | 'desktop' | 'tablet')[];
  domains?: ('ui' | 'ux' | 'performance' | 'accessibility' | 'ai' | 'security')[];
  realtime?: boolean;
  collaborative?: boolean;
}

// Multi-modal research data types
interface ResearchFinding {
  id: string;
  modality: 'text' | 'image' | 'video' | 'audio' | 'code' | 'design';
  platform: 'web' | 'mobile' | 'desktop' | 'tablet';
  domain: 'ui' | 'ux' | 'performance' | 'accessibility' | 'ai' | 'security';
  title: string;
  summary: string;
  confidence: number;
  sources: string[];
  tags: string[];
  timestamp: Date;
  novelty: 'high' | 'medium' | 'low';
  impact: 'breakthrough' | 'significant' | 'moderate' | 'incremental';
}

const AdvancedResearch: React.FC<AdvancedResearchProps> = ({
  modalities = ['text', 'image', 'code', 'design'],
  platforms = ['web', 'mobile', 'desktop'],
  domains = ['ui', 'ux', 'performance', 'accessibility'],
  realtime = true,
  collaborative = true,
  mode = 'research',
  className,
  ...props
}) => {
  const [findings, setFindings] = useState<ResearchFinding[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    modality: [] as string[],
    platform: [] as string[],
    domain: [] as string[]
  });
  const [researchProgress, setResearchProgress] = useState(0);

  // Simulated research data
  const mockFindings: ResearchFinding[] = [
    {
      id: '1',
      modality: 'design',
      platform: 'mobile',
      domain: 'ux',
      title: 'Gesture-Based Navigation Patterns',
      summary: 'New swipe gesture patterns emerging in mobile apps, improving navigation efficiency by 40%',
      confidence: 0.92,
      sources: ['NN/g UX Research', 'Mobile Design Trends 2025'],
      tags: ['mobile', 'gestures', 'navigation', 'efficiency'],
      timestamp: new Date(),
      novelty: 'high',
      impact: 'significant'
    },
    {
      id: '2',
      modality: 'code',
      platform: 'web',
      domain: 'performance',
      title: 'WebAssembly Integration Breakthrough',
      summary: 'WASM modules now achieving near-native performance for complex computations',
      confidence: 0.88,
      sources: ['Web Performance Working Group', 'Chrome Dev Summit'],
      tags: ['webassembly', 'performance', 'computation', 'optimization'],
      timestamp: new Date(Date.now() - 3600000),
      novelty: 'high',
      impact: 'breakthrough'
    },
    {
      id: '3',
      modality: 'image',
      platform: 'desktop',
      domain: 'ui',
      title: 'Advanced Glassmorphism Techniques',
      summary: 'New CSS techniques for realistic glass effects with improved accessibility',
      confidence: 0.85,
      sources: ['CSS Working Group', 'Design Systems Conference'],
      tags: ['glassmorphism', 'css', 'accessibility', 'visual-effects'],
      timestamp: new Date(Date.now() - 7200000),
      novelty: 'medium',
      impact: 'moderate'
    },
    {
      id: '4',
      modality: 'text',
      platform: 'tablet',
      domain: 'accessibility',
      title: 'AI-Powered Voice Navigation',
      summary: 'Voice commands now support 95% of tablet interactions with improved accuracy',
      confidence: 0.91,
      sources: ['Accessibility Guidelines 2025', 'Voice UX Research'],
      tags: ['voice', 'accessibility', 'ai', 'navigation'],
      timestamp: new Date(Date.now() - 10800000),
      novelty: 'high',
      impact: 'significant'
    },
    {
      id: '5',
      modality: 'video',
      platform: 'mobile',
      domain: 'ai',
      title: 'On-Device ML Processing',
      summary: 'Mobile devices now capable of running complex ML models locally with minimal battery impact',
      confidence: 0.89,
      sources: ['ML Performance Conference', 'Mobile AI Summit'],
      tags: ['mobile', 'machine-learning', 'on-device', 'battery'],
      timestamp: new Date(Date.now() - 14400000),
      novelty: 'high',
      impact: 'breakthrough'
    }
  ];

  // Research simulation
  const performResearch = useCallback(async () => {
    setIsSearching(true);
    setResearchProgress(0);

    // Simulate research progress
    const progressInterval = setInterval(() => {
      setResearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Filter findings based on active configurations
    const filteredFindings = mockFindings.filter(finding =>
      modalities.includes(finding.modality) &&
      platforms.includes(finding.platform) &&
      domains.includes(finding.domain) &&
      (searchQuery === '' ||
       finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       finding.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
       finding.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    setFindings(filteredFindings);
    setIsSearching(false);
    setResearchProgress(100);
  }, [modalities, platforms, domains, searchQuery]);

  useEffect(() => {
    performResearch();
  }, [performResearch]);

  const getModalityIcon = (modality: ResearchFinding['modality']) => {
    switch (modality) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Zap className="h-4 w-4" />;
      case 'code': return <FileText className="h-4 w-4" />;
      case 'design': return <Palette className="h-4 w-4" />;
    }
  };

  const getPlatformIcon = (platform: ResearchFinding['platform']) => {
    switch (platform) {
      case 'web': return <Globe className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'tablet': return <Monitor className="h-4 w-4" />;
    }
  };

  const getDomainColor = (domain: ResearchFinding['domain']) => {
    switch (domain) {
      case 'ui': return 'text-primary';
      case 'ux': return 'text-success';
      case 'performance': return 'text-warning';
      case 'accessibility': return 'text-error';
      case 'ai': return 'text-primary';
      case 'security': return 'text-warning';
    }
  };

  const getNoveltyBadge = (novelty: ResearchFinding['novelty']) => {
    const colors = {
      high: 'bg-primary/20 text-primary border-primary/30',
      medium: 'bg-warning/20 text-warning border-warning/30',
      low: 'bg-outline-variant/20 text-outline-variant border-outline-variant/30'
    };
    return colors[novelty];
  };

  const getImpactBadge = (impact: ResearchFinding['impact']) => {
    const colors = {
      breakthrough: 'bg-success/20 text-success border-success/30',
      significant: 'bg-primary/20 text-primary border-primary/30',
      moderate: 'bg-warning/20 text-warning border-warning/30',
      incremental: 'bg-outline-variant/20 text-outline-variant border-outline-variant/30'
    };
    return colors[impact];
  };

  const toggleFilter = (category: keyof typeof activeFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  return (
    <div className={cn(advancedResearchVariants({ mode }), className)} {...props}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            mode === 'research' ? 'bg-primary text-on-primary' :
            mode === 'analysis' ? 'bg-success text-on-success' :
            'bg-warning text-on-warning'
          )}>
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 className="md3-title-large text-on-surface">Advanced Research System</h3>
            <p className="md3-body-medium text-on-surface-variant">
              Multi-modal research across platforms and domains
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {realtime && (
            <div className="flex items-center gap-2">
              <div className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="md3-label-small text-success">Live Research</span>
            </div>
          )}
          <button
            onClick={performResearch}
            disabled={isSearching}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isSearching ? 'Researching...' : 'Research'}
          </button>
        </div>
      </div>

      {/* Research Progress */}
      {isSearching && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="md3-label-medium text-on-surface">Research Progress</span>
            <span className="md3-label-medium text-on-surface">{Math.round(researchProgress)}%</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${researchProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search research findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-outline bg-surface text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="md3-label-small text-on-surface-variant">Modalities:</span>
            {modalities.map(modality => (
              <button
                key={modality}
                onClick={() => toggleFilter('modality', modality)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  activeFilters.modality.includes(modality)
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface text-on-surface border-outline hover:border-primary'
                )}
              >
                {modality}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Research Findings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="md3-title-small text-on-surface">Research Findings ({findings.length})</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="md3-label-small text-on-surface">Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="md3-label-small text-on-surface">Impact</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {findings.map((finding) => (
            <div key={finding.id} className="flex items-start gap-4 rounded-2xl border border-outline bg-surface p-4 hover:border-primary/50 transition-colors">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {getModalityIcon(finding.modality)}
                  {getPlatformIcon(finding.platform)}
                </div>
                <div className={cn('px-2 py-1 rounded text-xs font-medium', getDomainColor(finding.domain))}>
                  {finding.domain.toUpperCase()}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="md3-title-small text-on-surface font-medium">{finding.title}</h5>
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-1 rounded-full text-xs border', getNoveltyBadge(finding.novelty))}>
                      {finding.novelty}
                    </span>
                    <span className={cn('px-2 py-1 rounded-full text-xs border', getImpactBadge(finding.impact))}>
                      {finding.impact}
                    </span>
                  </div>
                </div>

                <p className="md3-body-medium text-on-surface-variant mb-3">{finding.summary}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span className="md3-label-small text-on-surface-variant">
                        {(finding.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="md3-label-small text-on-surface-variant">
                        {finding.sources.length} sources
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {finding.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-full bg-surface-container text-on-surface text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {findings.length === 0 && !isSearching && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-outline-variant mx-auto mb-4" />
            <h4 className="md3-title-medium text-on-surface mb-2">No Findings Found</h4>
            <p className="md3-body-medium text-on-surface-variant">
              Try adjusting your search terms or research parameters.
            </p>
          </div>
        )}
      </div>

      {/* Research Statistics */}
      <div className="mt-6 pt-6 border-t border-outline">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="md3-title-large text-on-surface font-semibold mb-1">{modalities.length}</div>
            <div className="md3-body-small text-on-surface-variant">Modalities</div>
          </div>
          <div className="text-center">
            <div className="md3-title-large text-on-surface font-semibold mb-1">{platforms.length}</div>
            <div className="md3-body-small text-on-surface-variant">Platforms</div>
          </div>
          <div className="text-center">
            <div className="md3-title-large text-on-surface font-semibold mb-1">{domains.length}</div>
            <div className="md3-body-small text-on-surface-variant">Domains</div>
          </div>
          <div className="text-center">
            <div className="md3-title-large text-on-surface font-semibold mb-1">{findings.length}</div>
            <div className="md3-body-small text-on-surface-variant">Findings</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedResearch;

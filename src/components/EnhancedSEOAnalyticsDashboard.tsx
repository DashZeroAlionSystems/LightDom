/**
 * Enhanced SEO Analytics Dashboard
 * Modern Material Design 3 dashboard with drill-down capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Users,
  Zap,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  SelectOption,
  FormField,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  Spacer,
  Chart
} from '../ui';

interface SEOStats {
  overview: {
    totalPages: number;
    indexedPages: number;
    crawlErrors: number;
    avgLoadTime: number;
    mobileFriendly: number;
    sslEnabled: number;
  };
  keywords: Array<{
    keyword: string;
    position: number;
    change: number;
    volume: number;
    difficulty: number;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  backlinks: Array<{
    url: string;
    domain: string;
    da: number;
    pa: number;
    type: 'dofollow' | 'nofollow';
    status: 'active' | 'broken';
  }>;
  competitors: Array<{
    domain: string;
    score: number;
    keywords: number;
    backlinks: number;
    traffic: number;
  }>;
  performance: {
    coreWebVitals: {
      cls: number;
      fid: number;
      lcp: number;
    };
    pageSpeed: Array<{
      url: string;
      score: number;
      issues: string[];
    }>;
    mobileUsability: {
      score: number;
      issues: string[];
    };
  };
  timeRange: string;
}

const EnhancedSEOAnalyticsDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'keywords' | 'backlinks' | 'competitors' | 'performance'>('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock SEO data - in real implementation, this would come from API
  const [seoStats, setSeoStats] = useState<SEOStats>({
    overview: {
      totalPages: 1247,
      indexedPages: 892,
      crawlErrors: 23,
      avgLoadTime: 2.3,
      mobileFriendly: 94,
      sslEnabled: 98
    },
    keywords: [
      { keyword: 'seo optimization', position: 3, change: 2, volume: 12100, difficulty: 45, impressions: 15420, clicks: 1234, ctr: 8.0 },
      { keyword: 'content marketing', position: 7, change: -1, volume: 8100, difficulty: 52, impressions: 9820, clicks: 785, ctr: 8.0 },
      { keyword: 'search engine optimization', position: 12, change: 5, volume: 27100, difficulty: 38, impressions: 22100, clicks: 1768, ctr: 8.0 },
      { keyword: 'local seo', position: 15, change: 0, volume: 5400, difficulty: 41, impressions: 6780, clicks: 542, ctr: 8.0 },
      { keyword: 'technical seo', position: 8, change: 3, volume: 2900, difficulty: 55, impressions: 4230, clicks: 338, ctr: 8.0 }
    ],
    backlinks: [
      { url: 'https://techcrunch.com/article', domain: 'techcrunch.com', da: 95, pa: 78, type: 'dofollow', status: 'active' },
      { url: 'https://moz.com/blog/seo-guide', domain: 'moz.com', da: 87, pa: 72, type: 'dofollow', status: 'active' },
      { url: 'https://searchengineland.com/seo-tips', domain: 'searchengineland.com', da: 82, pa: 65, type: 'dofollow', status: 'active' },
      { url: 'https://ahrefs.com/blog/seo-strategy', domain: 'ahrefs.com', da: 91, pa: 76, type: 'dofollow', status: 'active' },
      { url: 'https://backlinko.com/seo', domain: 'backlinko.com', da: 89, pa: 74, type: 'dofollow', status: 'active' }
    ],
    competitors: [
      { domain: 'competitor1.com', score: 78, keywords: 1240, backlinks: 3450, traffic: 45200 },
      { domain: 'competitor2.com', score: 82, keywords: 1580, backlinks: 4120, traffic: 52100 },
      { domain: 'competitor3.com', score: 71, keywords: 980, backlinks: 2890, traffic: 38100 },
      { domain: 'competitor4.com', score: 85, keywords: 1920, backlinks: 5230, traffic: 67800 }
    ],
    performance: {
      coreWebVitals: {
        cls: 0.08,
        fid: 85,
        lcp: 1.2
      },
      pageSpeed: [
        { url: '/', score: 92, issues: [] },
        { url: '/blog', score: 88, issues: ['unused-css'] },
        { url: '/contact', score: 95, issues: [] }
      ],
      mobileUsability: {
        score: 94,
        issues: ['clickable-elements-too-close']
      }
    },
    timeRange: '30d'
  });

  const timeRangeOptions: SelectOption[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('performance')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Core Web Vitals</p>
                <p className="text-2xl font-bold text-on-surface">
                  {seoStats.performance.coreWebVitals.cls < 0.1 ? 'Good' : 'Needs Work'}
                </p>
              </div>
              <div className="p-3 bg-primary-container rounded-full">
                <Activity className="w-6 h-6 text-on-primary-container" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>LCP</span>
                <span className={seoStats.performance.coreWebVitals.lcp < 2.5 ? 'text-success' : 'text-warning'}>
                  {seoStats.performance.coreWebVitals.lcp}s
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>FID</span>
                <span className={seoStats.performance.coreWebVitals.fid < 100 ? 'text-success' : 'text-warning'}>
                  {seoStats.performance.coreWebVitals.fid}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('keywords')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Avg Position</p>
                <p className="text-2xl font-bold text-on-surface">
                  {Math.round(seoStats.keywords.reduce((sum, k) => sum + k.position, 0) / seoStats.keywords.length)}
                </p>
              </div>
              <div className="p-3 bg-secondary-container rounded-full">
                <Target className="w-6 h-6 text-on-secondary-container" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-success mr-1" />
                <span className="text-success">+2.3 positions</span>
                <span className="text-on-surface-variant ml-1">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('backlinks')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Domain Authority</p>
                <p className="text-2xl font-bold text-on-surface">72</p>
              </div>
              <div className="p-3 bg-tertiary-container rounded-full">
                <Globe className="w-6 h-6 text-on-tertiary-container" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-success mr-1" />
                <span className="text-success">+5 points</span>
                <span className="text-on-surface-variant ml-1">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('competitors')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Competitive Rank</p>
                <p className="text-2xl font-bold text-on-surface">3rd</p>
              </div>
              <div className="p-3 bg-error-container rounded-full">
                <Users className="w-6 h-6 text-on-error-container" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-success mr-1" />
                <span className="text-success">+1 position</span>
                <span className="text-on-surface-variant ml-1">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Keyword Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart type="line" className="h-64" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart type="bar" className="h-64" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderKeywords = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Keyword Rankings
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                options={[
                  { value: 'all', label: 'All Keywords' },
                  { value: 'improving', label: 'Improving' },
                  { value: 'declining', label: 'Declining' },
                  { value: 'new', label: 'New Keywords' }
                ]}
                placeholder="Filter keywords"
                className="w-48"
              />
              <Button variant="outlined" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoStats.keywords.map((keyword, index) => (
              <div
                key={keyword.keyword}
                className="p-4 border border-outline rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors"
                onClick={() => setSelectedKeyword(keyword.keyword)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-on-surface">{keyword.keyword}</span>
                      <Badge variant={keyword.change > 0 ? 'default' : keyword.change < 0 ? 'destructive' : 'secondary'}>
                        {keyword.change > 0 ? '+' : ''}{keyword.change}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-on-surface-variant">
                      <span>Position: #{keyword.position}</span>
                      <span>Volume: {keyword.volume.toLocaleString()}</span>
                      <span>CTR: {keyword.ctr}%</span>
                      <span>Difficulty: {keyword.difficulty}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-on-surface">
                      {keyword.impressions.toLocaleString()}
                    </div>
                    <div className="text-sm text-on-surface-variant">impressions</div>
                  </div>
                </div>
                {selectedKeyword === keyword.keyword && (
                  <div className="mt-4 pt-4 border-t border-outline">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-on-surface-variant">Clicks</div>
                        <div className="font-bold text-on-surface">{keyword.clicks.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-on-surface-variant">CTR</div>
                        <div className="font-bold text-on-surface">{keyword.ctr}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-on-surface-variant">Competition</div>
                        <div className="font-bold text-on-surface">{keyword.difficulty}/100</div>
                      </div>
                      <div>
                        <div className="text-sm text-on-surface-variant">Search Volume</div>
                        <div className="font-bold text-on-surface">{keyword.volume.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBacklinks = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Backlink Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoStats.backlinks.map((backlink, index) => (
              <div key={backlink.url} className="p-4 border border-outline rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-on-surface">{backlink.domain}</span>
                      <Badge variant={backlink.type === 'dofollow' ? 'default' : 'secondary'}>
                        {backlink.type}
                      </Badge>
                      <Badge variant={backlink.status === 'active' ? 'default' : 'destructive'}>
                        {backlink.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-on-surface-variant mt-1 truncate">
                      {backlink.url}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-on-surface">{backlink.da}</div>
                      <div className="text-xs text-on-surface-variant">DA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-on-surface">{backlink.pa}</div>
                      <div className="text-xs text-on-surface-variant">PA</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompetitors = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Competitive Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoStats.competitors.map((competitor, index) => (
              <div
                key={competitor.domain}
                className={`p-4 border border-outline rounded-lg cursor-pointer transition-colors ${
                  selectedCompetitor === competitor.domain ? 'bg-primary-container border-primary' : 'hover:bg-surface-container-high'
                }`}
                onClick={() => setSelectedCompetitor(
                  selectedCompetitor === competitor.domain ? null : competitor.domain
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-on-surface">{competitor.domain}</div>
                      <div className="text-sm text-on-surface-variant">
                        Score: {competitor.score}/100
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-on-surface">
                      {competitor.traffic.toLocaleString()}
                    </div>
                    <div className="text-sm text-on-surface-variant">monthly traffic</div>
                  </div>
                </div>

                {selectedCompetitor === competitor.domain && (
                  <div className="mt-4 pt-4 border-t border-outline">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-on-surface-variant">Keywords</div>
                        <div className="font-bold text-on-surface">{competitor.keywords.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-on-surface-variant">Backlinks</div>
                        <div className="font-bold text-on-surface">{competitor.backlinks.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-on-surface-variant">Domain Score</div>
                        <div className="font-bold text-on-surface">{competitor.score}/100</div>
                      </div>
                      <div>
                        <div className="text-sm text-on-surface-variant">Traffic</div>
                        <div className="font-bold text-on-surface">{competitor.traffic.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Largest Contentful Paint</span>
                <Badge variant={seoStats.performance.coreWebVitals.lcp < 2.5 ? 'default' : 'destructive'}>
                  {seoStats.performance.coreWebVitals.lcp}s
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">First Input Delay</span>
                <Badge variant={seoStats.performance.coreWebVitals.fid < 100 ? 'default' : 'destructive'}>
                  {seoStats.performance.coreWebVitals.fid}ms
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cumulative Layout Shift</span>
                <Badge variant={seoStats.performance.coreWebVitals.cls < 0.1 ? 'default' : 'destructive'}>
                  {seoStats.performance.coreWebVitals.cls}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile Usability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-on-surface mb-2">
                {seoStats.performance.mobileUsability.score}
              </div>
              <Badge variant={seoStats.performance.mobileUsability.score > 90 ? 'default' : 'destructive'}>
                {seoStats.performance.mobileUsability.score > 90 ? 'Good' : 'Needs Work'}
              </Badge>
              {seoStats.performance.mobileUsability.issues.length > 0 && (
                <div className="mt-4 space-y-2">
                  {seoStats.performance.mobileUsability.issues.map((issue, index) => (
                    <div key={index} className="text-xs text-on-surface-variant">
                      • {issue.replace('-', ' ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Speed Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {seoStats.performance.pageSpeed.map((page, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm truncate flex-1">{page.url}</span>
                  <Badge variant={page.score > 90 ? 'default' : page.score > 70 ? 'secondary' : 'destructive'}>
                    {page.score}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Chart type="area" className="h-64" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">SEO Analytics</h1>
            <p className="text-on-surface-variant mt-1">
              Comprehensive SEO performance monitoring and optimization insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              options={timeRangeOptions}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-40"
            />
            <Button
              variant="outlined"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-1 mb-6 bg-surface-container-high p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'keywords', label: 'Keywords', icon: Search },
            { key: 'backlinks', label: 'Backlinks', icon: Globe },
            { key: 'competitors', label: 'Competitors', icon: Users },
            { key: 'performance', label: 'Performance', icon: Activity }
          ].map((item) => (
            <Button
              key={item.key}
              variant={activeView === item.key ? 'filled' : 'text'}
              onClick={() => setActiveView(item.key as any)}
              className="flex items-center gap-2"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeView === 'overview' && renderOverview()}
        {activeView === 'keywords' && renderKeywords()}
        {activeView === 'backlinks' && renderBacklinks()}
        {activeView === 'competitors' && renderCompetitors()}
        {activeView === 'performance' && renderPerformance()}
      </div>
    </div>
  );
};

export default EnhancedSEOAnalyticsDashboard;

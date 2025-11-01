import React, { useState, useEffect, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  UserPlus,
  User,
  Search,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Globe,
  Target,
  TrendingUp,
  AlertTriangle,
  Download,
  Mail,
  Settings,
  Play,
  RefreshCw,
  Award,
  Star,
  Zap,
  Code,
  FileText,
  Layout,
  Database,
  Brain,
  Eye,
  Edit3,
  Save,
  X
} from 'lucide-react';

// Automated User Onboarding System
interface OnboardingUser {
  id: string;
  email: string;
  websiteUrl: string;
  companyName?: string;
  goals: string[];
  createdAt: Date;
  status: 'analyzing' | 'generating' | 'complete';
}

interface SEOAnalysis {
  currentScore: number;
  potentialScore: number;
  improvements: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    automated: boolean;
    effort: 'low' | 'medium' | 'high';
  }[];
  automatedFixes: string[];
  recommendations: string[];
  timeline: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

interface GeneratedDashboard {
  id: string;
  components: {
    id: string;
    name: string;
    type: string;
    config: any;
    position: { x: number; y: number };
  }[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layout: 'grid' | 'sidebar' | 'full';
  seoScript: string;
  apiKey: string;
  setupInstructions: string[];
}

class AutomatedOnboardingSystem {
  private users: Map<string, OnboardingUser> = new Map();
  private analyses: Map<string, SEOAnalysis> = new Map();
  private dashboards: Map<string, GeneratedDashboard> = new Map();
  private onUpdateCallbacks: Set<(type: string, data: any) => void> = new Set();

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    console.log('🚀 Initializing Automated Onboarding System...');

    // Create sample users for demonstration
    const demoUsers = [
      {
        id: 'user-001',
        email: 'john@techstartup.com',
        websiteUrl: 'https://techstartup.com',
        companyName: 'Tech Startup Inc',
        goals: ['increase_traffic', 'improve_seo', 'generate_leads'],
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'complete'
      },
      {
        id: 'user-002',
        email: 'sarah@ecommerce.com',
        websiteUrl: 'https://ecommerce-store.com',
        companyName: 'E-commerce Store',
        goals: ['boost_sales', 'seo_optimization', 'user_experience'],
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        status: 'analyzing'
      }
    ];

    demoUsers.forEach(user => {
      this.users.set(user.id, user);
      this.generateSEOAnalysis(user.id);
      this.generateDashboard(user.id);
    });

    console.log('✅ Automated Onboarding System initialized');
  }

  createUser(userData: Omit<OnboardingUser, 'id' | 'createdAt' | 'status'>): string {
    const user: OnboardingUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'analyzing',
      ...userData
    };

    this.users.set(user.id, user);
    this.notifyUpdate('user_created', user);

    // Start automated onboarding process
    this.startOnboardingProcess(user.id);

    console.log(`👤 Created user: ${user.email} (${user.websiteUrl})`);
    return user.id;
  }

  private async startOnboardingProcess(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    try {
      // Step 1: SEO Analysis
      await this.performSEOAnalysis(userId);

      // Step 2: Dashboard Generation
      await this.generateUserDashboard(userId);

      // Step 3: Complete onboarding
      user.status = 'complete';
      this.notifyUpdate('onboarding_complete', { userId, user });

      console.log(`✅ Completed onboarding for user: ${user.email}`);

    } catch (error) {
      console.error(`Failed onboarding for user ${userId}:`, error);
      user.status = 'analyzing'; // Reset status on failure
    }
  }

  private async performSEOAnalysis(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    console.log(`🔍 Performing SEO analysis for: ${user.websiteUrl}`);

    // Simulate comprehensive SEO analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    const currentScore = Math.floor(Math.random() * 40) + 35; // 35-75
    const potentialScore = Math.min(95, currentScore + Math.floor(Math.random() * 25) + 15); // +15-40

    const allImprovements = [
      {
        title: 'Optimize Meta Descriptions',
        description: 'Meta descriptions are too long or missing',
        priority: 'high' as const,
        automated: true,
        effort: 'low' as const
      },
      {
        title: 'Improve H1 Tag Structure',
        description: 'H1 tags need better optimization and uniqueness',
        priority: 'high' as const,
        automated: true,
        effort: 'medium' as const
      },
      {
        title: 'Add Alt Tags to Images',
        description: 'Many images are missing alt attributes',
        priority: 'medium' as const,
        automated: true,
        effort: 'low' as const
      },
      {
        title: 'Increase Content Length',
        description: 'Pages need more comprehensive content',
        priority: 'medium' as const,
        automated: false,
        effort: 'high' as const
      },
      {
        title: 'Improve Internal Linking',
        description: 'Internal link structure needs optimization',
        priority: 'low' as const,
        automated: false,
        effort: 'medium' as const
      },
      {
        title: 'Mobile Responsiveness',
        description: 'Mobile user experience improvements needed',
        priority: 'medium' as const,
        automated: false,
        effort: 'high' as const
      },
      {
        title: 'Page Speed Optimization',
        description: 'Loading times need improvement',
        priority: 'high' as const,
        automated: true,
        effort: 'medium' as const
      }
    ];

    // Select 4-6 random improvements
    const selectedImprovements = allImprovements
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 4);

    const automatedFixes = selectedImprovements
      .filter(imp => imp.automated)
      .map(imp => imp.title);

    const recommendations = [
      'Focus on high-priority automated fixes first',
      'Monitor SEO score improvements weekly',
      'Implement content marketing strategy',
      'Regular technical SEO audits',
      'Track keyword performance monthly'
    ];

    const analysis: SEOAnalysis = {
      currentScore,
      potentialScore,
      improvements: selectedImprovements,
      automatedFixes,
      recommendations,
      timeline: {
        immediate: selectedImprovements.filter(i => i.priority === 'high').map(i => i.title),
        shortTerm: selectedImprovements.filter(i => i.priority === 'medium').map(i => i.title),
        longTerm: selectedImprovements.filter(i => i.priority === 'low').map(i => i.title)
      }
    };

    this.analyses.set(userId, analysis);
    this.notifyUpdate('seo_analysis_complete', { userId, analysis });

    console.log(`📊 SEO analysis complete for ${user.websiteUrl}: ${currentScore} → ${potentialScore}`);
  }

  private async generateUserDashboard(userId: string): Promise<void> {
    const user = this.users.get(userId);
    const analysis = this.analyses.get(userId);
    if (!user || !analysis) return;

    console.log(`🎨 Generating dashboard for user: ${user.email}`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate personalized dashboard based on user goals and SEO analysis
    const components = this.generateDashboardComponents(user, analysis);
    const theme = this.generateTheme(user.goals);
    const layout = this.determineLayout(user.goals);

    const dashboard: GeneratedDashboard = {
      id: `dashboard-${userId}`,
      components,
      theme,
      layout,
      seoScript: this.generateCustomSEOScript(user, analysis),
      apiKey: `api_${userId}_${Date.now()}`,
      setupInstructions: this.generateSetupInstructions(user, analysis)
    };

    this.dashboards.set(userId, dashboard);
    this.notifyUpdate('dashboard_generated', { userId, dashboard });

    console.log(`✅ Generated dashboard with ${components.length} components for ${user.email}`);
  }

  private generateDashboardComponents(user: OnboardingUser, analysis: SEOAnalysis): GeneratedDashboard['components'] {
    const components = [];

    // Always include core SEO components
    components.push({
      id: 'seo-overview',
      name: 'SEO Overview',
      type: 'seo_score_display',
      config: {
        currentScore: analysis.currentScore,
        potentialScore: analysis.potentialScore,
        showImprovement: true
      },
      position: { x: 0, y: 0 }
    });

    components.push({
      id: 'seo-improvements',
      name: 'Improvement Opportunities',
      type: 'improvements_list',
      config: {
        improvements: analysis.improvements,
        automatedFixes: analysis.automatedFixes
      },
      position: { x: 1, y: 0 }
    });

    // Add goal-specific components
    if (user.goals.includes('increase_traffic')) {
      components.push({
        id: 'traffic-analytics',
        name: 'Traffic Analytics',
        type: 'traffic_chart',
        config: { timeframe: '30d' },
        position: { x: 0, y: 1 }
      });
    }

    if (user.goals.includes('boost_sales') || user.goals.includes('generate_leads')) {
      components.push({
        id: 'conversion-tracking',
        name: 'Conversion Tracking',
        type: 'conversion_funnel',
        config: { stages: ['visit', 'engage', 'convert'] },
        position: { x: 1, y: 1 }
      });
    }

    if (user.goals.includes('user_experience')) {
      components.push({
        id: 'ux-metrics',
        name: 'UX Metrics',
        type: 'ux_scorecard',
        config: { metrics: ['bounce_rate', 'session_duration', 'pages_per_session'] },
        position: { x: 0, y: 2 }
      });
    }

    // Add reports component
    components.push({
      id: 'seo-reports',
      name: 'SEO Reports',
      type: 'report_generator',
      config: {
        reportTypes: ['weekly', 'monthly'],
        autoGenerate: true
      },
      position: { x: 1, y: 2 }
    });

    return components;
  }

  private generateTheme(goals: string[]): GeneratedDashboard['theme'] {
    // Generate theme based on goals
    if (goals.includes('boost_sales')) {
      return { primary: '#10B981', secondary: '#059669', accent: '#047857' }; // Green theme
    } else if (goals.includes('increase_traffic')) {
      return { primary: '#3B82F6', secondary: '#2563EB', accent: '#1D4ED8' }; // Blue theme
    } else {
      return { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#6D28D9' }; // Purple theme
    }
  }

  private determineLayout(goals: string[]): GeneratedDashboard['layout'] {
    if (goals.includes('boost_sales')) {
      return 'sidebar'; // E-commerce focused
    } else if (goals.includes('increase_traffic')) {
      return 'grid'; // Analytics focused
    } else {
      return 'full'; // Content focused
    }
  }

  private generateCustomSEOScript(user: OnboardingUser, analysis: SEOAnalysis): string {
    return `// Custom SEO Optimization Script for ${user.websiteUrl}
// Generated: ${new Date().toISOString()}
// User: ${user.email}
// Current SEO Score: ${analysis.currentScore}
// Potential Score: ${analysis.potentialScore}

(function() {
  'use strict';

  const lightdomSEO = {
    userId: '${user.id}',
    websiteUrl: '${user.websiteUrl}',
    goals: ${JSON.stringify(user.goals)},

    init: function() {
      console.log('🚀 LightDom SEO Optimizer initialized for ${user.websiteUrl}');
      this.trackAnalytics();
      this.applyAutomatedFixes();
      this.setupMonitoring();
    },

    trackAnalytics: function() {
      // Track SEO performance metrics
      console.log('📊 SEO tracking enabled');

      // Monitor page performance
      if ('performance' in window) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.fetchStart;

            // Send analytics data
            this.sendAnalytics({
              type: 'page_performance',
              loadTime: loadTime,
              url: window.location.href,
              timestamp: new Date().toISOString()
            });
          }, 0);
        });
      }
    },

    applyAutomatedFixes: function() {
      console.log('🔧 Applying automated SEO fixes...');

      // Fix missing meta descriptions
      const metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc || metaDesc.content.length < 50) {
        const autoDesc = this.generateMetaDescription();
        if (autoDesc) {
          if (metaDesc) {
            metaDesc.content = autoDesc;
          } else {
            const newMeta = document.createElement('meta');
            newMeta.name = 'description';
            newMeta.content = autoDesc;
            document.head.appendChild(newMeta);
          }
          console.log('✅ Meta description optimized');
        }
      }

      // Add missing alt tags
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach((img, index) => {
        const altText = this.generateAltText(img);
        if (altText) {
          img.alt = altText;
          console.log(\`✅ Alt tag added to image \${index + 1}\`);
        }
      });

      // Optimize H1 tags
      const h1Tags = document.querySelectorAll('h1');
      if (h1Tags.length === 0) {
        // Try to create H1 from title
        const title = document.title;
        if (title && title.length > 0) {
          const h1 = document.createElement('h1');
          h1.textContent = title;
          h1.style.display = 'none'; // Hidden but accessible
          document.body.insertBefore(h1, document.body.firstChild);
          console.log('✅ H1 tag added');
        }
      }
    },

    generateMetaDescription: function() {
      // Extract meaningful content for meta description
      const paragraphs = document.querySelectorAll('p');
      let content = '';

      for (const p of paragraphs) {
        const text = p.textContent?.trim();
        if (text && text.length > 20) {
          content += text + ' ';
          if (content.length > 120) break;
        }
      }

      if (content.length > 20) {
        return content.substring(0, 155) + '...';
      }

      return document.title + ' - Professional website services and solutions.';
    },

    generateAltText: function(img) {
      // Generate alt text based on image context
      const src = img.src || '';
      const filename = src.split('/').pop()?.split('.')[0] || '';

      // Try to get context from nearby text
      const parent = img.parentElement;
      if (parent) {
        const nearbyText = parent.textContent?.trim();
        if (nearbyText && nearbyText.length > 0) {
          return nearbyText.substring(0, 100);
        }
      }

      // Fallback to filename-based alt text
      if (filename) {
        return filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      return 'Website image';
    },

    setupMonitoring: function() {
      // Monitor SEO improvements
      console.log('📈 SEO monitoring active');

      // Track user interactions for UX insights
      document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'A') {
          this.sendAnalytics({
            type: 'link_click',
            href: target.href,
            text: target.textContent?.trim(),
            timestamp: new Date().toISOString()
          });
        }
      });

      // Periodic SEO score checking
      setInterval(() => {
        this.checkSeoScore();
      }, 300000); // Every 5 minutes
    },

    checkSeoScore: function() {
      // Simulate SEO score monitoring
      const mockScore = ${analysis.currentScore} + Math.floor(Math.random() * 5);
      console.log(\`📊 Current SEO Score: \${mockScore}\`);

      this.sendAnalytics({
        type: 'seo_score_check',
        score: mockScore,
        timestamp: new Date().toISOString()
      });
    },

    sendAnalytics: function(data) {
      // Send data to LightDom analytics
      const payload = {
        userId: this.userId,
        websiteUrl: this.websiteUrl,
        ...data
      };

      // In production, this would send to your analytics endpoint
      console.log('📤 Analytics data:', payload);

      // Simulate sending data
      fetch('https://api.lightdom.com/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {
        // Silently fail in demo
        console.log('📊 Analytics data logged locally');
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => lightdomSEO.init());
  } else {
    lightdomSEO.init();
  }

  // Expose for debugging
  window.lightdomSEO = lightdomSEO;
})();
`;
  }

  private generateSetupInstructions(user: OnboardingUser, analysis: SEOAnalysis): string[] {
    return [
      `1. Add this script to your website's <head> section:`,
      `   <script src="https://cdn.lightdom.com/seo-script-${user.id}.js"></script>`,
      ``,
      `2. Your API key for dashboard access: ${this.dashboards.get(user.id)?.apiKey}`,
      ``,
      `3. Automated fixes applied:`,
      ...analysis.automatedFixes.map(fix => `   ✅ ${fix}`),
      ``,
      `4. Next steps:`,
      ...analysis.timeline.immediate.map(item => `   • ${item} (High Priority)`),
      ...analysis.timeline.shortTerm.map(item => `   • ${item} (Medium Priority)`),
      ``,
      `5. Access your dashboard at: https://dashboard.lightdom.com/${user.id}`,
      ``,
      `6. Contact support: support@lightdom.com`
    ];
  }

  getUser(userId: string): OnboardingUser | undefined {
    return this.users.get(userId);
  }

  getSEOAnalysis(userId: string): SEOAnalysis | undefined {
    return this.analyses.get(userId);
  }

  getDashboard(userId: string): GeneratedDashboard | undefined {
    return this.dashboards.get(userId);
  }

  getAllUsers(): OnboardingUser[] {
    return Array.from(this.users.values());
  }

  onUpdate(callback: (type: string, data: any) => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => this.onUpdateCallbacks.delete(callback);
  }

  private notifyUpdate(type: string, data: any): void {
    this.onUpdateCallbacks.forEach(callback => callback(type, data));
  }
}

// Global onboarding system instance
const automatedOnboardingSystem = new AutomatedOnboardingSystem();

// React Components
export const AutomatedUserOnboarding: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'signup' | 'analysis' | 'dashboard' | 'complete'>('signup');
  const [currentUser, setCurrentUser] = useState<OnboardingUser | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [generatedDashboard, setGeneratedDashboard] = useState<GeneratedDashboard | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [signupData, setSignupData] = useState({
    email: '',
    websiteUrl: '',
    companyName: '',
    goals: [] as string[]
  });

  const goalOptions = [
    { id: 'increase_traffic', label: 'Increase Website Traffic', icon: TrendingUp },
    { id: 'improve_seo', label: 'Improve SEO Rankings', icon: Target },
    { id: 'boost_sales', label: 'Boost Sales/Conversions', icon: BarChart3 },
    { id: 'generate_leads', label: 'Generate More Leads', icon: UserPlus },
    { id: 'user_experience', label: 'Improve User Experience', icon: Award }
  ];

  useEffect(() => {
    const unsubscribe = automatedOnboardingSystem.onUpdate((type, data) => {
      switch (type) {
        case 'seo_analysis_complete':
          if (data.userId === currentUser?.id) {
            setSeoAnalysis(data.analysis);
            setActiveStep('dashboard');
          }
          break;
        case 'dashboard_generated':
          if (data.userId === currentUser?.id) {
            setGeneratedDashboard(data.dashboard);
            setActiveStep('complete');
            setIsProcessing(false);
          }
          break;
      }
    });

    return unsubscribe;
  }, [currentUser]);

  const handleSignup = async () => {
    if (!signupData.email || !signupData.websiteUrl) return;

    setIsProcessing(true);

    const userId = automatedOnboardingSystem.createUser({
      email: signupData.email,
      websiteUrl: signupData.websiteUrl,
      companyName: signupData.companyName || undefined,
      goals: signupData.goals,
      status: 'analyzing'
    });

    const user = automatedOnboardingSystem.getUser(userId);
    setCurrentUser(user || null);
    setActiveStep('analysis');
  };

  const resetOnboarding = () => {
    setActiveStep('signup');
    setCurrentUser(null);
    setSeoAnalysis(null);
    setGeneratedDashboard(null);
    setIsProcessing(false);
    setSignupData({
      email: '',
      websiteUrl: '',
      companyName: '',
      goals: []
    });
  };

  const renderSignupStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to LightDom
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Get your personalized SEO dashboard and optimization script in minutes
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address *</label>
          <input
            type="email"
            value={signupData.email}
            onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Website URL *</label>
          <input
            type="url"
            value={signupData.websiteUrl}
            onChange={(e) => setSignupData(prev => ({ ...prev, websiteUrl: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Company Name (Optional)</label>
          <input
            type="text"
            value={signupData.companyName}
            onChange={(e) => setSignupData(prev => ({ ...prev, companyName: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            placeholder="Your Company Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 mb-4">What are your main goals?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goalOptions.map(goal => {
              const Icon = goal.icon;
              const isSelected = signupData.goals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => {
                    setSignupData(prev => ({
                      ...prev,
                      goals: isSelected
                        ? prev.goals.filter(g => g !== goal.id)
                        : [...prev.goals, goal.id]
                    }));
                  }}
                  className={cn(
                    'p-4 border rounded-lg text-left transition-colors flex items-center gap-3',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  )} />
                  <span className={cn(
                    'font-medium',
                    isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {goal.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={!signupData.email || !signupData.websiteUrl || signupData.goals.length === 0 || isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium text-lg"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Creating Your Account...
            </div>
          ) : (
            'Start SEO Analysis'
          )}
        </button>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Analyzing Your Website
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          We're performing a comprehensive SEO analysis of {currentUser?.websiteUrl}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 border-8 border-gray-200 dark:border-gray-700 rounded-full">
              <div className="w-32 h-32 border-8 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">SEO Analysis in Progress</h3>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p>🔍 Scanning website structure and content</p>
            <p>📊 Analyzing meta tags and headers</p>
            <p>🎯 Evaluating SEO performance metrics</p>
            <p>💡 Identifying improvement opportunities</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800 dark:text-blue-200">
              This analysis typically takes 2-3 minutes. We'll automatically proceed to dashboard generation once complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardStep = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Generating Your Dashboard
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Creating personalized components and optimization script
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* SEO Analysis Results */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            SEO Analysis Results
          </h3>

          {seoAnalysis && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {seoAnalysis.currentScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Current SEO Score</div>

                <div className="flex items-center justify-center gap-4">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {seoAnalysis.potentialScore}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Potential Score</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-green-600 font-medium">
                  +{seoAnalysis.potentialScore - seoAnalysis.currentScore} points improvement possible
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Automated Fixes Applied:</h4>
                <div className="space-y-2">
                  {seoAnalysis.automatedFixes.map((fix, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Preview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layout className="h-5 w-5 text-purple-600" />
            Generated Dashboard
          </h3>

          {generatedDashboard ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Components:</span>
                  <div className="font-semibold">{generatedDashboard.components.length}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Layout:</span>
                  <div className="font-semibold capitalize">{generatedDashboard.layout}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Included Components:</h4>
                <div className="space-y-2">
                  {generatedDashboard.components.map((component, index) => (
                    <div key={component.id} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span>{component.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Generating dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to LightDom! 🎉
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your personalized SEO dashboard and optimization script are ready
        </p>
      </div>

      {generatedDashboard && seoAnalysis && currentUser && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{seoAnalysis.currentScore}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current SEO Score</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border text-center">
              <div className="text-3xl font-bold text-green-600">{generatedDashboard.components.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Dashboard Components</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border text-center">
              <div className="text-3xl font-bold text-purple-600">{seoAnalysis.automatedFixes.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Automated Fixes</div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-600" />
              Setup Instructions
            </h3>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm">
              <pre className="whitespace-pre-wrap">
                {generatedDashboard.setupInstructions.join('\n')}
              </pre>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                <Download className="h-4 w-4" />
                Download Script
              </button>
              <button className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <Mail className="h-4 w-4" />
                Email Instructions
              </button>
            </div>
          </div>

          {/* SEO Script Preview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Custom SEO Script Preview
            </h3>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-mono text-gray-800 dark:text-gray-200 max-h-64 overflow-y-auto">
                <pre>
                  {generatedDashboard.seoScript.split('\n').slice(0, 20).join('\n')}...
                </pre>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              This script automatically applies SEO optimizations and tracks performance for {currentUser.websiteUrl}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg">
              Access Dashboard
            </button>
            <button
              onClick={resetOnboarding}
              className="border px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-lg"
            >
              Create Another Account
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const steps = [
    { id: 'signup', name: 'Sign Up', component: renderSignupStep },
    { id: 'analysis', name: 'SEO Analysis', component: renderAnalysisStep },
    { id: 'dashboard', name: 'Dashboard Generation', component: renderDashboardStep },
    { id: 'complete', name: 'Complete', component: renderCompleteStep }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === activeStep);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                index <= currentStepIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                {index + 1}
              </div>
              <span className={cn(
                'ml-2 text-sm font-medium',
                index <= currentStepIndex
                  ? 'text-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              )}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="ml-4 h-4 w-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {steps.find(step => step.id === activeStep)?.component()}
    </div>
  );
};

// Export the onboarding system
export { AutomatedOnboardingSystem, automatedOnboardingSystem, AutomatedUserOnboarding };

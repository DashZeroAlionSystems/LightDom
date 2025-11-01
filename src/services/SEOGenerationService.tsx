/**
 * SEO Generation Service
 * Generates meta tags, sitemaps, robots.txt, and SEO-optimized content
 * Now integrates with ML workflow for AI-powered content generation
 */

import { useState, useEffect, useCallback } from 'react';
import SEOMLWorkflowService, { ContentGenerationRequest, GeneratedContent } from '../seo/SEOMLWorkflowService';
import type {
  MetaTags,
  SitemapEntry,
  GeneratedContentItem,
  ContentTemplate,
  ContentWorkflow,
  ContentGenerationOptions,
  SEOReport,
} from './seo/types';

// Re-export types for backward compatibility
export type {
  MetaTags,
  SitemapEntry,
  GeneratedContentItem,
  ContentTemplate,
  ContentWorkflow,
  ContentGenerationOptions,
  SEOReport,
} from './seo/types';

const SEOGenerationService = () => {
  const [metaTags, setMetaTags] = useState<MetaTags | null>(null);
  const [sitemap, setSitemap] = useState<SitemapEntry[]>([]);
  const [robotsTxt, setRobotsTxt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mlWorkflow, setMlWorkflow] = useState<SEOMLWorkflowService | null>(null);

  // New UX enhancement states
  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>([]);
  const [contentWorkflows, setContentWorkflows] = useState<ContentWorkflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<ContentWorkflow | null>(null);
  const [contentPreview, setContentPreview] = useState<GeneratedContent | null>(null);
  const [scheduledContent, setScheduledContent] = useState<ContentWorkflow[]>([]);

  // Initialize ML workflow service
  useEffect(() => {
    const initMLWorkflow = async () => {
      try {
        // Import database connection - this would need to be passed in from a higher level
        // For now, we'll initialize without DB connection
        const workflow = new SEOMLWorkflowService({} as any); // TODO: Pass proper DB pool
        setMlWorkflow(workflow);
      } catch (error) {
        console.error('Failed to initialize ML workflow:', error);
      }
    };

    initMLWorkflow();
  }, []);

  // Initialize content templates
  useEffect(() => {
    const templates: ContentTemplate[] = [
      {
        id: 'blog-technical-guide',
        name: 'Technical Guide',
        description: 'Comprehensive technical guide with step-by-step instructions',
        type: 'blog',
        category: 'Technical',
        structure: ['Introduction', 'Prerequisites', 'Step-by-Step Guide', 'Best Practices', 'Troubleshooting', 'Conclusion'],
        tone: 'technical',
        targetAudience: 'developers',
        estimatedWordCount: 2500,
        seoFocus: ['how-to', 'tutorial', 'guide', 'step-by-step'],
        aiPrompt: 'Write a comprehensive technical guide that includes prerequisites, detailed steps, best practices, and troubleshooting tips.'
      },
      {
        id: 'blog-case-study',
        name: 'Case Study',
        description: 'Detailed case study showcasing results and implementation',
        type: 'blog',
        category: 'Business',
        structure: ['Challenge', 'Solution', 'Implementation', 'Results', 'Key Learnings', 'Next Steps'],
        tone: 'professional',
        targetAudience: 'business-leaders',
        estimatedWordCount: 1800,
        seoFocus: ['case study', 'results', 'implementation', 'ROI'],
        aiPrompt: 'Create a compelling case study that demonstrates real results, includes specific metrics, and provides actionable insights.'
      },
      {
        id: 'landing-product',
        name: 'Product Landing Page',
        description: 'High-converting product landing page with clear value proposition',
        type: 'landing',
        category: 'Marketing',
        structure: ['Hero Section', 'Problem Statement', 'Solution', 'Features', 'Social Proof', 'Pricing', 'Call-to-Action'],
        tone: 'persuasive',
        targetAudience: 'potential-customers',
        estimatedWordCount: 800,
        seoFocus: ['product', 'solution', 'features', 'pricing'],
        aiPrompt: 'Create a persuasive landing page copy that clearly communicates the value proposition, addresses pain points, and drives conversions.'
      },
      {
        id: 'article-industry-insights',
        name: 'Industry Insights',
        description: 'Thought leadership article with industry analysis and predictions',
        type: 'article',
        category: 'Thought Leadership',
        structure: ['Current State', 'Industry Trends', 'Future Predictions', 'Strategic Recommendations', 'Action Items'],
        tone: 'professional',
        targetAudience: 'industry-experts',
        estimatedWordCount: 2200,
        seoFocus: ['industry trends', 'insights', 'predictions', 'strategy'],
        aiPrompt: 'Write an insightful article that analyzes current industry trends, provides data-driven predictions, and offers strategic recommendations.'
      },
      {
        id: 'social-thread',
        name: 'Social Media Thread',
        description: 'Engaging Twitter thread with value-packed content',
        type: 'social',
        category: 'Social Media',
        structure: ['Hook', 'Value Proposition', 'Key Points', 'Call-to-Action', 'Engagement Question'],
        tone: 'conversational',
        targetAudience: 'social-followers',
        estimatedWordCount: 400,
        seoFocus: ['thread', 'tips', 'insights', 'community'],
        aiPrompt: 'Create an engaging Twitter thread that provides value, encourages interaction, and drives engagement.'
      },
      {
        id: 'email-newsletter',
        name: 'Newsletter Campaign',
        description: 'Compelling newsletter with industry updates and actionable insights',
        type: 'email',
        category: 'Email Marketing',
        structure: ['Subject Line', 'Personalized Greeting', 'Key Updates', 'Actionable Insights', 'Call-to-Action', 'Sign-off'],
        tone: 'conversational',
        targetAudience: 'subscribers',
        estimatedWordCount: 600,
        seoFocus: ['newsletter', 'updates', 'insights', 'industry'],
        aiPrompt: 'Write an engaging newsletter that delivers value, maintains reader interest, and drives desired actions.'
      }
    ];

    setContentTemplates(templates);
  }, []);

  // Generate meta tags
  const generateMetaTags = useCallback((url: string, title: string, description: string): MetaTags => {
    const keywords = [
      'lightdom', 'dashboard', 'mining', 'analytics', 'performance',
      'react', 'typescript', 'real-time', 'crypto', 'tensorflow'
    ];

    return {
      title: title.length > 60 ? title.substring(0, 57) + '...' : title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords: keywords.slice(0, 10),
      canonical: url,
      ogTitle: title,
      ogDescription: description,
      ogImage: `${url}/og-image.jpg`,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      author: 'LightDom Team',
      viewport: 'width=device-width, initial-scale=1.0',
    };
  }, []);

  // Generate sitemap
  const generateSitemap = useCallback((): SitemapEntry[] => {
    const baseUrl = 'https://lightdom.dev';
    const pages = [
      { path: '/', priority: 1.0, frequency: 'daily' as const },
      { path: '/dashboard', priority: 0.9, frequency: 'daily' as const },
      { path: '/mining', priority: 0.8, frequency: 'weekly' as const },
      { path: '/wallet', priority: 0.8, frequency: 'weekly' as const },
      { path: '/rewards', priority: 0.7, frequency: 'weekly' as const },
      { path: '/analytics', priority: 0.9, frequency: 'daily' as const },
      { path: '/tensorflow', priority: 0.8, frequency: 'weekly' as const },
      { path: '/seo', priority: 0.7, frequency: 'monthly' as const },
      { path: '/about', priority: 0.6, frequency: 'monthly' as const },
      { path: '/contact', priority: 0.5, frequency: 'yearly' as const },
    ];

    return pages.map(page => ({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: page.frequency,
      priority: page.priority,
    }));
  }, []);

  // Generate robots.txt
  const generateRobotsTxt = useCallback((): string => {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://lightdom.dev/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;
  }, []);


  // Generate complete SEO report
  const generateSEOReport = useCallback((url: string): SEOReport => {
    const meta = generateMetaTags(url, 'LightDom - Professional Dashboard', 'Advanced mining and analytics dashboard with real-time performance metrics and optimization tools');
    const sitemapEntries = generateSitemap();
    const robots = generateRobotsTxt();

    return {
      url,
      generatedAt: new Date().toISOString(),
      metaTags: meta,
      sitemapEntries: sitemapEntries.length,
      robotsTxt: robots,
      contentSuggestions: [
        'Add more long-tail keywords to your content strategy',
        'Create topic clusters around core themes',
        'Optimize image alt text for better accessibility',
        'Implement schema markup for enhanced SERP appearance',
        'Focus on mobile-first design principles',
      ],
      technicalImprovements: [
        'Enable Gzip compression for faster load times',
        'Implement lazy loading for images',
        'Minify CSS and JavaScript files',
        'Add breadcrumb navigation',
        'Optimize font loading strategies',
      ],
    };
  }, [generateMetaTags, generateSitemap, generateRobotsTxt]);

  // Initialize data
  useEffect(() => {
    setMetaTags(generateMetaTags(
      'https://lightdom.dev',
      'LightDom - Professional Dashboard',
      'Advanced mining and analytics dashboard with real-time performance metrics'
    ));
    setSitemap(generateSitemap());
    setRobotsTxt(generateRobotsTxt());
  }, [generateMetaTags, generateSitemap, generateRobotsTxt]);

  // Control functions
  const generateNewMetaTags = useCallback((url: string, title: string, description: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setMetaTags(generateMetaTags(url, title, description));
      setIsGenerating(false);
    }, 2000);
  }, [generateMetaTags]);

  const generateNewSitemap = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setSitemap(generateSitemap());
      setIsGenerating(false);
    }, 3000);
  }, [generateSitemap]);

  const generateNewContent = useCallback(async (type: 'blog' | 'landing' | 'product' | 'article', topic: string, useML: boolean = true) => {
    setIsGenerating(true);

    try {
      if (useML && mlWorkflow) {
        // Use ML workflow for AI-powered content generation
        const request: ContentGenerationRequest = {
          url: `https://lightdom.dev/${topic.toLowerCase().replace(/\s+/g, '-')}`,
          keyword: topic,
          contentType: type,
          targetAudience: 'general',
          tone: 'professional',
          length: 'medium',
          useTrainedModel: true
        };

        const generatedContent = await mlWorkflow.generateContent(request);
        setGeneratedContent(generatedContent);
      } else {
        // Fallback to template-based generation
        setTimeout(() => {
          setGeneratedContent(generateContent(type, topic));
        }, 2000);
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      // Fallback to template generation
      setTimeout(() => {
        setGeneratedContent(generateContent(type, topic));
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  }, [mlWorkflow]);

  // Enhanced content generation with templates and workflow management
  const generateContentWithTemplate = useCallback(async (
    templateId: string,
    topic: string,
    options: ContentGenerationOptions = {}
  ): Promise<ContentWorkflow> => {
    const template = contentTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Create new workflow
    const workflow: ContentWorkflow = {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      topic,
      status: 'generating',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setContentWorkflows(prev => [workflow, ...prev]);
    setActiveWorkflow(workflow);
    setIsGenerating(true);

    try {
      // Enhanced AI prompt combining template and options
      const enhancedPrompt = buildEnhancedPrompt(template, topic, options);

      if (mlWorkflow && options.seoOptimization !== false) {
        // Use ML workflow with enhanced prompt
        const request: ContentGenerationRequest = {
          url: `https://lightdom.dev/${topic.toLowerCase().replace(/\s+/g, '-')}`,
          keyword: topic,
          contentType: (template.type === 'social' || template.type === 'email') ? 'article' : template.type,
          targetAudience: options.targetAudience || template.targetAudience,
          tone: (options.tone === 'persuasive' ? 'professional' : options.tone) || (template.tone === 'persuasive' ? 'professional' : template.tone),
          length: options.length || 'medium',
          useTrainedModel: true
        };

        const generatedContent = await mlWorkflow.generateContent(request);

        // Enhance content with template structure
        const enhancedContent = enhanceContentWithTemplate(generatedContent, template, options);

        // Update workflow
        const updatedWorkflow = {
          ...workflow,
          status: 'reviewing' as const,
          updatedAt: new Date(),
          content: enhancedContent
        };

        setContentWorkflows(prev => prev.map(w => w.id === workflow.id ? updatedWorkflow : w));
        setActiveWorkflow(updatedWorkflow);
        setContentPreview(enhancedContent);

        return updatedWorkflow;
      } else {
        // Fallback to enhanced template generation
        const generatedContent = generateEnhancedContent(template, topic, options);

        const updatedWorkflow = {
          ...workflow,
          status: 'reviewing' as const,
          updatedAt: new Date(),
          content: generatedContent
        };

        setContentWorkflows(prev => prev.map(w => w.id === workflow.id ? updatedWorkflow : w));
        setActiveWorkflow(updatedWorkflow);
        setContentPreview(generatedContent);

        return updatedWorkflow;
      }
    } catch (error) {
      console.error('Template-based content generation failed:', error);

      // Update workflow with error status
      const errorWorkflow = {
        ...workflow,
        status: 'draft' as const,
        updatedAt: new Date(),
      };

      setContentWorkflows(prev => prev.map(w => w.id === workflow.id ? errorWorkflow : w));
      setActiveWorkflow(errorWorkflow);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [contentTemplates, mlWorkflow]);

  // Schedule content for publication
  const scheduleContent = useCallback((workflowId: string, scheduledDate: Date) => {
    setContentWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId
        ? { ...workflow, status: 'scheduled' as const, scheduledFor: scheduledDate, updatedAt: new Date() }
        : workflow
    ));

    setScheduledContent(prev => {
      const workflow = contentWorkflows.find(w => w.id === workflowId);
      if (workflow) {
        return [...prev.filter(w => w.id !== workflowId), { ...workflow, scheduledFor: scheduledDate }];
      }
      return prev;
    });
  }, [contentWorkflows]);

  // Publish content immediately
  const publishContent = useCallback((workflowId: string) => {
    setContentWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId
        ? { ...workflow, status: 'published' as const, publishedAt: new Date(), updatedAt: new Date() }
        : workflow
    ));
  }, []);

  // Add review comment to workflow
  const addReviewComment = useCallback((workflowId: string, user: string, comment: string) => {
    setContentWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId
        ? {
            ...workflow,
            reviewComments: [
              ...(workflow.reviewComments || []),
              { user, comment, timestamp: new Date() }
            ],
            updatedAt: new Date()
          }
        : workflow
    ));
  }, []);

  // Content editing and preview functions
  const updateWorkflowContent = useCallback((workflowId: string, updates: Partial<GeneratedContent>) => {
    setContentWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId && workflow.content
        ? {
            ...workflow,
            content: { ...workflow.content, ...updates },
            status: 'editing' as const,
            updatedAt: new Date()
          }
        : workflow
    ));

    // Update preview if this is the active workflow
    if (activeWorkflow?.id === workflowId && activeWorkflow.content) {
      setContentPreview({ ...activeWorkflow.content, ...updates });
    }
  }, [activeWorkflow]);

  const saveContentDraft = useCallback((workflowId: string) => {
    setContentWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId
        ? { ...workflow, status: 'draft' as const, updatedAt: new Date() }
        : workflow
    ));
  }, []);

  const approveContentForPublishing = useCallback((workflowId: string) => {
    setContentWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId
        ? { ...workflow, status: 'scheduled' as const, updatedAt: new Date() }
        : workflow
    ));
  }, []);

  const regenerateContentSection = useCallback(async (workflowId: string, sectionTitle: string) => {
    const workflow = contentWorkflows.find(w => w.id === workflowId);
    if (!workflow || !workflow.content) return;

    setIsGenerating(true);

    try {
      // Use AI to regenerate specific section
      const template = contentTemplates.find(t => t.id === workflow.templateId);
      if (!template) return;

      const sectionPrompt = `Regenerate the "${sectionTitle}" section for the topic "${workflow.topic}" in the context of a ${template.type} about ${template.description}. Maintain the same tone and style.`;

      if (mlWorkflow) {
        const request: ContentGenerationRequest = {
          url: `https://lightdom.dev/${workflow.topic.toLowerCase().replace(/\s+/g, '-')}`,
          keyword: `${workflow.topic} ${sectionTitle}`,
          contentType: (template.type === 'social' || template.type === 'email') ? 'article' : template.type,
          targetAudience: template.targetAudience,
          tone: template.tone === 'persuasive' ? 'professional' : template.tone,
          length: 'short',
          useTrainedModel: true
        };

        const regeneratedSection = await mlWorkflow.generateContent(request);

        // Update the specific section in content
        const contentLines = workflow.content.content.split('\n');
        const sectionIndex = contentLines.findIndex(line =>
          line.includes(`# ${sectionTitle}`) || line.includes(`## ${sectionTitle}`)
        );

        if (sectionIndex !== -1) {
          // Find the next heading to know where this section ends
          const nextHeadingIndex = contentLines.findIndex((line, index) =>
            index > sectionIndex && (line.startsWith('# ') || line.startsWith('## '))
          );

          const endIndex = nextHeadingIndex !== -1 ? nextHeadingIndex : contentLines.length;

          // Replace the section content
          const newContentLines = [
            ...contentLines.slice(0, sectionIndex + 1),
            '',
            regeneratedSection.content.split('\n').slice(1).join('\n'), // Skip the title
            ...contentLines.slice(endIndex)
          ];

          updateWorkflowContent(workflowId, {
            content: newContentLines.join('\n')
          });
        }
      }
    } catch (error) {
      console.error('Section regeneration failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [contentWorkflows, contentTemplates, mlWorkflow, updateWorkflowContent]);

  const previewContent = useCallback((workflowId: string) => {
    const workflow = contentWorkflows.find(w => w.id === workflowId);
    if (workflow?.content) {
      setContentPreview(workflow.content);
      setActiveWorkflow(workflow);
    }
  }, [contentWorkflows]);

  const clearPreview = useCallback(() => {
    setContentPreview(null);
  }, []);

  // Content scheduling automation
  const scheduleContentForPublication = useCallback((workflowId: string, publishDate: Date, platform?: string) => {
    setContentWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId
        ? {
            ...workflow,
            status: 'scheduled' as const,
            scheduledFor: publishDate,
            updatedAt: new Date()
          }
        : workflow
    ));

    setScheduledContent(prev => {
      const existingIndex = prev.findIndex(w => w.id === workflowId);
      const workflow = contentWorkflows.find(w => w.id === workflowId);

      if (workflow) {
        const scheduledWorkflow = {
          ...workflow,
          scheduledFor: publishDate,
          status: 'scheduled' as const
        };

        if (existingIndex !== -1) {
          return prev.map((w, index) => index === existingIndex ? scheduledWorkflow : w);
        } else {
          return [...prev, scheduledWorkflow];
        }
      }
      return prev;
    });
  }, [contentWorkflows]);

  const bulkScheduleContent = useCallback((schedules: Array<{ workflowId: string; publishDate: Date; platform?: string }>) => {
    const now = new Date();

    schedules.forEach(({ workflowId, publishDate, platform }) => {
      if (publishDate > now) {
        scheduleContentForPublication(workflowId, publishDate, platform);
      }
    });
  }, [scheduleContentForPublication]);

  const getScheduledContentForDate = useCallback((date: Date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return scheduledContent.filter(workflow => {
      if (!workflow.scheduledFor) return false;
      const scheduledDate = new Date(workflow.scheduledFor);
      scheduledDate.setHours(0, 0, 0, 0);
      return scheduledDate.getTime() === targetDate.getTime();
    });
  }, [scheduledContent]);

  const getUpcomingScheduledContent = useCallback((daysAhead: number = 7) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return scheduledContent
      .filter(workflow => workflow.scheduledFor && workflow.scheduledFor > now && workflow.scheduledFor <= futureDate)
      .sort((a, b) => (a.scheduledFor?.getTime() || 0) - (b.scheduledFor?.getTime() || 0));
  }, [scheduledContent]);

  const autoPublishScheduledContent = useCallback(() => {
    const now = new Date();

    setScheduledContent(prev => {
      const toPublish = prev.filter(workflow =>
        workflow.scheduledFor && workflow.scheduledFor <= now && workflow.status === 'scheduled'
      );

      // Publish content
      toPublish.forEach(workflow => {
        publishContent(workflow.id);
      });

      // Remove published content from scheduled list
      return prev.filter(workflow =>
        !(workflow.scheduledFor && workflow.scheduledFor <= now && workflow.status === 'scheduled')
      );
    });
  }, [publishContent]);

  const cancelScheduledContent = useCallback((workflowId: string) => {
    setContentWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId
        ? { ...workflow, status: 'draft' as const, scheduledFor: undefined, updatedAt: new Date() }
        : workflow
    ));

    setScheduledContent(prev => prev.filter(workflow => workflow.id !== workflowId));
  }, []);

  const rescheduleContent = useCallback((workflowId: string, newDate: Date) => {
    scheduleContentForPublication(workflowId, newDate);
  }, [scheduleContentForPublication]);

  // Content distribution helpers
  const getContentDistributionStats = useCallback(() => {
    const totalWorkflows = contentWorkflows.length;
    const published = contentWorkflows.filter(w => w.status === 'published').length;
    const scheduled = contentWorkflows.filter(w => w.status === 'scheduled').length;
    const drafts = contentWorkflows.filter(w => w.status === 'draft').length;

    const publishRate = totalWorkflows > 0 ? (published / totalWorkflows) * 100 : 0;

    return {
      total: totalWorkflows,
      published,
      scheduled,
      drafts,
      publishRate: Math.round(publishRate),
      averageGenerationTime: contentWorkflows
        .filter(w => w.content?.generationTime)
        .reduce((acc, w) => acc + (w.content?.generationTime || 0), 0) / Math.max(1, contentWorkflows.filter(w => w.content?.generationTime).length)
    };
  }, [contentWorkflows]);

  const optimizePublishingSchedule = useCallback(() => {
    // Analyze past publishing patterns and suggest optimal times
    const publishedWorkflows = contentWorkflows.filter(w => w.status === 'published' && w.publishedAt);

    if (publishedWorkflows.length < 5) {
      return {
        suggestion: 'Need more publishing history for optimization',
        recommendedTimes: []
      };
    }

    // Analyze publishing times for patterns
    const publishHours = publishedWorkflows.map(w => w.publishedAt?.getHours() || 0);
    const avgHour = publishHours.reduce((a, b) => a + b, 0) / publishHours.length;

    // Suggest optimal publishing times based on engagement patterns
    const recommendedTimes = [
      { hour: Math.round(avgHour), reason: 'Based on your publishing history' },
      { hour: 9, reason: 'Morning peak engagement' },
      { hour: 14, reason: 'Afternoon engagement spike' },
      { hour: 19, reason: 'Evening content consumption' }
    ];

    return {
      suggestion: `Your optimal publishing time is around ${Math.round(avgHour)}:00`,
      recommendedTimes
    };
  }, [contentWorkflows]);

  // Workflow state management and progress tracking
  const getWorkflowProgress = useCallback((workflowId: string) => {
    const workflow = contentWorkflows.find(w => w.id === workflowId);
    if (!workflow) return null;

    const statusProgress = {
      draft: 0,
      generating: 25,
      reviewing: 50,
      editing: 75,
      scheduled: 90,
      published: 100
    };

    const baseProgress = statusProgress[workflow.status] || 0;

    // Add time-based progress for generating status
    if (workflow.status === 'generating' && workflow.createdAt) {
      const elapsed = Date.now() - workflow.createdAt.getTime();
      const estimatedTotal = 10000; // 10 seconds estimated generation time
      const timeProgress = Math.min((elapsed / estimatedTotal) * 25, 20);
      return Math.min(baseProgress + timeProgress, 45);
    }

    return baseProgress;
  }, [contentWorkflows]);

  const getWorkflowStatusMessage = useCallback((workflowId: string) => {
    const workflow = contentWorkflows.find(w => w.id === workflowId);
    if (!workflow) return 'Workflow not found';

    const messages = {
      draft: 'Ready for generation',
      generating: 'AI is creating your content...',
      reviewing: 'Content ready for review',
      editing: 'Content is being edited',
      scheduled: `Scheduled for ${workflow.scheduledFor?.toLocaleDateString()} at ${workflow.scheduledFor?.toLocaleTimeString()}`,
      published: `Published on ${workflow.publishedAt?.toLocaleDateString()}`
    };

    return messages[workflow.status] || 'Unknown status';
  }, [contentWorkflows]);

  const getActiveWorkflowsCount = useCallback(() => {
    return contentWorkflows.filter(w =>
      ['generating', 'reviewing', 'editing'].includes(w.status)
    ).length;
  }, [contentWorkflows]);

  const getWorkflowAnalytics = useCallback(() => {
    const total = contentWorkflows.length;
    const completed = contentWorkflows.filter(w => w.status === 'published').length;
    const inProgress = contentWorkflows.filter(w =>
      ['generating', 'reviewing', 'editing', 'scheduled'].includes(w.status)
    ).length;
    const drafts = contentWorkflows.filter(w => w.status === 'draft').length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Calculate average time from creation to publication
    const publishedWorkflows = contentWorkflows.filter(w => w.publishedAt && w.createdAt);
    const avgTimeToPublish = publishedWorkflows.length > 0
      ? publishedWorkflows.reduce((acc, w) =>
          acc + (w.publishedAt!.getTime() - w.createdAt.getTime()), 0
        ) / publishedWorkflows.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Template usage analytics
    const templateUsage = contentTemplates.map(template => {
      const usage = contentWorkflows.filter(w => w.templateId === template.id).length;
      return { template: template.name, usage, percentage: total > 0 ? (usage / total) * 100 : 0 };
    });

    return {
      overview: {
        total,
        completed,
        inProgress,
        drafts,
        completionRate: Math.round(completionRate)
      },
      performance: {
        avgTimeToPublish: Math.round(avgTimeToPublish * 10) / 10, // Round to 1 decimal
        mostUsedTemplate: templateUsage.sort((a, b) => b.usage - a.usage)[0]?.template || 'None'
      },
      templates: templateUsage,
      recentActivity: contentWorkflows
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)
        .map(w => ({
          id: w.id,
          topic: w.topic,
          status: w.status,
          updatedAt: w.updatedAt
        }))
    };
  }, [contentWorkflows, contentTemplates]);

  const getWorkflowNotifications = useCallback(() => {
    const notifications = [];

    // Check for workflows ready for review
    const readyForReview = contentWorkflows.filter(w => w.status === 'reviewing');
    if (readyForReview.length > 0) {
      notifications.push({
        type: 'review' as const,
        message: `${readyForReview.length} content piece(s) ready for review`,
        workflows: readyForReview.map(w => w.id),
        priority: 'high' as const
      });
    }

    // Check for scheduled content publishing soon
    const upcoming = getUpcomingScheduledContent(1); // Next 24 hours
    if (upcoming.length > 0) {
      notifications.push({
        type: 'schedule' as const,
        message: `${upcoming.length} content piece(s) scheduled for publication in the next 24 hours`,
        workflows: upcoming.map(w => w.id),
        priority: 'medium' as const
      });
    }

    // Check for long-running generations
    const now = new Date();
    const stuckWorkflows = contentWorkflows.filter(w =>
      w.status === 'generating' &&
      w.createdAt &&
      (now.getTime() - w.createdAt.getTime()) > 300000 // 5 minutes
    );
    if (stuckWorkflows.length > 0) {
      notifications.push({
        type: 'warning' as const,
        message: `${stuckWorkflows.length} content generation(s) may be stuck`,
        workflows: stuckWorkflows.map(w => w.id),
        priority: 'high' as const
      });
    }

    return notifications;
  }, [contentWorkflows, getUpcomingScheduledContent]);

  const retryFailedWorkflow = useCallback(async (workflowId: string) => {
    const workflow = contentWorkflows.find(w => w.id === workflowId);
    if (!workflow || workflow.status !== 'draft') return;

    // Reset workflow to generating state
    setContentWorkflows(prev => prev.map(w =>
      w.id === workflowId
        ? { ...w, status: 'generating' as const, updatedAt: new Date() }
        : w
    ));

    // Retry content generation
    try {
      await generateContentWithTemplate(workflow.templateId, workflow.topic);
    } catch (error) {
      console.error('Retry failed:', error);
      // Reset to draft status
      setContentWorkflows(prev => prev.map(w =>
        w.id === workflowId
          ? { ...w, status: 'draft' as const, updatedAt: new Date() }
          : w
      ));
    }
  }, [contentWorkflows, generateContentWithTemplate]);

  const archiveCompletedWorkflow = useCallback((workflowId: string) => {
    // In a real app, this would move to an archive table
    // For now, we'll just mark as completed and remove from active lists
    setContentWorkflows(prev => prev.filter(w => w.id !== workflowId));
    setScheduledContent(prev => prev.filter(w => w.id !== workflowId));

    if (activeWorkflow?.id === workflowId) {
      setActiveWorkflow(null);
    }
  }, [activeWorkflow]);

  const generateNewReport = useCallback((url: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const report = generateSEOReport(url);
      setReports(prev => [report, ...prev.slice(0, 4)]); // Keep last 5 reports
      setIsGenerating(false);
    }, 5000);
  }, [generateSEOReport]);

  // Export functions
  const exportMetaTags = useCallback(() => {
    if (!metaTags) return '';
    
    return `<title>${metaTags.title}</title>
<meta name="description" content="${metaTags.description}">
<meta name="keywords" content="${metaTags.keywords.join(', ')}">
<link rel="canonical" href="${metaTags.canonical}">
<meta property="og:title" content="${metaTags.ogTitle}">
<meta property="og:description" content="${metaTags.ogDescription}">
<meta property="og:image" content="${metaTags.ogImage}">
<meta name="twitter:card" content="${metaTags.twitterCard}">
<meta name="twitter:title" content="${metaTags.twitterTitle}">
<meta name="twitter:description" content="${metaTags.twitterDescription}">
<meta name="robots" content="${metaTags.robots}">
<meta name="author" content="${metaTags.author}">
<meta name="viewport" content="${metaTags.viewport}">`;
  }, [metaTags]);

  const exportSitemap = useCallback(() => {
    if (sitemap.length === 0) return '';
    
    const xmlContent = sitemap.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlContent}
</urlset>`;
  }, [sitemap]);

  // Synchronous content generation (for backward compatibility)
  const generateContent = useCallback((type: 'blog' | 'landing' | 'product' | 'article', topic: string): GeneratedContent => {
    // Return mock content for immediate response
    const contentTemplates = {
      blog: `# Complete Guide to ${topic}

## Introduction
${topic} is revolutionizing the way we approach digital solutions. This comprehensive guide explores everything you need to know about implementing and optimizing ${topic.toLowerCase()}.

## Key Benefits
- Enhanced performance and scalability
- Improved user experience
- Advanced analytics capabilities
- Real-time optimization features

## Implementation Guide
Learn how to implement ${topic.toLowerCase()} effectively with step-by-step instructions and best practices.`,

      landing: `# Transform Your Business with ${topic}

## The Future of Digital Solutions
Experience the power of ${topic.toLowerCase()} with our cutting-edge platform designed for modern businesses.

## Why Choose ${topic}?
- Industry-leading performance
- 24/7 support and monitoring
- Scalable cloud infrastructure
- Advanced security features

## Get Started Today
Ready to revolutionize your operations? Contact us for a free consultation.`,

      product: `# ${topic} - Professional Solution

## Advanced Features
- Real-time dashboard and analytics
- Customizable workflows and automation
- Enterprise-grade security and compliance
- API integration and developer tools

## Technical Specifications
- Built with modern web technologies
- Cloud-native architecture
- RESTful API and webhooks
- Comprehensive documentation and SDKs`,

      article: `# The Evolution of ${topic}: Industry Trends and Future Predictions

## Current State of ${topic}
${topic} has become an essential component of modern digital strategies, with widespread adoption across industries.

## Future Developments
Industry experts predict significant advancements in ${topic.toLowerCase()} technology over the next few years.

## Strategic Recommendations
Organizations should prepare for the future by investing in ${topic.toLowerCase()} capabilities and staying updated with emerging trends.`
    };

    return {
      title: `${topic} - Complete Guide and Implementation`,
      content: contentTemplates[type],
      metaDescription: `Learn everything about ${topic.toLowerCase()}. Comprehensive guide covering implementation, best practices, and optimization techniques.`,
      keywords: [topic.toLowerCase(), `${topic} guide`, `${topic} tutorial`, `${topic} best practices`],
      seoScore: 85 + Math.random() * 10,
      readabilityScore: 80 + Math.random() * 15,
      modelUsed: 'template-generator',
      generationTime: 1000 + Math.random() * 2000,
      optimizationSuggestions: [
        'Add more specific keywords',
        'Include relevant statistics',
        'Add internal links',
        'Optimize for featured snippets'
      ]
    };
  }, []);

  // Helper functions for enhanced content generation
  const buildEnhancedPrompt = useCallback((template: ContentTemplate, topic: string, options: ContentGenerationOptions): string => {
    const basePrompt = template.aiPrompt;
    const customPrompt = options.customPrompt || '';
    const keywords = options.keywords?.join(', ') || '';
    const tone = options.tone || template.tone;
    const audience = options.targetAudience || template.targetAudience;

    return `${basePrompt}

Topic: ${topic}
${keywords ? `Keywords to include: ${keywords}` : ''}
Tone: ${tone}
Target Audience: ${audience}
${options.length ? `Length: ${options.length}` : ''}
${options.includeCallToAction ? 'Include a clear call-to-action' : ''}
${options.seoOptimization !== false ? 'Optimize for SEO with proper headings and keyword placement' : ''}

${customPrompt}`;
  }, []);

  const enhanceContentWithTemplate = useCallback((content: GeneratedContent, template: ContentTemplate, options: ContentGenerationOptions): GeneratedContent => {
    // Apply template structure to the generated content
    let enhancedContent = content.content;

    // Add template-specific sections if not present
    template.structure.forEach(section => {
      if (!enhancedContent.includes(`## ${section}`) && !enhancedContent.includes(`# ${section}`)) {
        enhancedContent += `\n\n## ${section}\n\nContent for ${section.toLowerCase()} section...`;
      }
    });

    // Add call-to-action if requested
    if (options.includeCallToAction) {
      enhancedContent += '\n\n## Call to Action\n\nReady to get started? Contact us today to learn more about our solutions.';
    }

    return {
      ...content,
      content: enhancedContent,
      seoScore: Math.min(100, content.seoScore + 5), // Slight boost for template enhancement
    };
  }, []);

  const generateEnhancedContent = useCallback((template: ContentTemplate, topic: string, options: ContentGenerationOptions): GeneratedContent => {
    const baseContent = generateContent(template.type as any, topic);

    // Enhance with template-specific content
    let enhancedContent = baseContent.content;

    // Add template structure
    const structuredContent = template.structure.map(section => {
      return `## ${section}\n\nDetailed content for ${section.toLowerCase()} section covering ${topic}.`;
    }).join('\n\n');

    enhancedContent = `# ${topic}\n\n${structuredContent}`;

    // Add template-specific elements
    if (template.type === 'social') {
      enhancedContent = `🧵 Thread: ${topic}\n\n1/ ${enhancedContent.split('\n\n')[1]}\n\n2/ ${enhancedContent.split('\n\n')[2] || 'More insights...'}\n\nWhat are your thoughts? Reply below! 👇`;
    }

    if (template.type === 'email') {
      enhancedContent = `Subject: ${topic} - Latest Insights\n\nHi [Name],\n\n${enhancedContent}\n\nBest regards,\nLightDom Team`;
    }

    return {
      ...baseContent,
      content: enhancedContent,
      title: template.type === 'social' ? `Thread: ${topic}` : `${topic} - ${template.name}`,
      modelUsed: 'template-enhanced',
      generationTime: baseContent.generationTime + 500,
      seoScore: Math.min(100, baseContent.seoScore + 10), // Boost for template usage
    };
  }, [generateContent]);

  // Getters
  const getMetaTags = useCallback(() => metaTags, [metaTags]);
  const getSitemap = useCallback(() => sitemap, [sitemap]);
  const getRobotsTxt = useCallback(() => robotsTxt, [robotsTxt]);
  const getGeneratedContent = useCallback(() => generatedContent, [generatedContent]);
  const getReports = useCallback(() => reports, [reports]);
  const getContentTemplates = useCallback(() => contentTemplates, [contentTemplates]);
  const getContentWorkflows = useCallback(() => contentWorkflows, [contentWorkflows]);
  const getActiveWorkflow = useCallback(() => activeWorkflow, [activeWorkflow]);
  const getContentPreview = useCallback(() => contentPreview, [contentPreview]);
  const getScheduledContent = useCallback(() => scheduledContent, [scheduledContent]);

  return {
    // Data
    metaTags,
    sitemap,
    robotsTxt,
    generatedContent,
    reports,
    isGenerating,
    
    // New UX enhancement data
    contentTemplates,
    contentWorkflows,
    activeWorkflow,
    contentPreview,
    scheduledContent,
    
    // Actions
    generateNewMetaTags,
    generateNewSitemap,
    generateNewContent,
    generateContent,
    generateNewReport,
    generateContentWithTemplate,
    scheduleContent,
    publishContent,
    addReviewComment,
    updateWorkflowContent,
    saveContentDraft,
    approveContentForPublishing,
    regenerateContentSection,
    previewContent,
    clearPreview,
    scheduleContentForPublication,
    bulkScheduleContent,
    getScheduledContentForDate,
    getUpcomingScheduledContent,
    autoPublishScheduledContent,
    cancelScheduledContent,
    rescheduleContent,
    getContentDistributionStats,
    optimizePublishingSchedule,
    getWorkflowProgress,
    getWorkflowStatusMessage,
    getActiveWorkflowsCount,
    getWorkflowAnalytics,
    getWorkflowNotifications,
    retryFailedWorkflow,
    archiveCompletedWorkflow,
    
    // Export
    exportMetaTags,
    exportSitemap,
    
    // Getters
    getMetaTags,
    getSitemap,
    getRobotsTxt,
    getGeneratedContent,
    getReports,
    getContentTemplates,
    getContentWorkflows,
    getActiveWorkflow,
    getContentPreview,
    getScheduledContent,
  };
};

export default SEOGenerationService;

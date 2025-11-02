/**
 * SEO Service Type Definitions
 * Extracted from SEOGenerationService.tsx for better separation of concerns
 */

import type { GeneratedContent } from '@/seo/SEOMLWorkflowService';

export interface MetaTags {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  robots: string;
  author: string;
  viewport: string;
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface GeneratedContentItem {
  type: 'blog' | 'landing' | 'product' | 'article';
  title: string;
  content: string;
  metaDescription: string;
  keywords: string[];
  readabilityScore: number;
  seoScore: number;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'blog' | 'landing' | 'product' | 'article' | 'social' | 'email';
  category: string;
  structure: string[];
  tone: 'professional' | 'casual' | 'technical' | 'conversational' | 'persuasive';
  targetAudience: string;
  estimatedWordCount: number;
  seoFocus: string[];
  aiPrompt: string;
}

export interface ReviewComment {
  user: string;
  comment: string;
  timestamp: Date;
}

export interface ContentWorkflow {
  id: string;
  templateId: string;
  topic: string;
  status: 'draft' | 'generating' | 'reviewing' | 'editing' | 'scheduled' | 'published';
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  publishedAt?: Date;
  content?: GeneratedContent;
  collaborators?: string[];
  reviewComments?: ReviewComment[];
}

export interface ContentGenerationOptions {
  templateId?: string;
  customPrompt?: string;
  tone?: 'professional' | 'casual' | 'technical' | 'conversational' | 'persuasive';
  targetAudience?: string;
  keywords?: string[];
  length?: 'short' | 'medium' | 'long';
  includeImages?: boolean;
  includeCallToAction?: boolean;
  seoOptimization?: boolean;
}

export interface SEOReport {
  url: string;
  generatedAt: string;
  metaTags: MetaTags;
  sitemapEntries: number;
  robotsTxt: string;
  contentSuggestions: string[];
  technicalImprovements: string[];
}

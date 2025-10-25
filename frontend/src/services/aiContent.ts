/**
 * AI Content Generation Service
 * Frontend service for interacting with the AI content generation API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface GenerateContentRequest {
  url: string;
  targetKeywords?: string[];
  contentType?: 'title' | 'meta_description' | 'content' | 'schema' | 'full_page';
  competitorUrls?: string[];
  brandGuidelines?: {
    tone?: 'professional' | 'casual' | 'technical' | 'friendly';
    voice?: string;
    industry?: string;
    targetAudience?: string;
  };
  minLength?: number;
  maxLength?: number;
  includeCompetitorAnalysis?: boolean;
}

export interface GeneratedContent {
  id: string;
  title?: string;
  metaDescription?: string;
  h1?: string;
  h2Headings?: string[];
  content?: string;
  schema?: object;
  seoScore: number;
  readabilityScore: number;
  confidenceScore: number;
  keywordDensity: number;
  generationTimeMs: number;
  qualityValidationPassed: boolean;
  validationErrors?: string[];
}

export interface ModelTrainingRequest {
  modelType: 'title' | 'meta_description' | 'content' | 'combined';
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  validationSplit?: number;
  minDatasetSize?: number;
}

export interface ModelPerformance {
  id: string;
  model_name: string;
  model_version: string;
  model_type: string;
  status: string;
  usage_count: number;
  total_generations: number;
  deployed_count: number;
  quality_passed_count: number;
  avg_seo_score: number;
  avg_confidence: number;
  avg_generation_time_ms: number;
  avg_user_rating: number;
  feedback_count: number;
}

export interface ContentTemplate {
  id: string;
  template_name: string;
  template_type: string;
  industry: string;
  content_category: string;
  avg_performance_score: number;
  usage_count: number;
  success_rate: number;
}

export interface ContentPerformance {
  measurement_date: string;
  search_position: number;
  search_impressions: number;
  search_clicks: number;
  search_ctr: number;
  page_views: number;
  avg_time_on_page: number;
  bounce_rate: number;
  lcp: number;
  inp: number;
  cls: number;
}

export interface QueuedGeneration {
  queuedCount: number;
  queuedIds: string[];
}

class AIContentService {
  /**
   * Generate content for a URL
   */
  async generateContent(request: GenerateContentRequest): Promise<GeneratedContent> {
    const response = await fetch(`${API_BASE_URL}/ai/content/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate content');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Queue batch content generation
   */
  async queueGeneration(urls: string[], config: Partial<GenerateContentRequest> = {}): Promise<QueuedGeneration> {
    const response = await fetch(`${API_BASE_URL}/ai/content/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls, config }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to queue generation');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Process queued content generation tasks
   */
  async processQueue(batchSize: number = 10): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ai/content/process-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ batchSize }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process queue');
    }
  }

  /**
   * Get generated content by ID
   */
  async getContent(id: string): Promise<GeneratedContent> {
    const response = await fetch(`${API_BASE_URL}/ai/content/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get content');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get content generation history for a URL
   */
  async getContentHistory(url: string, limit: number = 10, offset: number = 0): Promise<GeneratedContent[]> {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`${API_BASE_URL}/ai/content/history/${encodedUrl}?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get content history');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(id: string): Promise<ContentPerformance[]> {
    const response = await fetch(`${API_BASE_URL}/ai/content/${id}/performance`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get performance data');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Submit feedback for generated content
   */
  async submitFeedback(
    id: string,
    feedback: {
      feedbackType?: string;
      rating?: number;
      feedbackText?: string;
      improvementsSuggested?: object;
      successfulElements?: object;
      failedElements?: object;
    }
  ): Promise<{ feedbackId: string }> {
    const response = await fetch(`${API_BASE_URL}/ai/content/${id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit feedback');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get active content summary
   */
  async getActiveContentSummary(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/ai/content/summary/active`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get content summary');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Train new content generation model
   */
  async trainModel(config: ModelTrainingRequest): Promise<{ message: string; config: ModelTrainingRequest }> {
    const response = await fetch(`${API_BASE_URL}/ai/model/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start model training');
    }

    const result = await response.json();
    return { message: result.message, config: result.config };
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(): Promise<ModelPerformance[]> {
    const response = await fetch(`${API_BASE_URL}/ai/model/performance`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get model performance');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Retrain model with feedback
   */
  async retrainModel(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/ai/model/${id}/retrain`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start model retraining');
    }

    const result = await response.json();
    return { message: result.message };
  }

  /**
   * Get content templates
   */
  async getTemplates(industry?: string, contentCategory?: string): Promise<ContentTemplate[]> {
    const params = new URLSearchParams();
    if (industry) params.append('industry', industry);
    if (contentCategory) params.append('contentCategory', contentCategory);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/ai/templates${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get templates');
    }

    const result = await response.json();
    return result.data;
  }
}

export const aiContentService = new AIContentService();
export default aiContentService;

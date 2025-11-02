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
  private extractErrorMessage(payload: any): string | undefined {
    if (!payload) {
      return undefined;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (payload.error && typeof payload.error === 'string') {
      return payload.error;
    }

    if (payload.message && typeof payload.message === 'string') {
      return payload.message;
    }

    if (payload?.data?.error && typeof payload.data.error === 'string') {
      return payload.data.error;
    }

    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      const first = payload.errors[0];
      if (typeof first === 'string') {
        return first;
      }
      if (first?.message && typeof first.message === 'string') {
        return first.message;
      }
    }

    return undefined;
  }

  private extractData<T>(payload: any, errorMessage: string): T {
    if (!payload || typeof payload !== 'object' || payload.data === undefined) {
      throw new Error(errorMessage);
    }

    return payload.data as T;
  }

  private async handleResponse<T>(
    response: Response,
    fallbackMessage: string,
    resolver?: (payload: any) => T
  ): Promise<T> {
    const text = await response.text();
    let payload: any;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        const trimmed = text.trim();
        payload = trimmed.length > 0 ? trimmed : undefined;
      }
    }

    if (!response.ok) {
      if (typeof payload === 'string') {
        throw new Error(payload);
      }

      const message = this.extractErrorMessage(payload) ?? fallbackMessage;
      throw new Error(message);
    }

    if (resolver) {
      return resolver(payload);
    }

    return payload as T;
  }

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

    return this.handleResponse<GeneratedContent>(
      response,
      'Failed to generate content',
      (payload) => this.extractData<GeneratedContent>(payload, 'API returned an invalid content response')
    );
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

    return this.handleResponse<QueuedGeneration>(
      response,
      'Failed to queue generation',
      (payload) => this.extractData<QueuedGeneration>(payload, 'API returned an invalid queue response')
    );
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

    await this.handleResponse<void>(response, 'Failed to process queue', () => undefined);
  }

  /**
   * Get generated content by ID
   */
  async getContent(id: string): Promise<GeneratedContent> {
    const response = await fetch(`${API_BASE_URL}/ai/content/${id}`);

    return this.handleResponse<GeneratedContent>(
      response,
      'Failed to get content',
      (payload) => this.extractData<GeneratedContent>(payload, 'API returned an invalid content response')
    );
  }

  /**
   * Get content generation history for a URL
   */
  async getContentHistory(url: string, limit: number = 10, offset: number = 0): Promise<GeneratedContent[]> {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`${API_BASE_URL}/ai/content/history/${encodedUrl}?limit=${limit}&offset=${offset}`);

    return this.handleResponse<GeneratedContent[]>(
      response,
      'Failed to get content history',
      (payload) => this.extractData<GeneratedContent[]>(payload, 'API returned an invalid content history response')
    );
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(id: string): Promise<ContentPerformance[]> {
    const response = await fetch(`${API_BASE_URL}/ai/content/${id}/performance`);

    return this.handleResponse<ContentPerformance[]>(
      response,
      'Failed to get performance data',
      (payload) => this.extractData<ContentPerformance[]>(payload, 'API returned an invalid performance response')
    );
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

    return this.handleResponse<{ feedbackId: string }>(
      response,
      'Failed to submit feedback',
      (payload) => this.extractData<{ feedbackId: string }>(payload, 'API returned an invalid feedback response')
    );
  }

  /**
   * Get active content summary
   */
  async getActiveContentSummary(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/ai/content/summary/active`);

    return this.handleResponse<any[]>(
      response,
      'Failed to get content summary',
      (payload) => this.extractData<any[]>(payload, 'API returned an invalid content summary response')
    );
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

    return this.handleResponse<{ message: string; config: ModelTrainingRequest }>(
      response,
      'Failed to start model training',
      (payload) => {
        if (payload && typeof payload === 'object') {
          return {
            message:
              typeof payload.message === 'string'
                ? payload.message
                : 'Model training started',
            config: (payload.config as ModelTrainingRequest) ?? config,
          };
        }

        return {
          message: 'Model training started',
          config,
        };
      }
    );
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(): Promise<ModelPerformance[]> {
    const response = await fetch(`${API_BASE_URL}/ai/model/performance`);

    return this.handleResponse<ModelPerformance[]>(
      response,
      'Failed to get model performance',
      (payload) => this.extractData<ModelPerformance[]>(payload, 'API returned an invalid model performance response')
    );
  }

  /**
   * Retrain model with feedback
   */
  async retrainModel(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/ai/model/${id}/retrain`, {
      method: 'POST',
    });

    return this.handleResponse<{ message: string }>(
      response,
      'Failed to start model retraining',
      (payload) => {
        if (payload && typeof payload === 'object' && typeof payload.message === 'string') {
          return { message: payload.message };
        }

        return { message: 'Model retraining started' };
      }
    );
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

    return this.handleResponse<ContentTemplate[]>(
      response,
      'Failed to get templates',
      (payload) => this.extractData<ContentTemplate[]>(payload, 'API returned an invalid templates response')
    );
  }
}

export const aiContentService = new AIContentService();
export default aiContentService;
